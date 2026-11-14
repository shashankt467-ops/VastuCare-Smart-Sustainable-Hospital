export type SensorStatus = 'NORMAL' | 'WARNING' | 'CRITICAL';

export interface SensorData {
  id: string;
  zoneId: string;
  name: string;
  type: 'TEMPERATURE' | 'HUMIDITY' | 'CO2' | 'LIGHT' | 'ENERGY' | 'WATER' | 'WASTE';
  value: number;
  unit: string;
  status: SensorStatus;
  thresholds: {
    warning: number;
    critical: number;
  };
  lastUpdated: string;
}

export interface ZoneData {
  id: string;
  name: string;
  floor: 'GROUND' | 'FIRST' | 'SECOND' | 'EXTERIOR';
  occupancy: number; // percentage
  temperature: number; // °C
  humidity: number; // %
  co2: number; // ppm
  energyLoad: number; // kW
  waterUsage: number; // L/min
  airQualityStatus: SensorStatus;
  vastuOrientation: string;
  vastuBenefit: string;
  recommendations: string[];
}

export interface EnergyMetrics {
  totalConsumptionKw: number; // kW
  solarGenerationKw: number; // kW
  gridDrawKw: number; // kW
  todaySolarKwh: number;
  todayGridKwh: number;
  co2AvoidedKg: number;
  renewablePercentage: number; // %
  timeOfDayHour: number; // 0..24
  dayNightMode: 'DAY' | 'NIGHT';
  zoneConsumption: { zoneId: string; zoneName: string; consumptionKw: number }[];
}

export interface WaterMetrics {
  totalUsageLpm: number;
  rainwaterCollectedLiters: number;
  recycledGreywaterLiters: number;
  tankLevelPercentage: number;
  waterSavedPercentage: number;
  leakDetected: boolean;
  leakZone?: string;
  leakDetails?: string;
}

export interface WasteBin {
  id: string;
  type: 'BIOMEDICAL' | 'RECYCLABLE' | 'GENERAL' | 'ORGANIC';
  label: string;
  fillPercentage: number;
  capacityLiters: number;
  status: SensorStatus;
  lastCollected: string;
  location: string;
}

export interface Alert {
  id: string;
  timestamp: string;
  type: 'ENERGY' | 'WATER' | 'WASTE' | 'ENVIRONMENT' | 'TEMPERATURE' | 'SYSTEM';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'WARNING';
  zoneId: string;
  zoneName: string;
  message: string;
  recommendation: string;
  resolved: boolean;
}

export interface Recommendation {
  id: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  category: 'HVAC' | 'LIGHTING' | 'WATER' | 'WASTE' | 'SOLAR' | 'VASTU';
  title: string;
  description: string;
  impact: string;
  zoneId?: string;
  applied: boolean;
}

export interface SustainabilityDimension {
  name: string;
  maxScore: number;
  currentScore: number;
  icon: string;
  details: string;
}

export interface SustainabilityScore {
  totalScore: number; // 0..100
  total?: number;     // alias for frontend compatibility
  statusLabel: 'EXCELLENT' | 'GOOD' | 'MODERATE' | 'POOR';
  dimensions: {
    energyEfficiency: SustainabilityDimension;
    waterConservation: SustainabilityDimension;
    wasteManagement: SustainabilityDimension;
    airQuality: SustainabilityDimension;
    daylightUtilization: SustainabilityDimension;
    greenCoverageVastu: SustainabilityDimension;
  };
  beforeAfterComparison: {
    metric: string;
    conventional: number;
    vastuCare: number;
    unit: string;
    improvementPercent: number;
  }[];
}

export interface DemoStep {
  step: number;
  title: string;
  caption: string;
  targetPage: string;
  activeZoneId?: string;
}
