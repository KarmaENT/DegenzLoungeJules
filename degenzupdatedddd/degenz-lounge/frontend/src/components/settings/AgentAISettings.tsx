import React, { useState, useEffect } from 'react';
import { FaRobot, FaCog, FaInfoCircle } from 'react-icons/fa';
import AIProviderSettings, { AIProviderSettingsProps } from './AIProviderSettings'; // Assuming props are exported

// Define interfaces for better type safety
interface Agent {
  id: number;
  name: string;
  role: string;
  personality: string;
}

interface ProviderSettings {
  provider: string;
  model: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
}

const AgentAISettings: React.FC = () => {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [providerSettings, setProviderSettings] = useState<ProviderSettings>({
    provider: 'gemini',
    model: '',
    temperature: 0.7,
    maxTokens: 1024,
    systemPrompt: ''
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch agents on component mount
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        setIsLoading(true);
        
        const mockAgents: Agent[] = [
          { id: 1, name: 'Researcher', role: 'Research Assistant', personality: 'Analytical' },
          { id: 2, name: 'Copywriter', role: 'Content Creator', personality: 'Creative' },
          { id: 3, name: 'Designer', role: 'Visual Designer', personality: 'Artistic' },
          { id: 4, name: 'Manager', role: 'Project Manager', personality: 'Organized' }
        ];
        
        setAgents(mockAgents);
        
        if (mockAgents.length > 0) {
          const firstAgent = mockAgents[0];
          setSelectedAgent(firstAgent);
          
          const savedSettings = JSON.parse(localStorage.getItem(`agentAISettings_${firstAgent.id}`) || 'null');
          if (savedSettings) {
            setProviderSettings(savedSettings as ProviderSettings);
          } else {
            // Reset to default if no saved settings for the first agent
            setProviderSettings({
              provider: 'gemini',
              model: '',
              temperature: 0.7,
              maxTokens: 1024,
              systemPrompt: ''
            });
          }
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to load agents', err);
        setIsLoading(false);
      }
    };
    
    fetchAgents();
  }, []);

  // Handle agent selection
  const handleAgentSelect = (agent: Agent) => {
    setSelectedAgent(agent);
    
    const savedSettings = JSON.parse(localStorage.getItem(`agentAISettings_${agent.id}`) || 'null');
    if (savedSettings) {
      setProviderSettings(savedSettings as ProviderSettings);
    } else {
      setProviderSettings({
        provider: 'gemini',
        model: '',
        temperature: 0.7,
        maxTokens: 1024,
        systemPrompt: ''
      });
    }
  };

  // Handle settings change
  const handleSettingsChange = (field: keyof ProviderSettings, value: string | number) => {
    const newSettings = { ...providerSettings, [field]: value };
    setProviderSettings(newSettings);
    
    if (selectedAgent) {
      localStorage.setItem(`agentAISettings_${selectedAgent.id}`, JSON.stringify(newSettings));
    }
  };

  // Handle provider change from AIProviderSettings component
  const handleProviderChange = (provider: string, model: string) => {
    const newSettings: ProviderSettings = { 
      ...providerSettings, 
      provider: provider,
      model: model
    };
    setProviderSettings(newSettings);
    
    if (selectedAgent) {
      localStorage.setItem(`agentAISettings_${selectedAgent.id}`, JSON.stringify(newSettings));
    }
  };

  if (isLoading) {
    return <div className="loading-spinner">Loading agent AI settings...</div>;
  }

  return (
    <div className="agent-ai-settings p-6 bg-gray-900 text-white min-h-screen">
      <h2 className="text-2xl font-bold mb-6 text-purple-400">Agent AI Settings</h2>
      <p className="mb-8 text-gray-400">
        Configure AI settings for each agent in your workspace.
      </p>
      
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1 bg-gray-800 p-4 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold mb-4 text-purple-300">Select Agent</h3>
          <div className="space-y-2">
            {agents.map(agent => (
              <div 
                key={agent.id}
                className={`flex items-center p-3 rounded-md cursor-pointer transition-all duration-200 ease-in-out 
                            ${selectedAgent && selectedAgent.id === agent.id ? 'bg-purple-600 shadow-md' : 'bg-gray-700 hover:bg-gray-600'}`}
                onClick={() => handleAgentSelect(agent)}
              >
                <div className="mr-3 text-purple-400">
                  <FaRobot size={20} />
                </div>
                <div>
                  <div className="font-medium">{agent.name}</div>
                  <div className="text-sm text-gray-400">{agent.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {selectedAgent && (
          <div className="md:col-span-2 bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-6 text-purple-300">AI Settings for {selectedAgent.name}</h3>
            
            <div className="mb-8 p-4 bg-gray-700 rounded-md">
              <h4 className="text-md font-semibold mb-3 text-purple-400">AI Provider Configuration</h4>
              <AIProviderSettings 
                onProviderChange={handleProviderChange}
                initialProvider={providerSettings.provider}
                initialModel={providerSettings.model}
              />
            </div>
            
            <div className="mb-8 p-4 bg-gray-700 rounded-md">
              <h4 className="text-md font-semibold mb-3 text-purple-400">Generation Parameters</h4>
              
              <div className="mb-4">
                <label htmlFor="temperature" className="block text-sm font-medium text-gray-300 mb-1">
                  Temperature: {providerSettings.temperature}
                  <span className="relative group ml-1">
                    <FaInfoCircle className="inline text-gray-400 cursor-pointer" />
                    <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-2 text-xs text-white bg-gray-900 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                      Controls randomness: lower values are more deterministic, higher values more creative.
                    </span>
                  </span>
                </label>
                <input
                  id="temperature"
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.1"
                  value={providerSettings.temperature}
                  onChange={(e) => handleSettingsChange('temperature', parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>Precise</span>
                  <span>Creative</span>
                </div>
              </div>
              
              <div className="mb-4">
                <label htmlFor="maxTokens" className="block text-sm font-medium text-gray-300 mb-1">
                  Max Tokens: {providerSettings.maxTokens}
                  <span className="relative group ml-1">
                    <FaInfoCircle className="inline text-gray-400 cursor-pointer" />
                    <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-2 text-xs text-white bg-gray-900 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                      Maximum length of generated responses.
                    </span>
                  </span>
                </label>
                <select
                  id="maxTokens"
                  value={providerSettings.maxTokens}
                  onChange={(e) => handleSettingsChange('maxTokens', parseInt(e.target.value))}
                  className="w-full p-2 bg-gray-600 border border-gray-500 rounded-md focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value={512}>512 tokens (Short)</option>
                  <option value={1024}>1024 tokens (Medium)</option>
                  <option value={2048}>2048 tokens (Long)</option>
                  <option value={4096}>4096 tokens (Very Long)</option>
                </select>
              </div>
            </div>
            
            <div className="p-4 bg-gray-700 rounded-md">
              <h4 className="text-md font-semibold mb-3 text-purple-400">System Instructions</h4>
              <div className="mb-4">
                <label htmlFor="systemPrompt" className="block text-sm font-medium text-gray-300 mb-1">
                  System Prompt
                  <span className="relative group ml-1">
                    <FaInfoCircle className="inline text-gray-400 cursor-pointer" />
                    <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-2 text-xs text-white bg-gray-900 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                      Instructions that define how the agent should behave.
                    </span>
                  </span>
                </label>
                <textarea
                  id="systemPrompt"
                  value={providerSettings.systemPrompt}
                  onChange={(e) => handleSettingsChange('systemPrompt', e.target.value)}
                  placeholder={`Enter system instructions for ${selectedAgent.name}...`}
                  rows={5}
                  className="w-full p-2 bg-gray-600 border border-gray-500 rounded-md focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              
              <div className="space-y-2">
                <h5 className="text-sm font-medium text-gray-300">Templates:</h5>
                <button 
                  onClick={() => handleSettingsChange('systemPrompt', `You are ${selectedAgent.name}, a ${selectedAgent.role} with a ${selectedAgent.personality} personality. Your goal is to help the user by providing insightful analysis and information.`)}
                  className="px-3 py-1.5 text-xs font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 transition-colors"
                >
                  Basic Template
                </button>
                <button 
                  onClick={() => handleSettingsChange('systemPrompt', `You are ${selectedAgent.name}, a ${selectedAgent.role} with a ${selectedAgent.personality} personality. Always respond in a professional tone and focus on providing accurate, well-researched information. Cite sources when possible and acknowledge limitations in your knowledge.`)}
                  className="px-3 py-1.5 text-xs font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 transition-colors ml-2"
                >
                  Professional Template
                </button>
                <button 
                  onClick={() => handleSettingsChange('systemPrompt', `You are ${selectedAgent.name}, a ${selectedAgent.role} with a ${selectedAgent.personality} personality. Be creative, think outside the box, and don't be afraid to suggest unconventional ideas. Your goal is to inspire the user and help them explore new possibilities.`)}
                  className="px-3 py-1.5 text-xs font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 transition-colors ml-2"
                >
                  Creative Template
                </button>
              </div>
            </div>
            
            <div className="mt-8 text-right">
              <button className="px-6 py-2 font-semibold text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors flex items-center">
                <FaCog className="mr-2" /> Save Agent Settings
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentAISettings;

