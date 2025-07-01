import React, { useState, useEffect, ChangeEvent } from "react";
import { fetchUserSettings, updateUserSettings } from "../../../services/settingsService"; // Adjust path as needed

interface DataSettingsData {
  data_storage_location: string;
  data_auto_delete_policy: string;
  data_rag_whitelist: string;
}

const DataSettings: React.FC = () => {
  const [settings, setSettings] = useState<Partial<DataSettingsData>>({
    data_storage_location: "local",
    data_auto_delete_policy: "30d",
    data_rag_whitelist: "",
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchUserSettings(); // Data settings are part of user settings
        setSettings({
          data_storage_location: data.data_storage_location || "local",
          data_auto_delete_policy: data.data_auto_delete_policy || "30d",
          data_rag_whitelist: data.data_rag_whitelist || "",
        });
      } catch (err) {
        console.error("Failed to load data settings:", err);
        setError("Failed to load data settings. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  const handleChange = (e: ChangeEvent<HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);
      const settingsToUpdate = {
        data_storage_location: settings.data_storage_location,
        data_auto_delete_policy: settings.data_auto_delete_policy,
        data_rag_whitelist: settings.data_rag_whitelist,
      };
      await updateUserSettings(settingsToUpdate);
      setSuccessMessage("Data settings saved successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error("Failed to save data settings:", err);
      setError("Failed to save data settings. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  const handleResetSettings = async () => {
    const defaultValues: DataSettingsData = {
        data_storage_location: "local",
        data_auto_delete_policy: "30d",
        data_rag_whitelist: "",
    };
    try {
        setLoading(true);
        setError(null);
        setSuccessMessage(null);
        await updateUserSettings(defaultValues);
        setSettings(defaultValues);
        setSuccessMessage("Data settings reset successfully!");
        setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
        console.error("Failed to reset data settings:", err);
        setError("Failed to reset data settings. Please try again.");
    } finally {
        setLoading(false);
    }
  };

  if (loading && settings.data_storage_location === undefined) {
    return <p className="text-gray-400">Loading data settings...</p>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-semibold text-gray-100">Data Settings</h3>
        <button 
            onClick={handleSaveSettings}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50"
        >
            {loading ? "Saving..." : "Save Settings"}
        </button>
      </div>

      {error && <p className="text-red-400 bg-red-900/30 p-3 rounded-md mb-4 border border-red-700">{error}</p>}
      {successMessage && <p className="text-green-400 bg-green-900/30 p-3 rounded-md mb-4 border border-green-700">{successMessage}</p>}

      <div className="space-y-6">
        <div className="p-4 bg-gray-700 rounded-lg">
          <label htmlFor="data_storage_location" className="block text-sm font-medium text-gray-300 mb-1">Primary Storage Location</label>
          <select 
            id="data_storage_location"
            name="data_storage_location"
            value={settings.data_storage_location}
            onChange={handleChange}
            className="w-full p-2 bg-gray-600 border border-gray-500 rounded-md focus:ring-purple-500 focus:border-purple-500 text-white"
          >
            <option value="local">Local Browser Storage</option>
            <option value="cloud" disabled>Cloud Storage (Coming Soon)</option>
          </select>
          <p className="text-xs text-gray-400 mt-1">Choose where your application data is primarily stored.</p>
        </div>

        <div className="p-4 bg-gray-700 rounded-lg">
          <label htmlFor="data_auto_delete_policy" className="block text-sm font-medium text-gray-300 mb-1">Auto-Delete Old Data</label>
          <select 
            id="data_auto_delete_policy"
            name="data_auto_delete_policy"
            value={settings.data_auto_delete_policy}
            onChange={handleChange}
            className="w-full p-2 bg-gray-600 border border-gray-500 rounded-md focus:ring-purple-500 focus:border-purple-500 text-white"
          >
            <option value="7d">After 7 days</option>
            <option value="30d">After 30 days</option>
            <option value="90d">After 90 days</option>
            <option value="never">Never</option>
          </select>
          <p className="text-xs text-gray-400 mt-1">Set a policy for automatically deleting old session data.</p>
        </div>

        <div className="p-4 bg-gray-700 rounded-lg">
          <label htmlFor="data_rag_whitelist" className="block text-sm font-medium text-gray-300 mb-1">RAG Whitelist/Source Management</label>
          <textarea 
            id="data_rag_whitelist"
            name="data_rag_whitelist"
            rows={4}
            value={settings.data_rag_whitelist}
            onChange={handleChange}
            placeholder="Enter URLs or document paths, one per line..."
            className="w-full p-2 bg-gray-600 border border-gray-500 rounded-md focus:ring-purple-500 focus:border-purple-500 text-white"
          />
          <p className="text-xs text-gray-400 mt-1">Manage whitelisted sources for Retrieval Augmented Generation.</p>
        </div>

        <div className="mt-8">
          <button 
            onClick={handleResetSettings}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {loading ? "Resetting..." : "Reset Data Settings"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataSettings;

