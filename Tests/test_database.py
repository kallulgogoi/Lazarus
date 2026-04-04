from modules.database_loader import DrugDatabase

db = DrugDatabase("data/drug_database.json")

print("All Drugs:", db.drug_set)

print("Is ASPIRIN valid?", db.is_valid_drug("ASPIRIN"))

print("ASPIRIN Interactions:")
print(db.get_interactions("ASPIRIN"))