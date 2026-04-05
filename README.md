# 🧬 Project Lazarus: Forensic Healthcare Data Reconstruction
### **Restoring Integrity to Corrupted Patient Records through ML & Graph Analytics**

> **“Bringing corrupted healthcare data back to life.”**

---

## 🚀 Executive Summary
**Project Lazarus** is a high-performance healthcare forensics platform designed to solve the critical problem of data degradation in ICU and clinical environments. It acts as an **Intelligence Layer** between noisy, corrupted raw data and the medical professional.

By leveraging **Gaussian Mixture Models (GMM)** for identity resolution and **Directed Graph Interaction Networks** for pharmacological safety, Lazarus ensures that every patient record is accurate, decrypted, and safe before it reaches the clinician’s eyes.

---

## 🏗️ Technical Architecture & Workflow
The system follows a strict **Modular Data Pipeline** to ensure low-latency processing without a traditional database, making it incredibly lightweight and portable.

1.  **Data Ingestion:** Loads raw, "ghost" datasets (CSV) containing overlapping IDs and scrambled telemetry.
2.  **Identity Resolution:** ML-based clustering (GMM) to separate merged patient profiles.
3.  **Conflict Engine:** Graph-theory based analysis (NetworkX) of pharmaceutical risks.
4.  **Frontend Dashboard:** A modern, reactive UI for real-time ICU-style monitoring.

---

## 🧠 Part 1: Identity & Vitals Reconstruction

### **1. Identity Resolution & GMM Clustering**
* **The Problem:** Patients often have duplicate or "Ghost IDs" (e.g., G-100_1 and G-100_2) that represent the same person but contain conflicting data.
* **The Solution:** We utilized **Gaussian Mixture Models (GMM)** via `scikit-learn` to cluster data points. This allows the system to identify the "most probable" record for a single identity, effectively "de-duplicating" the ICU logs.

### **2. The "Lazarus" Vital Sign Algorithm**
* **Physiological Thresholding:** Implemented a custom algorithm to identify true vitals based on a **50-year age threshold**.
* **The Logic:** $Vital_{Score} = (HR \text{ or } SpO_2) + (50 - Age \times Weight)$
* **Amended Vitals:** For patients **> 50 years**, the system adjusts its "Critical" triggers to account for lower baseline heart rates, preventing false-positive alarms and ensuring clinical accuracy.

---

## 💊 Part 2: Advanced Pharmaceutical Graph Forensics

### **1. Graph-Based Conflict Detection (NetworkX)**
Lazarus treats the patient's prescription history as an evolving mathematical network to find "Hidden Conflicts."
* **Node-Edge Topology:** Every medication is a **Node**. A bidirectional **Edge** is created between nodes if a known interaction exists.
* **Sub-graph Extraction:** When a new drug is added, the engine performs a **Depth-First Search (DFS)**. It identifies all "Neighboring Conflicts" within the patient's current drug cluster.
* **Visual Risk Mapping:** Conflicted drugs are highlighted in the UI with **dynamic pulses** and thick, color-coded edges representing interaction severity (Lethal vs. Moderate).

### **2. Intelligent "Safe Swap" Recommendations**
When a conflict is detected, the engine provides a forensic alternative using **Therapeutic Class Filtering**.
* **The "Zero-Edge" Search:** The system scans the global drug database for medications in the **same therapeutic class** that have **zero edges** (no interactions) with the patient's existing medication cluster.
* **Optimization:** Recommendations are ranked by "Network Compatibility"—choosing the drug that is most chemically isolated from the patient's current profile.

---

## 🎨 Part 3: The Lazarus UI (Forensic Dashboard)
The frontend is a medical-grade dashboard built with **React JS**, **Tailwind CSS**, and **Shadcn UI**, designed for real-time decision-making.

### **🔹 User Interface Flow & Modules**

1.  **Identity Search & Resolution Bar:**
    * **Logic:** A global search component that allows clinicians to search by corrupted ID or Name. It uses the GMM backend to unify "Ghost IDs" into a single, clean patient card instantly.
    
2.  **Live ICU Telemetry (Recharts):**
    * **Visuals:** Real-time line graphs visualizing $SpO_2$ and Heart Rate. 
    * **Forensic Repair:** The graph shows the *amended* data points, highlighting where the system filled in corrupted gaps using interpolation.
    
3.  **The Pharmacy Decryption Portal:**
    * **Before/After View:** A side-by-side comparison. The **Left Column** shows the raw, scrambled pharmaceutical string (Caesar Cipher). The **Right Column** shows the restored, readable drug name (e.g., "Vtyvshasv" → "Warfarin").
    
4.  **Interactive Conflict Graph Visualization:**
    * **Graph UI:** A force-directed graph (via SVG/Canvas) showing the patient’s drugs as a cluster. 
    * **Interaction:** Clicking a "Red Edge" (Conflict) opens a detailed modal explaining the biochemical reason for the interaction and the specific risk score.
    
5.  **AI Smart-Swap Recommendations:**
    * **Actionable UI:** A clean card-based list of alternatives. Each card includes a "Why this is safer" badge and a 1-click option to update the prescription.
    
6.  **Global Triage Status:**
    * **Alert System:** A color-coded header that shifts between **Stable (Green)**, **Warning (Yellow)**, and **Critical (Red)** based on the real-time processing of the $Vital_{Score}$ and Graph Risk.

---

## 🛠️ Tech Stack & Deployment

| Layer | Technology |
| :--- | :--- |
| **Backend** | FastAPI, Pydantic, Python |
| **ML Engine** | Scikit-Learn (GMM), Pandas |
| **Graph Logic** | NetworkX |
| **Frontend** | React JS, Tailwind CSS, Shadcn UI |
| **Charts** | Recharts |
| **Deployment** | **Vercel** (Frontend) & **Render** (Backend) |

---

## ⚙️ Setup & Installation

### **Backend Deployment (Render)**
Deploy two separate **Web Services** on Render pointing to the same repository:

#### **1. Patient Vitals API**
* **Root Directory:** `./`
* **Start Command:** `uvicorn api.index:app --host 0.0.0.0 --port $PORT`

#### **2. Pharma Conflict Engine**
* **Root Directory:** `./`
* **Start Command:** `uvicorn PHARMA_ENGINE.API.indexnew:app --host 0.0.0.0 --port $PORT`

### **Frontend Deployment (Vercel)**
1. Import the `frontend` folder into Vercel.
2. Set **Framework Preset** to `Vite`.
3. Update `API_BASE_URL` and `PHARMA_API_URL` in your `App.jsx` with the Render links.

---

## 🧬 Tagline
> **“Healthcare forensics for the modern age: bringing clarity to clinical chaos.”**

---
**Team Hackers_Lazarus** 
