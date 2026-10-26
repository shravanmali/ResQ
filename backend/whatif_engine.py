"""
What-If Scenario Simulation Sandbox for RESQ.
Allows Disaster Control Room officers to simulate stressful real-world disruptions:
1. Road Blockage / Bridge Collapse (Detours & Surging ETA)
2. Demand Surge (Spike in concurrent severe incidents)
3. Resource Depletion (50% Fleet grounded or out of fuel)
4. Priority Escalation (Re-evaluating life threats under cascading failures)
Provides side-by-side comparison between Baseline and Simulated responses.
"""
from typing import Dict, List, Any
import copy
from allocator import run_allocation

def run_whatif_simulation(
    base_incidents: List[Dict[str, Any]],
    base_resources: List[Dict[str, Any]],
    scenario_type: str, # "ROAD_BLOCKAGE", "DEMAND_SURGE", "RESOURCE_DEPLETION", "PRIORITY_ESCALATION"
    algorithm: str = "HUNGARIAN"
) -> Dict[str, Any]:
    # Deep copy state for sandbox isolation
    sim_incidents = copy.deepcopy(base_incidents)
    sim_resources = copy.deepcopy(base_resources)
    sim_blockages = []
    scenario_description = ""
    scenario_impact_highlights = []

    if scenario_type == "ROAD_BLOCKAGE":
        scenario_description = "Major arterial flyovers submerged / blocked. Direct access routes cut off."
        # Inject major road blockage near central corridors
        sim_blockages = [
            {"id": "BLK-SIM-01", "name": "Eastern Express Arterial Inundation", "lat": 19.0500, "lng": 72.8800, "radius_m": 800},
            {"id": "BLK-SIM-02", "name": "Vashi Creek Bridge Structural Quarantine", "lat": 19.0771, "lng": 72.9986, "radius_m": 600}
        ]
        scenario_impact_highlights = [
            "Vehicles re-routed around Eastern Corridor (+12-24 mins detour)",
            "Vashi connection severed - offshore and marine units prioritized"
        ]

    elif scenario_type == "DEMAND_SURGE":
        scenario_description = "Cascading secondary disaster: Cyclone landfall triggers 2 new concurrent P1 disasters."
        new_inc1 = {
            "id": "INC-SURGE-01",
            "title": "Hospital Oxygen Plant Power & Structural Breach",
            "raw_text": "Hospital basement flooded. Backup generators submerged. 40 ICU patients at extreme risk.",
            "hazard_type": "FLOOD",
            "location_name": "Bandra Western Suburb Hospital",
            "latitude": 19.0620,
            "longitude": 72.8350,
            "trapped_count": 14,
            "injured_count": 8,
            "urgency": "CRITICAL",
            "severity": "EXTREME",
            "required_capabilities": ["RESCUE_BOAT", "AMBULANCE", "POLICE_ESCORT"],
            "secondary_risks": ["OXYGEN_FAILURE", "ICU_COLLAPSE"],
            "status": "PENDING_DISPATCH",
            "priority_score": 98,
            "priority_tier": "P1_CRITICAL",
            "assigned_resources": []
        }
        new_inc2 = {
            "id": "INC-SURGE-02",
            "title": "LPG Bottling Depot Flash Fire",
            "raw_text": "LPG cylinder cascade detonation. Massive fireball threatened adjoining tenements.",
            "hazard_type": "FIRE",
            "location_name": "Chembur Industrial Corridor",
            "latitude": 19.0550,
            "longitude": 72.9050,
            "trapped_count": 6,
            "injured_count": 10,
            "urgency": "CRITICAL",
            "severity": "EXTREME",
            "required_capabilities": ["FIRE_ENGINE", "HAZMAT_KIT", "AMBULANCE"],
            "secondary_risks": ["BOILING_LIQUID_EXPANDING_VAPOR_EXPLOSION"],
            "status": "PENDING_DISPATCH",
            "priority_score": 96,
            "priority_tier": "P1_CRITICAL",
            "assigned_resources": []
        }
        sim_incidents.extend([new_inc1, new_inc2])
        scenario_impact_highlights = [
            "Incident queue spiked from 4 to 6 active missions",
            "Simultaneous P1 demand creates severe resource contention"
        ]

    elif scenario_type == "RESOURCE_DEPLETION":
        scenario_description = "Fleet Depletion: 50% of response vehicles out of commission due to fuel shortage or engine flood."
        for idx, res in enumerate(sim_resources):
            if idx % 2 == 1:
                res["status"] = "MAINTENANCE"
                res["fuel_percent"] = 12
        scenario_impact_highlights = [
            "5 units decommissioned / grounded in repair",
            "Remaining response radius expanded; ETA increased substantially"
        ]

    elif scenario_type == "PRIORITY_ESCALATION":
        scenario_description = "Toxic Plume Drift: Thane chemical fire upgraded to maximum threat level due to shifting wind vectors."
        for inc in sim_incidents:
            if inc["hazard_type"] == "HAZMAT":
                inc["priority_score"] = 99
                inc["trapped_count"] += 15
                inc["secondary_risks"].append("CIVILIAN_POPULATION_EVACUATION")
        scenario_impact_highlights = [
            "Thane HAZMAT priority escalated to 99/100",
            "Forced preemption of units from lower-tier incidents"
        ]

    # Run baseline allocation
    baseline_result = run_allocation(base_incidents, base_resources, algorithm=algorithm)
    
    # Run simulated allocation
    sim_result = run_allocation(sim_incidents, sim_resources, algorithm=algorithm, road_blockages=sim_blockages)

    # Compute comparative delta metrics
    base_eta = baseline_result.get("avg_eta_minutes", 0)
    sim_eta = sim_result.get("avg_eta_minutes", 0)
    eta_delta = round(sim_eta - base_eta, 1)

    base_cost = baseline_result.get("total_cost", 0)
    sim_cost = sim_result.get("total_cost", 0)
    cost_delta = round(sim_cost - base_cost, 1)

    return {
        "scenario_type": scenario_type,
        "description": scenario_description,
        "impact_highlights": scenario_impact_highlights,
        "baseline": {
            "total_incidents": len([i for i in base_incidents if i["status"] in ["PENDING_DISPATCH", "DISPATCHED"]]),
            "assigned_count": baseline_result.get("assigned_count", 0),
            "avg_eta_minutes": base_eta,
            "total_cost": base_cost,
            "assignments": baseline_result.get("assignments", []),
            "shortages": baseline_result.get("shortage_alerts", [])
        },
        "simulated": {
            "total_incidents": len([i for i in sim_incidents if i["status"] in ["PENDING_DISPATCH", "DISPATCHED"]]),
            "assigned_count": sim_result.get("assigned_count", 0),
            "avg_eta_minutes": sim_eta,
            "total_cost": sim_cost,
            "assignments": sim_result.get("assignments", []),
            "shortages": sim_result.get("shortage_alerts", [])
        },
        "delta": {
            "eta_delta_minutes": eta_delta,
            "eta_percentage_increase": round((eta_delta / max(1.0, base_eta)) * 100, 1),
            "cost_delta": cost_delta,
            "critical_shortage_change": len(sim_result.get("shortage_alerts", [])) - len(baseline_result.get("shortage_alerts", []))
        }
    }

