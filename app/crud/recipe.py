from sqlalchemy.orm import Session
from typing import List
from sqlalchemy import func

from app.db.models import RecipeDB, IngredientDB


# -------------------------
# INGREDIENT HELPERS
# -------------------------

def get_or_create_ingredient(db: Session, name: str) -> IngredientDB:
    name = name.strip().lower()

    ingredient = (
        db.query(IngredientDB)
        .filter(IngredientDB.name == name)
        .first()
    )
    if ingredient:
        return ingredient

    ingredient = IngredientDB(name=name)
    db.add(ingredient)
    db.commit()
    db.refresh(ingredient)
    return ingredient


# -------------------------
# RECIPE CREATION
# -------------------------

def create_recipe(
    db: Session,
    data: dict,
) -> RecipeDB:
    """
    Creates a recipe and safely attaches ingredients
    without violating UNIQUE constraints.
    """

    ingredients: List[str] = data.get("ingredients", [])

    # Normalize + deduplicate ingredients
    unique_ingredients = {
        ing.strip().lower()
        for ing in ingredients
        if ing.strip()
    }

    recipe = RecipeDB(
        title=data["title"],
        instructions=" ".join(data["instructions"]),
        ready_in_minutes=data.get("ready_in_minutes"),
        source_url=data.get("source_url"),
        estimated_cost_kes=data.get("estimated_cost_kes"),
        protein_score=data.get("protein_score"),
        protein_per_cost=data.get("protein_per_cost"),
    )

    db.add(recipe)
    db.commit()
    db.refresh(recipe)

    # Attach ingredients safely
    for ingredient_name in unique_ingredients:
        ingredient = get_or_create_ingredient(db, ingredient_name)

        if ingredient not in recipe.ingredients:
            recipe.ingredients.append(ingredient)

    db.commit()
    db.refresh(recipe)

    return recipe


# -------------------------
# SEARCH
# -------------------------

def get_recipes_by_ingredients(
    db: Session,
    ingredient_names: List[str],
):
    """
    Return recipes that contain ALL given ingredients.
    """

    if not ingredient_names:
        return []

    results = (
        db.query(
            RecipeDB,
            func.count(IngredientDB.id).label("match_count"))
        .join(RecipeDB.ingredients)
        .filter(IngredientDB.name.in_(ingredient_names))
        .group_by(RecipeDB.id)
        .order_by(func.count(IngredientDB.id).desc())
        .all()
    )

    return results
