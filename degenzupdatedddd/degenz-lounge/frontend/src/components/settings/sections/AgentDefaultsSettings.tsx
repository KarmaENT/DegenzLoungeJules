import React, { useState, useEffect, ChangeEvent } from 'react';
import { fetchUserSettings, updateUserSettings } from '../../../services/settingsService'; // Adjust path as needed

interface AgentDefaults {
  default_ai_provider: string;
  default_model: string;
  default_temperature: number; // Stored as 0-100, displayed as 0.0-1.0
  default_max_tokens: number;
}

// Mock data - replace with dynamic fetching or configuration
const aiProvidersList = [
  { id: 'gemini', name: 'Gemini (Google)' },
  { id: 'openrouter', name: 'OpenRouter' },
  { id: 'grok', name: 'Grok (xAI)' },
  { id: 'deepseek', name: 'DeepSeek' },
  { id: 'perplexity', name: 'Perplexity AI' },
  { id: 'huggingface', name: 'Hugging Face' },
  { id: 'mistral', name: 'Mistral AI' },
];

// This should be dynamic based on the selected provider
const modelsByProvider: { [key: string]: { id: string; name: string }[] } = {
  gemini: [
    { id: 'gemini-flash-2.0', name: 'Gemini Flash 2.0' },
    { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro' },
    { id: 'gemini-1.0-pro', name: 'Gemini 1.0 Pro' },
  ],
  openrouter: [{ id: 'openrouter/auto', name: 'Auto (OpenRouter)' }], // Example
  // Add other providers' models
};

const AgentDefaultsSettings: React.FC = () => {
  const [defaults, setDefaults] = useState<Partial<AgentDefaults>>({
    default_ai_provider: 'gemini',
    default_model: 'gemini-flash-2.0',
    default_temperature: 70, // Represents 0.7
    default_max_tokens: 2048,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [availableModels, setAvailableModels] = useState(modelsByProvider['gemini'] || []);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchUserSettings(); // Agent defaults are part of user settings
        setDefaults({
          default_ai_provider: data.default_ai_provider || 'gemini',
          default_model: data.default_model || 'gemini-flash-2.0',
          default_temperature: data.default_temperature === undefined ? 70 : Number(data.default_temperature),
          default_max_tokens: data.default_max_tokens === undefined ? 2048 : Number(data.default_max_tokens),
        });
        setAvailableModels(modelsByProvider[data.default_ai_provider || 'gemini'] || []);
      } catch (err) {
        console.error("Failed to load agent defaults:", err);
        setError('Failed to load agent defaults. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  useEffect(() => {
    // Update available models when provider changes
    if (defaults.default_ai_provider) {
      setAvailableModels(modelsByProvider[defaults.default_ai_provider] || []);
      // Optionally, reset model if current model not in new provider's list
      const currentModels = modelsByProvider[defaults.default_ai_provider] || [];
      if (!currentModels.find(m => m.id === defaults.default_model) && currentModels.length > 0) {
        setDefaults(prev => ({ ...prev, default_model: currentModels[0].id }));
      }
    }
  }, [defaults.default_ai_provider]);

  const handleChange = (e: ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    let processedValue: string | number = value;
    if (name === 'default_temperature' || name === 'default_max_tokens') {
      processedValue = Number(value);
    }
    setDefaults(prev => ({ ...prev, [name]: processedValue }));
  };

  const handleSaveDefaults = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);
      const settingsToUpdate = {
        default_ai_provider: defaults.default_ai_provider,
        default_model: defaults.default_model,
        default_temperature: defaults.default_temperature,
        default_max_tokens: defaults.default_max_tokens,
      };
      await updateUserSettings(settingsToUpdate); // Update only agent default fields
      setSuccessMessage('Agent defaults saved successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error("Failed to save agent defaults:", err);
      setError('Failed to save agent defaults. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleResetDefaults = async () => {
    const defaultValues = {
        default_ai_provider: 'gemini',
        default_model: 'gemini-flash-2.0',
        default_temperature: 70,
        default_max_tokens: 2048,
    };
    try {
        setLoading(true);
        setError(null);
        setSuccessMessage(null);
        await updateUserSettings(defaultValues); 
        setDefaults(defaultValues);
        setAvailableModels(modelsByProvider['gemini'] || []);
        setSuccessMessage('Agent defaults reset successfully!');
        setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
        console.error("Failed to reset agent defaults:", err);
        setError('Failed to reset agent defaults. Please try again.');
    } finally {
        setLoading(false);
    }
  };

  if (loading && defaults.default_ai_provider === undefined) {
    return <p className="text-gray-400">Loading agent defaults...</p>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-semibold text-gray-100">Agent Defaults</h3>
        <button 
            onClick={handleSaveDefaults}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50"
        >
            {loading ? 'Saving...' : 'Save Defaults'}
        </button>
      </div>

      {error && <p className="text-red-400 bg-red-900/30 p-3 rounded-md mb-4 border border-red-700">{error}</p>}
      {successMessage && <p className="text-green-400 bg-green-900/30 p-3 rounded-md mb-4 border border-green-700">{successMessage}</p>}

      <div className="space-y-6">
        <div className="p-4 bg-gray-700 rounded-lg">
          <label htmlFor="default_ai_provider" className="block text-sm font-medium text-gray-300 mb-1">Default AI Model Provider</label>
          <select 
            id="default_ai_provider"
            name="default_ai_provider"
            value={defaults.default_ai_provider}
            onChange={handleChange}
            className="w-full p-2 bg-gray-600 border border-gray-500 rounded-md focus:ring-purple-500 focus:border-purple-500 text-white"
          >
            {aiProvidersList.map(provider => (
              <option key={provider.id} value={provider.id}>{provider.name}</option>
            ))}
          </select>
          <p className="text-xs text-gray-400 mt-1">Select the default AI provider for new agents.</p>
        </div>

        <div className="p-4 bg-gray-700 rounded-lg">
          <label htmlFor="default_model" className="block text-sm font-medium text-gray-300 mb-1">Default Model</label>
          <select 
            id="default_model"
            name="default_model"
            value={defaults.default_model}
            onChange={handleChange}
            disabled={availableModels.length === 0}
            className="w-full p-2 bg-gray-600 border border-gray-500 rounded-md focus:ring-purple-500 focus:border-purple-500 text-white disabled:opacity-50"
          >
            {availableModels.length > 0 ? (
                availableModels.map(model => (
                    <option key={model.id} value={model.id}>{model.name}</option>
                ))
            ) : (
                <option value="">No models available for selected provider</option>
            )}
          </select>
          <p className="text-xs text-gray-400 mt-1">Select the default specific model for the chosen AI provider.</p>
        </div>

        <div className="p-4 bg-gray-700 rounded-lg">
          <label htmlFor="default_temperature" className="block text-sm font-medium text-gray-300 mb-1">
            Default Temperature: <span className="font-normal text-purple-400">{(Number(defaults.default_temperature || 0) / 100).toFixed(2)}</span>
          </label>
          <input 
            id="default_temperature"
            name="default_temperature"
            type="range"
            min="0"
            max="100"
            step="1" // Represents 0.01 increments
            value={defaults.default_temperature}
            onChange={handleChange}
            className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-purple-500"
          />
          <p className="text-xs text-gray-400 mt-1">Set default creativity (0.0 = deterministic, 1.0 = very creative).</p>
        </div>

        <div className="p-4 bg-gray-700 rounded-lg">
          <label htmlFor="default_max_tokens" className="block text-sm font-medium text-gray-300 mb-1">
            Default Max Tokens: <span className="font-normal text-purple-400">{defaults.default_max_tokens}</span>
          </label>
          <input 
            id="default_max_tokens"
            name="default_max_tokens"
            type="range"
            min="256"
            max="8192"
            step="256"
            value={defaults.default_max_tokens}
            onChange={handleChange}
            className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-purple-500"
          />
          <p className="text-xs text-gray-400 mt-1">Set default maximum length of agent responses.</p>
        </div>

        <div className="mt-8">
          <button 
            onClick={handleResetDefaults}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Resetting...' : 'Reset Agent Defaults'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AgentDefaultsSettings;

