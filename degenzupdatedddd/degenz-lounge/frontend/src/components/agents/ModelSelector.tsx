import React, { useState, useEffect } from 'react';
import { FaRobot, FaCog, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import AIProviderSettings, { AIProviderSettingsProps } from '../settings/AIProviderSettings';

interface ModelSelectorProps {
  onModelChange: (provider: string, model: string) => void;
  currentProvider?: string;
  currentModel?: string;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({ 
  onModelChange, 
  currentProvider = 'gemini', 
  currentModel = 'gemini-flash-2.0' 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(currentProvider);
  const [selectedModel, setSelectedModel] = useState(currentModel);
  const [showSettings, setShowSettings] = useState(false);
  
  useEffect(() => {
    setSelectedProvider(currentProvider);
    setSelectedModel(currentModel);
  }, [currentProvider, currentModel]);

  const providers = [
    { id: 'gemini', name: 'Gemini', models: [
      { id: 'gemini-flash-2.0', name: 'Gemini Flash 2.0' },
      { id: 'gemini-pro', name: 'Gemini Pro' },
      { id: 'gemini-ultra', name: 'Gemini Ultra' },
    ]},
    { id: 'openai', name: 'OpenAI', models: [
      { id: 'gpt-4', name: 'GPT-4' },
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo' },
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
    ]},
    { id: 'openrouter', name: 'OpenRouter', models: [
      { id: 'openai/gpt-3.5-turbo', name: 'OpenAI GPT-3.5 Turbo' },
      { id: 'openai/gpt-4', name: 'OpenAI GPT-4' },
      { id: 'anthropic/claude-3-opus', name: 'Claude 3 Opus' },
      { id: 'anthropic/claude-3-sonnet', name: 'Claude 3 Sonnet' },
      { id: 'meta-llama/llama-3-70b-instruct', name: 'Llama 3 70B' },
    ]},
    { id: 'grok', name: 'Grok', models: [
      { id: 'grok-1', name: 'Grok-1' },
    ]},
    { id: 'deepseek', name: 'DeepSeek', models: [
      { id: 'deepseek-chat', name: 'DeepSeek Chat' },
      { id: 'deepseek-coder', name: 'DeepSeek Coder' },
    ]},
    { id: 'perplexity', name: 'Perplexity', models: [
      { id: 'pplx-7b-online', name: 'Perplexity 7B' },
      { id: 'pplx-70b-online', name: 'Perplexity 70B' },
    ]},
    { id: 'huggingface', name: 'Hugging Face', models: [
      { id: 'meta-llama/Llama-2-70b-chat-hf', name: 'Llama 2 70B' },
      { id: 'mistralai/Mistral-7B-Instruct-v0.2', name: 'Mistral 7B' },
      { id: 'google/gemma-7b-it', name: 'Gemma 7B' },
    ]},
    { id: 'mistral', name: 'Mistral', models: [
      { id: 'mistral-tiny', name: 'Mistral Tiny' },
      { id: 'mistral-small', name: 'Mistral Small' },
      { id: 'mistral-medium', name: 'Mistral Medium' },
      { id: 'mistral-large', name: 'Mistral Large' },
    ]},
  ];

  const handleProviderSelect = (providerId: string) => {
    setSelectedProvider(providerId);
    const provider = providers.find(p => p.id === providerId);
    if (provider && provider.models.length > 0) {
      const newModel = provider.models[0].id;
      setSelectedModel(newModel);
      onModelChange(providerId, newModel);
    }
  };

  const handleModelSelect = (modelId: string) => {
    setSelectedModel(modelId);
    onModelChange(selectedProvider, modelId);
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const toggleSettings = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setShowSettings(!showSettings);
  };

  const handleSettingsProviderChange = (provider: string, model: string) => {
    setSelectedProvider(provider);
    setSelectedModel(model);
    onModelChange(provider, model); // Propagate change to parent of ModelSelector
    // setShowSettings(false); // Optionally close settings after a change from within
  };

  const selectedProviderObj = providers.find(p => p.id === selectedProvider);
  const selectedModelObj = selectedProviderObj?.models.find(m => m.id === selectedModel);

  return (
    <div className="model-selector-container relative text-sm text-white">
      <div 
        className="model-selector flex items-center justify-between p-2 bg-gray-700 rounded-md cursor-pointer hover:bg-gray-600 transition-colors"
        onClick={toggleDropdown}
      >
        <div className="selected-model flex items-center">
          <FaRobot className="model-icon mr-2 text-purple-400" />
          <div className="model-info flex flex-col">
            <span className="provider-name text-xs text-gray-400">{selectedProviderObj?.name}</span>
            <span className="model-name font-medium">{selectedModelObj?.name || 'Select Model'}</span>
          </div>
        </div>
        <div className="model-actions flex items-center">
          <button className="settings-button p-1 hover:bg-gray-500 rounded" onClick={toggleSettings}>
            <FaCog />
          </button>
          {isOpen ? <FaChevronUp className="ml-1" /> : <FaChevronDown className="ml-1" />}
        </div>
      </div>
      
      {isOpen && (
        <div className="model-dropdown absolute z-10 mt-1 w-full bg-gray-700 rounded-md shadow-lg border border-gray-600">
          <div className="providers-list flex p-1 bg-gray-800">
            {providers.map(provider => (
              <div 
                key={provider.id}
                className={`provider-item px-3 py-1.5 text-xs rounded-md cursor-pointer ${selectedProvider === provider.id ? 'bg-purple-600 text-white' : 'hover:bg-gray-600'}`}
                onClick={(e) => { e.stopPropagation(); handleProviderSelect(provider.id); }}
              >
                {provider.name}
              </div>
            ))}
          </div>
          <div className="models-list p-1 max-h-60 overflow-y-auto">
            {selectedProviderObj?.models.map(model => (
              <div 
                key={model.id}
                className={`model-item px-3 py-1.5 rounded-md cursor-pointer ${selectedModel === model.id ? 'bg-blue-600 text-white' : 'hover:bg-gray-600'}`}
                onClick={(e) => { e.stopPropagation(); handleModelSelect(model.id); }}
              >
                {model.name}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="settings-modal-content bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
            <div className="settings-modal-header flex justify-between items-center p-4 border-b border-gray-700">
              <h3 className="text-lg font-semibold text-white">AI Provider Settings</h3>
              <button className="close-button text-gray-400 hover:text-white" onClick={() => toggleSettings()}>&times;</button>
            </div>
            <div className="settings-modal-body p-4 overflow-y-auto">
              <AIProviderSettings 
                initialProvider={selectedProvider}
                initialModel={selectedModel}
                onProviderChange={handleSettingsProviderChange}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelSelector;

