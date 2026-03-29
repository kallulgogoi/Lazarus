from fastapi import FastAPI, HTTPException, Query
import pandas as pd
from pydantic import BaseModel, Field
from typing import List, Optional
from fastapi.middleware.cors import CORSMiddleware

# Updated Model to match CSV headers directly
class Patient(BaseModel):
    patient_id: str 
    patient_name: Optional[str] = None 
    age: int
    hr_adjusted: float 
    spo2_adjusted: float 
    status: Optional[str] = None
    
    hr_hex: Optional[str] = None
    hr_decoded: Optional[float] = None

    class Config:
        from_attributes = True

app = FastAPI()

#cors
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

CSV_FILE = "trustmeicandoit_data.csv"

try:
    df = pd.read_csv(CSV_FILE)
    df.columns = df.columns.str.strip() 

    # Data Ingestion: Standardizing column names [cite: 4]
    if 'name' in df.columns:
        df = df.rename(columns={'name': 'patient_name'})
    
    if 'patient_name' in df.columns:
        df['patient_name'] = df['patient_name'].astype(str).str.strip()

    if 'patient_id' in df.columns:
        df['patient_id'] = df['patient_id'].astype(str).str.strip()
        
    print(f"Intelligence Layer: Loaded {len(df)} records from {CSV_FILE}")
except FileNotFoundError:
    print(f"Critical Error: {CSV_FILE} not found.")
    df = pd.DataFrame(columns=["patient_id", "patient_name", "age", "hr_adjusted", "spo2_adjusted"])

# Identity Resolution: Fixing the logical error [cite: 7]
def get_base_patient_id(pid: str) -> str:
    parts = pid.split("_")
    
  
    if (len(parts) >= 4 and len(parts) == 3):
        return f"{parts[0]}-{parts[1]}_{parts[2]}_{parts[3]}"
    
    elif len(parts) >= 2: 
        return f"{parts[0]}-{parts[1]}"
    return pid

def get_processed_df(dataframe):
    if dataframe.empty: return dataframe
    temp_df = dataframe.copy()
    temp_df['base_patient_id'] = temp_df['patient_id'].apply(get_base_patient_id)

    # Statistical Modeling: Resolving overlapping identities [cite: 11]
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
    # Filter to only show the "reconstructed" best match [cite: 2]
    return temp_df[temp_df['is_best']].reset_index(drop=True)

# Triage Alert Logic: Identifying anomalies [cite: 6, 22]
def status(row):
    # Warning Thresholds [cite: 14]
    if ((row['age'] <= 50 and row['hr_adjusted'] >= 100) or (row['spo2_adjusted'] < 90)):
        return "Warning"
    # Critical Thresholds [cite: 22]
    elif ((row['age'] > 50 and row['hr_adjusted'] < 60) or (row['spo2_adjusted'] < 90)):
        return "Critical"
    else:
        return "Stable"

@app.get("/")
def read_root():
    return {"status": "Online", "system": "Project Lazarus Forensic Engine"}

@app.get("/patients", response_model=List[Patient])
def get_all_patients(
    skip: int = 0, 
    limit: int = 20 
):
    processed_df = get_processed_df(df)
    if processed_df.empty:
        return []
    
    processed_df['status'] = processed_df.apply(status, axis=1)
    
    # Slice the dataframe for pagination
    paginated_df = processed_df.iloc[skip : skip + limit]
    return paginated_df.to_dict(orient="records")

@app.get("/patients/{patient_id}/filter", response_model=List[Patient])
def get_patient_by_id_with_filters(
    patient_id: str,
    age_min: Optional[int] = Query(None),
    age_max: Optional[int] = Query(None),
    hr_gt: Optional[float] = Query(None),
    hr_lt: Optional[float] = Query(None),
    spo2_gt: Optional[float] = Query(None),
    spo2_lt: Optional[float] = Query(None)
):
    processed_df = get_processed_df(df)
    processed_df['status'] = processed_df.apply(status, axis=1)
    
    search_id = patient_id.strip()
    base_search_id = get_base_patient_id(search_id)

    mask = (processed_df["patient_id"] == search_id) | (processed_df["base_patient_id"] == base_search_id)
    filtered = processed_df[mask].copy()

    if filtered.empty:
        raise HTTPException(status_code=404, detail=f"Patient {search_id} not found.")

    # Apply Statistical Threshold Filtering [cite: 6]
    if age_min is not None: filtered = filtered[filtered["age"] >= age_min]
    if age_max is not None: filtered = filtered[filtered["age"] <= age_max]
    if hr_gt is not None: filtered = filtered[filtered["hr_adjusted"] >= hr_gt]
    if hr_lt is not None: filtered = filtered[filtered["hr_adjusted"] <= hr_lt]
    if spo2_gt is not None: filtered = filtered[filtered["spo2_adjusted"] >= spo2_gt]
    if spo2_lt is not None: filtered = filtered[filtered["spo2_adjusted"] <= spo2_lt]

    if filtered.empty:
        raise HTTPException(status_code=404, detail="No records match these filters.")

    return filtered.to_dict(orient="records")



@app.get("/patients/{patient_id}/heart-rate-decoded", response_model=List[Patient])
def get_patient_heart_rate_decoded(patient_id: str):
    search_id = patient_id.strip()
    base_search_id = get_base_patient_id(search_id)

    mask = (df["patient_id"] == search_id) | (df["patient_id"].apply(get_base_patient_id) == base_search_id)
    filtered = df[mask].copy()

    if filtered.empty:
        raise HTTPException(status_code=404, detail=f"Patient {search_id} not found.")


    filtered['status'] = filtered.apply(status, axis=1) 
    
    filtered['hr_decoded'] = filtered['hr_adjusted']
    filtered['hr_hex'] = filtered['hr_adjusted'].apply(lambda x: hex(int(x)) if pd.notnull(x) else "0x0")

    return filtered.to_dict(orient="records")