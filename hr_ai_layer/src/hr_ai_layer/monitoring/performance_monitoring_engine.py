import os
import numpy as np
import pandas as pd
from sqlalchemy import create_engine, text
from hr_ai_layer.config.settings import settings

TABLE = "sim_performance_panel_dataset_v3"
DATE_COL = "record_date"
EMP_COL = "employee_id"

OUTPUT_TABLE = "performance_monitoring_layer"


def load_data():
    engine = create_engine(settings.sqlalchemy_url)
    df = pd.read_sql(text(f"SELECT * FROM {TABLE}"), engine)

    df[DATE_COL] = pd.to_datetime(df[DATE_COL])
    df = df.sort_values([EMP_COL, DATE_COL]).reset_index(drop=True)

    return df


def build_monitoring_layer():

    df = load_data()

    # ===== Momentum =====
    df["momentum_4"] = (
        df.groupby(EMP_COL)["overall_score"]
        .diff()
        .rolling(4)
        .mean()
    )

    # ===== Stability =====
    df["stability_4"] = (
        df.groupby(EMP_COL)["overall_score"]
        .rolling(4)
        .std()
        .reset_index(level=0, drop=True)
    )

    # ===== Volatility Risk =====
    df["volatility_risk"] = df["stability_4"] / (
        df.groupby(EMP_COL)["overall_score"].transform("mean") + 1e-6
    )

    # ===== Team Deviation =====
    df["team_mean"] = df.groupby(DATE_COL)["overall_score"].transform("mean")
    df["team_deviation"] = df["overall_score"] - df["team_mean"]

    # ===== Weak Signal =====
    df["weak_signal"] = (
        (df["momentum_4"] < -0.2) &
        (df["stability_4"] > df["stability_4"].median())
    ).astype(int)

    df = df.fillna(0)

    # حفظ في قاعدة البيانات
    engine = create_engine(settings.sqlalchemy_url)
    df.to_sql(OUTPUT_TABLE, engine, if_exists="replace", index=False)

    print("Monitoring layer built successfully.")
    print("Rows:", len(df))


if __name__ == "__main__":
    build_monitoring_layer()