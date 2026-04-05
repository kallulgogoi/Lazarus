from fastapi import FastAPI, HTTPException, Query
import pandas as pd
from pydantic import BaseModel, Field
from typing import List, Optional
from fastapi.middleware.cors import CORSMiddleware
import os
import pickle 

class Patient(BaseModel):
    patient_id: str 
    patient_name: Optional[str] = None 
    age: int
    hr_adjusted: float 
    spo2_adjusted: float 
    status: Optional[str] = None
    hr_hex: Optional[str] = None
    hr_decoded: Optional[float] = None
    scrambled_med: Optional[str] = "Vtyvshasv" 

    class Config:
        from_attributes = True

class VitalsInput(BaseModel):
    age: int
    hr_adjusted: float
    spo2_adjusted: float

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allows your Vercel preview links to work
    allow_methods=["*"],
    allow_headers=["*"],
)


# BASE_DIR = os.path.dirname(os.path.dirname(os.path.realpath(__file__)))

# # Now it looks in the correct root Lazarus folder
# CSV_FILE = os.path.join(BASE_DIR, "trustmeicandoit_data.csv")
# RX_CSV_FILE = os.path.join(BASE_DIR, "data", "cleaned", "cleaned_prescription_audit.csv")
# GMM_MODEL_FILE = os.path.join(BASE_DIR, "gmm_model.pkl")
# SCALER_FILE = os.path.join(BASE_DIR, "scaler.pkl")

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))

CSV_FILE = os.path.join(CURRENT_DIR, "trustmeicandoit_data.csv")
GMM_MODEL_FILE = os.path.join(CURRENT_DIR, "gmm_model.pkl")
SCALER_FILE = os.path.join(CURRENT_DIR, "scaler.pkl")
RX_CSV_FILE = os.path.join(os.getcwd(), "data", "cleaned", "cleaned_prescription_audit.csv")




def get_base_patient_id(pid: str) -> str:
    parts = pid.split("_")
    if (len(parts) >= 4 and len(parts) == 3):
        return f"{parts[0]}-{parts[1]}_{parts[2]}_{parts[3]}"
    elif len(parts) >= 2: 
        return f"{parts[0]}-{parts[1]}"
    return pid

# --- LOAD DATA ---
try:
    df = pd.read_csv(CSV_FILE)
    df.columns = df.columns.str.strip() # Strip all hidden spaces

    if 'name' in df.columns:
        df = df.rename(columns={'name': 'patient_name'})
    if 'patient_name' in df.columns:
        df['patient_name'] = df['patient_name'].astype(str).str.strip()
    if 'patient_id' in df.columns:
        df['patient_id'] = df['patient_id'].astype(str).str.strip()
        df['base_patient_id'] = df['patient_id'].apply(get_base_patient_id)
        
    # =========================================================
    # 🚀 BULLETPROOF DICTIONARY MAPPING (NO PANDAS MERGE)
    # =========================================================
    try:
        rx_df = pd.read_csv(RX_CSV_FILE)
        rx_df.columns = rx_df.columns.str.strip()
        
        # 1. Build a clean dictionary from the prescription CSV
        # Result: {'G-100': 'LQVXOLQ, HZOAJMHDI', 'G-101': 'IUWFQKQTTQV, XJLUFZFIIFK', ...}
        rx_dict = {}
        for _, row in rx_df.iterrows():
            gid = str(row.get('ghost_id', '')).strip()
            med = str(row.get('scrambled_med', '')).strip()
            
            if gid and med and med.lower() != 'nan':
                if gid in rx_dict:
                    rx_dict[gid] += f", {med}"
                else:
                    rx_dict[gid] = med

        # 2. Map it directly to the dataframe by extracting "G-100" from "G-100_1_0"
        df['scrambled_med'] = df['patient_id'].apply(
            lambda pid: rx_dict.get(str(pid).split('_')[0].strip(), "Vtyvshasv")
        )
        
        print(f"✅ SUCCESS: Extracted and mapped real prescriptions for {len(rx_dict)} unique ghost IDs.")
        
    except Exception as e:
        print(f"⚠️ Critical Mapping Error: {e}")
        df['scrambled_med'] = "Vtyvshasv"
    # =========================================================

    print(f"Intelligence Layer: Loaded {len(df)} records.")
except FileNotFoundError:
    print(f"Critical Error: {CSV_FILE} not found.")
    df = pd.DataFrame(columns=["patient_id", "patient_name", "age", "hr_adjusted", "spo2_adjusted"])

# --- ML MODEL LOADING ---
try:
    with open(GMM_MODEL_FILE, 'rb') as f:
        gmm_model = pickle.load(f)
    with open(SCALER_FILE, 'rb') as f:
        scaler = pickle.load(f)
    print("✅ Project Lazarus: Scaler and GMM Loaded Successfully.")
except Exception as e:
    print(f"⚠️ ML Loading Error: {e}")
    gmm_model = None
    scaler = None

def get_processed_df(dataframe):
    if dataframe.empty: return dataframe
    temp_df = dataframe.copy()
    
    if 'base_patient_id' not in temp_df.columns:
        temp_df['base_patient_id'] = temp_df['patient_id'].apply(get_base_patient_id)

    def best_index(group):
        if len(group) == 1: return group.index[0]
        age = group.iloc[0]['age']
        if age <= 50:
            return (group['hr_adjusted'] + group['spo2_adjusted']).idxmax()
        else:
            return (group['hr_adjusted'] + group['spo2_adjusted']).idxmin()

    best_idx = temp_df.groupby('base_patient_id', group_keys=False).apply(best_index)
    temp_df['is_best'] = False
    temp_df.loc[best_idx, 'is_best'] = True
    return temp_df[temp_df['is_best']].reset_index(drop=True)

def status(row):
    if ((row['age'] <= 50 and row['hr_adjusted'] >= 100) or (row['spo2_adjusted'] < 90)):
        return "Warning"
    elif ((row['age'] > 50 and row['hr_adjusted'] < 60) or (row['spo2_adjusted'] < 90)):
        return "Critical"
    else:
        return "Stable"

# --- EXISTING ENDPOINTS ---
@app.get("/patients", response_model=List[Patient])
def get_all_patients(skip: int = 0, limit: int = 20):
    processed_df = get_processed_df(df)
    if processed_df.empty: return []
    
    processed_df['status'] = processed_df.apply(status, axis=1)
    processed_df['hr_decoded'] = processed_df['hr_adjusted']
    processed_df['hr_hex'] = processed_df['hr_adjusted'].apply(lambda x: hex(int(x)) if pd.notnull(x) else "0x0")
    
    paginated_df = processed_df.iloc[skip : skip + limit]
    return paginated_df.to_dict(orient="records")

@app.get("/patients/{patient_id}/filter", response_model=List[Patient])
def get_patient_by_id_with_filters(
    patient_id: str,
    age_min: Optional[int] = Query(None), age_max: Optional[int] = Query(None),
    hr_gt: Optional[float] = Query(None), hr_lt: Optional[float] = Query(None),
    spo2_gt: Optional[float] = Query(None), spo2_lt: Optional[float] = Query(None)
):
    processed_df = get_processed_df(df)
    processed_df['status'] = processed_df.apply(status, axis=1)
    processed_df['hr_decoded'] = processed_df['hr_adjusted']
    processed_df['hr_hex'] = processed_df['hr_adjusted'].apply(lambda x: hex(int(x)) if pd.notnull(x) else "0x0")
    
    search_id = patient_id.strip()
    base_search_id = get_base_patient_id(search_id)
    mask = (processed_df["patient_id"] == search_id) | (processed_df["base_patient_id"] == base_search_id)
    filtered = processed_df[mask].copy()

    if filtered.empty: raise HTTPException(status_code=404, detail="Patient not found.")

    if age_min is not None: filtered = filtered[filtered["age"] >= age_min]
    if age_max is not None: filtered = filtered[filtered["age"] <= age_max]
    if hr_gt is not None: filtered = filtered[filtered["hr_adjusted"] >= hr_gt]
    if hr_lt is not None: filtered = filtered[filtered["hr_adjusted"] <= hr_lt]
    if spo2_gt is not None: filtered = filtered[filtered["spo2_adjusted"] >= spo2_gt]
    if spo2_lt is not None: filtered = filtered[filtered["spo2_adjusted"] <= spo2_lt]

    return filtered.to_dict(orient="records")

@app.get("/patients/{patient_id}/heart-rate-decoded", response_model=List[Patient])
def get_patient_heart_rate_decoded(patient_id: str):
    search_id = patient_id.strip()
    base_search_id = get_base_patient_id(search_id)
    mask = (df["patient_id"] == search_id) | (df["base_patient_id"] == base_search_id)
    filtered = df[mask].copy()

    if filtered.empty: raise HTTPException(status_code=404, detail="Patient not found.")

    filtered['status'] = filtered.apply(status, axis=1) 
    filtered['hr_decoded'] = filtered['hr_adjusted']
    filtered['hr_hex'] = filtered['hr_adjusted'].apply(lambda x: hex(int(x)) if pd.notnull(x) else "0x0")

    return filtered.to_dict(orient="records")

@app.post("/predict")
def predict_vitals(data: VitalsInput):
    if gmm_model is None or scaler is None:
        raise HTTPException(status_code=500, detail="ML Pipeline is offline.")
    try:
        raw_input = pd.DataFrame([{"age": data.age, "hr_adjusted": data.hr_adjusted, "spo2_adjusted": data.spo2_adjusted}])
        scaled_features = scaler.transform(raw_input)
        prediction = gmm_model.predict(scaled_features)
        return {"prediction": str(prediction[0]), "status": "Forensic Inference Complete"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))