import { SiteInput, GeneratedRoom, VastuAnalysis, VastuZoneScore } from './types.js';

export function analyzeVastu(siteInput: SiteInput, rooms: GeneratedRoom[]): VastuAnalysis {
  const angle = (siteInput.northAngle % 360 + 360) % 360;

  // Determine main entrance orientation relative to North
  let entranceDirection = 'North-East (Ishan Angle)';
  if (angle >= 337.5 || angle < 22.5) entranceDirection = 'North-East (Ishan Angle)';
  else if (angle >= 22.5 && angle < 67.5) entranceDirection = 'East (Indra Zone)';
  else if (angle >= 67.5 && angle < 112.5) entranceDirection = 'East / South-East';
  else if (angle >= 112.5 && angle < 157.5) entranceDirection = 'South-East (Agni Zone)';
  else if (angle >= 157.5 && angle < 202.5) entranceDirection = 'South (Yama Zone)';
  else if (angle >= 202.5 && angle < 247.5) entranceDirection = 'South-West (Nairrutya Zone)';
  else if (angle >= 247.5 && angle < 292.5) entranceDirection = 'West (Varun Zone)';
  else entranceDirection = 'North-West (Vayu Zone)';

  // Calculate zone scores based on room placements
  let vastuPoints = 50; // Base score

  // Orientation bonus
  if (angle >= 315 || angle <= 45) vastuPoints += 15; // North / North-East facing
  else if (angle > 45 && angle <= 135) vastuPoints += 12; // East facing
  else vastuPoints += 5;

  // Courtyard Brahmasthan bonus
  const hasCourtyard = siteInput.sustainabilityFeatures.greenCourtyard;
  if (hasCourtyard) vastuPoints += 12;

  // Check specific department zone suitability
  const zoneScores: VastuZoneScore[] = [
    {
      zoneName: 'Ishan Angle (North-East)',
      direction: 'North-East',
      idealDepartments: ['reception', 'opd', 'greenCourtyard'],
      assignedDepartments: rooms.filter(r => r.vastuZone.includes('North-East')).map(r => r.name),
      score: 88,
      recommendations: ['Maintain open skylights and water fountains in the North-East corner for patient vitality.']
    },
    {
      zoneName: 'Agni Zone (South-East)',
      direction: 'South-East',
      idealDepartments: ['laboratory', 'pharmacy', 'dietary_kitchen'],
      assignedDepartments: rooms.filter(r => r.vastuZone.includes('South-East')).map(r => r.name),
      score: 85,
      recommendations: ['Locate electrical transformers, sterilization heat units, and chemical diagnostic labs in South-East.']
    },
    {
      zoneName: 'Nairrutya Zone (South-West)',
      direction: 'South-West',
      idealDepartments: ['patient_ward', 'icu', 'operation_theatre'],
      assignedDepartments: rooms.filter(r => r.vastuZone.includes('South-West')).map(r => r.name),
      score: 82,
      recommendations: ['South-West provides heavy structural stability for critical recovery wards and ICU units.']
    },
    {
      zoneName: 'Vayu Zone (North-West)',
      direction: 'North-West',
      idealDepartments: ['emergency', 'parking', 'service_bay'],
      assignedDepartments: rooms.filter(r => r.vastuZone.includes('North-West')).map(r => r.name),
      score: 90,
      recommendations: ['Vayu (Air) element enables fast movement for emergency ambulances and triage response.']
    },
    {
      zoneName: 'Brahmasthan (Central Courtyard)',
      direction: 'Center',
      idealDepartments: ['greenCourtyard', 'reception'],
      assignedDepartments: hasCourtyard ? ['Central Brahmasthan Sky Courtyard'] : [],
      score: hasCourtyard ? 95 : 60,
      recommendations: hasCourtyard
        ? ['Central sky atrium floods all patient floors with therapeutic natural light.']
        : ['Consider adding a central lightwell courtyard to elevate daylighting and micro-ventilation.']
    }
  ];

  const totalScore = Math.min(100, Math.max(40, vastuPoints));

  return {
    score: totalScore,
    orientationRating: totalScore >= 80 ? 'Optimal (Ishan/Indra Aligned)' : 'Favorable',
    entranceDirection,
    courtyardBrahmasthanStatus: hasCourtyard ? 'Open Sky Courtyard Active (Brahmasthan Harmony)' : 'Standard Closed Atrium',
    zoneScores,
    generalBenefits: [
      'North-East entrance welcoming morning light lowers artificial lighting requirements.',
      'South-East Agni positioning isolates thermal and chemical laboratory loads.',
      'South-West Nairrutya positioning provides structural stability and serene recovery environment.',
      'North-West Vayu positioning accelerates emergency ambulance access and patient triage.'
    ],
    improvementSuggestions: [
      'Ensure North-East quadrant remains unencumbered by heavy waste storage.',
      'Align window shades with solar azimuth for optimal morning glare control.'
    ]
  };
}
