
import json

from PHARMA_ENGINE.modules.database_loader import DB_PATH



class DrugDatabase:
    # Set path=DB_PATH so it uses your calculated absolute path by default
    def __init__(self, path=DB_PATH): 
        with open(path) as f:
            self.data = json.load(f)
        
        self.drug_set = set(self.data.keys())