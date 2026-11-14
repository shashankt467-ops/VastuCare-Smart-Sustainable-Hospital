import React, { useState } from 'react';
import { ZoneData, SensorData } from '../types';
import { Wind, Thermometer, Activity, AlertTriangle, CheckCircle2, Search, Filter } from 'lucide-react';

interface EnvironmentSensorsPageProps {
  zones: ZoneData[];
  sensors: SensorData[];
}

export function EnvironmentSensorsPage({ zones, sensors }: EnvironmentSensorsPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'WARNING' | 'CRITICAL'>('ALL');

  const filteredZones = zones.filter((z) => {
    const matchesSearch = z.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || z.airQualityStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const avgCo2 = Math.round(zones.reduce((sum, z) => sum + z.co2, 0) / (zones.length || 1));
  const avgTemp = Math.round((zones.reduce((sum, z) => sum + z.temperature, 0) / (zones.length || 1)) * 10) / 10;
  const criticalCount = zones.filter((z) => z.airQualityStatus === 'CRITICAL').length;
  const warningCount = zones.filter((z) => z.airQualityStatus === 'WARNING').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">Environmental Telemetry & Sensor Network</h2>
        <p className="text-xs text-slate-400">Live IoT monitoring of CO2, temperature, humidity, and airflow across hospital zones</p>
      </div>

      {/* Summary Gauges */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Average Hospital CO2</span>
            <Wind className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white">{avgCo2} <span className="text-xs font-normal text-slate-400">ppm</span></div>
          <div className="text-[11px] text-emerald-400">Target &lt; 800 ppm</div>
        </div>

        <div className="glass-card p-4 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Average Ambient Temp</span>
            <Thermometer className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl font-bold text-white">{avgTemp} <span className="text-xs font-normal text-slate-400">°C</span></div>
          <div className="text-[11px] text-teal-400">Target 21°C - 24°C</div>
        </div>

        <div className="glass-card p-4 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Warnings Active</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400">{warningCount}</div>
          <div className="text-[11px] text-slate-400">Requires monitoring</div>
        </div>

        <div className="glass-card p-4 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Critical Conditions</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-rose-400">{criticalCount}</div>
          <div className="text-[11px] text-rose-400">Immediate action needed</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 glass-panel p-3 rounded-xl">
        <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 w-72">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search zones..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none text-xs text-white placeholder-slate-500 focus:outline-none w-full"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-400">Filter Status:</span>
          {(['ALL', 'WARNING', 'CRITICAL'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === st ? 'bg-teal-500 text-slate-950' : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Zone Sensor Cards Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredZones.map((zone) => (
          <div key={zone.id} className="glass-card p-5 rounded-2xl space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">{zone.floor} FLOOR</span>
                <h3 className="text-base font-bold text-white">{zone.name}</h3>
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 ${
                  zone.airQualityStatus === 'CRITICAL'
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    : zone.airQualityStatus === 'WARNING'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}
              >
                {zone.airQualityStatus === 'CRITICAL' ? (
                  <AlertTriangle className="w-3.5 h-3.5" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                )}
                {zone.airQualityStatus}
              </span>
            </div>

            {/* Readouts */}
            <div className="grid grid-cols-3 gap-2 pt-1 text-center">
              <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-400">CO2</div>
                <div className="text-sm font-bold text-amber-300">{zone.co2} ppm</div>
              </div>

              <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-400">Temp</div>
                <div className="text-sm font-bold text-teal-300">{zone.temperature}°C</div>
              </div>

              <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-400">Occupancy</div>
                <div className="text-sm font-bold text-slate-200">{zone.occupancy}%</div>
              </div>
            </div>

            <div className="text-xs text-slate-400 border-t border-slate-800/80 pt-2 flex items-center justify-between">
              <span>Vastu: {zone.vastuOrientation}</span>
              <span className="text-teal-400 font-medium">IoT Stream Active</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
