🌿 AgroAid
AI-Powered Plant Disease Detection System
AgroAid is a deep learning-based web application that detects plant diseases from leaf images using a trained CNN model. The system helps farmers and agricultural researchers quickly identify diseases and take preventive measures.

🚀 Features
🌱 Leaf Disease Detection using Deep Learning

🧠 CNN Model (MobileNetV2-based architecture)

📊 Confusion Matrix Evaluation

🌐 Web-based Interface (Frontend + Backend)

📁 Clean Project Structure

⚡ Fast Prediction API

📈 K-Fold Cross Validation Results

🧠 Tech Stack
🔹 Machine Learning
Python

TensorFlow / Keras

MobileNetV2

NumPy

Scikit-learn

🔹 Backend
Flask

🔹 Frontend
HTML

CSS

JavaScript

📂 Project Structure
AgroAid/
│
├── backend/
│   ├── model/
│   └── app.py
│
├── frontend/
│
├── train_mobilenetv2_kfold.py
├── evaluate_confusion_matrix.py
├── class_names.json
├── .gitignore
└── README.md
🧪 Model Details
Architecture: MobileNetV2 (Transfer Learning)

Input Size: 224x224

Training Strategy: K-Fold Cross Validation

Output: Disease Class Prediction

Loss Function: Categorical Crossentropy

Optimizer: Adam

📊 Dataset
The dataset contains leaf images categorized into different disease classes.

⚠️ Note:
Dataset is not included in this repository due to size limitations.

⚙️ How to Run the Project
1️⃣ Clone the repository
git clone https://github.com/yourusername/AgroAid.git
cd AgroAid
2️⃣ Create virtual environment
python -m venv venv
venv\Scripts\activate   # Windows
3️⃣ Install dependencies
pip install -r requirements.txt
4️⃣ Run backend server
python backend/app.py
5️⃣ Open in browser
http://127.0.0.1:5000/
📈 Future Improvements
🌍 Multi-crop support

📱 Mobile application integration

☁️ Cloud deployment (AWS / Render)

📦 Model optimization for edge devices

🌐 Multilingual support for farmers

🎯 Project Goal
The goal of AgroAid is to bridge the gap between AI technology and agriculture by providing a simple, fast, and accessible disease detection system for farmers.

👨‍💻 Author
Pavan Kumar Reddy
B.Tech Computer Science
Aspiring Full Stack + AI Developer

⭐ If you like this project
Give it a star ⭐ on GitHub!
