from sqlalchemy import Column, Integer, String, Float, Text
from sqlalchemy.orm import relationship, Mapped
from sqlalchemy.orm import mapped_column
from app.db.base import Base
from app.db.models.recipe_ingredient import recipe_ingredient


class RecipeDB(Base):
    __tablename__ = "recipes"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String, nullable=False)
    instructions: Mapped[str] = mapped_column(Text, nullable=False)

    ready_in_minutes: Mapped[int | None] = mapped_column(Integer)
    source_url: Mapped[str | None] = mapped_column(String)
    estimated_cost_kes: Mapped[int | None] = mapped_column(Integer)

    protein_score: Mapped[float | None] = mapped_column(Float)
    protein_per_cost: Mapped[float | None] = mapped_column(Float)

    ingredients = relationship(
        "IngredientDB",
        secondary=recipe_ingredient,
        back_populates="recipes",
    )
