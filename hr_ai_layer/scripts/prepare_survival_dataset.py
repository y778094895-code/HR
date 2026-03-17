from __future__ import annotations

import hashlib
import json
from pathlib import Path

import numpy as np
import pandas as pd


PROJECT = Path(__file__).resolve().parents[1]
DATA_DIR = PROJECT / "src" / "hr_ai_layer" / "data"

IBM_CSV = DATA_DIR / "WA_Fn-UseC_-HR-Employee-Attrition.csv"
INX_XLS = DATA_DIR / "INX_Future_Inc_Employee_Performance_CDS_Project2_Data_V1.8.xls"

OUT_DIR = PROJECT / "artifacts" / "datasets"
OUT_DIR.mkdir(parents=True, exist_ok=True)


def file_sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def make_survival_labels(
    df: pd.DataFrame,
    attrition_col: str = "Attrition",
    tenure_primary: str = "YearsAtCompany",
    tenure_fallback: str | None = None,
) -> pd.DataFrame:
    df = df.copy()

    # event
    if attrition_col not in df.columns:
        raise ValueError(f"Missing {attrition_col} in dataset.")
    df["event"] = df[attrition_col].astype(str).str.strip().str.lower().map({"yes": 1, "no": 0})
    if df["event"].isna().any():
        # allow 0/1 already
        df["event"] = pd.to_numeric(df[attrition_col], errors="coerce")
    if df["event"].isna().any():
        bad = df[df["event"].isna()][attrition_col].unique().tolist()
        raise ValueError(f"Unrecognized values in {attrition_col}: {bad}")

    # duration (years)
    if tenure_primary in df.columns:
        duration_years = pd.to_numeric(df[tenure_primary], errors="coerce")
    elif tenure_fallback and tenure_fallback in df.columns:
        duration_years = pd.to_numeric(df[tenure_fallback], errors="coerce")
    else:
        raise ValueError(
            f"Missing tenure column. Need {tenure_primary} or fallback {tenure_fallback}."
        )

    df["duration_days"] = (duration_years * 365.0).round().astype("Int64")

    # Clean invalid durations
    df = df.dropna(subset=["duration_days", "event"])
    df = df[df["duration_days"] >= 0]

    return df


def prepare_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Strict v1:
    - Keep numeric columns
    - One-hot encode categorical columns (limited)
    - Drop obvious IDs / constant cols
    """
    df = df.copy()

    # Drop label source column if exists (Attrition kept only through event)
    if "Attrition" in df.columns:
        df = df.drop(columns=["Attrition"])

    # Separate labels
    labels = df[["duration_days", "event"]].copy()
    X = df.drop(columns=["duration_days", "event"], errors="ignore")

    # Drop columns that are clearly identifiers if present
    for c in ["EmployeeNumber", "EmployeeCount", "Over18", "StandardHours"]:
        if c in X.columns:
            X = X.drop(columns=[c])

    # Convert types
    # Numeric columns
    num_cols = [c for c in X.columns if pd.api.types.is_numeric_dtype(X[c])]
    cat_cols = [c for c in X.columns if c not in num_cols]

    X_num = X[num_cols].apply(pd.to_numeric, errors="coerce")

    # One-hot encode categoricals (safe)
    if cat_cols:
        X_cat = pd.get_dummies(X[cat_cols].astype(str), drop_first=True)
        X_all = pd.concat([X_num, X_cat], axis=1)
    else:
        X_all = X_num

    # Drop columns with all missing or constant
    nunique = X_all.nunique(dropna=True)
    X_all = X_all.loc[:, nunique > 1]

    # Impute missing values (v1 simple, deterministic)
    X_all = X_all.fillna(X_all.median(numeric_only=True))

    out = pd.concat([labels.reset_index(drop=True), X_all.reset_index(drop=True)], axis=1)
    return out


def main() -> None:
    if not IBM_CSV.exists():
        raise SystemExit(f"IBM CSV not found at: {IBM_CSV}")
    if not INX_XLS.exists():
        print(f"INX XLS not found at: {INX_XLS} (will proceed with IBM only)")

    # --- IBM ---
    ibm = pd.read_csv(IBM_CSV)
    ibm = make_survival_labels(
        ibm,
        attrition_col="Attrition",
        tenure_primary="YearsAtCompany",
        tenure_fallback="TotalWorkingYears",
    )
    ibm_ready = prepare_features(ibm)
# Save snapshot
    out_csv = OUT_DIR / "train_survival_ibm_v1.csv"
    ibm_ready.to_csv(out_csv, index=False, encoding="utf-8-sig")

    # Lineage manifest
    manifest = {
        "dataset_name": "train_survival_ibm_v1",
        "source_files": {
            str(IBM_CSV): file_sha256(IBM_CSV),
            **({str(INX_XLS): file_sha256(INX_XLS)} if INX_XLS.exists() else {}),
        },
        "rows": int(ibm_ready.shape[0]),
        "cols": int(ibm_ready.shape[1]),
        "label_spec": {
            "event": "Attrition Yes->1 No->0",
            "duration_days": "YearsAtCompany*365 (fallback TotalWorkingYears*365)",
        },
        "output_file": str(out_csv),
        "output_sha256": file_sha256(out_csv),
    }
    (OUT_DIR / "lineage_manifest_v1.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    print("OK ✅ Prepared training dataset + lineage:")
    print(f"- {out_csv}")
    print(f"- {OUT_DIR / 'lineage_manifest_v1.json'}")


if __name__ == "__main__":
    main()