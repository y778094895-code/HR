import pandas as pd

class FeatureEngineer:
    def __init__(self):
        pass

    def create_features(self, df):
        """Create relevant features for turnover prediction."""
        df = df.copy()
        # example: tenure, tenure^2, turnover_rate_dept
        return df
