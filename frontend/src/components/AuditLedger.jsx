import React, { useState, useEffect } from 'react';
import { ScrollText, ShieldCheck, Filter, Clock, User, Hash } from 'lucide-react';
import { soundFx } from '../utils/audio';

export default function AuditLedger() {
  const [logs, setLogs] = useState([]);
  const [filterAction, setFilterAction] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/audit-logs');
      const data = await res.json();
      setLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  const filteredLogs = logs.filter(l => {
    if (filterAction === 'ALL') return true;
    return l.action.includes(filterAction);
  });

  return (
    <div className="p-4 space-y-4 max-w-5xl mx-auto">
      {/* Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cyan-500/20 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <ScrollText className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold font-mono text-cyan-300 tracking-wider">
              IMMUTABLE AUDIT LOG & DECISION LEDGER
            </h2>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Slide 3 Workflow: 100% transparent audit trail of all AI recommendations and human officer authorizations.
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-cyan-400" />
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-300 text-xs font-mono rounded px-2.5 py-1 outline-none focus:border-cyan-400"
          >
            <option value="ALL">ALL LEDGER RECORDS</option>
            <option value="DISPATCH">DISPATCH DECISIONS</option>
            <option value="OVERRIDE">COMMAND OVERRIDES</option>
            <option value="INGESTED">INCIDENT INGESTION</option>
            <option value="WHATIF">WHAT-IF SIMULATION</option>
          </select>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="tactical-frame rounded-lg bg-slate-950/90 border border-cyan-500/30 overflow-hidden font-mono text-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-cyan-500/20 bg-slate-900/80 text-[10px] text-cyan-400 uppercase tracking-wider">
                <th className="p-3">RECORD ID</th>
                <th className="p-3">TIMESTAMP (UTC)</th>
                <th className="p-3">ACTION EVENT</th>
                <th className="p-3">OFFICER / AGENT</th>
                <th className="p-3">MISSION ID</th>
                <th className="p-3">DECISION SPECIFICATION</th>
                <th className="p-3">PROVENANCE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-[11px]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-cyan-400 animate-pulse">
                    FETCHING ENCRYPTED AUDIT LEDGER...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    No matching ledger entries found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const isOverride = log.action.includes('OVERRIDE');
                  const isDispatch = log.action.includes('DISPATCH');
                  return (
                    <tr key={log.id} className="hover:bg-slate-900/50 transition-colors">
                      <td className="p-3 font-bold text-cyan-300 flex items-center gap-1">
                        <Hash className="w-3 h-3 text-cyan-500" />
                        {log.id}
                      </td>
                      <td className="p-3 text-slate-400 text-[10px] whitespace-nowrap">
                        {log.timestamp.replace('T', ' ').slice(0, 19)}Z
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          isOverride
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : isDispatch
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30'
                        }`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="p-3 text-slate-300 text-[10px]">{log.officer_id}</td>
                      <td className="p-3 text-cyan-400 font-bold">{log.incident_id}</td>
                      <td className="p-3 text-slate-300 text-[10px] max-w-xs truncate" title={log.details}>
                        {log.details}
                      </td>
                      <td className="p-3 text-[10px] text-slate-400 font-mono">
                        {log.algorithm}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
