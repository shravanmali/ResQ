import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  CheckCircle2, 
  AlertTriangle, 
  Navigation, 
  Clock, 
  ShieldCheck, 
  Shuffle, 
  HelpCircle,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { soundFx } from '../utils/audio';
import { api } from '../utils/apiClient';

export default function AllocationXAI({ onOpenDispatchGate }) {
  const [algorithm, setAlgorithm] = useState('HUNGARIAN'); // HUNGARIAN or GREEDY
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAllocations = async (algo) => {
    setLoading(true);
    try {
      const json = await api.get(`/api/allocation?algorithm=${algo}`);
      if (json) setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllocations(algorithm);
  }, [algorithm]);

  const handleToggleAlgorithm = (algo) => {
    if (algo === algorithm) return;
    soundFx.playPing();
    setAlgorithm(algo);
  };

  return (
    <div className="p-4 space-y-5 max-w-6xl mx-auto">
      {/* Engine Header & Algorithm Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cyan-500/20 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold font-mono text-cyan-300 tracking-wider">
              INTELLIGENT RESOURCE ALLOCATION & EXPLAINABLE AI (XAI)
            </h2>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Slide 5 & 6: Mathematical cost-matrix optimization with complete explainability breakdown.
          </p>
        </div>

        {/* Algorithm Switcher */}
        <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => handleToggleAlgorithm('HUNGARIAN')}
            className={`px-3 py-1.5 rounded font-mono text-xs font-bold transition-all ${
              algorithm === 'HUNGARIAN'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400 shadow-[0_0_10px_rgba(0,240,255,0.3)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            HUNGARIAN (OPTIMAL GLOBAL COST)
          </button>
          <button
            onClick={() => handleToggleAlgorithm('GREEDY')}
            className={`px-3 py-1.5 rounded font-mono text-xs font-bold transition-all ${
              algorithm === 'GREEDY'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400 shadow-[0_0_10px_rgba(0,240,255,0.3)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            GREEDY (PRIORITY ORDER)
          </button>
        </div>
      </div>

      {/* Global Telemetry KPI Cards */}
      {data && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono text-xs">
          <div className="tactical-frame p-3 rounded bg-slate-950/80 border border-cyan-500/30">
            <span className="text-[10px] text-slate-400">ACTIVE ALGORITHM</span>
            <div className="text-cyan-300 font-bold text-sm">{data.algorithm}</div>
            <span className="text-[9px] text-slate-500">Linear Assignment Matrix</span>
          </div>

          <div className="tactical-frame p-3 rounded bg-slate-950/80 border border-cyan-500/30">
            <span className="text-[10px] text-slate-400">AVG RESPONSE TIME</span>
            <div className="text-cyan-300 font-bold text-sm">{data.avg_eta_minutes} MINS</div>
            <span className="text-[9px] text-emerald-400">Real OSRM/Haversine</span>
          </div>

          <div className="tactical-frame p-3 rounded bg-slate-950/80 border border-cyan-500/30">
            <span className="text-[10px] text-slate-400">TOTAL COST MATRIX SUM</span>
            <div className="text-amber-300 font-bold text-sm">{data.total_cost} PTS</div>
            <span className="text-[9px] text-slate-500">Minimization Target</span>
          </div>

          <div className="tactical-frame p-3 rounded bg-slate-950/80 border border-cyan-500/30">
            <span className="text-[10px] text-slate-400">MATCH COVERAGE</span>
            <div className="text-emerald-400 font-bold text-sm">{data.assigned_count} / {data.total_pending_incidents}</div>
            <span className="text-[9px] text-slate-500">Missions Paired</span>
          </div>
        </div>
      )}

      {/* Shortage & Conflict Alerts Banner */}
      {data?.shortage_alerts && data.shortage_alerts.length > 0 && (
        <div className="space-y-2">
          {data.shortage_alerts.map((alert, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-lg border font-mono text-xs flex items-center justify-between gap-3 ${
                alert.severity === 'CRITICAL'
                  ? 'bg-red-950/40 border-red-500/60 text-red-300 animate-pulse'
                  : 'bg-amber-950/40 border-amber-500/60 text-amber-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span><strong className="font-bold">[{alert.severity} FLEET SHORTAGE]:</strong> {alert.message}</span>
              </div>
              <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-black/40 border border-current">
                SECTOR DEFICIT
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Recommended Allocations List */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center font-mono text-xs text-cyan-400 animate-pulse">
            COMPUTING BIPARTITE COST MATRIX OPTIMIZATION...
          </div>
        ) : !data?.assignments || data.assignments.length === 0 ? (
          <div className="p-8 text-center font-mono text-xs text-slate-400 bg-slate-950 rounded border border-slate-800">
            No pending missions require allocation at this time.
          </div>
        ) : (
          data.assignments.map((alloc) => {
            const isP1 = alloc.priority_score >= 85;
            return (
              <div
                key={`${alloc.incident_id}-${alloc.resource_id}`}
                className="tactical-frame p-4 rounded-lg bg-slate-950/90 border border-cyan-500/30 space-y-3"
              >
                {/* Header Row: Incident & Paired Resource */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cyan-500/20 pb-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded font-mono text-xs font-bold ${
                      isP1 ? 'bg-red-500/20 border border-red-500/50 text-red-400' : 'bg-orange-500/20 border border-orange-500/50 text-orange-400'
                    }`}>
                      PRIORITY {alloc.priority_score}
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-200">
                      {alloc.incident_id}: {alloc.incident_title}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 font-mono text-xs">
                    <div className="flex items-center gap-1 text-cyan-300">
                      <Clock className="w-3.5 h-3.5" />
                      <span>ETA: {alloc.travel_time_mins} mins</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-400">
                      <Navigation className="w-3.5 h-3.5" />
                      <span>{alloc.distance_km} km</span>
                    </div>
                  </div>
                </div>

                {/* Assignment Matching Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left: Matched Unit Info */}
                  <div className="p-3 rounded bg-slate-900/80 border border-slate-800 space-y-2 font-mono text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 uppercase">Recommended Deployment Unit</span>
                      <span className="text-emerald-400 font-bold text-[10px] flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        {alloc.capability_match_pct}% CAPABILITY MATCH
                      </span>
                    </div>

                    <div className="text-sm font-bold text-cyan-300">{alloc.resource_name}</div>
                    <div className="text-[11px] text-slate-400">Unit ID: {alloc.resource_id} · Type: {alloc.resource_type}</div>

                    <div className="flex flex-wrap gap-1 pt-1">
                      {alloc.matched_caps.map((c, i) => (
                        <span key={i} className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                          ✓ {c}
                        </span>
                      ))}
                      {alloc.missing_caps.map((c, i) => (
                        <span key={i} className="text-[9px] px-1.5 py-0.5 rounded bg-red-500/10 border border-red-500/30 text-red-300">
                          ✗ {c}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Right: Explainable AI (XAI) Rationale Box */}
                  <div className="p-3 rounded bg-cyan-950/20 border border-cyan-500/30 space-y-2 font-mono text-xs">
                    <div className="text-[10px] text-cyan-400 font-bold uppercase flex items-center gap-1">
                      <HelpCircle className="w-3.5 h-3.5" />
                      EXPLAINABLE AI (XAI) DECISION JUSTIFICATION
                    </div>

                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      "{alloc.xai_recommendation}"
                    </p>

                    {/* Why not alternative units? */}
                    {alloc.alternative_comparisons && alloc.alternative_comparisons.length > 0 && (
                      <div className="border-t border-cyan-500/20 pt-1.5 space-y-1">
                        <span className="text-[10px] text-slate-400 uppercase">Why Not Alternate Units:</span>
                        <ul className="text-[10px] text-slate-400 space-y-0.5 list-disc list-inside">
                          {alloc.alternative_comparisons.map((alt, idx) => (
                            <li key={idx} className="text-slate-400">{alt}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {/* Dispatch Gate Action Trigger */}
                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => onOpenDispatchGate(alloc)}
                    className="px-4 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400 text-cyan-300 text-xs font-mono font-bold rounded flex items-center gap-1.5 transition-all shadow-[0_0_10px_rgba(0,240,255,0.2)]"
                  >
                    <span>SUBMIT TO HUMAN OFFICER DISPATCH GATE</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

