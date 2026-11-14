import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Grid } from '@react-three/drei';
import * as THREE from 'three';
import { ZoneData } from '../types';

interface Hospital3DSceneProps {
  zones: ZoneData[];
  selectedZone: ZoneData | null;
  onSelectZone: (zone: ZoneData | null) => void;
  activeFloor: 'ALL' | 'GROUND' | 'FIRST' | 'SECOND';
  activeLayer: 'NONE' | 'SOLAR' | 'WATER' | 'WASTE' | 'AIR';
  dayNightMode: 'DAY' | 'NIGHT';
}

// Architectural Floor Plate Slab
function FloorSlab({ position, size }: { position: [number, number, number]; size: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh receiveShadow castShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial color="#1e293b" roughness={0.4} metalness={0.3} />
      </mesh>
      {/* Slab Accent Edge */}
      <lineSegments args={[new THREE.EdgesGeometry(new THREE.BoxGeometry(...size))]}>
        <lineBasicMaterial color="#0f766e" opacity={0.4} transparent />
      </lineSegments>
    </group>
  );
}

// Architectural Room Box Component
function RoomMesh({
  position,
  size,
  color,
  zoneId,
  label,
  zones,
  onSelectZone,
  isSelected,
  activeLayer,
  floorLevel,
  activeFloor
}: {
  position: [number, number, number];
  size: [number, number, number];
  color: string;
  zoneId: string;
  label: string;
  zones: ZoneData[];
  onSelectZone: (zone: ZoneData | null) => void;
  isSelected: boolean;
  activeLayer: string;
  floorLevel: 'GROUND' | 'FIRST' | 'SECOND';
  activeFloor: string;
}) {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef<THREE.Mesh>(null);
  const zone = zones.find((z) => z.id === zoneId);

  // Determine visibility based on active floor filter
  const isVisible = activeFloor === 'ALL' || activeFloor === floorLevel;
  if (!isVisible) return null;

  // Layer highlight override
  let highlightColor = color;
  if (activeLayer === 'SOLAR' && zoneId === 'exterior_grounds') highlightColor = '#eab308';
  if (activeLayer === 'WATER' && (zoneId === 'patient_ward' || zoneId === 'exterior_grounds')) highlightColor = '#0284c7';
  if (activeLayer === 'WASTE' && zoneId === 'exterior_grounds') highlightColor = '#f43f5e';
  if (activeLayer === 'AIR' && (zoneId === 'opd' || zoneId === 'icu')) highlightColor = zone?.airQualityStatus === 'CRITICAL' ? '#ef4444' : '#10b981';

  return (
    <group position={position}>
      {/* Main Building Wall Geometry */}
      <mesh
        ref={meshRef}
        castShadow
        receiveShadow
        onClick={(e) => {
          e.stopPropagation();
          if (zone) onSelectZone(zone);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
      >
        <boxGeometry args={size} />
        <meshStandardMaterial
          color={highlightColor}
          transparent={true}
          opacity={hovered ? 0.95 : isSelected ? 0.98 : 0.85}
          roughness={0.25}
          metalness={0.25}
          emissive={isSelected ? '#14b8a6' : hovered ? '#0d9488' : '#000000'}
          emissiveIntensity={isSelected ? 0.45 : hovered ? 0.25 : 0}
        />
      </mesh>

      {/* Roof Band Accent Trim */}
      <mesh position={[0, size[1] / 2 + 0.05, 0]}>
        <boxGeometry args={[size[0] + 0.1, 0.1, size[2] + 0.1]} />
        <meshStandardMaterial color={isSelected ? '#2dd4bf' : '#334155'} roughness={0.3} />
      </mesh>

      {/* Glass Front Window Strip */}
      <mesh position={[0, 0, size[2] / 2 + 0.02]}>
        <planeGeometry args={[size[0] * 0.8, size[1] * 0.5]} />
        <meshStandardMaterial color="#38bdf8" transparent opacity={0.4} roughness={0.1} metalness={0.9} />
      </mesh>

      {/* Architectural Outline Edges */}
      <lineSegments args={[new THREE.EdgesGeometry(new THREE.BoxGeometry(...size))]}>
        <lineBasicMaterial color={isSelected ? '#2dd4bf' : '#64748b'} opacity={0.6} transparent />
      </lineSegments>

      {/* High-Legibility Glassmorphic Html Label Badge */}
      <Html position={[0, size[1] / 2 + 0.6, 0]} center distanceFactor={22}>
        <div
          onClick={(e) => {
            e.stopPropagation();
            if (zone) onSelectZone(zone);
          }}
          className={`cursor-pointer px-2.5 py-1 rounded-full text-[11px] font-bold tracking-tight whitespace-nowrap transition-all shadow-xl backdrop-blur-md flex items-center gap-1.5 border ${
            isSelected
              ? 'bg-teal-500 text-slate-950 border-teal-300 ring-2 ring-teal-400/50 scale-110'
              : hovered
              ? 'bg-slate-900/95 text-teal-300 border-teal-500/50 scale-105'
              : 'bg-slate-900/85 text-slate-200 border-slate-700/60'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              zone?.airQualityStatus === 'CRITICAL'
                ? 'bg-rose-500 animate-ping'
                : zone?.airQualityStatus === 'WARNING'
                ? 'bg-amber-400'
                : 'bg-emerald-400'
            }`}
          ></span>
          <span>{label}</span>
        </div>
      </Html>
    </group>
  );
}

// Rooftop Solar Panel Grid
function SolarPanels({ isVisible, isDay }: { isVisible: boolean; isDay: boolean }) {
  const panelRef = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (panelRef.current && isDay) {
      panelRef.current.children.forEach((c, idx) => {
        if (c instanceof THREE.Mesh && c.material) {
          (c.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.35 + Math.sin(state.clock.elapsedTime * 2.5 + idx) * 0.15;
        }
      });
    }
  });

  if (!isVisible) return null;

  return (
    <group ref={panelRef} position={[0, 7.8, -4]}>
      {[-4, -1.5, 1.5, 4].map((x) =>
        [-2, 0, 2].map((z) => (
          <mesh key={`solar_${x}_${z}`} position={[x, 0, z]} rotation={[-Math.PI / 8, 0, 0]} castShadow>
            <boxGeometry args={[1.8, 0.08, 1.3]} />
            <meshStandardMaterial color="#0284c7" emissive="#0369a1" emissiveIntensity={isDay ? 0.5 : 0.05} roughness={0.1} metalness={0.9} />
          </mesh>
        ))
      )}
    </group>
  );
}

// Rainwater Collection Tank
function RainwaterTank({ isVisible }: { isVisible: boolean }) {
  if (!isVisible) return null;
  return (
    <group position={[-10, 1.5, -4]}>
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[1.3, 1.3, 3, 32]} />
        <meshStandardMaterial color="#0284c7" transparent opacity={0.85} roughness={0.2} metalness={0.6} />
      </mesh>

      {/* Water Pipe System */}
      <mesh position={[2.5, 0.5, 2]} rotation={[0, 0, Math.PI / 4]}>
        <cylinderGeometry args={[0.12, 0.12, 4.5, 16]} />
        <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={0.6} />
      </mesh>

      <Html position={[0, 2.2, 0]} center distanceFactor={22}>
        <div className="bg-slate-900/90 text-sky-300 border border-sky-500/40 px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-lg whitespace-nowrap">
          💧 Rainwater Tank (78%)
        </div>
      </Html>
    </group>
  );
}

// Courtyard Garden & Trees
function GreenCourtyard() {
  return (
    <group position={[0, 0.5, 0]}>
      {/* Grass Base Bed */}
      <mesh position={[0, -0.4, 0]} receiveShadow>
        <cylinderGeometry args={[2.5, 2.5, 0.2, 32]} />
        <meshStandardMaterial color="#047857" roughness={0.8} />
      </mesh>

      {/* Central Vastu Courtyard Tree */}
      <mesh position={[0, 1.4, 0]} castShadow>
        <coneGeometry args={[1.4, 2.8, 16]} />
        <meshStandardMaterial color="#059669" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.2, 0]} castShadow>
        <cylinderGeometry args={[0.25, 0.25, 1.2, 12]} />
        <meshStandardMaterial color="#78350f" />
      </mesh>

      <Html position={[0, 3.2, 0]} center distanceFactor={22}>
        <div className="bg-slate-900/90 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-lg whitespace-nowrap">
          🌿 Brahmasthan Courtyard
        </div>
      </Html>
    </group>
  );
}

// Animated Solar Flow Beams
function SolarFlowBeams({ activeLayer }: { activeLayer: string }) {
  const beamRef = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (beamRef.current) {
      beamRef.current.rotation.y = state.clock.elapsedTime * 0.6;
    }
  });

  if (activeLayer !== 'SOLAR') return null;

  return (
    <group ref={beamRef} position={[0, 8.5, -4]}>
      <mesh>
        <torusGeometry args={[4.5, 0.08, 16, 64]} />
        <meshStandardMaterial color="#f59e0b" emissive="#fbbf24" emissiveIntensity={1} />
      </mesh>
    </group>
  );
}

export function Hospital3DScene({
  zones,
  selectedZone,
  onSelectZone,
  activeFloor,
  activeLayer,
  dayNightMode
}: Hospital3DSceneProps) {
  const isDay = dayNightMode === 'DAY';

  return (
    <div className="w-full h-full relative rounded-2xl overflow-hidden bg-gradient-to-b from-[#040914] to-[#091328] border border-slate-800/80 shadow-2xl">
      <Canvas
        shadows
        camera={{ position: [14, 11, 16], fov: 42 }}
        onCreated={({ scene }) => {
          scene.background = new THREE.Color(isDay ? '#070f21' : '#030611');
          scene.fog = new THREE.FogExp2(isDay ? '#070f21' : '#030611', 0.015);
        }}
      >
        {/* Lighting Setup */}
        <ambientLight intensity={isDay ? 0.7 : 0.25} />
        <hemisphereLight args={isDay ? ['#38bdf8', '#020617', 0.5] : ['#1e1b4b', '#020617', 0.3]} />
        <directionalLight
          position={isDay ? [18, 25, 14] : [-15, 12, -15]}
          intensity={isDay ? 1.6 : 0.4}
          color={isDay ? '#fef08a' : '#38bdf8'}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <pointLight position={[0, 10, 0]} intensity={isDay ? 0.4 : 1.4} color={isDay ? '#f59e0b' : '#14b8a6'} />

        <OrbitControls makeDefault target={[0, 3.5, 0]} maxPolarAngle={Math.PI / 2.05} minDistance={8} maxDistance={35} />

        {/* Architectural Base Grid & Ground Foundation */}
        <Grid
          infiniteGrid
          cellSize={1}
          sectionSize={5}
          fadeDistance={35}
          cellColor="#1e293b"
          sectionColor="#0f766e"
          position={[0, -0.01, 0]}
        />
        <mesh position={[0, -0.1, 0]} receiveShadow>
          <boxGeometry args={[26, 0.2, 22]} />
          <meshStandardMaterial color="#0e1726" roughness={0.5} metalness={0.2} />
        </mesh>

        {/* ---------------- UPPER FLOOR SLABS ---------------- */}
        {(activeFloor === 'ALL' || activeFloor === 'FIRST') && <FloorSlab position={[0, 3.0, 0]} size={[24, 0.1, 18]} />}
        {(activeFloor === 'ALL' || activeFloor === 'SECOND') && <FloorSlab position={[0, 6.0, -2]} size={[16, 0.1, 12]} />}

        {/* ---------------- GROUND FLOOR ---------------- */}
        <RoomMesh
          position={[0, 1.2, 6]}
          size={[7, 2.2, 5]}
          color="#0f766e"
          zoneId="reception"
          label="Reception & Lobby"
          zones={zones}
          onSelectZone={onSelectZone}
          isSelected={selectedZone?.id === 'reception'}
          activeLayer={activeLayer}
          floorLevel="GROUND"
          activeFloor={activeFloor}
        />

        <RoomMesh
          position={[-7, 1.2, 4]}
          size={[6, 2.2, 7]}
          color="#0284c7"
          zoneId="opd"
          label="Outpatient (OPD)"
          zones={zones}
          onSelectZone={onSelectZone}
          isSelected={selectedZone?.id === 'opd'}
          activeLayer={activeLayer}
          floorLevel="GROUND"
          activeFloor={activeFloor}
        />

        <RoomMesh
          position={[7, 1.2, 4]}
          size={[6, 2.2, 7]}
          color="#991b1b"
          zoneId="emergency"
          label="Emergency Unit"
          zones={zones}
          onSelectZone={onSelectZone}
          isSelected={selectedZone?.id === 'emergency'}
          activeLayer={activeLayer}
          floorLevel="GROUND"
          activeFloor={activeFloor}
        />

        <RoomMesh
          position={[-7, 1.2, -5]}
          size={[6, 2.2, 7]}
          color="#5b21b6"
          zoneId="lab_pharmacy"
          label="Lab & Pharmacy"
          zones={zones}
          onSelectZone={onSelectZone}
          isSelected={selectedZone?.id === 'lab_pharmacy'}
          activeLayer={activeLayer}
          floorLevel="GROUND"
          activeFloor={activeFloor}
        />

        {(activeFloor === 'ALL' || activeFloor === 'GROUND') && <GreenCourtyard />}

        {/* ---------------- FIRST FLOOR ---------------- */}
        <RoomMesh
          position={[-7, 4.2, 0]}
          size={[6, 2.2, 11]}
          color="#047857"
          zoneId="patient_ward"
          label="Patient Wards"
          zones={zones}
          onSelectZone={onSelectZone}
          isSelected={selectedZone?.id === 'patient_ward'}
          activeLayer={activeLayer}
          floorLevel="FIRST"
          activeFloor={activeFloor}
        />

        <RoomMesh
          position={[7, 4.2, 0]}
          size={[6, 2.2, 11]}
          color="#3730a3"
          zoneId="icu"
          label="ICU Unit"
          zones={zones}
          onSelectZone={onSelectZone}
          isSelected={selectedZone?.id === 'icu'}
          activeLayer={activeLayer}
          floorLevel="FIRST"
          activeFloor={activeFloor}
        />

        {/* ---------------- SECOND FLOOR ---------------- */}
        <RoomMesh
          position={[0, 7.2, -4]}
          size={[12, 2.2, 7]}
          color="#b45309"
          zoneId="operation_theatre"
          label="Operation Theatre (OT)"
          zones={zones}
          onSelectZone={onSelectZone}
          isSelected={selectedZone?.id === 'operation_theatre'}
          activeLayer={activeLayer}
          floorLevel="SECOND"
          activeFloor={activeFloor}
        />

        {/* ---------------- EXTERIOR & ROOF ---------------- */}
        <SolarPanels isVisible={activeFloor === 'ALL' || activeFloor === 'SECOND'} isDay={isDay} />
        <RainwaterTank isVisible={activeFloor === 'ALL' || activeFloor === 'GROUND'} />
        <SolarFlowBeams activeLayer={activeLayer} />
      </Canvas>

      {/* Quick 3D Navigation Watermark */}
      <div className="absolute top-4 left-4 pointer-events-none glass-panel px-3 py-1.5 rounded-xl text-xs text-slate-300 font-semibold flex items-center gap-2 border border-teal-500/30">
        <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
        Interactive Architectural Twin
      </div>
    </div>
  );
}
