/**
 * Doctor Messages Logic - Updated with AppConfig & Video Call
 */

// 1. LẤY CẤU HÌNH TỪ VIEW (AppConfig)
// Nếu không có AppConfig, dùng fallback để tránh crash
const CONFIG = window.AppConfig || {
    apiBaseUrl: '',
    userId: 0,
    userToken: '',
    userEmail: ''
};

console.log('Doctor JS Loaded with Config:', CONFIG);

// --- GLOBAL VARIABLES ---
let currentConversation = null;
let conversations = [];
let connection = null;
let isUploading = false;

// --- VIDEO CALL VARIABLES ---
let activeRoom = null;
let localVideoTrack = null;
let localAudioTrack = null;


// ==========================================
// INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', async () => {
    // Hiển thị tên bác sĩ từ Config (tránh lỗi [object HTML...])
    const nameEl = document.getElementById('doctorName');
    if (nameEl && CONFIG.userEmail) {
        // Tách tên nếu email dài (vd: bs.hung@gmail.com -> bs.hung)
        const name = CONFIG.userEmail.split('@')[0];
        nameEl.textContent = `Dr. ${name}`;
    }

    // Kiểm tra Token
    if (!CONFIG.userToken) {
        console.error('No token found via AppConfig');
        const listEl = document.getElementById('conversationsList');
        if (listEl) listEl.innerHTML = '<p class="text-danger p-3">Please login again to view conversations.</p>';
        return;
    }

    await loadConversations();
    await initializeSignalR();
    setupEventListeners();
});


// ==========================================
// SIGNALR CONNECTION
// ==========================================
async function initializeSignalR() {
    const hubUrl = `${CONFIG.apiBaseUrl}/hubs/chat`;

    connection = new signalR.HubConnectionBuilder()
        .withUrl(hubUrl, {
            accessTokenFactory: () => CONFIG.userToken, // Dùng token từ Config
            skipNegotiation: false,
            transport: signalR.HttpTransportType.WebSockets
        })
        .withAutomaticReconnect()
        .build();

    // Nhận tin nhắn mới
    connection.on('ReceiveMessage', (message) => {
        if (currentConversation && currentConversation.conversationId === message.conversationId) {
            addMessageToUI(message);
            // markAsRead(message.conversationId);
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
// CONVERSATION LOGIC
// ==========================================

async function loadConversations() {
    try {
        const response = await fetch(`${CONFIG.apiBaseUrl}/api/conversation/my-conversations`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${CONFIG.userToken}` }
        });

        if (!response.ok) throw new Error("Failed to load conversations");

        conversations = await response.json();
        renderConversations();
    } catch (error) {
        console.error('Load conversations failed:', error);
        const listEl = document.getElementById('conversationsList');
        if (listEl) listEl.innerHTML = '<p class="text-muted p-3">Failed to load conversations.</p>';
    }
}

function renderConversations() {
    const container = document.getElementById('conversationsList');
    if (!container) return;

    if (!conversations || conversations.length === 0) {
        container.innerHTML = '<p class="text-muted p-3">No patient conversations yet.</p>';
        return;
    }

    container.innerHTML = conversations.map(c => {
        // Format lại dữ liệu hiển thị
        const lastMsg = c.lastMessage
            ? (c.lastMessage.messageType === 'image' ? '📷 Image' : c.lastMessage.content)
            : 'Start conversation';

        return `
        <div class="conversation-item ${c.unreadCount > 0 ? 'unread' : ''}" onclick="selectConversation(${c.conversationId})">
            <div class="conversation-avatar">
                <img src="${c.otherUserAvatar || '/placeholder.svg?height=32&width=32'}" alt="Avatar">
            </div>
            <div class="conversation-content">
                <h6 class="conversation-name">${c.otherUserName}</h6>
                <p class="conversation-preview">${lastMsg}</p>
            </div>
            ${c.unreadCount > 0 ? `<div class="unread-badge">${c.unreadCount}</div>` : ''}
        </div>
        `;
    }).join('');
}

async function selectConversation(conversationId) {
    // Highlight item được chọn
    document.querySelectorAll('.conversation-item').forEach(i => i.classList.remove('active'));
    event.currentTarget.classList.add('active');

    currentConversation = conversations.find(c => c.conversationId === conversationId);
    if (!currentConversation) return;

    // Cập nhật Header Chat
    document.getElementById('chatHeader').style.display = 'flex';
    document.getElementById('chatInputContainer').style.display = 'block';

    const nameEl = document.getElementById('chatPatientName'); // Đổi ID cho khớp View
    if (nameEl) nameEl.textContent = currentConversation.otherUserName;

    const avatarEl = document.getElementById('chatAvatar');
    if (avatarEl) avatarEl.src = currentConversation.otherUserAvatar || '/placeholder.svg?height=48&width=48';

    // Join Group SignalR
    if (connection) await connection.invoke('JoinConversation', conversationId);

    // Load Messages
    await loadMessages(conversationId);

    // Reset unread UI (Client side only)
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
    } catch (e) {
        console.error('Load msg error:', e);
    }
}

function renderMessages(messages) {
    const container = document.getElementById('chatMessages');
    if (!container) return;

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
                    <div class="message-time text-muted small text-end mt-1">
                        ${formatTime(msg.sentAt)}
                    </div>
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

    // Xóa "No messages yet" nếu có
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
        alert("Failed to send message");
    }
}

function updateConversationLastMessage(conversationId, message) {
    const conv = conversations.find(c => c.conversationId === conversationId);
    if (conv) {
        conv.lastMessage = {
            content: message.content,
            messageType: message.messageType
        };
        if (message.senderId !== CONFIG.userId) {
            conv.unreadCount = (conv.unreadCount || 0) + 1;
        }
        renderConversations();
    }
}


// ==========================================
// VIDEO CALL LOGIC (Twilio)
// ==========================================

async function fetchTwilioToken(roomName) {
    try {
        const res = await fetch(`${CONFIG.apiBaseUrl}/api/twilio/token?roomName=${encodeURIComponent(roomName)}`, {
            headers: { 'Authorization': `Bearer ${CONFIG.userToken}` }
        });
        return await res.json();
    } catch (e) {
        console.error('Token fetch error', e);
        return null;
    }
}

async function startVideoCall() {
    if (!currentConversation) {
        showNotification("Select a conversation first", "warning");
        return;
    }

    const roomName = `VideoRoom_${currentConversation.conversationId}`;

    // Show Modal
    const modalEl = document.getElementById('videoCallModal');
    const modal = new bootstrap.Modal(modalEl);
    modal.show();

    // Update UI Modal
    const headerNameEl = document.getElementById('videoCallPatientName');
    if (headerNameEl) headerNameEl.innerText = currentConversation.otherUserName;

    document.getElementById('connectionStatus').innerText = "Connecting...";
    document.getElementById('remote-video').innerHTML = '';
    document.getElementById('local-video').innerHTML = '';
    document.getElementById('video-loading').style.display = 'flex';

    // Get Token
    const tokenData = await fetchTwilioToken(roomName);
    if (!tokenData) {
        document.getElementById('connectionStatus').innerText = "Token Error";
        return;
    }

    try {
        activeRoom = await Twilio.Video.connect(tokenData.token, {
            name: roomName,
            audio: true,
            video: { width: 640 }
        });

        document.getElementById('connectionStatus').innerText = "Waiting for patient...";

        // Local Video
        createLocalVideo();

        // Remote Participants
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
        alert("Call failed: " + err.message);
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
    console.log('Participant connected:', participant.identity);
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
    let isMuted = false;
    activeRoom.localParticipant.audioTracks.forEach(pub => {
        if (pub.track.isEnabled) {
            pub.track.disable();
            isMuted = true;
        } else {
            pub.track.enable();
            isMuted = false;
        }
    });
    // UI toggle logic here if needed
    console.log('Mute toggled:', isMuted);
}

function toggleVideo() {
    if (!localVideoTrack) return;
    if (localVideoTrack.isEnabled) {
        localVideoTrack.disable();
    } else {
        localVideoTrack.enable();
    }
}


// ==========================================
// UTILS & HELPERS
// ==========================================

function escapeHtml(text) {
    if (!text) return "";
    return text.replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function formatTime(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function setupEventListeners() {
    // Search input listener
    const search = document.getElementById('searchInput');
    if (search) {
        search.addEventListener('input', (e) => {
            // Logic search client-side đơn giản
            const val = e.target.value.toLowerCase();
            document.querySelectorAll('.conversation-item').forEach(item => {
                const name = item.querySelector('.conversation-name').textContent.toLowerCase();
                item.style.display = name.includes(val) ? 'block' : 'none';
            });
        });
    }
}

function showNotification(msg, type = 'info') {
    alert(msg); // Đơn giản hóa notification
}

// Placeholder Actions
function startNewConversation() { window.location.href = '/Doctor/Patients'; }
function startVoiceCall() { showNotification('Voice call coming soon'); }
function viewPatientProfile() { showNotification('Profile coming soon'); }
function attachFile() { showNotification('File upload coming soon'); }
function openImageModal(url) { window.open(url, '_blank'); }