from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
import numpy as np
from PIL import Image
import json
import io
import os

app = Flask(__name__)
CORS(app)

IMG_SIZE = 224

# Load class names (Guava only for now)
with open("../class_names.json", "r") as f:
    guava_classes = json.load(f)

# Load Guava model only
guava_model = tf.keras.models.load_model("model/Guava1model.keras")


def preprocess_image(image):
    image = image.resize((IMG_SIZE, IMG_SIZE))
    image = np.array(image) / 255.0
    image = np.expand_dims(image, axis=0)
    return image


@app.route("/predict", methods=["POST"])
def predict():

    if "file" not in request.files or "fruit" not in request.form:
        return jsonify({"error": "Missing file or fruit selection"}), 400

    fruit = request.form["fruit"]

    # 🔥 MODEL ROUTING LOGIC
    if fruit == "guava":
        model = guava_model
        class_names = guava_classes
    elif fruit == "banana":
        return jsonify({
            "error": "Banana model is still in progress 🚧"
        }), 400
    elif fruit == "mango":
        return jsonify({
            "error": "Mango model is still in progress 🚧"
        }), 400
    else:
        return jsonify({"error": "Invalid fruit selected"}), 400

    file = request.files["file"]
    image = Image.open(io.BytesIO(file.read())).convert("RGB")

    processed = preprocess_image(image)

    predictions = model.predict(processed)
    predicted_index = np.argmax(predictions)
    confidence = float(np.max(predictions)) * 100

    disease = class_names[predicted_index]

    return jsonify({
        "disease": disease,
        "confidence": round(confidence, 2)
    })


if __name__ == "__main__":
    app.run(debug=True)
