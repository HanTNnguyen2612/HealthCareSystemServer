// Dashboard functionality
document.addEventListener("DOMContentLoaded", () => {
    updateUserInfo()
    loadUpcomingAppointments()
    loadAppointmentHistory()
    initializeMiniCalendar()
    loadTodaySchedule()
})

const currentDate = new Date()

function updateUserInfo() {
    const userName = localStorage.getItem("userName") || "John Doe"
    document.getElementById("userName").textContent = userName
}

function loadUpcomingAppointments() {
    const appointments = [
        {
            doctor: "Dr. Sarah Johnson",
            specialty: "Cardiology",
            date: "Today",
            time: "2:00 PM",
            avatar: "/placeholder.svg?height=40&width=40",
        },
        {
            doctor: "Dr. Michael Chen",
            specialty: "Dermatology",
            date: "Tomorrow",
            time: "10:30 AM",
            avatar: "/placeholder.svg?height=40&width=40",
        },
        {
            doctor: "Dr. Emily Davis",
            specialty: "General Medicine",
            date: "Dec 28",
            time: "3:15 PM",
            avatar: "/placeholder.svg?height=40&width=40",
        },
    ]

    const container = document.getElementById("upcomingAppointments")
    container.innerHTML = appointments
        .map(
            (apt) => `
    <div class="appointment-item">
      <img src="${apt.avatar}" alt="${apt.doctor}" class="appointment-avatar">
      <div class="appointment-info">
        <h6>${apt.doctor}</h6>
        <p>${apt.specialty}</p>
      </div>
      <div class="appointment-time">
        <div class="appointment-date">${apt.date}</div>
        <div class="appointment-slot">${apt.time}</div>
      </div>
    </div>
  `,
        )
        .join("")
}

function loadAppointmentHistory() {
    const history = [
        {
            date: "Dec 20, 2023",
            doctor: "Dr. Sarah Johnson",
            specialty: "Cardiology",
            status: "completed",
        },
        {
            date: "Dec 15, 2023",
            doctor: "Dr. Michael Chen",
            specialty: "Dermatology",
            status: "completed",
        },
        {
            date: "Dec 10, 2023",
            doctor: "Dr. Emily Davis",
            specialty: "General Medicine",
            status: "completed",
        },
        {
            date: "Dec 5, 2023",
            doctor: "Dr. Robert Wilson",
            specialty: "Neurology",
            status: "cancelled",
        },
        {
            date: "Nov 28, 2023",
            doctor: "Dr. Lisa Anderson",
            specialty: "Orthopedics",
            status: "completed",
        },
    ]

    const container = document.getElementById("appointmentHistory")
    container.innerHTML = history
        .map(
            (item) => `
    <tr>
      <td>${item.date}</td>
      <td>${item.doctor}</td>
      <td>${item.specialty}</td>
      <td><span class="status-badge ${item.status}">${item.status}</span></td>
      <td>
        <button class="btn btn-sm btn-outline-primary">View Details</button>
      </td>
    </tr>
  `,
        )
        .join("")
}

function initializeMiniCalendar() {
    updateMiniCalendarTitle()
    renderMiniCalendar()
}

function updateMiniCalendarTitle() {
    const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ]

    document.getElementById("calendarMonthYear").textContent =
        `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`
}

function renderMiniCalendar() {
    const container = document.getElementById("calendarMiniGrid")
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const daysInPrevMonth = new Date(year, month, 0).getDate()

    const appointmentDates = [15, 20, 25, 28] // Mock appointment dates

    let calendarHTML = `
    <div class="calendar-mini-day-header">S</div>
    <div class="calendar-mini-day-header">M</div>
    <div class="calendar-mini-day-header">T</div>
    <div class="calendar-mini-day-header">W</div>
    <div class="calendar-mini-day-header">T</div>
    <div class="calendar-mini-day-header">F</div>
    <div class="calendar-mini-day-header">S</div>
  `

    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
        const day = daysInPrevMonth - i
        calendarHTML += `<div class="calendar-mini-day other-month">${day}</div>`
    }

    // Current month days
    const today = new Date()
    for (let day = 1; day <= daysInMonth; day++) {
        const isToday = today.getDate() === day && today.getMonth() === month && today.getFullYear() === year
        const hasAppointment = appointmentDates.includes(day)

        let classes = "calendar-mini-day"
        if (isToday) classes += " today"
        if (hasAppointment) classes += " has-appointment"

        calendarHTML += `<div class="${classes}" onclick="selectMiniDate(${day})">${day}</div>`
    }

    // Next month days
    const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7
    const remainingCells = totalCells - (firstDay + daysInMonth)
    for (let day = 1; day <= remainingCells; day++) {
        calendarHTML += `<div class="calendar-mini-day other-month">${day}</div>`
    }

    container.innerHTML = calendarHTML
}

function loadTodaySchedule() {
    const todayAppointments = [
        {
            time: "2:00 PM",
            doctor: "Dr. Sarah Johnson",
            specialty: "Cardiology",
            type: "Check-up",
        },
        {
            time: "4:30 PM",
            doctor: "Dr. Michael Chen",
            specialty: "Dermatology",
            type: "Follow-up",
        },
    ]

    const container = document.getElementById("todaySchedule")

    if (todayAppointments.length === 0) {
        container.innerHTML = `
      <div class="no-appointments">
        <i class="fas fa-calendar-check"></i>
        <div>No appointments today</div>
      </div>
    `
    } else {
        container.innerHTML = todayAppointments
            .map(
                (apt) => `
      <div class="schedule-item">
        <div class="schedule-time">${apt.time}</div>
        <div class="schedule-details">
          <h6>${apt.doctor}</h6>
          <p>${apt.specialty} • ${apt.type}</p>
        </div>
      </div>
    `,
            )
            .join("")
    }
}

function previousMonth() {
    currentDate.setMonth(currentDate.getMonth() - 1)
    updateMiniCalendarTitle()
    renderMiniCalendar()
}

function nextMonth() {
    currentDate.setMonth(currentDate.getMonth() + 1)
    updateMiniCalendarTitle()
    renderMiniCalendar()
}

function selectMiniDate(day) {
    const selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    console.log("Selected date:", selectedDate)
    // You can add functionality here to show appointments for the selected date
}

function logout() {
    if (confirm("Are you sure you want to logout?")) {
        localStorage.clear()
        window.location.href = "Home/Index"
    }
}
