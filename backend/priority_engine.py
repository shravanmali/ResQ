"""
Priority Engine for RESQ Platform.
Implements a 100% deterministic 0-100 emergency priority scoring algorithm
with full mathematical transparency and factor breakdown.
"""
from typing import Dict, Any, List

def calculate_priority_score(
    urgency: str,             # "CRITICAL", "HIGH", "MEDIUM", "LOW"
    severity: str,            # "EXTREME", "SEVERE", "MODERATE", "MINOR"
    trapped_count: int,       # Number of trapped / high-risk persons
    injured_count: int,       # Number of injured casualties
    hazard_type: str,         # "FLOOD", "FIRE", "HAZMAT", "COLLAPSE", "LANDSLIDE", "CYCLONE", "MEDICAL"
    secondary_risks: List[str] # e.g. ["GAS_LEAK", "POWER_GRID_FAILURE", "HOSPITAL_PROXIMITY"]
) -> Dict[str, Any]:
    """
    Deterministic scoring formula:
    Base Score:
      Urgency Weight (35 pts max)
      Severity Weight (25 pts max)
      Human Life Risk (25 pts max: trapped + injured)
      Hazard Vulnerability (15 pts max)
    Multipliers:
      Secondary cascading risk multiplier (up to +15 pts bonus)
    Clamped strictly between 0 and 100.
    """
    urgency_weights = {
        "CRITICAL": 35.0,
        "HIGH": 26.0,
        "MEDIUM": 15.0,
        "LOW": 6.0
    }
    
    severity_weights = {
        "EXTREME": 25.0,
        "SEVERE": 18.0,
        "MODERATE": 10.0,
        "MINOR": 4.0
    }
    
    hazard_weights = {
        "HAZMAT": 15.0,
        "COLLAPSE": 14.0,
        "FLOOD": 13.0,
        "FIRE": 12.0,
        "LANDSLIDE": 11.0,
        "CYCLONE": 10.0,
        "MEDICAL": 9.0,
        "OTHER": 6.0
    }
    
    # Life risk calculation: 3 pts per trapped person (up to 18), 1.5 pts per injured (up to 7)
    trapped_pts = min(18.0, trapped_count * 3.0)
    injured_pts = min(7.0, injured_count * 1.5)
    human_life_pts = min(25.0, trapped_pts + injured_pts)
    
    u_score = urgency_weights.get(urgency.upper(), 15.0)
    s_score = severity_weights.get(severity.upper(), 10.0)
    h_score = hazard_weights.get(hazard_type.upper(), 8.0)
    
    # Secondary risk bonuses (each adds 3 pts, up to 15 max)
    risk_bonus = min(15.0, len(secondary_risks) * 3.0) if secondary_risks else 0.0
    
    raw_total = u_score + s_score + human_life_pts + h_score + risk_bonus
    final_score = int(min(100.0, max(5.0, round(raw_total))))
    
    # Determine Priority Classification
    if final_score >= 85:
        tier = "P1_CRITICAL"
        tier_label = "P1 - Extreme Emergency (Immediate Dispatch)"
        color = "#ef4444" # Red
    elif final_score >= 65:
        tier = "P2_HIGH"
        tier_label = "P2 - High Urgency (Fast-Track Dispatch)"
        color = "#f97316" # Orange
    elif final_score >= 40:
        tier = "P3_MEDIUM"
        tier_label = "P3 - Moderate Urgency"
        color = "#eab308" # Yellow
    else:
        tier = "P4_LOW"
        tier_label = "P4 - Routine / Standby"
        color = "#3b82f6" # Blue

    return {
        "score": final_score,
        "tier": tier,
        "tier_label": tier_label,
        "color": color,
        "breakdown": {
            "urgency_component": {
                "label": f"Urgency ({urgency.upper()})",
                "value": u_score,
                "max": 35.0,
                "percentage": round((u_score / 35.0) * 100, 1)
            },
            "severity_component": {
                "label": f"Severity ({severity.upper()})",
                "value": s_score,
                "max": 25.0,
                "percentage": round((s_score / 25.0) * 100, 1)
            },
            "human_life_component": {
                "label": f"Human Life Risk ({trapped_count} trapped, {injured_count} injured)",
                "value": human_life_pts,
                "max": 25.0,
                "percentage": round((human_life_pts / 25.0) * 100, 1)
            },
            "hazard_type_component": {
                "label": f"Hazard Risk ({hazard_type.upper()})",
                "value": h_score,
                "max": 15.0,
                "percentage": round((h_score / 15.0) * 100, 1)
            },
            "cascading_risk_bonus": {
                "label": f"Cascading Threats ({len(secondary_risks)} detected)",
                "value": risk_bonus,
                "max": 15.0,
                "percentage": round((risk_bonus / 15.0) * 100, 1)
            }
        },
        "explainable_summary": (
            f"Deterministic score of {final_score}/100 generated from Urgency ({u_score} pts), "
            f"Severity ({s_score} pts), {trapped_count} trapped lives ({human_life_pts} pts), "
            f"and {hazard_type} profile ({h_score} pts)."
        )
    }
