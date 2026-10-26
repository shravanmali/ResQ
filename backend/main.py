"""
FastAPI Server for RESQ: AI-Assisted Decision Support & Explainable Resource Optimization.
Diploma in Computer Engineering · Major Project
Project Team: Swastik Patil (22), Shravan Mali (26), Riddhi Chalke (27), Mrunmay Raut (38)
"""
import sys
import os

# Ensure backend directory is in python search path
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
if CURRENT_DIR not in sys.path:
    sys.path.insert(0, CURRENT_DIR)

from typing import Dict, Any, List, Optional
from fastapi import FastAPI, HTTPException, Query, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from database import db, INITIAL_INCIDENTS, INITIAL_RESOURCES, INITIAL_LOGS
from priority_engine import calculate_priority_score
from ai_extractor import extract_incident_with_ai, classify_damage_vision
from allocator import run_allocation
from whatif_engine import run_whatif_simulation
from fastapi.responses import FileResponse

app = FastAPI(
    title="RESQ Operational C2 Platform",
    description="AI-Assisted Emergency Decision Support and Explainable Resource Allocation Engine",
    version="2.4.0-TACTICAL"
)

# Enable CORS for Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request Models
class EmergencyReportInput(BaseModel):
    report_text: str
    vision_preset: Optional[str] = None # e.g. "flood_water", "fire_smoke", "building_debris"

class IncidentCreateInput(BaseModel):
    title: str
    raw_text: str
    hazard_type: str
    location_name: str
    latitude: float
    longitude: float
    trapped_count: int
    injured_count: int
    urgency: str
    severity: str
    required_capabilities: List[str]
    secondary_risks: List[str]
    priority_score: int
    priority_tier: str

class DispatchApprovalInput(BaseModel):
    incident_id: str
    resource_id: str
    officer_id: str = "OFFICER-CMD-ALPHA"
    decision_notes: Optional[str] = "Officer authorized optimal recommendation."
    algorithm_used: str = "HUNGARIAN_OPTIMAL"

class DispatchOverrideInput(BaseModel):
    incident_id: str
    selected_resource_id: str
    original_recommended_id: str
    officer_id: str = "OFFICER-CMD-ALPHA"
    override_reason: str

# ----------------- SYSTEM & TELEMETRY -----------------
@app.get("/api/status")
def get_system_status():
    incidents = db.get_all_incidents()
    resources = db.get_all_resources()
    pending = [i for i in incidents if i["status"] == "PENDING_DISPATCH"]
    available_res = [r for r in resources if r["status"] == "AVAILABLE"]
    
    # Tactical DEFCON / Threat status
    if any(i.get("priority_score", 0) >= 90 for i in pending):
        alert_state = "DEFCON_1_RED"
        alert_label = "RED ALERT: Active High-Casualty Catastrophe"
    elif pending:
        alert_state = "DEFCON_2_AMBER"
        alert_label = "AMBER ALERT: Escalated Emergency Response"
    else:
        alert_state = "DEFCON_3_GREEN"
        alert_label = "GREEN: Nominal Operations Patrol"

    return {
        "system": "RESQ C2 Command Operational Grid",
        "tagline": "Every Second Matters. Every Resource Counts.",
        "project_team": [
            {"name": "Swastik Patil", "roll": 22, "role": "Lead System Architect"},
            {"name": "Shravan Mali", "roll": 26, "role": "GIS & Spatial Intelligence"},
            {"name": "Riddhi Chalke", "roll": 27, "role": "AI / NLP & Priority Engine"},
            {"name": "Mrunmay Raut", "roll": 38, "role": "Resource Optimization & XAI"}
        ],
        "alert_state": alert_state,
        "alert_label": alert_label,
        "active_incidents": len(incidents),
        "pending_dispatch": len(pending),
        "available_resources": len(available_res),
        "total_fleet": len(resources),
        "officer_on_duty": "Officer Swastik Patil (Commander)",
        "gis_active": True,
        "osrm_routing": "ACTIVE"
    }

@app.get("/api/stats")
def get_analytics():
    incidents = db.get_all_incidents()
    resources = db.get_all_resources()
    logs = db.get_audit_logs()
    
    total = len(incidents)
    resolved = len([i for i in incidents if i["status"] == "RESOLVED"])
    dispatched = len([i for i in incidents if i["status"] == "DISPATCHED"])
    pending = len([i for i in incidents if i["status"] == "PENDING_DISPATCH"])
    
    # Priority distribution
    p1 = len([i for i in incidents if i.get("priority_tier") == "P1_CRITICAL"])
    p2 = len([i for i in incidents if i.get("priority_tier") == "P2_HIGH"])
    p3 = len([i for i in incidents if i.get("priority_tier") == "P3_MEDIUM"])
    p4 = len([i for i in incidents if i.get("priority_tier") == "P4_LOW"])

    # Resource breakdown
    res_avail = len([r for r in resources if r["status"] == "AVAILABLE"])
    res_deployed = len([r for r in resources if r["status"] in ["DISPATCHED", "EN_ROUTE", "ON_SCENE"]])
    fleet_readiness = round((res_avail / max(1, len(resources))) * 100, 1)

    return {
        "overview": {
            "total_incidents": total,
            "dispatched": dispatched,
            "pending": pending,
            "resolved": resolved,
            "fleet_readiness_pct": fleet_readiness
        },
        "priority_breakdown": {
            "p1_critical": p1,
            "p2_high": p2,
            "p3_medium": p3,
            "p4_low": p4
        },
        "fleet_status": {
            "available": res_avail,
            "deployed": res_deployed,
            "maintenance": len(resources) - res_avail - res_deployed
        },
        "total_audit_decisions": len(logs)
    }

# ----------------- INCIDENTS & AI / NLP -----------------
@app.get("/api/incidents")
def list_incidents():
    return db.get_all_incidents()

@app.post("/api/incidents/ai-extract")
def ai_extract_incident(payload: EmergencyReportInput):
    """
    Ingests natural language incident reports (Slide 4) and extracts
    structured schema, coordinates, vision classification, and deterministic priority score.
    """
    extracted = extract_incident_with_ai(payload.report_text)
    
    # Vision classification if provided
    vision_data = None
    if payload.vision_preset:
        vision_data = classify_damage_vision(payload.vision_preset)
        # Augment capabilities if vision spotted specific demands
        if vision_data:
            extracted["required_capabilities"] = list(set(
                extracted.get("required_capabilities", []) + vision_data.get("recommended_capability", [])
            ))

    # Calculate deterministic priority score
    priority_result = calculate_priority_score(
        urgency=extracted.get("urgency", "HIGH"),
        severity=extracted.get("severity", "SEVERE"),
        trapped_count=extracted.get("trapped_count", 0),
        injured_count=extracted.get("injured_count", 0),
        hazard_type=extracted.get("hazard_type", "OTHER"),
        secondary_risks=extracted.get("secondary_risks", [])
    )

    return {
        "raw_text": payload.report_text,
        "extracted": extracted,
        "vision_classification": vision_data,
        "priority": priority_result
    }

@app.post("/api/incidents")
def create_incident(payload: IncidentCreateInput):
    inc_data = payload.dict()
    inc_data["status"] = "PENDING_DISPATCH"
    created = db.add_incident(inc_data)
    return created

# ----------------- RESOURCES & FLEET -----------------
@app.get("/api/resources")
def list_resources():
    return db.get_all_resources()

@app.post("/api/resources/{resource_id}/status")
def set_resource_status(resource_id: str, status: str = Query(...)):
    updated = db.update_resource_status(resource_id, status)
    if not updated:
        raise HTTPException(status_code=404, detail="Resource not found")
    db.add_audit_log(
        officer_id="COMMANDER_MANUAL",
        action="RESOURCE_STATUS_OVERRIDE",
        incident_id="FLEET_OPS",
        details=f"Unit {resource_id} manually shifted to status '{status}'.",
        algorithm="MANUAL"
    )
    return updated

# ----------------- ALLOCATION & EXPLAINABLE AI -----------------
@app.get("/api/allocation")
def get_allocation_plan(algorithm: str = Query("HUNGARIAN", pattern="^(HUNGARIAN|GREEDY)$")):
    """
    Computes intelligent allocation matching using either Hungarian optimization
    or Greedy local-optimum matching, returning detailed explainable reasoning (Slide 6).
    """
    incidents = db.get_all_incidents()
    resources = db.get_all_resources()
    result = run_allocation(incidents, resources, algorithm=algorithm, road_blockages=db.road_blockages)
    return result

# ----------------- HUMAN APPROVAL DISPATCH GATE -----------------
@app.post("/api/dispatch/approve")
def approve_dispatch(payload: DispatchApprovalInput):
    """
    Slide 3 & 6: 'RESQ recommends. Human officers decide.'
    Human approval gate for dispatch authorization.
    """
    inc = db.get_incident(payload.incident_id)
    res = db.get_resource(payload.resource_id)
    if not inc or not res:
        raise HTTPException(status_code=404, detail="Incident or Resource not found")

    # Update state
    db.update_incident(payload.incident_id, {
        "status": "DISPATCHED",
        "assigned_resources": list(set(inc.get("assigned_resources", []) + [res["id"]]))
    })
    db.update_resource_status(payload.resource_id, "DISPATCHED", payload.incident_id)

    # Record tamper-evident audit log
    audit_entry = db.add_audit_log(
        officer_id=payload.officer_id,
        action="DISPATCH_AUTHORIZED",
        incident_id=payload.incident_id,
        details=f"Approved dispatch of {res['name']} ({res['type']}) to {inc['title']}. Notes: {payload.decision_notes}",
        algorithm=payload.algorithm_used,
        status="APPROVED"
    )

    return {
        "status": "SUCCESS",
        "message": f"Dispatch approved for {res['name']}.",
        "audit_entry": audit_entry,
        "incident": db.get_incident(payload.incident_id),
        "resource": db.get_resource(payload.resource_id)
    }

@app.post("/api/dispatch/override")
def override_dispatch(payload: DispatchOverrideInput):
    """
    Allows the human officer to override AI recommendation and assign a different resource.
    """
    inc = db.get_incident(payload.incident_id)
    new_res = db.get_resource(payload.selected_resource_id)
    old_res = db.get_resource(payload.original_recommended_id)
    if not inc or not new_res:
        raise HTTPException(status_code=404, detail="Incident or Resource not found")

    db.update_incident(payload.incident_id, {
        "status": "DISPATCHED",
        "assigned_resources": [new_res["id"]]
    })
    db.update_resource_status(new_res["id"], "DISPATCHED", payload.incident_id)

    audit_entry = db.add_audit_log(
        officer_id=payload.officer_id,
        action="OFFICER_DISPATCH_OVERRIDE",
        incident_id=payload.incident_id,
        details=(
            f"Officer overrode AI recommendation. Swapped from {old_res['name'] if old_res else 'N/A'} "
            f"to {new_res['name']}. Justification: {payload.override_reason}"
        ),
        algorithm="HUMAN_OVERRIDE",
        status="OVERRIDDEN"
    )

    return {
        "status": "SUCCESS",
        "message": f"Manual override executed: {new_res['name']} dispatched.",
        "audit_entry": audit_entry
    }

# ----------------- WHAT-IF SIMULATION SANDBOX -----------------
@app.get("/api/whatif")
def whatif_simulation(
    scenario_type: str = Query("ROAD_BLOCKAGE", pattern="^(ROAD_BLOCKAGE|DEMAND_SURGE|RESOURCE_DEPLETION|PRIORITY_ESCALATION)$"),
    algorithm: str = Query("HUNGARIAN", pattern="^(HUNGARIAN|GREEDY)$")
):
    """
    Slide 6: What-If simulation sandbox:
    Select scenario -> modify -> recalculate -> compare -> human approval.
    """
    incidents = db.get_all_incidents()
    resources = db.get_all_resources()
    result = run_whatif_simulation(incidents, resources, scenario_type=scenario_type, algorithm=algorithm)
    
    # Log simulation execution in audit trail
    db.add_audit_log(
        officer_id="SIMULATION_SANDBOX",
        action="WHATIF_SCENARIO_EVALUATION",
        incident_id="SANDBOX",
        details=f"Evaluated What-If scenario '{scenario_type}' with algorithm '{algorithm}'. Delta ETA: {result['delta']['eta_delta_minutes']}m.",
        algorithm=algorithm,
        status="SIMULATED"
    )
    return result

# ----------------- AUDIT LOGS & RESET -----------------
@app.get("/api/audit-logs")
def get_audit_trail(limit: int = 50):
    return db.get_audit_logs(limit=limit)

@app.post("/api/reset-demo")
def reset_demo_state():
    db.__init__()
    return {"status": "SUCCESS", "message": "Demo database restored to default scenario state."}

# Mount static frontend production build
frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "dist"))
if os.path.exists(frontend_dist):
    assets_dir = os.path.join(frontend_dist, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    def serve_frontend(full_path: str):
        if full_path.startswith("api"):
            raise HTTPException(status_code=404, detail="Not Found")
        file_path = os.path.join(frontend_dist, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(frontend_dist, "index.html"))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
