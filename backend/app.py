from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
import numpy as np
from PIL import Image
import json
import io
import os
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input

app = Flask(__name__)
CORS(app)

IMG_SIZE = 224
CONFIDENCE_THRESHOLD = 70

# ---------------------------------------------------
# PATH SETUP
# ---------------------------------------------------

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "model")
ROOT_DIR = os.path.join(BASE_DIR, "..")

# ---------------------------------------------------
# LOAD MODELS & CLASS FILES
# ---------------------------------------------------

def load_model_and_classes(model_name, class_file):
    model_path = os.path.join(MODEL_DIR, model_name)
    class_path = os.path.join(ROOT_DIR, class_file)

    model = tf.keras.models.load_model(model_path)

    with open(class_path, "r") as f:
        classes = json.load(f)

    return model, classes


print("🔄 Loading Models...")

guava_model, guava_classes = load_model_and_classes(
    "Guavamodel7.keras",
    "Guava_Classes.json"
)

mango_model, mango_classes = load_model_and_classes(
    "Mangomodel1.keras",
    "Mango_Classes.json"
)

print("✅ All Models Loaded Successfully")


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
# PREDICTION ROUTE
# ---------------------------------------------------

@app.route("/predict", methods=["POST"])
def predict():

    if "file" not in request.files or "fruit" not in request.form:
        return jsonify({"error": "Missing file or fruit selection"}), 400

    fruit = request.form["fruit"].lower()
    file = request.files["file"]

    try:
        image = Image.open(io.BytesIO(file.read())).convert("RGB")
    except:
        return jsonify({"error": "Invalid image"}), 400

    processed = preprocess_image(image)

    # 🔥 Select model dynamically
    if fruit == "guava":
        model = guava_model
        classes = guava_classes

    elif fruit == "mango":
        model = mango_model
        classes = mango_classes

    else:
        return jsonify({"error": "Selected fruit model not available"}), 400

    predictions = model.predict(processed)
    predicted_index = int(np.argmax(predictions))
    confidence = float(np.max(predictions)) * 100

    if confidence < CONFIDENCE_THRESHOLD:
        return jsonify({
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
# RUN SERVER
# ---------------------------------------------------

if __name__ == "__main__":
    print("🚀 Starting AgroAid Backend...")
    app.run(host="0.0.0.0", port=5000, debug=True)
