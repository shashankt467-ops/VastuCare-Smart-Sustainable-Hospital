import { EnvironmentalAnalysis, SustainabilityScore } from './types.js';

export function calculateSustainabilityScore(env: EnvironmentalAnalysis): SustainabilityScore {
  const energyScore = Math.min(25, Math.max(10, Math.round(15 + (env.solarPotential / 100) * 10)));
  const waterScore = Math.min(20, Math.max(10, Math.round(12 + (env.rainwaterPotential / 100) * 8)));
  const wasteScore = 18;
  const airScore = Math.min(15, Math.max(8, Math.round(env.ventilationPotential * 0.15)));
  const daylightScore = Math.min(10, Math.max(4, Math.round(env.daylightPotential * 0.10)));
  const greenVastuScore = Math.min(10, Math.max(3, Math.round(env.greenCoverageScore * 0.10)));

  const total = energyScore + waterScore + wasteScore + airScore + daylightScore + greenVastuScore;

  let statusLabel: 'EXCELLENT' | 'GOOD' | 'MODERATE' | 'POOR' = 'EXCELLENT';
  if (total < 60) statusLabel = 'POOR';
  else if (total < 75) statusLabel = 'MODERATE';
  else if (total < 85) statusLabel = 'GOOD';

  return {
    total,
    statusLabel,
    dimensions: {
      energyEfficiency: {
        name: 'Energy Efficiency & Renewables',
        maxScore: 25,
        currentScore: energyScore,
        icon: 'Zap',
        details: `Solar potential score: ${env.solarPotential}/100`
      },
      waterConservation: {
        name: 'Water Conservation & Harvesting',
        maxScore: 20,
        currentScore: waterScore,
        icon: 'Droplets',
        details: `Rainwater potential score: ${env.rainwaterPotential}/100`
      },
      wasteManagement: {
        name: 'Smart Waste Segregation & Diversion',
        maxScore: 20,
        currentScore: wasteScore,
        icon: 'Trash2',
        details: 'Biomedical & organic waste segregation active'
      },
      airQuality: {
        name: 'Indoor Environmental Quality',
        maxScore: 15,
        currentScore: airScore,
        icon: 'Wind',
        details: `Natural ventilation score: ${env.ventilationPotential}/100`
      },
      daylightUtilization: {
        name: 'Natural Daylight & Orientation',
        maxScore: 10,
        currentScore: daylightScore,
        icon: 'Sun',
        details: `Daylight potential score: ${env.daylightPotential}/100`
      },
      greenCoverageVastu: {
        name: 'Courtyard Greenery & Vastu Layout',
        maxScore: 10,
        currentScore: greenVastuScore,
        icon: 'Trees',
        details: `Green space coverage: ${env.greenCoverageScore}/100`
      }
    }
  };
}
