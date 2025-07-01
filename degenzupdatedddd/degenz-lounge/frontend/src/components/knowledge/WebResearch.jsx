import React, { useState, useEffect, useRef } from 'react';
import { FaSearch, FaPlus, FaGlobe, FaBookmark, FaExternalLinkAlt } from 'react-icons/fa';
import './WebResearch.css';

const WebResearch = ({ repositoryId, onClose, onAddToKnowledge }) => {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedEngine, setSelectedEngine] = useState('google');
  const [selectedResults, setSelectedResults] = useState([]);
  const [addingToKnowledge, setAddingToKnowledge] = useState(false);
  const searchInputRef = useRef(null);

  useEffect(() => {
    // Focus search input when component mounts
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    setSearchResults([]);
    
    try {
      // In a real implementation, this would be an API call
      // const response = await fetch(`/api/knowledge/web/search?query=${encodeURIComponent(query)}&search_engine=${selectedEngine}`);
      // const data = await response.json();
      // setSearchResults(data);
      
      // Mock search results for demonstration
      setTimeout(() => {
        const mockResults = [
          {
            id: 1,
            title: `${query} - Wikipedia`,
            url: `https://en.wikipedia.org/wiki/${query.replace(/\s+/g, '_')}`,
            snippet: `${query} is a concept in artificial intelligence that refers to the ability of systems to understand, learn, and apply knowledge...`,
            search_engine: selectedEngine
          },
          {
            id: 2,
            title: `Understanding ${query} - A Comprehensive Guide`,
            url: `https://example.com/guides/${query.toLowerCase().replace(/\s+/g, '-')}`,
            snippet: `This comprehensive guide explores ${query} in depth, covering fundamental concepts, practical applications, and future trends...`,
            search_engine: selectedEngine
          },
          {
            id: 3,
            title: `Latest Research on ${query} - Science Journal`,
            url: `https://science-journal.org/research/${query.toLowerCase().replace(/\s+/g, '-')}`,
            snippet: `Recent studies have shown significant advancements in ${query}, particularly in the areas of natural language processing and knowledge representation...`,
            search_engine: selectedEngine
          },
          {
            id: 4,
            title: `${query} in Practice: Case Studies`,
            url: `https://case-studies.org/${query.toLowerCase().replace(/\s+/g, '-')}`,
            snippet: `These case studies demonstrate how ${query} has been successfully implemented across various industries, including healthcare, finance, and education...`,
            search_engine: selectedEngine
          },
          {
            id: 5,
            title: `The Future of ${query} - Tech Insights`,
            url: `https://tech-insights.com/future-of-${query.toLowerCase().replace(/\s+/g, '-')}`,
            snippet: `Experts predict that ${query} will continue to evolve rapidly over the next decade, with particular emphasis on ethical considerations and human-AI collaboration...`,
            search_engine: selectedEngine
          }
        ];
        setSearchResults(mockResults);
        setIsSearching(false);
      }, 1500);
    } catch (error) {
      console.error('Error searching web:', error);
      setIsSearching(false);
    }
  };

  const toggleResultSelection = (resultId) => {
    if (selectedResults.includes(resultId)) {
      setSelectedResults(selectedResults.filter(id => id !== resultId));
    } else {
      setSelectedResults([...selectedResults, resultId]);
    }
  };

  const handleAddToKnowledge = async () => {
    if (selectedResults.length === 0) return;
    
    setAddingToKnowledge(true);
    
    try {
      // In a real implementation, this would be a series of API calls
      // for (const resultId of selectedResults) {
      //   await fetch(`/api/knowledge/web/results/${resultId}/add`, {
      //     method: 'POST',
      //     headers: {
      //       'Content-Type': 'application/json',
      //     },
      //     body: JSON.stringify({
      //       repository_id: repositoryId
      //     }),
      //   });
      // }
      
      // Simulate API calls with a delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setAddingToKnowledge(false);
      onAddToKnowledge();
    } catch (error) {
      console.error('Error adding to knowledge base:', error);
      setAddingToKnowledge(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="web-research-overlay">
      <div className="web-research-modal">
        <div className="modal-header">
          <h3>Web Research</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="search-container">
          <div className="search-input-container">
            <input
              ref={searchInputRef}
              type="text"
              className="search-input"
              placeholder="Search the web..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <button 
              className="search-button"
              onClick={handleSearch}
              disabled={isSearching || !query.trim()}
            >
              {isSearching ? 'Searching...' : 'Search'}
            </button>
          </div>
          
          <div className="search-options">
            <div className="engine-selector">
              <label>Search Engine:</label>
              <select 
                value={selectedEngine}
                onChange={(e) => setSelectedEngine(e.target.value)}
              >
                <option value="google">Google</option>
                <option value="bing">Bing</option>
                <option value="duckduckgo">DuckDuckGo</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="search-results">
          {isSearching ? (
            <div className="searching-indicator">
              <div className="spinner"></div>
              <p>Searching the web...</p>
            </div>
          ) : searchResults.length > 0 ? (
            <>
              <div className="results-header">
                <h4>Search Results</h4>
                <p>{searchResults.length} results found</p>
              </div>
              
              <div className="results-list">
                {searchResults.map(result => (
                  <div 
                    key={result.id} 
                    className={`result-item ${selectedResults.includes(result.id) ? 'selected' : ''}`}
                  >
                    <div className="result-selection">
                      <input
                        type="checkbox"
                        checked={selectedResults.includes(result.id)}
                        onChange={() => toggleResultSelection(result.id)}
                      />
                    </div>
                    
                    <div className="result-content">
                      <div className="result-title">
                        <h5>{result.title}</h5>
                        <a 
                          href={result.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <FaExternalLinkAlt className="external-link-icon" />
                        </a>
                      </div>
                      
                      <div className="result-url">{result.url}</div>
                      <div className="result-snippet">{result.snippet}</div>
                      
                      <div className="result-actions">
                        <button 
                          className="add-single-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedResults([result.id]);
                            setTimeout(() => handleAddToKnowledge(), 100);
                          }}
                        >
                          <FaPlus /> Add to Knowledge
                        </button>
                        <button 
                          className="bookmark-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            // In a real implementation, this would bookmark the result
                            alert(`Bookmarked: ${result.title}`);
                          }}
                        >
                          <FaBookmark /> Bookmark
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : query.trim() ? (
            <div className="no-results">
              <p>No results found. Try a different search query.</p>
            </div>
          ) : (
            <div className="search-instructions">
              <FaSearch className="search-icon" />
              <h4>Search the Web</h4>
              <p>Enter a search query to find information on the web. You can add search results to your knowledge base for future reference.</p>
              <ul>
                <li>Search for specific topics related to your agents</li>
                <li>Find the latest research and information</li>
                <li>Add web content directly to your knowledge repositories</li>
                <li>Cite web sources in agent conversations</li>
              </ul>
            </div>
          )}
        </div>
        
        {searchResults.length > 0 && (
          <div className="modal-footer">
            <div className="selection-info">
              {selectedResults.length} {selectedResults.length === 1 ? 'result' : 'results'} selected
            </div>
            <button 
              className="add-to-knowledge-button"
              onClick={handleAddToKnowledge}
              disabled={selectedResults.length === 0 || addingToKnowledge}
            >
              {addingToKnowledge ? 'Adding...' : 'Add Selected to Knowledge Base'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WebResearch;
