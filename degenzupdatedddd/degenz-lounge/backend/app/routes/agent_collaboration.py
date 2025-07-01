from fastapi import APIRouter, Depends, HTTPException, status, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any

from app.database import get_db
from app.models import schemas, models
from app.utils import auth
from app.services.websocket.server import websocket_manager

router = APIRouter()

@router.post("/direct-messages/", response_model=schemas.DirectMessage)
async def create_direct_message(
    message: schemas.DirectMessageCreate, 
    db: Session = Depends(get_db), 
    current_user: schemas.User = Depends(auth.get_current_user)
):
    """
    Create a direct message between agents
    """
    # Verify that the sender and recipient agents exist and are in the same session
    sender_agent = db.query(models.SessionAgent).filter(models.SessionAgent.id == message.sender_agent_id).first()
    if not sender_agent:
        raise HTTPException(status_code=404, detail="Sender agent not found")
    
    recipient_agent = db.query(models.SessionAgent).filter(models.SessionAgent.id == message.recipient_agent_id).first()
    if not recipient_agent:
        raise HTTPException(status_code=404, detail="Recipient agent not found")
    
    # Verify that both agents are in the same session
    if sender_agent.session_id != recipient_agent.session_id:
        raise HTTPException(status_code=400, detail="Agents must be in the same session")
    
    # Verify that the session belongs to the current user
    session = db.query(models.Session).filter(models.Session.id == sender_agent.session_id).first()
    if session.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this session")
    
    # Create the direct message
    db_direct_message = models.DirectMessage(
        content=message.content,
        session_id=message.session_id,
        sender_agent_id=message.sender_agent_id,
        recipient_agent_id=message.recipient_agent_id,
        is_private=message.is_private
    )
    db.add(db_direct_message)
    db.commit()
    db.refresh(db_direct_message)
    
    # Notify via WebSocket if available
    try:
        # Get agent details for the message
        sender = db.query(models.Agent).join(models.SessionAgent).filter(models.SessionAgent.id == message.sender_agent_id).first()
        recipient = db.query(models.Agent).join(models.SessionAgent).filter(models.SessionAgent.id == message.recipient_agent_id).first()
        
        # Prepare the message data
        message_data = {
            "id": db_direct_message.id,
            "content": db_direct_message.content,
            "sender_name": sender.name if sender else "Unknown Agent",
            "sender_role": sender.role if sender else "Unknown Role",
            "recipient_name": recipient.name if recipient else "Unknown Agent",
            "recipient_role": recipient.role if recipient else "Unknown Role",
            "is_private": db_direct_message.is_private,
            "timestamp": db_direct_message.created_at.isoformat()
        }
        
        # Send the message via WebSocket
        if db_direct_message.is_private:
            # Only send to the recipient's client
            await websocket_manager.send_direct_agent_message(
                str(message.session_id),
                message_data
            )
        else:
            # Send to all clients in the session
            await websocket_manager.broadcast_agent_to_agent_message(
                str(message.session_id),
                message_data
            )
    except Exception as e:
        # Log the error but don't fail the request
        print(f"WebSocket notification error: {str(e)}")
    
    return db_direct_message

@router.get("/direct-messages/session/{session_id}", response_model=List[schemas.DirectMessage])
def read_direct_messages_by_session(
    session_id: int, 
    is_private: Optional[bool] = None,
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db), 
    current_user: schemas.User = Depends(auth.get_current_user)
):
    """
    Retrieve direct messages for a session
    """
    # Verify that the session belongs to the current user
    session = db.query(models.Session).filter(models.Session.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    if session.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this session")
    
    # Query direct messages
    query = db.query(models.DirectMessage).filter(models.DirectMessage.session_id == session_id)
    
    # Filter by privacy if specified
    if is_private is not None:
        query = query.filter(models.DirectMessage.is_private == is_private)
    
    # Apply pagination
    direct_messages = query.order_by(models.DirectMessage.created_at).offset(skip).limit(limit).all()
    
    return direct_messages

@router.get("/direct-messages/agent/{agent_id}", response_model=List[schemas.DirectMessage])
def read_direct_messages_by_agent(
    agent_id: int, 
    is_sender: Optional[bool] = None,
    is_private: Optional[bool] = None,
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db), 
    current_user: schemas.User = Depends(auth.get_current_user)
):
    """
    Retrieve direct messages for a specific agent
    """
    # Verify that the agent exists and belongs to a session owned by the current user
    session_agent = db.query(models.SessionAgent).filter(models.SessionAgent.id == agent_id).first()
    if not session_agent:
        raise HTTPException(status_code=404, detail="Agent not found in any session")
    
    session = db.query(models.Session).filter(models.Session.id == session_agent.session_id).first()
    if session.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this agent")
    
    # Query direct messages
    query = db.query(models.DirectMessage)
    
    # Filter by sender/recipient
    if is_sender is None:
        # Get messages where the agent is either sender or recipient
        query = query.filter(
            (models.DirectMessage.sender_agent_id == agent_id) | 
            (models.DirectMessage.recipient_agent_id == agent_id)
        )
    elif is_sender:
        # Get messages where the agent is the sender
        query = query.filter(models.DirectMessage.sender_agent_id == agent_id)
    else:
        # Get messages where the agent is the recipient
        query = query.filter(models.DirectMessage.recipient_agent_id == agent_id)
    
    # Filter by privacy if specified
    if is_private is not None:
        query = query.filter(models.DirectMessage.is_private == is_private)
    
    # Apply pagination
    direct_messages = query.order_by(models.DirectMessage.created_at).offset(skip).limit(limit).all()
    
    return direct_messages

@router.post("/agent-relationships/", response_model=schemas.AgentRelationship)
def create_agent_relationship(
    relationship: schemas.AgentRelationshipCreate, 
    db: Session = Depends(get_db), 
    current_user: schemas.User = Depends(auth.get_current_user)
):
    """
    Create a relationship between agents
    """
    # Verify that the source and target agents exist and are in the same session
    source_agent = db.query(models.SessionAgent).filter(models.SessionAgent.id == relationship.source_agent_id).first()
    if not source_agent:
        raise HTTPException(status_code=404, detail="Source agent not found")
    
    target_agent = db.query(models.SessionAgent).filter(models.SessionAgent.id == relationship.target_agent_id).first()
    if not target_agent:
        raise HTTPException(status_code=404, detail="Target agent not found")
    
    # Verify that both agents are in the same session
    if source_agent.session_id != target_agent.session_id:
        raise HTTPException(status_code=400, detail="Agents must be in the same session")
    
    # Verify that the session belongs to the current user
    session = db.query(models.Session).filter(models.Session.id == source_agent.session_id).first()
    if session.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this session")
    
    # Create the relationship
    db_relationship = models.AgentRelationship(
        session_id=relationship.session_id,
        source_agent_id=relationship.source_agent_id,
        target_agent_id=relationship.target_agent_id,
        relationship_type=relationship.relationship_type
    )
    db.add(db_relationship)
    db.commit()
    db.refresh(db_relationship)
    
    return db_relationship

@router.get("/agent-relationships/session/{session_id}", response_model=List[schemas.AgentRelationship])
def read_agent_relationships_by_session(
    session_id: int, 
    relationship_type: Optional[str] = None,
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db), 
    current_user: schemas.User = Depends(auth.get_current_user)
):
    """
    Retrieve agent relationships for a session
    """
    # Verify that the session belongs to the current user
    session = db.query(models.Session).filter(models.Session.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    if session.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this session")
    
    # Query relationships
    query = db.query(models.AgentRelationship).filter(models.AgentRelationship.session_id == session_id)
    
    # Filter by relationship type if specified
    if relationship_type:
        query = query.filter(models.AgentRelationship.relationship_type == relationship_type)
    
    # Apply pagination
    relationships = query.offset(skip).limit(limit).all()
    
    return relationships
