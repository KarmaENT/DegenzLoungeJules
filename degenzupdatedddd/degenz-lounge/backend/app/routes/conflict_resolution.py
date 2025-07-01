from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
import json

from app.database import get_db
from app.models import schemas, models
from app.utils import auth
from app.services.ai.gemini_service import GeminiService, LangChainService

router = APIRouter()

@router.post("/", response_model=schemas.ConflictResolution)
async def create_conflict_resolution(
    conflict_resolution: schemas.ConflictResolutionCreate, 
    db: Session = Depends(get_db), 
    current_user: schemas.User = Depends(auth.get_current_user),
    gemini_service: GeminiService = Depends(lambda: GeminiService())
):
    """
    Create a new conflict resolution record
    """
    # Verify that the session exists and belongs to the user
    session = db.query(models.Session).filter(models.Session.id == conflict_resolution.session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    if session.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this session")
    
    # Verify that the conflict message exists
    conflict_message = db.query(models.Message).filter(models.Message.id == conflict_resolution.conflict_message_id).first()
    if not conflict_message:
        raise HTTPException(status_code=404, detail="Conflict message not found")
    
    # Create the conflict resolution record
    db_conflict_resolution = models.ConflictResolution(
        session_id=conflict_resolution.session_id,
        conflict_message_id=conflict_resolution.conflict_message_id,
        resolution_method=conflict_resolution.resolution_method,
        resolution_data=conflict_resolution.resolution_data,
        resolved_by_agent_id=conflict_resolution.resolved_by_agent_id
    )
    db.add(db_conflict_resolution)
    db.commit()
    db.refresh(db_conflict_resolution)
    
    # If resolution method is voting, initiate the voting process
    if conflict_resolution.resolution_method == "voting":
        # Get all agents in the session
        session_agents = db.query(models.SessionAgent).filter(
            models.SessionAgent.session_id == conflict_resolution.session_id
        ).all()
        
        # Initialize voting data
        voting_data = {
            "votes": {},
            "total_votes": 0,
            "options": conflict_resolution.resolution_data.get("options", []),
            "status": "in_progress"
        }
        
        # Update the conflict resolution record with voting data
        db_conflict_resolution.resolution_data = voting_data
        db.commit()
        db.refresh(db_conflict_resolution)
    
    # If resolution method is manager_decision, let the manager agent decide
    elif conflict_resolution.resolution_method == "manager_decision":
        # Find the manager agent
        manager_agent = db.query(models.SessionAgent).filter(
            models.SessionAgent.session_id == conflict_resolution.session_id,
            models.SessionAgent.is_manager == True
        ).first()
        
        if not manager_agent:
            raise HTTPException(status_code=400, detail="No manager agent found in this session")
        
        # Get the manager agent details
        manager = db.query(models.Agent).filter(models.Agent.id == manager_agent.agent_id).first()
        
        # Get the conflict message and related messages
        related_messages = db.query(models.Message).filter(
            models.Message.session_id == conflict_resolution.session_id,
            models.Message.parent_id == conflict_message.parent_id
        ).all()
        
        # Prepare the context for the manager agent
        context = {
            "conflict_message": conflict_message.content,
            "related_messages": [
                {
                    "agent_id": msg.session_agent_id,
                    "content": msg.content
                } for msg in related_messages if msg.session_agent_id
            ],
            "options": conflict_resolution.resolution_data.get("options", [])
        }
        
        # Create a prompt for the manager agent
        prompt = f"""
        You are {manager.name}, a {manager.role} with the following personality: {manager.personality}
        
        You need to resolve a conflict between different agent responses.
        
        Original message: {context['conflict_message']}
        
        Agent responses:
        {json.dumps(context['related_messages'], indent=2)}
        
        Options to choose from:
        {json.dumps(context['options'], indent=2)}
        
        Please resolve this conflict by selecting the best option or providing a synthesis of the responses.
        Your decision should be clear and well-reasoned.
        """
        
        # Execute the manager decision
        langchain_service = LangChainService(gemini_service)
        agent_data = {
            "id": manager.id,
            "name": manager.name,
            "role": manager.role,
            "personality": manager.personality,
            "system_instructions": manager.system_instructions,
            "examples": manager.examples
        }
        
        try:
            # Generate response from the manager agent
            response = await langchain_service.run_agent_workflow(agent_data, prompt)
            
            # Save the resolution message to the database
            resolution_message = models.Message(
                content=response,
                session_id=conflict_resolution.session_id,
                session_agent_id=manager_agent.id,
                parent_id=conflict_message.parent_id,
                message_type=models.MessageType.CONFLICT_RESOLUTION
            )
            db.add(resolution_message)
            db.commit()
            
            # Update the conflict resolution record
            db_conflict_resolution.resolution_message_id = resolution_message.id
            db_conflict_resolution.resolved_at = func.now()
            db_conflict_resolution.resolution_data = {
                "manager_decision": response,
                "status": "resolved"
            }
            db.commit()
            db.refresh(db_conflict_resolution)
        
        except Exception as e:
            # Update conflict resolution status to failed
            db_conflict_resolution.resolution_data = {
                "error": str(e),
                "status": "failed"
            }
            db.commit()
            
            raise HTTPException(status_code=500, detail=f"Error resolving conflict: {str(e)}")
    
    # If resolution method is consensus, use a consensus algorithm
    elif conflict_resolution.resolution_method == "consensus":
        # This would implement a more sophisticated consensus algorithm
        # For now, we'll use a simple approach similar to voting
        
        # Get all agents in the session
        session_agents = db.query(models.SessionAgent).filter(
            models.SessionAgent.session_id == conflict_resolution.session_id
        ).all()
        
        # Initialize consensus data
        consensus_data = {
            "proposals": {},
            "rounds": 0,
            "status": "in_progress"
        }
        
        # Update the conflict resolution record with consensus data
        db_conflict_resolution.resolution_data = consensus_data
        db.commit()
        db.refresh(db_conflict_resolution)
    
    return db_conflict_resolution

@router.post("/{conflict_resolution_id}/vote", response_model=schemas.ConflictResolution)
async def submit_vote(
    conflict_resolution_id: int,
    vote_data: Dict[str, Any],
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(auth.get_current_user)
):
    """
    Submit a vote for a conflict resolution
    """
    # Get the conflict resolution record
    db_conflict_resolution = db.query(models.ConflictResolution).filter(
        models.ConflictResolution.id == conflict_resolution_id
    ).first()
    
    if not db_conflict_resolution:
        raise HTTPException(status_code=404, detail="Conflict resolution not found")
    
    # Verify that the session belongs to the user
    session = db.query(models.Session).filter(models.Session.id == db_conflict_resolution.session_id).first()
    if session.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this conflict resolution")
    
    # Verify that the resolution method is voting
    if db_conflict_resolution.resolution_method != "voting":
        raise HTTPException(status_code=400, detail="This conflict resolution does not use voting")
    
    # Verify that voting is still in progress
    if db_conflict_resolution.resolution_data.get("status") != "in_progress":
        raise HTTPException(status_code=400, detail="Voting has already ended")
    
    # Get the agent ID and vote
    agent_id = vote_data.get("agent_id")
    vote = vote_data.get("vote")
    
    if not agent_id or vote is None:
        raise HTTPException(status_code=400, detail="Agent ID and vote are required")
    
    # Verify that the agent exists and is in the session
    session_agent = db.query(models.SessionAgent).filter(
        models.SessionAgent.id == agent_id,
        models.SessionAgent.session_id == db_conflict_resolution.session_id
    ).first()
    
    if not session_agent:
        raise HTTPException(status_code=404, detail="Agent not found in this session")
    
    # Update the voting data
    voting_data = db_conflict_resolution.resolution_data
    
    # Record the vote
    voting_data["votes"][str(agent_id)] = vote
    voting_data["total_votes"] += 1
    
    # Check if all agents have voted
    session_agent_count = db.query(models.SessionAgent).filter(
        models.SessionAgent.session_id == db_conflict_resolution.session_id
    ).count()
    
    if voting_data["total_votes"] >= session_agent_count:
        # All agents have voted, determine the result
        vote_counts = {}
        for v in voting_data["votes"].values():
            vote_counts[v] = vote_counts.get(v, 0) + 1
        
        # Find the option with the most votes
        max_votes = 0
        winning_option = None
        
        for option, count in vote_counts.items():
            if count > max_votes:
                max_votes = count
                winning_option = option
        
        # Update the voting data
        voting_data["status"] = "completed"
        voting_data["result"] = winning_option
        voting_data["vote_counts"] = vote_counts
        
        # Create a resolution message
        conflict_message = db.query(models.Message).filter(
            models.Message.id == db_conflict_resolution.conflict_message_id
        ).first()
        
        # Find the manager agent or use any agent
        manager_agent = db.query(models.SessionAgent).filter(
            models.SessionAgent.session_id == db_conflict_resolution.session_id,
            models.SessionAgent.is_manager == True
        ).first()
        
        if not manager_agent:
            # Use any agent
            manager_agent = session_agent
        
        # Create the resolution message
        resolution_message = models.Message(
            content=f"Conflict resolved by voting. The winning option is: {winning_option}",
            session_id=db_conflict_resolution.session_id,
            session_agent_id=manager_agent.id,
            parent_id=conflict_message.parent_id if conflict_message else None,
            message_type=models.MessageType.CONFLICT_RESOLUTION
        )
        db.add(resolution_message)
        db.commit()
        
        # Update the conflict resolution record
        db_conflict_resolution.resolution_message_id = resolution_message.id
        db_conflict_resolution.resolved_at = func.now()
    
    # Update the conflict resolution record
    db_conflict_resolution.resolution_data = voting_data
    db.commit()
    db.refresh(db_conflict_resolution)
    
    return db_conflict_resolution

@router.post("/{conflict_resolution_id}/consensus", response_model=schemas.ConflictResolution)
async def submit_consensus_proposal(
    conflict_resolution_id: int,
    proposal_data: Dict[str, Any],
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(auth.get_current_user),
    gemini_service: GeminiService = Depends(lambda: GeminiService())
):
    """
    Submit a proposal for consensus-based conflict resolution
    """
    # Get the conflict resolution record
    db_conflict_resolution = db.query(models.ConflictResolution).filter(
        models.ConflictResolution.id == conflict_resolution_id
    ).first()
    
    if not db_conflict_resolution:
        raise HTTPException(status_code=404, detail="Conflict resolution not found")
    
    # Verify that the session belongs to the user
    session = db.query(models.Session).filter(models.Session.id == db_conflict_resolution.session_id).first()
    if session.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this conflict resolution")
    
    # Verify that the resolution method is consensus
    if db_conflict_resolution.resolution_method != "consensus":
        raise HTTPException(status_code=400, detail="This conflict resolution does not use consensus")
    
    # Verify that consensus is still in progress
    if db_conflict_resolution.resolution_data.get("status") != "in_progress":
        raise HTTPException(status_code=400, detail="Consensus process has already ended")
    
    # Get the agent ID and proposal
    agent_id = proposal_data.get("agent_id")
    proposal = proposal_data.get("proposal")
    
    if not agent_id or not proposal:
        raise HTTPException(status_code=400, detail="Agent ID and proposal are required")
    
    # Verify that the agent exists and is in the session
    session_agent = db.query(models.SessionAgent).filter(
        models.SessionAgent.id == agent_id,
        models.SessionAgent.session_id == db_conflict_resolution.session_id
    ).first()
    
    if not session_agent:
        raise HTTPException(status_code=404, detail="Agent not found in this session")
    
    # Update the consensus data
    consensus_data = db_conflict_resolution.resolution_data
    
    # Record the proposal
    consensus_data["proposals"][str(agent_id)] = proposal
    
    # Increment the round
    consensus_data["rounds"] += 1
    
    # Get all agents in the session
    session_agents = db.query(models.SessionAgent).filter(
        models.SessionAgent.session_id == db_conflict_resolution.session_id
    ).all()
    
    # Check if all agents have submitted proposals
    if len(consensus_data["proposals"]) >= len(session_agents):
        # All agents have submitted proposals, run the consensus algorithm
        
        # For a simple implementation, we'll use the manager agent to synthesize the proposals
        # Find the manager agent
        manager_agent = next((sa for sa in session_agents if sa.is_manager), None)
        
        if not manager_agent:
            # Use any agent
            manager_agent = session_agents[0]
        
        # Get the manager agent details
        manager = db.query(models.Agent).filter(models.Agent.id == manager_agent.agent_id).first()
        
        # Get the conflict message
        conflict_message = db.query(models.Message).filter(
            models.Message.id == db_conflict_resolution.conflict_message_id
        ).first()
        
        # Prepare the context for the manager agent
        context = {
            "conflict_message": conflict_message.content if conflict_message else "Unknown conflict",
            "proposals": consensus_data["proposals"]
        }
        
        # Create a prompt for the manager agent
        prompt = f"""
        You are {manager.name}, a {manager.role} with the following personality: {manager.personality}
        
        You need to synthesize multiple proposals to resolve a conflict.
        
        Original conflict: {context['conflict_message']}
        
        Agent proposals:
        {json.dumps(context['proposals'], indent=2)}
        
        Please synthesize these proposals into a single consensus solution that incorporates the best elements from each.
        Your synthesis should be clear, balanced, and address the original conflict effectively.
        """
        
        # Execute the consensus synthesis
        langchain_service = LangChainService(gemini_service)
        agent_data = {
            "id": manager.id,
            "name": manager.name,
            "role": manager.role,
            "personality": manager.personality,
            "system_instructions": manager.system_instructions,
            "examples": manager.examples
        }
        
        try:
            # Generate synthesis from the manager agent
            synthesis = await langchain_service.run_agent_workflow(agent_data, prompt)
            
            # Save the resolution message to the database
            resolution_message = models.Message(
                content=synthesis,
                session_id=db_conflict_resolution.session_id,
                session_agent_id=manager_agent.id,
                parent_id=conflict_message.parent_id if conflict_message else None,
                message_type=models.MessageType.CONFLICT_RESOLUTION
            )
            db.add(resolution_message)
            db.commit()
            
            # Update the consensus data
            consensus_data["status"] = "completed"
            consensus_data["synthesis"] = synthesis
            
            # Update the conflict resolution record
            db_conflict_resolution.resolution_message_id = resolution_message.id
            db_conflict_resolution.resolved_at = func.now()
        
        except Exception as e:
            # Update consensus status to failed
            consensus_data["status"] = "failed"
            consensus_data["error"] = str(e)
    
    # Update the conflict resolution record
    db_conflict_resolution.resolution_data = consensus_data
    db.commit()
    db.refresh(db_conflict_resolution)
    
    return db_conflict_resolution

@router.get("/session/{session_id}", response_model=List[schemas.ConflictResolution])
def read_conflict_resolutions_by_session(
    session_id: int, 
    db: Session = Depends(get_db), 
    current_user: schemas.User = Depends(auth.get_current_user)
):
    """
    Retrieve conflict resolutions for a session
    """
    # Verify that the session belongs to the user
    session = db.query(models.Session).filter(models.Session.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    if session.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this session")
    
    # Get conflict resolutions
    conflict_resolutions = db.query(models.ConflictResolution).filter(
        models.ConflictResolution.session_id == session_id
    ).all()
    
    return conflict_resolutions

@router.get("/{conflict_resolution_id}", response_model=schemas.ConflictResolution)
def read_conflict_resolution(
    conflict_resolution_id: int, 
    db: Session = Depends(get_db), 
    current_user: schemas.User = Depends(auth.get_current_user)
):
    """
    Retrieve a specific conflict resolution
    """
    # Get the conflict resolution
    conflict_resolution = db.query(models.ConflictResolution).filter(
        models.ConflictResolution.id == conflict_resolution_id
    ).first()
    
    if not conflict_resolution:
        raise HTTPException(status_code=404, detail="Conflict resolution not found")
    
    # Verify that the session belongs to the user
    session = db.query(models.Session).filter(models.Session.id == conflict_resolution.session_id).first()
    if session.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this conflict resolution")
    
    return conflict_resolution
