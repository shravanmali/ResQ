import React, { useState, useEffect } from 'react';
import { BarChart3, Activity, Shield, Truck, AlertCircle, CheckCircle } from 'lucide-react';

export default function AnalyticsPanel() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/stats');
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 6000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !stats) {
    return (
      <div className="p-12 text-center font-mono text-xs text-cyan-400 animate-pulse">
        CALCULATING FLEET TELEMETRY & DISPATCH METRICS...
      </div>
    );
  }

  const { overview, priority_breakdown, fleet_status } = stats;

  return (
    <div className="p-4 space-y-5 max-w-5xl mx-auto">
      {/* Banner */}
      <div className="border-b border-cyan-500/20 pb-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-cyan-400" />
          <h2 className="text-base font-bold font-mono text-cyan-300 tracking-wider">
            COMMANDER TELEMETRY & FLEET ANALYTICS
          </h2>
        </div>
        <p className="text-xs text-slate-400 font-mono mt-0.5">
          Slide 8: Operational efficiency, fleet readiness, and incident density metrics.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
        <div className="tactical-frame p-3.5 rounded bg-slate-950/80 border border-cyan-500/30">
          <span className="text-[10px] text-slate-400 uppercase">Fleet Readiness</span>
          <div className="text-2xl font-black text-cyan-300 mt-1">{overview.fleet_readiness_pct}%</div>
          <span className="text-[10px] text-emerald-400">Available for Dispatch</span>
        </div>

        <div className="tactical-frame p-3.5 rounded bg-slate-950/80 border border-cyan-500/30">
          <span className="text-[10px] text-slate-400 uppercase">Active Missions</span>
          <div className="text-2xl font-black text-amber-300 mt-1">{overview.dispatched} DEPLOYED</div>
          <span className="text-[10px] text-slate-400">{overview.pending} Pending Review</span>
        </div>

        <div className="tactical-frame p-3.5 rounded bg-slate-950/80 border border-cyan-500/30">
          <span className="text-[10px] text-slate-400 uppercase">Critical P1 Threats</span>
          <div className="text-2xl font-black text-red-400 mt-1">{priority_breakdown.p1_critical} ACTIVE</div>
          <span className="text-[10px] text-red-400/80">Immediate Priority</span>
        </div>

        <div className="tactical-frame p-3.5 rounded bg-slate-950/80 border border-cyan-500/30">
          <span className="text-[10px] text-slate-400 uppercase">Signed Dispatches</span>
          <div className="text-2xl font-black text-emerald-400 mt-1">{stats.total_audit_decisions}</div>
          <span className="text-[10px] text-slate-400">Audit Verified</span>
        </div>
      </div>

      {/* Breakdown Grids */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Priority Tier Distribution */}
        <div className="tactical-frame p-4 rounded-lg bg-slate-950/90 border border-cyan-500/30 font-mono text-xs space-y-3">
          <span className="text-cyan-400 font-bold uppercase tracking-wider">
            PRIORITY SEVERITY DISTRIBUTION (0-100 ENGINE)
          </span>

          <div className="space-y-2 pt-1 text-[11px]">
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-red-400 font-bold">P1 CRITICAL (Score 85-100)</span>
                <span className="text-slate-300">{priority_breakdown.p1_critical} events</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded overflow-hidden">
                <div className="h-full bg-red-500" style={{ width: `${(priority_breakdown.p1_critical / Math.max(1, overview.total_incidents)) * 100}%` }}></div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-orange-400 font-bold">P2 HIGH (Score 65-84)</span>
                <span className="text-slate-300">{priority_breakdown.p2_high} events</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded overflow-hidden">
                <div className="h-full bg-orange-500" style={{ width: `${(priority_breakdown.p2_high / Math.max(1, overview.total_incidents)) * 100}%` }}></div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-yellow-400 font-bold">P3 MEDIUM (Score 40-64)</span>
                <span className="text-slate-300">{priority_breakdown.p3_medium} events</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded overflow-hidden">
                <div className="h-full bg-yellow-500" style={{ width: `${(priority_breakdown.p3_medium / Math.max(1, overview.total_incidents)) * 100}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Fleet Allocation Status */}
        <div className="tactical-frame p-4 rounded-lg bg-slate-950/90 border border-cyan-500/30 font-mono text-xs space-y-3">
          <span className="text-cyan-400 font-bold uppercase tracking-wider">
            OPERATIONAL FLEET STATUS
          </span>

          <div className="space-y-2 pt-1 text-[11px]">
            <div className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800">
              <span className="text-emerald-400 flex items-center gap-1.5 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                AVAILABLE / PATROL READY:
              </span>
              <span className="text-slate-200 font-bold">{fleet_status.available} Units</span>
            </div>

            <div className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800">
              <span className="text-amber-400 flex items-center gap-1.5 font-bold">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                DISPATCHED / EN ROUTE:
              </span>
              <span className="text-slate-200 font-bold">{fleet_status.deployed} Units</span>
            </div>

            <div className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800">
              <span className="text-slate-400 flex items-center gap-1.5 font-bold">
                <span className="w-2 h-2 rounded-full bg-slate-500"></span>
                MAINTENANCE / DEPLETED:
              </span>
              <span className="text-slate-200 font-bold">{fleet_status.maintenance} Units</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
