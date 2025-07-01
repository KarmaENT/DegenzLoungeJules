from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.models import schemas, models
from app.utils import auth

router = APIRouter()

@router.post("/", response_model=schemas.Agent)
def create_agent(agent: schemas.AgentCreate, db: Session = Depends(get_db), current_user: schemas.User = Depends(auth.get_current_user)):
    """
    Create a new agent
    """
    db_agent = models.Agent(
        name=agent.name,
        role=agent.role,
        personality=agent.personality,
        system_instructions=agent.system_instructions,
        examples=agent.examples,
        owner_id=current_user.id
    )
    db.add(db_agent)
    db.commit()
    db.refresh(db_agent)
    return db_agent

@router.get("/", response_model=List[schemas.Agent])
def read_agents(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: schemas.User = Depends(auth.get_current_user)):
    """
    Retrieve all agents owned by the current user
    """
    agents = db.query(models.Agent).filter(models.Agent.owner_id == current_user.id).offset(skip).limit(limit).all()
    return agents

@router.get("/{agent_id}", response_model=schemas.Agent)
def read_agent(agent_id: int, db: Session = Depends(get_db), current_user: schemas.User = Depends(auth.get_current_user)):
    """
    Retrieve a specific agent by ID
    """
    agent = db.query(models.Agent).filter(models.Agent.id == agent_id, models.Agent.owner_id == current_user.id).first()
    if agent is None:
        raise HTTPException(status_code=404, detail="Agent not found")
    return agent

@router.put("/{agent_id}", response_model=schemas.Agent)
def update_agent(agent_id: int, agent: schemas.AgentCreate, db: Session = Depends(get_db), current_user: schemas.User = Depends(auth.get_current_user)):
    """
    Update an existing agent
    """
    db_agent = db.query(models.Agent).filter(models.Agent.id == agent_id, models.Agent.owner_id == current_user.id).first()
    if db_agent is None:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    for key, value in agent.dict().items():
        setattr(db_agent, key, value)
    
    db.commit()
    db.refresh(db_agent)
    return db_agent

@router.delete("/{agent_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_agent(agent_id: int, db: Session = Depends(get_db), current_user: schemas.User = Depends(auth.get_current_user)):
    """
    Delete an agent
    """
    db_agent = db.query(models.Agent).filter(models.Agent.id == agent_id, models.Agent.owner_id == current_user.id).first()
    if db_agent is None:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    db.delete(db_agent)
    db.commit()
    return None
