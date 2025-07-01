from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Union
from datetime import datetime
from enum import Enum

from app.models.learning_models import FeedbackType, FeedbackCategory

# User schemas
class UserBase(BaseModel):
    username: str
    email: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True

# Agent schemas
class AgentBase(BaseModel):
    name: str
    role: str
    personality: str
    system_instructions: str
    examples: Dict[str, Any]

class AgentCreate(AgentBase):
    pass

class Agent(AgentBase):
    id: int
    owner_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True

# Session schemas
class SessionBase(BaseModel):
    name: str
    description: Optional[str] = None

class SessionCreate(SessionBase):
    pass

class Session(SessionBase):
    id: int
    owner_id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True

# SessionAgent schemas
class SessionAgentBase(BaseModel):
    session_id: int
    agent_id: int
    is_manager: bool = False
    role: Optional[str] = None

class SessionAgentCreate(SessionAgentBase):
    pass

class SessionAgent(SessionAgentBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True

# Message schemas
class MessageBase(BaseModel):
    content: str
    message_type: str
    session_id: int
    session_agent_id: Optional[int] = None
    user_id: Optional[int] = None
    parent_id: Optional[int] = None
    metadata: Optional[Dict[str, Any]] = None

class MessageCreate(MessageBase):
    pass

class Message(MessageBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True

# DirectMessage schemas
class DirectMessageBase(BaseModel):
    content: str
    session_id: int
    sender_agent_id: int
    recipient_agent_id: int
    is_private: bool = True

class DirectMessageCreate(DirectMessageBase):
    pass

class DirectMessage(DirectMessageBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True

# AgentRelationship schemas
class AgentRelationshipBase(BaseModel):
    session_id: int
    source_agent_id: int
    target_agent_id: int
    relationship_type: str

class AgentRelationshipCreate(AgentRelationshipBase):
    pass

class AgentRelationship(AgentRelationshipBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True

# Workflow schemas
class WorkflowStepBase(BaseModel):
    name: str
    description: str
    agent_id: int
    instructions: str
    depends_on: List[int] = []

class WorkflowBase(BaseModel):
    name: str
    description: str
    steps: List[WorkflowStepBase]
    is_public: bool = False

class WorkflowCreate(WorkflowBase):
    pass

class Workflow(WorkflowBase):
    id: int
    owner_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True

# WorkflowSession schemas
class WorkflowSessionBase(BaseModel):
    workflow_id: int
    session_id: int
    status: str = "pending"
    current_step: int = 0
    results: Dict[str, Any] = {}

class WorkflowSessionCreate(WorkflowSessionBase):
    pass

class WorkflowSession(WorkflowSessionBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True

# ConflictResolution schemas
class ConflictResolutionBase(BaseModel):
    session_id: int
    conflict_message_id: int
    resolution_method: str
    resolution_data: Dict[str, Any]
    resolved_by_agent_id: Optional[int] = None
    resolution_message_id: Optional[int] = None

class ConflictResolutionCreate(ConflictResolutionBase):
    pass

class ConflictResolution(ConflictResolutionBase):
    id: int
    created_at: datetime
    resolved_at: Optional[datetime] = None

    class Config:
        orm_mode = True

# AgentTeam schemas
class AgentTeamBase(BaseModel):
    name: str
    description: str
    session_id: int
    leader_agent_id: Optional[int] = None

class AgentTeamCreate(AgentTeamBase):
    pass

class AgentTeam(AgentTeamBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True

# AgentTeamMember schemas
class AgentTeamMemberBase(BaseModel):
    team_id: int
    agent_id: int
    role: str

class AgentTeamMemberCreate(AgentTeamMemberBase):
    pass

class AgentTeamMember(AgentTeamMemberBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True

# Agent Feedback schemas
class AgentFeedbackBase(BaseModel):
    message_id: int
    session_id: int
    agent_id: int
    feedback_type: FeedbackType = FeedbackType.RATING
    category: FeedbackCategory = FeedbackCategory.OVERALL
    rating: Optional[float] = None
    is_positive: Optional[bool] = None
    comment: Optional[str] = None

class AgentFeedbackCreate(AgentFeedbackBase):
    pass

class AgentFeedbackUpdate(BaseModel):
    feedback_type: Optional[FeedbackType] = None
    category: Optional[FeedbackCategory] = None
    rating: Optional[float] = None
    is_positive: Optional[bool] = None
    comment: Optional[str] = None

class AgentFeedback(AgentFeedbackBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        orm_mode = True

# Feedback Summary schemas
class AgentFeedbackSummary(BaseModel):
    agent_id: int
    total_feedback_count: int
    average_rating: Optional[float] = None
    positive_feedback_percentage: Optional[float] = None
    feedback_by_category: Dict[str, float]
    recent_comments: List[AgentFeedback]

class SessionFeedbackSummary(BaseModel):
    session_id: int
    total_feedback_count: int
    average_rating: Optional[float] = None
    positive_feedback_percentage: Optional[float] = None
    feedback_by_agent: Dict[str, float]
    feedback_by_category: Dict[str, float]
    recent_comments: List[AgentFeedback]

# Performance Metric schemas
class PerformanceMetricBase(BaseModel):
    agent_id: int
    session_id: Optional[int] = None
    metric_name: str
    metric_value: float
    metadata: Optional[Dict[str, Any]] = None

class PerformanceMetricCreate(PerformanceMetricBase):
    pass

class PerformanceMetric(PerformanceMetricBase):
    id: int
    timestamp: datetime

    class Config:
        orm_mode = True

# Improvement Suggestion schemas
class ImprovementSuggestionBase(BaseModel):
    agent_id: int
    suggestion_type: str
    suggestion_content: str
    confidence_score: float
    supporting_evidence: Dict[str, Any]
    is_implemented: bool = False

class ImprovementSuggestionCreate(ImprovementSuggestionBase):
    pass

class ImprovementSuggestion(ImprovementSuggestionBase):
    id: int
    created_at: datetime
    implemented_at: Optional[datetime] = None

    class Config:
        orm_mode = True

# Agent Version schemas
class AgentVersionBase(BaseModel):
    agent_id: int
    version_number: int
    name: str
    role: str
    personality: str
    system_instructions: str
    examples: Dict[str, Any]
    parameters: Optional[Dict[str, Any]] = None
    is_active: bool = False

class AgentVersionCreate(AgentVersionBase):
    pass

class AgentVersion(AgentVersionBase):
    id: int
    created_at: datetime
    created_by_id: int

    class Config:
        orm_mode = True

# A/B Test schemas
class ABTestBase(BaseModel):
    name: str
    description: Optional[str] = None
    control_version_id: int
    variant_version_id: int
    test_parameters: Dict[str, Any]
    status: str = "created"

class ABTestCreate(ABTestBase):
    pass

class ABTest(ABTestBase):
    id: int
    user_id: int
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    results: Optional[Dict[str, Any]] = None
    created_at: datetime

    class Config:
        orm_mode = True

# A/B Test Session schemas
class ABTestSessionBase(BaseModel):
    ab_test_id: int
    session_id: int
    version_used: str
    metrics: Optional[Dict[str, Any]] = None

class ABTestSessionCreate(ABTestSessionBase):
    pass

class ABTestSession(ABTestSessionBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True

"""
Pydantic schemas for settings API.
"""
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from enum import Enum

# Enums from models to be used in Pydantic schemas
class ThemeEnum(str, Enum):
    system = "system"
    light = "light"
    dark = "dark"

class FontSizeEnum(str, Enum):
    small = "small"
    medium = "medium"
    large = "large"

class TimeFormatEnum(str, Enum):
    h12 = "12h"
    h24 = "24h"

# --- User Settings Schemas --- 
class UserSettingsBase(BaseModel):
    theme: Optional[ThemeEnum] = Field(None, description="User interface theme")
    font_size: Optional[FontSizeEnum] = Field(None, description="Application font size")
    time_format: Optional[TimeFormatEnum] = Field(None, description="Time display format")
    
    default_ai_provider: Optional[str] = Field(None, description="Default AI provider ID")
    default_model: Optional[str] = Field(None, description="Default AI model ID for the selected provider")
    default_temperature: Optional[int] = Field(None, ge=0, le=100, description="Default creativity temperature (0-100, maps to 0.0-1.0)")
    default_max_tokens: Optional[int] = Field(None, ge=256, le=8192, description="Default maximum tokens for AI responses")

    manager_style: Optional[str] = Field(None, description="Sandbox manager agent style: 'strict' or 'collaborative'")
    conflict_resolution_mode: Optional[str] = Field(None, description="Sandbox conflict resolution: 'automatic' or 'ask_user'")
    session_memory_duration: Optional[str] = Field(None, description="Sandbox session memory duration: 'session', '7d', '30d', 'unlimited'")

    notifications_task_alerts_push: Optional[bool] = Field(None, description="Enable push notifications for task alerts")
    notifications_task_alerts_email: Optional[bool] = Field(None, description="Enable email notifications for task alerts")
    notifications_task_alerts_in_app: Optional[bool] = Field(None, description="Enable in-app notifications for task alerts")
    notifications_dnd_enabled: Optional[bool] = Field(None, description="Enable Do Not Disturb mode")
    notifications_dnd_start_time: Optional[str] = Field(None, pattern=r"^([01]\d|2[0-3]):([0-5]\d)$", description="DND start time (HH:MM)")
    notifications_dnd_end_time: Optional[str] = Field(None, pattern=r"^([01]\d|2[0-3]):([0-5]\d)$", description="DND end time (HH:MM)")

    data_storage_location: Optional[str] = Field(None, description="Primary data storage location: 'local' or 'cloud'")
    data_auto_delete_policy: Optional[str] = Field(None, description="Data auto-deletion policy: '7d', '30d', '90d', 'never'")
    data_rag_whitelist: Optional[str] = Field(None, description="RAG whitelist sources (comma-separated or JSON string)")

    accessibility_high_contrast_mode: Optional[bool] = Field(None, description="Enable high contrast mode")

class UserSettingsCreate(UserSettingsBase):
    pass # All fields are optional for creation, defaults will be used

class UserSettingsUpdate(UserSettingsBase):
    pass # All fields are optional for update

class UserSettingsResponse(UserSettingsBase):
    id: int
    user_id: int

    class Config:
        orm_mode = True

# --- User AI Provider API Key Schemas --- 
class UserAIProviderKeyBase(BaseModel):
    provider_id: str = Field(..., description="Identifier for the AI provider (e.g., 'gemini', 'openrouter')")
    api_key: str = Field(..., description="The API key for the provider (will be encrypted on backend)")

class UserAIProviderKeyCreate(UserAIProviderKeyBase):
    pass

class UserAIProviderKeyUpdate(BaseModel):
    api_key: str = Field(..., description="The new API key for the provider (will be encrypted on backend)")

class UserAIProviderKeyResponse(BaseModel):
    id: int
    user_id: int
    provider_id: str
    # api_key: Optional[str] = Field(None, description="API key (only for display if decrypted, usually not sent)")
    # For security, we might not want to send the key back, even if it's the one just submitted.
    # The client can assume success if the call doesn't fail.
    # Or, send a masked version or just a status.
    api_key_is_set: bool = Field(True, description="Indicates if an API key is set for this provider")

    class Config:
        orm_mode = True

# --- App/Admin Setting Schemas --- 
class AppSettingBase(BaseModel):
    key: str = Field(..., description="Unique key for the application setting")
    value: Optional[str] = Field(None, description="Value of the application setting (stored as string)")

class AppSettingCreate(AppSettingBase):
    pass

class AppSettingUpdate(BaseModel):
    value: Optional[str] = Field(None, description="New value for the application setting")

class AppSettingResponse(AppSettingBase):
    id: int

    class Config:
        orm_mode = True

