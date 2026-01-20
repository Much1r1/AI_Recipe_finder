from fastapi import APIRouter
from app.api.v1.routes import recipes

router = APIRouter()
router.include_router(recipes.router, prefix="/recipes")
