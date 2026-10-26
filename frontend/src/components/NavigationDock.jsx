import React from 'react';
import { 
  Radar, 
  FileText, 
  Cpu, 
  CheckCircle2, 
  GitBranch, 
  ScrollText, 
  BarChart3 
} from 'lucide-react';
import { soundFx } from '../utils/audio';

export default function NavigationDock({ activeTab, setActiveTab, pendingCount, shortageCount }) {
  const tabs = [
    { id: 'RADAR', label: 'GIS RADAR', icon: Radar, badge: null },
    { id: 'INTAKE', label: 'AI/NLP INTAKE', icon: FileText, badge: null },
    { id: 'ALLOCATION', label: 'OPTIMAL XAI', icon: Cpu, badge: shortageCount > 0 ? `${shortageCount} ALERT` : null, alert: shortageCount > 0 },
    { id: 'APPROVAL', label: 'DISPATCH GATE', icon: CheckCircle2, badge: pendingCount > 0 ? pendingCount : null, alert: pendingCount > 0 },
    { id: 'WHATIF', label: 'WHAT-IF SANDBOX', icon: GitBranch, badge: 'SIM' },
    { id: 'AUDIT', label: 'AUDIT LEDGER', icon: ScrollText, badge: null },
    { id: 'ANALYTICS', label: 'TELEMETRY', icon: BarChart3, badge: null }
  ];

  const handleSelect = (tabId) => {
    soundFx.playPing();
    setActiveTab(tabId);
  };

  return (
    <nav className="border-b border-cyan-500/20 bg-slate-950/80 px-4 py-1.5 flex items-center justify-start overflow-x-auto gap-2 select-none">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => handleSelect(tab.id)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded font-mono text-xs font-bold transition-all whitespace-nowrap ${
              isActive
                ? 'bg-cyan-500/20 border border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(0,240,255,0.3)]'
                : 'bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
            <span>{tab.label}</span>
            {tab.badge && (
              <span
                className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                  tab.alert
                    ? 'bg-red-500/20 text-red-400 border border-red-500/50 animate-pulse'
                    : 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30'
                }`}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
