import React from 'react';
import { Play, RefreshCw, Sun, Moon, Activity, Palette } from 'lucide-react';
import { HospitalOverview } from '../types';

export interface ThemeOption {
  id: string;
  name: string;
  color: string;
}

export const THEME_OPTIONS: ThemeOption[] = [
  { id: 'ocean', name: 'Cyber Ocean', color: '#06b6d4' },
  { id: 'sapphire', name: 'Sapphire CAD', color: '#3b82f6' },
  { id: 'emerald', name: 'Bio Emerald', color: '#10b981' },
  { id: 'amethyst', name: 'Amethyst AI', color: '#a855f7' },
  { id: 'amber', name: 'Vastu Solar', color: '#f59e0b' }
];

interface HeaderProps {
  overview: HospitalOverview | null;
  onTriggerDemo: () => void;
  onResetSimulation: () => void;
  onToggleDayNight: () => void;
  currentTheme?: string;
  onSelectTheme?: (theme: string) => void;
}

export function Header({
  overview,
  onTriggerDemo,
  onResetSimulation,
  onToggleDayNight,
  currentTheme = 'ocean',
  onSelectTheme
}: HeaderProps) {
  const isDay = overview?.dayNightMode === 'DAY';

  return (
    <header className="h-16 border-b border-white/[0.08] bg-[#080c16]/85 backdrop-blur-xl px-6 flex items-center justify-between sticky top-0 z-50 transition-colors duration-400">
      {/* Brand Title */}
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-950 shadow-lg transition-all duration-300"
          style={{ background: 'var(--brand-gradient)', boxShadow: '0 8px 24px -4px var(--accent-glow)' }}
        >
          <Activity className="w-6 h-6 stroke-[2.5]" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1
              className="text-xl font-bold bg-clip-text text-transparent transition-all duration-300"
              style={{ backgroundImage: 'var(--brand-gradient)' }}
            >
              VastuCare
            </h1>
            <span
              className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded border transition-colors duration-300"
              style={{
                backgroundColor: 'rgba(var(--accent-rgb), 0.12)',
                color: 'var(--accent-color)',
                borderColor: 'rgba(var(--accent-rgb), 0.3)'
              }}
            >
              AI Digital Twin
            </span>
          </div>
          <p className="text-xs text-slate-400 hidden sm:block">Smart Sustainable Hospital Twin</p>
        </div>
      </div>

      {/* Live Simulation Event Banner */}
      {overview?.demoActive && (
        <div
          className="hidden md:flex items-center gap-2.5 bg-slate-900/90 border px-4 py-1.5 rounded-full text-xs font-medium shadow-sm transition-all"
          style={{
            borderColor: 'rgba(var(--accent-rgb), 0.4)',
            color: 'var(--accent-color)',
            boxShadow: '0 4px 16px -2px rgba(var(--accent-rgb), 0.15)'
          }}
        >
          <span className="relative flex h-2 w-2">
            <span
              className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
              style={{ backgroundColor: 'var(--accent-color)' }}
            />
            <span
              className="relative inline-flex rounded-full h-2 w-2"
              style={{ backgroundColor: 'var(--accent-color)' }}
            />
          </span>
          <span className="font-semibold text-slate-400">Live Telemetry:</span>
          <span>
            {overview.demoCaption
              .replace(/^DEMO STEP \d+\/\d+:\s*/i, '')
              .replace(
                /Score.*?(\d+\/100)/,
                `Score: ${overview.sustainabilityScore}/100`
              )}
          </span>
        </div>
      )}

      {/* Header Actions & Quick Metrics */}
      <div className="flex items-center gap-3">
        {/* Live Score Badge */}
        {overview && (
          <div className="hidden sm:flex items-center gap-2 bg-slate-900/90 border border-white/[0.08] px-3 py-1.5 rounded-lg text-xs font-medium">
            <span className="text-slate-400">Score:</span>
            <span className="text-emerald-400 font-bold text-sm">{overview.sustainabilityScore}/100</span>
          </div>
        )}

        {/* Theme Palette Switcher */}
        <div className="hidden lg:flex items-center gap-1.5 px-2 py-1 rounded-xl bg-slate-900/80 border border-white/[0.08] shadow-inner" title="Switch UI Color Interface Theme">
          <Palette className="w-3.5 h-3.5 text-slate-400 mr-1" />
          {THEME_OPTIONS.map((t) => (
            <button
              key={t.id}
              onClick={() => onSelectTheme?.(t.id)}
              title={`${t.name} Theme`}
              className={`w-4 h-4 rounded-full transition-all duration-200 ${
                currentTheme === t.id
                  ? 'scale-125 ring-2 ring-white shadow-md'
                  : 'opacity-50 hover:opacity-100 hover:scale-110'
              }`}
              style={{ backgroundColor: t.color }}
            />
          ))}
        </div>

        {/* Operational Incident Drill Trigger */}
        <button
          onClick={onTriggerDemo}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/90 border text-xs font-semibold transition-all active:scale-95 shadow-sm hover:bg-slate-800"
          style={{
            borderColor: 'rgba(var(--accent-rgb), 0.3)',
            color: 'var(--accent-color)'
          }}
          title="Simulate Real-Time Telemetry & Incident Event"
        >
          <Play className="w-3.5 h-3.5 fill-current opacity-80" />
          <span>Simulate Incident</span>
        </button>

        {/* Day / Night Toggle */}
        <button
          onClick={onToggleDayNight}
          className="p-2 rounded-lg bg-slate-900/90 border border-white/[0.08] text-slate-300 hover:text-white hover:border-white/20 transition-colors"
          title="Toggle Day/Night Mode"
        >
          {isDay ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-sky-400" />}
        </button>

        {/* Reset Simulation */}
        <button
          onClick={onResetSimulation}
          className="p-2 rounded-lg bg-slate-900/90 border border-white/[0.08] text-slate-400 hover:text-white hover:border-white/20 transition-colors"
          title="Reset Simulation Baseline"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
