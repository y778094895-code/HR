import os
import pandas as pd
import numpy as np
from sqlalchemy import create_engine, text
from hr_ai_layer.config.settings import settings

TABLE = "sim_performance_panel_dataset_v3"
MONITORING_TABLE = "performance_monitoring_layer"

DATE_COL = "record_date"
EMP_COL = "employee_id"

OUTPUT_TABLE = "performance_decision_engine"


def load_base_data():
    engine = create_engine(settings.sqlalchemy_url)
    df = pd.read_sql(text(f"SELECT * FROM {TABLE}"), engine)

    df[DATE_COL] = pd.to_datetime(df[DATE_COL])
    df = df.sort_values([EMP_COL, DATE_COL]).reset_index(drop=True)

    # نحسب decline_flag هنا مباشرة (بدون الاعتماد على جدول آخر)
    df["next_score"] = df.groupby(EMP_COL)["overall_score"].shift(-1)
    df = df.dropna(subset=["next_score"]).copy()

    df["decline_flag"] = (
        (df["next_score"] - df["overall_score"]) < -0.5
    ).astype(int)

    return df


def load_monitoring():
    engine = create_engine(settings.sqlalchemy_url)
    monitor_df = pd.read_sql(text(f"SELECT employee_id, record_date, weak_signal, stability_4 FROM {MONITORING_TABLE}"), engine)

    monitor_df["record_date"] = pd.to_datetime(monitor_df["record_date"])
    return monitor_df


def build_decision_layer():

    base_df = load_base_data()
    monitor_df = load_monitoring()

    df = base_df.merge(
        monitor_df,
        on=[EMP_COL, DATE_COL],
        how="left"
    )

    df = df.fillna(0)

    # =============================
    # Composite Risk Score
    # =============================
    df["risk_score"] = (
        df["decline_flag"] * 0.6 +
        df["weak_signal"] * 0.3 +
        (df["stability_4"] > df["stability_4"].median()).astype(int) * 0.1
    )

    # =============================
    # Administrative Risk Bands
    # =============================
    df["final_risk_band"] = "Low"
    df.loc[df["risk_score"] >= 0.4, "final_risk_band"] = "Moderate"
    df.loc[df["risk_score"] >= 0.7, "final_risk_band"] = "Critical"

    engine = create_engine(settings.sqlalchemy_url)
    df.to_sql(OUTPUT_TABLE, engine, if_exists="replace", index=False)

    print("Decision layer built successfully.")
    print("Rows:", len(df))
    print("\nRisk Band Distribution:")
    print(df["final_risk_band"].value_counts())


if __name__ == "__main__":
    build_decision_layer()