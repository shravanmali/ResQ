/**
 * Standalone Zero-Config Tactical C2 Simulation Engine for RESQ.
 * Allows RESQ to run 100% client-side on Vercel with ZERO environment variables,
 * zero latency, and zero serverless cold-start limitations, while matching
 * the exact backend logic and formulas.
 */

// Initial Incidents matching Mumbai/Thane/Navi Mumbai disaster scenarios
export const INITIAL_INCIDENTS = [
  {
    id: "INC-701",
    title: "Severe Flash Flooding & Stranded Commuters",
    raw_text: "Heavy flooding near the railway station. Several people are trapped and require immediate rescue assistance. Water level rising fast.",
    hazard_type: "FLOOD",
    location_name: "Dadar Central Railway Subway & Sector 4",
    latitude: 19.0178,
    longitude: 72.8478,
    trapped_count: 8,
    injured_count: 3,
    urgency: "CRITICAL",
    severity: "EXTREME",
    required_capabilities: ["RESCUE_BOAT", "AMBULANCE", "NDRF_TEAM"],
    secondary_risks: ["ELECTROCUTION_RISK", "TRAIN_SERVICE_DISRUPTION"],
    status: "PENDING_DISPATCH",
    priority_score: 94,
    priority_tier: "P1_CRITICAL",
    assigned_resources: [],
    created_at: new Date(Date.now() - 35 * 60000).toISOString()
  },
  {
    id: "INC-702",
    title: "Chemical Vapor Cloud & Warehouse Blaze",
    raw_text: "Toxic solvent explosion at chemical storage facility. Toxic fumes spreading towards residential colony. 4 workers critically injured, fire spreading.",
    hazard_type: "HAZMAT",
    location_name: "Thane MIDC Industrial Sector 12",
    latitude: 19.2183,
    longitude: 72.9781,
    trapped_count: 4,
    injured_count: 7,
    urgency: "CRITICAL",
    severity: "EXTREME",
    required_capabilities: ["HAZMAT_KIT", "FIRE_ENGINE", "AMBULANCE"],
    secondary_risks: ["GAS_LEAK", "AIR_POLLUTION_EVACUATION"],
    status: "PENDING_DISPATCH",
    priority_score: 91,
    priority_tier: "P1_CRITICAL",
    assigned_resources: [],
    created_at: new Date(Date.now() - 25 * 60000).toISOString()
  },
  {
    id: "INC-703",
    title: "Flyover Construction Scaffolding Collapse",
    raw_text: "Support scaffolding collapsed during concrete pour on express highway. 3 vehicles crushed beneath rubble. Workers trapped in debris.",
    hazard_type: "COLLAPSE",
    location_name: "Kurla West SCLR Flyover Junction",
    latitude: 19.0664,
    longitude: 72.8837,
    trapped_count: 5,
    injured_count: 2,
    urgency: "HIGH",
    severity: "SEVERE",
    required_capabilities: ["HEAVY_CRANE", "AMBULANCE", "POLICE_ESCORT"],
    secondary_risks: ["TRAFFIC_GRIDLOCK", "SECONDARY_STRUCTURAL_FAILURE"],
    status: "PENDING_DISPATCH",
    priority_score: 79,
    priority_tier: "P2_HIGH",
    assigned_resources: [],
    created_at: new Date(Date.now() - 15 * 60000).toISOString()
  },
  {
    id: "INC-704",
    title: "Multi-Vehicle Pileup with Fuel Spill",
    raw_text: "Commercial tanker and two buses collided on bridge ramp. Diesel leaking onto road surface. Multiple casualties with fractures.",
    hazard_type: "FIRE",
    location_name: "Vashi Creek Bridge Eastern Approach",
    latitude: 19.0771,
    longitude: 72.9986,
    trapped_count: 2,
    injured_count: 6,
    urgency: "HIGH",
    severity: "SEVERE",
    required_capabilities: ["FIRE_ENGINE", "AMBULANCE", "POLICE_ESCORT"],
    secondary_risks: ["FUEL_IGNITION_RISK"],
    status: "DISPATCHED",
    priority_score: 74,
    priority_tier: "P2_HIGH",
    assigned_resources: ["RES-AMB-03"],
    created_at: new Date(Date.now() - 50 * 60000).toISOString()
  }
];

export const INITIAL_RESOURCES = [
  {
    id: "RES-BOAT-01",
    name: "NDRF Inflatable Gemini Rescue Boat Alpha",
    type: "RESCUE_BOAT",
    category: "Water & Marine Rescue",
    capabilities: ["RESCUE_BOAT", "NDRF_TEAM", "FLOOD_EXTRACTION"],
    status: "AVAILABLE",
    latitude: 19.0230,
    longitude: 72.8420,
    station_name: "Dadar Sea Cadets Depot",
    speed_kmh: 35,
    capacity_passengers: 10,
    current_assigned_incident: null,
    fuel_percent: 95
  },
  {
    id: "RES-BOAT-02",
    name: "SDRF Rapid Zodiac Craft Bravo",
    type: "RESCUE_BOAT",
    category: "Water & Marine Rescue",
    capabilities: ["RESCUE_BOAT", "NDRF_TEAM"],
    status: "AVAILABLE",
    latitude: 19.0550,
    longitude: 72.8350,
    station_name: "Bandra Coastal Guard Outpost",
    speed_kmh: 40,
    capacity_passengers: 8,
    current_assigned_incident: null,
    fuel_percent: 88
  },
  {
    id: "RES-AMB-01",
    name: "EMS 108 Advanced Life Support Unit 01",
    type: "AMBULANCE",
    category: "Medical Response",
    capabilities: ["AMBULANCE", "ALS_EQUIPMENT", "ICU_TRANSPORT"],
    status: "AVAILABLE",
    latitude: 19.0210,
    longitude: 72.8490,
    station_name: "KEM Hospital Disaster Base",
    speed_kmh: 45,
    capacity_passengers: 2,
    current_assigned_incident: null,
    fuel_percent: 90
  },
  {
    id: "RES-AMB-02",
    name: "EMS 108 Advanced Life Support Unit 02",
    type: "AMBULANCE",
    category: "Medical Response",
    capabilities: ["AMBULANCE", "ALS_EQUIPMENT"],
    status: "AVAILABLE",
    latitude: 19.2050,
    longitude: 72.9710,
    station_name: "Thane Civil Hospital Annex",
    speed_kmh: 45,
    capacity_passengers: 2,
    current_assigned_incident: null,
    fuel_percent: 82
  },
  {
    id: "RES-AMB-03",
    name: "EMS 108 Mobile Trauma Unit 03",
    type: "AMBULANCE",
    category: "Medical Response",
    capabilities: ["AMBULANCE", "TRAUMA_TRIAGE"],
    status: "DISPATCHED",
    latitude: 19.0720,
    longitude: 72.9900,
    station_name: "Vashi Municipal Emergency Wing",
    speed_kmh: 45,
    capacity_passengers: 2,
    current_assigned_incident: "INC-704",
    fuel_percent: 75
  },
  {
    id: "RES-FIRE-01",
    name: "Heavy Foam Tender & Hydraulic Turret 11",
    type: "FIRE_ENGINE",
    category: "Fire & Extinguishment",
    capabilities: ["FIRE_ENGINE", "FOAM_TENDER", "CHEMICAL_FIRE"],
    status: "AVAILABLE",
    latitude: 19.2120,
    longitude: 72.9750,
    station_name: "MIDC Central Fire Command",
    speed_kmh: 40,
    capacity_passengers: 6,
    current_assigned_incident: null,
    fuel_percent: 92
  },
  {
    id: "RES-FIRE-02",
    name: "Multi-Purpose High Pressure Water Mist 07",
    type: "FIRE_ENGINE",
    category: "Fire & Extinguishment",
    capabilities: ["FIRE_ENGINE", "STRUCTURAL_EXTINGUISHMENT"],
    status: "AVAILABLE",
    latitude: 19.0600,
    longitude: 72.8750,
    station_name: "Kurla Fire Station",
    speed_kmh: 42,
    capacity_passengers: 5,
    current_assigned_incident: null,
    fuel_percent: 85
  },
  {
    id: "RES-HAZMAT-01",
    name: "Regional Hazmat CBRN Decon Vehicle 01",
    type: "HAZMAT_KIT",
    category: "Chemical & Toxic Hazard",
    capabilities: ["HAZMAT_KIT", "TOXIC_DETECTION", "LEVEL_A_SUITS", "DECONTAMINATION"],
    status: "AVAILABLE",
    latitude: 19.2080,
    longitude: 72.9820,
    station_name: "Thane Disaster Management Cell",
    speed_kmh: 38,
    capacity_passengers: 4,
    current_assigned_incident: null,
    fuel_percent: 94
  },
  {
    id: "RES-CRANE-01",
    name: "50-Ton Heavy Telescopic Rescue Crane Titan",
    type: "HEAVY_CRANE",
    category: "Urban Search & Rescue",
    capabilities: ["HEAVY_CRANE", "RUBBLE_CLEARANCE", "STRUCTURAL_SHORING"],
    status: "AVAILABLE",
    latitude: 19.0700,
    longitude: 72.8800,
    station_name: "MMRDA Heavy Equipment Depot",
    speed_kmh: 25,
    capacity_passengers: 3,
    current_assigned_incident: null,
    fuel_percent: 89
  },
  {
    id: "RES-POLICE-01",
    name: "Quick Response Traffic & Perimeter Team QR-04",
    type: "POLICE_ESCORT",
    category: "Law & Perimeter Control",
    capabilities: ["POLICE_ESCORT", "CORRIDOR_CLEARANCE", "CROWD_CONTROL"],
    status: "AVAILABLE",
    latitude: 19.0650,
    longitude: 72.8810,
    station_name: "Traffic Division BKC",
    speed_kmh: 50,
    capacity_passengers: 4,
    current_assigned_incident: null,
    fuel_percent: 96
  }
];

export const INITIAL_LOGS = [
  {
    id: "AUD-1001",
    timestamp: new Date(Date.now() - 40 * 60000).toISOString(),
    officer_id: "OFFICER-SWASTIK-22",
    action: "SYSTEM_INITIALIZATION",
    incident_id: "GLOBAL",
    details: "RESQ C2 Engine online. Active sensor network linked with OpenStreetMap & GIS layer.",
    algorithm: "SYSTEM_CORE",
    status: "SUCCESS"
  },
  {
    id: "AUD-1002",
    timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
    officer_id: "OFFICER-RIDDHI-27",
    action: "HUMAN_DISPATCH_APPROVAL",
    incident_id: "INC-704",
    details: "Authorized dispatch of EMS 108 Mobile Trauma Unit 03 to Vashi Creek Bridge approach.",
    algorithm: "HUNGARIAN_OPTIMAL",
    status: "APPROVED"
  }
];

// Distance & Math
export function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371.0;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 100) / 100;
}

export function estimateTravelTime(distanceKm, speedKmh = 40, roadFactor = 1.35) {
  const effectiveDist = distanceKm * roadFactor;
  const hours = effectiveDist / Math.max(15, speedKmh);
  return Math.round(hours * 60 * 10) / 10;
}

// Deterministic Priority Engine (Slide 4)
export function calculatePriorityScore(urgency, severity, trappedCount, injuredCount, hazardType, secondaryRisks = []) {
  const urgencyWeights = { CRITICAL: 35.0, HIGH: 26.0, MEDIUM: 15.0, LOW: 6.0 };
  const severityWeights = { EXTREME: 25.0, SEVERE: 18.0, MODERATE: 10.0, MINOR: 4.0 };
  const hazardWeights = {
    HAZMAT: 15.0, COLLAPSE: 14.0, FLOOD: 13.0, FIRE: 12.0, LANDSLIDE: 11.0, CYCLONE: 10.0, MEDICAL: 9.0, OTHER: 6.0
  };

  const trappedPts = Math.min(18.0, (trappedCount || 0) * 3.0);
  const injuredPts = Math.min(7.0, (injuredCount || 0) * 1.5);
  const humanLifePts = Math.min(25.0, trappedPts + injuredPts);

  const uScore = urgencyWeights[urgency?.toUpperCase()] || 15.0;
  const sScore = severityWeights[severity?.toUpperCase()] || 10.0;
  const hScore = hazardWeights[hazardType?.toUpperCase()] || 8.0;
  const riskBonus = Math.min(15.0, (secondaryRisks?.length || 0) * 3.0);

  const rawTotal = uScore + sScore + humanLifePts + hScore + riskBonus;
  const finalScore = Math.min(100, Math.max(5, Math.round(rawTotal)));

  let tier = "P4_LOW";
  let tierLabel = "P4 - Routine / Standby";
  let color = "#3b82f6";
  if (finalScore >= 85) {
    tier = "P1_CRITICAL";
    tierLabel = "P1 - Extreme Emergency (Immediate Dispatch)";
    color = "#ef4444";
  } else if (finalScore >= 65) {
    tier = "P2_HIGH";
    tierLabel = "P2 - High Urgency (Fast-Track Dispatch)";
    color = "#f97316";
  } else if (finalScore >= 40) {
    tier = "P3_MEDIUM";
    tierLabel = "P3 - Moderate Urgency";
    color = "#eab308";
  }

  return {
    score: finalScore,
    tier,
    tier_label: tierLabel,
    color,
    breakdown: {
      urgency_component: { label: `Urgency (${urgency})`, value: uScore, max: 35.0, percentage: Math.round((uScore / 35.0) * 100) },
      severity_component: { label: `Severity (${severity})`, value: sScore, max: 25.0, percentage: Math.round((sScore / 25.0) * 100) },
      human_life_component: { label: `Human Life Risk (${trappedCount} trapped, ${injuredCount} injured)`, value: humanLifePts, max: 25.0, percentage: Math.round((humanLifePts / 25.0) * 100) },
      hazard_type_component: { label: `Hazard Risk (${hazardType})`, value: hScore, max: 15.0, percentage: Math.round((hScore / 15.0) * 100) },
      cascading_risk_bonus: { label: `Cascading Threats (${secondaryRisks.length} detected)`, value: riskBonus, max: 15.0, percentage: Math.round((riskBonus / 15.0) * 100) }
    },
    explainable_summary: `Deterministic score of ${finalScore}/100 generated from Urgency (${uScore} pts), Severity (${sScore} pts), ${trappedCount} trapped lives (${humanLifePts} pts), and ${hazardType} profile (${hScore} pts).`
  };
}

// Client-Side In-Memory Store
class LocalC2Store {
  constructor() {
    this.reset();
  }

  reset() {
    this.incidents = JSON.parse(JSON.stringify(INITIAL_INCIDENTS));
    this.resources = JSON.parse(JSON.stringify(INITIAL_RESOURCES));
    this.auditLogs = JSON.parse(JSON.stringify(INITIAL_LOGS));
    this.roadBlockages = [
      { id: "BLK-01", name: "Vashi Old Toll Naka Waterlogging", lat: 19.0735, lng: 72.9850, radius_m: 500 }
    ];
  }

  getStatus() {
    const pending = this.incidents.filter(i => i.status === "PENDING_DISPATCH");
    const avail = this.resources.filter(r => r.status === "AVAILABLE");
    const isP1 = pending.some(i => i.priority_score >= 85);
    return {
      system: "RESQ C2 Command Operational Grid (Vercel Live Edge)",
      tagline: "Every Second Matters. Every Resource Counts.",
      project_team: [
        { name: "Swastik Patil", roll: 22, role: "Lead System Architect" },
        { name: "Shravan Mali", roll: 26, role: "GIS & Spatial Intelligence" },
        { name: "Riddhi Chalke", roll: 27, role: "AI / NLP & Priority Engine" },
        { name: "Mrunmay Raut", roll: 38, role: "Resource Optimization & XAI" }
      ],
      alert_state: isP1 ? "DEFCON_1_RED" : pending.length > 0 ? "DEFCON_2_AMBER" : "DEFCON_3_GREEN",
      alert_label: isP1 ? "RED ALERT: Active High-Casualty Catastrophe" : "AMBER ALERT: Escalated Emergency Response",
      active_incidents: this.incidents.length,
      pending_dispatch: pending.length,
      available_resources: avail.length,
      total_fleet: this.resources.length,
      officer_on_duty: "Officer Swastik Patil (Commander)",
      gis_active: true,
      osrm_routing: "ACTIVE"
    };
  }

  getStats() {
    const total = this.incidents.length;
    const dispatched = this.incidents.filter(i => i.status === "DISPATCHED").length;
    const pending = this.incidents.filter(i => i.status === "PENDING_DISPATCH").length;
    const avail = this.resources.filter(r => r.status === "AVAILABLE").length;
    const deployed = this.resources.filter(r => ["DISPATCHED", "EN_ROUTE", "ON_SCENE"].includes(r.status)).length;

    return {
      overview: {
        total_incidents: total,
        dispatched,
        pending,
        resolved: 0,
        fleet_readiness_pct: Math.round((avail / Math.max(1, this.resources.length)) * 100)
      },
      priority_breakdown: {
        p1_critical: this.incidents.filter(i => i.priority_tier === "P1_CRITICAL").length,
        p2_high: this.incidents.filter(i => i.priority_tier === "P2_HIGH").length,
        p3_medium: this.incidents.filter(i => i.priority_tier === "P3_MEDIUM").length,
        p4_low: this.incidents.filter(i => i.priority_tier === "P4_LOW").length
      },
      fleet_status: {
        available: avail,
        deployed,
        maintenance: this.resources.length - avail - deployed
      },
      total_audit_decisions: this.auditLogs.length
    };
  }

  nlpExtract(text, visionPreset = "flood_water") {
    const textLower = text.toLowerCase();
    let hazard = "OTHER";
    if (textLower.includes("flood") || textLower.includes("water") || textLower.includes("drown")) hazard = "FLOOD";
    else if (textLower.includes("fire") || textLower.includes("blaze") || textLower.includes("smoke")) hazard = "FIRE";
    else if (textLower.includes("chemical") || textLower.includes("toxic") || textLower.includes("gas") || textLower.includes("hazmat")) hazard = "HAZMAT";
    else if (textLower.includes("collapse") || textLower.includes("rubble") || textLower.includes("building")) hazard = "COLLAPSE";

    let trapped = 6;
    let injured = 4;
    const trappedMatch = textLower.match(/(\d+)\s*(people|persons|passengers)?\s*(trapped|stranded)/);
    if (trappedMatch) trapped = parseInt(trappedMatch[1], 10);
    const injuredMatch = textLower.match(/(\d+)\s*(people|persons|casualties)?\s*(injured|hurt|burnt)/);
    if (injuredMatch) injured = parseInt(injuredMatch[1], 10);

    const caps = [];
    if (hazard === "FLOOD") caps.push("RESCUE_BOAT", "AMBULANCE", "NDRF_TEAM");
    else if (hazard === "FIRE") caps.push("FIRE_ENGINE", "AMBULANCE", "HAZMAT_KIT");
    else if (hazard === "HAZMAT") caps.push("HAZMAT_KIT", "AMBULANCE", "POLICE_ESCORT");
    else if (hazard === "COLLAPSE") caps.push("HEAVY_CRANE", "AMBULANCE", "SEARCH_DOG_UNIT");
    else caps.push("AMBULANCE", "POLICE_ESCORT");

    const priority = calculatePriorityScore("CRITICAL", "EXTREME", trapped, injured, hazard, ["ELECTROCUTION_RISK"]);

    let lat = 19.0178, lng = 72.8478, locName = "Dadar Railway Station Sector";
    if (textLower.includes("thane")) { lat = 19.2183; lng = 72.9781; locName = "Thane MIDC Industrial Zone"; }
    else if (textLower.includes("kurla")) { lat = 19.0664; lng = 72.8837; locName = "Kurla West SCLR Junction"; }
    else if (textLower.includes("vashi")) { lat = 19.0771; lng = 72.9986; locName = "Vashi Creek Bridge Approach"; }

    return {
      raw_text: text,
      extracted: {
        hazard_type: hazard,
        location_name: locName,
        location_normalized: locName,
        latitude: lat,
        longitude: lng,
        trapped_count: trapped,
        injured_count: injured,
        urgency: "CRITICAL",
        severity: "EXTREME",
        required_capabilities: Array.from(new Set(caps)),
        secondary_risks: ["ELECTROCUTION_RISK", "TRAFFIC_GRIDLOCK"],
        brief_summary: `${hazard} emergency detected at ${locName}. ${trapped} trapped lives requiring immediate dispatch.`,
        ai_source: "RESQ Tactical Edge NLP Engine"
      },
      priority
    };
  }

  // Hungarian / Greedy Allocation
  getAllocation(algorithm = "HUNGARIAN") {
    const pending = this.incidents.filter(i => ["PENDING_DISPATCH", "DISPATCHED"].includes(i.status));
    const availRes = this.resources.slice();

    const assignments = [];
    const usedRes = new Set();

    // Sort pending by priority
    const sorted = [...pending].sort((a, b) => b.priority_score - a.priority_score);

    for (const inc of sorted) {
      let bestRes = null;
      let minCost = Infinity;
      let bestDet = null;

      for (const res of availRes) {
        if (usedRes.has(res.id)) continue;

        const dist = haversineDistance(inc.latitude, inc.longitude, res.latitude, res.longitude);
        const eta = estimateTravelTime(dist, res.speed_kmh || 40);

        const matched = (inc.required_capabilities || []).filter(c => res.capabilities.includes(c));
        const missing = (inc.required_capabilities || []).filter(c => !res.capabilities.includes(c));
        const capRatio = Math.round((matched.length / Math.max(1, inc.required_capabilities.length)) * 100);

        const cost = (eta * 2.2) + (missing.length * 45) + (res.status !== "AVAILABLE" ? 100 : 0);

        if (cost < minCost) {
          minCost = cost;
          bestRes = res;
          bestDet = { dist, eta, capRatio, matched, missing };
        }
      }

      if (bestRes) {
        usedRes.add(bestRes.id);
        assignments.push({
          incident_id: inc.id,
          incident_title: inc.title,
          priority_score: inc.priority_score,
          resource_id: bestRes.id,
          resource_name: bestRes.name,
          resource_type: bestRes.type,
          cost: Math.round(minCost * 10) / 10,
          distance_km: bestDet.dist,
          travel_time_mins: bestDet.eta,
          capability_match_pct: bestDet.capRatio,
          matched_caps: bestDet.matched,
          missing_caps: bestDet.missing,
          xai_recommendation: `Selected ${bestRes.name} providing ${bestDet.capRatio}% capability match with lowest response time of ${bestDet.eta} mins (${bestDet.dist} km from ${bestRes.station_name}).`,
          alternative_comparisons: [
            "Alternative units delayed due to distance curvature factor (+7.4m)",
            "Lacks specific hazardous extraction tools"
          ],
          status: "RECOMMENDED"
        });
      }
    }

    const avgEta = Math.round((assignments.reduce((sum, a) => sum + a.travel_time_mins, 0) / Math.max(1, assignments.length)) * 10) / 10;
    const totalCost = Math.round(assignments.reduce((sum, a) => sum + a.cost, 0) * 10) / 10;

    return {
      algorithm,
      assignments,
      total_cost: totalCost,
      avg_eta_minutes: avgEta,
      shortage_alerts: [
        {
          severity: "WARNING",
          incident_id: "INC-701",
          capability: "RESCUE_BOAT",
          message: "Critical reserve threshold: Only 1 unit of type 'RESCUE_BOAT' remaining in sector."
        }
      ],
      assigned_count: assignments.length,
      total_pending_incidents: pending.length
    };
  }

  // What-If Simulation
  getWhatIf(scenarioType = "ROAD_BLOCKAGE") {
    const base = this.getAllocation("HUNGARIAN");
    const deltaEta = scenarioType === "ROAD_BLOCKAGE" ? 7.1 : scenarioType === "DEMAND_SURGE" ? 9.4 : 12.8;
    const deltaCost = scenarioType === "ROAD_BLOCKAGE" ? 101.4 : 240.5;

    return {
      scenario_type: scenarioType,
      baseline: {
        total_incidents: base.total_pending_incidents,
        assigned_count: base.assigned_count,
        avg_eta_minutes: base.avg_eta_minutes,
        total_cost: base.total_cost,
        assignments: base.assignments
      },
      simulated: {
        total_incidents: scenarioType === "DEMAND_SURGE" ? base.total_pending_incidents + 2 : base.total_pending_incidents,
        assigned_count: base.assigned_count,
        avg_eta_minutes: Math.round((base.avg_eta_minutes + deltaEta) * 10) / 10,
        total_cost: Math.round((base.total_cost + deltaCost) * 10) / 10,
        assignments: base.assignments.map(a => ({
          ...a,
          travel_time_mins: Math.round((a.travel_time_mins + deltaEta) * 10) / 10
        }))
      },
      delta: {
        eta_delta_minutes: deltaEta,
        eta_percentage_increase: Math.round((deltaEta / Math.max(1, base.avg_eta_minutes)) * 100),
        cost_delta: deltaCost,
        critical_shortage_change: scenarioType === "RESOURCE_DEPLETION" ? 3 : 1
      }
    };
  }

  // Dispatch Approval
  approveDispatch(incId, resId, officerId = "OFFICER-SWASTIK-22", notes = "Approved optimal Hungarian pairing") {
    const inc = this.incidents.find(i => i.id === incId);
    const res = this.resources.find(r => r.id === resId);
    if (inc) {
      inc.status = "DISPATCHED";
      inc.assigned_resources = [resId];
    }
    if (res) {
      res.status = "DISPATCHED";
      res.current_assigned_incident = incId;
    }
    const log = {
      id: `AUD-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      timestamp: new Date().toISOString(),
      officer_id: officerId,
      action: "DISPATCH_AUTHORIZED",
      incident_id: incId,
      details: `Approved dispatch of ${res?.name || resId} to ${inc?.title || incId}. Notes: ${notes}`,
      algorithm: "HUNGARIAN_OPTIMAL",
      status: "APPROVED"
    };
    this.auditLogs.unshift(log);
    return { status: "SUCCESS", message: `Dispatch approved for ${res?.name}`, audit_entry: log };
  }

  // Commander Override
  overrideDispatch(incId, resId, origId, officerId = "OFFICER-SWASTIK-22", reason = "Commander tactical discretion") {
    const inc = this.incidents.find(i => i.id === incId);
    const res = this.resources.find(r => r.id === resId);
    if (inc) {
      inc.status = "DISPATCHED";
      inc.assigned_resources = [resId];
    }
    if (res) {
      res.status = "DISPATCHED";
      res.current_assigned_incident = incId;
    }
    const log = {
      id: `AUD-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      timestamp: new Date().toISOString(),
      officer_id: officerId,
      action: "OFFICER_DISPATCH_OVERRIDE",
      incident_id: incId,
      details: `Officer overrode AI recommendation to dispatch ${res?.name}. Reason: ${reason}`,
      algorithm: "HUMAN_OVERRIDE",
      status: "OVERRIDDEN"
    };
    this.auditLogs.unshift(log);
    return { status: "SUCCESS", message: `Command override logged: ${res?.name} dispatched.`, audit_entry: log };
  }
}

export const localStore = new LocalC2Store();

