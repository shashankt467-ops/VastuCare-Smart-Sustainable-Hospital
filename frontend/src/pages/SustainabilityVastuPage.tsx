import React from 'react';
import { SustainabilityScore } from '../types';
import { Award, Compass, Zap, Droplets, Trash2, Wind, Sun, Trees, AlertCircle, ArrowUpRight } from 'lucide-react';

interface SustainabilityVastuPageProps {
  sustainability: SustainabilityScore | null;
}

export function SustainabilityVastuPage({ sustainability }: SustainabilityVastuPageProps) {
  if (!sustainability) {
    return <div className="text-center py-12 text-slate-400">Loading Sustainability Score...</div>;
  }

  const dimensions = [
    { key: 'energyEfficiency', icon: Zap, color: 'text-amber-400', data: sustainability.dimensions.energyEfficiency },
    { key: 'waterConservation', icon: Droplets, color: 'text-sky-400', data: sustainability.dimensions.waterConservation },
    { key: 'wasteManagement', icon: Trash2, color: 'text-rose-400', data: sustainability.dimensions.wasteManagement },
    { key: 'airQuality', icon: Wind, color: 'text-teal-400', data: sustainability.dimensions.airQuality },
    { key: 'daylightUtilization', icon: Sun, color: 'text-yellow-400', data: sustainability.dimensions.daylightUtilization },
    { key: 'greenCoverageVastu', icon: Trees, color: 'text-emerald-400', data: sustainability.dimensions.greenCoverageVastu }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">Sustainability Scoring & Vastu Architecture</h2>
        <p className="text-xs text-slate-400">Multi-dimensional environmental scoring engine & Vastu spatial engineering</p>
      </div>

      {/* Main Score Hero Card */}
      <div className="glass-panel p-8 rounded-3xl border border-emerald-500/30 bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/20 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-3 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/30">
            <Award className="w-4 h-4" />
            Dynamic Live Score Rating: {sustainability.statusLabel}
          </div>
          <h3 className="text-2xl font-bold text-white">Hospital Sustainability Performance Index</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Evaluated continuous IoT sensor telemetry across energy renewables, water conservation, waste diversion, indoor air quality, daylighting, and Vastu spatial orientation.
          </p>
        </div>

        {/* Circular Gauge Score Display */}
        <div className="relative w-40 h-40 flex items-center justify-center rounded-full bg-slate-950 border-4 border-emerald-500 shadow-2xl shadow-emerald-500/20 shrink-0">
          <div className="text-center space-y-0.5">
            <span className="text-4xl font-extrabold text-white tracking-tight">{sustainability.totalScore}</span>
            <span className="text-xs text-slate-400 block font-medium">/ 100 PTS</span>
            <span className="text-[10px] uppercase font-bold text-emerald-400">{sustainability.statusLabel}</span>
          </div>
        </div>
      </div>

      {/* 6 Dimension Score Breakdown Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {dimensions.map((dim, idx) => {
          const Icon = dim.icon;
          return (
            <div key={idx} className="glass-card p-5 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center ${dim.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold text-white">{dim.data.name}</h4>
                </div>
                <span className="text-sm font-extrabold text-white">
                  {dim.data.currentScore}/{dim.data.maxScore}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full"
                  style={{ width: `${(dim.data.currentScore / dim.data.maxScore) * 100}%` }}
                ></div>
              </div>
              <div className="text-[11px] text-slate-400">{dim.data.details}</div>
            </div>
          );
        })}
      </div>

      {/* Before vs After Comparison Visual */}
      <div className="glass-card p-6 rounded-2xl space-y-4">
        <h3 className="text-base font-bold text-white">Conventional Hospital vs VastuCare Design</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {(sustainability?.beforeAfterComparison || []).map((item, idx) => (
            <div key={idx} className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="text-xs text-slate-400 font-medium">{item.metric}</div>
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-xs line-through text-slate-500">{item.conventional}</span>
                  <span className="text-lg font-bold text-emerald-400 ml-2">{item.vastuCare}</span>
                </div>
                <span className="text-xs text-slate-400">{item.unit}</span>
              </div>
              <div className="text-[11px] font-bold text-teal-400 flex items-center gap-1">
                <ArrowUpRight className="w-3.5 h-3.5" />
                {item.improvementPercent}% Efficiency Gain
              </div>
            </div>
          ))}
        </div>
        <div className="text-[11px] text-slate-500 italic">* Estimated prototype simulation metrics based on environmental engineering models.</div>
      </div>

      {/* Vastu Architecture Section with Disclaimer */}
      <div className="glass-panel p-6 rounded-2xl space-y-4 border border-amber-500/20 bg-amber-950/10">
        <div className="flex items-center gap-2 text-amber-400">
          <Compass className="w-5 h-5" />
          <h3 className="text-base font-bold text-white">Vastu-Inspired Architectural Principles</h3>
        </div>

        <div className="grid md:grid-cols-3 gap-4 text-xs text-slate-300">
          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-1">
            <h4 className="font-bold text-amber-300">1. East / North-East Orientation (Ishan)</h4>
            <p className="text-slate-400">Maximizes morning daylighting in reception and OPD, reducing bacterial survival and minimizing daytime artificial lighting electricity.</p>
          </div>

          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-1">
            <h4 className="font-bold text-amber-300">2. Brahmasthan Central Sky Courtyard</h4>
            <p className="text-slate-400">Open central courtyard creates natural stack ventilation corridors, cooling patient wards naturally via zero-energy airflow.</p>
          </div>

          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-1">
            <h4 className="font-bold text-amber-300">3. South-East Agni Zone Isolation</h4>
            <p className="text-slate-400">Placing heavy electrical, diagnostic lab, and pharmacy refrigeration equipment in the South-East zone optimizes thermal heat rejection.</p>
          </div>
        </div>

        {/* EXPLICIT REQUIRED DISCLAIMER */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-slate-200">Architectural Inspiration Disclaimer:</span>
            <p className="mt-0.5 leading-relaxed">
              Vastu-inspired spatial planning is used strictly as an architectural inspiration for orientation, daylighting, natural ventilation flow, and serene green environments. Hospital medical safety, clinical infection control, emergency accessibility, and modern environmental engineering standards take primary precedence.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
