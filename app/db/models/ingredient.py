from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.db.base import Base
from app.db.models.recipe_ingredient import recipe_ingredient


class IngredientDB(Base):
    __tablename__ = "ingredients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)

    recipes = relationship(
        "RecipeDB",
        secondary=recipe_ingredient,
        back_populates="ingredients",
    )
