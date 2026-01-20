from pydantic import BaseModel
from typing import Optional

class Ingredient(BaseModel):
    name: str
    quantity: Optional[str] = None
