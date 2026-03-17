# src/hr_ai_layer/monitoring/explain_and_store.py

import os
import uuid
from datetime import datetime, date
from typing import Optional

import numpy as np
import pandas as pd
from sqlalchemy import create_engine, text
from sklearn.ensemble import RandomForestClassifier
from joblib import dump, load

from hr_ai_layer.config.settings import settings


MODEL_PATH = os.environ.get("MODEL_PATH", "artifacts/models/attrition_rf_v1.joblib")
DATA_TABLE = os.environ.get("DATA_TABLE", "sim_survival_horizon_dataset")
TOP_K = int(os.environ.get("TOP_K", "8"))

THRESH_PROD = float(os.environ.get("THRESH_PROD", "0.20"))
THRESH_HIGH = float(os.environ.get("THRESH_HIGH", "0.35"))

# ثابت لتحويل EMP_0 -> UUID بشكل دائم (لا يتغير كل مرة)
UUID_NAMESPACE = uuid.UUID("11111111-1111-1111-1111-111111111111")


def _engine():
    return create_engine(settings.sqlalchemy_url)


def _risk_level(prob: float) -> str:
    if prob >= THRESH_HIGH:
        return "High"
    if prob >= THRESH_PROD:
        return "Medium"
    return "Low"


def _to_uuid(employee_id_str: str) -> uuid.UUID:
    """
    Convert non-UUID employee ids (like EMP_0) into deterministic UUIDs.
    """
    try:
        return uuid.UUID(employee_id_str)
    except Exception:
        return uuid.uuid5(UUID_NAMESPACE, employee_id_str)


def _get_default_dept_pos(conn) -> tuple[int, int]:
    dept = conn.execute(text("SELECT MIN(department_id) FROM departments")).fetchone()[0]
    pos = conn.execute(text("SELECT MIN(position_id) FROM positions")).fetchone()[0]
    if dept is None:
        dept = conn.execute(
            text("INSERT INTO departments (department_name) VALUES ('Default') RETURNING department_id")
        ).fetchone()[0]
    if pos is None:
        pos = conn.execute(
            text("INSERT INTO positions (title, level, department_id) VALUES ('Default', 1, :d) RETURNING position_id"),
            {"d": int(dept)},
        ).fetchone()[0]
    conn.commit()
    return int(dept), int(pos)


def _ensure_employee_row(conn, emp_uuid: uuid.UUID, emp_code: str, hire_dt: date):
    """
    Ensure employees row exists for this UUID, otherwise insert a minimal valid row.
    """
    exists = conn.execute(
        text("SELECT 1 FROM employees WHERE employee_id = :eid"),
        {"eid": str(emp_uuid)},
    ).fetchone()

    if exists:
        return

    dept_id, pos_id = _get_default_dept_pos(conn)

    conn.execute(
        text(
            """
            INSERT INTO employees (
                employee_id,
                employee_code,
                full_name,
                hire_date,
                department_id,
                position_id,
                employment_status
            )
            VALUES (
                :employee_id,
                :employee_code,
                :full_name,
                :hire_date,
                :department_id,
                :position_id,
                :employment_status
            )
            """
        ),
        {
            "employee_id": str(emp_uuid),
            "employee_code": emp_code,
            "full_name": f"Sim {emp_code}",
            "hire_date": hire_dt,
            "department_id": dept_id,
            "position_id": pos_id,
            "employment_status": "active",
        },
    )
    conn.commit()


def _add_time_features(df: pd.DataFrame) -> pd.DataFrame:
    df = df.sort_values(["employee_id", "record_date"])

    numeric_cols = [
        "overtime_risk_index",
        "performance_rating",
        "financial_stress_index",
        "salary",
    ]

    for col in numeric_cols:
        df[f"{col}_roll3_mean"] = (
            df.groupby("employee_id")[col]
            .transform(lambda x: x.rolling(3, min_periods=1).mean())
        )
        df[f"{col}_delta1"] = df.groupby("employee_id")[col].diff()

    df = df.replace([np.inf, -np.inf], np.nan).fillna(0)
    return df


def _prepare_xy(df: pd.DataFrame):
    df = _add_time_features(df)

    y = df["event_6m"].astype(int)
    drop_cols = ["employee_id", "record_date", "exit_date", "event", "event_6m"]
    X = df.drop(columns=[c for c in drop_cols if c in df.columns])
    X = X.replace([np.inf, -np.inf], np.nan).fillna(0)
    return X, y, df


def _ensure_model_trained_and_saved() -> RandomForestClassifier:
    if os.path.exists(MODEL_PATH):
        return load(MODEL_PATH)

    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)

    eng = _engine()
    df = pd.read_sql(f"SELECT * FROM {DATA_TABLE}", eng)
    df["record_date"] = pd.to_datetime(df["record_date"])

    cutoff = df["record_date"].quantile(0.75)
    train_df = df[df["record_date"] <= cutoff].copy()

    X_train, y_train, _ = _prepare_xy(train_df)

    model = RandomForestClassifier(
        n_estimators=300,
        max_depth=None,
        min_samples_leaf=10,
        n_jobs=-1,
        random_state=42,
    )
    model.fit(X_train, y_train)

    dump(model, MODEL_PATH)
    return model


def _explain_fallback(model: RandomForestClassifier, X_row: pd.DataFrame, top_k: int = 8):
    fi = pd.Series(model.feature_importances_, index=X_row.columns)
    impacts = (fi.abs() * X_row.iloc[0].abs()).sort_values(ascending=False).head(top_k)
    return [(k, float(v)) for k, v in impacts.items()]


def _try_shap_explain(model: RandomForestClassifier, X_row: pd.DataFrame, top_k: int = 8):
    try:
        import shap  # type: ignore

        explainer = shap.TreeExplainer(model)
        shap_values = explainer.shap_values(X_row)

        if isinstance(shap_values, list):
            sv = shap_values[1][0]
        else:
            sv = shap_values[0]

        s = pd.Series(np.abs(sv), index=X_row.columns).sort_values(ascending=False).head(top_k)
        return [(k, float(v)) for k, v in s.items()]
    except Exception:
        return _explain_fallback(model, X_row, top_k=top_k)


def _ensure_ai_model_id(conn) -> int:
    model_name = os.environ.get("AI_MODEL_NAME", "Attrition_6M_RF_v1")
    purpose = os.environ.get("AI_MODEL_PURPOSE", "Predict attrition risk within 6 months")
    version = os.environ.get("AI_MODEL_VERSION", "1.0.0")

    res = conn.execute(
        text("SELECT model_id FROM ai_models WHERE model_name = :n AND version = :v"),
        {"n": model_name, "v": version},
    ).fetchone()
    if res:
        return int(res[0])

    ins = conn.execute(
        text(
            """
            INSERT INTO ai_models (model_name, purpose, version)
            VALUES (:n, :p, :v)
            RETURNING model_id
            """
        ),
        {"n": model_name, "p": purpose, "v": version},
    ).fetchone()
    conn.commit()
    return int(ins[0])


def batch_predict_and_store(as_of_date: Optional[str] = None, limit: int = 2000):
    model = _ensure_model_trained_and_saved()
    eng = _engine()

    # Read latest record per employee
    with eng.connect() as conn:
        if as_of_date:
            df = pd.read_sql(
                text(
                    f"""
                    SELECT *
                    FROM {DATA_TABLE}
                    WHERE record_date = :d
                    LIMIT :lim
                    """
                ),
                conn,
                params={"d": as_of_date, "lim": limit},
            )
        else:
            df = pd.read_sql(
                text(
                    f"""
                    SELECT t.*
                    FROM {DATA_TABLE} t
                    JOIN (
                        SELECT employee_id, MAX(record_date) AS max_date
                        FROM {DATA_TABLE}
                        GROUP BY employee_id
                    ) m
                    ON t.employee_id = m.employee_id AND t.record_date = m.max_date
                    LIMIT :lim
                    """
                ),
                conn,
                params={"lim": limit},
            )

    if df.empty:
        print("No rows found for batch prediction.")
        return

    df["record_date"] = pd.to_datetime(df["record_date"])
    X, _, df_feat = _prepare_xy(df)
    probs = model.predict_proba(X)[:, 1]
    now = datetime.utcnow()

    with eng.connect() as conn:
        model_id = _ensure_ai_model_id(conn)

        written = 0
        for i in range(len(df_feat)):
            eid_raw = str(df_feat.iloc[i]["employee_id"])
            eid_uuid = _to_uuid(eid_raw)

            # Ensure employees row exists (FK safety)
            rec_date = pd.to_datetime(df_feat.iloc[i]["record_date"]).date()
            hire_dt = rec_date  # minimal valid hire_date
            _ensure_employee_row(conn, eid_uuid, emp_code=eid_raw, hire_dt=hire_dt)

            p = float(probs[i])
            rl = _risk_level(p)

            X_row = X.iloc[[i]].copy()
            factors = _try_shap_explain(model, X_row, top_k=TOP_K)

            # ✅ التعديل المطلوب فقط:
            # - نخزن UUID في employee_id (للتوافق مع نوع uuid + FK)
            # - نخزن القيمة الأصلية (EMP_0 ..) في employee_key (TEXT) لتفادي مشاكل التحويل وللتتبع
            pred_row = conn.execute(
                text(
                    """
                    INSERT INTO predictions (
                        employee_id,
                        employee_key,
                        model_id,
                        prediction_type,
                        risk_level,
                        probability,
                        predicted_at
                    )
                    VALUES (
                        :eid,
                        :ekey,
                        :mid,
                        :ptype,
                        :rl,
                        :prob,
                        :ts
                    )
                    RETURNING prediction_id
                    """
                ),
                {
                    "eid": str(eid_uuid),
                    "ekey": eid_raw,
                    "mid": model_id,
                    "ptype": "attrition_6m",
                    "rl": rl,
                    "prob": p,
                    "ts": now,
                },
            ).fetchone()
            pred_id = int(pred_row[0])

            for factor, impact in factors:
                conn.execute(
                    text(
                        """
                        INSERT INTO prediction_explanations (prediction_id, factor, impact_score)
                        VALUES (:pid, :factor, :impact)
                        """
                    ),
                    {"pid": pred_id, "factor": factor, "impact": float(impact)},
                )

            written += 1

        conn.commit()

    print(f"OK ✅ Batch stored predictions: {written}")
    print(f"Model saved at: {MODEL_PATH}")


if __name__ == "__main__":
    asof = os.environ.get("AS_OF_DATE")
    batch_predict_and_store(as_of_date=asof, limit=int(os.environ.get("BATCH_LIMIT", "2000")))