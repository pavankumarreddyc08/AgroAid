console.log("AgroAI Frontend Loaded Successfully 🚀");


document.addEventListener("DOMContentLoaded", function () {

    const user = localStorage.getItem("loggedInUser");
    const authArea = document.getElementById("authArea");
    const dashboardNav = document.getElementById("dashboardNav");

    if (user) {

        // Show Dashboard
        if (dashboardNav) {
            dashboardNav.style.display = "block";
        }

        // Replace Login with Logout
        if (authArea) {
            authArea.innerHTML = `
                <button class="btn btn-danger px-4" onclick="logout()">
                    🚪 Logout
                </button>
            `;
        }
    }
});

function logout() {
    localStorage.removeItem("loggedInUser");
    alert("Logged out successfully 👋");
    window.location.href = "index.html";
}
