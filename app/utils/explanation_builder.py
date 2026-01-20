from typing import List, Dict


def build_explanations(
    recipe: Dict,
    query_ingredients: List[str],
    persona: str,
) -> List[str]:
    reasons: List[str] = []

    # --- TIME ---
    time = recipe.get("ready_in_minutes")
    if time:
        if time <= 20:
            reasons.append(f"Ready in just {time} minutes")
        elif time <= 30:
            reasons.append(f"Quick to prepare ({time} minutes)")

    # --- INGREDIENT MATCH ---
    ingredients = set(recipe.get("ingredients", []))
    matched = ingredients & set(q.lower() for q in query_ingredients)

    if matched:
        reasons.append(
            f"Uses {len(matched)} of your ingredients"
        )

    # --- PROTEIN ---
    protein = recipe.get("protein")
    if protein and protein >= 20:
        reasons.append("High protein for sustained energy")

    # --- COST ---
    cost = recipe.get("estimated_cost_kes")
    if cost and cost <= 500:
        reasons.append("Budget-friendly ingredients")

    # --- FALLBACK ---
    if not reasons:
        reasons.append("Well balanced and practical")

    return reasons
