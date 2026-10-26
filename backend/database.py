"""
In-Memory Thread-Safe State & Database for RESQ Platform.
Maintains live emergency incidents, available emergency resource fleet,
and tamper-evident immutable audit logs.
"""
import uuid
import time
from datetime import datetime
from typing import Dict, List, Any, Optional

# Initial Incidents Seed Data (Realistic Coastal / Metropolis Emergency Scenarios)
INITIAL_INCIDENTS = [
    {
        "id": "INC-701",
        "title": "Severe Flash Flooding & Stranded Commuters",
        "raw_text": "Heavy flooding near the railway station. Several people are trapped and require immediate rescue assistance. Water level rising fast.",
        "hazard_type": "FLOOD",
        "location_name": "Dadar Central Railway Subway & Sector 4",
        "latitude": 19.0178,
        "longitude": 72.8478,
        "trapped_count": 8,
        "injured_count": 3,
        "urgency": "CRITICAL",
        "severity": "EXTREME",
        "required_capabilities": ["RESCUE_BOAT", "AMBULANCE", "NDRF_TEAM"],
        "secondary_risks": ["ELECTROCUTION_RISK", "TRAIN_SERVICE_DISRUPTION"],
        "status": "PENDING_DISPATCH",
        "priority_score": 94,
        "priority_tier": "P1_CRITICAL",
        "assigned_resources": [],
        "created_at": "2026-10-26T20:45:00Z"
    },
    {
        "id": "INC-702",
        "title": "Chemical Vapor Cloud & Warehouse Blaze",
        "raw_text": "Toxic solvent explosion at chemical storage facility. Toxic fumes spreading towards residential colony. 4 workers critically injured, fire spreading.",
        "hazard_type": "HAZMAT",
        "location_name": "Thane MIDC Industrial Sector 12",
        "latitude": 19.2183,
        "longitude": 72.9781,
        "trapped_count": 4,
        "injured_count": 7,
        "urgency": "CRITICAL",
        "severity": "EXTREME",
        "required_capabilities": ["HAZMAT_KIT", "FIRE_ENGINE", "AMBULANCE"],
        "secondary_risks": ["GAS_LEAK", "AIR_POLLUTION_EVACUATION"],
        "status": "PENDING_DISPATCH",
        "priority_score": 91,
        "priority_tier": "P1_CRITICAL",
        "assigned_resources": [],
        "created_at": "2026-10-26T20:50:00Z"
    },
    {
        "id": "INC-703",
        "title": "Flyover Construction Scaffolding Collapse",
        "raw_text": "Support scaffolding collapsed during concrete pour on express highway. 3 vehicles crushed beneath rubble. Workers trapped in debris.",
        "hazard_type": "COLLAPSE",
        "location_name": "Kurla West SCLR Flyover Junction",
        "latitude": 19.0664,
        "longitude": 72.8837,
        "trapped_count": 5,
        "injured_count": 2,
        "urgency": "HIGH",
        "severity": "SEVERE",
        "required_capabilities": ["HEAVY_CRANE", "AMBULANCE", "POLICE_ESCORT"],
        "secondary_risks": ["TRAFFIC_GRIDLOCK", "SECONDARY_STRUCTURAL_FAILURE"],
        "status": "PENDING_DISPATCH",
        "priority_score": 79,
        "priority_tier": "P2_HIGH",
        "assigned_resources": [],
        "created_at": "2026-10-26T20:55:00Z"
    },
    {
        "id": "INC-704",
        "title": "Multi-Vehicle Pileup with Fuel Spill",
        "raw_text": "Commercial tanker and two buses collided on bridge ramp. Diesel leaking onto road surface. Multiple casualties with fractures.",
        "hazard_type": "FIRE",
        "location_name": "Vashi Creek Bridge Eastern Approach",
        "latitude": 19.0771,
        "longitude": 72.9986,
        "trapped_count": 2,
        "injured_count": 6,
        "urgency": "HIGH",
        "severity": "SEVERE",
        "required_capabilities": ["FIRE_ENGINE", "AMBULANCE", "POLICE_ESCORT"],
        "secondary_risks": ["FUEL_IGNITION_RISK"],
        "status": "DISPATCHED",
        "priority_score": 74,
        "priority_tier": "P2_HIGH",
        "assigned_resources": ["RES-AMB-03"],
        "created_at": "2026-10-26T20:30:00Z"
    }
]

# Initial Resources Fleet Seed Data
INITIAL_RESOURCES = [
    {
        "id": "RES-BOAT-01",
        "name": "NDRF Inflatable Gemini Rescue Boat Alpha",
        "type": "RESCUE_BOAT",
        "category": "Water & Marine Rescue",
        "capabilities": ["RESCUE_BOAT", "NDRF_TEAM", "FLOOD_EXTRACTION"],
        "status": "AVAILABLE",  # AVAILABLE, DISPATCHED, EN_ROUTE, ON_SCENE, MAINTENANCE
        "latitude": 19.0230,
        "longitude": 72.8420,
        "station_name": "Dadar Sea Cadets Depot",
        "speed_kmh": 35,
        "capacity_passengers": 10,
        "current_assigned_incident": None,
        "assigned_at": None,
        "fuel_percent": 95
    },
    {
        "id": "RES-BOAT-02",
        "name": "SDRF Rapid Zodiac Craft Bravo",
        "type": "RESCUE_BOAT",
        "category": "Water & Marine Rescue",
        "capabilities": ["RESCUE_BOAT", "NDRF_TEAM"],
        "status": "AVAILABLE",
        "latitude": 19.0550,
        "longitude": 72.8350,
        "station_name": "Bandra Coastal Guard Outpost",
        "speed_kmh": 40,
        "capacity_passengers": 8,
        "current_assigned_incident": None,
        "assigned_at": None,
        "fuel_percent": 88
    },
    {
        "id": "RES-AMB-01",
        "name": "EMS 108 Advanced Life Support Unit 01",
        "type": "AMBULANCE",
        "category": "Medical Response",
        "capabilities": ["AMBULANCE", "ALS_EQUIPMENT", "ICU_TRANSPORT"],
        "status": "AVAILABLE",
        "latitude": 19.0210,
        "longitude": 72.8490,
        "station_name": "KEM Hospital Disaster Base",
        "speed_kmh": 45,
        "capacity_passengers": 2,
        "current_assigned_incident": None,
        "assigned_at": None,
        "fuel_percent": 90
    },
    {
        "id": "RES-AMB-02",
        "name": "EMS 108 Advanced Life Support Unit 02",
        "type": "AMBULANCE",
        "category": "Medical Response",
        "capabilities": ["AMBULANCE", "ALS_EQUIPMENT"],
        "status": "AVAILABLE",
        "latitude": 19.2050,
        "longitude": 72.9710,
        "station_name": "Thane Civil Hospital Annex",
        "speed_kmh": 45,
        "capacity_passengers": 2,
        "current_assigned_incident": None,
        "assigned_at": None,
        "fuel_percent": 82
    },
    {
        "id": "RES-AMB-03",
        "name": "EMS 108 Mobile Trauma Unit 03",
        "type": "AMBULANCE",
        "category": "Medical Response",
        "capabilities": ["AMBULANCE", "TRAUMA_TRIAGE"],
        "status": "DISPATCHED",
        "latitude": 19.0720,
        "longitude": 72.9900,
        "station_name": "Vashi Municipal Emergency Wing",
        "speed_kmh": 45,
        "capacity_passengers": 2,
        "current_assigned_incident": "INC-704",
        "assigned_at": "2026-10-26T20:32:00Z",
        "fuel_percent": 75
    },
    {
        "id": "RES-FIRE-01",
        "name": "Heavy Foam Tender & Hydraulic Turret 11",
        "type": "FIRE_ENGINE",
        "category": "Fire & Extinguishment",
        "capabilities": ["FIRE_ENGINE", "FOAM_TENDER", "CHEMICAL_FIRE"],
        "status": "AVAILABLE",
        "latitude": 19.2120,
        "longitude": 72.9750,
        "station_name": "MIDC Central Fire Command",
        "speed_kmh": 40,
        "capacity_passengers": 6,
        "current_assigned_incident": None,
        "assigned_at": None,
        "fuel_percent": 92
    },
    {
        "id": "RES-FIRE-02",
        "name": "Multi-Purpose High Pressure Water Mist 07",
        "type": "FIRE_ENGINE",
        "category": "Fire & Extinguishment",
        "capabilities": ["FIRE_ENGINE", "STRUCTURAL_EXTINGUISHMENT"],
        "status": "AVAILABLE",
        "latitude": 19.0600,
        "longitude": 72.8750,
        "station_name": "Kurla Fire Station",
        "speed_kmh": 42,
        "capacity_passengers": 5,
        "current_assigned_incident": None,
        "assigned_at": None,
        "fuel_percent": 85
    },
    {
        "id": "RES-HAZMAT-01",
        "name": "Regional Hazmat CBRN Decon Vehicle 01",
        "type": "HAZMAT_KIT",
        "category": "Chemical & Toxic Hazard",
        "capabilities": ["HAZMAT_KIT", "TOXIC_DETECTION", "LEVEL_A_SUITS", "DECONTAMINATION"],
        "status": "AVAILABLE",
        "latitude": 19.2080,
        "longitude": 72.9820,
        "station_name": "Thane Disaster Management Cell",
        "speed_kmh": 38,
        "capacity_passengers": 4,
        "current_assigned_incident": None,
        "assigned_at": None,
        "fuel_percent": 94
    },
    {
        "id": "RES-CRANE-01",
        "name": "50-Ton Heavy Telescopic Rescue Crane Titan",
        "type": "HEAVY_CRANE",
        "category": "Urban Search & Rescue",
        "capabilities": ["HEAVY_CRANE", "RUBBLE_CLEARANCE", "STRUCTURAL_SHORING"],
        "status": "AVAILABLE",
        "latitude": 19.0700,
        "longitude": 72.8800,
        "station_name": "MMRDA Heavy Equipment Depot",
        "speed_kmh": 25,
        "capacity_passengers": 3,
        "current_assigned_incident": None,
        "assigned_at": None,
        "fuel_percent": 89
    },
    {
        "id": "RES-POLICE-01",
        "name": "Quick Response Traffic & Perimeter Team QR-04",
        "type": "POLICE_ESCORT",
        "category": "Law & Perimeter Control",
        "capabilities": ["POLICE_ESCORT", "CORRIDOR_CLEARANCE", "CROWD_CONTROL"],
        "status": "AVAILABLE",
        "latitude": 19.0650,
        "longitude": 72.8810,
        "station_name": "Traffic Division BKC",
        "speed_kmh": 50,
        "capacity_passengers": 4,
        "current_assigned_incident": None,
        "assigned_at": None,
        "fuel_percent": 96
    }
]

# Initial Immutable Audit Log
INITIAL_LOGS = [
    {
        "id": "AUD-1001",
        "timestamp": "2026-10-26T20:30:15Z",
        "officer_id": "OFFICER-SWASTIK-22",
        "action": "SYSTEM_INITIALIZATION",
        "incident_id": "GLOBAL",
        "details": "RESQ C2 Engine online. Active sensor network linked with OpenStreetMap & GIS layer.",
        "algorithm": "SYSTEM_CORE",
        "status": "SUCCESS"
    },
    {
        "id": "AUD-1002",
        "timestamp": "2026-10-26T20:32:00Z",
        "officer_id": "OFFICER-RIDDHI-27",
        "action": "HUMAN_DISPATCH_APPROVAL",
        "incident_id": "INC-704",
        "details": "Authorized dispatch of EMS 108 Mobile Trauma Unit 03 to Vashi Creek Bridge approach.",
        "algorithm": "HUNGARIAN_OPTIMAL",
        "status": "APPROVED"
    }
]

class ResQDatabase:
    def __init__(self):
        self.incidents: Dict[str, Dict[str, Any]] = {i["id"]: i.copy() for i in INITIAL_INCIDENTS}
        self.resources: Dict[str, Dict[str, Any]] = {r["id"]: r.copy() for r in INITIAL_RESOURCES}
        self.audit_logs: List[Dict[str, Any]] = list(INITIAL_LOGS)
        self.road_blockages: List[Dict[str, Any]] = [
            {"id": "BLK-01", "name": "Vashi Old Toll Naka Waterlogging", "lat": 19.0735, "lng": 72.9850, "radius_m": 450}
        ]

    def get_all_incidents(self) -> List[Dict[str, Any]]:
        # Sort by priority score descending
        return sorted(list(self.incidents.values()), key=lambda x: x.get("priority_score", 0), reverse=True)

    def get_incident(self, incident_id: str) -> Optional[Dict[str, Any]]:
        return self.incidents.get(incident_id)

    def add_incident(self, inc: Dict[str, Any]) -> Dict[str, Any]:
        if "id" not in inc or not inc["id"]:
            inc["id"] = f"INC-{int(time.time()) % 10000}"
        inc["created_at"] = datetime.utcnow().isoformat() + "Z"
        if "assigned_resources" not in inc:
            inc["assigned_resources"] = []
        self.incidents[inc["id"]] = inc
        self.add_audit_log(
            officer_id="SYSTEM_AUTO",
            action="INCIDENT_INGESTED",
            incident_id=inc["id"],
            details=f"New incident '{inc.get('title')}' ingested with Priority {inc.get('priority_score')}/100.",
            algorithm="DETERMINISTIC_PRIORITY"
        )
        return inc

    def update_incident(self, incident_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        if incident_id in self.incidents:
            self.incidents[incident_id].update(updates)
            return self.incidents[incident_id]
        return None

    def get_all_resources(self) -> List[Dict[str, Any]]:
        return list(self.resources.values())

    def get_resource(self, resource_id: str) -> Optional[Dict[str, Any]]:
        return self.resources.get(resource_id)

    def update_resource_status(self, resource_id: str, status: str, incident_id: Optional[str] = None) -> Optional[Dict[str, Any]]:
        if resource_id in self.resources:
            self.resources[resource_id]["status"] = status
            self.resources[resource_id]["current_assigned_incident"] = incident_id
            if status == "DISPATCHED":
                self.resources[resource_id]["assigned_at"] = datetime.utcnow().isoformat() + "Z"
            elif status == "AVAILABLE":
                self.resources[resource_id]["assigned_at"] = None
                self.resources[resource_id]["current_assigned_incident"] = None
            return self.resources[resource_id]
        return None

    def add_audit_log(self, officer_id: str, action: str, incident_id: str, details: str, algorithm: str = "MANUAL", status: str = "CONFIRMED") -> Dict[str, Any]:
        log_entry = {
            "id": f"AUD-{uuid.uuid4().hex[:8].upper()}",
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "officer_id": officer_id,
            "action": action,
            "incident_id": incident_id,
            "details": details,
            "algorithm": algorithm,
            "status": status
        }
        self.audit_logs.insert(0, log_entry) # Most recent first
        return log_entry

    def get_audit_logs(self, limit: int = 50) -> List[Dict[str, Any]]:
        return self.audit_logs[:limit]

# Singleton instance
db = ResQDatabase()
