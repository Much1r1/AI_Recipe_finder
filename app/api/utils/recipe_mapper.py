from typing import List, Dict, Set
import re


def rank_recipes(
    recipes: List[Dict],
    query_ingredients: List[str],
    constraints: Dict | None = None,
) -> List[Dict]:
    """
    Busy-professional ranking (SOFT constraints, never empty):
    - Fast to cook
    - Few ingredients
    - High protein
    - Strong intent match
    """

    query_set: Set[str] = set(q.lower() for q in query_ingredients)
    scored: List[Dict] = []

    max_time = constraints.get("max_time", 30) if constraints else 30

    for recipe in recipes:
        ingredients = {
            ing.lower()
            for ing in recipe.get("ingredients", [])
            if ing
        }

        score = 0.0
        reasons = []

        # 1️⃣ TIME (SOFT penalty, not rejection)
        time = recipe.get("ready_in_minutes")
        if time is None:
            score -= 2
            reasons.append("Cooking time unknown")
        else:
            if time <= max_time:
                score += 8
                reasons.append(f"Ready in {time} minutes")
            else:
                penalty = min((time - max_time) / 5, 5)
                score -= penalty
                reasons.append(f"Takes {time} minutes")

        # 2️⃣ INGREDIENT SIMPLICITY
        ingredient_count = len(ingredients)
        if ingredient_count:
            simplicity_score = max(0, 6 - ingredient_count)
            score += simplicity_score
            if ingredient_count <= 6:
                reasons.append("Simple ingredient list")

        # 3️⃣ PROTEIN (ENERGY)
        protein_score = recipe.get("protein")
        if protein_score:
            protein_boost = min(protein_score * 0.15, 5)
            score += protein_boost
            reasons.append("High protein")

        # 4️⃣ QUERY MATCH (SOFT relevance)
        if query_set:
            matched = ingredients & query_set
            match_ratio = len(matched) / len(query_set)
            score += match_ratio * 5
            if matched:
                reasons.append("Matches your ingredients")

        # 5️⃣ COST (light influence)
        cost = recipe.get("estimated_cost_kes")
        if cost:
            score += max(0, 4 - (cost / 150))

        recipe["match_score"] = round(score, 2)
        recipe["reasons"] = reasons
        scored.append(recipe)

    # 🔽 SORT
    scored.sort(key=lambda r: r["match_score"], reverse=True)

    # 🔁 Deduplicate Spoonacular variants
    seen_titles = set()
    unique_results = []
    for r in scored:
        key = r.get("title", "").lower().strip()
        if key in seen_titles:
            continue
        seen_titles.add(key)
        unique_results.append(r)

    # 🎯 Always return something
    return unique_results[:5]

