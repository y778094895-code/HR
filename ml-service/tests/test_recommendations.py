import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

def test_generate_recommendations():
    payload = {
        "employee_id": "emp-123",
        "focus_area": "performance"
    }
    response = client.post("/recommendations/generate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert "title" in data[0]
    assert data[0]["type"] == "performance"

def test_estimate_impact():
    payload = {
        "employee_id": "emp-123",
        "intervention_type": "promotion"
    }
    response = client.post("/recommendations/estimate-impact", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "estimated_impact_score" in data
    assert "explanation" in data
