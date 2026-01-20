# Average prices in KES (VERY rough, adjustable)
INGREDIENT_COSTS = {
    "chicken": 400,
    "rice": 200,
    "egg": 30,
    "onion": 20,
    "tomato": 20,
    "garlic": 10,
    "beans": 150,
    "potato": 30,
    "beef": 500,
    "fish": 450,
}

DEFAULT_COST = 50  # fallback per ingredient


def estimate_recipe_cost(ingredients: list[str]) -> int:
    """
    Estimate total recipe cost in KES.
    """

    total = 0

    for ingredient in ingredients:
        key = ingredient.lower()
        total += INGREDIENT_COSTS.get(key, DEFAULT_COST)

    return total
