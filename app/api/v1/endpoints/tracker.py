from fastapi import APIRouter, Body
from app.services.anthropic_service import (
    get_hydration_nudge,
    get_goal_prediction,
    get_hydration_insights,
    chat_with_coach,
    analyze_food_image
)
from typing import List, Dict

router = APIRouter()

@router.get("/")
async def get_root():
    return {"message": "Endpoint for tracker is under development"}

@router.get("/summary")
async def get_summary():
    # Mock data for frontend visualization
    return {
        "calories": {"consumed": 1450, "goal": 2200},
        "macros": {
            "protein": {"current": 82, "goal": 150},
            "carbs": {"current": 145, "goal": 250},
            "fats": {"current": 42, "goal": 70}
        },
        "water": {"current": 1250, "goal": 2500},
        "fasting": {
            "is_fasting": False,
            "protocol": "16:8",
            "startTime": None,
            "totalHours": 0
        },
        "meals": []
    }

@router.get("/hydration/coach")
async def hydration_coach(intake: int = 0, time_of_day: str = "morning", weather: str = "Sunny, 25°C"):
    nudge = await get_hydration_nudge(intake, time_of_day, weather)
    return {"nudge": nudge}

@router.post("/hydration/goal-prediction")
async def hydration_goal_prediction(history: List[Dict] = Body(...), forecast: str = "Mostly sunny, 27°C"):
    prediction = await get_goal_prediction(history, forecast)
    return prediction

@router.post("/hydration/insights")
async def hydration_insights(history: List[Dict] = Body(...)):
    insights = await get_hydration_insights(history)
    return {"insights": insights}

@router.post("/hydration/chat")
async def hydration_chat(message: str = Body(..., embed=True), history: List[Dict] = Body(...), weather: str = "Sunny"):
    response = await chat_with_coach(message, history, weather)
    return {"response": response}

@router.post("/calories/analyze")
async def analyze_calories(image_data: str = Body(..., embed=True)):
    analysis = await analyze_food_image(image_data)
    return {"analysis": analysis}
