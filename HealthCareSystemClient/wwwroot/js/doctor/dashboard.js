// Doctor Dashboard JavaScript
document.addEventListener("DOMContentLoaded", () => {
    initializeDashboard()
    loadTodaySchedule()
    loadRecentPatients()
    loadUrgentNotifications()
    setupEventListeners()
})

function initializeDashboard() {
    // Set current date
    const today = new Date()
    const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" }
    const currentDateElement = document.getElementById("currentDate")
    if (currentDateElement) {
        currentDateElement.textContent = today.toLocaleDateString("en-US", options)
    }

    // Update doctor name from localStorage or default
    const doctorName = localStorage.getItem("doctorName") || "Dr. Sarah Johnson"
    document.getElementById("doctorName").textContent = doctorName
}

function loadTodaySchedule() {
    const scheduleContainer = document.getElementById("todaySchedule")
    if (!scheduleContainer) return

    const todayAppointments = [
        {
            id: 1,
            time: "09:00",
            patient: "John Doe",
            type: "Consultation",
            avatar: "/placeholder.svg?height=40&width=40",
            status: "confirmed",
        },
        {
            id: 2,
            time: "10:30",
            patient: "Jane Smith",
            type: "Follow-up",
            avatar: "/placeholder.svg?height=40&width=40",
            status: "confirmed",
        },
        {
            id: 3,
            time: "14:00",
            patient: "Mike Johnson",
            type: "Check-up",
            avatar: "/placeholder.svg?height=40&width=40",
            status: "pending",
        },
        {
            id: 4,
            time: "15:30",
            patient: "Sarah Wilson",
            type: "Consultation",
            avatar: "/placeholder.svg?height=40&width=40",
            status: "confirmed",
        },
    ]

    scheduleContainer.innerHTML = todayAppointments
        .map(
            (appointment) => `
        <div class="appointment-item small">
            <div class="appointment-time-small">
                <strong>${appointment.time}</strong>
            </div>
            <img src="${appointment.avatar}" alt="${appointment.patient}" class="appointment-avatar">
            <div class="appointment-details-small">
                <h6>${appointment.patient}</h6>
                <p>${appointment.type}</p>
            </div>
            <div class="appointment-actions">
                <button class="btn btn-sm btn-outline-primary" onclick="startConsultation(${appointment.id})">
                    <i class="fas fa-video"></i>
                </button>
                <button class="btn btn-sm btn-outline-secondary" onclick="viewPatient(${appointment.id})">
                    <i class="fas fa-user"></i>
                </button>
            </div>
        </div>
    `,
        )
        .join("")
}

function loadRecentPatients() {
    const patientsContainer = document.getElementById("recentPatients")
    if (!patientsContainer) return

    const recentPatients = [
        {
            id: 1,
            name: "Emily Davis",
            age: 34,
            condition: "Hypertension",
            lastVisit: "2 days ago",
            avatar: "/placeholder.svg?height=40&width=40",
            status: "active",
        },
        {
            id: 2,
            name: "Robert Brown",
            age: 56,
            condition: "Diabetes",
            lastVisit: "1 week ago",
            avatar: "/placeholder.svg?height=40&width=40",
            status: "follow-up",
        },
        {
            id: 3,
            name: "Lisa Anderson",
            age: 28,
            condition: "Anxiety",
            lastVisit: "3 days ago",
            avatar: "/placeholder.svg?height=40&width=40",
            status: "active",
        },
    ]

    patientsContainer.innerHTML = recentPatients
        .map(
            (patient) => `
        <div class="patient-list-item" onclick="viewPatientDetails(${patient.id})">
            <img src="${patient.avatar}" alt="${patient.name}" class="patient-list-avatar">
            <div class="patient-list-info">
                <h6>${patient.name}</h6>
                <p>${patient.condition} • Age ${patient.age}</p>
                <small>Last visit: ${patient.lastVisit}</small>
            </div>
            <span class="patient-list-status ${patient.status}">${patient.status}</span>
        </div>
    `,
        )
        .join("")
}

function loadUrgentNotifications() {
    const notificationsContainer = document.getElementById("urgentNotifications")
    if (!notificationsContainer) return

    const notifications = [
        {
            id: 1,
            type: "critical",
            icon: "fas fa-exclamation-triangle",
            title: "Critical Lab Results",
            message: "John Doe - Immediate attention required",
            time: "5 min ago",
        },
        {
            id: 2,
            type: "warning",
            icon: "fas fa-clock",
            title: "Appointment Reminder",
            message: "Jane Smith appointment in 30 minutes",
            time: "10 min ago",
        },
        {
            id: 3,
            type: "info",
            icon: "fas fa-envelope",
            title: "New Message",
            message: "Mike Johnson sent a message",
            time: "15 min ago",
        },
    ]

    notificationsContainer.innerHTML = notifications
        .map(
            (notification) => `
        <div class="notification-item ${notification.type}">
            <div class="notification-icon ${notification.type}">
                <i class="${notification.icon}"></i>
            </div>
            <div class="notification-content">
                <h6>${notification.title}</h6>
                <p>${notification.message}</p>
                <small>${notification.time}</small>
            </div>
        </div>
    `,
        )
        .join("")
}

function setupEventListeners() {
    // Search functionality
    const searchInput = document.getElementById("searchInput")
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            // Implement search functionality
            console.log("Searching for:", e.target.value)
        })
    }
}

// Modal functions
function openNewAppointmentModal() {
    const modal = new window.bootstrap.Modal(document.getElementById("newAppointmentModal"))
    modal.show()
}

function scheduleAppointment() {
    const form = document.getElementById("newAppointmentForm")
    const formData = new FormData(form)

    // Simulate API call
    console.log("Scheduling appointment:", Object.fromEntries(formData))

    // Close modal and show success message
    window.bootstrap.Modal.getInstance(document.getElementById("newAppointmentModal")).hide()
    showNotification("Appointment scheduled successfully!", "success")
}

// Action functions
function startConsultation(appointmentId) {
    console.log("Starting consultation for appointment:", appointmentId)
    // Implement video consultation logic
}

function viewPatient(patientId) {
    console.log("Viewing patient:", patientId)
    window.location.href = `doctor-patients.html?id=${patientId}`
}

function viewPatientDetails(patientId) {
    console.log("Viewing patient details:", patientId)
    window.location.href = `doctor-patients.html?id=${patientId}`
}

// Utility functions
function showNotification(message, type = "info") {
    // Create and show notification
    const notification = document.createElement("div")
    notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`
    notification.style.cssText = "top: 20px; right: 20px; z-index: 9999;"
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `
    document.body.appendChild(notification)

    // Auto remove after 3 seconds
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
