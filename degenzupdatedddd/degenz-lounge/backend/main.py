import os
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.database import get_db
from app.routes import agents, sandbox, auth
from app.routes import workflows, conflict_resolution, hierarchy
from app.routes import settings_routes # Added settings_routes import
from app.services.websocket.server import setup_websocket_routes

app = FastAPI(title="DeGeNz Lounge API", description="API for DeGeNz Lounge - AI Agent Orchestration Platform")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(agents.router, prefix="/agents", tags=["agents"])
app.include_router(sandbox.router, prefix="/sandbox", tags=["sandbox"])
app.include_router(auth.router, prefix="/auth", tags=["auth"])

# Include new collaboration feature routers
app.include_router(workflows.router, prefix="/workflows", tags=["workflows"])
app.include_router(conflict_resolution.router, prefix="/conflict-resolution", tags=["conflict-resolution"])
app.include_router(hierarchy.router, prefix="/hierarchy", tags=["hierarchy"])

# Include settings router
app.include_router(settings_routes.router, prefix="/api/settings", tags=["settings"]) # Registered settings_routes

# Setup WebSocket routes
setup_websocket_routes(app)

@app.get("/")
def read_root():
    return {"message": "Welcome to DeGeNz Lounge API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

