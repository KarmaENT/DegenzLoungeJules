import React, { useState, useEffect } from 'react';
import { FaPlay, FaSave, FaPlus, FaMinus, FaArrowRight, FaArrowDown, FaArrowUp, FaTrash } from 'react-icons/fa';
import './PromptChainEditor.css';

const PromptChainEditor = ({
  chain = null,
  availableTemplates = [],
  onSave,
  onTest
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [templateIds, setTemplateIds] = useState([]);
  const [isDirty, setIsDirty] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);

  // Initialize form with chain data if provided
  useEffect(() => {
    if (chain) {
      setTitle(chain.title || '');
      setDescription(chain.description || '');
      setIsPublic(chain.is_public || false);
      setTemplateIds(chain.templates?.map(template => template.id) || []);
    }
  }, [chain]);

  // Mark form as dirty when changes are made
  useEffect(() => {
    if (chain) {
      const isDifferent = 
        title !== (chain.title || '') ||
        description !== (chain.description || '') ||
        isPublic !== (chain.is_public || false) ||
        JSON.stringify(templateIds) !== JSON.stringify(chain.templates?.map(template => template.id) || []);
      
      setIsDirty(isDifferent);
    } else {
      // New chain - dirty if any required field is filled
      setIsDirty(!!title && templateIds.length > 0);
    }
  }, [title, description, isPublic, templateIds, chain]);

  const handleSave = () => {
    if (!title.trim()) {
      alert('Please enter a title for the chain');
      return;
    }
    
    if (templateIds.length === 0) {
      alert('Please add at least one template to the chain');
      return;
    }
    
    onSave({
      id: chain?.id,
      title,
      description,
      is_public: isPublic,
      template_ids: templateIds
    });
    
    setIsDirty(false);
  };

  const handleTest = () => {
    if (templateIds.length === 0) {
      alert('Please add at least one template to the chain');
      return;
    }
    
    onTest({
      id: chain?.id,
      title,
      description,
      is_public: isPublic,
      template_ids: templateIds
    });
  };

  const handleAddTemplate = (templateId) => {
    setTemplateIds([...templateIds, templateId]);
    setShowTemplateSelector(false);
  };

  const handleRemoveTemplate = (index) => {
    const newTemplateIds = [...templateIds];
    newTemplateIds.splice(index, 1);
    setTemplateIds(newTemplateIds);
  };

  const handleMoveTemplate = (index, direction) => {
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === templateIds.length - 1)
    ) {
      return;
    }
    
    const newTemplateIds = [...templateIds];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap positions
    [newTemplateIds[index], newTemplateIds[newIndex]] = [newTemplateIds[newIndex], newTemplateIds[index]];
    
    setTemplateIds(newTemplateIds);
  };

  // Get template details by ID
  const getTemplateById = (id) => {
    return availableTemplates.find(template => template.id === id) || { title: 'Unknown Template', description: '' };
  };

  return (
    <div className="prompt-chain-editor">
      <div className="editor-header">
        <h2>{chain ? 'Edit Prompt Chain' : 'Create New Prompt Chain'}</h2>
        <div className="editor-actions">
          <button 
            className="test-button"
            onClick={handleTest}
            disabled={templateIds.length === 0}
            title="Test this prompt chain"
          >
            <FaPlay /> Test
          </button>
          <button 
            className="save-button"
            onClick={handleSave}
            disabled={!isDirty}
            title={!isDirty ? "No changes to save" : "Save changes"}
          >
            <FaSave /> Save
          </button>
        </div>
      </div>
      
      <div className="editor-form">
        <div className="form-group">
          <label htmlFor="title">Title *</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter a descriptive title"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what this prompt chain does"
            rows={2}
          />
        </div>
        
        <div className="form-group visibility-toggle">
          <label>
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
            />
            <span className="toggle-label">
              {isPublic ? 'Public' : 'Private'}
            </span>
          </label>
          <div className="visibility-help">
            {isPublic ? 
              "Public chains can be seen and used by all users" : 
              "Private chains are only visible to you"
            }
          </div>
        </div>
        
        <div className="chain-templates-section">
          <div className="section-header">
            <h3>Chain Steps</h3>
            <button 
              className="add-template-button"
              onClick={() => setShowTemplateSelector(!showTemplateSelector)}
            >
              <FaPlus /> Add Template
            </button>
          </div>
          
          {templateIds.length > 0 ? (
            <div className="chain-templates-list">
              {templateIds.map((templateId, index) => {
                const template = getTemplateById(templateId);
                return (
                  <div key={index} className="chain-template-item">
                    <div className="template-order">{index + 1}</div>
                    <div className="template-info">
                      <div className="template-title">{template.title}</div>
                      <div className="template-description">{template.description}</div>
                    </div>
                    <div className="template-actions">
                      <button 
                        className="move-up-button"
                        onClick={() => handleMoveTemplate(index, 'up')}
                        disabled={index === 0}
                        title="Move up"
                      >
                        <FaArrowUp />
                      </button>
                      <button 
                        className="move-down-button"
                        onClick={() => handleMoveTemplate(index, 'down')}
                        disabled={index === templateIds.length - 1}
                        title="Move down"
                      >
                        <FaArrowDown />
                      </button>
                      <button 
                        className="remove-template-button"
                        onClick={() => handleRemoveTemplate(index)}
                        title="Remove from chain"
                      >
                        <FaTrash />
                      </button>
                    </div>
                    {index < templateIds.length - 1 && (
                      <div className="template-connector">
                        <FaArrowDown />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-chain">
              <p>No templates added to this chain yet.</p>
              <p>Click "Add Template" to start building your chain.</p>
            </div>
          )}
          
          {showTemplateSelector && (
            <div className="template-selector">
              <div className="selector-header">
                <h4>Select a Template</h4>
                <button 
                  className="close-selector-button"
                  onClick={() => setShowTemplateSelector(false)}
                >
                  ×
                </button>
              </div>
              <div className="template-list">
                {availableTemplates.length > 0 ? (
                  availableTemplates.map(template => (
                    <div 
                      key={template.id} 
                      className="template-list-item"
                      onClick={() => handleAddTemplate(template.id)}
                    >
                      <div className="template-list-title">{template.title}</div>
                      <div className="template-list-description">{template.description}</div>
                      <button className="add-to-chain-button">
                        <FaPlus />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="no-templates">
                    <p>No templates available. Create templates first.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        {templateIds.length > 0 && (
          <div className="chain-flow">
            <h3>Chain Flow</h3>
            <div className="flow-diagram">
              {templateIds.map((templateId, index) => {
                const template = getTemplateById(templateId);
                return (
                  <React.Fragment key={index}>
                    <div className="flow-node">
                      <div className="flow-node-title">{template.title}</div>
                      <div className="flow-node-variables">
                        {template.variables?.map((variable, vIndex) => (
                          <div key={vIndex} className="flow-variable">
                            {variable.name}
                          </div>
                        ))}
                      </div>
                    </div>
                    {index < templateIds.length - 1 && (
                      <div className="flow-connector">
                        <FaArrowRight />
                        <div className="connector-label">Output → Input</div>
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
            <div className="flow-explanation">
              <p>Each template's output will be available to the next template as <code>{{previous_response}}</code></p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PromptChainEditor;
