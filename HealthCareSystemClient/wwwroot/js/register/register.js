// Multi-step signup form functionality
let currentStep = 1
const totalSteps = 3
let selectedRole = "Patient" // Default role is Patient

document.addEventListener("DOMContentLoaded", () => {
    initializeForm()
    setupEventListeners()
})

function initializeForm() {
    // Initialize password strength checker
    const passwordInput = document.getElementById("password")
    if (passwordInput) {
        passwordInput.addEventListener("input", checkPasswordStrength)
    }

    // Initialize BMI calculator
    const weightInput = document.getElementById("weight")
    const heightInput = document.getElementById("height")
    const weightUnit = document.getElementById("weightUnit")
    const heightUnit = document.getElementById("heightUnit")

    if (weightInput && heightInput) {
        ;[weightInput, heightInput, weightUnit, heightUnit].forEach((element) => {
            element.addEventListener("input", calculateBMI)
            element.addEventListener("change", calculateBMI)
        })
    }

    // Initialize role selection
    setupRoleSelection()

    // Initialize medical conditions
    setupMedicalConditions()
}

function setupEventListeners() {
    // Form validation on input
    const form = document.getElementById("multiStepSignupForm")
    const inputs = form.querySelectorAll("input, select, textarea")

    inputs.forEach((input) => {
        input.addEventListener("blur", validateField)
        input.addEventListener("input", clearValidation)
    })

    // Password confirmation validation
    const confirmPassword = document.getElementById("confirmPassword")
    if (confirmPassword) {
        confirmPassword.addEventListener("input", validatePasswordMatch)
    }
}

function setupRoleSelection() {
    const roleCards = document.querySelectorAll(".role-card")

    roleCards.forEach((card) => {
        card.addEventListener("click", function () {
            const role = this.dataset.role
            const radioInput = this.querySelector('input[type="radio"]')

            // Remove active class from all cards
            roleCards.forEach((c) => c.classList.remove("active"))

            // Add active class to clicked card
            this.classList.add("active")

            // Check the radio button
            radioInput.checked = true
            selectedRole = role

            // Clear any validation errors
            clearValidation({ target: radioInput })
        })
    })
}

function setupMedicalConditions() {
    const noneCheckbox = document.getElementById("none")
    const otherCheckboxes = document.querySelectorAll('input[name="conditions[]"]:not(#none)')

    if (noneCheckbox) {
        noneCheckbox.addEventListener("change", function () {
            if (this.checked) {
                otherCheckboxes.forEach((checkbox) => {
                    checkbox.checked = false
                })
            }
        })
    }

    otherCheckboxes.forEach((checkbox) => {
        checkbox.addEventListener("change", function () {
            if (this.checked && noneCheckbox) {
                noneCheckbox.checked = false
            }
        })
    })
}

function nextStep() {
    if (validateCurrentStep()) {
        if (currentStep < totalSteps) {
            // Special handling for role-based flow
            if (currentStep === 1 && selectedRole === "doctor") {
                // Skip health info step for doctors
                currentStep = 3
                showStep(3)
                updateProgressBar()
                // Submit form when reaching step 3
                submitForm()
            } else {
                currentStep++
                showStep(currentStep)
                updateProgressBar()
                
                // Submit form when reaching step 3 (final step)
                if (currentStep === 3) {
                    submitForm()
                }
            }
        }
    } else {
        // Validation failed - scroll to first error field
        const currentStepEl = document.getElementById(`step${currentStep}`)
        const firstError = currentStepEl.querySelector(".is-invalid")
        if (firstError) {
            firstError.scrollIntoView({ behavior: "smooth", block: "center" })
            firstError.focus()
        }
    }
}

function submitForm() {
    const form = document.getElementById("multiStepSignupForm")
    if (form) {
        // Trigger form submit
        form.submit()
    }
}

function prevStep() {
    if (currentStep > 1) {
        // Special handling for role-based flow
        if (currentStep === 3 && selectedRole === "doctor") {
            // Go back to step 1 for doctors
            currentStep = 1
        } else {
            currentStep--
        }
        showStep(currentStep)
        updateProgressBar()
    }
}

function showStep(step) {
    // Hide all steps
    document.querySelectorAll(".signup-step").forEach((stepEl) => {
        stepEl.classList.remove("active")
    })

    // Show current step
    const currentStepEl = document.getElementById(`step${step}`)
    if (currentStepEl) {
        currentStepEl.classList.add("active")
        // Scroll to top of form container
        const formContainer = document.querySelector(".signup-form-container")
        if (formContainer) {
            formContainer.scrollIntoView({ behavior: "smooth", block: "start" })
        }
    } else {
        console.error(`Step ${step} element not found`)
    }
}

function updateProgressBar() {
    const progressSteps = document.querySelectorAll(".progress-step")

    progressSteps.forEach((step, index) => {
        const stepNumber = index + 1

        if (stepNumber < currentStep || stepNumber === currentStep) {
            step.classList.add("active")
        } else {
            step.classList.remove("active")
        }

        if (stepNumber < currentStep) {
            step.classList.add("completed")
        } else {
            step.classList.remove("completed")
        }
    })
}

function validateCurrentStep() {
    const currentStepEl = document.getElementById(`step${currentStep}`)
    if (!currentStepEl) {
        console.error(`Step ${currentStep} element not found`)
        return false
    }
    
    const requiredFields = currentStepEl.querySelectorAll("[required]")
    let isValid = true

    // Validate each required field
    requiredFields.forEach((field) => {
        // Skip validation for hidden or disabled fields
        if (field.offsetParent === null || field.disabled) {
            return
        }
        
        if (!validateField({ target: field })) {
            isValid = false
        }
    })

    // Additional validation for step 1
    if (currentStep === 1) {
        // Validate password match
        const password = document.getElementById("password")
        const confirmPassword = document.getElementById("confirmPassword")
        
        if (password && confirmPassword) {
            const passwordValue = password.value
            const confirmPasswordValue = confirmPassword.value

            if (passwordValue && confirmPasswordValue && passwordValue !== confirmPasswordValue) {
                showFieldError(confirmPassword, "Passwords do not match.")
                isValid = false
            }
        }

        // Validate terms checkbox
        const termsCheckbox = document.getElementById("terms")
        if (termsCheckbox && !termsCheckbox.checked) {
            showFieldError(termsCheckbox, "You must agree to the terms and conditions.")
            isValid = false
        }
    }

    return isValid
}

function validateField(event) {
    const field = event.target
    let value = ""
    
    // Handle different field types
    if (field.type === "checkbox") {
        value = field.checked ? "checked" : ""
    } else {
        value = field.value ? field.value.trim() : ""
    }
    
    let isValid = true

    // Clear previous validation
    clearValidation(event)

    // Required field validation
    if (field.hasAttribute("required")) {
        if (field.type === "checkbox") {
            if (!field.checked) {
                showFieldError(field, "This field is required.")
                isValid = false
            }
        } else if (!value) {
            showFieldError(field, "This field is required.")
            isValid = false
        }
    }

    // Only validate format if field has value
    if (!value && !field.hasAttribute("required")) {
        return true // Optional field with no value is valid
    }

    // Email validation
    if (field.type === "email" && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(value)) {
            showFieldError(field, "Please enter a valid email address.")
            isValid = false
        }
    }

    // Password validation
    if (field.id === "password" && value) {
        if (value.length < 8) {
            showFieldError(field, "Password must be at least 8 characters long.")
            isValid = false
        }
    }

    // Phone validation
    if (field.type === "tel" && value) {
        const phoneRegex = /^0\d{9}$/
        if (!phoneRegex.test(value.replace(/[\s\-]/g, ""))) {
            showFieldError(field, "Please enter a valid phone number (10 digits starting with 0).")
            isValid = false
        }
    }

    // Date validation
    if (field.type === "date" && value) {
        const selectedDate = new Date(value)
        const today = new Date()
        if (selectedDate > today) {
            showFieldError(field, "Date of birth cannot be in the future.")
            isValid = false
        }
    }

    return isValid
}

function clearValidation(event) {
    const field = event.target
    field.classList.remove("is-invalid")

    // For checkbox/radio, remove invalid class from parent container
    if (field.type === "checkbox" || field.type === "radio") {
        const formCheck = field.closest(".form-check")
        if (formCheck) {
            formCheck.classList.remove("is-invalid")
        }
    }

    // Find and hide invalid-feedback
    let feedback = null
    
    if (field.type === "checkbox" || field.type === "radio") {
        const formCheck = field.closest(".form-check")
        if (formCheck) {
            feedback = formCheck.querySelector(".invalid-feedback")
        }
    }
    
    if (!feedback) {
        feedback = field.parentNode.querySelector(".invalid-feedback")
    }
    
    if (!feedback && field.nextElementSibling && field.nextElementSibling.classList.contains("invalid-feedback")) {
        feedback = field.nextElementSibling
    }
    
    if (!feedback && field.parentNode.parentNode) {
        feedback = field.parentNode.parentNode.querySelector(".invalid-feedback")
    }
    
    if (feedback) {
        feedback.style.display = "none"
    }

    // Clear role selection validation
    if (field.name === "role") {
        const roleContainer = document.querySelector(".role-selection")
        if (roleContainer) {
            roleContainer.classList.remove("is-invalid")
        }
    }
}

function showFieldError(field, message) {
    field.classList.add("is-invalid")

    // For checkbox/radio, add invalid class to parent container
    if (field.type === "checkbox" || field.type === "radio") {
        const formCheck = field.closest(".form-check")
        if (formCheck) {
            formCheck.classList.add("is-invalid")
        }
    }

    // Find invalid-feedback element - could be sibling or in parent
    let feedback = null
    
    // For checkbox/radio, look in form-check container
    if (field.type === "checkbox" || field.type === "radio") {
        const formCheck = field.closest(".form-check")
        if (formCheck) {
            feedback = formCheck.querySelector(".invalid-feedback")
        }
    }
    
    // If not found, check parent node
    if (!feedback) {
        feedback = field.parentNode.querySelector(".invalid-feedback")
    }
    
    // If not found in parent, check if it's a sibling
    if (!feedback && field.nextElementSibling && field.nextElementSibling.classList.contains("invalid-feedback")) {
        feedback = field.nextElementSibling
    }
    
    // If still not found, check parent's parent (for input groups)
    if (!feedback && field.parentNode.parentNode) {
        feedback = field.parentNode.parentNode.querySelector(".invalid-feedback")
    }
    
    if (feedback) {
        feedback.textContent = message
        feedback.style.display = "block"
    } else {
        // Create feedback element if it doesn't exist
        feedback = document.createElement("div")
        feedback.className = "invalid-feedback"
        feedback.textContent = message
        feedback.style.display = "block"
        
        // Insert after the field or its container
        if (field.type === "checkbox" || field.type === "radio") {
            const formCheck = field.closest(".form-check")
            if (formCheck) {
                formCheck.appendChild(feedback)
            } else {
                field.parentNode.appendChild(feedback)
            }
        } else if (field.parentNode.classList.contains("input-group") || field.parentNode.classList.contains("password-input-container")) {
            field.parentNode.parentNode.insertBefore(feedback, field.parentNode.nextSibling)
        } else {
            field.parentNode.appendChild(feedback)
        }
    }
}

function validatePasswordMatch() {
    const password = document.getElementById("password").value
    const confirmPassword = document.getElementById("confirmPassword").value

    if (confirmPassword && password !== confirmPassword) {
        showFieldError(document.getElementById("confirmPassword"), "Passwords do not match.")
    } else {
        clearValidation({ target: document.getElementById("confirmPassword") })
    }
}

function checkPasswordStrength() {
    const password = document.getElementById("password").value
    const strengthBar = document.querySelector(".strength-fill")
    const strengthText = document.querySelector(".strength-text")

    let strength = 0
    let strengthLabel = "Weak"
    let strengthColor = "#ef4444"

    // Length check
    if (password.length >= 8) strength += 25

    // Uppercase check
    if (/[A-Z]/.test(password)) strength += 25

    // Lowercase check
    if (/[a-z]/.test(password)) strength += 25

    // Number or special character check
    if (/[\d\W]/.test(password)) strength += 25

    // Determine strength label and color
    if (strength >= 75) {
        strengthLabel = "Strong"
        strengthColor = "#10b981"
    } else if (strength >= 50) {
        strengthLabel = "Medium"
        strengthColor = "#f59e0b"
    } else if (strength >= 25) {
        strengthLabel = "Fair"
        strengthColor = "#f97316"
    }

    // Update UI
    strengthBar.style.width = `${strength}%`
    strengthBar.style.backgroundColor = strengthColor
    strengthText.textContent = `Password strength: ${strengthLabel}`
    strengthText.style.color = strengthColor
}

function calculateBMI() {
    const weight = Number.parseFloat(document.getElementById("weight").value)
    const height = Number.parseFloat(document.getElementById("height").value)
    const weightUnit = document.getElementById("weightUnit").value
    const heightUnit = document.getElementById("heightUnit").value

    if (!weight || !height) {
        document.getElementById("bmi").value = ""
        document.getElementById("bmiCategory").textContent = ""
        return
    }

    // Convert to metric units
    let weightKg = weight
    let heightM = height

    if (weightUnit === "lbs") {
        weightKg = weight * 0.453592
    }

    if (heightUnit === "ft") {
        heightM = height * 0.3048
    } else if (heightUnit === "cm") {
        heightM = height / 100
    }

    // Calculate BMI
    const bmi = weightKg / (heightM * heightM)
    document.getElementById("bmi").value = bmi.toFixed(1)

    // Determine BMI category
    let category = ""
    let categoryClass = ""

    if (bmi < 18.5) {
        category = "Underweight"
        categoryClass = "underweight"
    } else if (bmi < 25) {
        category = "Normal"
        categoryClass = "normal"
    } else if (bmi < 30) {
        category = "Overweight"
        categoryClass = "overweight"
    } else {
        category = "Obese"
        categoryClass = "obese"
    }

    const categoryEl = document.getElementById("bmiCategory")
    categoryEl.textContent = category
    categoryEl.className = `bmi-category ${categoryClass}`
}

function togglePassword(fieldId) {
    const field = document.getElementById(fieldId)
    const button = field.parentNode.querySelector(".password-toggle")
    const icon = button.querySelector("i")

    if (field.type === "password") {
        field.type = "text"
        icon.classList.remove("fa-eye")
        icon.classList.add("fa-eye-slash")
    } else {
        field.type = "password"
        icon.classList.remove("fa-eye-slash")
        icon.classList.add("fa-eye")
    }
}

function goToDashboard() {
    window.location.href = "dashboard-modern.html"
}

function completeProfile() {
    window.location.href = "profile.html"
}

// Initialize form when page loads
document.addEventListener("DOMContentLoaded", () => {
    showStep(1)
    updateProgressBar()
})
