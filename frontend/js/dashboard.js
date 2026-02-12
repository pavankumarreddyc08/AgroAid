document.addEventListener("DOMContentLoaded", function () {

    // ================= USER NAME =================
    const userName = localStorage.getItem("loggedInUser");
    if (userName) {
        document.getElementById("userName").innerText = userName;
    }

    // ================= LOAD PREDICTIONS =================
    const predictions = JSON.parse(localStorage.getItem("predictions")) || [];

    const table = document.getElementById("predictionTable");

    let high = 0;
    let medium = 0;
    let low = 0;

    // Clear table first (important to avoid duplication)
    table.innerHTML = "";

    if (predictions.length === 0) {
        // Modern empty state
        table.innerHTML = `
            <tr>
                <td colspan="5" style="padding: 60px 40px;">
                    <div class="empty-state">
                        <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <polyline points="14 2 14 8 20 8"/>
                            <line x1="12" y1="18" x2="12" y2="12"/>
                            <line x1="9" y1="15" x2="15" y2="15"/>
                        </svg>
                        <p>No predictions yet</p>
                        <a href="detect.html" style="display: inline-flex; align-items: center; gap: 8px; padding: 12px 24px; background: rgba(102, 126, 234, 0.25); border: 1px solid rgba(102, 126, 234, 0.4); border-radius: 12px; color: #667eea; font-weight: 600; text-decoration: none; margin-top: 8px; transition: all 0.3s ease;">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="11" cy="11" r="8"/>
                                <path d="m21 21-4.3-4.3"/>
                            </svg>
                            Start Your First Scan
                        </a>
                    </div>
                </td>
            </tr>
        `;
    } else {

        // Show latest first
        predictions.slice().reverse().forEach((p, index) => {

            if (p.risk === "High") high++;
            else if (p.risk === "Medium") medium++;
            else low++;

            // Format date to be more readable
            const formattedDate = formatDate(p.date);

            // Capitalize fruit name
            const fruitName = capitalizeFirst(p.fruit);

            const row = `
                <tr style="animation: fadeInRow 0.5s ease ${index * 0.05}s both;">
                    <td>${formattedDate}</td>
                    <td>${fruitName}</td>
                    <td>${p.disease}</td>
                    <td>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <div style="flex: 1; max-width: 100px; height: 8px; background: rgba(255, 255, 255, 0.1); border-radius: 10px; overflow: hidden;">
                                <div style="width: ${p.confidence}%; height: 100%; background: linear-gradient(90deg, #10b981, #059669); border-radius: 10px;"></div>
                            </div>
                            <span style="font-weight: 700; min-width: 45px;">${p.confidence}%</span>
                        </div>
                    </td>
                    <td>
                        <span class="badge 
                            ${p.risk === "High" ? "bg-danger" :
                              p.risk === "Medium" ? "bg-warning text-dark" :
                              "bg-success"}">
                            ${p.risk}
                        </span>
                    </td>
                </tr>
            `;

            table.innerHTML += row;
        });
    }

    // ================= UPDATE SUMMARY CARDS WITH ANIMATION =================
    animateCounter("totalScans", predictions.length);
    animateCounter("highRisk", high);
    animateCounter("mediumRisk", medium);
    animateCounter("healthyCount", low);

    // ================= FILTER FUNCTIONALITY =================
    setupFilters();
});

// Helper function to format date
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Helper function to capitalize first letter
function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Animate counter function
function animateCounter(elementId, targetValue) {
    const element = document.getElementById(elementId);
    if (!element) return;

    let current = 0;
    const increment = targetValue / 30; // 30 steps
    const duration = 1000; // 1 second
    const stepTime = duration / 30;

    const timer = setInterval(() => {
        current += increment;
        if (current >= targetValue) {
            element.innerText = targetValue;
            clearInterval(timer);
        } else {
            element.innerText = Math.floor(current);
        }
    }, stepTime);
}

// Setup filter buttons
function setupFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const tableRows = document.querySelectorAll('#predictionTable tr');

    if (filterButtons.length === 0) return;

    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');

            const filterText = this.textContent.trim();

            // Show/hide rows based on filter
            tableRows.forEach(row => {
                const riskBadge = row.querySelector('.badge');
                
                if (!riskBadge) {
                    // Empty state row
                    row.style.display = '';
                    return;
                }

                const riskText = riskBadge.textContent.trim();

                if (filterText === 'All') {
                    row.style.display = '';
                } else if (filterText === 'High Risk' && riskText === 'High') {
                    row.style.display = '';
                } else if (filterText === 'Medium' && riskText === 'Medium') {
                    row.style.display = '';
                } else if (filterText === 'Low' && riskText === 'Low') {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });

            // Check if all rows are hidden
            const visibleRows = Array.from(tableRows).filter(row => row.style.display !== 'none');
            const tbody = document.getElementById('predictionTable');
            
            if (visibleRows.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="5" style="padding: 40px; text-align: center; color: rgba(255, 255, 255, 0.6);">
                            No predictions found for this filter
                        </td>
                    </tr>
                `;
            }
        });
    });
}

// Add CSS animation for row fade-in
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInRow {
        from {
            opacity: 0;
            transform: translateY(10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);