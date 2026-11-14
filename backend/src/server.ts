import express from 'express';
import cors from 'cors';
import { simulationEngine } from './simulation/simulationEngine.js';
import { designStore } from './layout/designStore.js';
import { generateHospitalDesign, calculateCapacityLimits } from './layout/layoutGenerator.js';
import { optimizeDesign } from './layout/aiOptimizer.js';

const app = express();
const PORT = process.env.PORT || 5000;
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:5001';

app.use(cors());
app.use(express.json());

// API Routes — Monitoring Twin (Preserved)
app.get('/api/hospital', (req, res) => {
  res.json(simulationEngine.getHospitalOverview());
});

app.get('/api/zones', (req, res) => {
  res.json(simulationEngine.getZones());
});

app.get('/api/sensors', (req, res) => {
  res.json(simulationEngine.getSensors());
});

app.get('/api/sustainability', (req, res) => {
  res.json(simulationEngine.getSustainabilityScore());
});

app.get('/api/energy', (req, res) => {
  res.json(simulationEngine.getEnergyMetrics());
});

app.get('/api/water', (req, res) => {
  res.json(simulationEngine.getWaterMetrics());
});

app.get('/api/waste', (req, res) => {
  res.json({
    bins: simulationEngine.getWasteBins(),
    history: []
  });
});

app.get('/api/environment', (req, res) => {
  const zones = simulationEngine.getZones();
  const sensors = simulationEngine.getSensors();
  res.json({
    zones,
    sensors,
    avgCo2: Math.round(zones.reduce((acc, z) => acc + z.co2, 0) / zones.length),
    avgTemp: Math.round((zones.reduce((acc, z) => acc + z.temperature, 0) / zones.length) * 10) / 10
  });
});

app.get('/api/alerts', (req, res) => {
  res.json(simulationEngine.getAlerts());
});

app.get('/api/recommendations', (req, res) => {
  res.json(simulationEngine.getRecommendations());
});

app.get('/api/analytics', (req, res) => {
  const energy = simulationEngine.getEnergyMetrics();
  const hours = [6, 8, 10, 12, 14, 16, 18, 20, 22];
  const hourlyTrend = hours.map((h) => {
    const solar = h >= 6 && h <= 18 ? Math.round(Math.sin(((h - 6) / 12) * Math.PI) * 115) : 0;
    const load = Math.round(180 + Math.random() * 40);
    return {
      time: `${h}:00`,
      solarKw: solar,
      gridKw: Math.max(0, load - solar),
      totalKw: load,
      co2Ppm: Math.round(650 + Math.random() * 200),
      waterLpm: Math.round(120 + Math.random() * 30)
    };
  });

  res.json({
    hourlyTrend,
    scoreHistory: [
      { day: 'Mon', score: 81 },
      { day: 'Tue', score: 84 },
      { day: 'Wed', score: 83 },
      { day: 'Thu', score: 86 },
      { day: 'Fri', score: 85 },
      { day: 'Sat', score: 88 },
      { day: 'Sun (Live)', score: simulationEngine.getSustainabilityScore().totalScore }
    ]
  });
});

// Action Endpoints — Monitoring Twin (Preserved)
app.post('/api/waste/collect', (req, res) => {
  const { binId } = req.body;
  if (!binId) return res.status(400).json({ error: 'binId is required' });
  res.json(simulationEngine.collectWaste(binId));
});

app.post('/api/alerts/:id/resolve', (req, res) => {
  res.json(simulationEngine.resolveAlert(req.params.id));
});

app.post('/api/simulation/reset', (req, res) => {
  res.json(simulationEngine.resetSimulation());
});

app.post('/api/simulation/config', (req, res) => {
  res.json(simulationEngine.setConfig(req.body));
});

app.post('/api/demo/trigger', (req, res) => {
  res.json(simulationEngine.triggerDemoStep(req.body?.step));
});

// ==========================================
// VASTUCARE DESIGN STUDIO API ENDPOINTS
// ==========================================

app.post('/api/design/validate-capacity', (req, res) => {
  const result = calculateCapacityLimits(req.body);
  res.json(result);
});

app.post('/api/design/generate', async (req, res) => {
  try {
    const siteInput = req.body;
    const capacityCheck = calculateCapacityLimits(siteInput);
    if (!capacityCheck.isValid) {
      return res.status(400).json({
        error: 'CapacityExceeded',
        capacityCheck
      });
    }

    const design = await generateHospitalDesign(siteInput);
    designStore.saveDesign(design);
    res.json(design);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to generate design' });
  }
});

app.get('/api/design/active', (req, res) => {
  const active = designStore.getActiveDesign();
  if (!active) return res.status(404).json({ error: 'No design generated yet. Please use Design Studio to generate a hospital design first.' });
  res.json(active);
});

app.get('/api/design/all', (req, res) => {
  res.json(designStore.getAllDesigns());
});

app.get('/api/design/:id', (req, res) => {
  const design = designStore.getDesignById(req.params.id);
  if (!design) return res.status(404).json({ error: 'Design not found' });
  res.json(design);
});

app.post('/api/design/active/:id', (req, res) => {
  const success = designStore.setActiveDesign(req.params.id);
  if (!success) return res.status(404).json({ error: 'Design not found' });
  res.json({ success: true, activeDesign: designStore.getActiveDesign() });
});

app.post('/api/design/:id/optimize', async (req, res) => {
  try {
    const design = designStore.getDesignById(req.params.id) || designStore.getActiveDesign();
    if (!design) return res.status(404).json({ error: 'No design found to optimize.' });
    const result = await optimizeDesign(design);
    designStore.saveDesign(result.optimizedDesign);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to optimize design' });
  }
});

// ==========================================
// ML MICROSERVICE PROXY ENDPOINTS
// ==========================================

const proxyToMl = async (req: express.Request, res: express.Response, endpoint: string) => {
  try {
    const options: RequestInit = {
      method: req.method,
      headers: { 'Content-Type': 'application/json' }
    };
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      options.body = JSON.stringify(req.body);
    }
    const mlRes = await fetch(`${ML_SERVICE_URL}${endpoint}`, options);
    const data = await mlRes.json();
    res.json(data);
  } catch (err) {
    res.json({
      fallback: true,
      mode: 'engineering_rules',
      error: 'ML microservice unreachable at port 5001'
    });
  }
};

app.get('/api/ml/status', (req, res) => proxyToMl(req, res, '/api/ml/status'));
app.post('/api/ml/predict/environment', (req, res) => proxyToMl(req, res, '/api/ml/predict/environment'));
app.post('/api/ml/predict/energy', (req, res) => proxyToMl(req, res, '/api/ml/predict/energy'));
app.post('/api/ml/predict/water', (req, res) => proxyToMl(req, res, '/api/ml/predict/water'));
app.post('/api/ml/predict/layout', (req, res) => proxyToMl(req, res, '/api/ml/predict/layout'));
app.post('/api/ml/rank-candidates', (req, res) => proxyToMl(req, res, '/api/ml/rank-candidates'));
app.get('/api/ml/metrics', (req, res) => proxyToMl(req, res, '/api/ml/metrics'));
app.get('/api/ml/feature-importance', (req, res) => proxyToMl(req, res, '/api/ml/feature-importance'));

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`VastuCare Backend running on http://localhost:${PORT}`);
});
