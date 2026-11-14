import React from 'react';
import { EnergyMetrics, WaterMetrics } from '../types';
import { Sun, Zap, Droplets, ArrowRight, ShieldAlert, CheckCircle2, Battery, RefreshCw } from 'lucide-react';

interface EnergyWaterPageProps {
  energy: EnergyMetrics | null;
  water: WaterMetrics | null;
}

export function EnergyWaterPage({ energy, water }: EnergyWaterPageProps) {
  if (!energy || !water) {
    return <div className="text-center py-12 text-slate-400">Loading Energy & Water metrics...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">Renewable Energy & Water Microgrid</h2>
        <p className="text-xs text-slate-400">Rooftop solar generation, grid balance, rainwater harvesting & greywater recycling</p>
      </div>

      {/* Energy Flow Diagram */}
      <div className="glass-panel p-6 rounded-2xl border border-amber-500/20 bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/20">
        <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <Sun className="w-5 h-5 text-amber-400" />
          Interactive Energy Flow Network
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center text-center">
          {/* Node 1: Solar */}
          <div className="glass-card p-4 rounded-xl border border-amber-500/30">
            <div className="text-xs text-amber-400 font-semibold mb-1">Rooftop Solar Array</div>
            <div className="text-xl font-bold text-white">{energy.solarGenerationKw} kW</div>
            <div className="text-[11px] text-slate-400">Peak Daylight Output</div>
          </div>

          <ArrowRight className="w-6 h-6 text-amber-400 mx-auto hidden md:block animate-pulse" />

          {/* Node 2: Inverter */}
          <div className="glass-card p-4 rounded-xl border border-teal-500/30">
            <div className="text-xs text-teal-400 font-semibold mb-1">Smart Hospital Inverter</div>
            <div className="text-xl font-bold text-white">{energy.renewablePercentage}%</div>
            <div className="text-[11px] text-slate-400">Renewable Energy Mix</div>
          </div>

          <ArrowRight className="w-6 h-6 text-teal-400 mx-auto hidden md:block animate-pulse" />

          {/* Node 3: Hospital Demand */}
          <div className="glass-card p-4 rounded-xl border border-sky-500/30">
            <div className="text-xs text-sky-400 font-semibold mb-1">Hospital Power Load</div>
            <div className="text-xl font-bold text-white">{energy.totalConsumptionKw} kW</div>
            <div className="text-[11px] text-slate-400">Grid Draw: {energy.gridDrawKw} kW</div>
          </div>
        </div>
      </div>

      {/* Water Harvesting & Leak Detection */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Water Management Card */}
        <div className="glass-card p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Droplets className="w-5 h-5 text-sky-400" />
              <h3 className="text-base font-bold text-white">Water Harvesting & Recycling</h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-400 text-xs font-bold border border-sky-500/20">
              {water.waterSavedPercentage}% Saved
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              <div className="text-xs text-slate-400">Rainwater Collected</div>
              <div className="text-lg font-bold text-sky-300">{water.rainwaterCollectedLiters.toLocaleString()} L</div>
            </div>

            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              <div className="text-xs text-slate-400">Recycled Greywater</div>
              <div className="text-lg font-bold text-teal-300">{water.recycledGreywaterLiters.toLocaleString()} L</div>
            </div>
          </div>

          {/* Storage Tank Level Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span>Main Water Storage Tank</span>
              <span className="font-bold text-sky-400">{water.tankLevelPercentage}% Capacity</span>
            </div>
            <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-sky-500 to-teal-400 rounded-full transition-all duration-500"
                style={{ width: `${water.tankLevelPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Water Leak Alert Engine */}
        <div className="glass-card p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-bold text-white">Automated Leak Detection Engine</h3>
            </div>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                water.leakDetected ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}
            >
              {water.leakDetected ? 'ALARM TRIGGERED' : 'NORMAL FLOW'}
            </span>
          </div>

          {water.leakDetected ? (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 space-y-2">
              <div className="flex items-center gap-2 text-rose-400 text-xs font-bold">
                <ShieldAlert className="w-4 h-4" />
                <span>Abnormal Water Draw Rate Detected</span>
              </div>
              <p className="text-xs text-slate-300">{water.leakDetails}</p>
              <div className="text-[11px] text-rose-300">Affected Zone: {water.leakZone}</div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>All Hydraulic Flow Lines Operating Normally</span>
              </div>
              <p className="text-xs text-slate-400">
                Continuous ultrasonic sensor polling confirms zero abnormal leakage or pressure drop across hospital wings.
              </p>
            </div>
          )}

          <div className="text-xs text-slate-400">
            Total Live Usage Rate: <span className="text-white font-bold">{water.totalUsageLpm} L/min</span>
          </div>
        </div>
      </div>
    </div>
  );
}
