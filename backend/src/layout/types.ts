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
  northAngle: number; // 0..359 degrees
  floors: number; // 1..5
  bedCapacity: number;
  hospitalType: string;
  selectedDepartments: DepartmentType[];
  sustainabilityFeatures: SustainabilityFeatures;
}

export interface GeneratedRoom {
  id: string;
  name: string;
  department: DepartmentType;
  floor: number; // 0=Ground, 1=First, etc.
  xFt: number;
  yFt: number;
  widthFt: number;
  heightFt: number;
  areaSqm: number;
  vastuZone: string;
  vastuSuitability: 'OPTIMAL' | 'COMPATIBLE' | 'NEUTRAL' | 'AVOID';
  vastuExplanation: string;
  daylightExposureScore: number; // 0..100
  ventilationExposureScore: number; // 0..100
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
  score: number; // 0..100
  recommendations: string[];
}

export interface VastuAnalysis {
  score: number; // 0..100
  orientationRating: string;
  entranceDirection: string;
  courtyardBrahmasthanStatus: string;
  zoneScores: VastuZoneScore[];
  generalBenefits: string[];
  improvementSuggestions: string[];
}

export interface EnvironmentalAnalysis {
  solarPotential: number; // 0..100
  daylightPotential: number; // 0..100
  ventilationPotential: number; // 0..100
  rainwaterPotential: number; // 0..100
  greenCoverageScore: number; // 0..100
  estimatedEnergyDemandKwhDay: number;
  estimatedPeakEnergyKw: number;
  estimatedWaterDemandLitersDay: number;
  estimatedRainwaterHarvestLitersDay: number;
  sustainabilityScore: number; // 0..100
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

export interface SustainabilityScore {
  total: number; // 0..100
  statusLabel: 'EXCELLENT' | 'GOOD' | 'MODERATE' | 'POOR';
  dimensions: {
    energyEfficiency: SustainabilityDimension;
    waterConservation: SustainabilityDimension;
    wasteManagement: SustainabilityDimension;
    airQuality: SustainabilityDimension;
    daylightUtilization: SustainabilityDimension;
    greenCoverageVastu: SustainabilityDimension;
  };
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
  adjacencyScore: number; // 0..100
  layoutQualityScore: number; // 0..100
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
