from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Float,
    DateTime,
    Table,
    ForeignKey,
)
from datetime import datetime
from app.db.database import Base
from sqlalchemy.orm import relationship
from app.db.base import Base

recipe_ingredients = Table(
    "recipe_ingredients",
    Base.metadata,
    Column("recipe_id", ForeignKey("recipes.id"), primary_key=True),
    Column("ingredient_id", ForeignKey("ingredients.id"), primary_key=True),
)


class RecipeDB(Base):
    __tablename__ = "recipes"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    instructions = Column(Text, nullable=False)
    ready_in_minutes = Column(Integer)
    source_url = Column(String)
    estimated_cost_kes = Column(Integer)
    protein_score = Column(Float)
    protein_per_cost = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)

    ingredients = relationship(
        "ingredient",
        secondary=recipe_ingredients,
        back_populates="recipes"
    )


class IngredientDB(Base):
    __tablename__ = "ingredients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)

    recipes = relationship(
        "Recipe",
        secondary=recipe_ingredients,
        back_populates="ingredients",
    )
