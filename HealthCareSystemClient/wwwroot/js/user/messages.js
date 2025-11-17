/**
 * Patient Messages Logic
 */

// 1. KHỞI TẠO CONFIG
const CONFIG = window.AppConfig || {
    apiBaseUrl: '',
    userId: 0,
    userToken: '',
    userEmail: ''
};

// Variables
let currentConversation = null;
let conversations = [];
let connection = null;
let isUploading = false;

// Video Call Variables
let activeRoom = null;
let localVideoTrack = null;

// ==========================================
// INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', async () => {
    if (!CONFIG.userToken) {
        console.error('No token found');
        const listEl = document.getElementById('conversationsList');
        if (listEl) listEl.innerHTML = '<p class="text-danger p-3">Please login to view messages.</p>';
        return;
    }

    await loadConversations();
    await initializeSignalR();
    setupEventListeners();
});

// ==========================================
// SIGNALR
// ==========================================
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

// ==========================================
// CONVERSATIONS & CHAT
// ==========================================
async function loadConversations() {
    try {
        const response = await fetch(`${CONFIG.apiBaseUrl}/api/conversation/my-conversations`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${CONFIG.userToken}` }
        });

        if (!response.ok) throw new Error("Failed load conversations");
        conversations = await response.json();
        renderConversations();
    } catch (error) {
        console.error(error);
    }
}

function renderConversations() {
    const container = document.getElementById('conversationsList');
    if (!conversations.length) {
        container.innerHTML = '<p class="text-muted p-3">No conversations found.</p>';
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
    document.getElementById('chatDoctorName').textContent = currentConversation.otherUserName;
    document.getElementById('chatDoctorSpecialty').textContent = currentConversation.specialty || 'Doctor';

    const avatar = document.getElementById('chatAvatar');
    if (avatar) avatar.src = currentConversation.otherUserAvatar || '/placeholder.svg?height=48&width=48';

    // Join Group
    if (connection) await connection.invoke('JoinConversation', conversationId);

    // Load Messages
    loadMessages(conversationId);

    // Reset unread
    currentConversation.unreadCount = 0;
    renderConversations();
}

async function loadMessages(conversationId) {
    console.log("function nay dang chay")
    try {
        const res = await fetch(`${CONFIG.apiBaseUrl}/api/conversations/${conversationId}/messages?skip=0&take=50`, {
            headers: { 'Authorization': `Bearer ${CONFIG.userToken}` }
        });
        const messages = await res.json();
        renderMessages(messages);
    } catch (e) {
        console.error(e);
    }
}

function renderMessages(messages) {
    const container = document.getElementById('chatMessages');
    if (messages.length === 0) {
        container.innerHTML = '<div class="empty-chat"><p>No messages yet.</p></div>';
        return;
    }

    container.innerHTML = messages.map(msg => {
        const isOwn = msg.senderId === CONFIG.userId;
        const contentHtml = msg.messageType === 'image'
            ? `<img src="${msg.content}" class="img-fluid rounded" style="max-width:200px" onclick="openImageModal('${msg.content}')">`
            : `<div class="message-text">${escapeHtml(msg.content)}</div>`;

        return `
            <div class="message ${isOwn ? 'user-message' : 'doctor-message'}">
                <div class="message-content">
                     ${contentHtml}
                </div>
            </div>
        `;
    }).join('');
    container.scrollTop = container.scrollHeight;
}

function addMessageToUI(msg) {
    const container = document.getElementById('chatMessages');
    const isOwn = msg.senderId === CONFIG.userId;
    const contentHtml = msg.messageType === 'image'
        ? `<img src="${msg.content}" class="img-fluid rounded" style="max-width:200px">`
        : `<div class="message-text">${escapeHtml(msg.content)}</div>`;

    const html = `
        <div class="message ${isOwn ? 'user-message' : 'doctor-message'}">
            <div class="message-content">
                ${contentHtml}
            </div>
        </div>
    `;

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
        if (connection) {
            await connection.invoke('SendMessage', currentConversation.conversationId, text, 'text');
        }
    } catch (err) {
        console.error("Send failed", err);
    }
}

function updateConversationLastMessage(conversationId, message) {
    const conv = conversations.find(c => c.conversationId === conversationId);
    if (conv) {
        conv.lastMessage = { content: message.content, messageType: message.messageType };
        if (message.senderId !== CONFIG.userId) conv.unreadCount = (conv.unreadCount || 0) + 1;
        renderConversations();
    }
}

// ==========================================
// VIDEO CALL LOGIC
// ==========================================

async function fetchTwilioToken(roomName) {
    try {
        const res = await fetch(`${CONFIG.apiBaseUrl}/api/twilio/token?roomName=${encodeURIComponent(roomName)}`, {
            headers: { 'Authorization': `Bearer ${CONFIG.userToken}` }
        });
        return await res.json();
    } catch (e) {
        return null;
    }
}

async function startVideoCall() {
    if (!currentConversation) {
        alert("Select conversation first");
        return;
    }

    const roomName = `VideoRoom_${currentConversation.conversationId}`;

    const modalEl = document.getElementById('videoCallModal');
    const modal = new bootstrap.Modal(modalEl);
    modal.show();

    document.getElementById('videoCallPartnerName').innerText = currentConversation.otherUserName;
    document.getElementById('video-loading').style.display = 'flex';
    document.getElementById('connectionStatus').innerText = "Connecting...";

    // Clear old video
    document.getElementById('remote-video').innerHTML = '';
    document.getElementById('local-video').innerHTML = '';

    const tokenData = await fetchTwilioToken(roomName);
    if (!tokenData) {
        document.getElementById('connectionStatus').innerText = "Token Failed";
        return;
    }

    try {
        activeRoom = await Twilio.Video.connect(tokenData.token, {
            name: roomName,
            audio: true,
            video: { width: 640 }
        });

        document.getElementById('connectionStatus').innerText = "Waiting for doctor...";
        createLocalVideo();

        activeRoom.participants.forEach(participantConnected);
        activeRoom.on('participantConnected', participantConnected);

        activeRoom.on('participantDisconnected', p => {
            document.getElementById('remote-video').innerHTML = '';
            document.getElementById('connectionStatus').innerText = "Doctor left.";
            document.getElementById('video-loading').style.display = 'flex';
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
        container.appendChild(track.attach());
    });
}

function participantConnected(participant) {
    document.getElementById('video-loading').style.display = 'none';
    participant.tracks.forEach(pub => {
        if (pub.isSubscribed) attachTrack(pub.track);
    });
    participant.on('trackSubscribed', attachTrack);
}

function attachTrack(track) {
    const container = document.getElementById('remote-video');
    const el = track.attach();
    el.style.width = '100%';
    el.style.height = '100%';
    el.style.objectFit = 'cover';
    container.appendChild(el);
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

// Helpers
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
function startNewConversation() { alert('Feature coming soon'); }
function startVoiceCall() { alert('Voice call coming soon'); }
function viewDoctorProfile() { alert('Profile coming soon'); }
function attachFile() { alert('File upload coming soon'); }
function openImageModal(url) { window.open(url, '_blank'); }