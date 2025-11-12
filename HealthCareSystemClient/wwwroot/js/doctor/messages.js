// Doctor Messages functionality
let currentConversation = null
let conversations = []

document.addEventListener("DOMContentLoaded", () => {
    initializeMessages()
    loadConversations()
    setupEventListeners()
})

function initializeMessages() {
    const doctorName = localStorage.getItem("doctorName") || "Dr. Sarah Johnson"
    document.getElementById("doctorName").textContent = doctorName

    // Initialize conversations data
    conversations = [
        {
            id: 1,
            patientId: 1,
            patientName: "John Doe",
            patientInfo: "Age 45 • Hypertension",
            avatar: "/placeholder.svg?height=48&width=48",
            lastMessage: "Thank you for the prescription, Doctor.",
            lastMessageTime: "10:30 AM",
            unreadCount: 2,
            status: "online",
            messages: [
                {
                    id: 1,
                    sender: "patient",
                    text: "Hello Doctor, I have been experiencing some chest pain.",
                    time: "09:15 AM",
                    timestamp: new Date("2024-01-20T09:15:00"),
                },
                {
                    id: 2,
                    sender: "doctor",
                    text: "I understand your concern. Can you describe the pain? Is it sharp or dull?",
                    time: "09:18 AM",
                    timestamp: new Date("2024-01-20T09:18:00"),
                },
                {
                    id: 3,
                    sender: "patient",
                    text: "It's more of a dull ache, and it comes and goes.",
                    time: "09:20 AM",
                    timestamp: new Date("2024-01-20T09:20:00"),
                },
                {
                    id: 4,
                    sender: "doctor",
                    text: "Based on your symptoms and medical history, I'm prescribing a medication adjustment. Please schedule a follow-up appointment.",
                    time: "09:25 AM",
                    timestamp: new Date("2024-01-20T09:25:00"),
                },
                {
                    id: 5,
                    sender: "patient",
                    text: "Thank you for the prescription, Doctor.",
                    time: "10:30 AM",
                    timestamp: new Date("2024-01-20T10:30:00"),
                },
            ],
        },
        {
            id: 2,
            patientId: 2,
            patientName: "Jane Smith",
            patientInfo: "Age 32 • Diabetes",
            avatar: "/placeholder.svg?height=48&width=48",
            lastMessage: "My blood sugar levels have been stable.",
            lastMessageTime: "Yesterday",
            unreadCount: 0,
            status: "away",
            messages: [
                {
                    id: 1,
                    sender: "patient",
                    text: "Good morning Doctor! I wanted to update you on my blood sugar readings.",
                    time: "Yesterday 2:00 PM",
                    timestamp: new Date("2024-01-19T14:00:00"),
                },
                {
                    id: 2,
                    sender: "doctor",
                    text: "Good to hear from you, Jane. How have the readings been?",
                    time: "Yesterday 2:05 PM",
                    timestamp: new Date("2024-01-19T14:05:00"),
                },
                {
                    id: 3,
                    sender: "patient",
                    text: "My blood sugar levels have been stable.",
                    time: "Yesterday 2:10 PM",
                    timestamp: new Date("2024-01-19T14:10:00"),
                },
            ],
        },
        {
            id: 3,
            patientId: 3,
            patientName: "Mike Johnson",
            patientInfo: "Age 28 • Anxiety",
            avatar: "/placeholder.svg?height=48&width=48",
            lastMessage: "The breathing exercises are helping.",
            lastMessageTime: "2 days ago",
            unreadCount: 1,
            status: "offline",
            messages: [
                {
                    id: 1,
                    sender: "patient",
                    text: "Hi Dr. Johnson, I've been practicing the breathing exercises you recommended.",
                    time: "2 days ago 11:00 AM",
                    timestamp: new Date("2024-01-18T11:00:00"),
                },
                {
                    id: 2,
                    sender: "doctor",
                    text: "That's great to hear! How are you feeling?",
                    time: "2 days ago 11:15 AM",
                    timestamp: new Date("2024-01-18T11:15:00"),
                },
                {
                    id: 3,
                    sender: "patient",
                    text: "The breathing exercises are helping.",
                    time: "2 days ago 11:30 AM",
                    timestamp: new Date("2024-01-18T11:30:00"),
                },
            ],
        },
    ]
}

function loadConversations() {
    const container = document.getElementById("conversationsList")
    if (!container) return

    container.innerHTML = conversations
        .map(
            (conversation) => `
      <div class="conversation-item ${conversation.unreadCount > 0 ? "unread" : ""}" onclick="selectConversation(${conversation.id})">
        <div class="conversation-avatar">
          <img src="${conversation.avatar}" alt="${conversation.patientName}">
          <div class="status-indicator ${conversation.status}"></div>
        </div>
        <div class="conversation-content">
          <div class="conversation-header">
            <h6 class="conversation-name">${conversation.patientName}</h6>
            <span class="conversation-time">${conversation.lastMessageTime}</span>
          </div>
          <p class="conversation-specialty">${conversation.patientInfo}</p>
          <p class="conversation-preview">${conversation.lastMessage}</p>
        </div>
        ${conversation.unreadCount > 0 ? `<span class="unread-badge">${conversation.unreadCount}</span>` : ""}
      </div>
    `,
        )
        .join("")
}

function selectConversation(conversationId) {
    // Remove active class from all conversations
    document.querySelectorAll(".conversation-item").forEach((item) => {
        item.classList.remove("active")
    })

    // Add active class to selected conversation
    const selectedConversationElement = event.currentTarget
    selectedConversationElement.classList.add("active")

    // Find the conversation
    currentConversation = conversations.find((c) => c.id === conversationId)
    if (!currentConversation) return

    // Mark as read
    currentConversation.unreadCount = 0
    selectedConversationElement.classList.remove("unread")
    const badge = selectedConversationElement.querySelector(".unread-badge")
    if (badge) badge.remove()

    // Show chat interface
    showChatInterface()
    loadMessages()
}

function showChatInterface() {
    if (!currentConversation) return

    // Show chat header and input
    document.getElementById("chatHeader").style.display = "flex"
    document.getElementById("chatInputContainer").style.display = "block"

    // Update chat header
    document.getElementById("chatAvatar").src = currentConversation.avatar
    document.getElementById("chatPatientName").textContent = currentConversation.patientName
    document.getElementById("chatPatientInfo").textContent = currentConversation.patientInfo

    // Hide empty chat message
    const emptyChat = document.querySelector(".empty-chat")
    if (emptyChat) emptyChat.style.display = "none"
}

function loadMessages() {
    if (!currentConversation) return

    const messagesContainer = document.getElementById("chatMessages")
    messagesContainer.innerHTML = currentConversation.messages
        .map(
            (message) => `
      <div class="message ${message.sender === "doctor" ? "user-message" : "doctor-message"}">
        <div class="message-avatar">
          <img src="${message.sender === "doctor" ? "/placeholder.svg?height=36&width=36" : currentConversation.avatar}" alt="${message.sender}">
        </div>
        <div class="message-content">
          <div class="message-header">
            <span class="message-sender">${message.sender === "doctor" ? "You" : currentConversation.patientName}</span>
            <span class="message-time">${message.time}</span>
          </div>
          <div class="message-text">${message.text}</div>
        </div>
      </div>
    `,
        )
        .join("")

    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight
}

function setupEventListeners() {
    // Search functionality
    const searchInput = document.getElementById("searchInput")
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            filterConversations(e.target.value)
        })
    }

    // Message input
    const messageInput = document.getElementById("messageInput")
    if (messageInput) {
        messageInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                sendMessage(e)
            }
        })
    }
}

function filterConversations(searchTerm) {
    const items = document.querySelectorAll(".conversation-item")
    items.forEach((item) => {
        const name = item.querySelector(".conversation-name").textContent.toLowerCase()
        const preview = item.querySelector(".conversation-preview").textContent.toLowerCase()

        if (name.includes(searchTerm.toLowerCase()) || preview.includes(searchTerm.toLowerCase())) {
            item.style.display = "block"
        } else {
            item.style.display = "none"
        }
    })
}

function sendMessage(event) {
    event.preventDefault()

    if (!currentConversation) return

    const messageInput = document.getElementById("messageInput")
    const messageText = messageInput.value.trim()

    if (!messageText) return

    // Create new message
    const newMessage = {
        id: currentConversation.messages.length + 1,
        sender: "doctor",
        text: messageText,
        time: new Date().toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        }),
        timestamp: new Date(),
    }

    // Add message to conversation
    currentConversation.messages.push(newMessage)
    currentConversation.lastMessage = messageText
    currentConversation.lastMessageTime = "Just now"

    // Clear input
    messageInput.value = ""

    // Reload messages and conversations
    loadMessages()
    loadConversations()

    // Reselect current conversation
    setTimeout(() => {
        const conversationElement = document.querySelector(`[onclick="selectConversation(${currentConversation.id})"]`)
        if (conversationElement) {
            conversationElement.classList.add("active")
        }
    }, 100)
}

// Action functions
function startVideoCall() {
    if (!currentConversation) return
    console.log("Starting video call with:", currentConversation.patientName)
    // Implement video call functionality
    showNotification("Video call started", "info")
}

function startVoiceCall() {
    if (!currentConversation) return
    console.log("Starting voice call with:", currentConversation.patientName)
    // Implement voice call functionality
    showNotification("Voice call started", "info")
}

function viewPatientProfile() {
    if (!currentConversation) return
    console.log("Viewing profile for:", currentConversation.patientName)
    window.location.href = `doctor-patients.html?id=${currentConversation.patientId}`
}

function scheduleAppointment() {
    if (!currentConversation) return
    console.log("Scheduling appointment for:", currentConversation.patientName)
    // Open appointment modal or navigate to scheduling
    window.location.href = `doctor-appointments.html?patient=${currentConversation.patientId}`
}

function attachFile() {
    console.log("Attaching file")
    // Implement file attachment functionality
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*,.pdf,.doc,.docx"
    input.onchange = (e) => {
        const file = e.target.files[0]
        if (file) {
            console.log("File selected:", file.name)
            // Handle file upload
        }
    }
    input.click()
}

function startNewConversation() {
    console.log("Starting new conversation")
    // Show patient selection modal or navigate to patients page
    window.location.href = "doctor-patients.html"
}

function showNotification(message, type = "info") {
    const notification = document.createElement("div")
    notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`
    notification.style.cssText = "top: 20px; right: 20px; z-index: 9999;"
    notification.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `
    document.body.appendChild(notification)

    setTimeout(() => {
        notification.remove()
    }, 3000)
}

function logout() {
    if (confirm("Are you sure you want to logout?")) {
        localStorage.clear()
        window.location.href = "login.html"
    }
}
