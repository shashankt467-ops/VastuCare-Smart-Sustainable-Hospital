"""
VastuCare ML — FastAPI Microservice
Serves ML predictions on port 5001.
Models are loaded ONCE at startup.
Falls back gracefully if models are unavailable.
"""

import sys
import os
from pathlib import Path

# Add parent to path for imports
sys.path.insert(0, str(Path(__file__).resolve().parent))

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any
import uvicorn

from inference.predictor import MLPredictor

app = FastAPI(
    title="VastuCare ML Service",
    description="Machine Learning prediction service for hospital design optimization",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load models ONCE at startup
print("\n" + "=" * 50)
print("VastuCare ML Service — Loading Models...")
print("=" * 50)
predictor = MLPredictor()
print("=" * 50)
print("Model loading complete.\n")


# --- Pydantic Models ---

class EnvironmentFeatures(BaseModel):
    site_length_m: float = Field(ge=10, le=500)
    site_width_m: float = Field(ge=10, le=500)
    site_area_sqm: float = Field(ge=100)
    north_angle: float = Field(ge=0, le=360)
    latitude: float = Field(default=13.08)
    longitude: float = Field(default=80.27)
    floors: int = Field(ge=1, le=10)
    bed_capacity: int = Field(ge=10, le=1000)
    dept_count: int = Field(ge=1, le=20)
    has_solar: int = Field(ge=0, le=1)
    has_rainwater: int = Field(ge=0, le=1)
    has_courtyard: int = Field(ge=0, le=1)
    has_green_roof: int = Field(ge=0, le=1)
    built_area_sqm: float = Field(ge=50)
    open_space_percent: float = Field(ge=0, le=100)
    courtyard_area_sqm: float = Field(ge=0)
    green_area_sqm: float = Field(ge=0)
    solar_area_sqm: float = Field(ge=0)
    roof_area_sqm: float = Field(ge=10)
    avg_window_ratio: float = Field(ge=0, le=1)
    occupancy_percent: float = Field(ge=0, le=100)
    rainfall_mm_assumption: float = Field(ge=0)
    avg_temp_assumption: float = Field(ge=-20, le=55)


class EnergyFeatures(BaseModel):
    bed_capacity: int = Field(ge=10)
    built_area_sqm: float = Field(ge=50)
    occupancy_percent: float = Field(ge=0, le=100)
    floors: int = Field(ge=1, le=10)
    icu_area_sqm: float = Field(ge=0)
    ot_area_sqm: float = Field(ge=0)
    emergency_area_sqm: float = Field(ge=0)
    opd_area_sqm: float = Field(ge=0)
    ward_area_sqm: float = Field(ge=0)
    has_lab: int = Field(ge=0, le=1)
    has_solar: int = Field(ge=0, le=1)
    solar_area_sqm: float = Field(ge=0)
    avg_temp_assumption: float = Field(ge=-20, le=55)
    dept_count: int = Field(ge=1, le=20)
    avg_window_ratio: float = Field(ge=0, le=1)
    daylight_potential: float = Field(ge=0, le=100)


class WaterFeatures(BaseModel):
    bed_capacity: int = Field(ge=10)
    occupancy_percent: float = Field(ge=0, le=100)
    built_area_sqm: float = Field(ge=50)
    ward_area_sqm: float = Field(ge=0)
    opd_area_sqm: float = Field(ge=0)
    has_cafeteria: int = Field(ge=0, le=1)
    dept_count: int = Field(ge=1, le=20)
    rainfall_mm_assumption: float = Field(ge=0)
    roof_area_sqm: float = Field(ge=10)
    has_rainwater: int = Field(ge=0, le=1)
    floors: int = Field(ge=1, le=10)


class LayoutFeatures(BaseModel):
    site_area_sqm: float = Field(ge=100)
    built_area_sqm: float = Field(ge=50)
    open_space_percent: float = Field(ge=0, le=100)
    floors: int = Field(ge=1, le=10)
    bed_capacity: int = Field(ge=10)
    dept_count: int = Field(ge=1, le=20)
    has_emergency: int = Field(ge=0, le=1)
    has_icu: int = Field(ge=0, le=1)
    has_ot: int = Field(ge=0, le=1)
    has_opd: int = Field(ge=0, le=1)
    has_pharmacy: int = Field(ge=0, le=1)
    has_courtyard: int = Field(ge=0, le=1)
    courtyard_area_sqm: float = Field(ge=0)
    north_angle: float = Field(ge=0, le=360)
    avg_window_ratio: float = Field(ge=0, le=1)
    adjacency_score: float = Field(ge=0, le=100)
    solar_potential: float = Field(ge=0, le=100)
    daylight_potential: float = Field(ge=0, le=100)
    ventilation_potential: float = Field(ge=0, le=100)
    green_coverage_score: float = Field(ge=0, le=100)


class CandidateList(BaseModel):
    candidates: List[Dict[str, Any]]


# --- API Endpoints ---

@app.get("/api/ml/status")
async def ml_status():
    """Return status of all ML models."""
    return {
        'service': 'running',
        'models': predictor.get_status()
    }


@app.post("/api/ml/predict/environment")
async def predict_environment(features: EnvironmentFeatures):
    """Predict environmental performance scores."""
    result = predictor.predict_environment(features.model_dump())
    return result


@app.post("/api/ml/predict/energy")
async def predict_energy(features: EnergyFeatures):
    """Predict energy demand."""
    result = predictor.predict_energy(features.model_dump())
    return result


@app.post("/api/ml/predict/water")
async def predict_water(features: WaterFeatures):
    """Predict water demand."""
    result = predictor.predict_water(features.model_dump())
    return result


@app.post("/api/ml/predict/layout")
async def predict_layout(features: LayoutFeatures):
    """Predict layout quality score."""
    result = predictor.predict_layout_quality(features.model_dump())
    return result


@app.post("/api/ml/rank-candidates")
async def rank_candidates(body: CandidateList):
    """Rank multiple candidate layouts."""
    if not body.candidates:
        raise HTTPException(status_code=400, detail="No candidates provided")
    results = predictor.rank_candidates(body.candidates)
    return {'rankings': results}


@app.get("/api/ml/metrics")
async def ml_metrics():
    """Return evaluation metrics for all models."""
    return predictor.get_metrics()


@app.get("/api/ml/feature-importance")
async def feature_importance():
    """Return feature importance for all models."""
    return predictor.get_feature_importance()


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "vastucare-ml"}


if __name__ == '__main__':
    print("\nStarting VastuCare ML Service on http://0.0.0.0:5001")
    uvicorn.run(app, host="0.0.0.0", port=5001, log_level="info")
