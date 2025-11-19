// Admin Dashboard functionality
let userChart, appointmentChart, revenueChart
const Chart = window.Chart

document.addEventListener("DOMContentLoaded", () => {
    initializeCharts()
    loadRecentActivities()
    loadSystemAlerts()
    updateStatistics()
})

function initializeCharts() {
    // User Registration Chart
    const userCtx = document.getElementById("userChart")
    if (userCtx) {
        userChart = new Chart(userCtx.getContext("2d"), {
            type: "line",
            data: {
                labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
                datasets: [
                    {
                        label: "New Users",
                        data: [65, 78, 90, 81, 95, 105, 110, 125, 140, 155, 170, 185],
                        borderColor: "#3b82f6",
                        backgroundColor: "rgba(59, 130, 246, 0.1)",
                        tension: 0.4,
                        fill: true,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false,
                    },
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: "#e2e8f0",
                        },
                    },
                    x: {
                        grid: {
                            color: "#e2e8f0",
                        },
                    },
                },
            },
        })
    }

    // Appointment Statistics Chart
    const appointmentCtx = document.getElementById("appointmentChart")
    if (appointmentCtx) {
        appointmentChart = new Chart(appointmentCtx.getContext("2d"), {
            type: "doughnut",
            data: {
                labels: ["Completed", "Scheduled", "Cancelled", "Pending"],
                datasets: [
                    {
                        data: [65, 25, 7, 3],
                        backgroundColor: ["#10b981", "#3b82f6", "#ef4444", "#f59e0b"],
                        borderWidth: 0,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: "bottom",
                        labels: {
                            padding: 20,
                            usePointStyle: true,
                        },
                    },
                },
            },
        })
    }

    // Revenue Chart
    const revenueCtx = document.getElementById("revenueChart")
    if (revenueCtx) {
        revenueChart = new Chart(revenueCtx.getContext("2d"), {
            type: "bar",
            data: {
                labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
                datasets: [
                    {
                        label: "Revenue ($)",
                        data: [45000, 52000, 48000, 61000, 55000, 67000, 73000, 69000, 78000, 85000, 89000, 94000],
                        backgroundColor: "#06b6d4",
                        borderRadius: 4,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false,
                    },
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: "#e2e8f0",
                        },
                        ticks: {
                            callback: (value) => "$" + value.toLocaleString(),
                        },
                    },
                    x: {
                        grid: {
                            display: false,
                        },
                    },
                },
            },
        })
    }
}

function updateChart(chartType, period) {
    if (chartType === "users") {
        // Update user chart based on period
        let newData
        switch (period) {
            case 7:
                newData = [12, 15, 18, 22, 25, 28, 32]
                userChart.data.labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
                break
            case 30:
                newData = [65, 78, 90, 81, 95, 105, 110, 125, 140, 155, 170, 185]
                userChart.data.labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
                break
            case 90:
                newData = [200, 250, 300, 280, 320, 350, 380, 400, 420, 450, 480, 500]
                userChart.data.labels = ["Q1", "Q2", "Q3", "Q4"]
                break
        }
        userChart.data.datasets[0].data = newData
        userChart.update()
    } else if (chartType === "appointments") {
        // Update appointment chart based on period
        let newData
        switch (period) {
            case "week":
                newData = [45, 35, 15, 5]
                break
            case "month":
                newData = [65, 25, 7, 3]
                break
            case "year":
                newData = [70, 20, 8, 2]
                break
        }
        appointmentChart.data.datasets[0].data = newData
        appointmentChart.update()
    }
}

function updateRevenueChart(period) {
    let newData, newLabels

    switch (period) {
        case "daily":
            newData = [2500, 3200, 2800, 3500, 4100, 3800, 4200]
            newLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
            break
        case "monthly":
            newData = [45000, 52000, 48000, 61000, 55000, 67000, 73000, 69000, 78000, 85000, 89000, 94000]
            newLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
            break
        case "yearly":
            newData = [450000, 520000, 580000, 640000, 720000]
            newLabels = ["2020", "2021", "2022", "2023", "2024"]
            break
    }

    revenueChart.data.datasets[0].data = newData
    revenueChart.data.labels = newLabels
    revenueChart.update()

    // Update button states
    document.querySelectorAll(".card-header .btn").forEach((btn) => {
        btn.classList.remove("btn-primary")
        btn.classList.add("btn-outline-primary")
    })
    event.target.classList.remove("btn-outline-primary")
    event.target.classList.add("btn-primary")
}

function loadRecentActivities() {
    const activities = [
        {
            user: "Dr. Sarah Johnson",
            action: "Updated profile information",
            time: "2 minutes ago",
            type: "profile",
            icon: "fa-user",
        },
        {
            user: "John Doe",
            action: "Booked new appointment",
            time: "15 minutes ago",
            type: "appointment",
            icon: "fa-calendar",
        },
        {
            user: "Admin",
            action: "Published new article",
            time: "1 hour ago",
            type: "content",
            icon: "fa-file-alt",
        },
        {
            user: "Dr. Michael Chen",
            action: "Completed patient consultation",
            time: "2 hours ago",
            type: "consultation",
            icon: "fa-stethoscope",
        },
        {
            user: "Jane Smith",
            action: "Updated insurance information",
            time: "3 hours ago",
            type: "profile",
            icon: "fa-id-card",
        },
    ]

    const container = document.getElementById("recentActivities")
    container.innerHTML = activities
        .map(
            (activity) => `
        <div class="activity-item">
            <div class="activity-icon">
                <i class="fas ${activity.icon}"></i>
            </div>
            <div class="activity-content">
                <div class="activity-text">
                    <strong>${activity.user}</strong> ${activity.action}
                </div>
                <div class="activity-time">${activity.time}</div>
            </div>
        </div>
    `,
        )
        .join("")
}

function loadSystemAlerts() {
    const alerts = [
        {
            type: "warning",
            message: "Server storage is 85% full",
            time: "5 minutes ago",
            icon: "fa-exclamation-triangle",
        },
        {
            type: "info",
            message: "System backup completed successfully",
            time: "1 hour ago",
            icon: "fa-info-circle",
        },
        {
            type: "success",
            message: "Database optimization completed",
            time: "2 hours ago",
            icon: "fa-check-circle",
        },
        {
            type: "error",
            message: "Failed login attempts detected",
            time: "3 hours ago",
            icon: "fa-times-circle",
        },
    ]

    const container = document.getElementById("systemAlerts")
    container.innerHTML = alerts
        .map(
            (alert) => `
        <div class="alert-item ${alert.type}">
            <div class="alert-icon">
                <i class="fas ${alert.icon}"></i>
            </div>
            <div class="alert-content">
                <div class="alert-message">${alert.message}</div>
                <div class="alert-time">${alert.time}</div>
            </div>
        </div>
    `,
        )
        .join("")
}

function updateStatistics() {
    // Simulate real-time updates
    setInterval(() => {
        const totalUsers = document.getElementById("totalUsers")
        const currentUsers = Number.parseInt(totalUsers.textContent.replace(",", ""))
        totalUsers.textContent = (currentUsers + Math.floor(Math.random() * 3)).toLocaleString()

        const totalAppointments = document.getElementById("totalAppointments")
        const currentAppointments = Number.parseInt(totalAppointments.textContent.replace(",", ""))
        totalAppointments.textContent = (currentAppointments + Math.floor(Math.random() * 5)).toLocaleString()
    }, 30000) // Update every 30 seconds
}

function logout() {
    if (confirm("Are you sure you want to logout?")) {
        localStorage.clear()
        window.location.href = "index.html"
    }
}
