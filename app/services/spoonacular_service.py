import os
import requests
from typing import List, Dict, Optional

SPOONACULAR_API_KEY = os.getenv("SPOONACULAR_API_KEY")

BASE_SEARCH_URL = "https://api.spoonacular.com/recipes/complexSearch"


def search_recipes(
    query: str,
    diet: Optional[str] = None,
    max_time: Optional[int] = None,
    number: int = 10,
) -> List[Dict]:
    """
    Spoonacular PRIMARY search.
    Uses natural-language query.
    """

    if not SPOONACULAR_API_KEY:
        raise RuntimeError("Spoonacular API key not set")

    params = {
        "apiKey": SPOONACULAR_API_KEY,
        "query": query,                      # ✅ CORE FIX
        "addRecipeInformation": True,        # ingredients, instructions, time
        "fillIngredients": True,
        "number": number,
        "sort": "popularity",                # good default for busy pros
    }

    if diet:
        params["diet"] = diet

    if max_time:
        params["maxReadyTime"] = max_time

    response = requests.get(
        BASE_SEARCH_URL,
        params=params,
        timeout=10,
    )

    response.raise_for_status()
    data = response.json()

    return data.get("results", [])

def dedupe_spoonacular_results(results: list[dict]) -> list[dict]:
    seen = set()
    unique = []

    for r in results:
        key = (
            r.get("title", "").strip().lower(),
            r.get("readyInMinutes"),
        )
        if key in seen:
            continue
        seen.add(key)
        unique.append(r)

    return unique

