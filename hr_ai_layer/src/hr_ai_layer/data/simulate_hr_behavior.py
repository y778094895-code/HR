import numpy as np
import pandas as pd
from sqlalchemy import create_engine
from datetime import datetime
from hr_ai_layer.config.settings import settings


SNAPSHOT_DATE = "2026-01-01"


def simulate():

    snapshot = pd.Timestamp(SNAPSHOT_DATE)
    engine = create_engine(settings.sqlalchemy_url)

    # ==============================
    # Load employees
    # ==============================
    employees = pd.read_sql(
        "SELECT employee_id, hire_date FROM employees",
        engine
    )

    employees["hire_date"] = pd.to_datetime(employees["hire_date"])
    employees["employee_id"] = employees["employee_id"].astype(str)

    # ==============================
    # Storage
    # ==============================
    exits = []
    attendance = []
    performance = []
    compensation = []
    promotions = []

    # ==============================
    # Realistic calibrated parameters
    # ==============================
    BASELINE_HAZARD = 0.00085 
    BETA_SALARY = 0.55
    BETA_PERFORMANCE = 0.85
    BETA_ABSENCE = 0.55
    BETA_PROMOTION = 0.70   

    np.random.seed(42)

    # ==============================
    # Simulation loop
    # ==============================
    for _, row in employees.iterrows():

        emp_id = row["employee_id"]
        hire_date = row["hire_date"]

        months = (snapshot.year - hire_date.year) * 12 + (
            snapshot.month - hire_date.month
        )

        if months <= 0:
            continue

        R = np.random.normal(0, 1)

        salary = np.random.normal(5000, 700)
        performance_score = np.clip(np.random.normal(3.5, 0.4), 1, 5)
        promoted = False

        exit_flag = 0
        exit_date = None

        for m in range(months):

            current_date = hire_date + pd.DateOffset(months=m)

            # Salary growth
            growth = 0.02 - 0.01 * max(R, 0)
            salary *= (1 + growth / 12)

            # Performance AR(1)
            performance_score = (
                0.7 * performance_score
                + 0.3 * np.random.normal(3.5 - 0.2 * max(R, 0), 0.25)
            )
            performance_score = np.clip(performance_score, 1, 5)

            # Absenteeism
            absence_lambda = 1 + max(R, 0) * 1.5
            absence_days = np.random.poisson(absence_lambda)

            # Promotion probability
            promotion_prob = max(0.015 - 0.005 * max(R, 0), 0.003)
            if np.random.rand() < promotion_prob:
                promoted = True
                salary *= 1.08
                promotions.append(
                    {
                        "employee_id": emp_id,
                        "promotion_date": current_date,
                    }
                )

            # Hazard computation
            stagnation = max(R, 0)
            perf_decline = max(3 - performance_score, 0)
            absence_risk = absence_days / 10
            promo_gap = 0 if promoted else 1

            hazard = BASELINE_HAZARD * np.exp(
                BETA_SALARY * stagnation
                + BETA_PERFORMANCE * perf_decline
                + BETA_ABSENCE * absence_risk
                + BETA_PROMOTION * promo_gap
            )

            prob_exit = 1 - np.exp(-hazard)

            if np.random.rand() < prob_exit:
                exit_flag = 1
                exit_date = current_date
                break

            # Save monthly behavior
            attendance.append(
                {
                    "employee_id": emp_id,
                    "record_date": current_date,
                    "absence_days": absence_days,
                }
            )

            performance.append(
                {
                    "employee_id": emp_id,
                    "record_date": current_date,
                    "performance_score": performance_score,
                }
            )

            compensation.append(
                {
                    "employee_id": emp_id,
                    "record_date": current_date,
                    "salary": salary,
                }
            )

        exits.append(
            {
                "employee_id": emp_id,
                "exit_date": exit_date,
                "event": exit_flag,
            }
        )

    # ==============================
    # Convert to DataFrames
    # ==============================
    exits_df = pd.DataFrame(exits)
    attendance_df = pd.DataFrame(attendance)
    performance_df = pd.DataFrame(performance)
    compensation_df = pd.DataFrame(compensation)
    promotions_df = pd.DataFrame(promotions)

    # ==============================
    # Save to NEW simulation tables
    # ==============================
    exits_df.to_sql(
        "sim_employee_exit_events",
        engine,
        if_exists="replace",
        index=False,
        chunksize=1000,
    )

    attendance_df.to_sql(
        "sim_attendance_behavior",
        engine,
        if_exists="replace",
        index=False,
        chunksize=1000,
    )

    performance_df.to_sql(
        "sim_performance_behavior",
        engine,
        if_exists="replace",
        index=False,
        chunksize=1000,
    )

    compensation_df.to_sql(
        "sim_compensation_behavior",
        engine,
        if_exists="replace",
        index=False,
        chunksize=1000,
    )

    promotions_df.to_sql(
        "sim_promotions",
        engine,
        if_exists="replace",
        index=False,
        chunksize=1000,
    )

    print("\n===== SIMULATION COMPLETE =====")
    print(f"Total Employees: {len(exits_df)}")
    print(f"Attrition Rate: {exits_df['event'].mean():.2f}")


if __name__ == "__main__":
    simulate()