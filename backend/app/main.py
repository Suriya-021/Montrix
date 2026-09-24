from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.db import init_db
from app.routes.expenses import router as expenses_router

# This "lifespan" function runs exactly once when the server starts up,
# and again when it shuts down. We use it to prepare things.
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Initializing database...")
    init_db()  # Creates the tables if they don't exist
    print("Database ready!")
    yield
    print("Shutting down server...")

# Create the FastAPI application instance.
app = FastAPI(
    title="Montrix API",
    version="1.0.0",
    description="Personal expense tracking API",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],       # Which websites can call this API
    allow_credentials=True,    # Allow cookies/auth headers
    allow_methods=["*"],       # Allow GET, POST, PUT, DELETE
    allow_headers=["*"],       # Allow all headers
)

# Connect our Expenses routes to the main app!
app.include_router(expenses_router)

@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "message": "Montrix API is running"
    }
