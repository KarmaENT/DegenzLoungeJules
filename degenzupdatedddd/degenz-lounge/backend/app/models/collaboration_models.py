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
