"""
VastuCare ML — Evaluation Report Generator
Generates prediction-vs-actual plots, residual plots, feature importance charts,
and a comprehensive validation report markdown file.
"""

import os
import json
from pathlib import Path

import numpy as np
import pandas as pd
import matplotlib
matplotlib.use('Agg')  # Non-interactive backend
import matplotlib.pyplot as plt
import seaborn as sns

import sys
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

REPORTS_DIR = Path(__file__).resolve().parent / 'reports'
MODELS_DIR = Path(__file__).resolve().parent.parent / 'models'


def generate_prediction_plots(model_name, display_name):
    """Generate prediction vs actual scatter plot and residual plot."""
    pred_path = REPORTS_DIR / f'{model_name}_predictions.csv'
    if not pred_path.exists():
        print(f"  ⚠ No predictions file for {model_name}")
        return

    df = pd.read_csv(pred_path)

    # Find actual/predicted column pairs
    actual_cols = [c for c in df.columns if c.endswith('_actual')]
    pred_cols = [c for c in df.columns if c.endswith('_predicted')]

    if not actual_cols:
        actual_cols = ['actual']
        pred_cols = ['predicted']

    n_targets = len(actual_cols)
    fig, axes = plt.subplots(1, n_targets, figsize=(6 * n_targets, 5))
    if n_targets == 1:
        axes = [axes]

    for i, (act_col, pred_col) in enumerate(zip(actual_cols, pred_cols)):
        actual = df[act_col].values
        predicted = df[pred_col].values

        target_name = act_col.replace('_actual', '') if act_col != 'actual' else display_name

        # Scatter plot
        axes[i].scatter(actual, predicted, alpha=0.3, s=10, c='#14b8a6')
        min_val = min(actual.min(), predicted.min())
        max_val = max(actual.max(), predicted.max())
        axes[i].plot([min_val, max_val], [min_val, max_val], 'r--', alpha=0.7, label='Perfect Prediction')
        axes[i].set_xlabel('Actual', fontsize=10)
        axes[i].set_ylabel('Predicted', fontsize=10)
        axes[i].set_title(f'{target_name}', fontsize=11)
        axes[i].legend(fontsize=8)

        r2 = 1 - np.sum((actual - predicted) ** 2) / np.sum((actual - np.mean(actual)) ** 2)
        axes[i].text(0.05, 0.95, f'R² = {r2:.4f}', transform=axes[i].transAxes,
                     fontsize=9, verticalalignment='top',
                     bbox=dict(boxstyle='round', facecolor='wheat', alpha=0.5))

    plt.suptitle(f'{display_name} — Prediction vs Actual (Test Set)', fontsize=13, fontweight='bold')
    plt.tight_layout()
    plt.savefig(REPORTS_DIR / f'{model_name}_pred_vs_actual.png', dpi=150, bbox_inches='tight')
    plt.close()
    print(f"  ✓ Saved {model_name}_pred_vs_actual.png")

    # Residual plot
    fig, axes = plt.subplots(1, n_targets, figsize=(6 * n_targets, 4))
    if n_targets == 1:
        axes = [axes]

    for i, (act_col, pred_col) in enumerate(zip(actual_cols, pred_cols)):
        actual = df[act_col].values
        predicted = df[pred_col].values
        residuals = actual - predicted
        target_name = act_col.replace('_actual', '') if act_col != 'actual' else display_name

        axes[i].scatter(predicted, residuals, alpha=0.3, s=10, c='#f59e0b')
        axes[i].axhline(y=0, color='r', linestyle='--', alpha=0.7)
        axes[i].set_xlabel('Predicted', fontsize=10)
        axes[i].set_ylabel('Residual', fontsize=10)
        axes[i].set_title(f'{target_name}', fontsize=11)

    plt.suptitle(f'{display_name} — Residuals (Test Set)', fontsize=13, fontweight='bold')
    plt.tight_layout()
    plt.savefig(REPORTS_DIR / f'{model_name}_residuals.png', dpi=150, bbox_inches='tight')
    plt.close()
    print(f"  ✓ Saved {model_name}_residuals.png")


def generate_feature_importance_plot(model_name, display_name):
    """Generate feature importance bar chart from saved metadata."""
    meta_path = MODELS_DIR / f'{model_name}_model_meta.json'
    if not meta_path.exists():
        print(f"  ⚠ No metadata for {model_name}")
        return

    with open(meta_path) as f:
        meta = json.load(f)

    fi = meta.get('feature_importance', [])
    if not fi:
        print(f"  ⚠ No feature importance for {model_name}")
        return

    # Top 15
    fi = fi[:15]
    features = [item['feature'] for item in fi]
    importances = [item['importance'] for item in fi]

    fig, ax = plt.subplots(figsize=(8, 5))
    bars = ax.barh(range(len(features)), importances, color='#14b8a6', alpha=0.85)
    ax.set_yticks(range(len(features)))
    ax.set_yticklabels(features, fontsize=9)
    ax.set_xlabel('Importance', fontsize=10)
    ax.set_title(f'{display_name} — Feature Importance (Top 15)', fontsize=12, fontweight='bold')
    ax.invert_yaxis()

    # Add value labels
    for bar, val in zip(bars, importances):
        ax.text(bar.get_width() + 0.002, bar.get_y() + bar.get_height() / 2,
                f'{val:.3f}', va='center', fontsize=8)

    plt.tight_layout()
    plt.savefig(REPORTS_DIR / f'{model_name}_feature_importance.png', dpi=150, bbox_inches='tight')
    plt.close()
    print(f"  ✓ Saved {model_name}_feature_importance.png")


def generate_model_comparison_plot():
    """Generate a comparison bar chart for all models."""
    summary_path = REPORTS_DIR / 'training_summary.json'
    if not summary_path.exists():
        print("  ⚠ No training summary found")
        return

    with open(summary_path) as f:
        summary = json.load(f)

    models = summary.get('models', {})
    if not models:
        return

    names = []
    r2_scores = []
    mae_scores = []

    for model_name, result in models.items():
        names.append(model_name)
        r2_scores.append(result['test']['r2'])
        mae_scores.append(result['test']['mae'])

    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 5))

    # R² comparison
    colors = ['#14b8a6', '#f59e0b', '#3b82f6', '#ef4444']
    ax1.bar(names, r2_scores, color=colors[:len(names)], alpha=0.85)
    ax1.set_ylabel('Test R²', fontsize=10)
    ax1.set_title('Test R² by Model', fontsize=12, fontweight='bold')
    ax1.set_ylim(0, 1)
    for i, v in enumerate(r2_scores):
        ax1.text(i, v + 0.02, f'{v:.4f}', ha='center', fontsize=9, fontweight='bold')

    # MAE comparison
    ax2.bar(names, mae_scores, color=colors[:len(names)], alpha=0.85)
    ax2.set_ylabel('Test MAE', fontsize=10)
    ax2.set_title('Test MAE by Model', fontsize=12, fontweight='bold')
    for i, v in enumerate(mae_scores):
        ax2.text(i, v + max(mae_scores) * 0.02, f'{v:.2f}', ha='center', fontsize=9, fontweight='bold')

    plt.suptitle('VastuCare ML — Model Performance Comparison', fontsize=14, fontweight='bold')
    plt.tight_layout()
    plt.savefig(REPORTS_DIR / 'model_comparison.png', dpi=150, bbox_inches='tight')
    plt.close()
    print("  ✓ Saved model_comparison.png")


def generate_validation_report():
    """Generate comprehensive markdown validation report."""
    summary_path = REPORTS_DIR / 'training_summary.json'
    if not summary_path.exists():
        print("  ⚠ No training summary found")
        return

    with open(summary_path) as f:
        summary = json.load(f)

    dataset = summary['dataset']
    models = summary['models']

    lines = [
        "# VastuCare ML — Model Validation Report",
        "",
        f"Generated: {summary['generated_at']}",
        "",
        "## Dataset",
        f"- **Source:** Synthetic Engineering Simulation",
        f"- **Version:** {dataset['version']}",
        f"- **Total Samples:** {dataset['total_samples']:,}",
        f"- **Random Seed:** {dataset['seed']}",
        "",
    ]

    for model_name, result in models.items():
        meta_path = MODELS_DIR / f'{model_name}_model_meta.json'
        meta = {}
        if meta_path.exists():
            with open(meta_path) as f:
                meta = json.load(f)

        lines.append(f"## {meta.get('model_name', model_name).replace('_', ' ').title()} Model")
        lines.append(f"- **Best Model:** {result['best_model']}")
        lines.append(f"- **Training Samples:** {meta.get('training_samples', 'N/A'):,}")
        lines.append(f"- **Validation Samples:** {meta.get('validation_samples', 'N/A'):,}")
        lines.append(f"- **Test Samples:** {meta.get('test_samples', 'N/A'):,}")
        lines.append(f"- **5-Fold CV Mean R²:** {result['cv_mean_r2']:.4f} ± {result['cv_std_r2']:.4f}")
        lines.append(f"- **Test MAE:** {result['test']['mae']:.4f}")
        lines.append(f"- **Test RMSE:** {result['test']['rmse']:.4f}")
        lines.append(f"- **Test R²:** {result['test']['r2']:.4f}")
        lines.append(f"- **Test MAPE:** {result['test']['mape']:.2f}%")

        baseline = result['comparison'].get('LinearRegression', {}).get('validation', {})
        if baseline:
            lines.append(f"- **Baseline (Linear Regression) Val MAE:** {baseline.get('mae', 'N/A')}")
            lines.append(f"- **Baseline (Linear Regression) Val R²:** {baseline.get('r2', 'N/A')}")
            if baseline.get('mae') and result['test']['mae']:
                improvement = (1 - result['test']['mae'] / baseline['mae']) * 100
                lines.append(f"- **Improvement over baseline:** {improvement:.1f}%")

        lines.append("")

        # Model comparison table
        lines.append("### Candidate Model Comparison")
        lines.append("")
        lines.append("| Model | Val R² | Val MAE | Val RMSE | Train Time |")
        lines.append("|-------|--------|---------|----------|------------|")
        for cand_name, cand_result in result['comparison'].items():
            val = cand_result['validation']
            lines.append(
                f"| {cand_name} | {val['r2']:.4f} | {val['mae']:.4f} | "
                f"{val['rmse']:.4f} | {cand_result['training_time_seconds']:.1f}s |"
            )
        lines.append("")

        # Feature importance
        fi = meta.get('feature_importance', [])
        if fi:
            lines.append("### Feature Importance (Top 10)")
            lines.append("")
            lines.append("| Rank | Feature | Importance |")
            lines.append("|------|---------|------------|")
            for i, item in enumerate(fi[:10], 1):
                pct = item['importance'] * 100
                lines.append(f"| {i} | {item['feature']} | {pct:.1f}% |")
            lines.append("")

        lines.append("---")
        lines.append("")

    lines.append("## Limitations & Disclaimers")
    lines.append("")
    lines.append("> **IMPORTANT:** " + summary.get('data_leakage_note', ''))
    lines.append("")
    lines.append("- Model performance is validated against **synthetic simulation data only**.")
    lines.append("- These metrics demonstrate **prototype model capability** and must not be")
    lines.append("  interpreted as real-world clinical or architectural validation.")
    lines.append("- Climate assumptions are prototype estimates, not real meteorological data.")
    lines.append("- The model should be retrained with real hospital data when available.")
    lines.append("- Conceptual Design — Not for Construction.")

    report_path = REPORTS_DIR / 'validation_report.md'
    with open(report_path, 'w') as f:
        f.write('\n'.join(lines))
    print(f"  ✓ Saved validation_report.md")


def main():
    print("=" * 60)
    print("VASTUCARE ML — EVALUATION & REPORT GENERATION")
    print("=" * 60)

    REPORTS_DIR.mkdir(parents=True, exist_ok=True)

    model_configs = {
        'environmental': 'Environmental Performance',
        'energy': 'Energy Demand',
        'water': 'Water Demand',
        'layout_quality': 'Layout Quality'
    }

    for model_name, display_name in model_configs.items():
        print(f"\nGenerating reports for: {display_name}")
        generate_prediction_plots(model_name, display_name)
        generate_feature_importance_plot(model_name, display_name)

    print("\nGenerating comparison plots...")
    generate_model_comparison_plot()

    print("\nGenerating validation report...")
    generate_validation_report()

    print("\n✓ All evaluation reports generated.")


if __name__ == '__main__':
    main()
