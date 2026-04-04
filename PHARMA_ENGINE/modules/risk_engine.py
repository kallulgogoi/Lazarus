severity_score = {
    "low": 1,
    "medium": 2,
    "high": 3,
    "lethal": 5
}

def calculate_risk(conflicts):
    score = 0
    for c in conflicts:
        score += severity_score.get(c["severity"], 0)
    return score


def risk_level(score):
    if score >= 6:
        return "HIGH RISK"
    elif score >= 3:
        return "MODERATE"
    else:
        return "LOW"