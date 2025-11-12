// Doctor Schedule JavaScript
const currentWeek = new Date()
let bootstrap // Declare the bootstrap variable

document.addEventListener("DOMContentLoaded", () => {
    initializeSchedule()
    loadScheduleGrid()
    loadWorkingHours()
    loadTimeOff()
    setupEventListeners()
})

function initializeSchedule() {
    const doctorName = localStorage.getItem("doctorName") || "Dr. Sarah Johnson"
    document.getElementById("doctorName").textContent = doctorName

    updateCurrentWeek()
}

function updateCurrentWeek() {
    const startOfWeek = getStartOfWeek(currentWeek)
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)

    const options = { month: "short", day: "numeric" }
    const weekRange = `${startOfWeek.toLocaleDateString("en-US", options)} - ${endOfWeek.toLocaleDateString("en-US", options)}, ${currentWeek.getFullYear()}`
    document.getElementById("currentWeek").textContent = weekRange
}

function getStartOfWeek(date) {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day
    return new Date(d.setDate(diff))
}

function loadScheduleGrid() {
    const container = document.getElementById("scheduleGrid")
    if (!container) return

    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    const timeSlots = [
        "09:00",
        "09:30",
        "10:00",
        "10:30",
        "11:00",
        "11:30",
        "14:00",
        "14:30",
        "15:00",
        "15:30",
        "16:00",
        "16:30",
    ]

    // Sample schedule data
    const scheduleData = {
        Monday: [
            { time: "09:00", patient: "John Doe", type: "Consultation" },
            { time: "10:30", patient: "Jane Smith", type: "Follow-up" },
            { time: "14:00", patient: "Mike Johnson", type: "Check-up" },
        ],
        Tuesday: [
            { time: "09:30", patient: "Sarah Wilson", type: "Consultation" },
            { time: "15:00", patient: "David Brown", type: "Follow-up" },
        ],
        Wednesday: [
            { time: "10:00", patient: "Lisa Anderson", type: "Consultation" },
            { time: "11:00", patient: "Robert Taylor", type: "Check-up" },
        ],
        Thursday: [
            { time: "09:00", patient: "Emily Davis", type: "Follow-up" },
            { time: "14:30", patient: "Mark Wilson", type: "Consultation" },
        ],
        Friday: [{ time: "09:30", patient: "Anna Johnson", type: "Check-up" }],
    }

    let gridHTML = ""

    // Create header row
    gridHTML += '<div class="schedule-grid-header">'
    gridHTML += '<div class="schedule-time-header">Time</div>'
    days.forEach((day) => {
        gridHTML += `<div class="schedule-day-header">${day}</div>`
    })
    gridHTML += "</div>"

    // Create time slot rows
    timeSlots.forEach((time) => {
        gridHTML += '<div class="schedule-grid-row">'
        gridHTML += `<div class="schedule-time-slot">${formatTime(time)}</div>`

        days.forEach((day) => {
            const appointment = scheduleData[day]?.find((apt) => apt.time === time)
            let cellContent = ""
            let cellClass = "schedule-cell"

            if (appointment) {
                cellClass += " has-appointment"
                cellContent = `
                    <div class="appointment-block">
                        <div class="appointment-patient">${appointment.patient}</div>
                        <div class="appointment-type">${appointment.type}</div>
                    </div>
                `
            } else {
                cellClass += " available"
                cellContent =
                    '<div class="available-slot" onclick="addAppointmentToSlot(\'' + day + "', '" + time + "')\">Available</div>"
            }

            gridHTML += `<div class="${cellClass}">${cellContent}</div>`
        })

        gridHTML += "</div>"
    })

    container.innerHTML = gridHTML
}

function loadWorkingHours() {
    const container = document.getElementById("workingHoursGrid")
    if (!container) return

    const workingHours = [
        { day: "Monday", hours: "9:00 AM - 5:00 PM", isWorking: true },
        { day: "Tuesday", hours: "9:00 AM - 5:00 PM", isWorking: true },
        { day: "Wednesday", hours: "9:00 AM - 5:00 PM", isWorking: true },
        { day: "Thursday", hours: "9:00 AM - 5:00 PM", isWorking: true },
        { day: "Friday", hours: "9:00 AM - 3:00 PM", isWorking: true },
        { day: "Saturday", hours: "Closed", isWorking: false },
        { day: "Sunday", hours: "Closed", isWorking: false },
    ]

    container.innerHTML = workingHours
        .map(
            (day) => `
        <div class="working-hours-day ${!day.isWorking ? "closed" : ""}">
            <h6>${day.day}</h6>
            <p>${day.hours}</p>
        </div>
    `,
        )
        .join("")
}

function loadTimeOff() {
    const container = document.getElementById("timeOffList")
    if (!container) return

    const timeOffData = [
        {
            id: 1,
            type: "vacation",
            title: "Summer Vacation",
            startDate: "2024-07-15",
            endDate: "2024-07-22",
            reason: "Family vacation to Europe",
        },
        {
            id: 2,
            type: "conference",
            title: "Medical Conference",
            startDate: "2024-03-10",
            endDate: "2024-03-12",
            reason: "Cardiology Annual Conference",
        },
        {
            id: 3,
            type: "holiday",
            title: "Christmas Holiday",
            startDate: "2024-12-24",
            endDate: "2024-12-26",
            reason: "Christmas holiday break",
        },
    ]

    container.innerHTML = timeOffData
        .map(
            (timeOff) => `
        <div class="time-off-item">
            <div class="time-off-info">
                <div class="time-off-icon ${timeOff.type}">
                    <i class="fas fa-${getTimeOffIcon(timeOff.type)}"></i>
                </div>
                <div class="time-off-details">
                    <h6>${timeOff.title}</h6>
                    <p>${formatDateRange(timeOff.startDate, timeOff.endDate)}</p>
                    <small>${timeOff.reason}</small>
                </div>
            </div>
            <div class="time-off-actions">
                <button class="btn btn-sm btn-outline-secondary" onclick="editTimeOff(${timeOff.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteTimeOff(${timeOff.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `,
        )
        .join("")
}

function setupEventListeners() {
    // Duration radio buttons
    const durationInputs = document.querySelectorAll('input[name="duration"]')
    durationInputs.forEach((input) => {
        input.addEventListener("change", function () {
            console.log("Appointment duration changed to:", this.value, "minutes")
        })
    })

    // Settings toggles
    const toggles = document.querySelectorAll('input[type="checkbox"]')
    toggles.forEach((toggle) => {
        toggle.addEventListener("change", function () {
            console.log(`${this.id} toggled:`, this.checked)
        })
    })
}

// Utility functions
function formatTime(time24) {
    const [hours, minutes] = time24.split(":")
    const hour = Number.parseInt(hours)
    const ampm = hour >= 12 ? "PM" : "AM"
    const hour12 = hour % 12 || 12
    return `${hour12}:${minutes} ${ampm}`
}

function formatDateRange(startDate, endDate) {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const options = { month: "short", day: "numeric" }

    if (start.getFullYear() === end.getFullYear()) {
        return `${start.toLocaleDateString("en-US", options)} - ${end.toLocaleDateString("en-US", options)}, ${start.getFullYear()}`
    } else {
        return `${start.toLocaleDateString("en-US", { ...options, year: "numeric" })} - ${end.toLocaleDateString("en-US", { ...options, year: "numeric" })}`
    }
}

function getTimeOffIcon(type) {
    const icons = {
        vacation: "plane",
        sick: "thermometer-half",
        conference: "graduation-cap",
        personal: "user",
        holiday: "gift",
    }
    return icons[type] || "calendar-times"
}

// Navigation functions
function previousWeek() {
    currentWeek.setDate(currentWeek.getDate() - 7)
    updateCurrentWeek()
    loadScheduleGrid()
}

function nextWeek() {
    currentWeek.setDate(currentWeek.getDate() + 7)
    updateCurrentWeek()
    loadScheduleGrid()
}

// Modal functions
function addTimeSlot() {
    const modal = new bootstrap.Modal(document.getElementById("addTimeSlotModal"))
    modal.show()
}

function saveTimeSlot() {
    const form = document.getElementById("addTimeSlotForm")
    const formData = new FormData(form)

    console.log("Adding time slot:", Object.fromEntries(formData))

    bootstrap.Modal.getInstance(document.getElementById("addTimeSlotModal")).hide()
    showNotification("Time slot added successfully!", "success")

    // Reload schedule
    loadScheduleGrid()
}

function addTimeOff() {
    const modal = new bootstrap.Modal(document.getElementById("addTimeOffModal"))
    modal.show()
}

function saveTimeOff() {
    const form = document.getElementById("addTimeOffForm")
    const formData = new FormData(form)

    console.log("Adding time off:", Object.fromEntries(formData))

    bootstrap.Modal.getInstance(document.getElementById("addTimeOffModal")).hide()
    showNotification("Time off added successfully!", "success")

    // Reload time off list
    loadTimeOff()
}

function editWorkingHours() {
    console.log("Editing working hours")
    showNotification("Working hours editing coming soon", "info")
}

function saveAvailabilitySettings() {
    const duration = document.querySelector('input[name="duration"]:checked')?.value
    const bufferTime = document.getElementById("bufferTime")?.value
    const advanceBooking = document.getElementById("advanceBooking")?.value
    const autoAccept = document.getElementById("autoAccept")?.checked
    const allowRescheduling = document.getElementById("allowRescheduling")?.checked

    const settings = {
        duration,
        bufferTime,
        advanceBooking,
        autoAccept,
        allowRescheduling,
    }

    console.log("Saving availability settings:", settings)
    localStorage.setItem("doctorAvailabilitySettings", JSON.stringify(settings))
    showNotification("Settings saved successfully!", "success")
}

// Action functions
function addAppointmentToSlot(day, time) {
    console.log("Adding appointment to:", day, time)
    // Open appointment modal with pre-filled day and time
    addTimeSlot()
}

function editTimeOff(timeOffId) {
    console.log("Editing time off:", timeOffId)
    // Open edit modal with pre-filled data
}

function deleteTimeOff(timeOffId) {
    if (confirm("Are you sure you want to delete this time off?")) {
        console.log("Deleting time off:", timeOffId)
        showNotification("Time off deleted successfully!", "success")
        loadTimeOff()
    }
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
