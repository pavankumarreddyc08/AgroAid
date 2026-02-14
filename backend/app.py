from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
import numpy as np
from PIL import Image
import json
import io
import os
import requests
from dotenv import load_dotenv
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input

# ---------------------------------------------------
# INITIAL SETUP
# ---------------------------------------------------

app = Flask(__name__)
CORS(app)

load_dotenv()
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
SARVAM_API_KEY = os.getenv("SARVAM_API_KEY")


IMG_SIZE = 224
CONFIDENCE_THRESHOLD = 70

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "model")
ROOT_DIR = os.path.join(BASE_DIR, "..")

# ---------------------------------------------------
# LOAD MODEL FUNCTION
# ---------------------------------------------------

def load_model_and_classes(model_name, class_file):
    model_path = os.path.join(MODEL_DIR, model_name)
    class_path = os.path.join(ROOT_DIR, class_file)

    print(f"Loading model: {model_name}")

    model = tf.keras.models.load_model(model_path)

    with open(class_path, "r") as f:
        classes = json.load(f)

    return model, classes

print("🔄 Loading All Fruit Models...")

fruit_models = {}

try:
    fruit_models["guava"] = load_model_and_classes(
        "Guavamodel7.keras",
        "Guava_Classes.json"
    )

    fruit_models["mango"] = load_model_and_classes(
        "Mangomodel1.keras",
        "Mango_Classes.json"
    )

    fruit_models["banana"] = load_model_and_classes(
        "BananaModel1.keras",
        "Banana_Classes.json"
    )

    print("✅ All Models Loaded Successfully")

except Exception as e:
    print("❌ Error loading models:", str(e))

# ---------------------------------------------------
# IMAGE PREPROCESSING
# ---------------------------------------------------

def preprocess_image(image):
    image = image.resize((IMG_SIZE, IMG_SIZE))
    image = np.array(image).astype(np.float32)
    image = preprocess_input(image)
    image = np.expand_dims(image, axis=0)
    return image

# ---------------------------------------------------
# DISEASE PREDICTION ROUTE
# ---------------------------------------------------

@app.route("/predict", methods=["POST"])
def predict():

    if "file" not in request.files or "fruit" not in request.form:
        return jsonify({"error": "Missing file or fruit selection"}), 400

    fruit = request.form["fruit"].lower()
    file = request.files["file"]

    if fruit not in fruit_models:
        return jsonify({"error": "Selected fruit model not available"}), 400

    try:
        image = Image.open(io.BytesIO(file.read())).convert("RGB")
    except:
        return jsonify({"error": "Invalid image"}), 400

    processed = preprocess_image(image)
    model, classes = fruit_models[fruit]

    predictions = model.predict(processed)
    predicted_index = int(np.argmax(predictions))
    confidence = float(np.max(predictions)) * 100

    if confidence < CONFIDENCE_THRESHOLD:
        return jsonify({
            "fruit": fruit,
            "disease": "Unclear Image",
            "confidence": round(confidence, 2),
            "message": "Please capture a clearer leaf image"
        })

    disease = classes[predicted_index]

    return jsonify({
        "fruit": fruit,
        "disease": disease,
        "confidence": round(confidence, 2)
    })

# ---------------------------------------------------
# AI CHATBOT ROUTE
# ---------------------------------------------------

@app.route("/chat", methods=["POST"])
def chat():
    try:
        data = request.json
        user_message = data.get("message")

        if not user_message:
            return jsonify({"error": "No message provided"}), 400

        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "model": "deepseek/deepseek-chat",
                "messages": [
                    {
                        "role": "system",
                        "content": "You are AgroAid AI assistant specialized in agriculture, crop disease detection, treatment advice, fertilizers, and farming guidance."
                    },
                    {
                        "role": "user",
                        "content": user_message
                    }
                ]
            }
        )

        result = response.json()

        ai_reply = result["choices"][0]["message"]["content"]

        return jsonify({"reply": ai_reply})

    except Exception as e:
        print("AI Error:", str(e))
        return jsonify({"error": "AI request failed"}), 500
    
# ---------------------------------------------------
# LANGUAGE TRANSLATION ROUTE (SARVAM API)
# ---------------------------------------------------

@app.route("/translate", methods=["POST"])
def translate():
    try:
        data = request.json
        text_dict = data.get("text")
        target_lang = data.get("target_lang")

        if not text_dict or not target_lang:
            return jsonify({"error": "Missing text or language"}), 400

        translated_texts = {}

        for key, value in text_dict.items():

            response = requests.post(
                "https://api.sarvam.ai/translate",
                headers={
                    "Authorization": f"Bearer {SARVAM_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "input": value,
                    "source_language_code": "en-IN",
                    "target_language_code": f"{target_lang}-IN"
                }
            )

            result = response.json()

            if "translated_text" in result:
                translated_texts[key] = result["translated_text"]
            else:
                translated_texts[key] = value  # fallback

        return jsonify(translated_texts)

    except Exception as e:
        print("Translation Error:", str(e))
        return jsonify({"error": "Translation failed"}), 500


# ---------------------------------------------------
# RUN SERVER
# ---------------------------------------------------

if __name__ == "__main__":
    print("🚀 Starting AgroAid Backend...")
    app.run(host="0.0.0.0", port=5000, debug=True)
