// Định nghĩa Endpoint API (Giả định PatientController đang chạy trên /api/Patient)
const API_URL = "https://localhost:7293/api/Patient";

// Biến toàn cục để lưu trữ dữ liệu và trạng thái lọc
let allPatients = [];
let currentFilter = 'all';
let currentSearch = '';

// --- INITIALIZATION ---

document.addEventListener("DOMContentLoaded", () => {
    initializePatients();
    loadPatients(); // Bắt đầu tải dữ liệu từ API
    setupEventListeners();
});

function initializePatients() {
    //const doctorName = localStorage.getItem("doctorName") || "Dr. Sarah Johnson";
    //const doctorNameElement = document.getElementById("doctorName");
    //if (doctorNameElement) {
    //    doctorNameElement.textContent = doctorName;
    //}
    // Kích hoạt nút 'All Patients' mặc định
    const allBtn = document.querySelector(".filter-btn[data-status='all']");
    if (allBtn) allBtn.classList.add("active");
}

// --- DATA FETCHING & RENDERING ---

/**
 * Tải dữ liệu bệnh nhân từ API /api/Patient
 */
async function loadPatients() {
    const container = document.getElementById("patientsGrid");
    if (!container) return;

    // Hiển thị trạng thái tải
    container.innerHTML = `<div class="w-full text-center p-5 text-gray-500 col-span-full"><i class="fas fa-spinner fa-spin me-2"></i>Loading patient data from API...</div>`;

    try {
        // GET: /api/Doctor/get-patient (Giả định endpoint này trả về danh sách tất cả bệnh nhân)
        const response = await fetch(`${API_BASE_URL}/api/doctor/get-patient/${CURRENT_USER_ID}`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        // Giả định API trả về một mảng các đối tượng bệnh nhân
        const data = await response.json();

        // Gán dữ liệu cho biến toàn cục
        // Chú ý: Backend có thể trả về các trường khác nhau, ta cần chuẩn hóa ID và STATUS
        
        allPatients = data.map(p => ({
            ...p,
            id: p.userId || p.id, // Ưu tiên userId nếu có, không thì dùng id
            name: p.fullName || p.name || 'Unknown Patient', // Fallback tên
            email: p.email || 'N/A',
            phone: p.phoneNumber || p.phone || 'N/A',
            status: (p.status || 'active').toLowerCase()
        }));

        applyFiltersAndSearch();

    } catch (error) {
        console.error("Failed to load patients from API:", error);
        container.innerHTML = `
            <div class="w-full text-center p-5 text-danger col-span-full">
                <i class="fas fa-exclamation-circle me-2"></i>Error loading patient data. Please ensure the API is running.
            </div>
        `;
    }
}

/**
 * Lọc dữ liệu bệnh nhân cục bộ dựa trên trạng thái và từ khóa tìm kiếm
 */
function applyFiltersAndSearch() {
    let patientsToShow = allPatients;

    // 1. Lọc theo trạng thái
    if (currentFilter !== 'all') {
        patientsToShow = patientsToShow.filter(p => (p.status || 'active').toLowerCase() === currentFilter);
    }

    // 2. Lọc theo từ khóa tìm kiếm
    if (currentSearch) {
        const searchLower = currentSearch.toLowerCase();
        patientsToShow = patientsToShow.filter(p =>
            (p.name || '').toLowerCase().includes(searchLower) ||
            (p.condition || '').toLowerCase().includes(searchLower) ||
            (p.email || '').toLowerCase().includes(searchLower)
        );
    }

    // Sắp xếp theo tên (tùy chọn)
    patientsToShow.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

    renderPatientsGrid(patientsToShow);
}

function renderPatientsGrid(patientsToShow) {
    const container = document.getElementById("patientsGrid");
    if (!container) return;

    if (patientsToShow.length === 0) {
        container.innerHTML = `
            <div class="w-full text-center p-5 text-gray-500 col-span-full">
                <i class="fas fa-users-slash text-4xl mb-3"></i>
                <p class="text-lg">No patients found matching the current criteria.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = patientsToShow.map((patient) => createPatientCard(patient)).join("");
}

function createPatientCard(patient) {
    const statusClass = (patient.status || 'active').toLowerCase();
    const condition = patient.condition || 'N/A';
    const lastVisit = formatDate(patient.lastVisit);
    const avatar = 'https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg' || 'https://placehold.co/60x60/8863A2/FFFFFF?text=P';
    if (!patient.id) console.error("Patient missing ID:", patient);
    return `
        <div class="patient-card" onclick="viewPatientDetails(${patient.id})">
            <span class="patient-status ${statusClass}">${statusClass}</span>
            <div class="patient-card-header">
                <img src="${avatar}" alt="${patient.name}" class="patient-avatar">
                <div class="patient-info">
                    <h6>${patient.name}</h6>
                    <p>${patient.email || 'N/A'}</p>
                </div>
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
    `;
}


// --- EVENT LISTENERS & FILTERING LOGIC ---

function setupEventListeners() {
    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            currentSearch = e.target.value.trim();
            applyFiltersAndSearch();
        });
    }

    // Gán sự kiện cho các nút lọc
    document.querySelectorAll(".filter-btn").forEach(btn => {
        btn.onclick = (e) => {
            const status = e.currentTarget.getAttribute('data-status');
            filterPatients(status, e);
        };
    });
}

/**
 * Cập nhật bộ lọc trạng thái và áp dụng lại tìm kiếm/lọc.
 */
function filterPatients(status, event) {
    currentFilter = status;

    // Cập nhật trạng thái nút active
    const filterBtns = document.querySelectorAll(".filter-btn");
    filterBtns.forEach((btn) => btn.classList.remove("active"));

    if (event && event.currentTarget) {
        event.currentTarget.classList.add("active");
    }

    applyFiltersAndSearch();
}

// --- MODAL & API ACTIONS ---

/**
 * Tải chi tiết bệnh nhân từ API và hiển thị Modal
 */
async function viewPatientDetails(patientId) {
    console.log("Viewing details for ID:", patientId);

    // 1. Tìm trong list có sẵn (convert sang string để so sánh cho chắc)
    let patient = allPatients.find((p) => String(p.id) === String(patientId));

    // 2. Luôn gọi API lấy chi tiết để có data mới nhất (Health info, height, weight...)
    try {
        const response = await fetch(`${API_URL}/${patientId}`);
        if (!response.ok) throw new Error("Failed to fetch details");

        const rawData = await response.json();
        console.log("API Raw Data:", rawData); // Debug xem API trả về gì

        // --- CHUẨN HÓA DỮ LIỆU ---
        patient = {
            ...rawData,
            name: rawData.fullName || 'Unknown',
            email: rawData.email || 'N/A',
            phone: rawData.phoneNumber || 'N/A',
            address: rawData.address || 'N/A',
            dob: rawData.dateOfBirth, // Format: YYYY-MM-DD
            avatar: rawData.avatarUrl || '/placeholder.svg?height=120&width=120',
            gender: rawData.gender || 'N/A',

            // Health Metrics
            bloodType: rawData.bloodType || '--',
            height: rawData.height || '--',
            weight: rawData.weight || '--',
            bmi: rawData.bmi ? Number(rawData.bmi).toFixed(1) : '--',

            // Lists (Xử lý mảng hoặc null)
            allergies: (rawData.allergies && rawData.allergies.length > 0) ? rawData.allergies : [],
            medications: (rawData.medications && rawData.medications.length > 0) ? rawData.medications : [],

            // Medical History (Map từ conditions)
            medicalHistory: (rawData.conditions && rawData.conditions.length > 0)
                ? rawData.conditions.join(', ')
                : 'No history recorded.',

            // Emergency (Mapping đúng trường từ DTO)
            // Trong DB chỉ có EmergencyPhoneNumber, không có Name nên Name để N/A hoặc ẩn đi
            emergencyPhone: rawData.emergencyPhoneNumber || 'N/A',
            emergencyContactName: 'N/A'
        };

    } catch (e) {
        console.error("Error loading details:", e);
        // Nếu lỗi API thì dùng tạm data từ list (nếu có)
        if (!patient) {
            alert("Could not load patient details.");
            return;
        }
    }

    // --- TÍNH TUỔI ---
    let age = 'N/A';
    if (patient.dob) {
        const birthDate = new Date(patient.dob);
        const today = new Date();
        let ageCalc = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            ageCalc--;
        }
        age = ageCalc;
    }

    // --- RENDER HTML (Theo đúng layout trong ảnh) ---
    const modalTitle = document.getElementById("patientDetailsTitle");
    const modalBody = document.getElementById("patientDetailsBody");

    modalTitle.textContent = `${patient.name} - Patient Details`;

    modalBody.innerHTML = `
    <div class="row">
      <div class="col-md-4 border-end text-center">
        <div class="mb-4 mt-2">
          <img src="${patient.avatar}" alt="${patient.name}" class="rounded-circle mb-3 shadow-sm" 
               style="width: 100px; height: 100px; object-fit: cover;" 
               onerror="this.src='/placeholder.svg?height=120&width=120'">
          
          <h5 class="mb-1 fw-bold">${patient.name}</h5>
          <p class="text-muted small mb-2">Age: ${age}</p>
          <span class="badge bg-success rounded-pill px-3">Active Patient</span>
        </div>
        
        <div class="text-start px-3">
            <label class="small text-muted fw-bold mb-2" style="font-size: 0.75rem; letter-spacing: 1px;">CONTACT INFO</label>
            <div class="mb-2">
                <i class="fas fa-envelope text-primary me-2" style="width: 20px;"></i>
                <span>${patient.email}</span>
            </div>
            <div class="mb-2">
                <i class="fas fa-phone text-primary me-2" style="width: 20px;"></i>
                <span>${patient.phone}</span>
            </div>
            <div class="mb-2">
                <i class="fas fa-map-marker-alt text-primary me-2" style="width: 20px;"></i>
                <span>${patient.address}</span>
            </div>
        </div>
      </div>
      
      <div class="col-md-8 ps-4">
        <h5 class="mb-3">Health Profile</h5>
        
        <div class="row mb-4 g-2">
            <div class="col-3">
                <div class="p-2 border rounded text-center bg-light">
                    <small class="d-block text-muted mb-1" style="font-size: 0.75rem;">Blood Type</small>
                    <span class="fw-bold text-danger fs-5">${patient.bloodType}</span>
                </div>
            </div>
            <div class="col-3">
                <div class="p-2 border rounded text-center bg-light">
                    <small class="d-block text-muted mb-1" style="font-size: 0.75rem;">Height</small>
                    <span class="fw-bold text-dark fs-5">${patient.height} <small class="text-muted fs-6">cm</small></span>
                </div>
            </div>
            <div class="col-3">
                <div class="p-2 border rounded text-center bg-light">
                    <small class="d-block text-muted mb-1" style="font-size: 0.75rem;">Weight</small>
                    <span class="fw-bold text-dark fs-5">${patient.weight} <small class="text-muted fs-6">kg</small></span>
                </div>
            </div>
            <div class="col-3">
                <div class="p-2 border rounded text-center bg-light">
                    <small class="d-block text-muted mb-1" style="font-size: 0.75rem;">BMI</small>
                    <span class="fw-bold text-dark fs-5">${patient.bmi}</span>
                </div>
            </div>
        </div>

        <div class="row mb-3">
            <div class="col-md-6">
                <h6 class="fw-bold small">Allergies</h6>
                ${patient.allergies.length > 0
            ? `<ul class="list-unstyled text-danger small">${patient.allergies.map(a => `<li>• ${a}</li>`).join('')}</ul>`
            : '<p class="text-muted small">No records found.</p>'}
            </div>
            <div class="col-md-6">
                <h6 class="fw-bold small">Current Medications</h6>
                ${patient.medications.length > 0
            ? `<ul class="list-unstyled text-primary small">${patient.medications.map(m => `<li>• ${m}</li>`).join('')}</ul>`
            : '<p class="text-muted small">No records found.</p>'}
            </div>
        </div>

        <div class="mb-3">
            <h6 class="fw-bold small">Medical History</h6>
            <div class="p-2 bg-light rounded text-muted small">
                ${patient.medicalHistory}
            </div>
        </div>

        <div class="mb-0">
            <h6 class="fw-bold small">Emergency Contact</h6>
             <div class="row small">
                 <div class="col-12"><span class="fw-bold">Phone:</span> ${patient.emergencyPhone}</div>
             </div>
        </div>
      </div>
    </div>
    `;

    const modal = new window.bootstrap.Modal(document.getElementById("patientDetailsModal"));
    modal.show();
}

/**
 * Gửi dữ liệu bệnh nhân mới đến API (POST)
 */
async function addPatient() {
    const form = document.getElementById("addPatientForm");

    // Kiểm tra tính hợp lệ của form
    if (form.checkValidity() === false) {
        form.classList.add('was-validated');
        return;
    }
    form.classList.remove('was-validated');

    // Giả định form có các trường sau:
    const patientData = {
        // Tên cần được xử lý trong backend nếu CreatePatientDTO yêu cầu riêng
        // Ta giả định backend chấp nhận các trường dưới đây
        firstName: document.getElementById("firstName").value,
        lastName: document.getElementById("lastName").value,
        email: document.getElementById("email").value,
        phone: document.getElementById("phone").value,
        dob: document.getElementById("dateOfBirth").value,
        gender: document.getElementById("gender").value,
        address: document.getElementById("address").value,
        // Các trường bổ sung:
        emergencyContact: document.getElementById("emergencyContact").value,
        emergencyPhone: document.getElementById("emergencyPhone").value,
        // Giả định backend chấp nhận trường này trong DTO
        medicalHistory: document.getElementById("medicalHistory").value,
    };

    try {
        // POST: /api/Patient
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(patientData),
        });

        if (!response.ok) {
            // Lấy thông báo lỗi cụ thể từ response nếu có
            const errorText = await response.text();
            throw new Error(`API POST failed with status: ${response.status}. Message: ${errorText}`);
        }

        // Đóng modal và hiển thị thông báo
        window.bootstrap.Modal.getInstance(document.getElementById("addPatientModal")).hide();
        form.reset();
        showNotification("Patient added successfully!", "success");

        // Tải lại danh sách bệnh nhân để hiển thị dữ liệu mới từ API
        loadPatients();

    } catch (e) {
        console.error("Error adding document to API: ", e);
        showNotification("Error adding patient. Check console for details.", "danger");
    }
}

function openAddPatientModal() {
    const modal = new window.bootstrap.Modal(document.getElementById("addPatientModal"));
    document.getElementById("addPatientForm").classList.remove('was-validated');
    document.getElementById("addPatientForm").reset();
    modal.show();
}

// --- UTILITY FUNCTIONS ---

function getStatusColor(status) {
    const colors = {
        active: "success",
        critical: "danger",
        "follow-up": "warning",
        new: "info",
    }
    return colors[status.toLowerCase()] || "secondary"
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date)) return dateString;
    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

function showNotification(message, type = "info") {
    const notification = document.createElement("div");
    notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    notification.style.cssText = "top: 20px; right: 20px; z-index: 9999; min-width: 250px;";
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.body.appendChild(notification);

    setTimeout(() => {
        if (notification) {
            const bsAlert = new window.bootstrap.Alert(notification);
            bsAlert.close();
            // Đợi chuyển tiếp kết thúc
            setTimeout(() => notification.remove(), 500);
        }
    }, 3000);
}

// --- ACTION STUBS (Retained from original code) ---

function scheduleAppointment(patientId) {
    console.log("Scheduling appointment stub for patient:", patientId);
    // Thay vì mở modal, ta dùng thông báo giả
    showNotification(`Appointment scheduled for Patient ID: ${patientId}.`, "info");
}

function sendMessage(patientId) {
    console.log("Sending message stub to patient:", patientId);
    showNotification(`Opening chat for Patient ID: ${patientId}.`, "info");
}

function viewMedicalHistory(patientId) {
    console.log("Viewing medical history stub for patient:", patientId);
    // Tái sử dụng viewPatientDetails để hiển thị lịch sử
    viewPatientDetails(patientId);
}

function scheduleAppointmentForPatient() {
    window.bootstrap.Modal.getInstance(document.getElementById("patientDetailsModal")).hide();
    showNotification("Appointment scheduled successfully!", "success");
}

function logout() {
    console.log("User logged out successfully.");
    localStorage.clear();
    showNotification("You have been logged out.", "info");
    // Giả lập chuyển hướng sau khi đăng xuất
    // window.location.href = "login.html"; 
}

// Exposed functions for HTML inline calls
window.viewPatientDetails = viewPatientDetails;
window.openAddPatientModal = openAddPatientModal;
window.addPatient = addPatient;
window.filterPatients = filterPatients;
window.scheduleAppointment = scheduleAppointment;
window.sendMessage = sendMessage;
window.viewMedicalHistory = viewMedicalHistory;
window.scheduleAppointmentForPatient = scheduleAppointmentForPatient;
window.logout = logout;