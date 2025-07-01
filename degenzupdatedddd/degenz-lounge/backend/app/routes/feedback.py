from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.database import get_db
from app.models import models, schemas
from app.models.learning_models import AgentFeedback, FeedbackType, FeedbackCategory
from app.utils import auth

router = APIRouter()

@router.post("/feedback/", response_model=schemas.AgentFeedback)
def create_feedback(
    feedback: schemas.AgentFeedbackCreate,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(auth.get_current_user)
):
    """
    Create new feedback for an agent response
    """
    # Verify the message exists
    message = db.query(models.Message).filter(models.Message.id == feedback.message_id).first()
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    
    # Verify the session exists and user has access
    session = db.query(models.Session).filter(models.Session.id == feedback.session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    if session.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to provide feedback for this session")
    
    # Verify the agent exists in the session
    session_agent = db.query(models.SessionAgent).filter(
        models.SessionAgent.id == feedback.agent_id,
        models.SessionAgent.session_id == feedback.session_id
    ).first()
    
    if not session_agent:
        raise HTTPException(status_code=404, detail="Agent not found in this session")
    
    # Create the feedback
    db_feedback = AgentFeedback(
        message_id=feedback.message_id,
        session_id=feedback.session_id,
        agent_id=feedback.agent_id,
        user_id=current_user.id,
        feedback_type=feedback.feedback_type,
        category=feedback.category,
        rating=feedback.rating,
        is_positive=feedback.is_positive,
        comment=feedback.comment
    )
    
    db.add(db_feedback)
    db.commit()
    db.refresh(db_feedback)
    
    return db_feedback

@router.get("/feedback/", response_model=List[schemas.AgentFeedback])
def read_feedback(
    agent_id: Optional[int] = None,
    session_id: Optional[int] = None,
    feedback_type: Optional[FeedbackType] = None,
    category: Optional[FeedbackCategory] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(auth.get_current_user)
):
    """
    Retrieve feedback with optional filtering
    """
    query = db.query(AgentFeedback)
    
    # Apply filters
    if agent_id:
        query = query.filter(AgentFeedback.agent_id == agent_id)
    
    if session_id:
        # Verify user has access to this session
        session = db.query(models.Session).filter(models.Session.id == session_id).first()
        if not session or session.owner_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized to access feedback for this session")
        
        query = query.filter(AgentFeedback.session_id == session_id)
    else:
        # If no session specified, only return feedback for sessions owned by the user
        query = query.join(models.Session).filter(models.Session.owner_id == current_user.id)
    
    if feedback_type:
        query = query.filter(AgentFeedback.feedback_type == feedback_type)
    
    if category:
        query = query.filter(AgentFeedback.category == category)
    
    # Apply pagination and return results
    feedback_items = query.order_by(AgentFeedback.created_at.desc()).offset(skip).limit(limit).all()
    return feedback_items

@router.get("/feedback/{feedback_id}", response_model=schemas.AgentFeedback)
def read_feedback_by_id(
    feedback_id: int,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(auth.get_current_user)
):
    """
    Retrieve a specific feedback item
    """
    feedback = db.query(AgentFeedback).filter(AgentFeedback.id == feedback_id).first()
    
    if not feedback:
        raise HTTPException(status_code=404, detail="Feedback not found")
    
    # Verify user has access to the session this feedback belongs to
    session = db.query(models.Session).filter(models.Session.id == feedback.session_id).first()
    if not session or session.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this feedback")
    
    return feedback

@router.put("/feedback/{feedback_id}", response_model=schemas.AgentFeedback)
def update_feedback(
    feedback_id: int,
    feedback_update: schemas.AgentFeedbackUpdate,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(auth.get_current_user)
):
    """
    Update an existing feedback item
    """
    db_feedback = db.query(AgentFeedback).filter(AgentFeedback.id == feedback_id).first()
    
    if not db_feedback:
        raise HTTPException(status_code=404, detail="Feedback not found")
    
    # Verify user owns this feedback
    if db_feedback.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this feedback")
    
    # Update fields if provided
    if feedback_update.feedback_type is not None:
        db_feedback.feedback_type = feedback_update.feedback_type
    
    if feedback_update.category is not None:
        db_feedback.category = feedback_update.category
    
    if feedback_update.rating is not None:
        db_feedback.rating = feedback_update.rating
    
    if feedback_update.is_positive is not None:
        db_feedback.is_positive = feedback_update.is_positive
    
    if feedback_update.comment is not None:
        db_feedback.comment = feedback_update.comment
    
    db.commit()
    db.refresh(db_feedback)
    
    return db_feedback

@router.delete("/feedback/{feedback_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_feedback(
    feedback_id: int,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(auth.get_current_user)
):
    """
    Delete a feedback item
    """
    db_feedback = db.query(AgentFeedback).filter(AgentFeedback.id == feedback_id).first()
    
    if not db_feedback:
        raise HTTPException(status_code=404, detail="Feedback not found")
    
    # Verify user owns this feedback
    if db_feedback.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this feedback")
    
    db.delete(db_feedback)
    db.commit()
    
    return None

@router.get("/feedback/summary/agent/{agent_id}", response_model=schemas.AgentFeedbackSummary)
def get_agent_feedback_summary(
    agent_id: int,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(auth.get_current_user)
):
    """
    Get a summary of feedback for a specific agent
    """
    # Verify the agent exists and belongs to the user
    agent = db.query(models.Agent).filter(models.Agent.id == agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    if agent.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access feedback for this agent")
    
    # Get all session agents for this agent
    session_agent_ids = db.query(models.SessionAgent.id).filter(
        models.SessionAgent.agent_id == agent_id
    ).all()
    session_agent_ids = [sa[0] for sa in session_agent_ids]
    
    if not session_agent_ids:
        # Agent has not been used in any sessions yet
        return {
            "agent_id": agent_id,
            "total_feedback_count": 0,
            "average_rating": None,
            "positive_feedback_percentage": None,
            "feedback_by_category": {},
            "recent_comments": []
        }
    
    # Get feedback statistics
    feedback_query = db.query(AgentFeedback).filter(
        AgentFeedback.agent_id.in_(session_agent_ids)
    )
    
    total_count = feedback_query.count()
    
    if total_count == 0:
        # No feedback yet
        return {
            "agent_id": agent_id,
            "total_feedback_count": 0,
            "average_rating": None,
            "positive_feedback_percentage": None,
            "feedback_by_category": {},
            "recent_comments": []
        }
    
    # Calculate average rating
    rating_sum = db.query(func.sum(AgentFeedback.rating)).filter(
        AgentFeedback.agent_id.in_(session_agent_ids),
        AgentFeedback.rating.isnot(None)
    ).scalar() or 0
    
    rating_count = db.query(AgentFeedback).filter(
        AgentFeedback.agent_id.in_(session_agent_ids),
        AgentFeedback.rating.isnot(None)
    ).count()
    
    average_rating = rating_sum / rating_count if rating_count > 0 else None
    
    # Calculate positive feedback percentage
    positive_count = db.query(AgentFeedback).filter(
        AgentFeedback.agent_id.in_(session_agent_ids),
        AgentFeedback.is_positive.is_(True)
    ).count()
    
    thumbs_count = db.query(AgentFeedback).filter(
        AgentFeedback.agent_id.in_(session_agent_ids),
        AgentFeedback.is_positive.isnot(None)
    ).count()
    
    positive_percentage = (positive_count / thumbs_count * 100) if thumbs_count > 0 else None
    
    # Get feedback by category
    feedback_by_category = {}
    for category in FeedbackCategory:
        category_rating_sum = db.query(func.sum(AgentFeedback.rating)).filter(
            AgentFeedback.agent_id.in_(session_agent_ids),
            AgentFeedback.category == category,
            AgentFeedback.rating.isnot(None)
        ).scalar() or 0
        
        category_rating_count = db.query(AgentFeedback).filter(
            AgentFeedback.agent_id.in_(session_agent_ids),
            AgentFeedback.category == category,
            AgentFeedback.rating.isnot(None)
        ).count()
        
        if category_rating_count > 0:
            feedback_by_category[category.value] = category_rating_sum / category_rating_count
    
    # Get recent comments
    recent_comments = db.query(AgentFeedback).filter(
        AgentFeedback.agent_id.in_(session_agent_ids),
        AgentFeedback.comment.isnot(None),
        AgentFeedback.comment != ""
    ).order_by(AgentFeedback.created_at.desc()).limit(5).all()
    
    return {
        "agent_id": agent_id,
        "total_feedback_count": total_count,
        "average_rating": average_rating,
        "positive_feedback_percentage": positive_percentage,
        "feedback_by_category": feedback_by_category,
        "recent_comments": recent_comments
    }

@router.get("/feedback/summary/session/{session_id}", response_model=schemas.SessionFeedbackSummary)
def get_session_feedback_summary(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(auth.get_current_user)
):
    """
    Get a summary of feedback for a specific session
    """
    # Verify the session exists and belongs to the user
    session = db.query(models.Session).filter(models.Session.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    if session.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access feedback for this session")
    
    # Get feedback statistics
    feedback_query = db.query(AgentFeedback).filter(
        AgentFeedback.session_id == session_id
    )
    
    total_count = feedback_query.count()
    
    if total_count == 0:
        # No feedback yet
        return {
            "session_id": session_id,
            "total_feedback_count": 0,
            "average_rating": None,
            "positive_feedback_percentage": None,
            "feedback_by_agent": {},
            "feedback_by_category": {},
            "recent_comments": []
        }
    
    # Calculate average rating
    rating_sum = db.query(func.sum(AgentFeedback.rating)).filter(
        AgentFeedback.session_id == session_id,
        AgentFeedback.rating.isnot(None)
    ).scalar() or 0
    
    rating_count = db.query(AgentFeedback).filter(
        AgentFeedback.session_id == session_id,
        AgentFeedback.rating.isnot(None)
    ).count()
    
    average_rating = rating_sum / rating_count if rating_count > 0 else None
    
    # Calculate positive feedback percentage
    positive_count = db.query(AgentFeedback).filter(
        AgentFeedback.session_id == session_id,
        AgentFeedback.is_positive.is_(True)
    ).count()
    
    thumbs_count = db.query(AgentFeedback).filter(
        AgentFeedback.session_id == session_id,
        AgentFeedback.is_positive.isnot(None)
    ).count()
    
    positive_percentage = (positive_count / thumbs_count * 100) if thumbs_count > 0 else None
    
    # Get feedback by agent
    feedback_by_agent = {}
    session_agents = db.query(models.SessionAgent).filter(
        models.SessionAgent.session_id == session_id
    ).all()
    
    for sa in session_agents:
        agent_rating_sum = db.query(func.sum(AgentFeedback.rating)).filter(
            AgentFeedback.session_id == session_id,
            AgentFeedback.agent_id == sa.id,
            AgentFeedback.rating.isnot(None)
        ).scalar() or 0
        
        agent_rating_count = db.query(AgentFeedback).filter(
            AgentFeedback.session_id == session_id,
            AgentFeedback.agent_id == sa.id,
            AgentFeedback.rating.isnot(None)
        ).count()
        
        if agent_rating_count > 0:
            agent = db.query(models.Agent).filter(models.Agent.id == sa.agent_id).first()
            agent_name = agent.name if agent else f"Agent {sa.id}"
            feedback_by_agent[agent_name] = agent_rating_sum / agent_rating_count
    
    # Get feedback by category
    feedback_by_category = {}
    for category in FeedbackCategory:
        category_rating_sum = db.query(func.sum(AgentFeedback.rating)).filter(
            AgentFeedback.session_id == session_id,
            AgentFeedback.category == category,
            AgentFeedback.rating.isnot(None)
        ).scalar() or 0
        
        category_rating_count = db.query(AgentFeedback).filter(
            AgentFeedback.session_id == session_id,
            AgentFeedback.category == category,
            AgentFeedback.rating.isnot(None)
        ).count()
        
        if category_rating_count > 0:
            feedback_by_category[category.value] = category_rating_sum / category_rating_count
    
    # Get recent comments
    recent_comments = db.query(AgentFeedback).filter(
        AgentFeedback.session_id == session_id,
        AgentFeedback.comment.isnot(None),
        AgentFeedback.comment != ""
    ).order_by(AgentFeedback.created_at.desc()).limit(5).all()
    
    return {
        "session_id": session_id,
        "total_feedback_count": total_count,
        "average_rating": average_rating,
        "positive_feedback_percentage": positive_percentage,
        "feedback_by_agent": feedback_by_agent,
        "feedback_by_category": feedback_by_category,
        "recent_comments": recent_comments
    }
