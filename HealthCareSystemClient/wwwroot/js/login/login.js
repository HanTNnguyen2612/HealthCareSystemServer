// Authentication functionality
document.addEventListener("DOMContentLoaded", () => {
    // Check if user is already logged in
    if (localStorage.getItem("isLoggedIn") === "true" && window.location.pathname.includes("login.html")) {
        window.location.href = "dashboard.html"
    }

    // Login form handler
    const loginForm = document.getElementById("loginForm")
    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault()

            const email = document.getElementById("email").value
            const password = document.getElementById("password").value

            // Simple validation (in real app, this would be server-side)
            if (email && password) {
                // Store user session
                localStorage.setItem("isLoggedIn", "true")
                localStorage.setItem("userEmail", email)
                localStorage.setItem("userName", "John Doe") // Mock user name

                // Redirect to dashboard
                window.location.href = "dashboard.html"
            } else {
                alert("Please enter valid credentials")
            }
        })
    }

    // Signup form handler
    const signupForm = document.getElementById("signupForm")
    if (signupForm) {
        signupForm.addEventListener("submit", (e) => {
            e.preventDefault()

            const firstName = document.getElementById("firstName").value
            const lastName = document.getElementById("lastName").value
            const email = document.getElementById("email").value
            const password = document.getElementById("password").value
            const confirmPassword = document.getElementById("confirmPassword").value

            if (password !== confirmPassword) {
                alert("Passwords do not match")
                return
            }

            if (firstName && lastName && email && password) {
                // Store user data
                localStorage.setItem("isLoggedIn", "true")
                localStorage.setItem("userEmail", email)
                localStorage.setItem("userName", `${firstName} ${lastName}`)

                // Redirect to dashboard
                window.location.href = "dashboard.html"
            } else {
                alert("Please fill in all required fields")
            }
        })
    }
})

// Logout function
function logout() {
    localStorage.removeItem("isLoggedIn")
    localStorage.removeItem("userEmail")
    localStorage.removeItem("userName")
    window.location.href = "index.html"
}

// Check authentication for protected pages
function checkAuth() {
    if (localStorage.getItem("isLoggedIn") !== "true") {
        window.location.href = "login.html"
    }
}
