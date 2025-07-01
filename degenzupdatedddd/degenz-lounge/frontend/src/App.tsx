import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import './styles/App.css';

// Import components
import AgentLibrary from './components/agents/AgentLibrary';
import SandboxWorkspace from './components/sandbox/SandboxWorkspace';
import AgentSettings from './components/agents/AgentSettings';
import PersonaMode from './components/persona/PersonaMode';
import AgentCommunication from './components/agents/AgentCommunication';
import WorkflowEditor from './components/sandbox/WorkflowEditor';
import WorkflowRunner from './components/sandbox/WorkflowRunner';
import ConflictResolutionPanel from './components/sandbox/ConflictResolutionPanel';
import TeamManager from './components/sandbox/TeamManager';
import HierarchicalCommunication from './components/sandbox/HierarchicalCommunication';
import AgentLearning from './components/learning/AgentLearning';

// Define a basic Agent type for App.tsx state
interface AppAgent {
  id: number;
  name: string;
  role: string;
  personality: string;
  system_instructions: string;
  examples: Array<{ input: string; output: string; }>;
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'sandbox' | 'persona'>('sandbox');
  const [activeSandboxFeature, setActiveSandboxFeature] = useState<string>('workspace');
  const [sessionId, setSessionId] = useState<string>('1'); // This would be dynamically set in a real app
  
  // State for the currently selected agent object
  const [selectedAgent, setSelectedAgent] = useState<AppAgent | null>(null);

  // Mock agent data - in a real app, this would come from an API or global state
  const mockAgents: AppAgent[] = [
    {
      id: 1,
      name: 'Research Agent',
      role: 'Researcher',
      personality: 'Analytical',
      system_instructions: 'You are a research assistant. Your goal is to find and synthesize information.',
      examples: [{ input: 'Find papers on X', output: 'Here are papers on X...' }]
    },
    {
      id: 2,
      name: 'Creative Writer',
      role: 'Writer',
      personality: 'Creative',
      system_instructions: 'You are a creative writer. Your goal is to write engaging stories.',
      examples: [{ input: 'Write a story about a dragon', output: 'Once upon a time, there was a dragon...' }]
    }
  ];

  // Effect to set a default selected agent or when an agent is selected from library
  useEffect(() => {
    // For now, just set the first mock agent as default if none is selected
    if (!selectedAgent && mockAgents.length > 0) {
      setSelectedAgent(mockAgents[0]);
    }
  }, [selectedAgent, mockAgents]);

  // Handler for agent selection from AgentLibrary or elsewhere
  const handleAgentSelect = (agentId: number, agentName: string) => {
    const agent = mockAgents.find(a => a.id === agentId);
    if (agent) {
      setSelectedAgent(agent);
    } else {
      // Fallback or create a new minimal agent object if not found in mock data
      setSelectedAgent({
        id: agentId,
        name: agentName,
        role: 'Default Role', // Provide sensible defaults
        personality: 'Default Personality',
        system_instructions: 'Default instructions.',
        examples: []
      });
    }
  };

  const handleSettingsClose = () => {
    // Logic to handle closing of settings, e.g., clear selection or navigate
    console.log('Agent settings closed');
  };

  const handleSettingsUpdate = () => {
    // Logic to handle settings update, e.g., refetch agent data or show notification
    console.log('Agent settings updated');
    // Potentially refetch or update the selectedAgent state if changes are made
    // For now, let's assume the AgentSettings component handles its internal state
    // and this callback is for broader application updates if needed.
    const updatedAgent = mockAgents.find(a => a.id === selectedAgent?.id);
    if (updatedAgent) {
        setSelectedAgent(updatedAgent); // Re-set to trigger re-render if necessary
    }
  };

  return (
    <Router>
      <DndProvider backend={HTML5Backend}>
        <div className="app-container">
          <header className="app-header">
            <h1>DeGeNz Lounge</h1>
            <div className="tab-selector">
              <button 
                className={activeTab === 'sandbox' ? 'active' : ''} 
                onClick={() => setActiveTab('sandbox')}
              >
                Sandbox Mode
              </button>
              <button 
                className={activeTab === 'persona' ? 'active' : ''} 
                onClick={() => setActiveTab('persona')}
              >
                Persona Mode
              </button>
            </div>
          </header>
          
          <main className="app-content">
            {activeTab === 'sandbox' ? (
              <div className="sandbox-container">
                <div className="sandbox-nav">
                  <button 
                    className={activeSandboxFeature === 'workspace' ? 'active' : ''}
                    onClick={() => setActiveSandboxFeature('workspace')}
                  >
                    Workspace
                  </button>
                  {/* Add other navigation buttons here */}
                  <button 
                    className={activeSandboxFeature === 'agent-learning' ? 'active' : ''}
                    onClick={() => setActiveSandboxFeature('agent-learning')}
                  >
                    Agent Learning
                  </button>
                </div>
                
                <div className="sandbox-layout">
                  <div className="agent-library">
                    <h2>Agent Library</h2>
                    <AgentLibrary onAgentSelect={handleAgentSelect} />
                  </div>
                  
                  <div className="sandbox-main-content">
                    {activeSandboxFeature === 'workspace' && (
                      <div className="sandbox-workspace">
                        <h2>Sandbox Workspace</h2>
                        <SandboxWorkspace sessionId={parseInt(sessionId)} />
                      </div>
                    )}
                    
                    {activeSandboxFeature === 'communication' && (
                      <div className="agent-communication">
                        <h2>Agent Communication</h2>
                        <AgentCommunication />
                      </div>
                    )}
                    
                    {activeSandboxFeature === 'workflows' && (
                      <div className="workflow-editor">
                        <h2>Workflow Editor</h2>
                        <WorkflowEditor />
                      </div>
                    )}
                    
                    {activeSandboxFeature === 'workflow-runner' && (
                      <div className="workflow-runner">
                        <h2>Workflow Runner</h2>
                        <WorkflowRunner />
                      </div>
                    )}
                    
                    {activeSandboxFeature === 'conflict-resolution' && (
                      <div className="conflict-resolution">
                        <h2>Conflict Resolution</h2>
                        <ConflictResolutionPanel />
                      </div>
                    )}
                    
                    {activeSandboxFeature === 'team-manager' && (
                      <div className="team-manager">
                        <h2>Team Manager</h2>
                        <TeamManager />
                      </div>
                    )}
                    
                    {activeSandboxFeature === 'hierarchical-communication' && (
                      <div className="hierarchical-communication">
                        <h2>Team Communication</h2>
                        <HierarchicalCommunication />
                      </div>
                    )}
                    
                    {activeSandboxFeature === 'agent-learning' && selectedAgent && (
                      <div className="agent-learning">
                        <h2>Agent Learning & Improvement</h2>
                        <AgentLearning 
                          agentId={selectedAgent.id} 
                          agentName={selectedAgent.name} 
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="agent-settings">
                    <h2>Agent Settings</h2>
                    <AgentSettings 
                      selectedAgent={selectedAgent} // Pass the full agent object
                      onClose={handleSettingsClose}
                      onUpdate={handleSettingsUpdate}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="persona-mode">
                <h2>Persona Mode</h2>
                <PersonaMode />
              </div>
            )}
          </main>
          
          <footer className="app-footer">
            <p>DeGeNz Lounge - Advanced Agent Collaboration Platform</p>
          </footer>
        </div>
      </DndProvider>
    </Router>
  );
};

export default App;

