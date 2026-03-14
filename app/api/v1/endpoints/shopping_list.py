from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def get_root():
    return {"message": "Endpoint for shopping_list is under development"}
