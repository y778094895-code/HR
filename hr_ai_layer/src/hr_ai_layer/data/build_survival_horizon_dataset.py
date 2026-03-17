# src/hr_ai_layer/data/build_survival_horizon_dataset.py

import pandas as pd
from sqlalchemy import create_engine
from hr_ai_layer.config.settings import settings

HORIZON_MONTHS = 6


def build():

    engine = create_engine(settings.sqlalchemy_url)

    print("Loading academic panel tables...")

    attendance = pd.read_sql(
        "SELECT * FROM sim_attendance_behavior",
        engine
    )

    performance = pd.read_sql(
        "SELECT * FROM sim_performance_behavior",
        engine
    )

    compensation = pd.read_sql(
        "SELECT * FROM sim_compensation_behavior",
        engine
    )

    exits = pd.read_sql(
        "SELECT * FROM sim_employee_exit_events",
        engine
    )

    # =========================================
    # Merge behavioral tables
    # =========================================
    df = (
        attendance
        .merge(performance, on=["employee_id", "record_date"], how="left")
        .merge(compensation, on=["employee_id", "record_date"], how="left")
    )

    # =========================================
    # Attach exit_date
    # =========================================
    exits = exits[["employee_id", "exit_date"]]
    df = df.merge(exits, on="employee_id", how="left")

    # =========================================
    # Convert dates
    # =========================================
    df["record_date"] = pd.to_datetime(df["record_date"])
    df["exit_date"] = pd.to_datetime(df["exit_date"])

    # =========================================
    # Survival Event (clean logic)
    # =========================================
    df["event"] = 0

    # لكل موظف: نحدد آخر سجل قبل أو عند الخروج
    last_record = df.groupby("employee_id")["record_date"].transform("max")

    df.loc[
        (df["exit_date"].notna()) &
        (df["record_date"] <= df["exit_date"]) &
        (df["record_date"] == last_record),
        "event"
    ] = 1

    # =========================================
    # 6 Month Horizon Event (robust)
    # =========================================
    df["event_6m"] = 0

    horizon_limit = df["record_date"] + pd.DateOffset(months=HORIZON_MONTHS)

    df.loc[
        (df["exit_date"].notna()) &
        (df["exit_date"] >= df["record_date"]) &
        (df["exit_date"] <= horizon_limit),
        "event_6m"
    ] = 1

    # =========================================
    # Save dataset
    # =========================================
    df.to_sql(
        "sim_survival_horizon_dataset",
        engine,
        index=False,
        if_exists="replace"
    )

    print("\n===== DATASET BUILT =====")
    print(f"Rows: {len(df)}")
    print(f"Employees: {df['employee_id'].nunique()}")
    print(f"Exit Rate: {df['event'].mean():.4f}")
    print(f"6M Positive Rate: {df['event_6m'].mean():.4f}")


if __name__ == "__main__":
    build()