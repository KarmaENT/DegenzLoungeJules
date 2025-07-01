import React, { useState } from 'react';
import { useMutation } from 'react-query';
import axios from 'axios';

interface AgentSettingsProps {
  selectedAgent: {
    id: number;
    name: string;
    role: string;
    personality: string;
    system_instructions: string;
    examples: Array<{
      input: string;
      output: string;
    }>;
  } | null;
  onClose: () => void;
  onUpdate: () => void;
}

const AgentSettings: React.FC<AgentSettingsProps> = ({ 
  selectedAgent, 
  onClose,
  onUpdate
}) => {
  const [name, setName] = useState(selectedAgent?.name || '');
  const [role, setRole] = useState(selectedAgent?.role || '');
  const [personality, setPersonality] = useState(selectedAgent?.personality || '');
  const [systemInstructions, setSystemInstructions] = useState(selectedAgent?.system_instructions || '');
  const [examples, setExamples] = useState(selectedAgent?.examples || []);
  const [newExampleInput, setNewExampleInput] = useState('');
  const [newExampleOutput, setNewExampleOutput] = useState('');

  const updateAgentMutation = useMutation(
    async (agentData: any) => {
      if (!selectedAgent) return null;
      return axios.put(`/api/agents/${selectedAgent.id}`, agentData);
    },
    {
      onSuccess: () => {
        onUpdate();
        onClose();
      }
    }
  );

  const handleAddExample = () => {
    if (newExampleInput.trim() && newExampleOutput.trim()) {
      setExamples([
        ...examples,
        { input: newExampleInput, output: newExampleOutput }
      ]);
      setNewExampleInput('');
      setNewExampleOutput('');
    }
  };

  const handleRemoveExample = (index: number) => {
    setExamples(examples.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateAgentMutation.mutate({
      name,
      role,
      personality,
      system_instructions: systemInstructions,
      examples
    });
  };

  if (!selectedAgent) {
    return (
      <div className="agent-settings-container p-4">
        <div className="text-center text-gray-500">
          No agent selected. Select an agent to view settings.
        </div>
      </div>
    );
  }

  return (
    <div className="agent-settings-container h-full flex flex-col">
      <div className="settings-header mb-4 p-3 bg-gray-100 rounded-lg">
        <h3 className="text-lg font-semibold">Agent Settings</h3>
        <p className="text-sm text-gray-600">
          Configure your agent's behavior and personality
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name
          </label>
          <input
            type="text"
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Role
          </label>
          <input
            type="text"
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Personality
          </label>
          <select
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={personality}
            onChange={(e) => setPersonality(e.target.value)}
            required
          >
            <option value="">Select a personality</option>
            <option value="Analytical">Analytical</option>
            <option value="Creative">Creative</option>
            <option value="Friendly">Friendly</option>
            <option value="Professional">Professional</option>
            <option value="Technical">Technical</option>
            <option value="Precise">Precise</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            System Instructions
          </label>
          <textarea
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={5}
            value={systemInstructions}
            onChange={(e) => setSystemInstructions(e.target.value)}
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Examples
          </label>
          <div className="examples-list mb-2">
            {examples.map((example, index) => (
              <div key={index} className="example-item mb-2 p-2 border rounded bg-gray-50">
                <div className="flex justify-between mb-1">
                  <span className="text-xs font-medium text-gray-700">Example {index + 1}</span>
                  <button
                    type="button"
                    className="text-xs text-red-600 hover:text-red-800"
                    onClick={() => handleRemoveExample(index)}
                  >
                    Remove
                  </button>
                </div>
                <div className="text-sm mb-1"><strong>Input:</strong> {example.input}</div>
                <div className="text-sm"><strong>Output:</strong> {example.output}</div>
              </div>
            ))}
          </div>

          <div className="add-example border rounded p-2">
            <div className="mb-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Input
              </label>
              <input
                type="text"
                className="w-full p-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={newExampleInput}
                onChange={(e) => setNewExampleInput(e.target.value)}
              />
            </div>
            <div className="mb-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Output
              </label>
              <input
                type="text"
                className="w-full p-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={newExampleOutput}
                onChange={(e) => setNewExampleOutput(e.target.value)}
              />
            </div>
            <button
              type="button"
              className="w-full p-1 text-sm bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
              onClick={handleAddExample}
            >
              Add Example
            </button>
          </div>
        </div>

        <div className="button-group flex gap-2 mt-4">
          <button
            type="button"
            className="flex-1 p-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition-colors"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            disabled={updateAgentMutation.isLoading}
          >
            {updateAgentMutation.isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AgentSettings;
