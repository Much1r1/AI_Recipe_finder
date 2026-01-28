from pydantic import BaseModel, Field
from typing import Optional, List

class IntentSchema(BaseModel):
    query: str = Field(..., description="The main search query or ingredients")
    cuisine: Optional[str] = Field(None, description="Spoonacular supported cuisine (e.g., Italian, Mexican, etc.)")
    diet: Optional[str] = Field(None, description="Spoonacular supported diet (e.g., Vegetarian, Vegan, Ketogenic, etc.)")
    intolerances: Optional[List[str]] = Field(default_factory=list, description="List of intolerances (e.g., Dairy, Egg, Gluten, etc.)")
    max_calories: Optional[int] = Field(None, description="Maximum calories per serving")
    max_price: Optional[float] = Field(None, description="Maximum price per serving in USD")
