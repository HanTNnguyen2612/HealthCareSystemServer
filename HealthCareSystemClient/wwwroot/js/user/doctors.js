// Doctors functionality
document.addEventListener("DOMContentLoaded", () => {
    updateUserInfo()
    loadDoctors()
    loadSpecialtyFilters()
    setupSearch()
})

function updateUserInfo() {
    const userName = localStorage.getItem("userName") || "John Doe"
    document.getElementById("userName").textContent = userName
}

const doctors = [
    {
        id: 1,
        name: "Dr. Sarah Johnson",
        specialty: "Cardiology",
        experience: "15 years experience",
        rating: 4.9,
        reviewCount: 126,
        image: "/placeholder.svg?height=80&width=80",
        availability: "Available Today",
        consultationType: "In-Person & Online",
        priceRange: "$150 - $300",
    },
    {
        id: 2,
        name: "Dr. Michael Chen",
        specialty: "Dermatology",
        experience: "12 years experience",
        rating: 4.8,
        reviewCount: 89,
        image: "/placeholder.svg?height=80&width=80",
        availability: "Available Today",
        consultationType: "In-Person & Online",
        priceRange: "$100 - $250",
    },
    {
        id: 3,
        name: "Dr. Emily Davis",
        specialty: "General Medicine",
        experience: "10 years experience",
        rating: 4.7,
        reviewCount: 203,
        image: "/placeholder.svg?height=80&width=80",
        availability: "Available Tomorrow",
        consultationType: "In-Person & Online",
        priceRange: "$80 - $200",
    },
    {
        id: 4,
        name: "Dr. Robert Wilson",
        specialty: "Neurology",
        experience: "18 years experience",
        rating: 4.9,
        reviewCount: 156,
        image: "/placeholder.svg?height=80&width=80",
        availability: "Available This Week",
        consultationType: "In-Person & Online",
        priceRange: "$200 - $400",
    },
    {
        id: 5,
        name: "Dr. Lisa Martinez",
        specialty: "Pediatrics",
        experience: "8 years experience",
        rating: 4.8,
        reviewCount: 94,
        image: "/placeholder.svg?height=80&width=80",
        availability: "Available Today",
        consultationType: "In-Person & Online",
        priceRange: "$90 - $180",
    },
    {
        id: 6,
        name: "Dr. James Thompson",
        specialty: "Orthopedics",
        experience: "20 years experience",
        rating: 4.9,
        reviewCount: 178,
        image: "/placeholder.svg?height=80&width=80",
        availability: "Available This Week",
        consultationType: "In-Person & Online",
        priceRange: "$180 - $350",
    },
]

let filteredDoctors = doctors

function loadDoctors(doctorsToShow = doctors) {
    const container = document.getElementById("doctorsGrid")
    container.innerHTML = doctorsToShow.map((doctor) => createDoctorCard(doctor)).join("")
}

function createDoctorCard(doctor) {
    return `
    <div class="doctor-card" onclick="selectDoctor(${doctor.id})">
      <div class="doctor-header">
        <img src="${doctor.image}" alt="${doctor.name}" class="doctor-avatar">
        <div class="doctor-info">
          <h6>${doctor.name}</h6>
          <p>${doctor.specialty}</p>
          <div class="doctor-rating">
            <i class="fas fa-star" style="color: #fbbf24;"></i>
            <span>${doctor.rating}</span>
            <span class="text-muted">(${doctor.reviewCount})</span>
          </div>
        </div>
      </div>
      <div class="doctor-details">
        <p class="text-muted small">${doctor.experience}</p>
        <p class="availability-status">${doctor.availability}</p>
        <p class="text-muted small">${doctor.consultationType}</p>
        <div class="doctor-actions">
          <span class="price-range">${doctor.priceRange}</span>
          <button class="btn btn-primary btn-sm" onclick="bookWithDoctor(${doctor.id}); event.stopPropagation();">
            Book Now
          </button>
        </div>
      </div>
    </div>
  `
}

function loadSpecialtyFilters() {
    const specialties = [...new Set(doctors.map((doctor) => doctor.specialty))]
    const container = document.getElementById("specialtyFilters")

    container.innerHTML = `
    <div class="filter-item active" onclick="filterBySpecialty('all')">
      <span>All Specialties</span>
      <span class="filter-count">${doctors.length}</span>
    </div>
    ${specialties
            .map((specialty) => {
                const count = doctors.filter((doctor) => doctor.specialty === specialty).length
                return `
        <div class="filter-item" onclick="filterBySpecialty('${specialty}')">
          <span>${specialty}</span>
          <span class="filter-count">${count}</span>
        </div>
      `
            })
            .join("")}
  `
}

function filterBySpecialty(specialty) {
    // Update active filter
    document.querySelectorAll(".filter-item").forEach((item) => {
        item.classList.remove("active")
    })
    event.currentTarget.classList.add("active")

    // Filter doctors
    if (specialty === "all") {
        filteredDoctors = doctors
    } else {
        filteredDoctors = doctors.filter((doctor) => doctor.specialty === specialty)
    }

    loadDoctors(filteredDoctors)
}

function setupSearch() {
    const searchInput = document.getElementById("searchInput")

    searchInput.addEventListener("input", (e) => {
        const searchTerm = e.target.value.toLowerCase()

        const searchResults = filteredDoctors.filter(
            (doctor) => doctor.name.toLowerCase().includes(searchTerm) || doctor.specialty.toLowerCase().includes(searchTerm),
        )

        loadDoctors(searchResults)
    })
}

function selectDoctor(doctorId) {
    const doctor = doctors.find((d) => d.id === doctorId)
    if (doctor) {
        alert(`Selected ${doctor.name} - ${doctor.specialty}`)
    }
}

function bookWithDoctor(doctorId) {
    localStorage.setItem("selectedDoctorId", doctorId)
    window.location.href = "appointments-modern.html"
}

function logout() {
    if (confirm("Are you sure you want to logout?")) {
        localStorage.clear()
        window.location.href = "index.html"
    }
}
