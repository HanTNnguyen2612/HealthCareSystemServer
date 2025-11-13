document.addEventListener("DOMContentLoaded", () => {
    const emailInput = document.getElementById("Email");
    const rememberCheckbox = document.getElementById("remember");

    if (!emailInput || !rememberCheckbox) {
        return;
    }

    const rememberedEmail = localStorage.getItem("rememberedEmail");
    if (rememberedEmail) {
        emailInput.value = rememberedEmail;
        rememberCheckbox.checked = true;
    }

    const persistEmailIfNeeded = () => {
        if (!rememberCheckbox) {
            return;
        }

        if (rememberCheckbox.checked) {
            localStorage.setItem("rememberedEmail", emailInput.value ?? "");
        } else {
            localStorage.removeItem("rememberedEmail");
        }
    };

    rememberCheckbox.addEventListener("change", persistEmailIfNeeded);
    emailInput.addEventListener("blur", persistEmailIfNeeded);
});
