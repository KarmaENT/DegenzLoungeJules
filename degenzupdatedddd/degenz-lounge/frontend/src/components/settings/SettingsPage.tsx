import React, { useState } from 'react';
import { FaUserCog, FaRobot, FaCogs, FaBell, FaDatabase, FaPlug, FaUniversalAccess, FaUserShield } from 'react-icons/fa';
import UserPreferencesSettings from './sections/UserPreferencesSettings';
import AgentDefaultsSettings from './sections/AgentDefaultsSettings';
import AIProviderConfigSettings from './sections/AIProviderConfigSettings';
import SandboxSettings from './sections/SandboxSettings';
import NotificationsSettings from './sections/NotificationsSettings';
import DataSettings from './sections/DataSettings';
import IntegrationsSettings from './sections/IntegrationsSettings';
import AccessibilitySettings from './sections/AccessibilitySettings';
import AdminSettings from './sections/AdminSettings';

interface SettingsSection {
  id: string;
  title: string;
  icon: React.ElementType;
  component: React.ElementType;
}

const settingsSections: SettingsSection[] = [
  { id: 'user-preferences', title: 'User Preferences', icon: FaUserCog, component: UserPreferencesSettings },
  { id: 'agent-defaults', title: 'Agent Defaults', icon: FaRobot, component: AgentDefaultsSettings },
  { id: 'ai-providers', title: 'AI Providers', icon: FaCogs, component: AIProviderConfigSettings },
  { id: 'sandbox', title: 'Sandbox', icon: FaCogs, component: SandboxSettings }, // Consider a more specific icon for Sandbox
  { id: 'notifications', title: 'Notifications', icon: FaBell, component: NotificationsSettings },
  { id: 'data', title: 'Data', icon: FaDatabase, component: DataSettings },
  { id: 'integrations', title: 'Integrations', icon: FaPlug, component: IntegrationsSettings },
  { id: 'accessibility', title: 'Accessibility', icon: FaUniversalAccess, component: AccessibilitySettings },
  { id: 'admin', title: 'Admin', icon: FaUserShield, component: AdminSettings }, // Conditional rendering for admin
];

const SettingsPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>(settingsSections[0].id);

  const ActiveComponent = settingsSections.find(sec => sec.id === activeSection)?.component;

  // TODO: Add logic for conditional rendering of Admin section based on user role
  const isAdmin = true; // Placeholder
  const visibleSections = isAdmin ? settingsSections : settingsSections.filter(sec => sec.id !== 'admin');

  return (
    <div className="flex flex-col md:flex-row h-full bg-gray-900 text-white p-4 md:p-6 space-y-4 md:space-y-0 md:space-x-6">
      <nav className="w-full md:w-1/4 lg:w-1/5 bg-gray-800 p-4 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-6 text-purple-400">Settings</h2>
        <ul className="space-y-2">
          {visibleSections.map((section) => (
            <li key={section.id}>
              <button
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center space-x-3 p-3 rounded-md text-left transition-colors duration-150 
                            ${activeSection === section.id 
                              ? 'bg-purple-600 text-white shadow-md'
                              : 'hover:bg-gray-700 text-gray-300'}`}
              >
                <section.icon className={`w-5 h-5 ${activeSection === section.id ? 'text-white' : 'text-purple-400'}`} />
                <span>{section.title}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <main className="flex-1 bg-gray-800 p-6 rounded-lg shadow-lg overflow-y-auto">
        {ActiveComponent ? <ActiveComponent /> : <p>Select a section</p>}
      </main>
    </div>
  );
};

export default SettingsPage;

