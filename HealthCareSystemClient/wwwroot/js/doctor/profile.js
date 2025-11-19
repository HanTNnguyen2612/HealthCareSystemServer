/**
 * doctor/profile.js - Complete Version
 */

const CONFIG = window.AppConfig || { apiBaseUrl: '', userId: 0, token: '' };
let currentProfileData = null; // Lưu trữ toàn bộ data bác sĩ

document.addEventListener('DOMContentLoaded', () => {
    if (!CONFIG.token) {
        console.warn("No token found");
        return;
    }
    loadProfile();

    // Event xóa Tag trong Modal
    const tagContainer = document.getElementById('editQualificationsContainer');
    if (tagContainer) {
        tagContainer.addEventListener('dblclick', function (event) {
            if (event.target.classList.contains('health-tag')) {
                if (confirm(`Remove "${event.target.textContent}"?`)) {
                    event.target.remove();
                }
            }
        });
    }
});

// --- 1. LOAD DATA ---
async function loadProfile() {
    try {
        const res = await fetch(`${CONFIG.apiBaseUrl}/api/doctor/${CONFIG.userId}`, {
            headers: { 'Authorization': `Bearer ${CONFIG.token}` }
        });

        if (!res.ok) throw new Error("Failed to load profile");
        const data = await res.json();
        currentProfileData = data; // Cache dữ liệu để dùng khi Save

        console.log("Doctor Data:", data);

        // A. Hiển thị UI (View)
        const drName = "Dr. " + (data.fullName || "Unknown");
        setText('headerName', drName);
        setText('dispFullName', data.fullName);
        setText('dispSpecialtyHeader', data.specialtyName || "General");
        setText('dispEmail', data.email);
        setText('dispPhone', data.phoneNumber || '--');

        // Professional Info
        setText('dispSpecialty', data.specialtyName || '--');
        setText('dispLicense', data.licenseNumber || '--');
        setText('dispExp', data.experience || '--');
        setText('dispBio', data.bio || 'No biography information available.');

        if (data.avatarUrl) {
            document.getElementById('headerAvatar').src = data.avatarUrl;
            document.getElementById('dispAvatar').src = data.avatarUrl;
        }

        // Render Tags (Qualifications) ở màn hình chính
        renderTags('listQualifications', data.qualifications, 'condition', false);

        // B. Điền sẵn vào Form (Pre-fill) để nếu user bấm Edit là có ngay
        fillForms(data);

    } catch (err) {
        console.error(err);
    }
}

function fillForms(data) {
    // 1. Basic Info Form
    setValue('editFullName', data.fullName);
    setValue('editEmail', data.email);
    setValue('editPhone', data.phoneNumber);

    // 2. Professional Info Form
    setValue('editSpecialty', data.specialtyName);
    setValue('editLicense', data.licenseNumber);
    setValue('editExperience', data.experience);

    // Render Tags vào trong Modal (cho phép Add/Remove)
    renderTags('editQualificationsContainer', data.qualifications, 'condition', true);

    // 3. Bio Form
    setValue('editBioInput', data.bio);
}

// --- 2. MODAL OPENERS (Các hàm bạn bị thiếu) ---

function editBasicInfo() {
    // Mở modal sửa tên, sđt
    if (currentProfileData) fillForms(currentProfileData);
    new bootstrap.Modal(document.getElementById('editBasicModal')).show();
}

function editProfessionalInfo() {
    // Mở modal chuyên môn
    if (currentProfileData) fillForms(currentProfileData);
    new bootstrap.Modal(document.getElementById('editProfessionalModal')).show();
}

function editBioInfo() {
    // Mở modal Bio
    if (currentProfileData) fillForms(currentProfileData);
    new bootstrap.Modal(document.getElementById('editBioModal')).show();
}

// --- 3. SAVE LOGIC (Gửi API PUT) ---

// Save Basic (Name, Phone)
async function saveBasicInfo() {
    if (!currentProfileData) return;

    const updateData = {
        // Merge dữ liệu cũ (để không mất Address, Gender, DOB...)
        ...currentProfileData,

        // Ghi đè dữ liệu mới từ form
        fullName: getValue('editFullName'),
        phoneNumber: getValue('editPhone')
    };

    await sendUpdate(updateData, 'editBasicModal');
}

// Save Professional (Specialty, License, Exp, Tags)
async function saveProfessionalInfo() {
    if (!currentProfileData) return;

    const updateData = {
        ...currentProfileData,

        specialty: getValue('editSpecialty'), // Nếu backend nhận string name
        // specialtyId: ... (Nếu backend cần ID thì phải xử lý dropdown)

        licenseNumber: getValue('editLicense'),
        experience: getValue('editExperience'),
        qualifications: getTagsFromUI('editQualificationsContainer') // Lấy list tags mới
    };

    await sendUpdate(updateData, 'editProfessionalModal');
}

// Save Bio
async function saveBioInfo() {
    if (!currentProfileData) return;

    const updateData = {
        ...currentProfileData,
        bio: getValue('editBioInput')
    };

    await sendUpdate(updateData, 'editBioModal');
}

// Hàm gọi API chung
async function sendUpdate(data, modalId) {
    try {
        const btn = document.querySelector(`#${modalId} .btn-primary`);
        const oldText = btn.innerText;
        btn.innerText = "Saving...";
        btn.disabled = true;

        const res = await fetch(`${CONFIG.apiBaseUrl}/api/doctor/profile`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${CONFIG.token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (res.ok) {
            alert("Updated successfully!");
            const modal = bootstrap.Modal.getInstance(document.getElementById(modalId));
            if (modal) modal.hide();
            loadProfile(); // Reload lại UI
        } else {
            const txt = await res.text();
            alert("Update failed: " + txt);
        }

        btn.innerText = oldText;
        btn.disabled = false;
    } catch (err) {
        console.error(err);
        alert("Error saving data");
    }
}


// --- HELPERS ---

function renderTags(containerId, items, typeClass, allowAddRemove) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    if (items && items.length > 0) {
        items.forEach(item => {
            if (!item) return;
            const span = document.createElement('span');
            span.className = `health-tag ${typeClass}`;
            span.textContent = item;
            if (allowAddRemove) {
                span.title = "Double click to remove";
                span.style.cursor = "pointer";
            }
            container.appendChild(span);
        });
    }

    if (allowAddRemove) {
        const addBtn = document.createElement('button');
        addBtn.type = "button"; // Prevent submit
        addBtn.className = 'add-tag-btn';
        addBtn.innerHTML = '<i class="fas fa-plus"></i> Add';
        addBtn.onclick = () => addTagItem(containerId, typeClass);
        container.appendChild(addBtn);
    }
}

function addTagItem(containerId, typeClass) {
    const val = prompt("Enter qualification:");
    if (val && val.trim() !== "") {
        const span = document.createElement('span');
        span.className = `health-tag ${typeClass}`;
        span.textContent = val.trim();
        span.title = "Double click to remove";
        span.style.cursor = "pointer";

        const container = document.getElementById(containerId);
        const btn = container.querySelector('.add-tag-btn');
        container.insertBefore(span, btn);
    }
}

function getTagsFromUI(containerId) {
    const tags = document.querySelectorAll(`#${containerId} .health-tag`);
    return Array.from(tags).map(t => t.textContent);
}

function setText(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = (val !== null && val !== undefined) ? val : '--';
}
function setValue(id, val) {
    const el = document.getElementById(id);
    if (el) el.value = (val !== null && val !== undefined) ? val : '';
}
function getValue(id) { return document.getElementById(id)?.value; }