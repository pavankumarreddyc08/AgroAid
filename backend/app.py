from flask import Flask, request, jsonify, render_template, send_from_directory
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

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.join(BASE_DIR, "..")

app = Flask(
    __name__,
    template_folder=os.path.join(ROOT_DIR, "frontend"),
    static_folder=os.path.join(ROOT_DIR, "frontend")
)

CORS(app)
load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
SARVAM_API_KEY = os.getenv("SARVAM_API_KEY")

IMG_SIZE = 224
CONFIDENCE_THRESHOLD = 60

MODEL_DIR = os.path.join(BASE_DIR, "model")

# ---------------------------------------------------
# AVAILABLE CROPS CONFIGURATION
# ---------------------------------------------------

AVAILABLE_CROPS = {
    "potato": {
        "model_file": "Potato_model.keras",
        "class_file": "Potato_Classes.json",
        "status": "available",
        "name": "Potato"
    },
    "tomato": {
        "status": "coming_soon",
        "name": "Tomato",
        "message": "Tomato disease detection model is under development. Expected release: Q2 2026"
    },
    "wheat": {
        "status": "coming_soon",
        "name": "Wheat",
        "message": "Wheat disease detection model is under development. Expected release: Q3 2026"
    },
    "rice": {
        "status": "coming_soon",
        "name": "Rice",
        "message": "Rice disease detection model is under development. Expected release: Q3 2026"
    },
    "corn": {
        "status": "coming_soon",
        "name": "Corn",
        "message": "Corn disease detection model is under development. Expected release: Q4 2026"
    },
    "cotton": {
        "status": "coming_soon",
        "name": "Cotton",
        "message": "Cotton disease detection model is under development. Expected release: Q4 2026"
    }
}

# ---------------------------------------------------
# LOAD POTATO MODEL
# ---------------------------------------------------

def load_model_and_classes(model_name, class_file):
    model_path = os.path.join(MODEL_DIR, model_name)
    class_path = os.path.join(ROOT_DIR, class_file)

    print(f"📂 Loading model: {model_name}")

    model = tf.keras.models.load_model(model_path)

    with open(class_path, "r") as f:
        classes = json.load(f)

    return model, classes


print("🔄 Loading Potato Disease Model...")

crop_models = {}

try:
    crop_models["potato"] = {
        "model": None,
        "classes": None
    }
    
    model, classes = load_model_and_classes(
        "Potato_model.keras",
        "Potato_Classes.json"
    )
    
    crop_models["potato"]["model"] = model
    crop_models["potato"]["classes"] = classes
    
    print("✅ Potato Model Loaded Successfully")
    print(f"📋 Loaded {len(classes)} disease classes: {', '.join(classes)}")

except Exception as e:
    print(f"❌ Error loading potato model: {str(e)}")


# ---------------------------------------------------
# FRONTEND ROUTES
# ---------------------------------------------------

@app.route("/")
def home():
    return render_template("index.html")


@app.route("/favicon.ico")
def favicon():
    """Serve empty favicon to suppress 404 errors"""
    from flask import Response
    # Return a minimal valid ICO file (1x1 transparent)
    ico_data = b'\x00\x00\x01\x00\x01\x00\x01\x01\x00\x00\x01\x00\x18\x00\x30\x00\x00\x00\x16\x00\x00\x00\x28\x00\x00\x00\x01\x00\x00\x00\x02\x00\x00\x00\x01\x00\x18\x00\x00\x00\x00\x00\x04\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\xff\xff'
    return Response(ico_data, mimetype='image/x-icon')


@app.route("/<path:path>")
def static_files(path):
    return send_from_directory(app.static_folder, path)


# ---------------------------------------------------
# GET AVAILABLE CROPS API
# ---------------------------------------------------

@app.route("/api/crops", methods=["GET"])
def get_crops():
    """Return list of available and coming soon crops"""
    return jsonify({
        "crops": AVAILABLE_CROPS,
        "success": True
    })


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
    
    if "file" not in request.files:
        return jsonify({"error": "Missing file"}), 400

    # Get crop type from request (default to potato for backward compatibility)
    crop = request.form.get("crop", "potato").lower()
    
    # Check if crop is in available list
    if crop not in AVAILABLE_CROPS:
        return jsonify({"error": f"Crop '{crop}' not recognized"}), 400
    
    crop_info = AVAILABLE_CROPS[crop]
    
    # Check if crop model is available
    if crop_info["status"] == "coming_soon":
        return jsonify({
            "error": "Model not available",
            "crop": crop,
            "status": "coming_soon",
            "message": crop_info.get("message", f"{crop_info['name']} model is under development"),
            "name": crop_info["name"]
        }), 503
    
    # Check if model is loaded
    if crop not in crop_models or crop_models[crop]["model"] is None:
        return jsonify({
            "error": f"{crop_info['name']} model not loaded",
            "crop": crop
        }), 500

    file = request.files["file"]

    try:
        image = Image.open(io.BytesIO(file.read())).convert("RGB")
    except:
        return jsonify({"error": "Invalid image file"}), 400

    processed = preprocess_image(image)
    
    model = crop_models[crop]["model"]
    classes = crop_models[crop]["classes"]

    predictions = model.predict(processed)
    predicted_index = int(np.argmax(predictions))
    confidence = float(np.max(predictions)) * 100

    if confidence < CONFIDENCE_THRESHOLD:
        return jsonify({
            "crop": crop,
            "disease": "Unclear Image",
            "confidence": round(confidence, 2),
            "message": f"Please capture a clearer {crop_info['name']} leaf image"
        })

    disease = classes[predicted_index]

    return jsonify({
        "crop": crop,
        "crop_name": crop_info["name"],
        "disease": disease,
        "confidence": round(confidence, 2),
        "success": True
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
                "model": "openai/gpt-3.5-turbo",
                "messages": [
                    {
                        "role": "system",
                        "content": "You are AgroAid AI assistant specialized in agriculture, crop disease detection (especially potato), fertilizers and farming guidance. Be helpful, concise, and practical."
                    },
                    {
                        "role": "user",
                        "content": user_message
                    }
                ]
            },
            timeout=30
        )

        if response.status_code != 200:
            return jsonify({"error": "AI service failed"}), 500

        result = response.json()

        if "choices" not in result:
            return jsonify({"error": "Invalid AI response"}), 500

        ai_reply = result["choices"][0]["message"]["content"]

        return jsonify({"reply": ai_reply})

    except Exception as e:
        print("❌ AI Exception:", str(e))
        return jsonify({"error": "AI request failed"}), 500


# ---------------------------------------------------
# LANGUAGE TRANSLATION ROUTE
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
                translated_texts[key] = value

        return jsonify(translated_texts)

    except Exception as e:
        print("❌ Translation Error:", str(e))
        return jsonify({"error": "Translation failed"}), 500


# ---------------------------------------------------
# RUN SERVER
# ---------------------------------------------------

if __name__ == "__main__":
    print("\n" + "="*50)
    print("🚀 Starting AgroAid Backend Server")
    print("="*50)
    print(f"📊 Available Crops: {len([c for c in AVAILABLE_CROPS.values() if c['status'] == 'available'])}")
    print(f"🔄 Coming Soon: {len([c for c in AVAILABLE_CROPS.values() if c['status'] == 'coming_soon'])}")
    print("="*50 + "\n")
    
    app.run(host="0.0.0.0", port=5000, debug=True)