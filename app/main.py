from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from app.api.v1.routes import recipes
from app.api.v1.api import router as api_router
from app.db.database import engine
from app.db.models import Base  # THIS imports ALL models
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="AI Recipe Generator",
    version="0.1.0"
)

# Create tables AFTER models are loaded
Base.metadata.create_all(bind=engine)

app.include_router(recipes.router, prefix="/api")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], #Next.js dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")