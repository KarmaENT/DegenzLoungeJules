from sqlalchemy import Column, Integer, String, Text, ForeignKey, Boolean, DateTime, JSON, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import enum

class MessageType(enum.Enum):
    USER = "user"
    AGENT = "agent"
    AGENT_TO_AGENT = "agent_to_agent"
    SYSTEM = "system"
    CONFLICT_RESOLUTION = "conflict_resolution"
    WORKFLOW = "workflow"

class AgentRole(enum.Enum):
    MANAGER = "manager"
    WORKER = "worker"
    SPECIALIST = "specialist"
    REVIEWER = "reviewer"
    COORDINATOR = "coordinator"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    agents = relationship("Agent", back_populates="owner")
    sessions = relationship("Session", back_populates="owner")
    workflows = relationship("Workflow", back_populates="owner")

class Agent(Base):
    __tablename__ = "agents"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    role = Column(String)
    personality = Column(String)
    system_instructions = Column(Text)
    examples = Column(JSON)
    owner_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    owner = relationship("User", back_populates="agents")
    sessions = relationship("SessionAgent", back_populates="agent")

class Session(Base):
    __tablename__ = "sessions"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(Text)
    owner_id = Column(Integer, ForeignKey("users.id"))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    owner = relationship("User", back_populates="sessions")
    agents = relationship("SessionAgent", back_populates="session")
    messages = relationship("Message", back_populates="session")
    direct_messages = relationship("DirectMessage", back_populates="session")
    agent_relationships = relationship("AgentRelationship", back_populates="session")
    conflict_resolutions = relationship("ConflictResolution", back_populates="session")
    teams = relationship("AgentTeam", back_populates="session")
    workflows = relationship("WorkflowSession", back_populates="session")

class SessionAgent(Base):
    __tablename__ = "session_agents"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("sessions.id"))
    agent_id = Column(Integer, ForeignKey("agents.id"))
    is_manager = Column(Boolean, default=False)
    role = Column(Enum(AgentRole), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    session = relationship("Session", back_populates="agents")
    agent = relationship("Agent", back_populates="sessions")
    messages = relationship("Message", back_populates="session_agent")
    sent_messages = relationship("DirectMessage", foreign_keys="DirectMessage.sender_agent_id", back_populates="sender")
    received_messages = relationship("DirectMessage", foreign_keys="DirectMessage.recipient_agent_id", back_populates="recipient")
    outgoing_relationships = relationship("AgentRelationship", foreign_keys="AgentRelationship.source_agent_id", back_populates="source_agent")
    incoming_relationships = relationship("AgentRelationship", foreign_keys="AgentRelationship.target_agent_id", back_populates="target_agent")
    resolved_conflicts = relationship("ConflictResolution", back_populates="resolved_by")
    led_teams = relationship("AgentTeam", back_populates="leader")
    team_memberships = relationship("AgentTeamMember", back_populates="agent")

class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text)
    message_type = Column(Enum(MessageType), default=MessageType.USER)
    session_id = Column(Integer, ForeignKey("sessions.id"))
    session_agent_id = Column(Integer, ForeignKey("session_agents.id"), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    parent_id = Column(Integer, ForeignKey("messages.id"), nullable=True)
    metadata = Column(JSON, nullable=True)  # For additional data like conflict votes, workflow info
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    session = relationship("Session", back_populates="messages")
    session_agent = relationship("SessionAgent", back_populates="messages")
    replies = relationship("Message", backref=ForeignKey("messages.parent_id"))

class DirectMessage(Base):
    """
    Direct messages between agents
    """
    __tablename__ = "direct_messages"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text)
    session_id = Column(Integer, ForeignKey("sessions.id"))
    sender_agent_id = Column(Integer, ForeignKey("session_agents.id"))
    recipient_agent_id = Column(Integer, ForeignKey("session_agents.id"))
    is_private = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    session = relationship("Session", back_populates="direct_messages")
    sender = relationship("SessionAgent", foreign_keys=[sender_agent_id], back_populates="sent_messages")
    recipient = relationship("SessionAgent", foreign_keys=[recipient_agent_id], back_populates="received_messages")

class AgentRelationship(Base):
    """
    Defines relationships between agents in a session
    """
    __tablename__ = "agent_relationships"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("sessions.id"))
    source_agent_id = Column(Integer, ForeignKey("session_agents.id"))
    target_agent_id = Column(Integer, ForeignKey("session_agents.id"))
    relationship_type = Column(String)  # e.g., "reports_to", "collaborates_with", "reviews"
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    session = relationship("Session", back_populates="agent_relationships")
    source_agent = relationship("SessionAgent", foreign_keys=[source_agent_id], back_populates="outgoing_relationships")
    target_agent = relationship("SessionAgent", foreign_keys=[target_agent_id], back_populates="incoming_relationships")

class Workflow(Base):
    """
    Predefined workflows for common tasks
    """
    __tablename__ = "workflows"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(Text)
    steps = Column(JSON)  # JSON array of workflow steps
    owner_id = Column(Integer, ForeignKey("users.id"))
    is_public = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    owner = relationship("User", back_populates="workflows")
    sessions = relationship("WorkflowSession", back_populates="workflow")

class WorkflowSession(Base):
    """
    Association between workflows and sessions
    """
    __tablename__ = "workflow_sessions"

    id = Column(Integer, primary_key=True, index=True)
    workflow_id = Column(Integer, ForeignKey("workflows.id"))
    session_id = Column(Integer, ForeignKey("sessions.id"))
    status = Column(String, default="pending")  # pending, in_progress, completed, failed
    current_step = Column(Integer, default=0)
    results = Column(JSON, default={})
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    workflow = relationship("Workflow", back_populates="sessions")
    session = relationship("Session", back_populates="workflows")

class ConflictResolution(Base):
    """
    Conflict resolution records
    """
    __tablename__ = "conflict_resolutions"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("sessions.id"))
    conflict_message_id = Column(Integer, ForeignKey("messages.id"))
    resolution_method = Column(String)  # voting, manager_decision, consensus
    resolution_data = Column(JSON)  # Voting results or other resolution data
    resolved_by_agent_id = Column(Integer, ForeignKey("session_agents.id"), nullable=True)
    resolution_message_id = Column(Integer, ForeignKey("messages.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    resolved_at = Column(DateTime(timezone=True), nullable=True)

    session = relationship("Session", back_populates="conflict_resolutions")
    conflict_message = relationship("Message", foreign_keys=[conflict_message_id])
    resolution_message = relationship("Message", foreign_keys=[resolution_message_id])
    resolved_by = relationship("SessionAgent", back_populates="resolved_conflicts")

class AgentTeam(Base):
    """
    Teams of agents with specific purposes
    """
    __tablename__ = "agent_teams"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(Text)
    session_id = Column(Integer, ForeignKey("sessions.id"))
    leader_agent_id = Column(Integer, ForeignKey("session_agents.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    session = relationship("Session", back_populates="teams")
    leader = relationship("SessionAgent", back_populates="led_teams")
    members = relationship("AgentTeamMember", back_populates="team")

class AgentTeamMember(Base):
    """
    Members of agent teams
    """
    __tablename__ = "agent_team_members"

    id = Column(Integer, primary_key=True, index=True)
    team_id = Column(Integer, ForeignKey("agent_teams.id"))
    agent_id = Column(Integer, ForeignKey("session_agents.id"))
    role = Column(Enum(AgentRole))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    team = relationship("AgentTeam", back_populates="members")
    agent = relationship("SessionAgent", back_populates="team_memberships")
