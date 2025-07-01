import React, { useState, useEffect } from 'react';
import { fetchUserSettings, updateUserSettings } from '../../../services/settingsService'; // Adjust path as needed

interface UserPreferences {
  theme: string;
  font_size: string;
  time_format: string;
  // Add other preference fields as they are defined in your UserSettingsResponse schema
}

const UserPreferencesSettings: React.FC = () => {
  const [preferences, setPreferences] = useState<Partial<UserPreferences>>({
    theme: 'system',
    font_size: 'medium',
    time_format: '12h',
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchUserSettings();
        setPreferences({
          theme: data.theme || 'system',
          font_size: data.font_size || 'medium',
          time_format: data.time_format || '12h',
        });
      } catch (err) {
        console.error("Failed to load user preferences:", err);
        setError('Failed to load preferences. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPreferences(prev => ({ ...prev, [name]: value }));
  };

  const handleSavePreferences = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);
      // Filter out any undefined properties before sending
      const validPreferences = Object.fromEntries(
        Object.entries(preferences).filter(([_, v]) => v !== undefined)
      );
      await updateUserSettings(validPreferences);
      setSuccessMessage('Preferences saved successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error("Failed to save user preferences:", err);
      setError('Failed to save preferences. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleResetPreferences = async () => {
    // This should ideally call a specific reset endpoint or send default values
    const defaultPrefs = {
        theme: 'system',
        font_size: 'medium',
        time_format: '12h',
    };
    try {
        setLoading(true);
        setError(null);
        setSuccessMessage(null);
        await updateUserSettings(defaultPrefs);
        setPreferences(defaultPrefs);
        setSuccessMessage('Preferences reset to default successfully!');
        setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
        console.error("Failed to reset preferences:", err);
        setError('Failed to reset preferences. Please try again.');
    } finally {
        setLoading(false);
    }
  };

  if (loading && !preferences.theme) { // Show loading only on initial fetch
    return <p className="text-gray-400">Loading preferences...</p>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-semibold text-gray-100">User Preferences</h3>
        <button 
            onClick={handleSavePreferences}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50"
        >
            {loading ? 'Saving...' : 'Save Preferences'}
        </button>
      </div>

      {error && <p className="text-red-400 bg-red-900/30 p-3 rounded-md mb-4 border border-red-700">{error}</p>}
      {successMessage && <p className="text-green-400 bg-green-900/30 p-3 rounded-md mb-4 border border-green-700">{successMessage}</p>}

      <div className="space-y-6">
        {/* Theme Setting */}
        <div className="p-4 bg-gray-700 rounded-lg">
          <label htmlFor="theme-select" className="block text-sm font-medium text-gray-300 mb-1">Theme</label>
          <select 
            id="theme-select"
            name="theme" // Added name attribute
            value={preferences.theme}
            onChange={handleChange}
            className="w-full p-2 bg-gray-600 border border-gray-500 rounded-md focus:ring-purple-500 focus:border-purple-500 text-white"
          >
            <option value="system">System</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
          <p className="text-xs text-gray-400 mt-1">Choose your preferred application theme. 'System' will match your operating system's theme.</p>
        </div>

        {/* Font Size Setting */}
        <div className="p-4 bg-gray-700 rounded-lg">
          <label htmlFor="font-size-select" className="block text-sm font-medium text-gray-300 mb-1">Font Size</label>
          <select 
            id="font-size-select"
            name="font_size" // Added name attribute
            value={preferences.font_size}
            onChange={handleChange}
            className="w-full p-2 bg-gray-600 border border-gray-500 rounded-md focus:ring-purple-500 focus:border-purple-500 text-white"
          >
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
          <p className="text-xs text-gray-400 mt-1">Adjust the application's font size for better readability.</p>
        </div>

        {/* Time Format Setting */}
        <div className="p-4 bg-gray-700 rounded-lg">
          <label htmlFor="time-format-select" className="block text-sm font-medium text-gray-300 mb-1">Time Format</label>
          <select 
            id="time-format-select"
            name="time_format" // Added name attribute
            value={preferences.time_format}
            onChange={handleChange}
            className="w-full p-2 bg-gray-600 border border-gray-500 rounded-md focus:ring-purple-500 focus:border-purple-500 text-white"
          >
            <option value="12h">12-hour</option>
            <option value="24h">24-hour</option>
          </select>
          <p className="text-xs text-gray-400 mt-1">Select how time is displayed throughout the application.</p>
        </div>

        {/* Reset Button */}
        <div className="mt-8">
          <button 
            onClick={handleResetPreferences}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Resetting...' : 'Reset User Preferences to Default'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserPreferencesSettings;

