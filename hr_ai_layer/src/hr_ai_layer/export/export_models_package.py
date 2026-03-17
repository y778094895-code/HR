import os
import json
import shutil
import pandas as pd
from joblib import load
from sqlalchemy import create_engine, text
from hr_ai_layer.config.settings import settings

EXPORT_DIR = "artifacts/export_package"
PERFORMANCE_MODEL_PATH = "artifacts/models/performance_risk_engine_v5.joblib"
PERFORMANCE_META_PATH = "artifacts/models/performance_risk_engine_v5.meta.json"

DATA_TABLE = "sim_performance_panel_dataset_v4"
DATE_COL = "record_date"
EMP_COL = "employee_id"


# =============================
# FEATURE ENGINEERING (مطابق للتدريب)
# =============================
def build_features(df):

    for col in [
        "kpi_productivity_mean",
        "kpi_quality_mean",
        "burnout_index_mean",
        "motivation_index",
        "overtime_hours_mean",
        "workload",
    ]:
        df[f"{col}_lag1"] = df.groupby(EMP_COL)[col].shift(1)

        df[f"{col}_trend3"] = (
            df.groupby(EMP_COL)[col]
            .rolling(3)
            .mean()
            .reset_index(level=0, drop=True)
        )

        df[f"{col}_vol3"] = (
            df.groupby(EMP_COL)[col]
            .rolling(3)
            .std()
            .reset_index(level=0, drop=True)
        )

    df = df.fillna(0)

    blacklist = {
        "overall_score",
        DATE_COL,
        EMP_COL,
    }

    features = [c for c in df.columns if c not in blacklist]

    return df, features


# =============================
# EXPORT PIPELINE
# =============================

def main():

    os.makedirs(EXPORT_DIR, exist_ok=True)

    print("Loading model...")
    model = load(PERFORMANCE_MODEL_PATH)

    print("Loading data...")
    engine = create_engine(settings.sqlalchemy_url)
    df = pd.read_sql(text(f"SELECT * FROM {DATA_TABLE}"), engine)
    df[DATE_COL] = pd.to_datetime(df[DATE_COL])
    df = df.sort_values([EMP_COL, DATE_COL]).reset_index(drop=True)

    print("Building features...")
    df, features = build_features(df)

    X = df[features]

    print("Generating predictions...")
    probs = model.predict_proba(X)[:, 1]

    output = df[[EMP_COL, DATE_COL]].copy()
    output["performance_risk_probability"] = probs

    output.to_csv(os.path.join(EXPORT_DIR, "performance_predictions.csv"), index=False)

    shutil.copy(PERFORMANCE_MODEL_PATH, EXPORT_DIR)
    shutil.copy(PERFORMANCE_META_PATH, EXPORT_DIR)

    print("\nExport completed successfully.")
    print("Location:", EXPORT_DIR)


if __name__ == "__main__":
    main()