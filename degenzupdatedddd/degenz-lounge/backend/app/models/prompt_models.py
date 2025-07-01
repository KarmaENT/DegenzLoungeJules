"""
Database models for Advanced Prompt Engineering Tools
"""

from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Boolean, Table, Float, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base

# Association table for prompt templates and tags
prompt_template_tags = Table(
    'prompt_template_tags',
    Base.metadata,
    Column('prompt_template_id', Integer, ForeignKey('prompt_templates.id')),
    Column('prompt_tag_id', Integer, ForeignKey('prompt_tags.id'))
)

# Association table for prompt chains and templates
prompt_chain_templates = Table(
    'prompt_chain_templates',
    Base.metadata,
    Column('prompt_chain_id', Integer, ForeignKey('prompt_chains.id')),
    Column('prompt_template_id', Integer, ForeignKey('prompt_templates.id')),
    Column('order_index', Integer)
)

class PromptTemplate(Base):
    """
    A prompt template with variables that can be filled in.
    """
    __tablename__ = 'prompt_templates'

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text)
    template_text = Column(Text, nullable=False)
    variables = Column(JSON)  # List of variable names and descriptions
    default_values = Column(JSON)  # Default values for variables
    is_public = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    creator_id = Column(Integer, ForeignKey('users.id'))
    
    # Relationships
    creator = relationship("User", back_populates="prompt_templates")
    tags = relationship("PromptTag", secondary=prompt_template_tags, back_populates="templates")
    test_results = relationship("PromptTestResult", back_populates="template")
    usage_analytics = relationship("PromptUsageAnalytics", back_populates="template")
    chains = relationship("PromptChain", secondary=prompt_chain_templates, back_populates="templates")


class PromptTag(Base):
    """
    Tags for categorizing prompt templates.
    """
    __tablename__ = 'prompt_tags'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), nullable=False, unique=True)
    description = Column(Text)
    color = Column(String(7), default="#3498db")  # Hex color code
    
    # Relationships
    templates = relationship("PromptTemplate", secondary=prompt_template_tags, back_populates="tags")


class PromptChain(Base):
    """
    A sequence of prompt templates that form a workflow.
    """
    __tablename__ = 'prompt_chains'

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text)
    is_public = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    creator_id = Column(Integer, ForeignKey('users.id'))
    
    # Relationships
    creator = relationship("User", back_populates="prompt_chains")
    templates = relationship("PromptTemplate", secondary=prompt_chain_templates, back_populates="chains")
    test_results = relationship("ChainTestResult", back_populates="chain")
    usage_analytics = relationship("ChainUsageAnalytics", back_populates="chain")


class PromptTestResult(Base):
    """
    Results from testing a prompt template with different parameters.
    """
    __tablename__ = 'prompt_test_results'

    id = Column(Integer, primary_key=True, index=True)
    template_id = Column(Integer, ForeignKey('prompt_templates.id'))
    user_id = Column(Integer, ForeignKey('users.id'))
    model = Column(String(100))  # AI model used for testing
    parameters = Column(JSON)  # Model parameters (temperature, etc.)
    variables_used = Column(JSON)  # Variable values used in this test
    prompt_text = Column(Text)  # The final prompt text after variable substitution
    response_text = Column(Text)  # The response from the AI model
    execution_time = Column(Float)  # Time taken to generate response in seconds
    rating = Column(Integer)  # User rating of the response (1-5)
    notes = Column(Text)  # User notes about the test
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    template = relationship("PromptTemplate", back_populates="test_results")
    user = relationship("User", back_populates="prompt_test_results")


class ChainTestResult(Base):
    """
    Results from testing a prompt chain.
    """
    __tablename__ = 'chain_test_results'

    id = Column(Integer, primary_key=True, index=True)
    chain_id = Column(Integer, ForeignKey('prompt_chains.id'))
    user_id = Column(Integer, ForeignKey('users.id'))
    model = Column(String(100))  # AI model used for testing
    parameters = Column(JSON)  # Model parameters (temperature, etc.)
    input_variables = Column(JSON)  # Initial variable values
    intermediate_results = Column(JSON)  # Results from each step in the chain
    final_result = Column(Text)  # The final output from the chain
    execution_time = Column(Float)  # Total time taken to execute the chain
    rating = Column(Integer)  # User rating of the result (1-5)
    notes = Column(Text)  # User notes about the test
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    chain = relationship("PromptChain", back_populates="test_results")
    user = relationship("User", back_populates="chain_test_results")


class PromptUsageAnalytics(Base):
    """
    Analytics data for prompt template usage.
    """
    __tablename__ = 'prompt_usage_analytics'

    id = Column(Integer, primary_key=True, index=True)
    template_id = Column(Integer, ForeignKey('prompt_templates.id'))
    user_id = Column(Integer, ForeignKey('users.id'))
    agent_id = Column(Integer, ForeignKey('agents.id'), nullable=True)
    session_id = Column(Integer, ForeignKey('sessions.id'), nullable=True)
    model = Column(String(100))
    parameters = Column(JSON)
    variables_used = Column(JSON)
    execution_time = Column(Float)
    token_count = Column(Integer)
    success = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    template = relationship("PromptTemplate", back_populates="usage_analytics")
    user = relationship("User", back_populates="prompt_usage_analytics")
    agent = relationship("Agent", back_populates="prompt_usage_analytics")
    session = relationship("Session", back_populates="prompt_usage_analytics")


class ChainUsageAnalytics(Base):
    """
    Analytics data for prompt chain usage.
    """
    __tablename__ = 'chain_usage_analytics'

    id = Column(Integer, primary_key=True, index=True)
    chain_id = Column(Integer, ForeignKey('prompt_chains.id'))
    user_id = Column(Integer, ForeignKey('users.id'))
    agent_id = Column(Integer, ForeignKey('agents.id'), nullable=True)
    session_id = Column(Integer, ForeignKey('sessions.id'), nullable=True)
    model = Column(String(100))
    parameters = Column(JSON)
    input_variables = Column(JSON)
    step_execution_times = Column(JSON)  # Time taken for each step
    total_execution_time = Column(Float)  # Total time for the chain
    total_token_count = Column(Integer)
    success = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    chain = relationship("PromptChain", back_populates="usage_analytics")
    user = relationship("User", back_populates="chain_usage_analytics")
    agent = relationship("Agent", back_populates="chain_usage_analytics")
    session = relationship("Session", back_populates="chain_usage_analytics")


class PromptLibraryItem(Base):
    """
    An item in the community prompt library.
    """
    __tablename__ = 'prompt_library_items'

    id = Column(Integer, primary_key=True, index=True)
    template_id = Column(Integer, ForeignKey('prompt_templates.id'), nullable=True)
    chain_id = Column(Integer, ForeignKey('prompt_chains.id'), nullable=True)
    title = Column(String(200), nullable=False)
    description = Column(Text)
    item_type = Column(String(50))  # 'template' or 'chain'
    is_featured = Column(Boolean, default=False)
    download_count = Column(Integer, default=0)
    rating_sum = Column(Integer, default=0)
    rating_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    creator_id = Column(Integer, ForeignKey('users.id'))
    
    # Relationships
    creator = relationship("User", back_populates="library_items")
    reviews = relationship("PromptLibraryReview", back_populates="library_item")


class PromptLibraryReview(Base):
    """
    A review for an item in the community prompt library.
    """
    __tablename__ = 'prompt_library_reviews'

    id = Column(Integer, primary_key=True, index=True)
    library_item_id = Column(Integer, ForeignKey('prompt_library_items.id'))
    user_id = Column(Integer, ForeignKey('users.id'))
    rating = Column(Integer)  # 1-5 stars
    review_text = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    library_item = relationship("PromptLibraryItem", back_populates="reviews")
    user = relationship("User", back_populates="prompt_reviews")


# Update User model relationships
def update_user_model():
    from app.models.models import User
    
    User.prompt_templates = relationship("PromptTemplate", back_populates="creator")
    User.prompt_chains = relationship("PromptChain", back_populates="creator")
    User.prompt_test_results = relationship("PromptTestResult", back_populates="user")
    User.chain_test_results = relationship("ChainTestResult", back_populates="user")
    User.prompt_usage_analytics = relationship("PromptUsageAnalytics", back_populates="user")
    User.chain_usage_analytics = relationship("ChainUsageAnalytics", back_populates="user")
    User.library_items = relationship("PromptLibraryItem", back_populates="creator")
    User.prompt_reviews = relationship("PromptLibraryReview", back_populates="user")

# Update Agent model relationships
def update_agent_model():
    from app.models.models import Agent
    
    Agent.prompt_usage_analytics = relationship("PromptUsageAnalytics", back_populates="agent")
    Agent.chain_usage_analytics = relationship("ChainUsageAnalytics", back_populates="agent")

# Update Session model relationships
def update_session_model():
    from app.models.models import Session
    
    Session.prompt_usage_analytics = relationship("PromptUsageAnalytics", back_populates="session")
    Session.chain_usage_analytics = relationship("ChainUsageAnalytics", back_populates="session")
