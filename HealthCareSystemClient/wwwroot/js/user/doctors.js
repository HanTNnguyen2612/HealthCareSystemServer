// --- CONFIGURATION ---
// BIẾN NÀY PHẢI ĐƯỢC ĐỊNH NGHĨA TRONG RAZOR VIEW TRƯỚC KHI TẢI FILE JS
// const API_BASE_URL = "https://localhost:7293"; 
// const CURRENT_USER_ID = 1; 

// State quản lý dữ liệu và bộ lọc
let allDoctors = [];
let allSpecialties = [];
// activeSpecialtyName sẽ là Chuỗi IN HOA của tên chuyên khoa được chọn, hoặc null
let activeSpecialtyName = null;
let searchQuery = '';

const doctorsGrid = document.getElementById('doctorsGrid');
const specialtyFilters = document.getElementById('specialtyFilters');
const searchInput = document.getElementById('searchInput');

/**
 * Hàm làm sạch tên chuyên khoa (Chuỗi, TRIM, UPPERCASE)
 * @param {string | number | null} value 
 * @returns {string | null}
 */
function cleanSpecialtyName(value) {
    if (value === null || value === undefined) return null;
    // Chuyển thành chuỗi, loại bỏ khoảng trắng, và chuyển thành IN HOA để so sánh không phân biệt chữ hoa/thường
    return String(value).trim().toUpperCase();
}

/**
 * Kiểm tra các biến toàn cục cần thiết.
 */
function checkEnvironment() {
    if (typeof API_BASE_URL === 'undefined') {
        console.error("Lỗi: API_BASE_URL chưa được định nghĩa trong Razor View.");
    }
}

/**
 * Cập nhật thông tin người dùng (Giả định)
 */
function updateUserInfo() {
    const userNameElement = document.getElementById("userName");
    if (userNameElement) {
        userNameElement.textContent = `User ID: ${typeof CURRENT_USER_ID !== 'undefined' ? CURRENT_USER_ID : 'Guest'}`;
    }
}

// --- 1. DATA FETCHING (Buộc chuyển đổi kiểu dữ liệu sang CHUỖI IN HOA và TRIM) ---

async function fetchDoctors() {
    checkEnvironment();
    doctorsGrid.innerHTML = `<p class="text-center text-gray-500 py-3 w-full">Đang tải danh sách bác sĩ...</p>`;
    try {
        const response = await fetch(`${API_BASE_URL}/api/doctor/all`);
        if (!response.ok) {
            throw new Error('Failed to fetch doctors data');
        }
        let data = await response.json();

        // **QUAN TRỌNG: Làm sạch SpecialtyName cho từng bác sĩ**
        allDoctors = data.map(doctor => ({
            ...doctor,
            // Sử dụng SpecialtyName để lọc
            specialtyNameCleaned: cleanSpecialtyName(doctor.specialtyName)
        }));

        // Sau khi tải bác sĩ, chúng ta cần render lại bộ lọc để cập nhật số lượng
        renderSpecialtyFilters();
        renderDoctors();
    } catch (error) {
        console.error("Fetch Doctors Error:", error);
        doctorsGrid.innerHTML = `<p class="text-red-500">Không thể tải danh sách bác sĩ. Vui lòng kiểm tra API_BASE_URL.</p>`;
    }
}

/**
 * Lấy danh sách tất cả chuyên khoa từ API.
 */
async function fetchSpecialties() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/doctor/specialties`);
        if (!response.ok) {
            throw new Error('Failed to fetch specialties data');
        }
        let data = await response.json();

        // **QUAN TRỌNG: Làm sạch SpecialtyName cho từng bộ lọc**
        allSpecialties = data.map(specialty => ({
            ...specialty,
            // Sử dụng Tên chuyên khoa để lọc
            specialtyNameCleaned: cleanSpecialtyName(specialty.name)
        }));

    } catch (error) {
        console.error("Fetch Specialties Error:", error);
        specialtyFilters.innerHTML = `<p class="text-red-500">Không thể tải bộ lọc.</p>`;
    }
}

// --- 2. RENDERING FUNCTIONS ---

/**
 * Tạo HTML cho một thẻ bác sĩ
 * @param {object} doctor - DoctorViewDto object
 */
function createDoctorCard(doctor) {
    // 1. Ánh xạ dữ liệu đúng
    const avatar = doctor.avatarUrl || `https://placehold.co/64x64/E0F7FA/00BCD4?text=${doctor.fullName.charAt(0)}`;
    const ratingValue = doctor.rating || 0;
    const reviewCount = doctor.reviewCount || 0;

    // 2. Tạo sao rating
    const ratingStars = Array(5).fill(0).map((_, i) =>
        `<i class="fas fa-star ${i < Math.round(ratingValue) ? 'text-yellow-400' : 'text-gray-300'}"></i>`
    ).join('');

    return `
        <div class="doctor-card" onclick="viewDoctorProfile(${doctor.userId})">
            <div class="doctor-header">
                <img src="${avatar}" alt="${doctor.fullName}" class="doctor-avatar">
                <div class="doctor-info">
                    <h6>${doctor.fullName}</h6>
                    <p class="doctor-specialty">${doctor.specialtyName}</p>
                    <div class="doctor-rating">
                        ${ratingStars}
                        <span>${ratingValue.toFixed(1)}</span>
                        <span class="text-muted">(${reviewCount})</span> 
                    </div>
                </div>
            </div>
            <div class="doctor-details">
                <p class="text-muted small">${doctor.experience || 'N/A Kinh nghiệm'}</p>
                <p class="availability-status">Có sẵn hôm nay</p> 
                <p class="text-muted small">Tư vấn trực tuyến</p> 
                <div class="doctor-actions">
                    <span class="price-range">${doctor.priceRange || 'Liên hệ để biết giá'}</span>
                    <button class="btn btn-primary btn-sm" onclick="bookWithDoctor(${doctor.userId}); event.stopPropagation();">
                        Đặt lịch ngay
                    </button>
                </div>
            </div>
        </div>
    `;
}

/**
 * Render danh sách bác sĩ đã lọc/tìm kiếm
 */
function renderDoctors() {
    let filteredDoctors = allDoctors;

    // 1. Lọc theo chuyên khoa (Sử dụng Tên đã được làm sạch)
    if (activeSpecialtyName !== null) {
        // So sánh nghiêm ngặt giữa Tên chuyên khoa của bác sĩ và Tên chuyên khoa đang hoạt động
        filteredDoctors = filteredDoctors.filter(d => d.specialtyNameCleaned === activeSpecialtyName);
    }

    // 2. Lọc theo tìm kiếm
    if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filteredDoctors = filteredDoctors.filter(d =>
            d.fullName.toLowerCase().includes(query) ||
            d.specialtyName.toLowerCase().includes(query) ||
            (d.qualifications && d.qualifications.toLowerCase().includes(query))
        );
    }

    if (filteredDoctors.length === 0) {
        doctorsGrid.innerHTML = `<p class="text-center text-gray-500 py-8 w-full">Không tìm thấy bác sĩ nào phù hợp với tiêu chí của bạn.</p>`;
    } else {
        doctorsGrid.innerHTML = filteredDoctors.map(createDoctorCard).join('');
    }
}

/**
 * Render các nút lọc theo chuyên khoa (SỬ DỤNG Tên đã làm sạch làm ID)
 */
function renderSpecialtyFilters() {
    // 1. Tính toán số lượng cho nút "All" (tất cả)
    const allCount = allDoctors.length;

    // 2. Thêm nút "All"
    const allButton = `
        <div class="filter-item ${activeSpecialtyName === null ? 'active' : ''}" data-specialty-name="null">
            <span>Tất cả Chuyên khoa</span>
            <span class="filter-count">${allCount}</span>
        </div>
    `;

    // 3. Render các nút chuyên khoa
    const specialtyButtons = allSpecialties.map(s => {
        // So sánh nghiêm ngặt Tên chuyên khoa đã làm sạch
        const count = allDoctors.filter(d => d.specialtyNameCleaned === s.specialtyNameCleaned).length;

        return `
            <div class="filter-item ${activeSpecialtyName === s.specialtyNameCleaned ? 'active' : ''}" data-specialty-name="${s.specialtyNameCleaned}">
                <span>${s.name}</span>
                <span class="filter-count">${count}</span>
            </div>
        `;
    }).join('');

    specialtyFilters.innerHTML = allButton + specialtyButtons;
}

// --- 3. EVENT HANDLERS ---

// Hàm chuyển hướng đến trang chi tiết bác sĩ
function viewDoctorProfile(userId) {
    console.log(`Chuyển đến hồ sơ của Bác sĩ ID: ${userId}`);
    // window.location.href = `/doctor/profile/${userId}`; 
}

// Hàm giả định đặt lịch hẹn
function bookWithDoctor(userId) {
    console.log(`Đang cố gắng đặt lịch với Bác sĩ ID: ${userId}`);
    // Logic đặt lịch thực tế
}


// --- 4. INITIALIZATION ---

document.addEventListener('DOMContentLoaded', () => {
    updateUserInfo();

    // Tải danh sách chuyên khoa trước
    fetchSpecialties();
    // Tải danh sách bác sĩ (Sau đó sẽ tự động gọi renderSpecialtyFilters và renderDoctors)
    fetchDoctors();

    // Xử lý sự kiện tìm kiếm
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value.trim();
            renderDoctors();
        });
    }

    // Xử lý sự kiện lọc (Delegation)
    if (specialtyFilters) {
        specialtyFilters.addEventListener('click', (e) => {
            const item = e.target.closest('.filter-item');

            if (item) {
                // Lấy TÊN đã được làm sạch từ thuộc tính data-specialty-name
                const name = item.getAttribute('data-specialty-name');

                // Cập nhật state activeSpecialtyName
                activeSpecialtyName = name === 'null' ? null : name;

                // Render lại cả bộ lọc và danh sách bác sĩ để cập nhật trạng thái 'active' và dữ liệu
                renderSpecialtyFilters();
                renderDoctors();
            }
        });
    }
});