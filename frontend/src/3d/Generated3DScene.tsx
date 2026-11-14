import React, { useState, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, Text } from '@react-three/drei';
import { GeneratedDesign, GeneratedRoom } from '../types';
import {
  Layers,
  Info,
  CheckCircle2,
  Zap,
  Droplets,
  Wind,
  Sun,
  Trees,
  Maximize2,
  Compass,
  Eye,
  RotateCcw,
  Sparkles
} from 'lucide-react';

interface Generated3DSceneProps {
  design: GeneratedDesign;
  onSelectRoom?: (room: GeneratedRoom) => void;
}

// Category mapping & color palette
export const getDeptCategory = (dept: string) => {
  switch (dept) {
    case 'emergency':
      return { category: 'EMERGENCY', color: '#ef4444', wall: '#fee2e2', label: 'Emergency & Trauma' };
    case 'icu':
    case 'nurse_station':
      return { category: 'CLINICAL', color: '#6366f1', wall: '#e0e7ff', label: 'Critical Care ICU' };
    case 'operation_theatre':
    case 'pre_op':
    case 'recovery':
      return { category: 'SURGICAL', color: '#a855f7', wall: '#f3e8ff', label: 'Operation Suite' };
    case 'patient_ward':
      return { category: 'INPATIENT', color: '#14b8a6', wall: '#ccfbf1', label: 'Recovery Wards' };
    case 'opd':
    case 'reception':
    case 'cafeteria':
      return { category: 'PUBLIC', color: '#0ea5e9', wall: '#e0f2fe', label: 'Public & OPD' };
    case 'pharmacy':
    case 'laboratory':
    case 'radiology':
      return { category: 'DIAGNOSTICS', color: '#f59e0b', wall: '#fef3c7', label: 'Diagnostics & Drugs' };
    default:
      return { category: 'SERVICE', color: '#64748b', wall: '#f1f5f9', label: 'Service & Admin' };
  }
};

// Rich 3D Furniture & Equipment Components
const Furniture3D: React.FC<{ room: GeneratedRoom; roomW: number; roomH: number }> = ({ room, roomW, roomH }) => {
  const dept = room.department;

  return (
    <group>
      {/* ICU ROOM */}
      {dept === 'icu' && (
        <>
          {/* ICU Bed 1 */}
          <mesh position={[-roomW / 4, 0.35, -roomH / 4]}>
            <boxGeometry args={[1.8, 0.5, 1.1]} />
            <meshStandardMaterial color="#4338ca" />
          </mesh>

          {/* Vital Monitor Stand */}
          <mesh position={[-roomW / 4 + 1.1, 0.9, -roomH / 4]}>
            <boxGeometry args={[0.3, 0.6, 0.3]} />
            <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={0.3} />
          </mesh>

          {/* IV Drip Pole */}
          <mesh position={[-roomW / 4 - 1.1, 0.9, -roomH / 4]}>
            <cylinderGeometry args={[0.04, 0.04, 1.4]} />
            <meshStandardMaterial color="#94a3b8" />
          </mesh>

          {/* ICU Bed 2 */}
          <mesh position={[roomW / 4, 0.35, -roomH / 4]}>
            <boxGeometry args={[1.8, 0.5, 1.1]} />
            <meshStandardMaterial color="#4338ca" />
          </mesh>
        </>
      )}

      {/* OPERATION THEATRE */}
      {dept === 'operation_theatre' && (
        <>
          {/* Surgical Operating Table */}
          <mesh position={[0, 0.45, 0]}>
            <boxGeometry args={[2.2, 0.7, 1.0]} />
            <meshStandardMaterial color="#0284c7" />
          </mesh>

          {/* Dual-Head Surgical Light Overhead */}
          <mesh position={[0, 2.2, 0]}>
            <cylinderGeometry args={[0.8, 0.8, 0.15, 16]} />
            <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.6} />
          </mesh>

          {/* Anesthesia Workstation */}
          <mesh position={[-roomW / 3, 0.7, 0]}>
            <boxGeometry args={[1.0, 1.2, 0.8]} />
            <meshStandardMaterial color="#64748b" />
          </mesh>
        </>
      )}

      {/* PATIENT WARD */}
      {dept === 'patient_ward' && (
        <>
          {/* Ward Bed A */}
          <mesh position={[-roomW / 3, 0.35, -roomH / 4]}>
            <boxGeometry args={[1.7, 0.45, 1.0]} />
            <meshStandardMaterial color="#0f766e" />
          </mesh>

          {/* Bedside Cabinet */}
          <mesh position={[-roomW / 3 + 1.1, 0.4, -roomH / 4]}>
            <boxGeometry args={[0.4, 0.5, 0.4]} />
            <meshStandardMaterial color="#cbd5e1" />
          </mesh>

          {/* Ward Bed B */}
          <mesh position={[roomW / 3, 0.35, -roomH / 4]}>
            <boxGeometry args={[1.7, 0.45, 1.0]} />
            <meshStandardMaterial color="#0f766e" />
          </mesh>
        </>
      )}

      {/* RECEPTION & WAITING */}
      {dept === 'reception' && (
        <>
          {/* Reception Counter */}
          <mesh position={[0, 0.5, roomH / 4]}>
            <boxGeometry args={[roomW * 0.5, 0.8, 0.6]} />
            <meshStandardMaterial color="#0284c7" />
          </mesh>

          {/* Waiting Lounge Seating */}
          <mesh position={[0, 0.3, -roomH / 4]}>
            <boxGeometry args={[roomW * 0.6, 0.4, 0.6]} />
            <meshStandardMaterial color="#475569" />
          </mesh>
        </>
      )}

      {/* LABORATORY */}
      {dept === 'laboratory' && (
        <>
          {/* Lab Bench */}
          <mesh position={[0, 0.5, 0]}>
            <boxGeometry args={[roomW * 0.7, 0.8, 0.7]} />
            <meshStandardMaterial color="#d97706" />
          </mesh>
          {/* Diagnostic Centrifuge */}
          <mesh position={[0, 1.0, 0]}>
            <cylinderGeometry args={[0.3, 0.3, 0.3]} />
            <meshStandardMaterial color="#94a3b8" />
          </mesh>
        </>
      )}

      {/* PHARMACY */}
      {dept === 'pharmacy' && (
        <>
          {/* Dispensing Counter */}
          <mesh position={[0, 0.5, roomH / 4]}>
            <boxGeometry args={[roomW * 0.6, 0.8, 0.5]} />
            <meshStandardMaterial color="#b45309" />
          </mesh>
          {/* Drug Storage Racks */}
          <mesh position={[0, 1.0, -roomH / 3]}>
            <boxGeometry args={[roomW * 0.7, 1.2, 0.4]} />
            <meshStandardMaterial color="#cbd5e1" />
          </mesh>
        </>
      )}

      {/* EMERGENCY */}
      {dept === 'emergency' && (
        <>
          {/* Trauma Stretcher Bed */}
          <mesh position={[0, 0.4, 0]}>
            <boxGeometry args={[1.9, 0.5, 1.0]} />
            <meshStandardMaterial color="#b91c1c" />
          </mesh>
          {/* Crash Cart */}
          <mesh position={[roomW / 3, 0.5, 0]}>
            <boxGeometry args={[0.6, 0.7, 0.5]} />
            <meshStandardMaterial color="#ef4444" />
          </mesh>
        </>
      )}
    </group>
  );
};

// Procedural 3D Room Box Component with Hover & Click
const Room3D: React.FC<{
  room: GeneratedRoom;
  isSelected: boolean;
  onHover: (room: GeneratedRoom | null) => void;
  onSelect: (room: GeneratedRoom) => void;
}> = ({ room, isSelected, onHover, onSelect }) => {
  const [hovered, setHovered] = useState(false);
  const deptMeta = getDeptCategory(room.department);

  const roomW = room.widthFt * 0.15;
  const roomH = room.heightFt * 0.15;
  const roomY = room.floor * 2.6 + 1.0; // Spaced floors
  const roomX = room.xFt * 0.15 - 5.0;
  const roomZ = room.yFt * 0.15 - 5.0;

  return (
    <group position={[roomX + roomW / 2, roomY, roomZ + roomH / 2]}>
      {/* Floor Tile */}
      <mesh position={[0, 0.05, 0]}>
        <boxGeometry args={[roomW, 0.1, roomH]} />
        <meshStandardMaterial color={isSelected ? '#f59e0b' : deptMeta.wall} />
      </mesh>

      {/* Room Wall Enclosure */}
      <mesh
        position={[0, 0.9, 0]}
        onClick={(e) => { e.stopPropagation(); onSelect(room); }}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); onHover(room); }}
        onPointerOut={() => { setHovered(false); onHover(null); }}
      >
        <boxGeometry args={[roomW - 0.1, 1.6, roomH - 0.1]} />
        <meshStandardMaterial
          color={hovered ? '#fbbf24' : isSelected ? '#f59e0b' : deptMeta.color}
          transparent
          opacity={hovered ? 0.8 : isSelected ? 0.9 : 0.5}
        />
      </mesh>

      {/* Furniture & Equipment */}
      <Furniture3D room={room} roomW={roomW} roomH={roomH} />

      {/* Readable Camera-Facing 3D Room Label */}
      <Text
        position={[0, 1.9, 0]}
        fontSize={0.38}
        color={isSelected ? '#f59e0b' : '#ffffff'}
        anchorX="center"
        anchorY="middle"
      >
        {room.name.length > 20 ? `${room.name.substring(0, 18)}..` : room.name}
      </Text>
    </group>
  );
};

export const Generated3DScene: React.FC<Generated3DSceneProps> = ({ design, onSelectRoom }) => {
  const [activeFloorFilter, setActiveFloorFilter] = useState<string>('ALL');
  const [hoveredRoom, setHoveredRoom] = useState<GeneratedRoom | null>(null);
  const [inspectRoom, setInspectRoom] = useState<GeneratedRoom | null>(null);
  const controlsRef = useRef<any>(null);

  const { siteInput, buildingFootprint, rooms } = design;

  // DYNAMIC FLOOR SELECTOR: Only include floors that ACTUALLY exist in GeneratedDesign!
  const availableFloors = Array.from(new Set(rooms.map((r) => r.floor))).sort((a, b) => a - b);

  // Filter rooms by active floor level selection
  const filteredRooms = rooms.filter((r) => {
    if (activeFloorFilter === 'ALL') return true;
    return r.floor === parseInt(activeFloorFilter);
  });

  const bldgW = buildingFootprint.widthFt * 0.15;
  const bldgH = buildingFootprint.lengthFt * 0.15;

  const handleRoomClick = (room: GeneratedRoom) => {
    setInspectRoom(room);
    if (onSelectRoom) onSelectRoom(room);
  };

  const handleResetCamera = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  return (
    <div className="relative w-full h-[640px] bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* Top Left Header & Dynamic Floor Filter */}
      <div className="absolute top-4 left-4 z-10 bg-slate-900/95 border border-slate-700 p-3.5 rounded-xl backdrop-blur-md text-white shadow-xl max-w-md">
        <div className="flex items-center gap-2 mb-1">
          <Layers className="w-5 h-5 text-teal-400" />
          <span className="font-bold text-sm text-white">Procedural 3D Hospital Model</span>
        </div>
        <p className="text-xs text-slate-400 mb-3">
          Single Source of Truth (`GeneratedDesign`) • {rooms.length} Rooms Across {availableFloors.length} Generated Floors
        </p>

        {/* Dynamic Floor Selector — ONLY displays floors that ACTUALLY exist! */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 flex-wrap">
          <button
            onClick={() => setActiveFloorFilter('ALL')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeFloorFilter === 'ALL'
                ? 'bg-teal-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            All Floors
          </button>
          {availableFloors.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFloorFilter(f.toString())}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeFloorFilter === f.toString()
                  ? 'bg-teal-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              Floor {f}
            </button>
          ))}
        </div>
      </div>

      {/* Top Right Camera Preset Controls */}
      <div className="absolute top-4 right-4 z-10 bg-slate-900/90 border border-slate-700 p-1.5 rounded-xl backdrop-blur-md text-white flex items-center gap-1">
        <button
          onClick={handleResetCamera}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5"
          title="Reset Camera View"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset View
        </button>
        <div className="px-3 py-1.5 bg-slate-950 border border-slate-800 text-xs text-teal-400 font-semibold rounded-lg flex items-center gap-1.5">
          <Compass
            className="w-4 h-4 text-teal-400 transition-transform duration-300"
            style={{ transform: `rotate(${siteInput.northAngle}deg)` }}
          />
          {siteInput.northAngle}° N
        </div>
      </div>

      {/* Hover Tooltip Overlay */}
      {hoveredRoom && !inspectRoom && (
        <div className="absolute top-20 right-4 z-10 bg-slate-900/90 border border-slate-700 px-4 py-2.5 rounded-xl text-xs text-white backdrop-blur-md shadow-lg pointer-events-none">
          <div className="font-bold text-teal-400">{hoveredRoom.name}</div>
          <div className="text-slate-300">Floor {hoveredRoom.floor} • {hoveredRoom.areaSqm} m² • {hoveredRoom.vastuZone}</div>
        </div>
      )}

      {/* Selected Room Inspector Card Modal */}
      {inspectRoom && (
        <div className="absolute bottom-16 left-4 z-20 w-96 bg-slate-900/95 border border-teal-500/50 p-4 rounded-xl backdrop-blur-md text-white shadow-2xl animate-fade-in">
          <div className="flex items-start justify-between mb-2">
            <div>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-teal-500/20 text-teal-300 rounded border border-teal-500/30">
                Floor {inspectRoom.floor} • {inspectRoom.department.toUpperCase()}
              </span>
              <h4 className="text-base font-bold text-white mt-1">{inspectRoom.name}</h4>
            </div>
            <button onClick={() => setInspectRoom(null)} className="text-slate-400 hover:text-white text-sm">✕</button>
          </div>

          <div className="grid grid-cols-2 gap-2 my-3 text-xs text-slate-300 bg-slate-950/70 p-2.5 rounded-lg">
            <div>Area: <span className="font-semibold text-teal-400">{inspectRoom.areaSqm} m²</span></div>
            <div>Dimensions: <span className="font-semibold text-slate-200">{inspectRoom.widthFt}×{inspectRoom.heightFt} ft</span></div>
            <div>Vastu Zone: <span className="font-semibold text-indigo-300">{inspectRoom.vastuZone}</span></div>
            <div>Vastu Score: <span className="font-semibold text-emerald-400">{inspectRoom.vastuSuitability}</span></div>
            <div>Daylight Score: <span className="font-semibold text-amber-400">{inspectRoom.daylightExposureScore}/100</span></div>
            <div>Ventilation Score: <span className="font-semibold text-cyan-400">{inspectRoom.ventilationExposureScore}/100</span></div>
          </div>

          <p className="text-[11px] text-slate-400 bg-slate-800/50 p-2 rounded border border-slate-700/50">
            💡 {inspectRoom.vastuExplanation}
          </p>
        </div>
      )}

      {/* Semantic Department Color Legend Bar */}
      <div className="absolute bottom-4 left-4 right-4 z-10 bg-slate-900/90 border border-slate-800 px-4 py-2 rounded-xl backdrop-blur-md text-xs flex items-center justify-between gap-4 overflow-x-auto text-slate-300">
        <span className="font-bold text-slate-400 text-[11px] uppercase">Categories:</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-500 inline-block"></span> Emergency</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-indigo-500 inline-block"></span> Critical Care ICU</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-purple-500 inline-block"></span> Operation Suite</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-teal-500 inline-block"></span> Inpatient Ward</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-sky-500 inline-block"></span> Public & OPD</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-amber-500 inline-block"></span> Diagnostics</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-slate-500 inline-block"></span> Service/Admin</span>
      </div>

      {/* Three.js Canvas Scene */}
      <Canvas camera={{ position: [16, 20, 24], fov: 45 }}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[18, 28, 18]} intensity={1.3} castShadow />
        <directionalLight position={[-12, 18, -12]} intensity={0.4} />

        {/* Ground Grid */}
        <Grid
          position={[0, -0.01, 0]}
          args={[60, 60]}
          cellSize={1}
          cellThickness={0.5}
          cellColor="#1e293b"
          sectionSize={5}
          sectionThickness={1}
          sectionColor="#0f766e"
          fadeDistance={50}
        />

        {/* Outer Site Boundary Perimeter Lines (no duplicate floor slab) */}
        {/* Site outline is shown via the Grid component - no opaque ground plate needed */}

        {/* Floor Slabs for existing floors only */}
        {availableFloors.map((f) => {
          if (activeFloorFilter !== 'ALL' && parseInt(activeFloorFilter) !== f) return null;
          return (
            <mesh key={f} position={[0, f * 2.6 + 0.1, 0]}>
              <boxGeometry args={[bldgW, 0.15, bldgH]} />
              <meshStandardMaterial color="#1e293b" opacity={0.85} transparent />
            </mesh>
          );
        })}

        {/* Central Brahmasthan Green Courtyard */}
        {siteInput.sustainabilityFeatures.greenCourtyard && (activeFloorFilter === 'ALL' || activeFloorFilter === '0') && (
          <group position={[0, 0.2, 0]}>
            <mesh>
              <boxGeometry args={[3.2, 0.1, 3.2]} />
              <meshStandardMaterial color="#065f46" />
            </mesh>
            <mesh position={[-0.8, 0.6, -0.8]}>
              <cylinderGeometry args={[0.1, 0.1, 0.8]} />
              <meshStandardMaterial color="#78350f" />
            </mesh>
            <mesh position={[-0.8, 1.2, -0.8]}>
              <sphereGeometry args={[0.5, 8, 8]} />
              <meshStandardMaterial color="#10b981" />
            </mesh>
            <Text position={[0, 1.5, 0]} fontSize={0.35} color="#6ee7b7" anchorX="center">
              🌿 BRAHMASTHAN COURTYARD
            </Text>
          </group>
        )}

        {/* Rooftop Solar PV Panels */}
        {siteInput.sustainabilityFeatures.solarPanels && (activeFloorFilter === 'ALL' || parseInt(activeFloorFilter) === availableFloors.length - 1) && (
          <group position={[0, availableFloors.length * 2.6 + 0.3, 0]}>
            <mesh position={[0, 0.05, 0]} rotation={[-0.1, 0, 0]}>
              <boxGeometry args={[bldgW * 0.6, 0.08, bldgH * 0.4]} />
              <meshStandardMaterial color="#0284c7" metalness={0.8} roughness={0.2} />
            </mesh>
            <Text position={[0, 0.6, 0]} fontSize={0.4} color="#38bdf8" anchorX="center">
              ☀️ SOLAR PANELS (PV)
            </Text>
          </group>
        )}

        {/* Rainwater Harvesting Tank */}
        {siteInput.sustainabilityFeatures.rainwaterHarvesting && (activeFloorFilter === 'ALL' || activeFloorFilter === '0') && (
          <group position={[bldgW / 2 + 1.5, 0.6, -bldgH / 2]}>
            <mesh>
              <cylinderGeometry args={[0.8, 0.8, 1.2, 16]} />
              <meshStandardMaterial color="#0284c7" />
            </mesh>
            <Text position={[0, 1.1, 0]} fontSize={0.35} color="#38bdf8" anchorX="center">
              💧 RAINWATER HARVESTING
            </Text>
          </group>
        )}

        {/* Render Procedural 3D Rooms */}
        {filteredRooms.map((room) => (
          <Room3D
            key={room.id}
            room={room}
            isSelected={inspectRoom?.id === room.id}
            onHover={(r) => setHoveredRoom(r)}
            onSelect={handleRoomClick}
          />
        ))}

        <OrbitControls ref={controlsRef} makeDefault maxPolarAngle={Math.PI / 2.1} minDistance={5} maxDistance={65} />
      </Canvas>
    </div>
  );
};
