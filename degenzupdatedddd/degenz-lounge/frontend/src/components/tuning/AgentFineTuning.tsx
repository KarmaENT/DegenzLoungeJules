import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaSlidersH, FaCog, FaSave, FaUndo, FaFlask, FaInfoCircle } from 'react-icons/fa';

interface Agent {
  id: number;
  name: string;
  role: string;
  personality: string;
  system_instructions: string;
  examples: Record<string, any>; // Keeping this as Record<string, any> for flexibility
  // Add other agent properties if available from API
}

interface AgentParameters {
  temperature: number;
  top_p: number;
  max_tokens: number;
  presence_penalty: number;
  frequency_penalty: number;
  response_format: 'auto' | 'text' | 'json';
  creativity_level: 'conservative' | 'balanced' | 'creative' | 'highly_creative';
  verbosity_level: 'concise' | 'balanced' | 'detailed' | 'comprehensive';
  formality_level: 'casual' | 'balanced' | 'formal' | 'academic';
}

interface AgentVersion {
  id: number;
  agent_id: number;
  version_number: number;
  name: string;
  role: string;
  personality: string;
  system_instructions: string;
  examples: Record<string, any>;
  parameters: AgentParameters | null; // Allow null if parameters might not exist
  created_at: string;
  created_by_id: number;
  is_active: boolean;
}

interface AgentFineTuningProps {
  agentId: number;
  agentName: string;
  onVersionCreated?: (versionId: number) => void;
}

const AgentFineTuning: React.FC<AgentFineTuningProps> = ({ 
  agentId, 
  agentName,
  onVersionCreated 
}) => {
  const [agent, setAgent] = useState<Agent | null>(null);
  const [versions, setVersions] = useState<AgentVersion[]>([]);
  const [parameters, setParameters] = useState<AgentParameters>({
    temperature: 0.7,
    top_p: 1.0,
    max_tokens: 1000,
    presence_penalty: 0.0,
    frequency_penalty: 0.0,
    response_format: 'auto',
    creativity_level: 'balanced',
    verbosity_level: 'balanced',
    formality_level: 'balanced'
  });
  const [originalParameters, setOriginalParameters] = useState<AgentParameters>({
    temperature: 0.7,
    top_p: 1.0,
    max_tokens: 1000,
    presence_penalty: 0.0,
    frequency_penalty: 0.0,
    response_format: 'auto',
    creativity_level: 'balanced',
    verbosity_level: 'balanced',
    formality_level: 'balanced'
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('basic');
  const [tooltips, setTooltips] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchAgentData();
  }, [agentId]);

  const fetchAgentData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const agentResponse = await axios.get<Agent>(`/api/agents/${agentId}`);
      setAgent(agentResponse.data);
      
      const versionsResponse = await axios.get<AgentVersion[]>(`/api/agent_versions/?agent_id=${agentId}`);
      setVersions(versionsResponse.data);
      
      const activeVersion = versionsResponse.data.find((v: AgentVersion) => v.is_active);
      if (activeVersion && activeVersion.parameters) {
        setParameters(activeVersion.parameters);
        setOriginalParameters(activeVersion.parameters);
      } else {
        const defaultParams: AgentParameters = {
          temperature: 0.7,
          top_p: 1.0,
          max_tokens: 1000,
          presence_penalty: 0.0,
          frequency_penalty: 0.0,
          response_format: 'auto',
          creativity_level: 'balanced',
          verbosity_level: 'balanced',
          formality_level: 'balanced'
        };
        setParameters(defaultParams);
        setOriginalParameters(defaultParams);
      }
      
    } catch (err) {
      setError('Failed to load agent data');
      console.error('Error fetching agent data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleParameterChange = <K extends keyof AgentParameters>(param: K, value: AgentParameters[K]) => {
    setParameters(prev => ({
      ...prev,
      [param]: value
    }));
  };

  const resetParameters = () => {
    setParameters(originalParameters);
  };

  const saveParameters = async () => {
    if (!agent) {
      setError('Agent data not loaded yet.');
      return;
    }
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      
      const response = await axios.post<AgentVersion>('/api/agent_versions/', {
        agent_id: agentId,
        name: agent.name,
        role: agent.role,
        personality: agent.personality,
        system_instructions: agent.system_instructions,
        examples: agent.examples,
        parameters: parameters,
        is_active: true
      });
      
      setSuccess('Parameters saved successfully!');
      setOriginalParameters(parameters);
      
      setVersions(prev => [response.data, ...prev]);
      
      if (onVersionCreated) {
        onVersionCreated(response.data.id);
      }
      
    } catch (err) {
      setError('Failed to save parameters');
      console.error('Error saving parameters:', err);
    } finally {
      setSaving(false);
    }
  };

  const toggleTooltip = (param: string) => {
    setTooltips(prev => ({
      ...prev,
      [param]: !prev[param]
    }));
  };

  const getParameterDescription = (param: keyof AgentParameters) => {
    const descriptions: Record<keyof AgentParameters, string> = {
      temperature: 'Controls randomness. Higher values (e.g., 0.8) make output more random, lower values (e.g., 0.2) make it more focused and deterministic.',
      top_p: 'Controls diversity via nucleus sampling. 0.5 means half of all likelihood-weighted options are considered.',
      max_tokens: 'The maximum number of tokens that can be generated in the response.',
      presence_penalty: 'Positive values penalize new tokens based on whether they appear in the text so far, increasing the model\'s likelihood to talk about new topics.',
      frequency_penalty: 'Positive values penalize new tokens based on their existing frequency in the text so far, decreasing the model\'s likelihood to repeat the same line verbatim.',
      response_format: 'Specifies the format in which the model should return its response.',
      creativity_level: 'Controls the overall creativity of responses from conservative to highly creative.',
      verbosity_level: 'Controls how detailed and lengthy the responses will be.',
      formality_level: 'Controls the tone from casual to highly formal.'
    };
    
    return descriptions[param] || 'No description available';
  };

  if (loading) {
    return <div className="p-4 text-center">Loading fine-tuning interface...</div>;
  }

  if (!agent) {
    return <div className="p-4 text-center text-red-500">Failed to load agent data</div>;
  }

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold flex items-center">
          <FaSlidersH className="mr-2 text-purple-400" />
          {agentName} Fine-Tuning
        </h2>
      </div>
      
      {error && (
        <div className="bg-red-900 text-white p-3 rounded mb-4 text-sm">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-900 text-white p-3 rounded mb-4 text-sm">
          {success}
        </div>
      )}
      
      <div className="mb-4">
        <div className="flex border-b border-gray-700">
          <button 
            className={`py-2 px-4 font-medium ${activeTab === 'basic' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}`}
            onClick={() => setActiveTab('basic')}
          >
            Basic Parameters
          </button>
          <button 
            className={`py-2 px-4 font-medium ${activeTab === 'advanced' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}`}
            onClick={() => setActiveTab('advanced')}
          >
            Advanced Parameters
          </button>
          <button 
            className={`py-2 px-4 font-medium ${activeTab === 'versions' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}`}
            onClick={() => setActiveTab('versions')}
          >
            Version History
          </button>
        </div>
      </div>
      
      {activeTab === 'basic' && (
        <div className="space-y-6">
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center">
                <h3 className="text-md font-semibold">Creativity Level</h3>
                <button 
                  className="ml-2 text-gray-400 hover:text-white"
                  onClick={() => toggleTooltip('creativity_level')}
                >
                  <FaInfoCircle />
                </button>
              </div>
              <div className="text-sm font-medium">
                {parameters.creativity_level === 'conservative' ? 'Conservative' :
                 parameters.creativity_level === 'balanced' ? 'Balanced' :
                 parameters.creativity_level === 'creative' ? 'Creative' : 'Highly Creative'}
              </div>
            </div>
            
            {tooltips.creativity_level && (
              <div className="bg-gray-800 p-2 rounded text-sm mb-2">
                Controls the overall creativity of responses from conservative (factual, predictable) to highly creative (imaginative, unexpected).
              </div>
            )}
            
            <input 
              type="range" 
              min="0" 
              max="3" 
              step="1"
              value={
                parameters.creativity_level === 'conservative' ? 0 :
                parameters.creativity_level === 'balanced' ? 1 :
                parameters.creativity_level === 'creative' ? 2 : 3
              }
              onChange={(e) => {
                const value = parseInt(e.target.value);
                const level: AgentParameters['creativity_level'] = 
                             value === 0 ? 'conservative' :
                             value === 1 ? 'balanced' :
                             value === 2 ? 'creative' : 'highly_creative';
                handleParameterChange('creativity_level', level);
                
                const temp = value === 0 ? 0.3 :
                            value === 1 ? 0.7 :
                            value === 2 ? 0.9 : 1.1;
                handleParameterChange('temperature', temp);
              }}
              className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
            />
            
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>Conservative</span>
              <span>Balanced</span>
              <span>Creative</span>
              <span>Highly Creative</span>
            </div>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center">
                <h3 className="text-md font-semibold">Verbosity Level</h3>
                <button 
                  className="ml-2 text-gray-400 hover:text-white"
                  onClick={() => toggleTooltip('verbosity_level')}
                >
                  <FaInfoCircle />
                </button>
              </div>
              <div className="text-sm font-medium">
                {parameters.verbosity_level === 'concise' ? 'Concise' :
                 parameters.verbosity_level === 'balanced' ? 'Balanced' :
                 parameters.verbosity_level === 'detailed' ? 'Detailed' : 'Comprehensive'}
              </div>
            </div>
            
            {tooltips.verbosity_level && (
              <div className="bg-gray-800 p-2 rounded text-sm mb-2">
                Controls how detailed and lengthy the responses will be, from brief and to-the-point to comprehensive and thorough.
              </div>
            )}
            
            <input 
              type="range" 
              min="0" 
              max="3" 
              step="1"
              value={
                parameters.verbosity_level === 'concise' ? 0 :
                parameters.verbosity_level === 'balanced' ? 1 :
                parameters.verbosity_level === 'detailed' ? 2 : 3
              }
              onChange={(e) => {
                const value = parseInt(e.target.value);
                const level: AgentParameters['verbosity_level'] = 
                             value === 0 ? 'concise' :
                             value === 1 ? 'balanced' :
                             value === 2 ? 'detailed' : 'comprehensive';
                handleParameterChange('verbosity_level', level);
                
                const tokens = value === 0 ? 500 :
                              value === 1 ? 1000 :
                              value === 2 ? 2000 : 4000;
                handleParameterChange('max_tokens', tokens);
              }}
              className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
            />
            
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>Concise</span>
              <span>Balanced</span>
              <span>Detailed</span>
              <span>Comprehensive</span>
            </div>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center">
                <h3 className="text-md font-semibold">Formality Level</h3>
                <button 
                  className="ml-2 text-gray-400 hover:text-white"
                  onClick={() => toggleTooltip('formality_level')}
                >
                  <FaInfoCircle />
                </button>
              </div>
              <div className="text-sm font-medium">
                {parameters.formality_level === 'casual' ? 'Casual' :
                 parameters.formality_level === 'balanced' ? 'Balanced' :
                 parameters.formality_level === 'formal' ? 'Formal' : 'Academic'}
              </div>
            </div>
            
            {tooltips.formality_level && (
              <div className="bg-gray-800 p-2 rounded text-sm mb-2">
                Controls the tone from casual and conversational to highly formal and academic.
              </div>
            )}
            
            <input 
              type="range" 
              min="0" 
              max="3" 
              step="1"
              value={
                parameters.formality_level === 'casual' ? 0 :
                parameters.formality_level === 'balanced' ? 1 :
                parameters.formality_level === 'formal' ? 2 : 3
              }
              onChange={(e) => {
                const value = parseInt(e.target.value);
                const level: AgentParameters['formality_level'] = 
                             value === 0 ? 'casual' :
                             value === 1 ? 'balanced' :
                             value === 2 ? 'formal' : 'academic';
                handleParameterChange('formality_level', level);
              }}
              className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
            />
            
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>Casual</span>
              <span>Balanced</span>
              <span>Formal</span>
              <span>Academic</span>
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'advanced' && (
        <div className="space-y-6">
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center">
                <h3 className="text-md font-semibold">Temperature</h3>
                <button 
                  className="ml-2 text-gray-400 hover:text-white"
                  onClick={() => toggleTooltip('temperature')}
                >
                  <FaInfoCircle />
                </button>
              </div>
              <div className="text-sm font-medium">{parameters.temperature.toFixed(2)}</div>
            </div>
            
            {tooltips.temperature && (
              <div className="bg-gray-800 p-2 rounded text-sm mb-2">
                {getParameterDescription('temperature')}
              </div>
            )}
            
            <input 
              type="range" 
              min="0" 
              max="2" 
              step="0.01"
              value={parameters.temperature}
              onChange={(e) => handleParameterChange('temperature', parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
            />
            
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>Deterministic (0.0)</span>
              <span>Balanced (1.0)</span>
              <span>Random (2.0)</span>
            </div>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center">
                <h3 className="text-md font-semibold">Top P</h3>
                <button 
                  className="ml-2 text-gray-400 hover:text-white"
                  onClick={() => toggleTooltip('top_p')}
                >
                  <FaInfoCircle />
                </button>
              </div>
              <div className="text-sm font-medium">{parameters.top_p.toFixed(2)}</div>
            </div>
            
            {tooltips.top_p && (
              <div className="bg-gray-800 p-2 rounded text-sm mb-2">
                {getParameterDescription('top_p')}
              </div>
            )}
            
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.01"
              value={parameters.top_p}
              onChange={(e) => handleParameterChange('top_p', parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
            />
            
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>Focused (0.0)</span>
              <span>Balanced (0.5)</span>
              <span>Diverse (1.0)</span>
            </div>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center">
                <h3 className="text-md font-semibold">Max Tokens</h3>
                <button 
                  className="ml-2 text-gray-400 hover:text-white"
                  onClick={() => toggleTooltip('max_tokens')}
                >
                  <FaInfoCircle />
                </button>
              </div>
              <div className="text-sm font-medium">{parameters.max_tokens}</div>
            </div>
            
            {tooltips.max_tokens && (
              <div className="bg-gray-800 p-2 rounded text-sm mb-2">
                {getParameterDescription('max_tokens')}
              </div>
            )}
            
            <input 
              type="range" 
              min="100" 
              max="8000" 
              step="100"
              value={parameters.max_tokens}
              onChange={(e) => handleParameterChange('max_tokens', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
            />
            
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>Short (100)</span>
              <span>Medium (2000)</span>
              <span>Long (8000)</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                  <h3 className="text-md font-semibold">Presence Penalty</h3>
                  <button 
                    className="ml-2 text-gray-400 hover:text-white"
                    onClick={() => toggleTooltip('presence_penalty')}
                  >
                    <FaInfoCircle />
                  </button>
                </div>
                <div className="text-sm font-medium">{parameters.presence_penalty.toFixed(2)}</div>
              </div>
              
              {tooltips.presence_penalty && (
                <div className="bg-gray-800 p-2 rounded text-sm mb-2">
                  {getParameterDescription('presence_penalty')}
                </div>
              )}
              
              <input 
                type="range" 
                min="-2" 
                max="2" 
                step="0.1"
                value={parameters.presence_penalty}
                onChange={(e) => handleParameterChange('presence_penalty', parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
              />
              
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>-2.0</span>
                <span>0.0</span>
                <span>2.0</span>
              </div>
            </div>
            
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                  <h3 className="text-md font-semibold">Frequency Penalty</h3>
                  <button 
                    className="ml-2 text-gray-400 hover:text-white"
                    onClick={() => toggleTooltip('frequency_penalty')}
                  >
                    <FaInfoCircle />
                  </button>
                </div>
                <div className="text-sm font-medium">{parameters.frequency_penalty.toFixed(2)}</div>
              </div>
              
              {tooltips.frequency_penalty && (
                <div className="bg-gray-800 p-2 rounded text-sm mb-2">
                  {getParameterDescription('frequency_penalty')}
                </div>
              )}
              
              <input 
                type="range" 
                min="-2" 
                max="2" 
                step="0.1"
                value={parameters.frequency_penalty}
                onChange={(e) => handleParameterChange('frequency_penalty', parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
              />
              
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>-2.0</span>
                <span>0.0</span>
                <span>2.0</span>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center">
                <h3 className="text-md font-semibold">Response Format</h3>
                <button 
                  className="ml-2 text-gray-400 hover:text-white"
                  onClick={() => toggleTooltip('response_format')}
                >
                  <FaInfoCircle />
                </button>
              </div>
            </div>
            
            {tooltips.response_format && (
              <div className="bg-gray-800 p-2 rounded text-sm mb-2">
                {getParameterDescription('response_format')}
              </div>
            )}
            
            <div className="grid grid-cols-3 gap-2">
              <button
                className={`p-2 rounded text-sm font-medium ${parameters.response_format === 'auto' ? 'bg-blue-600' : 'bg-gray-600 hover:bg-gray-500'}`}
                onClick={() => handleParameterChange('response_format', 'auto')}
              >
                Auto
              </button>
              <button
                className={`p-2 rounded text-sm font-medium ${parameters.response_format === 'text' ? 'bg-blue-600' : 'bg-gray-600 hover:bg-gray-500'}`}
                onClick={() => handleParameterChange('response_format', 'text')}
              >
                Text
              </button>
              <button
                className={`p-2 rounded text-sm font-medium ${parameters.response_format === 'json' ? 'bg-blue-600' : 'bg-gray-600 hover:bg-gray-500'}`}
                onClick={() => handleParameterChange('response_format', 'json')}
              >
                JSON
              </button>
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'versions' && (
        <div className="space-y-4">
          {versions.length > 0 ? (
            versions.map((version) => (
              <div key={version.id} className={`bg-gray-700 rounded-lg p-4 ${version.is_active ? 'border border-blue-500' : ''}`}>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center">
                    <h3 className="text-md font-semibold">Version {version.version_number}</h3>
                    {version.is_active && (
                      <span className="ml-2 bg-blue-600 text-xs px-2 py-1 rounded">Active</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(version.created_at).toLocaleString()}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                  <div>
                    <span className="text-gray-400">Temperature:</span> {version.parameters?.temperature?.toFixed(2) || 'N/A'}
                  </div>
                  <div>
                    <span className="text-gray-400">Top P:</span> {version.parameters?.top_p?.toFixed(2) || 'N/A'}
                  </div>
                  <div>
                    <span className="text-gray-400">Max Tokens:</span> {version.parameters?.max_tokens || 'N/A'}
                  </div>
                  <div>
                    <span className="text-gray-400">Creativity:</span> {version.parameters?.creativity_level || 'N/A'}
                  </div>
                </div>
                
                {!version.is_active && (
                  <button
                    className="text-sm text-blue-400 hover:text-blue-300"
                    onClick={async () => {
                      try {
                        await axios.put(`/api/agent_versions/${version.id}/activate`);
                        
                        setVersions(prev => prev.map(v => ({
                          ...v,
                          is_active: v.id === version.id
                        })));
                        
                        if (version.parameters) {
                          setParameters(version.parameters);
                          setOriginalParameters(version.parameters);
                        }
                        
                        setSuccess('Version activated successfully!');
                      } catch (err) {
                        setError('Failed to activate version');
                        console.error('Error activating version:', err);
                      }
                    }}
                  >
                    Activate this version
                  </button>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-gray-400">
              No versions available yet. Save parameters to create a version.
            </div>
          )}
        </div>
      )}
      
      {(activeTab === 'basic' || activeTab === 'advanced') && (
        <div className="flex justify-end space-x-3 mt-6">
          <button
            className="bg-gray-600 hover:bg-gray-500 text-white font-medium py-2 px-4 rounded flex items-center"
            onClick={resetParameters}
          >
            <FaUndo className="mr-2" /> Reset
          </button>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded flex items-center"
            onClick={saveParameters}
            disabled={saving}
          >
            <FaSave className="mr-2" /> {saving ? 'Saving...' : 'Save Parameters'}
          </button>
        </div>
      )}
    </div>
  );
};

export default AgentFineTuning;

