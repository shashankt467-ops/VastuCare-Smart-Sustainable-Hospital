import React from 'react';
import {
  Wand2,
  Brain,
  LayoutDashboard,
  Box,
  Activity,
  Zap,
  Trash2,
  Compass,
  BarChart3,
  Sliders,
  ShieldAlert
} from 'lucide-react';

export type PageTab =
  | 'DESIGN_STUDIO'
  | 'ML_MODEL_CENTER'
  | 'OVERVIEW'
  | 'HOSPITAL_3D'
  | 'ENVIRONMENT'
  | 'ENERGY_WATER'
  | 'WASTE_AI'
  | 'SUSTAINABILITY_VASTU'
  | 'ALERT_CENTER'
  | 'ANALYTICS'
  | 'SETTINGS';

interface SidebarProps {
  activeTab: PageTab;
  onSelectTab: (tab: PageTab) => void;
  activeAlertsCount: number;
}

export function Sidebar({ activeTab, onSelectTab, activeAlertsCount }: SidebarProps) {
  const designItems: { id: PageTab; label: string; icon: React.ComponentType<any>; badge?: string }[] = [
    { id: 'DESIGN_STUDIO', label: 'AI Design Studio', icon: Wand2, badge: 'AI Engine' },
    { id: 'ML_MODEL_CENTER', label: 'ML Model Center', icon: Brain, badge: 'ML Status' }
  ];

  const monitoringItems: { id: PageTab; label: string; icon: React.ComponentType<any>; badge?: number }[] = [
    { id: 'OVERVIEW', label: 'Overview', icon: LayoutDashboard },
    { id: 'HOSPITAL_3D', label: '3D Hospital Twin', icon: Box },
    { id: 'ENVIRONMENT', label: 'Environment & Sensors', icon: Activity, badge: activeAlertsCount },
    { id: 'ENERGY_WATER', label: 'Energy & Water', icon: Zap },
    { id: 'WASTE_AI', label: 'Waste & AI Advisor', icon: Trash2 },
    { id: 'SUSTAINABILITY_VASTU', label: 'Sustainability & Vastu', icon: Compass },
    { id: 'ALERT_CENTER', label: 'Alert Operations', icon: ShieldAlert, badge: activeAlertsCount },
    { id: 'ANALYTICS', label: 'Analytics & Trends', icon: BarChart3 },
    { id: 'SETTINGS', label: 'Settings & Speed', icon: Sliders }
  ];

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-950/60 backdrop-blur-md p-4 flex flex-col justify-between shrink-0">
      <div className="space-y-4">
        {/* Section 1: AI Design Studio */}
        <div className="space-y-1">
          <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--accent-color)' }}>
            Generator Studio
          </div>
          {designItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold text-xs transition-all ${
                  isActive
                    ? 'active-nav-item'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className="px-2 py-0.5 rounded-full text-[9px] font-extrabold border"
                    style={{
                      backgroundColor: 'rgba(var(--accent-rgb), 0.15)',
                      color: 'var(--accent-color)',
                      borderColor: 'rgba(var(--accent-rgb), 0.3)'
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Section 2: Monitoring Twin */}
        <div className="space-y-1">
          <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Monitoring Twin
          </div>
          {monitoringItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-xs transition-all ${
                  isActive
                    ? 'active-nav-item'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-bold">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer Info */}
      <div className="glass-panel p-3 rounded-xl space-y-1.5 border border-slate-800">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-400">VastuCare Studio</span>
          <span className="text-emerald-400 font-medium">v2.0 ML Ready</span>
        </div>
        <div className="text-[10px] text-slate-400">
          Hybrid AI Architectural Layout Generator
        </div>
      </div>
    </aside>
  );
}
