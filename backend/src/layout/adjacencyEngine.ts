import { GeneratedRoom } from './types.js';

export function calculateAdjacencyScore(rooms: GeneratedRoom[]): number {
  if (rooms.length === 0) return 50;

  let points = 70; // Base functional score

  const emergency = rooms.find(r => r.department === 'emergency');
  const icu = rooms.find(r => r.department === 'icu');
  const ot = rooms.find(r => r.department === 'operation_theatre');
  const opd = rooms.find(r => r.department === 'opd');
  const pharmacy = rooms.find(r => r.department === 'pharmacy');
  const lab = rooms.find(r => r.department === 'laboratory');
  const rad = rooms.find(r => r.department === 'radiology');

  // Helper distance check
  const getDistanceFt = (r1: GeneratedRoom, r2: GeneratedRoom) => {
    const dx = (r1.xFt + r1.widthFt / 2) - (r2.xFt + r2.widthFt / 2);
    const dy = (r1.yFt + r1.heightFt / 2) - (r2.yFt + r2.heightFt / 2);
    const floorDiff = Math.abs(r1.floor - r2.floor) * 15; // Vertical penalty
    return Math.sqrt(dx * dx + dy * dy) + floorDiff;
  };

  // 1. Emergency ↔ ICU / OT proximity
  if (emergency && icu) {
    const dist = getDistanceFt(emergency, icu);
    if (dist < 60) points += 8;
    else if (dist > 120) points -= 5;
  }

  // 2. OT ↔ ICU proximity
  if (ot && icu) {
    const dist = getDistanceFt(ot, icu);
    if (dist < 50) points += 8;
    else if (dist > 100) points -= 5;
  }

  // 3. OPD ↔ Pharmacy / Lab proximity
  if (opd && pharmacy) {
    const dist = getDistanceFt(opd, pharmacy);
    if (dist < 80) points += 5;
  }

  if (opd && lab) {
    const dist = getDistanceFt(opd, lab);
    if (dist < 80) points += 5;
  }

  // 4. Emergency ↔ Radiology proximity
  if (emergency && rad) {
    const dist = getDistanceFt(emergency, rad);
    if (dist < 70) points += 4;
  }

  return Math.min(100, Math.max(40, Math.round(points)));
}
