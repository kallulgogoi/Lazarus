# 🧬 Project Lazarus  
### *Reconstructing Corrupted Patient Data in Real-Time*

---

## 🚀 Overview

Project Lazarus is an intelligent system designed to **rebuild corrupted patient records in real-time**.  
It combines **Machine Learning, FastAPI, React, and WebSockets** to transform noisy healthcare data into **clean, reliable, and actionable insights**.

---

## 🧩 Problem Statement

Healthcare datasets often suffer from:

- Duplicate or overlapping patient IDs  
- Missing or corrupted data  
- Encrypted medication records  
- Unreadable telemetry logs  

👉 This creates a need for **accurate reconstruction and real-time monitoring**.

---

## 🏗️ Architecture

```
Data Ingestion → Intelligence Layer → API Layer → Frontend
```

### 🔹 Data Ingestion
- Load raw datasets (CSV files)

### 🔹 Intelligence Layer
- ML-based reconstruction pipeline  
- Data cleaning and transformation  

### 🔹 API Layer
- FastAPI endpoints  
- WebSockets for real-time communication  

### 🔹 Frontend
- React-based dashboard  
- Interactive and responsive UI  

---

## 🧠 Core Features

- **Identity Resolution**  
  Fix duplicate patient IDs using modular logic  

- **Telemetry Conversion**  
  Convert hexadecimal data into human-readable vitals  

- **Data Repair Engine**  
  Fill missing values using interpolation  

- **Decryption Engine**  
  Decode medications using an age-based cipher  

---

## 📊 Frontend Highlights

- 🔍 Search patients by ID or name  
- 📈 Real-time vitals monitoring (BPM, SpO₂)  
- 💊 Compare raw vs decrypted medications  
- 🚨 Automatic alerts for abnormal vitals  

---

## ⚙️ Tech Stack

| Layer        | Technology               |
|-------------|--------------------------|
| Backend      | FastAPI                  |
| Frontend     | React + Tailwind CSS     |
| Charts       | Recharts                 |
| Realtime     | WebSockets               |
| Data Source  | CSV (No Database)        |

---

## 🔥 Why It Stands Out

- ⚡ No database → Lightweight and fast  
- 🧠 ML-driven data reconstruction  
- 📡 Real-time ICU-style monitoring dashboard  

---

## 🛠️ Setup & Installation

```bash
# Clone the repository
git clone <your-repo-link>

# Backend setup
cd backend
pip install -r requirements.txt
uvicorn main:app --reload

# Frontend setup
cd frontend
npm install
npm start
```

---

## 🎯 Use Cases

- 🏥 Hospital data recovery  
- 📊 Medical analytics  
- 📡 Real-time patient monitoring  
- 🕵️ Healthcare forensics  

---

## 💡 Future Scope

- Add database support (PostgreSQL / MongoDB)  
- Integrate advanced ML models  
- Connect with IoT medical devices  

---

## 🧬 Tagline

> **“Bringing corrupted healthcare data back to life.”**
