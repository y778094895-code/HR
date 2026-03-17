# src/hr_ai_layer/serving/app.py

import os
from datetime import datetime
from typing import Any, Optional

import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import create_engine, text
from joblib import load

from hr_ai_layer.config.settings import settings


app = FastAPI(title="HR AI Layer - Attrition (6M Horizon) Serving")


MODEL_PATH = os.environ.get("MODEL_PATH", "artifacts/models/attrition_rf_v1.joblib")
DATA_TABLE = os.environ.get("DATA_TABLE", "sim_survival_horizon_dataset")
TOP_K = int(os.environ.get("TOP_K", "8"))
WRITEBACK = os.environ.get("WRITEBACK", "1") == "1"

THRESH_PROD = float(os.environ.get("THRESH_PROD", "0.20"))  # production threshold from economic opt
THRESH_HIGH = float(os.environ.get("THRESH_HIGH", "0.35"))  # high-risk bucket boundary


class PredictRequest(BaseModel):
    employee_id: str = Field(..., description="Employee UUID as string")
    as_of_date: Optional[str] = Field(None, description="YYYY-MM-DD, defaults to latest record for employee")


def _engine():
    return create_engine(settings.sqlalchemy_url)


def _ensure_model_loaded():
    if not os.path.exists(MODEL_PATH):
        raise RuntimeError(
            f"Model file not found: {MODEL_PATH}. "
            f"Run batch script to train+save or set MODEL_PATH correctly."
        )
    return load(MODEL_PATH)


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


def _risk_level(prob: float) -> str:
    if prob >= THRESH_HIGH:
        return "High"
    if prob >= THRESH_PROD:
        return "Medium"
    return "Low"


def _explain_fallback(model, X_row: pd.DataFrame, top_k: int = 8):
    """
    Lightweight explanation that never breaks:
    use feature importances * |value| as a proxy impact score.
    """
    if not hasattr(model, "feature_importances_"):
        # fallback: just return absolute feature values
        impacts = X_row.iloc[0].abs()
        top = impacts.sort_values(ascending=False).head(top_k)
        return [(k, float(v)) for k, v in top.items()]

    fi = pd.Series(model.feature_importances_, index=X_row.columns)
    impacts = (fi.abs() * X_row.iloc[0].abs()).sort_values(ascending=False).head(top_k)
    return [(k, float(v)) for k, v in impacts.items()]


def _try_shap_explain(model, X_row: pd.DataFrame, top_k: int = 8):
    """
    If shap is installed and compatible, return top_k factors by |shap|.
    Otherwise fallback.
    """
    try:
        import shap  # type: ignore

        explainer = shap.TreeExplainer(model)
        shap_values = explainer.shap_values(X_row)

        # For binary classification shap may return list; take class 1 if list.
        if isinstance(shap_values, list):
            sv = shap_values[1][0]
        else:
            sv = shap_values[0]

        s = pd.Series(np.abs(sv), index=X_row.columns).sort_values(ascending=False).head(top_k)
        # impact_score signed could be used; here we store magnitude
        return [(k, float(v)) for k, v in s.items()]
    except Exception:
        return _explain_fallback(model, X_row, top_k=top_k)


def _get_feature_row(employee_id: str, as_of_date: Optional[str]) -> tuple[pd.DataFrame, pd.Timestamp]:
    eng = _engine()
    with eng.connect() as conn:
        if as_of_date:
            df = pd.read_sql(
                text(f"""
                    SELECT *
                    FROM {DATA_TABLE}
                    WHERE employee_id = :eid AND record_date = :d
                """),
                conn,
                params={"eid": employee_id, "d": as_of_date},
            )
            if df.empty:
                raise HTTPException(status_code=404, detail="No record for employee_id at as_of_date.")
            record_ts = pd.to_datetime(df["record_date"].iloc[0])
        else:
            df = pd.read_sql(
                text(f"""
                    SELECT *
                    FROM {DATA_TABLE}
                    WHERE employee_id = :eid
                    ORDER BY record_date DESC
                    LIMIT 12
                """),
                conn,
                params={"eid": employee_id},
            )
            if df.empty:
                raise HTTPException(status_code=404, detail="No records for employee_id.")
            record_ts = pd.to_datetime(df["record_date"].max())

    df["record_date"] = pd.to_datetime(df["record_date"])
    df = _add_time_features(df)

    # pick the row we want (latest if no as_of_date)
    row = df[df["record_date"] == record_ts].copy()
    if row.empty:
        # if no exact match due to timestamp formatting, choose max
        row = df[df["record_date"] == df["record_date"].max()].copy()
        record_ts = pd.to_datetime(row["record_date"].iloc[0])

    drop_cols = ["employee_id", "record_date", "exit_date", "event", "event_6m"]
    X = row.drop(columns=[c for c in drop_cols if c in row.columns])

    # keep numeric only and fill
    X = X.replace([np.inf, -np.inf], np.nan).fillna(0)
    return X, record_ts


def _ensure_ai_model_id(conn) -> int:
    # Register a model row in ai_models if missing
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
        text("""
            INSERT INTO ai_models (model_name, purpose, version)
            VALUES (:n, :p, :v)
            RETURNING model_id
        """),
        {"n": model_name, "p": purpose, "v": version},
    ).fetchone()
    conn.commit()
    return int(ins[0])


def _writeback(conn, employee_id: str, prob: float, risk_level: str, predicted_at: datetime, factors: list[tuple[str, float]]):
    model_id = _ensure_ai_model_id(conn)

    pred_row = conn.execute(
        text("""
            INSERT INTO predictions (employee_id, model_id, prediction_type, risk_level, probability, predicted_at)
            VALUES (:eid, :mid, :ptype, :rl, :prob, :ts)
            RETURNING prediction_id
        """),
        {
            "eid": employee_id,
            "mid": model_id,
            "ptype": "attrition_6m",
            "rl": risk_level,
            "prob": float(prob),
            "ts": predicted_at,
        },
    ).fetchone()
    pred_id = int(pred_row[0])

    for factor, impact in factors:
        conn.execute(
            text("""
                INSERT INTO prediction_explanations (prediction_id, factor, impact_score)
                VALUES (:pid, :factor, :impact)
            """),
            {"pid": pred_id, "factor": factor, "impact": float(impact)},
        )

    conn.commit()
    return pred_id


@app.get("/health")
def health() -> dict[str, Any]:
    return {
        "status": "ok",
        "model_path": MODEL_PATH,
        "data_table": DATA_TABLE,
        "writeback": WRITEBACK,
    }


@app.post("/predict")
def predict(req: PredictRequest) -> dict[str, Any]:
    model = _ensure_model_loaded()

    X, asof = _get_feature_row(req.employee_id, req.as_of_date)
    prob = float(model.predict_proba(X)[:, 1][0])
    rl = _risk_level(prob)

    factors = _try_shap_explain(model, X, top_k=TOP_K)

    pred_id = None
    if WRITEBACK:
        eng = _engine()
        with eng.connect() as conn:
            pred_id = _writeback(
                conn=conn,
                employee_id=req.employee_id,
                prob=prob,
                risk_level=rl,
                predicted_at=datetime.utcnow(),
                factors=factors,
            )

    return {
        "employee_id": req.employee_id,
        "as_of_date": str(asof.date()),
        "probability_6m": prob,
        "risk_level": rl,
        "threshold_prod": THRESH_PROD,
        "threshold_high": THRESH_HIGH,
        "top_factors": [{"factor": f, "impact_score": s} for f, s in factors],
        "prediction_id": pred_id,
    }