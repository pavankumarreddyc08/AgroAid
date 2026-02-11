// ================= ELEMENTS =================
const imageInput = document.getElementById("imageInput");
const previewImage = document.getElementById("previewImage");
const loading = document.getElementById("loading");
const resultSection = document.getElementById("resultSection");


// ================= IMAGE PREVIEW =================
imageInput.addEventListener("change", function () {
    const file = this.files[0];

    if (file) {
        previewImage.src = URL.createObjectURL(file);
        previewImage.style.display = "block";
    }
});


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
    formData.append("fruit", fruit);   // 🔥 send fruit to backend

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
    confidenceBar.style.width = confidence + "%";
    confidenceBar.innerText = confidence + "%";

    const riskBadge = document.getElementById("riskLevel");

    let risk = "";

    if (confidence > 85) {
        risk = "High";
        riskBadge.className = "badge bg-danger";
    } else if (confidence > 70) {
        risk = "Medium";
        riskBadge.className = "badge bg-warning text-dark";
    } else {
        risk = "Low";
        riskBadge.className = "badge bg-success";
    }

    riskBadge.innerText = risk;

    document.getElementById("treatmentText").innerText =
        "Apply recommended fungicide spray and monitor humidity levels.";
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
