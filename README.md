# RESQ: AI-Assisted Decision Support & Explainable Resource Optimization
> **"Every Second Matters. Every Resource Counts."**
> **Diploma in Computer Engineering · Major Project**

---

### Project Team
* **Swastik Patil** (Roll No. 22) — *Lead System Architecture & Dispatch Gate*
* **Shravan Mali** (Roll No. 26) — *GIS Situational Awareness & Vector Routing*
* **Riddhi Chalke** (Roll No. 27) — *AI / NLP Incident Extraction & Deterministic Priority Engine*
* **Mrunmay Raut** (Roll No. 38) — *Hungarian Algorithm Optimization & Explainable AI (XAI)*

---

## 🚨 The Operational Philosophy
> **"RESQ recommends. Human officers decide."**
> RESQ is an advisory decision support platform, not a black-box autonomous controller. An approval gate stays visible at all times, providing transparent mathematical justifications, what-if counterfactual sandbox evaluations, and tamper-evident audit trails.

---

## ⚡ Quick Start (One-Click Launch)

### Prerequisites
- Python 3.10+ (FastAPI, Uvicorn, Scipy, NumPy installed)
- Node.js 18+ (for development mode; production build is already pre-compiled)

### Launching the Application
You can run the entire platform with a single command:

```bash
# Option 1: Double-click or execute the batch script
start.bat

# Option 2: Run via Python
python run.py
```
Open your browser at **`http://localhost:8000`** (or API Swagger docs at `http://localhost:8000/docs`).

---

## 🛰️ Presentation Slide Architecture Mapping

| Presentation Slide | Module Implemented | Key Capabilities |
| :--- | :--- | :--- |
| **Slide 2: The Challenge** | Disaster C2 Interface | Cognitive overload reduction, deterministic triage, explainability gap resolution |
| **Slide 3 & 4: Workflow & AI Intake** | `IncidentIntake.jsx` & `ai_extractor.py` | Unstructured text/voice emergency extraction, JSON schema, Vision damage classifier, 0–100 deterministic priority scoring |
| **Slide 5: Spatial Intelligence** | `TacticalMap.jsx` & `allocator.py` | Leaflet dark-mode tactical GIS, real-time route vectors, OSRM/Haversine ETA, capability matching |
| **Slide 5 & 6: Allocation & XAI** | `AllocationXAI.jsx` | Dual algorithm toggle: **Hungarian Algorithm (Scipy Linear Sum Assignment)** vs **Greedy Allocation**, Cost matrix, "Why This Resource", "Why Not Alternatives" |
| **Slide 3 & 6: Human Approval Gate** | `DispatchApprovalGate.jsx` | Human officer signature gate, Commander Overrides with mandatory justification logging |
| **Slide 6: What-If Simulation** | `WhatIfSimulation.jsx` | Counterfactual sandbox: Road Blockage, Demand Surge, Resource Depletion, Priority Escalation with comparative deltas |
| **Slide 8 & 9: Audit & Analytics** | `AuditLedger.jsx` & `AnalyticsPanel.jsx` | Immutable audit trail, DEFCON alert state, fleet readiness metrics |

---

## 📐 Deterministic Priority Formula (0–100)
To avoid black-box arbitrariness and ensure reproducible emergency triage, priority is calculated deterministically:

$$\text{Priority Score} = \min(100, \text{Urgency Weight} (35) + \text{Severity Weight} (25) + \text{Human Life Risk} (25) + \text{Hazard Risk} (15) + \text{Cascading Risk Bonus} (15))$$

- **Urgency Weights**: CRITICAL (35 pts), HIGH (26 pts), MEDIUM (15 pts), LOW (6 pts)
- **Severity Weights**: EXTREME (25 pts), SEVERE (18 pts), MODERATE (10 pts), MINOR (4 pts)
- **Human Life Risk**: $3 \times \text{Trapped Count} + 1.5 \times \text{Casualties Count}$ (capped at 25 pts)
- **Hazard Vulnerabilities**: HAZMAT (15 pts), COLLAPSE (14 pts), FLOOD (13 pts), FIRE (12 pts), etc.

---

## 🧮 Hungarian Algorithm (Optimal Bipartite Matching)
The optimization engine computes an $N \times M$ cost matrix $C$ between incidents $i$ and fleet units $j$:

$$C_{ij} = (\text{ETA}_{ij} \times 2.2 \times \omega_{\text{priority}}) + (\text{Missing Capabilities} \times 45) + \text{Penalty}_{\text{status}} + \text{Delay}_{\text{blockage}}$$

Using `scipy.optimize.linear_sum_assignment(C)`, RESQ globally minimizes total dispatch response time across the entire metropolis.

---

## 📂 Project Structure
```
ResQ/
├── backend/
│   ├── main.py              # FastAPI server, endpoints, and static asset router
│   ├── database.py          # State store, seed scenarios, immutable audit logs
│   ├── priority_engine.py   # Deterministic 0-100 mathematical scoring
│   ├── ai_extractor.py      # Groq Llama-3.3 NLP extraction + vision classifier
│   ├── allocator.py         # Hungarian algorithm & Greedy optimization + XAI
│   └── whatif_engine.py     # What-If scenario sandbox & comparison engine
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── HeaderHUD.jsx            # Mission bar, DEFCON status, crew roster
│   │   │   ├── NavigationDock.jsx       # Tactical C2 navigation dock
│   │   │   ├── TacticalMap.jsx          # Leaflet dark cyber GIS radar & vectors
│   │   │   ├── IncidentIntake.jsx       # AI/NLP incident extraction & score dial
│   │   │   ├── AllocationXAI.jsx        # Hungarian optimization & XAI breakdown
│   │   │   ├── DispatchApprovalGate.jsx # Human-in-the-loop approval gate
│   │   │   ├── WhatIfSimulation.jsx     # Side-by-side what-if sandbox
│   │   │   ├── AuditLedger.jsx          # Immutable chronological decision ledger
│   │   │   └── AnalyticsPanel.jsx       # Fleet readiness & operational metrics
│   │   ├── utils/
│   │   │   └── audio.js                 # Procedural Web Audio API tactical sound FX
│   │   ├── App.jsx                      # Main command center orchestrator
│   │   └── index.css                    # Cyberpunk C2 dark HUD theme & scanlines
│   └── dist/                            # Production pre-built frontend
├── run.py                   # Unified single-command launcher
├── start.bat                # Windows one-click batch launcher
├── test_system.py           # Integration test suite (7/7 tests passed)
└── README.md                # Comprehensive documentation
```

---

## 🛡️ License
Diploma in Computer Engineering Major Project — Academic and Operational Emergency Defense Use.
