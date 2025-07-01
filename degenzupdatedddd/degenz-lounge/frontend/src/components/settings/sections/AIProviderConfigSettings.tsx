import React, { useState, useEffect, ChangeEvent } from "react";
import { FaKey, FaCheckCircle, FaTimesCircle, FaQuestionCircle, FaTrash, FaPlus, FaSave } from "react-icons/fa";
import {
  fetchUserAIProviderKeys,
  addUserAIProviderKey,
  updateUserAIProviderKey,
  deleteUserAIProviderKey
} from "../../../services/settingsService"; // Adjust path as needed

interface AIProviderKey {
  id?: number; // Optional for new keys not yet saved
  provider_id: string;
  name: string; // Display name for the provider
  api_key: string; // Current API key input by user
  api_key_is_set?: boolean; // From backend, indicates if a key is stored
  isValid?: boolean | null; // For local validation UI
  apiKeyLink: string;
}

// Initial structure of providers - could be fetched from a config endpoint in a real app
const providerTemplates: Omit<AIProviderKey, "api_key" | "isValid" | "id" | "api_key_is_set">[] = [
  { provider_id: "gemini", name: "Gemini (Google)", apiKeyLink: "https://ai.google.dev/pricing" },
  { provider_id: "openrouter", name: "OpenRouter", apiKeyLink: "https://openrouter.ai/keys" },
  { provider_id: "grok", name: "Grok (xAI)", apiKeyLink: "https://grok.x.ai/" }, // Placeholder link
  { provider_id: "deepseek", name: "DeepSeek", apiKeyLink: "https://platform.deepseek.com/api_keys" },
  { provider_id: "perplexity", name: "Perplexity AI", apiKeyLink: "https://www.perplexity.ai/settings/api" },
  { provider_id: "huggingface", name: "Hugging Face", apiKeyLink: "https://huggingface.co/settings/tokens" },
  { provider_id: "mistral", name: "Mistral AI", apiKeyLink: "https://console.mistral.ai/api-keys/" },
];

const Tooltip: React.FC<{ text: string }> = ({ text }) => {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative inline-block ml-2">
      <FaQuestionCircle
        className="text-gray-400 cursor-pointer"
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
      />
      {visible && (
        <div className="absolute z-10 w-48 p-2 -mt-10 -ml-24 text-xs text-white bg-gray-600 rounded-md shadow-lg">
          {text}
        </div>
      )}
    </div>
  );
};

const AIProviderConfigSettings: React.FC = () => {
  const [providerKeys, setProviderKeys] = useState<AIProviderKey[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadProviderKeys = async () => {
      try {
        setLoading(true);
        setError(null);
        const fetchedKeysData = await fetchUserAIProviderKeys();
        // Map fetched keys and merge with templates to ensure all providers are shown
        const mergedProviders = providerTemplates.map(template => {
          const existingKey = fetchedKeysData.find((k: any) => k.provider_id === template.provider_id);
          return {
            ...template,
            id: existingKey?.id,
            api_key: "", // Don't populate API key field from backend for security
            api_key_is_set: existingKey?.api_key_is_set || false,
            isValid: null, // Reset validation status on load
          };
        });
        setProviderKeys(mergedProviders);
      } catch (err) {
        console.error("Failed to load AI provider keys:", err);
        setError("Failed to load AI provider keys. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    loadProviderKeys();
  }, []);

  const handleApiKeyChange = (provider_id: string, value: string) => {
    setProviderKeys(prev =>
      prev.map(p => (p.provider_id === provider_id ? { ...p, api_key: value, isValid: null } : p))
    );
  };

  const handleSaveOrUpdateKey = async (provider_id: string) => {
    const provider = providerKeys.find(p => p.provider_id === provider_id);
    if (!provider || !provider.api_key.trim()) {
      setError(`API key for ${provider?.name} cannot be empty.`);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);
      if (provider.api_key_is_set) { // Key exists, so update it
        await updateUserAIProviderKey(provider.provider_id, provider.api_key);
      } else { // Key doesn't exist, add it
        await addUserAIProviderKey({ provider_id: provider.provider_id, api_key: provider.api_key });
      }
      setProviderKeys(prev =>
        prev.map(p => (p.provider_id === provider_id ? { ...p, api_key_is_set: true, api_key: "", isValid: true } : p))
      );
      setSuccessMessage(`${provider.name} API key saved successfully!`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error(`Failed to save API key for ${provider.name}:`, err);
      setError(`Failed to save API key for ${provider.name}. Please try again.`);
      setProviderKeys(prev =>
        prev.map(p => (p.provider_id === provider_id ? { ...p, isValid: false } : p))
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteKey = async (provider_id: string) => {
    const provider = providerKeys.find(p => p.provider_id === provider_id);
    if (!provider || !provider.api_key_is_set) {
        setError(`No API key set for ${provider?.name} to delete.`);
        return;
    }
    // Add confirmation dialog here in a real app
    if (!window.confirm(`Are you sure you want to delete the API key for ${provider.name}?`)) {
        return;
    }

    try {
        setLoading(true);
        setError(null);
        setSuccessMessage(null);
        await deleteUserAIProviderKey(provider.provider_id);
        setProviderKeys(prev =>
            prev.map(p => (p.provider_id === provider_id ? { ...p, api_key: "", api_key_is_set: false, isValid: null } : p))
        );
        setSuccessMessage(`${provider.name} API key deleted successfully!`);
        setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
        console.error(`Failed to delete API key for ${provider.name}:`, err);
        setError(`Failed to delete API key for ${provider.name}. Please try again.`);
    } finally {
        setLoading(false);
    }
  };

  const handleResetAllApiKeys = async () => {
    if (!window.confirm("Are you sure you want to delete ALL configured API keys? This action cannot be undone.")) {
        return;
    }
    try {
        setLoading(true);
        setError(null);
        setSuccessMessage(null);
        for (const provider of providerKeys) {
            if (provider.api_key_is_set) {
                await deleteUserAIProviderKey(provider.provider_id);
            }
        }
        setProviderKeys(prev => prev.map(p => ({ ...p, api_key: "", api_key_is_set: false, isValid: null })));
        setSuccessMessage("All API keys have been deleted successfully!");
        setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
        console.error("Failed to delete all API keys:", err);
        setError("Failed to delete all API keys. Please try again.");
    } finally {
        setLoading(false);
    }
  };

  if (loading && providerKeys.length === 0) {
    return <p className="text-gray-400">Loading AI provider configurations...</p>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-semibold text-gray-100">AI Provider Configuration</h3>
        <button
          onClick={handleResetAllApiKeys}
          disabled={loading || !providerKeys.some(p => p.api_key_is_set)}
          className="px-3 py-1 text-xs font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
        >
          {loading ? "Processing..." : "Delete All API Keys"}
        </button>
      </div>
      <p className="text-sm text-gray-400 mb-6">
        Manage API keys for various AI providers. Keys are stored securely on the backend.
      </p>

      {error && <p className="text-red-400 bg-red-900/30 p-3 rounded-md mb-4 border border-red-700">{error}</p>}
      {successMessage && <p className="text-green-400 bg-green-900/30 p-3 rounded-md mb-4 border border-green-700">{successMessage}</p>}

      <div className="space-y-6">
        {providerKeys.map(provider => (
          <div key={provider.provider_id} className="p-4 bg-gray-700 rounded-lg">
            <div className="flex justify-between items-center mb-2">
                <h4 className="text-lg font-medium text-purple-400">{provider.name}</h4>
                {provider.api_key_is_set && (
                    <FaCheckCircle className="text-green-400" title="API Key is set" />
                )}
            </div>
            <div className="flex items-end space-x-2">
              <div className="flex-grow">
                <label htmlFor={`${provider.provider_id}-apikey`} className="block text-sm font-medium text-gray-300 mb-1">
                  API Key
                  <Tooltip text={`Enter your API key for ${provider.name}. ${provider.api_key_is_set ? "A key is already set. Entering a new key will overwrite it." : ""}`} />
                </label>
                <input
                  id={`${provider.provider_id}-apikey`}
                  type="password"
                  value={provider.api_key}
                  onChange={e => handleApiKeyChange(provider.provider_id, e.target.value)}
                  placeholder={provider.api_key_is_set ? "Enter new key to update" : `Enter ${provider.name} API Key`}
                  className="w-full p-2 bg-gray-600 border border-gray-500 rounded-md focus:ring-purple-500 focus:border-purple-500 text-white"
                />
              </div>
              <button
                onClick={() => handleSaveOrUpdateKey(provider.provider_id)}
                disabled={loading || !provider.api_key.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
              >
                <FaSave className="mr-2" /> {provider.api_key_is_set ? "Update" : "Save"}
              </button>
              {provider.api_key_is_set && (
                <button
                  onClick={() => handleDeleteKey(provider.provider_id)}
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center"
                >
                  <FaTrash className="mr-2" /> Delete
                </button>
              )}
            </div>
            {/* Mock validation UI - actual validation is complex and provider-specific */}
            {provider.isValid !== null && (
              <div className={`mt-2 text-xs flex items-center ${provider.isValid ? "text-green-400" : "text-red-400"}`}>
                {provider.isValid ? <FaCheckCircle className="mr-1" /> : <FaTimesCircle className="mr-1" />}
                Key {provider.isValid ? "saved successfully (validation not performed client-side)" : "save failed"}
              </div>
            )}
            <p className="text-xs text-gray-400 mt-2">
              <a href={provider.apiKeyLink} target="_blank" rel="noopener noreferrer" className="hover:text-purple-400 underline">
                How to get an API key for {provider.name}
              </a>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AIProviderConfigSettings;

