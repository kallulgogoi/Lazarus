from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel
from typing import List

from PHARMA_ENGINE.modules.risk_engine import risk_level
from PHARMA_ENGINE.modules.risk_engine import risk_level
from processing.pipeline import process_prescription
from PHARMA_ENGINE.modules.database_loader import DB_PATH, DrugDatabase
from PHARMA_ENGINE.modules.graph_engine import DrugGraph

app = FastAPI()
db = DrugDatabase(DB_PATH)
graph_engine = DrugGraph(DB_PATH)



class PrescriptionRequest(BaseModel):
    drugs: List[str]



@app.get("/")
def home():
    return {"message": "Pharma Engine API Running "}

@app.get("/all-drugs-analysis")
def analyze_all_drugs(limit: int = 10):

    
    all_drugs = list(db.get_all_drugs())

   
    selected_drugs = all_drugs[:limit]

    result = process_prescription(selected_drugs)

    return {
        "total_drugs": len(all_drugs),
        "processed_drugs": len(selected_drugs),
        "data": result
    }




@app.get("/pipeline-result")
def get_pipeline_result(drugs: List[str] = Query(...)):

    result = process_prescription(drugs)

   
    return {
        "decoded_drugs": result.get("decoded_drugs", []),
        "valid_drugs": result.get("valid_drugs", []),
        "invalid_drugs": result.get("invalid_drugs", []),
        "warnings": result.get("warnings", []),
        "conflicts": result.get("conflicts", []),
        "risk_score": result.get("risk_score", 0),
        "risk_level": result.get("risk_level", ""),
        "graph_conflicts": result.get("graph_conflicts", []),
        "network_risk_score": result.get("network_risk_score", 0),
        "network_risk_level": result.get("network_risk_level", "")
    }


@app.post("/analyze")
def analyze_prescription(request: PrescriptionRequest):
    result = process_prescription(request.drugs)
    return result



@app.get("/drug/{drug_name}")
def get_drug_info(drug_name: str):
    drug_name = drug_name.upper()

    if not db.drug_exists(drug_name):
        return {"error": "Drug not found"}

    return {
        "drug": drug_name,
        "interactions": db.get_interactions(drug_name)
    }



@app.post("/graph-insights")
def graph_insights(request: PrescriptionRequest):

    drugs = [d.upper() for d in request.drugs]

    subgraph = graph_engine.get_subgraph(drugs)

    edges = [
        {
            "drug1": u,
            "drug2": v,
            "severity": data.get("severity"),
            "reason": data.get("reason")
        }
        for u, v, data in subgraph.edges(data=True)
    ]

    return {
        "nodes": list(subgraph.nodes),
        "edges": edges,
        "network_risk_score": graph_engine.compute_intersection_severity(drugs)
    }
@app.get("/drug/{drug_name}/graph")
def get_drug_graph(drug_name: str):

    drug_name = drug_name.upper()

    if not db.drug_exists(drug_name):
        return {"error": "Drug not found"}

    
    neighbors = list(graph_engine.graph.neighbors(drug_name))

    
    nodes = [{"id": drug_name, "type": "main"}]

    for n in neighbors:
        nodes.append({"id": n, "type": "neighbor"})

   
    edges = []
    for n in neighbors:
        edge_data = graph_engine.graph.get_edge_data(drug_name, n)

        edges.append({
            "source": drug_name,
            "target": n,
            "severity": edge_data.get("severity"),
            "reason": edge_data.get("reason")
        })

  
    subgraph_nodes = [drug_name] + neighbors
    network_score = graph_engine.compute_intersection_severity(subgraph_nodes)
    network_level = risk_level(network_score)

    return {
        "nodes": nodes,
        "edges": edges,
        "network_risk_score": network_score,
        "network_risk_level": network_level
    }