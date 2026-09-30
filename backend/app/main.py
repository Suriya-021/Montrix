from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.database_orm import engine, Base

from app.routes.expenses import router as expenses_router
from app.routes.budgets import router as budgets_router
from app.routes.subscriptions import router as subscriptions_router
from app.routes.goals import router as goals_router
from app.routes.income import router as income_router
from app.routes.insights import router as insights_router
from app.routes import auth

# This "lifespan" function runs exactly once when the server starts up,
# and again when it shuts down. We use it to prepare things.
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Initializing database...")
    Base.metadata.create_all(bind=engine)
    print("Database ready!")
    yield
    print("Shutting down server...")

from dotenv import load_dotenv

load_dotenv() # Load environment variables from .env file

# Create the FastAPI application instance.
app = FastAPI(
    title="Montrix API",
    version="1.0.0",
    description="Personal expense tracking API",
    lifespan=lifespan
)

import os

# CORS Configuration
# In production, we don't want to allow all origins ("*"). We read allowed origins from the environment.
origins_str = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173")
origins = [origin.strip() for origin in origins_str.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,    # Allow cookies/auth headers
    allow_methods=["*"],       # Allow GET, POST, PUT, DELETE
    allow_headers=["*"],       # Allow all headers
)

# Connect our routes to the main app!
app.include_router(expenses_router)
app.include_router(budgets_router, prefix="/api/budgets", tags=["Budgets"])
app.include_router(subscriptions_router, prefix="/api/subscriptions", tags=["Subscriptions"])
app.include_router(goals_router, prefix="/api/goals", tags=["Goals"])
app.include_router(income_router, prefix="/api/income", tags=["Income"])
app.include_router(insights_router)
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])

@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "message": "Montrix API is running"
    }
