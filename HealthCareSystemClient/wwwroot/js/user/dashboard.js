const CONFIG = window.AppConfig || { apiBaseUrl: "", userId: 0, token: "" };
const INITIAL_DATA = window.DashboardInitialData || { appointments: [], patientProfile: null };
const DASHBOARD_STATE = {
    appointments: [],
    patientProfile: null,
    unreadMessages: 0,
};

let appointmentsLoadFailed = false;
let selectedScheduleDate = new Date();
const currentDate = new Date();

document.addEventListener("DOMContentLoaded", () => {
    console.log("Dashboard initializing...", { CONFIG, INITIAL_DATA });
    initializeMiniCalendar();
    bootstrapDashboard();
});

async function bootstrapDashboard() {
    // Load initial data from server (already loaded)
    DASHBOARD_STATE.appointments = Array.isArray(INITIAL_DATA.appointments) ? INITIAL_DATA.appointments : [];
    DASHBOARD_STATE.patientProfile = INITIAL_DATA.patientProfile || null;
    
    // Log first appointment to debug
    if (DASHBOARD_STATE.appointments.length > 0) {
        console.log("First appointment sample:", DASHBOARD_STATE.appointments[0]);
        console.log("AppointmentDateTime type:", typeof DASHBOARD_STATE.appointments[0].AppointmentDateTime);
        console.log("AppointmentDateTime value:", DASHBOARD_STATE.appointments[0].AppointmentDateTime);
    }
    
    console.log("Initial data loaded:", {
        appointmentsCount: DASHBOARD_STATE.appointments.length,
        hasProfile: !!DASHBOARD_STATE.patientProfile
    });
    
    // Skip API refresh to avoid 404 errors - use server data only
    // await loadDashboardData();
    renderDashboard();
}

async function loadDashboardData() {
    if (!CONFIG.apiBaseUrl || !CONFIG.userId) {
        console.warn("Missing API configuration for dashboard - using server-loaded data only");
        return;
    }

    try {
        const [appointmentsRes, profileRes, conversationRes] = await Promise.allSettled([
            fetchAppointments(),
            fetchPatientProfile(),
            fetchConversations(),
        ]);

        if (appointmentsRes.status === "fulfilled") {
            const apiAppointments = Array.isArray(appointmentsRes.value) ? appointmentsRes.value : [];
            if (apiAppointments.length > 0) {
                DASHBOARD_STATE.appointments = apiAppointments;
                console.log("Appointments refreshed from API:", apiAppointments.length);
            }
        } else {
            console.warn("Failed to refresh appointments from API, using server data:", appointmentsRes.reason);
        }

        if (profileRes.status === "fulfilled" && profileRes.value) {
            DASHBOARD_STATE.patientProfile = profileRes.value;
            console.log("Profile refreshed from API");
        }

        if (conversationRes.status === "fulfilled") {
            const conversations = Array.isArray(conversationRes.value) ? conversationRes.value : [];
            DASHBOARD_STATE.unreadMessages = conversations.reduce((sum, convo) => sum + (convo.unreadCount || 0), 0);
            console.log("Unread messages:", DASHBOARD_STATE.unreadMessages);
        }
    } catch (error) {
        console.warn("Error refreshing dashboard data from API, using server-loaded data:", error);
    }
}

async function fetchAppointments() {
    try {
        const response = await apiFetch(`/api/Appointment/patient/${CONFIG.userId}`);
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Appointment API error ${response.status}:`, errorText);
            throw new Error(`Appointment API error: ${response.status}`);
        }
        const data = await response.json();
        console.log("Fetched appointments from API:", data);
        return data;
    } catch (error) {
        console.error("Error fetching appointments:", error);
        throw error;
    }
}

async function fetchPatientProfile() {
    try {
        const response = await apiFetch(`/api/Patient/${CONFIG.userId}`);
        if (!response.ok) {
            console.warn("Patient profile request failed", response.status);
            return null;
        }
        return response.json();
    } catch (error) {
        console.warn("Unable to load patient profile", error);
        return null;
    }
}

async function fetchConversations() {
    if (!CONFIG.token) {
        return [];
    }

    const response = await apiFetch("/api/conversation/my-conversations");
    if (response.status === 401) {
        console.warn("Unauthorized conversations request");
        return [];
    }
    if (!response.ok) {
        throw new Error(`Conversation API error: ${response.status}`);
    }
    return response.json();
}

function buildApiUrl(path) {
    if (!path.startsWith("/")) {
        return `${CONFIG.apiBaseUrl}/${path}`;
    }
    return `${CONFIG.apiBaseUrl}${path}`;
}

function apiFetch(path, options = {}) {
    if (!CONFIG.apiBaseUrl) {
        throw new Error("apiBaseUrl is required");
    }

    const headers = {
        Accept: "application/json",
        ...(options.headers || {}),
    };

    if (CONFIG.token) {
        headers.Authorization = `Bearer ${CONFIG.token}`;
    }

    return fetch(buildApiUrl(path), {
        ...options,
        headers,
    });
}

// Date parsing utility - must be defined before use
function parseDate(dateValue) {
    if (!dateValue) return null;
    
    // If already a Date object
    if (dateValue instanceof Date) {
        return isNaN(dateValue.getTime()) ? null : dateValue;
    }
    
    // If it's a string, try to parse it
    if (typeof dateValue === 'string') {
        // Try ISO format first
        let date = new Date(dateValue);
        if (!isNaN(date.getTime())) {
            return date;
        }
        
        // Try other common formats
        date = new Date(dateValue.replace(/\s/g, 'T'));
        if (!isNaN(date.getTime())) {
            return date;
        }
    }
    
    // If it's a number (timestamp)
    if (typeof dateValue === 'number') {
        return new Date(dateValue);
    }
    
    console.warn("Could not parse date:", dateValue);
    return null;
}

function renderDashboard() {
    updateStatCards();
    loadUpcomingAppointments();
    loadAppointmentHistory();
    loadTodaySchedule(selectedScheduleDate);
    updateWeekStats();
    renderMiniCalendar();
}

function updateStatCards() {
    const upcomingCount = getUpcomingAppointments().length;
    const completedCount = DASHBOARD_STATE.appointments.filter((a) => isCompletedStatus(a.Status)).length;

    setText("upcomingCount", upcomingCount);
    setText("completedCount", completedCount);
    setText("unreadMessagesCount", DASHBOARD_STATE.unreadMessages);

    const healthScore = calculateHealthScore(completedCount, upcomingCount);
    setText("healthScore", healthScore !== null ? `${healthScore}%` : "--");
}

function calculateHealthScore(completedCount, upcomingCount) {
    const profile = DASHBOARD_STATE.patientProfile;
    if (!profile) {
        return null;
    }

    let score = 80;
    if (profile.BMI) {
        const bmi = parseFloat(profile.BMI);
        if (!Number.isNaN(bmi)) {
            score -= Math.abs(bmi - 22) * 1.5;
        }
    }

    if (profile.Weight && profile.Height) {
        const idealWeight = (profile.Height - 100) * 0.9;
        score -= Math.abs(profile.Weight - idealWeight) * 0.1;
    }

    score += Math.min(completedCount * 1.5, 12);
    score -= Math.max(upcomingCount - completedCount, 0);

    score = Math.max(45, Math.min(100, Math.round(score)));
    return score;
}

function getUpcomingAppointments(limit = 5) {
    const now = new Date();
    return DASHBOARD_STATE.appointments.filter((appointment) => {
        if (!appointment || !appointment.AppointmentDateTime) return false;
        const status = normalizeStatus(appointment.Status);
        const date = parseDate(appointment.AppointmentDateTime);
        if (!date) return false;
        return isUpcomingStatus(status) && date >= now;
    })
        .sort((a, b) => {
            const dateA = parseDate(a.AppointmentDateTime);
            const dateB = parseDate(b.AppointmentDateTime);
            if (!dateA || !dateB) return 0;
            return dateA - dateB;
        })
        .slice(0, limit);
}

function loadUpcomingAppointments() {
    const container = document.getElementById("upcomingAppointments");
    if (!container) return;

    if (appointmentsLoadFailed) {
        showInlineError("upcomingAppointments", "Không thể tải danh sách lịch hẹn.");
        return;
    }

    const upcoming = getUpcomingAppointments();
    if (upcoming.length === 0) {
        container.innerHTML = buildEmptyState("fas fa-calendar-day", "Chưa có lịch hẹn sắp tới.");
        return;
    }

    container.innerHTML = upcoming
        .map((appointment) => {
            if (!appointment || !appointment.AppointmentDateTime) {
                console.warn("Invalid appointment:", appointment);
                return "";
            }
            const date = parseDate(appointment.AppointmentDateTime);
            const doctorName = appointment.DoctorName || "Unknown Doctor";
            const notes = appointment.Notes || "General consultation";
            return `
    <div class="appointment-item">
                    <img src="/placeholder.svg?height=40&width=40" alt="${doctorName}" class="appointment-avatar">
      <div class="appointment-info">
                        <h6>${doctorName}</h6>
                        <p>${notes}</p>
      </div>
      <div class="appointment-time">
                        <div class="appointment-date">${formatDate(date)}</div>
                        <div class="appointment-slot">${formatTime(date)}</div>
      </div>
    </div>
            `;
        })
        .filter(html => html !== "")
        .join("");
}

function loadAppointmentHistory() {
    const container = document.getElementById("appointmentHistory");
    if (!container) return;

    if (appointmentsLoadFailed) {
        showInlineTableError("appointmentHistory", "Không thể tải lịch sử lịch hẹn.");
        return;
    }

    if (DASHBOARD_STATE.appointments.length === 0) {
        showInlineTableError("appointmentHistory", "Chưa có lịch hẹn nào.");
        return;
    }

    const historyItems = [...DASHBOARD_STATE.appointments]
        .filter(apt => apt && apt.AppointmentDateTime)
        .sort((a, b) => {
            const dateA = parseDate(a.AppointmentDateTime);
            const dateB = parseDate(b.AppointmentDateTime);
            if (!dateA || !dateB) return 0;
            return dateB - dateA;
        })
        .slice(0, 8);

    container.innerHTML = historyItems
        .map((appointment) => {
            if (!appointment) return "";
            const status = normalizeStatus(appointment.Status);
            const badgeLabel = getStatusBadgeLabel(status);
            const date = parseDate(appointment.AppointmentDateTime);
            const doctorName = appointment.DoctorName || "Unknown Doctor";
            const notes = appointment.Notes || "General care";
            return `
                <tr>
                    <td>${formatDate(date)}</td>
                    <td>${doctorName}</td>
                    <td>${notes}</td>
                    <td><span class="status-badge ${status}">${badgeLabel}</span></td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary" onclick="window.location.href='/User/Appointments'">View Details</button>
      </td>
    </tr>
            `;
        })
        .filter(html => html !== "")
        .join("");
}

function loadTodaySchedule(date = new Date()) {
    selectedScheduleDate = date;
    const container = document.getElementById("todaySchedule");
    if (!container) return;

    if (appointmentsLoadFailed) {
        container.innerHTML = buildEmptyState("fas fa-calendar-times", "Không thể tải lịch trong ngày.");
        return;
    }

    const schedule = DASHBOARD_STATE.appointments.filter((appointment) => {
        if (!appointment || !appointment.AppointmentDateTime) return false;
        const apptDate = parseDate(appointment.AppointmentDateTime);
        if (!apptDate) return false;
        return isSameDay(apptDate, date) && isUpcomingStatus(appointment.Status);
    }).sort((a, b) => {
        const dateA = parseDate(a.AppointmentDateTime);
        const dateB = parseDate(b.AppointmentDateTime);
        if (!dateA || !dateB) return 0;
        return dateA - dateB;
    });

    if (schedule.length === 0) {
        container.innerHTML = `
            <div class="no-appointments">
                <i class="fas fa-calendar-check"></i>
                <div>Không có lịch hẹn cho ${formatDate(date)}</div>
            </div>
        `;
        return;
    }

    container.innerHTML = schedule
        .map((apt) => {
            if (!apt || !apt.AppointmentDateTime) return "";
            const apptDate = parseDate(apt.AppointmentDateTime);
            const doctorName = apt.DoctorName || "Unknown Doctor";
            const notes = apt.Notes || "Consultation";
            return `
                <div class="schedule-item">
                    <div class="schedule-time">${formatTime(apptDate)}</div>
                    <div class="schedule-details">
                        <h6>${doctorName}</h6>
                        <p>${notes}</p>
                    </div>
                </div>
            `;
        })
        .filter(html => html !== "")
        .join("");
}

function updateWeekStats() {
    const startOfWeek = getStartOfWeek(new Date());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 7);

    const weeklyAppointments = DASHBOARD_STATE.appointments.filter((appointment) => {
        if (!appointment || !appointment.AppointmentDateTime) return false;
        const date = parseDate(appointment.AppointmentDateTime);
        if (!date) return false;
        return date >= startOfWeek && date < endOfWeek;
    });

    const weekUpcoming = weeklyAppointments.filter((a) => isUpcomingStatus(a.Status)).length;
    const weekCompleted = weeklyAppointments.filter((a) => isCompletedStatus(a.Status)).length;
    const weekFollowUps =
        weeklyAppointments.filter((a) => (a.Notes || "").toLowerCase().includes("follow")).length ||
        Math.max(weekUpcoming - weekCompleted, 0);

    setText("weekAppointmentsCount", weekUpcoming);
    setText("weekCheckupsCount", weekCompleted);
    setText("weekFollowupsCount", weekFollowUps);
}

function initializeMiniCalendar() {
    updateMiniCalendarTitle();
    renderMiniCalendar();
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
    ];
    const title = document.getElementById("calendarMonthYear");
    if (title) {
        title.textContent = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    }
}

function renderMiniCalendar() {
    const container = document.getElementById("calendarMiniGrid");
    if (!container) return;

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    const highlightedDays = getAppointmentDaysForMonth(year, month);

    let calendarHTML = `
    <div class="calendar-mini-day-header">S</div>
    <div class="calendar-mini-day-header">M</div>
    <div class="calendar-mini-day-header">T</div>
    <div class="calendar-mini-day-header">W</div>
    <div class="calendar-mini-day-header">T</div>
    <div class="calendar-mini-day-header">F</div>
    <div class="calendar-mini-day-header">S</div>
    `;

    for (let i = firstDay - 1; i >= 0; i--) {
        const day = daysInPrevMonth - i;
        calendarHTML += `<div class="calendar-mini-day other-month">${day}</div>`;
    }

    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
        const isToday = today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
        const hasAppointment = highlightedDays.has(day);

        let classes = "calendar-mini-day";
        if (isToday) classes += " today";
        if (hasAppointment) classes += " has-appointment";

        calendarHTML += `<div class="${classes}" onclick="selectMiniDate(${day})">${day}</div>`;
    }

    const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;
    const remainingCells = totalCells - (firstDay + daysInMonth);
    for (let day = 1; day <= remainingCells; day++) {
        calendarHTML += `<div class="calendar-mini-day other-month">${day}</div>`;
    }

    container.innerHTML = calendarHTML;
}

function getAppointmentDaysForMonth(year, month) {
    const days = new Set();
    DASHBOARD_STATE.appointments.forEach((appointment) => {
        if (!appointment || !appointment.AppointmentDateTime) return;
        const date = parseDate(appointment.AppointmentDateTime);
        if (!date) return;
        if (date.getFullYear() === year && date.getMonth() === month) {
            days.add(date.getDate());
        }
    });
    return days;
}

function previousMonth() {
    currentDate.setMonth(currentDate.getMonth() - 1);
    updateMiniCalendarTitle();
    renderMiniCalendar();
}

function nextMonth() {
    currentDate.setMonth(currentDate.getMonth() + 1);
    updateMiniCalendarTitle();
    renderMiniCalendar();
}

function selectMiniDate(day) {
    const selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    loadTodaySchedule(selectedDate);
}

function normalizeStatus(status) {
    return (status || "").toLowerCase();
}

function isUpcomingStatus(status) {
    const normalized = normalizeStatus(status);
    return normalized === "pending" || normalized === "confirmed";
}

function isCompletedStatus(status) {
    return normalizeStatus(status) === "completed";
}

function getStatusBadgeLabel(status) {
    switch (status) {
        case "pending":
            return "Pending";
        case "confirmed":
            return "Confirmed";
        case "completed":
            return "Completed";
        case "cancelled":
            return "Cancelled";
        default:
            return "Unknown";
    }
}

function formatDate(date) {
    if (!date) return "Invalid Date";
    const parsed = parseDate(date);
    if (!parsed) return "Invalid Date";
    try {
        return parsed.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
    } catch (e) {
        console.error("Error formatting date:", e, date);
        return "Invalid Date";
    }
}

function formatTime(date) {
    if (!date) return "Invalid Time";
    const parsed = parseDate(date);
    if (!parsed) return "Invalid Time";
    try {
        return parsed.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
    } catch (e) {
        console.error("Error formatting time:", e, date);
        return "Invalid Time";
    }
}

function isSameDay(dateA, dateB) {
    const parsedA = parseDate(dateA);
    const parsedB = parseDate(dateB);
    if (!parsedA || !parsedB) return false;
    return parsedA.getDate() === parsedB.getDate() && parsedA.getMonth() === parsedB.getMonth() && parsedA.getFullYear() === parsedB.getFullYear();
}

function setText(elementId, value) {
    const el = document.getElementById(elementId);
    if (el) {
        el.textContent = value;
    }
}

function showInlineError(containerId, message) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = `
        <div class="no-appointments">
            <i class="fas fa-exclamation-circle"></i>
            <p>${message}</p>
        </div>
    `;
}

function showInlineTableError(tbodyId, message) {
    const container = document.getElementById(tbodyId);
    if (!container) return;
    container.innerHTML = `
        <tr>
            <td colspan="5">
                <div class="no-appointments">
                    <i class="fas fa-inbox"></i>
                    <p>${message}</p>
                </div>
            </td>
        </tr>
    `;
}

function buildEmptyState(icon, text) {
    return `
        <div class="no-appointments">
            <i class="${icon}"></i>
            <p>${text}</p>
        </div>
    `;
}

function getStartOfWeek(date) {
    const start = new Date(date);
    const day = start.getDay();
    const diff = start.getDate() - day;
    start.setDate(diff);
    start.setHours(0, 0, 0, 0);
    return start;
}

function logout() {
    if (confirm("Are you sure you want to logout?")) {
        window.location.href = "/Login/Logout";
    }
}

