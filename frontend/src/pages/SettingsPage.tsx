import React, { useState } from 'react';
import { Sliders, RefreshCw, Sun, Moon, Play, ShieldCheck, Activity, Terminal } from 'lucide-react';
import { api } from '../services/api';

interface SettingsPageProps {
  dayNightMode: 'DAY' | 'NIGHT';
  onToggleDayNight: () => void;
  onResetSimulation: () => void;
  onTriggerDemo: () => void;
}

export function SettingsPage({
  dayNightMode,
  onToggleDayNight,
  onResetSimulation,
  onTriggerDemo
}: SettingsPageProps) {
  const [speed, setSpeed] = useState<number>(1);
  const [updating, setUpdating] = useState(false);

  const handleSpeedChange = async (newSpeed: number) => {
    setSpeed(newSpeed);
    setUpdating(true);
    try {
      await api.updateConfig({ speed: newSpeed });
    } catch (e) {
      console.error(e);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">System Settings & Simulation Controls</h2>
        <p className="text-xs text-slate-400">Configure IoT ticker speed, environment lighting, demo runners, and baseline resets</p>
      </div>

      {/* Simulation Speed Control */}
      <div className="glass-card p-6 rounded-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-teal-400" />
            <h3 className="text-base font-bold text-white">IoT Ticker Simulation Speed</h3>
          </div>
          <span className="text-xs font-bold text-teal-400 bg-teal-500/10 px-3 py-1 rounded-full border border-teal-500/20">
            Current Speed: {speed}x Realtime
          </span>
        </div>

        <div className="flex items-center gap-4">
          {[1, 2, 5].map((s) => (
            <button
              key={s}
              onClick={() => handleSpeedChange(s)}
              className={`flex-1 py-3 rounded-xl font-bold text-xs transition-all ${
                speed === s
                  ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-slate-950 shadow-lg shadow-teal-500/20'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {s}x Speed {s === 1 ? '(Realtime Baseline)' : s === 2 ? '(Fast Jitter)' : '(High Acceleration)'}
            </button>
          ))}
        </div>
      </div>

      {/* Environment & Demo Controls */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Day/Night Lighting Mode */}
        <div className="glass-card p-6 rounded-2xl space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            {dayNightMode === 'DAY' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-sky-400" />}
            Day / Night Ambient Lighting
          </h3>
          <p className="text-xs text-slate-400">
            Adjusts WebGL 3D sun position, sky color, window light emissions, and parabolic solar panel generation output.
          </p>
          <button
            onClick={onToggleDayNight}
            className="w-full py-2.5 rounded-xl font-bold text-xs bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white flex items-center justify-center gap-2"
          >
            Switch to {dayNightMode === 'DAY' ? 'NIGHT Mode (Solar = 0 kW)' : 'DAY Mode (Solar Active)'}
          </button>
        </div>

        {/* Operational Incident Simulator */}
        <div className="glass-card p-6 rounded-2xl space-y-4 border border-teal-500/30 bg-teal-950/10">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Play className="w-5 h-5 text-teal-400" />
            Operational Incident & Telemetry Simulator
          </h3>
          <p className="text-xs text-slate-300">
            Simulates dynamic facility events: Baseline Telemetry -&gt; Patient / CO2 Surge in OPD -&gt; Biomedical Waste Capacity Alert -&gt; AI Recommendation -&gt; Remediation &amp; Stabilization.
          </p>
          <button
            onClick={onTriggerDemo}
            className="w-full py-2.5 rounded-xl font-bold text-xs bg-slate-900 border border-teal-500/40 hover:bg-slate-800 text-teal-300 shadow-sm transition-all"
          >
            Trigger Operational Incident Scenario
          </button>
        </div>
      </div>

      {/* Baseline Reset */}
      <div className="glass-card p-6 rounded-2xl space-y-4 border border-rose-500/20">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <RefreshCw className="w-5 h-5 text-rose-400" />
          Reset Simulation to Baseline State
        </h3>
        <p className="text-xs text-slate-400">
          Clears simulated incident overrides, resets waste fill levels to baseline, resolves active alerts, and recalculates live hospital sustainability score.
        </p>
        <button
          onClick={onResetSimulation}
          className="px-5 py-2.5 rounded-xl font-bold text-xs bg-slate-900 hover:bg-rose-950 text-rose-300 border border-rose-500/40 transition-colors"
        >
          Reset Simulation Baseline
        </button>
      </div>

      {/* System Diagnostics Info */}
      <div className="glass-panel p-5 rounded-2xl space-y-2 text-xs text-slate-400">
        <div className="flex items-center gap-2 text-teal-400 font-bold">
          <Terminal className="w-4 h-4" />
          System Information
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
          <div>Backend API: <span className="text-emerald-400 font-medium">http://localhost:5000</span></div>
          <div>Polling Ticker: <span className="text-teal-400 font-medium">1.5s Interval</span></div>
          <div>Track Category: <span className="text-amber-400 font-medium">Track 9</span></div>
          <div>Offline Status: <span className="text-emerald-400 font-medium">100% Offline Ready</span></div>
        </div>
      </div>
    </div>
  );
}
