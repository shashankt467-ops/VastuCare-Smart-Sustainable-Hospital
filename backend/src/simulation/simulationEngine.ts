import {
  ZoneData,
  SensorData,
  EnergyMetrics,
  WaterMetrics,
  WasteBin,
  Alert,
  Recommendation,
  SustainabilityScore,
  SensorStatus
} from '../types.js';

export class SimulationEngine {
  private isRunning: boolean = true;
  private simulationSpeed: number = 1; // 1x, 2x, 5x
  private hourOfDay: number = 12.5; // 12:30 PM default
  private dayNightMode: 'DAY' | 'NIGHT' = 'DAY';
  private timer: NodeJS.Timeout | null = null;

  // Demo mode state
  public isDemoActive: boolean = false;
  public demoCurrentStep: number = 0;
  public demoCaption: string = '';

  // In-memory data store
  private zones: ZoneData[] = [];
  private sensors: SensorData[] = [];
  private wasteBins: WasteBin[] = [];
  private alerts: Alert[] = [];
  private collectionHistory: { id: string; timestamp: string; type: string; amountLiters: number }[] = [];

  constructor() {
    this.initDefaultData();
    this.startTicker();
  }

  private initDefaultData() {
    // 8 Zones (covering ground, 1st, 2nd floors & exterior)
    this.zones = [
      {
        id: 'reception',
        name: 'Main Entrance & Reception',
        floor: 'GROUND',
        occupancy: 65,
        temperature: 23.2,
        humidity: 50,
        co2: 680,
        energyLoad: 12.4,
        waterUsage: 8.5,
        airQualityStatus: 'NORMAL',
        vastuOrientation: 'North-East (Ishan Angle)',
        vastuBenefit: 'Promotes welcoming positive energy, natural morning light, and efficient patient flow.',
        recommendations: ['Maintain natural daylighting with automated skylight dimming.']
      },
      {
        id: 'opd',
        name: 'Outpatient Department (OPD)',
        floor: 'GROUND',
        occupancy: 82,
        temperature: 24.1,
        humidity: 55,
        co2: 950, // slightly elevated warning
        energyLoad: 28.6,
        waterUsage: 14.2,
        airQualityStatus: 'WARNING',
        vastuOrientation: 'East (Indra Zone)',
        vastuBenefit: 'Leverages early morning sunlight for natural disinfection and patient vitality.',
        recommendations: ['Increase fresh-air ventilation to lower CO2 below 800 ppm.']
      },
      {
        id: 'emergency',
        name: 'Emergency & Triage Unit',
        floor: 'GROUND',
        occupancy: 78,
        temperature: 22.8,
        humidity: 48,
        co2: 740,
        energyLoad: 35.2,
        waterUsage: 18.0,
        airQualityStatus: 'NORMAL',
        vastuOrientation: 'North-West (Vayu Zone)',
        vastuBenefit: 'Vayu (Air) element enables quick movement, rapid triage, and high ventilation.',
        recommendations: ['Continuous critical power monitoring enabled.']
      },
      {
        id: 'lab_pharmacy',
        name: 'Diagnostic Lab & Pharmacy',
        floor: 'GROUND',
        occupancy: 45,
        temperature: 21.5,
        humidity: 45,
        co2: 610,
        energyLoad: 42.0,
        waterUsage: 12.5,
        airQualityStatus: 'NORMAL',
        vastuOrientation: 'South-East (Agni Zone)',
        vastuBenefit: 'Agni (Fire) zone ideal for chemical, electrical equipment, and precision diagnostics.',
        recommendations: ['Optimize refrigeration HVAC heat rejection.']
      },
      {
        id: 'patient_ward',
        name: 'Inpatient Wards (Floor 1)',
        floor: 'FIRST',
        occupancy: 70,
        temperature: 23.5,
        humidity: 52,
        co2: 710,
        energyLoad: 22.1,
        waterUsage: 28.4,
        airQualityStatus: 'NORMAL',
        vastuOrientation: 'South-West (Nairrutya Zone)',
        vastuBenefit: 'Stability & calm healing environment for recovering patients.',
        recommendations: ['Courtyard ventilation corridor supplying fresh air.']
      },
      {
        id: 'icu',
        name: 'Intensive Care Unit (ICU)',
        floor: 'FIRST',
        occupancy: 88,
        temperature: 22.0,
        humidity: 50,
        co2: 720,
        energyLoad: 48.5,
        waterUsage: 22.0,
        airQualityStatus: 'NORMAL',
        vastuOrientation: 'North (Kuber Zone)',
        vastuBenefit: 'Cool, serene ambient control with uninterrupted patient monitoring.',
        recommendations: ['HVAC operating on 100% HEPA filtered recirculation.']
      },
      {
        id: 'operation_theatre',
        name: 'Operation Theatre Complex (OT)',
        floor: 'SECOND',
        occupancy: 60,
        temperature: 20.5,
        humidity: 46,
        co2: 580,
        energyLoad: 64.0,
        waterUsage: 31.0,
        airQualityStatus: 'NORMAL',
        vastuOrientation: 'West / South-West',
        vastuBenefit: 'Strict spatial isolation, sterile airflow corridors, and stable structural enclosure.',
        recommendations: ['Positive pressure laminar flow active.']
      },
      {
        id: 'exterior_grounds',
        name: 'Rooftop Solar & Eco Grounds',
        floor: 'EXTERIOR',
        occupancy: 10,
        temperature: 28.5,
        humidity: 60,
        co2: 415,
        energyLoad: 5.0,
        waterUsage: 45.0,
        airQualityStatus: 'NORMAL',
        vastuOrientation: 'Open Brahmasthan Central Courtyard & Solar Roof',
        vastuBenefit: 'Central sky courtyard connects all hospital wings to daylight and rainwater catchment.',
        recommendations: ['Solar generation peak tracking active.']
      }
    ];

    // Waste Bins
    this.wasteBins = [
      {
        id: 'bin_bio',
        type: 'BIOMEDICAL',
        label: 'Biomedical Waste Hub',
        fillPercentage: 84, // high threshold for demo
        capacityLiters: 200,
        status: 'CRITICAL',
        lastCollected: new Date(Date.now() - 3600000 * 14).toISOString(),
        location: 'Ground Floor Service Bay'
      },
      {
        id: 'bin_recyc',
        type: 'RECYCLABLE',
        label: 'Recyclable Paper & Plastic',
        fillPercentage: 45,
        capacityLiters: 300,
        status: 'NORMAL',
        lastCollected: new Date(Date.now() - 3600000 * 8).toISOString(),
        location: 'OPD & Admin Corridor'
      },
      {
        id: 'bin_gen',
        type: 'GENERAL',
        label: 'General Solid Waste',
        fillPercentage: 62,
        capacityLiters: 400,
        status: 'WARNING',
        lastCollected: new Date(Date.now() - 3600000 * 10).toISOString(),
        location: 'Central Courtyard & Cafeteria'
      },
      {
        id: 'bin_org',
        type: 'ORGANIC',
        label: 'Organic Composting Waste',
        fillPercentage: 38,
        capacityLiters: 250,
        status: 'NORMAL',
        lastCollected: new Date(Date.now() - 3600000 * 6).toISOString(),
        location: 'Dietary & Kitchen Yard'
      }
    ];

    // Initial Alerts
    this.alerts = [
      {
        id: 'alt_01',
        timestamp: new Date(Date.now() - 1200000).toISOString(),
        type: 'WASTE',
        severity: 'CRITICAL',
        zoneId: 'exterior_grounds',
        zoneName: 'Service Yard',
        message: 'Biomedical waste bin fill level has reached 84% capacity.',
        recommendation: 'Schedule emergency bio-hazard collection immediately.',
        resolved: false
      },
      {
        id: 'alt_02',
        timestamp: new Date(Date.now() - 2400000).toISOString(),
        type: 'ENVIRONMENT',
        severity: 'WARNING',
        zoneId: 'opd',
        zoneName: 'Outpatient Department',
        message: 'CO2 concentration elevated at 950 ppm due to peak morning outpatient volume.',
        recommendation: 'Trigger Vastu courtyard air circulation dampers.',
        resolved: false
      }
    ];

    this.rebuildSensorsFromZones();
  }

  private rebuildSensorsFromZones() {
    const list: SensorData[] = [];
    this.zones.forEach((z) => {
      list.push({
        id: `sns_${z.id}_temp`,
        zoneId: z.id,
        name: `${z.name} Temp Sensor`,
        type: 'TEMPERATURE',
        value: z.temperature,
        unit: '°C',
        status: z.temperature > 28 ? 'CRITICAL' : z.temperature > 25 ? 'WARNING' : 'NORMAL',
        thresholds: { warning: 25, critical: 28 },
        lastUpdated: new Date().toISOString()
      });
      list.push({
        id: `sns_${z.id}_co2`,
        zoneId: z.id,
        name: `${z.name} CO2 Sensor`,
        type: 'CO2',
        value: z.co2,
        unit: 'ppm',
        status: z.co2 > 1200 ? 'CRITICAL' : z.co2 > 800 ? 'WARNING' : 'NORMAL',
        thresholds: { warning: 800, critical: 1200 },
        lastUpdated: new Date().toISOString()
      });
    });
    this.sensors = list;
  }

  private startTicker() {
    if (this.timer) clearInterval(this.timer);
    this.timer = setInterval(() => {
      if (this.isRunning) {
        this.tick();
      }
    }, 2000);
  }

  private tick() {
    // 1. Advance time of day
    if (!this.isDemoActive) {
      this.hourOfDay = (this.hourOfDay + 0.05 * this.simulationSpeed) % 24;
    }
    this.dayNightMode = this.hourOfDay >= 6 && this.hourOfDay <= 18 ? 'DAY' : 'NIGHT';

    // 2. Fluctuate zone telemetry slightly
    this.zones.forEach((z) => {
      if (!this.isDemoActive) {
        // slight jitter
        z.temperature = Math.round((z.temperature + (Math.random() * 0.2 - 0.1)) * 10) / 10;
        z.co2 = Math.max(400, Math.round(z.co2 + (Math.random() * 10 - 5)));
        z.energyLoad = Math.max(5, Math.round((z.energyLoad + (Math.random() * 0.8 - 0.4)) * 10) / 10);
      }

      // Calculate status
      if (z.co2 > 1200 || z.temperature > 30) {
        z.airQualityStatus = 'CRITICAL';
      } else if (z.co2 > 800 || z.temperature > 26) {
        z.airQualityStatus = 'WARNING';
      } else {
        z.airQualityStatus = 'NORMAL';
      }
    });

    // 3. Increment waste bin fill levels slowly
    if (!this.isDemoActive) {
      this.wasteBins.forEach((b) => {
        if (b.fillPercentage < 100) {
          b.fillPercentage = Math.min(100, b.fillPercentage + 0.2 * this.simulationSpeed);
          if (b.fillPercentage >= 80) b.status = 'CRITICAL';
          else if (b.fillPercentage >= 60) b.status = 'WARNING';
          else b.status = 'NORMAL';
        }
      });
    }

    this.rebuildSensorsFromZones();
  }

  // API getters & state triggers
  public getHospitalOverview() {
    const sustainability = this.getSustainabilityScore();
    const energy = this.getEnergyMetrics();
    const water = this.getWaterMetrics();

    return {
      title: 'VastuCare — Smart Sustainable Hospital',
      tagline: 'Vastu-Inspired Architecture & AI-Driven Environmental Engineering',
      sustainabilityScore: sustainability.totalScore,
      energySavedPercent: 24.8,
      waterSavedPercent: water.waterSavedPercentage,
      co2AvoidedKgDay: energy.co2AvoidedKg,
      wasteDiversionPercent: 68.5,
      renewableEnergyPercent: energy.renewablePercentage,
      activeAlertsCount: this.alerts.filter((a) => !a.resolved).length,
      demoActive: this.isDemoActive,
      demoCaption: this.demoCaption,
      demoStep: this.demoCurrentStep,
      timeOfDay: `${Math.floor(this.hourOfDay)}:${Math.floor((this.hourOfDay % 1) * 60)
        .toString()
        .padStart(2, '0')}`,
      dayNightMode: this.dayNightMode
    };
  }

  public getZones(): ZoneData[] {
    return this.zones;
  }

  public getSensors(): SensorData[] {
    return this.sensors;
  }

  public getEnergyMetrics(): EnergyMetrics {
    const totalConsumptionKw = this.zones.reduce((sum, z) => sum + z.energyLoad, 0);

    // Solar generation parabolic curve peaking at hour 13 (1 PM)
    let solarKw = 0;
    if (this.hourOfDay >= 6 && this.hourOfDay <= 18) {
      const normalizedPeak = Math.sin(((this.hourOfDay - 6) / 12) * Math.PI);
      solarKw = Math.round(normalizedPeak * 115 * 10) / 10; // max ~115 kW peak solar
    }

    if (this.dayNightMode === 'NIGHT') {
      solarKw = 0;
    }

    const gridKw = Math.max(0, Math.round((totalConsumptionKw - solarKw) * 10) / 10);
    const renewablePct = totalConsumptionKw > 0 ? Math.min(100, Math.round((solarKw / totalConsumptionKw) * 100)) : 0;
    const co2AvoidedKg = Math.round(solarKw * 0.45 * 24 * 10) / 10; // kg CO2 avoided estimate

    return {
      totalConsumptionKw: Math.round(totalConsumptionKw * 10) / 10,
      solarGenerationKw: solarKw,
      gridDrawKw: gridKw,
      todaySolarKwh: 482.5,
      todayGridKwh: 1120.0,
      co2AvoidedKg,
      renewablePercentage: renewablePct,
      timeOfDayHour: this.hourOfDay,
      dayNightMode: this.dayNightMode,
      zoneConsumption: this.zones.map((z) => ({
        zoneId: z.id,
        zoneName: z.name,
        consumptionKw: z.energyLoad
      }))
    };
  }

  public getWaterMetrics(): WaterMetrics {
    const totalUsage = this.zones.reduce((sum, z) => sum + z.waterUsage, 0);
    const isLeak = this.zones.some((z) => z.waterUsage > 25 && z.id !== 'exterior_grounds');
    const leakZoneObj = this.zones.find((z) => z.waterUsage > 25 && z.id !== 'exterior_grounds');

    return {
      totalUsageLpm: Math.round(totalUsage * 10) / 10,
      rainwaterCollectedLiters: 18400,
      recycledGreywaterLiters: 12100,
      tankLevelPercentage: 78,
      waterSavedPercentage: 31.4,
      leakDetected: !!isLeak,
      leakZone: leakZoneObj ? leakZoneObj.name : undefined,
      leakDetails: leakZoneObj ? `Abnormal water draw rate detected in ${leakZoneObj.name}` : undefined
    };
  }

  public getWasteBins(): WasteBin[] {
    return this.wasteBins;
  }

  public getAlerts(): Alert[] {
    return this.alerts;
  }

  public getRecommendations(): Recommendation[] {
    const recs: Recommendation[] = [];

    // Check Bio-waste
    const bioBin = this.wasteBins.find((b) => b.type === 'BIOMEDICAL');
    if (bioBin && bioBin.fillPercentage >= 80) {
      recs.push({
        id: 'rec_waste_01',
        priority: 'CRITICAL',
        category: 'WASTE',
        title: 'Immediate Biomedical Waste Evacuation',
        description: `Biomedical waste bin level is currently at ${Math.round(
          bioBin.fillPercentage
        )}%. Immediate collection prevents cross-contamination.`,
        impact: 'Diverts hazard risks and maintains hospital sanitation compliance.',
        zoneId: 'exterior_grounds',
        applied: false
      });
    }

    // Check OPD CO2
    const opd = this.zones.find((z) => z.id === 'opd');
    if (opd && opd.co2 > 800) {
      recs.push({
        id: 'rec_hvac_01',
        priority: 'HIGH',
        category: 'HVAC',
        title: 'Activate Vastu Courtyard Wind Dampers',
        description: `CO2 level in ${opd.name} is ${opd.co2} ppm due to heavy patient traffic. Open East-wing daylight and wind corridors.`,
        impact: 'Reduces indoor CO2 by 250 ppm using zero-energy micro-ventilation.',
        zoneId: 'opd',
        applied: false
      });
    }

    // Solar peak recommendation
    const energy = this.getEnergyMetrics();
    if (energy.solarGenerationKw > 80) {
      recs.push({
        id: 'rec_solar_01',
        priority: 'MEDIUM',
        category: 'SOLAR',
        title: 'Prioritize Heavy Medical Loads During Solar Peak',
        description: `Solar array is generating ${energy.solarGenerationKw} kW. Schedule sterilizers and laundry systems now.`,
        impact: 'Maximizes clean self-consumption and lowers peak grid demand tariffs by 18%.',
        zoneId: 'exterior_grounds',
        applied: false
      });
    }

    // General Vastu Daylight rec
    recs.push({
      id: 'rec_vastu_01',
      priority: 'LOW',
      category: 'VASTU',
      title: 'Optimize Skylight Shading in Brahmasthan',
      description: 'Central sky courtyard sunlight orientation reduces artificial lighting load across patient corridors.',
      impact: 'Saves ~4.2 kWh daylight power per afternoon.',
      zoneId: 'reception',
      applied: true
    });

    return recs;
  }

  public getSustainabilityScore(): SustainabilityScore {
    const energy = this.getEnergyMetrics();
    const bioBin = this.wasteBins.find((b) => b.type === 'BIOMEDICAL');
    const avgCo2 = this.zones.reduce((sum, z) => sum + z.co2, 0) / this.zones.length;

    // Calculate score components dynamically out of max values
    const energyScore = Math.min(25, Math.max(10, Math.round(15 + energy.renewablePercentage * 0.1)));
    const waterScore = 17; // out of 20
    const wasteScore = bioBin && bioBin.fillPercentage >= 80 ? 12 : 18; // out of 20
    const airScore = Math.min(15, Math.max(5, Math.round(15 - (avgCo2 - 500) * 0.015))); // out of 15
    const daylightScore = 9; // out of 10
    const greenVastuScore = 9; // out of 10

    const totalScore = energyScore + waterScore + wasteScore + airScore + daylightScore + greenVastuScore;

    let statusLabel: 'EXCELLENT' | 'GOOD' | 'MODERATE' | 'POOR' = 'EXCELLENT';
    if (totalScore < 60) statusLabel = 'POOR';
    else if (totalScore < 75) statusLabel = 'MODERATE';
    else if (totalScore < 85) statusLabel = 'GOOD';

    return {
      totalScore,
      total: totalScore,
      statusLabel,
      dimensions: {
        energyEfficiency: {
          name: 'Energy Efficiency & Renewables',
          maxScore: 25,
          currentScore: energyScore,
          icon: 'Zap',
          details: `${energy.renewablePercentage}% solar energy mix`
        },
        waterConservation: {
          name: 'Water Conservation & Harvesting',
          maxScore: 20,
          currentScore: waterScore,
          icon: 'Droplets',
          details: 'Rainwater catchment + 31% water saved'
        },
        wasteManagement: {
          name: 'Smart Waste Segregation & Diversion',
          maxScore: 20,
          currentScore: wasteScore,
          icon: 'Trash2',
          details: '68% waste diversion from landfill'
        },
        airQuality: {
          name: 'Indoor Environmental Quality',
          maxScore: 15,
          currentScore: airScore,
          icon: 'Wind',
          details: `Average hospital CO2: ${Math.round(avgCo2)} ppm`
        },
        daylightUtilization: {
          name: 'Natural Daylight & Orientation',
          maxScore: 10,
          currentScore: daylightScore,
          icon: 'Sun',
          details: 'Vastu East/North-East daylighting'
        },
        greenCoverageVastu: {
          name: 'Courtyard Greenery & Vastu Layout',
          maxScore: 10,
          currentScore: greenVastuScore,
          icon: 'Trees',
          details: 'Central Brahmasthan courtyard design'
        }
      },
      beforeAfterComparison: [
        { metric: 'Annual Energy Intensity', conventional: 380, vastuCare: 265, unit: 'kWh/m²', improvementPercent: 30.2 },
        { metric: 'Fresh Water Consumption', conventional: 550, vastuCare: 375, unit: 'Liters/bed/day', improvementPercent: 31.8 },
        { metric: 'Landfill Waste Generated', conventional: 4.2, vastuCare: 1.35, unit: 'kg/bed/day', improvementPercent: 67.8 },
        { metric: 'Carbon Footprint', conventional: 1450, vastuCare: 920, unit: 'Tons CO2e/yr', improvementPercent: 36.5 }
      ]
    };
  }

  // Interactive Actions
  public collectWaste(binId: string) {
    const bin = this.wasteBins.find((b) => b.id === binId);
    if (bin) {
      const amount = Math.round(bin.capacityLiters * (bin.fillPercentage / 100));
      bin.fillPercentage = 0;
      bin.status = 'NORMAL';
      bin.lastCollected = new Date().toISOString();

      this.collectionHistory.unshift({
        id: `col_${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: bin.type,
        amountLiters: amount
      });

      // Clear related waste alert if present
      this.alerts = this.alerts.map((a) => (a.type === 'WASTE' ? { ...a, resolved: true } : a));

      return { success: true, message: `${bin.label} collected successfully (${amount} Liters emptied).` };
    }
    return { success: false, message: 'Waste bin not found.' };
  }

  public resolveAlert(alertId: string) {
    const alert = this.alerts.find((a) => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      return { success: true, message: `Alert ${alertId} marked as resolved.` };
    }
    return { success: false, message: 'Alert not found.' };
  }

  public resetSimulation() {
    this.isDemoActive = false;
    this.demoCurrentStep = 0;
    this.demoCaption = '';
    this.hourOfDay = 12.5;
    this.simulationSpeed = 1;
    this.initDefaultData();
    return { success: true, message: 'Simulation reset to baseline state.' };
  }

  public setConfig(config: { speed?: number; dayNight?: 'DAY' | 'NIGHT'; hour?: number }) {
    if (config.speed !== undefined) this.simulationSpeed = config.speed;
    if (config.dayNight !== undefined) {
      this.dayNightMode = config.dayNight;
      this.hourOfDay = config.dayNight === 'DAY' ? 13 : 22;
    }
    if (config.hour !== undefined) this.hourOfDay = config.hour;
    return { success: true, message: 'Simulation settings updated.' };
  }

  // DEMO MODE AUTOMATED SCENARIO
  public triggerDemoStep(stepNumber?: number) {
    this.isDemoActive = true;
    if (stepNumber !== undefined) {
      this.demoCurrentStep = stepNumber;
    } else {
      this.demoCurrentStep = (this.demoCurrentStep % 6) + 1;
    }

    switch (this.demoCurrentStep) {
      case 1:
        // Baseline normal state
        this.resetSimulation();
        this.isDemoActive = true;
        this.demoCurrentStep = 1;
        const scoreStep1 = this.getSustainabilityScore().totalScore;
        this.demoCaption = `Hospital Baseline: Systems operating within optimal parameters (Score: ${scoreStep1}/100, Solar Generation active).`;
        break;

      case 2:
        // OPD Occupancy & CO2 Surge
        const opd = this.zones.find((z) => z.id === 'opd');
        if (opd) {
          opd.occupancy = 96;
          opd.co2 = 1350; // Critical CO2 spike!
          opd.temperature = 26.5;
          opd.airQualityStatus = 'CRITICAL';
        }
        this.alerts.unshift({
          id: `alt_demo_${Date.now()}`,
          timestamp: new Date().toISOString(),
          type: 'ENVIRONMENT',
          severity: 'CRITICAL',
          zoneId: 'opd',
          zoneName: 'Outpatient Department',
          message: 'CRITICAL: High patient overcrowding caused CO2 spike to 1350 ppm in OPD.',
          recommendation: 'Trigger Vastu Courtyard fresh air circulation immediately.',
          resolved: false
        });
        this.demoCaption = 'Telemetry Incident: High patient surge detected — CO2 elevated to 1350 ppm in OPD (Critical Environment Alert).';
        break;

      case 3:
        // Waste threshold reached
        const bioBin = this.wasteBins.find((b) => b.type === 'BIOMEDICAL');
        if (bioBin) {
          bioBin.fillPercentage = 94; // Critical waste level
          bioBin.status = 'CRITICAL';
        }
        this.alerts.unshift({
          id: `alt_demo_waste_${Date.now()}`,
          timestamp: new Date().toISOString(),
          type: 'WASTE',
          severity: 'CRITICAL',
          zoneId: 'exterior_grounds',
          zoneName: 'Service Yard',
          message: 'CRITICAL: Biomedical Waste Storage level reached 94% capacity limit!',
          recommendation: 'Perform immediate waste collection action.',
          resolved: false
        });
        this.demoCaption = 'Facility Alert: Biomedical Waste Storage exceeded 90% capacity limit in Service Yard.';
        break;

      case 4:
        // AI Recommendation Engine Generation
        this.demoCaption = 'AI Advisory Active: Automated HVAC routing & courtyard ventilation recommendation generated.';
        break;

      case 5:
        // Execute One-Click Waste Collection & Resolve Alert
        const bioBinToCollect = this.wasteBins.find((b) => b.type === 'BIOMEDICAL');
        if (bioBinToCollect) {
          this.collectWaste(bioBinToCollect.id);
        }
        const opdToFix = this.zones.find((z) => z.id === 'opd');
        if (opdToFix) {
          opdToFix.co2 = 720;
          opdToFix.airQualityStatus = 'NORMAL';
        }
        this.alerts.forEach((a) => (a.resolved = true));
        this.demoCaption = 'Automated Remediation Executed: Hazardous waste collected & courtyard fresh air circulation restored.';
        break;

      case 6:
        // Final Score Update
        const scoreStep6 = this.getSustainabilityScore().totalScore;
        this.demoCaption = `Facility Stabilized: Hospital sustainability restored to Optimum (${scoreStep6}/100). All systems nominal.`;
        break;
    }

    return {
      success: true,
      demoStep: this.demoCurrentStep,
      caption: this.demoCaption,
      overview: this.getHospitalOverview()
    };
  }
}

// Export singleton instance
export const simulationEngine = new SimulationEngine();
