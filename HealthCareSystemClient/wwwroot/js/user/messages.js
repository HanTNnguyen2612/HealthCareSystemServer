// Messages functionality
let currentConversation = null
let conversations = []

document.addEventListener("DOMContentLoaded", () => {
    updateUserInfo()
    loadConversations()
})

function updateUserInfo() {
    const userName = localStorage.getItem("userName") || "John Doe"
    document.getElementById("userName").textContent = userName
}

function loadConversations() {
    conversations = [
        {
            id: 1,
            doctorName: "Dr. Sarah Johnson",
            specialty: "Cardiology",
            avatar: "/placeholder.svg?height=48&width=48",
            lastMessage: "Your test results look good. Continue with current medication.",
            time: "2h ago",
            unread: 2,
            status: "online",
            messages: [
                {
                    id: 1,
                    sender: "doctor",
                    text: "Hello! I've reviewed your recent test results.",
                    time: "10:30 AM",
                },
                {
                    id: 2,
                    sender: "user",
                    text: "Hi Dr. Johnson, thank you for reviewing them. How do they look?",
                    time: "10:32 AM",
                },
                {
                    id: 3,
                    sender: "doctor",
                    text: "Your test results look good. Continue with current medication.",
                    time: "10:35 AM",
                },
            ],
        },
        {
            id: 2,
            doctorName: "Dr. Michael Chen",
            specialty: "Dermatology",
            avatar: "/placeholder.svg?height=48&width=48",
            lastMessage: "Please send me a photo of the affected area.",
            time: "1d ago",
            unread: 0,
            status: "away",
            messages: [
                {
                    id: 1,
                    sender: "doctor",
                    text: "How is the treatment progressing?",
                    time: "Yesterday 2:15 PM",
                },
                {
                    id: 2,
                    sender: "user",
                    text: "It's getting better, but I still see some redness.",
                    time: "Yesterday 2:20 PM",
                },
                {
                    id: 3,
                    sender: "doctor",
                    text: "Please send me a photo of the affected area.",
                    time: "Yesterday 2:22 PM",
                },
            ],
        },
        {
            id: 3,
            doctorName: "Dr. Emily Davis",
            specialty: "General Medicine",
            avatar: "/placeholder.svg?height=48&width=48",
            lastMessage: "Your appointment is confirmed for tomorrow.",
            time: "2d ago",
            unread: 0,
            status: "offline",
            messages: [
                {
                    id: 1,
                    sender: "user",
                    text: "I'd like to schedule a follow-up appointment.",
                    time: "2 days ago 11:00 AM",
                },
                {
                    id: 2,
                    sender: "doctor",
                    text: "Of course! I have availability tomorrow at 3:15 PM. Would that work for you?",
                    time: "2 days ago 11:05 AM",
                },
                {
                    id: 3,
                    sender: "user",
                    text: "Perfect, that works for me.",
                    time: "2 days ago 11:07 AM",
                },
                {
                    id: 4,
                    sender: "doctor",
                    text: "Your appointment is confirmed for tomorrow.",
                    time: "2 days ago 11:10 AM",
                },
            ],
        },
        {
            id: 4,
            doctorName: "Dr. Robert Wilson",
            specialty: "Neurology",
            avatar: "/placeholder.svg?height=48&width=48",
            lastMessage: "Let's discuss your symptoms in detail.",
            time: "3d ago",
            unread: 1,
            status: "online",
            messages: [
                {
                    id: 1,
                    sender: "doctor",
                    text: "I've received your referral from Dr. Davis.",
                    time: "3 days ago 9:30 AM",
                },
                {
                    id: 2,
                    sender: "user",
                    text: "Yes, I've been experiencing some headaches lately.",
                    time: "3 days ago 9:35 AM",
                },
                {
                    id: 3,
                    sender: "doctor",
                    text: "Let's discuss your symptoms in detail.",
                    time: "3 days ago 9:40 AM",
                },
            ],
        },
    ]

    renderConversations()
}

function renderConversations() {
    const container = document.getElementById("conversationsList")
    container.innerHTML = conversations
        .map(
            (conversation) => `
    <div class="conversation-item ${conversation.unread > 0 ? "unread" : ""}" onclick="selectConversation(${conversation.id})">
      <div class="conversation-avatar">
        <img src="${conversation.avatar}" alt="${conversation.doctorName}">
        <div class="status-indicator ${conversation.status}"></div>
      </div>
      <div class="conversation-content">
        <div class="conversation-header">
          <h6 class="conversation-name">${conversation.doctorName}</h6>
          <span class="conversation-time">${conversation.time}</span>
        </div>
        <p class="conversation-specialty">${conversation.specialty}</p>
        <p class="conversation-preview">${conversation.lastMessage}</p>
      </div>
      ${conversation.unread > 0 ? `<div class="unread-badge">${conversation.unread}</div>` : ""}
    </div>
  `,
        )
        .join("")
}

function selectConversation(conversationId) {
    currentConversation = conversations.find((c) => c.id === conversationId)

    // Mark as read
    currentConversation.unread = 0
    renderConversations()

    // Update active state
    document.querySelectorAll(".conversation-item").forEach((item) => {
        item.classList.remove("active")
    })
    event.currentTarget.classList.add("active")

    // Show chat header and input
    document.getElementById("chatHeader").style.display = "flex"
    document.getElementById("chatInputContainer").style.display = "block"

    // Update chat header
    document.getElementById("chatAvatar").src = currentConversation.avatar
    document.getElementById("chatDoctorName").textContent = currentConversation.doctorName
    document.getElementById("chatDoctorSpecialty").textContent = currentConversation.specialty

    // Load messages
    loadMessages()
}

function loadMessages() {
    const container = document.getElementById("chatMessages")

    if (!currentConversation) {
        container.innerHTML = `
      <div class="empty-chat">
        <div class="empty-chat-icon">
          <i class="fas fa-comments"></i>
        </div>
        <h5>Select a conversation</h5>
        <p>Choose a doctor from the list to start messaging</p>
      </div>
    `
        return
    }

    container.innerHTML = currentConversation.messages
        .map(
            (message) => `
    <div class="message ${message.sender === "user" ? "user-message" : "doctor-message"}">
      <div class="message-avatar">
        <img src="${message.sender === "user" ? "/placeholder.svg?height=36&width=36" : currentConversation.avatar}" alt="${message.sender}">
      </div>
      <div class="message-content">
        <div class="message-header">
          <span class="message-sender">${message.sender === "user" ? "You" : currentConversation.doctorName}</span>
          <span class="message-time">${message.time}</span>
        </div>
        <div class="message-text">${message.text}</div>
      </div>
    </div>
  `,
        )
        .join("")

    // Scroll to bottom
    container.scrollTop = container.scrollHeight
}

function sendMessage(event) {
    event.preventDefault()

    const input = document.getElementById("messageInput")
    const messageText = input.value.trim()

    if (!messageText || !currentConversation) return

    // Add user message
    const newMessage = {
        id: currentConversation.messages.length + 1,
        sender: "user",
        text: messageText,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }

    currentConversation.messages.push(newMessage)
    currentConversation.lastMessage = messageText
    currentConversation.time = "now"

    // Clear input
    input.value = ""

    // Update UI
    loadMessages()
    renderConversations()

    // Simulate doctor response after 2 seconds
    setTimeout(() => {
        const responses = [
            "Thank you for the update. I'll review this information.",
            "I understand. Let me check your medical history.",
            "That's good to hear. Continue with the current treatment.",
            "I'll need to examine this further. Can you schedule an appointment?",
            "Please monitor this and let me know if there are any changes.",
        ]

        const doctorResponse = {
            id: currentConversation.messages.length + 1,
            sender: "doctor",
            text: responses[Math.floor(Math.random() * responses.length)],
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        }

        currentConversation.messages.push(doctorResponse)
        currentConversation.lastMessage = doctorResponse.text
        currentConversation.time = "now"

        loadMessages()
        renderConversations()
    }, 2000)
}

function startNewConversation() {
    alert("Start new conversation functionality would be implemented here")
}

function attachFile() {
    alert("File attachment functionality would be implemented here")
}

function startVideoCall() {
    if (!currentConversation) return

    document.getElementById("videoCallDoctorName").textContent = currentConversation.doctorName
    document.getElementById("videoCallDoctorName2").textContent = currentConversation.doctorName

    const modal = document.getElementById("videoCallModal")
    modal.style.display = "block"
}

function startVoiceCall() {
    if (!currentConversation) return
    alert(`Starting voice call with ${currentConversation.doctorName}`)
}

function viewDoctorProfile() {
    if (!currentConversation) return
    alert(`Viewing profile for ${currentConversation.doctorName}`)
}

function toggleMute() {
    alert("Mute/unmute functionality would be implemented here")
}

function toggleVideo() {
    alert("Video on/off functionality would be implemented here")
}

function endCall() {
    const modal = document.getElementById("videoCallModal")
    modal.style.display = "none"
}

function logout() {
    if (confirm("Are you sure you want to logout?")) {
        localStorage.clear()
        window.location.href = "index.html"
    }
}
