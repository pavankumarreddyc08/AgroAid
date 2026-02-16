// ================= LOGIN CHECK =================
if(localStorage.getItem("token") !== "true"){
    window.location.href = "auth.html";
}

// ================= MAIN FUNCTION =================
async function predict(){

let fruit = document.getElementById("fruit").value;
let city = document.getElementById("city").value.trim().toLowerCase();
let resultBox = document.getElementById("result");

if(city === ""){
    resultBox.innerHTML="⚠ Please enter city name";
    return;
}

resultBox.classList.remove("show");
resultBox.innerHTML = "Fetching live weather data...";

let apiKey = "704182d2e5481845b54521977bea5b69";

try{

// ================= GEO LOCATION =================
let geoURL = `https://api.openweathermap.org/geo/1.0/direct?q=${city},IN&limit=1&appid=${apiKey}`;
let geoResponse = await fetch(geoURL);
let geoData = await geoResponse.json();

if(geoData.length === 0){
    resultBox.innerHTML = "City not found";
    return;
}

let lat = geoData[0].lat;
let lon = geoData[0].lon;
let realCity = geoData[0].name + ", " + geoData[0].country;

// ================= WEATHER DATA =================
let weatherURL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
let response = await fetch(weatherURL);
let data = await response.json();

let temp = data.main.temp;
let humidity = data.main.humidity;
let icon = data.weather[0].icon;

// ================= DISEASE LOGIC =================

let diseases = [];
let healthStatus = "";

// 🍌 BANANA
if(fruit==="banana"){

if(humidity > 75){
diseases.push({
name:"Black Sigatoka",
risk: humidity > 85 ? "High" : "Moderate",
treatment:"Apply fungicide spray and remove infected leaves."
});
}

if(temp > 30){
diseases.push({
name:"Leaf Scorch",
risk:"Moderate",
treatment:"Increase irrigation and provide shade."
});
}

if(humidity < 45){
diseases.push({
name:"Panama Wilt (Stress Risk)",
risk:"Low",
treatment:"Improve soil moisture management."
});
}

healthStatus = diseases.length === 0
? "Healthy Banana Conditions"
: "Environmental Stress Detected";
}

// 🥭 MANGO
if(fruit==="mango"){

if(humidity >= 65){
diseases.push({
name:"Anthracnose",
risk: humidity > 80 ? "High" : "Moderate",
treatment:"Apply preventive fungicide and improve airflow."
});
}

if(temp >= 20 && temp <= 30){
diseases.push({
name:"Powdery Mildew",
risk:"Moderate",
treatment:"Use sulfur-based fungicide and monitor leaf spots."
});
}

if(temp > 32 || humidity < 40){
diseases.push({
name:"Bacterial Canker (Stress Risk)",
risk:"Low",
treatment:"Use copper-based spray and maintain plant hygiene."
});
}

healthStatus = diseases.length === 0
? "Healthy Mango Conditions"
: "Environmental Stress Detected";
}

// 🍈 GUAVA
if(fruit==="guava"){

if(humidity > 75){
diseases.push({
name:"Root Rot",
risk: humidity > 85 ? "High" : "Moderate",
treatment:"Improve drainage and reduce overwatering."
});
}

if(temp >= 18 && temp <= 28){
diseases.push({
name:"Powdery Mildew",
risk:"Moderate",
treatment:"Apply fungicide and maintain spacing."
});
}

if(temp > 32){
diseases.push({
name:"Leaf Scorch",
risk:"Moderate",
treatment:"Provide shade and increase irrigation."
});
}

healthStatus = diseases.length === 0
? "Healthy Guava Conditions"
: "Environmental Stress Detected";
}

// ================= ENSURE AT LEAST ONE ADVISORY =================
if(diseases.length === 0){
diseases.push({
name:"General Crop Monitoring",
risk:"Low",
treatment:"Conditions stable. Continue regular monitoring and irrigation."
});
}

// ================= DISPLAY RESULT =================

resultBox.innerHTML = `
<img class="weatherIcon" src="https://openweathermap.org/img/wn/${icon}@2x.png">
<h3>${realCity}</h3>

<p>🌡 Temperature: <b>${temp}°C</b></p>
<p>💧 Humidity: <b>${humidity}%</b></p>

<hr style="opacity:0.2; margin:20px 0;">

<b>${healthStatus}</b>

<div style="margin-top:20px;">
<h4>🌿 Disease Risk Analysis:</h4>

${diseases.map(d => `
<div style="margin-top:15px; padding:15px; background:rgba(255,255,255,0.1); border-radius:12px;">
<b>${d.name}</b> — Risk Level: <b>${d.risk}</b>
<br>
🌱 Treatment: ${d.treatment}
</div>
`).join("")}

</div>
`;

resultBox.classList.add("show");

} catch(error){
    resultBox.innerHTML = "Error fetching weather data";
}

}
