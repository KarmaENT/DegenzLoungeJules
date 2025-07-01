from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any

from app.database import get_db
from app.models import schemas, models
from app.utils import auth
from app.services.ai.gemini_service import GeminiService, LangChainService

router = APIRouter()

@router.post("/", response_model=schemas.Workflow)
def create_workflow(
    workflow: schemas.WorkflowCreate, 
    db: Session = Depends(get_db), 
    current_user: schemas.User = Depends(auth.get_current_user)
):
    """
    Create a new workflow
    """
    # Create the workflow
    db_workflow = models.Workflow(
        name=workflow.name,
        description=workflow.description,
        steps=workflow.steps,
        owner_id=current_user.id,
        is_public=workflow.is_public
    )
    db.add(db_workflow)
    db.commit()
    db.refresh(db_workflow)
    
    return db_workflow

@router.get("/", response_model=List[schemas.Workflow])
def read_workflows(
    is_public: Optional[bool] = None,
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db), 
    current_user: schemas.User = Depends(auth.get_current_user)
):
    """
    Retrieve workflows
    """
    # Query workflows
    query = db.query(models.Workflow)
    
    if is_public is None:
        # Get user's workflows and public workflows
        query = query.filter(
            (models.Workflow.owner_id == current_user.id) | 
            (models.Workflow.is_public == True)
        )
    elif is_public:
        # Get only public workflows
        query = query.filter(models.Workflow.is_public == True)
    else:
        # Get only user's private workflows
        query = query.filter(
            models.Workflow.owner_id == current_user.id,
            models.Workflow.is_public == False
        )
    
    # Apply pagination
    workflows = query.order_by(models.Workflow.created_at.desc()).offset(skip).limit(limit).all()
    
    return workflows

@router.get("/{workflow_id}", response_model=schemas.Workflow)
def read_workflow(
    workflow_id: int, 
    db: Session = Depends(get_db), 
    current_user: schemas.User = Depends(auth.get_current_user)
):
    """
    Retrieve a specific workflow
    """
    workflow = db.query(models.Workflow).filter(models.Workflow.id == workflow_id).first()
    
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    
    # Check if user has access to this workflow
    if workflow.owner_id != current_user.id and not workflow.is_public:
        raise HTTPException(status_code=403, detail="Not authorized to access this workflow")
    
    return workflow

@router.put("/{workflow_id}", response_model=schemas.Workflow)
def update_workflow(
    workflow_id: int, 
    workflow_update: schemas.WorkflowCreate, 
    db: Session = Depends(get_db), 
    current_user: schemas.User = Depends(auth.get_current_user)
):
    """
    Update a workflow
    """
    db_workflow = db.query(models.Workflow).filter(models.Workflow.id == workflow_id).first()
    
    if not db_workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    
    # Check if user owns this workflow
    if db_workflow.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this workflow")
    
    # Update workflow fields
    db_workflow.name = workflow_update.name
    db_workflow.description = workflow_update.description
    db_workflow.steps = workflow_update.steps
    db_workflow.is_public = workflow_update.is_public
    
    db.commit()
    db.refresh(db_workflow)
    
    return db_workflow

@router.delete("/{workflow_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_workflow(
    workflow_id: int, 
    db: Session = Depends(get_db), 
    current_user: schemas.User = Depends(auth.get_current_user)
):
    """
    Delete a workflow
    """
    db_workflow = db.query(models.Workflow).filter(models.Workflow.id == workflow_id).first()
    
    if not db_workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    
    # Check if user owns this workflow
    if db_workflow.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this workflow")
    
    db.delete(db_workflow)
    db.commit()
    
    return None

@router.post("/sessions/", response_model=schemas.WorkflowSession)
def create_workflow_session(
    workflow_session: schemas.WorkflowSessionCreate, 
    db: Session = Depends(get_db), 
    current_user: schemas.User = Depends(auth.get_current_user)
):
    """
    Create a new workflow session
    """
    # Verify that the workflow exists
    workflow = db.query(models.Workflow).filter(models.Workflow.id == workflow_session.workflow_id).first()
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    
    # Verify that the user has access to this workflow
    if workflow.owner_id != current_user.id and not workflow.is_public:
        raise HTTPException(status_code=403, detail="Not authorized to use this workflow")
    
    # Verify that the session exists and belongs to the user
    session = db.query(models.Session).filter(models.Session.id == workflow_session.session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    if session.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this session")
    
    # Create the workflow session
    db_workflow_session = models.WorkflowSession(
        workflow_id=workflow_session.workflow_id,
        session_id=workflow_session.session_id,
        status=workflow_session.status,
        current_step=workflow_session.current_step,
        results=workflow_session.results
    )
    db.add(db_workflow_session)
    db.commit()
    db.refresh(db_workflow_session)
    
    return db_workflow_session

@router.get("/sessions/{session_id}", response_model=List[schemas.WorkflowSession])
def read_workflow_sessions_by_session(
    session_id: int, 
    db: Session = Depends(get_db), 
    current_user: schemas.User = Depends(auth.get_current_user)
):
    """
    Retrieve workflow sessions for a specific session
    """
    # Verify that the session exists and belongs to the user
    session = db.query(models.Session).filter(models.Session.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    if session.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this session")
    
    # Get workflow sessions
    workflow_sessions = db.query(models.WorkflowSession).filter(
        models.WorkflowSession.session_id == session_id
    ).all()
    
    return workflow_sessions

@router.put("/sessions/{workflow_session_id}", response_model=schemas.WorkflowSession)
def update_workflow_session(
    workflow_session_id: int, 
    workflow_session_update: schemas.WorkflowSessionCreate, 
    db: Session = Depends(get_db), 
    current_user: schemas.User = Depends(auth.get_current_user)
):
    """
    Update a workflow session
    """
    # Get the workflow session
    db_workflow_session = db.query(models.WorkflowSession).filter(
        models.WorkflowSession.id == workflow_session_id
    ).first()
    
    if not db_workflow_session:
        raise HTTPException(status_code=404, detail="Workflow session not found")
    
    # Verify that the session belongs to the user
    session = db.query(models.Session).filter(models.Session.id == db_workflow_session.session_id).first()
    if session.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this workflow session")
    
    # Update workflow session fields
    db_workflow_session.status = workflow_session_update.status
    db_workflow_session.current_step = workflow_session_update.current_step
    db_workflow_session.results = workflow_session_update.results
    
    db.commit()
    db.refresh(db_workflow_session)
    
    return db_workflow_session

@router.post("/execute/{workflow_session_id}", response_model=Dict[str, Any])
async def execute_workflow_step(
    workflow_session_id: int, 
    db: Session = Depends(get_db), 
    current_user: schemas.User = Depends(auth.get_current_user),
    gemini_service: GeminiService = Depends(lambda: GeminiService())
):
    """
    Execute the current step of a workflow
    """
    # Get the workflow session
    db_workflow_session = db.query(models.WorkflowSession).filter(
        models.WorkflowSession.id == workflow_session_id
    ).first()
    
    if not db_workflow_session:
        raise HTTPException(status_code=404, detail="Workflow session not found")
    
    # Verify that the session belongs to the user
    session = db.query(models.Session).filter(models.Session.id == db_workflow_session.session_id).first()
    if session.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to execute this workflow")
    
    # Get the workflow
    workflow = db.query(models.Workflow).filter(models.Workflow.id == db_workflow_session.workflow_id).first()
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    
    # Check if workflow is completed
    if db_workflow_session.status == "completed" or db_workflow_session.status == "failed":
        raise HTTPException(status_code=400, detail=f"Workflow is already {db_workflow_session.status}")
    
    # Get the current step
    if db_workflow_session.current_step >= len(workflow.steps):
        raise HTTPException(status_code=400, detail="Workflow has no more steps")
    
    current_step = workflow.steps[db_workflow_session.current_step]
    
    # Check if dependencies are satisfied
    for dep_index in current_step.get("depends_on", []):
        if dep_index >= db_workflow_session.current_step:
            raise HTTPException(status_code=400, detail=f"Dependency on future step {dep_index} cannot be satisfied")
        
        # Check if the dependent step has results
        if str(dep_index) not in db_workflow_session.results:
            raise HTTPException(status_code=400, detail=f"Dependency on step {dep_index} not satisfied")
    
    # Get the agent for this step if specified
    agent_id = current_step.get("agent_id")
    agent = None
    
    if agent_id:
        # Get the session agent
        session_agent = db.query(models.SessionAgent).filter(
            models.SessionAgent.session_id == db_workflow_session.session_id,
            models.SessionAgent.agent_id == agent_id
        ).first()
        
        if not session_agent:
            # Try to find an agent with the specified role
            agent_role = current_step.get("agent_role")
            if agent_role:
                session_agents = db.query(models.SessionAgent).filter(
                    models.SessionAgent.session_id == db_workflow_session.session_id
                ).all()
                
                for sa in session_agents:
                    agent = db.query(models.Agent).filter(models.Agent.id == sa.agent_id).first()
                    if agent and agent.role.lower() == agent_role.lower():
                        session_agent = sa
                        break
        
        if session_agent:
            agent = db.query(models.Agent).filter(models.Agent.id == session_agent.agent_id).first()
    
    # If no specific agent, use any available agent
    if not agent:
        session_agents = db.query(models.SessionAgent).filter(
            models.SessionAgent.session_id == db_workflow_session.session_id
        ).all()
        
        if not session_agents:
            raise HTTPException(status_code=400, detail="No agents available in this session")
        
        # Use the first agent
        session_agent = session_agents[0]
        agent = db.query(models.Agent).filter(models.Agent.id == session_agent.agent_id).first()
    
    # Prepare the context for the agent
    context = {
        "workflow_name": workflow.name,
        "step_name": current_step.get("name"),
        "step_description": current_step.get("description", ""),
        "instructions": current_step.get("instructions", ""),
        "previous_results": {}
    }
    
    # Add results from dependencies
    for dep_index in current_step.get("depends_on", []):
        if str(dep_index) in db_workflow_session.results:
            context["previous_results"][str(dep_index)] = db_workflow_session.results[str(dep_index)]
    
    # Create a prompt for the agent
    prompt = f"""
    You are {agent.name}, a {agent.role} with the following personality: {agent.personality}
    
    You are working on a workflow called "{context['workflow_name']}"
    
    Current step: {context['step_name']}
    Description: {context['step_description']}
    
    Instructions:
    {context['instructions']}
    
    Previous step results:
    {context['previous_results']}
    
    Complete this step according to the instructions. Provide a detailed response.
    """
    
    # Execute the step with the agent
    langchain_service = LangChainService(gemini_service)
    agent_data = {
        "id": agent.id,
        "name": agent.name,
        "role": agent.role,
        "personality": agent.personality,
        "system_instructions": agent.system_instructions,
        "examples": agent.examples
    }
    
    try:
        # Generate response from the agent
        response = await langchain_service.run_agent_workflow(agent_data, prompt)
        
        # Save the message to the database
        db_message = models.Message(
            content=prompt,
            session_id=db_workflow_session.session_id,
            user_id=current_user.id,
            message_type=models.MessageType.WORKFLOW
        )
        db.add(db_message)
        db.commit()
        
        # Save the agent response to the database
        agent_db_message = models.Message(
            content=response,
            session_id=db_workflow_session.session_id,
            session_agent_id=session_agent.id,
            parent_id=db_message.id,
            message_type=models.MessageType.WORKFLOW
        )
        db.add(agent_db_message)
        db.commit()
        
        # Update the workflow session results
        results = db_workflow_session.results.copy() if db_workflow_session.results else {}
        results[str(db_workflow_session.current_step)] = {
            "agent_name": agent.name,
            "agent_role": agent.role,
            "content": response,
            "timestamp": agent_db_message.created_at.isoformat()
        }
        
        db_workflow_session.results = results
        
        # Increment the current step
        db_workflow_session.current_step += 1
        
        # Check if workflow is completed
        if db_workflow_session.current_step >= len(workflow.steps):
            db_workflow_session.status = "completed"
        else:
            db_workflow_session.status = "in_progress"
        
        db.commit()
        db.refresh(db_workflow_session)
        
        return {
            "status": db_workflow_session.status,
            "current_step": db_workflow_session.current_step,
            "total_steps": len(workflow.steps),
            "step_result": results[str(db_workflow_session.current_step - 1)],
            "message": f"Step {db_workflow_session.current_step - 1} executed successfully"
        }
    
    except Exception as e:
        # Update workflow session status to failed
        db_workflow_session.status = "failed"
        db.commit()
        
        raise HTTPException(status_code=500, detail=f"Error executing workflow step: {str(e)}")
