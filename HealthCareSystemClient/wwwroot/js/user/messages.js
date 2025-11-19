/**
 * Patient Messages & Video Call Logic
 * Dependencies: SignalR, Twilio Video SDK
 */

// 1. SETUP CONFIGURATION
const CONFIG = window.AppConfig || {
    apiBaseUrl: '',
    userId: 0,
    userToken: '',
    userEmail: ''
};

// --- GLOBAL VARIABLES ---
let currentConversation = null;
let conversations = [];
let connection = null;
let isUploading = false;

// --- VIDEO CALL VARIABLES ---
let activeRoom = null;
let localVideoTrack = null;


// ==========================================
// INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', async () => {
    // Check Auth
    if (!CONFIG.userToken) {
        console.error('Missing User Token in AppConfig');
        document.getElementById('conversationsList').innerHTML =
            '<p class="text-danger p-3">Please <a href="/Login">login</a> to view messages.</p>';
        return;
    }

    await loadConversations();
    await initializeSignalR();
    setupEventListeners();
});


// ==========================================
// SIGNALR (REAL-TIME CHAT)
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

    // Lắng nghe tin nhắn đến
    connection.on('ReceiveMessage', (message) => {
        if (currentConversation && currentConversation.conversationId === message.conversationId) {
            addMessageToUI(message);
            // markAsRead(message.conversationId); // Optional
        } else {
            updateConversationLastMessage(message.conversationId, message);
        }
    });

    try {
        await connection.start();
        console.log('SignalR Connected');
    } catch (err) {
        console.error('SignalR Connection Error:', err);
    }
}


// ==========================================
// CONVERSATION & MESSAGE LOGIC
// ==========================================

async function loadConversations() {
    try {
        const response = await fetch(`${CONFIG.apiBaseUrl}/api/conversation/my-conversations`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${CONFIG.userToken}` }
        });

        if (!response.ok) throw new Error("API Error: " + response.status);

        conversations = await response.json();
        renderConversations();
    } catch (error) {
        console.error("Load conversations failed:", error);
        document.getElementById('conversationsList').innerHTML = '<p class="text-muted p-3">Failed to load conversations.</p>';
    }
}

function renderConversations() {
    const container = document.getElementById('conversationsList');
    if (!conversations || conversations.length === 0) {
        container.innerHTML = '<p class="text-muted p-3">No conversations found. Start a new one!</p>';
        return;
    }

    container.innerHTML = conversations.map(c => `
        <div class="conversation-item" onclick="selectConversation(${c.conversationId})">
            <div class="conversation-avatar">
                <img src="${c.otherUserAvatar || '/placeholder.svg?height=32&width=32'}" alt="Avatar">
            </div>
            <div class="conversation-content">
                <h6 class="conversation-name">${c.otherUserName}</h6>
                <p class="conversation-preview">
                    ${c.lastMessage ? (c.lastMessage.messageType === 'image' ? '📷 Image' : c.lastMessage.content) : 'Start chatting...'}
                </p>
            </div>
            ${c.unreadCount > 0 ? `<div class="unread-badge">${c.unreadCount}</div>` : ''}
        </div>
    `).join('');
}

async function selectConversation(conversationId) {
    // Highlight UI
    document.querySelectorAll('.conversation-item').forEach(i => i.classList.remove('active'));
    event.currentTarget.classList.add('active');

    currentConversation = conversations.find(c => c.conversationId === conversationId);
    if (!currentConversation) return;

    // Show Chat Area
    document.getElementById('chatHeader').style.display = 'flex';
    document.getElementById('chatInputContainer').style.display = 'block';

    // Update Header Info
    document.getElementById('chatDoctorName').textContent = currentConversation.otherUserName;
    document.getElementById('chatDoctorSpecialty').textContent = currentConversation.specialty || 'Doctor';
    const avatar = document.getElementById('chatAvatar');
    if (avatar) avatar.src = currentConversation.otherUserAvatar || '/placeholder.svg?height=48&width=48';

    // SignalR Join Group
    if (connection) await connection.invoke('JoinConversation', conversationId);

    // Load History
    loadMessages(conversationId);

    // Clear unread locally
    currentConversation.unreadCount = 0;
    renderConversations();
}

async function loadMessages(conversationId) {
    try {
        const res = await fetch(`${CONFIG.apiBaseUrl}/api/conversations/${conversationId}/messages?skip=0&take=50`, {
            headers: { 'Authorization': `Bearer ${CONFIG.userToken}` }
        });

        if (!res.ok) throw new Error("Failed load messages");

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
            ? `<img src="${msg.content}" class="img-fluid rounded" style="max-width:200px; cursor:pointer;" onclick="openImageModal('${msg.content}')">`
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
    
    // Kiểm tra duplicate dựa trên messageId
    if (msg.messageId) {
        const existingMessage = container.querySelector(`[data-message-id="${msg.messageId}"]`);
        if (existingMessage) {
            console.log('Message already exists, skipping duplicate:', msg.messageId);
            return;
        }
    }
    
    const isOwn = msg.senderId === CONFIG.userId;
    const contentHtml = msg.messageType === 'image'
        ? `<img src="${msg.content}" class="img-fluid rounded message-image" style="max-width:200px; cursor:pointer;" onclick="openImageModal('${msg.content}')" alt="Uploaded image">`
        : `<div class="message-text">${escapeHtml(msg.content)}</div>`;

    const html = `
        <div class="message ${isOwn ? 'user-message' : 'doctor-message'}" data-message-id="${msg.messageId || ''}">
            <div class="message-content">
                ${contentHtml}
            </div>
        </div>
    `;

    // Remove empty placeholder
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

    input.value = ''; // Clear input first for UX

    try {
        if (connection) {
            // Prefer SignalR
            await connection.invoke('SendMessage', currentConversation.conversationId, text, 'text');
        } else {
            // Fallback API (Optional)
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
// VIDEO CALL LOGIC (TWILIO)
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

    // 1. UI Setup
    const modalEl = document.getElementById('videoCallModal');
    const modal = new bootstrap.Modal(modalEl);
    modal.show();

    // Reset UI
    const partnerName = currentConversation.otherUserName;
    const nameEl = document.getElementById('videoCallPartnerName') || document.getElementById('videoCallDoctorName');
    if (nameEl) nameEl.textContent = partnerName;

    document.getElementById('video-loading').style.display = 'flex';
    document.getElementById('connectionStatus').innerText = "Connecting...";
    document.getElementById('remote-video').innerHTML = '';
    document.getElementById('local-video').innerHTML = '';

    // 2. Get Token
    const tokenData = await fetchTwilioToken(roomName);
    if (!tokenData) {
        document.getElementById('connectionStatus').innerText = "Token Error";
        return;
    }

    // 3. Connect Twilio
    try {
        activeRoom = await Twilio.Video.connect(tokenData.token, {
            name: roomName,
            audio: true,
            video: { width: 640 },
            preferredVideoCodecs: [{ codec: 'VP8', simulcast: true }],
            networkQuality: { local: 1, remote: 1 }
        });

        console.log(`✅ Connected to Room: ${activeRoom.name}`);
        document.getElementById('connectionStatus').innerText = "Waiting for partner...";

        // 4. Show Local Video
        createLocalVideo();

        // 5. Xử lý người ĐÃ CÓ TRONG PHÒNG (Quan trọng cho người vào sau)
        activeRoom.participants.forEach(participant => {
            console.log(`👀 Found existing participant: ${participant.identity}`);
            participantConnected(participant);
        });

        // 6. Xử lý người MỚI VÀO
        activeRoom.on('participantConnected', participant => {
            console.log(`👋 New participant joined: ${participant.identity}`);
            participantConnected(participant);
        });

        // 7. Xử lý người RỜI ĐI
        activeRoom.on('participantDisconnected', participant => {
            console.log(`Participant ${participant.identity} left.`);
            document.getElementById('remote-video').innerHTML = ''; // Xóa video
            document.getElementById('video-loading').style.display = 'flex'; // Hiện lại loading
            document.getElementById('connectionStatus').innerText = `${participant.identity} left.`;
        });

        activeRoom.on('disconnected', endCallUI);

    } catch (err) {
        console.error("Connect Error:", err);
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

// Hàm xử lý khi tìm thấy 1 người tham gia
function participantConnected(participant) {
    console.log(`Processing participant: ${participant.identity}`);

    // Ẩn loading ngay khi tìm thấy người (dù chưa có video)
    const statusEl = document.getElementById('connectionStatus');
    if (statusEl) statusEl.innerText = "Connected!";

    // A. Duyệt qua các track ĐÃ CÓ (Audio/Video)
    participant.tracks.forEach(publication => {
        if (publication.isSubscribed) {
            const track = publication.track;
            attachTrack(track);
        }
    });

    // B. Lắng nghe các track MỚI được thêm vào
    participant.on('trackSubscribed', track => {
        console.log(`Track subscribed: ${track.kind}`);
        attachTrack(track);
    });
}

// Hàm gắn Video/Audio vào HTML
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
    // Ẩn modal
    const el = document.getElementById('videoCallModal');
    const modal = bootstrap.Modal.getInstance(el);
    if (modal) modal.hide();
}

function toggleMute() {
    if (!activeRoom) return;
    let isMuted = false;
    activeRoom.localParticipant.audioTracks.forEach(p => {
        p.track.isEnabled ? p.track.disable() : p.track.enable();
        isMuted = !p.track.isEnabled;
    });
    // UI update (Optional)
    const btn = document.getElementById('btnMute');
    if (btn) {
        isMuted ? btn.classList.replace('btn-light', 'btn-danger')
            : btn.classList.replace('btn-danger', 'btn-light');
    }
}

function toggleVideo() {
    if (!localVideoTrack) return;
    const btn = document.getElementById('btnVideo');

    if (localVideoTrack.isEnabled) {
        localVideoTrack.disable();
        if (btn) btn.classList.replace('btn-light', 'btn-danger');
    } else {
        localVideoTrack.enable();
        if (btn) btn.classList.replace('btn-danger', 'btn-light');
    }
}


// ==========================================
// UTILITIES & PLACEHOLDERS
// ==========================================

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

// Placeholder Functions
function startNewConversation() { alert('Coming soon!'); }
function startVoiceCall() { alert('Voice call coming soon!'); }
function viewDoctorProfile() { alert('Profile coming soon!'); }

function attachFile() {
    if (!currentConversation) {
        alert('Please select a conversation first.');
        return;
    }

    try {
        // Tạo input file ẩn
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.style.display = 'none';
        
        fileInput.addEventListener('change', async function(e) {
            const file = e.target.files[0];
            if (!file) return;
            
            // Kiểm tra kích thước file (max 10MB)
            if (file.size > 10 * 1024 * 1024) {
                showFileUploadModal('File size exceeds 10MB limit. Please choose a smaller file.');
                return;
            }
            
            // Kiểm tra loại file
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                showFileUploadModal('Invalid file type. Only image files (jpg, jpeg, png, gif, webp) are allowed.');
                return;
            }
            
            // Upload file
            await uploadFileToCloudinary(file);
        });
        
        document.body.appendChild(fileInput);
        fileInput.click();
        
        // Cleanup
        setTimeout(() => {
            if (document.body.contains(fileInput)) {
                document.body.removeChild(fileInput);
            }
        }, 1000);
    } catch (error) {
        console.error('Error in attachFile:', error);
        showFileUploadModal('An error occurred. Please try again.');
    }
}

async function uploadFileToCloudinary(file) {
    if (!currentConversation || !CONFIG.userToken) {
        showFileUploadModal('Unable to upload. Please check your connection.');
        return;
    }

    try {
        // Hiển thị loading
        const loadingModal = showUploadProgress('Uploading image...');

        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(
            `${CONFIG.apiBaseUrl}/api/conversations/${currentConversation.conversationId}/messages/upload-image`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${CONFIG.userToken}`
                },
                body: formData
            }
        );

        // Ẩn loading modal
        const loadingModalEl = document.getElementById('fileUploadProgressModal');
        if (loadingModalEl) {
            const bsModal = bootstrap.Modal.getInstance(loadingModalEl);
            if (bsModal) bsModal.hide();
        }

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Upload failed');
        }

        const result = await response.json();
        
        // Message sẽ được thêm tự động qua SignalR ReceiveMessage
        // Không cần thêm thủ công để tránh duplicate

    } catch (error) {
        console.error('Upload error:', error);
        showFileUploadModal('Failed to upload image: ' + error.message);
    }
}

function showUploadProgress(message) {
    let modal = document.getElementById('fileUploadProgressModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'fileUploadProgressModal';
        modal.className = 'modal fade';
        modal.innerHTML = `
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-body text-center py-4">
                        <div class="spinner-border text-primary mb-3" role="status">
                            <span class="visually-hidden">Loading...</span>
                        </div>
                        <p id="uploadProgressMessage">${message}</p>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    const messageEl = modal.querySelector('#uploadProgressMessage');
    if (messageEl) {
        messageEl.textContent = message;
    }
    
    const bsModal = new bootstrap.Modal(modal, { backdrop: 'static', keyboard: false });
    bsModal.show();
    return bsModal;
}

function showFileUploadModal(message) {
    // Tạo hoặc cập nhật modal
    let modal = document.getElementById('fileUploadModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'fileUploadModal';
        modal.className = 'modal fade';
        modal.innerHTML = `
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">File Upload</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <p id="fileUploadMessage"></p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">OK</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    const messageEl = modal.querySelector('#fileUploadMessage');
    if (messageEl) {
        messageEl.textContent = message;
    }
    
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
}

function openImageModal(url) {
    // Tạo hoặc cập nhật modal xem ảnh
    let modal = document.getElementById('imageViewModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'imageViewModal';
        modal.className = 'modal fade';
        modal.setAttribute('data-bs-backdrop', 'true');
        modal.innerHTML = `
            <div class="modal-dialog modal-dialog-centered" style="max-width: calc(100vw - 40px);">
                <div class="modal-content bg-transparent border-0 shadow-none">
                    <div class="modal-body p-0 d-flex justify-content-center align-items-center" style="background: transparent; position: relative;">
                        <img id="fullSizeImage" src="" alt="Full size image" style="border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.35); max-width: calc(100vw - 80px); max-height: calc(100vh - 120px); width: auto; height: auto; display: inline-block;">
                        <button type="button" class="btn-close btn-close-white bg-dark rounded-circle p-2" data-bs-dismiss="modal" aria-label="Close" style="opacity: 0.9; position: absolute; top: 12px; right: max(12px, calc((100vw - 40px - var(--img-width, 0px)) / 2));"></button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Thêm style cho backdrop
        const style = document.createElement('style');
        style.textContent = `
            #imageViewModal .modal-backdrop {
                background-color: rgba(0, 0, 0, 0.75) !important;
            }
        `;
        document.head.appendChild(style);
    }
    
    const img = modal.querySelector('#fullSizeImage');
        if (img) {
        img.onload = function () {
            const maxWidth = window.innerWidth - 80;
            const maxHeight = window.innerHeight - 120;
            let width = img.naturalWidth;
            let height = img.naturalHeight;
            const widthRatio = maxWidth / width;
            const heightRatio = maxHeight / height;
            const ratio = Math.min(1, widthRatio, heightRatio);
            img.style.width = (width * ratio) + 'px';
            img.style.height = (height * ratio) + 'px';
                // Lưu kích thước ảnh để định vị nút đóng
                const modalBody = img.closest('.modal-body');
                if (modalBody) {
                    modalBody.style.setProperty('--img-width', (width * ratio) + 'px');
                }
        };
        img.src = url;
        img.onerror = function() {
            console.error('Failed to load image:', url);
            alert('Failed to load image');
        };
    }
    
    const bsModal = new bootstrap.Modal(modal, {
        backdrop: true,
        keyboard: true
    });
    bsModal.show();
}