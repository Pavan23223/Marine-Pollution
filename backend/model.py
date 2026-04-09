from tensorflow.keras.models import load_model
import numpy as np
from tensorflow.keras.preprocessing import image
import os


MODEL_PATH = "plastic_model.h5"
model = load_model(MODEL_PATH)


CLASS_NAMES = ["no_plastic", "plastic"]



def detect_from_image(img_path: str):
    try:
        img = image.load_img(img_path, target_size=(224, 224))
        img_array = image.img_to_array(img) / 255.0
        img_array = np.expand_dims(img_array, axis=0)

        prediction = model.predict(img_array)[0][0]

        if prediction > 0.5:
            label = "Plastic Waste Detected"
            confidence = prediction
        else:
            label = "Clean Water"
            confidence = 1 - prediction

        return {
            "label": label,
            "confidence": round(float(confidence) * 100, 2)
        }

    except Exception as e:
        return {"error": str(e)}


def predict_future_risk(detection: str) -> str:
    if "Plastic" in detection:
        return "Fishing Restricted (High Risk)"
    else:
        return " Safe Zone"


def get_risk_score(detection: str) -> int:
    if "Plastic" in detection:
        return 90
    return 10