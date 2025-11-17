document.addEventListener("DOMContentLoaded", () => {
    console.log("Appointments data:", window.AppointmentsData);
    updateUserInfo();
    loadAppointments();
});

let appointments = window.AppointmentsData || [];

function loadAppointments() {
    loadUpcomingAppointments();
    loadPastAppointments();
    loadCancelledAppointments();
}

// UPCOMING: Pending + Confirmed
function loadUpcomingAppointments() {
    const container = document.getElementById("upcomingAppointments");
    const upcomingAppts = appointments.filter(a => {
        const s = a.Status?.toLowerCase();
        return s === "pending" || s === "confirmed";
    });

    container.innerHTML = upcomingAppts.map(createAppointmentCard).join("");
}

// PAST: Completed
function loadPastAppointments() {
    const container = document.getElementById("pastAppointments");
    const pastAppts = appointments.filter(a => a.Status?.toLowerCase() === "completed");

    container.innerHTML = pastAppts.length > 0
        ? pastAppts.map(createAppointmentCard).join("")
        : '<div class="text-center text-muted py-4">No past appointments</div>';
}

// CANCELLED
function loadCancelledAppointments() {
    const container = document.getElementById("cancelledAppointments");
    const cancelledAppts = appointments.filter(a => a.Status?.toLowerCase() === "cancelled");

    container.innerHTML = cancelledAppts.length > 0
        ? cancelledAppts.map(createAppointmentCard).join("")
        : '<div class="text-center text-muted py-4">No cancelled appointments</div>';
}

// Create appointment card
function createAppointmentCard(appointment) {
    const statusBadge = getStatusBadge(appointment.Status);
    const actionButtons = getActionButtons(appointment);

    const dt = new Date(appointment.AppointmentDateTime);
    const date = dt.toLocaleDateString();
    const time = dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return `
    <div class="appointment-item border p-2 mb-2 rounded">
        <div class="appointment-info">
            <h6>${appointment.DoctorName}</h6>
            <p style="margin:0;">Patient: ${appointment.PatientName}</p>
            <p style="margin:0;">Notes: ${appointment.Notes || 'N/A'}</p>
        </div>
        <div class="appointment-time mt-2">
            <span>${date} - ${time}</span>
            <span class="ms-2">${statusBadge}</span>
        </div>
        <div class="appointment-actions mt-2">
            ${actionButtons}
        </div>
    </div>
    `;
}

// Status badge
function getStatusBadge(status) {
    const s = status?.toLowerCase();
    const badges = {
        pending: '<span class="badge bg-warning">Pending</span>',
        confirmed: '<span class="badge bg-primary">Confirmed</span>',
        completed: '<span class="badge bg-success">Completed</span>',
        cancelled: '<span class="badge bg-danger">Cancelled</span>',
    };
    return badges[s] || '';
}

// Action buttons
function getActionButtons(appointment) {
    const status = appointment.Status?.toLowerCase();
    if (status === "pending" || status === "confirmed") {
        return `
            <button class="btn btn-sm btn-outline-primary" onclick="viewAppointmentDetails(${appointment.AppointmentId})">Details</button>
            <button class="btn btn-sm btn-outline-warning" onclick="rescheduleAppointment(${appointment.AppointmentId})">Reschedule</button>
            <button class="btn btn-sm btn-outline-danger" onclick="cancelAppointment(${appointment.AppointmentId})">Cancel</button>
        `;
    } else if (status === "completed") {
        return `
            <button class="btn btn-sm btn-outline-primary" onclick="viewAppointmentDetails(${appointment.AppointmentId})">View Report</button>
        `;
    }
    return `<button class="btn btn-sm btn-outline-primary" onclick="viewAppointmentDetails(${appointment.AppointmentId})">Details</button>`;
}

// View details
function viewAppointmentDetails(appointmentId) {
    const appointment = appointments.find(a => a.AppointmentId === appointmentId);
    if (!appointment) return;

    alert(`Appointment Details:\nDoctor: ${appointment.DoctorName}\nPatient: ${appointment.PatientName}\nDate: ${new Date(appointment.AppointmentDateTime).toLocaleString()}\nNotes: ${appointment.Notes || 'N/A'}`);
}

// Dummy functions for reschedule/cancel
function rescheduleAppointment(appointmentId) {
    alert("Reschedule functionality not implemented yet.");
}

function cancelAppointment(appointmentId) {
    if (confirm("Are you sure you want to cancel this appointment?")) {
        const appointment = appointments.find(a => a.AppointmentId === appointmentId);
        if (appointment) {
            appointment.Status = "Cancelled";
            loadAppointments();
            alert("Appointment cancelled successfully");
        }
    }
}

// Placeholder for updateUserInfo
function updateUserInfo() {
    // Nếu cần load tên người dùng, avatar
}
