// Calendar functionality
document.addEventListener("DOMContentLoaded", () => {
    updateUserInfo()
    initializeCalendar()
    loadTodayAppointments()
    loadWeekAppointments()
})

const currentDate = new Date()
let currentView = "month"

function updateUserInfo() {
    const userName = localStorage.getItem("userName") || "John Doe"
    document.getElementById("userName").textContent = userName
}

function initializeCalendar() {
    updateCalendarTitle()
    renderCalendar()
}

function updateCalendarTitle() {
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

    document.getElementById("calendarTitle").textContent =
        `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`
}

function renderCalendar() {
    const container = document.getElementById("calendarGrid")
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const daysInPrevMonth = new Date(year, month, 0).getDate()

    const appointmentDates = [15, 20, 25, 28] // Mock appointment dates

    let calendarHTML = `
    <div class="calendar-day-header">Sun</div>
    <div class="calendar-day-header">Mon</div>
    <div class="calendar-day-header">Tue</div>
    <div class="calendar-day-header">Wed</div>
    <div class="calendar-day-header">Thu</div>
    <div class="calendar-day-header">Fri</div>
    <div class="calendar-day-header">Sat</div>
  `

    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
        const day = daysInPrevMonth - i
        calendarHTML += `<div class="calendar-day other-month">${day}</div>`
    }

    // Current month days
    const today = new Date()
    for (let day = 1; day <= daysInMonth; day++) {
        const isToday = today.getDate() === day && today.getMonth() === month && today.getFullYear() === year
        const hasAppointment = appointmentDates.includes(day)

        let classes = "calendar-day"
        if (isToday) classes += " today"
        if (hasAppointment) classes += " has-appointment"

        let appointmentInfo = ""
        if (hasAppointment) {
            appointmentInfo = `
        <div class="appointment-dot"></div>
        <div class="appointment-preview">
          <small>Dr. Johnson</small>
          <small>2:00 PM</small>
        </div>
      `
        }

        calendarHTML += `
      <div class="${classes}" onclick="selectDate(${day})">
        <span class="day-number">${day}</span>
        ${appointmentInfo}
      </div>
    `
    }

    // Next month days
    const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7
    const remainingCells = totalCells - (firstDay + daysInMonth)
    for (let day = 1; day <= remainingCells; day++) {
        calendarHTML += `<div class="calendar-day other-month">${day}</div>`
    }

    container.innerHTML = calendarHTML
}

function loadTodayAppointments() {
    const appointments = [
        {
            time: "2:00 PM",
            doctor: "Dr. Sarah Johnson",
            specialty: "Cardiology",
            type: "In-Person",
        },
        {
            time: "4:30 PM",
            doctor: "Dr. Michael Chen",
            specialty: "Dermatology",
            type: "Video Call",
        },
    ]

    const container = document.getElementById("todayAppointments")
    if (appointments.length === 0) {
        container.innerHTML = '<p class="text-muted">No appointments today</p>'
    } else {
        container.innerHTML = appointments
            .map(
                (apt) => `
      <div class="appointment-item small">
        <div class="appointment-time-small">
          <strong>${apt.time}</strong>
        </div>
        <div class="appointment-details-small">
          <h6>${apt.doctor}</h6>
          <p>${apt.specialty} • ${apt.type}</p>
        </div>
      </div>
    `,
            )
            .join("")
    }
}

function loadWeekAppointments() {
    const appointments = [
        {
            date: "Tomorrow",
            time: "10:30 AM",
            doctor: "Dr. Emily Davis",
            specialty: "General Medicine",
        },
        {
            date: "Thursday",
            time: "3:15 PM",
            doctor: "Dr. Robert Wilson",
            specialty: "Neurology",
        },
        {
            date: "Friday",
            time: "11:00 AM",
            doctor: "Dr. Lisa Anderson",
            specialty: "Orthopedics",
        },
    ]

    const container = document.getElementById("weekAppointments")
    container.innerHTML = appointments
        .map(
            (apt) => `
    <div class="appointment-item small">
      <div class="appointment-date-small">
        <strong>${apt.date}</strong>
        <small>${apt.time}</small>
      </div>
      <div class="appointment-details-small">
        <h6>${apt.doctor}</h6>
        <p>${apt.specialty}</p>
      </div>
    </div>
  `,
        )
        .join("")
}

function setCalendarView(view) {
    currentView = view

    // Update button states
    document.querySelectorAll(".calendar-view-options .btn").forEach((btn) => {
        btn.classList.remove("active")
    })
    event.target.classList.add("active")

    // Re-render calendar based on view
    renderCalendar()
}

function previousPeriod() {
    if (currentView === "month") {
        currentDate.setMonth(currentDate.getMonth() - 1)
    } else if (currentView === "week") {
        currentDate.setDate(currentDate.getDate() - 7)
    } else {
        currentDate.setDate(currentDate.getDate() - 1)
    }
    updateCalendarTitle()
    renderCalendar()
}

function nextPeriod() {
    if (currentView === "month") {
        currentDate.setMonth(currentDate.getMonth() + 1)
    } else if (currentView === "week") {
        currentDate.setDate(currentDate.getDate() + 7)
    } else {
        currentDate.setDate(currentDate.getDate() + 1)
    }
    updateCalendarTitle()
    renderCalendar()
}

function goToToday() {
    currentDate.setTime(new Date().getTime())
    updateCalendarTitle()
    renderCalendar()
}

function selectDate(day) {
    const selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    alert(
        `Selected date: ${selectedDate.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        })}`,
    )
}

function bookAppointment() {
    alert("Appointment booking functionality would be implemented here")
}

function logout() {
    if (confirm("Are you sure you want to logout?")) {
        localStorage.clear()
        window.location.href = "index.html"
    }
}
