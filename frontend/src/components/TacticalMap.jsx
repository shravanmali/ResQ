import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  AlertCircle, 
  Navigation, 
  ShieldAlert, 
  Zap, 
  Radio, 
  Clock, 
  MapPin, 
  Layers,
  ChevronRight
} from 'lucide-react';
import { soundFx } from '../utils/audio';

// Custom SVG HTML DivIcon generator for Incidents
const createIncidentIcon = (tier, hazardType, priorityScore) => {
  const isP1 = tier === 'P1_CRITICAL' || priorityScore >= 85;
  const isP2 = tier === 'P2_HIGH' || priorityScore >= 65;
  const ringColor = isP1 ? '#ef4444' : isP2 ? '#f97316' : '#eab308';
  
  const html = `
    <div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;">
      <div style="
        position: absolute; 
        width: 100%; 
        height: 100%; 
        border-radius: 50%; 
        border: 2px solid ${ringColor}; 
        opacity: 0.8;
        animation: pulse-ring 1.8s infinite;
      "></div>
      <div style="
        width: 22px; 
        height: 22px; 
        border-radius: 50%; 
        background: rgba(15, 23, 42, 0.9); 
        border: 2px solid ${ringColor}; 
        box-shadow: 0 0 10px ${ringColor};
        display: flex; 
        align-items: center; 
        justify-content: center;
        color: ${ringColor};
        font-family: monospace;
        font-size: 10px;
        font-weight: bold;
      ">
        ${priorityScore}
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-incident-marker',
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -18]
  });
};

// Custom SVG HTML DivIcon generator for Resources
const createResourceIcon = (type, status) => {
  let color = '#00f0ff'; // default cyan
  let label = 'U';
  if (type === 'AMBULANCE') { color = '#10b981'; label = '🚑'; }
  else if (type === 'FIRE_ENGINE') { color = '#ef4444'; label = '🚒'; }
  else if (type === 'RESCUE_BOAT') { color = '#00f0ff'; label = '🚤'; }
  else if (type === 'HAZMAT_KIT') { color = '#c084fc'; label = '☣️'; }
  else if (type === 'HEAVY_CRANE') { color = '#f59e0b'; label = '🏗️'; }
  else if (type === 'POLICE_ESCORT') { color = '#3b82f6'; label = '🚔'; }

  const isDeployed = status === 'DISPATCHED' || status === 'ON_SCENE';

  const html = `
    <div style="position: relative; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center;">
      <div style="
        width: 26px; 
        height: 26px; 
        border-radius: 6px; 
        background: rgba(10, 15, 30, 0.95); 
        border: 1.5px solid ${isDeployed ? '#f59e0b' : color}; 
        box-shadow: 0 0 ${isDeployed ? '12px #f59e0b' : '8px ' + color};
        display: flex; 
        align-items: center; 
        justify-content: center;
        font-size: 13px;
      ">
        ${label}
      </div>
      ${isDeployed ? '<span style="position:absolute; top:-2px; right:-2px; width:7px; height:7px; background:#f59e0b; border-radius:50%;"></span>' : ''}
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-resource-marker',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -16]
  });
};

export default function TacticalMap({ 
  incidents = [], 
  resources = [], 
  allocations = [],
  roadBlockages = [],
  onSelectIncident
}) {
  const [mapType, setMapType] = useState('dark');
  const [filterType, setFilterType] = useState('ALL');
  const [selectedPin, setSelectedPin] = useState(null);

  // Map center focused on Mumbai/Navi Mumbai/Thane Region
  const defaultCenter = [19.0850, 72.8800];

  // Tile layers
  const tileUrl = mapType === 'dark'
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  const filteredIncidents = incidents.filter(i => {
    if (filterType === 'ALL') return true;
    return i.hazard_type === filterType;
  });

  return (
    <div className="relative w-full h-[calc(100vh-140px)] min-h-[550px] bg-slate-950 rounded-lg overflow-hidden border border-cyan-500/30 tactical-frame">
      {/* Tactical Map HUD Header Controls */}
      <div className="absolute top-3 left-3 z-[1000] flex flex-wrap items-center gap-2 bg-slate-950/85 backdrop-blur-md p-2 rounded border border-cyan-500/30">
        <div className="flex items-center gap-1.5 px-2 py-1 bg-cyan-950/60 rounded border border-cyan-400/40 text-[11px] font-mono text-cyan-300 font-bold">
          <Radio className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
          <span>GIS SURVEILLANCE RADAR</span>
        </div>

        {/* Hazard filter */}
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="bg-slate-900 border border-slate-700 text-slate-300 text-[11px] font-mono rounded px-2 py-1 outline-none focus:border-cyan-400"
        >
          <option value="ALL">ALL THREATS ({incidents.length})</option>
          <option value="FLOOD">FLOOD</option>
          <option value="FIRE">FIRE</option>
          <option value="HAZMAT">HAZMAT</option>
          <option value="COLLAPSE">COLLAPSE</option>
        </select>

        {/* Tile Theme Toggle */}
        <button
          onClick={() => setMapType(mapType === 'dark' ? 'street' : 'dark')}
          className="bg-slate-900 border border-slate-700 hover:border-cyan-400 px-2 py-1 rounded text-[11px] font-mono text-slate-300 flex items-center gap-1"
        >
          <Layers className="w-3 h-3 text-cyan-400" />
          <span>{mapType === 'dark' ? 'CYBER DARK' : 'STREET'}</span>
        </button>
      </div>

      {/* Map Legend HUD */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-slate-950/90 backdrop-blur-md p-2.5 rounded border border-cyan-500/30 text-[10px] font-mono space-y-1.5 pointer-events-auto">
        <div className="font-bold text-cyan-400 border-b border-cyan-500/20 pb-1">MAP TELEMETRY LEGEND</div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_6px_#ef4444]"></span>
          <span className="text-slate-300">P1 Extreme (Score ≥ 85)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-[0_0_6px_#f97316]"></span>
          <span className="text-slate-300">P2 High Urgency (65-84)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded bg-emerald-500/60 border border-emerald-400"></span>
          <span className="text-slate-300">Available Resource Unit</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded bg-amber-500/60 border border-amber-400"></span>
          <span className="text-slate-300">Dispatched / En Route</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-0.5 bg-cyan-400 border border-cyan-300"></span>
          <span className="text-slate-300">Vector Routing Route</span>
        </div>
      </div>

      {/* Live Active Mission Drawer */}
      {selectedPin && (
        <div className="absolute top-3 right-3 z-[1000] w-80 bg-slate-950/95 backdrop-blur-md p-3.5 rounded-lg border border-cyan-400 shadow-[0_0_20px_rgba(0,240,255,0.2)] font-mono text-xs">
          <div className="flex items-center justify-between border-b border-cyan-500/30 pb-2 mb-2">
            <span className="font-bold text-cyan-300 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-cyan-400" />
              {selectedPin.type === 'INCIDENT' ? selectedPin.data.id : selectedPin.data.name}
            </span>
            <button onClick={() => setSelectedPin(null)} className="text-slate-400 hover:text-white">✕</button>
          </div>

          {selectedPin.type === 'INCIDENT' ? (
            <div className="space-y-2">
              <div className="text-slate-200 font-bold">{selectedPin.data.title}</div>
              <div className="text-[11px] text-slate-400">{selectedPin.data.location_name}</div>
              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
                  <span className="text-slate-400">PRIORITY:</span>
                  <div className="text-cyan-300 font-bold">{selectedPin.data.priority_score}/100</div>
                </div>
                <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
                  <span className="text-slate-400">STATUS:</span>
                  <div className="text-amber-300 font-bold">{selectedPin.data.status}</div>
                </div>
              </div>
              <p className="text-[10px] text-slate-300 bg-cyan-950/30 p-2 rounded border border-cyan-500/20 italic">
                "{selectedPin.data.raw_text}"
              </p>
              {onSelectIncident && (
                <button
                  onClick={() => {
                    onSelectIncident(selectedPin.data);
                    setSelectedPin(null);
                  }}
                  className="w-full mt-2 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400 text-cyan-300 font-bold rounded flex items-center justify-center gap-1 transition-colors"
                >
                  <span>OPEN IN ALLOCATION XAI</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-slate-200 font-bold">{selectedPin.data.category}</div>
              <div className="text-[11px] text-slate-400">Base: {selectedPin.data.station_name}</div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
                  <span className="text-slate-400">STATUS:</span>
                  <div className="text-emerald-400 font-bold">{selectedPin.data.status}</div>
                </div>
                <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
                  <span className="text-slate-400">FUEL LEVEL:</span>
                  <div className="text-cyan-300 font-bold">{selectedPin.data.fuel_percent}%</div>
                </div>
              </div>
              <div className="text-[10px] text-slate-400">
                CAPABILITIES: {selectedPin.data.capabilities?.join(', ')}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Actual React-Leaflet Map Engine */}
      <MapContainer
        center={defaultCenter}
        zoom={11}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CartoDB</a> | OpenStreetMap'
          url={tileUrl}
        />

        {/* Road Blockage Circles */}
        {roadBlockages.map((blk) => (
          <Circle
            key={blk.id}
            center={[blk.lat, blk.lng]}
            radius={blk.radius_m || 500}
            pathOptions={{
              color: '#ef4444',
              fillColor: '#ef4444',
              fillOpacity: 0.35,
              dashArray: '4, 6'
            }}
          >
            <Popup>
              <div className="font-mono text-xs">
                <span className="text-red-600 font-bold">⚠️ ROAD HAZARD / DETOUR</span>
                <div>{blk.name}</div>
              </div>
            </Popup>
          </Circle>
        ))}

        {/* Render Vector Lines for Allocated / Dispatched Incidents */}
        {allocations.map((alloc) => {
          const inc = incidents.find(i => i.id === alloc.incident_id);
          const res = resources.find(r => r.id === alloc.resource_id);
          if (inc && res) {
            return (
              <Polyline
                key={`vector-${alloc.incident_id}-${alloc.resource_id}`}
                positions={[
                  [res.latitude, res.longitude],
                  [inc.latitude, inc.longitude]
                ]}
                pathOptions={{
                  color: '#00f0ff',
                  weight: 2.5,
                  opacity: 0.85,
                  dashArray: '6, 6'
                }}
              />
            );
          }
          return null;
        })}

        {/* Render Incidents */}
        {filteredIncidents.map((inc) => (
          <Marker
            key={inc.id}
            position={[inc.latitude, inc.longitude]}
            icon={createIncidentIcon(inc.priority_tier, inc.hazard_type, inc.priority_score)}
            eventHandlers={{
              click: () => {
                soundFx.playPing();
                setSelectedPin({ type: 'INCIDENT', data: inc });
              }
            }}
          />
        ))}

        {/* Render Resources */}
        {resources.map((res) => (
          <Marker
            key={res.id}
            position={[res.latitude, res.longitude]}
            icon={createResourceIcon(res.type, res.status)}
            eventHandlers={{
              click: () => {
                soundFx.playPing();
                setSelectedPin({ type: 'RESOURCE', data: res });
              }
            }}
          />
        ))}
      </MapContainer>
    </div>
  );
}

