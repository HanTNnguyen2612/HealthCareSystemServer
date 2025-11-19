/**
 * profile.js - User Profile Management
 */

const CONFIG = window.AppConfig || { apiBaseUrl: '', userId: 0, token: '' };
let currentProfileData = null;

document.addEventListener('DOMContentLoaded', () => {
    if (!CONFIG.token) {
        console.warn("No token found");
        return;
    }

    // 1. Load dữ liệu ban đầu
    loadProfile();

    // 2. Sự kiện tính BMI tự động trong Modal Health
    const editWeightInput = document.getElementById('editWeight');
    const editHeightInput = document.getElementById('editHeight');
    if (editWeightInput) editWeightInput.addEventListener('input', calculateBMI);
    if (editHeightInput) editHeightInput.addEventListener('input', calculateBMI);

    // 3. Sự kiện xóa Tag (Allergies) trong Modal Health
    const editAllergiesContainer = document.getElementById('editAllergiesContainer');
    if (editAllergiesContainer) {
        editAllergiesContainer.addEventListener('dblclick', function (event) {
            if (event.target.classList.contains('health-tag')) {
                if (confirm(`Remove "${event.target.textContent}"?`)) {
                    event.target.remove();
                }
            }
        });
    }
});

// ==========================================
// 1. LOAD DATA
// ==========================================
async function loadProfile() {
    try {
        const res = await fetch(`${CONFIG.apiBaseUrl}/api/patient/${CONFIG.userId}`, {
            headers: { 'Authorization': `Bearer ${CONFIG.token}` }
        });

        if (!res.ok) throw new Error("Failed to load profile");
        const data = await res.json();
        currentProfileData = data; // Cache dữ liệu

        console.log("Profile Data Loaded:", data);

        // A. HIỂN THỊ LÊN GIAO DIỆN CHÍNH (View Mode)
        // --- Personal Info ---
        setText('headerName', data.fullName);
        setText('dispFullName', data.fullName);
        setText('dispEmail', data.email);
        setText('dispPhone', data.phoneNumber || '--');
        setText('dispAddress', data.address || '--');
        setText('dispGender', data.gender || '--');
        setText('dispEmergency', data.emergencyPhoneNumber || '--');

        if (data.avatarUrl) {
            const hAvatar = document.getElementById('headerAvatar');
            const dAvatar = document.getElementById('dispAvatar');
            if (hAvatar) hAvatar.src = data.avatarUrl;
            if (dAvatar) dAvatar.src = data.avatarUrl;
        }

        if (data.dateOfBirth) {
            const dateObj = new Date(data.dateOfBirth);
            setText('dispDOB', dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }));
        }

        // --- Health Info ---
        setText('dispBlood', data.bloodType || '--');
        setText('dispWeight', data.weight ? `${data.weight} kg` : '--');
        setText('dispHeight', data.height ? `${data.height} cm` : '--');
        setText('dispBMI', data.bmi ? Number(data.bmi).toFixed(1) : '--');

        // Render Lists (Chỉ hiển thị, không cho sửa ở ngoài)
        renderTags('listAllergies', data.allergies, 'allergy', false);
        renderTags('listMedications', data.medications, 'medication', false);
        renderTags('listConditions', data.medicalConditions, 'condition', false);

        // B. ĐIỀN DỮ LIỆU VÀO MODAL (Edit Mode)
        // Điền form Personal
        fillPersonalEditForm(data);

        // Điền form Health
        fillHealthEditForm(data);

    } catch (err) {
        console.error(err);
    }
}

function fillPersonalEditForm(data) {
    const names = (data.fullName || "").split(' ');
    setValue('editFirstName', names[0]);
    setValue('editLastName', names.slice(1).join(' '));
    setValue('editEmail', data.email);
    setValue('editPhone', data.phoneNumber);
    setValue('editAddress', data.address);
    setValue('editEmergencyContact', data.emergencyPhoneNumber);

    const genderSelect = document.getElementById('editGender');
    if (genderSelect && data.gender) {
        for (let opt of genderSelect.options) {
            if (opt.value.toLowerCase() === data.gender.toLowerCase()) {
                opt.selected = true; break;
            }
        }
    }
    if (data.dateOfBirth) {
        setValue('editDOB', data.dateOfBirth); // DateOnly format (yyyy-MM-dd)
    }
}

function fillHealthEditForm(data) {
    setValue('editBloodType', data.bloodType);
    setValue('editWeight', data.weight);
    setValue('editHeight', data.height);

    calculateBMI(); // Tính lại BMI dựa trên weight/height vừa điền

    // Render Allergies vào trong Modal (cho phép Add/Remove)
    renderTags('editAllergiesContainer', data.allergies, 'allergy', true);
}


// ==========================================
// 2. SAVE PERSONAL INFO
// ==========================================
async function savePersonalInfo() {
    if (!currentProfileData) return;

    const firstName = getValue('editFirstName');
    const lastName = getValue('editLastName');

    const updateData = {
        userId: CONFIG.userId,
        fullName: `${firstName} ${lastName}`.trim(),
        phoneNumber: getValue('editPhone'),
        address: getValue('editAddress'),
        gender: getValue('editGender'),
        emergencyContact: getValue('editEmergencyContact'),
        dateOfBirth: getValue('editDOB')
    };

    try {
        const btn = document.querySelector('#editPersonalModal .btn-primary');
        if (btn) { btn.innerText = "Saving..."; btn.disabled = true; }

        const res = await fetch(`${CONFIG.apiBaseUrl}/api/patient/profile`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${CONFIG.token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(updateData)
        });

        if (res.ok) {
            alert("Personal information updated successfully!");
            const modal = bootstrap.Modal.getInstance(document.getElementById('editPersonalModal'));
            if (modal) modal.hide();
            loadProfile(); // Reload UI
        } else {
            const txt = await res.text();
            alert("Update failed: " + txt);
        }

        if (btn) { btn.innerText = "Save Changes"; btn.disabled = false; }
    } catch (err) {
        console.error(err);
        alert("Error saving profile");
    }
}


// ==========================================
// 3. SAVE HEALTH INFO
// ==========================================
async function saveHealthInfo() {
    if (!currentProfileData) return;

    const updateData = {
        userId: CONFIG.userId,
        bloodType: getValue('editBloodType'),
        weight: parseInt(getValue('editWeight')) || null,
        height: parseInt(getValue('editHeight')) || null,
        allergies: getTagsFromUI('editAllergiesContainer') // Lấy danh sách tags từ Modal
    };

    try {
        const btn = document.querySelector('#editHealthModal .btn-primary');
        if (btn) { btn.innerText = "Saving..."; btn.disabled = true; }

        const res = await fetch(`${CONFIG.apiBaseUrl}/api/patient/health`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${CONFIG.token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(updateData)
        });

        if (res.ok) {
            alert("Health information updated successfully!");
            const modal = bootstrap.Modal.getInstance(document.getElementById('editHealthModal'));
            if (modal) modal.hide();
            loadProfile(); // Reload UI để cập nhật BMI và Tags ở màn hình chính
        } else {
            const txt = await res.text();
            alert("Update failed: " + txt);
        }

        if (btn) { btn.innerText = "Save Changes"; btn.disabled = false; }
    } catch (err) {
        console.error(err);
        alert("Error saving health info");
    }
}


// ==========================================
// 4. HELPERS & UTILS
// ==========================================

// Tính BMI
function calculateBMI() {
    const weight = parseFloat(getValue('editWeight'));
    const height = parseFloat(getValue('editHeight'));
    const bmiInput = document.getElementById('editBMI');

    if (isNaN(weight) || isNaN(height) || height === 0) {
        if (bmiInput) bmiInput.value = '';
        return;
    }
    // BMI = kg / (m * m)
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);
    if (bmiInput) bmiInput.value = bmi.toFixed(1);
}

// Render Tags (Badge)
function renderTags(containerId, items, typeClass, allowAddRemove) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    // Render các items hiện có
    if (items && items.length > 0) {
        items.forEach(item => {
            if (!item) return;
            const span = document.createElement('span');
            span.className = `health-tag ${typeClass}`;
            span.textContent = item;

            // Nếu ở trong Modal (allowAddRemove = true) thì cho phép xóa
            if (allowAddRemove) {
                span.title = "Double click to remove";
                // Sự kiện xóa đã được ủy quyền (Event Delegation) ở DOMContentLoaded để tối ưu
                // Nhưng thêm title để user biết
                span.style.cursor = "pointer";
            }
            container.appendChild(span);
        });
    } else if (!allowAddRemove) {
        container.innerHTML = '<span class="text-muted small">None</span>';
    }

    // Nếu ở trong Modal thì thêm nút Add
    if (allowAddRemove) {
        const addBtn = document.createElement('button');
        addBtn.type = "button"; // Quan trọng để không submit form
        addBtn.className = 'add-tag-btn';
        addBtn.innerHTML = '<i class="fas fa-plus"></i> Add';
        addBtn.onclick = () => addTagItem(containerId, typeClass);
        container.appendChild(addBtn);
    }
}

// Thêm Tag mới (Chỉ thêm trên UI Modal, chưa Save DB)
function addTagItem(containerId, typeClass) {
    const val = prompt("Enter new item:");
    if (val && val.trim() !== "") {
        const span = document.createElement('span');
        span.className = `health-tag ${typeClass}`;
        span.textContent = val.trim();
        span.title = "Double click to remove";
        span.style.cursor = "pointer";

        const container = document.getElementById(containerId);
        const btn = container.querySelector('.add-tag-btn');
        container.insertBefore(span, btn); // Chèn trước nút Add
    }
}

// Lấy danh sách Tags từ UI để gửi lên Server
function getTagsFromUI(containerId) {
    const tags = document.querySelectorAll(`#${containerId} .health-tag`);
    return Array.from(tags).map(t => t.textContent);
}

// Get/Set Value Helpers
function setText(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = (val !== null && val !== undefined) ? val : '--';
}
function setValue(id, val) {
    const el = document.getElementById(id);
    if (el) el.value = (val !== null && val !== undefined) ? val : '';
}
function getValue(id) {
    return document.getElementById(id)?.value;
}

// Modal Openers
function editPersonalInfo() {
    if (currentProfileData) fillPersonalEditForm(currentProfileData);
    const modal = new bootstrap.Modal(document.getElementById('editPersonalModal'));
    modal.show();
}
function editHealthInfo() {
    if (currentProfileData) fillHealthEditForm(currentProfileData);
    const modal = new bootstrap.Modal(document.getElementById('editHealthModal'));
    modal.show();
}

// Placeholders
function editInsurance() { alert("Insurance editing coming soon."); }
function changeAvatar() { alert("Avatar upload coming soon."); }