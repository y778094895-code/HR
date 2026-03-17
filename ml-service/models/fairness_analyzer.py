import random

class FairnessAnalyzer:
    def __init__(self):
        pass

    def analyze(self, department: str):
        """
        Simulate fairness analysis logic.
        Input: Department name
        Output: Report with metrics
        """
        # Mock metrics
        metrics = [
            {
                "type": "SALARY_GAP",
                "value": round(random.uniform(2, 15), 2),
                "benchmark": 5.0,
                "status": "FAIR" if random.random() > 0.3 else "WARNING"
            },
            {
                "type": "PROMOTION_GAP",
                "value": round(random.uniform(1, 10), 2),
                "benchmark": 3.0,
                "status": "FAIR" if random.random() > 0.5 else "BIASED"
            },
            {
                "type": "DIVERSITY_INDEX",
                "value": round(random.uniform(60, 95), 2),
                "benchmark": 80.0,
                "status": "FAIR"
            }
        ]
        
        return {
            "department": department,
            "metrics": metrics,
            "overall_status": "FAIR" # Simplified
        }
