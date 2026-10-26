import React, { useState, useEffect } from 'react';
import { Shield, Volume2, VolumeX, RotateCcw, AlertTriangle, Radio, Users } from 'lucide-react';
import { soundFx } from '../utils/audio';

export default function HeaderHUD({ systemStatus, onResetDemo }) {
  const [currentTime, setCurrentTime] = useState(new Date().toUTCString().slice(17, 25));
  const [isMuted, setIsMuted] = useState(false);
  const [showRoster, setShowRoster] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toUTCString().slice(17, 25));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleToggleAudio = () => {
    const state = soundFx.toggleMute();
    setIsMuted(state);
    if (!state) soundFx.playPing();
  };

  const alertBg = systemStatus?.alert_state === 'DEFCON_1_RED'
    ? 'border-red-500 bg-red-950/40 text-red-400 animate-pulse'
    : systemStatus?.alert_state === 'DEFCON_2_AMBER'
    ? 'border-amber-500 bg-amber-950/40 text-amber-400'
    : 'border-emerald-500 bg-emerald-950/40 text-emerald-400';

  return (
    <header className="border-b border-cyan-500/20 bg-slate-950/90 backdrop-blur-md px-4 py-2.5 relative z-40 select-none">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Brand & Motto */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded bg-cyan-950/60 border border-cyan-400/40 shadow-[0_0_15px_rgba(0,240,255,0.25)]">
            <Radio className="w-5 h-5 text-cyan-400 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-cyan-400 rounded-full animate-ping"></span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-widest text-cyan-400 font-mono drop-shadow-[0_0_8px_rgba(0,240,255,0.6)]">
                RESQ
              </span>
              <span className="text-xs px-2 py-0.5 rounded font-mono font-bold bg-cyan-500/10 border border-cyan-400/30 text-cyan-300">
                C2 OPS // V2.4
              </span>
            </div>
            <p className="text-[10px] tracking-wider text-slate-400 font-mono uppercase">
              "Every Second Matters. Every Resource Counts."
            </p>
          </div>
        </div>

        {/* Defense Status & Live Mission Clock */}
        <div className="flex items-center gap-3">
          {/* Tactical DEFCON Pill */}
          <div className={`px-3 py-1 rounded border text-xs font-mono font-bold flex items-center gap-2 ${alertBg}`}>
            <span className="w-2 h-2 rounded-full bg-current"></span>
            <span>{systemStatus?.alert_label || 'DEFCON 2 // ESCALATED GRID'}</span>
          </div>

          {/* Mission UTC Clock */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded bg-slate-900 border border-slate-700/60 text-xs font-mono">
            <span className="text-slate-400">MISSION UTC:</span>
            <span className="text-cyan-300 font-bold tracking-wider">{currentTime}Z</span>
          </div>

          {/* Audio Synthesizer Toggle */}
          <button
            onClick={handleToggleAudio}
            title={isMuted ? "Unmute Audio Radar" : "Mute Audio Radar"}
            className="p-1.5 rounded border border-slate-700 hover:border-cyan-400/50 bg-slate-900 text-slate-300 hover:text-cyan-300 transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>

          {/* Project Roster Modal Toggle */}
          <button
            onClick={() => setShowRoster(!showRoster)}
            className="px-2.5 py-1 rounded border border-cyan-500/30 hover:border-cyan-400 bg-cyan-950/40 text-cyan-300 text-xs font-mono flex items-center gap-1.5 transition-all"
          >
            <Users className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">CREW ROSTER</span>
          </button>

          {/* Reset Demo Button */}
          <button
            onClick={onResetDemo}
            title="Reset to Baseline Demo State"
            className="p-1.5 rounded border border-slate-700 hover:border-amber-400/60 bg-slate-900 text-slate-400 hover:text-amber-400 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Team Roster Overlay Modal */}
      {showRoster && (
        <div className="absolute top-14 right-4 w-80 p-4 rounded-lg bg-slate-950 border border-cyan-500/40 shadow-2xl z-50 tactical-frame">
          <div className="flex items-center justify-between pb-2 border-b border-cyan-500/20 mb-3">
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
              Project Team (DIPLOMA CE)
            </span>
            <button onClick={() => setShowRoster(false)} className="text-slate-400 hover:text-white text-xs">✕</button>
          </div>
          <div className="space-y-2 text-xs font-mono">
            <div className="p-2 rounded bg-cyan-950/30 border border-cyan-500/20">
              <span className="text-cyan-300 font-bold">Swastik Patil</span> <span className="text-slate-400">(Roll 22)</span>
              <p className="text-[10px] text-slate-400">Lead System Architecture & Dispatch Gate</p>
            </div>
            <div className="p-2 rounded bg-cyan-950/30 border border-cyan-500/20">
              <span className="text-cyan-300 font-bold">Shravan Mali</span> <span className="text-slate-400">(Roll 26)</span>
              <p className="text-[10px] text-slate-400">GIS & Spatial Routing Network</p>
            </div>
            <div className="p-2 rounded bg-cyan-950/30 border border-cyan-500/20">
              <span className="text-cyan-300 font-bold">Riddhi Chalke</span> <span className="text-slate-400">(Roll 27)</span>
              <p className="text-[10px] text-slate-400">AI / NLP & Deterministic Priority Engine</p>
            </div>
            <div className="p-2 rounded bg-cyan-950/30 border border-cyan-500/20">
              <span className="text-cyan-300 font-bold">Mrunmay Raut</span> <span className="text-slate-400">(Roll 38)</span>
              <p className="text-[10px] text-slate-400">Hungarian Algorithm & Explainable AI (XAI)</p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
