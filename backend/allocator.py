"""
Resource Allocation Optimization Engine & Explainable AI (XAI) for RESQ.
Implements:
1. Hungarian Algorithm (Linear Sum Assignment via Scipy)
2. Greedy Assignment
3. Explainable recommendations with capability matching, travel time, and conflict detection.
"""
import math
from typing import Dict, List, Any, Tuple
import numpy as np
from scipy.optimize import linear_sum_assignment

def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculates great-circle distance between two GPS coordinates in kilometers."""
    R = 6371.0 # Earth's radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 2)

def estimate_travel_time_minutes(distance_km: float, speed_kmh: float, road_factor: float = 1.35) -> float:
    """
    Estimates travel time accounting for urban road curvature factor (default 1.35)
    and emergency siren priority.
    """
    effective_dist = distance_km * road_factor
    travel_hours = effective_dist / max(15.0, speed_kmh)
    return round(travel_hours * 60, 1)

def evaluate_capability_match(required_caps: List[str], resource_caps: List[str]) -> Tuple[float, List[str], List[str]]:
    """
    Returns (match_ratio 0.0-1.0, matched_list, missing_list)
    """
    if not required_caps:
        return 1.0, [], []
    matched = [c for c in required_caps if c in resource_caps]
    missing = [c for c in required_caps if c not in resource_caps]
    ratio = len(matched) / len(required_caps)
    return ratio, matched, missing

def compute_cost(
    incident: Dict[str, Any],
    resource: Dict[str, Any],
    road_blockages: List[Dict[str, Any]] = None
) -> Tuple[float, Dict[str, Any]]:
    """
    Computes a deterministic cost value for assigning `resource` to `incident`.
    Lower cost = better allocation.
    """
    dist_km = haversine_distance_km(
        incident["latitude"], incident["longitude"],
        resource["latitude"], resource["longitude"]
    )
    
    # Check if path crosses any road blockages
    blockage_delay = 0.0
    if road_blockages:
        for blk in road_blockages:
            d_res = haversine_distance_km(resource["latitude"], resource["longitude"], blk["lat"], blk["lng"])
            d_inc = haversine_distance_km(incident["latitude"], incident["longitude"], blk["lat"], blk["lng"])
            if d_res < 2.5 or d_inc < 2.5:
                blockage_delay += 12.0 # 12 minutes detour delay
                
    travel_time = estimate_travel_time_minutes(dist_km, resource.get("speed_kmh", 40)) + blockage_delay
    cap_ratio, matched, missing = evaluate_capability_match(
        incident.get("required_capabilities", []),
        resource.get("capabilities", [])
    )
    
    # Priority weighting: high priority incidents penalize travel delay more heavily
    priority = incident.get("priority_score", 50)
    urgency_multiplier = 1.0 + (priority / 100.0) * 0.8
    
    # Penalties
    missing_cap_penalty = len(missing) * 45.0
    status_penalty = 100.0 if resource["status"] != "AVAILABLE" else 0.0
    fuel_penalty = 20.0 if resource.get("fuel_percent", 100) < 30 else 0.0
    
    # Base Cost formula
    time_cost = travel_time * 2.2 * urgency_multiplier
    total_cost = round(time_cost + missing_cap_penalty + status_penalty + fuel_penalty, 2)
    
    breakdown = {
        "distance_km": dist_km,
        "travel_time_mins": travel_time,
        "capability_match_ratio": round(cap_ratio * 100, 1),
        "matched_capabilities": matched,
        "missing_capabilities": missing,
        "blockage_delay_mins": blockage_delay,
        "total_cost": total_cost
    }
    
    return total_cost, breakdown

def run_allocation(
    incidents: List[Dict[str, Any]],
    resources: List[Dict[str, Any]],
    algorithm: str = "HUNGARIAN", # "HUNGARIAN" or "GREEDY"
    road_blockages: List[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Executes optimization and returns structured pairings, XAI breakdowns,
    and fleet shortage alerts.
    """
    # Filter active pending incidents and active resources
    pending_incidents = [i for i in incidents if i["status"] in ["PENDING_DISPATCH", "DISPATCHED"]]
    if not pending_incidents or not resources:
        return {
            "algorithm": algorithm,
            "assignments": [],
            "cost_matrix": [],
            "shortage_alerts": [],
            "summary": "No pending incidents or active resources."
        }

    # Build cost matrix: rows = incidents, cols = resources
    N = len(pending_incidents)
    M = len(resources)
    cost_matrix = np.zeros((N, M))
    detail_matrix = [[None for _ in range(M)] for _ in range(N)]

    for i in range(N):
        for j in range(M):
            c, details = compute_cost(pending_incidents[i], resources[j], road_blockages)
            cost_matrix[i, j] = c
            detail_matrix[i][j] = details

    assignments = []
    
    if algorithm == "HUNGARIAN":
        # Hungarian Algorithm (Linear Sum Assignment)
        row_ind, col_ind = linear_sum_assignment(cost_matrix)
        for r, c in zip(row_ind, col_ind):
            inc = pending_incidents[r]
            res = resources[c]
            det = detail_matrix[r][c]
            
            # Generate Explainability rationale
            alt_reasons = []
            for other_j in range(M):
                if other_j != c:
                    other_det = detail_matrix[r][other_j]
                    other_res = resources[other_j]
                    if other_det["total_cost"] > det["total_cost"]:
                        time_diff = round(other_det["travel_time_mins"] - det["travel_time_mins"], 1)
                        reason = f"{other_res['name']}: "
                        if other_det["missing_capabilities"]:
                            reason += f"Lacks {', '.join(other_det['missing_capabilities'])}. "
                        if time_diff > 0:
                            reason += f"+{time_diff} min slower ETA."
                        alt_reasons.append(reason)
                        
            xai_text = (
                f"Selected {res['name']} because it provides {det['capability_match_ratio']}% capability match "
                f"with lowest estimated response time of {det['travel_time_mins']} mins "
                f"({det['distance_km']} km away from {res.get('station_name')})."
            )

            assignments.append({
                "incident_id": inc["id"],
                "incident_title": inc["title"],
                "priority_score": inc["priority_score"],
                "resource_id": res["id"],
                "resource_name": res["name"],
                "resource_type": res["type"],
                "cost": float(cost_matrix[r, c]),
                "distance_km": det["distance_km"],
                "travel_time_mins": det["travel_time_mins"],
                "capability_match_pct": det["capability_match_ratio"],
                "matched_caps": det["matched_capabilities"],
                "missing_caps": det["missing_capabilities"],
                "xai_recommendation": xai_text,
                "alternative_comparisons": alt_reasons[:3],
                "status": "RECOMMENDED"
            })
            
    else:
        # Greedy Algorithm: Assign best resource for highest priority incident first
        available_res_indices = set(range(M))
        # Sort incidents by priority descending
        sorted_incident_indices = sorted(range(N), key=lambda idx: pending_incidents[idx]["priority_score"], reverse=True)
        
        for r in sorted_incident_indices:
            if not available_res_indices:
                break
            best_c = min(available_res_indices, key=lambda c: cost_matrix[r, c])
            available_res_indices.remove(best_c)
            
            inc = pending_incidents[r]
            res = resources[best_c]
            det = detail_matrix[r][best_c]
            
            xai_text = (
                f"[Greedy Match] Allocated {res['name']} as local optimum for {inc['title']}. "
                f"ETA: {det['travel_time_mins']} mins."
            )
            
            assignments.append({
                "incident_id": inc["id"],
                "incident_title": inc["title"],
                "priority_score": inc["priority_score"],
                "resource_id": res["id"],
                "resource_name": res["name"],
                "resource_type": res["type"],
                "cost": float(cost_matrix[r, best_c]),
                "distance_km": det["distance_km"],
                "travel_time_mins": det["travel_time_mins"],
                "capability_match_pct": det["capability_match_ratio"],
                "matched_caps": det["matched_capabilities"],
                "missing_caps": det["missing_capabilities"],
                "xai_recommendation": xai_text,
                "alternative_comparisons": ["Greedy assignment prioritized highest immediate priority."],
                "status": "RECOMMENDED"
            })

    # Shortage & Conflict Analysis
    shortage_alerts = []
    # Count available capabilities
    avail_resources = [r for r in resources if r["status"] == "AVAILABLE"]
    type_counts = {}
    for r in avail_resources:
        type_counts[r["type"]] = type_counts.get(r["type"], 0) + 1
        
    for inc in pending_incidents:
        for cap in inc.get("required_capabilities", []):
            if type_counts.get(cap, 0) == 0:
                shortage_alerts.append({
                    "severity": "CRITICAL",
                    "incident_id": inc["id"],
                    "capability": cap,
                    "message": f"Zero available units of type '{cap}' in active operational reserve for {inc['title']}."
                })
            elif type_counts.get(cap, 0) == 1:
                shortage_alerts.append({
                    "severity": "WARNING",
                    "incident_id": inc["id"],
                    "capability": cap,
                    "message": f"Critical reserve threshold: Only 1 unit of type '{cap}' remaining in sector."
                })

    # Summary metrics
    avg_eta = round(sum(a["travel_time_mins"] for a in assignments) / max(1, len(assignments)), 1)
    total_cost_sum = round(sum(a["cost"] for a in assignments), 1)

    return {
        "algorithm": algorithm,
        "assignments": assignments,
        "total_cost": total_cost_sum,
        "avg_eta_minutes": avg_eta,
        "shortage_alerts": shortage_alerts[:4],
        "assigned_count": len(assignments),
        "total_pending_incidents": N
    }

