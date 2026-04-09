import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
from groq import Groq

# ==============================
# 🔐 ENV SETUP
# ==============================
load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# ==============================
# 🚀 APP INIT
# ==============================
app = FastAPI(title="OceanGuardian Chatbot 🤖")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# REQUEST MODEL

class ChatRequest(BaseModel):
    user_input: str

# CHATBOT

@app.post("/chat")
async def chat(request: ChatRequest):

    try:
        user_input = request.user_input

        
        response = requests.get("http://localhost:8000/history")
        data = response.json()

        high_risk_count = sum(1 for d in data if d["risk_level"] == "HIGH")
        low_risk_count = sum(1 for d in data if d["risk_level"] == "LOW")

        prompt = f"""
        You are a Marine Safety AI Assistant 🌊

        Data Summary:
        - High Risk Zones: {high_risk_count}
        - Safe Zones: {low_risk_count}

        Recent Data:
        {data[-5:]}

        Question:
        {user_input}

        Give clear, simple advice for fishermen.
        """

        chat_completion = client.chat.completions.create(
            messages=[
                {"role": "user", "content": prompt}
            ],
            model="llama-3.1-8b-instant"
        )

        return {
            "response": chat_completion.choices[0].message.content
        }

    except Exception as e:
        return {"error": str(e)}