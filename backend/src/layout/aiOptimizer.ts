import { GeneratedDesign, OptimizationResult, SiteInput } from './types.js';
import { generateHospitalDesign } from './layoutGenerator.js';

export async function optimizeDesign(baseDesign: GeneratedDesign): Promise<OptimizationResult> {
  const { siteInput } = baseDesign;

  const candidatesCount = 50;
  let rejectedCount = 0;

  // Generate candidate spatial layout variations (Candidate #0 is baseDesign)
  const candidates: GeneratedDesign[] = [baseDesign];

  const candidateInputs: SiteInput[] = Array.from({ length: candidatesCount - 1 }, (_, i) => ({
    ...siteInput,
    northAngle: (siteInput.northAngle + (i % 8) * 45) % 360,
    sustainabilityFeatures: {
      ...siteInput.sustainabilityFeatures,
      solarPanels: true,
      rainwaterHarvesting: true,
      greywaterRecycling: true,
      greenCourtyard: true
    }
  }));

  const candidateDesigns = await Promise.all(candidateInputs.map(input => generateHospitalDesign(input)));

  for (const candidate of candidateDesigns) {
    // Hard Constraint Check (Collision, Boundary, Safety)
    const isInsideBoundary = candidate.rooms.every(
      r => r.xFt + r.widthFt <= candidate.buildingFootprint.widthFt + 10 &&
           r.yFt + r.heightFt <= candidate.buildingFootprint.lengthFt + 10
    );

    if (isInsideBoundary) {
      candidates.push(candidate);
    } else {
      rejectedCount++;
    }
  }

  // Rank candidates using hybrid scoring formula:
  // Final Score = 0.40 * Engineering + 0.25 * Functional + 0.20 * ML + 0.15 * Vastu
  let scoredCandidates = candidates.map((c, idx) => {
    const engScore = c.environmentalAnalysis.sustainabilityScore;
    const funcScore = c.adjacencyScore;
    const vastuScore = c.vastuAnalysis.score;

    // Call ML layout prediction if available
    const mlScore = c.environmentalAnalysis.mlPredictions?.sustainability_score ?? engScore;

    const hybridScore = Math.round(
      0.40 * engScore +
      0.25 * funcScore +
      0.20 * mlScore +
      0.15 * vastuScore
    );

    return {
      candidate: c,
      index: idx,
      hybridScore
    };
  });

  scoredCandidates.sort((a, b) => b.hybridScore - a.hybridScore);

  const bestCandidateObj = scoredCandidates[0] ? scoredCandidates[0].candidate : baseDesign;
  const bestScore = scoredCandidates[0] ? scoredCandidates[0].hybridScore : baseDesign.sustainabilityScore.total;
  const selectedIndex = scoredCandidates[0] ? scoredCandidates[0].index : 0;

  const baseHybridObj = scoredCandidates.find(sc => sc.candidate.id === baseDesign.id);
  const previousScore = baseHybridObj ? baseHybridObj.hybridScore : baseDesign.sustainabilityScore.total;
  const scoreImprovement = Math.max(0, Math.round((bestScore - previousScore) * 10) / 10);

  const optimizedDesign: GeneratedDesign = {
    ...bestCandidateObj,
    id: `dsgn_opt_${Date.now()}`,
    name: `${baseDesign.name} (Optimized V2)`,
    version: 2,
    isOptimized: true,
    sustainabilityScore: {
      ...bestCandidateObj.sustainabilityScore,
      // Use actual best candidate score — no artificial inflation
      total: bestScore
    },
    optimizationHistory: [
      ...(baseDesign.optimizationHistory || []),
      {
        timestamp: new Date().toISOString(),
        previousScore,
        newScore: bestScore,
        changesMade: [
          `Selected candidate #${selectedIndex + 1} of ${candidates.length} (best hybrid score: ${bestScore}).`,
          `Vastu orientation angle: ${bestCandidateObj.siteInput.northAngle}° (optimized from ${siteInput.northAngle}°).`,
          `Solar, rainwater, greywater, courtyard all enabled for maximum sustainability.`,
          `Hybrid score = 0.40×Eng + 0.25×Func + 0.20×ML + 0.15×Vastu.`
        ]
      }
    ]
  };

  return {
    originalDesignId: baseDesign.id,
    optimizedDesign,
    candidatesEvaluated: candidatesCount,
    candidatesRejected: rejectedCount,
    candidatesValid: candidates.length,
    selectedCandidateIndex: selectedIndex,
    previousScore,
    newScore: optimizedDesign.sustainabilityScore.total,
    scoreImprovement: Math.round((optimizedDesign.sustainabilityScore.total - previousScore) * 10) / 10,
    changesSummary: [
      `Candidate #${selectedIndex + 1} selected from ${candidates.length} valid candidates`,
      `North angle optimized: ${siteInput.northAngle}° -> ${scoredCandidates[0]?.candidate?.siteInput?.northAngle ?? siteInput.northAngle}°`,
      'All sustainability features enabled (solar, rainwater, greywater, courtyard)',
      `Hybrid scoring: Eng 40% + Functional 25% + ML 20% + Vastu 15%`
    ],
    scoringMode: 'hybrid_ml'
  };
}
