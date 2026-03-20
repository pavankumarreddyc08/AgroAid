/**
 * ═══════════════════════════════════════════════════════════════════════════
 * AgroAid Pro - Detect with Camera Feature
 * ═══════════════════════════════════════════════════════════════════════════
 * Features:
 * - Upload from gallery
 * - Camera capture (front/back)
 * - Drag and drop
 * - Offline AI detection
 * - Voice announcements
 * ═══════════════════════════════════════════════════════════════════════════
 */

// ================= ELEMENTS =================
const imageInput = document.getElementById("imageInput");
const previewImage = document.getElementById("previewImage");
const previewContainer = document.getElementById("previewContainer");
const uploadBox = document.getElementById("uploadBox");
const cameraBox = document.getElementById("cameraBox");
const cameraVideo = document.getElementById("cameraVideo");
const cameraCanvas = document.getElementById("cameraCanvas");
const loading = document.getElementById("loading");
const resultSection = document.getElementById("resultSection");

// ================= STATE =================
let selectedCrop = "potato";
let currentMode = "upload"; // 'upload' or 'camera'
let cameraStream = null;
let currentFacingMode = "environment"; // 'user' (front) or 'environment' (back)
let capturedImageBlob = null;

// ================= CROP SELECTION =================
function selectCrop(crop) {
  selectedCrop = crop;

  // Update UI
  document.querySelectorAll(".crop-card").forEach((card) => {
    card.classList.remove("selected");
  });

  const cropCard = document.querySelector(`[data-crop="${crop}"]`);
  if (cropCard) {
    cropCard.classList.add("selected");
  }

  document.getElementById("selectedCropDisplay").style.display = "flex";

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
        <div style="font-size:0.9rem; opacity:0.9;">Coming Soon!</div>
      </div>
    </div>
  `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = "slideOut 0.4s ease";
    setTimeout(() => notification.remove(), 400);
  }, 3000);
}

// Initialize
window.addEventListener("DOMContentLoaded", () => {
  selectCrop("potato");
});

// ================= MODE SWITCHING (Upload / Camera) =================
function switchMode(mode) {
  currentMode = mode;

  // Update button states
  document.querySelectorAll(".mode-btn").forEach(btn => {
    btn.classList.remove("active");
  });
  document.querySelector(`[data-mode="${mode}"]`).classList.add("active");

  if (mode === "upload") {
    uploadBox.style.display = "block";
    cameraBox.style.display = "none";
    stopCamera();
  } else if (mode === "camera") {
    uploadBox.style.display = "none";
    cameraBox.style.display = "block";
    startCamera();
  }

  // Hide preview and results
  previewContainer.style.display = "none";
  resultSection.style.display = "none";
}

// ================= CAMERA FUNCTIONS =================
async function startCamera() {
  try {
    // Check if camera is supported
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert("Camera not supported on this device");
      switchMode("upload");
      return;
    }

    // Request camera access
    cameraStream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: currentFacingMode,
        width: { ideal: 1280 },
        height: { ideal: 720 }
      },
      audio: false
    });

    cameraVideo.srcObject = cameraStream;
    cameraVideo.play();

    console.log("📷 Camera started:", currentFacingMode);

  } catch (error) {
    console.error("❌ Camera error:", error);
    
    if (error.name === "NotAllowedError") {
      alert("Camera permission denied. Please enable camera access.");
    } else if (error.name === "NotFoundError") {
      alert("No camera found on this device.");
    } else {
      alert("Failed to access camera: " + error.message);
    }
    
    switchMode("upload");
  }
}

function stopCamera() {
  if (cameraStream) {
    cameraStream.getTracks().forEach(track => track.stop());
    cameraStream = null;
    cameraVideo.srcObject = null;
    console.log("📷 Camera stopped");
  }
}

async function switchCamera() {
  // Toggle between front and back camera
  currentFacingMode = currentFacingMode === "environment" ? "user" : "environment";
  
  stopCamera();
  await startCamera();
}

function capturePhoto() {
  if (!cameraStream) {
    alert("Camera not available");
    return;
  }

  // Get video dimensions
  const videoWidth = cameraVideo.videoWidth;
  const videoHeight = cameraVideo.videoHeight;

  // Set canvas size
  cameraCanvas.width = videoWidth;
  cameraCanvas.height = videoHeight;

  // Draw video frame to canvas
  const context = cameraCanvas.getContext("2d");
  context.drawImage(cameraVideo, 0, 0, videoWidth, videoHeight);

  // Convert canvas to blob
  cameraCanvas.toBlob((blob) => {
    capturedImageBlob = blob;
    
    // Show preview
    previewImage.src = URL.createObjectURL(blob);
    previewContainer.style.display = "block";
    cameraBox.style.display = "none";
    
    stopCamera();
    
    console.log("📸 Photo captured");
  }, "image/jpeg", 0.9);
}

// ================= IMAGE UPLOAD =================
imageInput.addEventListener("change", function () {
  const file = this.files[0];

  if (file) {
    previewImage.src = URL.createObjectURL(file);
    previewContainer.style.display = "block";
    uploadBox.style.display = "none";
    capturedImageBlob = file; // Store for detection
  }
});

// Drag and drop
uploadBox.addEventListener("dragover", function (e) {
  e.preventDefault();
  uploadBox.style.borderColor = "rgba(255, 255, 255, 0.6)";
  uploadBox.style.background = "rgba(255, 255, 255, 0.15)";
});

uploadBox.addEventListener("dragleave", function (e) {
  e.preventDefault();
  uploadBox.style.borderColor = "rgba(255, 255, 255, 0.3)";
  uploadBox.style.background = "rgba(255, 255, 255, 0.05)";
});

uploadBox.addEventListener("drop", function (e) {
  e.preventDefault();
  uploadBox.style.borderColor = "rgba(255, 255, 255, 0.3)";
  uploadBox.style.background = "rgba(255, 255, 255, 0.05)";

  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith("image/")) {
    imageInput.files = e.dataTransfer.files;
    previewImage.src = URL.createObjectURL(file);
    previewContainer.style.display = "block";
    uploadBox.style.display = "none";
    capturedImageBlob = file;
  }
});

// ================= REMOVE IMAGE =================
function removeImage() {
  imageInput.value = "";
  capturedImageBlob = null;
  previewContainer.style.display = "none";
  resultSection.style.display = "none";
  
  if (currentMode === "upload") {
    uploadBox.style.display = "block";
  } else {
    cameraBox.style.display = "block";
    startCamera();
  }
}

function newScan() {
  removeImage();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ================= DETECT DISEASE =================
async function detectDisease() {
  if (!capturedImageBlob && !imageInput.files[0]) {
    alert("Please upload or capture an image first!");
    return;
  }

  if (selectedCrop !== "potato") {
    showComingSoon(selectedCrop.charAt(0).toUpperCase() + selectedCrop.slice(1));
    return;
  }

  loading.style.display = "block";
  resultSection.style.display = "none";

  try {
    // Use offlineManager for smart online/offline detection
    const imageFile = capturedImageBlob || imageInput.files[0];
    
    let result;
    
    // Check if offlineManager is available
    if (window.offlineManager && window.offlineManager.isOfflineAvailable()) {
      result = await offlineManager.predict(imageFile, previewImage);
      console.log(`🤖 Detection mode: ${result.mode}`);
    } else {
      // Fallback to backend
      result = await predictOnline(imageFile);
    }

    loading.style.display = "none";
    resultSection.style.display = "block";

    updateUI(result.disease, result.confidence);
    
    // Voice announcement if available
    if (window.voiceManager) {
      const risk = calculateRisk(result.disease, result.confidence);
      voiceManager.announceDisease(result.disease, result.confidence, risk);
    }
    
    savePrediction(result.disease, result.confidence);

    resultSection.scrollIntoView({ behavior: "smooth", block: "start" });

  } catch (error) {
    loading.style.display = "none";
    alert("Detection failed: " + error.message);
    console.error(error);
  }
}

// Online prediction fallback
async function predictOnline(imageFile) {
  const formData = new FormData();
  formData.append("file", imageFile);
  formData.append("crop", selectedCrop);

  const response = await fetch("/predict", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || "Detection failed");
  }

  const data = await response.json();
  
  return {
    disease: data.disease,
    confidence: data.confidence,
    mode: "online"
  };
}

// ================= UPDATE UI =================
function updateUI(disease, confidence) {
  document.getElementById("diseaseName").innerText = disease;

  const confidenceBar = document.getElementById("confidenceBar");
  const confidenceText = document.getElementById("confidenceText");
  const confidenceContainer = confidenceBar.parentElement;
  const riskBadge = document.getElementById("riskLevel");

  let risk = "";
  let riskClass = "";

  const diseaseLower = disease.toLowerCase().trim();
  const isInvalid =
    diseaseLower.includes("irrelevant") ||
    diseaseLower.includes("irelevant") ||
    diseaseLower.includes("unclear");

  // Risk logic
  if (diseaseLower === "healthy") {
    risk = "No Risk";
    riskClass = "low";
  } else if (isInvalid) {
    risk = "Upload Clear Leaf Image";
    riskClass = "invalid";
  } else if (confidence > 85) {
    risk = "High Risk";
    riskClass = "high";
  } else if (confidence > 70) {
    risk = "Medium Risk";
    riskClass = "medium";
  } else {
    risk = "Low Risk";
    riskClass = "low";
  }

  riskBadge.innerText = risk;
  riskBadge.className = "risk-badge risk-" + riskClass;

  // Confidence visibility
  if (isInvalid) {
    confidenceContainer.style.display = "none";
    confidenceText.style.display = "none";
  } else {
    confidenceContainer.style.display = "block";
    confidenceText.style.display = "inline";

    setTimeout(() => {
      confidenceBar.style.width = confidence + "%";
    }, 100);

    confidenceText.innerText = confidence + "%";
  }

  // Treatment message
  let treatmentMessage = getTreatmentMessage(diseaseLower, isInvalid);
  document.getElementById("treatmentText").innerText = treatmentMessage;
}

function getTreatmentMessage(diseaseLower, isInvalid) {
  if (isInvalid) {
    return "⚠️ Please upload or capture a clear image of a crop leaf for accurate disease detection.";
  }
  
  if (diseaseLower === "healthy") {
    return "Great! Your crop looks healthy. Continue regular monitoring.";
  }
  
  if (diseaseLower === "early blight") {
    return "Apply fungicide spray (Mancozeb or Chlorothalonil). Remove infected leaves.";
  }
  
  if (diseaseLower === "late blight") {
    return "URGENT: Apply copper-based fungicide immediately.";
  }
  
  if (diseaseLower === "fungal diseases") {
    return "Apply preventive fungicide spray and improve drainage.";
  }
  
  if (diseaseLower === "plant pests") {
    return "Use neem oil or appropriate insecticides.";
  }
  
  return "Apply recommended treatment and monitor crop health regularly.";
}

function calculateRisk(disease, confidence) {
  const diseaseLower = disease.toLowerCase().trim();
  
  if (diseaseLower === "healthy") return "No Risk";
  if (diseaseLower.includes("unclear") || diseaseLower.includes("irrelevant")) return "Invalid";
  if (confidence > 85) return "High Risk";
  if (confidence > 70) return "Medium Risk";
  return "Low Risk";
}

// ================= SAVE TO DASHBOARD =================
function savePrediction(disease, confidence) {
  const user = localStorage.getItem("loggedInUser");
  if (!user) return;

  const userKey = `predictions_${user}`;
  const predictions = JSON.parse(localStorage.getItem(userKey)) || [];

  let risk = "Low";
  
  if (disease === "Healthy") {
    risk = "Low";
  } else if (
    disease.toLowerCase().includes("unclear") ||
    disease.toLowerCase().includes("irrelevant")
  ) {
    return; // Don't save invalid images
  } else if (confidence > 85) {
    risk = "High";
  } else if (confidence > 70) {
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
        <div style="font-size:0.9rem; opacity:0.9;">View in dashboard</div>
      </div>
    </div>
  `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = "slideOut 0.4s ease";
    setTimeout(() => notification.remove(), 400);
  }, 3000);
}

// ================= CLEANUP =================
window.addEventListener("beforeunload", () => {
  stopCamera();
});

// Animation styles
const style = document.createElement("style");
style.textContent = `
  @keyframes slideIn {
    from { opacity: 0; transform: translateX(100px); }
    to { opacity: 1; transform: translateX(0); }
  }
  
  @keyframes slideOut {
    from { opacity: 1; transform: translateX(0); }
    to { opacity: 0; transform: translateX(100px); }
  }
`;
document.head.appendChild(style);