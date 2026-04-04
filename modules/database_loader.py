import json

class DrugDatabase:
    def __init__(self, path):
        with open(path) as f:
            self.data = json.load(f)

        # Create fast lookup set
        self.drug_set = set(self.data.keys())

    def is_valid_drug(self, drug):
        return drug in self.drug_set

    def get_interactions(self, drug):
        if drug in self.data:
            return self.data[drug]["interacts_with"]
        return {}