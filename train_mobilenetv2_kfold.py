import os
import json
import numpy as np
import tensorflow as tf
from sklearn.model_selection import KFold
from sklearn.utils.class_weight import compute_class_weight
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
from tensorflow.keras.layers import GlobalAveragePooling2D, Dense, Dropout
from tensorflow.keras.models import Model
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import ModelCheckpoint

# ================== CONFIG ==================
FRUIT_NAME = "Guava"
DATASET_DIR = r"dataset\Guava"
IMG_SIZE = 224
BATCH_SIZE = 32
EPOCHS_P1 = 10
EPOCHS_P2 = 20
NUM_FOLDS = 3
SEED = 42

np.random.seed(SEED)
tf.random.set_seed(SEED)

# ================== LOAD DATA ==================
class_names = sorted(os.listdir(DATASET_DIR))
class_to_idx = {c: i for i, c in enumerate(class_names)}

image_paths, labels = [], []

for cls in class_names:
    cls_dir = os.path.join(DATASET_DIR, cls)
    for img in os.listdir(cls_dir):
        if img.lower().endswith((".jpg", ".jpeg", ".png")):
            image_paths.append(os.path.join(cls_dir, img))
            labels.append(class_to_idx[cls])

image_paths = np.array(image_paths)
labels = np.array(labels)

with open("class_names.json", "w") as f:
    json.dump(class_names, f, indent=2)

# ================== DATA PIPELINE ==================

def load_img(path, label):
    img = tf.io.read_file(path)
    img = tf.image.decode_image(img, channels=3, expand_animations=False)
    img.set_shape([None, None, 3])
    img = tf.image.resize(img, (IMG_SIZE, IMG_SIZE))
    img = preprocess_input(img)   # 🔥 important
    return img, label


def augment_image(image, label):
    image = tf.image.random_flip_left_right(image)
    image = tf.image.random_flip_up_down(image)
    image = tf.image.random_brightness(image, max_delta=0.3)
    image = tf.image.random_contrast(image, lower=0.7, upper=1.3)
    return image, label


def make_ds(paths, labels, train=True):
    ds = tf.data.Dataset.from_tensor_slices((paths, labels))

    if train:
        ds = ds.shuffle(len(paths), seed=SEED)

    ds = ds.map(load_img, num_parallel_calls=tf.data.AUTOTUNE)

    if train:
        ds = ds.map(augment_image, num_parallel_calls=tf.data.AUTOTUNE)

    ds = ds.batch(BATCH_SIZE)
    ds = ds.prefetch(tf.data.AUTOTUNE)

    return ds


# ================== MODEL ==================

def build_model(num_classes):
    base = MobileNetV2(
        include_top=False,
        weights="imagenet",
        input_shape=(IMG_SIZE, IMG_SIZE, 3)
    )

    base.trainable = False

    x = GlobalAveragePooling2D()(base.output)
    x = Dropout(0.5)(x)
    output = Dense(num_classes, activation="softmax")(x)

    model = Model(base.input, output)
    return model, base


# ================== K-FOLD ==================

kf = KFold(n_splits=NUM_FOLDS, shuffle=True, random_state=SEED)
best_acc = 0.0

checkpoint = ModelCheckpoint(
    "best_model.keras",
    monitor="val_accuracy",
    save_best_only=True,
    verbose=1
)

for fold, (train_idx, val_idx) in enumerate(kf.split(image_paths), 1):
    print(f"\n===== {FRUIT_NAME.upper()} | FOLD {fold}/{NUM_FOLDS} =====")

    train_ds = make_ds(image_paths[train_idx], labels[train_idx], train=True)
    val_ds = make_ds(image_paths[val_idx], labels[val_idx], train=False)

    cw = compute_class_weight(
        class_weight="balanced",
        classes=np.unique(labels[train_idx]),
        y=labels[train_idx]
    )
    cw = dict(enumerate(cw))

    model, base_model = build_model(len(class_names))

    model.compile(
        optimizer=Adam(1e-3),
        loss="sparse_categorical_crossentropy",
        metrics=["accuracy"]
    )

    model.fit(train_ds, validation_data=val_ds,
              epochs=EPOCHS_P1, class_weight=cw)

    # Fine-tune last 10 layers
    base_model.trainable = True
    for layer in base_model.layers[:-10]:
        layer.trainable = False

    model.compile(
        optimizer=Adam(1e-5),
        loss="sparse_categorical_crossentropy",
        metrics=["accuracy"]
    )

    history = model.fit(train_ds,
                        validation_data=val_ds,
                        epochs=EPOCHS_P2,
                        class_weight=cw,
                        callbacks=[checkpoint])

    fold_acc = max(history.history["val_accuracy"])
    best_acc = max(best_acc, fold_acc)

print("\n🎯 TRAINING COMPLETE")
print(f"🏆 BEST VAL ACC: {best_acc:.4f}")
print("📦 Saved as best_model.keras")
