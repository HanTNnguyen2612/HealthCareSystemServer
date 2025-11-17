// Admin Users Management functionality
let users = []
let filteredUsers = []
let currentPage = 1
const usersPerPage = 10
const selectedUsers = new Set()
const bootstrap = window.bootstrap // Declare the bootstrap variable

document.addEventListener("DOMContentLoaded", () => {
    loadUsers()
    setupSearch()
})

function loadUsers() {
    // Sample users data
    users = [
        {
            id: 1,
            firstName: "John",
            lastName: "Doe",
            email: "john.doe@email.com",
            phone: "+1 (555) 123-4567",
            role: "patient",
            status: "active",
            registrationDate: "2024-01-15",
            lastLogin: "2024-01-20 14:30",
            verified: true,
            avatar: "/placeholder.svg?height=40&width=40",
        },
        {
            id: 2,
            firstName: "Dr. Sarah",
            lastName: "Johnson",
            email: "sarah.johnson@hospital.com",
            phone: "+1 (555) 234-5678",
            role: "doctor",
            status: "active",
            registrationDate: "2024-01-10",
            lastLogin: "2024-01-20 16:45",
            verified: true,
            avatar: "/placeholder.svg?height=40&width=40",
        },
        {
            id: 3,
            firstName: "Jane",
            lastName: "Smith",
            email: "jane.smith@email.com",
            phone: "+1 (555) 345-6789",
            role: "patient",
            status: "pending",
            registrationDate: "2024-01-18",
            lastLogin: "Never",
            verified: false,
            avatar: "/placeholder.svg?height=40&width=40",
        },
        {
            id: 4,
            firstName: "Dr. Michael",
            lastName: "Chen",
            email: "michael.chen@hospital.com",
            phone: "+1 (555) 456-7890",
            role: "doctor",
            status: "active",
            registrationDate: "2024-01-12",
            lastLogin: "2024-01-20 09:15",
            verified: true,
            avatar: "/placeholder.svg?height=40&width=40",
        },
        {
            id: 5,
            firstName: "Admin",
            lastName: "User",
            email: "admin@healthcare.com",
            phone: "+1 (555) 567-8901",
            role: "admin",
            status: "active",
            registrationDate: "2024-01-01",
            lastLogin: "2024-01-20 17:00",
            verified: true,
            avatar: "/placeholder.svg?height=40&width=40",
        },
        {
            id: 6,
            firstName: "Emily",
            lastName: "Davis",
            email: "emily.davis@email.com",
            phone: "+1 (555) 678-9012",
            role: "patient",
            status: "suspended",
            registrationDate: "2024-01-08",
            lastLogin: "2024-01-15 11:20",
            verified: true,
            avatar: "/placeholder.svg?height=40&width=40",
        },
        {
            id: 7,
            firstName: "Nurse",
            lastName: "Wilson",
            email: "nurse.wilson@hospital.com",
            phone: "+1 (555) 789-0123",
            role: "staff",
            status: "active",
            registrationDate: "2024-01-14",
            lastLogin: "2024-01-20 13:45",
            verified: true,
            avatar: "/placeholder.svg?height=40&width=40",
        },
        {
            id: 8,
            firstName: "Robert",
            lastName: "Brown",
            email: "robert.brown@email.com",
            phone: "+1 (555) 890-1234",
            role: "patient",
            status: "inactive",
            registrationDate: "2024-01-05",
            lastLogin: "2024-01-10 08:30",
            verified: false,
            avatar: "/placeholder.svg?height=40&width=40",
        },
    ]

    filteredUsers = [...users]
    renderUsers()
    renderPagination()
}

function setupSearch() {
    const searchInput = document.getElementById("searchInput")
    searchInput.addEventListener("input", (e) => {
        const searchTerm = e.target.value.toLowerCase()
        filteredUsers = users.filter(
            (user) =>
                user.firstName.toLowerCase().includes(searchTerm) ||
                user.lastName.toLowerCase().includes(searchTerm) ||
                user.email.toLowerCase().includes(searchTerm) ||
                user.role.toLowerCase().includes(searchTerm),
        )
        currentPage = 1
        renderUsers()
        renderPagination()
    })
}

function applyFilters() {
    const roleFilter = document.getElementById("roleFilter").value
    const statusFilter = document.getElementById("statusFilter").value
    const dateFilter = document.getElementById("dateFilter").value
    const verificationFilter = document.getElementById("verificationFilter").value

    filteredUsers = users.filter((user) => {
        let matches = true

        if (roleFilter && user.role !== roleFilter) matches = false
        if (statusFilter && user.status !== statusFilter) matches = false
        if (verificationFilter) {
            if (verificationFilter === "verified" && !user.verified) matches = false
            if (verificationFilter === "unverified" && user.verified) matches = false
        }

        // Date filtering logic would go here
        if (dateFilter) {
            const userDate = new Date(user.registrationDate)
            const now = new Date()

            switch (dateFilter) {
                case "today":
                    matches = matches && userDate.toDateString() === now.toDateString()
                    break
                case "week":
                    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
                    matches = matches && userDate >= weekAgo
                    break
                case "month":
                    matches = matches && userDate.getMonth() === now.getMonth() && userDate.getFullYear() === now.getFullYear()
                    break
                case "year":
                    matches = matches && userDate.getFullYear() === now.getFullYear()
                    break
            }
        }

        return matches
    })

    currentPage = 1
    renderUsers()
    renderPagination()
}

function clearFilters() {
    document.getElementById("roleFilter").value = ""
    document.getElementById("statusFilter").value = ""
    document.getElementById("dateFilter").value = ""
    document.getElementById("verificationFilter").value = ""
    document.getElementById("searchInput").value = ""

    filteredUsers = [...users]
    currentPage = 1
    renderUsers()
    renderPagination()
}

function renderUsers() {
    const startIndex = (currentPage - 1) * usersPerPage
    const endIndex = startIndex + usersPerPage
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex)

    const tbody = document.getElementById("usersTableBody")
    tbody.innerHTML = paginatedUsers
        .map(
            (user) => `
        <tr>
            <td>
                <input type="checkbox" class="user-checkbox" value="${user.id}" onchange="toggleUserSelection(${user.id})">
            </td>
            <td>
                <div class="d-flex align-items-center">
                    <img src="${user.avatar}" alt="${user.firstName}" class="rounded-circle me-2" width="40" height="40">
                    <div>
                        <div class="fw-bold">${user.firstName} ${user.lastName}</div>
                        <small class="text-muted">${user.email}</small>
                        ${user.verified ? '<i class="fas fa-check-circle text-success ms-1" title="Verified"></i>' : '<i class="fas fa-exclamation-circle text-warning ms-1" title="Unverified"></i>'}
                    </div>
                </div>
            </td>
            <td>
                <span class="badge bg-${getRoleBadgeColor(user.role)}">${user.role.charAt(0).toUpperCase() + user.role.slice(1)}</span>
            </td>
            <td>
                <span class="badge bg-${getStatusBadgeColor(user.status)}">${user.status.charAt(0).toUpperCase() + user.status.slice(1)}</span>
            </td>
            <td>${formatDate(user.registrationDate)}</td>
            <td>${user.lastLogin}</td>
            <td>
                <div class="btn-group" role="group">
                    <button class="btn btn-sm btn-outline-primary" onclick="editUser(${user.id})" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-info" onclick="viewUser(${user.id})" title="View">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteUser(${user.id})" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `,
        )
        .join("")
}

function renderPagination() {
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage)
    const pagination = document.getElementById("pagination")

    let paginationHTML = ""

    // Previous button
    paginationHTML += `
        <li class="page-item ${currentPage === 1 ? "disabled" : ""}">
            <a class="page-link" href="#" onclick="changePage(${currentPage - 1})">Previous</a>
        </li>
    `

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
            paginationHTML += `
                <li class="page-item ${i === currentPage ? "active" : ""}">
                    <a class="page-link" href="#" onclick="changePage(${i})">${i}</a>
                </li>
            `
        } else if (i === currentPage - 3 || i === currentPage + 3) {
            paginationHTML += `<li class="page-item disabled"><span class="page-link">...</span></li>`
        }
    }

    // Next button
    paginationHTML += `
        <li class="page-item ${currentPage === totalPages ? "disabled" : ""}">
            <a class="page-link" href="#" onclick="changePage(${currentPage + 1})">Next</a>
        </li>
    `

    pagination.innerHTML = paginationHTML
}

function changePage(page) {
    if (page >= 1 && page <= Math.ceil(filteredUsers.length / usersPerPage)) {
        currentPage = page
        renderUsers()
        renderPagination()
    }
}

function getRoleBadgeColor(role) {
    const colors = {
        patient: "primary",
        doctor: "success",
        admin: "danger",
        staff: "info",
    }
    return colors[role] || "secondary"
}

function getStatusBadgeColor(status) {
    const colors = {
        active: "success",
        inactive: "secondary",
        suspended: "danger",
        pending: "warning",
    }
    return colors[status] || "secondary"
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    })
}

function toggleSelectAll() {
    const selectAll = document.getElementById("selectAll")
    const checkboxes = document.querySelectorAll(".user-checkbox")

    checkboxes.forEach((checkbox) => {
        checkbox.checked = selectAll.checked
        if (selectAll.checked) {
            selectedUsers.add(Number.parseInt(checkbox.value))
        } else {
            selectedUsers.delete(Number.parseInt(checkbox.value))
        }
    })

    updateBulkActions()
}

function toggleUserSelection(userId) {
    if (selectedUsers.has(userId)) {
        selectedUsers.delete(userId)
    } else {
        selectedUsers.add(userId)
    }

    updateBulkActions()
}

function updateBulkActions() {
    const bulkActionsCard = document.getElementById("bulkActionsCard")
    const selectedCount = document.getElementById("selectedCount")

    if (selectedUsers.size > 0) {
        bulkActionsCard.style.display = "block"
        selectedCount.textContent = selectedUsers.size
    } else {
        bulkActionsCard.style.display = "none"
    }
}

function addUser() {
    const form = document.getElementById("addUserForm")
    const formData = new FormData(form)

    // Basic validation
    if (!form.checkValidity()) {
        form.reportValidity()
        return
    }

    const newUser = {
        id: users.length + 1,
        firstName: document.getElementById("firstName").value,
        lastName: document.getElementById("lastName").value,
        email: document.getElementById("email").value,
        phone: document.getElementById("phone").value,
        role: document.getElementById("role").value,
        status: document.getElementById("status").value,
        registrationDate: new Date().toISOString().split("T")[0],
        lastLogin: "Never",
        verified: false,
        avatar: "/placeholder.svg?height=40&width=40",
    }

    users.push(newUser)
    filteredUsers = [...users]
    renderUsers()
    renderPagination()

    // Close modal and reset form
    const modal = bootstrap.Modal.getInstance(document.getElementById("addUserModal"))
    modal.hide()
    form.reset()

    alert("User added successfully!")
}

function editUser(userId) {
    const user = users.find((u) => u.id === userId)
    if (!user) return

    // Populate edit form
    document.getElementById("editUserId").value = user.id
    document.getElementById("editFirstName").value = user.firstName
    document.getElementById("editLastName").value = user.lastName
    document.getElementById("editEmail").value = user.email
    document.getElementById("editPhone").value = user.phone
    document.getElementById("editRole").value = user.role
    document.getElementById("editStatus").value = user.status

    // Show modal
    const modal = new bootstrap.Modal(document.getElementById("editUserModal"))
    modal.show()
}

function updateUser() {
    const userId = Number.parseInt(document.getElementById("editUserId").value)
    const userIndex = users.findIndex((u) => u.id === userId)

    if (userIndex === -1) return

    // Update user data
    users[userIndex] = {
        ...users[userIndex],
        firstName: document.getElementById("editFirstName").value,
        lastName: document.getElementById("editLastName").value,
        email: document.getElementById("editEmail").value,
        phone: document.getElementById("editPhone").value,
        role: document.getElementById("editRole").value,
        status: document.getElementById("editStatus").value,
    }

    filteredUsers = [...users]
    renderUsers()

    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById("editUserModal"))
    modal.hide()

    alert("User updated successfully!")
}

function viewUser(userId) {
    const user = users.find((u) => u.id === userId)
    if (!user) return

    alert(
        `User Details:\nName: ${user.firstName} ${user.lastName}\nEmail: ${user.email}\nRole: ${user.role}\nStatus: ${user.status}`,
    )
}

function deleteUser(userId) {
    if (confirm("Are you sure you want to delete this user?")) {
        users = users.filter((u) => u.id !== userId)
        filteredUsers = [...users]
        renderUsers()
        renderPagination()
        alert("User deleted successfully!")
    }
}

function bulkAction(action) {
    if (selectedUsers.size === 0) return

    const actionText = action === "activate" ? "activate" : action === "suspend" ? "suspend" : "delete"

    if (confirm(`Are you sure you want to ${actionText} ${selectedUsers.size} selected users?`)) {
        selectedUsers.forEach((userId) => {
            const userIndex = users.findIndex((u) => u.id === userId)
            if (userIndex !== -1) {
                if (action === "delete") {
                    users.splice(userIndex, 1)
                } else if (action === "activate") {
                    users[userIndex].status = "active"
                } else if (action === "suspend") {
                    users[userIndex].status = "suspended"
                }
            }
        })

        selectedUsers.clear()
        filteredUsers = [...users]
        renderUsers()
        renderPagination()
        updateBulkActions()

        alert(`Bulk ${actionText} completed successfully!`)
    }
}

function exportUsers(format) {
    if (format === "csv") {
        exportToCSV()
    } else if (format === "pdf") {
        exportToPDF()
    }
}

function exportToCSV() {
    const headers = [
        "ID",
        "First Name",
        "Last Name",
        "Email",
        "Phone",
        "Role",
        "Status",
        "Registration Date",
        "Last Login",
    ]
    const csvContent = [
        headers.join(","),
        ...filteredUsers.map((user) =>
            [
                user.id,
                user.firstName,
                user.lastName,
                user.email,
                user.phone,
                user.role,
                user.status,
                user.registrationDate,
                user.lastLogin,
            ].join(","),
        ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "users.csv"
    a.click()
    window.URL.revokeObjectURL(url)
}

function exportToPDF() {
    alert("PDF export functionality would be implemented here using a library like jsPDF")
}

function logout() {
    if (confirm("Are you sure you want to logout?")) {
        localStorage.clear()
        window.location.href = "index.html"
    }
}
