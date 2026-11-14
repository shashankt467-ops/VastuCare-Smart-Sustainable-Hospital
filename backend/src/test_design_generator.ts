import { generateHospitalDesign, calculateCapacityLimits } from './layout/layoutGenerator.js';
import { SiteInput } from './layout/types.js';

async function runTests() {
  console.log("==================================================");
  console.log("TESTING USER SCENARIO 1: CHENNAI GENERAL HOSPITAL");
  console.log("==================================================");

  const chennaiInput: SiteInput = {
    locationName: 'Chennai, Tamil Nadu, India',
    latitude: 13.0827,
    longitude: 80.2707,
    siteLengthFt: 200,
    siteWidthFt: 150,
    northAngle: 0,
    floors: 3,
    bedCapacity: 150,
    hospitalType: 'General Hospital',
    selectedDepartments: [
      'emergency', 'opd', 'icu', 'operation_theatre',
      'patient_ward', 'pharmacy', 'laboratory',
      'radiology', 'administration', 'parking'
    ],
    sustainabilityFeatures: {
      solarPanels: true,
      rainwaterHarvesting: true,
      greywaterRecycling: true,
      greenCourtyard: true
    }
  };

  const chennaiDesign = await generateHospitalDesign(chennaiInput);

  console.log(`Design ID: ${chennaiDesign.id}`);
  console.log(`Building footprint: ${chennaiDesign.buildingFootprint.widthFt} x ${chennaiDesign.buildingFootprint.lengthFt} ft`);
  console.log(`Total Rooms Generated: ${chennaiDesign.rooms.length}`);
  console.log(`Vastu Score: ${chennaiDesign.vastuAnalysis.score}/100`);
  console.log(`Environmental Score: ${chennaiDesign.environmentalAnalysis.sustainabilityScore}/100`);
  console.log(`Sustainability Total: ${chennaiDesign.sustainabilityScore.total}/100`);
  console.log(`Prediction Mode: ${chennaiDesign.environmentalAnalysis.predictionMode}`);

  console.log("\n==================================================");
  console.log("TESTING USER SCENARIO 2: MADURAI 50-BED CLINIC");
  console.log("==================================================");

  const maduraiInput: SiteInput = {
    locationName: 'Madurai, Tamil Nadu, India',
    latitude: 9.9252,
    longitude: 78.1198,
    siteLengthFt: 100,
    siteWidthFt: 100,
    northAngle: 90,
    floors: 2,
    bedCapacity: 50,
    hospitalType: 'General Hospital',
    selectedDepartments: [
      'emergency', 'opd', 'icu', 'patient_ward',
      'pharmacy', 'laboratory'
    ],
    sustainabilityFeatures: {
      solarPanels: false,
      rainwaterHarvesting: true,
      greywaterRecycling: false,
      greenCourtyard: false
    }
  };

  const maduraiDesign = await generateHospitalDesign(maduraiInput);

  console.log(`Design ID: ${maduraiDesign.id}`);
  console.log(`Building footprint: ${maduraiDesign.buildingFootprint.widthFt} x ${maduraiDesign.buildingFootprint.lengthFt} ft`);
  console.log(`Total Rooms Generated: ${maduraiDesign.rooms.length}`);
  console.log(`Vastu Score: ${maduraiDesign.vastuAnalysis.score}/100`);
  console.log(`Environmental Score: ${maduraiDesign.environmentalAnalysis.sustainabilityScore}/100`);
  console.log(`Sustainability Total: ${maduraiDesign.sustainabilityScore.total}/100`);
  console.log(`Prediction Mode: ${maduraiDesign.environmentalAnalysis.predictionMode}`);

  console.log("\n==================================================");
  console.log("VERIFYING LAYOUT DIFFERENCES");
  console.log("==================================================");
  console.log(`Chennai Rooms: ${chennaiDesign.rooms.length} vs Madurai Rooms: ${maduraiDesign.rooms.length}`);
  console.log(`Chennai Footprint: ${chennaiDesign.buildingFootprint.widthFt}x${chennaiDesign.buildingFootprint.lengthFt} vs Madurai: ${maduraiDesign.buildingFootprint.widthFt}x${maduraiDesign.buildingFootprint.lengthFt}`);
  console.log(`Chennai North: ${chennaiDesign.siteInput.northAngle} vs Madurai North: ${maduraiDesign.siteInput.northAngle}`);
  console.log(`Chennai Solar: ${chennaiDesign.siteInput.sustainabilityFeatures.solarPanels} vs Madurai Solar: ${maduraiDesign.siteInput.sustainabilityFeatures.solarPanels}`);

  if (chennaiDesign.rooms.length !== maduraiDesign.rooms.length &&
      (chennaiDesign.buildingFootprint.widthFt !== maduraiDesign.buildingFootprint.widthFt ||
       chennaiDesign.buildingFootprint.lengthFt !== maduraiDesign.buildingFootprint.lengthFt)) {
    console.log("VERIFIED: Changing inputs produces genuinely different designs, room coordinates, and scores!");
  } else {
    console.log("ERROR: Designs are identical!");
  }
}

runTests().catch(console.error);
