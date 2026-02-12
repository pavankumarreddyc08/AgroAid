async function predict(){

let fruit = document.getElementById("fruit").value;
let city = document.getElementById("city").value.trim();

let apiKey = "704182d2e5481845b54521977bea5b69";

document.getElementById("result").innerHTML = "Loading weather data...";

// INDIA STATE → DEFAULT CITY MAP

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
"delhi":"New Delhi",
"kashmir":"Srinagar"
};

// convert state → city
if(stateMap[city.toLowerCase()]){
city = stateMap[city.toLowerCase()];
}

try{

// STEP 1 — GEOLOCATION

let geoURL = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`;

let geoResponse = await fetch(geoURL);
let geoData = await geoResponse.json();   // ✅ FIXED

if(geoData.length == 0){
document.getElementById("result").innerHTML = "City not found";
return;
}

let lat = geoData[0].lat;
let lon = geoData[0].lon;
let realCity = geoData[0].name;   // ✅ correct location name


// STEP 2 — WEATHER

let weatherURL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

let response = await fetch(weatherURL);
let data = await response.json();

let temp = data.main.temp;
let humidity = data.main.humidity;
let icon = data.weather[0].icon;

let disease="";

// MANGO

if(fruit=="mango"){

if(temp>=18 && temp<=30 && humidity>=60 && humidity<=80){
disease="⚠️ Powdery Mildew Risk";
}

else if(temp>=24 && temp<=30 && humidity>80){
disease="⚠️ Anthracnose Risk";
}

else if(temp>30 && humidity<60){
disease="⚠️ Bacterial Canker Risk";
}

else if(temp>=15 && temp<=25 && humidity>70){
disease="⚠️ Mango Malformation Risk";
}

else if(temp>32 && humidity<50){
disease="⚠️ Dieback Disease Risk";
}

else if(temp>=20 && temp<=32 && humidity>75){
disease="⚠️ Sooty Mold Risk";
}

else if(temp>=25 && temp<=35 && humidity>80){
disease="⚠️ Stem End Rot Risk";
}

else if(temp>=20 && temp<=28 && humidity>85){
disease="⚠️ Red Rust Risk";
}

else if(temp>=22 && temp<=30 && humidity>70){
disease="⚠️ Leaf Spot Risk";
}

else{
disease="✅ Healthy conditions for Mango";
}

}


// BANANA

if(fruit=="banana"){

if(temp>=25 && temp<=35 && humidity>70){
disease="⚠️ Sigatoka Leaf Spot Risk";
}

else if(temp>=26 && temp<=30 && humidity>85){
disease="⚠️ Black Sigatoka Risk";
}

else if(temp>=20 && temp<=28 && humidity>=60 && humidity<=80){
disease="⚠️ Panama Wilt Risk";
}

else if(temp>=24 && temp<=32 && humidity>80){
disease="⚠️ Bacterial Soft Rot Risk";
}

else if(temp>=25 && temp<=30 && humidity>75){
disease="⚠️ Anthracnose Risk";
}

else if(temp>=18 && temp<=30 && humidity>65){
disease="⚠️ Banana Bunchy Top Virus Risk";
}

else if(temp>=25 && temp<=35 && humidity>85){
disease="⚠️ Crown Rot Risk";
}

else if(temp>=22 && temp<=30 && humidity>70){
disease="⚠️ Leaf Speckle Risk";
}

else if(temp>=24 && temp<=30 && humidity>85){
disease="⚠️ Root Rot Risk";
}

else{
disease="✅ Healthy conditions for Banana";
}

}


// GUAVA

if(fruit=="guava"){

if(temp>=20 && temp<=30 && humidity>75){
disease="⚠️ Anthracnose Risk";
}

else if(temp>=28 && temp<=35 && humidity>=60 && humidity<=80){
disease="⚠️ Guava Wilt Risk";
}

else if(temp>25 && humidity>65){
disease="⚠️ Fruit Fly Infestation Risk";
}

else if(temp>=18 && temp<=28 && humidity>80){
disease="⚠️ Algal Leaf Spot Risk";
}

else if(temp>=18 && temp<=25 && humidity>=50 && humidity<=70){
disease="⚠️ Powdery Mildew Risk";
}

else if(temp>=22 && temp<=32 && humidity>70){
disease="⚠️ Cercospora Leaf Spot Risk";
}

else if(temp>=20 && temp<=28 && humidity>85){
disease="⚠️ Rust Disease Risk";
}

else if(temp>30 && humidity<50){
disease="⚠️ Dieback Disease Risk";
}

else if(temp>=24 && temp<=30 && humidity>80){
disease="⚠️ Root Rot Risk";
}

else{
disease="✅ Healthy conditions for Guava";
}

}


// DISPLAY RESULT

document.getElementById("result").innerHTML = `

<img class="weatherIcon" src="https://openweathermap.org/img/wn/${icon}@2x.png">

<h3>${realCity}</h3>

Temperature: ${temp} °C <br>
Humidity: ${humidity}% <br><br>

Prediction:<br>
<b>${disease}</b>

`;

}catch{

document.getElementById("result").innerHTML="Error getting weather data";

}

}
