from sqlalchemy import func
from sqlalchemy.orm import Session
from app.db import models
from app.db.models import RecipeDB, IngredientDB

def get_recipes_by_ingredients(
    db: Session,
    ingredient_names: list[str],
):

    if not ingredient_names:
        return []
    
    results = (
        db.query(
            RecipeDB,
            func.count(IngredientDB.id).label("match_count")
        )
        .join(RecipeDB.ingredients)
        .filter(IngredientDB.name.in_(ingredient_names))
        .group_by(RecipeDB.id)
        .order_by(func.count(IngredientDB.id).desc())
        .all()
    )
    return results


def get_or_create_ingredient(db: Session, name: str):
    ingredient = (
        db.query(models.IngredientDB)
        .filter(models.IngredientDB.name == name)
        .first()
    )
    if ingredient:
        return ingredient

    ingredient = models.IngredientDB(name=name)
    db.add(ingredient)
    db.commit()
    db.refresh(ingredient)
    return ingredient


def create_recipe(db: Session, recipe_data: dict):
    recipe = models.RecipeDB(
        title=recipe_data["title"],
        ready_in_minutes=recipe_data["ready_in_minutes"],
        source_url=recipe_data["source_url"],
        estimated_cost_kes=recipe_data["estimated_cost_kes"],
        protein_score=recipe_data.get("protein_score"),
        protein_per_cost=recipe_data.get("protein_per_cost"),
    )

    db.add(recipe)
    db.commit()
    db.refresh(recipe)

    for ing in recipe_data["ingredients"]:
        ingredient = get_or_create_ingredient(db, ing)
        recipe.ingredients.append(ingredient)

    db.commit()
    db.refresh(recipe)
    return recipe
