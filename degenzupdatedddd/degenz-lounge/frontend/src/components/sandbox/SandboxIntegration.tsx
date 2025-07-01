import React, { useEffect, useState } from 'react';
import { useWebSocket, useAIService } from '../../services/AIService';

interface AgentResponse {
  id: number;
  content: string;
  agent_name: string;
  agent_role: string;
  timestamp: string;
}

interface SandboxIntegrationProps {
  sessionId: number;
  agents: any[]; // Consider defining a more specific type for agents if possible
}

interface SandboxMessage {
  id: number | string;
  content: string;
  sender: 'agent' | 'user' | 'system';
  agentName?: string;
  agentRole?: string;
  timestamp: string;
}

// Changed from React.FC to a custom hook pattern
const useSandboxIntegration = ({ sessionId, agents }: SandboxIntegrationProps) => {
  const [messages, setMessages] = useState<SandboxMessage[]>([]);
  const { socket, isConnected, connectToSession, sendMessage: sendWsMessage } = useWebSocket(); // Renamed sendMessage to avoid conflict
  const { sendUserMessage } = useAIService();
  const [clientId] = useState(`client-${Date.now()}`);

  useEffect(() => {
    if (sessionId) {
      connectToSession(sessionId.toString(), clientId);
    }
    // No explicit cleanup needed for connectToSession unless it returns a cleanup function
  }, [sessionId, clientId, connectToSession]);

  useEffect(() => {
    if (socket) {
      const handleAgentMessage = (data: AgentResponse) => {
        setMessages(prev => [
          ...prev,
          {
            id: data.id || Date.now(), // Use data.id if available, otherwise fallback
            content: data.content,
            sender: 'agent',
            agentName: data.agent_name,
            agentRole: data.agent_role,
            timestamp: data.timestamp || new Date().toISOString()
          }
        ]);
      };

      const handleNotification = (data: any) => {
        console.log('System notification:', data);
        setMessages(prev => [
          ...prev,
          {
            id: Date.now(),
            content: typeof data === 'string' ? data : JSON.stringify(data),
            sender: 'system',
            timestamp: new Date().toISOString()
          }
        ]);
      };

      socket.on('agent_message', handleAgentMessage);
      socket.on('notification', handleNotification);

      return () => {
        socket.off('agent_message', handleAgentMessage);
        socket.off('notification', handleNotification);
      };
    }
  }, [socket]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: SandboxMessage = {
      id: `user-${Date.now()}`,
      content,
      sender: 'user',
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      // This sends the message to the backend API, which then might broadcast via WebSocket
      await sendUserMessage(sessionId, content);
      // If direct WebSocket message sending is also needed for user messages:
      // sendWsMessage({ type: 'user_message', payload: { session_id: sessionId, content } });
    } catch (error) {
      console.error('Error sending message:', error);
      // Optionally add an error message to the chat
      setMessages(prev => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          content: 'Error sending message. Please try again.',
          sender: 'system',
          timestamp: new Date().toISOString()
        }
      ]);
    }
  };

  return {
    messages,
    isConnected,
    handleSendMessage
  };
};

export default useSandboxIntegration;

