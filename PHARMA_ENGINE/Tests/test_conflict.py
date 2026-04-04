from PHARMA_ENGINE.modules.database_loader import DrugDatabase
from PHARMA_ENGINE.modules.conflict_checker import check_conflicts

db = DrugDatabase("PHARMA_ENGINE/data/drug_database.json")

prescription = ["SILDENAFIL", "NITROGLYCERIN", "FLUOXETINE", "PHENELZINE"]

conflicts = check_conflicts(prescription, db)

print("Conflicts Found:")
for c in conflicts:
    print(c)