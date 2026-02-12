// ================= ELEMENTS =================
const imageInput = document.getElementById("imageInput");
const previewImage = document.getElementById("previewImage");
const previewContainer = document.getElementById("previewContainer");
const uploadBox = document.getElementById("uploadBox");
const loading = document.getElementById("loading");
const resultSection = document.getElementById("resultSection");


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
uploadBox.addEventListener("dragover", function(e) {
    e.preventDefault();
    uploadBox.style.borderColor = "rgba(255, 255, 255, 0.6)";
    uploadBox.style.background = "rgba(255, 255, 255, 0.15)";
});

uploadBox.addEventListener("dragleave", function(e) {
    e.preventDefault();
    uploadBox.style.borderColor = "rgba(255, 255, 255, 0.3)";
    uploadBox.style.background = "rgba(255, 255, 255, 0.08)";
});

uploadBox.addEventListener("drop", function(e) {
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
}


// ================= DETECT FUNCTION =================
async function detectDisease() {

    const fruit = document.getElementById("fruitSelect").value;
    const file = imageInput.files[0];

    if (!fruit || !file) {
        alert("Please select fruit and upload image!");
        return;
    }

    loading.style.display = "block";
    resultSection.style.display = "none";

    const formData = new FormData();
    formData.append("file", file);
    formData.append("fruit", fruit);

    try {

        const response = await fetch("http://127.0.0.1:5000/predict", {
            method: "POST",
            body: formData
        });

        const data = await response.json();

        loading.style.display = "none";

        if (!response.ok) {
            alert(data.error);
            return;
        }

        resultSection.style.display = "block";

        updateUI(data.disease, data.confidence);
        savePrediction(fruit, data.disease, data.confidence);

        // Scroll to results
        resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

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
    
    // Animate confidence bar
    setTimeout(() => {
        confidenceBar.style.width = confidence + "%";
    }, 100);
    
    confidenceText.innerText = confidence + "%";

    const riskBadge = document.getElementById("riskLevel");

    let risk = "";
    let riskClass = "";

    if (confidence > 85) {
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
    riskBadge.className = "risk-badge " + riskClass;

    document.getElementById("treatmentText").innerText =
        "Apply recommended fungicide spray and monitor humidity levels. Regular inspection is advised. Ensure proper drainage and avoid overwatering. Consider organic treatments if available.";
}


// ================= SAVE TO DASHBOARD =================
function savePrediction(fruit, disease, confidence) {

    const predictions = JSON.parse(localStorage.getItem("predictions")) || [];

    const risk =
        confidence > 85 ? "High" :
        confidence > 70 ? "Medium" : "Low";

    const newEntry = {
        date: new Date().toISOString().split("T")[0],
        fruit: fruit,
        disease: disease,
        confidence: confidence,
        risk: risk
    };

    predictions.push(newEntry);

    localStorage.setItem("predictions", JSON.stringify(predictions));
}