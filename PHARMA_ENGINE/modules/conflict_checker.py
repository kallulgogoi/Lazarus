from itertools import combinations

def check_conflicts(drugs, database):
    conflicts = []

    for d1, d2 in combinations(drugs, 2):
        interactions = database.get_interactions(d1)

        if d2 in interactions:
            info = interactions[d2]
            conflicts.append({
                "drug1": d1,
                "drug2": d2,
                "severity": info["severity"],
                "reason": info["reason"]
            })

    return conflicts