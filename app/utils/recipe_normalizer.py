from typing import Dict, Any, List
from app.utils.cost_calculator import estimate_recipe_cost
from app.utils.nutrition_utils import calculate_protein_score


def normalize_spoonacular_recipe(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Normalize Spoonacular recipe data into a STABLE internal format.

    This output is:
    - ranking-safe
    - frontend-safe
    - schema-aligned
    """

    # ---------- INGREDIENTS ----------
    raw_ingredients = data.get("extendedIngredients", [])
    ingredient_set = set()

    for ing in raw_ingredients:
        name = ing.get("name")
        if name:
            ingredient_set.add(name.lower().strip())

    ingredients: List[str] = sorted(ingredient_set)

    # ---------- INSTRUCTIONS ----------
    instructions: List[str] = []

    analyzed = data.get("analyzedInstructions", [])
    if analyzed:
        for block in analyzed:
            for step in block.get("steps", []):
                text = step.get("step")
                if text:
                    instructions.append(text.strip())

    if not instructions and data.get("instructions"):
        instructions = [
            s.strip()
            for s in data["instructions"].split(".")
            if s.strip()
        ]

    if not instructions:
        instructions = ["No instructions provided."]

    # ---------- COST & NUTRITION ----------
    estimated_cost = estimate_recipe_cost(ingredients)
    protein_score = calculate_protein_score(data)

    protein_per_cost = None
    if protein_score is not None and estimated_cost > 0:
        protein_per_cost = round(protein_score / estimated_cost, 4)

    # ---------- NORMALIZED OUTPUT ----------
    return {
        "id": data.get("id"),
        "title": data.get("title", "Untitled Recipe"),
        "ingredients": sorted(list(ingredients)),
        "instructions": instructions,
        "ready_in_minutes": data.get("readyInMinutes"),
        "source_url": data.get("sourceUrl"),
        "image": data.get("image"),

        # ranking + personalization signals
        "estimated_cost_kes": estimated_cost,
        "protein_score": protein_score,
        "protein_per_cost": protein_per_cost,
        "popularity": data.get("aggregateLikes", 0),
    }
