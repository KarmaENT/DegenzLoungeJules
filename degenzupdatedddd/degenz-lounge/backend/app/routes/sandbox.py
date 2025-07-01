from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.models import schemas, models
from app.utils import auth
from app.services.ai import manager_agent

router = APIRouter()

@router.post("/start", response_model=schemas.Session)
def start_sandbox(session_data: schemas.SessionCreate, db: Session = Depends(get_db), 
                 current_user: schemas.User = Depends(auth.get_current_user)):
    """
    Start a new sandbox session
    """
    db_session = models.Session(
        name=session_data.name,
        description=session_data.description,
        owner_id=current_user.id,
        is_active=True
    )
    db.add(db_session)
    db.commit()
    db.refresh(db_session)
    return db_session

@router.get("/sessions", response_model=List[schemas.Session])
def get_sessions(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), 
                current_user: schemas.User = Depends(auth.get_current_user)):
    """
    Get all sandbox sessions for the current user
    """
    sessions = db.query(models.Session).filter(
        models.Session.owner_id == current_user.id
    ).offset(skip).limit(limit).all()
    return sessions

@router.get("/sessions/{session_id}", response_model=schemas.Session)
def get_session(session_id: int, db: Session = Depends(get_db), 
               current_user: schemas.User = Depends(auth.get_current_user)):
    """
    Get a specific sandbox session
    """
    session = db.query(models.Session).filter(
        models.Session.id == session_id,
        models.Session.owner_id == current_user.id
    ).first()
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found")
    return session

@router.post("/sessions/{session_id}/agents", status_code=status.HTTP_201_CREATED)
def add_agent_to_session(session_id: int, agent_id: int, is_manager: bool = False, 
                        db: Session = Depends(get_db), 
                        current_user: schemas.User = Depends(auth.get_current_user)):
    """
    Add an agent to a sandbox session
    """
    # Verify session exists and belongs to user
    session = db.query(models.Session).filter(
        models.Session.id == session_id,
        models.Session.owner_id == current_user.id
    ).first()
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Verify agent exists and belongs to user
    agent = db.query(models.Agent).filter(
        models.Agent.id == agent_id,
        models.Agent.owner_id == current_user.id
    ).first()
    if agent is None:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    # Check if agent is already in session
    existing = db.query(models.SessionAgent).filter(
        models.SessionAgent.session_id == session_id,
        models.SessionAgent.agent_id == agent_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Agent already in session")
    
    # If this is a manager agent, ensure there's no other manager
    if is_manager:
        existing_manager = db.query(models.SessionAgent).filter(
            models.SessionAgent.session_id == session_id,
            models.SessionAgent.is_manager == True
        ).first()
        if existing_manager:
            raise HTTPException(status_code=400, detail="Session already has a manager agent")
    
    # Add agent to session
    session_agent = models.SessionAgent(
        session_id=session_id,
        agent_id=agent_id,
        is_manager=is_manager
    )
    db.add(session_agent)
    db.commit()
    
    return {"status": "success", "message": "Agent added to session"}

@router.post("/sessions/{session_id}/message", response_model=schemas.Message)
async def send_message(session_id: int, message: schemas.MessageCreate, 
                     db: Session = Depends(get_db), 
                     current_user: schemas.User = Depends(auth.get_current_user)):
    """
    Send a message in a sandbox session
    """
    # Verify session exists and belongs to user
    session = db.query(models.Session).filter(
        models.Session.id == session_id,
        models.Session.owner_id == current_user.id
    ).first()
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Create message
    db_message = models.Message(
        content=message.content,
        session_id=session_id,
        user_id=current_user.id,
        parent_id=message.parent_id
    )
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    
    # If there's a manager agent, process the message
    manager = db.query(models.SessionAgent).filter(
        models.SessionAgent.session_id == session_id,
        models.SessionAgent.is_manager == True
    ).first()
    
    if manager:
        # This would be handled by WebSocket in the actual implementation
        # For now, we'll just return the message
        # In a real implementation, manager_agent.process_message would be called
        pass
    
    return db_message
