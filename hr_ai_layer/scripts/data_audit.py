from __future__ import annotations

import json
from pathlib import Path

import pandas as pd

PROJECT = Path(__file__).resolve().parents[1]
REPORTS = PROJECT / "artifacts" / "data_audit"
REPORTS.mkdir(parents=True, exist_ok=True)

# عدّل المسارات حسب مكان ملفاتك الفعلي:
IBM_CSV = Path(r"C:\Users\HP\Desktop\ai_layer\hr_ai_layer\src\hr_ai_layer\data\WA_Fn-UseC_-HR-Employee-Attrition.csv")
INX_XLS = Path(r"C:\Users\HP\Desktop\ai_layer\hr_ai_layer\src\hr_ai_layer\data\INX_Future_Inc_Employee_Performance_CDS_Project2_Data_V1.8.xls")


def profile_df(df: pd.DataFrame, name: str) -> dict:
    info = {
        "name": name,
        "n_rows": int(df.shape[0]),
        "n_cols": int(df.shape[1]),
        "columns": [],
        "missing_summary": {},
    }

    for c in df.columns:
        s = df[c]
        info["columns"].append(
            {
                "name": str(c),
                "dtype": str(s.dtype),
                "n_missing": int(s.isna().sum()),
                "missing_pct": float(s.isna().mean()),
                "n_unique": int(s.nunique(dropna=True)),
            }
        )

    # أعمدة مرشحة لمفهوم "حدث خروج" أو "مدة" (مفيد لـ Survival)
    candidates = [c for c in df.columns if any(k in c.lower() for k in ["attrition", "exit", "leave", "terminate", "date", "year", "tenure", "duration"])]
    info["survival_candidate_columns"] = candidates

    # ملخص سريع للنواقص
    miss = df.isna().mean().sort_values(ascending=False).head(30)
    info["missing_summary"] = {k: float(v) for k, v in miss.items()}

    return info


def main() -> None:
    # IBM CSV
    if not IBM_CSV.exists():
        raise SystemExit(f"IBM CSV not found: {IBM_CSV}")
    df_ibm = pd.read_csv(IBM_CSV)
    ibm_info = profile_df(df_ibm, "IBM_Attrition")

    # INX XLS
    if not INX_XLS.exists():
        raise SystemExit(f"INX XLS not found: {INX_XLS}")
    # قد يكون الملف Excel قديم (xls)؛ pandas يحتاج engine مناسب غالباً.
    # إن واجهت خطأ، سنثبت xlrd==2.0.1 أو نحول الملف إلى xlsx.
    df_inx = pd.read_excel(INX_XLS)
    inx_info = profile_df(df_inx, "INX_Performance")

    out = {"ibm": ibm_info, "inx": inx_info}

    (REPORTS / "audit_summary.json").write_text(json.dumps(out, ensure_ascii=False, indent=2), encoding="utf-8")

    # حفظ قائمة الأعمدة كـ CSV لسهولة المراجعة
    pd.DataFrame(ibm_info["columns"]).to_csv(REPORTS / "ibm_columns.csv", index=False, encoding="utf-8-sig")
    pd.DataFrame(inx_info["columns"]).to_csv(REPORTS / "inx_columns.csv", index=False, encoding="utf-8-sig")

    print("OK ✅ Generated:")
    print(f"- {REPORTS / 'audit_summary.json'}")
    print(f"- {REPORTS / 'ibm_columns.csv'}")
    print(f"- {REPORTS / 'inx_columns.csv'}")


if __name__ == "__main__":
    main()