import React, { useState, useEffect } from 'react';
import { 
  FaBook, 
  FaPlus, 
  FaSearch, 
  FaUpload, 
  FaGlobe, 
  FaProjectDiagram,
  FaQuoteRight,
  FaEllipsisV,
  FaShare,
  FaTrash,
  FaEdit
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import KnowledgeGraph from './KnowledgeGraph';
import DocumentUploader from './DocumentUploader';
import WebResearch from './WebResearch';
import './KnowledgeBase.css';

const KnowledgeBase = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('repositories');
  const [repositories, setRepositories] = useState([]);
  const [selectedRepository, setSelectedRepository] = useState(null);
  const [knowledgeItems, setKnowledgeItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreatingRepository, setIsCreatingRepository] = useState(false);
  const [newRepositoryName, setNewRepositoryName] = useState('');
  const [newRepositoryDescription, setNewRepositoryDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showUploader, setShowUploader] = useState(false);
  const [showWebResearch, setShowWebResearch] = useState(false);
  const [showGraph, setShowGraph] = useState(false);

  // Fetch repositories on component mount
  useEffect(() => {
    fetchRepositories();
  }, []);

  // Fetch knowledge items when a repository is selected
  useEffect(() => {
    if (selectedRepository) {
      fetchKnowledgeItems(selectedRepository.id);
    }
  }, [selectedRepository]);

  const fetchRepositories = async () => {
    setIsLoading(true);
    try {
      // In a real implementation, this would be an API call
      const response = await fetch('/api/knowledge/repositories');
      const data = await response.json();
      setRepositories(data);
      if (data.length > 0 && !selectedRepository) {
        setSelectedRepository(data[0]);
      }
    } catch (error) {
      console.error('Error fetching repositories:', error);
      // Mock data for demonstration
      const mockData = [
        { id: 1, name: 'Personal Knowledge', description: 'My personal knowledge repository', is_public: false },
        { id: 2, name: 'Team Knowledge', description: 'Shared knowledge for the team', is_public: true },
        { id: 3, name: 'Project Research', description: 'Research for current projects', is_public: false }
      ];
      setRepositories(mockData);
      if (!selectedRepository) {
        setSelectedRepository(mockData[0]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchKnowledgeItems = async (repositoryId) => {
    setIsLoading(true);
    try {
      // In a real implementation, this would be an API call
      const response = await fetch(`/api/knowledge/repositories/${repositoryId}/items`);
      const data = await response.json();
      setKnowledgeItems(data);
    } catch (error) {
      console.error('Error fetching knowledge items:', error);
      // Mock data for demonstration
      const mockData = [
        { 
          id: 1, 
          title: 'Introduction to AI Agents', 
          content: 'AI agents are autonomous entities that can perceive their environment and take actions to achieve specific goals...', 
          content_type: 'text',
          tags: ['AI', 'Agents', 'Introduction'],
          created_at: '2025-04-15T10:30:00Z'
        },
        { 
          id: 2, 
          title: 'Agent Collaboration Techniques', 
          content: 'When multiple agents collaborate, they can achieve more complex tasks through coordination and specialization...', 
          content_type: 'text',
          tags: ['Collaboration', 'Multi-agent', 'Techniques'],
          created_at: '2025-04-16T14:45:00Z'
        },
        { 
          id: 3, 
          title: 'Research Paper: Emergent Behaviors in Agent Systems', 
          content: 'This paper explores how complex behaviors emerge from simple rules in multi-agent systems...', 
          content_type: 'document',
          tags: ['Research', 'Emergent Behavior', 'Academic'],
          created_at: '2025-04-17T09:15:00Z'
        },
        { 
          id: 4, 
          title: 'Web Article: Future of AI Collaboration', 
          content: 'The future of AI collaboration involves more sophisticated communication protocols and shared knowledge bases...', 
          content_type: 'webpage',
          source_url: 'https://example.com/future-ai-collaboration',
          tags: ['Future', 'Web', 'Trends'],
          created_at: '2025-04-18T16:20:00Z'
        }
      ];
      setKnowledgeItems(mockData);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      if (selectedRepository) {
        fetchKnowledgeItems(selectedRepository.id);
      }
      return;
    }

    setIsLoading(true);
    try {
      // In a real implementation, this would be an API call
      const response = await fetch(`/api/knowledge/search?query=${encodeURIComponent(searchQuery)}&repository_id=${selectedRepository?.id || ''}`);
      const data = await response.json();
      setKnowledgeItems(data);
    } catch (error) {
      console.error('Error searching knowledge:', error);
      // Mock search results
      const mockResults = knowledgeItems.filter(item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setKnowledgeItems(mockResults);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRepository = async () => {
    if (!newRepositoryName.trim()) return;

    setIsLoading(true);
    try {
      // In a real implementation, this would be an API call
      const response = await fetch('/api/knowledge/repositories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newRepositoryName,
          description: newRepositoryDescription,
          is_public: isPublic
        }),
      });
      const data = await response.json();
      setRepositories([...repositories, data]);
      setSelectedRepository(data);
      setIsCreatingRepository(false);
      setNewRepositoryName('');
      setNewRepositoryDescription('');
      setIsPublic(false);
    } catch (error) {
      console.error('Error creating repository:', error);
      // Mock creation for demonstration
      const newRepo = {
        id: repositories.length + 1,
        name: newRepositoryName,
        description: newRepositoryDescription,
        is_public: isPublic
      };
      setRepositories([...repositories, newRepo]);
      setSelectedRepository(newRepo);
      setIsCreatingRepository(false);
      setNewRepositoryName('');
      setNewRepositoryDescription('');
      setIsPublic(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleItemClick = (item) => {
    navigate(`/knowledge/items/${item.id}`, { state: { item } });
  };

  const getContentTypeIcon = (contentType) => {
    switch (contentType) {
      case 'document':
        return <FaBook className="content-type-icon document" />;
      case 'webpage':
        return <FaGlobe className="content-type-icon webpage" />;
      default:
        return <FaBook className="content-type-icon text" />;
    }
  };

  const renderRepositoriesList = () => (
    <div className="repositories-list">
      <div className="repositories-header">
        <h3>Knowledge Repositories</h3>
        <button 
          className="create-button"
          onClick={() => setIsCreatingRepository(true)}
        >
          <FaPlus /> New Repository
        </button>
      </div>

      {isCreatingRepository ? (
        <div className="create-repository-form">
          <input
            type="text"
            placeholder="Repository Name"
            value={newRepositoryName}
            onChange={(e) => setNewRepositoryName(e.target.value)}
          />
          <textarea
            placeholder="Description"
            value={newRepositoryDescription}
            onChange={(e) => setNewRepositoryDescription(e.target.value)}
          />
          <div className="form-checkbox">
            <input
              type="checkbox"
              id="isPublic"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
            />
            <label htmlFor="isPublic">Public Repository</label>
          </div>
          <div className="form-actions">
            <button onClick={() => setIsCreatingRepository(false)}>Cancel</button>
            <button onClick={handleCreateRepository}>Create</button>
          </div>
        </div>
      ) : (
        <ul className="repositories-items">
          {repositories.map(repo => (
            <li 
              key={repo.id} 
              className={selectedRepository?.id === repo.id ? 'active' : ''}
              onClick={() => setSelectedRepository(repo)}
            >
              <div className="repo-name">
                <FaBook className="repo-icon" />
                <span>{repo.name}</span>
              </div>
              {repo.is_public && <span className="public-badge">Public</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  const renderKnowledgeItems = () => (
    <div className="knowledge-items">
      <div className="knowledge-header">
        <h3>{selectedRepository?.name || 'Knowledge Items'}</h3>
        <div className="knowledge-actions">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search knowledge..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button onClick={handleSearch}>
              <FaSearch />
            </button>
          </div>
          <div className="action-buttons">
            <button 
              className="upload-button"
              onClick={() => setShowUploader(true)}
              title="Upload Document"
            >
              <FaUpload />
            </button>
            <button 
              className="web-button"
              onClick={() => setShowWebResearch(true)}
              title="Web Research"
            >
              <FaGlobe />
            </button>
            <button 
              className="graph-button"
              onClick={() => setShowGraph(true)}
              title="Knowledge Graph"
            >
              <FaProjectDiagram />
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="loading-spinner">Loading...</div>
      ) : (
        <div className="items-list">
          {knowledgeItems.length === 0 ? (
            <div className="empty-state">
              <p>No knowledge items found. Start by uploading a document or adding content.</p>
              <div className="empty-actions">
                <button onClick={() => setShowUploader(true)}>
                  <FaUpload /> Upload Document
                </button>
                <button onClick={() => setShowWebResearch(true)}>
                  <FaGlobe /> Web Research
                </button>
                <button onClick={() => navigate(`/knowledge/items/new?repository=${selectedRepository?.id}`)}>
                  <FaPlus /> Create Item
                </button>
              </div>
            </div>
          ) : (
            knowledgeItems.map(item => (
              <div key={item.id} className="knowledge-item" onClick={() => handleItemClick(item)}>
                <div className="item-header">
                  <div className="item-title">
                    {getContentTypeIcon(item.content_type)}
                    <h4>{item.title}</h4>
                  </div>
                  <div className="item-actions">
                    <button className="action-button">
                      <FaEllipsisV />
                    </button>
                  </div>
                </div>
                <div className="item-content">
                  <p>{item.content.substring(0, 150)}...</p>
                </div>
                <div className="item-footer">
                  <div className="item-tags">
                    {item.tags.map((tag, index) => (
                      <span key={index} className="tag">{tag}</span>
                    ))}
                  </div>
                  <div className="item-date">
                    {new Date(item.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="knowledge-base-container">
      <div className="knowledge-sidebar">
        <div className="sidebar-tabs">
          <button 
            className={activeTab === 'repositories' ? 'active' : ''}
            onClick={() => setActiveTab('repositories')}
          >
            Repositories
          </button>
          <button 
            className={activeTab === 'recent' ? 'active' : ''}
            onClick={() => setActiveTab('recent')}
          >
            Recent
          </button>
          <button 
            className={activeTab === 'favorites' ? 'active' : ''}
            onClick={() => setActiveTab('favorites')}
          >
            Favorites
          </button>
        </div>
        
        {activeTab === 'repositories' && renderRepositoriesList()}
        {/* Other tabs would be implemented here */}
      </div>
      
      <div className="knowledge-content">
        {renderKnowledgeItems()}
      </div>
      
      {showUploader && (
        <DocumentUploader 
          repositoryId={selectedRepository?.id}
          onClose={() => setShowUploader(false)}
          onUploadComplete={() => {
            setShowUploader(false);
            fetchKnowledgeItems(selectedRepository.id);
          }}
        />
      )}
      
      {showWebResearch && (
        <WebResearch 
          repositoryId={selectedRepository?.id}
          onClose={() => setShowWebResearch(false)}
          onAddToKnowledge={() => {
            setShowWebResearch(false);
            fetchKnowledgeItems(selectedRepository.id);
          }}
        />
      )}
      
      {showGraph && (
        <KnowledgeGraph 
          repositoryId={selectedRepository?.id}
          onClose={() => setShowGraph(false)}
        />
      )}
    </div>
  );
};

export default KnowledgeBase;
