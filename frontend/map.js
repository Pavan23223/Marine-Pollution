let map = L.map('map').setView([12.9716, 77.5946], 5);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: "© OpenStreetMap"
}).addTo(map);

let allMarkers = [];
let allData = [];
let locationStats = {};


// FETCH HISTORY DATA FROM BACKEND
async function loadData() {
    const res = await fetch("http://127.0.0.1:8000/history");
    const data = await res.json();

    allData = data;
    showMarkers("ALL");
}

//  SHOW MARKERS
function showMarkers(filter) {

    // clear old markers
    allMarkers.forEach(m => map.removeLayer(m));
    allMarkers = [];

    locationStats = {};

    //  STEP 1: GROUP DATA
    allData.forEach(item => {

        const key = item.latitude.toFixed(3) + "_" + item.longitude.toFixed(3);

        if (!locationStats[key]) {
            locationStats[key] = {
                latitude: item.latitude,
                longitude: item.longitude,
                hasPollution: false,
                hasClean: false
            };
        }

        if (item.risk_level === "HIGH" || item.risk_level === "MEDIUM") {
            locationStats[key].hasPollution = true;
        }

        if (item.risk_level === "LOW") {
            locationStats[key].hasClean = true;
        }
    });

    //  STEP 2: APPLY YOUR LOGIC
    for (let key in locationStats) {

        const loc = locationStats[key];

        let finalRisk = "LOW";

        if (loc.hasPollution && loc.hasClean) {
            finalRisk = "MEDIUM";   // mixed
        } 
        else if (loc.hasPollution) {
            finalRisk = "HIGH";     // only pollution
        } 
        else {
            finalRisk = "LOW";      // only clean
        }

        //  FILTER
        if (filter !== "ALL" && finalRisk !== filter) continue;

        // COLOR
        let color = "green";
        if (finalRisk === "HIGH") color = "red";
        else if (finalRisk === "MEDIUM") color = "orange";

        // MARKER
        const marker = L.circleMarker(
            [loc.latitude, loc.longitude],
            {
                radius: 10,
                color: color,
                fillColor: color,
                fillOpacity: 0.9
            }
        ).addTo(map);

        marker.bindPopup(`
            <b>Final Risk: ${finalRisk}</b><br>
            Pollution: ${loc.hasPollution ? "Yes" : "No"}<br>
            Clean: ${loc.hasClean ? "Yes" : "No"}
        `);

        allMarkers.push(marker);
    }
}

//  FILTER FUNCTION
function filterMarkers(level) {
    showMarkers(level);
}

//  LOAD DATA
loadData();