// ===============================
// MAIN FUNCTION
// ===============================

async function predict(){

let fruit = document.getElementById("fruit").value;
let city = document.getElementById("city").value.trim().toLowerCase();

let apiKey = "704182d2e5481845b54521977bea5b69";

if(city === ""){
document.getElementById("result").innerHTML="⚠️ Please enter city name";
return;
}

document.getElementById("result").innerHTML = "Loading weather data...";


// ===============================
// STATE → CAPITAL MAP
// ===============================

let stateMap = {

"andhra pradesh":"Visakhapatnam",
"arunachal pradesh":"Itanagar",
"assam":"Guwahati",
"bihar":"Patna",
"chhattisgarh":"Raipur",
"goa":"Panaji",
"gujarat":"Ahmedabad",
"haryana":"Chandigarh",
"himachal pradesh":"Shimla",
"jharkhand":"Ranchi",
"karnataka":"Bangalore",
"kerala":"Thiruvananthapuram",
"madhya pradesh":"Bhopal",
"maharashtra":"Mumbai",
"manipur":"Imphal",
"meghalaya":"Shillong",
"mizoram":"Aizawl",
"nagaland":"Kohima",
"odisha":"Bhubaneswar",
"punjab":"Chandigarh",
"rajasthan":"Jaipur",
"sikkim":"Gangtok",
"tamil nadu":"Chennai",
"telangana":"Hyderabad",
"tripura":"Agartala",
"uttar pradesh":"Lucknow",
"uttarakhand":"Dehradun",
"west bengal":"Kolkata",

// Union Territories

"andaman and nicobar":"Port Blair",
"chandigarh":"Chandigarh",
"dadra and nagar haveli":"Silvassa",
"daman and diu":"Daman",
"delhi":"New Delhi",
"jammu and kashmir":"Srinagar",
"kashmir":"Srinagar",
"ladakh":"Leh",
"lakshadweep":"Kavaratti",
"puducherry":"Puducherry"

};


// convert state → city automatically
if(stateMap[city]){
city = stateMap[city];
}

try{

// ===============================
// GEO LOCATION (INDIA ONLY SEARCH)
// ===============================

let geoURL = `https://api.openweathermap.org/geo/1.0/direct?q=${city},IN&limit=1&appid=${apiKey}`;

let geoResponse = await fetch(geoURL);
let geoData = await geoResponse.json();


// AUTO-CORRECT if not found
if(geoData.length == 0){

let allCities = Object.values(stateMap);
let correctedCity = findClosestCity(city, allCities);

geoURL = `https://api.openweathermap.org/geo/1.0/direct?q=${correctedCity},IN&limit=1&appid=${apiKey}`;

geoResponse = await fetch(geoURL);
geoData = await geoResponse.json();

if(geoData.length == 0){
document.getElementById("result").innerHTML = "City not found";
return;
}

}

let lat = geoData[0].lat;
let lon = geoData[0].lon;
let realCity = geoData[0].name + ", " + geoData[0].country;


// ===============================
// WEATHER API
// ===============================

let weatherURL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

let response = await fetch(weatherURL);
let data = await response.json();

let temp = data.main.temp;
let humidity = data.main.humidity;
let icon = data.weather[0].icon;


// ===============================
// DISEASE PREDICTION SYSTEM
// ===============================

let bestDisease = null;
let treatmentAdvice = "";
let healthStatus = "";
let environmentAdvice = "";



// 🍌 BANANA
if(fruit=="banana"){

if(temp >= 26 && temp <= 30 && humidity > 85){
bestDisease = "⚠️ Black Sigatoka Risk";
treatmentAdvice = "🧪 Apply fungicide spray, remove infected leaves, improve airflow.";
}
else if(temp >= 24 && temp <= 30 && humidity > 75){
bestDisease = "⚠️ Yellow Sigatoka Risk";
treatmentAdvice = "🌿 Monitor leaf spots, apply preventive fungicide, avoid overhead watering.";
}
else if(temp >= 25 && temp <= 35 && humidity > 70){
bestDisease = "⚠️ Sigatoka Leaf Spot Risk";
treatmentAdvice = "✂ Prune infected leaves and maintain good field ventilation.";
}
else if(temp >= 20 && temp <= 28 && humidity >= 60 && humidity <= 80){
bestDisease = "⚠️ Panama Wilt Risk";
treatmentAdvice = "🚫 Remove infected plants and improve soil drainage.";
}
else if(temp >= 28 && temp <= 35 && humidity > 70){
bestDisease = "⚠️ Xanthomonas Bacterial Risk";
treatmentAdvice = "🧴 Use bactericide sprays and avoid water splash between plants.";
}
else if(temp >= 22 && temp <= 30 && humidity > 75){
bestDisease = "⚠️ Pestalotiopsis Risk";
treatmentAdvice = "🍃 Remove affected parts and apply protective fungicide.";
}
else if(temp >= 22 && temp <= 32 && humidity > 70){
bestDisease = "⚠️ Cordana Leaf Spot Risk";
treatmentAdvice = "🌱 Improve spacing between plants and reduce excess moisture.";
}
else if(temp > 28 && humidity >= 50 && humidity <= 75){
bestDisease = "⚠️ Skipper Insect Damage Risk";
treatmentAdvice = "🐛 Monitor insects and use biological pest control if needed.";
}
else if(temp > 30 && humidity >= 40 && humidity <= 65){
bestDisease = "⚠️ Chewing Insect Damage Risk";
treatmentAdvice = "🪲 Apply neem oil or recommended insecticide.";
}

healthStatus = (temp>=22 && temp<=30 && humidity>=50 && humidity<=70)
? "✅ Mostly Healthy Banana Conditions"
: "⚠️ Environmental stress detected";

}


// 🥭 MANGO (Single most likely disease)
if(fruit=="mango"){

// Anthracnose (24–30°C | >80%)
if(temp >= 24 && temp <= 30 && humidity > 80){
bestDisease = "⚠️ Anthracnose Risk";
treatmentAdvice = "🧪 Apply fungicide, improve air circulation, avoid excess moisture.";
}

// Powdery Mildew (18–30°C | 60–80%)
else if(temp >= 18 && temp <= 30 && humidity >= 60 && humidity <= 80){
bestDisease = "⚠️ Powdery Mildew Risk";
treatmentAdvice = "🌿 Use sulfur-based fungicide and avoid overcrowding of plants.";
}

// Sooty Mould (20–32°C | >75%)
else if(temp >= 20 && temp <= 32 && humidity > 75){
bestDisease = "⚠️ Sooty Mould Risk";
treatmentAdvice = "🐜 Control sap-sucking insects and wash leaves if needed.";
}

// Bacterial Canker (>30°C | <60%)
else if(temp > 30 && humidity < 60){
bestDisease = "⚠️ Bacterial Canker Risk";
treatmentAdvice = "🧴 Use copper-based sprays and avoid plant injuries.";
}

// Die Back (>32°C | <50%)
else if(temp > 32 && humidity < 50){
bestDisease = "⚠️ Die Back Risk";
treatmentAdvice = "✂ Prune affected branches and ensure proper irrigation.";
}

// Gall Midge (22–30°C | >65%)
else if(temp >= 22 && temp <= 30 && humidity > 65){
bestDisease = "⚠️ Gall Midge Risk";
treatmentAdvice = "🐛 Monitor new shoots and apply recommended insecticide.";
}

// Cutting Weevil (>28°C | 50–75%)
else if(temp > 28 && humidity >= 50 && humidity <= 75){
bestDisease = "⚠️ Cutting Weevil Risk";
treatmentAdvice = "🌱 Use neem oil spray and remove damaged parts.";
}


// Health status
healthStatus = (temp>=22 && temp<=30 && humidity>=50 && humidity<=70)
? "✅ Mostly Healthy Mango Conditions"
: "⚠️ Environmental stress detected";

}



// 🍈 GUAVA (Single most likely disease)
if(fruit=="guava"){

// Root Rot (24–30°C | >85%)
if(temp >= 24 && temp <= 30 && humidity > 85){
bestDisease = "⚠️ Root Rot Risk";
treatmentAdvice = "💧 Improve soil drainage, avoid overwatering, apply fungicide if required.";
}

// Anthracnose (20–30°C | >75%)
else if(temp >= 20 && temp <= 30 && humidity > 75){
bestDisease = "⚠️ Anthracnose Risk";
treatmentAdvice = "🧪 Apply fungicide spray and remove infected fruits/leaves.";
}

// Algal Leaf Spot (18–28°C | >80%)
else if(temp >= 18 && temp <= 28 && humidity > 80){
bestDisease = "⚠️ Algal Leaf Spot Risk";
treatmentAdvice = "🌿 Improve airflow and avoid prolonged leaf wetness.";
}

// Powdery Mildew (18–25°C | 50–70%)
else if(temp >= 18 && temp <= 25 && humidity >= 50 && humidity <= 70){
bestDisease = "⚠️ Powdery Mildew Risk";
treatmentAdvice = "🌱 Use sulfur-based fungicide and ensure proper spacing.";
}

// Guava Wilt (28–35°C | 60–80%)
else if(temp >= 28 && temp <= 35 && humidity >= 60 && humidity <= 80){
bestDisease = "⚠️ Guava Wilt Risk";
treatmentAdvice = "🚫 Remove infected plants and maintain soil hygiene.";
}

// YLD (18–28°C | 55–75%)
else if(temp >= 18 && temp <= 28 && humidity >= 55 && humidity <= 75){
bestDisease = "⚠️ YLD (Yellowing) Risk";
treatmentAdvice = "🌾 Check nutrient levels and maintain balanced irrigation.";
}

// Insect Bite (>25°C | >60%)
else if(temp > 25 && humidity > 60){
bestDisease = "⚠️ Insect Bite Risk";
treatmentAdvice = "🐛 Monitor pests and apply neem oil or suitable insecticide.";
}

// Scorch (>32°C | <50%)
else if(temp > 32 && humidity < 50){
bestDisease = "⚠️ Scorch Risk";
treatmentAdvice = "☀️ Provide shade and increase irrigation frequency.";
}


// Health status
healthStatus = (temp>=22 && temp<=30 && humidity>=50 && humidity<=70)
? "✅ Mostly Healthy Guava Conditions"
: "⚠️ Environmental stress detected";

}


// ===============================
// ENVIRONMENT ADVICE
// ===============================

if(!bestDisease){


if(temp < 18){

environmentAdvice = "🌡 Low temperature detected. Growth may slow down.";

}

if(humidity < 40){

environmentAdvice += "<br>💧 Low humidity detected. Irrigation recommended.";

}

if(temp > 32 && humidity < 50){

environmentAdvice += "<br>☀️ Heat stress possible. Increase watering.";

}

if(environmentAdvice === ""){

environmentAdvice = "✅ Conditions generally stable. Continue monitoring.";

}

}



// ===============================
// DISPLAY RESULT
// ===============================

document.getElementById("result").innerHTML = `

<img class="weatherIcon" src="https://openweathermap.org/img/wn/${icon}@2x.png">

<h3>${realCity}</h3>

Temperature: ${temp} °C <br>
Humidity: ${humidity}% <br><br>

<b>${healthStatus}</b>

<br><br>

${bestDisease
? `<div>
<b>⚠ Most Likely Disease:</b>
<ul style="text-align:left; margin-top:10px;">
<li>${bestDisease}<br><br>🌱 Treatment: ${treatmentAdvice}</li>

</ul>
</div>`

: `<div>
<b>✅ No major disease risks detected</b>

<br><br>

<div style="
background:#f5f9ff;
padding:12px;
border-radius:10px;
border-left:5px solid #007bff;
text-align:left;
">

🌱 <b>Advisory:</b><br><br>

${environmentAdvice}

</div>

</div>`
}

`;




}catch(error){

document.getElementById("result").innerHTML="Error fetching weather";

}

}


// ===============================
// SMART AUTO-CORRECT FUNCTIONS
// ===============================

function findClosestCity(input, cityList){

input = input.toLowerCase();

let closest = cityList[0];
let minDistance = Infinity;

for(let city of cityList){

let distance = levenshtein(input, city.toLowerCase());

if(distance < minDistance){
minDistance = distance;
closest = city;
}
}

return closest;
}


function levenshtein(a, b){

const matrix = [];

for(let i = 0; i <= b.length; i++) matrix[i] = [i];
for(let j = 0; j <= a.length; j++) matrix[0][j] = j;

for(let i = 1; i <= b.length; i++){
for(let j = 1; j <= a.length; j++){
matrix[i][j] = (b.charAt(i-1)==a.charAt(j-1))
? matrix[i-1][j-1]
: Math.min(matrix[i-1][j-1]+1, matrix[i][j-1]+1, matrix[i-1][j]+1);
}
}

return matrix[b.length][a.length];
}
