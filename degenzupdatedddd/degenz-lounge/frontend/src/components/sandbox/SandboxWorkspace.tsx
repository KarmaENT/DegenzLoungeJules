import React, { useState } from 'react';
import { useDrop } from 'react-dnd';
import { useQuery, useMutation } from 'react-query';
import axios from 'axios';

interface Agent {
  id: number;
  name: string;
  role: string;
  personality: string;
}

interface SandboxAgent extends Agent {
  isManager: boolean;
}

interface SandboxWorkspaceProps {
  sessionId: number;
}

const SandboxWorkspace: React.FC<SandboxWorkspaceProps> = ({ sessionId }) => {
  const [sandboxAgents, setSandboxAgents] = useState<SandboxAgent[]>([]);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);

  // Fetch session data if needed
  const { data: session, isLoading: sessionLoading } = useQuery(['session', sessionId], async () => {
    const response = await axios.get(`/api/sandbox/sessions/${sessionId}`);
    return response.data;
  });

  // Add agent to sandbox mutation
  const addAgentMutation = useMutation(
    async (data: { agentId: number; isManager: boolean }) => {
      return axios.post(`/api/sandbox/sessions/${sessionId}/agents`, {
        agent_id: data.agentId,
        is_manager: data.isManager,
      });
    },
    {
      onSuccess: (_, variables) => {
        // Find the agent in the list and add it to the sandbox
        // In a real app, you would fetch the updated agent list
        const newAgent = {
          id: variables.agentId,
          name: `Agent ${variables.agentId}`, // Placeholder
          role: variables.isManager ? 'Manager' : 'Assistant',
          personality: 'Default',
          isManager: variables.isManager,
        };
        setSandboxAgents([...sandboxAgents, newAgent]);
      },
    }
  );

  // Send message mutation
  const sendMessageMutation = useMutation(
    async (content: string) => {
      return axios.post(`/api/sandbox/sessions/${sessionId}/message`, {
        content,
        session_id: sessionId,
      });
    },
    {
      onSuccess: (response) => {
        // Add user message to the list
        setMessages([
          ...messages,
          { id: Date.now(), content: message, sender: 'user' },
        ]);
        setMessage('');
        
        // In a real app, agent responses would come via WebSocket
        // For now, we'll simulate a response
        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now() + 1,
              content: 'This is a simulated response from an agent.',
              sender: 'agent',
              agentName: 'Simulated Agent',
              agentRole: 'Assistant',
            },
          ]);
        }, 1000);
      },
    }
  );

  // Drop target for agents
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'agent',
    drop: (item: Agent) => {
      // Ask if this should be a manager agent
      const isManager = sandboxAgents.length === 0 || 
        window.confirm('Make this a manager agent?');
      
      addAgentMutation.mutate({ agentId: item.id, isManager });
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      sendMessageMutation.mutate(message);
    }
  };

  return (
    <div className="sandbox-workspace-container h-full flex flex-col">
      <div className="sandbox-header mb-4 p-3 bg-gray-100 rounded-lg">
        <h3 className="text-lg font-semibold">
          {session?.name || 'New Session'}
        </h3>
        <p className="text-sm text-gray-600">
          {session?.description || 'Drag agents here to start collaborating'}
        </p>
      </div>

      <div 
        ref={drop}
        className={`agent-dropzone mb-4 p-3 border-2 border-dashed rounded-lg flex flex-wrap gap-2 ${
          isOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        }`}
        style={{ minHeight: '100px' }}
      >
        {sandboxAgents.length === 0 ? (
          <div className="w-full text-center text-gray-500 py-8">
            Drag agents here to add them to the sandbox
          </div>
        ) : (
          sandboxAgents.map((agent) => (
            <div 
              key={agent.id}
              className={`agent-chip px-3 py-2 rounded-full text-sm ${
                agent.isManager 
                  ? 'bg-purple-100 text-purple-800 border border-purple-300' 
                  : 'bg-blue-100 text-blue-800 border border-blue-300'
              }`}
            >
              {agent.name}
              {agent.isManager && (
                <span className="ml-1 text-xs bg-purple-200 px-1 rounded">
                  Manager
                </span>
              )}
            </div>
          ))
        )}
      </div>

      <div className="chat-container flex-grow flex flex-col bg-white rounded-lg border overflow-hidden">
        <div className="messages-container flex-grow overflow-y-auto p-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No messages yet. Start the conversation!
            </div>
          ) : (
            messages.map((msg) => (
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
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button
            type="submit"
            className="px-4 bg-blue-600 text-white rounded-r hover:bg-blue-700 transition-colors"
            disabled={!message.trim() || sandboxAgents.length === 0}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default SandboxWorkspace;
