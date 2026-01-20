from fastapi import APIRouter, HTTPException

from app.schemas.recipe_request import RecipeRequest
from app.schemas.recipe_response import RecipeListResponse
from app.services.spoonacular_service import search_recipes
from app.services.llm_service import parse_recipe_intent
from app.utils.recipe_normalizer import normalize_spoonacular_recipe
from app.utils.recipe_ranker import rank_recipes

router = APIRouter()


@router.post("/recipes/search", response_model=RecipeListResponse)
async def search_recipes_endpoint(payload: RecipeRequest):
    """
    AI-powered recipe search (Busy Professionals):
    - Parse intent
    - Broad Spoonacular search
    - Normalize
    - Rank
    """

    # 1️⃣ Parse intent (OPTIONAL, not blocking)
    intent = await parse_recipe_intent(payload.query)
    constraints = intent.get("constraints", {})

    # 2️⃣ Spoonacular does retrieval
    try:
        raw_recipes = search_recipes(
            query=payload.query,              # ✅ FULL QUERY
            diet=constraints.get("diet"),
            max_time=constraints.get("max_time"),
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

    # 3️⃣ Normalize
    normalized = [
        normalize_spoonacular_recipe(r)
        for r in raw_recipes
    ]

    # 4️⃣ Rank (busy professional logic)
    ranked = rank_recipes(
        recipes=normalized,
        query_ingredients=intent.get("ingredients", []),
        constraints=constraints,
    )

    return {
        "recipes": ranked,
        "message": "Recipes fetched successfully",
    }
