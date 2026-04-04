import networkx as nx
import json

class DrugGraph:
    def __init__(self, path):
        self.graph = nx.Graph()
        self.load_graph(path)

    def load_graph(self, path):
        with open(path) as f:
            data = json.load(f)

        for drug, details in data.items():
            for other, info in details["interacts_with"].items():

                self.graph.add_edge(
                    drug,
                    other,
                    severity=info["severity"],
                    reason=info["reason"]
                )

    def get_subgraph(self, drugs):
        return self.graph.subgraph(drugs)

    def get_conflicts(self, drugs):
        subgraph = self.get_subgraph(drugs)

        conflicts = []

        for u, v, data in subgraph.edges(data=True):
            conflicts.append({
                "drug1": u,
                "drug2": v,
                "severity": data.get("severity"),
                "reason": data.get("reason")
            })

        return conflicts

    def compute_intersection_severity(self, drugs):
        subgraph = self.get_subgraph(drugs)

        severity_score = {
            "low": 1,
            "medium": 2,
            "high": 3,
            "lethal": 5
        }

        total = 0

        for _, _, data in subgraph.edges(data=True):
            severity = data.get("severity")
            total += severity_score.get(severity, 0)

        return total