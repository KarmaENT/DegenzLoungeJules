import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

interface WorkflowStep {
  name: string;
  description: string;
  agent_role?: string;
  agent_id?: number;
  instructions: string;
  depends_on: number[];
  expected_output?: string;
}

interface Workflow {
  id?: number;
  name: string;
  description: string;
  steps: WorkflowStep[];
  is_public: boolean;
}

interface Agent {
  id: number;
  name: string;
  role: string;
}

const WorkflowEditor: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [workflow, setWorkflow] = useState<Workflow>({
    name: '',
    description: '',
    steps: [],
    is_public: false
  });
  const [agents, setAgents] = useState<Agent[]>([]);
  const [currentStep, setCurrentStep] = useState<WorkflowStep>({
    name: '',
    description: '',
    instructions: '',
    depends_on: []
  });
  const [editingStepIndex, setEditingStepIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch agents in the session
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await axios.get(`/api/sessions/${sessionId}/agents`);
        setAgents(response.data as Agent[]);
        setLoading(false);
      } catch (err) {
        setError('Failed to load agents');
        setLoading(false);
      }
    };

    fetchAgents();
  }, [sessionId]);

  const handleWorkflowChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setWorkflow({
      ...workflow,
      [name]: value
    });
  };

  const handleWorkflowCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setWorkflow({
      ...workflow,
      [name]: checked
    });
  };

  const handleStepChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCurrentStep({
      ...currentStep,
      [name]: value
    });
  };

  const handleAgentSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === '') {
      // Clear agent selection
      const { agent_id, ...rest } = currentStep;
      setCurrentStep(rest);
    } else {
      setCurrentStep({
        ...currentStep,
        agent_id: parseInt(value)
      });
    }
  };

  const handleDependencyChange = (stepIndex: number) => {
    const newDependsOn = [...currentStep.depends_on];
    const index = newDependsOn.indexOf(stepIndex);
    
    if (index === -1) {
      newDependsOn.push(stepIndex);
    } else {
      newDependsOn.splice(index, 1);
    }
    
    setCurrentStep({
      ...currentStep,
      depends_on: newDependsOn
    });
  };

  const addStep = () => {
    if (!currentStep.name || !currentStep.instructions) {
      setError('Step name and instructions are required');
      return;
    }

    if (editingStepIndex !== null) {
      // Update existing step
      const updatedSteps = [...workflow.steps];
      updatedSteps[editingStepIndex] = currentStep;
      setWorkflow({
        ...workflow,
        steps: updatedSteps
      });
      setEditingStepIndex(null);
    } else {
      // Add new step
      setWorkflow({
        ...workflow,
        steps: [...workflow.steps, currentStep]
      });
    }

    // Reset current step
    setCurrentStep({
      name: '',
      description: '',
      instructions: '',
      depends_on: []
    });
    
    setSuccessMessage('Step saved successfully');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const editStep = (index: number) => {
    setCurrentStep(workflow.steps[index]);
    setEditingStepIndex(index);
  };

  const removeStep = (index: number) => {
    const updatedSteps = [...workflow.steps];
    updatedSteps.splice(index, 1);
    
    // Update dependencies in other steps
    const adjustedSteps = updatedSteps.map(step => {
      const newDependsOn = step.depends_on.filter(dep => dep !== index)
        .map(dep => dep > index ? dep - 1 : dep);
      return { ...step, depends_on: newDependsOn };
    });
    
    setWorkflow({
      ...workflow,
      steps: adjustedSteps
    });
  };

  const saveWorkflow = async () => {
    if (!workflow.name || workflow.steps.length === 0) {
      setError('Workflow name and at least one step are required');
      return;
    }

    try {
      const response = await axios.post('/api/workflows/', {
        ...workflow,
        session_id: parseInt(sessionId || '0')
      });
      
      setSuccessMessage('Workflow saved successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
      
      // Reset form after successful save
      setWorkflow({
        name: '',
        description: '',
        steps: [],
        is_public: false
      });
    } catch (err) {
      setError('Failed to save workflow');
    }
  };

  if (loading) {
    return <div className="p-4">Loading agents...</div>;
  }

  return (
    <div className="bg-gray-800 text-white rounded-lg shadow-lg p-4 h-full flex flex-col">
      <h2 className="text-xl font-bold mb-4">Workflow Editor</h2>
      
      {error && (
        <div className="bg-red-600 text-white p-2 mb-4 rounded">
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className="bg-green-600 text-white p-2 mb-4 rounded">
          {successMessage}
        </div>
      )}
      
      <div className="mb-6 border-b border-gray-700 pb-4">
        <h3 className="text-lg font-semibold mb-3">Workflow Details</h3>
        
        <div className="mb-4">
          <label className="block mb-2">Name</label>
          <input 
            type="text"
            name="name"
            className="w-full bg-gray-700 text-white p-2 rounded"
            value={workflow.name}
            onChange={handleWorkflowChange}
            placeholder="Enter workflow name"
          />
        </div>
        
        <div className="mb-4">
          <label className="block mb-2">Description</label>
          <textarea 
            name="description"
            className="w-full bg-gray-700 text-white p-2 rounded resize-none"
            rows={3}
            value={workflow.description}
            onChange={handleWorkflowChange}
            placeholder="Describe the purpose of this workflow"
          />
        </div>
        
        <div className="mb-4 flex items-center">
          <input 
            type="checkbox" 
            id="is_public" 
            name="is_public"
            checked={workflow.is_public} 
            onChange={handleWorkflowCheckboxChange}
            className="mr-2"
          />
          <label htmlFor="is_public">Make this workflow public</label>
        </div>
      </div>
      
      <div className="mb-6 border-b border-gray-700 pb-4">
        <h3 className="text-lg font-semibold mb-3">
          {editingStepIndex !== null ? 'Edit Step' : 'Add New Step'}
        </h3>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block mb-2">Step Name</label>
            <input 
              type="text"
              name="name"
              className="w-full bg-gray-700 text-white p-2 rounded"
              value={currentStep.name}
              onChange={handleStepChange}
              placeholder="Enter step name"
            />
          </div>
          
          <div>
            <label className="block mb-2">Assigned Agent (Optional)</label>
            <select 
              className="w-full bg-gray-700 text-white p-2 rounded"
              value={currentStep.agent_id || ''}
              onChange={handleAgentSelect}
            >
              <option value="">No specific agent</option>
              {agents.map(agent => (
                <option key={agent.id} value={agent.id}>
                  {agent.name} ({agent.role})
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block mb-2">Description</label>
          <input 
            type="text"
            name="description"
            className="w-full bg-gray-700 text-white p-2 rounded"
            value={currentStep.description}
            onChange={handleStepChange}
            placeholder="Brief description of this step"
          />
        </div>
        
        <div className="mb-4">
          <label className="block mb-2">Instructions</label>
          <textarea 
            name="instructions"
            className="w-full bg-gray-700 text-white p-2 rounded resize-none"
            rows={4}
            value={currentStep.instructions}
            onChange={handleStepChange}
            placeholder="Detailed instructions for this step"
          />
        </div>
        
        <div className="mb-4">
          <label className="block mb-2">Expected Output (Optional)</label>
          <textarea 
            name="expected_output"
            className="w-full bg-gray-700 text-white p-2 rounded resize-none"
            rows={2}
            value={currentStep.expected_output || ''}
            onChange={handleStepChange}
            placeholder="What should this step produce?"
          />
        </div>
        
        {workflow.steps.length > 0 && (
          <div className="mb-4">
            <label className="block mb-2">Dependencies (steps that must complete before this one)</label>
            <div className="grid grid-cols-2 gap-2">
              {workflow.steps.map((step, index) => {
                // Don't show current step as a dependency option when editing
                if (editingStepIndex === index) return null;
                
                return (
                  <div key={index} className="flex items-center">
                    <input 
                      type="checkbox" 
                      id={`dep-${index}`} 
                      checked={currentStep.depends_on.includes(index)} 
                      onChange={() => handleDependencyChange(index)}
                      className="mr-2"
                    />
                    <label htmlFor={`dep-${index}`}>{index + 1}. {step.name}</label>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        <button 
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={addStep}
        >
          {editingStepIndex !== null ? 'Update Step' : 'Add Step'}
        </button>
        
        {editingStepIndex !== null && (
          <button 
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded ml-2"
            onClick={() => {
              setCurrentStep({
                name: '',
                description: '',
                instructions: '',
                depends_on: []
              });
              setEditingStepIndex(null);
            }}
          >
            Cancel
          </button>
        )}
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Workflow Steps</h3>
        
        {workflow.steps.length === 0 ? (
          <p className="text-gray-400">No steps added yet</p>
        ) : (
          <div className="space-y-3">
            {workflow.steps.map((step, index) => (
              <div key={index} className="bg-gray-700 p-3 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="font-bold">{index + 1}. {step.name}</span>
                    {step.agent_id && (
                      <span className="ml-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                        {agents.find(a => a.id === step.agent_id)?.name || 'Unknown Agent'}
                      </span>
                    )}
                  </div>
                  <div>
                    <button 
                      className="text-blue-400 hover:text-blue-300 mr-2"
                      onClick={() => editStep(index)}
                    >
                      Edit
                    </button>
                    <button 
                      className="text-red-400 hover:text-red-300"
                      onClick={() => removeStep(index)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <p className="text-gray-300 text-sm mb-1">{step.description}</p>
                {step.depends_on.length > 0 && (
                  <div className="text-xs text-gray-400 mb-1">
                    Depends on steps: {step.depends_on.map(d => d + 1).join(', ')}
                  </div>
                )}
                <div className="text-xs text-gray-400">
                  Instructions: {step.instructions.length > 100 
                    ? `${step.instructions.substring(0, 100)}...` 
                    : step.instructions}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="mt-auto">
        <button 
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded w-full"
          onClick={saveWorkflow}
          disabled={!workflow.name || workflow.steps.length === 0}
        >
          Save Workflow
        </button>
      </div>
    </div>
  );
};

export default WorkflowEditor;
