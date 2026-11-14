"""
VastuCare ML — Test Suite
Tests dataset, models, inference, and integration.
"""

import os
import sys
import json
import subprocess
from pathlib import Path

import numpy as np
import pandas as pd

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / 'data' / 'synthetic'
MODELS_DIR = BASE_DIR / 'models'
REPORTS_DIR = BASE_DIR / 'evaluation' / 'reports'

DATASET_PATH = DATA_DIR / 'hospital_designs_v1.csv'

PASS = 0
FAIL = 0


def test_pass(name):
    global PASS
    PASS += 1
    print(f"  ✓ PASS: {name}")


def test_fail(name, reason=""):
    global FAIL
    FAIL += 1
    print(f"  ✗ FAIL: {name} — {reason}")


def test_dataset():
    print("\n" + "=" * 50)
    print("TEST: Dataset Validation")
    print("=" * 50)

    if not DATASET_PATH.exists():
        test_fail("Dataset exists", "File not found")
        return

    df = pd.read_csv(DATASET_PATH)

    # Test 1: 10,000+ valid samples
    if len(df) >= 10000:
        test_pass(f"Dataset has {len(df)} samples (≥10,000)")
    else:
        test_fail(f"Dataset has {len(df)} samples", "Need ≥10,000")

    # Test 2: No NaN values
    nan_count = df.isnull().sum().sum()
    if nan_count == 0:
        test_pass("No NaN values")
    else:
        test_fail("NaN values found", f"{nan_count} NaN values")

    # Test 3: Scores in valid range [0, 100]
    score_cols = ['solar_potential', 'daylight_potential', 'ventilation_potential',
                  'rainwater_potential', 'sustainability_score', 'vastu_score',
                  'adjacency_score', 'layout_quality_score', 'green_coverage_score']
    for col in score_cols:
        if col in df.columns:
            if df[col].min() >= 0 and df[col].max() <= 100:
                test_pass(f"{col} in [0, 100]")
            else:
                test_fail(f"{col} range", f"min={df[col].min():.1f}, max={df[col].max():.1f}")

    # Test 4: No negative areas
    area_cols = [c for c in df.columns if 'area' in c.lower()]
    for col in area_cols:
        if col in df.columns:
            if df[col].min() >= 0:
                test_pass(f"{col} ≥ 0")
            else:
                test_fail(f"{col} non-negative", f"min={df[col].min():.1f}")

    # Test 5: Energy demand positive
    if 'energy_demand_kwh_day' in df.columns:
        if df['energy_demand_kwh_day'].min() > 0:
            test_pass("energy_demand_kwh_day > 0")
        else:
            test_fail("energy_demand positive", f"min={df['energy_demand_kwh_day'].min():.1f}")

    # Test 6: Water demand positive
    if 'water_demand_liters_day' in df.columns:
        if df['water_demand_liters_day'].min() > 0:
            test_pass("water_demand_liters_day > 0")
        else:
            test_fail("water_demand positive", f"min={df['water_demand_liters_day'].min():.1f}")

    # Test 7: data_source column
    if 'data_source' in df.columns:
        if (df['data_source'] == 'synthetic_simulation').all():
            test_pass("All records labeled synthetic_simulation")
        else:
            test_fail("data_source labeling", "Not all synthetic_simulation")
    else:
        test_fail("data_source column", "Column missing")

    # Test 8: No duplicates
    dup_count = df.duplicated().sum()
    if dup_count < len(df) * 0.01:  # Less than 1% duplicates
        test_pass(f"Duplicates: {dup_count} (<1%)")
    else:
        test_fail("Duplicates", f"{dup_count} duplicates found")


def test_models():
    print("\n" + "=" * 50)
    print("TEST: Model Files")
    print("=" * 50)

    model_names = ['environmental', 'energy', 'water', 'layout_quality']

    for name in model_names:
        model_path = MODELS_DIR / f'{name}_model.joblib'
        scaler_path = MODELS_DIR / f'{name}_scaler.joblib'
        meta_path = MODELS_DIR / f'{name}_model_meta.json'

        # Test model file exists
        if model_path.exists():
            test_pass(f"{name}_model.joblib exists")
        else:
            test_fail(f"{name}_model.joblib", "File not found")
            continue

        # Test scaler exists
        if scaler_path.exists():
            test_pass(f"{name}_scaler.joblib exists")
        else:
            test_fail(f"{name}_scaler.joblib", "File not found")

        # Test metadata exists and valid
        if meta_path.exists():
            with open(meta_path) as f:
                meta = json.load(f)

            test_pass(f"{name}_model_meta.json exists")

            # Check required fields
            required_fields = ['model_name', 'model_type', 'model_version',
                             'training_date', 'data_source', 'test_r2',
                             'test_mae', 'test_rmse', 'training_samples',
                             'validation_samples', 'test_samples', 'cv_mean_r2']

            missing = [f for f in required_fields if f not in meta]
            if not missing:
                test_pass(f"{name} metadata has all required fields")
            else:
                test_fail(f"{name} metadata", f"Missing: {missing}")

            # Check data_source is synthetic
            if meta.get('data_source') == 'synthetic_simulation':
                test_pass(f"{name} data_source = synthetic_simulation")
            else:
                test_fail(f"{name} data_source", f"Got: {meta.get('data_source')}")

            # Check R² is a real number (not hardcoded example)
            r2 = meta.get('test_r2')
            if isinstance(r2, (int, float)) and 0 <= r2 <= 1:
                test_pass(f"{name} test_r2 = {r2:.4f} (valid)")
            else:
                test_fail(f"{name} test_r2", f"Invalid value: {r2}")
        else:
            test_fail(f"{name}_model_meta.json", "File not found")


def test_inference():
    print("\n" + "=" * 50)
    print("TEST: Model Inference")
    print("=" * 50)

    try:
        sys.path.insert(0, str(BASE_DIR))
        from inference.predictor import MLPredictor
        predictor = MLPredictor()

        # Test environmental prediction
        env_features = {
            'site_length_m': 60.0, 'site_width_m': 45.0, 'site_area_sqm': 2700.0,
            'north_angle': 0, 'latitude': 13.08, 'longitude': 80.27,
            'floors': 3, 'bed_capacity': 100, 'dept_count': 10,
            'has_solar': 1, 'has_rainwater': 1, 'has_courtyard': 1, 'has_green_roof': 0,
            'built_area_sqm': 1500.0, 'open_space_percent': 35.0,
            'courtyard_area_sqm': 200.0, 'green_area_sqm': 300.0,
            'solar_area_sqm': 300.0, 'roof_area_sqm': 500.0,
            'avg_window_ratio': 0.25, 'occupancy_percent': 75.0,
            'rainfall_mm_assumption': 1400.0, 'avg_temp_assumption': 28.0
        }

        result = predictor.predict_environment(env_features)
        if not result.get('fallback'):
            preds = result.get('predictions', {})
            all_valid = all(0 <= v <= 100 for v in preds.values())
            no_nan = not any(np.isnan(v) for v in preds.values())
            if all_valid and no_nan:
                test_pass(f"Environmental prediction valid: {preds}")
            else:
                test_fail("Environmental prediction", f"Invalid values: {preds}")
        else:
            test_fail("Environmental prediction", "Fallback mode (model not loaded)")

        # Test energy prediction
        energy_features = {
            'bed_capacity': 100, 'built_area_sqm': 1500.0, 'occupancy_percent': 75.0,
            'floors': 3, 'icu_area_sqm': 80.0, 'ot_area_sqm': 100.0,
            'emergency_area_sqm': 90.0, 'opd_area_sqm': 150.0, 'ward_area_sqm': 400.0,
            'has_lab': 1, 'has_solar': 1, 'solar_area_sqm': 300.0,
            'avg_temp_assumption': 28.0, 'dept_count': 10,
            'avg_window_ratio': 0.25, 'daylight_potential': 70.0
        }

        result = predictor.predict_energy(energy_features)
        if not result.get('fallback'):
            preds = result.get('predictions', {})
            all_positive = all(v > 0 for v in preds.values())
            no_nan = not any(np.isnan(v) for v in preds.values())
            if all_positive and no_nan:
                test_pass(f"Energy prediction valid: {preds}")
            else:
                test_fail("Energy prediction", f"Invalid values: {preds}")
        else:
            test_fail("Energy prediction", "Fallback mode")

        # Test water prediction
        water_features = {
            'bed_capacity': 100, 'occupancy_percent': 75.0, 'built_area_sqm': 1500.0,
            'ward_area_sqm': 400.0, 'opd_area_sqm': 150.0, 'has_cafeteria': 1,
            'dept_count': 10, 'rainfall_mm_assumption': 1400.0,
            'roof_area_sqm': 500.0, 'has_rainwater': 1, 'floors': 3
        }

        result = predictor.predict_water(water_features)
        if not result.get('fallback'):
            preds = result.get('predictions', {})
            if preds.get('water_demand_liters_day', 0) > 0:
                test_pass(f"Water prediction valid: {preds}")
            else:
                test_fail("Water prediction", f"Invalid values: {preds}")
        else:
            test_fail("Water prediction", "Fallback mode")

        # Test different inputs produce different predictions
        env_features2 = env_features.copy()
        env_features2['bed_capacity'] = 500
        env_features2['solar_area_sqm'] = 800.0
        env_features2['site_area_sqm'] = 10000.0

        result1 = predictor.predict_environment(env_features)
        result2 = predictor.predict_environment(env_features2)
        if not result1.get('fallback') and not result2.get('fallback'):
            p1 = result1['predictions'].get('sustainability_score', 0)
            p2 = result2['predictions'].get('sustainability_score', 0)
            if abs(p1 - p2) > 0.01:
                test_pass(f"Different inputs → different predictions ({p1:.1f} vs {p2:.1f})")
            else:
                test_fail("Input sensitivity", f"Same prediction: {p1:.1f} vs {p2:.1f}")

        # Test candidate ranking
        candidates = [env_features, env_features2]
        rankings = predictor.rank_candidates(candidates)
        if len(rankings) == 2:
            test_pass(f"Candidate ranking works ({len(rankings)} ranked)")
        else:
            test_fail("Candidate ranking", f"Expected 2 results, got {len(rankings)}")

    except Exception as e:
        test_fail("Inference module", str(e))


def test_reports():
    print("\n" + "=" * 50)
    print("TEST: Evaluation Reports")
    print("=" * 50)

    # Check training summary
    summary_path = REPORTS_DIR / 'training_summary.json'
    if summary_path.exists():
        test_pass("training_summary.json exists")
        with open(summary_path) as f:
            summary = json.load(f)
        if summary.get('data_leakage_note'):
            test_pass("Data leakage note present")
        else:
            test_fail("Data leakage note", "Missing")
    else:
        test_fail("training_summary.json", "Not found")

    # Check validation report
    report_path = REPORTS_DIR / 'validation_report.md'
    if report_path.exists():
        test_pass("validation_report.md exists")
    else:
        test_fail("validation_report.md", "Not found")

    # Check prediction CSV files
    for model_name in ['environmental', 'energy', 'water', 'layout_quality']:
        pred_path = REPORTS_DIR / f'{model_name}_predictions.csv'
        if pred_path.exists():
            test_pass(f"{model_name}_predictions.csv exists")
        else:
            test_fail(f"{model_name}_predictions.csv", "Not found")

    # Check plots
    for model_name in ['environmental', 'energy', 'water', 'layout_quality']:
        plot_path = REPORTS_DIR / f'{model_name}_pred_vs_actual.png'
        if plot_path.exists():
            test_pass(f"{model_name}_pred_vs_actual.png exists")
        else:
            test_fail(f"{model_name}_pred_vs_actual.png", "Not found")


def main():
    global PASS, FAIL

    print("=" * 50)
    print("VASTUCARE ML — COMPREHENSIVE TEST SUITE")
    print("=" * 50)

    test_dataset()
    test_models()
    test_inference()
    test_reports()

    print("\n" + "=" * 50)
    print("TEST RESULTS SUMMARY")
    print("=" * 50)
    print(f"  PASS: {PASS}")
    print(f"  FAIL: {FAIL}")
    print(f"  TOTAL: {PASS + FAIL}")
    print(f"  RATE: {PASS / (PASS + FAIL) * 100:.1f}%")

    if FAIL > 0:
        print("\n⚠ Some tests failed. Review issues above.")
        sys.exit(1)
    else:
        print("\n✓ All tests passed!")
        sys.exit(0)


if __name__ == '__main__':
    main()
