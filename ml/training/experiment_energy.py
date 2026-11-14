"""
Experiment script to optimize Energy model performance (reducing MAPE and MAE)
"""
import sys
import numpy as np
import pandas as pd
from pathlib import Path
from sklearn.model_selection import KFold
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score, mean_absolute_percentage_error
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import GradientBoostingRegressor, RandomForestRegressor, ExtraTreesRegressor, HistGradientBoostingRegressor
from sklearn.multioutput import MultiOutputRegressor

BASE_DIR = Path(__file__).resolve().parent.parent
DATASET_PATH = BASE_DIR / 'data' / 'synthetic' / 'hospital_designs_v1.csv'
SEED = 42

df = pd.read_csv(DATASET_PATH)

features = [
    'bed_capacity', 'built_area_sqm', 'occupancy_percent', 'floors',
    'icu_area_sqm', 'ot_area_sqm', 'emergency_area_sqm', 'opd_area_sqm',
    'ward_area_sqm', 'has_lab', 'has_solar', 'solar_area_sqm',
    'avg_temp_assumption', 'dept_count', 'avg_window_ratio', 'daylight_potential'
]

bool_cols = [c for c in df.columns if c.startswith('has_')]
for col in bool_cols:
    if df[col].dtype == bool or df[col].dtype == object:
        df[col] = df[col].astype(int)

X = df[features].values
y1 = df['energy_demand_kwh_day'].values
y2 = df['peak_energy_kwh'].values

np.random.seed(SEED)
n = len(df)
indices = np.random.permutation(n)
train_end = int(n * 0.70)
val_end = int(n * 0.85)

train_idx = indices[:train_end]
val_idx = indices[train_end:val_end]
test_idx = indices[val_end:]

scaler = StandardScaler()
X_train = scaler.fit_transform(X[train_idx])
X_val = scaler.transform(X[val_idx])
X_test = scaler.transform(X[test_idx])

print("--- Energy Demand (kwh/day) ---")
for name, model in [
    ('GradientBoosting', GradientBoostingRegressor(n_estimators=250, learning_rate=0.08, random_state=SEED)),
    ('RandomForest', RandomForestRegressor(n_estimators=250, random_state=SEED, n_jobs=-1)),
    ('HistGradientBoosting', HistGradientBoostingRegressor(max_iter=250, random_state=SEED))
]:
    model.fit(X_train, y1[train_idx])
    preds = model.predict(X_test)
    mae = mean_absolute_error(y1[test_idx], preds)
    r2 = r2_score(y1[test_idx], preds)
    mape = np.mean(np.abs((y1[test_idx] - preds) / y1[test_idx])) * 100
    print(f"{name:22s} | Test R2: {r2:.4f} | MAE: {mae:.2f} kWh/day | MAPE: {mape:.2f}%")

print("\n--- Peak Energy (kwh) ---")
for name, model in [
    ('GradientBoosting', GradientBoostingRegressor(n_estimators=250, learning_rate=0.08, random_state=SEED)),
    ('RandomForest', RandomForestRegressor(n_estimators=250, random_state=SEED, n_jobs=-1)),
    ('HistGradientBoosting', HistGradientBoostingRegressor(max_iter=250, random_state=SEED))
]:
    model.fit(X_train, y2[train_idx])
    preds = model.predict(X_test)
    mae = mean_absolute_error(y2[test_idx], preds)
    r2 = r2_score(y2[test_idx], preds)
    mape = np.mean(np.abs((y2[test_idx] - preds) / y2[test_idx])) * 100
    print(f"{name:22s} | Test R2: {r2:.4f} | MAE: {mae:.2f} kWh | MAPE: {mape:.2f}%")
