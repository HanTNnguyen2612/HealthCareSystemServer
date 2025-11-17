// Doctor Appointments JavaScript
document.addEventListener("DOMContentLoaded", () => {
    initializeAppointments()
    loadAppointmentTabs()
    setupEventListeners()
})

function initializeAppointments() {
    // Set current date and doctor info
    const doctorName = localStorage.getItem("doctorName") || "Dr. Sarah Johnson"
    document.getElementById("doctorName").textContent = doctorName

    // Load initial tab (pending appointments first)
    loadPendingAppointments()
    updatePendingCount()
}

function loadAppointmentTabs() {
    // Setup tab event listeners
    const tabs = document.querySelectorAll("#appointmentTabs button")
    tabs.forEach((tab) => {
        tab.addEventListener("click", function () {
            const target = this.getAttribute("data-bs-target")
            switch (target) {
                case "#pending":
                    loadPendingAppointments()
                    break
                case "#today":
                    loadTodayAppointments()
                    break
                case "#upcoming":
                    loadUpcomingAppointments()
                    break
                case "#completed":
                    loadCompletedAppointments()
                    break
                case "#cancelled":
                    loadCancelledAppointments()
                    break
            }
        })
    })
}

function loadPendingAppointments() {
    const container = document.getElementById("pendingAppointments")
    if (!container) return

    const appointments = [
        {
            id: 3,
            patient: "Mike Johnson",
            age: 28,
            time: "02:00 PM",
            date: "Today",
            type: "Check-up",
            reason: "Annual physical examination",
            notes: "Routine health screening",
            avatar: "/placeholder.svg?height=60&width=60",
            status: "pending",
            requestedDate: "2 hours ago",
        },
        {
            id: 8,
            patient: "Emma Wilson",
            age: 35,
            time: "03:30 PM",
            date: "Today",
            type: "Consultation",
            reason: "Persistent headaches",
            notes: "Patient requesting urgent consultation",
            avatar: "/placeholder.svg?height=60&width=60",
            status: "pending",
            requestedDate: "1 hour ago",
        },
        {
            id: 9,
            patient: "Alex Thompson",
            age: 42,
            time: "04:00 PM",
            date: "Today",
            type: "Follow-up",
            reason: "Post-surgery check",
            notes: "Follow-up after minor procedure last week",
            avatar: "/placeholder.svg?height=60&width=60",
            status: "pending",
            requestedDate: "30 minutes ago",
        },
        {
            id: 10,
            patient: "Maria Garcia",
            age: 29,
            time: "02:00 PM",
            date: "Tomorrow",
            type: "Consultation",
            reason: "Skin condition evaluation",
            notes: "New patient referral from dermatology",
            avatar: "/placeholder.svg?height=60&width=60",
            status: "pending",
            requestedDate: "3 hours ago",
        },
        {
            id: 11,
            patient: "James Miller",
            age: 48,
            time: "10:00 AM",
            date: "Jan 26, 2024",
            type: "Check-up",
            reason: "Routine physical",
            notes: "Annual health screening",
            avatar: "/placeholder.svg?height=60&width=60",
            status: "pending",
            requestedDate: "Yesterday",
        },
        {
            id: 12,
            patient: "Sophie Davis",
            age: 31,
            time: "11:30 AM",
            date: "Tomorrow",
            type: "Consultation",
            reason: "Chronic fatigue symptoms",
            notes: "Patient experiencing persistent tiredness",
            avatar: "/placeholder.svg?height=60&width=60",
            status: "pending",
            requestedDate: "4 hours ago",
        },
    ]

    container.innerHTML = appointments.map((appointment) => createPendingAppointmentCard(appointment)).join("")
    updatePendingCount()
}

function loadTodayAppointments() {
    const container = document.getElementById("todayAppointments")
    if (!container) return

    const appointments = [
        {
            id: 1,
            patient: "John Doe",
            age: 45,
            time: "09:00 AM",
            type: "Consultation",
            reason: "Chest pain and shortness of breath",
            notes: "Patient reports symptoms started 3 days ago",
            avatar: "/placeholder.svg?height=60&width=60",
            status: "confirmed",
        },
        {
            id: 2,
            patient: "Jane Smith",
            age: 32,
            time: "10:30 AM",
            type: "Follow-up",
            reason: "Hypertension monitoring",
            notes: "Check blood pressure and medication effectiveness",
            avatar: "/placeholder.svg?height=60&width=60",
            status: "confirmed",
        },
    ]

    container.innerHTML = appointments.map((appointment) => createAppointmentCard(appointment)).join("")
}

function loadUpcomingAppointments() {
    const container = document.getElementById("upcomingAppointments")
    if (!container) return

    const appointments = [
        {
            id: 4,
            patient: "Sarah Wilson",
            age: 38,
            time: "09:00 AM",
            date: "Tomorrow",
            type: "Consultation",
            reason: "Migraine headaches",
            notes: "Recurring headaches for past month",
            avatar: "/placeholder.svg?height=60&width=60",
            status: "confirmed",
        },
        {
            id: 5,
            patient: "David Brown",
            age: 52,
            time: "11:00 AM",
            date: "Jan 25, 2024",
            type: "Follow-up",
            reason: "Diabetes management",
            notes: "Review blood sugar logs and adjust medication",
            avatar: "/placeholder.svg?height=60&width=60",
            status: "confirmed",
        },
    ]

    container.innerHTML = appointments.map((appointment) => createAppointmentCard(appointment, true)).join("")
}

function loadCompletedAppointments() {
    const container = document.getElementById("completedAppointments")
    if (!container) return

    const appointments = [
        {
            id: 6,
            patient: "Lisa Anderson",
            age: 29,
            time: "03:00 PM",
            date: "Yesterday",
            type: "Consultation",
            reason: "Anxiety and stress management",
            notes: "Prescribed medication and recommended therapy",
            avatar: "/placeholder.svg?height=60&width=60",
            status: "completed",
        },
    ]

    container.innerHTML = appointments.map((appointment) => createAppointmentCard(appointment, false, true)).join("")
}

function loadCancelledAppointments() {
    const container = document.getElementById("cancelledAppointments")
    if (!container) return

    const appointments = [
        {
            id: 7,
            patient: "Robert Taylor",
            age: 41,
            time: "10:00 AM",
            date: "Jan 18, 2024",
            type: "Check-up",
            reason: "Routine examination",
            notes: "Patient cancelled due to illness",
            avatar: "/placeholder.svg?height=60&width=60",
            status: "cancelled",
        },
    ]

    container.innerHTML = appointments
        .map((appointment) => createAppointmentCard(appointment, false, false, true))
        .join("")
}

function createPendingAppointmentCard(appointment) {
    const dateDisplay = appointment.date || "Today"

    return `
    <div class="appointment-detailed-card pending-appointment">
      <div class="appointment-card-header">
        <div class="appointment-doctor-info">
          <img src="${appointment.avatar}" alt="${appointment.patient}" class="appointment-doctor-avatar">
          <div class="doctor-details">
            <h5>${appointment.patient}</h5>
            <p class="specialty">Age ${appointment.age} • ${appointment.type}</p>
            <div class="doctor-meta">
              <span class="experience">${dateDisplay} at ${appointment.time}</span>
              <span class="text-muted ms-2">• Requested ${appointment.requestedDate}</span>
            </div>
          </div>
        </div>
        <div class="appointment-status">
          <span class="status-badge pending">
            <i class="fas fa-clock me-1"></i>
            Pending Approval
          </span>
        </div>
      </div>
      <div class="appointment-card-body">
        <div class="appointment-reason">
          <h6>Reason for Visit</h6>
          <p>${appointment.reason}</p>
        </div>
        ${appointment.notes
            ? `
            <div class="appointment-notes">
              <h6>Notes</h6>
              <p>${appointment.notes}</p>
            </div>
          `
            : ""
        }
      </div>
      <div class="appointment-card-footer">
        <div class="appointment-actions">
          <button class="btn btn-success" onclick="acceptAppointment(${appointment.id})">
            <i class="fas fa-check me-1"></i> Accept
          </button>
          <button class="btn btn-danger" onclick="rejectAppointment(${appointment.id})">
            <i class="fas fa-times me-1"></i> Reject
          </button>
          <button class="btn btn-outline-info" onclick="viewPatientDetails(${appointment.id})">
            <i class="fas fa-user me-1"></i> Patient Details
          </button>
          <button class="btn btn-outline-secondary" onclick="addNotes(${appointment.id})">
            <i class="fas fa-notes-medical me-1"></i> Add Notes
          </button>
        </div>
      </div>
    </div>
  `
}

function createAppointmentCard(appointment, isUpcoming = false, isCompleted = false, isCancelled = false) {
    const statusClass = appointment.status
    const dateDisplay = appointment.date || "Today"

    let actionButtons = ""
    if (!isCompleted && !isCancelled) {
        actionButtons = `
      <button class="btn btn-sm btn-primary" onclick="startConsultation(${appointment.id})">
        <i class="fas fa-video"></i> Start
      </button>
      <button class="btn btn-sm btn-outline-secondary" onclick="rescheduleAppointment(${appointment.id})">
        <i class="fas fa-calendar"></i> Reschedule
      </button>
      <button class="btn btn-sm btn-outline-info" onclick="addNotes(${appointment.id})">
        <i class="fas fa-notes-medical"></i> Notes
      </button>
    `
    } else if (isCompleted) {
        actionButtons = `
      <button class="btn btn-sm btn-outline-primary" onclick="viewReport(${appointment.id})">
        <i class="fas fa-file-medical"></i> View Report
      </button>
      <button class="btn btn-sm btn-outline-secondary" onclick="scheduleFollowUp(${appointment.id})">
        <i class="fas fa-calendar-plus"></i> Follow-up
      </button>
    `
    }

    return `
    <div class="appointment-detailed-card">
      <div class="appointment-card-header">
        <div class="appointment-doctor-info">
          <img src="${appointment.avatar}" alt="${appointment.patient}" class="appointment-doctor-avatar">
          <div class="doctor-details">
            <h5>${appointment.patient}</h5>
            <p class="specialty">Age ${appointment.age} • ${appointment.type}</p>
            <div class="doctor-meta">
              <span class="experience">${dateDisplay} at ${appointment.time}</span>
            </div>
          </div>
        </div>
        <div class="appointment-status">
          <span class="status-badge ${statusClass}">${appointment.status}</span>
        </div>
      </div>
      <div class="appointment-card-body">
        <div class="appointment-reason">
          <h6>Reason for Visit</h6>
          <p>${appointment.reason}</p>
        </div>
        ${appointment.notes
            ? `
            <div class="appointment-notes">
              <h6>Notes</h6>
              <p>${appointment.notes}</p>
            </div>
          `
            : ""
        }
      </div>
      ${actionButtons
            ? `
          <div class="appointment-card-footer">
            <div class="appointment-actions">
              ${actionButtons}
            </div>
          </div>
        `
            : ""
        }
    </div>
  `
}

function setupEventListeners() {
    // Search functionality
    const searchInput = document.getElementById("searchInput")
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            filterAppointments(e.target.value)
        })
    }
}

function filterAppointments(searchTerm) {
    // Implement appointment filtering
    console.log("Filtering appointments:", searchTerm)
}

function updatePendingCount() {
    // Count pending appointments and update badge
    const pendingContainer = document.getElementById("pendingAppointments")
    if (pendingContainer) {
        const pendingCards = pendingContainer.querySelectorAll(".pending-appointment")
        const count = pendingCards.length
        const badge = document.getElementById("pendingCount")
        if (badge) {
            badge.textContent = count
            badge.style.display = count > 0 ? "inline" : "none"
        }
    }
}

// Action functions
function startConsultation(appointmentId) {
    console.log("Starting consultation:", appointmentId)
    // Implement video consultation
}

function rescheduleAppointment(appointmentId) {
    console.log("Rescheduling appointment:", appointmentId)
    // Show reschedule modal
}

function addNotes(appointmentId) {
    console.log("Adding notes to appointment:", appointmentId)
    // Show notes modal
}

function viewReport(appointmentId) {
    console.log("Viewing report for appointment:", appointmentId)
    // Show report modal or navigate to report page
}

function scheduleFollowUp(appointmentId) {
    console.log("Scheduling follow-up for appointment:", appointmentId)
    openNewAppointmentModal()
}

function viewPatientDetails(appointmentId) {
    console.log("Viewing patient details for appointment:", appointmentId)
    // Show patient details modal
}

function openNewAppointmentModal() {
    const modal = new window.bootstrap.Modal(document.getElementById("newAppointmentModal"))
    modal.show()
}

function scheduleAppointment() {
    const form = document.getElementById("newAppointmentForm")
    const formData = new FormData(form)

    console.log("Scheduling new appointment:", Object.fromEntries(formData))

    window.bootstrap.Modal.getInstance(document.getElementById("newAppointmentModal")).hide()
    showNotification("Appointment scheduled successfully!", "success")
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

function acceptAppointment(appointmentId) {
    if (confirm("Are you sure you want to accept this appointment?")) {
        console.log("Accepting appointment:", appointmentId)

        // Update appointment status in data (simulate API call)
        updateAppointmentStatus(appointmentId, "confirmed")

        // Show success notification
        showNotification("Appointment accepted successfully!", "success")

        // Remove the appointment from pending list
        removeAppointmentFromPending(appointmentId)

        // Update pending count
        updatePendingCount()
    }
}

function rejectAppointment(appointmentId) {
    const reason = prompt("Please provide a reason for rejection (optional):")

    if (confirm("Are you sure you want to reject this appointment?")) {
        console.log("Rejecting appointment:", appointmentId, "Reason:", reason)

        // Update appointment status in data (simulate API call)
        updateAppointmentStatus(appointmentId, "rejected", reason)

        // Show success notification
        showNotification("Appointment rejected successfully!", "info")

        // Remove the appointment from pending list
        removeAppointmentFromPending(appointmentId)

        // Update pending count
        updatePendingCount()
    }
}

function updateAppointmentStatus(appointmentId, newStatus, reason = null) {
    // Simulate API call to update appointment status
    console.log("Updating appointment status:", {
        appointmentId,
        newStatus,
        reason,
        timestamp: new Date().toISOString(),
    })

    // In a real application, this would make an API call
    // For now, we'll just log the action
}

function removeAppointmentFromPending(appointmentId) {
    const appointmentCard = document.querySelector(
        `[onclick*="acceptAppointment(${appointmentId})"], [onclick*="rejectAppointment(${appointmentId})"]`,
    )
    if (appointmentCard) {
        const card = appointmentCard.closest(".appointment-detailed-card")
        if (card) {
            card.style.transition = "opacity 0.3s ease"
            card.style.opacity = "0"
            setTimeout(() => {
                card.remove()
                updatePendingCount()
            }, 300)
        }
    }
}

function reloadCurrentTab() {
    // Get the currently active tab
    const activeTab = document.querySelector("#appointmentTabs .nav-link.active")
    if (!activeTab) return

    const target = activeTab.getAttribute("data-bs-target")
    switch (target) {
        case "#pending":
            loadPendingAppointments()
            break
        case "#today":
            loadTodayAppointments()
            break
        case "#upcoming":
            loadUpcomingAppointments()
            break
        case "#completed":
            loadCompletedAppointments()
            break
        case "#cancelled":
            loadCancelledAppointments()
            break
    }
}
