import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/ai/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"

def test_extract_endpoint_valid():
    payload = {
        "text": "I've worked with React and Node.js for a year and want to be a Full Stack Developer.",
        "context": "skills_step"
    }
    response = client.post("/ai/profile/extract", json=payload)
    assert response.status_code == 200
    data = response.json()
    skills = [s["name"] for s in data["skills"]]
    assert "React" in skills
    assert "Node.js" in skills

def test_extract_endpoint_empty_text_rejected():
    response = client.post("/ai/profile/extract", json={"text": ""})
    assert response.status_code == 422  # Pydantic validation error for empty text
