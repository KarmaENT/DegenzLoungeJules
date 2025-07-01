import React, { useState, useEffect, ChangeEvent } from "react";
import { fetchUserSettings, updateUserSettings } from "../../../services/settingsService"; // Adjust path as needed

interface NotificationSettingsData {
  notifications_task_alerts_push: boolean;
  notifications_task_alerts_email: boolean;
  notifications_task_alerts_in_app: boolean;
  notifications_dnd_enabled: boolean;
  notifications_dnd_start_time: string; // HH:MM format
  notifications_dnd_end_time: string;   // HH:MM format
}

const ToggleSwitch: React.FC<{
  label: string;
  name: keyof NotificationSettingsData; // Use name for direct state update
  enabled: boolean;
  onToggle: (name: keyof NotificationSettingsData, value: boolean) => void;
  tooltip?: string;
}> = ({ label, name, enabled, onToggle, tooltip }) => {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm text-gray-300">
        {label}
        {tooltip && <span className="ml-1 text-xs text-gray-500">({tooltip})</span>}
      </span>
      <button
        onClick={() => onToggle(name, !enabled)}
        className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-200 ease-in-out 
                    ${enabled ? "bg-purple-600" : "bg-gray-600"}`}
      >
        <span className="sr-only">{label}</span>
        <span
          className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 ease-in-out 
                      ${enabled ? "translate-x-6" : "translate-x-1"}`}
        />
      </button>
    </div>
  );
};

const NotificationsSettings: React.FC = () => {
  const [settings, setSettings] = useState<Partial<NotificationSettingsData>>({
    notifications_task_alerts_push: true,
    notifications_task_alerts_email: false,
    notifications_task_alerts_in_app: true,
    notifications_dnd_enabled: false,
    notifications_dnd_start_time: "22:00",
    notifications_dnd_end_time: "07:00",
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchUserSettings(); // Notification settings are part of user settings
        setSettings({
          notifications_task_alerts_push: data.notifications_task_alerts_push === undefined ? true : data.notifications_task_alerts_push,
          notifications_task_alerts_email: data.notifications_task_alerts_email === undefined ? false : data.notifications_task_alerts_email,
          notifications_task_alerts_in_app: data.notifications_task_alerts_in_app === undefined ? true : data.notifications_task_alerts_in_app,
          notifications_dnd_enabled: data.notifications_dnd_enabled === undefined ? false : data.notifications_dnd_enabled,
          notifications_dnd_start_time: data.notifications_dnd_start_time || "22:00",
          notifications_dnd_end_time: data.notifications_dnd_end_time || "07:00",
        });
      } catch (err) {
        console.error("Failed to load notification settings:", err);
        setError("Failed to load notification settings. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  const handleToggleChange = (name: keyof NotificationSettingsData, value: boolean) => {
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleTimeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);
      // Ensure all fields are present even if unchanged, or backend handles partial updates
      const settingsToUpdate = {
        notifications_task_alerts_push: settings.notifications_task_alerts_push,
        notifications_task_alerts_email: settings.notifications_task_alerts_email,
        notifications_task_alerts_in_app: settings.notifications_task_alerts_in_app,
        notifications_dnd_enabled: settings.notifications_dnd_enabled,
        notifications_dnd_start_time: settings.notifications_dnd_start_time,
        notifications_dnd_end_time: settings.notifications_dnd_end_time,
      };
      await updateUserSettings(settingsToUpdate);
      setSuccessMessage("Notification settings saved successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error("Failed to save notification settings:", err);
      setError("Failed to save notification settings. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  const handleResetSettings = async () => {
    const defaultValues: NotificationSettingsData = {
        notifications_task_alerts_push: true,
        notifications_task_alerts_email: false,
        notifications_task_alerts_in_app: true,
        notifications_dnd_enabled: false,
        notifications_dnd_start_time: "22:00",
        notifications_dnd_end_time: "07:00",
    };
    try {
        setLoading(true);
        setError(null);
        setSuccessMessage(null);
        await updateUserSettings(defaultValues);
        setSettings(defaultValues);
        setSuccessMessage("Notification settings reset successfully!");
        setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
        console.error("Failed to reset notification settings:", err);
        setError("Failed to reset notification settings. Please try again.");
    } finally {
        setLoading(false);
    }
  };

  if (loading && settings.notifications_dnd_start_time === undefined) {
    return <p className="text-gray-400">Loading notification settings...</p>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-semibold text-gray-100">Notifications</h3>
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
          <label className="block text-sm font-medium text-gray-300 mb-2">Task Completion Alerts</label>
          <div className="space-y-2">
            <ToggleSwitch 
              label="Push Notifications" 
              name="notifications_task_alerts_push"
              enabled={settings.notifications_task_alerts_push || false} 
              onToggle={handleToggleChange} 
              tooltip="Receive push notifications on your device."
            />
            <ToggleSwitch 
              label="Email Notifications" 
              name="notifications_task_alerts_email"
              enabled={settings.notifications_task_alerts_email || false} 
              onToggle={handleToggleChange} 
              tooltip="Receive email notifications."
            />
            <ToggleSwitch 
              label="In-App Notifications" 
              name="notifications_task_alerts_in_app"
              enabled={settings.notifications_task_alerts_in_app || false} 
              onToggle={handleToggleChange} 
              tooltip="Receive notifications within the application."
            />
          </div>
          <p className="text-xs text-gray-400 mt-3">Select how you want to be notified for tasks.</p>
        </div>

        <div className="p-4 bg-gray-700 rounded-lg">
          <ToggleSwitch 
            label="Do Not Disturb (DND)" 
            name="notifications_dnd_enabled"
            enabled={settings.notifications_dnd_enabled || false} 
            onToggle={handleToggleChange} 
            tooltip="Silence notifications during a specific schedule."
          />
          {settings.notifications_dnd_enabled && (
            <div className="mt-3 space-y-3 pt-3 pl-4 border-l-2 border-gray-600">
              <div>
                <label htmlFor="notifications_dnd_start_time" className="block text-xs font-medium text-gray-400 mb-1">Start Time</label>
                <input 
                  type="time"
                  id="notifications_dnd_start_time"
                  name="notifications_dnd_start_time"
                  value={settings.notifications_dnd_start_time}
                  onChange={handleTimeChange}
                  className="w-full p-2 bg-gray-600 border border-gray-500 rounded-md focus:ring-purple-500 focus:border-purple-500 text-white text-sm"
                />
              </div>
              <div>
                <label htmlFor="notifications_dnd_end_time" className="block text-xs font-medium text-gray-400 mb-1">End Time</label>
                <input 
                  type="time"
                  id="notifications_dnd_end_time"
                  name="notifications_dnd_end_time"
                  value={settings.notifications_dnd_end_time}
                  onChange={handleTimeChange}
                  className="w-full p-2 bg-gray-600 border border-gray-500 rounded-md focus:ring-purple-500 focus:border-purple-500 text-white text-sm"
                />
              </div>
            </div>
          )}
        </div>

        <div className="mt-8">
          <button 
            onClick={handleResetSettings}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {loading ? "Resetting..." : "Reset Notification Settings"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationsSettings;

