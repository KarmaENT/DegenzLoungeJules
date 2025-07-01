"""
Knowledge Management System models for DeGeNz Lounge.
"""

from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Boolean, Table, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import JSONB, ARRAY

from app.database import Base


# Association table for knowledge items and tags
knowledge_item_tags = Table(
    'knowledge_item_tags',
    Base.metadata,
    Column('knowledge_item_id', Integer, ForeignKey('knowledge_items.id')),
    Column('tag_id', Integer, ForeignKey('knowledge_tags.id'))
)

# Association table for knowledge items and agents
knowledge_item_agents = Table(
    'knowledge_item_agents',
    Base.metadata,
    Column('knowledge_item_id', Integer, ForeignKey('knowledge_items.id')),
    Column('agent_id', Integer, ForeignKey('agents.id'))
)

# Association table for knowledge repositories and users
knowledge_repo_users = Table(
    'knowledge_repo_users',
    Base.metadata,
    Column('repository_id', Integer, ForeignKey('knowledge_repositories.id')),
    Column('user_id', Integer, ForeignKey('users.id'))
)


class KnowledgeRepository(Base):
    """
    A knowledge repository is a collection of knowledge items.
    It can be shared among users and accessed by agents.
    """
    __tablename__ = 'knowledge_repositories'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    is_public = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    owner_id = Column(Integer, ForeignKey('users.id'))
    
    # Relationships
    owner = relationship("User", back_populates="owned_repositories")
    shared_users = relationship("User", secondary=knowledge_repo_users, back_populates="shared_repositories")
    knowledge_items = relationship("KnowledgeItem", back_populates="repository")


class KnowledgeItem(Base):
    """
    A knowledge item represents a piece of information in the knowledge base.
    It can be a document, a web page, a note, or any other type of content.
    """
    __tablename__ = 'knowledge_items'

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    content = Column(Text)
    content_type = Column(String(50), default='text')  # text, document, webpage, etc.
    source_url = Column(String(500))
    source_type = Column(String(50))  # user, agent, web, document, etc.
    importance = Column(Float, default=1.0)  # Used for ranking and retrieval
    metadata = Column(JSONB)
    embedding = Column(ARRAY(Float))  # Vector embedding for semantic search
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    repository_id = Column(Integer, ForeignKey('knowledge_repositories.id'))
    creator_id = Column(Integer, ForeignKey('users.id'))
    
    # Relationships
    repository = relationship("KnowledgeRepository", back_populates="knowledge_items")
    creator = relationship("User", back_populates="created_knowledge_items")
    tags = relationship("KnowledgeTag", secondary=knowledge_item_tags, back_populates="knowledge_items")
    citations = relationship("Citation", back_populates="knowledge_item")
    related_agents = relationship("Agent", secondary=knowledge_item_agents, back_populates="knowledge_items")
    connections = relationship("KnowledgeConnection", back_populates="source_item")


class KnowledgeTag(Base):
    """
    Tags for categorizing knowledge items.
    """
    __tablename__ = 'knowledge_tags'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), nullable=False, unique=True)
    description = Column(Text)
    color = Column(String(7), default="#3498db")  # Hex color code
    
    # Relationships
    knowledge_items = relationship("KnowledgeItem", secondary=knowledge_item_tags, back_populates="tags")


class KnowledgeConnection(Base):
    """
    Represents a connection between two knowledge items.
    Used for building knowledge graphs.
    """
    __tablename__ = 'knowledge_connections'

    id = Column(Integer, primary_key=True, index=True)
    source_id = Column(Integer, ForeignKey('knowledge_items.id'))
    target_id = Column(Integer, ForeignKey('knowledge_items.id'))
    relationship_type = Column(String(50))  # e.g., "related", "contradicts", "supports", etc.
    strength = Column(Float, default=1.0)  # Connection strength (0.0 to 1.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    source_item = relationship("KnowledgeItem", foreign_keys=[source_id], back_populates="connections")
    target_item = relationship("KnowledgeItem", foreign_keys=[target_id])


class Document(Base):
    """
    Represents an uploaded document.
    """
    __tablename__ = 'documents'

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_type = Column(String(50))  # pdf, docx, txt, etc.
    file_size = Column(Integer)  # Size in bytes
    processed = Column(Boolean, default=False)
    processing_status = Column(String(50), default="pending")  # pending, processing, completed, failed
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    uploader_id = Column(Integer, ForeignKey('users.id'))
    
    # Relationships
    uploader = relationship("User", back_populates="uploaded_documents")
    knowledge_items = relationship("KnowledgeItem", secondary="document_knowledge_items")


# Association table for documents and knowledge items
document_knowledge_items = Table(
    'document_knowledge_items',
    Base.metadata,
    Column('document_id', Integer, ForeignKey('documents.id')),
    Column('knowledge_item_id', Integer, ForeignKey('knowledge_items.id'))
)


class Citation(Base):
    """
    Represents a citation of a knowledge item by an agent.
    """
    __tablename__ = 'citations'

    id = Column(Integer, primary_key=True, index=True)
    knowledge_item_id = Column(Integer, ForeignKey('knowledge_items.id'))
    agent_id = Column(Integer, ForeignKey('agents.id'))
    message_id = Column(Integer, ForeignKey('messages.id'))
    context = Column(Text)  # The context in which the citation was used
    relevance_score = Column(Float)  # How relevant the citation was (0.0 to 1.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    knowledge_item = relationship("KnowledgeItem", back_populates="citations")
    agent = relationship("Agent", back_populates="citations")
    message = relationship("Message", back_populates="citations")


class WebSearchResult(Base):
    """
    Represents a web search result that can be added to the knowledge base.
    """
    __tablename__ = 'web_search_results'

    id = Column(Integer, primary_key=True, index=True)
    query = Column(String(500), nullable=False)
    url = Column(String(500), nullable=False)
    title = Column(String(500))
    snippet = Column(Text)
    content = Column(Text)
    search_engine = Column(String(50))  # google, bing, etc.
    search_date = Column(DateTime(timezone=True), server_default=func.now())
    added_to_knowledge = Column(Boolean, default=False)
    knowledge_item_id = Column(Integer, ForeignKey('knowledge_items.id'), nullable=True)
    searcher_id = Column(Integer, ForeignKey('users.id'))
    
    # Relationships
    searcher = relationship("User", back_populates="web_searches")
    knowledge_item = relationship("KnowledgeItem")


# Add relationships to existing models

# Update User model relationships
def update_user_model():
    from app.models.models import User
    
    User.owned_repositories = relationship("KnowledgeRepository", back_populates="owner")
    User.shared_repositories = relationship("KnowledgeRepository", secondary=knowledge_repo_users, back_populates="shared_users")
    User.created_knowledge_items = relationship("KnowledgeItem", back_populates="creator")
    User.uploaded_documents = relationship("Document", back_populates="uploader")
    User.web_searches = relationship("WebSearchResult", back_populates="searcher")

# Update Agent model relationships
def update_agent_model():
    from app.models.models import Agent
    
    Agent.knowledge_items = relationship("KnowledgeItem", secondary=knowledge_item_agents, back_populates="related_agents")
    Agent.citations = relationship("Citation", back_populates="agent")

# Update Message model relationships
def update_message_model():
    from app.models.models import Message
    
    Message.citations = relationship("Citation", back_populates="message")
