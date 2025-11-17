/**
 * Doctor Messages Logic (Fixed Video Call)
 */

// 1. CONFIG
const CONFIG = window.AppConfig || {
    apiBaseUrl: '', userId: 0, userToken: '', userEmail: ''
};

// Variables
let currentConversation = null;
let conversations = [];
let connection = null;
let isUploading = false;

// Video Variables
let activeRoom = null;
let localVideoTrack = null;

// ================= INITIALIZATION =================
document.addEventListener('DOMContentLoaded', async () => {
    if (!CONFIG.userToken) {
        document.getElementById('conversationsList').innerHTML = '<p class="text-danger p-3">Login required.</p>';
        return;
    }
    await loadConversations();
    await initializeSignalR();
    setupEventListeners();
});

// ================= SIGNALR =================
async function initializeSignalR() {
    const hubUrl = `${CONFIG.apiBaseUrl}/hubs/chat`;
    connection = new signalR.HubConnectionBuilder()
        .withUrl(hubUrl, {
            accessTokenFactory: () => CONFIG.userToken,
            skipNegotiation: false,
            transport: signalR.HttpTransportType.WebSockets
        })
        .withAutomaticReconnect()
        .build();

    connection.on('ReceiveMessage', (message) => {
        if (currentConversation && currentConversation.conversationId === message.conversationId) {
            addMessageToUI(message);
        } else {
            updateConversationLastMessage(message.conversationId, message);
        }
    });

    try {
        await connection.start();
        console.log('SignalR Connected');
    } catch (err) {
        console.error('SignalR Error:', err);
    }
}

// ================= CONVERSATIONS =================
async function loadConversations() {
    try {
        const res = await fetch(`${CONFIG.apiBaseUrl}/api/conversation/my-conversations`, {
            headers: { 'Authorization': `Bearer ${CONFIG.userToken}` }
        });
        if (!res.ok) throw new Error("API Error");
        conversations = await res.json();
        renderConversations();
    } catch (error) {
        console.error(error);
    }
}

function renderConversations() {
    const container = document.getElementById('conversationsList');
    if (!conversations.length) {
        container.innerHTML = '<p class="text-muted p-3">No conversations.</p>';
        return;
    }

    container.innerHTML = conversations.map(c => `
        <div class="conversation-item" onclick="selectConversation(${c.conversationId})">
            <div class="conversation-avatar">
                <img src="${c.otherUserAvatar || '/placeholder.svg?height=32&width=32'}" alt="Avatar">
            </div>
            <div class="conversation-content">
                <h6 class="conversation-name">${c.otherUserName}</h6>
                <p class="conversation-preview">${c.lastMessage ? c.lastMessage.content : 'Start chatting...'}</p>
            </div>
            ${c.unreadCount > 0 ? `<div class="unread-badge">${c.unreadCount}</div>` : ''}
        </div>
    `).join('');
}

async function selectConversation(conversationId) {
    document.querySelectorAll('.conversation-item').forEach(i => i.classList.remove('active'));
    event.currentTarget.classList.add('active');

    currentConversation = conversations.find(c => c.conversationId === conversationId);
    if (!currentConversation) return;

    // Update Header
    document.getElementById('chatHeader').style.display = 'flex';
    document.getElementById('chatInputContainer').style.display = 'block';
    document.getElementById('chatPatientName').textContent = currentConversation.otherUserName;
    document.getElementById('chatPatientInfo').textContent = currentConversation.specialty || 'Patient';
    const avatar = document.getElementById('chatAvatar');
    if (avatar) avatar.src = currentConversation.otherUserAvatar || '/placeholder.svg?height=48&width=48';

    if (connection) await connection.invoke('JoinConversation', conversationId);
    loadMessages(conversationId);

    currentConversation.unreadCount = 0;
    renderConversations();
}

async function loadMessages(conversationId) {
    try {
        const res = await fetch(`${CONFIG.apiBaseUrl}/api/conversations/${conversationId}/messages?skip=0&take=50`, {
            headers: { 'Authorization': `Bearer ${CONFIG.userToken}` }
        });
        const messages = await res.json();
        renderMessages(messages);
    } catch (e) { console.error(e); }
}

function renderMessages(messages) {
    const container = document.getElementById('chatMessages');
    if (messages.length === 0) {
        container.innerHTML = '<div class="empty-chat"><p>No messages yet.</p></div>';
        return;
    }

    container.innerHTML = messages.map(msg => {
        const isOwn = msg.senderId === CONFIG.userId;
        const content = msg.messageType === 'image'
            ? `<img src="${msg.content}" style="max-width:200px; border-radius:8px; cursor:pointer;" onclick="openImageModal('${msg.content}')">`
            : `<div class="message-text">${escapeHtml(msg.content)}</div>`;

        return `
            <div class="message ${isOwn ? 'user-message' : 'doctor-message'}">
                <div class="message-content">${content}</div>
            </div>`;
    }).join('');
    container.scrollTop = container.scrollHeight;
}

function addMessageToUI(msg) {
    const container = document.getElementById('chatMessages');
    const isOwn = msg.senderId === CONFIG.userId;
    const content = msg.messageType === 'image'
        ? `<img src="${msg.content}" style="max-width:200px; border-radius:8px;">`
        : `<div class="message-text">${escapeHtml(msg.content)}</div>`;

    const html = `
        <div class="message ${isOwn ? 'user-message' : 'doctor-message'}">
            <div class="message-content">${content}</div>
        </div>`;

    const empty = container.querySelector('.empty-chat');
    if (empty) empty.remove();

    container.insertAdjacentHTML('beforeend', html);
    container.scrollTop = container.scrollHeight;
}

async function sendMessage(e) {
    e.preventDefault();
    const input = document.getElementById('messageInput');
    const text = input.value.trim();
    if (!text || !currentConversation) return;

    input.value = '';
    try {
        if (connection) await connection.invoke('SendMessage', currentConversation.conversationId, text, 'text');
    } catch (err) { console.error(err); }
}

function updateConversationLastMessage(cid, msg) {
    const c = conversations.find(x => x.conversationId === cid);
    if (c) {
        c.lastMessage = { content: msg.content, messageType: msg.messageType };
        if (msg.senderId !== CONFIG.userId) c.unreadCount = (c.unreadCount || 0) + 1;
        renderConversations();
    }
}


// ================= VIDEO CALL LOGIC (FIXED) =================

async function fetchTwilioToken(roomName) {
    try {
        const res = await fetch(`${CONFIG.apiBaseUrl}/api/twilio/token?roomName=${encodeURIComponent(roomName)}`, {
            headers: { 'Authorization': `Bearer ${CONFIG.userToken}` }
        });
        return await res.json();
    } catch (e) { return null; }
}

async function startVideoCall() {
    if (!currentConversation) { alert("Select conversation first"); return; }

    const roomName = `VideoRoom_${currentConversation.conversationId}`;

    // Show Modal
    const modalEl = document.getElementById('videoCallModal');
    const modal = new bootstrap.Modal(modalEl);
    modal.show();

    // Reset UI
    document.getElementById('videoCallPartnerName').innerText = currentConversation.otherUserName;
    document.getElementById('video-loading').style.display = 'flex';
    document.getElementById('connectionStatus').innerText = "Connecting...";
    document.getElementById('remote-video').innerHTML = '';
    document.getElementById('local-video').innerHTML = '';

    const tokenData = await fetchTwilioToken(roomName);
    if (!tokenData) {
        document.getElementById('connectionStatus').innerText = "Token Error";
        return;
    }

    try {
        activeRoom = await Twilio.Video.connect(tokenData.token, {
            name: roomName,
            audio: true,
            video: { width: 640 },
            preferredVideoCodecs: [{ codec: 'VP8', simulcast: true }],
            networkQuality: { local: 1, remote: 1 }
        });

        document.getElementById('connectionStatus').innerText = "Waiting for patient...";
        createLocalVideo();

        // Check Existing & New Participants
        activeRoom.participants.forEach(participantConnected);
        activeRoom.on('participantConnected', participantConnected);

        activeRoom.on('participantDisconnected', p => {
            document.getElementById('remote-video').innerHTML = '';
            document.getElementById('video-loading').style.display = 'flex';
            document.getElementById('connectionStatus').innerText = "Patient left.";
        });

        activeRoom.on('disconnected', endCallUI);

    } catch (err) {
        console.error(err);
        alert(err.message);
        modal.hide();
    }
}

function createLocalVideo() {
    Twilio.Video.createLocalVideoTrack().then(track => {
        localVideoTrack = track;
        const container = document.getElementById('local-video');
        container.innerHTML = '';
        const el = track.attach();
        // CSS cho local video
        el.style.width = '100%';
        el.style.height = '100%';
        el.style.objectFit = 'cover';
        el.style.transform = 'scaleX(-1)'; // Gương
        container.appendChild(el);
    });
}

function participantConnected(participant) {
    console.log('Participant joined:', participant.identity);

    // Xử lý track đã có
    participant.tracks.forEach(pub => {
        if (pub.isSubscribed) attachTrack(pub.track);
    });

    // Xử lý track mới
    participant.on('trackSubscribed', attachTrack);
}

function attachTrack(track) {
    // 1. Xử lý Audio
    if (track.kind === 'audio') {
        const el = track.attach();
        document.body.appendChild(el);
        return;
    }

    // 2. Xử lý Video
    if (track.kind === 'video') {
        console.log("🎥 Nhận được Video Track:", track);

        const container = document.getElementById('remote-video');
        const loader = document.getElementById('video-loading');
        const statusText = document.getElementById('connectionStatus');

        // Xóa video cũ (nếu có)
        container.innerHTML = '';

        const el = track.attach();

        // Cấu hình bắt buộc cho thẻ Video
        el.style.width = '100%';
        el.style.height = '100%';
        el.style.objectFit = 'cover';
        el.style.position = 'absolute'; // Đảm bảo nó nằm đúng vị trí
        el.style.top = '0';
        el.style.left = '0';

        // Bắt buộc Autoplay (Trình duyệt thường chặn nếu không có dòng này)
        el.autoplay = true;
        el.playsInline = true;

        container.appendChild(el);

        // Cập nhật thông báo (để debug)
        if (statusText) statusText.innerText = "Video Received! Playing...";

        // 🧨 BIỆN PHÁP MẠNH: Ẩn màn hình chờ sau 500ms
        // (Delay nhẹ để video kịp load hình ảnh lên trước khi ẩn loader)
        setTimeout(() => {
            if (loader) {
                loader.style.display = 'none'; // Ẩn div loading
                loader.style.setProperty("display", "none", "important"); // Cưỡng chế ẩn
                console.log("🚀 Đã ẩn màn hình chờ!");
            }
        }, 500);
    }
}

function endCall() {
    if (activeRoom) activeRoom.disconnect();
    endCallUI();
}

function endCallUI() {
    if (localVideoTrack) {
        localVideoTrack.stop();
        localVideoTrack = null;
    }
    activeRoom = null;
    const modal = bootstrap.Modal.getInstance(document.getElementById('videoCallModal'));
    if (modal) modal.hide();
}

function toggleMute() {
    if (!activeRoom) return;
    activeRoom.localParticipant.audioTracks.forEach(pub => {
        pub.track.isEnabled ? pub.track.disable() : pub.track.enable();
    });
}

function toggleVideo() {
    if (!localVideoTrack) return;
    localVideoTrack.isEnabled ? localVideoTrack.disable() : localVideoTrack.enable();
}

// ================= UTILS =================
function escapeHtml(text) {
    if (!text) return "";
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function setupEventListeners() {
    const search = document.getElementById('searchInput');
    if (search) {
        search.addEventListener('input', (e) => {
            const val = e.target.value.toLowerCase();
            document.querySelectorAll('.conversation-item').forEach(item => {
                const name = item.querySelector('.conversation-name').textContent.toLowerCase();
                item.style.display = name.includes(val) ? 'block' : 'none';
            });
        });
    }
}

// Placeholders
function startNewConversation() { alert('Coming soon'); }
function startVoiceCall() { alert('Voice call coming soon'); }
function viewPatientProfile() { alert('Profile coming soon'); }
function scheduleAppointment() { alert('Schedule coming soon'); }
function attachFile() { alert('Upload coming soon'); }
function openImageModal(url) { window.open(url, '_blank'); }