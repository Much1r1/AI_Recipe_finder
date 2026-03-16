from typing import List, Dict, Set
from app.utils.explanation_builder import build_explanations

def rank_recipes(
    recipes: List[Dict],
    query_ingredients: List[str],
    constraints: Dict | None = None,
    persona: str = "busy_professional",
) -> List[Dict]:
    """
    Busy-professional ranking with explanations.
    """

    query_set: Set[str] = set(q.lower() for q in query_ingredients)
    # Use a high default if no time constraint is provided to avoid over-filtering
    max_time = constraints.get("max_time") if constraints else None
    if max_time is None:
        max_time = 999

    scored = []

    for recipe in recipes:
        ingredients = {
            ing.lower()
            for ing in recipe.get("ingredients", [])
        }

        matched = ingredients & query_set

        # If it's a multi-word query, the exact intersection will likely be empty.
        # We relax the hard filter for longer queries.
        query_is_complex = any(len(q.split()) > 1 for q in query_ingredients)
        if not matched and not query_is_complex:
            # Check for partial matches in query_ingredients
            has_partial = False
            for q in query_ingredients:
                for ing in ingredients:
                    if q in ing or ing in q:
                        has_partial = True
                        break
                if has_partial: break

            if not has_partial:
                continue

        score = 0.0
        reasons = []

        # ⏱ TIME
        time = recipe.get("ready_in_minutes")
        if time:
            if time is None or time> max_time:
                continue # hard filter
            score += max(0, 12 - time / 4)
            reasons.append(f"Ready in {time} minutes")

        # 🥘 INGREDIENT SIMPLICITY
        ingredient_count = len(ingredients)
        if ingredient_count:
            score += max(0, 8 - len(ingredients))
            reasons.append(f"Only {ingredient_count} ingredients")

        # 💪 PROTEIN
        protein = recipe.get("protein_score")
        if protein:
            score += min(protein * 0.15, 6)
            reasons.append("High protein")

        # 🔍 QUERY MATCH
        match_ratio = len(matched) / len(query_set)
        score += match_ratio * 5
        reasons.append("Strong ingredient match")

        # 💰 COST
        cost = recipe.get("estimated_cost_kes")
        if cost:
            score += max(0, 5 - (cost / 100))
            reasons.append("Good value per serving")

        recipe["match_score"] = round(score, 2)
        recipe["explanation"] = build_explanations(
            recipe=recipe,
            query_ingredients=query_ingredients,
            persona="busy_professional",
        )

        scored.append(recipe)

    scored.sort(key=lambda r: r["match_score"], reverse=True)

    # De-duplicate by title
    seen = set()
    unique = []
    for r in scored:
        key = r["title"].lower().strip()
        if key in seen:
            continue
        seen.add(key)
        unique.append(r)

    return unique[:5]
