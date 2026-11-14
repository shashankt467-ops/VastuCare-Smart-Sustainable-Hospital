import {
  SiteInput,
  GeneratedDesign,
  CapacityLimitCheck,
  OptimizationResult
} from '../types';

const API_BASE = 'http://localhost:5000/api';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, options);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Monitoring Twin Endpoints (Preserved)
  getOverview: () => fetchJson<any>('/hospital'),
  getZones: () => fetchJson<any[]>('/zones'),
  getSensors: () => fetchJson<any[]>('/sensors'),
  getSustainabilityScore: () => fetchJson<any>('/sustainability'),
  getSustainability: () => fetchJson<any>('/sustainability'),
  getEnergyMetrics: () => fetchJson<any>('/energy'),
  getEnergy: () => fetchJson<any>('/energy'),
  getWaterMetrics: () => fetchJson<any>('/water'),
  getWater: () => fetchJson<any>('/water'),
  getWasteData: () => fetchJson<any>('/waste'),
  getWaste: () => fetchJson<any>('/waste'),
  getEnvironmentData: () => fetchJson<any>('/environment'),
  getAlerts: () => fetchJson<any[]>('/alerts'),
  getRecommendations: () => fetchJson<any[]>('/recommendations'),
  getAnalytics: () => fetchJson<any>('/analytics'),
  collectWaste: (binId: string) =>
    fetchJson<any>('/waste/collect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ binId })
    }),
  resolveAlert: (alertId: string) =>
    fetchJson<any>(`/alerts/${alertId}/resolve`, { method: 'POST' }),
  resetSimulation: () =>
    fetchJson<any>('/simulation/reset', { method: 'POST' }),
  setConfig: (config: any) =>
    fetchJson<any>('/simulation/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    }),
  updateConfig: (config: any) =>
    fetchJson<any>('/simulation/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    }),

  triggerDemoStep: (step?: number) =>
    fetchJson<any>('/demo/trigger', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ step })
    }),

  // Design Studio Endpoints
  validateCapacity: (siteInput: SiteInput) =>
    fetchJson<CapacityLimitCheck>('/design/validate-capacity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(siteInput)
    }),

  generateDesign: (siteInput: SiteInput) =>
    fetchJson<GeneratedDesign>('/design/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(siteInput)
    }),

  getActiveDesign: () => fetchJson<GeneratedDesign>('/design/active'),

  getAllDesigns: () => fetchJson<GeneratedDesign[]>('/design/all'),

  getDesignById: (id: string) => fetchJson<GeneratedDesign>(`/design/${id}`),

  setActiveDesign: (id: string) =>
    fetchJson<{ success: boolean; activeDesign: GeneratedDesign }>(`/design/active/${id}`, {
      method: 'POST'
    }),

  optimizeDesign: (id: string) =>
    fetchJson<OptimizationResult>(`/design/${id}/optimize`, {
      method: 'POST'
    }),

  // ML Proxy Endpoints
  getMLStatus: () => fetchJson<any>('/ml/status'),
  predictEnvironment: (features: any) =>
    fetchJson<any>('/ml/predict/environment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(features)
    }),
  predictEnergy: (features: any) =>
    fetchJson<any>('/ml/predict/energy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(features)
    }),
  predictWater: (features: any) =>
    fetchJson<any>('/ml/predict/water', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(features)
    }),
  predictLayout: (features: any) =>
    fetchJson<any>('/ml/predict/layout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(features)
    }),
  getMLMetrics: () => fetchJson<any>('/ml/metrics'),
  getMLFeatureImportance: () => fetchJson<any>('/ml/feature-importance')
};
