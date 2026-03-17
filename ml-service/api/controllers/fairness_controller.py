from fastapi import APIRouter, HTTPException
from schemas.fairness_schemas import FairnessRequest, FairnessResponse, FairnessScore
import pandas as pd
import numpy as np

router = APIRouter(prefix="/fairness", tags=["fairness"])

@router.post("/analyze", response_model=FairnessResponse)
async def analyze_fairness(request: FairnessRequest):
    """
    Analyze fairness metrics for a given dataset and outcome.
    Calculates Disparate Impact and selection rates.
    """
    try:
        df = pd.DataFrame(request.data)
        if request.protected_attribute not in df.columns or request.outcome_column not in df.columns:
            raise HTTPException(status_code=400, detail="Missing columns in data")

        # Basic Disparate Impact calculation
        selection_rates = df.groupby(request.protected_attribute)[request.outcome_column].mean()
        max_rate = selection_rates.max()
        
        scores = []
        for attr, rate in selection_rates.items():
            di_score = rate / max_rate if max_rate > 0 else 0
            scores.append(FairnessScore(
                attribute_value=str(attr),
                selection_rate=float(rate),
                score=float(di_score)
            ))
        
        overall_disparity = 1.0 - (selection_rates.min() / max_rate if max_rate > 0 else 0)
        
        recommendations = []
        if overall_disparity > 0.2: # 4/5ths rule common threshold
            recommendations.append(f"Significant disparity detected in {request.protected_attribute}. Consider reviewing selection criteria.")
        else:
            recommendations.append("No significant disparity detected under current thresholds.")

        return FairnessResponse(
            status="completed",
            overall_disparity=float(overall_disparity),
            scores=scores,
            recommendations=recommendations
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
