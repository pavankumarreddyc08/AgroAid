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
                <button class="btn-glass" onclick="logout()">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                        <polyline points="16 17 21 12 16 7"/>
                        <line x1="21" x2="9" y1="12" y2="12"/>
                    </svg>
                    <span>Logout</span>
                </button>
            `;
        }
    }

    // Mobile Menu Toggle
    const mobileToggle = document.getElementById("mobileToggle");
    const navMenu = document.getElementById("navMenu");

    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener("click", function() {
            navMenu.classList.toggle("active");
            mobileToggle.classList.toggle("active");
        });

        // Close menu when clicking outside
        document.addEventListener("click", function(event) {
            if (!mobileToggle.contains(event.target) && !navMenu.contains(event.target)) {
                navMenu.classList.remove("active");
                mobileToggle.classList.remove("active");
            }
        });

        // Close menu when clicking a link
        const navLinks = navMenu.querySelectorAll(".nav-link");
        navLinks.forEach(link => {
            link.addEventListener("click", function() {
                navMenu.classList.remove("active");
                mobileToggle.classList.remove("active");
            });
        });
    }
});

function logout() {
    localStorage.removeItem("loggedInUser");
    alert("Logged out successfully 👋");
    window.location.href = "index.html";
}