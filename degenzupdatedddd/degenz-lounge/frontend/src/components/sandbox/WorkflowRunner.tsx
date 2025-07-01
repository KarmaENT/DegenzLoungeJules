import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

interface WorkflowSession {
  id: number;
  workflow_id: number;
  session_id: number;
  status: string;
  current_step: number;
  results: Record<string, any>; // Consider a more specific type for results if possible
  created_at: string;
  updated_at: string;
}

interface Workflow {
  id: number;
  name: string;
  description: string;
  steps: WorkflowStep[];
  is_public: boolean;
  owner_id: number; // Assuming owner_id is part of the Workflow interface
  created_at: string;
  updated_at: string;
}

interface WorkflowStep {
  name: string;
  description: string;
  agent_role?: string;
  agent_id?: number;
  instructions: string;
  depends_on: number[];
  expected_output?: string;
}

// Interface for the response from the execute step API
interface WorkflowExecutionResponse {
  status: string;
  current_step: number;
  step_result: any; // Consider a more specific type if the structure is known
  agent_name?: string; // Added based on usage in result rendering
  timestamp?: string; // Added based on usage in result rendering
  content?: any; // Added based on usage in result rendering
}

const WorkflowRunner: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<number | null>(null);
  const [workflowSessions, setWorkflowSessions] = useState<WorkflowSession[]>([]);
  const [activeSession, setActiveSession] = useState<WorkflowSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [autoExecute, setAutoExecute] = useState(false);

  useEffect(() => {
    const fetchWorkflows = async () => {
      try {
        const response = await axios.get<Workflow[]>('/api/workflows/');
        setWorkflows(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load workflows');
        setLoading(false);
      }
    };
    fetchWorkflows();
  }, []);

  useEffect(() => {
    const fetchWorkflowSessions = async () => {
      if (!sessionId) return;
      try {
        const response = await axios.get<WorkflowSession[]>(`/api/workflows/sessions/${sessionId}`);
        setWorkflowSessions(response.data);
        const inProgress = response.data.find((ws: WorkflowSession) => ws.status === 'in_progress');
        if (inProgress) {
          setActiveSession(inProgress);
        }
      } catch (err) {
        setError('Failed to load workflow sessions');
      }
    };
    fetchWorkflowSessions();
  }, [sessionId]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (autoExecute && activeSession && activeSession.status === 'in_progress' && !executing) {
      timeoutId = setTimeout(() => {
        executeNextStep();
      }, 3000);
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [autoExecute, activeSession, executing]);

  const startWorkflow = async () => {
    if (!selectedWorkflow) {
      setError('Please select a workflow');
      return;
    }
    try {
      const response = await axios.post<WorkflowSession>('/api/workflows/sessions/', {
        workflow_id: selectedWorkflow,
        session_id: parseInt(sessionId || '0'),
        status: 'pending',
        current_step: 0,
        results: {}
      });
      setActiveSession(response.data);
      setWorkflowSessions(prevSessions => [...prevSessions, response.data]);
      setSuccessMessage('Workflow started successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Failed to start workflow');
    }
  };

  const executeNextStep = async () => {
    if (!activeSession) {
      setError('No active workflow session');
      return;
    }
    setExecuting(true);
    try {
      const response = await axios.post<WorkflowExecutionResponse>(`/api/workflows/execute/${activeSession.id}`);
      const executionData = response.data;
      const updatedSession: WorkflowSession = {
        ...activeSession,
        status: executionData.status,
        current_step: executionData.current_step,
        results: {
          ...activeSession.results,
          [executionData.current_step -1]: executionData.step_result 
        }
      };
      setActiveSession(updatedSession);
      setWorkflowSessions(prevSessions => 
        prevSessions.map(ws => (ws.id === activeSession.id ? updatedSession : ws))
      );
      setSuccessMessage(`Step ${executionData.current_step -1} executed successfully`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(`Failed to execute step: ${err.response?.data?.detail || err.message}`);
    } finally {
      setExecuting(false);
    }
  };

  const getWorkflowById = (id: number): Workflow | undefined => {
    return workflows.find(w => w.id === id);
  };

  const formatTimestamp = (timestamp: string) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const getStepStatus = (stepIndex: number): 'pending' | 'completed' | 'current' | 'blocked' => {
    if (!activeSession) return 'pending';
    if (stepIndex < activeSession.current_step -1) { 
      return 'completed';
    } else if (stepIndex === activeSession.current_step -1 && activeSession.status !== 'completed' && activeSession.status !== 'failed') {
      return 'current';
    } else if (activeSession.results[stepIndex]) { 
        return 'completed';
    }
    const workflow = getWorkflowById(activeSession.workflow_id);
    if (!workflow || !workflow.steps[stepIndex]) return 'blocked';
    const step = workflow.steps[stepIndex];
    const dependsOn = step.depends_on || [];
    for (const depIndex of dependsOn) {
      if (!activeSession.results[depIndex]) {
        return 'blocked';
      }
    }
    return 'pending';
  };

  if (loading) {
    return <div className="p-4 text-center text-gray-400">Loading workflows...</div>;
  }

  return (
    <div className="bg-gray-800 text-white rounded-lg shadow-lg p-6 h-full flex flex-col space-y-6">
      <h2 className="text-2xl font-bold text-purple-400">Workflow Runner</h2>
      
      {error && (
        <div className="bg-red-700 text-white p-3 rounded-md text-sm">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="bg-green-700 text-white p-3 rounded-md text-sm">
          {successMessage}
        </div>
      )}
      
      {!activeSession ? (
        <div className="bg-gray-700 p-4 rounded-lg space-y-4">
          <h3 className="text-lg font-semibold text-purple-300">Start New Workflow</h3>
          <div>
            <label htmlFor="workflow-select" className="block mb-1 text-sm font-medium text-gray-300">Select Workflow</label>
            <select 
              id="workflow-select"
              className="w-full bg-gray-600 text-white p-2 rounded-md border border-gray-500 focus:ring-purple-500 focus:border-purple-500"
              value={selectedWorkflow || ''}
              onChange={(e) => setSelectedWorkflow(e.target.value ? parseInt(e.target.value) : null)}
            >
              <option value="">Select a workflow</option>
              {workflows.map(workflow => (
                <option key={workflow.id} value={workflow.id}>
                  {workflow.name} {workflow.is_public && '(Public)'}
                </option>
              ))}
            </select>
          </div>
          
          {selectedWorkflow && getWorkflowById(selectedWorkflow) && (
            <div className="bg-gray-600 p-3 rounded-md">
              <h4 className="font-semibold text-white">{getWorkflowById(selectedWorkflow)?.name}</h4>
              <p className="text-gray-300 text-sm mb-1">{getWorkflowById(selectedWorkflow)?.description}</p>
              <div className="text-xs text-gray-400">
                {getWorkflowById(selectedWorkflow)?.steps.length} steps
              </div>
            </div>
          )}
          
          <button 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition-colors disabled:opacity-50"
            onClick={startWorkflow}
            disabled={!selectedWorkflow}
          >
            Start Workflow
          </button>
        </div>
      ) : (
        <div className="flex-grow flex flex-col space-y-4 bg-gray-700 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-purple-300">
              Active Workflow: {getWorkflowById(activeSession.workflow_id)?.name}
            </h3>
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${ 
                activeSession.status === 'pending' ? 'bg-yellow-500 text-yellow-900' :
                activeSession.status === 'in_progress' ? 'bg-blue-500 text-blue-100' :
                activeSession.status === 'completed' ? 'bg-green-500 text-green-100' : 'bg-red-500 text-red-100'
              }`}>
                {activeSession.status.toUpperCase()}
              </span>
              <span className="text-xs text-gray-400">
                Step {activeSession.current_step} of {getWorkflowById(activeSession.workflow_id)?.steps.length}
              </span>
            </div>
          </div>
          
          <div className="flex items-center">
            <input 
              type="checkbox" 
              id="autoExecute" 
              checked={autoExecute} 
              onChange={() => setAutoExecute(!autoExecute)}
              className="mr-2 h-4 w-4 text-purple-600 bg-gray-600 border-gray-500 rounded focus:ring-purple-500"
              disabled={activeSession.status !== 'in_progress'}
            />
            <label htmlFor="autoExecute" className="text-sm text-gray-300">Auto-execute steps</label>
          </div>
          
          <div className="flex-grow overflow-y-auto bg-gray-800 rounded-md p-3 space-y-3">
            <h4 className="font-semibold text-purple-300 mb-2">Workflow Steps</h4>
            {getWorkflowById(activeSession.workflow_id)?.steps.map((step, index) => {
              const status = getStepStatus(index);
              const result = activeSession.results[index] as WorkflowExecutionResponse | undefined;
              
              return (
                <div 
                  key={index} 
                  className={`p-3 rounded-lg shadow-md ${ 
                    status === 'completed' ? 'bg-green-800 border-l-4 border-green-500' :
                    status === 'current' ? 'bg-blue-800 border-l-4 border-blue-500 animate-pulse' :
                    status === 'blocked' ? 'bg-red-800 border-l-4 border-red-500 opacity-60' : 'bg-gray-600 border-l-4 border-gray-500'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <span className="font-bold text-white">{index + 1}. {step.name}</span>
                      {step.agent_id && (
                        <span className="ml-2 bg-purple-600 text-white text-xs px-2 py-0.5 rounded-full">
                          Agent Required
                        </span>
                      )}
                      {step.agent_role && (
                        <span className="ml-2 bg-indigo-600 text-white text-xs px-2 py-0.5 rounded-full">
                          Role: {step.agent_role}
                        </span>
                      )}
                    </div>
                    <div className={`text-xs font-medium px-2 py-0.5 rounded-full ${ 
                      status === 'completed' ? 'bg-green-500 text-green-100' :
                      status === 'current' ? 'bg-blue-500 text-blue-100' :
                      status === 'blocked' ? 'bg-red-500 text-red-100' : 'bg-gray-400 text-gray-800'
                    }`}>
                      {status.toUpperCase()}
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm mb-1">{step.description}</p>
                  {step.depends_on.length > 0 && (
                    <div className="text-xs text-gray-400 mb-1">
                      Depends on steps: {step.depends_on.map(d => d + 1).join(', ')}
                    </div>
                  )}
                  {result && (
                    <div className="mt-2 border-t border-gray-700 pt-2 space-y-1">
                      <div className="flex justify-between items-center">
                        <div className="text-sm font-semibold text-purple-300">Result from {result.agent_name || 'Agent'}</div>
                        <div className="text-xs text-gray-400">{formatTimestamp(result.timestamp || '')}</div>
                      </div>
                      <div className="text-sm bg-gray-900 p-2 rounded whitespace-pre-wrap overflow-x-auto">
                        {typeof result.content === 'object' ? JSON.stringify(result.content, null, 2) : result.content}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {activeSession.status === 'in_progress' && (
            <button 
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition-colors disabled:opacity-50"
              onClick={executeNextStep}
              disabled={executing}
            >
              {executing ? 'Executing...' : 'Execute Next Step'}
            </button>
          )}
          {(activeSession.status === 'completed' || activeSession.status === 'failed') && (
             <button 
              className="w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-md transition-colors"
              onClick={() => setActiveSession(null)}
            >
              {activeSession.status === 'completed' ? 'Workflow Finished. Start New?' : 'Workflow Failed. Start New?'}
            </button>
          )}
        </div>
      )}
      
      {workflowSessions.length > 0 && !activeSession && (
        <div className="mt-6 bg-gray-700 p-4 rounded-lg space-y-3">
          <h3 className="text-lg font-semibold text-purple-300 mb-2">Previous Workflow Sessions</h3>
          {workflowSessions.map(session => {
            const workflow = getWorkflowById(session.workflow_id);
            return (
              <div key={session.id} className="bg-gray-600 p-3 rounded-lg shadow">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-bold text-white">{workflow?.name || 'Unknown Workflow'}</span>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ 
                      session.status === 'pending' ? 'bg-yellow-500 text-yellow-900' :
                      session.status === 'in_progress' ? 'bg-blue-500 text-blue-100' :
                      session.status === 'completed' ? 'bg-green-500 text-green-100' : 'bg-red-500 text-red-100'
                    }`}>
                      {session.status.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-400">
                      {formatTimestamp(session.created_at)}
                    </span>
                  </div>
                </div>
                <div className="text-sm text-gray-300 mb-2">
                  Progress: {session.current_step} / {workflow?.steps.length || '?'}
                </div>
                <button 
                  className="text-sm text-purple-400 hover:text-purple-300 font-medium"
                  onClick={() => setActiveSession(session)}
                >
                  View/Resume Session
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WorkflowRunner;

