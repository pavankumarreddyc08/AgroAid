// ================= ELEMENTS =================
const imageInput = document.getElementById("imageInput");
const previewImage = document.getElementById("previewImage");
const previewContainer = document.getElementById("previewContainer");
const uploadBox = document.getElementById("uploadBox");
const loading = document.getElementById("loading");
const resultSection = document.getElementById("resultSection");

// ================= CROP SELECTION =================
let selectedCrop = "potato"; // Default to potato

function selectCrop(crop) {
  selectedCrop = crop;

  // Update UI - remove all selected classes
  document.querySelectorAll(".crop-card").forEach((card) => {
    card.classList.remove("selected");
  });

  // Add selected class to clicked crop
  const cropCard = document.querySelector(`[data-crop="${crop}"]`);
  if (cropCard) {
    cropCard.classList.add("selected");
  }

  // Show selected crop display
  document.getElementById("selectedCropDisplay").style.display = "flex";

  // Update emoji
  const emojiMap = {
    potato: "🥔",
    tomato: "🍅",
    onion: "🧅",
  };

  const cropNameEl = document.getElementById("selectedCropName");
  cropNameEl.textContent =
    crop.charAt(0).toUpperCase() + crop.slice(1) + " " + emojiMap[crop];
}

function showComingSoon(cropName) {
  const notification = document.createElement("div");
  notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 30px;
        padding: 20px 30px;
        background: rgba(251, 191, 36, 0.95);
        backdrop-filter: blur(10px);
        border-radius: 16px;
        color: white;
        font-weight: 600;
        z-index: 10000;
        box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        animation: slideIn 0.4s ease;
    `;
  notification.innerHTML = `
        <div style="display:flex; align-items:center; gap:12px;">
            <span style="font-size:1.5rem;">🔄</span>
            <div>
                <div style="font-size:1rem;">${cropName} Model</div>
                <div style="font-size:0.9rem; opacity:0.9;">Coming Soon! We're working on it.</div>
            </div>
        </div>
    `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = "slideOut 0.4s ease";
    setTimeout(() => notification.remove(), 400);
  }, 3000);
}

// Initialize with potato selected
window.addEventListener("DOMContentLoaded", () => {
  selectCrop("potato");
});

// ================= IMAGE PREVIEW =================
imageInput.addEventListener("change", function () {
  const file = this.files[0];

  if (file) {
    previewImage.src = URL.createObjectURL(file);
    previewContainer.style.display = "block";
    uploadBox.style.display = "none";
  }
});

// Drag and drop functionality
uploadBox.addEventListener("dragover", function (e) {
  e.preventDefault();
  uploadBox.style.borderColor = "rgba(255, 255, 255, 0.6)";
  uploadBox.style.background = "rgba(255, 255, 255, 0.15)";
});

uploadBox.addEventListener("dragleave", function (e) {
  e.preventDefault();
  uploadBox.style.borderColor = "rgba(255, 255, 255, 0.3)";
  uploadBox.style.background = "rgba(255, 255, 255, 0.08)";
});

uploadBox.addEventListener("drop", function (e) {
  e.preventDefault();
  uploadBox.style.borderColor = "rgba(255, 255, 255, 0.3)";
  uploadBox.style.background = "rgba(255, 255, 255, 0.08)";

  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith("image/")) {
    imageInput.files = e.dataTransfer.files;
    previewImage.src = URL.createObjectURL(file);
    previewContainer.style.display = "block";
    uploadBox.style.display = "none";
  }
});

// Remove image function
function removeImage() {
  imageInput.value = "";
  previewContainer.style.display = "none";
  uploadBox.style.display = "block";
  resultSection.style.display = "none";
}

// New scan function
function newScan() {
  removeImage();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ================= DETECT FUNCTION =================
async function detectDisease() {
  const file = imageInput.files[0];

  if (!file) {
    alert("Please upload an image first!");
    return;
  }

  // Check if selected crop is available
  if (selectedCrop !== "potato") {
    showComingSoon(
      selectedCrop.charAt(0).toUpperCase() + selectedCrop.slice(1),
    );
    return;
  }

  loading.style.display = "block";
  resultSection.style.display = "none";

  const formData = new FormData();
  formData.append("file", file);
  formData.append("crop", selectedCrop);

  try {
    const response = await fetch("/predict", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    loading.style.display = "none";

    if (!response.ok) {
      alert(data.error || "Detection failed");
      return;
    }

    resultSection.style.display = "block";

    updateUI(data.disease, data.confidence);
    savePrediction(data.disease, data.confidence);

    resultSection.scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (error) {
    loading.style.display = "none";
    alert("Backend connection failed ❌");
    console.error(error);
  }
}

// ================= UPDATE UI =================
function updateUI(disease, confidence) {
  document.getElementById("diseaseName").innerText = disease;

  const confidenceBar = document.getElementById("confidenceBar");
  const confidenceText = document.getElementById("confidenceText");
  const confidenceContainer = confidenceBar.parentElement; // bar wrapper

  const riskBadge = document.getElementById("riskLevel");

  let risk = "";
  let riskClass = "";

  const diseaseLower = disease.toLowerCase().trim();

  const isInvalid =
    diseaseLower.includes("irrelevant") ||
    diseaseLower.includes("irelevant") ||
    diseaseLower.includes("unclear");

  // ===== RISK LOGIC =====
  if (diseaseLower === "healthy") {
    risk = "No Risk";
    riskClass = "low";

  } else if (isInvalid) {
    risk = "Upload Leaf Image";
    riskClass = "invalid";

  } else if (confidence > 80) {
    risk = "High Risk";
    riskClass = "high";

  } else if (confidence > 65) {
    risk = "Medium Risk";
    riskClass = "medium";

  } else {
    risk = "Low Risk";
    riskClass = "low";
  }

  riskBadge.innerText = risk;
  riskBadge.className = "risk-badge risk-" + riskClass;

  // ===== CONFIDENCE VISIBILITY =====
  if (isInvalid) {
    confidenceContainer.style.display = "none";   // 🔥 HIDE BAR
    confidenceText.style.display = "none";
  } else {
    confidenceContainer.style.display = "block";  // SHOW BAR
    confidenceText.style.display = "inline";

    setTimeout(() => {
      confidenceBar.style.width = confidence + "%";
    }, 100);

    confidenceText.innerText = confidence + "%";
  }

  // ===== TREATMENT MESSAGE =====
  let treatmentMessage = "Apply recommended treatment and monitor crop health regularly.";

  if (isInvalid) {
    treatmentMessage =
      "⚠️ Please upload a clear image of a crop leaf for accurate disease detection.";

  } else if (diseaseLower === "healthy") {
    treatmentMessage =
      "Great! Your crop looks healthy. Continue regular monitoring.";

  } else if (diseaseLower === "early blight") {
    treatmentMessage =
      "Apply fungicide spray (Mancozeb or Chlorothalonil). Remove infected leaves.";

  } else if (diseaseLower === "late blight") {
    treatmentMessage =
      "URGENT: Apply copper-based fungicide immediately.";

  } else if (diseaseLower === "fungal diseases") {
    treatmentMessage =
      "Apply preventive fungicide spray and improve drainage.";

  } else if (diseaseLower === "plant pests") {
    treatmentMessage =
      "Use neem oil or appropriate insecticides.";
  }

  document.getElementById("treatmentText").innerText = treatmentMessage;
}

// ================= SAVE TO DASHBOARD =================
function savePrediction(disease, confidence) {
  // Get current user
  const user = localStorage.getItem("loggedInUser");
  if (!user) return;

  // Use user-specific key
  const userKey = `predictions_${user}`;
  const predictions = JSON.parse(localStorage.getItem(userKey)) || [];

  // FIXED: Proper risk calculation for dashboard
  let risk = "Low";
  
  if (disease === "Healthy") {
    risk = "Low";
  } else if (disease === "irrelevantt" || disease.toLowerCase().includes("unclear") || disease.toLowerCase().includes("irrelevant")) {
    // Don't save invalid images to dashboard
    return;
  } else if (confidence > 80) {
    risk = "High";
  } else if (confidence > 65) {
    risk = "Medium";
  } else {
    risk = "Low";
  }

  const newEntry = {
    date: new Date().toISOString().split("T")[0],
    fruit: selectedCrop,
    disease: disease,
    confidence: confidence,
    risk: risk,
  };

  predictions.push(newEntry);

  localStorage.setItem(userKey, JSON.stringify(predictions));
}

function saveToDashboard() {
  // Show success notification
  const notification = document.createElement("div");
  notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 30px;
        padding: 20px 30px;
        background: rgba(34, 197, 94, 0.95);
        backdrop-filter: blur(10px);
        border-radius: 16px;
        color: white;
        font-weight: 600;
        z-index: 10000;
        box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        animation: slideIn 0.4s ease;
    `;
  notification.innerHTML = `
        <div style="display:flex; align-items:center; gap:12px;">
            <span style="font-size:1.5rem;">✅</span>
            <div>
                <div style="font-size:1rem;">Saved Successfully!</div>
                <div style="font-size:0.9rem; opacity:0.9;">View it in your dashboard</div>
            </div>
        </div>
    `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = "slideOut 0.4s ease";
    setTimeout(() => notification.remove(), 400);
  }, 3000);
}

// Add animation styles
const style = document.createElement("style");
style.textContent = `
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
`;
document.head.appendChild(style);
