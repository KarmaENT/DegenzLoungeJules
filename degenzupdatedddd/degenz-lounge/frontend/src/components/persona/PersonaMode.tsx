import React, { useState } from 'react';
import { useQuery, useMutation } from 'react-query';
import axios from 'axios';

interface Agent {
  id: number;
  name: string;
  role: string;
  personality: string;
}

const PersonaMode: React.FC = () => {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [message, setMessage] = useState('');
  const [conversation, setConversation] = useState<any[]>([]);

  // Fetch agents from API
  const { data: agents, isLoading } = useQuery<Agent[]>('agents', async () => {
    const response = await axios.get('/api/agents');
    return response.data;
  });

  // Send message mutation
  const sendMessageMutation = useMutation(
    async (content: string) => {
      if (!selectedAgent) throw new Error('No agent selected');
      
      return axios.post('/api/persona/message', {
        content,
        agent_id: selectedAgent.id
      });
    },
    {
      onSuccess: (response) => {
        // Add user message to conversation
        setConversation([
          ...conversation,
          { id: Date.now(), content: message, sender: 'user' }
        ]);
        setMessage('');
        
        // In a real app, we'd get the response from the API
        // For now, simulate a response
        setTimeout(() => {
          setConversation(prev => [
            ...prev,
            {
              id: Date.now() + 1,
              content: `This is a simulated response from ${selectedAgent?.name}.`,
              sender: 'agent',
              agentName: selectedAgent?.name,
              agentRole: selectedAgent?.role
            }
          ]);
        }, 1000);
      }
    }
  );

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && selectedAgent) {
      sendMessageMutation.mutate(message);
    }
  };

  const handleSelectAgent = (agent: Agent) => {
    setSelectedAgent(agent);
    setConversation([]);
  };

  return (
    <div className="persona-mode-container h-full flex flex-col">
      <div className="persona-header mb-4 p-3 bg-gray-100 rounded-lg">
        <h3 className="text-lg font-semibold">Persona Mode</h3>
        <p className="text-sm text-gray-600">
          Chat directly with a single agent
        </p>
      </div>

      <div className="agent-selector mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select an Agent
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {isLoading ? (
            <div className="col-span-full text-center py-4">Loading agents...</div>
          ) : agents && agents.length > 0 ? (
            agents.map(agent => (
              <div
                key={agent.id}
                className={`agent-option p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedAgent?.id === agent.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => handleSelectAgent(agent)}
              >
                <div className="font-medium">{agent.name}</div>
                <div className="text-sm text-gray-600">{agent.role}</div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-4">No agents available</div>
          )}
        </div>
      </div>

      <div className="chat-container flex-grow flex flex-col bg-white rounded-lg border overflow-hidden">
        <div className="messages-container flex-grow overflow-y-auto p-4">
          {!selectedAgent ? (
            <div className="text-center text-gray-500 py-8">
              Select an agent to start chatting
            </div>
          ) : conversation.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              Start a conversation with {selectedAgent.name}
            </div>
          ) : (
            conversation.map(msg => (
              <div
                key={msg.id}
                className={`message mb-4 ${
                  msg.sender === 'user' ? 'text-right' : 'text-left'
                }`}
              >
                <div
                  className={`inline-block max-w-3/4 px-4 py-2 rounded-lg ${
                    msg.sender === 'user'
                      ? 'bg-blue-500 text-white rounded-br-none'
                      : 'bg-gray-200 text-gray-800 rounded-bl-none'
                  }`}
                >
                  {msg.sender === 'agent' && (
                    <div className="text-xs font-semibold mb-1">
                      {msg.agentName} ({msg.agentRole})
                    </div>
                  )}
                  <div>{msg.content}</div>
                </div>
              </div>
            ))
          )}
        </div>

        <form
          onSubmit={handleSendMessage}
          className="message-input-container p-3 border-t flex"
        >
          <input
            type="text"
            className="flex-grow p-2 border rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={selectedAgent ? `Message ${selectedAgent.name}...` : "Select an agent first..."}
            value={message}
            onChange={e => setMessage(e.target.value)}
            disabled={!selectedAgent}
          />
          <button
            type="submit"
            className="px-4 bg-blue-600 text-white rounded-r hover:bg-blue-700 transition-colors disabled:bg-gray-400"
            disabled={!selectedAgent || !message.trim()}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default PersonaMode;
