export type DepartmentType =
  | 'emergency'
  | 'opd'
  | 'icu'
  | 'operation_theatre'
  | 'patient_ward'
  | 'pharmacy'
  | 'laboratory'
  | 'radiology'
  | 'administration'
  | 'parking'
  | 'reception'
  | 'dietary_kitchen'
  | 'service_bay';

export interface SustainabilityFeatures {
  solarPanels: boolean;
  rainwaterHarvesting: boolean;
  greywaterRecycling: boolean;
  greenCourtyard: boolean;
}

export interface SiteInput {
  locationName: string;
  latitude?: number;
  longitude?: number;
  siteLengthFt: number;
  siteWidthFt: number;
  northAngle: number;
  floors: number;
  bedCapacity: number;
  hospitalType: string;
  selectedDepartments: DepartmentType[];
  sustainabilityFeatures: SustainabilityFeatures;
}

export interface GeneratedRoom {
  id: string;
  name: string;
  department: DepartmentType;
  floor: number;
  xFt: number;
  yFt: number;
  widthFt: number;
  heightFt: number;
  areaSqm: number;
  vastuZone: string;
  vastuSuitability: 'OPTIMAL' | 'COMPATIBLE' | 'NEUTRAL' | 'AVOID';
  vastuExplanation: string;
  daylightExposureScore: number;
  ventilationExposureScore: number;
  furniture: {
    id: string;
    type: string;
    label: string;
    xOffsetFt: number;
    yOffsetFt: number;
    widthFt: number;
    heightFt: number;
  }[];
}

export interface BuildingFootprint {
  widthFt: number;
  lengthFt: number;
  areaSqm: number;
  openSpaceSqm: number;
  openSpacePercent: number;
  courtyardAreaSqm: number;
  solarPanelAreaSqm: number;
  greenAreaSqm: number;
}

export interface VastuZoneScore {
  zoneName: string;
  direction: string;
  idealDepartments: string[];
  assignedDepartments: string[];
  score: number;
  recommendations: string[];
}

export interface VastuAnalysis {
  score: number;
  orientationRating: string;
  entranceDirection: string;
  courtyardBrahmasthanStatus: string;
  zoneScores: VastuZoneScore[];
  generalBenefits: string[];
  improvementSuggestions: string[];
}

export interface EnvironmentalAnalysis {
  solarPotential: number;
  daylightPotential: number;
  ventilationPotential: number;
  rainwaterPotential: number;
  greenCoverageScore: number;
  estimatedEnergyDemandKwhDay: number;
  estimatedPeakEnergyKw: number;
  estimatedWaterDemandLitersDay: number;
  estimatedRainwaterHarvestLitersDay: number;
  sustainabilityScore: number;
  predictionMode: 'hybrid_ml' | 'engineering_rules';
  mlModelVersion?: string;
  mlPredictions?: Record<string, number>;
}

export interface SustainabilityDimension {
  name: string;
  maxScore: number;
  currentScore: number;
  icon: string;
  details: string;
}

export interface HospitalOverview {
  title: string;
  tagline: string;
  sustainabilityScore: number;
  energySavedPercent: number;
  waterSavedPercent: number;
  co2AvoidedKgDay: number;
  wasteDiversionPercent: number;
  renewableEnergyPercent: number;
  activeAlertsCount: number;
  demoActive: boolean;
  demoCaption: string;
  demoStep: number;
  timeOfDay: string;
  dayNightMode: 'DAY' | 'NIGHT';
}

export interface SustainabilityScore {
  total: number;
  totalScore?: number;
  statusLabel: 'EXCELLENT' | 'GOOD' | 'MODERATE' | 'POOR';
  dimensions: {
    energyEfficiency: SustainabilityDimension;
    waterConservation: SustainabilityDimension;
    wasteManagement: SustainabilityDimension;
    airQuality: SustainabilityDimension;
    daylightUtilization: SustainabilityDimension;
    greenCoverageVastu: SustainabilityDimension;
  };
  beforeAfterComparison?: {
    metric: string;
    conventional: number;
    vastuCare: number;
    unit: string;
    improvementPercent: number;
  }[];
}


export interface GeneratedDesign {
  id: string;
  name: string;
  version: number;
  createdAt: string;
  siteInput: SiteInput;
  buildingFootprint: BuildingFootprint;
  rooms: GeneratedRoom[];
  vastuAnalysis: VastuAnalysis;
  environmentalAnalysis: EnvironmentalAnalysis;
  sustainabilityScore: SustainabilityScore;
  adjacencyScore: number;
  layoutQualityScore: number;
  isOptimized: boolean;
  optimizationHistory?: {
    timestamp: string;
    previousScore: number;
    newScore: number;
    changesMade: string[];
  }[];
}

export interface CapacityLimitCheck {
  isValid: boolean;
  reason?: string;
  requiredAreaSqm: number;
  availableAreaSqm: number;
  suggestions: string[];
}

export interface OptimizationResult {
  originalDesignId: string;
  optimizedDesign: GeneratedDesign;
  candidatesEvaluated: number;
  candidatesRejected: number;
  candidatesValid: number;
  selectedCandidateIndex: number;
  scoreImprovement: number;
  previousScore: number;
  newScore: number;
  changesSummary: string[];
  scoringMode: 'hybrid_ml' | 'engineering_only';
}

// Monitoring Twin Types (Preserved)
export type SensorStatus = 'NORMAL' | 'WARNING' | 'CRITICAL';

export interface ZoneData {
  id: string;
  name: string;
  floor: 'GROUND' | 'FIRST' | 'SECOND' | 'EXTERIOR';
  occupancy: number;
  temperature: number;
  humidity: number;
  co2: number;
  energyLoad: number;
  waterUsage: number;
  airQualityStatus: SensorStatus;
  vastuOrientation: string;
  vastuBenefit: string;
  recommendations: string[];
}

export interface SensorData {
  id: string;
  zoneId: string;
  name: string;
  type: 'TEMPERATURE' | 'HUMIDITY' | 'CO2' | 'LIGHT' | 'ENERGY' | 'WATER' | 'WASTE';
  value: number;
  unit: string;
  status: SensorStatus;
  thresholds: { warning: number; critical: number };
  lastUpdated: string;
}

export interface EnergyMetrics {
  totalConsumptionKw: number;
  solarGenerationKw: number;
  gridDrawKw: number;
  todaySolarKwh: number;
  todayGridKwh: number;
  co2AvoidedKg: number;
  renewablePercentage: number;
  timeOfDayHour: number;
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
