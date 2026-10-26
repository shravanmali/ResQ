import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Send, 
  RotateCcw, 
  UserCheck, 
  Radio, 
  Clock, 
  Navigation,
  FileCheck
} from 'lucide-react';
import { soundFx } from '../utils/audio';
import { api } from '../utils/apiClient';

export default function DispatchApprovalGate({ 
  selectedAllocation, 
  onDispatchConfirmed,
  allResources = [],
  pendingIncidents = []
}) {
  const [officerId, setOfficerId] = useState("OFFICER-SWASTIK-22");
  const [decisionNotes, setDecisionNotes] = useState("AI optimal recommendation verified against road network conditions.");
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [showOverride, setShowOverride] = useState(false);
  const [overrideResourceId, setOverrideResourceId] = useState("");
  const [overrideReason, setOverrideReason] = useState("");
  const [activeAllocation, setActiveAllocation] = useState(selectedAllocation);

  useEffect(() => {
    if (selectedAllocation) {
      setActiveAllocation(selectedAllocation);
    }
  }, [selectedAllocation]);

  const handleAuthorize = async () => {
    if (!activeAllocation) return;
    setIsAuthorizing(true);
    soundFx.playAuthorize();

    try {
      const data = await api.post('/api/dispatch/approve', {
        incident_id: activeAllocation.incident_id,
        resource_id: activeAllocation.resource_id,
        officer_id: officerId,
        decision_notes: decisionNotes,
        algorithm_used: "HUNGARIAN_OPTIMAL"
      });
      if (onDispatchConfirmed) onDispatchConfirmed(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAuthorizing(false);
    }
  };

  const handleExecuteOverride = async () => {
    if (!activeAllocation || !overrideResourceId || !overrideReason.trim()) return;
    setIsAuthorizing(true);
    soundFx.playAlert();

    try {
      const data = await api.post('/api/dispatch/override', {
        incident_id: activeAllocation.incident_id,
        selected_resource_id: overrideResourceId,
        original_recommended_id: activeAllocation.resource_id,
        officer_id: officerId,
        override_reason: overrideReason
      });
      if (onDispatchConfirmed) onDispatchConfirmed(data);
      setShowOverride(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAuthorizing(false);
    }
  };

  return (
    <div className="p-4 space-y-5 max-w-5xl mx-auto">
      {/* Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cyan-500/20 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold font-mono text-cyan-300 tracking-wider">
              HUMAN-IN-THE-LOOP DISPATCH APPROVAL GATE
            </h2>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Slide 3 Rule: "RESQ recommends. Human officers decide." No automated dispatch without commander signature.
          </p>
        </div>

        {/* Officer on Duty Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-cyan-950/40 border border-cyan-500/30 font-mono text-xs text-cyan-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span>COMMANDER: Swastik Patil (Roll 22)</span>
        </div>
      </div>

      {!activeAllocation ? (
        <div className="tactical-frame p-8 text-center font-mono text-xs text-slate-400 rounded-lg bg-slate-950/80 border border-cyan-500/20 space-y-3">
          <ShieldAlert className="w-8 h-8 text-cyan-400 mx-auto opacity-70" />
          <p>NO ACTIVE ALLOCATION SELECTED FOR APPROVAL.</p>
          <p className="text-[11px] text-slate-500">
            Navigate to 'OPTIMAL XAI' tab to review and forward algorithm recommendations to this gate.
          </p>
        </div>
      ) : (
        <div className="tactical-frame p-5 rounded-lg bg-slate-950/90 border border-cyan-400/50 shadow-[0_0_25px_rgba(0,240,255,0.15)] space-y-4">
          {/* Mission Threat Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-cyan-500/20 pb-2 font-mono text-xs">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-red-500/20 border border-red-500/40 text-red-400 font-bold">
                MISSION {activeAllocation.incident_id}
              </span>
              <span className="font-bold text-slate-200">{activeAllocation.incident_title}</span>
            </div>
            <span className="text-slate-400">PRIORITY INDEX: {activeAllocation.priority_score}/100</span>
          </div>

          {/* Allocation Proposal Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 rounded bg-slate-900/80 border border-slate-800 space-y-2 font-mono text-xs">
              <span className="text-[10px] text-slate-400 uppercase">AI RECOMMENDED ASSET:</span>
              <div className="text-base font-bold text-cyan-300">{activeAllocation.resource_name}</div>
              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                <div>ETA: <strong className="text-emerald-400">{activeAllocation.travel_time_mins} mins</strong></div>
                <div>Distance: <strong className="text-slate-300">{activeAllocation.distance_km} km</strong></div>
                <div>Match: <strong className="text-cyan-300">{activeAllocation.capability_match_pct}%</strong></div>
                <div>Algorithm: <strong className="text-amber-400">Hungarian</strong></div>
              </div>
            </div>

            <div className="p-3 rounded bg-cyan-950/20 border border-cyan-500/30 space-y-2 font-mono text-xs">
              <span className="text-[10px] text-cyan-400 uppercase font-bold">EXPLAINABILITY JUSTIFICATION:</span>
              <p className="text-[11px] text-slate-300 leading-relaxed italic">
                "{activeAllocation.xai_recommendation}"
              </p>
            </div>
          </div>

          {/* Officer Directives & Notes */}
          <div className="space-y-2 font-mono text-xs">
            <label className="text-slate-400 flex items-center gap-1.5">
              <FileCheck className="w-4 h-4 text-cyan-400" />
              OFFICER DISPATCH LOG DIRECTIVES:
            </label>
            <input
              type="text"
              value={decisionNotes}
              onChange={(e) => setDecisionNotes(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-slate-200 text-xs font-mono outline-none focus:border-cyan-400"
            />
          </div>

          {/* Officer Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-cyan-500/20">
            <button
              onClick={() => setShowOverride(!showOverride)}
              className="px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-amber-400 text-amber-300 font-mono text-xs rounded transition-colors"
            >
              {showOverride ? 'CANCEL MANUAL OVERRIDE' : '⚠️ INITIATE COMMANDER OVERRIDE'}
            </button>

            <button
              onClick={handleAuthorize}
              disabled={isAuthorizing}
              className="px-6 py-2.5 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400 text-cyan-300 font-mono text-xs font-bold rounded flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(0,240,255,0.3)] disabled:opacity-50"
            >
              <Send className="w-4 h-4 text-cyan-400" />
              <span>{isAuthorizing ? 'AUTHORIZING & BROADCASTING...' : 'AUTHORIZE & DISPATCH ASSET'}</span>
            </button>
          </div>

          {/* Manual Commander Override Drawer */}
          {showOverride && (
            <div className="p-4 rounded-lg bg-amber-950/20 border border-amber-500/40 space-y-3 font-mono text-xs animate-in fade-in">
              <div className="text-amber-400 font-bold uppercase flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                OFFICER DISCRETIONARY OVERRIDE PROTOCOL
              </div>
              <p className="text-[11px] text-slate-400">
                You are overriding the mathematically optimal Hungarian recommendation. Mandatory justification must be logged in the immutable audit ledger.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400">SELECT ALTERNATE FLEET ASSET:</label>
                  <select
                    value={overrideResourceId}
                    onChange={(e) => setOverrideResourceId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-slate-200 text-xs font-mono mt-1"
                  >
                    <option value="">-- Choose Alternative Unit --</option>
                    {allResources.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.id}: {r.name} ({r.status})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400">TACTICAL JUSTIFICATION:</label>
                  <input
                    type="text"
                    value={overrideReason}
                    onChange={(e) => setOverrideReason(e.target.value)}
                    placeholder="e.g. Unit 01 has specialized flood sonar probe."
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-slate-200 text-xs font-mono mt-1"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleExecuteOverride}
                  disabled={!overrideResourceId || !overrideReason.trim()}
                  className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400 text-amber-300 font-bold rounded disabled:opacity-50 transition-all"
                >
                  CONFIRM COMMAND OVERRIDE & DISPATCH
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

