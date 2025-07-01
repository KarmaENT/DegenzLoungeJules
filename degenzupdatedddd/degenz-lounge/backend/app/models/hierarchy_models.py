from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Table, Text, JSON, DateTime, Enum, func
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from enum import Enum as PyEnum
from typing import List, Optional, Dict, Any
import datetime

Base = declarative_base()

# Association table for team members
team_member_association = Table(
    'team_member_association',
    Base.metadata,
    Column('team_id', Integer, ForeignKey('teams.id'), primary_key=True),
    Column('agent_id', Integer, ForeignKey('agents.id'), primary_key=True)
)

# Association table for team roles
team_role_association = Table(
    'team_role_association',
    Base.metadata,
    Column('team_id', Integer, ForeignKey('teams.id'), primary_key=True),
    Column('role_id', Integer, ForeignKey('agent_roles.id'), primary_key=True)
)

class AgentRoleType(str, PyEnum):
    LEADER = "leader"
    MEMBER = "member"
    SPECIALIST = "specialist"
    OBSERVER = "observer"

class AgentRole(Base):
    """
    Defines a role that can be assigned to agents within a team
    """
    __tablename__ = "agent_roles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    permissions = Column(JSON, nullable=True)
    role_type = Column(String, nullable=False, default=AgentRoleType.MEMBER)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    teams = relationship("Team", secondary=team_role_association, back_populates="available_roles")
    agent_role_assignments = relationship("AgentRoleAssignment", back_populates="role")

class Team(Base):
    """
    Represents a team of agents with a hierarchical structure
    """
    __tablename__ = "teams"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    is_public = Column(Boolean, default=False)
    hierarchy_structure = Column(JSON, nullable=True)  # Stores the team's hierarchical structure
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    owner = relationship("User", back_populates="owned_teams")
    members = relationship("Agent", secondary=team_member_association, back_populates="teams")
    available_roles = relationship("AgentRole", secondary=team_role_association, back_populates="teams")
    agent_role_assignments = relationship("AgentRoleAssignment", back_populates="team")
    team_sessions = relationship("TeamSession", back_populates="team")

class AgentRoleAssignment(Base):
    """
    Assigns a role to an agent within a specific team
    """
    __tablename__ = "agent_role_assignments"

    id = Column(Integer, primary_key=True, index=True)
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=False)
    agent_id = Column(Integer, ForeignKey("agents.id"), nullable=False)
    role_id = Column(Integer, ForeignKey("agent_roles.id"), nullable=False)
    assigned_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    team = relationship("Team", back_populates="agent_role_assignments")
    agent = relationship("Agent", back_populates="role_assignments")
    role = relationship("AgentRole", back_populates="agent_role_assignments")
    user = relationship("User")

class TeamSession(Base):
    """
    Represents a session where a team of agents is working together
    """
    __tablename__ = "team_sessions"

    id = Column(Integer, primary_key=True, index=True)
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=False)
    session_id = Column(Integer, ForeignKey("sessions.id"), nullable=False)
    active_hierarchy = Column(JSON, nullable=True)  # The active hierarchy for this session
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    team = relationship("Team", back_populates="team_sessions")
    session = relationship("Session", back_populates="team_sessions")
    hierarchical_messages = relationship("HierarchicalMessage", back_populates="team_session")

class HierarchicalMessage(Base):
    """
    Represents a message sent within a hierarchical team structure
    """
    __tablename__ = "hierarchical_messages"

    id = Column(Integer, primary_key=True, index=True)
    team_session_id = Column(Integer, ForeignKey("team_sessions.id"), nullable=False)
    sender_agent_id = Column(Integer, ForeignKey("session_agents.id"), nullable=False)
    content = Column(Text, nullable=False)
    message_type = Column(String, nullable=False)  # e.g., "instruction", "report", "question"
    target_level = Column(String, nullable=True)  # Target hierarchy level (e.g., "all", "up", "down", "same")
    target_roles = Column(JSON, nullable=True)  # List of role IDs this message targets
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    team_session = relationship("TeamSession", back_populates="hierarchical_messages")
    sender_agent = relationship("SessionAgent")
    responses = relationship("HierarchicalMessage", 
                            foreign_keys=[id],
                            remote_side=[id],
                            backref="parent_message")
