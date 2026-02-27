document.addEventListener("DOMContentLoaded", function () {

  // ── PAGE PROTECTION ──────────────────────────────────────────
  const user = localStorage.getItem("loggedInUser");
  if (!user) {
    window.location.replace("auth.html");
    return;
  }

  requestAnimationFrame(() =>
    document.body.classList.add("page-ready")
  );

  const userNameEl = document.getElementById("userName");
  if (userNameEl) userNameEl.innerText = user;

  // ── LOAD USER PREDICTIONS ─────────────────────────────────────
  const userKey = "predictions_" + user;
  let predictions = JSON.parse(localStorage.getItem(userKey)) || [];

  // 🔥 REMOVE INVALID ENTRIES (Auto-clean old data)
  predictions = predictions.filter(p => {
    const diseaseLower = (p.disease || "").toLowerCase();
    return !(
      diseaseLower.includes("irrelevant") ||
      diseaseLower.includes("irelevant") ||
      diseaseLower.includes("unclear")
    );
  });

  // Save cleaned data back
  localStorage.setItem(userKey, JSON.stringify(predictions));

  // ── RENDER TABLE ──────────────────────────────────────────────
  const table = document.getElementById("predictionTable");
  table.innerHTML = "";

  let high = 0, medium = 0, low = 0;

  if (predictions.length === 0) {
    table.innerHTML = `
      <tr>
        <td colspan="5" style="padding:60px 40px;text-align:center;">
          <p style="color:rgba(255,255,255,0.7);">
            No valid predictions yet for <strong>${user}</strong>
          </p>
        </td>
      </tr>`;
  } else {
    predictions.slice().reverse().forEach(function (p, index) {

      if (p.risk === "High") high++;
      else if (p.risk === "Medium") medium++;
      else low++;

      const formattedDate = formatDate(p.date);
      const fruitName = capitalizeFirst(p.fruit);

      const badgeClass =
        p.risk === "High" ? "bg-danger"
        : p.risk === "Medium" ? "bg-warning text-dark"
        : "bg-success";

      table.innerHTML += `
        <tr style="animation: fadeInRow 0.45s ease ${index * 0.05}s both;">
          <td>${formattedDate}</td>
          <td>${fruitName}</td>
          <td>${p.disease}</td>
          <td>
            <div style="display:flex;align-items:center;gap:8px;">
              <div style="flex:1;max-width:100px;height:8px;
                          background:rgba(255,255,255,0.1);
                          border-radius:10px;overflow:hidden;">
                <div style="width:${p.confidence}%;height:100%;
                            background:linear-gradient(90deg,#10b981,#059669);
                            border-radius:10px;"></div>
              </div>
              <span style="font-weight:700;min-width:45px;">
                ${p.confidence}%
              </span>
            </div>
          </td>
          <td>
            <span class="badge ${badgeClass}">
              ${p.risk}
            </span>
          </td>
        </tr>`;
    });
  }

  // ── STAT COUNTERS ─────────────────────────────────────────────
  animateCounter("totalScans", predictions.length);
  animateCounter("highRisk", high);
  animateCounter("mediumRisk", medium);
  animateCounter("healthyCount", low);

  setupFilters();
});


// ── HELPERS ────────────────────────────────────────────────────

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

function capitalizeFirst(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function animateCounter(elementId, targetValue) {
  const el = document.getElementById(elementId);
  if (!el) return;

  let current = 0;
  const steps = 30;
  const increment = targetValue / steps;
  const intervalTime = 900 / steps;

  const timer = setInterval(function () {
    current += increment;

    if (current >= targetValue) {
      el.innerText = targetValue;
      clearInterval(timer);
    } else {
      el.innerText = Math.floor(current);
    }
  }, intervalTime);
}

function setupFilters() {
  const filterButtons = document.querySelectorAll(".filter-btn");
  if (!filterButtons.length) return;

  filterButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {

      filterButtons.forEach(b => b.classList.remove("active"));
      this.classList.add("active");

      const filterText = this.textContent.trim();
      const rows = document.querySelectorAll("#predictionTable tr");

      rows.forEach(function (row) {
        const badge = row.querySelector(".badge");
        if (!badge) return;

        const risk = badge.textContent.trim();

        const show =
          filterText === "All" ||
          (filterText === "High Risk" && risk === "High") ||
          (filterText === "Medium" && risk === "Medium") ||
          (filterText === "Low" && risk === "Low");

        row.style.display = show ? "" : "none";
      });
    });
  });
}


// ── ROW ANIMATION ──────────────────────────────────────────────
const style = document.createElement("style");
style.textContent = `
  @keyframes fadeInRow {
    from { opacity:0; transform:translateY(8px); }
    to   { opacity:1; transform:translateY(0); }
  }`;
document.head.appendChild(style);