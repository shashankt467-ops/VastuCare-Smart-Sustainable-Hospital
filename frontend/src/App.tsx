import React, { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { Sidebar, PageTab } from './components/Sidebar';
import { DesignStudioPage } from './pages/DesignStudioPage';
import { MLModelCenterPage } from './pages/MLModelCenterPage';
import { OverviewPage } from './pages/OverviewPage';
import { Hospital3DPage } from './pages/Hospital3DPage';
import { EnvironmentSensorsPage } from './pages/EnvironmentSensorsPage';
import { EnergyWaterPage } from './pages/EnergyWaterPage';
import { WasteAIPage } from './pages/WasteAIPage';
import { SustainabilityVastuPage } from './pages/SustainabilityVastuPage';
import { AlertCenterPage } from './pages/AlertCenterPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SettingsPage } from './pages/SettingsPage';
import { api } from './services/api';
import {
  ZoneData,
  SensorData,
  EnergyMetrics,
  WaterMetrics,
  WasteBin,
  Recommendation,
  SustainabilityScore,
  Alert
} from './types';

export function App() {
  const [activeTab, setActiveTab] = useState<PageTab>('DESIGN_STUDIO');
  const [currentTheme, setCurrentTheme] = useState<string>('ocean');

  useEffect(() => {
    const saved = localStorage.getItem('vastucare-theme') || 'ocean';
    setCurrentTheme(saved);
    document.documentElement.setAttribute('data-theme', saved);
  }, []);

  const handleSelectTheme = (theme: string) => {
    setCurrentTheme(theme);
    localStorage.setItem('vastucare-theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  };

  // Telemetry state (Monitoring Twin)
  const [overview, setOverview] = useState<any>(null);
  const [zones, setZones] = useState<ZoneData[]>([]);
  const [sensors, setSensors] = useState<SensorData[]>([]);
  const [energy, setEnergy] = useState<EnergyMetrics | null>(null);
  const [water, setWater] = useState<WaterMetrics | null>(null);
  const [wasteBins, setWasteBins] = useState<WasteBin[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [sustainability, setSustainability] = useState<SustainabilityScore | null>(null);

  const fetchTelemetry = async () => {
    try {
      const [ov, z, s, en, wt, wst, al, rec, sust] = await Promise.all([
        api.getOverview().catch(() => null),
        api.getZones().catch(() => []),
        api.getSensors().catch(() => []),
        api.getEnergy().catch(() => null),
        api.getWater().catch(() => null),
        api.getWaste().catch(() => ({ bins: [] })),
        api.getAlerts().catch(() => []),
        api.getRecommendations().catch(() => []),
        api.getSustainability().catch(() => null)
      ]);

      setOverview(ov);
      setZones(z);
      setSensors(s);
      setEnergy(en);
      setWater(wt);
      setWasteBins(wst?.bins || []);
      setAlerts(al);
      setRecommendations(rec);
      setSustainability(sust);
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleTriggerDemo = async () => {
    try {
      await api.triggerDemoStep();
      fetchTelemetry();
    } catch {
      // Ignore
    }
  };

  const handleResetSimulation = async () => {
    try {
      await api.resetSimulation();
      fetchTelemetry();
    } catch {
      // Ignore
    }
  };

  const handleToggleDayNight = async () => {
    if (!overview) return;
    const nextMode = overview.dayNightMode === 'DAY' ? 'NIGHT' : 'DAY';
    try {
      await api.setConfig({ dayNight: nextMode });
      fetchTelemetry();
    } catch {
      // Ignore
    }
  };

  const handleCollectWaste = async (binId: string) => {
    try {
      await api.collectWaste(binId);
      fetchTelemetry();
    } catch {
      // Ignore
    }
  };

  const handleResolveAlert = async (alertId: string) => {
    try {
      await api.resolveAlert(alertId);
      fetchTelemetry();
    } catch {
      // Ignore
    }
  };

  const activeAlertsCount = alerts.filter((a) => !a.resolved).length;

  return (
    <div
      className="min-h-screen flex flex-col text-slate-100 selection:bg-cyan-500 selection:text-slate-950 transition-colors duration-500"
      style={{ background: 'var(--bg-gradient)' }}
    >
      {/* Header */}
      <Header
        overview={overview}
        onTriggerDemo={handleTriggerDemo}
        onResetSimulation={handleResetSimulation}
        onToggleDayNight={handleToggleDayNight}
        currentTheme={currentTheme}
        onSelectTheme={handleSelectTheme}
      />

      {/* Body Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation */}
        <Sidebar activeTab={activeTab} onSelectTab={setActiveTab} activeAlertsCount={activeAlertsCount} />

        {/* Main Content Area */}
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            {activeTab === 'DESIGN_STUDIO' && <DesignStudioPage />}
            {activeTab === 'ML_MODEL_CENTER' && <MLModelCenterPage />}
            {activeTab === 'OVERVIEW' && <OverviewPage overview={overview} onNavigate={setActiveTab} />}
            {activeTab === 'HOSPITAL_3D' && (
              <Hospital3DPage zones={zones} dayNightMode={overview?.dayNightMode || 'DAY'} />
            )}
            {activeTab === 'ENVIRONMENT' && <EnvironmentSensorsPage zones={zones} sensors={sensors} />}
            {activeTab === 'ENERGY_WATER' && <EnergyWaterPage energy={energy} water={water} />}
            {activeTab === 'WASTE_AI' && (
              <WasteAIPage wasteBins={wasteBins} recommendations={recommendations} onCollectWaste={handleCollectWaste} />
            )}
            {activeTab === 'SUSTAINABILITY_VASTU' && <SustainabilityVastuPage sustainability={sustainability} />}
            {activeTab === 'ALERT_CENTER' && <AlertCenterPage alerts={alerts} onResolveAlert={handleResolveAlert} />}
            {activeTab === 'ANALYTICS' && <AnalyticsPage />}
            {activeTab === 'SETTINGS' && (
              <SettingsPage
                dayNightMode={overview?.dayNightMode || 'DAY'}
                onToggleDayNight={handleToggleDayNight}
                onResetSimulation={handleResetSimulation}
                onTriggerDemo={handleTriggerDemo}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
