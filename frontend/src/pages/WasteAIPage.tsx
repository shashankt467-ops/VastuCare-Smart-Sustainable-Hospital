import React, { useState } from 'react';
import { WasteBin, Recommendation } from '../types';
import { Trash2, AlertTriangle, CheckCircle2, Sparkles, RefreshCw, ArrowRight } from 'lucide-react';

interface WasteAIPageProps {
  wasteBins: WasteBin[];
  recommendations: Recommendation[];
  onCollectWaste: (binId: string) => void;
}

export function WasteAIPage({ wasteBins, recommendations, onCollectWaste }: WasteAIPageProps) {
  const [collectingId, setCollectingId] = useState<string | null>(null);

  const handleCollect = (binId: string) => {
    setCollectingId(binId);
    setTimeout(() => {
      onCollectWaste(binId);
      setCollectingId(null);
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">Smart Waste Management & AI Recommendation Engine</h2>
        <p className="text-xs text-slate-400">Automated waste segregation monitoring, bio-hazard alerts, and intelligent remediation</p>
      </div>

      {/* Waste Bin Gauges Section */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Trash2 className="w-5 h-5 text-rose-400" />
          Live Waste Bin Capacity & Fill Gauges
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {wasteBins.map((bin) => {
            const isCritical = bin.fillPercentage >= 80;
            const isWarning = bin.fillPercentage >= 60;
            return (
              <div key={bin.id} className="glass-card p-5 rounded-2xl space-y-4 relative overflow-hidden">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">{bin.type}</span>
                    <h4 className="text-sm font-bold text-white">{bin.label}</h4>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      isCritical
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : isWarning
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}
                  >
                    {bin.status}
                  </span>
                </div>

                {/* Fill Percentage */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Fill Capacity</span>
                    <span className="font-bold text-white">{Math.round(bin.fillPercentage)}%</span>
                  </div>
                  <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isCritical ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-teal-400'
                      }`}
                      style={{ width: `${bin.fillPercentage}%` }}
                    ></div>
                  </div>
                </div>

                {/* Interactive Collect Button */}
                <button
                  onClick={() => handleCollect(bin.id)}
                  disabled={collectingId === bin.id}
                  className={`w-full py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 ${
                    isCritical
                      ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/20'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700'
                  }`}
                >
                  {collectingId === bin.id ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      <span>Evacuating...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      <span>Collect Waste</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Optimization Suggestions Section */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-teal-400" />
            AI-Driven Optimization Recommendations
          </h3>
          <span className="text-xs text-slate-400">Sorted by Priority Severity</span>
        </div>

        <div className="space-y-3">
          {recommendations.map((rec) => {
            const isCritical = rec.priority === 'CRITICAL';
            const isHigh = rec.priority === 'HIGH';
            return (
              <div
                key={rec.id}
                className={`glass-card p-5 rounded-2xl space-y-2 border ${
                  isCritical
                    ? 'border-rose-500/40 bg-rose-950/10'
                    : isHigh
                    ? 'border-amber-500/30 bg-amber-950/10'
                    : 'border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isCritical
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : isHigh
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                        }`}
                      >
                        {rec.priority} PRIORITY
                      </span>
                      <span className="text-xs font-semibold text-slate-400">[{rec.category}]</span>
                    </div>
                    <h4 className="text-base font-bold text-white">{rec.title}</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">{rec.description}</p>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-slate-800/80 text-xs">
                  <span className="text-teal-400 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Impact: {rec.impact}
                  </span>
                  <span className="text-slate-400 text-[11px]">Local Rule Engine Verified</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
