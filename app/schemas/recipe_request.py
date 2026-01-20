from pydantic import BaseModel
from typing import Optional

class RecipeRequest(BaseModel):
    query: str
    #persona: Optional[str] = "busy_professional"
