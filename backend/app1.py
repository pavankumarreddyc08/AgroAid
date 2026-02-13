from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
import numpy as np
from PIL import Image
import json
import io
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input

app = Flask(__name__)
CORS(app)

IMG_SIZE = 224
CONFIDENCE_THRESHOLD = 65  # Lowered for better usability

# Load class names
with open("class_names.json", "r") as f:
    guava_classes = json.load(f)

# Load best trained model
guava_model = tf.keras.models.load_model("best_model.keras")
print("✅ Model Loaded Successfully")


def preprocess_image(image):
    image = image.resize((IMG_SIZE, IMG_SIZE))
    image = np.array(image).astype(np.float32)
    image = preprocess_input(image)
    image = np.expand_dims(image, axis=0)
    return image


@app.route("/predict", methods=["POST"])
def predict():

    if "file" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    file = request.files["file"]

    try:
        image = Image.open(io.BytesIO(file.read())).convert("RGB")
    except:
        return jsonify({"error": "Invalid image"}), 400

    processed = preprocess_image(image)

    predictions = guava_model.predict(processed)
    predicted_index = int(np.argmax(predictions))
    confidence = float(np.max(predictions)) * 100

    if confidence < CONFIDENCE_THRESHOLD:
        return jsonify({
            "disease": "Unclear Image",
            "confidence": round(confidence, 2),
            "message": "Please capture a clearer leaf image"
        })

    disease = guava_classes[predicted_index]

    return jsonify({
        "disease": disease,
        "confidence": round(confidence, 2)
    })


if __name__ == "__main__":
    print("🚀 Starting AgroAid Backend...")
    app.run(host="0.0.0.0", port=5000, debug=True)
