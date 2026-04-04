from modules.database_loader import DrugDatabase
from modules.conflict_checker import check_conflicts

db = DrugDatabase("data/drug_database.json")

prescription = ["SILDENAFIL", "NITROGLYCERIN", "FLUOXETINE", "PHENELZINE"]

conflicts = check_conflicts(prescription, db)

print("Conflicts Found:")
for c in conflicts:
    print(c)