import React, { useState } from 'react';
import { 
  FileText, 
  Sparkles, 
  Cpu, 
  Send, 
  Eye, 
  CheckCircle, 
  AlertOctagon, 
  Flame, 
  Droplet, 
  Building2, 
  ShieldAlert,
  Sliders
} from 'lucide-react';
import { soundFx } from '../utils/audio';
import { api } from '../utils/apiClient';

const PRESETS = [
  {
    title: "Flood Trapped Commuters",
    text: "Heavy flooding near the railway station. Several people are trapped and require immediate rescue assistance.",
    vision: "flood_water"
  },
  {
    title: "MIDC Toxic Chemical Blaze",
    text: "Solvent reactor exploded at petrochemical warehouse. Toxic fumes drifting toward residential colony, 5 workers burned, rapid spread.",
    vision: "fire_smoke"
  },
  {
    title: "Flyover Concrete Collapse",
    text: "Major flyover girder collapsed on expressway during rush hour. Multiple vehicles crushed beneath rubble with trapped passengers.",
    vision: "building_debris"
  }
];

export default function IncidentIntake({ onIncidentCreated, onSwitchTab }) {
  const [reportText, setReportText] = useState(PRESETS[0].text);
  const [visionPreset, setVisionPreset] = useState("flood_water");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  const handleRunAnalysis = async () => {
    if (!reportText.trim()) return;
    setIsAnalyzing(true);
    setAnalysisResult(null);
    setSuccessMessage(null);
    soundFx.playPing();

    try {
      const data = await api.post('/api/incidents/ai-extract', {
        report_text: reportText,
        vision_preset: visionPreset
      });
      setAnalysisResult(data);
      soundFx.playAlert();
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCommitToGrid = async () => {
    if (!analysisResult) return;
    setIsSubmitting(true);
    soundFx.playAuthorize();

    const { extracted, priority } = analysisResult;
    try {
      const created = await api.post('/api/incidents', {
        title: extracted.brief_summary || `${extracted.hazard_type} Emergency`,
        raw_text: reportText,
        hazard_type: extracted.hazard_type,
        location_name: extracted.location_name,
        latitude: extracted.latitude,
        longitude: extracted.longitude,
        trapped_count: extracted.trapped_count,
        injured_count: extracted.injured_count,
        urgency: extracted.urgency,
        severity: extracted.severity,
        required_capabilities: extracted.required_capabilities,
        secondary_risks: extracted.secondary_risks,
        priority_score: priority.score,
        priority_tier: priority.tier
      });
      setSuccessMessage(`MISSION LOGGED: ${created.id} committed to live dispatch grid!`);
      if (onIncidentCreated) onIncidentCreated(created);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 space-y-5 max-w-6xl mx-auto">
      {/* Module Title Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cyan-500/20 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold font-mono text-cyan-300 tracking-wider">
              AI-ASSISTED INCIDENT INTAKE & NLP EXTRACTION
            </h2>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Slide 4 Architecture: Turning unstructured natural language reports into structured decision inputs.
          </p>
        </div>

        {/* Quick Demo Presets */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-slate-400">DEMO PRESETS:</span>
          {PRESETS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => {
                setReportText(p.text);
                setVisionPreset(p.vision);
                soundFx.playPing();
              }}
              className="text-[11px] font-mono px-2 py-1 rounded bg-slate-900 border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-cyan-300 transition-colors"
            >
              Preset {idx + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Input Section & Vision Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Natural Language Report Box */}
        <div className="lg:col-span-2 tactical-frame p-4 rounded-lg bg-slate-950/80 border border-cyan-500/30 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-cyan-400 font-bold">
            <span className="flex items-center gap-1.5">
              <FileText className="w-4 h-4" />
              EMERGENCY REPORT (NATURAL LANGUAGE OR VOICE TRANSCRIPT)
            </span>
            <span className="text-slate-400 font-normal">INPUT VECTOR 01</span>
          </div>

          <textarea
            value={reportText}
            onChange={(e) => setReportText(e.target.value)}
            rows={4}
            placeholder="Type or paste emergency 112/911 call transcript, citizen dispatch message, or radio log..."
            className="w-full bg-slate-900/90 border border-slate-800 rounded p-3 font-mono text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 resize-none"
          />

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            {/* Optional Computer Vision Classifier */}
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-mono text-slate-400">DAMAGE VISION FEED:</span>
              <select
                value={visionPreset}
                onChange={(e) => setVisionPreset(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-slate-300 text-xs font-mono rounded px-2.5 py-1 outline-none focus:border-cyan-400"
              >
                <option value="flood_water">🌊 Water Inundation (Aerial / Satellite)</option>
                <option value="fire_smoke">🔥 Thermal Flare / Plume Detection</option>
                <option value="building_debris">🏗️ Structural Debris / Concrete Pancaking</option>
              </select>
            </div>

            <button
              onClick={handleRunAnalysis}
              disabled={isAnalyzing || !reportText.trim()}
              className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400 text-cyan-300 text-xs font-mono font-bold rounded flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(0,240,255,0.2)] disabled:opacity-50"
            >
              <Cpu className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
              <span>{isAnalyzing ? 'RUNNING GROQ & PRIORITY ENGINE...' : 'ANALYZE & EXTRACT SCHEMA'}</span>
            </button>
          </div>
        </div>

        {/* Fast Reference Card */}
        <div className="tactical-frame p-4 rounded-lg bg-slate-950/80 border border-cyan-500/30 space-y-3 font-mono text-xs">
          <div className="font-bold text-cyan-400 flex items-center gap-1.5 border-b border-cyan-500/20 pb-1.5">
            <Sliders className="w-4 h-4 text-cyan-400" />
            PRIORITY ENGINE WEIGHTS
          </div>
          <div className="space-y-1.5 text-[11px] text-slate-400">
            <div className="flex justify-between">
              <span>Urgency Factor:</span>
              <span className="text-cyan-300 font-bold">35 pts max</span>
            </div>
            <div className="flex justify-between">
              <span>Severity Factor:</span>
              <span className="text-cyan-300 font-bold">25 pts max</span>
            </div>
            <div className="flex justify-between">
              <span>Human Life Risk:</span>
              <span className="text-cyan-300 font-bold">25 pts max</span>
            </div>
            <div className="flex justify-between">
              <span>Hazard Vulnerability:</span>
              <span className="text-cyan-300 font-bold">15 pts max</span>
            </div>
            <div className="flex justify-between border-t border-slate-800 pt-1">
              <span>Secondary Cascading Bonus:</span>
              <span className="text-amber-400 font-bold">+15 pts</span>
            </div>
          </div>
          <div className="text-[10px] text-slate-400 italic bg-slate-900/60 p-2 rounded border border-slate-800">
            "Deterministic 0-100 scoring eliminates subjective human cognitive overload during mass-casualty triage."
          </div>
        </div>
      </div>

      {/* Structured Output & Deterministic Priority Visualization */}
      {analysisResult && (
        <div className="tactical-frame p-4 rounded-lg bg-slate-950/90 border border-cyan-400/50 shadow-[0_0_20px_rgba(0,240,255,0.15)] space-y-4 animate-in fade-in duration-300">
          <div className="flex flex-wrap items-center justify-between border-b border-cyan-500/20 pb-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              <span className="text-xs font-mono font-bold text-emerald-300 tracking-wider">
                EXTRACTED SCHEMATIC MODEL ({analysisResult.extracted.ai_source})
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              LOCATION RESOLVED: {analysisResult.extracted.location_normalized} [{analysisResult.extracted.latitude.toFixed(4)}, {analysisResult.extracted.longitude.toFixed(4)}]
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Structured JSON Attributes */}
            <div className="md:col-span-2 space-y-3 font-mono text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400">HAZARD TYPE</span>
                  <div className="text-cyan-300 font-bold">{analysisResult.extracted.hazard_type}</div>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400">TRAPPED / INJURED</span>
                  <div className="text-red-400 font-bold">
                    {analysisResult.extracted.trapped_count} trapped · {analysisResult.extracted.injured_count} injured
                  </div>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400">URGENCY</span>
                  <div className="text-amber-300 font-bold">{analysisResult.extracted.urgency}</div>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400">SEVERITY</span>
                  <div className="text-amber-300 font-bold">{analysisResult.extracted.severity}</div>
                </div>
              </div>

              {/* Required Capabilities Pill List */}
              <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800 space-y-1.5">
                <span className="text-[10px] text-slate-400 uppercase">Required Response Capabilities:</span>
                <div className="flex flex-wrap gap-1.5">
                  {analysisResult.extracted.required_capabilities.map((cap, i) => (
                    <span key={i} className="px-2 py-0.5 rounded font-mono text-[10px] bg-cyan-500/10 border border-cyan-400/40 text-cyan-300">
                      {cap}
                    </span>
                  ))}
                </div>
              </div>

              {/* Vision Classifier Telemetry if available */}
              {analysisResult.vision_classification && (
                <div className="p-2.5 rounded bg-purple-950/20 border border-purple-500/30 text-[11px] text-purple-300 space-y-1">
                  <span className="font-bold flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" />
                    VISION INFERENCE: {analysisResult.vision_classification.damage_level}
                  </span>
                  <div className="text-[10px] text-slate-300">
                    Confidence: {(analysisResult.vision_classification.confidence * 100).toFixed(1)}% · Recommended gear: {analysisResult.vision_classification.recommended_capability.join(', ')}
                  </div>
                </div>
              )}
            </div>

            {/* Deterministic Priority Score Dial & Breakdown */}
            <div className="p-3.5 rounded bg-slate-900/90 border border-cyan-500/30 font-mono space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">PRIORITY SCORE</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                  analysisResult.priority.score >= 85 ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                }`}>
                  {analysisResult.priority.tier}
                </span>
              </div>

              {/* Score Dial Display */}
              <div className="flex items-baseline justify-center py-2">
                <span className="text-4xl font-black text-cyan-300 font-mono drop-shadow-[0_0_12px_rgba(0,240,255,0.4)]">
                  {analysisResult.priority.score}
                </span>
                <span className="text-sm text-slate-400 font-mono ml-1">/ 100</span>
              </div>

              {/* Factor Breakdown Bars */}
              <div className="space-y-1.5 text-[10px]">
                {Object.entries(analysisResult.priority.breakdown).map(([k, comp]) => (
                  <div key={k} className="space-y-0.5">
                    <div className="flex justify-between text-slate-400">
                      <span>{comp.label}</span>
                      <span className="text-cyan-300">{comp.value} / {comp.max}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded overflow-hidden">
                      <div 
                        className="h-full bg-cyan-400 transition-all duration-500"
                        style={{ width: `${comp.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-cyan-500/20">
            {successMessage ? (
              <div className="text-xs font-mono text-emerald-400 font-bold flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>{successMessage}</span>
              </div>
            ) : (
              <span className="text-xs font-mono text-slate-400">
                Ready for operational dispatch queuing.
              </span>
            )}

            <div className="flex items-center gap-2">
              {successMessage && onSwitchTab && (
                <button
                  onClick={() => onSwitchTab('ALLOCATION')}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono rounded"
                >
                  VIEW ALLOCATION MATRIX →
                </button>
              )}
              <button
                onClick={handleCommitToGrid}
                disabled={isSubmitting}
                className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400 text-emerald-300 font-mono text-xs font-bold rounded flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(16,185,129,0.25)]"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'COMMITTING TO GRID...' : 'INGEST TO OPERATIONAL GRID'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

