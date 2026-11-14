# VastuCare ML — Model Validation Report

Generated: 2026-08-12T14:24:41.928915+00:00

## Dataset
- **Source:** Synthetic Engineering Simulation
- **Version:** v1
- **Total Samples:** 11,566
- **Random Seed:** 42

## Environmental Model
- **Best Model:** HistGradientBoosting
- **Training Samples:** 8,096
- **Validation Samples:** 1,735
- **Test Samples:** 1,735
- **5-Fold CV Mean R²:** 0.9784 ± 0.0004
- **Test MAE:** 1.2222
- **Test RMSE:** 1.4955
- **Test R²:** 0.9799
- **Test MAPE:** 1.75%
- **Baseline (Linear Regression) Val MAE:** 2.735
- **Baseline (Linear Regression) Val R²:** 0.8861
- **Improvement over baseline:** 55.3%

### Candidate Model Comparison

| Model | Val R² | Val MAE | Val RMSE | Train Time |
|-------|--------|---------|----------|------------|
| LinearRegression | 0.8861 | 2.7350 | 3.6170 | 0.0s |
| RandomForest | 0.9712 | 1.3630 | 1.6886 | 30.0s |
| GradientBoosting | 0.9756 | 1.2861 | 1.5648 | 47.1s |
| ExtraTrees | 0.9676 | 1.4452 | 1.8286 | 19.9s |
| HistGradientBoosting | 0.9789 | 1.2315 | 1.5182 | 11.0s |

### Feature Importance (Top 10)

| Rank | Feature | Importance |
|------|---------|------------|
| 1 | has_courtyard | 26.0% |
| 2 | has_rainwater | 18.5% |
| 3 | rainfall_mm_assumption | 12.1% |
| 4 | avg_temp_assumption | 8.2% |
| 5 | has_solar | 7.3% |
| 6 | solar_area_sqm | 6.3% |
| 7 | avg_window_ratio | 5.8% |
| 8 | bed_capacity | 4.3% |
| 9 | has_green_roof | 2.6% |
| 10 | north_angle | 2.3% |

---

## Energy Model
- **Best Model:** HistGradientBoosting
- **Training Samples:** 8,096
- **Validation Samples:** 1,735
- **Test Samples:** 1,735
- **5-Fold CV Mean R²:** 0.9636 ± 0.0009
- **Test MAE:** 98.0419
- **Test RMSE:** 183.0174
- **Test R²:** 0.9658
- **Test MAPE:** 20.78%
- **Baseline (Linear Regression) Val MAE:** 282.3022
- **Baseline (Linear Regression) Val R²:** 0.8411
- **Improvement over baseline:** 65.3%

### Candidate Model Comparison

| Model | Val R² | Val MAE | Val RMSE | Train Time |
|-------|--------|---------|----------|------------|
| LinearRegression | 0.8411 | 282.3022 | 492.2381 | 0.0s |
| RandomForest | 0.9311 | 151.0682 | 294.7856 | 9.7s |
| GradientBoosting | 0.9518 | 127.8101 | 233.1374 | 12.5s |
| ExtraTrees | 0.9299 | 150.8162 | 292.7705 | 4.9s |
| HistGradientBoosting | 0.9641 | 97.0114 | 179.9779 | 2.1s |

### Feature Importance (Top 10)

| Rank | Feature | Importance |
|------|---------|------------|
| 1 | bed_capacity | 50.6% |
| 2 | occupancy_percent | 16.9% |
| 3 | built_area_sqm | 10.0% |
| 4 | solar_area_sqm | 7.6% |
| 5 | has_lab | 6.4% |
| 6 | has_solar | 3.6% |
| 7 | avg_temp_assumption | 3.3% |
| 8 | floors | 1.0% |
| 9 | ward_area_sqm | 0.5% |
| 10 | icu_area_sqm | 0.0% |

---

## Water Model
- **Best Model:** HistGradientBoosting
- **Training Samples:** 8,096
- **Validation Samples:** 1,735
- **Test Samples:** 1,735
- **5-Fold CV Mean R²:** 0.9976 ± 0.0003
- **Test MAE:** 854.7006
- **Test RMSE:** 1611.5045
- **Test R²:** 0.9980
- **Test MAPE:** 3.23%
- **Baseline (Linear Regression) Val MAE:** 7437.2275
- **Baseline (Linear Regression) Val R²:** 0.7889
- **Improvement over baseline:** 88.5%

### Candidate Model Comparison

| Model | Val R² | Val MAE | Val RMSE | Train Time |
|-------|--------|---------|----------|------------|
| LinearRegression | 0.7889 | 7437.2275 | 10773.5079 | 0.0s |
| RandomForest | 0.9973 | 956.1535 | 1980.9472 | 5.8s |
| GradientBoosting | 0.9965 | 1021.6717 | 1623.6391 | 8.8s |
| ExtraTrees | 0.9963 | 1291.7668 | 2721.7240 | 3.4s |
| HistGradientBoosting | 0.9980 | 798.3514 | 1499.8194 | 2.3s |

### Feature Importance (Top 10)

| Rank | Feature | Importance |
|------|---------|------------|
| 1 | bed_capacity | 37.8% |
| 2 | has_rainwater | 21.9% |
| 3 | rainfall_mm_assumption | 20.5% |
| 4 | roof_area_sqm | 14.3% |
| 5 | occupancy_percent | 5.5% |
| 6 | dept_count | 0.1% |
| 7 | opd_area_sqm | 0.0% |
| 8 | built_area_sqm | 0.0% |
| 9 | ward_area_sqm | 0.0% |
| 10 | has_cafeteria | 0.0% |

---

## Layout Quality Model
- **Best Model:** HistGradientBoosting
- **Training Samples:** 8,096
- **Validation Samples:** 1,735
- **Test Samples:** 1,735
- **5-Fold CV Mean R²:** 0.9924 ± 0.0003
- **Test MAE:** 0.4405
- **Test RMSE:** 0.5549
- **Test R²:** 0.9928
- **Test MAPE:** 0.63%
- **Baseline (Linear Regression) Val MAE:** 0.7237
- **Baseline (Linear Regression) Val R²:** 0.9816
- **Improvement over baseline:** 39.1%

### Candidate Model Comparison

| Model | Val R² | Val MAE | Val RMSE | Train Time |
|-------|--------|---------|----------|------------|
| LinearRegression | 0.9816 | 0.7237 | 0.8965 | 0.0s |
| RandomForest | 0.9698 | 0.9134 | 1.1487 | 6.4s |
| GradientBoosting | 0.9928 | 0.4492 | 0.5611 | 9.3s |
| ExtraTrees | 0.9716 | 0.8931 | 1.1134 | 3.7s |
| HistGradientBoosting | 0.9929 | 0.4476 | 0.5556 | 2.6s |

### Feature Importance (Top 10)

| Rank | Feature | Importance |
|------|---------|------------|
| 1 | adjacency_score | 26.8% |
| 2 | has_courtyard | 25.0% |
| 3 | ventilation_potential | 11.9% |
| 4 | solar_potential | 10.9% |
| 5 | green_coverage_score | 9.8% |
| 6 | daylight_potential | 7.4% |
| 7 | north_angle | 7.3% |
| 8 | avg_window_ratio | 0.8% |
| 9 | courtyard_area_sqm | 0.0% |
| 10 | site_area_sqm | 0.0% |

---

## Limitations & Disclaimers

> **IMPORTANT:** Targets are generated by deterministic formulas from the same inputs. The ML model is learning the simulator's relationships, NOT independently validated against real hospital data. High R² values reflect accurate learning of the simulator.

- Model performance is validated against **synthetic simulation data only**.
- These metrics demonstrate **prototype model capability** and must not be
  interpreted as real-world clinical or architectural validation.
- Climate assumptions are prototype estimates, not real meteorological data.
- The model should be retrained with real hospital data when available.
- Conceptual Design — Not for Construction.