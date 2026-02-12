from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
import numpy as np
from PIL import Image
import json
import io
import cv2
import os
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

app = Flask(__name__)
CORS(app)

IMG_SIZE = 224
CONFIDENCE_THRESHOLD = 70

# Load class names
with open("../class_names.json", "r") as f:
    guava_classes = json.load(f)

# Load model
guava_model = tf.keras.models.load_model("model/best_model.keras")

print("✅ Model loaded successfully")


# ================= BACKGROUND REMOVAL =================

def remove_background_np(image_np):
    hsv = cv2.cvtColor(image_np, cv2.COLOR_RGB2HSV)

    lower_green = np.array([35, 40, 40])
    upper_green = np.array([85, 255, 255])

    mask = cv2.inRange(hsv, lower_green, upper_green)

    green_pixels = np.sum(mask > 0)
    total_pixels = mask.size
    green_ratio = green_pixels / total_pixels

    if green_ratio < 0.15:
        return None

    image_np = cv2.bitwise_and(image_np, image_np, mask=mask)

    return image_np


def preprocess_image(image):
    image_np = np.array(image).astype(np.uint8)

    image_np = remove_background_np(image_np)

    if image_np is None:
        return None

    image_np = cv2.resize(image_np, (IMG_SIZE, IMG_SIZE))
    image_np = image_np.astype(np.float32)
    image_np = preprocess_input(image_np)
    image_np = np.expand_dims(image_np, axis=0)

    return image_np


# ================= PREDICTION ROUTE =================

@app.route("/predict", methods=["POST"])
def predict():

    if "file" not in request.files or "fruit" not in request.form:
        return jsonify({"error": "Missing file or fruit selection"}), 400

    fruit = request.form["fruit"]

    if fruit != "guava":
        return jsonify({"error": "Model not available"}), 400

    file = request.files["file"]
    image = Image.open(io.BytesIO(file.read())).convert("RGB")

    processed = preprocess_image(image)

    if processed is None:
        return jsonify({
            "disease": "Irrelevant Image",
            "confidence": 0,
            "message": "Please upload a valid leaf image"
        })

    predictions = guava_model.predict(processed)
    predicted_index = np.argmax(predictions)
    confidence = float(np.max(predictions)) * 100

    if confidence < CONFIDENCE_THRESHOLD:
        return jsonify({
            "disease": "Unclear Image",
            "confidence": round(confidence, 2),
            "message": "Please capture a clear leaf image"
        })

    disease = guava_classes[predicted_index]

    return jsonify({
        "disease": disease,
        "confidence": round(confidence, 2)
    })


if __name__ == "__main__":
    print("🚀 Starting AgroAid Backend...")
    app.run(host="0.0.0.0", port=5000, debug=True)
