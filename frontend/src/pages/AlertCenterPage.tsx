import React, { useState } from 'react';
import { Alert } from '../types';
import { ShieldAlert, CheckCircle2, Filter, AlertTriangle, Clock, MapPin, Sparkles } from 'lucide-react';

interface AlertCenterPageProps {
  alerts: Alert[];
  onResolveAlert: (alertId: string) => void;
}

export function AlertCenterPage({ alerts, onResolveAlert }: AlertCenterPageProps) {
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const handleResolve = (id: string) => {
    setResolvingId(id);
    setTimeout(() => {
      onResolveAlert(id);
      setResolvingId(null);
    }, 400);
  };

  const filteredAlerts = alerts.filter((alt) => {
    const matchesType = typeFilter === 'ALL' || alt.type === typeFilter;
    const matchesSeverity = severityFilter === 'ALL' || alt.severity === severityFilter;
    return matchesType && matchesSeverity;
  });

  const activeAlerts = filteredAlerts.filter((a) => !a.resolved);
  const resolvedAlerts = filteredAlerts.filter((a) => a.resolved);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">Centralized Alert & Safety Operations</h2>
        <p className="text-xs text-slate-400">Real-time system alarms, environmental threshold warnings, and remediation actions</p>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 glass-panel p-3.5 rounded-2xl">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-teal-400" />
          <span className="text-xs font-semibold text-slate-400">Category:</span>
          {(['ALL', 'WASTE', 'ENVIRONMENT', 'ENERGY', 'WATER'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setTypeFilter(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                typeFilter === cat
                  ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400">Severity:</span>
          {(['ALL', 'CRITICAL', 'WARNING', 'HIGH', 'MEDIUM'] as const).map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                severityFilter === sev
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Active Alerts Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            Active Alarm Feed ({activeAlerts.length})
          </h3>
        </div>

        {activeAlerts.length === 0 ? (
          <div className="glass-card p-8 rounded-2xl text-center text-slate-400 space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <div className="text-sm font-bold text-white">All Alarms Resolved</div>
            <p className="text-xs text-slate-400">No active critical threshold alarms currently detected across hospital wings.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeAlerts.map((alt) => {
              const isCritical = alt.severity === 'CRITICAL';
              return (
                <div
                  key={alt.id}
                  className={`glass-card p-5 rounded-2xl space-y-3 border ${
                    isCritical ? 'border-rose-500/40 bg-rose-950/15' : 'border-amber-500/30 bg-amber-950/10'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isCritical
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {alt.severity}
                        </span>
                        <span className="text-xs font-semibold text-slate-400">[{alt.type}]</span>
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(alt.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-white">{alt.message}</h4>
                    </div>

                    <button
                      onClick={() => handleResolve(alt.id)}
                      disabled={resolvingId === alt.id}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all active:scale-95 shrink-0"
                    >
                      {resolvingId === alt.id ? 'Resolving...' : 'Mark as Resolved'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-xs border-t border-slate-800/80 pt-2 text-slate-300">
                    <span className="flex items-center gap-1 text-slate-400">
                      <MapPin className="w-3.5 h-3.5 text-teal-400" />
                      Location: {alt.zoneName}
                    </span>
                    <span className="text-amber-300 font-medium flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      Action: {alt.recommendation}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Resolved Alerts History */}
      {resolvedAlerts.length > 0 && (
        <div className="space-y-3 pt-4">
          <h3 className="text-base font-bold text-slate-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Recently Resolved History ({resolvedAlerts.length})
          </h3>
          <div className="space-y-2">
            {resolvedAlerts.map((alt) => (
              <div key={alt.id} className="glass-card p-4 rounded-xl opacity-75 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <div>
                    <span className="font-bold text-white">{alt.message}</span>
                    <div className="text-[11px] text-slate-400">{alt.zoneName} • {alt.type}</div>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                  RESOLVED
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
