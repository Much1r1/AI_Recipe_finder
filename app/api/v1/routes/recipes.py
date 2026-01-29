from fastapi import APIRouter, HTTPException

from app.schemas.recipe_request import RecipeRequest
from app.schemas.recipe_response import RecipeListResponse
from app.services.spoonacular_service import search_recipes, get_random_ingredient
from app.services.llm_service import parse_user_intent, get_weird_fact
from app.utils.recipe_normalizer import normalize_spoonacular_recipe
from app.utils.recipe_ranker import rank_recipes

router = APIRouter()


@router.post("/recipes/search", response_model=RecipeListResponse)
async def search_recipes_endpoint(payload: RecipeRequest):
    """
    AI-powered recipe search:
    - Parse intent using Phi-3
    - Structured Spoonacular search
    - Normalize
    - Rank
    """

    # 1️⃣ Parse intent
    try:
        intent = await parse_user_intent(payload.query)
    except Exception as e:
        print(f"Intent parsing failed: {e}")
        # Fallback to a basic intent if parsing fails completely
        from app.schemas.intent import IntentSchema
        intent = IntentSchema(query=payload.query)

    # 2️⃣ Spoonacular does retrieval
    try:
        raw_recipes = search_recipes(
            query=intent.query,
            diet=intent.diet,
            cuisine=intent.cuisine,
            intolerances=intent.intolerances,
            max_calories=intent.max_calories,
            max_price=intent.max_price,
            number=15,
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Spoonacular error: {str(e)}",
        )

    if not raw_recipes:
        return {
            "recipes": [],
            "message": "No recipes found",
        }

    # 3️⃣ Normalize and Deduplicate
    normalized = []
    seen_ids = set()
    seen_backups = set()

    for r in raw_recipes:
        norm = normalize_spoonacular_recipe(r)
        rid = norm.get("id")
        backup_key = f"{norm.get('title')}-{norm.get('source_url')}"

        if rid and rid in seen_ids:
            continue
        if backup_key in seen_backups:
            continue

        if rid: seen_ids.add(rid)
        seen_backups.add(backup_key)
        normalized.append(norm)

    # 4️⃣ Rank (busy professional logic)
    ranked = rank_recipes(
        recipes=normalized,
        query_ingredients=[intent.query],
        constraints={
            "diet": intent.diet,
            "max_calories": intent.max_calories,
            "max_price": intent.max_price
        },
    )

    return {
        "recipes": ranked,
        "message": "Recipes fetched successfully",
    }


@router.get("/verify/random-fact")
async def verify_random_fact():
    """
    Verification endpoint for Jules to prove connectivity and AI capability.
    """
    ingredient = get_random_ingredient()
    fact = await get_weird_fact(ingredient)
    return {
        "ingredient": ingredient,
        "weird_fact": fact,
        "phi3_brain_active": True
    }
