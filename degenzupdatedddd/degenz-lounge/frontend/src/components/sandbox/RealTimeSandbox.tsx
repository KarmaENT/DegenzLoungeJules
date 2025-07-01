import React, { useState, useEffect } from 'react';
import WebSocketHandler from '../chat/WebSocketHandler';
import ChatInterface from '../chat/ChatInterface';
import { useWebSocket } from '../../services/AIService';

interface AgentMessage {
  id: number;
  content: string;
  agent_name: string;
  agent_role: string;
  timestamp: string;
}

interface RealTimeSandboxProps {
  sessionId: number;
  agents: any[];
}

const RealTimeSandbox: React.FC<RealTimeSandboxProps> = ({ sessionId, agents }) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [clientId] = useState(`client-${Date.now()}`);
  const { sendMessage } = useWebSocket();

  const handleMessage = (wsMessage: any) => {
    if (wsMessage.type === 'agent_message') {
      const agentMessage = wsMessage.data;
      setMessages(prev => [...prev, {
        id: agentMessage.id || Date.now(),
        content: agentMessage.content,
        sender: 'agent',
        agentName: agentMessage.agent_name,
        agentRole: agentMessage.agent_role,
        timestamp: agentMessage.timestamp || new Date().toISOString()
      }]);
    }
  };

  const handleConnectionChange = (connected: boolean) => {
    setIsConnected(connected);
    
    // Notify other clients when an agent is added to the sandbox
    if (connected && agents.length > 0) {
      agents.forEach(agent => {
        sendMessage({
          type: 'agent_added',
          agent_id: agent.id,
          agent_name: agent.name,
          session_id: sessionId,
          client_id: clientId
        });
      });
    }
  };

  const handleSendUserMessage = (content: string) => {
    // Add user message to local state
    setMessages(prev => [...prev, {
      id: Date.now(),
      content,
      sender: 'user',
      timestamp: new Date().toISOString()
    }]);
    
    // Send message to WebSocket
    sendMessage({
      type: 'user_message',
      content,
      session_id: sessionId,
      client_id: clientId
    });
  };

  return (
    <div className="real-time-sandbox h-full flex flex-col">
      <WebSocketHandler
        sessionId={sessionId}
        clientId={clientId}
        onMessage={handleMessage}
        onConnectionChange={handleConnectionChange}
      />
      
      <div className="agents-status mb-4 p-3 bg-gray-100 rounded-lg">
        <h3 className="text-lg font-semibold">Active Agents</h3>
        <div className="flex flex-wrap gap-2 mt-2">
          {agents.length === 0 ? (
            <div className="text-gray-500">No agents in this session</div>
          ) : (
            agents.map(agent => (
              <div
                key={agent.id}
                className={`agent-chip px-3 py-1 rounded-full text-sm ${
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
      </div>
      
      <div className="chat-container flex-grow bg-white rounded-lg border overflow-hidden">
        <ChatInterface
          sessionId={sessionId}
          clientId={clientId}
        />
      </div>
    </div>
  );
};

export default RealTimeSandbox;
