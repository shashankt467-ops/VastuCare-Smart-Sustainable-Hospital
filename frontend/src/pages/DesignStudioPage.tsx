import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  SiteInput,
  GeneratedDesign,
  CapacityLimitCheck,
  OptimizationResult,
  GeneratedRoom
} from '../types';
import { FloorPlan2D } from '../components/FloorPlan2D';
import { Generated3DScene } from '../3d/Generated3DScene';
import {
  Wand2,
  Compass,
  Layers,
  Box,
  Brain,
  Zap,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  MapPin,
  Building,
  Bed,
  Sun,
  Droplets,
  Trees,
  RotateCcw,
  Sparkles,
  Download,
  Info
} from 'lucide-react';

export const DesignStudioPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'INPUT' | 'PLAN_2D' | 'MODEL_3D' | 'ANALYSIS' | 'ML_PREDICTIONS' | 'OPTIMIZE' | 'SAVED'
  >('INPUT');

  // Input Form State (Default Scenario: Chennai 150-bed General Hospital)
  const [siteInput, setSiteInput] = useState<SiteInput>({
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
      'emergency',
      'opd',
      'icu',
      'operation_theatre',
      'patient_ward',
      'pharmacy',
      'laboratory',
      'radiology',
      'administration',
      'parking'
    ],
    sustainabilityFeatures: {
      solarPanels: true,
      rainwaterHarvesting: true,
      greywaterRecycling: true,
      greenCourtyard: true
    }
  });

  // State Data
  const [activeDesign, setActiveDesign] = useState<GeneratedDesign | null>(null);
  const [designV2, setDesignV2] = useState<GeneratedDesign | null>(null);
  const [capacityCheck, setCapacityCheck] = useState<CapacityLimitCheck | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<GeneratedRoom | null>(null);

  // Load Active Design on Mount
  useEffect(() => {
    loadActiveDesign();
  }, []);

  // Live Capacity Limit Validation
  useEffect(() => {
    validateCapacity(siteInput);
  }, [siteInput]);

  const loadActiveDesign = async () => {
    try {
      const design = await api.getActiveDesign();
      setActiveDesign(design);
    } catch {
      // Handle fallback
    }
  };

  const validateCapacity = async (input: SiteInput) => {
    try {
      const check = await api.validateCapacity(input);
      setCapacityCheck(check);
    } catch {
      // Ignore
    }
  };

  const handleGenerateDesign = async () => {
    if (capacityCheck && !capacityCheck.isValid) return;
    setIsGenerating(true);
    try {
      const newDesign = await api.generateDesign(siteInput);
      setActiveDesign(newDesign);
      setDesignV2(null);
      setOptimizationResult(null);
      setActiveTab('PLAN_2D');
    } catch (err: any) {
      alert(`Generation Error: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRunOptimization = async () => {
    if (!activeDesign) return;
    setIsOptimizing(true);
    try {
      const res = await api.optimizeDesign(activeDesign.id);
      setOptimizationResult(res);
      setDesignV2(res.optimizedDesign);
    } catch (err: any) {
      alert(`Optimization Error: ${err.message}`);
    } finally {
      setIsOptimizing(false);
    }
  };

  // Quick Preset Handlers for Scenarios
  const loadChennaiPreset = () => {
    setSiteInput({
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
    });
  };

  const loadMaduraiPreset = () => {
    setSiteInput({
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
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-teal-500/20 text-teal-400 rounded-xl border border-teal-500/30">
              <Wand2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                VastuCare AI Design Studio
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                AI-Assisted Sustainable Hospital Layout Generator • Site Input → 2D Floor Plan → 3D Model → ML Ranking
              </p>
            </div>
          </div>
        </div>

        {/* Preset Quick Loader Buttons */}
        <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 px-2 font-medium">Test Inputs:</span>
          <button
            onClick={loadChennaiPreset}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg text-teal-400 transition-all"
          >
            Chennai (200×150ft • 150 Bed)
          </button>
          <button
            onClick={loadMaduraiPreset}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg text-indigo-400 transition-all"
          >
            Madurai (100×100ft • 50 Bed)
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-white/[0.08] pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('INPUT')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'INPUT' ? 'active-nav-item' : 'text-slate-400 hover:text-white hover:bg-slate-900/80'
          }`}
        >
          <MapPin className="w-4 h-4" />
          1. Site & Requirements Input
        </button>
        <button
          onClick={() => setActiveTab('PLAN_2D')}
          disabled={!activeDesign}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'PLAN_2D' ? 'active-nav-item' : 'text-slate-400 hover:text-white hover:bg-slate-900/80 disabled:opacity-40'
          }`}
        >
          <Layers className="w-4 h-4" />
          2. 2D Floor Plan
        </button>
        <button
          onClick={() => setActiveTab('MODEL_3D')}
          disabled={!activeDesign}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'MODEL_3D' ? 'active-nav-item' : 'text-slate-400 hover:text-white hover:bg-slate-900/80 disabled:opacity-40'
          }`}
        >
          <Box className="w-4 h-4" />
          3. 3D Digital Hospital
        </button>
        <button
          onClick={() => setActiveTab('ANALYSIS')}
          disabled={!activeDesign}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'ANALYSIS' ? 'active-nav-item' : 'text-slate-400 hover:text-white hover:bg-slate-900/80 disabled:opacity-40'
          }`}
        >
          <Compass className="w-4 h-4" />
          4. Vastu & Environmental Analysis
        </button>
        <button
          onClick={() => setActiveTab('ML_PREDICTIONS')}
          disabled={!activeDesign}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'ML_PREDICTIONS' ? 'active-nav-item' : 'text-slate-400 hover:text-white hover:bg-slate-900/80 disabled:opacity-40'
          }`}
        >
          <Brain className="w-4 h-4" />
          5. ML Predictions & Metrics
        </button>
        <button
          onClick={() => setActiveTab('OPTIMIZE')}
          disabled={!activeDesign}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'OPTIMIZE' ? 'active-nav-item' : 'text-slate-400 hover:text-white hover:bg-slate-900/80 disabled:opacity-40'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          6. AI Optimization & Comparison
        </button>
      </div>

      {/* TAB 1: SITE & REQUIREMENTS INPUT WIZARD */}
      {activeTab === 'INPUT' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Location & Site Dimensions Card */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-6">
              <h3 className="text-lg font-bold text-teal-400 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Site Location & Geometry
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Project Site Location</label>
                  <input
                    type="text"
                    value={siteInput.locationName}
                    onChange={(e) => setSiteInput({ ...siteInput, locationName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-teal-500 focus:outline-none"
                    placeholder="e.g. Chennai, Tamil Nadu, India"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Hospital Type</label>
                  <select
                    value={siteInput.hospitalType}
                    onChange={(e) => setSiteInput({ ...siteInput, hospitalType: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-teal-500 focus:outline-none"
                  >
                    <option value="General Hospital">General Multispecialty Hospital</option>
                    <option value="Super Specialty Hospital">Super Specialty Hospital</option>
                    <option value="Community Healthcare Center">Community Healthcare Center</option>
                  </select>
                </div>
              </div>

              {/* Site Length & Width Sliders */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                <div>
                  <div className="flex justify-between text-xs text-slate-300 font-semibold mb-1">
                    <span>Site Length (ft)</span>
                    <span className="text-teal-400">{siteInput.siteLengthFt} ft</span>
                  </div>
                  <input
                    type="range"
                    min="60"
                    max="400"
                    step="10"
                    value={siteInput.siteLengthFt}
                    onChange={(e) => setSiteInput({ ...siteInput, siteLengthFt: parseInt(e.target.value) })}
                    className="w-full accent-teal-500"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-xs text-slate-300 font-semibold mb-1">
                    <span>Site Width (ft)</span>
                    <span className="text-teal-400">{siteInput.siteWidthFt} ft</span>
                  </div>
                  <input
                    type="range"
                    min="60"
                    max="300"
                    step="10"
                    value={siteInput.siteWidthFt}
                    onChange={(e) => setSiteInput({ ...siteInput, siteWidthFt: parseInt(e.target.value) })}
                    className="w-full accent-teal-500"
                  />
                </div>
              </div>

              {/* North Orientation Compass Slider */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                    <Compass className="w-4 h-4 text-teal-400" />
                    North Rotation Angle (Visual Compass)
                  </span>
                  <span className="text-sm font-bold text-teal-400">{siteInput.northAngle}° North</span>
                </div>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="0"
                    max="359"
                    step="5"
                    value={siteInput.northAngle}
                    onChange={(e) => setSiteInput({ ...siteInput, northAngle: parseInt(e.target.value) })}
                    className="w-full accent-teal-500"
                  />
                  <div className="p-2 bg-slate-900 border border-slate-700 rounded-full">
                    <Compass
                      className="w-6 h-6 text-teal-400 transition-transform duration-300"
                      style={{ transform: `rotate(${siteInput.northAngle}deg)` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Capacity & Departments Card */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-6">
              <h3 className="text-lg font-bold text-teal-400 flex items-center gap-2">
                <Building className="w-5 h-5" />
                Capacity & Department Requirements
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                <div>
                  <div className="flex justify-between text-xs text-slate-300 font-semibold mb-1">
                    <span>Number of Floors</span>
                    <span className="text-teal-400">{siteInput.floors} Floors</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="1"
                    value={siteInput.floors}
                    onChange={(e) => setSiteInput({ ...siteInput, floors: parseInt(e.target.value) })}
                    className="w-full accent-teal-500"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-xs text-slate-300 font-semibold mb-1">
                    <span>Bed Capacity</span>
                    <span className="text-teal-400">{siteInput.bedCapacity} Beds</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="500"
                    step="10"
                    value={siteInput.bedCapacity}
                    onChange={(e) => setSiteInput({ ...siteInput, bedCapacity: parseInt(e.target.value) })}
                    className="w-full accent-teal-500"
                  />
                </div>
              </div>

              {/* Sustainability Feature Toggles */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-3">Sustainability Systems</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <label className="flex items-center gap-2.5 p-3 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer hover:border-slate-700">
                    <input
                      type="checkbox"
                      checked={siteInput.sustainabilityFeatures.solarPanels}
                      onChange={(e) =>
                        setSiteInput({
                          ...siteInput,
                          sustainabilityFeatures: { ...siteInput.sustainabilityFeatures, solarPanels: e.target.checked }
                        })
                      }
                      className="accent-teal-500 w-4 h-4"
                    />
                    <Sun className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-semibold text-slate-200">Solar PV</span>
                  </label>
                  <label className="flex items-center gap-2.5 p-3 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer hover:border-slate-700">
                    <input
                      type="checkbox"
                      checked={siteInput.sustainabilityFeatures.rainwaterHarvesting}
                      onChange={(e) =>
                        setSiteInput({
                          ...siteInput,
                          sustainabilityFeatures: { ...siteInput.sustainabilityFeatures, rainwaterHarvesting: e.target.checked }
                        })
                      }
                      className="accent-teal-500 w-4 h-4"
                    />
                    <Droplets className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-semibold text-slate-200">Rainwater</span>
                  </label>
                  <label className="flex items-center gap-2.5 p-3 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer hover:border-slate-700">
                    <input
                      type="checkbox"
                      checked={siteInput.sustainabilityFeatures.greywaterRecycling}
                      onChange={(e) =>
                        setSiteInput({
                          ...siteInput,
                          sustainabilityFeatures: { ...siteInput.sustainabilityFeatures, greywaterRecycling: e.target.checked }
                        })
                      }
                      className="accent-teal-500 w-4 h-4"
                    />
                    <Droplets className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-semibold text-slate-200">Greywater</span>
                  </label>
                  <label className="flex items-center gap-2.5 p-3 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer hover:border-slate-700">
                    <input
                      type="checkbox"
                      checked={siteInput.sustainabilityFeatures.greenCourtyard}
                      onChange={(e) =>
                        setSiteInput({
                          ...siteInput,
                          sustainabilityFeatures: { ...siteInput.sustainabilityFeatures, greenCourtyard: e.target.checked }
                        })
                      }
                      className="accent-teal-500 w-4 h-4"
                    />
                    <Trees className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-semibold text-slate-200">Courtyard</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Live Validation & CTA Card */}
          <div className="space-y-6">
            {/* Live Capacity Warning Box */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
              <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Info className="w-4 h-4 text-teal-400" />
                Live Design Feasibility Check
              </h4>

              {capacityCheck ? (
                capacityCheck.isValid ? (
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl space-y-2">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                      <CheckCircle2 className="w-4 h-4" />
                      Design Requirements Fit Within Site Capacity
                    </div>
                    <p className="text-[11px] text-slate-300">
                      Required area: <span className="font-bold text-emerald-300">{capacityCheck.requiredAreaSqm} m²</span> of max available <span className="font-bold text-slate-200">{capacityCheck.availableAreaSqm} m²</span>.
                    </p>
                  </div>
                ) : (
                  <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl space-y-3">
                    <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
                      <AlertTriangle className="w-4 h-4" />
                      Requirements exceed available site/design capacity
                    </div>
                    <p className="text-[11px] text-slate-300">{capacityCheck.reason}</p>
                    <div className="space-y-1 pt-2 border-t border-rose-500/20">
                      <span className="text-[10px] font-bold text-rose-300 uppercase">Suggested Adjustments:</span>
                      {capacityCheck.suggestions.map((sug, i) => (
                        <div key={i} className="text-[11px] text-slate-300 flex items-center gap-1.5">
                          <span className="text-rose-400">►</span> {sug}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              ) : null}

              {/* Generate Hospital Design Button */}
              <button
                onClick={handleGenerateDesign}
                disabled={isGenerating || (capacityCheck ? !capacityCheck.isValid : false)}
                className="w-full py-4 text-slate-950 font-extrabold text-sm rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:opacity-95 active:scale-[0.99]"
                style={{
                  background: 'var(--brand-gradient)',
                  boxShadow: '0 8px 24px -4px var(--accent-glow)'
                }}
              >
                {isGenerating ? (
                  <>Running Procedural Layout Engine...</>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5" />
                    GENERATE HOSPITAL DESIGN
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: 2D ARCHITECTURAL FLOOR PLAN */}
      {activeTab === 'PLAN_2D' && activeDesign && (
        <FloorPlan2D
          design={activeDesign}
          selectedRoomId={selectedRoom?.id}
          onSelectRoom={(r) => setSelectedRoom(r)}
        />
      )}

      {/* TAB 3: 3D DIGITAL HOSPITAL MODEL */}
      {activeTab === 'MODEL_3D' && activeDesign && (
        <Generated3DScene
          design={activeDesign}
          onSelectRoom={(r) => setSelectedRoom(r)}
        />
      )}

      {/* TAB 4: VASTU & ENVIRONMENTAL ANALYSIS */}
      {activeTab === 'ANALYSIS' && activeDesign && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Vastu Card */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-indigo-400 flex items-center gap-2">
                <Compass className="w-5 h-5" />
                Vastu-Inspired Architectural Analysis
              </h3>
              <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 font-extrabold text-sm rounded-lg border border-indigo-500/30">
                Score: {activeDesign.vastuAnalysis.score}/100
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Entrance: <span className="text-white font-semibold">{activeDesign.vastuAnalysis.entranceDirection}</span> • Rating: <span className="text-emerald-400 font-semibold">{activeDesign.vastuAnalysis.orientationRating}</span>
            </p>
            <div className="space-y-2">
              {activeDesign.vastuAnalysis.generalBenefits.map((ben, i) => (
                <div key={i} className="text-xs text-slate-300 flex items-start gap-2 bg-slate-950 p-2.5 rounded-lg">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{ben}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Environmental Card */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-emerald-400 flex items-center gap-2">
                <Sun className="w-5 h-5" />
                Environmental Engineering Performance
              </h3>
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 font-extrabold text-sm rounded-lg border border-emerald-500/30">
                Score: {activeDesign.environmentalAnalysis.sustainabilityScore}/100
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400">Solar Potential:</span>
                <p className="text-lg font-bold text-amber-400">{activeDesign.environmentalAnalysis.solarPotential}/100</p>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400">Daylight Potential:</span>
                <p className="text-lg font-bold text-amber-300">{activeDesign.environmentalAnalysis.daylightPotential}/100</p>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400">Ventilation Potential:</span>
                <p className="text-lg font-bold text-cyan-400">{activeDesign.environmentalAnalysis.ventilationPotential}/100</p>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400">Rainwater Potential:</span>
                <p className="text-lg font-bold text-blue-400">{activeDesign.environmentalAnalysis.rainwaterPotential}/100</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: ML PREDICTIONS */}
      {activeTab === 'ML_PREDICTIONS' && activeDesign && (
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-teal-400 flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Machine Learning Evaluation on Generated Design
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Operating directly on `GeneratedDesign` features • Data Source: `synthetic_simulation`
              </p>
            </div>
            <span className="px-3 py-1.5 bg-teal-500/20 text-teal-300 font-extrabold text-xs rounded-xl border border-teal-500/30">
              Prediction Mode: {activeDesign.environmentalAnalysis.predictionMode.toUpperCase()}
            </span>
          </div>

          {/* Predictions Display Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 font-semibold">Predicted Energy Demand</span>
              <p className="text-xl font-bold text-amber-400 mt-1">
                {activeDesign.environmentalAnalysis.estimatedEnergyDemandKwhDay} kWh/day
              </p>
              <p className="text-[11px] text-slate-500 mt-1">Model: HistGradientBoosting v1.0</p>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 font-semibold">Predicted Water Demand</span>
              <p className="text-xl font-bold text-blue-400 mt-1">
                {activeDesign.environmentalAnalysis.estimatedWaterDemandLitersDay.toLocaleString()} L/day
              </p>
              <p className="text-[11px] text-slate-500 mt-1">Model: HistGradientBoosting v1.0</p>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 font-semibold">Predicted Sustainability Score</span>
              <p className="text-xl font-bold text-emerald-400 mt-1">
                {activeDesign.environmentalAnalysis.sustainabilityScore} / 100
              </p>
              <p className="text-[11px] text-slate-500 mt-1">Model: HistGradientBoosting v1.0</p>
            </div>
          </div>

          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300">
            ⚠️ <strong>Synthetic Dataset Disclaimer:</strong> Model performance is validated against synthetic simulation data and does not establish real-world architectural accuracy. Conceptual design — not for construction.
          </div>
        </div>
      )}

      {/* TAB 6: AI OPTIMIZATION & COMPARISON */}
      {activeTab === 'OPTIMIZE' && activeDesign && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-teal-400 flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                AI-Assisted Spatial Optimization Loop
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Generates 50 candidate spatial layout variations • Hard constraint filtering • Hybrid ranking
              </p>
            </div>
            <button
              onClick={handleRunOptimization}
              disabled={isOptimizing}
              className="px-6 py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              {isOptimizing ? 'Running 50 Candidate Loop...' : 'RUN AI OPTIMIZATION'}
            </button>
          </div>

          {/* Design V1 vs Design V2 Side by Side Comparison */}
          {designV2 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <h4 className="font-bold text-slate-300">DESIGN V1 (Original)</h4>
                  <span className="text-sm font-bold text-amber-400">{activeDesign.sustainabilityScore.total}/100</span>
                </div>
                <p className="text-xs text-slate-400">Rooms: {activeDesign.rooms.length} • Footprint: {activeDesign.buildingFootprint.widthFt}×{activeDesign.buildingFootprint.lengthFt} ft</p>
              </div>

              <div className="bg-slate-900 border border-teal-500/50 p-6 rounded-2xl space-y-4">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <h4 className="font-bold text-teal-400">DESIGN V2 (AI Optimized)</h4>
                  <span className="text-sm font-bold text-emerald-400">{designV2.sustainabilityScore.total}/100 (+{optimizationResult?.scoreImprovement})</span>
                </div>
                <p className="text-xs text-slate-400">Rooms: {designV2.rooms.length} • Footprint: {designV2.buildingFootprint.widthFt}×{designV2.buildingFootprint.lengthFt} ft</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
