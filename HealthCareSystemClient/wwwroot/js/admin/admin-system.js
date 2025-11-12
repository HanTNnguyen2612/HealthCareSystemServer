// Admin System Management functionality
let auditLogs = []
let appointments = []
let reviews = []
let messages = []
let filteredAuditLogs = []
let filteredAppointments = []
let filteredReviews = []
let filteredMessages = []
let currentAuditPage = 1
const itemsPerPage = 10

document.addEventListener("DOMContentLoaded", () => {
    loadSystemData()
    setupSearch()
    setupModalHandlers()
})

function loadSystemData() {
    loadAuditLogs()
    loadAppointments()
    loadReviews()
    loadMessages()
}

function loadAuditLogs() {
    // Sample audit logs data
    auditLogs = [
        {
            id: 1,
            timestamp: "2024-01-20 14:30:25",
            user: "admin@healthcare.com",
            userType: "admin",
            action: "CREATE",
            table: "users",
            recordId: "123",
            ipAddress: "192.168.1.100",
            details: "Created new patient account",
        },
        {
            id: 2,
            timestamp: "2024-01-20 14:25:10",
            user: "dr.johnson@hospital.com",
            userType: "doctor",
            action: "UPDATE",
            table: "appointments",
            recordId: "456",
            ipAddress: "192.168.1.101",
            details: "Updated appointment status to completed",
        },
        {
            id: 3,
            timestamp: "2024-01-20 14:20:45",
            user: "john.doe@email.com",
            userType: "patient",
            action: "LOGIN",
            table: "sessions",
            recordId: "789",
            ipAddress: "192.168.1.102",
            details: "User logged in successfully",
        },
        {
            id: 4,
            timestamp: "2024-01-20 14:15:30",
            user: "admin@healthcare.com",
            userType: "admin",
            action: "DELETE",
            table: "articles",
            recordId: "321",
            ipAddress: "192.168.1.100",
            details: "Deleted outdated health article",
        },
        {
            id: 5,
            timestamp: "2024-01-20 14:10:15",
            user: "jane.smith@email.com",
            userType: "patient",
            action: "CREATE",
            table: "appointments",
            recordId: "654",
            ipAddress: "192.168.1.103",
            details: "Booked new appointment with Dr. Chen",
        },
        {
            id: 6,
            timestamp: "2024-01-20 14:05:00",
            user: "dr.chen@hospital.com",
            userType: "doctor",
            action: "UPDATE",
            table: "users",
            recordId: "987",
            ipAddress: "192.168.1.104",
            details: "Updated profile information",
        },
        {
            id: 7,
            timestamp: "2024-01-20 14:00:45",
            user: "admin@healthcare.com",
            userType: "admin",
            action: "CREATE",
            table: "articles",
            recordId: "147",
            ipAddress: "192.168.1.100",
            details: "Published new health tips article",
        },
        {
            id: 8,
            timestamp: "2024-01-20 13:55:30",
            user: "robert.brown@email.com",
            userType: "patient",
            action: "UPDATE",
            table: "payments",
            recordId: "258",
            ipAddress: "192.168.1.105",
            details: "Updated payment method",
        },
    ]

    filteredAuditLogs = [...auditLogs]
    renderAuditLogs()
    renderAuditPagination()
}

function loadAppointments() {
    // Sample appointments data
    appointments = [
        {
            id: 1,
            patient: "John Doe",
            doctor: "Dr. Sarah Johnson",
            date: "2024-01-22",
            time: "10:00",
            type: "consultation",
            status: "scheduled",
            notes: "Regular checkup",
        },
        {
            id: 2,
            patient: "Jane Smith",
            doctor: "Dr. Michael Chen",
            date: "2024-01-22",
            time: "14:30",
            type: "follow-up",
            status: "completed",
            notes: "Follow-up for previous treatment",
        },
        {
            id: 3,
            patient: "Robert Brown",
            doctor: "Dr. Sarah Johnson",
            date: "2024-01-23",
            time: "09:15",
            type: "emergency",
            status: "pending",
            notes: "Urgent consultation needed",
        },
        {
            id: 4,
            patient: "Emily Davis",
            doctor: "Dr. Michael Chen",
            date: "2024-01-21",
            time: "16:00",
            type: "consultation",
            status: "cancelled",
            notes: "Patient cancelled due to illness",
        },
        {
            id: 5,
            patient: "Michael Wilson",
            doctor: "Dr. Sarah Johnson",
            date: "2024-01-24",
            time: "11:30",
            type: "follow-up",
            status: "scheduled",
            notes: "Review test results",
        },
        {
            id: 6,
            patient: "Lisa Anderson",
            doctor: "Dr. Michael Chen",
            date: "2024-01-25",
            time: "15:45",
            type: "consultation",
            status: "scheduled",
            notes: "Initial consultation",
        },
    ]

    filteredAppointments = [...appointments]
    renderAppointments()
}

function loadReviews() {
    // Sample reviews data
    reviews = [
        {
            id: 1,
            patient: "John Doe",
            doctor: "Dr. Sarah Johnson",
            rating: 5,
            comment: "Excellent service and very professional. Dr. Johnson was thorough and caring.",
            date: "2024-01-20",
            status: "approved",
        },
        {
            id: 2,
            patient: "Jane Smith",
            doctor: "Dr. Michael Chen",
            rating: 4,
            comment: "Good experience overall. The doctor was knowledgeable and helpful.",
            date: "2024-01-19",
            status: "approved",
        },
        {
            id: 3,
            patient: "Robert Brown",
            doctor: "Dr. Sarah Johnson",
            rating: 3,
            comment: "Average experience. Long waiting time but good treatment.",
            date: "2024-01-18",
            status: "pending",
        },
        {
            id: 4,
            patient: "Emily Davis",
            doctor: "Dr. Michael Chen",
            rating: 5,
            comment: "Outstanding care! Dr. Chen explained everything clearly and was very patient.",
            date: "2024-01-17",
            status: "approved",
        },
        {
            id: 5,
            patient: "Michael Wilson",
            doctor: "Dr. Sarah Johnson",
            rating: 2,
            comment: "Not satisfied with the service. Felt rushed during the appointment.",
            date: "2024-01-16",
            status: "rejected",
        },
        {
            id: 6,
            patient: "Lisa Anderson",
            doctor: "Dr. Michael Chen",
            rating: 4,
            comment: "Professional and efficient. Would recommend to others.",
            date: "2024-01-15",
            status: "approved",
        },
    ]

    filteredReviews = [...reviews]
    renderReviews()
}

function loadMessages() {
    // Sample messages data
    messages = [
        {
            id: 1,
            from: "john.doe@email.com",
            subject: "Appointment Rescheduling Request",
            type: "support",
            status: "new",
            date: "2024-01-20",
            priority: "normal",
            preview: "I need to reschedule my appointment due to a family emergency...",
        },
        {
            id: 2,
            from: "jane.smith@email.com",
            subject: "Billing Inquiry",
            type: "inquiry",
            status: "in-progress",
            date: "2024-01-19",
            priority: "normal",
            preview: "I have a question about my recent bill. Could you please clarify...",
        },
        {
            id: 3,
            from: "robert.brown@email.com",
            subject: "Complaint About Service",
            type: "complaint",
            status: "resolved",
            date: "2024-01-18",
            priority: "high",
            preview: "I was not satisfied with the service I received during my last visit...",
        },
        {
            id: 4,
            from: "emily.davis@email.com",
            subject: "Positive Feedback",
            type: "feedback",
            status: "closed",
            date: "2024-01-17",
            priority: "normal",
            preview: "I wanted to share my positive experience with Dr. Johnson...",
        },
        {
            id: 5,
            from: "michael.wilson@email.com",
            subject: "Technical Issue with Portal",
            type: "support",
            status: "new",
            date: "2024-01-16",
            priority: "urgent",
            preview: "I'm unable to access my patient portal. Getting error messages...",
        },
        {
            id: 6,
            from: "lisa.anderson@email.com",
            subject: "Insurance Coverage Question",
            type: "inquiry",
            status: "in-progress",
            date: "2024-01-15",
            priority: "normal",
            preview: "Can you help me understand what services are covered by my insurance...",
        },
    ]

    filteredMessages = [...messages]
    renderMessages()
}

function setupSearch() {
    const searchInput = document.getElementById("searchInput")
    searchInput.addEventListener("input", (e) => {
        const searchTerm = e.target.value.toLowerCase()

        // Get active tab
        const activeTab = document.querySelector(".nav-link.active").getAttribute("data-bs-target")

        switch (activeTab) {
            case "#audit":
                filteredAuditLogs = auditLogs.filter(
                    (log) =>
                        log.user.toLowerCase().includes(searchTerm) ||
                        log.action.toLowerCase().includes(searchTerm) ||
                        log.table.toLowerCase().includes(searchTerm) ||
                        log.details.toLowerCase().includes(searchTerm),
                )
                renderAuditLogs()
                renderAuditPagination()
                break
            case "#appointments":
                filteredAppointments = appointments.filter(
                    (apt) =>
                        apt.patient.toLowerCase().includes(searchTerm) ||
                        apt.doctor.toLowerCase().includes(searchTerm) ||
                        apt.type.toLowerCase().includes(searchTerm),
                )
                renderAppointments()
                break
            case "#reviews":
                filteredReviews = reviews.filter(
                    (review) =>
                        review.patient.toLowerCase().includes(searchTerm) ||
                        review.doctor.toLowerCase().includes(searchTerm) ||
                        review.comment.toLowerCase().includes(searchTerm),
                )
                renderReviews()
                break
            case "#messages":
                filteredMessages = messages.filter(
                    (msg) =>
                        msg.from.toLowerCase().includes(searchTerm) ||
                        msg.subject.toLowerCase().includes(searchTerm) ||
                        msg.preview.toLowerCase().includes(searchTerm),
                )
                renderMessages()
                break
        }
    })
}

function setupModalHandlers() {
    // Handle recipient selection in compose message modal
    document.getElementById("messageRecipient").addEventListener("change", function () {
        const specificUserDiv = document.getElementById("specificUserDiv")
        if (this.value === "specific") {
            specificUserDiv.style.display = "block"
        } else {
            specificUserDiv.style.display = "none"
        }
    })
}

function filterAuditLogs() {
    const tableFilter = document.getElementById("auditTableFilter").value
    const actionFilter = document.getElementById("auditActionFilter").value
    const userFilter = document.getElementById("auditUserFilter").value

    filteredAuditLogs = auditLogs.filter((log) => {
        let matches = true

        if (tableFilter && log.table !== tableFilter) matches = false
        if (actionFilter && log.action !== actionFilter) matches = false
        if (userFilter && log.userType !== userFilter) matches = false

        return matches
    })

    currentAuditPage = 1
    renderAuditLogs()
    renderAuditPagination()
}

function renderAuditLogs() {
    const startIndex = (currentAuditPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const paginatedLogs = filteredAuditLogs.slice(startIndex, endIndex)

    const tbody = document.getElementById("auditLogsTable")
    tbody.innerHTML = paginatedLogs
        .map(
            (log) => `
        <tr>
            <td>${log.timestamp}</td>
            <td>
                <div class="d-flex align-items-center">
                    <div class="user-avatar-sm bg-${getUserTypeColor(log.userType)} me-2">
                        <i class="fas fa-${getUserTypeIcon(log.userType)}"></i>
                    </div>
                    <div>
                        <div class="fw-bold">${log.user}</div>
                        <small class="text-muted">${log.userType}</small>
                    </div>
                </div>
            </td>
            <td>
                <span class="badge bg-${getActionBadgeColor(log.action)}">${log.action}</span>
            </td>
            <td>${log.table}</td>
            <td>${log.recordId}</td>
            <td>${log.ipAddress}</td>
            <td>
                <span class="text-truncate d-inline-block" style="max-width: 200px;" title="${log.details}">
                    ${log.details}
                </span>
            </td>
        </tr>
    `,
        )
        .join("")
}

function renderAuditPagination() {
    const totalPages = Math.ceil(filteredAuditLogs.length / itemsPerPage)
    const pagination = document.getElementById("auditPagination")

    let paginationHTML = ""

    // Previous button
    paginationHTML += `
        <li class="page-item ${currentAuditPage === 1 ? "disabled" : ""}">
            <a class="page-link" href="#" onclick="changeAuditPage(${currentAuditPage - 1})">Previous</a>
        </li>
    `

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentAuditPage - 2 && i <= currentAuditPage + 2)) {
            paginationHTML += `
                <li class="page-item ${i === currentAuditPage ? "active" : ""}">
                    <a class="page-link" href="#" onclick="changeAuditPage(${i})">${i}</a>
                </li>
            `
        } else if (i === currentAuditPage - 3 || i === currentAuditPage + 3) {
            paginationHTML += `<li class="page-item disabled"><span class="page-link">...</span></li>`
        }
    }

    // Next button
    paginationHTML += `
        <li class="page-item ${currentAuditPage === totalPages ? "disabled" : ""}">
            <a class="page-link" href="#" onclick="changeAuditPage(${currentAuditPage + 1})">Next</a>
        </li>
    `

    pagination.innerHTML = paginationHTML
}

function changeAuditPage(page) {
    if (page >= 1 && page <= Math.ceil(filteredAuditLogs.length / itemsPerPage)) {
        currentAuditPage = page
        renderAuditLogs()
        renderAuditPagination()
    }
}

function filterAppointments() {
    const statusFilter = document.getElementById("appointmentStatusFilter").value
    const dateFilter = document.getElementById("appointmentDateFilter").value

    filteredAppointments = appointments.filter((appointment) => {
        let matches = true

        if (statusFilter && appointment.status !== statusFilter) matches = false
        if (dateFilter && appointment.date !== dateFilter) matches = false

        return matches
    })

    renderAppointments()
}

function renderAppointments() {
    const grid = document.getElementById("appointmentsGrid")
    grid.innerHTML = filteredAppointments
        .map(
            (appointment) => `
        <div class="col-md-6 col-lg-4 mb-3">
            <div class="card appointment-card">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <h6 class="card-title mb-0">${appointment.patient}</h6>
                        <span class="badge bg-${getStatusBadgeColor(appointment.status)}">${appointment.status}</span>
                    </div>
                    <p class="card-text">
                        <i class="fas fa-user-md text-primary"></i> ${appointment.doctor}<br>
                        <i class="fas fa-calendar text-info"></i> ${formatDate(appointment.date)}<br>
                        <i class="fas fa-clock text-warning"></i> ${appointment.time}<br>
                        <i class="fas fa-stethoscope text-success"></i> ${appointment.type}
                    </p>
                    ${appointment.notes ? `<small class="text-muted">${appointment.notes}</small>` : ""}
                    <div class="mt-3">
                        <div class="btn-group w-100" role="group">
                            <button class="btn btn-sm btn-outline-primary" onclick="editAppointment(${appointment.id})">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-info" onclick="viewAppointment(${appointment.id})">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-danger" onclick="cancelAppointment(${appointment.id})">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
        )
        .join("")
}

function filterReviews() {
    const ratingFilter = document.getElementById("reviewRatingFilter").value
    const statusFilter = document.getElementById("reviewStatusFilter").value

    filteredReviews = reviews.filter((review) => {
        let matches = true

        if (ratingFilter && review.rating.toString() !== ratingFilter) matches = false
        if (statusFilter && review.status !== statusFilter) matches = false

        return matches
    })

    renderReviews()
}

function renderReviews() {
    const list = document.getElementById("reviewsList")
    list.innerHTML = filteredReviews
        .map(
            (review) => `
        <div class="review-item mb-3">
            <div class="card">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <div>
                            <h6 class="mb-1">${review.patient}</h6>
                            <small class="text-muted">for ${review.doctor}</small>
                        </div>
                        <div class="text-end">
                            <div class="rating mb-1">
                                ${generateStars(review.rating)}
                            </div>
                            <span class="badge bg-${getReviewStatusColor(review.status)}">${review.status}</span>
                        </div>
                    </div>
                    <p class="card-text">${review.comment}</p>
                    <div class="d-flex justify-content-between align-items-center">
                        <small class="text-muted">${formatDate(review.date)}</small>
                        <div class="btn-group" role="group">
                            ${review.status === "pending"
                    ? `
                                <button class="btn btn-sm btn-success" onclick="approveReview(${review.id})">
                                    <i class="fas fa-check"></i> Approve
                                </button>
                                <button class="btn btn-sm btn-danger" onclick="rejectReview(${review.id})">
                                    <i class="fas fa-times"></i> Reject
                                </button>
                            `
                    : `
                                <button class="btn btn-sm btn-outline-primary" onclick="editReview(${review.id})">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn-sm btn-outline-danger" onclick="deleteReview(${review.id})">
                                    <i class="fas fa-trash"></i>
                                </button>
                            `
                }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
        )
        .join("")
}

function filterMessages() {
    const typeFilter = document.getElementById("messageTypeFilter").value
    const statusFilter = document.getElementById("messageStatusFilter").value

    filteredMessages = messages.filter((message) => {
        let matches = true

        if (typeFilter && message.type !== typeFilter) matches = false
        if (statusFilter && message.status !== statusFilter) matches = false

        return matches
    })

    renderMessages()
}

function renderMessages() {
    const list = document.getElementById("messagesList")
    list.innerHTML = filteredMessages
        .map(
            (message) => `
        <div class="message-item mb-3">
            <div class="card ${message.status === "new" ? "border-primary" : ""}">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <div>
                            <h6 class="mb-1">${message.subject}</h6>
                            <small class="text-muted">from ${message.from}</small>
                        </div>
                        <div class="text-end">
                            <span class="badge bg-${getMessageTypeColor(message.type)}">${message.type}</span>
                            <span class="badge bg-${getMessageStatusColor(message.status)} ms-1">${message.status}</span>
                            ${message.priority === "urgent" ? '<i class="fas fa-exclamation-triangle text-danger ms-1"></i>' : ""}
                            ${message.priority === "high" ? '<i class="fas fa-exclamation text-warning ms-1"></i>' : ""}
                        </div>
                    </div>
                    <p class="card-text text-muted">${message.preview}</p>
                    <div class="d-flex justify-content-between align-items-center">
                        <small class="text-muted">${formatDate(message.date)}</small>
                        <div class="btn-group" role="group">
                            <button class="btn btn-sm btn-outline-primary" onclick="replyToMessage(${message.id})">
                                <i class="fas fa-reply"></i> Reply
                            </button>
                            <button class="btn btn-sm btn-outline-info" onclick="viewMessage(${message.id})">
                                <i class="fas fa-eye"></i> View
                            </button>
                            <button class="btn btn-sm btn-outline-success" onclick="markResolved(${message.id})">
                                <i class="fas fa-check"></i> Resolve
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
        )
        .join("")
}

// Helper functions
function getUserTypeColor(userType) {
    const colors = {
        admin: "danger",
        doctor: "success",
        patient: "primary",
        staff: "info",
    }
    return colors[userType] || "secondary"
}

function getUserTypeIcon(userType) {
    const icons = {
        admin: "shield-alt",
        doctor: "user-md",
        patient: "user",
        staff: "user-nurse",
    }
    return icons[userType] || "user"
}

function getActionBadgeColor(action) {
    const colors = {
        CREATE: "success",
        UPDATE: "warning",
        DELETE: "danger",
        LOGIN: "info",
    }
    return colors[action] || "secondary"
}

function getStatusBadgeColor(status) {
    const colors = {
        scheduled: "primary",
        completed: "success",
        cancelled: "danger",
        pending: "warning",
        active: "success",
        inactive: "secondary",
    }
    return colors[status] || "secondary"
}

function getReviewStatusColor(status) {
    const colors = {
        approved: "success",
        pending: "warning",
        rejected: "danger",
    }
    return colors[status] || "secondary"
}

function getMessageTypeColor(type) {
    const colors = {
        support: "primary",
        complaint: "danger",
        inquiry: "info",
        feedback: "success",
    }
    return colors[type] || "secondary"
}

function getMessageStatusColor(status) {
    const colors = {
        new: "primary",
        "in-progress": "warning",
        resolved: "success",
        closed: "secondary",
    }
    return colors[status] || "secondary"
}

function generateStars(rating) {
    let stars = ""
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            stars += '<i class="fas fa-star text-warning"></i>'
        } else {
            stars += '<i class="far fa-star text-muted"></i>'
        }
    }
    return stars
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    })
}

// Action functions
function scheduleAppointment() {
    const form = document.getElementById("scheduleAppointmentForm")
    if (!form.checkValidity()) {
        form.reportValidity()
        return
    }

    const newAppointment = {
        id: appointments.length + 1,
        patient: document.getElementById("appointmentPatient").selectedOptions[0].text,
        doctor: document.getElementById("appointmentDoctor").selectedOptions[0].text,
        date: document.getElementById("appointmentDate").value,
        time: document.getElementById("appointmentTime").value,
        type: document.getElementById("appointmentType").value,
        status: "scheduled",
        notes: document.getElementById("appointmentNotes").value,
    }

    appointments.push(newAppointment)
    filteredAppointments = [...appointments]
    renderAppointments()

    const modal = bootstrap.Modal.getInstance(document.getElementById("scheduleAppointmentModal"))
    modal.hide()
    form.reset()

    alert("Appointment scheduled successfully!")
}

function sendMessage() {
    const form = document.getElementById("composeMessageForm")
    if (!form.checkValidity()) {
        form.reportValidity()
        return
    }

    const newMessage = {
        id: messages.length + 1,
        from: "admin@healthcare.com",
        subject: document.getElementById("messageSubject").value,
        type: "support",
        status: "new",
        date: new Date().toISOString().split("T")[0],
        priority: document.getElementById("messagePriority").value,
        preview: document.getElementById("messageContent").value.substring(0, 100) + "...",
    }

    messages.unshift(newMessage)
    filteredMessages = [...messages]
    renderMessages()

    const modal = bootstrap.Modal.getInstance(document.getElementById("composeMessageModal"))
    modal.hide()
    form.reset()

    alert("Message sent successfully!")
}

function approveReview(reviewId) {
    const review = reviews.find((r) => r.id === reviewId)
    if (review) {
        review.status = "approved"
        renderReviews()
        alert("Review approved successfully!")
    }
}

function rejectReview(reviewId) {
    if (confirm("Are you sure you want to reject this review?")) {
        const review = reviews.find((r) => r.id === reviewId)
        if (review) {
            review.status = "rejected"
            renderReviews()
            alert("Review rejected!")
        }
    }
}

function markResolved(messageId) {
    const message = messages.find((m) => m.id === messageId)
    if (message) {
        message.status = "resolved"
        renderMessages()
        alert("Message marked as resolved!")
    }
}

function exportAuditLogs() {
    const headers = ["Timestamp", "User", "Action", "Table", "Record ID", "IP Address", "Details"]
    const csvContent = [
        headers.join(","),
        ...filteredAuditLogs.map((log) =>
            [log.timestamp, log.user, log.action, log.table, log.recordId, log.ipAddress, `"${log.details}"`].join(","),
        ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "audit_logs.csv"
    a.click()
    window.URL.revokeObjectURL(url)
}

function exportReviews() {
    const headers = ["Patient", "Doctor", "Rating", "Comment", "Date", "Status"]
    const csvContent = [
        headers.join(","),
        ...filteredReviews.map((review) =>
            [review.patient, review.doctor, review.rating, `"${review.comment}"`, review.date, review.status].join(","),
        ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "reviews.csv"
    a.click()
    window.URL.revokeObjectURL(url)
}

function clearAuditLogs() {
    if (confirm("Are you sure you want to clear old audit logs? This action cannot be undone.")) {
        // In a real application, this would clear logs older than a certain date
        alert("Old audit logs cleared successfully!")
    }
}

function exportSystemData() {
    alert("System data export initiated. You will receive an email when the export is ready.")
}

function createBackup() {
    if (confirm("Create a system backup now? This may take a few minutes.")) {
        alert("Backup creation started. You will be notified when it's complete.")
    }
}

function saveSettings() {
    alert("Settings saved successfully!")
}

function resetSettings() {
    if (confirm("Reset all settings to default values?")) {
        alert("Settings reset to default values!")
    }
}

function showTab(tabName) {
    const tab = document.querySelector(`[data-bs-target="#${tabName}"]`)
    if (tab) {
        const tabInstance = new bootstrap.Tab(tab)
        tabInstance.show()
    }
}

function logout() {
    if (confirm("Are you sure you want to logout?")) {
        localStorage.clear()
        window.location.href = "index.html"
    }
}

// Declare bootstrap variable
const bootstrap = window.bootstrap
