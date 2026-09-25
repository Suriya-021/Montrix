from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.db import init_db
from app.routes.expenses import router as expenses_router
from app.routes import auth

# This "lifespan" function runs exactly once when the server starts up,
# and again when it shuts down. We use it to prepare things.
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Initializing database...")
    init_db()  # Creates the tables if they don't exist
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
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])

@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "message": "Montrix API is running"
    }
