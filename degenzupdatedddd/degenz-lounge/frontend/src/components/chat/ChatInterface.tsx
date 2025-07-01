import React, { useState, useEffect } from 'react';
import { useWebSocket } from '../../services/AIService';

interface ChatMessageProps {
  message: {
    id: number;
    content: string;
    sender: 'user' | 'agent';
    agentName?: string;
    agentRole?: string;
    timestamp: string;
  };
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  return (
    <div
      className={`message mb-4 ${
        message.sender === 'user' ? 'text-right' : 'text-left'
      }`}
    >
      <div
        className={`inline-block max-w-3/4 px-4 py-2 rounded-lg ${
          message.sender === 'user'
            ? 'bg-blue-500 text-white rounded-br-none'
            : 'bg-gray-200 text-gray-800 rounded-bl-none'
        }`}
      >
        {message.sender === 'agent' && message.agentName && (
          <div className="text-xs font-semibold mb-1">
            {message.agentName} ({message.agentRole})
          </div>
        )}
        <div>{message.content}</div>
        <div className="text-xs mt-1 opacity-70">
          {new Date(message.timestamp).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};

interface ChatInterfaceProps {
  sessionId: number;
  clientId: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ sessionId, clientId }) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const { sendMessage } = useWebSocket();

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && isConnected) {
      // Add user message to local state
      const userMessage = {
        id: Date.now(),
        content: message,
        sender: 'user' as const,
        timestamp: new Date().toISOString()
      };
      setMessages([...messages, userMessage]);
      
      // Send message to WebSocket
      sendMessage({
        type: 'user_message',
        content: message,
        session_id: sessionId,
        client_id: clientId
      });
      
      // Clear input
      setMessage('');
    }
  };

  const handleWebSocketMessage = (wsMessage: any) => {
    if (wsMessage.type === 'agent_message') {
      const agentMessage = {
        id: wsMessage.data.id || Date.now(),
        content: wsMessage.data.content,
        sender: 'agent' as const,
        agentName: wsMessage.data.agent_name,
        agentRole: wsMessage.data.agent_role,
        timestamp: wsMessage.data.timestamp || new Date().toISOString()
      };
      setMessages(prev => [...prev, agentMessage]);
    } else if (wsMessage.type === 'notification') {
      // Handle notifications if needed
      console.log('Notification:', wsMessage.data);
    } else if (wsMessage.type === 'error') {
      // Handle errors if needed
      console.error('Error:', wsMessage.data);
    }
  };

  const handleConnectionChange = (connected: boolean) => {
    setIsConnected(connected);
  };

  return (
    <div className="chat-interface flex flex-col h-full">
      <div className="connection-status px-3 py-1 text-xs">
        {isConnected ? (
          <span className="text-green-600">Connected</span>
        ) : (
          <span className="text-red-600">Disconnected</span>
        )}
      </div>
      
      <div className="messages-container flex-grow overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map(msg => <ChatMessage key={msg.id} message={msg} />)
        )}
      </div>
      
      <form
        onSubmit={handleSendMessage}
        className="message-input-container p-3 border-t flex"
      >
        <input
          type="text"
          className="flex-grow p-2 border rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={isConnected ? "Type your message..." : "Connecting..."}
          value={message}
          onChange={e => setMessage(e.target.value)}
          disabled={!isConnected}
        />
        <button
          type="submit"
          className="px-4 bg-blue-600 text-white rounded-r hover:bg-blue-700 transition-colors disabled:bg-gray-400"
          disabled={!isConnected || !message.trim()}
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatInterface;
