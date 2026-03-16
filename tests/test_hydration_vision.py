import pytest
from fastapi.testclient import TestClient
from app.main import app
from unittest.mock import patch, AsyncMock

client = TestClient(app)

def test_hydration_coach_smoke():
    response = client.get("/api/v1/tracker/hydration/coach?intake=1000&time_of_day=afternoon&weather=Sunny")
    assert response.status_code == 200
    assert "nudge" in response.json()

@patch("app.api.v1.endpoints.tracker.chat_with_coach", new_callable=AsyncMock)
def test_hydration_chat_smoke(mock_chat):
    mock_chat.return_value = "Keep drinking water!"
    response = client.post(
        "/api/v1/tracker/hydration/chat",
        json={
            "message": "Should I drink more?",
            "history": [],
            "weather": "Sunny"
        }
    )
    assert response.status_code == 200
    assert response.json()["response"] == "Keep drinking water!"

@patch("app.api.v1.endpoints.tracker.analyze_food_image", new_callable=AsyncMock)
def test_calorie_analyze_smoke(mock_analyze):
    mock_analyze.return_value = "Apple: 95 kcal"
    response = client.post(
        "/api/v1/tracker/calories/analyze",
        json={"image_data": "data:image/jpeg;base64,mockdata"}
    )
    assert response.status_code == 200
    assert response.json()["analysis"] == "Apple: 95 kcal"
