from prometheus_client import Counter, Histogram

PREDICTIONS_TOTAL = Counter("predictions_total", "Total predictions served")
PREDICTION_LATENCY = Histogram("prediction_latency_seconds", "Prediction latency in seconds")
