// Admin Users Management functionality
let users = []
let filteredUsers = []
let currentPage = 1
const usersPerPage = 10
const selectedUsers = new Set()
const bootstrap = window.bootstrap // Declare the bootstrap variable

// Định nghĩa endpoint API
const API_BASE_URL = "https://localhost:7293/api/user"

document.addEventListener("DOMContentLoaded", () => {
    loadUsers()
    setupSearch()
})

// --- CẬP NHẬT: Tải dữ liệu từ API ---
async function loadUsers() {
    try {
        const response = await fetch(API_BASE_URL)
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }
        const userList = await response.json()

        // Chuyển đổi DTO API thành cấu trúc dữ liệu cũ (với các thay đổi)
        users = userList.map(apiUser => ({
            id: apiUser.userId,
            firstName: apiUser.fullName.split(' ')[0] || "",
            lastName: apiUser.fullName.split(' ').slice(1).join(' ') || "",
            email: apiUser.email,
            phone: apiUser.phoneNumber || "N/A",
            role: apiUser.role.toLowerCase() || "patient", // Đảm bảo role là chữ thường
            // Sử dụng IsActive để xác định status và thêm trường isBanned
            status: apiUser.isActive ? "active" : "suspended",
            isBanned: !apiUser.isActive, // isBanned là ngược lại của IsActive
            registrationDate: apiUser.createdAt ? apiUser.createdAt.split('T')[0] : "N/A",
            lastLogin: apiUser.updatedAt ? new Date(apiUser.updatedAt).toLocaleString() : "Never",
            verified: true, // Giả định là đã xác thực nếu có trong DB
            avatar: apiUser.avatarUrl || "/placeholder.svg?height=40&width=40",
        }))

    } catch (error) {
        console.error("Error loading users from API:", error)
        // Dùng dữ liệu mẫu nếu API thất bại (Tùy chọn)
        // users = [{ id: 999, firstName: "API", lastName: "Error", ... }];
        alert("Failed to load users from API. Check console for details.")
    }

    // Reset bộ lọc và hiển thị
    filteredUsers = [...users]
    renderUsers()
    renderPagination()
}

// Hàm này không cần thay đổi nếu cấu trúc dữ liệu mới tương thích
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

// Hàm áp dụng bộ lọc không cần thay đổi nhiều, nhưng cần lưu ý trường 'status'
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

        // Date filtering logic (giữ nguyên)
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

// --- CẬP NHẬT: Hiển thị nút Ban/Unban ---
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
                <input type="checkbox" class="user-checkbox" value="${user.id}" onchange="toggleUserSelection(${user.id})" ${selectedUsers.has(user.id) ? 'checked' : ''}>
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
                ${user.isBanned ? '<span class="badge bg-danger ms-1" title="Banned">BANNED</span>' : ''}
            </td>
            <td>${formatDate(user.registrationDate)}</td>
            <td>${user.lastLogin}</td>
            <td>
                <div class="btn-group" role="group">
                    <button class="btn btn-sm btn-outline-info" onclick="viewUser(${user.id})" title="View">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-${user.isBanned ? 'success' : 'danger'}" onclick="toggleUserBanStatus(${user.id})" title="${user.isBanned ? 'Unban User' : 'Ban User'}">
                        <i class="fas fa-${user.isBanned ? 'unlock' : 'ban'}"></i>
                    </button>                   
                </div>
            </td>
        </tr>
    `
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

    // Page numbers (giữ nguyên logic hiển thị trang)
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

// Cập nhật để thể hiện trạng thái ban rõ ràng hơn
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
    if (dateString === "N/A") return "N/A"
    return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    })
}

function toggleSelectAll() {
    const selectAll = document.getElementById("selectAll")
    // Chỉ chọn những user đang được hiển thị trên trang hiện tại
    const startIndex = (currentPage - 1) * usersPerPage
    const endIndex = startIndex + usersPerPage
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex)
    const paginatedUserIds = new Set(paginatedUsers.map(user => user.id))

    const checkboxes = document.querySelectorAll(".user-checkbox")

    checkboxes.forEach((checkbox) => {
        const userId = Number.parseInt(checkbox.value)
        if (paginatedUserIds.has(userId)) {
            checkbox.checked = selectAll.checked
            if (selectAll.checked) {
                selectedUsers.add(userId)
            } else {
                selectedUsers.delete(userId)
            }
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

    // Cập nhật trạng thái của checkbox "Select All" nếu cần
    const totalUsersOnPage = document.querySelectorAll(".user-checkbox").length
    const checkedUsersOnPage = document.querySelectorAll(".user-checkbox:checked").length
    document.getElementById("selectAll").checked = totalUsersOnPage > 0 && totalUsersOnPage === checkedUsersOnPage

    updateBulkActions()
}

function updateBulkActions() {
    const bulkActionsCard = document.getElementById("bulkActionsCard")
    const selectedCount = document.getElementById("selectedCount")

    if (selectedUsers.size > 0) {
        bulkActionsCard.style.display = "block"
        selectedCount.textContent = selectedUsers.size
        // Bạn có thể cập nhật các tùy chọn Bulk Action ở đây nếu cần (ví dụ: chỉ hiện Ban/Unban)
    } else {
        bulkActionsCard.style.display = "none"
    }
}

// Giữ nguyên các hàm thêm/sửa/xem người dùng (để hoàn thiện UI sau)
function addUser() {
    // Để thực tế, hàm này cần gọi API POST /api/user để tạo user mới
    alert("Add User functionality needs API integration (POST /api/user)")
}

function editUser(userId) {
    // Để thực tế, hàm này cần gọi API PUT/PATCH /api/user/{userId} để cập nhật user
    const user = users.find((u) => u.id === userId)
    if (!user) return

    // Populate edit form
    document.getElementById("editUserId").value = user.id
    document.getElementById("editFirstName").value = user.firstName
    document.getElementById("editLastName").value = user.lastName
    document.getElementById("editEmail").value = user.email
    document.getElementById("editPhone").value = user.phone
    document.getElementById("editRole").value = user.role
    document.getElementById("editStatus").value = user.status // Giữ nguyên cho đến khi có API update

    // Show modal
    const modal = new bootstrap.Modal(document.getElementById("editUserModal"))
    modal.show()
}

function updateUser() {
    // Để thực tế, hàm này cần gọi API PUT/PATCH /api/user/{userId} để cập nhật user
    alert("Update User functionality needs API integration (PUT /api/user/{userId})")

    // Đóng modal và tải lại dữ liệu (chỉ là tạm thời)
    const modal = bootstrap.Modal.getInstance(document.getElementById("editUserModal"))
    modal.hide()
    loadUsers()
}

function viewUser(userId) {
    const user = users.find((u) => u.id === userId)
    if (!user) return

    alert(
        `User Details:\nName: ${user.firstName} ${user.lastName}\nEmail: ${user.email}\nRole: ${user.role}\nStatus: ${user.status} ${user.isBanned ? '(BANNED)' : '(ACTIVE)'}\nPhone: ${user.phone}`,
    )
}

// --- CẬP NHẬT: Thay thế deleteUser bằng toggleUserBanStatus ---
async function toggleUserBanStatus(userId) {
    const user = users.find((u) => u.id === userId)
    if (!user) return

    const action = user.isBanned ? "Unban" : "Ban"
    const confirmMessage = `Are you sure you want to ${action} user: ${user.firstName} ${user.lastName} (ID: ${userId})?`

    if (confirm(confirmMessage)) {
        try {
            const response = await fetch(`${API_BASE_URL}/ban-unban-user/${userId}`, {
                method: 'POST', // API của bạn sử dụng POST, tôi giữ nguyên
                headers: {
                    'Content-Type': 'application/json',
                    // Thêm Authorization header nếu cần (tùy thuộc vào cách bạn quản lý token admin)
                    // 'Authorization': 'Bearer YOUR_ADMIN_TOKEN_HERE' 
                },
                // Body không cần thiết với endpoint này nhưng nếu API yêu cầu, có thể thêm:
                // body: JSON.stringify({ userId: userId }),
            })

            if (!response.ok) {
                // Đọc thông báo lỗi từ body nếu có, hoặc dùng status mặc định
                const errorText = await response.text()
                throw new Error(`Failed to ${action} user. Status: ${response.status}. Message: ${errorText}`)
            }

            // Xử lý thành công
            alert(`${action} successful!`)
            // Tải lại dữ liệu người dùng để cập nhật trạng thái
            await loadUsers()

        } catch (error) {
            console.error(`Error during ${action} operation:`, error)
            alert(`Operation failed: ${error.message}`)
        }
    }
}
// Đổi tên hàm deleteUser cũ thành toggleUserBanStatus để tránh nhầm lẫn
const deleteUser = toggleUserBanStatus // Giữ dòng này để nếu có element nào vẫn gọi deleteUser thì nó sẽ gọi toggleUserBanStatus

function bulkAction(action) {
    if (selectedUsers.size === 0) return

    // Cập nhật logic để hỗ trợ Bulk Ban/Unban nếu bạn muốn
    // Hiện tại, bulkAction chỉ có 'activate', 'suspend', 'delete'. 
    // Chúng ta sẽ cần cập nhật nó để call API nếu muốn dùng Bulk Ban/Unban thật.

    const actionText = action === "activate" ? "activate" : action === "suspend" ? "suspend" : "delete"

    if (action === "delete") {
        // Thay đổi Bulk Delete thành Bulk Ban (hoặc bỏ qua Bulk Delete hoàn toàn)
        alert("Bulk Delete is disabled. Use Bulk Ban/Unban functionality (not yet implemented with API).")
        return
    }

    // Logic Bulk Actions cũ (chỉ cập nhật UI local)
    if (confirm(`Are you sure you want to ${actionText} ${selectedUsers.size} selected users?`)) {
        selectedUsers.forEach((userId) => {
            const userIndex = users.findIndex((u) => u.id === userId)
            if (userIndex !== -1) {
                if (action === "activate") {
                    users[userIndex].status = "active"
                    users[userIndex].isBanned = false
                } else if (action === "suspend") {
                    users[userIndex].status = "suspended"
                    users[userIndex].isBanned = true // Có thể map suspend với ban/unban
                }
            }
        })

        selectedUsers.clear()
        filteredUsers = [...users]
        renderUsers()
        renderPagination()
        updateBulkActions()

        alert(`Bulk ${actionText} completed successfully (Local update only)!`)
        // Cần gọi loadUsers() nếu muốn cập nhật từ API sau khi Bulk Action
    }
}

// Giữ nguyên các hàm export và logout
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
        "Is Banned",
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
                user.isBanned ? 'True' : 'False',
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