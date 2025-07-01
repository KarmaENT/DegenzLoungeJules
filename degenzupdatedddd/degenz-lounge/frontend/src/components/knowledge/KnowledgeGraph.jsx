import React, { useState, useEffect, useRef } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { FaProjectDiagram, FaSearch, FaFilter, FaDownload, FaExpand, FaCompress } from 'react-icons/fa';
import './KnowledgeGraph.css';

const KnowledgeGraph = ({ repositoryId, onClose }) => {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredData, setFilteredData] = useState({ nodes: [], links: [] });
  const [selectedNode, setSelectedNode] = useState(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [nodeFilters, setNodeFilters] = useState({
    text: true,
    document: true,
    webpage: true
  });
  const graphRef = useRef();
  const containerRef = useRef();

  useEffect(() => {
    fetchGraphData();
  }, [repositoryId]);

  useEffect(() => {
    filterGraphData();
  }, [graphData, searchTerm, nodeFilters]);

  const fetchGraphData = async () => {
    setLoading(true);
    try {
      // In a real implementation, this would be an API call
      // const response = await fetch(`/api/knowledge/graph?repository_id=${repositoryId}`);
      // const data = await response.json();
      // setGraphData(data);
      
      // Mock data for demonstration
      setTimeout(() => {
        const mockNodes = [];
        const mockLinks = [];
        
        // Generate mock nodes
        for (let i = 1; i <= 30; i++) {
          const nodeTypes = ['text', 'document', 'webpage'];
          const type = nodeTypes[Math.floor(Math.random() * nodeTypes.length)];
          
          mockNodes.push({
            id: i,
            label: `Knowledge Item ${i}`,
            type: type,
            importance: Math.random() * 2 + 0.5,
            tags: ['tag1', 'tag2', 'tag3'].slice(0, Math.floor(Math.random() * 3) + 1)
          });
        }
        
        // Generate mock links
        const relationshipTypes = ['related', 'supports', 'contradicts', 'cites'];
        for (let i = 0; i < 50; i++) {
          const source = Math.floor(Math.random() * 30) + 1;
          let target = Math.floor(Math.random() * 30) + 1;
          
          // Ensure no self-links
          while (target === source) {
            target = Math.floor(Math.random() * 30) + 1;
          }
          
          mockLinks.push({
            source: source,
            target: target,
            type: relationshipTypes[Math.floor(Math.random() * relationshipTypes.length)],
            strength: Math.random() * 0.8 + 0.2
          });
        }
        
        setGraphData({
          nodes: mockNodes,
          links: mockLinks
        });
        setLoading(false);
      }, 1500);
    } catch (error) {
      console.error('Error fetching graph data:', error);
      setLoading(false);
    }
  };

  const filterGraphData = () => {
    // Filter nodes based on search term and type filters
    const filteredNodes = graphData.nodes.filter(node => {
      const matchesSearch = searchTerm === '' || 
        node.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (node.tags && node.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));
      
      const matchesTypeFilter = nodeFilters[node.type];
      
      return matchesSearch && matchesTypeFilter;
    });
    
    // Get IDs of filtered nodes
    const filteredNodeIds = new Set(filteredNodes.map(node => node.id));
    
    // Filter links to only include connections between filtered nodes
    const filteredLinks = graphData.links.filter(link => 
      filteredNodeIds.has(link.source.id || link.source) && 
      filteredNodeIds.has(link.target.id || link.target)
    );
    
    setFilteredData({
      nodes: filteredNodes,
      links: filteredLinks
    });
  };

  const handleNodeClick = (node) => {
    setSelectedNode(node);
    
    // In a real implementation, you might want to fetch additional data about the node
    // or highlight its connections
    if (graphRef.current) {
      graphRef.current.centerAt(node.x, node.y, 1000);
      graphRef.current.zoom(2, 1000);
    }
  };

  const handleToggleFullscreen = () => {
    if (!fullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      } else if (containerRef.current.mozRequestFullScreen) {
        containerRef.current.mozRequestFullScreen();
      } else if (containerRef.current.webkitRequestFullscreen) {
        containerRef.current.webkitRequestFullscreen();
      } else if (containerRef.current.msRequestFullscreen) {
        containerRef.current.msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
    
    setFullscreen(!fullscreen);
  };

  const handleExportGraph = () => {
    // Create a JSON representation of the graph
    const graphJson = JSON.stringify(graphData, null, 2);
    
    // Create a blob and download link
    const blob = new Blob([graphJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `knowledge-graph-${repositoryId || 'all'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getNodeColor = (node) => {
    switch (node.type) {
      case 'document':
        return '#4CAF50';  // Green
      case 'webpage':
        return '#2196F3';  // Blue
      default:
        return '#FF9800';  // Orange for text
    }
  };

  const getLinkColor = (link) => {
    switch (link.type) {
      case 'supports':
        return '#4CAF50';  // Green
      case 'contradicts':
        return '#F44336';  // Red
      case 'cites':
        return '#9C27B0';  // Purple
      default:
        return '#78909C';  // Gray for related
    }
  };

  return (
    <div className={`knowledge-graph-overlay ${fullscreen ? 'fullscreen' : ''}`}>
      <div className="knowledge-graph-modal" ref={containerRef}>
        <div className="modal-header">
          <h3>Knowledge Graph</h3>
          <div className="header-actions">
            <button 
              className="fullscreen-button"
              onClick={handleToggleFullscreen}
              title={fullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            >
              {fullscreen ? <FaCompress /> : <FaExpand />}
            </button>
            <button className="close-button" onClick={onClose}>×</button>
          </div>
        </div>
        
        <div className="graph-controls">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search nodes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FaSearch className="search-icon" />
          </div>
          
          <div className="filter-container">
            <div className="filter-label">
              <FaFilter /> Filters:
            </div>
            <div className="filter-options">
              <label className="filter-option">
                <input
                  type="checkbox"
                  checked={nodeFilters.text}
                  onChange={() => setNodeFilters({...nodeFilters, text: !nodeFilters.text})}
                />
                <span className="filter-color text"></span>
                Text
              </label>
              <label className="filter-option">
                <input
                  type="checkbox"
                  checked={nodeFilters.document}
                  onChange={() => setNodeFilters({...nodeFilters, document: !nodeFilters.document})}
                />
                <span className="filter-color document"></span>
                Documents
              </label>
              <label className="filter-option">
                <input
                  type="checkbox"
                  checked={nodeFilters.webpage}
                  onChange={() => setNodeFilters({...nodeFilters, webpage: !nodeFilters.webpage})}
                />
                <span className="filter-color webpage"></span>
                Web Pages
              </label>
            </div>
          </div>
          
          <button 
            className="export-button"
            onClick={handleExportGraph}
            title="Export Graph as JSON"
          >
            <FaDownload /> Export
          </button>
        </div>
        
        <div className="graph-container">
          {loading ? (
            <div className="loading-indicator">
              <div className="spinner"></div>
              <p>Loading knowledge graph...</p>
            </div>
          ) : filteredData.nodes.length === 0 ? (
            <div className="empty-graph">
              <FaProjectDiagram className="empty-icon" />
              <h4>No nodes to display</h4>
              <p>Try adjusting your search or filters to see more nodes.</p>
            </div>
          ) : (
            <ForceGraph2D
              ref={graphRef}
              graphData={filteredData}
              nodeLabel={node => `${node.label} (${node.type})`}
              nodeColor={getNodeColor}
              nodeRelSize={node => 5 + (node.importance || 1) * 2}
              linkColor={getLinkColor}
              linkWidth={link => (link.strength || 1) * 2}
              linkDirectionalParticles={3}
              linkDirectionalParticleWidth={link => (link.strength || 1) * 2}
              onNodeClick={handleNodeClick}
              cooldownTicks={100}
              onEngineStop={() => console.log('Graph layout stabilized')}
            />
          )}
        </div>
        
        {selectedNode && (
          <div className="node-details">
            <h4>{selectedNode.label}</h4>
            <div className="node-type">
              <span className={`type-indicator ${selectedNode.type}`}></span>
              {selectedNode.type.charAt(0).toUpperCase() + selectedNode.type.slice(1)}
            </div>
            {selectedNode.tags && selectedNode.tags.length > 0 && (
              <div className="node-tags">
                {selectedNode.tags.map((tag, index) => (
                  <span key={index} className="tag">{tag}</span>
                ))}
              </div>
            )}
            <button 
              className="view-details-button"
              onClick={() => {
                // In a real implementation, this would navigate to the knowledge item details
                alert(`Navigate to details for: ${selectedNode.label}`);
              }}
            >
              View Full Details
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default KnowledgeGraph;
