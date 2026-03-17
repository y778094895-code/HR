import pandas as pd
import numpy as np
from sqlalchemy import create_engine, text
from sklearn.metrics import roc_auc_score, f1_score
from hr_ai_layer.config.settings import settings
from joblib import load

TABLE = "sim_performance_panel_dataset_v3"
MODEL_PATH = "artifacts/models/performance_engine_improved.joblib"

DATE_COL = "record_date"
EMP_COL = "employee_id"


def load_data():
    engine = create_engine(settings.sqlalchemy_url)
    df = pd.read_sql(text(f"SELECT * FROM {TABLE}"), engine)

    df[DATE_COL] = pd.to_datetime(df[DATE_COL])
    df = df.sort_values([EMP_COL, DATE_COL]).reset_index(drop=True)

    # Target
    df["next_score"] = df.groupby(EMP_COL)["overall_score"].shift(-1)
    df = df.dropna(subset=["next_score"]).copy()

    df["decline_flag"] = (
        (df["next_score"] - df["overall_score"]) < -0.5
    ).astype(int)

    # ===== Rebuild EXACT same engineered features used in training =====
    for col in [
        "kpi_productivity_mean",
        "kpi_quality_mean",
        "overtime_hours_mean",
        "burnout_index_mean",
    ]:
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

    return df


def robustness_test():

    df = load_data()
    model = load(MODEL_PATH)

    # IMPORTANT: use model.feature_names_in_ to avoid ANY mismatch
    features = list(model.feature_names_in_)

    cutoff = df[DATE_COL].quantile(0.80)
    test = df[df[DATE_COL] > cutoff].copy()

    X_test = test[features]
    y_test = test["decline_flag"]

    # ===== Baseline =====
    probs = model.predict_proba(X_test)[:, 1]
    preds = (probs > 0.25).astype(int)

    base_auc = roc_auc_score(y_test, probs)
    base_f1 = f1_score(y_test, preds)

    print("\n=== BASELINE ===")
    print("ROC-AUC:", base_auc)
    print("F1:", base_f1)

    # ===== Add realistic noise (keep feature names) =====
    noise = np.random.normal(0, 0.05, X_test.shape)

    X_noisy = pd.DataFrame(
        X_test.values + noise,
        columns=X_test.columns,
        index=X_test.index
    )

    probs_noise = model.predict_proba(X_noisy)[:, 1]
    preds_noise = (probs_noise > 0.25).astype(int)

    noisy_auc = roc_auc_score(y_test, probs_noise)
    noisy_f1 = f1_score(y_test, preds_noise)

    print("\n=== WITH NOISE ===")
    print("ROC-AUC:", noisy_auc)
    print("F1:", noisy_f1)

    print("\nPerformance Drop:")
    print("AUC Drop:", base_auc - noisy_auc)
    print("F1 Drop:", base_f1 - noisy_f1)


if __name__ == "__main__":
    robustness_test()