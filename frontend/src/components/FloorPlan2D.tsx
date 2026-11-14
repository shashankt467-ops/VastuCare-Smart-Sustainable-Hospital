import React, { useState } from 'react';
import { GeneratedDesign, GeneratedRoom } from '../types';
import { Layers, ZoomIn, ZoomOut, Maximize2, Compass, CheckCircle, Info, Sparkles, Compass as VastuIcon } from 'lucide-react';

interface FloorPlan2DProps {
  design: GeneratedDesign;
  selectedRoomId?: string;
  onSelectRoom?: (room: GeneratedRoom) => void;
}

export const FloorPlan2D: React.FC<FloorPlan2DProps> = ({
  design,
  selectedRoomId,
  onSelectRoom
}) => {
  const [activeFloor, setActiveFloor] = useState<number>(0);
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [inspectedRoom, setInspectedRoom] = useState<GeneratedRoom | null>(null);

  const { siteInput, buildingFootprint, rooms } = design;

  // Filter rooms for active floor
  const floorRooms = rooms.filter((r) => r.floor === activeFloor);

  // Department color palette
  const getDeptColor = (dept: string) => {
    switch (dept) {
      case 'emergency': return { bg: '#fee2e2', border: '#ef4444', text: '#991b1b', fill: '#fca5a5' };
      case 'icu': return { bg: '#e0e7ff', border: '#6366f1', text: '#3730a3', fill: '#a5b4fc' };
      case 'operation_theatre': return { bg: '#f3e8ff', border: '#a855f7', text: '#6b21a8', fill: '#d8b4fe' };
      case 'opd': return { bg: '#dcfce7', border: '#22c55e', text: '#166534', fill: '#86efac' };
      case 'patient_ward': return { bg: '#ccfbf1', border: '#14b8a6', text: '#115e59', fill: '#99f6e4' };
      case 'pharmacy': return { bg: '#fef3c7', border: '#f59e0b', text: '#92400e', fill: '#fde68a' };
      case 'laboratory': return { bg: '#ffedd5', border: '#f97316', text: '#9a3412', fill: '#fed7aa' };
      case 'reception': return { bg: '#e0f2fe', border: '#0ea5e9', text: '#075985', fill: '#bae6fd' };
      default: return { bg: '#f3f4f6', border: '#9ca3af', text: '#374151', fill: '#e5e7eb' };
    }
  };

  const svgWidth = siteInput.siteWidthFt * 5 + 40;
  const svgHeight = siteInput.siteLengthFt * 5 + 40;
  const siteW = siteInput.siteWidthFt * 5;
  const siteH = siteInput.siteLengthFt * 5;
  const bldgW = buildingFootprint.widthFt * 5;
  const bldgH = buildingFootprint.lengthFt * 5;
  const bldgX = (siteW - bldgW) / 2;
  const bldgY = (siteH - bldgH) / 2;

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.2, 2.5));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.2, 0.6));
  const handleResetZoom = () => { setZoom(1); setPan({ x: 0, y: 0 }); };

  const handleRoomClick = (room: GeneratedRoom) => {
    setInspectedRoom(room);
    if (onSelectRoom) onSelectRoom(room);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl text-white space-y-6">
      {/* Top Header & Floor Selector */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-xl font-bold text-teal-400 flex items-center gap-2">
            <Layers className="w-5 h-5" />
            2D Architectural Layout Plan
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            CAD Floor Layout • Single Source of Truth (`GeneratedDesign`) • Footprint {buildingFootprint.widthFt}×{buildingFootprint.lengthFt} ft ({buildingFootprint.areaSqm} m²)
          </p>
        </div>

        {/* Floor Tabs */}
        <div className="flex items-center bg-slate-950 p-1.5 rounded-xl border border-slate-800 gap-1">
          {Array.from(new Set(rooms.map((r) => r.floor))).sort((a, b) => a - b).map((f) => (
            <button
              key={f}
              onClick={() => setActiveFloor(f)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeFloor === f
                  ? 'bg-teal-500 text-slate-950 shadow-lg shadow-teal-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {f === 0 ? 'Ground Floor' : `Floor ${f}`}
            </button>
          ))}
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={handleZoomIn}
            className="p-2 hover:bg-slate-800 rounded-lg text-slate-300 transition-all"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-2 hover:bg-slate-800 rounded-lg text-slate-300 transition-all"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleResetZoom}
            className="p-2 hover:bg-slate-800 rounded-lg text-slate-300 transition-all"
            title="Reset View"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* SVG Architectural Canvas Container */}
      <div className="relative overflow-hidden bg-[#0a0f1d] rounded-2xl border border-slate-800 p-4 flex justify-center items-center min-h-[500px] shadow-inner">
        {/* Architectural Compass & Grid Badge Overlay */}
        <div className="absolute top-4 right-4 z-10 bg-slate-900/90 border border-slate-700 px-3.5 py-2 rounded-xl flex items-center gap-2 backdrop-blur-md shadow-lg">
          <Compass
            className="w-5 h-5 text-teal-400 transition-transform duration-500"
            style={{ transform: `rotate(${siteInput.northAngle}deg)` }}
          />
          <span className="text-xs font-bold text-slate-200">
            North: {siteInput.northAngle}°
          </span>
        </div>

        <div
          className="transition-transform duration-300"
          style={{ transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)` }}
        >
          <svg
            width={svgWidth}
            height={svgHeight}
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="drop-shadow-2xl"
          >
            <defs>
              {/* CAD Blueprints Grid Pattern */}
              <pattern id="cadGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="0.5" />
              </pattern>
            </defs>

            {/* Background Grid */}
            <rect width={svgWidth} height={svgHeight} fill="url(#cadGrid)" />

            {/* Site Boundary Box */}
            <rect
              x={20}
              y={20}
              width={siteW}
              height={siteH}
              fill="#0f172a"
              fillOpacity="0.8"
              stroke="#334155"
              strokeWidth="2"
              strokeDasharray="6 4"
              rx="8"
            />
            <text
              x={30}
              y={40}
              fill="#64748b"
              fontSize="11"
              fontWeight="600"
            >
              SITE BOUNDARY ({siteInput.siteWidthFt} × {siteInput.siteLengthFt} FT)
            </text>

            {/* Building Footprint Box */}
            <rect
              x={20 + bldgX}
              y={20 + bldgY}
              width={bldgW}
              height={bldgH}
              fill="#1e293b"
              stroke="#0d9488"
              strokeWidth="2.5"
              rx="6"
            />

            {/* Central Courtyard (if active & Ground Floor) */}
            {siteInput.sustainabilityFeatures.greenCourtyard && activeFloor === 0 && (
              <g>
                <rect
                  x={20 + bldgX + bldgW / 2 - 35}
                  y={20 + bldgY + bldgH / 2 - 35}
                  width={70}
                  height={70}
                  fill="#064e3b"
                  stroke="#10b981"
                  strokeWidth="2"
                  rx="6"
                />
                <text
                  x={20 + bldgX + bldgW / 2}
                  y={20 + bldgY + bldgH / 2 - 5}
                  fill="#6ee7b7"
                  fontSize="10"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  🌿 Brahmasthan
                </text>
                <text
                  x={20 + bldgX + bldgW / 2}
                  y={20 + bldgY + bldgH / 2 + 10}
                  fill="#a7f3d0"
                  fontSize="9"
                  textAnchor="middle"
                >
                  Sky Courtyard
                </text>
              </g>
            )}

            {/* Render Procedural Rooms */}
            {floorRooms.map((room) => {
              const rx = 20 + bldgX + room.xFt * 5;
              const ry = 20 + bldgY + room.yFt * 5;
              const rw = room.widthFt * 5;
              const rh = room.heightFt * 5;
              const colors = getDeptColor(room.department);
              const isSelected = (inspectedRoom?.id || selectedRoomId) === room.id;

              return (
                <g
                  key={room.id}
                  onClick={() => handleRoomClick(room)}
                  className="cursor-pointer group"
                >
                  {/* Room Outer Card */}
                  <rect
                    x={rx}
                    y={ry}
                    width={rw}
                    height={rh}
                    fill={colors.bg}
                    stroke={isSelected ? '#f59e0b' : colors.border}
                    strokeWidth={isSelected ? '3.5' : '2'}
                    rx="6"
                    className="transition-all duration-200 hover:opacity-90"
                  />

                  {/* Room Name Label */}
                  <text
                    x={rx + rw / 2}
                    y={ry + rh / 2 - 6}
                    fill={colors.text}
                    fontSize="11"
                    fontWeight="bold"
                    textAnchor="middle"
                    className="pointer-events-none"
                  >
                    {room.name.length > 22 ? `${room.name.substring(0, 20)}...` : room.name}
                  </text>

                  {/* Room Area & Dimensions */}
                  <text
                    x={rx + rw / 2}
                    y={ry + rh / 2 + 8}
                    fill={colors.text}
                    fontSize="9"
                    opacity="0.9"
                    textAnchor="middle"
                    className="pointer-events-none"
                  >
                    {room.areaSqm} m² ({room.widthFt}×{room.heightFt} ft)
                  </text>

                  {/* Vastu Tag */}
                  <rect
                    x={rx + 4}
                    y={ry + 4}
                    width="44"
                    height="14"
                    fill={colors.border}
                    rx="3"
                  />
                  <text
                    x={rx + 26}
                    y={ry + 14}
                    fill="#ffffff"
                    fontSize="8"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {room.vastuSuitability}
                  </text>

                  {/* Render Furniture Items */}
                  {room.furniture.map((item) => (
                    <rect
                      key={item.id}
                      x={rx + item.xOffsetFt * 5}
                      y={ry + item.yOffsetFt * 5}
                      width={item.widthFt * 5}
                      height={item.heightFt * 5}
                      fill={colors.fill}
                      stroke={colors.border}
                      strokeWidth="1"
                      rx="2"
                    />
                  ))}
                </g>
              );
            })}

            {/* Entrance Indicators (Ground Floor) */}
            {activeFloor === 0 && (
              <g>
                <path
                  d={`M ${20 + bldgX + bldgW / 2 - 15} ${20 + bldgY + bldgH} L ${20 + bldgX + bldgW / 2 + 15} ${20 + bldgY + bldgH}`}
                  stroke="#38bdf8"
                  strokeWidth="4"
                />
                <text
                  x={20 + bldgX + bldgW / 2}
                  y={20 + bldgY + bldgH + 16}
                  fill="#38bdf8"
                  fontSize="10"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  ▲ Main Triage Entrance
                </text>
              </g>
            )}
          </svg>
        </div>
      </div>

      {/* Selected Room Inspector Drawer */}
      {inspectedRoom && (
        <div className="bg-slate-950 border border-teal-500/40 p-4 rounded-xl space-y-3 animate-fade-in shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-teal-500/20 text-teal-300 font-bold text-xs rounded border border-teal-500/30">
                Floor {inspectedRoom.floor} • {inspectedRoom.department.toUpperCase()}
              </span>
              <h4 className="text-sm font-bold text-white">{inspectedRoom.name}</h4>
            </div>
            <button onClick={() => setInspectedRoom(null)} className="text-xs text-slate-400 hover:text-white font-bold">✕ Close</button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-400">Area:</span>
              <p className="font-bold text-teal-400 mt-0.5">{inspectedRoom.areaSqm} m² ({inspectedRoom.widthFt}×{inspectedRoom.heightFt} ft)</p>
            </div>
            <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-400">Vastu Zone:</span>
              <p className="font-bold text-indigo-300 mt-0.5">{inspectedRoom.vastuZone}</p>
            </div>
            <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-400">Daylight Exposure:</span>
              <p className="font-bold text-amber-400 mt-0.5">{inspectedRoom.daylightExposureScore} / 100</p>
            </div>
            <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-400">Ventilation Exposure:</span>
              <p className="font-bold text-cyan-400 mt-0.5">{inspectedRoom.ventilationExposureScore} / 100</p>
            </div>
          </div>

          <p className="text-xs text-slate-300 bg-slate-900 p-2.5 rounded-lg border border-slate-800">
            💡 <strong>Vastu Explanation:</strong> {inspectedRoom.vastuExplanation}
          </p>
        </div>
      )}

      {/* Legend Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-800 text-xs text-slate-400">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="font-semibold text-slate-300">Department Colors:</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-200 border border-red-500 inline-block"></span> Emergency</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-indigo-200 border border-indigo-500 inline-block"></span> ICU</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-purple-200 border border-purple-500 inline-block"></span> OT Suite</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-green-200 border border-green-500 inline-block"></span> OPD</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-teal-200 border border-teal-500 inline-block"></span> Ward</span>
        </div>
        <div>
          Showing <span className="text-teal-400 font-bold">{floorRooms.length}</span> rooms on Floor {activeFloor}
        </div>
      </div>
    </div>
  );
};
