from sqlalchemy import create_engine, text
import pandas as pd
import numpy as np
from hr_ai_layer.config.settings import settings

TABLE = "sim_performance_panel_dataset_v4"
DATE_COL = "record_date"
EMP_COL = "employee_id"

engine = create_engine(settings.sqlalchemy_url)

# =========================
# LOAD DATA (نفس التدريب)
# =========================
df = pd.read_sql(text(f"SELECT * FROM {TABLE}"), engine)

df[DATE_COL] = pd.to_datetime(df[DATE_COL])
df = df.sort_values([EMP_COL, DATE_COL]).reset_index(drop=True)

df["lag1"] = df.groupby(EMP_COL)["overall_score"].shift(1)
df["lag2"] = df.groupby(EMP_COL)["overall_score"].shift(2)
df["diff1"] = df["overall_score"] - df["lag1"]
df["diff2"] = df["lag1"] - df["lag2"]
df["employee_mean"] = df.groupby(EMP_COL)["overall_score"].transform("mean")

sustained_drop = (df["diff1"] < -0.3) & (df["diff2"] < -0.3)
relative_drop = (df["overall_score"] < df["employee_mean"] * 0.90)

df["decline_flag"] = (sustained_drop | relative_drop).astype(int)

df = df.dropna().copy()

# =========================
# FEATURE ENGINEERING (نفس التدريب)
# =========================
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

# =========================
# إزالة الأعمدة المحظورة
# =========================
blacklist = {
    "overall_score",
    "lag1",
    "lag2",
    "diff1",
    "diff2",
    "employee_mean"
}

df_final = df.drop(columns=[c for c in blacklist if c in df.columns])

# =========================
# حفظ النسخة النهائية
# =========================
output_path = "performance_dataset_training_exact_v5.csv"
df_final.to_csv(output_path, index=False)

print("Exported exact training dataset successfully.")
print("Rows:", len(df_final))
print("Decline rate:", df_final["decline_flag"].mean())