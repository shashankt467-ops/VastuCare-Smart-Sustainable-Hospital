"""
VastuCare ML — Inference Predictor Module
Loads trained models and provides prediction functions.
"""

import json
from pathlib import Path
from typing import Optional, Dict, Any, List

import numpy as np
import joblib

import sys
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

MODELS_DIR = Path(__file__).resolve().parent.parent / 'models'


class MLPredictor:
    """Loads and serves predictions from trained ML models."""

    def __init__(self):
        self.models: Dict[str, Any] = {}
        self.scalers: Dict[str, Any] = {}
        self.metadata: Dict[str, Dict] = {}
        self._load_all_models()

    def _load_all_models(self):
        """Load all available trained models."""
        model_names = ['environmental', 'energy', 'water', 'layout_quality']

        for name in model_names:
            model_path = MODELS_DIR / f'{name}_model.joblib'
            scaler_path = MODELS_DIR / f'{name}_scaler.joblib'
            meta_path = MODELS_DIR / f'{name}_model_meta.json'

            if model_path.exists() and scaler_path.exists() and meta_path.exists():
                try:
                    self.models[name] = joblib.load(model_path)
                    self.scalers[name] = joblib.load(scaler_path)
                    with open(meta_path) as f:
                        self.metadata[name] = json.load(f)
                    print(f"  [OK] Loaded {name} model ({self.metadata[name]['model_type']})")
                except Exception as e:
                    print(f"  [FAIL] Failed to load {name}: {e}")
            else:
                print(f"  [WARN] {name} model not found — will use fallback")


    def is_available(self, model_name: str) -> bool:
        return model_name in self.models

    def get_status(self) -> Dict:
        """Return status of all models."""
        status = {}
        for name in ['environmental', 'energy', 'water', 'layout_quality']:
            if name in self.models:
                meta = self.metadata[name]
                status[name] = {
                    'available': True,
                    'model_type': meta['model_type'],
                    'version': meta['model_version'],
                    'test_r2': meta['test_r2'],
                    'test_mae': meta['test_mae'],
                    'data_source': meta['data_source'],
                    'training_date': meta['training_date'],
                    'training_samples': meta['training_samples']
                }
            else:
                status[name] = {'available': False}
        return status

    def get_metrics(self) -> Dict:
        """Return all model evaluation metrics."""
        metrics = {}
        for name, meta in self.metadata.items():
            metrics[name] = {
                'model_name': meta['model_name'],
                'model_type': meta['model_type'],
                'model_version': meta['model_version'],
                'training_date': meta['training_date'],
                'dataset_version': meta['dataset_version'],
                'data_source': meta['data_source'],
                'feature_count': meta['feature_count'],
                'training_samples': meta['training_samples'],
                'validation_samples': meta['validation_samples'],
                'test_samples': meta['test_samples'],
                'cv_mean_r2': meta['cv_mean_r2'],
                'cv_std_r2': meta['cv_std_r2'],
                'test_mae': meta['test_mae'],
                'test_rmse': meta['test_rmse'],
                'test_r2': meta['test_r2'],
                'test_mape': meta['test_mape'],
                'baseline_mae': meta.get('baseline_mae'),
                'baseline_r2': meta.get('baseline_r2'),
                'model_comparison': meta.get('model_comparison', {})
            }
        return metrics

    def get_feature_importance(self) -> Dict:
        """Return feature importance for all models."""
        importance = {}
        for name, meta in self.metadata.items():
            importance[name] = {
                'model_name': meta['model_name'],
                'model_type': meta['model_type'],
                'features': meta.get('feature_importance', [])
            }
        return importance

    def _prepare_features(self, model_name: str, features: Dict) -> Optional[np.ndarray]:
        """Prepare feature vector for prediction."""
        if model_name not in self.metadata:
            return None

        feature_names = self.metadata[model_name]['feature_names']
        values = []
        for fname in feature_names:
            val = features.get(fname, 0)
            if val is None:
                val = 0
            values.append(float(val))

        X = np.array(values).reshape(1, -1)
        X_scaled = self.scalers[model_name].transform(X)
        return X_scaled

    def predict_environment(self, features: Dict) -> Dict:
        """Predict environmental performance scores."""
        if not self.is_available('environmental'):
            return {'fallback': True, 'mode': 'engineering_rules'}

        X = self._prepare_features('environmental', features)
        if X is None:
            return {'fallback': True, 'mode': 'engineering_rules'}

        predictions = self.models['environmental'].predict(X)[0]
        target_names = self.metadata['environmental']['target_names']

        result = {
            'fallback': False,
            'mode': 'ml_model',
            'model_type': self.metadata['environmental']['model_type'],
            'model_version': self.metadata['environmental']['model_version'],
            'data_source': self.metadata['environmental']['data_source'],
            'test_r2': self.metadata['environmental']['test_r2'],
            'predictions': {}
        }

        for name, val in zip(target_names, predictions):
            result['predictions'][name] = round(float(np.clip(val, 0, 100)), 2)

        return result

    def predict_energy(self, features: Dict) -> Dict:
        """Predict energy demand."""
        if not self.is_available('energy'):
            return {'fallback': True, 'mode': 'engineering_rules'}

        X = self._prepare_features('energy', features)
        if X is None:
            return {'fallback': True, 'mode': 'engineering_rules'}

        predictions = self.models['energy'].predict(X)[0]
        target_names = self.metadata['energy']['target_names']

        result = {
            'fallback': False,
            'mode': 'ml_model',
            'model_type': self.metadata['energy']['model_type'],
            'model_version': self.metadata['energy']['model_version'],
            'data_source': self.metadata['energy']['data_source'],
            'test_r2': self.metadata['energy']['test_r2'],
            'predictions': {}
        }

        for name, val in zip(target_names, predictions):
            result['predictions'][name] = round(float(max(val, 0)), 2)

        return result

    def predict_water(self, features: Dict) -> Dict:
        """Predict water demand."""
        if not self.is_available('water'):
            return {'fallback': True, 'mode': 'engineering_rules'}

        X = self._prepare_features('water', features)
        if X is None:
            return {'fallback': True, 'mode': 'engineering_rules'}

        predictions = self.models['water'].predict(X)[0]
        target_names = self.metadata['water']['target_names']

        result = {
            'fallback': False,
            'mode': 'ml_model',
            'model_type': self.metadata['water']['model_type'],
            'model_version': self.metadata['water']['model_version'],
            'data_source': self.metadata['water']['data_source'],
            'test_r2': self.metadata['water']['test_r2'],
            'predictions': {}
        }

        for name, val in zip(target_names, predictions):
            result['predictions'][name] = round(float(max(val, 0)), 2)

        return result

    def predict_layout_quality(self, features: Dict) -> Dict:
        """Predict layout quality score."""
        if not self.is_available('layout_quality'):
            return {'fallback': True, 'mode': 'engineering_rules'}

        X = self._prepare_features('layout_quality', features)
        if X is None:
            return {'fallback': True, 'mode': 'engineering_rules'}

        prediction = self.models['layout_quality'].predict(X)[0]

        return {
            'fallback': False,
            'mode': 'ml_model',
            'model_type': self.metadata['layout_quality']['model_type'],
            'model_version': self.metadata['layout_quality']['model_version'],
            'data_source': self.metadata['layout_quality']['data_source'],
            'test_r2': self.metadata['layout_quality']['test_r2'],
            'predictions': {
                'layout_quality_score': round(float(np.clip(prediction, 0, 100)), 2)
            }
        }

    def rank_candidates(self, candidates: List[Dict]) -> List[Dict]:
        """Rank multiple candidate layouts using ML predictions."""
        results = []
        for i, candidate in enumerate(candidates):
            env = self.predict_environment(candidate)
            energy = self.predict_energy(candidate)
            layout = self.predict_layout_quality(candidate)

            ml_score = 0
            if not env.get('fallback'):
                ml_score += env['predictions'].get('sustainability_score', 0) * 0.4
            if not layout.get('fallback'):
                ml_score += layout['predictions'].get('layout_quality_score', 0) * 0.6

            results.append({
                'candidate_index': i,
                'ml_score': round(ml_score, 2),
                'environmental': env,
                'energy': energy,
                'layout': layout,
                'mode': 'ml_model' if not env.get('fallback') else 'engineering_rules'
            })

        results.sort(key=lambda x: x['ml_score'], reverse=True)
        return results
