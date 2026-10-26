import React, { useState, useEffect } from 'react';
import { 
  GitBranch, 
  AlertTriangle, 
  Flame, 
  Truck, 
  TrendingUp, 
  Clock, 
  ArrowRight, 
  Layers, 
  ShieldCheck,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { soundFx } from '../utils/audio';

const SCENARIOS = [
  {
    id: "ROAD_BLOCKAGE",
    name: "Arterial Road Blockage / Bridge Collapse",
    icon: AlertTriangle,
    desc: "Eastern Express & Vashi Creek Bridge submerged. Re-routes emergency traffic +12-24 mins."
  },
  {
    id: "DEMAND_SURGE",
    name: "Secondary Hazard Demand Surge",
    icon: Flame,
    desc: "Cyclone landfall triggers 2 new concurrent P1 catastrophic incidents (ICU hospital breach + LPG fire)."
  },
  {
    id: "RESOURCE_DEPLETION",
    name: "Fleet Depletion (50% Fleet Grounded)",
    icon: Truck,
    desc: "Half the emergency fleet decommissioned due to flood damage or fuel logistics breakdown."
  },
  {
    id: "PRIORITY_ESCALATION",
    name: "Toxic Plume Threat Escalation",
    icon: TrendingUp,
    desc: "Shifting wind vectors upgrade Thane chemical fire to Maximum Level 99/100 requiring immediate priority preemption."
  }
];

export default function WhatIfSimulation() {
  const [selectedScenario, setSelectedScenario] = useState("ROAD_BLOCKAGE");
  const [simData, setSimData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSimulation = async (scenario) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/whatif?scenario_type=${scenario}&algorithm=HUNGARIAN`);
      const data = await res.json();
      setSimData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSimulation(selectedScenario);
  }, [selectedScenario]);

  const handleSelectScenario = (scenId) => {
    soundFx.playAlert();
    setSelectedScenario(scenId);
  };

  return (
    <div className="p-4 space-y-5 max-w-6xl mx-auto">
      {/* Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cyan-500/20 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold font-mono text-cyan-300 tracking-wider">
              WHAT-IF SCENARIO SIMULATION SANDBOX
            </h2>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Slide 6 Architecture: Compare alternative plans side-by-side before committing any dispatch.
          </p>
        </div>

        <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300">
          SANDBOX ISOLATED // NON-DESTRUCTIVE
        </span>
      </div>

      {/* Scenario Selector Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {SCENARIOS.map((scen) => {
          const Icon = scen.icon;
          const isSelected = selectedScenario === scen.id;
          return (
            <button
              key={scen.id}
              onClick={() => handleSelectScenario(scen.id)}
              className={`p-3 rounded-lg border text-left font-mono transition-all ${
                isSelected
                  ? 'bg-cyan-500/20 border-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.25)]'
                  : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-2 text-xs font-bold text-cyan-300">
                <Icon className={`w-4 h-4 ${isSelected ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{scen.name}</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">{scen.desc}</p>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="p-12 text-center font-mono text-xs text-cyan-400 animate-pulse">
          SIMULATING ADVERSARIAL STRESS TEST & COMPUTING HUNGARIAN DELTA...
        </div>
      ) : simData && (
        <div className="space-y-4">
          {/* Delta KPI Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
            <div className="tactical-frame p-3 rounded bg-slate-950/80 border border-red-500/40">
              <span className="text-[10px] text-slate-400">AVERAGE RESPONSE TIME DELTA</span>
              <div className="text-red-400 font-bold text-base mt-0.5">
                +{simData.delta.eta_delta_minutes} MINS (+{simData.delta.eta_percentage_increase}%)
              </div>
              <span className="text-[9px] text-slate-400">Baseline {simData.baseline.avg_eta_minutes}m → Simulated {simData.simulated.avg_eta_minutes}m</span>
            </div>

            <div className="tactical-frame p-3 rounded bg-slate-950/80 border border-amber-500/40">
              <span className="text-[10px] text-slate-400">OPTIMIZATION COST DELTA</span>
              <div className="text-amber-400 font-bold text-base mt-0.5">
                +{simData.delta.cost_delta} PTS
              </div>
              <span className="text-[9px] text-slate-400">Baseline {simData.baseline.total_cost} → Simulated {simData.simulated.total_cost}</span>
            </div>

            <div className="tactical-frame p-3 rounded bg-slate-950/80 border border-cyan-500/40">
              <span className="text-[10px] text-slate-400">CRITICAL SHORTAGE SHIFT</span>
              <div className="text-cyan-300 font-bold text-base mt-0.5">
                {simData.delta.critical_shortage_change >= 0 ? `+${simData.delta.critical_shortage_change}` : simData.delta.critical_shortage_change} DEFICITS
              </div>
              <span className="text-[9px] text-slate-400">Fleet Reserve Impact</span>
            </div>
          </div>

          {/* Side-by-Side Comparison Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Baseline Column */}
            <div className="tactical-frame p-4 rounded-lg bg-slate-950/90 border border-cyan-500/30 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
                <span className="font-bold text-cyan-300 uppercase">PLAN A: CURRENT NOMINAL BASELINE</span>
                <span className="text-slate-400 text-[11px]">{simData.baseline.assigned_count} Missions</span>
              </div>

              <div className="space-y-2">
                {simData.baseline.assignments.map((a, idx) => (
                  <div key={idx} className="p-2.5 rounded bg-slate-900 border border-slate-800 text-[11px] space-y-1">
                    <div className="flex justify-between font-bold">
                      <span className="text-slate-200">{a.incident_id}: {a.incident_title}</span>
                      <span className="text-cyan-300">{a.travel_time_mins}m</span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Assigned: {a.resource_name} ({a.distance_km} km)
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Simulated Column */}
            <div className="tactical-frame p-4 rounded-lg bg-slate-950/90 border border-red-500/40 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-red-500/30 pb-2">
                <span className="font-bold text-red-400 uppercase">PLAN B: SIMULATED ADVERSARIAL STRESS</span>
                <span className="text-amber-400 text-[11px]">{simData.simulated.assigned_count} Missions</span>
              </div>

              <div className="space-y-2">
                {simData.simulated.assignments.map((a, idx) => {
                  const baselineMatch = simData.baseline.assignments.find(b => b.incident_id === a.incident_id);
                  const delaySurge = baselineMatch ? (a.travel_time_mins - baselineMatch.travel_time_mins).toFixed(1) : 0;
                  return (
                    <div key={idx} className="p-2.5 rounded bg-slate-900 border border-slate-800 text-[11px] space-y-1">
                      <div className="flex justify-between font-bold">
                        <span className="text-slate-200">{a.incident_id}: {a.incident_title}</span>
                        <span className={`${delaySurge > 0 ? 'text-red-400' : 'text-cyan-300'}`}>
                          {a.travel_time_mins}m {delaySurge > 0 && `(+${delaySurge}m)`}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Assigned: {a.resource_name} ({a.distance_km} km)
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
