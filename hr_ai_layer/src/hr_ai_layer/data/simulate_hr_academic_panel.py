import numpy as np
import pandas as pd
from sqlalchemy import create_engine, text
from hr_ai_layer.config.settings import settings

# ==========================================
# CONFIGURATION
# ==========================================

N_EMPLOYEES = 5000
PANEL_MONTHS = 12
BASE_SNAPSHOT = pd.Timestamp("2026-01-01")

np.random.seed(42)


def simulate():

    engine = create_engine(settings.sqlalchemy_url)

    print("Simulating realistic competitive academic environment...")

    attendance_records = []
    performance_records = []
    compensation_records = []
    exit_records = []

    for i in range(N_EMPLOYEES):

        employee_id = f"EMP_{i}"

        years_since_last_promotion = np.random.randint(0, 6)

        performance_rating = np.clip(
            np.random.normal(3.5, 0.6), 1, 5
        )

        salary = np.random.normal(6000, 1000)

        exit_flag = 0
        exit_date = None

        for m in range(PANEL_MONTHS):

            record_date = BASE_SNAPSHOT - pd.DateOffset(
                months=PANEL_MONTHS - m
            )

            overtime_risk_index = np.clip(
                np.random.normal(0.3, 0.15), 0, 1
            )

            financial_stress_index = np.clip(
                np.random.normal(0.4, 0.2), 0, 1
            )

            # ===============================
            # CALIBRATED REALISTIC HAZARD
            # ===============================

            base_hazard = 0.002  # baseline منخفض جدًا

            performance_effect = 0
            if performance_rating < 2.8:
                performance_effect = 0.012
            elif performance_rating < 3.2:
                performance_effect = 0.006
            elif performance_rating > 4.5:
                performance_effect = -0.003

            stagnation_effect = 0
            if years_since_last_promotion >= 4:
                stagnation_effect = 0.012
            elif years_since_last_promotion >= 2:
                stagnation_effect = 0.005

            financial_effect = 0.008 * financial_stress_index
            overtime_effect = 0.008 * overtime_risk_index

            interaction_effect = 0
            if performance_rating < 3 and years_since_last_promotion >= 4:
                interaction_effect = 0.015

            random_noise = np.random.normal(0, 0.002)

            monthly_hazard = (
                base_hazard
                + performance_effect
                + stagnation_effect
                + financial_effect
                + overtime_effect
                + interaction_effect
                + random_noise
            )

            monthly_hazard = max(0.0005, min(monthly_hazard, 0.08))

            if np.random.rand() < monthly_hazard:
                exit_flag = 1
                exit_date = record_date
                break

            attendance_records.append(
                {
                    "employee_id": employee_id,
                    "record_date": record_date,
                    "overtime_risk_index": overtime_risk_index,
                }
            )

            performance_records.append(
                {
                    "employee_id": employee_id,
                    "record_date": record_date,
                    "performance_rating": performance_rating,
                }
            )

            compensation_records.append(
                {
                    "employee_id": employee_id,
                    "record_date": record_date,
                    "salary": salary,
                    "financial_stress_index": financial_stress_index,
                    "years_since_last_promotion": years_since_last_promotion,
                }
            )

        exit_records.append(
            {
                "employee_id": employee_id,
                "exit_date": exit_date,
                "event": exit_flag,
            }
        )

    # ==========================================
    # SAVE
    # ==========================================

    attendance_df = pd.DataFrame(attendance_records)
    performance_df = pd.DataFrame(performance_records)
    compensation_df = pd.DataFrame(compensation_records)
    exits_df = pd.DataFrame(exit_records)

    with engine.connect() as conn:
        conn.execute(text("DROP TABLE IF EXISTS sim_attendance_behavior"))
        conn.execute(text("DROP TABLE IF EXISTS sim_performance_behavior"))
        conn.execute(text("DROP TABLE IF EXISTS sim_compensation_behavior"))
        conn.execute(text("DROP TABLE IF EXISTS sim_employee_exit_events"))
        conn.commit()

    attendance_df.to_sql("sim_attendance_behavior", engine, index=False, if_exists="replace")
    performance_df.to_sql("sim_performance_behavior", engine, index=False, if_exists="replace")
    compensation_df.to_sql("sim_compensation_behavior", engine, index=False, if_exists="replace")
    exits_df.to_sql("sim_employee_exit_events", engine, index=False, if_exists="replace")

    print("\n===== SIMULATION COMPLETE =====")
    print(f"Employees: {N_EMPLOYEES}")
    print(f"Attrition Rate: {exits_df['event'].mean():.4f}")


if __name__ == "__main__":
    simulate()