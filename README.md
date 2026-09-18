# 🌊 OceanGuardian AI

OceanGuardian AI is an **AI-powered marine pollution monitoring system** developed to help detect and monitor plastic waste in ocean and coastal environments.

The system uses **Computer Vision and a Convolutional Neural Network (CNN)** to analyze uploaded marine images and determine whether plastic waste is present. Based on the prediction, the system provides a pollution risk level and records the geographical location of the detected pollution.

## 🚀 Key Features

- 🧠 **Plastic Waste Detection** – Uses a CNN model to classify images as plastic waste detected or no plastic detected.
- ⚠️ **Risk Classification** – Provides pollution risk levels based on detection results.
- 📍 **Location Tracking** – Extracts GPS coordinates associated with uploaded images.
- 🗺️ **Pollution Map** – Displays pollution records on an interactive map using Leaflet and OpenStreetMap.
- 🤖 **AI Marine Chatbot** – Provides information and guidance related to marine safety, pollution awareness, and environmental recommendations.
- 📁 **Multiple Image Analysis** – Supports uploading and analyzing multiple marine images.

## 🔄 How It Works

```text
Marine Image
     ↓
Image Preprocessing
     ↓
CNN-based AI Detection
     ↓
Plastic / No Plastic
     ↓
Risk Classification
     ↓
GPS Location & Data Storage
     ↓
Interactive Pollution Map
     ↓
AI Marine Safety Chatbot
