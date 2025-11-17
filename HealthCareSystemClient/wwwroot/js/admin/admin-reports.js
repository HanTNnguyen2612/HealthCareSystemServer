// Admin Reports functionality
let reports = []
let filteredReports = []
let currentPage = 1
const reportsPerPage = 10
const charts = {}
const Chart = window.Chart

document.addEventListener("DOMContentLoaded", () => {
    initializeCharts()
    loadReports()
    loadTopDoctors()
    loadRecentActivity()
    setupEventListeners()
})

function setupEventListeners() {
    // Date range filter change
    document.getElementById("dateRangeFilter").addEventListener("change", function () {
        const customDateRange = document.getElementById("customDateRange")
        if (this.value === "custom") {
            customDateRange.style.display = "block"
        } else {
            customDateRange.style.display = "none"
        }
    })

    // Schedule report checkbox
    document.getElementById("scheduleReport").addEventListener("change", function () {
        const scheduleOptions = document.getElementById("scheduleOptions")
        if (this.checked) {
            scheduleOptions.style.display = "block"
        } else {
            scheduleOptions.style.display = "none"
        }
    })
}

function initializeCharts() {
    initializeRevenueChart()
    initializeDemographicsChart()
    initializeAppointmentStatusChart()
    initializeDepartmentChart()
    initializePerformanceChart()
}

function initializeRevenueChart() {
    const ctx = document.getElementById("revenueTrendsChart")
    if (ctx) {
        charts.revenue = new Chart(ctx.getContext("2d"), {
            type: "line",
            data: {
                labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
                datasets: [
                    {
                        label: "Revenue ($)",
                        data: [45000, 52000, 48000, 61000, 55000, 67000, 73000, 69000, 78000, 85000, 89000, 94000],
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
                        ticks: {
                            callback: (value) => "$" + value.toLocaleString(),
                        },
                    },
                },
            },
        })
    }
}

function initializeDemographicsChart() {
    const ctx = document.getElementById("demographicsChart")
    if (ctx) {
        charts.demographics = new Chart(ctx.getContext("2d"), {
            type: "doughnut",
            data: {
                labels: ["18-25", "26-35", "36-45", "46-55", "56-65", "65+"],
                datasets: [
                    {
                        data: [15, 25, 20, 18, 12, 10],
                        backgroundColor: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"],
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
                    },
                },
            },
        })
    }
}

function initializeAppointmentStatusChart() {
    const ctx = document.getElementById("appointmentStatusChart")
    if (ctx) {
        charts.appointments = new Chart(ctx.getContext("2d"), {
            type: "pie",
            data: {
                labels: ["Completed", "Scheduled", "Cancelled", "No-Show"],
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
                    },
                },
            },
        })
    }
}

function initializeDepartmentChart() {
    const ctx = document.getElementById("departmentChart")
    if (ctx) {
        charts.departments = new Chart(ctx.getContext("2d"), {
            type: "bar",
            data: {
                labels: ["Cardiology", "Neurology", "Orthopedics", "Pediatrics", "Dermatology"],
                datasets: [
                    {
                        label: "Appointments",
                        data: [320, 280, 250, 200, 180],
                        backgroundColor: "#3b82f6",
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
                    },
                },
            },
        })
    }
}

function initializePerformanceChart() {
    const ctx = document.getElementById("performanceChart")
    if (ctx) {
        charts.performance = new Chart(ctx.getContext("2d"), {
            type: "bar",
            data: {
                labels: ["Dr. Johnson", "Dr. Chen", "Dr. Williams", "Dr. Brown", "Dr. Davis", "Dr. Wilson"],
                datasets: [
                    {
                        label: "Appointments",
                        data: [145, 132, 128, 115, 108, 95],
                        backgroundColor: "#10b981",
                        borderRadius: 4,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: "y",
                plugins: {
                    legend: {
                        display: false,
                    },
                },
                scales: {
                    x: {
                        beginAtZero: true,
                    },
                },
            },
        })
    }
}

function loadReports() {
    reports = [
        {
            id: 1,
            name: "Monthly Revenue Report",
            type: "Financial",
            dateRange: "Jan 1 - Jan 31, 2024",
            generatedBy: "Admin User",
            created: "2024-01-20",
            status: "completed",
            format: "PDF",
        },
        {
            id: 2,
            name: "Patient Demographics Analysis",
            type: "Analytics",
            dateRange: "Q4 2023",
            generatedBy: "Data Analyst",
            created: "2024-01-18",
            status: "completed",
            format: "Excel",
        },
        {
            id: 3,
            name: "Doctor Performance Review",
            type: "Performance",
            dateRange: "Dec 1 - Dec 31, 2023",
            generatedBy: "HR Manager",
            created: "2024-01-15",
            status: "processing",
            format: "PDF",
        },
        {
            id: 4,
            name: "Appointment Trends Report",
            type: "Operational",
            dateRange: "Last 6 months",
            generatedBy: "Operations Manager",
            created: "2024-01-12",
            status: "completed",
            format: "CSV",
        },
        {
            id: 5,
            name: "Patient Satisfaction Survey",
            type: "Quality",
            dateRange: "Q4 2023",
            generatedBy: "Quality Manager",
            created: "2024-01-10",
            status: "failed",
            format: "PDF",
        },
        {
            id: 6,
            name: "Department Efficiency Report",
            type: "Operational",
            dateRange: "Jan 1 - Jan 15, 2024",
            generatedBy: "Admin User",
            created: "2024-01-08",
            status: "completed",
            format: "Excel",
        },
    ]

    filteredReports = [...reports]
    renderReports()
    renderReportsPagination()
}

function loadTopDoctors() {
    const topDoctors = [
        {
            name: "Dr. Sarah Johnson",
            department: "Cardiology",
            appointments: 145,
            rating: 4.9,
            revenue: "$45,200",
        },
        {
            name: "Dr. Michael Chen",
            department: "Neurology",
            appointments: 132,
            rating: 4.8,
            revenue: "$38,900",
        },
        {
            name: "Dr. Emily Williams",
            department: "Orthopedics",
            appointments: 128,
            rating: 4.7,
            revenue: "$42,100",
        },
        {
            name: "Dr. Robert Brown",
            department: "Pediatrics",
            appointments: 115,
            rating: 4.9,
            revenue: "$32,500",
        },
        {
            name: "Dr. Lisa Davis",
            department: "Dermatology",
            appointments: 108,
            rating: 4.6,
            revenue: "$28,700",
        },
    ]

    const container = document.getElementById("topDoctors")
    container.innerHTML = topDoctors
        .map(
            (doctor) => `
    <div class="performance-item">
      <div class="performance-info">
        <div class="performance-name">${doctor.name}</div>
        <div class="performance-department">${doctor.department}</div>
      </div>
      <div class="performance-stats">
        <div class="stat-item">
          <span class="stat-value">${doctor.appointments}</span>
          <span class="stat-label">Appointments</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">${doctor.rating}</span>
          <span class="stat-label">Rating</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">${doctor.revenue}</span>
          <span class="stat-label">Revenue</span>
        </div>
      </div>
    </div>
  `,
        )
        .join("")
}

function loadRecentActivity() {
    const activities = [
        {
            action: "Generated Monthly Revenue Report",
            user: "Admin User",
            time: "2 hours ago",
            icon: "fa-file-pdf",
            color: "text-primary",
        },
        {
            action: "Exported Patient Data",
            user: "Data Analyst",
            time: "4 hours ago",
            icon: "fa-download",
            color: "text-success",
        },
        {
            action: "Scheduled Weekly Report",
            user: "Operations Manager",
            time: "6 hours ago",
            icon: "fa-clock",
            color: "text-warning",
        },
        {
            action: "Updated Dashboard Metrics",
            user: "System Admin",
            time: "8 hours ago",
            icon: "fa-chart-line",
            color: "text-info",
        },
        {
            action: "Created Custom Report",
            user: "HR Manager",
            time: "1 day ago",
            icon: "fa-plus",
            color: "text-secondary",
        },
    ]

    const container = document.getElementById("recentActivity")
    container.innerHTML = activities
        .map(
            (activity) => `
    <div class="activity-item">
      <div class="activity-icon ${activity.color}">
        <i class="fas ${activity.icon}"></i>
      </div>
      <div class="activity-content">
        <div class="activity-text">${activity.action}</div>
        <div class="activity-meta">
          <span class="activity-user">${activity.user}</span>
          <span class="activity-time">${activity.time}</span>
        </div>
      </div>
    </div>
  `,
        )
        .join("")
}

function renderReports() {
    const startIndex = (currentPage - 1) * reportsPerPage
    const endIndex = startIndex + reportsPerPage
    const paginatedReports = filteredReports.slice(startIndex, endIndex)

    const tbody = document.getElementById("reportsTable")
    tbody.innerHTML = paginatedReports
        .map(
            (report) => `
    <tr>
      <td>
        <div class="fw-bold">${report.name}</div>
      </td>
      <td>
        <span class="badge bg-${getReportTypeBadgeColor(report.type)}">${report.type}</span>
      </td>
      <td>${report.dateRange}</td>
      <td>${report.generatedBy}</td>
      <td>${formatDate(report.created)}</td>
      <td>
        <span class="badge bg-${getStatusBadgeColor(report.status)}">${report.status}</span>
      </td>
      <td>
        <div class="btn-group" role="group">
          <button class="btn btn-sm btn-outline-primary" onclick="viewReport(${report.id})" title="View">
            <i class="fas fa-eye"></i>
          </button>
          <button class="btn btn-sm btn-outline-success" onclick="downloadReport(${report.id})" title="Download">
            <i class="fas fa-download"></i>
          </button>
          <button class="btn btn-sm btn-outline-info" onclick="duplicateReport(${report.id})" title="Duplicate">
            <i class="fas fa-copy"></i>
          </button>
          <button class="btn btn-sm btn-outline-danger" onclick="deleteReport(${report.id})" title="Delete">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </td>
    </tr>
  `,
        )
        .join("")
}

function renderReportsPagination() {
    const totalPages = Math.ceil(filteredReports.length / reportsPerPage)
    const pagination = document.getElementById("reportsPagination")

    let paginationHTML = ""

    // Previous button
    paginationHTML += `
    <li class="page-item ${currentPage === 1 ? "disabled" : ""}">
      <a class="page-link" href="#" onclick="changeReportsPage(${currentPage - 1})">Previous</a>
    </li>
  `

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
            paginationHTML += `
        <li class="page-item ${i === currentPage ? "active" : ""}">
          <a class="page-link" href="#" onclick="changeReportsPage(${i})">${i}</a>
        </li>
      `
        } else if (i === currentPage - 3 || i === currentPage + 3) {
            paginationHTML += `<li class="page-item disabled"><span class="page-link">...</span></li>`
        }
    }

    // Next button
    paginationHTML += `
    <li class="page-item ${currentPage === totalPages ? "disabled" : ""}">
      <a class="page-link" href="#" onclick="changeReportsPage(${currentPage + 1})">Next</a>
    </li>
  `

    pagination.innerHTML = paginationHTML
}

function changeReportsPage(page) {
    if (page >= 1 && page <= Math.ceil(filteredReports.length / reportsPerPage)) {
        currentPage = page
        renderReports()
        renderReportsPagination()
    }
}

function applyFilters() {
    const dateRange = document.getElementById("dateRangeFilter").value
    const reportType = document.getElementById("reportTypeFilter").value
    const department = document.getElementById("departmentFilter").value
    const status = document.getElementById("statusFilter").value

    filteredReports = reports.filter((report) => {
        let matches = true

        if (reportType !== "all" && !report.type.toLowerCase().includes(reportType)) {
            matches = false
        }

        if (status !== "all" && report.status !== status) {
            matches = false
        }

        // Additional filtering logic would go here for date range and department

        return matches
    })

    currentPage = 1
    renderReports()
    renderReportsPagination()
}

function resetFilters() {
    document.getElementById("dateRangeFilter").value = "month"
    document.getElementById("reportTypeFilter").value = "all"
    document.getElementById("departmentFilter").value = "all"
    document.getElementById("statusFilter").value = "all"
    document.getElementById("customDateRange").style.display = "none"

    filteredReports = [...reports]
    currentPage = 1
    renderReports()
    renderReportsPagination()
}

function updateRevenueChart(period) {
    let newData, newLabels

    switch (period) {
        case "daily":
            newData = [2500, 3200, 2800, 3500, 4100, 3800, 4200]
            newLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
            break
        case "weekly":
            newData = [18000, 22000, 19000, 25000, 21000, 24000]
            newLabels = ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6"]
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

    charts.revenue.data.datasets[0].data = newData
    charts.revenue.data.labels = newLabels
    charts.revenue.update()
}

function updateDemographicsChart(type) {
    let newData, newLabels

    switch (type) {
        case "age":
            newData = [15, 25, 20, 18, 12, 10]
            newLabels = ["18-25", "26-35", "36-45", "46-55", "56-65", "65+"]
            break
        case "gender":
            newData = [52, 48]
            newLabels = ["Female", "Male"]
            break
        case "location":
            newData = [35, 25, 20, 15, 5]
            newLabels = ["Downtown", "Suburbs", "North Side", "South Side", "Other"]
            break
    }

    charts.demographics.data.datasets[0].data = newData
    charts.demographics.data.labels = newLabels
    charts.demographics.update()
}

function updatePerformanceChart() {
    const metric = document.getElementById("performanceMetric").value
    let newData, label

    switch (metric) {
        case "appointments":
            newData = [145, 132, 128, 115, 108, 95]
            label = "Appointments"
            break
        case "revenue":
            newData = [45200, 38900, 42100, 32500, 28700, 25400]
            label = "Revenue ($)"
            break
        case "satisfaction":
            newData = [4.9, 4.8, 4.7, 4.9, 4.6, 4.5]
            label = "Satisfaction Score"
            break
        case "efficiency":
            newData = [92, 88, 85, 90, 82, 78]
            label = "Efficiency Score (%)"
            break
    }

    charts.performance.data.datasets[0].data = newData
    charts.performance.data.datasets[0].label = label
    charts.performance.update()
}

function exportReport(format) {
    switch (format) {
        case "csv":
            exportToCSV()
            break
        case "pdf":
            exportToPDF()
            break
        case "excel":
            exportToExcel()
            break
    }
}

function exportToCSV() {
    const headers = ["Report Name", "Type", "Date Range", "Generated By", "Created", "Status"]
    const csvContent = [
        headers.join(","),
        ...filteredReports.map((report) =>
            [report.name, report.type, report.dateRange, report.generatedBy, report.created, report.status].join(","),
        ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "reports_summary.csv"
    a.click()
    window.URL.revokeObjectURL(url)
}

function exportToPDF() {
    const { jsPDF } = window.jspdf
    const doc = new jsPDF()

    doc.setFontSize(20)
    doc.text("Healthcare Reports Summary", 20, 20)

    doc.setFontSize(12)
    let yPosition = 40

    filteredReports.forEach((report, index) => {
        if (yPosition > 250) {
            doc.addPage()
            yPosition = 20
        }

        doc.text(`${index + 1}. ${report.name}`, 20, yPosition)
        doc.text(`   Type: ${report.type}`, 20, yPosition + 10)
        doc.text(`   Date Range: ${report.dateRange}`, 20, yPosition + 20)
        doc.text(`   Status: ${report.status}`, 20, yPosition + 30)

        yPosition += 50
    })

    doc.save("reports_summary.pdf")
}

function exportToExcel() {
    alert("Excel export functionality would be implemented using a library like SheetJS")
}

function exportChartData(chartType) {
    alert(`Exporting ${chartType} chart data...`)
}

function generateCustomReport() {
    const form = document.getElementById("customReportForm")
    if (!form.checkValidity()) {
        form.reportValidity()
        return
    }

    const reportData = {
        id: reports.length + 1,
        name: document.getElementById("reportName").value,
        type: document.getElementById("reportType").value,
        dateRange: `${document.getElementById("customStartDate").value} - ${document.getElementById("customEndDate").value}`,
        generatedBy: "Admin User",
        created: new Date().toISOString().split("T")[0],
        status: "processing",
        format: document.querySelector('input[name="outputFormat"]:checked').value.toUpperCase(),
    }

    reports.unshift(reportData)
    filteredReports = [...reports]
    renderReports()
    renderReportsPagination()

    const modal = bootstrap.Modal.getInstance(document.getElementById("customReportModal"))
    modal.hide()
    form.reset()

    alert("Custom report generation started. You will be notified when it's ready.")
}

function scheduleReport() {
    alert("Report scheduling functionality would be implemented here")
}

function refreshReports() {
    loadReports()
    alert("Reports refreshed successfully!")
}

function viewReport(reportId) {
    const report = reports.find((r) => r.id === reportId)
    if (report) {
        alert(`Viewing report: ${report.name}\n\nThis would open the report in a new window.`)
    }
}

function downloadReport(reportId) {
    const report = reports.find((r) => r.id === reportId)
    if (report) {
        alert(`Downloading report: ${report.name}\n\nFormat: ${report.format}`)
    }
}

function duplicateReport(reportId) {
    const report = reports.find((r) => r.id === reportId)
    if (report) {
        const duplicatedReport = {
            ...report,
            id: reports.length + 1,
            name: `${report.name} (Copy)`,
            created: new Date().toISOString().split("T")[0],
            status: "pending",
        }

        reports.unshift(duplicatedReport)
        filteredReports = [...reports]
        renderReports()
        renderReportsPagination()

        alert("Report duplicated successfully!")
    }
}

function deleteReport(reportId) {
    if (confirm("Are you sure you want to delete this report?")) {
        reports = reports.filter((r) => r.id !== reportId)
        filteredReports = [...reports]
        renderReports()
        renderReportsPagination()
        alert("Report deleted successfully!")
    }
}

// Helper functions
function getReportTypeBadgeColor(type) {
    const colors = {
        Financial: "success",
        Analytics: "info",
        Performance: "warning",
        Operational: "primary",
        Quality: "secondary",
    }
    return colors[type] || "secondary"
}

function getStatusBadgeColor(status) {
    const colors = {
        completed: "success",
        processing: "warning",
        failed: "danger",
        pending: "info",
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

function logout() {
    if (confirm("Are you sure you want to logout?")) {
        localStorage.clear()
        window.location.href = "index.html"
    }
}

// Declare bootstrap variable
const bootstrap = window.bootstrap
