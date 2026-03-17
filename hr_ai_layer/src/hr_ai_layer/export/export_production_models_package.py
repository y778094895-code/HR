import os
import json
import shutil
import pandas as pd
from joblib import load
from sqlalchemy import create_engine, text
from hr_ai_layer.config.settings import settings

# =====================================
# CONFIG
# =====================================

EXPORT_DIR = "artifacts/export_package_production"
MODEL_DIR = "artifacts/models"

PERFORMANCE_MODEL_PATH = os.path.join(MODEL_DIR, "performance_risk_engine_v5.joblib")
PERFORMANCE_META_PATH = os.path.join(MODEL_DIR, "performance_risk_engine_v5.meta.json")

ATTRITION_MODEL_PATH = os.path.join(MODEL_DIR, "attrition_rf_v1.joblib")

PERFORMANCE_TABLE = "sim_performance_panel_dataset_v4"
ATTRITION_TABLE = "sim_survival_horizon_dataset"

SAMPLE_SIZE = 5000


# =====================================
# CORE UTILS
# =====================================

def ensure_dirs():
    os.makedirs(EXPORT_DIR, exist_ok=True)
    os.makedirs(os.path.join(EXPORT_DIR, "models"), exist_ok=True)
    os.makedirs(os.path.join(EXPORT_DIR, "data"), exist_ok=True)
    os.makedirs(os.path.join(EXPORT_DIR, "reports"), exist_ok=True)


def copy_models():
    print("Copying model files...")

    shutil.copy(PERFORMANCE_MODEL_PATH,
                os.path.join(EXPORT_DIR, "models", "performance_risk_engine_v5.joblib"))

    shutil.copy(PERFORMANCE_META_PATH,
                os.path.join(EXPORT_DIR, "models", "performance_risk_engine_v5.meta.json"))

    shutil.copy(ATTRITION_MODEL_PATH,
                os.path.join(EXPORT_DIR, "models", "attrition_rf_v1.joblib"))


def export_feature_report():
    print("Exporting feature metadata...")

    perf_model = load(PERFORMANCE_MODEL_PATH)
    attr_model = load(ATTRITION_MODEL_PATH)

    report = {
        "performance_model": {
            "type": str(type(perf_model)),
            "n_features": len(perf_model.feature_names_in_),
            "features": list(perf_model.feature_names_in_)
        },
        "attrition_model": {
            "type": str(type(attr_model)),
            "n_features": len(attr_model.feature_names_in_),
            "features": list(attr_model.feature_names_in_)
        }
    }

    with open(os.path.join(EXPORT_DIR, "reports", "model_feature_report.json"), "w") as f:
        json.dump(report, f, indent=4)


def load_sample(table):
    engine = create_engine(settings.sqlalchemy_url)
    df = pd.read_sql(text(f"SELECT * FROM {table}"), engine)
    return df.sample(min(SAMPLE_SIZE, len(df)), random_state=42)


# =====================================
# PERFORMANCE ENGINE EXPORT
# =====================================

def export_performance_predictions():
    print("Generating performance predictions...")

    model = load(PERFORMANCE_MODEL_PATH)
    df = load_sample(PERFORMANCE_TABLE)

    df = df.sort_values(["employee_id", "record_date"])

    numeric_cols = [
        "kpi_productivity_mean",
        "kpi_quality_mean",
        "burnout_index_mean",
        "motivation_index",
        "overtime_hours_mean",
        "workload",
    ]

    for col in numeric_cols:
        df[f"{col}_lag1"] = df.groupby("employee_id")[col].shift(1)
        df[f"{col}_trend3"] = (
            df.groupby("employee_id")[col]
            .transform(lambda x: x.rolling(3, min_periods=1).mean())
        )
        df[f"{col}_vol3"] = (
            df.groupby("employee_id")[col]
            .transform(lambda x: x.rolling(3, min_periods=1).std())
        )

    df = df.fillna(0)

    X = df[model.feature_names_in_]
    probs = model.predict_proba(X)[:, 1]

    df["performance_risk_prob"] = probs

    df.to_csv(
        os.path.join(EXPORT_DIR, "data", "performance_predictions.csv"),
        index=False
    )


# =====================================
# ATTRITION ENGINE EXPORT
# =====================================

def export_attrition_predictions():
    print("Generating attrition predictions...")

    model = load(ATTRITION_MODEL_PATH)
    df = load_sample(ATTRITION_TABLE)

    df = df.sort_values(["employee_id", "record_date"])
    numeric_cols = [
        "overtime_risk_index",
        "performance_rating",
        "financial_stress_index",
        "salary",
    ]

    for col in numeric_cols:
        df[f"{col}_roll3_mean"] = (
            df.groupby("employee_id")[col]
            .transform(lambda x: x.rolling(3, min_periods=1).mean())
        )
        df[f"{col}_delta1"] = df.groupby("employee_id")[col].diff()

    df = df.fillna(0)

    X = df[model.feature_names_in_]
    probs = model.predict_proba(X)[:, 1]

    df["attrition_risk_prob"] = probs

    df.to_csv(
        os.path.join(EXPORT_DIR, "data", "attrition_predictions.csv"),
        index=False
    )


# =====================================
# MAIN
# =====================================

def main():
    print("\n===== BUILDING FINAL PRODUCTION PACKAGE =====\n")

    ensure_dirs()
    copy_models()
    export_feature_report()
    export_performance_predictions()
    export_attrition_predictions()

    print("\n✅ EXPORT COMPLETED SUCCESSFULLY")
    print("Location:", EXPORT_DIR)


if __name__ == "__main__":
    main()