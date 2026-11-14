"""
VastuCare ML Pipeline — Master Training Script
Trains all models: Environmental, Energy, Water, Layout Quality
Compares Linear Regression, Random Forest, Gradient Boosting, Extra Trees
Selects best model by validation R²
Saves models + metadata + feature importance
"""

import os
import sys
import json
import time
import warnings
from datetime import datetime, timezone
from pathlib import Path

import numpy as np
import pandas as pd
import joblib
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor, ExtraTreesRegressor
from sklearn.multioutput import MultiOutputRegressor
from sklearn.model_selection import cross_val_score, KFold
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score, mean_absolute_percentage_error
from sklearn.preprocessing import StandardScaler
from sklearn.base import clone

warnings.filterwarnings('ignore', category=FutureWarning)

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

# Paths
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / 'data' / 'synthetic'
PROCESSED_DIR = BASE_DIR / 'data' / 'processed'
MODELS_DIR = BASE_DIR / 'models'
REPORTS_DIR = BASE_DIR / 'evaluation' / 'reports'

DATASET_PATH = DATA_DIR / 'hospital_designs_v1.csv'
SEED = 42
CV_FOLDS = 5
TRAIN_RATIO = 0.70
VAL_RATIO = 0.15
TEST_RATIO = 0.15


def load_and_split(df, feature_cols, target_cols, seed=SEED):
    """Split data into train/val/test with 70/15/15 ratio."""
    np.random.seed(seed)
    n = len(df)
    indices = np.random.permutation(n)
    train_end = int(n * TRAIN_RATIO)
    val_end = int(n * (TRAIN_RATIO + VAL_RATIO))

    train_idx = indices[:train_end]
    val_idx = indices[train_end:val_end]
    test_idx = indices[val_end:]

    X = df[feature_cols].values
    y = df[target_cols].values if len(target_cols) > 1 else df[target_cols[0]].values

    # Scale features
    scaler = StandardScaler()
    X_train = scaler.fit_transform(X[train_idx])
    X_val = scaler.transform(X[val_idx])
    X_test = scaler.transform(X[test_idx])

    y_train = y[train_idx]
    y_val = y[val_idx]
    y_test = y[test_idx]

    return X_train, X_val, X_test, y_train, y_val, y_test, scaler, feature_cols


def evaluate_model(model, X, y_true, is_multi=False):
    """Calculate MAE, RMSE, R², MAPE for a model on given data."""
    y_pred = model.predict(X)
    if is_multi:
        mae = mean_absolute_error(y_true, y_pred, multioutput='uniform_average')
        rmse = np.sqrt(mean_squared_error(y_true, y_pred))
        r2 = r2_score(y_true, y_pred, multioutput='uniform_average')
        # MAPE per target
        mape_vals = []
        for i in range(y_true.shape[1]):
            mask = np.abs(y_true[:, i]) > 1e-6
            if mask.sum() > 0:
                mape_vals.append(np.mean(np.abs((y_true[mask, i] - y_pred[mask, i]) / y_true[mask, i])) * 100)
        mape = np.mean(mape_vals) if mape_vals else 0.0
    else:
        mae = mean_absolute_error(y_true, y_pred)
        rmse = np.sqrt(mean_squared_error(y_true, y_pred))
        r2 = r2_score(y_true, y_pred)
        mask = np.abs(y_true) > 1e-6
        mape = np.mean(np.abs((y_true[mask] - y_pred[mask]) / y_true[mask])) * 100 if mask.sum() > 0 else 0.0

    return {
        'mae': round(float(mae), 4),
        'rmse': round(float(rmse), 4),
        'r2': round(float(r2), 4),
        'mape': round(float(mape), 2)
    }


from sklearn.inspection import permutation_importance

def get_feature_importance(model, feature_names, X_val=None, y_val=None, is_multi=False):
    """Extract feature importance from tree-based models or via permutation importance."""
    try:
        if is_multi and hasattr(model, 'estimators_'):
            if all(hasattr(est, 'feature_importances_') for est in model.estimators_):
                importances = np.mean([est.feature_importances_ for est in model.estimators_], axis=0)
            elif X_val is not None and y_val is not None:
                perm = permutation_importance(model, X_val, y_val, n_repeats=5, random_state=SEED, n_jobs=-1)
                importances = perm.importances_mean
            else:
                return []
        elif hasattr(model, 'feature_importances_'):
            importances = model.feature_importances_
        elif X_val is not None and y_val is not None:
            perm = permutation_importance(model, X_val, y_val, n_repeats=5, random_state=SEED, n_jobs=-1)
            importances = perm.importances_mean
        else:
            return []

        # Normalize importances so sum = 1.0
        total = np.sum(np.abs(importances))
        if total > 0:
            importances = np.abs(importances) / total

        result = []
        for name, imp in zip(feature_names, importances):
            result.append({'feature': name, 'importance': round(float(imp), 4)})
        result.sort(key=lambda x: x['importance'], reverse=True)
        return result
    except Exception as e:
        print(f"    ⚠ Feature importance error: {e}")
        return []



from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor, ExtraTreesRegressor, HistGradientBoostingRegressor

def train_model_comparison(X_train, y_train, X_val, y_val, feature_names, is_multi=False):
    """Train and compare 5 candidate models. Return best model + comparison results."""
    if is_multi:
        candidates = {
            'LinearRegression': LinearRegression(),
            'RandomForest': MultiOutputRegressor(RandomForestRegressor(n_estimators=200, random_state=SEED, n_jobs=-1)),
            'GradientBoosting': MultiOutputRegressor(GradientBoostingRegressor(n_estimators=200, learning_rate=0.1, random_state=SEED)),
            'ExtraTrees': MultiOutputRegressor(ExtraTreesRegressor(n_estimators=200, random_state=SEED, n_jobs=-1)),
            'HistGradientBoosting': MultiOutputRegressor(HistGradientBoostingRegressor(max_iter=200, random_state=SEED))
        }
    else:
        candidates = {
            'LinearRegression': LinearRegression(),
            'RandomForest': RandomForestRegressor(n_estimators=200, random_state=SEED, n_jobs=-1),
            'GradientBoosting': GradientBoostingRegressor(n_estimators=200, learning_rate=0.1, random_state=SEED),
            'ExtraTrees': ExtraTreesRegressor(n_estimators=200, random_state=SEED, n_jobs=-1),
            'HistGradientBoosting': HistGradientBoostingRegressor(max_iter=200, random_state=SEED)
        }


    results = {}
    best_model = None
    best_model_name = None
    best_val_r2 = -np.inf

    for name, model in candidates.items():
        start = time.time()
        print(f"  Training {name}...", end=' ', flush=True)
        model.fit(X_train, y_train)
        elapsed = time.time() - start

        val_metrics = evaluate_model(model, X_val, y_val, is_multi)
        train_metrics = evaluate_model(model, X_train, y_train, is_multi)

        results[name] = {
            'train': train_metrics,
            'validation': val_metrics,
            'training_time_seconds': round(elapsed, 2)
        }

        print(f"Val R²={val_metrics['r2']:.4f}, MAE={val_metrics['mae']:.4f} ({elapsed:.1f}s)")

        if val_metrics['r2'] > best_val_r2:
            best_val_r2 = val_metrics['r2']
            best_model = model
            best_model_name = name

    # Cross-validation on best model (refit on train data with CV)
    print(f"  Running {CV_FOLDS}-fold CV on best model ({best_model_name})...", end=' ', flush=True)
    kf = KFold(n_splits=CV_FOLDS, shuffle=True, random_state=SEED)

    if is_multi:
        # For multi-output, use custom CV with clone
        cv_scores = []
        for train_idx, val_idx in kf.split(X_train):
            fold_model = clone(best_model)
            fold_model.fit(X_train[train_idx], y_train[train_idx])
            score = r2_score(y_train[val_idx], fold_model.predict(X_train[val_idx]), multioutput='uniform_average')
            cv_scores.append(score)
        cv_scores = np.array(cv_scores)
    else:
        cv_scores = cross_val_score(best_model, X_train, y_train, cv=kf, scoring='r2')

    print(f"Mean CV R²={cv_scores.mean():.4f} ± {cv_scores.std():.4f}")

    return best_model, best_model_name, results, cv_scores



def save_model(model, scaler, model_name, model_type, feature_names, target_names,
               train_metrics, val_metrics, test_metrics, cv_scores,
               comparison_results, feature_importance, n_train, n_val, n_test):
    """Save model, scaler, and metadata."""
    MODELS_DIR.mkdir(parents=True, exist_ok=True)

    # Save model
    model_path = MODELS_DIR / f'{model_name}_model.joblib'
    joblib.dump(model, model_path)

    # Save scaler
    scaler_path = MODELS_DIR / f'{model_name}_scaler.joblib'
    joblib.dump(scaler, scaler_path)

    # Save metadata
    meta = {
        'model_name': model_name,
        'model_type': model_type,
        'model_version': '1.0',
        'training_date': datetime.now(timezone.utc).isoformat(),
        'dataset_version': 'synthetic-v1',
        'data_source': 'synthetic_simulation',
        'feature_count': len(feature_names),
        'feature_names': feature_names,
        'target_names': target_names,
        'training_samples': n_train,
        'validation_samples': n_val,
        'test_samples': n_test,
        'random_seed': SEED,
        'cv_folds': CV_FOLDS,
        'cv_mean_r2': round(float(cv_scores.mean()), 4),
        'cv_std_r2': round(float(cv_scores.std()), 4),
        'train_mae': train_metrics['mae'],
        'train_r2': train_metrics['r2'],
        'test_mae': test_metrics['mae'],
        'test_rmse': test_metrics['rmse'],
        'test_r2': test_metrics['r2'],
        'test_mape': test_metrics['mape'],
        'baseline_mae': comparison_results.get('LinearRegression', {}).get('validation', {}).get('mae', None),
        'baseline_r2': comparison_results.get('LinearRegression', {}).get('validation', {}).get('r2', None),
        'baseline_type': 'LinearRegression',
        'feature_importance': feature_importance[:20],  # Top 20
        'model_comparison': comparison_results
    }

    meta_path = MODELS_DIR / f'{model_name}_model_meta.json'
    with open(meta_path, 'w') as f:
        json.dump(meta, f, indent=2)

    print(f"  Saved: {model_path.name}, {scaler_path.name}, {meta_path.name}")
    return meta


def define_model_configs():
    """Define feature sets and targets for each model, preventing data leakage."""
    return {
        'environmental': {
            'display_name': 'Environmental Performance',
            'features': [
                'site_length_m', 'site_width_m', 'site_area_sqm', 'north_angle',
                'latitude', 'longitude', 'floors', 'bed_capacity', 'dept_count',
                'has_solar', 'has_rainwater', 'has_courtyard', 'has_green_roof',
                'built_area_sqm', 'open_space_percent', 'courtyard_area_sqm',
                'green_area_sqm', 'solar_area_sqm', 'roof_area_sqm',
                'avg_window_ratio', 'occupancy_percent',
                'rainfall_mm_assumption', 'avg_temp_assumption'
            ],
            'targets': ['solar_potential', 'daylight_potential', 'ventilation_potential',
                       'rainwater_potential', 'sustainability_score'],
            'is_multi': True
        },
        'energy': {
            'display_name': 'Energy Demand',
            'features': [
                'bed_capacity', 'built_area_sqm', 'occupancy_percent', 'floors',
                'icu_area_sqm', 'ot_area_sqm', 'emergency_area_sqm', 'opd_area_sqm',
                'ward_area_sqm', 'has_lab', 'has_solar', 'solar_area_sqm',
                'avg_temp_assumption', 'dept_count', 'avg_window_ratio', 'daylight_potential'
            ],
            'targets': ['energy_demand_kwh_day', 'peak_energy_kwh'],
            'is_multi': True
        },
        'water': {
            'display_name': 'Water Demand',
            'features': [
                'bed_capacity', 'occupancy_percent', 'built_area_sqm', 'ward_area_sqm',
                'opd_area_sqm', 'has_cafeteria', 'dept_count', 'rainfall_mm_assumption',
                'roof_area_sqm', 'has_rainwater', 'floors'
            ],
            'targets': ['water_demand_liters_day', 'rainwater_harvest_liters_day'],
            'is_multi': True
        },
        'layout_quality': {
            'display_name': 'Layout Quality',
            'features': [
                'site_area_sqm', 'built_area_sqm', 'open_space_percent', 'floors',
                'bed_capacity', 'dept_count', 'has_emergency', 'has_icu', 'has_ot',
                'has_opd', 'has_pharmacy', 'has_courtyard', 'courtyard_area_sqm',
                'north_angle', 'avg_window_ratio', 'adjacency_score',
                'solar_potential', 'daylight_potential', 'ventilation_potential',
                'green_coverage_score'
            ],
            'targets': ['layout_quality_score'],
            'is_multi': False
        }
    }


def run_data_leakage_check(df, model_configs):
    """Check for high correlations between input features and targets."""
    print("\n" + "=" * 60)
    print("DATA LEAKAGE AUDIT")
    print("=" * 60)

    leakage_found = False
    for model_name, config in model_configs.items():
        print(f"\n  Model: {config['display_name']}")
        for feat in config['features']:
            if feat in df.columns:
                for target in config['targets']:
                    if target in df.columns:
                        corr = df[feat].corr(df[target])
                        if abs(corr) > 0.95:
                            print(f"    ⚠ HIGH CORRELATION: {feat} ↔ {target} = {corr:.3f}")
                            leakage_found = True

        # Check if any target appears as input
        for target in config['targets']:
            if target in config['features']:
                print(f"    🚨 TARGET IN FEATURES: {target} is both input and target!")
                leakage_found = True

    if not leakage_found:
        print("  ✓ No obvious data leakage detected.")

    # Document known limitation
    print("\n  IMPORTANT NOTE:")
    print("  Targets are generated by deterministic formulas from the same inputs.")
    print("  The ML model is learning the simulator's relationships,")
    print("  NOT independently validated against real hospital data.")
    print("  High R² values reflect accurate learning of the simulator,")
    print("  not real-world prediction accuracy.")

    return leakage_found


def main():
    print("=" * 60)
    print("VASTUCARE ML PIPELINE — MASTER TRAINING")
    print("=" * 60)
    print(f"Timestamp: {datetime.now().isoformat()}")
    print(f"Random Seed: {SEED}")
    print(f"CV Folds: {CV_FOLDS}")
    print(f"Split: {int(TRAIN_RATIO*100)}/{int(VAL_RATIO*100)}/{int(TEST_RATIO*100)}")

    # Load dataset
    if not DATASET_PATH.exists():
        print(f"\n❌ Dataset not found: {DATASET_PATH}")
        print("Run generate_dataset.py first.")
        sys.exit(1)

    df = pd.read_csv(DATASET_PATH)
    print(f"\nDataset loaded: {len(df)} samples, {len(df.columns)} columns")

    # Convert boolean columns to int
    bool_cols = [c for c in df.columns if c.startswith('has_')]
    for col in bool_cols:
        if df[col].dtype == bool or df[col].dtype == object:
            df[col] = df[col].astype(int)

    # Model configurations
    model_configs = define_model_configs()

    # Data leakage audit
    run_data_leakage_check(df, model_configs)

    # Train each model
    all_results = {}
    all_metas = {}

    for model_name, config in model_configs.items():
        print(f"\n{'=' * 60}")
        print(f"TRAINING: {config['display_name']} Model")
        print(f"{'=' * 60}")
        print(f"  Features: {len(config['features'])}")
        print(f"  Targets: {config['targets']}")
        print(f"  Multi-output: {config['is_multi']}")

        # Check feature availability
        missing_features = [f for f in config['features'] if f not in df.columns]
        if missing_features:
            print(f"  ⚠ Missing features: {missing_features}")
            # Remove missing features
            available_features = [f for f in config['features'] if f in df.columns]
        else:
            available_features = config['features']

        missing_targets = [t for t in config['targets'] if t not in df.columns]
        if missing_targets:
            print(f"  ❌ Missing targets: {missing_targets} — SKIPPING")
            continue

        # Split data
        X_train, X_val, X_test, y_train, y_val, y_test, scaler, feat_names = \
            load_and_split(df, available_features, config['targets'], SEED)

        print(f"  Train: {len(X_train)}, Val: {len(X_val)}, Test: {len(X_test)}")

        # Train and compare models
        best_model, best_model_name, comparison, cv_scores = \
            train_model_comparison(X_train, y_train, X_val, y_val, feat_names, config['is_multi'])

        print(f"\n  ✓ Best Model: {best_model_name}")

        # Final evaluation on test set
        test_metrics = evaluate_model(best_model, X_test, y_test, config['is_multi'])
        train_metrics = evaluate_model(best_model, X_train, y_train, config['is_multi'])
        val_metrics = comparison[best_model_name]['validation']

        print(f"  Test R²={test_metrics['r2']:.4f}, MAE={test_metrics['mae']:.4f}, "
              f"RMSE={test_metrics['rmse']:.4f}, MAPE={test_metrics['mape']:.2f}%")

        # Feature importance
        feat_importance = get_feature_importance(best_model, available_features, X_val, y_val, config['is_multi'])

        # Save model
        meta = save_model(
            model=best_model,
            scaler=scaler,
            model_name=model_name,
            model_type=best_model_name,
            feature_names=available_features,
            target_names=config['targets'],
            train_metrics=train_metrics,
            val_metrics=val_metrics,
            test_metrics=test_metrics,
            cv_scores=cv_scores,
            comparison_results=comparison,
            feature_importance=feat_importance,
            n_train=len(X_train),
            n_val=len(X_val),
            n_test=len(X_test)
        )

        all_results[model_name] = {
            'best_model': best_model_name,
            'test': test_metrics,
            'cv_mean_r2': round(float(cv_scores.mean()), 4),
            'cv_std_r2': round(float(cv_scores.std()), 4),
            'comparison': comparison
        }
        all_metas[model_name] = meta

        # Save test predictions for plotting
        y_pred_test = best_model.predict(X_test)
        pred_df = pd.DataFrame()
        if config['is_multi']:
            for i, target in enumerate(config['targets']):
                pred_df[f'{target}_actual'] = y_test[:, i]
                pred_df[f'{target}_predicted'] = y_pred_test[:, i]
        else:
            pred_df['actual'] = y_test
            pred_df['predicted'] = y_pred_test
        pred_df.to_csv(REPORTS_DIR / f'{model_name}_predictions.csv', index=False)

    # Generate summary report
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)

    summary = {
        'report_type': 'ML Training Summary',
        'generated_at': datetime.now(timezone.utc).isoformat(),
        'dataset': {
            'path': str(DATASET_PATH),
            'total_samples': len(df),
            'source': 'synthetic_simulation',
            'version': 'v1',
            'seed': SEED
        },
        'models': all_results,
        'data_leakage_note': (
            'Targets are generated by deterministic formulas from the same inputs. '
            'The ML model is learning the simulator\'s relationships, '
            'NOT independently validated against real hospital data. '
            'High R² values reflect accurate learning of the simulator.'
        )
    }

    with open(REPORTS_DIR / 'training_summary.json', 'w') as f:
        json.dump(summary, f, indent=2)

    # Print final summary
    print("\n" + "=" * 60)
    print("TRAINING COMPLETE — SUMMARY")
    print("=" * 60)
    print(f"\n{'Model':<25} {'Best':<20} {'Test R²':<10} {'Test MAE':<10} {'CV R²':<15}")
    print("-" * 80)
    for model_name, result in all_results.items():
        print(f"{model_name:<25} {result['best_model']:<20} "
              f"{result['test']['r2']:<10.4f} {result['test']['mae']:<10.4f} "
              f"{result['cv_mean_r2']:.4f}±{result['cv_std_r2']:.4f}")

    print(f"\nModels saved to: {MODELS_DIR}")
    print(f"Reports saved to: {REPORTS_DIR}")
    print("\n⚠ REMINDER: All metrics are from synthetic simulation data.")
    print("  This does NOT constitute real-world architectural validation.")


if __name__ == '__main__':
    main()
