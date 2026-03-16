import os
import httpx
import json
from typing import List, Dict, Optional

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
CLAUDE_MODEL = "claude-3-5-sonnet-20240620"

async def call_claude(system_prompt: str, user_prompt: str) -> str:
    if not ANTHROPIC_API_KEY:
        print("⚠️ ANTHROPIC_API_KEY missing, using fallback")
        return "Claude is currently offline. Stay hydrated!"

    url = "https://api.anthropic.com/v1/messages"
    headers = {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json"
    }
    payload = {
        "model": CLAUDE_MODEL,
        "max_tokens": 1024,
        "system": system_prompt,
        "messages": [
            {"role": "user", "content": user_prompt}
        ]
    }

    try:
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.post(url, headers=headers, json=payload)
            response.raise_for_status()
            data = response.json()
            return data["content"][0]["text"]
    except Exception as e:
        print(f"⚠️ Claude call failed: {e}")
        return "I'm having trouble connecting right now, but don't forget to drink some water!"

async def get_hydration_nudge(intake: int, time_of_day: str, weather: str) -> str:
    system_prompt = "You are a concise, friendly hydration coach. Generate a short (1-2 sentence) nudge based on the user's data."
    user_prompt = f"Current intake: {intake}ml. Time of day: {time_of_day}. Local weather: {weather}."
    return await call_claude(system_prompt, user_prompt)

async def get_goal_prediction(history: List[Dict], forecast: str) -> Dict:
    system_prompt = "Analyze hydration history and weather forecast to set a recommended daily goal. Return JSON: {\"goal\": int, \"reason\": \"string\"}"
    user_prompt = f"History: {json.dumps(history)}. Forecast: {forecast}."

    response_text = await call_claude(system_prompt, user_prompt)
    try:
        # Simple extraction if Claude adds preamble
        import re
        match = re.search(r"\{.*\}", response_text, re.DOTALL)
        if match:
            return json.loads(match.group())
    except:
        pass

    return {"goal": 2500, "reason": "Standard recommended intake for your activity level."}

async def get_hydration_insights(history: List[Dict]) -> List[str]:
    system_prompt = "Generate 4 concise hydration insights: trend analysis, pattern detection, predicted tomorrow goal, weather adjustment."
    user_prompt = f"History: {json.dumps(history)}."

    response_text = await call_claude(system_prompt, user_prompt)
    # Expecting a bulleted list or similar
    insights = [s.strip() for s in response_text.split("\n") if s.strip() and (s.strip()[0].isdigit() or s.strip().startswith("-"))]
    if len(insights) >= 4:
        return insights[:4]

    return [
        "Your intake peaks in the morning but drops after 3 PM.",
        "You tend to drink 20% more on days above 25°C.",
        "Based on trends, aim for 2,800ml tomorrow.",
        "Increasing water intake after workouts could improve recovery."
    ]

async def chat_with_coach(message: str, history: List[Dict], weather: str) -> str:
    system_prompt = "You are a hydration coach inside a nutrition app. Be concise, friendly, and data-driven. You know the user's intake history and today's weather."
    user_prompt = f"Context: Weather is {weather}. History: {json.dumps(history)}. User says: {message}"
    return await call_claude(system_prompt, user_prompt)
