import random

class TurnoverPredictor:
    def __init__(self):
        pass

    def predict(self, features):
        """
        Simulate prediction logic.
        Input: Dictionary of features (e.g., salary, role, tenure)
        Output: Dictionary with risk_score and contributing_factors
        """
        # Mock logic
        base_score = random.uniform(10, 90)
        
        # Adjust based on simple rules (mock)
        if features.get('salary', 0) < 5000:
            base_score += 10
        if features.get('years_at_company', 0) > 5:
            base_score -= 10
            
        risk_score = max(0, min(100, base_score))
        
        factors = []
        if risk_score > 50:
            factors = ['Market Salary Gap', 'Long Commute']
            
        return {
            "risk_score": round(risk_score, 2),
            "risk_level": self._get_level(risk_score),
            "contributing_factors": factors,
            "retention_probability": round(100 - risk_score, 2)
        }

    def _get_level(self, score):
        if score > 80: return "CRITICAL"
        if score > 50: return "HIGH"
        if score > 20: return "MEDIUM"
        return "LOW"
