"""
AI / NLP Extraction Layer for RESQ.
Extracts structured incident data from unstructured emergency reports
using Groq (Llama-3-70b-versatile or Llama-3.3-70b) with reliable offline fallback.
"""
import os
import re
import json
from typing import Dict, Any, List
from groq import Groq

# Known coordinate database for Mumbai / Thane / Navi Mumbai region demo scenarios
LOCATION_PRESETS = {
    "dadar": {"lat": 19.0178, "lng": 72.8478, "name": "Dadar Railway Station Sector"},
    "railway": {"lat": 19.0178, "lng": 72.8478, "name": "Central Railway Station Area"},
    "kurla": {"lat": 19.0664, "lng": 72.8837, "name": "Kurla West Mithi River Basin"},
    "thane": {"lat": 19.2183, "lng": 72.9781, "name": "Thane MIDC Industrial Zone"},
    "bandra": {"lat": 19.0596, "lng": 72.8295, "name": "Bandra Kurla Complex (BKC)"},
    "chembur": {"lat": 19.0522, "lng": 72.8995, "name": "Chembur Refinery Corridor"},
    "vashi": {"lat": 19.0771, "lng": 72.9986, "name": "Vashi Palm Beach Sector"},
    "andheri": {"lat": 19.1136, "lng": 72.8697, "name": "Andheri East Western Express Corridor"},
    "colaba": {"lat": 18.9067, "lng": 72.8147, "name": "Colaba Coastal Base"},
    "default": {"lat": 19.0178, "lng": 72.8478, "name": "Central Emergency Operations Zone"}
}

def extract_incident_with_ai(report_text: str) -> Dict[str, Any]:
    """
    Attempts LLM structured extraction via Groq. Falls back cleanly to local rule-based NLP if key/network fails.
    """
    groq_api_key = os.environ.get("GROQ_API_KEY")
    if groq_api_key:
        try:
            client = Groq(api_key=groq_api_key)
            system_prompt = """
You are RESQ Emergency Dispatch AI. Extract emergency details into a STRICT JSON format without any markdown enclosing or commentary.
Schema:
{
  "hazard_type": "FLOOD" | "FIRE" | "HAZMAT" | "COLLAPSE" | "LANDSLIDE" | "MEDICAL" | "OTHER",
  "location_name": string,
  "trapped_count": integer,
  "injured_count": integer,
  "urgency": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
  "severity": "EXTREME" | "SEVERE" | "MODERATE" | "MINOR",
  "required_capabilities": array of strings (e.g. ["RESCUE_BOAT", "AMBULANCE", "FIRE_ENGINE", "HAZMAT_KIT", "HEAVY_CRANE", "POLICE_ESCORT"]),
  "secondary_risks": array of strings (e.g. ["GAS_LEAK", "ELECTROCUTION_RISK", "TRAFFIC_COLLAPSE", "STRUCTURE_INSTABILITY"]),
  "brief_summary": string (concise 10-15 words)
}
"""
            completion = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"Extract structured emergency dispatch schema from this incident report:\n'{report_text}'"}
                ],
                temperature=0.1,
                response_format={"type": "json_object"}
            )
            raw_response = completion.choices[0].message.content
            parsed = json.loads(raw_response)
            
            # Enrich coordinates based on detected location
            coords = resolve_coordinates(parsed.get("location_name", ""))
            parsed["latitude"] = coords["lat"]
            parsed["longitude"] = coords["lng"]
            parsed["location_normalized"] = coords["name"]
            parsed["ai_source"] = "Groq Llama-3.3-70b (Neural Extraction)"
            return parsed
        except Exception as e:
            print(f"[RESQ AI] Groq inference fallback due to: {e}")

    # Deterministic Local Rule-based NLP fallback
    return rule_based_fallback(report_text)

def resolve_coordinates(location_str: str) -> Dict[str, Any]:
    loc_lower = location_str.lower()
    for key, data in LOCATION_PRESETS.items():
        if key in loc_lower:
            return data
    return LOCATION_PRESETS["default"]

def rule_based_fallback(text: str) -> Dict[str, Any]:
    """
    High-precision deterministic regex & keyword extraction for offline/zero-latency scenarios.
    """
    text_lower = text.lower()
    
    # Hazard identification
    hazard = "OTHER"
    if any(k in text_lower for k in ["flood", "waterlog", "submerged", "drowning", "river"]):
        hazard = "FLOOD"
    elif any(k in text_lower for k in ["fire", "blaze", "smoke", "burning", "explosion"]):
        hazard = "FIRE"
    elif any(k in text_lower for k in ["chemical", "gas leak", "toxic", "fumes", "hazmat", "acid"]):
        hazard = "HAZMAT"
    elif any(k in text_lower for k in ["collapse", "building", "rubble", "debris", "structural"]):
        hazard = "COLLAPSE"
    elif any(k in text_lower for k in ["landslide", "mudslide", "rocks"]):
        hazard = "LANDSLIDE"
    elif any(k in text_lower for k in ["heart attack", "injury", "casualty", "patient", "medical"]):
        hazard = "MEDICAL"

    # Numbers extraction
    trapped = 0
    trapped_match = re.search(r'(\d+)\s*(people|persons|passengers|workers)?\s*(trapped|stranded|stuck)', text_lower)
    if trapped_match:
        try:
            trapped = int(trapped_match.group(1))
        except:
            trapped = 4
    elif "several people are trapped" in text_lower or "trapped" in text_lower:
        trapped = 6

    injured = 0
    injured_match = re.search(r'(\d+)\s*(people|persons|casualties|victims)?\s*(injured|hurt|burnt|critical)', text_lower)
    if injured_match:
        try:
            injured = int(injured_match.group(1))
        except:
            injured = 3
    elif "casualties" in text_lower or "injured" in text_lower:
        injured = 4

    # Urgency & Severity
    urgency = "HIGH"
    if any(k in text_lower for k in ["immediate", "critical", "urgent", "life threatening", "sos"]):
        urgency = "CRITICAL"
    elif any(k in text_lower for k in ["moderate", "stable"]):
        urgency = "MEDIUM"

    severity = "SEVERE"
    if any(k in text_lower for k in ["massive", "extreme", "heavy flooding", "major explosion"]):
        severity = "EXTREME"
    elif any(k in text_lower for k in ["minor", "contained", "small"]):
        severity = "MODERATE"

    # Required capabilities
    capabilities = []
    if hazard == "FLOOD":
        capabilities.extend(["RESCUE_BOAT", "AMBULANCE", "NDRF_TEAM"])
    elif hazard == "FIRE":
        capabilities.extend(["FIRE_ENGINE", "AMBULANCE", "HAZMAT_KIT"])
    elif hazard == "HAZMAT":
        capabilities.extend(["HAZMAT_KIT", "AMBULANCE", "POLICE_ESCORT"])
    elif hazard == "COLLAPSE":
        capabilities.extend(["HEAVY_CRANE", "AMBULANCE", "SEARCH_DOG_UNIT"])
    else:
        capabilities.extend(["AMBULANCE", "POLICE_ESCORT"])

    # Secondary risks
    risks = []
    if "gas" in text_lower or "leak" in text_lower:
        risks.append("GAS_LEAK")
    if "electric" in text_lower or "wire" in text_lower or hazard == "FLOOD":
        risks.append("ELECTROCUTION_RISK")
    if "traffic" in text_lower or "express" in text_lower:
        risks.append("TRAFFIC_GRIDLOCK")

    coords = resolve_coordinates(text)

    return {
        "hazard_type": hazard,
        "location_name": coords["name"],
        "location_normalized": coords["name"],
        "latitude": coords["lat"],
        "longitude": coords["lng"],
        "trapped_count": trapped,
        "injured_count": injured,
        "urgency": urgency,
        "severity": severity,
        "required_capabilities": list(set(capabilities)),
        "secondary_risks": risks,
        "brief_summary": f"{hazard.capitalize()} reported at {coords['name']}. {trapped} trapped, {injured} casualties requiring rapid response.",
        "ai_source": "Deterministic RESQ Emergency NLP Engine"
    }

def classify_damage_vision(image_label: str) -> Dict[str, Any]:
    """
    Simulated Computer Vision Damage/Hazard Classifier (as featured on Slide 4).
    Accepts vision label or image metadata and generates damage level confidence.
    """
    presets = {
        "flood_water": {
            "hazard": "FLOOD",
            "damage_level": "SEVERE_INUNDATION",
            "water_depth_est": "1.4 to 2.1 meters",
            "submerged_vehicles": True,
            "confidence": 0.94,
            "recommended_capability": ["RESCUE_BOAT", "LIFE_JACKETS", "AMBULANCE"]
        },
        "fire_smoke": {
            "hazard": "FIRE",
            "damage_level": "STRUCTURAL_FIRE_PHASE_3",
            "thermal_plume": "High intensity thermal radiation",
            "flame_spread_risk": "Imminent adjoining building threat",
            "confidence": 0.96,
            "recommended_capability": ["FIRE_ENGINE", "HAZMAT_KIT", "FOAM_TENDER"]
        },
        "building_debris": {
            "hazard": "COLLAPSE",
            "damage_level": "STRUCTURAL_PANCAKE_FAILURE",
            "void_spaces_detected": "Probable survivors in lower basement pocket",
            "confidence": 0.91,
            "recommended_capability": ["HEAVY_CRANE", "ACOUSTIC_LISTENER", "AMBULANCE"]
        }
    }
    return presets.get(image_label, presets["flood_water"])

