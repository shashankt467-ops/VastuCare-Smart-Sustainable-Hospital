import {
  SiteInput,
  GeneratedRoom,
  BuildingFootprint,
  GeneratedDesign,
  CapacityLimitCheck,
  DepartmentType
} from './types.js';
import { analyzeVastu } from './vastuAnalyzer.js';
import { analyzeEnvironmental } from './environmentalAnalyzer.js';
import { calculateSustainabilityScore } from './sustainabilityEngine.js';
import { calculateAdjacencyScore } from './adjacencyEngine.js';

/**
 * Capacity validation check before layout generation.
 */
export function calculateCapacityLimits(siteInput: SiteInput): CapacityLimitCheck {
  const { siteLengthFt, siteWidthFt, floors, bedCapacity, selectedDepartments } = siteInput;

  const siteAreaSqm = (siteLengthFt * siteWidthFt) * 0.092903;
  const maxFootprintRatio = 0.60; // Max building coverage ratio
  const maxAvailableFootprintSqm = siteAreaSqm * maxFootprintRatio;
  const totalAvailableBuiltAreaSqm = maxAvailableFootprintSqm * floors;

  // Department space estimation (sqm)
  const sqmPerBed = 10; // Avg bed space requirement including corridors
  const requiredBedSpaceSqm = bedCapacity * sqmPerBed;

  // Base department overhead (sqm)
  const deptAreaMap: Record<DepartmentType, number> = {
    emergency: 120,
    opd: 180,
    icu: 110,
    operation_theatre: 140,
    patient_ward: requiredBedSpaceSqm * 0.5,
    pharmacy: 70,
    laboratory: 90,
    radiology: 100,
    administration: 80,
    parking: 150,
    reception: 90,
    dietary_kitchen: 80,
    service_bay: 70
  };

  let requiredBuiltAreaSqm = selectedDepartments.reduce(
    (sum, dept) => sum + (deptAreaMap[dept] || 60),
    0
  );

  // Add 20% corridor & circulation overhead
  requiredBuiltAreaSqm *= 1.20;

  if (requiredBuiltAreaSqm > totalAvailableBuiltAreaSqm) {
    const suggestions: string[] = [];
    if (floors < 5) suggestions.push(`Increase floor count from ${floors} to ${floors + 1} or ${floors + 2}`);
    suggestions.push(`Expand site dimensions (current: ${siteLengthFt}×${siteWidthFt} ft)`);
    suggestions.push(`Adjust bed capacity from ${bedCapacity} to ${Math.round(bedCapacity * (totalAvailableBuiltAreaSqm / requiredBuiltAreaSqm))}`);
    if (selectedDepartments.includes('parking')) suggestions.push('Move parking to external open ground bay');

    return {
      isValid: false,
      reason: `Required area (${Math.round(requiredBuiltAreaSqm)} m²) exceeds maximum site building capacity (${Math.round(totalAvailableBuiltAreaSqm)} m² over ${floors} floors).`,
      requiredAreaSqm: Math.round(requiredBuiltAreaSqm),
      availableAreaSqm: Math.round(totalAvailableBuiltAreaSqm),
      suggestions
    };
  }

  return {
    isValid: true,
    requiredAreaSqm: Math.round(requiredBuiltAreaSqm),
    availableAreaSqm: Math.round(totalAvailableBuiltAreaSqm),
    suggestions: []
  };
}

/**
 * Procedural furniture generator per department.
 */
function generateFurniture(dept: DepartmentType, roomW: number, roomH: number) {
  const items: { id: string; type: string; label: string; xOffsetFt: number; yOffsetFt: number; widthFt: number; heightFt: number }[] = [];

  switch (dept) {
    case 'icu':
      items.push({ id: 'f_icu_bed1', type: 'ICU_BED', label: 'Critical ICU Care Bed #1', xOffsetFt: 3, yOffsetFt: 4, widthFt: 6, heightFt: 4 });
      items.push({ id: 'f_icu_mon1', type: 'MONITOR', label: 'Vital Signs Monitor System', xOffsetFt: 9.5, yOffsetFt: 4, widthFt: 2, heightFt: 2 });
      items.push({ id: 'f_icu_bed2', type: 'ICU_BED', label: 'Critical ICU Care Bed #2', xOffsetFt: 3, yOffsetFt: 11, widthFt: 6, heightFt: 4 });
      items.push({ id: 'f_icu_mon2', type: 'MONITOR', label: 'Ventilator & Monitor Unit', xOffsetFt: 9.5, yOffsetFt: 11, widthFt: 2, heightFt: 2 });
      break;

    case 'operation_theatre':
      items.push({ id: 'f_ot_table', type: 'OT_TABLE', label: 'Multi-axis Operating Table', xOffsetFt: roomW / 2 - 3, yOffsetFt: roomH / 2 - 2, widthFt: 6, heightFt: 4 });
      items.push({ id: 'f_ot_light', type: 'SURGICAL_LIGHT', label: 'Laminar Surgical Overhead Light', xOffsetFt: roomW / 2 - 2, yOffsetFt: roomH / 2 - 2, widthFt: 4, heightFt: 4 });
      items.push({ id: 'f_ot_anest', type: 'ANESTHESIA', label: 'Anesthesia Workstation', xOffsetFt: 3, yOffsetFt: 4, widthFt: 3, heightFt: 3 });
      break;

    case 'patient_ward':
      items.push({ id: 'f_ward_b1', type: 'PATIENT_BED', label: 'Hospital Recovery Bed A', xOffsetFt: 3, yOffsetFt: 3, widthFt: 6, heightFt: 3.5 });
      items.push({ id: 'f_ward_t1', type: 'BEDSIDE_TABLE', label: 'Bedside Cabinet', xOffsetFt: 9.5, yOffsetFt: 3, widthFt: 2, heightFt: 2 });
      items.push({ id: 'f_ward_b2', type: 'PATIENT_BED', label: 'Hospital Recovery Bed B', xOffsetFt: 3, yOffsetFt: 9, widthFt: 6, heightFt: 3.5 });
      items.push({ id: 'f_ward_t2', type: 'BEDSIDE_TABLE', label: 'Bedside Cabinet', xOffsetFt: 9.5, yOffsetFt: 9, widthFt: 2, heightFt: 2 });
      break;

    case 'reception':
      items.push({ id: 'f_rec_desk', type: 'RECEPTION_DESK', label: 'Main Triage & Info Desk', xOffsetFt: 4, yOffsetFt: 3, widthFt: 12, heightFt: 4 });
      items.push({ id: 'f_rec_seating', type: 'WAITING_BENCH', label: 'Patient Waiting Lounge Seats', xOffsetFt: 4, yOffsetFt: 10, widthFt: 10, heightFt: 3 });
      break;

    case 'laboratory':
      items.push({ id: 'f_lab_bench1', type: 'LAB_BENCH', label: 'Biochemistry Diagnostics Bench', xOffsetFt: 3, yOffsetFt: 3, widthFt: 10, heightFt: 3 });
      items.push({ id: 'f_lab_bench2', type: 'LAB_BENCH', label: 'Hematology Analyzer Station', xOffsetFt: 3, yOffsetFt: 8, widthFt: 10, heightFt: 3 });
      break;

    case 'pharmacy':
      items.push({ id: 'f_ph_counter', type: 'DISPENSING_COUNTER', label: 'Medication Dispensing Window', xOffsetFt: 3, yOffsetFt: 3, widthFt: 10, heightFt: 3 });
      items.push({ id: 'f_ph_racks', type: 'DRUG_SHELF', label: 'Cold Storage & Medicine Racks', xOffsetFt: 3, yOffsetFt: 8, widthFt: 10, heightFt: 2.5 });
      break;

    case 'opd':
      items.push({ id: 'f_opd_desk', type: 'RECEPTION_DESK', label: 'OPD Registration Desk', xOffsetFt: 3, yOffsetFt: 3, widthFt: 8, heightFt: 3 });
      items.push({ id: 'f_opd_chair1', type: 'WAITING_CHAIR', label: 'Patient Waiting Chair Row 1', xOffsetFt: 3, yOffsetFt: 8, widthFt: 10, heightFt: 2 });
      items.push({ id: 'f_opd_chair2', type: 'WAITING_CHAIR', label: 'Patient Waiting Chair Row 2', xOffsetFt: 3, yOffsetFt: 12, widthFt: 10, heightFt: 2 });
      break;

    case 'reception':
      items.push({ id: 'f_rec_desk', type: 'RECEPTION_DESK', label: 'Main Reception Counter', xOffsetFt: 3, yOffsetFt: 3, widthFt: 12, heightFt: 3 });
      items.push({ id: 'f_rec_computer', type: 'COMPUTER_WORKSTATION', label: 'Admissions Computer', xOffsetFt: 3, yOffsetFt: 8, widthFt: 4, heightFt: 3 });
      break;

    case 'administration':
      items.push({ id: 'f_adm_desk', type: 'OFFICE_DESK', label: 'Admin Office Desk', xOffsetFt: 3, yOffsetFt: 3, widthFt: 6, heightFt: 3 });
      items.push({ id: 'f_adm_cabinet', type: 'FILE_CABINET', label: 'Document Filing Cabinet', xOffsetFt: 3, yOffsetFt: 8, widthFt: 4, heightFt: 2 });
      break;

    case 'radiology':
      items.push({ id: 'f_rad_xray', type: 'XRAY_MACHINE', label: 'X-Ray & CT Scan Unit', xOffsetFt: 3, yOffsetFt: 3, widthFt: 10, heightFt: 6 });
      items.push({ id: 'f_rad_console', type: 'RADIOLOGY_CONSOLE', label: 'Radiologist Workstation', xOffsetFt: 3, yOffsetFt: 12, widthFt: 6, heightFt: 3 });
      break;

    case 'emergency':
      items.push({ id: 'f_em_bed1', type: 'STRETCHER_BED', label: 'Emergency Trauma Stretcher #1', xOffsetFt: 3, yOffsetFt: 3, widthFt: 6, heightFt: 3.5 });
      items.push({ id: 'f_em_bed2', type: 'STRETCHER_BED', label: 'Emergency Triage Stretcher #2', xOffsetFt: 3, yOffsetFt: 8, widthFt: 6, heightFt: 3.5 });
      break;
  }

  return items;
}

/**
 * Main procedural layout generator engine.
 */
export async function generateHospitalDesign(siteInput: SiteInput): Promise<GeneratedDesign> {
  const { siteLengthFt, siteWidthFt, floors, bedCapacity, selectedDepartments, northAngle } = siteInput;

  // 1. Calculate building footprint inside site boundary
  const footprintRatio = 0.55;
  const buildingLengthFt = Math.round(siteLengthFt * 0.70);
  const buildingWidthFt = Math.round(siteWidthFt * 0.70);
  const footprintAreaSqm = (buildingLengthFt * buildingWidthFt) * 0.092903;
  const siteAreaSqm = (siteLengthFt * siteWidthFt) * 0.092903;

  const openSpaceSqm = siteAreaSqm - footprintAreaSqm;
  const openSpacePercent = Math.round((openSpaceSqm / siteAreaSqm) * 100);

  const courtyardAreaSqm = siteInput.sustainabilityFeatures.greenCourtyard ? Math.round(footprintAreaSqm * 0.12) : 0;
  const solarPanelAreaSqm = siteInput.sustainabilityFeatures.solarPanels ? Math.round(footprintAreaSqm * 0.45) : 0;
  const greenAreaSqm = courtyardAreaSqm + Math.round(openSpaceSqm * 0.35);

  const footprint: BuildingFootprint = {
    widthFt: buildingWidthFt,
    lengthFt: buildingLengthFt,
    areaSqm: Math.round(footprintAreaSqm),
    openSpaceSqm: Math.round(openSpaceSqm),
    openSpacePercent,
    courtyardAreaSqm,
    solarPanelAreaSqm,
    greenAreaSqm
  };

  // 2. Procedural Department & Room Allocation per floor
  const rawDepts: DepartmentType[] = ['reception', ...selectedDepartments];
  const deptsToPlace: DepartmentType[] = Array.from(new Set(rawDepts));
  const rooms: GeneratedRoom[] = [];

  // Floor distribution logic: distribute across ALL requested floors (0..floors-1)
  const floorDepts: Record<number, DepartmentType[]> = {};
  for (let f = 0; f < floors; f++) {
    floorDepts[f] = [];
  }

  // Priority mapping for floor levels
  deptsToPlace.forEach((dept, idx) => {
    // Ground floor priority
    if (['reception', 'emergency', 'opd', 'parking'].includes(dept)) {
      floorDepts[0].push(dept);
    } else {
      // Distribute remaining departments across floors 1..floors-1 evenly
      const targetFloor = (floors > 1) ? 1 + (idx % (floors - 1)) : 0;
      floorDepts[targetFloor].push(dept);
    }
  });

  // Validation: Ensure NO requested floor is left empty
  for (let f = 0; f < floors; f++) {
    if (floorDepts[f].length === 0) {
      if (f === 0) {
        floorDepts[0].push('reception');
      } else if (f === floors - 1 && floors >= 3) {
        floorDepts[f].push('administration');
      } else {
        floorDepts[f].push('patient_ward');
      }
    }
  }



  const marginX = 8;
  const marginY = 8;
  const gridW = buildingWidthFt - marginX * 2;
  const gridH = buildingLengthFt - marginY * 2;

  // Department readable labels & Vastu alignment mapping
  const deptLabels: Record<DepartmentType, string> = {
    reception: 'Main Entrance & Triage Reception',
    emergency: 'Emergency & Trauma Unit',
    opd: 'Outpatient Department (OPD)',
    pharmacy: 'Central Pharmacy & Dispensing',
    laboratory: 'Diagnostic & Hematology Lab',
    radiology: 'Radiology & Imaging Suite',
    patient_ward: 'Inpatient Recovery Wards',
    icu: 'Intensive Care Unit (ICU)',
    operation_theatre: 'Operation Theatre Complex (OT)',
    administration: 'Hospital Admin & Records',
    parking: 'Emergency Ambulance & Visitor Parking',
    dietary_kitchen: 'Dietary Services & Kitchen',
    service_bay: 'Biomedical Service Bay'
  };

  const deptVastuZones: Record<DepartmentType, { zone: string; suitability: 'OPTIMAL' | 'COMPATIBLE' | 'NEUTRAL'; exp: string }> = {
    reception: { zone: 'North-East (Ishan Angle)', suitability: 'OPTIMAL', exp: 'Welcoming morning light and positive energy flow for arriving patients.' },
    emergency: { zone: 'North-West (Vayu Zone)', suitability: 'OPTIMAL', exp: 'Vayu (Air) element accelerates rapid triage response and ambulance entry.' },
    opd: { zone: 'East (Indra Zone)', suitability: 'OPTIMAL', exp: 'Morning solar disinfection for high-volume outpatient consultation.' },
    pharmacy: { zone: 'South-East (Agni Zone)', suitability: 'COMPATIBLE', exp: 'Agni (Fire) zone provides dry ambient storage for clinical supplies.' },
    laboratory: { zone: 'South-East (Agni Zone)', suitability: 'OPTIMAL', exp: 'Agni zone ideal for electrical diagnostics, specimen heating, and chemical labs.' },
    radiology: { zone: 'West (Varun Zone)', suitability: 'COMPATIBLE', exp: 'Stable interior enclosure for MRI and CT imaging equipment.' },
    patient_ward: { zone: 'South-West (Nairrutya Zone)', suitability: 'OPTIMAL', exp: 'Nairrutya zone promotes deep rest and stable healing recovery for inpatients.' },
    icu: { zone: 'North (Kuber Zone)', suitability: 'OPTIMAL', exp: 'Cool North alignment provides serene, stable environment for critical care.' },
    operation_theatre: { zone: 'West / South-West', suitability: 'OPTIMAL', exp: 'Sterile airflow isolation and heavy structural stability for surgery suites.' },
    administration: { zone: 'North / East', suitability: 'NEUTRAL', exp: 'Efficient administrative workflow and clear administrative sightlines.' },
    parking: { zone: 'North-West / Exterior', suitability: 'COMPATIBLE', exp: 'High circulation airflow for vehicular exhaust management.' },
    dietary_kitchen: { zone: 'South-East (Agni Zone)', suitability: 'OPTIMAL', exp: 'Agni element ideal for dietary cooking and steam sanitation.' },
    service_bay: { zone: 'South-East / Service Yard', suitability: 'COMPATIBLE', exp: 'Service access isolated from main patient corridors.' }
  };

  // Build 2D room layouts per floor
  for (let f = 0; f < floors; f++) {
    const depts = floorDepts[f] || [];
    if (depts.length === 0) continue;

    const cols = depts.length > 2 ? 2 : 1;
    const rows = Math.ceil(depts.length / cols);
    const roomW = Math.floor((gridW - (cols - 1) * 4) / cols);
    const roomH = Math.floor((gridH - (rows - 1) * 4) / rows);

    depts.forEach((dept, idx) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);

      const xFt = marginX + col * (roomW + 4);
      const yFt = marginY + row * (roomH + 4);
      const areaSqm = Math.round((roomW * roomH) * 0.092903);

      const vastu = deptVastuZones[dept] || { zone: 'North-East', suitability: 'COMPATIBLE', exp: 'Standard functional positioning.' };

      // Daylight & Ventilation calculated from perimeter proximity
      const isPerimeter = col === 0 || col === cols - 1 || row === 0 || row === rows - 1;
      const daylightExposureScore = isPerimeter ? Math.round(75 + Math.random() * 15) : 55;
      const ventilationExposureScore = isPerimeter ? Math.round(70 + Math.random() * 20) : 50;

      const furniture = generateFurniture(dept, roomW, roomH);

      rooms.push({
        id: `rm_f${f}_${dept}_${idx}`,
        name: deptLabels[dept] || dept,
        department: dept,
        floor: f,
        xFt,
        yFt,
        widthFt: roomW,
        heightFt: roomH,
        areaSqm,
        vastuZone: vastu.zone,
        vastuSuitability: vastu.suitability,
        vastuExplanation: vastu.exp,
        daylightExposureScore,
        ventilationExposureScore,
        furniture
      });
    });
  }

  // 3. Run Vastu Analysis
  const vastuAnalysis = analyzeVastu(siteInput, rooms);

  // 4. Run Environmental Analysis — ASYNC, calls ML service (falls back to engineering rules if ML unavailable)
  const environmentalAnalysis = await analyzeEnvironmental(siteInput, footprint, rooms);

  // 5. Run 6-Dimension Sustainability Score
  const sustainabilityScore = calculateSustainabilityScore(environmentalAnalysis);

  // 6. Run Adjacency & Layout Quality Scoring
  const adjacencyScore = calculateAdjacencyScore(rooms);
  const layoutQualityScore = Math.round(
    0.35 * adjacencyScore +
    0.25 * vastuAnalysis.score +
    0.20 * environmentalAnalysis.sustainabilityScore +
    0.20 * environmentalAnalysis.daylightPotential
  );

  const designId = `dsgn_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  return {
    id: designId,
    name: `${siteInput.hospitalType} — ${siteInput.locationName}`,
    version: 1,
    createdAt: new Date().toISOString(),
    siteInput,
    buildingFootprint: footprint,
    rooms,
    vastuAnalysis,
    environmentalAnalysis,
    sustainabilityScore,
    adjacencyScore,
    layoutQualityScore,
    isOptimized: false
  };
}
