function toggleForm() {
    document.querySelector(".login").classList.toggle("active");
    document.querySelector(".register").classList.toggle("active");
}


function register() {
    const name = document.getElementById("registerName").value.trim();
    const email = document.getElementById("registerEmail").value.trim();
    const password = document.getElementById("registerPassword").value;

    if (!name || !email || !password) {
        showNotification("Please fill all fields", "error");
        return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showNotification("Please enter a valid email address", "error");
        return;
    }

    // Password strength check
    if (password.length < 6) {
        showNotification("Password must be at least 6 characters long", "error");
        return;
    }

    // Store user
    const user = { name, email, password };
    localStorage.setItem("agroUser", JSON.stringify(user));

    showNotification("Registration Successful! 🎉", "success");
    
    // Auto-switch to login form after 1.5 seconds
    setTimeout(() => {
        toggleForm();
        // Clear register fields
        document.getElementById("registerName").value = "";
        document.getElementById("registerEmail").value = "";
        document.getElementById("registerPassword").value = "";
        // Pre-fill login email
        document.getElementById("loginEmail").value = email;
    }, 1500);
}

function login() {
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    if (!email || !password) {
        showNotification("Please enter email and password", "error");
        return;
    }

    const storedUser = JSON.parse(localStorage.getItem("agroUser"));

    if (!storedUser) {
        showNotification("No account found. Please register first!", "error");
        return;
    }

    if (storedUser.email !== email || storedUser.password !== password) {
        showNotification("Invalid email or password ❌", "error");
        return;
    }

    localStorage.setItem("loggedInUser", storedUser.name);

    showNotification("Login Successful! ✅", "success");
    
    // Redirect after short delay for better UX
    setTimeout(() => {
        window.location.href = "index.html";
    }, 1000);
}

// Modern notification system
function showNotification(message, type) {
    // Remove existing notifications
    const existingNotif = document.querySelector('.custom-notification');
    if (existingNotif) {
        existingNotif.remove();
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `custom-notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            ${type === 'success' ? 
                `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                </svg>` : 
                `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>`
            }
            <span>${message}</span>
        </div>
    `;

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
        .custom-notification {
            position: fixed;
            top: 30px;
            right: 30px;
            padding: 16px 24px;
            border-radius: 16px;
            background: rgba(255, 255, 255, 0.15);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.25);
            color: white;
            font-weight: 600;
            font-size: 0.95rem;
            z-index: 10000;
            animation: slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
        }

        .custom-notification.success {
            background: rgba(16, 185, 129, 0.25);
            border-color: rgba(16, 185, 129, 0.4);
        }

        .custom-notification.error {
            background: rgba(239, 68, 68, 0.25);
            border-color: rgba(239, 68, 68, 0.4);
        }

        .notification-content {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .custom-notification svg {
            flex-shrink: 0;
        }

        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateX(100px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }

        @keyframes slideOut {
            from {
                opacity: 1;
                transform: translateX(0);
            }
            to {
                opacity: 0;
                transform: translateX(100px);
            }
        }

        @media (max-width: 768px) {
            .custom-notification {
                top: 20px;
                right: 20px;
                left: 20px;
                font-size: 0.875rem;
            }
        }
    `;

    // Append style if not already added
    if (!document.querySelector('#notification-styles')) {
        style.id = 'notification-styles';
        document.head.appendChild(style);
    }

    // Add notification to page
    document.body.appendChild(notification);

    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
        setTimeout(() => notification.remove(), 400);
    }, 3000);
}

// Input validation on keypress
document.addEventListener('DOMContentLoaded', function() {
    // Enable login on Enter key
    const loginEmail = document.getElementById('loginEmail');
    const loginPassword = document.getElementById('loginPassword');
    
    if (loginEmail && loginPassword) {
        loginPassword.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                login();
            }
        });
    }

    // Enable register on Enter key
    const registerPassword = document.getElementById('registerPassword');
    if (registerPassword) {
        registerPassword.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                register();
            }
        });
    }
});