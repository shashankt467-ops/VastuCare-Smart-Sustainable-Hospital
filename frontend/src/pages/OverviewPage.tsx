import React from 'react';
import { HospitalOverview } from '../types';
import {
  Award,
  Zap,
  Droplets,
  Leaf,
  Trash2,
  Sun,
  Box,
  Compass,
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';
import { PageTab } from '../components/Sidebar';

interface OverviewPageProps {
  overview: HospitalOverview | null;
  onNavigate: (tab: PageTab) => void;
}

export function OverviewPage({ overview, onNavigate }: OverviewPageProps) {
  if (!overview) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        Loading live hospital telemetry...
      </div>
    );
  }

  const kpis = [
    {
      title: 'Sustainability Score',
      value: `${overview.sustainabilityScore}/100`,
      change: 'Dynamic Engine',
      icon: Award,
      color: 'from-emerald-500 to-teal-600',
      textColor: 'text-emerald-400'
    },
    {
      title: 'Energy Saved',
      value: `${overview.energySavedPercent}%`,
      change: 'vs Baseline',
      icon: Zap,
      color: 'from-amber-500 to-yellow-600',
      textColor: 'text-amber-400'
    },
    {
      title: 'Water Saved',
      value: `${overview.waterSavedPercent}%`,
      change: 'Harvest & Recycled',
      icon: Droplets,
      color: 'from-sky-500 to-blue-600',
      textColor: 'text-sky-400'
    },
    {
      title: 'CO₂ Reduction',
      value: `${overview.co2AvoidedKgDay} kg/d`,
      change: 'Solar Offset',
      icon: Leaf,
      color: 'from-green-500 to-emerald-600',
      textColor: 'text-green-400'
    },
    {
      title: 'Waste Diversion',
      value: `${overview.wasteDiversionPercent}%`,
      change: 'Diverted',
      icon: Trash2,
      color: 'from-rose-500 to-pink-600',
      textColor: 'text-rose-400'
    },
    {
      title: 'Renewable Energy',
      value: `${overview.renewableEnergyPercent}%`,
      change: 'Rooftop Solar',
      icon: Sun,
      color: 'from-yellow-400 to-amber-500',
      textColor: 'text-yellow-400'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Hero Header Banner */}
      <div className="relative rounded-2xl overflow-hidden glass-panel p-8 border border-teal-500/20 bg-gradient-to-r from-slate-900 via-slate-900/90 to-teal-950/40">
        <div className="max-w-3xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 text-teal-400 text-xs font-semibold border border-teal-500/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            Hackathon Prototype — Track 9
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            VastuCare — <span className="bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">Smart Sustainable Hospital</span>
          </h1>
          <p className="text-slate-300 text-sm leading-relaxed">
            Integrating Vastu-inspired spatial planning, environmental engineering, IoT monitoring and AI-driven sustainability optimization into an interactive digital twin.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4">
            <button
              onClick={() => onNavigate('HOSPITAL_3D')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-slate-950 font-bold text-xs shadow-lg shadow-teal-500/25 transition-all active:scale-95"
            >
              <Box className="w-4 h-4" />
              <span>Explore 3D Hospital</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('SUSTAINABILITY_VASTU')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-200 font-semibold text-xs transition-colors"
            >
              <Compass className="w-4 h-4 text-amber-400" />
              <span>Vastu Architecture Insights</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className="glass-card p-4 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-medium">{kpi.title}</span>
                <div className={`w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center ${kpi.textColor}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl font-extrabold text-white">{kpi.value}</div>
              <div className="text-[11px] text-slate-400">{kpi.change}</div>
            </div>
          );
        })}
      </div>

      {/* Feature Highlights Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="glass-card p-5 rounded-2xl space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
            <Compass className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Vastu-Inspired Design</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Architectural orientation for natural light in East/NE, central Brahmasthan open courtyard ventilation, and dedicated healing green zones.
          </p>
        </div>

        <div className="glass-card p-5 rounded-2xl space-y-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Environmental Engineering</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Continuous IoT monitoring of CO2, temperature, rainwater harvesting tank levels, greywater recycling, and solar microgrid generation.
          </p>
        </div>

        <div className="glass-card p-5 rounded-2xl space-y-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center">
            <Leaf className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">AI Sustainability Engine</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Dynamic rule-based optimization engine prioritizing HVAC setpoints, waste collection alerts, and energy balance recommendations.
          </p>
        </div>
      </div>
    </div>
  );
}
