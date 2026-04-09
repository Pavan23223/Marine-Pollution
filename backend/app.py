import os
import shutil
import json
from datetime import datetime
from dotenv import load_dotenv

from fastapi import FastAPI, UploadFile, File, Body
from fastapi.middleware.cors import CORSMiddleware


# Internal Imports
from database import save_result
from model import detect_from_image, predict_future_risk


#  ENV SETUP
load_dotenv()


#  APP INIT
app = FastAPI(title="OceanGuardian AI ")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# HOME
@app.get("/")
def home():
    return {"message": "OceanGuardian AI is running "}

# IMAGE ANALYSIS
@app.post("/analyze")
async def analyze_image(file: UploadFile = File(...)):
    try:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        original_name = os.path.basename(file.filename)
        filename = f"{timestamp}_{original_name}"
        file_path = os.path.join(UPLOAD_FOLDER, filename)

        # Save file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # AI Detection
        result = detect_from_image(file_path)
        label = result["label"]
        confidence = result["confidence"]

        # Future Risk
        decision = predict_future_risk(label)

        # Location extraction
        try:
            parts = original_name.split("_")
            latitude = float(parts[0])
            longitude = float(parts[1])
        except:
            latitude = 12.9716
            longitude = 77.5946

        # Risk level
        if "Restricted" in decision:
            risk_level = "HIGH"
        elif "Limit" in decision:
            risk_level = "MEDIUM"
        else:
            risk_level = "LOW"

        # Save result
        save_result({
            "filename": filename,
            "detection": label,
            "confidence": confidence,
            "risk_level": risk_level,
            "latitude": latitude,
            "longitude": longitude
        })

        return {
            "success": True,
            "detection": label,
            "confidence": confidence,
            "risk_level": risk_level,
            "location": {
                "latitude": latitude,
                "longitude": longitude
            }
        }

    except Exception as e:
        return {"success": False, "error": str(e)}


# HISTORY
@app.get("/history")
def get_history():
    try:
        if not os.path.exists("data.json"):
            return []

        with open("data.json", "r") as f:
            data = json.load(f)

        return data[::-1]

    except Exception as e:
        return {"error": str(e)}

