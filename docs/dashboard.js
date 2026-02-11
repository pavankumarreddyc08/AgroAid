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
        table.innerHTML = `
            <tr>
                <td colspan="5" class="text-muted">
                    No predictions yet. Go to Detect page to start.
                </td>
            </tr>
        `;
    } else {

        // Show latest first
        predictions.slice().reverse().forEach(p => {

            if (p.risk === "High") high++;
            else if (p.risk === "Medium") medium++;
            else low++;

            const row = `
                <tr>
                    <td>${p.date}</td>
                    <td>${p.fruit}</td>
                    <td>${p.disease}</td>
                    <td>${p.confidence}%</td>
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

    // ================= UPDATE SUMMARY CARDS =================
    document.getElementById("totalScans").innerText = predictions.length;
    document.getElementById("highRisk").innerText = high;
    document.getElementById("mediumRisk").innerText = medium;
    document.getElementById("healthyCount").innerText = low;

});
