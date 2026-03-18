from fastapi import APIRouter, Body
from app.services.anthropic_service import call_claude

router = APIRouter()

@router.post("/claude")
async def ask_claude_proxy(system: str = Body(...), message: str = Body(...)):
    response = await call_claude(system, message)
    return {"text": response}
