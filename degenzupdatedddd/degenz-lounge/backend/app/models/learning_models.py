from sqlalchemy import Column, Integer, String, Text, ForeignKey, Boolean, DateTime, JSON, Enum, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import enum

class FeedbackType(enum.Enum):
    RATING = "rating"
    THUMBS = "thumbs"
    DETAILED = "detailed"
    SUGGESTION = "suggestion"

class FeedbackCategory(enum.Enum):
    ACCURACY = "accuracy"
    HELPFULNESS = "helpfulness"
    CREATIVITY = "creativity"
    CLARITY = "clarity"
    SPEED = "speed"
    OVERALL = "overall"

class AgentFeedback(Base):
    """
    User feedback on agent responses
    """
    __tablename__ = "agent_feedback"

    id = Column(Integer, primary_key=True, index=True)
    message_id = Column(Integer, ForeignKey("messages.id"))
    session_id = Column(Integer, ForeignKey("sessions.id"))
    agent_id = Column(Integer, ForeignKey("session_agents.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    feedback_type = Column(Enum(FeedbackType), default=FeedbackType.RATING)
    category = Column(Enum(FeedbackCategory), default=FeedbackCategory.OVERALL)
    rating = Column(Float, nullable=True)  # 1-5 star rating
    is_positive = Column(Boolean, nullable=True)  # For thumbs up/down
    comment = Column(Text, nullable=True)  # Detailed feedback
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    message = relationship("Message")
    session = relationship("Session")
    agent = relationship("SessionAgent")
    user = relationship("User")

class PerformanceMetric(Base):
    """
    Tracked performance metrics for agents
    """
    __tablename__ = "performance_metrics"

    id = Column(Integer, primary_key=True, index=True)
    agent_id = Column(Integer, ForeignKey("agents.id"))
    session_id = Column(Integer, ForeignKey("sessions.id"), nullable=True)
    metric_name = Column(String)  # e.g., "response_time", "accuracy_score", "user_satisfaction"
    metric_value = Column(Float)
    metadata = Column(JSON, nullable=True)  # Additional context about the metric
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    agent = relationship("Agent")
    session = relationship("Session", nullable=True)

class ImprovementSuggestion(Base):
    """
    Automatically generated improvement suggestions for agents
    """
    __tablename__ = "improvement_suggestions"

    id = Column(Integer, primary_key=True, index=True)
    agent_id = Column(Integer, ForeignKey("agents.id"))
    suggestion_type = Column(String)  # e.g., "instruction_update", "personality_adjustment", "example_addition"
    suggestion_content = Column(Text)
    confidence_score = Column(Float)  # How confident the system is in this suggestion (0-1)
    supporting_evidence = Column(JSON)  # Data points supporting this suggestion
    is_implemented = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    implemented_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    agent = relationship("Agent")

class AgentVersion(Base):
    """
    Version history for agent configurations
    """
    __tablename__ = "agent_versions"

    id = Column(Integer, primary_key=True, index=True)
    agent_id = Column(Integer, ForeignKey("agents.id"))
    version_number = Column(Integer)
    name = Column(String)
    role = Column(String)
    personality = Column(String)
    system_instructions = Column(Text)
    examples = Column(JSON)
    parameters = Column(JSON, nullable=True)  # Fine-tuning parameters
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    created_by_id = Column(Integer, ForeignKey("users.id"))
    is_active = Column(Boolean, default=False)
    
    # Relationships
    agent = relationship("Agent")
    created_by = relationship("User")

class ABTest(Base):
    """
    A/B tests for comparing agent configurations
    """
    __tablename__ = "ab_tests"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    description = Column(Text, nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    control_version_id = Column(Integer, ForeignKey("agent_versions.id"))
    variant_version_id = Column(Integer, ForeignKey("agent_versions.id"))
    test_parameters = Column(JSON)  # Test configuration
    status = Column(String, default="created")  # created, running, completed, analyzed
    start_date = Column(DateTime(timezone=True), nullable=True)
    end_date = Column(DateTime(timezone=True), nullable=True)
    results = Column(JSON, nullable=True)  # Test results
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User")
    control_version = relationship("AgentVersion", foreign_keys=[control_version_id])
    variant_version = relationship("AgentVersion", foreign_keys=[variant_version_id])
    test_sessions = relationship("ABTestSession", back_populates="ab_test")

class ABTestSession(Base):
    """
    Sessions used in A/B tests
    """
    __tablename__ = "ab_test_sessions"

    id = Column(Integer, primary_key=True, index=True)
    ab_test_id = Column(Integer, ForeignKey("ab_tests.id"))
    session_id = Column(Integer, ForeignKey("sessions.id"))
    version_used = Column(String)  # "control" or "variant"
    metrics = Column(JSON, nullable=True)  # Performance metrics for this session
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    ab_test = relationship("ABTest", back_populates="test_sessions")
    session = relationship("Session")
