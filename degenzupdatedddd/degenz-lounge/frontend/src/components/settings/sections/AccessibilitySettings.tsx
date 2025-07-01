import React, { useState } from 'react';

const ToggleSwitch: React.FC<{ label: string, enabled: boolean, onToggle: () => void, tooltip?: string }> = 
  ({ label, enabled, onToggle, tooltip }) => {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-gray-300">
        {label}
        {tooltip && <span className="ml-1 text-xs text-gray-500">({tooltip})</span>}
      </span>
      <button
        onClick={onToggle}
        className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-200 ease-in-out 
                    ${enabled ? 'bg-purple-600' : 'bg-gray-600'}`}
      >
        <span className="sr-only">{label}</span>
        <span
          className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 ease-in-out 
                      ${enabled ? 'translate-x-6' : 'translate-x-1'}`}
        />
      </button>
    </div>
  );
};

const AccessibilitySettings: React.FC = () => {
  const [highContrastMode, setHighContrastMode] = useState(false);
  // Placeholder for keyboard shortcuts - this would be more complex in a real app
  const keyboardShortcuts = [
    { action: 'Open Command Palette', shortcut: 'Ctrl/Cmd + K' },
    { action: 'Save Current Agent', shortcut: 'Ctrl/Cmd + S' },
    { action: 'Toggle Sidebar', shortcut: 'Ctrl/Cmd + B' },
    { action: 'Navigate Tabs', shortcut: 'Ctrl/Cmd + Tab' },
  ];

  return (
    <div>
      <h3 className="text-2xl font-semibold mb-6 text-gray-100">Accessibility</h3>
      <div className="space-y-6">
        {/* High Contrast Mode Setting */}
        <div className="p-4 bg-gray-700 rounded-lg">
          <ToggleSwitch 
            label="High Contrast Mode"
            enabled={highContrastMode}
            onToggle={() => setHighContrastMode(!highContrastMode)}
            tooltip="Enable high contrast mode for improved visibility."
          />
        </div>

        {/* Keyboard Shortcut Preferences Setting */}
        <div className="p-4 bg-gray-700 rounded-lg">
          <h4 className="text-lg font-medium text-gray-300 mb-3">Keyboard Shortcuts</h4>
          <ul className="space-y-1 text-sm text-gray-400">
            {keyboardShortcuts.map(shortcut => (
              <li key={shortcut.action} className="flex justify-between">
                <span>{shortcut.action}</span>
                <span className="font-mono bg-gray-600 px-2 py-0.5 rounded-sm text-xs">{shortcut.shortcut}</span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-gray-400 mt-3">View keyboard shortcuts for common actions. Customization coming soon.</p>
        </div>

        {/* Reset Button */}
        <div className="mt-8">
          <button className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors">
            Reset Accessibility Settings to Default
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccessibilitySettings;

