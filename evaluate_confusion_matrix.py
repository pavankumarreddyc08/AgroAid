import json
import numpy as np
import tensorflow as tf
import matplotlib.pyplot as plt
from sklearn.metrics import confusion_matrix, classification_report
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input

# ---------------- CONFIG ----------------
MODEL_PATH = "Apple2model.keras"
DATASET_DIR = "dataset/Guava"
IMG_SIZE = 224
BATCH_SIZE = 32

# ---------------- LOAD MODEL & CLASSES ----------------
model = tf.keras.models.load_model(MODEL_PATH)

with open("class_names.json") as f:
    class_names = json.load(f)

num_classes = len(class_names)

# ---------------- LOAD VALIDATION DATA ----------------
val_ds = tf.keras.utils.image_dataset_from_directory(
    DATASET_DIR,
    image_size=(IMG_SIZE, IMG_SIZE),
    batch_size=BATCH_SIZE,
    shuffle=False
)

val_ds = val_ds.map(lambda x, y: (preprocess_input(x), y))

# ---------------- GET PREDICTIONS ----------------
y_true = []
y_pred = []

for images, labels in val_ds:
    preds = model.predict(images)
    y_true.extend(labels.numpy())
    y_pred.extend(np.argmax(preds, axis=1))

y_true = np.array(y_true)
y_pred = np.array(y_pred)

# ---------------- CONFUSION MATRIX ----------------
cm = confusion_matrix(y_true, y_pred)

# ---------------- PLOT CONFUSION MATRIX ----------------
plt.figure(figsize=(8, 6))
plt.imshow(cm, cmap="Blues")
plt.title("Confusion Matrix")
plt.colorbar()

plt.xticks(range(num_classes), class_names, rotation=45)
plt.yticks(range(num_classes), class_names)

for i in range(num_classes):
    for j in range(num_classes):
        plt.text(j, i, cm[i, j], ha="center", va="center", color="black")

plt.xlabel("Predicted Label")
plt.ylabel("True Label")
plt.tight_layout()
plt.show()

# ---------------- CLASSIFICATION REPORT ----------------
print("\nClassification Report:\n")
print(classification_report(y_true, y_pred, target_names=class_names))
