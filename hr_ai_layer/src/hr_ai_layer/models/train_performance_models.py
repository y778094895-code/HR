import os
import numpy as np
import pandas as pd
from sqlalchemy import create_engine, text
from sklearn.metrics import roc_auc_score, f1_score, precision_recall_curve
from sklearn.model_selection import TimeSeriesSplit
from sklearn.ensemble import HistGradientBoostingClassifier
from sklearn.calibration import CalibratedClassifierCV
from sklearn.inspection import permutation_importance
from joblib import dump
from hr_ai_layer.config.settings import settings


# =============================
# CONFIG
# =============================
TABLE = "sim_performance_panel_dataset_v3"
DATE_COL = "record_date"
EMP_COL = "employee_id"

MODEL_DIR = "artifacts/models"
MODEL_PATH = os.path.join(MODEL_DIR, "performance_engine_PRODUCTION.joblib")


# =============================
# DATA LOADING + TARGET
# =============================
def load_data():

    engine = create_engine(settings.sqlalchemy_url)
    df = pd.read_sql(text(f"SELECT * FROM {TABLE}"), engine)

    df[DATE_COL] = pd.to_datetime(df[DATE_COL])
    df = df.sort_values([EMP_COL, DATE_COL]).reset_index(drop=True)

    # Forward label
    df["next_score"] = df.groupby(EMP_COL)["overall_score"].shift(-1)
    df["trend"] = df.groupby(EMP_COL)["overall_score"].diff()
    df["acceleration"] = df.groupby(EMP_COL)["trend"].diff()

    df = df.dropna(subset=["next_score"]).copy()

    delta = df["next_score"] - df["overall_score"]

    df["decline_flag"] = (
        (delta < -0.4) |
        ((delta < -0.3) & (df["trend"] < 0))
    ).astype(int)

    # Behavioral temporal features
    behavioral_cols = [
        "kpi_productivity_mean",
        "kpi_quality_mean",
        "overtime_hours_mean",
        "burnout_index_mean",
    ]

    for col in behavioral_cols:
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

    print("Rows:", len(df))
    print("Decline rate:", df["decline_flag"].mean())

    return df


# =============================
# FEATURE SELECTION
# =============================
def get_features(df):

    blacklist = {
        "decline_flag",
        "next_score",
        "overall_score",
        DATE_COL,
        EMP_COL,
    }

    return [c for c in df.columns if c not in blacklist]


# =============================
# OPTIMAL THRESHOLD
# =============================
def find_best_threshold(y_true, probs):

    p, r, t = precision_recall_curve(y_true, probs)
    f1 = 2 * p * r / (p + r + 1e-8)
    return t[np.argmax(f1)]


# =============================
# TRAIN
# =============================
def train():

    df = load_data()
    features = get_features(df)

    X = df[features]
    y = df["decline_flag"]

    # ===== Strict TimeSeries Cross Validation =====
    tscv = TimeSeriesSplit(n_splits=5)

    auc_scores = []
    f1_scores = []

    for train_index, test_index in tscv.split(X):

        X_train, X_test = X.iloc[train_index], X.iloc[test_index]
        y_train, y_test = y.iloc[train_index], y.iloc[test_index]

        base_model = HistGradientBoostingClassifier(
            max_depth=7,
            learning_rate=0.03,
            max_iter=900,
            early_stopping=True,
            random_state=42,
        )

        model = CalibratedClassifierCV(base_model, method="isotonic", cv=3)
        model.fit(X_train, y_train)

        probs = model.predict_proba(X_test)[:, 1]
        threshold = find_best_threshold(y_test, probs)
        preds = (probs >= threshold).astype(int)

        auc_scores.append(roc_auc_score(y_test, probs))
        f1_scores.append(f1_score(y_test, preds))

    print("\n===== CROSS VALIDATED PERFORMANCE =====")
    print("Mean ROC-AUC:", np.mean(auc_scores))
    print("Mean F1:", np.mean(f1_scores))

    # ===== Final Fit on Full Data =====
    final_base = HistGradientBoostingClassifier(
        max_depth=7,
        learning_rate=0.03,
        max_iter=900,
        early_stopping=True,
        random_state=42,
    )

    final_model = CalibratedClassifierCV(final_base, method="isotonic", cv=3)
    final_model.fit(X, y)

    result = permutation_importance(
        final_model,
        X,
        y,
        n_repeats=5,
        random_state=42,
        n_jobs=-1,
    )

    importances = pd.Series(result.importances_mean, index=features)

    print("\nTop Drivers:")
    print(importances.sort_values(ascending=False).head(10))

    os.makedirs(MODEL_DIR, exist_ok=True)
    dump(final_model, MODEL_PATH)

    print("\nModel saved to:", MODEL_PATH)


if __name__ == "__main__":
    train()