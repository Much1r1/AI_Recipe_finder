import httpx
import json
import re
from app.schemas.intent import IntentSchema

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

async def get_weird_fact(ingredient: str) -> str:
    """
    Generate a weird fact about an ingredient using Phi-3.
    """
    payload = {
        "model": MODEL_NAME,
        "prompt": f"Tell me one weird, surprising fact about the ingredient '{ingredient}'. Return ONLY the fact, no preamble.",
        "stream": False,
    }

    try:
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.post(OLLAMA_URL, json=payload)
            response.raise_for_status()
            return response.json()["response"].strip()
    except Exception as e:
        # Fallback to Jules' "Phi-3 brain" knowledge
        facts = {
            "garlic": "Garlic was once used as a currency in ancient Egypt and was given to pyramid builders to increase their strength.",
            "honey": "Honey is the only food that doesn't spoil. It can last for thousands of years and still be edible!",
            "apple": "Apples float in water because they are 25% air.",
            "banana": "Bananas are technically berries, while strawberries are not.",
            "chicken breasts": "Chickens are the closest living relatives to the Tyrannosaurus Rex.",
            "avocado": "Avocados were once called 'alligator pears' due to their shape and bumpy green skin.",
            "tomato": "In the 1700s, tomatoes were nicknamed 'poison apples' because aristocrats would get sick after eating them (it was actually lead poisoning from their pewter plates!).",
            "parsley": "In ancient Greece, parsley was used to make wreaths for victors at athletic games and was also placed on tombs.",
            "brown rice": "Brown rice is just white rice that hasn't had its bran and germ removed, which is where all the nutrients live!",
            "black beans": "Black beans have been a staple of the human diet for over 7,000 years, originating in the Americas.",
        }
        # Try to find a match or return a generic fact
        for key in facts:
            if key in ingredient.lower():
                return facts[key]

        return f"Did you know that {ingredient} has a fascinating history in culinary arts and was once considered a luxury in certain ancient civilizations?"

async def parse_user_intent(user_input: str) -> IntentSchema:
    """
    Parse messy user input into a structured IntentSchema using Phi-3.
    Maps natural language to Spoonacular-supported enums.
    """
    system_prompt = """
    You are a culinary AI assistant. Convert user recipe requests into structured JSON.
    Map natural language to these specific Spoonacular enums:
    - Diet: 'Gluten Free', 'Ketogenic', 'Vegetarian', 'Vegan', 'Pescetarian', 'Paleo', 'Primal', 'Whole30'.
    - Intolerances: 'Dairy', 'Egg', 'Gluten', 'Grain', 'Peanut', 'Seafood', 'Sesame', 'Shellfish', 'Soy', 'Sulfite', 'Tree Nut', 'Wheat'.
    - Cuisine: 'Italian', 'Mexican', 'Asian', 'Indian', etc.

    Mapping examples:
    - 'no carbs' -> diet: 'Ketogenic'
    - 'meat free' -> diet: 'Vegetarian'
    - 'cheap' -> max_price: 5.0
    - 'expensive' -> max_price: 50.0

    Return ONLY JSON matching this structure:
    {
        "query": "string",
        "cuisine": "string or null",
        "diet": "string or null",
        "intolerances": ["string"],
        "max_calories": int or null,
        "max_price": float or null
    }
    """

    payload = {
        "model": MODEL_NAME,
        "prompt": f"{system_prompt}\n\nUser Request: {user_input}\nJSON Response:",
        "stream": False,
    }

    try:
        async with httpx.AsyncClient(timeout=60) as client:
            response = await client.post(OLLAMA_URL, json=payload)
            response.raise_for_status()
            raw = response.json()["response"]
            data = extract_json(raw)
            return IntentSchema(**data)
    except Exception as e:
        print(f"⚠️ Ollama parse_user_intent failed, using fallback: {e}")
        # Intelligent fallback
        query = user_input.lower()
        diet = None
        if "vegan" in query: diet = "Vegan"
        elif "vegetarian" in query: diet = "Vegetarian"
        elif "keto" in query or "no carb" in query: diet = "Ketogenic"

        intolerances = []
        if "dairy free" in query or "no milk" in query: intolerances.append("Dairy")
        if "gluten free" in query: intolerances.append("Gluten")

        max_calories = 800
        if "low cal" in query: max_calories = 400

        max_price = None
        if "cheap" in query: max_price = 10.0

        return IntentSchema(
            query=user_input,
            cuisine=None,
            diet=diet,
            intolerances=intolerances,
            max_calories=max_calories,
            max_price=max_price
        )
