import React, { useState, useEffect } from 'react';
import { FaSearch, FaFilter, FaDownload, FaStar, FaRegStar, FaShare, FaCode, FaLink } from 'react-icons/fa';
import './PromptLibrary.css';

const PromptLibrary = ({
  onDownload,
  onViewDetails,
  currentUserId
}) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [itemType, setItemType] = useState('all');
  const [sortBy, setSortBy] = useState('rating');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchLibraryItems();
  }, [itemType, sortBy, page]);

  const fetchLibraryItems = async () => {
    setLoading(true);
    try {
      // In a real implementation, this would be an API call
      // const response = await fetch(`/api/prompts/library?type=${itemType}&sort=${sortBy}&page=${page}&search=${searchQuery}`);
      // const data = await response.json();
      // setItems(page === 1 ? data.items : [...items, ...data.items]);
      // setHasMore(data.has_more);
      
      // Mock data for demonstration
      setTimeout(() => {
        const mockItems = [];
        
        // Generate mock library items
        for (let i = 1; i <= 10; i++) {
          const id = (page - 1) * 10 + i;
          const isTemplate = itemType === 'all' ? (id % 3 !== 0) : (itemType === 'template');
          
          mockItems.push({
            id,
            title: isTemplate ? `${searchQuery ? searchQuery + ' ' : ''}Prompt Template ${id}` : `${searchQuery ? searchQuery + ' ' : ''}Prompt Chain ${id}`,
            description: isTemplate 
              ? `A versatile template for generating ${searchQuery || 'high-quality'} content with customizable variables.`
              : `A multi-step workflow for complex ${searchQuery || 'content generation'} tasks with sequential processing.`,
            item_type: isTemplate ? 'template' : 'chain',
            is_public: true,
            download_count: Math.floor(Math.random() * 500) + 10,
            rating_sum: Math.floor(Math.random() * 500) + 100,
            rating_count: Math.floor(Math.random() * 100) + 20,
            created_at: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString(),
            creator: {
              id: Math.floor(Math.random() * 100) + 1,
              username: `user${Math.floor(Math.random() * 1000)}`,
              is_verified: Math.random() > 0.7
            },
            tags: ['productivity', 'writing', 'creative'].slice(0, Math.floor(Math.random() * 3) + 1)
          });
        }
        
        setItems(page === 1 ? mockItems : [...items, ...mockItems]);
        setHasMore(page < 5); // Limit to 5 pages for demo
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching library items:', error);
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchLibraryItems();
  };

  const handleLoadMore = () => {
    setPage(page + 1);
  };

  const handleTypeChange = (type) => {
    setItemType(type);
    setPage(1);
  };

  const handleSortChange = (sort) => {
    setSortBy(sort);
    setPage(1);
  };

  const calculateAverageRating = (item) => {
    return item.rating_count > 0 ? item.rating_sum / item.rating_count : 0;
  };

  const renderStars = (rating) => {
    const stars = [];
    const roundedRating = Math.round(rating * 2) / 2; // Round to nearest 0.5
    
    for (let i = 1; i <= 5; i++) {
      if (i <= roundedRating) {
        stars.push(<FaStar key={i} className="star-filled" />);
      } else if (i - 0.5 === roundedRating) {
        stars.push(<FaStar key={i} className="star-half" />);
      } else {
        stars.push(<FaRegStar key={i} className="star-empty" />);
      }
    }
    
    return <div className="star-display">{stars}</div>;
  };

  return (
    <div className="prompt-library">
      <div className="library-header">
        <h2>Community Prompt Library</h2>
        <p>Discover and share prompt templates and chains created by the community</p>
      </div>
      
      <div className="library-controls">
        <div className="search-container">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search prompts..."
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button className="search-button" onClick={handleSearch}>
            <FaSearch />
          </button>
        </div>
        
        <div className="filter-container">
          <div className="filter-group">
            <label>Type:</label>
            <div className="button-group">
              <button 
                className={itemType === 'all' ? 'active' : ''}
                onClick={() => handleTypeChange('all')}
              >
                All
              </button>
              <button 
                className={itemType === 'template' ? 'active' : ''}
                onClick={() => handleTypeChange('template')}
              >
                Templates
              </button>
              <button 
                className={itemType === 'chain' ? 'active' : ''}
                onClick={() => handleTypeChange('chain')}
              >
                Chains
              </button>
            </div>
          </div>
          
          <div className="filter-group">
            <label>Sort by:</label>
            <div className="button-group">
              <button 
                className={sortBy === 'rating' ? 'active' : ''}
                onClick={() => handleSortChange('rating')}
              >
                Top Rated
              </button>
              <button 
                className={sortBy === 'downloads' ? 'active' : ''}
                onClick={() => handleSortChange('downloads')}
              >
                Most Downloaded
              </button>
              <button 
                className={sortBy === 'newest' ? 'active' : ''}
                onClick={() => handleSortChange('newest')}
              >
                Newest
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="library-content">
        {loading && page === 1 ? (
          <div className="loading-indicator">
            <div className="spinner"></div>
            <p>Loading prompt library...</p>
          </div>
        ) : items.length > 0 ? (
          <>
            <div className="library-grid">
              {items.map(item => {
                const avgRating = calculateAverageRating(item);
                const isCreator = item.creator.id === currentUserId;
                
                return (
                  <div key={item.id} className="library-item">
                    <div className="item-header">
                      <div className="item-type-badge" title={item.item_type === 'template' ? 'Prompt Template' : 'Prompt Chain'}>
                        {item.item_type === 'template' ? <FaCode /> : <FaLink />}
                      </div>
                      <h3 className="item-title" onClick={() => onViewDetails(item)}>
                        {item.title}
                      </h3>
                    </div>
                    
                    <div className="item-description">
                      {item.description}
                    </div>
                    
                    <div className="item-meta">
                      <div className="item-rating">
                        {renderStars(avgRating)}
                        <span className="rating-count">({item.rating_count})</span>
                      </div>
                      
                      <div className="item-downloads">
                        <FaDownload /> {item.download_count}
                      </div>
                    </div>
                    
                    <div className="item-tags">
                      {item.tags.map(tag => (
                        <span key={tag} className="item-tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                    
                    <div className="item-creator">
                      By: {item.creator.username}
                      {item.creator.is_verified && <span className="verified-badge" title="Verified Creator">✓</span>}
                      {isCreator && <span className="creator-badge" title="You created this">You</span>}
                    </div>
                    
                    <div className="item-actions">
                      <button 
                        className="view-details-button"
                        onClick={() => onViewDetails(item)}
                        title="View details"
                      >
                        Details
                      </button>
                      
                      <button 
                        className="download-button"
                        onClick={() => onDownload(item)}
                        title="Download to your collection"
                      >
                        <FaDownload /> Download
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {loading && page > 1 && (
              <div className="loading-more">
                <div className="spinner-small"></div>
                <p>Loading more items...</p>
              </div>
            )}
            
            {hasMore && !loading && (
              <div className="load-more">
                <button className="load-more-button" onClick={handleLoadMore}>
                  Load More
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="empty-library">
            <FaSearch className="empty-icon" />
            <h3>No prompts found</h3>
            <p>Try adjusting your search or filters to find more prompts.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PromptLibrary;
