"""
API routes for Knowledge Management System.
"""

from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.utils.auth import get_current_user
from app.models.knowledge_models import (
    KnowledgeRepository,
    KnowledgeItem,
    KnowledgeTag,
    KnowledgeConnection,
    Document,
    Citation,
    WebSearchResult
)
from app.services.knowledge.knowledge_service import (
    KnowledgeService,
    DocumentService,
    WebResearchService,
    CitationService
)
from app.models.schemas import (
    KnowledgeRepositoryCreate,
    KnowledgeRepositoryResponse,
    KnowledgeItemCreate,
    KnowledgeItemResponse,
    KnowledgeTagCreate,
    KnowledgeTagResponse,
    KnowledgeConnectionCreate,
    KnowledgeConnectionResponse,
    DocumentResponse,
    CitationResponse,
    WebSearchResultResponse,
    KnowledgeGraphResponse,
    UserResponse
)

router = APIRouter(
    prefix="/knowledge",
    tags=["knowledge"],
    responses={404: {"description": "Not found"}},
)

# Repository routes
@router.post("/repositories", response_model=KnowledgeRepositoryResponse)
async def create_repository(
    repository: KnowledgeRepositoryCreate,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    """Create a new knowledge repository."""
    return await KnowledgeService.create_repository(
        db=db,
        name=repository.name,
        description=repository.description,
        owner_id=current_user.id,
        is_public=repository.is_public
    )

@router.get("/repositories", response_model=List[KnowledgeRepositoryResponse])
async def get_repositories(
    include_public: bool = True,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    """Get all repositories accessible by the current user."""
    return await KnowledgeService.get_repositories(
        db=db,
        user_id=current_user.id,
        include_public=include_public
    )

@router.get("/repositories/{repository_id}", response_model=KnowledgeRepositoryResponse)
async def get_repository(
    repository_id: int,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    """Get a specific repository if accessible by the current user."""
    repository = await KnowledgeService.get_repository(
        db=db,
        repository_id=repository_id,
        user_id=current_user.id
    )
    
    if not repository:
        raise HTTPException(status_code=404, detail="Repository not found or you don't have permission")
    
    return repository

@router.post("/repositories/{repository_id}/share", response_model=KnowledgeRepositoryResponse)
async def share_repository(
    repository_id: int,
    user_ids: List[int],
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    """Share a repository with other users."""
    return await KnowledgeService.share_repository(
        db=db,
        repository_id=repository_id,
        owner_id=current_user.id,
        user_ids=user_ids
    )

# Knowledge item routes
@router.post("/items", response_model=KnowledgeItemResponse)
async def create_knowledge_item(
    item: KnowledgeItemCreate,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    """Create a new knowledge item."""
    return await KnowledgeService.create_knowledge_item(
        db=db,
        repository_id=item.repository_id,
        title=item.title,
        content=item.content,
        creator_id=current_user.id,
        content_type=item.content_type,
        source_url=item.source_url,
        source_type=item.source_type,
        importance=item.importance,
        metadata=item.metadata,
        tag_ids=item.tag_ids
    )

@router.get("/search", response_model=List[KnowledgeItemResponse])
async def search_knowledge(
    query: str,
    repository_id: Optional[int] = None,
    tag_ids: List[int] = Query(None),
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    """Search knowledge items using semantic search."""
    return await KnowledgeService.search_knowledge(
        db=db,
        user_id=current_user.id,
        query=query,
        repository_id=repository_id,
        tag_ids=tag_ids,
        limit=limit
    )

@router.post("/connections", response_model=KnowledgeConnectionResponse)
async def create_connection(
    connection: KnowledgeConnectionCreate,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    """Create a connection between two knowledge items."""
    return await KnowledgeService.create_connection(
        db=db,
        source_id=connection.source_id,
        target_id=connection.target_id,
        relationship_type=connection.relationship_type,
        strength=connection.strength
    )

@router.get("/graph", response_model=KnowledgeGraphResponse)
async def get_knowledge_graph(
    repository_id: Optional[int] = None,
    central_item_id: Optional[int] = None,
    depth: int = 2,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    """Get knowledge graph data for visualization."""
    return await KnowledgeService.get_knowledge_graph(
        db=db,
        user_id=current_user.id,
        repository_id=repository_id,
        central_item_id=central_item_id,
        depth=depth
    )

# Document routes
@router.post("/documents/upload", response_model=DocumentResponse)
async def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    """Upload a document and queue it for processing."""
    return await DocumentService.upload_document(
        db=db,
        file=file,
        uploader_id=current_user.id
    )

@router.get("/documents/{document_id}", response_model=DocumentResponse)
async def get_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    """Get a specific document."""
    document = db.query(Document).filter(
        Document.id == document_id,
        Document.uploader_id == current_user.id
    ).first()
    
    if not document:
        raise HTTPException(status_code=404, detail="Document not found or you don't have permission")
    
    return document

@router.post("/documents/{document_id}/process", response_model=DocumentResponse)
async def process_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    """Process a document and extract knowledge items."""
    # Check if user has permission
    document = db.query(Document).filter(
        Document.id == document_id,
        Document.uploader_id == current_user.id
    ).first()
    
    if not document:
        raise HTTPException(status_code=404, detail="Document not found or you don't have permission")
    
    return await DocumentService.process_document(db=db, document_id=document_id)

# Web research routes
@router.post("/web/search", response_model=List[WebSearchResultResponse])
async def search_web(
    query: str,
    search_engine: str = "google",
    num_results: int = 5,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    """Perform a web search and store results."""
    return await WebResearchService.search_web(
        db=db,
        query=query,
        user_id=current_user.id,
        search_engine=search_engine,
        num_results=num_results
    )

@router.post("/web/results/{result_id}/add", response_model=KnowledgeItemResponse)
async def add_web_result_to_knowledge(
    result_id: int,
    repository_id: int,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    """Add a web search result to the knowledge base."""
    return await WebResearchService.add_to_knowledge_base(
        db=db,
        web_result_id=result_id,
        repository_id=repository_id,
        user_id=current_user.id
    )

# Citation routes
@router.post("/citations", response_model=CitationResponse)
async def create_citation(
    knowledge_item_id: int,
    agent_id: int,
    message_id: int,
    context: str,
    relevance_score: float = 0.8,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    """Create a citation of a knowledge item by an agent."""
    return await CitationService.create_citation(
        db=db,
        knowledge_item_id=knowledge_item_id,
        agent_id=agent_id,
        message_id=message_id,
        context=context,
        relevance_score=relevance_score
    )

@router.get("/citations/agent/{agent_id}", response_model=List[CitationResponse])
async def get_citations_by_agent(
    agent_id: int,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    """Get all citations by a specific agent."""
    return await CitationService.get_citations_by_agent(db=db, agent_id=agent_id)

@router.get("/citations/message/{message_id}", response_model=List[CitationResponse])
async def get_citations_by_message(
    message_id: int,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    """Get all citations in a specific message."""
    return await CitationService.get_citations_by_message(db=db, message_id=message_id)

@router.get("/citations/item/{knowledge_item_id}", response_model=List[CitationResponse])
async def get_citations_by_knowledge_item(
    knowledge_item_id: int,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    """Get all citations of a specific knowledge item."""
    return await CitationService.get_citations_by_knowledge_item(db=db, knowledge_item_id=knowledge_item_id)
