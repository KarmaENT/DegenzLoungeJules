import React, { useState, useEffect } from 'react';
import { FaSave, FaPlay, FaTag, FaEye, FaEyeSlash, FaQuestionCircle, FaPlus, FaMinus } from 'react-icons/fa';
import './PromptTemplateEditor.css';

const PromptTemplateEditor = ({ 
  template = null, 
  onSave, 
  onTest,
  availableTags = []
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [templateText, setTemplateText] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [variables, setVariables] = useState([]);
  const [defaultValues, setDefaultValues] = useState({});
  const [selectedTags, setSelectedTags] = useState([]);
  const [showVariablePanel, setShowVariablePanel] = useState(false);
  const [extractedVariables, setExtractedVariables] = useState([]);
  const [isDirty, setIsDirty] = useState(false);

  // Initialize form with template data if provided
  useEffect(() => {
    if (template) {
      setTitle(template.title || '');
      setDescription(template.description || '');
      setTemplateText(template.template_text || '');
      setIsPublic(template.is_public || false);
      setVariables(template.variables || []);
      setDefaultValues(template.default_values || {});
      setSelectedTags((template.tags || []).map(tag => tag.id));
    }
  }, [template]);

  // Extract variables from template text
  useEffect(() => {
    const extractVariables = () => {
      const regex = /\{\{([^}]+)\}\}|\{([^}]+)\}/g;
      const matches = [...templateText.matchAll(regex)];
      
      const vars = [];
      const seen = new Set();
      
      matches.forEach(match => {
        const varName = match[1] || match[2];
        if (!seen.has(varName)) {
          seen.add(varName);
          vars.push({
            name: varName,
            description: `Value for ${varName}`,
            type: 'string'
          });
        }
      });
      
      setExtractedVariables(vars);
    };
    
    extractVariables();
  }, [templateText]);

  // Mark form as dirty when changes are made
  useEffect(() => {
    if (template) {
      const isDifferent = 
        title !== (template.title || '') ||
        description !== (template.description || '') ||
        templateText !== (template.template_text || '') ||
        isPublic !== (template.is_public || false) ||
        JSON.stringify(variables) !== JSON.stringify(template.variables || []) ||
        JSON.stringify(defaultValues) !== JSON.stringify(template.default_values || {}) ||
        JSON.stringify(selectedTags.sort()) !== JSON.stringify((template.tags || []).map(tag => tag.id).sort());
      
      setIsDirty(isDifferent);
    } else {
      // New template - dirty if any required field is filled
      setIsDirty(!!title && !!templateText);
    }
  }, [title, description, templateText, isPublic, variables, defaultValues, selectedTags, template]);

  const handleSave = () => {
    if (!title.trim()) {
      alert('Please enter a title for the template');
      return;
    }
    
    if (!templateText.trim()) {
      alert('Please enter template text');
      return;
    }
    
    // Use extracted variables if none are defined
    const finalVariables = variables.length > 0 ? variables : extractedVariables;
    
    onSave({
      id: template?.id,
      title,
      description,
      template_text: templateText,
      is_public: isPublic,
      variables: finalVariables,
      default_values: defaultValues,
      tag_ids: selectedTags
    });
    
    setIsDirty(false);
  };

  const handleTest = () => {
    // Use extracted variables if none are defined
    const finalVariables = variables.length > 0 ? variables : extractedVariables;
    
    onTest({
      id: template?.id,
      title,
      description,
      template_text: templateText,
      is_public: isPublic,
      variables: finalVariables,
      default_values: defaultValues,
      tag_ids: selectedTags
    });
  };

  const handleAddVariable = () => {
    setVariables([
      ...variables,
      {
        name: '',
        description: '',
        type: 'string'
      }
    ]);
  };

  const handleRemoveVariable = (index) => {
    const newVariables = [...variables];
    newVariables.splice(index, 1);
    setVariables(newVariables);
    
    // Also remove from default values if present
    const varName = variables[index].name;
    if (varName && defaultValues[varName]) {
      const newDefaults = {...defaultValues};
      delete newDefaults[varName];
      setDefaultValues(newDefaults);
    }
  };

  const handleVariableChange = (index, field, value) => {
    const newVariables = [...variables];
    
    // If changing the name, update default values
    if (field === 'name' && newVariables[index].name && defaultValues[newVariables[index].name]) {
      const newDefaults = {...defaultValues};
      const oldValue = defaultValues[newVariables[index].name];
      delete newDefaults[newVariables[index].name];
      if (value) {
        newDefaults[value] = oldValue;
      }
      setDefaultValues(newDefaults);
    }
    
    newVariables[index][field] = value;
    setVariables(newVariables);
  };

  const handleDefaultValueChange = (varName, value) => {
    setDefaultValues({
      ...defaultValues,
      [varName]: value
    });
  };

  const handleTagToggle = (tagId) => {
    if (selectedTags.includes(tagId)) {
      setSelectedTags(selectedTags.filter(id => id !== tagId));
    } else {
      setSelectedTags([...selectedTags, tagId]);
    }
  };

  const handleUseExtractedVariables = () => {
    setVariables(extractedVariables);
    
    // Initialize default values for extracted variables
    const newDefaults = {...defaultValues};
    extractedVariables.forEach(variable => {
      if (!newDefaults[variable.name]) {
        newDefaults[variable.name] = '';
      }
    });
    setDefaultValues(newDefaults);
  };

  return (
    <div className="prompt-template-editor">
      <div className="editor-header">
        <h2>{template ? 'Edit Prompt Template' : 'Create New Prompt Template'}</h2>
        <div className="editor-actions">
          <button 
            className="test-button"
            onClick={handleTest}
            disabled={!templateText.trim()}
            title="Test this prompt template"
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
            placeholder="Describe what this prompt template does"
            rows={2}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="template-text">Template Text *</label>
          <div className="template-help">
            <FaQuestionCircle />
            <div className="template-help-tooltip">
              <p>Use {{variable_name}} syntax for variables that will be replaced when the prompt is used.</p>
              <p>Example: "Write a {{tone}} email about {{topic}}."</p>
            </div>
          </div>
          <textarea
            id="template-text"
            value={templateText}
            onChange={(e) => setTemplateText(e.target.value)}
            placeholder="Enter your prompt template with {{variables}}"
            rows={10}
            required
          />
        </div>
        
        <div className="form-row">
          <div className="form-group visibility-toggle">
            <label>
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
              />
              <span className="toggle-label">
                {isPublic ? <><FaEye /> Public</> : <><FaEyeSlash /> Private</>}
              </span>
            </label>
            <div className="visibility-help">
              {isPublic ? 
                "Public templates can be seen and used by all users" : 
                "Private templates are only visible to you"
              }
            </div>
          </div>
          
          <div className="form-group tags-selector">
            <label>Tags</label>
            <div className="tags-container">
              {availableTags.map(tag => (
                <div 
                  key={tag.id} 
                  className={`tag ${selectedTags.includes(tag.id) ? 'selected' : ''}`}
                  style={{backgroundColor: selectedTags.includes(tag.id) ? tag.color : 'transparent'}}
                  onClick={() => handleTagToggle(tag.id)}
                >
                  <FaTag /> {tag.name}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="variables-section">
          <div className="variables-header" onClick={() => setShowVariablePanel(!showVariablePanel)}>
            <h3>
              Variables {extractedVariables.length > 0 && `(${extractedVariables.length} detected)`}
            </h3>
            <button className="toggle-variables-button">
              {showVariablePanel ? 'Hide' : 'Show'}
            </button>
          </div>
          
          {showVariablePanel && (
            <div className="variables-panel">
              {extractedVariables.length > 0 && variables.length === 0 && (
                <div className="extracted-variables-notice">
                  <p>{extractedVariables.length} variables detected in your template.</p>
                  <button onClick={handleUseExtractedVariables}>
                    Use Detected Variables
                  </button>
                </div>
              )}
              
              {variables.length > 0 ? (
                <>
                  <div className="variables-list">
                    <div className="variable-header">
                      <div className="variable-name-header">Variable Name</div>
                      <div className="variable-description-header">Description</div>
                      <div className="variable-default-header">Default Value</div>
                      <div className="variable-actions-header"></div>
                    </div>
                    
                    {variables.map((variable, index) => (
                      <div key={index} className="variable-row">
                        <input
                          type="text"
                          value={variable.name}
                          onChange={(e) => handleVariableChange(index, 'name', e.target.value)}
                          placeholder="Name"
                          className="variable-name"
                        />
                        <input
                          type="text"
                          value={variable.description}
                          onChange={(e) => handleVariableChange(index, 'description', e.target.value)}
                          placeholder="Description"
                          className="variable-description"
                        />
                        <input
                          type="text"
                          value={defaultValues[variable.name] || ''}
                          onChange={(e) => handleDefaultValueChange(variable.name, e.target.value)}
                          placeholder="Default value"
                          className="variable-default"
                        />
                        <button 
                          className="remove-variable-button"
                          onClick={() => handleRemoveVariable(index)}
                          title="Remove variable"
                        >
                          <FaMinus />
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <button className="add-variable-button" onClick={handleAddVariable}>
                    <FaPlus /> Add Variable
                  </button>
                </>
              ) : (
                <div className="no-variables">
                  <p>No variables defined yet.</p>
                  <button className="add-variable-button" onClick={handleAddVariable}>
                    <FaPlus /> Add Variable
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PromptTemplateEditor;
