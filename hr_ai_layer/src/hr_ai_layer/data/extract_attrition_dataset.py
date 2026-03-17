import sys
import hashlib
from datetime import datetime
from pathlib import Path

import pandas as pd
from sqlalchemy import create_engine

from hr_ai_layer.config.settings import settings


OUTPUT_DIR = Path("artifacts/datasets")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


def dataset_hash(df: pd.DataFrame) -> str:
    return hashlib.sha256(
        pd.util.hash_pandas_object(df, index=True).values
    ).hexdigest()


def main(snapshot_date: str):

    # -------------------------------
    # 1️⃣ Setup
    # -------------------------------
    snapshot = datetime.strptime(snapshot_date, "%Y-%m-%d")
    snapshot_ts = pd.Timestamp(snapshot)

    engine = create_engine(settings.sqlalchemy_url)

    # -------------------------------
    # 2️⃣ Extract base tables
    # -------------------------------
    with engine.connect() as conn:

        employees = pd.read_sql(
            """
            SELECT employee_id,
                   birth_date,
                   hire_date,
                   department_id,
                   position_id
            FROM employees
            """,
            conn,
        )

        exits = pd.read_sql(
            """
            SELECT employee_id, exit_date
            FROM employee_exit_events
            WHERE voluntary = TRUE
            """,
            conn,
        )

    # -------------------------------
    # 3️⃣ Merge exit info
    # -------------------------------
    df = employees.merge(exits, on="employee_id", how="left")

    # -------------------------------
    # 4️⃣ Target (event)
    # -------------------------------
    df["event"] = df["exit_date"].notna().astype(int)

    # -------------------------------
    # 5️⃣ Duration (Survival time)
    # -------------------------------

    hire_ts = pd.to_datetime(df["hire_date"], errors="coerce")
    exit_ts = pd.to_datetime(df["exit_date"], errors="coerce")

    # إذا خرج الموظف → نستخدم exit_date
    # إذا لم يخرج → نستخدم snapshot
    event_date = exit_ts.fillna(snapshot_ts)

    df["duration_days"] = (event_date - hire_ts).dt.days

    # إزالة القيم غير المنطقية
    df = df[df["duration_days"].notna()]
    df = df[df["duration_days"] >= 0]

    # -------------------------------
    # 6️⃣ Age
    # -------------------------------
    birth_ts = pd.to_datetime(df["birth_date"], errors="coerce")

    df["age"] = (
        (snapshot_ts - birth_ts).dt.days / 365.25
    )

    # -------------------------------
    # 7️⃣ Final cleaning
    # -------------------------------
    df = df.replace([pd.NA, pd.NaT], None)

    # تحويل employee_id إلى string لتفادي مشاكل parquet
    df["employee_id"] = df["employee_id"].astype(str)

    # -------------------------------
    # 8️⃣ Save dataset
    # -------------------------------
    output_path = OUTPUT_DIR / f"attrition_dataset_{snapshot_date}.parquet"
    df.to_parquet(output_path, index=False)

    print("\n===== DATASET READY =====")
    print(f"Rows: {len(df)}")
    print(f"Saved to: {output_path}")
    print(f"Dataset Hash: {dataset_hash(df)}")


if __name__ == "__main__":
    main(sys.argv[1])