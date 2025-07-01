"""
API routes for AI provider management
"""

from fastapi import APIRouter, Depends, HTTPException, Body
from typing import Dict, List, Any, Optional
from pydantic import BaseModel

from app.services.ai.ai_service import AIService
from app.utils.auth import get_current_user

router = APIRouter(
    prefix="/api/ai-providers",
    tags=["ai-providers"],
    responses={404: {"description": "Not found"}},
)

# Initialize AI service
ai_service = AIService()

class ValidateAPIKeyRequest(BaseModel):
    provider: str
    api_key: str

class GenerateResponseRequest(BaseModel):
    provider: str
    messages: List[Dict[str, str]]
    agent_config: Dict[str, Any]
    api_key: Optional[str] = None

@router.get("/")
async def get_available_providers(current_user = Depends(get_current_user)):
    """Get all available AI providers"""
    return ai_service.get_available_providers()

@router.get("/{provider}/models")
async def get_provider_models(
    provider: str, 
    api_key: Optional[str] = None,
    current_user = Depends(get_current_user)
):
    """Get available models for a specific provider"""
    try:
        models = ai_service.get_provider_models(provider, api_key)
        return {"models": models}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/validate-key")
async def validate_api_key(
    request: ValidateAPIKeyRequest,
    current_user = Depends(get_current_user)
):
    """Validate an API key for a specific provider"""
    is_valid = ai_service.validate_api_key(request.provider, request.api_key)
    return {"valid": is_valid}

@router.post("/generate")
async def generate_response(
    request: GenerateResponseRequest,
    current_user = Depends(get_current_user)
):
    """Generate a response using a specific provider"""
    try:
        response = ai_service.generate_agent_response(
            provider_name=request.provider,
            messages=request.messages,
            agent_config=request.agent_config,
            api_key=request.api_key
        )
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
