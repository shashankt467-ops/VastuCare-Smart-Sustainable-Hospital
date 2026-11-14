import os
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder
import joblib

def load_data():
    csv_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "synthetic", "hospital_designs_v1.csv")
    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"Dataset not found at {csv_path}")
    df = pd.read_csv(csv_path)
    return df

def _split_scale_save(df, input_cols, target_cols, model_name):
    print(f"\n--- Processing {model_name} ---")
    
    # Check if all columns exist
    missing_cols = [c for c in input_cols + target_cols if c not in df.columns and c != 'climate_zone']
    if missing_cols:
        print(f"Warning: Missing columns in dataset: {missing_cols}")
        
    # Handle one-hot encoding for climate_zone if it exists and is requested
    df_processed = df.copy()
    if 'climate_zone' in input_cols and 'climate_zone' in df.columns:
        dummies = pd.get_dummies(df['climate_zone'], prefix='climate')
        df_processed = pd.concat([df_processed, dummies], axis=1)
        input_cols = [c for c in input_cols if c != 'climate_zone'] + list(dummies.columns)

    # Filter columns that actually exist
    input_cols_exist = [c for c in input_cols if c in df_processed.columns]
    target_cols_exist = [c for c in target_cols if c in df_processed.columns]

    if not input_cols_exist or not target_cols_exist:
         print(f"Skipping {model_name}: required columns not present.")
         return None
         
    X = df_processed[input_cols_exist]
    y = df_processed[target_cols_exist]
    
    # Correlation check (leakage warning)
    for t_col in target_cols_exist:
        for i_col in input_cols_exist:
            if X[i_col].dtype in [np.float64, np.int64] and y[t_col].dtype in [np.float64, np.int64]:
                corr = np.abs(np.corrcoef(X[i_col], y[t_col])[0, 1])
                if corr > 0.95:
                    print(f"LEAKAGE WARNING: {i_col} correlates {corr:.2f} with {t_col}!")
    
    # 70/15/15 split
    X_train_val, X_test, y_train_val, y_test = train_test_split(X, y, test_size=0.15, random_state=42)
    X_train, X_val, y_train, y_val = train_test_split(X_train_val, y_train_val, test_size=0.15/0.85, random_state=42)
    
    # Scaling
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_val_scaled = scaler.transform(X_val)
    X_test_scaled = scaler.transform(X_test)
    
    # Convert back to DataFrame to preserve column names (optional but good practice)
    X_train_scaled = pd.DataFrame(X_train_scaled, columns=X_train.columns, index=X_train.index)
    X_val_scaled = pd.DataFrame(X_val_scaled, columns=X_val.columns, index=X_val.index)
    X_test_scaled = pd.DataFrame(X_test_scaled, columns=X_test.columns, index=X_test.index)

    # Save scaler
    scaler_dir = os.path.join(os.path.dirname(__file__), "scalers")
    os.makedirs(scaler_dir, exist_ok=True)
    scaler_path = os.path.join(scaler_dir, f"{model_name.replace(' ', '_').lower()}_scaler.pkl")
    joblib.dump(scaler, scaler_path)
    print(f"Saved scaler to {scaler_path}")
    
    print(f"Feature counts: {len(input_cols_exist)}")
    print(f"Target counts: {len(target_cols_exist)}")
    print(f"Train size: {len(X_train)}, Val size: {len(X_val)}, Test size: {len(X_test)}")
    
    return X_train_scaled, X_val_scaled, X_test_scaled, y_train, y_val, y_test


def get_model_a_data(df):
    input_cols = ['site_length_m', 'site_width_m', 'site_area_sqm', 'north_angle', 'latitude', 'longitude', 
                  'floors', 'bed_capacity', 'dept_count', 'has_solar', 'has_rainwater', 'has_courtyard', 
                  'has_green_roof', 'built_area_sqm', 'open_space_percent', 'courtyard_area_sqm', 
                  'green_area_sqm', 'solar_area_sqm', 'roof_area_sqm', 'avg_window_ratio', 'occupancy_percent', 
                  'rainfall_mm_assumption', 'avg_temp_assumption', 'climate_zone']
    target_cols = ['solar_potential', 'daylight_potential', 'ventilation_potential', 'rainwater_potential', 'sustainability_score']
    
    return _split_scale_save(df, input_cols, target_cols, "Model A")


def get_model_c_data(df):
    input_cols = ['bed_capacity', 'built_area_sqm', 'occupancy_percent', 'floors', 'icu_area_sqm', 
                  'ot_area_sqm', 'emergency_area_sqm', 'opd_area_sqm', 'ward_area_sqm', 'has_lab', 
                  'has_solar', 'solar_area_sqm', 'avg_temp_assumption', 'dept_count', 'avg_window_ratio', 
                  'daylight_potential', 'climate_zone']
    target_cols = ['energy_demand_kwh_day', 'peak_energy_kwh']
    
    return _split_scale_save(df, input_cols, target_cols, "Model C")


def get_model_d_data(df):
    input_cols = ['bed_capacity', 'occupancy_percent', 'built_area_sqm', 'ward_area_sqm', 'opd_area_sqm', 
                  'has_cafeteria', 'dept_count', 'rainfall_mm_assumption', 'roof_area_sqm', 'has_rainwater', 
                  'floors', 'climate_zone']
    target_cols = ['water_demand_liters_day', 'rainwater_harvest_liters_day']
    
    return _split_scale_save(df, input_cols, target_cols, "Model D")


def get_model_b_data(df):
    input_cols = ['site_area_sqm', 'built_area_sqm', 'open_space_percent', 'floors', 'bed_capacity', 
                  'dept_count', 'has_emergency', 'has_icu', 'has_ot', 'has_opd', 'has_pharmacy', 
                  'has_courtyard', 'courtyard_area_sqm', 'north_angle', 'avg_window_ratio', 'adjacency_score', 
                  'solar_potential', 'daylight_potential', 'ventilation_potential', 'green_coverage_score', 'climate_zone']
    target_cols = ['layout_quality_score']
    
    return _split_scale_save(df, input_cols, target_cols, "Model B")


if __name__ == "__main__":
    try:
        df = load_data()
        
        # Convert bools to int if needed as requested
        bool_cols = [c for c in df.columns if df[c].dtype == bool]
        for c in bool_cols:
             df[c] = df[c].astype(int)

        get_model_a_data(df)
        get_model_c_data(df)
        get_model_d_data(df)
        get_model_b_data(df)
        print("\nFeature engineering setup complete.")
    except Exception as e:
        print(f"Error during feature engineering setup: {e}")
