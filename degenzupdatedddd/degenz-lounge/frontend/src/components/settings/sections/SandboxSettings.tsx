import React, { useState, useEffect, ChangeEvent } from "react";
import { fetchUserSettings, updateUserSettings } from "../../../services/settingsService"; // Adjust path as needed

interface SandboxSettingsData {
  manager_style: string;
  conflict_resolution_mode: string;
  session_memory_duration: string;
}

const SandboxSettings: React.FC = () => {
  const [settings, setSettings] = useState<Partial<SandboxSettingsData>>({
    manager_style: "collaborative",
    conflict_resolution_mode: "ask_user",
    session_memory_duration: "session",
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchUserSettings(); // Sandbox settings are part of user settings
        setSettings({
          manager_style: data.manager_style || "collaborative",
          conflict_resolution_mode: data.conflict_resolution_mode || "ask_user",
          session_memory_duration: data.session_memory_duration || "session",
        });
      } catch (err) {
        console.error("Failed to load sandbox settings:", err);
        setError("Failed to load sandbox settings. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);
      const settingsToUpdate = {
        manager_style: settings.manager_style,
        conflict_resolution_mode: settings.conflict_resolution_mode,
        session_memory_duration: settings.session_memory_duration,
      };
      await updateUserSettings(settingsToUpdate);
      setSuccessMessage("Sandbox settings saved successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error("Failed to save sandbox settings:", err);
      setError("Failed to save sandbox settings. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  const handleResetSettings = async () => {
    const defaultValues = {
        manager_style: "collaborative",
        conflict_resolution_mode: "ask_user",
        session_memory_duration: "session",
    };
    try {
        setLoading(true);
        setError(null);
        setSuccessMessage(null);
        await updateUserSettings(defaultValues);
        setSettings(defaultValues);
        setSuccessMessage("Sandbox settings reset successfully!");
        setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
        console.error("Failed to reset sandbox settings:", err);
        setError("Failed to reset sandbox settings. Please try again.");
    } finally {
        setLoading(false);
    }
  };

  if (loading && settings.manager_style === undefined) {
    return <p className="text-gray-400">Loading sandbox settings...</p>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-semibold text-gray-100">Sandbox Settings</h3>
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
          <label htmlFor="manager_style" className="block text-sm font-medium text-gray-300 mb-1">Manager Agent Style</label>
          <select 
            id="manager_style"
            name="manager_style"
            value={settings.manager_style}
            onChange={handleChange}
            className="w-full p-2 bg-gray-600 border border-gray-500 rounded-md focus:ring-purple-500 focus:border-purple-500 text-white"
          >
            <option value="strict">Strict</option>
            <option value="collaborative">Collaborative</option>
          </select>
          <p className="text-xs text-gray-400 mt-1">Choose how the Manager Agent orchestrates tasks.</p>
        </div>

        <div className="p-4 bg-gray-700 rounded-lg">
          <label htmlFor="conflict_resolution_mode" className="block text-sm font-medium text-gray-300 mb-1">Conflict Resolution Mode</label>
          <select 
            id="conflict_resolution_mode"
            name="conflict_resolution_mode"
            value={settings.conflict_resolution_mode}
            onChange={handleChange}
            className="w-full p-2 bg-gray-600 border border-gray-500 rounded-md focus:ring-purple-500 focus:border-purple-500 text-white"
          >
            <option value="automatic">Automatic</option>
            <option value="ask_user">Ask User</option>
          </select>
          <p className="text-xs text-gray-400 mt-1">Determine how conflicts between agents are resolved.</p>
        </div>

        <div className="p-4 bg-gray-700 rounded-lg">
          <label htmlFor="session_memory_duration" className="block text-sm font-medium text-gray-300 mb-1">Session Memory Duration</label>
          <select 
            id="session_memory_duration"
            name="session_memory_duration"
            value={settings.session_memory_duration}
            onChange={handleChange}
            className="w-full p-2 bg-gray-600 border border-gray-500 rounded-md focus:ring-purple-500 focus:border-purple-500 text-white"
          >
            <option value="session">Current Session Only</option>
            <option value="7d">7 days</option>
            <option value="30d">30 days</option>
            <option value="unlimited">Unlimited</option>
          </select>
          <p className="text-xs text-gray-400 mt-1">Set how long shared memory and context are retained.</p>
        </div>

        <div className="mt-8">
          <button 
            onClick={handleResetSettings}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {loading ? "Resetting..." : "Reset Sandbox Settings"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SandboxSettings;

