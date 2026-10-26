import React, { useState, useEffect } from 'react';
import HeaderHUD from './components/HeaderHUD';
import NavigationDock from './components/NavigationDock';
import TacticalMap from './components/TacticalMap';
import IncidentIntake from './components/IncidentIntake';
import AllocationXAI from './components/AllocationXAI';
import DispatchApprovalGate from './components/DispatchApprovalGate';
import WhatIfSimulation from './components/WhatIfSimulation';
import AuditLedger from './components/AuditLedger';
import AnalyticsPanel from './components/AnalyticsPanel';
import { soundFx } from './utils/audio';

export default function App() {
  const [activeTab, setActiveTab] = useState('RADAR');
  const [systemStatus, setSystemStatus] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [resources, setResources] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [shortages, setShortages] = useState([]);
  const [selectedAllocationForDispatch, setSelectedAllocationForDispatch] = useState(null);
  const [roadBlockages, setRoadBlockages] = useState([
    { id: "BLK-01", name: "Vashi Old Toll Naka Waterlogging", lat: 19.0735, lng: 72.9850, radius_m: 500 }
  ]);
  const [notification, setNotification] = useState(null);

  // Fetch full live state
  const refreshState = async () => {
    try {
      const [statusRes, incRes, resRes, allocRes] = await Promise.all([
        fetch('/api/status'),
        fetch('/api/incidents'),
        fetch('/api/resources'),
        fetch('/api/allocation?algorithm=HUNGARIAN')
      ]);

      const [statusData, incData, resData, allocData] = await Promise.all([
        statusRes.json(),
        incRes.json(),
        resRes.json(),
        allocRes.json()
      ]);

      setSystemStatus(statusData);
      setIncidents(incData);
      setResources(resData);
      setAllocations(allocData.assignments || []);
      setShortages(allocData.shortage_alerts || []);
    } catch (err) {
      console.error("State refresh error:", err);
    }
  };

  useEffect(() => {
    refreshState();
    const interval = setInterval(refreshState, 6000);
    return () => clearInterval(interval);
  }, []);

  const triggerToast = (msg, type = 'info') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleIncidentCreated = (newIncident) => {
    soundFx.playAlert();
    triggerToast(`NEW INCIDENT LOGGED: ${newIncident.title} (Priority ${newIncident.priority_score})`, 'alert');
    refreshState();
    setActiveTab('ALLOCATION');
  };

  const handleOpenDispatchGate = (allocation) => {
    soundFx.playPing();
    setSelectedAllocationForDispatch(allocation);
    setActiveTab('APPROVAL');
  };

  const handleDispatchConfirmed = (result) => {
    soundFx.playAuthorize();
    triggerToast(`DISPATCH CONFIRMED: ${result.message}`, 'success');
    refreshState();
    setActiveTab('RADAR');
  };

  const handleResetDemo = async () => {
    soundFx.playPing();
    try {
      await fetch('/api/reset-demo', { method: 'POST' });
      triggerToast("DEMO DATABASE RESTORED TO BASELINE SCENARIO", 'info');
      refreshState();
      setActiveTab('RADAR');
    } catch (err) {
      console.error(err);
    }
  };

  const pendingIncidents = incidents.filter(i => i.status === 'PENDING_DISPATCH');

  return (
    <div className="min-h-screen bg-[#050811] text-slate-100 flex flex-col font-sans select-none relative">
      {/* Scanline CRT subtle effect */}
      <div className="fixed inset-0 scanlines pointer-events-none z-50"></div>

      {/* Top Tactical HUD Header */}
      <HeaderHUD
        systemStatus={systemStatus}
        onResetDemo={handleResetDemo}
      />

      {/* Navigation Dock */}
      <NavigationDock
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingCount={pendingIncidents.length}
        shortageCount={shortages.length}
      />

      {/* Toast Notification Banner */}
      {notification && (
        <div className="fixed top-24 right-6 z-50 animate-in slide-in-from-top-4 duration-300">
          <div className="px-4 py-2.5 rounded-lg bg-slate-950/95 border border-cyan-400 text-cyan-300 text-xs font-mono font-bold shadow-[0_0_20px_rgba(0,240,255,0.4)] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
            <span>{notification.msg}</span>
          </div>
        </div>
      )}

      {/* Main Mission Viewport */}
      <main className="flex-1 p-3 md:p-4 overflow-y-auto">
        {activeTab === 'RADAR' && (
          <TacticalMap
            incidents={incidents}
            resources={resources}
            allocations={allocations}
            roadBlockages={roadBlockages}
            onSelectIncident={(inc) => {
              const paired = allocations.find(a => a.incident_id === inc.id);
              if (paired) {
                handleOpenDispatchGate(paired);
              } else {
                setActiveTab('ALLOCATION');
              }
            }}
          />
        )}

        {activeTab === 'INTAKE' && (
          <IncidentIntake
            onIncidentCreated={handleIncidentCreated}
            onSwitchTab={setActiveTab}
          />
        )}

        {activeTab === 'ALLOCATION' && (
          <AllocationXAI
            onOpenDispatchGate={handleOpenDispatchGate}
          />
        )}

        {activeTab === 'APPROVAL' && (
          <DispatchApprovalGate
            selectedAllocation={selectedAllocationForDispatch || (allocations.length > 0 ? allocations[0] : null)}
            onDispatchConfirmed={handleDispatchConfirmed}
            allResources={resources}
            pendingIncidents={pendingIncidents}
          />
        )}

        {activeTab === 'WHATIF' && (
          <WhatIfSimulation />
        )}

        {activeTab === 'AUDIT' && (
          <AuditLedger />
        )}

        {activeTab === 'ANALYTICS' && (
          <AnalyticsPanel />
        )}
      </main>

      {/* Footer Status Bar */}
      <footer className="border-t border-cyan-500/20 bg-slate-950/90 px-4 py-1.5 flex flex-wrap items-center justify-between text-[10px] font-mono text-slate-400 z-40">
        <div className="flex items-center gap-3">
          <span className="text-cyan-400 font-bold">GRID ENCRYPTION: SHA-256</span>
          <span className="hidden sm:inline">|</span>
          <span className="hidden sm:inline text-slate-300">FastAPI + React 19 + Leaflet GIS</span>
          <span className="hidden sm:inline">|</span>
          <span className="text-emerald-400">LATENCY: 12ms</span>
        </div>
        <div className="flex items-center gap-3">
          <span>Swastik Patil (22) · Shravan Mali (26) · Riddhi Chalke (27) · Mrunmay Raut (38)</span>
          <span className="text-cyan-300 font-bold">MAJOR PROJECT · DIPLOMA CE</span>
        </div>
      </footer>
    </div>
  );
}
