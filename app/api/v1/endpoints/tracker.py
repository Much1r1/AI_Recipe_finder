from fastapi import APIRouter

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
