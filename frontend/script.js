
//  MAP INITIALIZATION
let map = null;

if (document.getElementById("map")) {
    map = L.map('map').setView([12.9716, 77.5946], 5);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: "© OpenStreetMap contributors"
    }).addTo(map);
}

let markers = [];

// PREVIEW IMAGE
function previewImage() {
    const file = document.getElementById("imageInput").files[0];
    const preview = document.getElementById("preview");

    if (file) {
        preview.src = URL.createObjectURL(file);
        preview.style.display = "block";
    }
}


//  SINGLE IMAGE UPLOAD
async function uploadImage() {

    const fileInput = document.getElementById("imageInput");
    const resultBox = document.getElementById("result");

    if (!fileInput || fileInput.files.length === 0) {
        alert("Please select an image");
        return;
    }

    let formData = new FormData();
    formData.append("file", fileInput.files[0]);

    //  AI Loading UI
    resultBox.innerHTML = `
        <div class="loading">
            <i class="fas fa-brain fa-pulse"></i>
            <p>AI analyzing ocean data...</p>
        </div>
    `;

    try {
        const res = await fetch("http://127.0.0.1:8000/analyze", {
            method: "POST",
            body: formData
        });

        const data = await res.json();
        console.log("Single Response:", data);

        if (!data.success || !data.location) {
            resultBox.innerHTML = "Failed to analyze image";
            return;
        }

        // 🎯 RESULT UI
        let badge = "";
        let bg = "";

        if (data.risk_level === "HIGH") {
            badge = "<span class='badge red'>HIGH RISK</span>";
            bg = "#e74c3c";
        } else if (data.risk_level === "MEDIUM") {
            badge = "<span class='badge orange'>MEDIUM RISK</span>";
            bg = "#f39c12";
        } else {
            badge = "<span class='badge green'>SAFE</span>";
            bg = "#2ecc71";
        }

        resultBox.style.background = bg;

        resultBox.innerHTML = `
            ${badge}
            <p>${data.detection}</p>
             <small>Confidence: ${data.confidence || "N/A"}%</small>
        `;

        // 🧹 CLEAR OLD MARKERS
        if (map) {
            markers.forEach(m => map.removeLayer(m));
            markers = [];
        }

        // 📍 ADD NEW MARKER
        const lat = data.location.latitude;
        const lon = data.location.longitude;

        if (map) {
            const marker = L.marker([lat, lon]).addTo(map);
            marker.bindPopup(data.risk_level).openPopup();

            markers.push(marker);

            map.flyTo([lat, lon], 8, { duration: 2 });
        }

    } catch (err) {
        console.error(err);
        resultBox.innerHTML = "Server Error";
    }
}

// 📂 FOLDER UPLOAD
const folderInput = document.getElementById("folderInput");

if (folderInput) {
    folderInput.addEventListener("change", async () => {

        const files = folderInput.files;
        const viewer = document.getElementById("imageViewer");
        const result = document.getElementById("result");

        if (!files || files.length === 0) {
            alert("No files selected");
            return;
        }

        viewer.innerHTML = "";

        result.innerHTML = `
            <div class="loading">
                <i class="fas fa-brain fa-pulse"></i>
                <p>Analyzing multiple images...</p>
            </div>
        `;

        if (map) {
            markers.forEach(m => map.removeLayer(m));
            markers = [];
        }

        let successCount = 0;
        let failCount = 0;

        for (let i = 0; i < files.length; i++) {

            const file = files[i];
            if (!file.type.startsWith("image/")) continue;

            // 📸 SHOW PREVIEW
            // 📸 CREATE CARD (image + analysis)
            const card = document.createElement("div");
            card.style.display = "inline-block";
            card.style.margin = "10px";
            card.style.textAlign = "center";

            // IMAGE
            const img = document.createElement("img");
            img.src = URL.createObjectURL(file);
            img.style.width = "150px";
            img.style.borderRadius = "10px";

            // ANALYSIS BOX (empty initially)
            const analysis = document.createElement("div");
            analysis.style.fontSize = "12px";
            analysis.style.marginTop = "5px";
            analysis.innerHTML = "Analyzing...";

            // ADD TO CARD
            card.appendChild(img);
            card.appendChild(analysis);

            // ADD TO VIEWER
            viewer.appendChild(card);

            let formData = new FormData();
            formData.append("file", file);

            try {
                const res = await fetch("http://127.0.0.1:8000/analyze", {
                    method: "POST",
                    body: formData
                });

                const data = await res.json();
                console.log("Folder Response:", data);

                if (!data.success || !data.location) {
                    failCount++;
                    continue;
                }
                // 📊 UPDATE ANALYSIS BELOW IMAGE
                analysis.innerHTML = `
                    <b>${data.risk_level}</b><br>
                    ${data.detection}<br>
                    <small>${data.location.latitude.toFixed(2)}, ${data.location.longitude.toFixed(2)}</small>
                `;

                const lat = data.location.latitude;
                const lon = data.location.longitude;

                let color = "green";
                if (data.risk_level === "HIGH") color = "red";
                else if (data.risk_level === "MEDIUM") color = "orange";

                if (map) {
                    const marker = L.circleMarker([lat, lon], {
                        radius: 8,
                        color: color,
                        fillColor: color,
                        fillOpacity: 0.8
                    }).addTo(map);

                    marker.bindPopup(data.risk_level);
                    markers.push(marker);
                }

                successCount++;

                result.innerHTML = `
                    <b>Processing ${i + 1}/${files.length}</b><br>
                    ✔ Success: ${successCount} |  Failed: ${failCount}
                `;

                await new Promise(r => setTimeout(r, 300));

            } catch (err) {
                console.error("Error:", file.name);
                failCount++;
            }
        }

        result.innerHTML = `
        Completed<br>
        Success: ${successCount}<br>
         Failed: ${failCount}
        `;
    });
}