import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { BarChart3, TrendingUp, Filter } from 'lucide-react';

export function AnalyticsPage() {
  const [data, setData] = useState<{ hourlyTrend: any[]; scoreHistory: any[] } | null>(null);
  const [timeFilter, setTimeFilter] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY'>('DAILY');

  useEffect(() => {
    api.getAnalytics().then(setData).catch(console.error);
  }, []);

  if (!data) {
    return <div className="text-center py-12 text-slate-400">Loading Analytics & Recharts...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Historical Analytics & Environmental Trends</h2>
          <p className="text-xs text-slate-400">Telemetry history curves for solar generation, power demand, water flow, and CO2</p>
        </div>

        <div className="flex items-center gap-2 glass-panel px-3 py-1.5 rounded-xl text-xs">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-slate-400">Time View:</span>
          {(['DAILY', 'WEEKLY', 'MONTHLY'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeFilter(tf)}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                timeFilter === tf ? 'bg-teal-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Chart 1: Energy & Solar Arc */}
      <div className="glass-card p-6 rounded-2xl space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-amber-400" />
          Solar Generation vs Grid Power Demand (kW)
        </h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.hourlyTrend}>
              <defs>
                <linearGradient id="colorSolar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorGrid" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0284c7" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
              <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem' }} />
              <Legend />
              <Area type="monotone" dataKey="solarKw" name="Solar Output (kW)" stroke="#f59e0b" fillOpacity={1} fill="url(#colorSolar)" />
              <Area type="monotone" dataKey="gridKw" name="Grid Draw (kW)" stroke="#0284c7" fillOpacity={1} fill="url(#colorGrid)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2 & 3: CO2 & Score History */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* CO2 Trend */}
        <div className="glass-card p-6 rounded-2xl space-y-4">
          <h3 className="text-base font-bold text-white">Indoor CO2 Trend (ppm)</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.hourlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem' }} />
                <Line type="monotone" dataKey="co2Ppm" name="CO2 (ppm)" stroke="#10b981" strokeWidth={2.5} dot={{ fill: '#10b981' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekly Sustainability Score */}
        <div className="glass-card p-6 rounded-2xl space-y-4">
          <h3 className="text-base font-bold text-white">Sustainability Score History</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.scoreHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} />
                <YAxis domain={[50, 100]} stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem' }} />
                <Bar dataKey="score" name="Score / 100" fill="#14b8a6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
