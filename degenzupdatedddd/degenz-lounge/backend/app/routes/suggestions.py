from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
import json

from app.database import get_db
from app.models import models, schemas
from app.models.learning_models import ImprovementSuggestion, AgentFeedback, PerformanceMetric
from app.utils import auth

router = APIRouter()

@router.post("/suggestions/", response_model=schemas.ImprovementSuggestion)
def create_improvement_suggestion(
    suggestion: schemas.ImprovementSuggestionCreate,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(auth.get_current_user)
):
    """
    Create a new improvement suggestion for an agent
    """
    # Verify the agent exists and user has access
    agent = db.query(models.Agent).filter(models.Agent.id == suggestion.agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    if agent.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to create suggestions for this agent")
    
    # Create the suggestion
    db_suggestion = ImprovementSuggestion(
        agent_id=suggestion.agent_id,
        suggestion_type=suggestion.suggestion_type,
        suggestion_content=suggestion.suggestion_content,
        confidence_score=suggestion.confidence_score,
        supporting_evidence=suggestion.supporting_evidence,
        is_implemented=suggestion.is_implemented
    )
    
    db.add(db_suggestion)
    db.commit()
    db.refresh(db_suggestion)
    
    return db_suggestion

@router.get("/suggestions/", response_model=List[schemas.ImprovementSuggestion])
def read_improvement_suggestions(
    agent_id: Optional[int] = None,
    suggestion_type: Optional[str] = None,
    is_implemented: Optional[bool] = None,
    min_confidence: Optional[float] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(auth.get_current_user)
):
    """
    Retrieve improvement suggestions with optional filtering
    """
    query = db.query(ImprovementSuggestion)
    
    # Apply filters
    if agent_id:
        # Verify user has access to this agent
        agent = db.query(models.Agent).filter(models.Agent.id == agent_id).first()
        if not agent or agent.owner_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized to access suggestions for this agent")
        
        query = query.filter(ImprovementSuggestion.agent_id == agent_id)
    else:
        # If no agent specified, only return suggestions for agents owned by the user
        query = query.join(models.Agent).filter(models.Agent.owner_id == current_user.id)
    
    if suggestion_type:
        query = query.filter(ImprovementSuggestion.suggestion_type == suggestion_type)
    
    if is_implemented is not None:
        query = query.filter(ImprovementSuggestion.is_implemented == is_implemented)
    
    if min_confidence is not None:
        query = query.filter(ImprovementSuggestion.confidence_score >= min_confidence)
    
    # Apply pagination and return results
    suggestions = query.order_by(ImprovementSuggestion.created_at.desc()).offset(skip).limit(limit).all()
    return suggestions

@router.get("/suggestions/{suggestion_id}", response_model=schemas.ImprovementSuggestion)
def read_improvement_suggestion_by_id(
    suggestion_id: int,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(auth.get_current_user)
):
    """
    Retrieve a specific improvement suggestion
    """
    suggestion = db.query(ImprovementSuggestion).filter(ImprovementSuggestion.id == suggestion_id).first()
    
    if not suggestion:
        raise HTTPException(status_code=404, detail="Improvement suggestion not found")
    
    # Verify user has access to the agent this suggestion belongs to
    agent = db.query(models.Agent).filter(models.Agent.id == suggestion.agent_id).first()
    if not agent or agent.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this suggestion")
    
    return suggestion

@router.put("/suggestions/{suggestion_id}/implement", response_model=schemas.ImprovementSuggestion)
def implement_suggestion(
    suggestion_id: int,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(auth.get_current_user)
):
    """
    Mark a suggestion as implemented
    """
    suggestion = db.query(ImprovementSuggestion).filter(ImprovementSuggestion.id == suggestion_id).first()
    
    if not suggestion:
        raise HTTPException(status_code=404, detail="Improvement suggestion not found")
    
    # Verify user has access to the agent this suggestion belongs to
    agent = db.query(models.Agent).filter(models.Agent.id == suggestion.agent_id).first()
    if not agent or agent.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this suggestion")
    
    suggestion.is_implemented = True
    suggestion.implemented_at = datetime.now()
    
    db.commit()
    db.refresh(suggestion)
    
    return suggestion

@router.delete("/suggestions/{suggestion_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_improvement_suggestion(
    suggestion_id: int,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(auth.get_current_user)
):
    """
    Delete an improvement suggestion
    """
    suggestion = db.query(ImprovementSuggestion).filter(ImprovementSuggestion.id == suggestion_id).first()
    
    if not suggestion:
        raise HTTPException(status_code=404, detail="Improvement suggestion not found")
    
    # Verify user has access to the agent this suggestion belongs to
    agent = db.query(models.Agent).filter(models.Agent.id == suggestion.agent_id).first()
    if not agent or agent.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this suggestion")
    
    db.delete(suggestion)
    db.commit()
    
    return None

@router.post("/suggestions/generate", response_model=List[schemas.ImprovementSuggestion])
async def generate_improvement_suggestions(
    generation_request: schemas.SuggestionGenerationRequest,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(auth.get_current_user)
):
    """
    Automatically generate improvement suggestions for an agent based on feedback and performance
    """
    # Verify the agent exists and user has access
    agent = db.query(models.Agent).filter(models.Agent.id == generation_request.agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    if agent.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to generate suggestions for this agent")
    
    # Get all session agents for this agent
    session_agents = db.query(models.SessionAgent).filter(
        models.SessionAgent.agent_id == agent.id
    ).all()
    
    if not session_agents:
        raise HTTPException(status_code=400, detail="Agent has not been used in any sessions yet")
    
    session_agent_ids = [sa.id for sa in session_agents]
    
    # Get feedback for this agent
    feedback_items = db.query(AgentFeedback).filter(
        AgentFeedback.agent_id.in_(session_agent_ids)
    ).all()
    
    # Get performance metrics for this agent
    performance_metrics = db.query(PerformanceMetric).filter(
        PerformanceMetric.agent_id == agent.id
    ).all()
    
    # Generate suggestions based on feedback and performance
    suggestions = []
    
    # 1. Analyze feedback ratings
    if feedback_items:
        rating_feedback = [f for f in feedback_items if f.rating is not None]
        if rating_feedback:
            avg_rating = sum(f.rating for f in rating_feedback) / len(rating_feedback)
            
            # If average rating is low, suggest improvements
            if avg_rating < 3.5:
                # Get categories with low ratings
                category_ratings = {}
                for f in rating_feedback:
                    if f.category.value not in category_ratings:
                        category_ratings[f.category.value] = []
                    category_ratings[f.category.value].append(f.rating)
                
                for category, ratings in category_ratings.items():
                    category_avg = sum(ratings) / len(ratings)
                    if category_avg < 3.0:
                        if category == "accuracy":
                            suggestion = ImprovementSuggestion(
                                agent_id=agent.id,
                                suggestion_type="instruction_update",
                                suggestion_content=f"Improve accuracy by adding more specific instructions about fact-checking and verification. Consider adding examples of accurate responses.",
                                confidence_score=0.8,
                                supporting_evidence={
                                    "avg_rating": category_avg,
                                    "sample_size": len(ratings),
                                    "category": category
                                }
                            )
                            db.add(suggestion)
                            suggestions.append(suggestion)
                        elif category == "helpfulness":
                            suggestion = ImprovementSuggestion(
                                agent_id=agent.id,
                                suggestion_type="instruction_update",
                                suggestion_content=f"Enhance helpfulness by instructing the agent to provide more actionable advice and practical solutions. Add examples of helpful responses.",
                                confidence_score=0.8,
                                supporting_evidence={
                                    "avg_rating": category_avg,
                                    "sample_size": len(ratings),
                                    "category": category
                                }
                            )
                            db.add(suggestion)
                            suggestions.append(suggestion)
                        elif category == "creativity":
                            suggestion = ImprovementSuggestion(
                                agent_id=agent.id,
                                suggestion_type="personality_adjustment",
                                suggestion_content=f"Boost creativity by adjusting the personality to be more innovative and imaginative. Consider increasing temperature parameter.",
                                confidence_score=0.75,
                                supporting_evidence={
                                    "avg_rating": category_avg,
                                    "sample_size": len(ratings),
                                    "category": category
                                }
                            )
                            db.add(suggestion)
                            suggestions.append(suggestion)
                        elif category == "clarity":
                            suggestion = ImprovementSuggestion(
                                agent_id=agent.id,
                                suggestion_type="instruction_update",
                                suggestion_content=f"Improve clarity by instructing the agent to use simpler language, shorter sentences, and better structure. Add examples of clear explanations.",
                                confidence_score=0.85,
                                supporting_evidence={
                                    "avg_rating": category_avg,
                                    "sample_size": len(ratings),
                                    "category": category
                                }
                            )
                            db.add(suggestion)
                            suggestions.append(suggestion)
    
    # 2. Analyze performance metrics
    if performance_metrics:
        # Check response time
        response_time_metrics = [m for m in performance_metrics if m.metric_name == "response_time"]
        if response_time_metrics:
            recent_response_times = sorted(response_time_metrics, key=lambda m: m.timestamp, reverse=True)[:5]
            avg_recent_response_time = sum(m.metric_value for m in recent_response_times) / len(recent_response_times)
            
            if avg_recent_response_time > 5.0:  # If average response time is over 5 seconds
                suggestion = ImprovementSuggestion(
                    agent_id=agent.id,
                    suggestion_type="system_instructions",
                    suggestion_content=f"Reduce response time by instructing the agent to be more concise and focused. Consider simplifying the role description.",
                    confidence_score=0.7,
                    supporting_evidence={
                        "avg_response_time": avg_recent_response_time,
                        "sample_size": len(recent_response_times)
                    }
                )
                db.add(suggestion)
                suggestions.append(suggestion)
        
        # Check message length correlation with ratings
        length_rating_corr_metrics = [m for m in performance_metrics if m.metric_name == "length_rating_correlation"]
        if length_rating_corr_metrics and feedback_items:
            recent_corr = sorted(length_rating_corr_metrics, key=lambda m: m.timestamp, reverse=True)[0]
            
            if recent_corr.metric_value < -0.5:  # Strong negative correlation
                suggestion = ImprovementSuggestion(
                    agent_id=agent.id,
                    suggestion_type="instruction_update",
                    suggestion_content=f"Users prefer shorter responses. Consider instructing the agent to be more concise and to the point.",
                    confidence_score=0.75,
                    supporting_evidence={
                        "correlation": recent_corr.metric_value,
                        "metadata": recent_corr.metadata
                    }
                )
                db.add(suggestion)
                suggestions.append(suggestion)
            elif recent_corr.metric_value > 0.5:  # Strong positive correlation
                suggestion = ImprovementSuggestion(
                    agent_id=agent.id,
                    suggestion_type="instruction_update",
                    suggestion_content=f"Users prefer detailed responses. Consider instructing the agent to provide more comprehensive and detailed information.",
                    confidence_score=0.75,
                    supporting_evidence={
                        "correlation": recent_corr.metric_value,
                        "metadata": recent_corr.metadata
                    }
                )
                db.add(suggestion)
                suggestions.append(suggestion)
    
    # 3. Analyze feedback comments for common themes
    if feedback_items:
        comments = [f.comment for f in feedback_items if f.comment]
        if comments:
            # This is a simplified analysis - in a real system, you would use NLP techniques
            keywords = {
                "slow": 0,
                "fast": 0,
                "unclear": 0,
                "clear": 0,
                "helpful": 0,
                "unhelpful": 0,
                "accurate": 0,
                "inaccurate": 0,
                "creative": 0,
                "boring": 0
            }
            
            for comment in comments:
                for keyword in keywords:
                    if keyword in comment.lower():
                        keywords[keyword] += 1
            
            # Generate suggestions based on keyword frequency
            if keywords["slow"] > 2:
                suggestion = ImprovementSuggestion(
                    agent_id=agent.id,
                    suggestion_type="system_instructions",
                    suggestion_content=f"Multiple users mentioned slowness. Consider optimizing the agent for faster responses.",
                    confidence_score=0.65,
                    supporting_evidence={
                        "keyword": "slow",
                        "mentions": keywords["slow"],
                        "total_comments": len(comments)
                    }
                )
                db.add(suggestion)
                suggestions.append(suggestion)
            
            if keywords["unclear"] > 2:
                suggestion = ImprovementSuggestion(
                    agent_id=agent.id,
                    suggestion_type="instruction_update",
                    suggestion_content=f"Multiple users mentioned clarity issues. Add instructions to use simpler language and better structure.",
                    confidence_score=0.65,
                    supporting_evidence={
                        "keyword": "unclear",
                        "mentions": keywords["unclear"],
                        "total_comments": len(comments)
                    }
                )
                db.add(suggestion)
                suggestions.append(suggestion)
            
            if keywords["inaccurate"] > 2:
                suggestion = ImprovementSuggestion(
                    agent_id=agent.id,
                    suggestion_type="example_addition",
                    suggestion_content=f"Multiple users mentioned accuracy issues. Add examples of accurate responses and emphasize fact-checking.",
                    confidence_score=0.7,
                    supporting_evidence={
                        "keyword": "inaccurate",
                        "mentions": keywords["inaccurate"],
                        "total_comments": len(comments)
                    }
                )
                db.add(suggestion)
                suggestions.append(suggestion)
            
            if keywords["boring"] > 2:
                suggestion = ImprovementSuggestion(
                    agent_id=agent.id,
                    suggestion_type="personality_adjustment",
                    suggestion_content=f"Multiple users found responses boring. Consider adjusting the personality to be more engaging and dynamic.",
                    confidence_score=0.6,
                    supporting_evidence={
                        "keyword": "boring",
                        "mentions": keywords["boring"],
                        "total_comments": len(comments)
                    }
                )
                db.add(suggestion)
                suggestions.append(suggestion)
    
    # 4. Check if the agent has examples
    if not agent.examples or len(agent.examples) == 0:
        suggestion = ImprovementSuggestion(
            agent_id=agent.id,
            suggestion_type="example_addition",
            suggestion_content=f"Add examples to help the agent understand the expected response format and style.",
            confidence_score=0.9,
            supporting_evidence={
                "reason": "No examples provided"
            }
        )
        db.add(suggestion)
        suggestions.append(suggestion)
    
    # 5. Check system instructions length
    if len(agent.system_instructions) < 100:
        suggestion = ImprovementSuggestion(
            agent_id=agent.id,
            suggestion_type="instruction_update",
            suggestion_content=f"System instructions are very brief. Consider adding more detailed instructions to guide the agent's behavior.",
            confidence_score=0.8,
            supporting_evidence={
                "instruction_length": len(agent.system_instructions)
            }
        )
        db.add(suggestion)
        suggestions.append(suggestion)
    
    # Commit all suggestions to the database
    if suggestions:
        db.commit()
        for suggestion in suggestions:
            db.refresh(suggestion)
    
    return suggestions
