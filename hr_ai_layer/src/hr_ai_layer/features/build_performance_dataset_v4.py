import numpy as np
import pandas as pd
from sqlalchemy import create_engine
from hr_ai_layer.config.settings import settings

np.random.seed(42)

TABLE_NAME = "sim_performance_panel_dataset_v4"

N_EMPLOYEES = 3000
N_MONTHS = 36


def build_dataset():

    rows = []

    for emp_id in range(1, N_EMPLOYEES + 1):

        skill = np.random.normal(3.0, 0.4)
        resilience = np.random.uniform(0.8, 1.2)

        burnout = np.random.uniform(0.2, 0.4)
        motivation = np.random.uniform(0.9, 1.1)

        regime = np.random.choice(["growth", "stable", "pressure"])

        for month in range(N_MONTHS):

            record_date = pd.Timestamp("2022-01-01") + pd.DateOffset(months=month)

            # ===== Regime Switching =====
            if np.random.rand() < 0.08:
                regime = np.random.choice(["growth", "stable", "pressure"])

            if regime == "growth":
                regime_factor = -0.15
            elif regime == "pressure":
                regime_factor = 0.25
            else:
                regime_factor = 0.05

            workload = np.random.normal(1.0 + regime_factor, 0.2)
            overtime = np.random.normal(10 + regime_factor * 8, 2)

            manager_support = np.random.uniform(0.7, 1.3)

            # ===== Burnout Mean-Reversion Dynamic =====
            burnout = (
                0.85 * burnout
                + 0.05 * overtime
                + 0.03 * workload
                - 0.04 * manager_support
                - 0.03 * resilience
                + np.random.normal(0, 0.05)
            )

            burnout = np.clip(burnout, 0, 2)

            # ===== Motivation =====
            motivation = (
                0.8 * motivation
                - 0.25 * burnout
                + 0.2 * manager_support
                + np.random.normal(0, 0.05)
            )

            motivation = np.clip(motivation, 0.5, 1.5)

            productivity = (
                skill * motivation
                - 0.7 * burnout
                + np.random.normal(0, 0.1)
            )

            quality = (
                skill
                - 0.4 * burnout
                + 0.3 * motivation
                + np.random.normal(0, 0.1)
            )

            collaboration = (
                3.0
                - 0.3 * burnout
                + 0.2 * manager_support
                + np.random.normal(0, 0.1)
            )

            overall_score = (
                0.5 * productivity
                + 0.3 * quality
                + 0.2 * collaboration
                + np.random.normal(0, 0.05)
            )

            rows.append([
                emp_id,
                record_date,
                workload,
                overtime,
                manager_support,
                burnout,
                motivation,
                productivity,
                quality,
                collaboration,
                overall_score
            ])

    df = pd.DataFrame(rows, columns=[
        "employee_id",
        "record_date",
        "workload",
        "overtime_hours_mean",
        "manager_support",
        "burnout_index_mean",
        "motivation_index",
        "kpi_productivity_mean",
        "kpi_quality_mean",
        "collaboration_score",
        "overall_score"
    ])

    engine = create_engine(settings.sqlalchemy_url)

    df.to_sql(TABLE_NAME, engine, if_exists="replace", index=False)

    print("Dataset rebuilt successfully")
    print("Rows:", len(df))


if __name__ == "__main__":
    build_dataset()