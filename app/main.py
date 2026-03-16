from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.api import router as api_router
from app.db.database import engine
from app.db.database import Base
import app.models

app = FastAPI(
    title="QuickBite AI Nutrition Platform",
    version="1.0.0"
)

# In production, these should be restricted
origins = [
    "https://ai-recipe-finder-seven.vercel.app",
    "https://ai-recipe-finder-git-main-elvis-projects-4d0bcc9f.vercel.app",
    "http://localhost:3000",
    "http://localhost:8080",
]

# Create tables (Note: In production use Alembic)
Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")

@app.get("/")
async def root():
    return {"message": "QuickBite API is running"}
