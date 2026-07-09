"""
AI-First CRM HCP Module - FastAPI Backend
Main application entry point.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import init_db
from routes import hcps, interactions, chat

# Create FastAPI app
app = FastAPI(
    title="AI-First CRM HCP Module",
    description="Healthcare Professional CRM with LangGraph AI Agent for managing interactions",
    version="1.0.0",
)

# CORS configuration for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(hcps.router)
app.include_router(interactions.router)
app.include_router(chat.router)


@app.on_event("startup")
async def startup_event():
    """Initialize database on startup."""
    init_db()
    print("[OK] Database initialized successfully!")
    print("[>>] AI-First CRM HCP Module is running!")
    print("[>>] API docs available at: http://localhost:8000/docs")


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "AI-First CRM HCP Module API",
        "version": "1.0.0",
        "docs": "/docs",
        "status": "running"
    }


@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
