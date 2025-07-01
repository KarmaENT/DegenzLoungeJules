import React, { useState, useEffect } from 'react';
import { FaRobot, FaKey, FaExclamationTriangle, FaCheck, FaCog } from 'react-icons/fa';

// Define interfaces for better type safety
interface Provider {
  name: string;
  description: string;
  requires_api_key: boolean;
  env_var: string;
  default: boolean;
}

interface Model {
  id: string;
  name: string;
}

interface ApiKeyMap {
  [key: string]: string;
}

interface ValidationStatus {
  valid: boolean;
  timestamp: number;
}

interface ValidationStatusMap {
  [key: string]: ValidationStatus;
}

interface ProvidersMap {
  [key: string]: Provider;
}

export interface AIProviderSettingsProps {
  onProviderChange: (provider: string, model: string) => void;
  initialProvider: string;
  initialModel: string;
}

const AIProviderSettings: React.FC<AIProviderSettingsProps> = ({ onProviderChange, initialProvider, initialModel }) => {
  const [providers, setProviders] = useState<ProvidersMap>({});
  const [selectedProvider, setSelectedProvider] = useState<string>(initialProvider || 'gemini');
  const [apiKeys, setApiKeys] = useState<ApiKeyMap>({});
  const [models, setModels] = useState<Model[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>(initialModel || '');
  const [validationStatus, setValidationStatus] = useState<ValidationStatusMap>({});
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch available providers on component mount
  useEffect(() => {
    const fetchProviders = async () => {
      try {
        setIsLoading(true);
        const data: ProvidersMap = {
          "gemini": {
            "name": "Gemini Flash 2.0",
            "description": "Google's advanced AI model with strong reasoning capabilities",
            "requires_api_key": true,
            "env_var": "GEMINI_API_KEY",
            "default": true
          },
          "openrouter": {
            "name": "OpenRouter",
            "description": "Gateway to multiple AI models including Claude, GPT-4, and more",
            "requires_api_key": true,
            "env_var": "OPENROUTER_API_KEY",
            "default": false
          },
          "grok": {
            "name": "Grok",
            "description": "xAI's conversational AI with real-time knowledge",
            "requires_api_key": true,
            "env_var": "GROK_API_KEY",
            "default": false
          },
          "deepseek": {
            "name": "DeepSeek",
            "description": "Advanced AI models with strong coding and reasoning capabilities",
            "requires_api_key": true,
            "env_var": "DEEPSEEK_API_KEY",
            "default": false
          },
          "perplexity": {
            "name": "Perplexity",
            "description": "AI with online search capabilities for up-to-date information",
            "requires_api_key": true,
            "env_var": "PERPLEXITY_API_KEY",
            "default": false
          },
          "huggingface": {
            "name": "Hugging Face",
            "description": "Access to thousands of open-source AI models",
            "requires_api_key": true,
            "env_var": "HUGGINGFACE_API_KEY",
            "default": false
          },
          "mistral": {
            "name": "Mistral AI",
            "description": "Efficient and powerful AI models with strong reasoning",
            "requires_api_key": true,
            "env_var": "MISTRAL_API_KEY",
            "default": false
          }
        };
        setProviders(data);
        
        const savedKeys = JSON.parse(localStorage.getItem('aiProviderApiKeys') || '{}') as ApiKeyMap;
        setApiKeys(savedKeys);
        
        const savedValidation = JSON.parse(localStorage.getItem('aiProviderValidation') || '{}') as ValidationStatusMap;
        setValidationStatus(savedValidation);
        
        // Set initial selected provider based on props or default
        const defaultProviderKey = Object.keys(data).find(key => data[key].default) || 'gemini';
        setSelectedProvider(initialProvider || defaultProviderKey);

        setIsLoading(false);
      } catch (err) {
        setError('Failed to load AI providers');
        setIsLoading(false);
      }
    };
    fetchProviders();
  }, [initialProvider]);

  // Fetch models when provider changes
  useEffect(() => {
    const fetchModels = async () => {
      if (!selectedProvider || !providers[selectedProvider]) return;
      
      try {
        let mockModels: Model[] = [];
        switch(selectedProvider) {
          case 'gemini':
            mockModels = [
              {id: "gemini-flash-2.0", name: "Gemini Flash 2.0"},
              {id: "gemini-pro", name: "Gemini Pro"},
              {id: "gemini-ultra", name: "Gemini Ultra"}
            ];
            break;
          case 'openrouter':
            mockModels = [
              {id: "anthropic/claude-3-opus", name: "Claude 3 Opus"},
              {id: "anthropic/claude-3-sonnet", name: "Claude 3 Sonnet"},
              {id: "anthropic/claude-3-haiku", name: "Claude 3 Haiku"},
              {id: "openai/gpt-4o", name: "GPT-4o"},
              {id: "openai/gpt-4-turbo", name: "GPT-4 Turbo"},
              {id: "meta-llama/llama-3-70b-instruct", name: "Llama 3 70B"}
            ];
            break;
          case 'grok':
            mockModels = [
              {id: "grok-2", name: "Grok-2"},
              {id: "grok-1.5", name: "Grok-1.5"}
            ];
            break;
          case 'deepseek':
            mockModels = [
              {id: "deepseek-chat", name: "DeepSeek Chat"},
              {id: "deepseek-coder", name: "DeepSeek Coder"}
            ];
            break;
          case 'perplexity':
            mockModels = [
              {id: "sonar-medium-online", name: "Sonar Medium (Online)"},
              {id: "sonar-small-online", name: "Sonar Small (Online)"},
              {id: "sonar-medium-chat", name: "Sonar Medium Chat"},
              {id: "sonar-small-chat", name: "Sonar Small Chat"}
            ];
            break;
          case 'huggingface':
            mockModels = [
              {id: "mistralai/Mixtral-8x7B-Instruct-v0.1", name: "Mixtral 8x7B"},
              {id: "meta-llama/Llama-2-70b-chat-hf", name: "Llama 2 70B"},
              {id: "tiiuae/falcon-180B-chat", name: "Falcon 180B"},
              {id: "bigscience/bloom", name: "BLOOM 176B"},
              {id: "google/flan-t5-xxl", name: "Flan-T5 XXL"}
            ];
            break;
          case 'mistral':
            mockModels = [
              {id: "mistral-large-latest", name: "Mistral Large"},
              {id: "mistral-medium-latest", name: "Mistral Medium"},
              {id: "mistral-small-latest", name: "Mistral Small"},
              {id: "open-mistral-7b", name: "Open Mistral 7B"}
            ];
            break;
          default:
            mockModels = [];
        }
        setModels(mockModels);
        
        if (mockModels.length > 0) {
          const savedModelPreferences = JSON.parse(localStorage.getItem('aiProviderModelPreferences') || '{}') as {[key: string]: string};
          const savedModel = savedModelPreferences[selectedProvider];
          
          if (initialModel && mockModels.some(model => model.id === initialModel)) {
            setSelectedModel(initialModel);
          } else if (savedModel && mockModels.some(model => model.id === savedModel)) {
            setSelectedModel(savedModel);
          } else {
            setSelectedModel(mockModels[0].id);
          }
        } else {
          setSelectedModel('');
        }
        
      } catch (err) {
        setError(`Failed to load models for ${selectedProvider}`);
      }
    };
    fetchModels();
  }, [selectedProvider, apiKeys, providers, initialModel]);

  // Effect to call onProviderChange when selectedProvider or selectedModel changes
  useEffect(() => {
    if (selectedProvider && selectedModel) {
      onProviderChange(selectedProvider, selectedModel);
    }
  }, [selectedProvider, selectedModel, onProviderChange]);

  const handleApiKeyChange = (providerKey: string, value: string) => {
    const newApiKeys = { ...apiKeys, [providerKey]: value };
    setApiKeys(newApiKeys);
    localStorage.setItem('aiProviderApiKeys', JSON.stringify(newApiKeys));
    
    const newValidationStatus = { ...validationStatus };
    delete newValidationStatus[providerKey];
    setValidationStatus(newValidationStatus);
    localStorage.setItem('aiProviderValidation', JSON.stringify(newValidationStatus));
  };

  const handleModelChange = (providerKey: string, modelId: string) => {
    setSelectedModel(modelId);
    const savedModelPreferences = JSON.parse(localStorage.getItem('aiProviderModelPreferences') || '{}') as {[key: string]: string};
    const newModelPreferences = { ...savedModelPreferences, [providerKey]: modelId };
    localStorage.setItem('aiProviderModelPreferences', JSON.stringify(newModelPreferences));
  };

  const validateApiKey = async (providerKey: string) => {
    if (!apiKeys[providerKey]) return;
    setIsValidating(true);
    try {
      const isValid = apiKeys[providerKey].trim().length > 0; // Mock validation
      const newValidationStatus: ValidationStatusMap = { 
        ...validationStatus, 
        [providerKey]: { valid: isValid, timestamp: Date.now() } 
      };
      setValidationStatus(newValidationStatus);
      localStorage.setItem('aiProviderValidation', JSON.stringify(newValidationStatus));
    } catch (err) {
      setError(`Failed to validate API key for ${providerKey}`);
    } finally {
      setIsValidating(false);
    }
  };

  const setAsDefault = (providerKey: string) => {
    localStorage.setItem('defaultAiProvider', providerKey);
    const newProviders = { ...providers };
    Object.keys(newProviders).forEach(key => {
      newProviders[key].default = (key === providerKey);
    });
    setProviders(newProviders);
  };

  if (isLoading) {
    return <div className="p-4 text-center text-gray-400">Loading AI provider settings...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }

  const currentProvider = providers[selectedProvider];

  return (
    <div className="ai-provider-settings space-y-6">
      <div>
        <label htmlFor="provider-select" className="block text-sm font-medium text-gray-300 mb-1">Select AI Provider:</label>
        <select 
          id="provider-select"
          value={selectedProvider}
          onChange={(e) => setSelectedProvider(e.target.value)}
          className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-purple-500 focus:border-purple-500 text-white"
        >
          {Object.entries(providers).map(([id, provider]) => (
            <option key={id} value={id}>
              {provider.name} {provider.default ? '(Default)' : ''}
            </option>
          ))}
        </select>
      </div>
      
      {currentProvider && (
        <div className="space-y-4 p-4 bg-gray-800 rounded-lg">
          <div className="flex items-center space-x-3">
            <FaRobot size={24} className="text-purple-400" />
            <div>
              <h3 className="text-lg font-semibold text-white">{currentProvider.name}</h3>
              <p className="text-sm text-gray-400">{currentProvider.description}</p>
            </div>
          </div>
          
          {currentProvider.requires_api_key && (
            <div className="space-y-2">
              <label htmlFor={`${selectedProvider}-api-key`} className="block text-sm font-medium text-gray-300">
                <FaKey className="inline mr-1" /> API Key:
              </label>
              <div className="flex space-x-2">
                <input
                  id={`${selectedProvider}-api-key`}
                  type="password"
                  value={apiKeys[selectedProvider] || ''}
                  onChange={(e) => handleApiKeyChange(selectedProvider, e.target.value)}
                  placeholder={`Enter your ${currentProvider.name} API key`}
                  className="flex-grow p-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-purple-500 focus:border-purple-500 text-white"
                />
                <button 
                  onClick={() => validateApiKey(selectedProvider)}
                  disabled={isValidating || !apiKeys[selectedProvider]}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {isValidating ? 'Validating...' : 'Validate Key'}
                </button>
              </div>
              
              {validationStatus[selectedProvider] && (
                <div className={`mt-1 text-xs ${validationStatus[selectedProvider].valid ? 'text-green-400' : 'text-red-400'}`}>
                  {validationStatus[selectedProvider].valid ? (
                    <><FaCheck className="inline mr-1" /> API key is valid</>
                  ) : (
                    <><FaExclamationTriangle className="inline mr-1" /> API key is invalid or not validated</>
                  )}
                </div>
              )}
            </div>
          )}
          
          <div className="space-y-2">
            <label htmlFor="model-select" className="block text-sm font-medium text-gray-300">Select Model:</label>
            <select 
              id="model-select"
              value={selectedModel}
              onChange={(e) => handleModelChange(selectedProvider, e.target.value)}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-purple-500 focus:border-purple-500 text-white"
              disabled={models.length === 0}
            >
              {models.length === 0 ? (
                <option value="">No models available for this provider</option>
              ) : (
                models.map(model => (
                  <option key={model.id} value={model.id}>
                    {model.name}
                  </option>
                ))
              )}
            </select>
          </div>
          
          <div>
            <button 
              onClick={() => setAsDefault(selectedProvider)}
              disabled={currentProvider.default}
              className="w-full px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 disabled:opacity-50 transition-colors flex items-center justify-center"
            >
              <FaCog className="mr-2" /> Set as Default Provider
            </button>
          </div>
          
          <div className="text-xs text-gray-500 pt-4 border-t border-gray-700">
            <h4 className="font-semibold text-gray-400 mb-1">How to get an API key:</h4>
            <ol className="list-decimal list-inside space-y-1">
              {selectedProvider === 'gemini' && (
                <>
                  <li>Visit <a href="https://ai.google.dev/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Google AI Studio</a></li>
                  <li>Sign in, go to "API keys", and create a new key.</li>
                </>
              )}
              {selectedProvider === 'openrouter' && (
                <>
                  <li>Visit <a href="https://openrouter.ai/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">OpenRouter</a></li>
                  <li>Sign up/log in, go to API Keys, and create a new key.</li>
                </>
              )}
              {/* Add other provider instructions similarly */}
               {selectedProvider === 'grok' && (
                <>
                  <li>Visit <a href="https://grok.x.ai/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Grok AI</a> and generate an API key.</li>
                </>
              )}
              {selectedProvider === 'deepseek' && (
                <>
                  <li>Visit <a href="https://deepseek.ai/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">DeepSeek AI</a> and generate an API key from your account.</li>
                </>
              )}
              {selectedProvider === 'perplexity' && (
                <>
                  <li>Visit <a href="https://www.perplexity.ai/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Perplexity AI</a> and create an API key in your settings.</li>
                </>
              )}
              {selectedProvider === 'huggingface' && (
                <>
                  <li>Visit <a href="https://huggingface.co/settings/tokens" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Hugging Face Tokens</a> and create a new access token.</li>
                </>
              )}
              {selectedProvider === 'mistral' && (
                <>
                  <li>Visit <a href="https://console.mistral.ai/api-keys/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Mistral AI Console</a> and generate an API key.</li>
                </>
              )}
            </ol>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIProviderSettings;

