import { SiteInput, GeneratedRoom, BuildingFootprint, EnvironmentalAnalysis } from './types.js';

export async function analyzeEnvironmental(
  siteInput: SiteInput,
  footprint: BuildingFootprint,
  rooms: GeneratedRoom[]
): Promise<EnvironmentalAnalysis> {
  const { sustainabilityFeatures, bedCapacity, floors, siteLengthFt, siteWidthFt, northAngle } = siteInput;

  // 1. Solar Potential (0..100)
  let solarPotential = 40;
  if (sustainabilityFeatures.solarPanels) {
    const solarRatio = footprint.solarPanelAreaSqm / Math.max(footprint.areaSqm, 1);
    solarPotential = Math.min(100, Math.round(50 + solarRatio * 80));
  }

  // 2. Daylight Potential (0..100)
  const avgRoomDaylight = rooms.reduce((sum, r) => sum + r.daylightExposureScore, 0) / Math.max(rooms.length, 1);
  let daylightPotential = Math.min(100, Math.round(avgRoomDaylight * 0.7 + (sustainabilityFeatures.greenCourtyard ? 20 : 5)));

  // 3. Ventilation Potential (0..100)
  const avgRoomVent = rooms.reduce((sum, r) => sum + r.ventilationExposureScore, 0) / Math.max(rooms.length, 1);
  let ventilationPotential = Math.min(100, Math.round(avgRoomVent * 0.7 + (sustainabilityFeatures.greenCourtyard ? 25 : 5)));

  // 4. Rainwater Potential (0..100)
  let rainwaterPotential = 30;
  if (sustainabilityFeatures.rainwaterHarvesting) {
    rainwaterPotential = Math.min(100, Math.round(60 + (footprint.areaSqm / 500) * 15));
  }

  // 5. Green Coverage Score (0..100)
  const greenCoverageScore = Math.min(100, Math.round(footprint.openSpacePercent * 1.2 + (sustainabilityFeatures.greenCourtyard ? 20 : 0)));

  // 6. Energy & Water Demands (Engineering Formulas)
  const baseKwhPerBed = 14;
  const rawEnergyDemand = bedCapacity * baseKwhPerBed * (1 + (floors - 1) * 0.08);
  const solarOffsetKw = sustainabilityFeatures.solarPanels ? footprint.solarPanelAreaSqm * 0.15 * 5 : 0;
  const estimatedEnergyDemandKwhDay = Math.max(bedCapacity * 4, Math.round(rawEnergyDemand - solarOffsetKw));
  const estimatedPeakEnergyKw = Math.round(estimatedEnergyDemandKwhDay * 0.10);

  const baseLitersPerBed = 320;
  const rawWaterDemand = bedCapacity * baseLitersPerBed;
  const estimatedWaterDemandLitersDay = Math.round(rawWaterDemand);
  const estimatedRainwaterHarvestLitersDay = sustainabilityFeatures.rainwaterHarvesting
    ? Math.round(footprint.areaSqm * 1.2 * 0.8)
    : 0;

  // 7. Overall Sustainability Score
  const energyScore = Math.min(25, Math.max(10, Math.round(15 + (solarOffsetKw / Math.max(estimatedEnergyDemandKwhDay, 1)) * 100 * 0.1)));
  const waterScore = Math.min(20, Math.max(10, Math.round(12 + (estimatedRainwaterHarvestLitersDay / Math.max(estimatedWaterDemandLitersDay, 1)) * 100 * 0.2)));
  const wasteScore = 18;
  const airScore = Math.min(15, Math.max(8, Math.round(ventilationPotential * 0.15)));
  const daylightScore = Math.min(10, Math.max(4, Math.round(daylightPotential * 0.10)));
  const greenScore = Math.min(10, Math.max(3, Math.round(greenCoverageScore * 0.10)));

  const sustainabilityScore = energyScore + waterScore + wasteScore + airScore + daylightScore + greenScore;

  // 8. Optional ML prediction fetch
  let mlPredictions: Record<string, number> | undefined = undefined;
  let predictionMode: 'hybrid_ml' | 'engineering_rules' = 'engineering_rules';
  let mlModelVersion: string | undefined = undefined;

  try {
    const mlRes = await fetch('http://127.0.0.1:5001/api/ml/predict/environment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(3000),
      body: JSON.stringify({
        site_length_m: siteLengthFt * 0.3048,
        site_width_m: siteWidthFt * 0.3048,
        site_area_sqm: (siteLengthFt * siteWidthFt) * 0.092903,
        north_angle: northAngle,
        latitude: siteInput.latitude || 13.0827,
        longitude: siteInput.longitude || 80.2707,
        floors,
        bed_capacity: bedCapacity,
        dept_count: siteInput.selectedDepartments.length,
        has_solar: sustainabilityFeatures.solarPanels ? 1 : 0,
        has_rainwater: sustainabilityFeatures.rainwaterHarvesting ? 1 : 0,
        has_courtyard: sustainabilityFeatures.greenCourtyard ? 1 : 0,
        has_green_roof: 0,
        built_area_sqm: footprint.areaSqm * floors,
        open_space_percent: footprint.openSpacePercent,
        courtyard_area_sqm: footprint.courtyardAreaSqm,
        green_area_sqm: footprint.greenAreaSqm,
        solar_area_sqm: footprint.solarPanelAreaSqm,
        roof_area_sqm: footprint.areaSqm,
        avg_window_ratio: 0.25,
        occupancy_percent: 75,
        rainfall_mm_assumption: 1200,
        avg_temp_assumption: 28
      })
    });

    if (mlRes.ok) {
      const data = await mlRes.json();
      if (!data.fallback && data.predictions) {
        mlPredictions = data.predictions;
        predictionMode = 'hybrid_ml';
        mlModelVersion = data.model_version;
      }
    }
  } catch {
    // Fallback mode active — use engineering calculations
  }

  return {
    solarPotential,
    daylightPotential,
    ventilationPotential,
    rainwaterPotential,
    greenCoverageScore,
    estimatedEnergyDemandKwhDay,
    estimatedPeakEnergyKw,
    estimatedWaterDemandLitersDay,
    estimatedRainwaterHarvestLitersDay,
    sustainabilityScore,
    predictionMode,
    mlModelVersion,
    mlPredictions
  };
}
