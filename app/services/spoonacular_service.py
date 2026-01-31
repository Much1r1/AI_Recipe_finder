import os
import requests
import sqlite3
import random
from typing import List, Dict, Optional

SPOONACULAR_API_KEY = os.getenv("SPOONACULAR_API_KEY")

BASE_SEARCH_URL = "https://api.spoonacular.com/recipes/complexSearch"


def search_recipes(
    query: str,
    diet: Optional[str] = None,
    cuisine: Optional[str] = None,
    intolerances: Optional[List[str]] = None,
    max_calories: Optional[int] = None,
    max_price: Optional[float] = None,
    max_time: Optional[int] = None,
    recipe_type: Optional[str] = None,
    number: int = 10,
) -> List[Dict]:
    """
    Spoonacular PRIMARY search.
    Uses natural-language query and structured filters.
    """

    if not SPOONACULAR_API_KEY:
        print("⚠️ Spoonacular API key missing")
        return []

    params = {
        "apiKey": SPOONACULAR_API_KEY,
        "query": query,
        "addRecipeInformation": True,        # ingredients, instructions, time
        "addRecipeNutrition": True,
        "fillIngredients": True,
        "number": number,
        "sort": "popularity",                # good default for busy pros
    }

    if diet:
        params["diet"] = diet

    if cuisine:
        params["cuisine"] = cuisine

    if intolerances and len(intolerances) > 0:
        params["intolerances"] = ",".join(intolerances)

    if max_calories is not None:
        params["maxCalories"] = max_calories

    if max_price is not None:
        params["maxPrice"] = max_price

    if max_time is not None:
        params["maxReadyTime"] = max_time

    if recipe_type:
        params["type"] = recipe_type

    print(f"--- [SEARCH TRACE] Spoonacular Params: {params} ---")

    try:
        response = requests.get(
            BASE_SEARCH_URL,
            params=params,
            timeout=10,
        )
        response.raise_for_status()
        data = response.json()
        results = data.get("results", [])
        print(f"--- [SEARCH TRACE] Total Results from Spoonacular: {len(results)} ---")
        return results
    except Exception as e:
        print(f"⚠️ Spoonacular search failed: {e}")
        return []

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

def get_random_ingredient() -> str:
    """
    Fetch a random ingredient from Spoonacular or fallback to local DB.
    """
    if SPOONACULAR_API_KEY:
        try:
            url = "https://api.spoonacular.com/recipes/random"
            params = {"apiKey": SPOONACULAR_API_KEY, "number": 1}
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()
            recipes = data.get("recipes", [])
            if recipes:
                # Pick a random ingredient from the random recipe
                recipe = recipes[0]
                ingredients = recipe.get("extendedIngredients", [])
                if ingredients:
                    return random.choice(ingredients).get("name", "Garlic")
        except Exception as e:
            print(f"Spoonacular random failed: {e}")

    # Fallback to local database
    try:
        conn = sqlite3.connect("./recipes.db")
        cursor = conn.cursor()
        cursor.execute("SELECT name FROM ingredients ORDER BY RANDOM() LIMIT 1;")
        row = cursor.fetchone()
        conn.close()
        if row:
            return row[0]
    except Exception as e:
        print(f"Local DB fallback failed: {e}")

    return "Garlic"  # Ultimate fallback
