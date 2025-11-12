// Doctor Patients functionality
document.addEventListener("DOMContentLoaded", () => {
    initializePatients()
    loadPatients()
    setupEventListeners()
})

function initializePatients() {
    const doctorName = localStorage.getItem("doctorName") || "Dr. Sarah Johnson"
    document.getElementById("doctorName").textContent = doctorName
}

const patients = [
    {
        id: 1,
        name: "John Doe",
        age: 45,
        email: "john.doe@email.com",
        phone: "+1 (555) 123-4567",
        condition: "Hypertension",
        lastVisit: "2024-01-18",
        status: "active",
        avatar: "/placeholder.svg?height=60&width=60",
        medicalHistory: "History of high blood pressure, currently on medication",
        medications: ["Lisinopril 10mg", "Hydrochlorothiazide 25mg"],
        allergies: ["Penicillin"],
    },
    {
        id: 2,
        name: "Jane Smith",
        age: 32,
        email: "jane.smith@email.com",
        phone: "+1 (555) 234-5678",
        condition: "Diabetes Type 2",
        lastVisit: "2024-01-15",
        status: "critical",
        avatar: "/placeholder.svg?height=60&width=60",
        medicalHistory: "Recently diagnosed with Type 2 diabetes",
        medications: ["Metformin 500mg", "Insulin"],
        allergies: ["None known"],
    },
    {
        id: 3,
        name: "Mike Johnson",
        age: 28,
        email: "mike.johnson@email.com",
        phone: "+1 (555) 345-6789",
        condition: "Anxiety Disorder",
        lastVisit: "2024-01-20",
        status: "follow-up",
        avatar: "/placeholder.svg?height=60&width=60",
        medicalHistory: "Generalized anxiety disorder, responds well to therapy",
        medications: ["Sertraline 50mg"],
        allergies: ["Latex"],
    },
    {
        id: 4,
        name: "Sarah Wilson",
        age: 38,
        email: "sarah.wilson@email.com",
        phone: "+1 (555) 456-7890",
        condition: "Migraine",
        lastVisit: "2024-01-10",
        status: "active",
        avatar: "/placeholder.svg?height=60&width=60",
        medicalHistory: "Chronic migraines, family history of headaches",
        medications: ["Sumatriptan 50mg PRN"],
        allergies: ["Aspirin"],
    },
    {
        id: 5,
        name: "David Brown",
        age: 52,
        email: "david.brown@email.com",
        phone: "+1 (555) 567-8901",
        condition: "Diabetes Type 1",
        lastVisit: "2024-01-22",
        status: "active",
        avatar: "/placeholder.svg?height=60&width=60",
        medicalHistory: "Type 1 diabetes since childhood, well controlled",
        medications: ["Insulin pump", "Continuous glucose monitor"],
        allergies: ["None known"],
    },
    {
        id: 6,
        name: "Lisa Anderson",
        age: 29,
        email: "lisa.anderson@email.com",
        phone: "+1 (555) 678-9012",
        condition: "Depression",
        lastVisit: "2024-01-19",
        status: "new",
        avatar: "/placeholder.svg?height=60&width=60",
        medicalHistory: "First episode of major depression",
        medications: ["Fluoxetine 20mg"],
        allergies: ["None known"],
    },
]

const filteredPatients = patients

function loadPatients(patientsToShow = patients) {
    const container = document.getElementById("patientsGrid")
    if (!container) return

    container.innerHTML = patientsToShow.map((patient) => createPatientCard(patient)).join("")
}

function createPatientCard(patient) {
    return `
    <div class="patient-card" onclick="viewPatientDetails(${patient.id})">
      <span class="patient-status ${patient.status}">${patient.status}</span>
      <div class="patient-card-header">
        <img src="${patient.avatar}" alt="${patient.name}" class="patient-avatar">
        <div class="patient-info">
          <h6>${patient.name}</h6>
          <p>${patient.email}</p>
          <p class="patient-age">Age ${patient.age}</p>
        </div>
      </div>
      <div class="patient-details">
        <div class="patient-condition">${patient.condition}</div>
        <div class="patient-last-visit">Last visit: ${formatDate(patient.lastVisit)}</div>
      </div>
      <div class="patient-actions" onclick="event.stopPropagation()">
        <button class="btn btn-sm btn-primary" onclick="scheduleAppointment(${patient.id})">
          <i class="fas fa-calendar-plus"></i>
        </button>
        <button class="btn btn-sm btn-outline-secondary" onclick="sendMessage(${patient.id})">
          <i class="fas fa-envelope"></i>
        </button>
        <button class="btn btn-sm btn-outline-info" onclick="viewMedicalHistory(${patient.id})">
          <i class="fas fa-file-medical"></i>
        </button>
      </div>
    </div>
  `
}

function setupEventListeners() {
    // Search functionality
    const searchInput = document.getElementById("searchInput")
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            filterPatients(e.target.value)
        })
    }
}

function filterPatients(status) {
    const filterBtns = document.querySelectorAll(".filter-btn")
    filterBtns.forEach((btn) => btn.classList.remove("active"))

    if (status !== "all") {
        event.target.classList.add("active")
    } else {
        document.querySelector(".filter-btn").classList.add("active")
    }

    // Filter logic would go here
    console.log("Filtering patients by status:", status)
}

function viewPatientDetails(patientId) {
    // Get patient data (in real app, this would be an API call)
    const patients = getPatientData()
    const patient = patients.find((p) => p.id === patientId)

    if (!patient) return

    // Populate modal with patient details
    const modalTitle = document.getElementById("patientDetailsTitle")
    const modalBody = document.getElementById("patientDetailsBody")

    modalTitle.textContent = `${patient.name} - Patient Details`

    modalBody.innerHTML = `
    <div class="row">
      <div class="col-md-4">
        <div class="text-center mb-3">
          <img src="${patient.avatar}" alt="${patient.name}" class="profile-avatar-xl">
          <h5 class="mt-2">${patient.name}</h5>
          <p class="text-muted">Age ${patient.age}</p>
          <span class="badge bg-${getStatusColor(patient.status)}">${patient.status}</span>
        </div>
      </div>
      <div class="col-md-8">
        <div class="row">
          <div class="col-md-6 mb-3">
            <label class="form-label">Email</label>
            <p>${patient.email}</p>
          </div>
          <div class="col-md-6 mb-3">
            <label class="form-label">Phone</label>
            <p>${patient.phone}</p>
          </div>
          <div class="col-md-6 mb-3">
            <label class="form-label">Primary Condition</label>
            <p>${patient.condition}</p>
          </div>
          <div class="col-md-6 mb-3">
            <label class="form-label">Last Visit</label>
            <p>${formatDate(patient.lastVisit)}</p>
          </div>
        </div>
      </div>
    </div>

    <hr>

    <div class="row">
      <div class="col-md-12 mb-3">
        <h6>Medical History</h6>
        <p>${patient.medicalHistory}</p>
      </div>
    </div>

    <div class="row">
      <div class="col-md-6 mb-3">
        <h6>Current Medications</h6>
        <ul class="list-unstyled">
          ${patient.medications.map((med) => `<li><i class="fas fa-pills text-primary me-2"></i>${med}</li>`).join("")}
        </ul>
      </div>
      <div class="col-md-6 mb-3">
        <h6>Allergies</h6>
        <ul class="list-unstyled">
          ${patient.allergies.map((allergy) => `<li><i class="fas fa-exclamation-triangle text-warning me-2"></i>${allergy}</li>`).join("")}
        </ul>
      </div>
    </div>
  `

    // Show modal
    const modal = window.bootstrap.Modal(document.getElementById("patientDetailsModal"))
    modal.show()
}

function getPatientData() {
    // This would normally come from an API
    return [
        {
            id: 1,
            name: "John Doe",
            age: 45,
            email: "john.doe@email.com",
            phone: "+1 (555) 123-4567",
            condition: "Hypertension",
            lastVisit: "2024-01-18",
            status: "active",
            avatar: "/placeholder.svg?height=120&width=120",
            medicalHistory:
                "History of high blood pressure, currently on medication. Patient has been compliant with treatment plan.",
            medications: ["Lisinopril 10mg daily", "Hydrochlorothiazide 25mg daily"],
            allergies: ["Penicillin"],
        },
        // Add more patients as needed
    ]
}

function getStatusColor(status) {
    const colors = {
        active: "success",
        critical: "danger",
        "follow-up": "warning",
        new: "info",
    }
    return colors[status] || "secondary"
}

function formatDate(dateString) {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    })
}

// Action functions
function scheduleAppointment(patientId) {
    console.log("Scheduling appointment for patient:", patientId)
    // Pre-fill patient in appointment modal
    openNewAppointmentModal()
}

function sendMessage(patientId) {
    console.log("Sending message to patient:", patientId)
    window.location.href = `doctor-messages.html?patient=${patientId}`
}

function viewMedicalHistory(patientId) {
    console.log("Viewing medical history for patient:", patientId)
    viewPatientDetails(patientId)
}

function scheduleAppointmentForPatient() {
    // This would be called from the patient details modal
    window.bootstrap.Modal.getInstance(document.getElementById("patientDetailsModal")).hide()
    openNewAppointmentModal()
}

function openAddPatientModal() {
    const modal = window.bootstrap.Modal(document.getElementById("addPatientModal"))
    modal.show()
}

function addPatient() {
    const form = document.getElementById("addPatientForm")
    const formData = new FormData(form)

    console.log("Adding new patient:", Object.fromEntries(formData))

    window.bootstrap.Modal.getInstance(document.getElementById("addPatientModal")).hide()
    showNotification("Patient added successfully!", "success")

    // Reload patients list
    loadPatients()
}

function openNewAppointmentModal() {
    const modal = window.bootstrap.Modal(document.getElementById("newAppointmentModal"))
    modal.show()
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
