from pydantic import BaseModel, ConfigDict
from typing import List, Optional


class Recipe(BaseModel):
    id: Optional[int] = None
    title: str
    ingredients: List[str]
    instructions: List[str]
    ready_in_minutes: Optional[int] = None
    source_url: Optional[str] = None
    image: Optional[str] = None

    estimated_cost_kes: Optional[int] = None
    price_per_serving: Optional[float] = None
    calories: Optional[float] = None
    dietary_tags: List[str] = []
    protein_score: Optional[float] = None
    protein_per_cost: Optional[float] = None

    match_score: float | None = None
    reasons: List[str] | None = None

    model_config = ConfigDict(from_attributes=True, extra="allow")


class RecipeListResponse(BaseModel):
    recipes: List[Recipe]
    message: str
