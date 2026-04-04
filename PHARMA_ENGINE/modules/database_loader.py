import json
import os



BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, "data", "drug_database.json")

class DrugDatabase:
    def __init__(self, path):
        with open(path) as f:
            self.data = json.load(f)
        
        self.drug_set = set(self.data.keys())

    # Move this back to the same level as __init__
    def drug_exists(self, drug):
        return drug in self.data

    def is_valid_drug(self, drug):
        return drug in self.drug_set

    def get_interactions(self, drug):
        if drug in self.data:
            return self.data[drug]["interacts_with"]
        return {}