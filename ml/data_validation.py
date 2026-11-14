import os
import json
import pandas as pd
import numpy as np
import sys

def main():
    csv_path = os.path.join(os.path.dirname(__file__), "data", "synthetic", "hospital_designs_v1.csv")
    report_path = os.path.join(os.path.dirname(__file__), "data", "validation_report.json")
    
    # Ensure directories exist
    os.makedirs(os.path.dirname(report_path), exist_ok=True)
    
    if not os.path.exists(csv_path):
        print(f"Dataset not found at {csv_path}")
        sys.exit(1)
        
    df = pd.read_csv(csv_path)
    total_rows = len(df)
    
    report = {
        "total_rows": total_rows,
        "missing_values": {},
        "invalid_rows": 0,
        "valid_rows": 0,
        "duplicates": 0,
        "outlier_flags": {}
    }
    
    # 2. Check for missing values
    missing = df.isnull().sum()
    report["missing_values"] = missing[missing > 0].to_dict()
    
    # 3. Check for invalid values
    invalid_mask = pd.Series(False, index=df.index)
    
    # No negative areas (columns containing 'area')
    area_cols = [col for col in df.columns if 'area' in col]
    for col in area_cols:
        invalid_mask |= (df[col] < 0)
        
    # Scores in range [0, 100] (columns containing 'score' or 'potential')
    score_cols = [col for col in df.columns if 'score' in col or 'potential' in col]
    for col in score_cols:
        invalid_mask |= (df[col] < 0) | (df[col] > 100)
        
    # Specific constraints
    if 'site_area' in df.columns: invalid_mask |= (df['site_area'] <= 0)
    if 'site_area_sqm' in df.columns: invalid_mask |= (df['site_area_sqm'] <= 0)
    if 'bed_capacity' in df.columns: invalid_mask |= (df['bed_capacity'] <= 0)
    if 'floors' in df.columns: invalid_mask |= (df['floors'] < 1) | (df['floors'] > 10)
    if 'occupancy_percent' in df.columns: invalid_mask |= (df['occupancy_percent'] < 0) | (df['occupancy_percent'] > 100)
    if 'energy_demand_kwh_day' in df.columns: invalid_mask |= (df['energy_demand_kwh_day'] <= 0)
    if 'water_demand_liters_day' in df.columns: invalid_mask |= (df['water_demand_liters_day'] <= 0)
    
    report["invalid_rows"] = int(invalid_mask.sum())
    report["valid_rows"] = total_rows - report["invalid_rows"]
    
    # 4. Check for duplicates
    report["duplicates"] = int(df.duplicated().sum())
    
    # 5. Check for outliers using IQR method (numeric columns only)
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    for col in numeric_cols:
        Q1 = df[col].quantile(0.25)
        Q3 = df[col].quantile(0.75)
        IQR = Q3 - Q1
        outlier_mask = (df[col] < (Q1 - 1.5 * IQR)) | (df[col] > (Q3 + 1.5 * IQR))
        num_outliers = int(outlier_mask.sum())
        if num_outliers > 0:
            report["outlier_flags"][col] = num_outliers
            
    # Save report
    with open(report_path, "w") as f:
        json.dump(report, f, indent=4)
        
    print(f"Validation Report Saved to {report_path}")
    print(f"Total Rows: {report['total_rows']}")
    print(f"Valid Rows: {report['valid_rows']}")
    print(f"Invalid Rows: {report['invalid_rows']}")
    print(f"Duplicates: {report['duplicates']}")
    
    if report["valid_rows"] >= 10000:
        print("Dataset is valid (>= 10000 valid samples).")
        sys.exit(0)
    else:
        print("Dataset is invalid (< 10000 valid samples).")
        sys.exit(1)

if __name__ == "__main__":
    main()
