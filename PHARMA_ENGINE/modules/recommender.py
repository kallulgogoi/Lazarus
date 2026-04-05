def generate_safe_swaps(conflicts):
    swaps = []
    processed = set()
    
    swap_logic = {
        "ASPIRIN": {
            "alt": "PARACETAMOL", 
            "reason": "Provides analgesia without severe hypoglycemic or bleeding risks."
        },
        "IBUPROFEN": {
            "alt": "PARACETAMOL", 
            "reason": "Eliminates renal load and avoids lactic acidosis risk."
        },
        "AMOXICILLIN": {
            "alt": "AZITHROMYCIN", 
            "reason": "Alternative antibiotic class to bypass current renal clearance conflicts."
        },
        "METFORMIN": {
            "alt": "GLIPIZIDE", 
            "reason": "Alternative antidiabetic to avoid compounding lactic acidosis risk."
        },
        "INSULIN": {
            "alt": "DOSE REDUCTION", 
            "reason": "Cannot safely swap Insulin. Recommend strict 50% dose reduction."
        },
        "WARFARIN": {
            "alt": "APIXABAN", 
            "reason": "DOACs possess fewer severe drug-drug interactions than Warfarin."
        }
    }
    
    for c in conflicts:
        d1, d2 = c["drug1"], c["drug2"]
        
        # Try to find a safe swap for drug 1
        if d1 in swap_logic and d1 not in processed:
            swaps.append({
                "original": d1, 
                "alternative": swap_logic[d1]["alt"], 
                "reason": swap_logic[d1]["reason"]
            })
            processed.add(d1)
            
        # Try to find a safe swap for drug 2
        elif d2 in swap_logic and d2 not in processed:
            swaps.append({
                "original": d2, 
                "alternative": swap_logic[d2]["alt"], 
                "reason": swap_logic[d2]["reason"]
            })
            processed.add(d2)
            
    return swaps