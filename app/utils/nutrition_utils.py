def calculate_protein_score(recipe_data: dict) -> float | None:
    """
    Extracts total protein (grams) from Spoonacular nutrition data
    """

    nutrition = recipe_data.get("nutrition", {})
    nutrients = nutrition.get("nutrients", [])

    for nutrient in nutrients:
        if nutrient.get("name", "").lower() == "protein":
            return float(nutrient.get("amount", 0))

    return None
