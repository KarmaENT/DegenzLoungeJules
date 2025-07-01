import React, { useState, useEffect } from 'react';
import AgentCard from './AgentCard';
import { useQuery } from 'react-query';
import axios from 'axios';

interface Agent {
  id: number;
  name: string;
  role: string;
  personality: string;
  system_instructions: string;
  examples: Array<{
    input: string;
    output: string;
  }>;
}

interface AgentLibraryProps {
  onAgentSelect?: (agentId: number, agentName: string) => void;
}

const AgentLibrary: React.FC<AgentLibraryProps> = ({ onAgentSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'role' | 'personality'>('all');
  const [selectedAgentId, setSelectedAgentId] = useState<number | null>(null);

  // Fetch agents from API
  const { data: agents, isLoading, error } = useQuery<Agent[]>('agents', async () => {
    const response = await axios.get('/api/agents');
    return response.data;
  });

  const filteredAgents = agents?.filter(agent => {
    if (searchTerm === '') return true;
    
    switch (filter) {
      case 'role':
        return agent.role.toLowerCase().includes(searchTerm.toLowerCase());
      case 'personality':
        return agent.personality.toLowerCase().includes(searchTerm.toLowerCase());
      case 'all':
      default:
        return (
          agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          agent.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
          agent.personality.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }
  });

  const handleAgentSelect = (agentId: number, agentName: string) => {
    setSelectedAgentId(agentId);
    if (onAgentSelect) {
      onAgentSelect(agentId, agentName);
    }
  };

  return (
    <div className="agent-library-container h-full flex flex-col">
      <div className="search-bar mb-4">
        <div className="flex items-center mb-2">
          <input
            type="text"
            placeholder="Search agents..."
            className="flex-grow p-2 border rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="p-2 border-l-0 border rounded-r focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | 'role' | 'personality')}
          >
            <option value="all">All</option>
            <option value="role">Role</option>
            <option value="personality">Personality</option>
          </select>
        </div>
      </div>
      
      <div className="agent-list flex-grow overflow-y-auto">
        {isLoading ? (
          <div className="text-center py-4">Loading agents...</div>
        ) : error ? (
          <div className="text-center py-4 text-red-500">Error loading agents</div>
        ) : filteredAgents && filteredAgents.length > 0 ? (
          filteredAgents.map((agent) => (
            <AgentCard
              key={agent.id}
              id={agent.id}
              name={agent.name}
              role={agent.role}
              personality={agent.personality}
              isSelected={selectedAgentId === agent.id}
              onSelect={() => handleAgentSelect(agent.id, agent.name)}
            />
          ))
        ) : (
          <div className="text-center py-4">No agents found</div>
        )}
      </div>
      
      <div className="create-agent mt-4">
        <button
          className="w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          onClick={() => {/* Open agent creator modal */}}
        >
          Create New Agent
        </button>
      </div>
    </div>
  );
};

export default AgentLibrary;
