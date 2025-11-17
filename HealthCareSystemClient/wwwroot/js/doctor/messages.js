// Doctor Messages functionality with SignalR
let currentConversation = null
let conversations = []
let connection = null
let isUploading = false // Flag to prevent duplicate uploads

// Initialize SignalR connection
async function initializeSignalR() {
    if (!window.userToken) {
        console.error('No authentication token found')
        return
    }

    const hubUrl = `${window.apiBaseUrl}/hubs/chat`
    connection = new signalR.HubConnectionBuilder()
        .withUrl(hubUrl, {
            accessTokenFactory: () => window.userToken,
            skipNegotiation: false,
            transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling
        })
        .withAutomaticReconnect()
        .build()

    // Handle received messages
    connection.on('ReceiveMessage', (message) => {
        if (currentConversation && currentConversation.conversationId === message.conversationId) {
            addMessageToUI(message)
            markAsRead(message.conversationId)
        } else {
            // Update conversation list
            updateConversationLastMessage(message.conversationId, message)
        }
    })

    // Handle read receipts
    connection.on('ReadReceipt', (data) => {
        console.log('Read receipt received', data)
    })

    // Handle typing indicators
    connection.on('Typing', (data) => {
        // Implement typing indicator if needed
        console.log('User typing', data)
    })

    // Handle connection events
    connection.onclose(() => {
        console.log('SignalR connection closed')
    })

    connection.onreconnecting(() => {
        console.log('SignalR reconnecting...')
    })

    connection.onreconnected(() => {
        console.log('SignalR reconnected')
        if (currentConversation) {
            joinConversation(currentConversation.conversationId)
        }
    })

    try {
        await connection.start()
        console.log('SignalR connected')
    } catch (err) {
        console.error('SignalR connection error:', err)
    }
}

// Join a conversation group
async function joinConversation(conversationId) {
    if (connection && connection.state === signalR.HubConnectionState.Connected) {
        try {
            await connection.invoke('JoinConversation', conversationId)
        } catch (err) {
            console.error('Error joining conversation:', err)
        }
    }
}

// Leave a conversation group
async function leaveConversation(conversationId) {
    if (connection && connection.state === signalR.HubConnectionState.Connected) {
        try {
            await connection.invoke('LeaveConversation', conversationId)
        } catch (err) {
            console.error('Error leaving conversation:', err)
        }
    }
}

// Load conversations from API
async function loadConversations() {
    // Check if token exists
    if (!window.userToken || window.userToken === '' || window.userToken === 'null') {
        console.error('No authentication token found')
        document.getElementById('conversationsList').innerHTML = '<p class="text-danger p-3">Please login to view conversations.</p>'
        return
    }

    // Check if API URL exists
    if (!window.apiBaseUrl) {
        console.error('API base URL not configured')
        document.getElementById('conversationsList').innerHTML = '<p class="text-danger p-3">API configuration error. Please contact support.</p>'
        return
    }

    try {
        const url = `${window.apiBaseUrl}/api/conversation/my-conversations`
        console.log('Loading conversations from:', url)
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${window.userToken}`,
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        })

        console.log('Response status:', response.status, response.statusText)

        if (!response.ok) {
            const errorText = await response.text()
            console.error('API Error:', errorText)
            
            if (response.status === 401) {
                document.getElementById('conversationsList').innerHTML = '<p class="text-danger p-3">Session expired. Please <a href="/Login">login again</a>.</p>'
                return
            }
            
            throw new Error(`Failed to load conversations: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()
        console.log('Conversations loaded:', data)
        conversations = data || []
        renderConversations()
    } catch (error) {
        console.error('Error loading conversations:', error)
        document.getElementById('conversationsList').innerHTML = `<p class="text-danger p-3">Error loading conversations: ${error.message}. Please refresh the page or contact support.</p>`
    }
}

// Render conversations list
function renderConversations() {
    const container = document.getElementById('conversationsList')
    
    if (conversations.length === 0) {
        container.innerHTML = '<p class="text-muted p-3">No patient conversations yet.</p>'
        return
    }

    container.innerHTML = conversations
        .map((conversation) => {
            const lastMessage = conversation.lastMessage
            const timeAgo = lastMessage ? formatTimeAgo(lastMessage.sentAt) : 'No messages'
            let preview = 'Start conversation'
            if (lastMessage) {
                if (lastMessage.messageType === 'image') {
                    preview = '📷 Image'
                } else {
                    preview = lastMessage.content.length > 50 ? lastMessage.content.substring(0, 50) + '...' : lastMessage.content
                }
            }
            
            // Get patient info if available
            const patientInfo = conversation.isDoctor ? '' : (conversation.specialty || 'Patient')
            
            return `
                <div class="conversation-item ${conversation.unreadCount > 0 ? 'unread' : ''}" onclick="selectConversation(${conversation.conversationId})">
                    <div class="conversation-avatar">
                        <img src="${conversation.otherUserAvatar}" alt="${conversation.otherUserName}">
                    </div>
                    <div class="conversation-content">
                        <div class="conversation-header">
                            <h6 class="conversation-name">${conversation.otherUserName}</h6>
                            <span class="conversation-time">${timeAgo}</span>
                        </div>
                        <p class="conversation-specialty">${patientInfo}</p>
                        <p class="conversation-preview">${preview}</p>
                    </div>
                    ${conversation.unreadCount > 0 ? `<div class="unread-badge">${conversation.unreadCount}</div>` : ''}
                </div>
            `
        })
        .join('')
}

// Parse UTC date string to local Date
function parseUTCDate(dateString) {
    if (!dateString) return new Date()
    // If dateString ends with Z or has timezone info, parse as UTC
    if (dateString.endsWith('Z') || dateString.includes('+') || dateString.includes('-', 10)) {
        return new Date(dateString)
    }
    // Otherwise assume it's already UTC and add Z
    return new Date(dateString + (dateString.includes('T') ? 'Z' : ''))
}

// Format time for message display (12-hour format with AM/PM)
function formatMessageTime(dateString) {
    const date = parseUTCDate(dateString)
    return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
    })
}

// Format time ago
function formatTimeAgo(dateString) {
    const date = parseUTCDate(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
}

// Select a conversation
async function selectConversation(conversationId) {
    // Remove active class from all
    document.querySelectorAll('.conversation-item').forEach((item) => {
        item.classList.remove('active')
    })
    event.currentTarget.classList.add('active')

    // Find conversation
    currentConversation = conversations.find((c) => c.conversationId === conversationId)
    if (!currentConversation) return

    // Leave previous conversation group
    if (currentConversation.previousConversationId) {
        await leaveConversation(currentConversation.previousConversationId)
    }

    // Join new conversation group
    await joinConversation(conversationId)
    currentConversation.previousConversationId = conversationId

    // Mark as read
    currentConversation.unreadCount = 0
    renderConversations()

    // Show chat interface
    showChatInterface()
    await loadMessages(conversationId)
    
    // Mark messages as read
    await markAsRead(conversationId)
}

// Show chat interface
function showChatInterface() {
    if (!currentConversation) return

    // Show chat header and input
    document.getElementById('chatHeader').style.display = 'flex'
    document.getElementById('chatInputContainer').style.display = 'block'

    // Update chat header
    document.getElementById('chatAvatar').src = currentConversation.otherUserAvatar
    document.getElementById('chatPatientName').textContent = currentConversation.otherUserName
    document.getElementById('chatPatientInfo').textContent = currentConversation.specialty || 'Patient'

    // Hide empty chat message
    const emptyChat = document.querySelector('.empty-chat')
    if (emptyChat) emptyChat.style.display = 'none'
}

// Load messages for a conversation
async function loadMessages(conversationId) {
    try {
        const response = await fetch(`${window.apiBaseUrl}/api/conversations/${conversationId}/messages?skip=0&take=50`, {
            headers: {
                'Authorization': `Bearer ${window.userToken}`,
                'Content-Type': 'application/json'
            }
        })

        if (!response.ok) {
            throw new Error('Failed to load messages')
        }

        const messages = await response.json()
        renderMessages(messages)
    } catch (error) {
        console.error('Error loading messages:', error)
        document.getElementById('chatMessages').innerHTML = '<p class="text-muted p-3">Error loading messages.</p>'
    }
}

// Render messages
function renderMessages(messages) {
    const container = document.getElementById('chatMessages')

    if (messages.length === 0) {
        container.innerHTML = `
            <div class="empty-chat">
                <div class="empty-chat-icon">
                    <i class="fas fa-comments"></i>
                </div>
                <h5>No messages yet</h5>
                <p>Start the conversation by sending a message</p>
            </div>
        `
        return
    }

    container.innerHTML = messages
        .map((message) => {
            const isOwn = message.senderId === window.userId
            const time = formatMessageTime(message.sentAt)
            const isImage = message.messageType === 'image'
            
            let messageContent = ''
            if (isImage) {
                messageContent = `<div class="message-image">
                    <img src="${escapeHtml(message.content)}" alt="Image" data-image-url="${escapeHtml(message.content)}" class="message-image-clickable" style="max-width: 300px; max-height: 300px; border-radius: 8px; cursor: pointer;">
                </div>`
            } else {
                messageContent = `<div class="message-text">${escapeHtml(message.content)}</div>`
            }
            
            return `
                <div class="message ${isOwn ? 'user-message' : 'doctor-message'}" data-message-id="${message.messageId}">
                    <div class="message-avatar">
                        <img src="${isOwn ? '/placeholder.svg?height=36&width=36' : currentConversation.otherUserAvatar}" alt="${isOwn ? 'You' : currentConversation.otherUserName}">
                    </div>
                    <div class="message-content">
                        <div class="message-header">
                            <span class="message-sender">${isOwn ? 'You' : currentConversation.otherUserName}</span>
                            <span class="message-time">${time}</span>
                        </div>
                        ${messageContent}
                    </div>
                </div>
            `
        })
        .join('')

    // Scroll to bottom
    container.scrollTop = container.scrollHeight
    // Note: Image click handling is done via event delegation in setupEventListeners()
}

// Add message to UI (for real-time updates)
function addMessageToUI(message) {
    const container = document.getElementById('chatMessages')
    
    // Check if message already exists to prevent duplicates
    const existingMessage = container.querySelector(`[data-message-id="${message.messageId}"]`)
    if (existingMessage) {
        console.log('Message already displayed, skipping duplicate:', message.messageId)
        return
    }
    
    // Remove empty chat message if exists
    const emptyChat = container.querySelector('.empty-chat')
    if (emptyChat) {
        emptyChat.remove()
    }

    const isOwn = message.senderId === window.userId
    const time = formatMessageTime(message.sentAt)
    const isImage = message.messageType === 'image'
    
    let messageContent = ''
    if (isImage) {
        messageContent = `<div class="message-image">
            <img src="${escapeHtml(message.content)}" alt="Image" data-image-url="${escapeHtml(message.content)}" class="message-image-clickable" style="max-width: 300px; max-height: 300px; border-radius: 8px; cursor: pointer;">
        </div>`
    } else {
        messageContent = `<div class="message-text">${escapeHtml(message.content)}</div>`
    }
    
    const messageDiv = document.createElement('div')
    messageDiv.className = `message ${isOwn ? 'user-message' : 'doctor-message'}`
    messageDiv.setAttribute('data-message-id', message.messageId)
    messageDiv.innerHTML = `
        <div class="message-avatar">
            <img src="${isOwn ? '/placeholder.svg?height=36&width=36' : currentConversation.otherUserAvatar}" alt="${isOwn ? 'You' : currentConversation.otherUserName}">
        </div>
        <div class="message-content">
            <div class="message-header">
                <span class="message-sender">${isOwn ? 'You' : currentConversation.otherUserName}</span>
                <span class="message-time">${time}</span>
            </div>
            ${messageContent}
        </div>
    `
    
    container.appendChild(messageDiv)
    // Note: Image click handling is done via event delegation in setupEventListeners()
    container.scrollTop = container.scrollHeight
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
}

// Send message
async function sendMessage(event) {
    event.preventDefault()

    if (!currentConversation) return

    const messageInput = document.getElementById('messageInput')
    const messageText = messageInput.value.trim()

    if (!messageText) return

    // Disable input while sending
    messageInput.disabled = true

    try {
        if (connection && connection.state === signalR.HubConnectionState.Connected) {
            // Send via SignalR
            await connection.invoke('SendMessage', currentConversation.conversationId, messageText, 'text')
            messageInput.value = ''
        } else {
            // Fallback to HTTP API
            const response = await fetch(`${window.apiBaseUrl}/api/conversations/${currentConversation.conversationId}/messages`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${window.userToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    content: messageText,
                    messageType: 'text'
                })
            })

            if (!response.ok) {
                throw new Error('Failed to send message')
            }

            const message = await response.json()
            addMessageToUI(message)
            messageInput.value = ''
        }
    } catch (error) {
        console.error('Error sending message:', error)
        alert('Failed to send message. Please try again.')
    } finally {
        messageInput.disabled = false
        messageInput.focus()
    }
}

// Mark messages as read
async function markAsRead(conversationId) {
    try {
        if (connection && connection.state === signalR.HubConnectionState.Connected) {
            await connection.invoke('MarkAsRead', conversationId)
        } else {
            await fetch(`${window.apiBaseUrl}/api/conversations/${conversationId}/messages/mark-read`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${window.userToken}`,
                    'Content-Type': 'application/json'
                }
            })
        }
    } catch (error) {
        console.error('Error marking as read:', error)
    }
}

// Update conversation last message (for real-time updates)
function updateConversationLastMessage(conversationId, message) {
    const conversation = conversations.find(c => c.conversationId === conversationId)
    if (conversation) {
        conversation.lastMessage = {
            content: message.content,
            sentAt: message.sentAt,
            senderId: message.senderId,
            messageType: message.messageType
        }
        if (message.senderId !== window.userId) {
            conversation.unreadCount = (conversation.unreadCount || 0) + 1
        }
        renderConversations()
    }
}

// Setup event listeners
function setupEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('searchInput')
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            filterConversations(e.target.value)
        })
    }

    // Message input
    const messageInput = document.getElementById('messageInput')
    if (messageInput) {
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                sendMessage(e)
            }
        })
    }

    // Event delegation for image clicks
    const chatMessages = document.getElementById('chatMessages')
    if (chatMessages) {
        chatMessages.addEventListener('click', (e) => {
            if (e.target.classList.contains('message-image-clickable')) {
                const imageUrl = e.target.getAttribute('data-image-url')
                if (imageUrl) {
                    openImageModal(imageUrl)
                }
            }
        })
    }
}

// Filter conversations
function filterConversations(searchTerm) {
    const items = document.querySelectorAll('.conversation-item')
    items.forEach((item) => {
        const name = item.querySelector('.conversation-name')?.textContent.toLowerCase() || ''
        const preview = item.querySelector('.conversation-preview')?.textContent.toLowerCase() || ''

        if (name.includes(searchTerm.toLowerCase()) || preview.includes(searchTerm.toLowerCase())) {
            item.style.display = 'block'
        } else {
            item.style.display = 'none'
        }
    })
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    // Debug: Log configuration
    console.log('Initializing messages page...')
    console.log('API Base URL:', window.apiBaseUrl)
    console.log('User ID:', window.userId)
    console.log('User Token exists:', !!window.userToken)
    console.log('User Name:', window.userName)
    
    if (window.userName) {
        const doctorName = window.userName.split('@')[0] || 'Dr. ' + window.userName
        const doctorNameElement = document.getElementById('doctorName')
        if (doctorNameElement) {
            doctorNameElement.textContent = doctorName
        }
    }
    
    // Load conversations first (doesn't require SignalR)
    await loadConversations()
    
    // Initialize SignalR after conversations are loaded
    await initializeSignalR()
    setupEventListeners()
})

// Action functions
function startVideoCall() {
    if (!currentConversation) return
    console.log('Starting video call with:', currentConversation.otherUserName)
    showNotification('Video call started', 'info')
}

function startVoiceCall() {
    if (!currentConversation) return
    console.log('Starting voice call with:', currentConversation.otherUserName)
    showNotification('Voice call started', 'info')
}

function viewPatientProfile() {
    if (!currentConversation) return
    console.log('Viewing profile for:', currentConversation.otherUserName)
    // Navigate to patient profile
    window.location.href = `/Doctor/Patients?id=${currentConversation.otherUserId}`
}

function scheduleAppointment() {
    if (!currentConversation) return
    console.log('Scheduling appointment for:', currentConversation.otherUserName)
    window.location.href = `/Doctor/Appointments?patient=${currentConversation.otherUserId}`
}

// Upload image function
async function uploadImage(file) {
    // Prevent duplicate uploads
    if (isUploading) {
        console.log('Upload already in progress, ignoring duplicate request')
        return
    }

    if (!currentConversation) {
        showNotification('Please select a conversation first', 'warning')
        return
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
        showNotification('Invalid file type. Only image files (jpg, jpeg, png, gif, webp) are allowed.', 'warning')
        return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
        showNotification('File size exceeds 10MB limit.', 'warning')
        return
    }

    isUploading = true
    try {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch(`${window.apiBaseUrl}/api/conversations/${currentConversation.conversationId}/messages/upload-image`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${window.userToken}`
            },
            body: formData
        })

        if (!response.ok) {
            const errorText = await response.text()
            throw new Error(errorText || 'Failed to upload image')
        }

        // Don't call addMessageToUI here - SignalR will handle it via ReceiveMessage
        // This prevents duplicate messages in the UI
        const message = await response.json()
        console.log('Image uploaded successfully, waiting for SignalR to display message')
    } catch (error) {
        console.error('Error uploading image:', error)
        showNotification('Failed to upload image. Please try again.', 'danger')
    } finally {
        isUploading = false
    }
}

function attachFile() {
    console.log('attachFile() called')
    
    if (!currentConversation) {
        showNotification('Please select a conversation first', 'warning')
        return
    }

    // Prevent multiple file dialogs
    if (isUploading) {
        console.log('Upload in progress, please wait...')
        return
    }

    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.style.display = 'none'
    
    // Remove previous input if exists to prevent duplicate handlers
    const existingInput = document.getElementById('fileInput')
    if (existingInput) {
        existingInput.remove()
    }
    
    input.id = 'fileInput'
    
    // Use once option to ensure handler only fires once
    input.addEventListener('change', function(e) {
        const file = e.target.files[0]
        if (file) {
            console.log('File selected:', file.name, file.type, file.size)
            // Clear the input value to allow selecting the same file again
            this.value = ''
            uploadImage(file)
        }
        // Remove the input after use
        setTimeout(() => {
            if (this.parentNode) {
                this.remove()
            }
        }, 100)
    }, { once: true })
    
    document.body.appendChild(input)
    input.click()
}

// Open image in modal for full view
function openImageModal(imageUrl) {
    // Create modal if it doesn't exist
    let modal = document.getElementById('imageModal')
    if (!modal) {
        modal = document.createElement('div')
        modal.id = 'imageModal'
        modal.className = 'modal fade'
        document.body.appendChild(modal)
    }
    
    // Update modal content
    modal.innerHTML = `
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content bg-transparent border-0">
                <div class="modal-body p-0 text-center">
                    <button type="button" class="btn-close btn-close-white position-absolute top-0 end-0 m-3" data-bs-dismiss="modal" style="z-index: 1051;"></button>
                    <img src="${escapeHtml(imageUrl)}" alt="Full size image" class="img-fluid" style="max-height: 90vh;">
                </div>
            </div>
        </div>
    `

    const bsModal = new bootstrap.Modal(modal)
    bsModal.show()
}

function startNewConversation() {
    console.log('Starting new conversation')
    window.location.href = '/Doctor/Patients'
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div')
    notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`
    notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999;'
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `
    document.body.appendChild(notification)

    setTimeout(() => {
        notification.remove()
    }, 3000)
}
