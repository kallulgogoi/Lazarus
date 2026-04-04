def validate_prescription(drugs, db):
    valid = []
    invalid = []
    warnings = []
    seen = set()

    for drug in drugs:
        if not db.drug_exists(drug):
            invalid.append(drug)
            warnings.append(f"Unknown drug: {drug}")

        elif drug in seen:
            warnings.append(f"Duplicate removed: {drug}")

        else:
            valid.append(drug)
            seen.add(drug)

    return {
        "valid_drugs": valid,
        "invalid_drugs": invalid,
        "warnings": warnings
    }