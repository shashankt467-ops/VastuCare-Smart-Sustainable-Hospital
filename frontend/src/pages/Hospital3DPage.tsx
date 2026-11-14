import React, { useState } from 'react';
import { ZoneData } from '../types';
import { Hospital3DScene } from '../3d/Hospital3DScene';
import { Layers, Sun, Droplets, Trash2, Wind, X, CheckCircle2, AlertTriangle, Compass } from 'lucide-react';

interface Hospital3DPageProps {
  zones: ZoneData[];
  dayNightMode: 'DAY' | 'NIGHT';
}

export function Hospital3DPage({ zones, dayNightMode }: Hospital3DPageProps) {
  const [selectedZone, setSelectedZone] = useState<ZoneData | null>(null);
  const [activeFloor, setActiveFloor] = useState<'ALL' | 'GROUND' | 'FIRST' | 'SECOND'>('ALL');
  const [activeLayer, setActiveLayer] = useState<'NONE' | 'SOLAR' | 'WATER' | 'WASTE' | 'AIR'>('NONE');

  return (
    <div className="space-y-4 h-[calc(100vh-6.5rem)] flex flex-col">
      {/* 3D Toolbar Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 glass-panel p-3 rounded-2xl shrink-0">
        {/* Floor Selection */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 px-2">Floor:</span>
          {(['ALL', 'GROUND', 'FIRST', 'SECOND'] as const).map((floor) => (
            <button
              key={floor}
              onClick={() => setActiveFloor(floor)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeFloor === floor
                  ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
              }`}
            >
              {floor === 'ALL' ? 'All Floors' : floor === 'GROUND' ? 'Ground' : floor === 'FIRST' ? '1st Floor' : '2nd Floor'}
            </button>
          ))}
        </div>

        {/* Sustainability Layer Toggles */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 px-2 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-teal-400" />
            Layer:
          </span>
          <button
            onClick={() => setActiveLayer(activeLayer === 'SOLAR' ? 'NONE' : 'SOLAR')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeLayer === 'SOLAR'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            Solar Array
          </button>

          <button
            onClick={() => setActiveLayer(activeLayer === 'WATER' ? 'NONE' : 'WATER')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeLayer === 'WATER'
                ? 'bg-sky-500 text-slate-950 font-bold'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Droplets className="w-3.5 h-3.5" />
            Water Harvest
          </button>

          <button
            onClick={() => setActiveLayer(activeLayer === 'WASTE' ? 'NONE' : 'WASTE')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeLayer === 'WASTE'
                ? 'bg-rose-500 text-slate-950 font-bold'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            Waste Station
          </button>

          <button
            onClick={() => setActiveLayer(activeLayer === 'AIR' ? 'NONE' : 'AIR')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeLayer === 'AIR'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Wind className="w-3.5 h-3.5" />
            Air Quality
          </button>
        </div>
      </div>

      {/* Main 3D Canvas Area */}
      <div className="relative flex-1 rounded-2xl overflow-hidden">
        <Hospital3DScene
          zones={zones}
          selectedZone={selectedZone}
          onSelectZone={setSelectedZone}
          activeFloor={activeFloor}
          activeLayer={activeLayer}
          dayNightMode={dayNightMode}
        />

        {/* Selected Zone Inspector Modal Overlay */}
        {selectedZone && (
          <div className="absolute right-4 top-4 bottom-4 w-96 glass-panel p-5 rounded-2xl space-y-4 overflow-y-auto shadow-2xl border border-teal-500/30 z-20">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase text-teal-400 tracking-wider">
                  Zone Inspector
                </span>
                <h3 className="text-lg font-bold text-white">{selectedZone.name}</h3>
              </div>
              <button
                onClick={() => setSelectedZone(null)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status Pill */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Environmental Status:</span>
              <span
                className={`px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                  selectedZone.airQualityStatus === 'CRITICAL'
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    : selectedZone.airQualityStatus === 'WARNING'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}
              >
                {selectedZone.airQualityStatus === 'CRITICAL' ? (
                  <AlertTriangle className="w-3.5 h-3.5" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                )}
                {selectedZone.airQualityStatus}
              </span>
            </div>

            {/* Live Metrics Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="glass-card p-3 rounded-xl">
                <div className="text-[11px] text-slate-400">Occupancy</div>
                <div className="text-base font-bold text-white">{selectedZone.occupancy}%</div>
              </div>
              <div className="glass-card p-3 rounded-xl">
                <div className="text-[11px] text-slate-400">Temperature</div>
                <div className="text-base font-bold text-teal-300">{selectedZone.temperature}°C</div>
              </div>
              <div className="glass-card p-3 rounded-xl">
                <div className="text-[11px] text-slate-400">CO2 Concentration</div>
                <div className="text-base font-bold text-amber-300">{selectedZone.co2} ppm</div>
              </div>
              <div className="glass-card p-3 rounded-xl">
                <div className="text-[11px] text-slate-400">Energy Draw</div>
                <div className="text-base font-bold text-yellow-300">{selectedZone.energyLoad} kW</div>
              </div>
            </div>

            {/* Vastu Architecture Alignment */}
            <div className="space-y-1.5 glass-card p-3 rounded-xl border border-amber-500/20 bg-amber-950/10">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
                <Compass className="w-4 h-4" />
                Vastu Alignment
              </div>
              <div className="text-xs font-semibold text-slate-200">{selectedZone.vastuOrientation}</div>
              <p className="text-[11px] text-slate-400 leading-relaxed">{selectedZone.vastuBenefit}</p>
            </div>

            {/* Zone AI Recommendations */}
            {selectedZone.recommendations.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-300">Zone Recommendations:</span>
                <ul className="space-y-1">
                  {selectedZone.recommendations.map((rec, idx) => (
                    <li key={idx} className="text-xs text-slate-400 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                      • {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
