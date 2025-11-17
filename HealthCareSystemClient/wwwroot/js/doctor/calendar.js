// Doctor Calendar JavaScript
let currentDate = new Date()
let currentView = "month"
const bootstrap = window.bootstrap // Declare the bootstrap variable

document.addEventListener("DOMContentLoaded", () => {
    initializeCalendar()
    loadCalendar()
    loadTodaySchedule()
    loadUpcomingAppointments()
    setupEventListeners()
})

function initializeCalendar() {
    const doctorName = localStorage.getItem("doctorName") || "Dr. Sarah Johnson"
    document.getElementById("doctorName").textContent = doctorName

    updateCurrentMonth()
    updateTodayDate()
}

function updateCurrentMonth() {
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

    const monthYear = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`
    document.getElementById("currentMonth").textContent = monthYear
}

function updateTodayDate() {
    const today = new Date()
    const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" }
    document.getElementById("todayDate").textContent = today.toLocaleDateString("en-US", options)
}

function loadCalendar() {
    const calendarBody = document.getElementById("calendarBody")
    if (!calendarBody) return

    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    // Sample appointments data
    const appointments = getAppointmentsForMonth(year, month)

    let calendarHTML = ""
    let dayCount = 1

    // Create 6 weeks (42 days) for the calendar
    for (let week = 0; week < 6; week++) {
        for (let day = 0; day < 7; day++) {
            const cellIndex = week * 7 + day
            let cellContent = ""
            let cellClass = "calendar-cell"

            if (cellIndex < startingDayOfWeek) {
                // Previous month days
                const prevMonth = new Date(year, month - 1, 0)
                const prevDay = prevMonth.getDate() - (startingDayOfWeek - cellIndex - 1)
                cellContent = `<div class="calendar-date">${prevDay}</div>`
                cellClass += " other-month"
            } else if (dayCount <= daysInMonth) {
                // Current month days
                const isToday = isDateToday(year, month, dayCount)
                const dayAppointments = appointments.filter((apt) => apt.day === dayCount)

                cellContent = `<div class="calendar-date">${dayCount}</div>`

                if (isToday) {
                    cellClass += " today"
                }

                if (dayAppointments.length > 0) {
                    cellClass += " has-appointments"
                    cellContent += '<div class="calendar-appointments">'
                    dayAppointments.slice(0, 3).forEach((apt) => {
                        cellContent += `<div class="calendar-appointment">${apt.time} ${apt.patient}</div>`
                    })
                    if (dayAppointments.length > 3) {
                        cellContent += `<div class="calendar-appointment">+${dayAppointments.length - 3} more</div>`
                    }
                    cellContent += "</div>"
                }

                dayCount++
            } else {
                // Next month days
                const nextDay = dayCount - daysInMonth
                cellContent = `<div class="calendar-date">${nextDay}</div>`
                cellClass += " other-month"
                dayCount++
            }

            calendarHTML += `<div class="${cellClass}" onclick="selectDate(${year}, ${month}, ${dayCount - 1})">${cellContent}</div>`
        }
    }

    calendarBody.innerHTML = calendarHTML
}

function getAppointmentsForMonth(year, month) {
    // Sample appointments data
    return [
        { day: 20, time: "09:00", patient: "John Doe", type: "Consultation" },
        { day: 20, time: "10:30", patient: "Jane Smith", type: "Follow-up" },
        { day: 20, time: "14:00", patient: "Mike Johnson", type: "Check-up" },
        { day: 22, time: "09:00", patient: "Sarah Wilson", type: "Consultation" },
        { day: 22, time: "11:00", patient: "David Brown", type: "Follow-up" },
        { day: 25, time: "10:00", patient: "Lisa Anderson", type: "Consultation" },
        { day: 28, time: "15:00", patient: "Robert Taylor", type: "Check-up" },
    ]
}

function isDateToday(year, month, day) {
    const today = new Date()
    return year === today.getFullYear() && month === today.getMonth() && day === today.getDate()
}

function loadTodaySchedule() {
    const container = document.getElementById("todayScheduleList")
    if (!container) return

    const todayAppointments = [
        {
            time: "09:00 AM",
            patient: "John Doe",
            type: "Consultation",
            status: "confirmed",
        },
        {
            time: "10:30 AM",
            patient: "Jane Smith",
            type: "Follow-up",
            status: "confirmed",
        },
        {
            time: "02:00 PM",
            patient: "Mike Johnson",
            type: "Check-up",
            status: "pending",
        },
        {
            time: "03:30 PM",
            patient: "Sarah Wilson",
            type: "Consultation",
            status: "confirmed",
        },
    ]

    if (todayAppointments.length === 0) {
        container.innerHTML =
            '<div class="no-appointments"><i class="fas fa-calendar-day"></i><p>No appointments today</p></div>'
        return
    }

    container.innerHTML = todayAppointments
        .map(
            (appointment) => `
        <div class="schedule-item">
            <div class="schedule-time">${appointment.time}</div>
            <div class="schedule-details">
                <h6>${appointment.patient}</h6>
                <p>${appointment.type}</p>
            </div>
        </div>
    `,
        )
        .join("")
}

function loadUpcomingAppointments() {
    const container = document.getElementById("upcomingAppointments")
    if (!container) return

    const upcomingAppointments = [
        {
            date: "Tomorrow",
            time: "09:00 AM",
            patient: "Emily Davis",
            type: "Consultation",
        },
        {
            date: "Jan 25",
            time: "10:00 AM",
            patient: "Robert Brown",
            type: "Follow-up",
        },
        {
            date: "Jan 28",
            time: "03:00 PM",
            patient: "Lisa Anderson",
            type: "Check-up",
        },
    ]

    container.innerHTML = upcomingAppointments
        .map(
            (appointment) => `
        <div class="schedule-item">
            <div class="schedule-time">${appointment.date}<br><small>${appointment.time}</small></div>
            <div class="schedule-details">
                <h6>${appointment.patient}</h6>
                <p>${appointment.type}</p>
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
            filterAppointments(e.target.value)
        })
    }
}

// Navigation functions
function previousMonth() {
    currentDate.setMonth(currentDate.getMonth() - 1)
    updateCurrentMonth()
    loadCalendar()
}

function nextMonth() {
    currentDate.setMonth(currentDate.getMonth() + 1)
    updateCurrentMonth()
    loadCalendar()
}

function goToToday() {
    currentDate = new Date()
    updateCurrentMonth()
    loadCalendar()
}

function setCalendarView(view) {
    currentView = view

    // Update active button
    document.querySelectorAll(".calendar-view-options .btn").forEach((btn) => {
        btn.classList.remove("active")
    })
    event.target.classList.add("active")

    console.log("Calendar view changed to:", view)
    // Implement different view logic here
}

function selectDate(year, month, day) {
    console.log("Selected date:", year, month, day)
    // Implement date selection logic
}

function filterAppointments(searchTerm) {
    console.log("Filtering appointments:", searchTerm)
    // Implement appointment filtering
}

// Modal functions
function openNewAppointmentModal() {
    const modal = new bootstrap.Modal(document.getElementById("newAppointmentModal"))
    modal.show()
}

function scheduleAppointment() {
    const form = document.getElementById("newAppointmentForm")
    const formData = new FormData(form)

    console.log("Scheduling appointment:", Object.fromEntries(formData))

    bootstrap.Modal.getInstance(document.getElementById("newAppointmentModal")).hide()
    showNotification("Appointment scheduled successfully!", "success")

    // Reload calendar
    loadCalendar()
    loadTodaySchedule()
    loadUpcomingAppointments()
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
