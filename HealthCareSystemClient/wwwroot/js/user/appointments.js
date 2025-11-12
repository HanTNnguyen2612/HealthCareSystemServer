// Appointments functionality
document.addEventListener("DOMContentLoaded", () => {
    updateUserInfo()
    loadAppointments()
    setupAppointmentForm()
})

function updateUserInfo() {
    const userName = localStorage.getItem("userName") || "John Doe"
    document.getElementById("userName").textContent = userName
}

const appointments = [
    {
        id: 1,
        date: "2024-01-20",
        time: "10:00 AM",
        doctor: "Dr. Michael Chen",
        specialty: "Dermatology",
        type: "In-Person",
        status: "upcoming",
        reason: "Skin rash examination",
        avatar: "/placeholder.svg?height=40&width=40",
    },
    {
        id: 2,
        date: "2024-01-25",
        time: "2:00 PM",
        doctor: "Dr. Emily Davis",
        specialty: "General Medicine",
        type: "Video Call",
        status: "upcoming",
        reason: "Annual checkup",
        avatar: "/placeholder.svg?height=40&width=40",
    },
    {
        id: 3,
        date: "2024-01-30",
        time: "11:00 AM",
        doctor: "Dr. Sarah Johnson",
        specialty: "Cardiology",
        type: "In-Person",
        status: "upcoming",
        reason: "Heart palpitations",
        avatar: "/placeholder.svg?height=40&width=40",
    },
    {
        id: 4,
        date: "2024-01-15",
        time: "9:00 AM",
        doctor: "Dr. Sarah Johnson",
        specialty: "Cardiology",
        type: "In-Person",
        status: "completed",
        reason: "Follow-up consultation",
        avatar: "/placeholder.svg?height=40&width=40",
    },
    {
        id: 5,
        date: "2024-01-10",
        time: "3:00 PM",
        doctor: "Dr. Robert Wilson",
        specialty: "Neurology",
        type: "Video Call",
        status: "completed",
        reason: "Headache consultation",
        avatar: "/placeholder.svg?height=40&width=40",
    },
]

const doctors = [
    { id: 1, name: "Dr. Sarah Johnson", specialty: "Cardiology" },
    { id: 2, name: "Dr. Michael Chen", specialty: "Dermatology" },
    { id: 3, name: "Dr. Emily Davis", specialty: "General Medicine" },
    { id: 4, name: "Dr. Robert Wilson", specialty: "Neurology" },
    { id: 5, name: "Dr. Lisa Martinez", specialty: "Pediatrics" },
    { id: 6, name: "Dr. James Thompson", specialty: "Orthopedics" },
]

function loadAppointments() {
    loadUpcomingAppointments()
    loadPastAppointments()
    loadCancelledAppointments()
}

function loadUpcomingAppointments() {
    const container = document.getElementById("upcomingAppointments")
    const upcomingAppts = appointments.filter((apt) => apt.status === "upcoming")

    container.innerHTML = upcomingAppts.map((appointment) => createAppointmentCard(appointment)).join("")
}

function loadPastAppointments() {
    const container = document.getElementById("pastAppointments")
    const pastAppts = appointments.filter((apt) => apt.status === "completed")

    container.innerHTML = pastAppts.map((appointment) => createAppointmentCard(appointment)).join("")
}

function loadCancelledAppointments() {
    const container = document.getElementById("cancelledAppointments")
    const cancelledAppts = appointments.filter((apt) => apt.status === "cancelled")

    if (cancelledAppts.length === 0) {
        container.innerHTML = '<div class="text-center text-muted py-4">No cancelled appointments</div>'
    } else {
        container.innerHTML = cancelledAppts.map((appointment) => createAppointmentCard(appointment)).join("")
    }
}

function createAppointmentCard(appointment) {
    const statusBadge = getStatusBadge(appointment.status)
    const actionButtons = getActionButtons(appointment)

    return `
    <div class="appointment-item">
      <img src="${appointment.avatar}" alt="${appointment.doctor}" class="appointment-avatar">
      <div class="appointment-info">
        <h6>${appointment.doctor}</h6>
      </div>
      <div>
        <p style="margin :0; margin-bottom: 5px;">${appointment.specialty} </p>
      </div>
      <div>
        <p style="margin :0; margin-bottom: 5px;>${appointment.type}</p>
      </div>
      <div>
        <p style="margin :0; margin-bottom: 5px;>${appointment.reason}</p>
      </div>
      <div class="appointment-time">
        <div class="appointment-date">${appointment.date}</div>
        <div class="appointment-slot">${appointment.time}</div>
        ${statusBadge}
      </div>
      <div class="appointment-actions">
        ${actionButtons}
      </div>
    </div>
  `
}

function getStatusBadge(status) {
    const badges = {
        upcoming: '<span class="badge bg-primary">Upcoming</span>',
        completed: '<span class="badge bg-success">Completed</span>',
        cancelled: '<span class="badge bg-danger">Cancelled</span>',
    }
    return badges[status] || ""
}

function getActionButtons(appointment) {
    if (appointment.status === "upcoming") {
        return `
      <button class="btn btn-sm btn-outline-primary" onclick="viewAppointmentDetails(${appointment.id})">Details</button>
      <button class="btn btn-sm btn-outline-warning" onclick="rescheduleAppointment(${appointment.id})">Reschedule</button>
      <button class="btn btn-sm btn-outline-danger" onclick="cancelAppointment(${appointment.id})">Cancel</button>
    `
    } else if (appointment.status === "completed") {
        return `
      <button class="btn btn-sm btn-outline-primary" onclick="viewAppointmentDetails(${appointment.id})">View Report</button>
      <button class="btn btn-sm btn-outline-success" onclick="bookFollowUp('${appointment.doctor}')">Book Follow-up</button>
    `
    }
    return `<button class="btn btn-sm btn-outline-primary" onclick="viewAppointmentDetails(${appointment.id})">Details</button>`
}

function setupAppointmentForm() {
    const specialtySelect = document.getElementById("specialty")
    const doctorSelect = document.getElementById("doctor")
    const dateInput = document.getElementById("appointmentDate")
    const timeSelect = document.getElementById("appointmentTime")

    // Set minimum date to today
    const today = new Date().toISOString().split("T")[0]
    dateInput.min = today

    // Handle specialty change
    specialtySelect.addEventListener("change", function () {
        updateDoctorOptions(this.value)
    })

    // Handle date change
    dateInput.addEventListener("change", function () {
        updateTimeSlots(this.value)
    })
}

function updateDoctorOptions(specialty) {
    const doctorSelect = document.getElementById("doctor")
    doctorSelect.innerHTML = '<option value="">Select Doctor</option>'

    const filteredDoctors = doctors.filter(
        (doctor) => !specialty || doctor.specialty.toLowerCase().includes(specialty.toLowerCase()),
    )

    filteredDoctors.forEach((doctor) => {
        const option = document.createElement("option")
        option.value = doctor.name
        option.textContent = doctor.name
        doctorSelect.appendChild(option)
    })
}

function updateTimeSlots(date) {
    const timeSelect = document.getElementById("appointmentTime")
    timeSelect.innerHTML = '<option value="">Select Time</option>'

    // Generate time slots (9 AM to 5 PM)
    const timeSlots = [
        "9:00 AM",
        "9:30 AM",
        "10:00 AM",
        "10:30 AM",
        "11:00 AM",
        "11:30 AM",
        "2:00 PM",
        "2:30 PM",
        "3:00 PM",
        "3:30 PM",
        "4:00 PM",
        "4:30 PM",
        "5:00 PM",
    ]

    timeSlots.forEach((time) => {
        const option = document.createElement("option")
        option.value = time
        option.textContent = time
        timeSelect.appendChild(option)
    })
}

function bookAppointment() {
    const specialty = document.getElementById("specialty").value
    const doctor = document.getElementById("doctor").value
    const date = document.getElementById("appointmentDate").value
    const time = document.getElementById("appointmentTime").value
    const reason = document.getElementById("reason").value
    const type = document.getElementById("appointmentType").value

    if (!specialty || !doctor || !date || !time || !type) {
        alert("Please fill in all required fields")
        return
    }

    // Create new appointment
    const newAppointment = {
        id: appointments.length + 1,
        date: date,
        time: time,
        doctor: doctor,
        specialty: specialty.charAt(0).toUpperCase() + specialty.slice(1),
        type: type === "in-person" ? "In-Person" : type === "video" ? "Video Call" : "Phone Call",
        status: "upcoming",
        reason: reason || "General consultation",
        avatar: "/placeholder.svg?height=40&width=40",
    }

    appointments.unshift(newAppointment)

    // Close modal and refresh appointments
    const modalElement = document.getElementById("bookAppointmentModal")
    const modal = new bootstrap.Modal(modalElement)
    modal.hide()

    // Reset form
    document.getElementById("bookAppointmentForm").reset()

    // Reload appointments
    loadAppointments()

    // Show success message
    alert("Appointment booked successfully!")
}

function viewAppointmentDetails(appointmentId) {
    const appointment = appointments.find((apt) => apt.id === appointmentId)
    if (!appointment) return

    alert(
        `Appointment Details:\nDoctor: ${appointment.doctor}\nDate: ${appointment.date}\nTime: ${appointment.time}\nReason: ${appointment.reason}`,
    )
}

function rescheduleAppointment(appointmentId) {
    alert("Reschedule functionality would be implemented here")
}

function cancelAppointment(appointmentId) {
    if (confirm("Are you sure you want to cancel this appointment?")) {
        const appointment = appointments.find((apt) => apt.id === appointmentId)
        if (appointment) {
            appointment.status = "cancelled"
            loadAppointments()
            alert("Appointment cancelled successfully")
        }
    }
}

function bookFollowUp(doctorName) {
    localStorage.setItem("recommendedDoctor", doctorName)
    const modalElement = document.getElementById("bookAppointmentModal")
    const modal = new bootstrap.Modal(modalElement)
    modal.show()
}

function logout() {
    if (confirm("Are you sure you want to logout?")) {
        localStorage.clear()
        window.location.href = "index.html"
    }
}
