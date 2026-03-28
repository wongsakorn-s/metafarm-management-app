import os
from dotenv import load_dotenv

# Load environment variables first
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine
from . import models
from fastapi.staticfiles import StaticFiles
from .routers import hives, harvests, dashboard, inspections, weather

# Automatically create tables for MVP. In production, use Alembic migrations.
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Stingless Bee Hive Management API")

# Ensure static directory exists
if not os.path.exists("static/uploads"):
    os.makedirs("static/uploads", exist_ok=True)

# Mount static files to serve uploads
app.mount("/static", StaticFiles(directory="static"), name="static")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(hives.router)
app.include_router(harvests.router)
app.include_router(dashboard.router)
app.include_router(inspections.router)
app.include_router(weather.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Stingless Bee Hive Management API"}