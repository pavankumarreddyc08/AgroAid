function toggleForm() {
    document.querySelector(".login").classList.toggle("active");
    document.querySelector(".register").classList.toggle("active");
}


function register() {
    const name = document.getElementById("registerName").value;
    const email = document.getElementById("registerEmail").value;
    const password = document.getElementById("registerPassword").value;

    if (!name || !email || !password) {
        alert("Please fill all fields");
        return;
    }

    // Store user
    const user = { name, email, password };
    localStorage.setItem("agroUser", JSON.stringify(user));

    alert("Registration Successful 🎉");
    toggleForm();
}

function login() {
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    const storedUser = JSON.parse(localStorage.getItem("agroUser"));

    if (!storedUser || storedUser.email !== email || storedUser.password !== password) {
        alert("Invalid credentials ❌");
        return;
    }

    localStorage.setItem("loggedInUser", storedUser.name);

    alert("Login Successful ✅");
    window.location.href = "index.html";
}
