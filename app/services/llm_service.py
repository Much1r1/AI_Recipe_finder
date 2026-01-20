import httpx
import json
import re

OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL_NAME = "phi3"


def extract_json(text: str) -> dict:
    match = re.search(r"\{[\s\S]*\}", text)
    if not match:
        raise ValueError("No JSON object found")
    return json.loads(match.group())


async def parse_recipe_intent(query: str) -> dict:
    payload = {
        "model": MODEL_NAME,
        "prompt": f"""
Extract ingredients and constraints from this recipe request.

Return JSON ONLY in this format:
{{
  "ingredients": [],
  "constraints": {{}}
}}

Request:
{query}
""",
        "stream": False,
    }

    try:
        async with httpx.AsyncClient(timeout=240) as client:
            response = await client.post(OLLAMA_URL, json=payload)
            response.raise_for_status()

            raw = response.json()["response"]
            return extract_json(raw)

    except Exception as e:
        print("⚠️ Ollama failed, using fallback:", e)
        return {
            "ingredients": [
                w for w in re.findall(r"[a-zA-Z]+", query.lower())
                if len(w) > 2
            ],
            "constraints": {},
        }
