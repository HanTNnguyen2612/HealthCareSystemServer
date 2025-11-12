// Profile page functionality
document.addEventListener("DOMContentLoaded", () => {
    updateUserInfo()
})

function updateUserInfo() {
    const userName = localStorage.getItem("userName") || "John Doe"
    const userEmail = localStorage.getItem("userEmail") || "john.doe@email.com"

    document.getElementById("userName").textContent = userName
    document.getElementById("profileName").textContent = userName
    document.getElementById("profileEmail").textContent = userEmail
}

function editPersonalInfo() {
    const modal = new window.bootstrap.Modal(document.getElementById("editPersonalModal"))

    // Pre-fill form with current data
    const userName = localStorage.getItem("userName") || "John Doe"
    const userEmail = localStorage.getItem("userEmail") || "john.doe@email.com"
    const [firstName, lastName] = userName.split(" ")

    document.getElementById("editFirstName").value = firstName || ""
    document.getElementById("editLastName").value = lastName || ""
    document.getElementById("editEmail").value = userEmail
    document.getElementById("editPhone").value = "+1 (555) 123-4567"
    document.getElementById("editDOB").value = "1990-01-01"
    document.getElementById("editGender").value = "male"
    document.getElementById("editAddress").value = "123 Main St, City, State 12345"
    document.getElementById("editEmergencyContact").value = "Jane Doe - (555) 987-6543"

    modal.show()
}

function savePersonalInfo() {
    const firstName = document.getElementById("editFirstName").value
    const lastName = document.getElementById("editLastName").value
    const email = document.getElementById("editEmail").value
    const phone = document.getElementById("editPhone").value
    const dob = document.getElementById("editDOB").value

    // Update localStorage
    localStorage.setItem("userName", `${firstName} ${lastName}`)
    localStorage.setItem("userEmail", email)

    // Update UI
    updateUserInfo()
    document.getElementById("profilePhone").textContent = phone
    document.getElementById("profileDOB").textContent = new Date(dob).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    })

    // Close modal
    const modal = window.bootstrap.Modal.getInstance(document.getElementById("editPersonalModal"))
    modal.hide()

    alert("Personal information updated successfully!")
}

function editHealthInfo() {
    alert("Health information editing would be implemented here")
}

function editInsurance() {
    alert("Insurance information editing would be implemented here")
}

function changeAvatar() {
    alert("Avatar change functionality would be implemented here")
}

function addAllergy() {
    const allergy = prompt("Enter new allergy:")
    if (allergy) {
        alert(`Added allergy: ${allergy}`)
    }
}

function addMedication() {
    const medication = prompt("Enter new medication:")
    if (medication) {
        alert(`Added medication: ${medication}`)
    }
}

function addCondition() {
    const condition = prompt("Enter new medical condition:")
    if (condition) {
        alert(`Added condition: ${condition}`)
    }
}

function deleteAccount() {
    if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
        if (confirm("This will permanently delete all your data. Are you absolutely sure?")) {
            alert("Account deletion would be processed here")
        }
    }
}

function logout() {
    if (confirm("Are you sure you want to logout?")) {
        localStorage.clear()
        window.location.href = "index.html"
    }
}
