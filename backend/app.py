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
        "model_file": "best_modelwithaugandwithoutaug.keras",
        "class_file": "Potato_Classes.json",
        "status": "available",
        "name": "Potato"
    },
    "tomato": {
        "status": "coming_soon",
        "name": "Tomato",
        "message": "Tomato disease detection model is under development."
    },
    "wheat": {
        "status": "coming_soon",
        "name": "Wheat",
        "message": "Wheat disease detection model is under development."
    },
    "rice": {
        "status": "coming_soon",
        "name": "Rice",
        "message": "Rice disease detection model is under development."
    },
    "corn": {
        "status": "coming_soon",
        "name": "Corn",
        "message": "Corn disease detection model is under development."
    },
    "cotton": {
        "status": "coming_soon",
        "name": "Cotton",
        "message": "Cotton disease detection model is under development."
    }
}

# ---------------------------------------------------
# LOAD CROP MODELS
# ---------------------------------------------------

def load_model_and_classes(model_name, class_file):
    model_path = os.path.join(MODEL_DIR, model_name)
    class_path = os.path.join(ROOT_DIR, class_file)

    print(f"📂 Loading model: {model_name}")

    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model not found: {model_path}")

    model = tf.keras.models.load_model(model_path)

    with open(class_path, "r") as f:
        classes = json.load(f)

    return model, classes


print("🔄 Loading Crop Disease Models...")

crop_models = {}

for crop_key, crop_info in AVAILABLE_CROPS.items():

    if crop_info["status"] != "available":
        continue

    try:
        print(f"\n🌱 Loading {crop_info['name']} model...")

        model, classes = load_model_and_classes(
            crop_info["model_file"],
            crop_info["class_file"]
        )

        crop_models[crop_key] = {
            "model": model,
            "classes": classes
        }

        print(f"✅ {crop_info['name']} Model Loaded Successfully")
        print(f"📋 Classes Loaded: {len(classes)}")

    except Exception as e:
        print(f"❌ Error loading {crop_info['name']} model: {str(e)}")
        crop_models[crop_key] = {
            "model": None,
            "classes": None
        }

# ---------------------------------------------------
# FRONTEND ROUTES
# ---------------------------------------------------

@app.route("/")
def home():
    return render_template("index.html")


@app.route("/<path:path>")
def static_files(path):
    return send_from_directory(app.static_folder, path)

# ---------------------------------------------------
# GET AVAILABLE CROPS
# ---------------------------------------------------

@app.route("/api/crops", methods=["GET"])
def get_crops():
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
# DISEASE PREDICTION
# ---------------------------------------------------

@app.route("/predict", methods=["POST"])
def predict():

    if "file" not in request.files:
        return jsonify({"error": "Missing image file"}), 400

    crop = request.form.get("crop", "potato").lower()

    if crop not in AVAILABLE_CROPS:
        return jsonify({"error": "Invalid crop"}), 400

    crop_info = AVAILABLE_CROPS[crop]

    if crop_info["status"] == "coming_soon":
        return jsonify({
            "error": "Model not available",
            "message": crop_info["message"]
        }), 503

    if crop not in crop_models or crop_models[crop]["model"] is None:
        return jsonify({
            "error": f"{crop_info['name']} model not loaded"
        }), 500

    file = request.files["file"]

    try:
        image = Image.open(io.BytesIO(file.read())).convert("RGB")
    except:
        return jsonify({"error": "Invalid image"}), 400

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
            "confidence": round(confidence, 2)
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
# CHATBOT
# ---------------------------------------------------

@app.route("/chat", methods=["POST"])
def chat():

    data = request.json
    user_message = data.get("message")

    if not user_message:
        return jsonify({"error": "Message missing"}), 400

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
                    "content": "You are AgroAid AI assistant specialized in agriculture and crop disease detection."
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

# ---------------------------------------------------
# RUN SERVER
# ---------------------------------------------------

if __name__ == "__main__":

    print("\n" + "="*50)
    print("🚀 Starting AgroAid Backend Server")
    print("="*50)

    available = len([c for c in AVAILABLE_CROPS.values() if c["status"] == "available"])
    coming = len([c for c in AVAILABLE_CROPS.values() if c["status"] == "coming_soon"])

    print(f"📊 Available Crops: {available}")
    print(f"🔄 Coming Soon: {coming}")
    print("="*50 + "\n")

    # app.run(host="0.0.0.0", port=5000, debug=True)
    port = int(os.environ.get("PORT", 10000))
    app.run(host="0.0.0.0", port=port)