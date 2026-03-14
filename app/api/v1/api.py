from fastapi import APIRouter
from app.api.v1.endpoints import recipes, auth, tracker, meal_planner, shopping_list, barcode, community

router = APIRouter()
router.include_router(recipes.router, prefix="/recipes", tags=["recipes"])
router.include_router(auth.router, prefix="/auth", tags=["auth"])
router.include_router(tracker.router, prefix="/tracker", tags=["tracker"])
router.include_router(meal_planner.router, prefix="/meal-planner", tags=["meal-planner"])
router.include_router(shopping_list.router, prefix="/shopping-list", tags=["shopping-list"])
router.include_router(barcode.router, prefix="/barcode", tags=["barcode"])
router.include_router(community.router, prefix="/community", tags=["community"])
