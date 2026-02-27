// AgroAid Main JS - Fixed v5.0 - No Duplicate Language Code
console.log("AgroAI Frontend Loaded Successfully 🚀");

document.addEventListener("DOMContentLoaded", function () {

    const user = localStorage.getItem("loggedInUser");
    const authArea = document.getElementById("authArea");
    const dashboardNav = document.getElementById("dashboardNav");

    // Setup authentication area
    if (user) {
        if (dashboardNav) dashboardNav.style.display = "block";
        if (authArea) {
            authArea.innerHTML = `
                <div style="display:flex;align-items:center;gap:12px;">
                    <span style="color:rgba(255,255,255,0.85);font-size:0.9rem;font-weight:600;">👋 ${user}</span>
                    <button class="btn-glass" onclick="logout()">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                            <polyline points="16 17 21 12 16 7"/>
                            <line x1="21" x2="9" y1="12" y2="12"/>
                        </svg>
                        <span data-translate="nav_logout">Logout</span>
                    </button>
                </div>`;
        }
    }

    // Mobile menu toggle
    const mobileToggle = document.getElementById("mobileToggle");
    const navMenu = document.getElementById("navMenu");
    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener("click", function () {
            navMenu.classList.toggle("active");
            mobileToggle.classList.toggle("active");
        });
        
        // Close mobile menu when clicking outside
        document.addEventListener("click", function (event) {
            if (!mobileToggle.contains(event.target) && !navMenu.contains(event.target)) {
                navMenu.classList.remove("active");
                mobileToggle.classList.remove("active");
            }
        });
        
        // Close mobile menu when clicking a link
        navMenu.querySelectorAll(".nav-link").forEach(link => {
            link.addEventListener("click", function () {
                navMenu.classList.remove("active");
                mobileToggle.classList.remove("active");
            });
        });
    }

    // NOTE: Language selector is handled by translate.js
    // No duplicate code needed here
});

// ═══════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════

function logout() {
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("token");
    showGlassToast("Logged out successfully 👋");
    setTimeout(() => { 
        window.location.href = "index.html"; 
    }, 1000);
}

function openWeatherFeature() {
    const token = localStorage.getItem("token");
    if (token) {
        window.location.href = "weather.html";
    } else {
        showGlassToast("⚠️ Please login first to access this feature.");
        setTimeout(() => { 
            window.location.href = "auth.html"; 
        }, 1500);
    }
}

function showGlassToast(message) {
    const existing = document.querySelector('.glass-toast');
    if (existing) existing.remove();
    
    const toast = document.createElement('div');
    toast.className = 'glass-toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    // Remove after delay
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}

// ═══════════════════════════════════════════════════════════════
// GLOBAL FUNCTIONS (accessible from HTML onclick attributes)
// ═══════════════════════════════════════════════════════════════

// Make functions globally accessible
window.logout = logout;
window.openWeatherFeature = openWeatherFeature;
window.showGlassToast = showGlassToast;
