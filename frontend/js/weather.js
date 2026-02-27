// ================= LOGIN CHECK =================
if(localStorage.getItem("loggedInUser") === null){
    window.location.href = "auth.html";
}

// ================= CROP SELECTION =================
let selectedWeatherCrop = "potato";

function selectWeatherCrop(crop) {
    selectedWeatherCrop = crop;
    
    // Update button states
    document.querySelectorAll('.crop-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-crop="${crop}"]`).classList.add('active');
}

function showWeatherComingSoon(cropName) {
    const notification = document.createElement('div');
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
        animation: slideInRight 0.4s ease;
    `;
    notification.innerHTML = `
        <div style="display:flex; align-items:center; gap:12px;">
            <span style="font-size:1.5rem;">🔄</span>
            <div>
                <div style="font-size:1rem;">${cropName} Weather Analysis</div>
                <div style="font-size:0.9rem; opacity:0.9;">Coming Soon! Currently available for Potato only.</div>
            </div>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.4s ease';
        setTimeout(() => notification.remove(), 400);
    }, 3500);
}

// ================= MAIN PREDICTION FUNCTION =================
async function predict(){

    let city = document.getElementById("city").value.trim().toLowerCase();
    let resultBox = document.getElementById("result");

    if(city === ""){
        resultBox.innerHTML="⚠ Please enter city name";
        resultBox.classList.add("show");
        return;
    }

    // Check if crop is available
    if(selectedWeatherCrop !== 'potato') {
        showWeatherComingSoon(selectedWeatherCrop.charAt(0).toUpperCase() + selectedWeatherCrop.slice(1));
        return;
    }

    resultBox.classList.remove("show");
    resultBox.innerHTML = "🌐 Fetching live weather data...";
    resultBox.classList.add("show");

    let apiKey = "704182d2e5481845b54521977bea5b69";

    try{

        // GEO LOCATION
        let geoURL = `https://api.openweathermap.org/geo/1.0/direct?q=${city},IN&limit=1&appid=${apiKey}`;
        let geoResponse = await fetch(geoURL);
        let geoData = await geoResponse.json();

        if(geoData.length === 0){
            resultBox.innerHTML = "❌ City not found. Please check the spelling.";
            return;
        }

        let lat = geoData[0].lat;
        let lon = geoData[0].lon;
        let realCity = geoData[0].name + ", " + geoData[0].country;

        // WEATHER DATA
        let weatherURL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
        let response = await fetch(weatherURL);
        let data = await response.json();

        let temp = data.main.temp;
        let humidity = data.main.humidity;
        let icon = data.weather[0].icon;

        // POTATO DISEASE LOGIC
        let diseases = [];
        let healthStatus = "";

        // Early Blight
        if(temp >= 20 && temp <= 30 && humidity >= 65){
            diseases.push({
                name:"Early Blight (Alternaria solani)",
                risk: humidity > 80 ? "High" : "Moderate",
                treatment:"Apply fungicide (Mancozeb or Chlorothalonil). Remove infected leaves and ensure good air circulation."
            });
        }

        // Late Blight - MOST CRITICAL
        if(temp >= 10 && temp <= 25 && humidity >= 85){
            diseases.push({
                name:"Late Blight (Phytophthora infestans) ⚠️ CRITICAL",
                risk: "High",
                treatment:"URGENT: Apply copper-based fungicide immediately. This is the most destructive potato disease. Remove all infected plants and monitor daily."
            });
        }

        // Fungal Diseases
        if(humidity > 75 && temp >= 15 && temp <= 28){
            diseases.push({
                name:"Fungal Diseases (General)",
                risk: humidity > 85 ? "High" : "Moderate",
                treatment:"Apply preventive fungicide spray. Improve drainage and avoid overhead irrigation. Ensure proper plant spacing."
            });
        }

        // Potato Virus - Aphid transmission risk
        if(temp >= 25 && temp <= 32){
            diseases.push({
                name:"Potato Virus (PVY, PVX) - Aphid Vector Risk",
                risk: "Moderate",
                treatment:"Control aphid populations with neem oil or insecticides. Use certified disease-free seed potatoes. Remove infected plants immediately."
            });
        }

        // Potato Cyst Nematode
        if(temp >= 20 && temp <= 28 && humidity >= 60){
            diseases.push({
                name:"Potato Cyst Nematode (PCN) - Soil Risk",
                risk: "Moderate",
                treatment:"Practice crop rotation (3-5 years). Plant resistant varieties. Soil fumigation may be required for severe infestations."
            });
        }

        // Plant Pests
        if(temp > 28 && humidity < 50){
            diseases.push({
                name:"Plant Pests (Colorado Potato Beetle, Aphids)",
                risk: "Moderate",
                treatment:"Scout fields regularly. Hand-pick beetles. Use neem oil or appropriate insecticides. Maintain plant health with proper fertilization."
            });
        }

        // Heat Stress
        if(temp > 32){
            diseases.push({
                name:"Heat Stress",
                risk: temp > 35 ? "High" : "Moderate",
                treatment:"Increase irrigation frequency. Apply mulch to keep soil cool. Consider shade cloth for small plots. Monitor for wilting."
            });
        }

        // Cold Stress
        if(temp < 10){
            diseases.push({
                name:"Cold Stress / Frost Damage Risk",
                risk: temp < 5 ? "High" : "Moderate",
                treatment:"Protect plants with row covers. Delay planting if temperatures are too low. Monitor weather forecasts closely."
            });
        }

        // Determine Health Status
        if(diseases.length === 0){
            healthStatus = "✅ Healthy Potato Growing Conditions";
            diseases.push({
                name:"General Crop Monitoring",
                risk:"Low",
                treatment:"Conditions are favorable. Continue regular monitoring, maintain adequate irrigation, and scout for early signs of disease or pests. Consider preventive fungicide application."
            });
        } else {
            healthStatus = "⚠️ Environmental Disease Risk Detected";
        }

        // DISPLAY RESULT
        resultBox.innerHTML = `
        <img class="weatherIcon" src="https://openweathermap.org/img/wn/${icon}@2x.png">
        <h3>🥔 Potato Crop Analysis</h3>
        <h4>${realCity}</h4>

        <div style="display:flex; justify-content:space-around; margin:20px 0; padding:15px; background:rgba(255,255,255,0.1); border-radius:12px;">
            <div>
                <div style="font-size:0.9rem; opacity:0.8;">🌡 Temperature</div>
                <div style="font-size:1.3rem; font-weight:700;">${temp}°C</div>
            </div>
            <div>
                <div style="font-size:0.9rem; opacity:0.8;">💧 Humidity</div>
                <div style="font-size:1.3rem; font-weight:700;">${humidity}%</div>
            </div>
        </div>

        <hr style="opacity:0.2; margin:20px 0;">

        <div style="font-size:1.15rem; font-weight:700; margin-bottom:20px;">${healthStatus}</div>

        <div style="margin-top:20px;">
        <h4 style="margin-bottom:15px;">🌿 Disease Risk Analysis:</h4>

        ${diseases.map(d => `
        <div style="margin-top:15px; padding:18px; background:rgba(255,255,255,0.12); border-radius:14px; text-align:left; border-left:4px solid ${d.risk === 'High' ? '#ef4444' : d.risk === 'Moderate' ? '#f59e0b' : '#22c55e'};">
            <div style="font-weight:700; font-size:1.05rem; color:#34d399; margin-bottom:8px;">${d.name}</div>
            <div style="color:${d.risk === 'High' ? '#fca5a5' : d.risk === 'Moderate' ? '#fbbf24' : '#86efac'}; font-weight:600; margin-bottom:10px;">
                ⚠️ Risk Level: <strong>${d.risk}</strong>
            </div>
            <div style="color:#e0e0e0; line-height:1.5;">
                <strong style="color:#a3e635;">🌱 Treatment:</strong> ${d.treatment}
            </div>
        </div>
        `).join("")}

        </div>

        <div style="margin-top:25px; padding:15px; background:rgba(52, 211, 153, 0.15); border-radius:12px; border:1px solid rgba(52, 211, 153, 0.3);">
            <strong>💡 Tip:</strong> Monitor weather conditions daily during critical growth stages. Early detection and prevention are key to successful potato farming.
        </div>
        `;

        resultBox.classList.add("show");

    } catch(error){
        console.error("Weather API Error:", error);
        resultBox.innerHTML = "❌ Error fetching weather data. Please check your internet connection and try again.";
    }
}