import React, { createContext, useContext, useState, useEffect } from 'react';
import io, { Socket } from 'socket.io-client';
import axios from 'axios';

// Define the context type
interface WebSocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  connectToSession: (sessionId: string, clientId: string) => void;
  disconnectFromSession: () => void;
  sendMessage: (message: any) => void;
}

// Create the context with default values
const WebSocketContext = createContext<WebSocketContextType>({
  socket: null,
  isConnected: false,
  connectToSession: () => {},
  disconnectFromSession: () => {},
  sendMessage: () => {},
});

// Custom hook to use the WebSocket context
export const useWebSocket = () => useContext(WebSocketContext);

// WebSocket provider component
export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [sessionInfo, setSessionInfo] = useState<{ sessionId: string; clientId: string } | null>(null);

  // Connect to a session
  const connectToSession = (sessionId: string, clientId: string) => {
    // Close existing connection if any
    if (socket) {
      socket.close();
    }

    // Create new socket connection
    const newSocket = io(`${process.env.REACT_APP_API_URL || ''}/ws`, {
      query: { session_id: sessionId, client_id: clientId },
      transports: ['websocket'],
    });

    // Set up event listeners
    newSocket.on('connect', () => {
      console.log('WebSocket connected');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    });

    // Store session info and socket
    setSessionInfo({ sessionId, clientId });
    setSocket(newSocket);
  };

  // Disconnect from session
  const disconnectFromSession = () => {
    if (socket) {
      socket.close();
      setSocket(null);
      setSessionInfo(null);
      setIsConnected(false);
    }
  };

  // Send a message
  const sendMessage = (message: any) => {
    if (socket && isConnected && sessionInfo) {
      socket.emit('message', {
        ...message,
        session_id: sessionInfo.sessionId,
        client_id: sessionInfo.clientId,
      });
    } else {
      console.error('Cannot send message: Socket not connected');
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, [socket]);

  return (
    <WebSocketContext.Provider
      value={{
        socket,
        isConnected,
        connectToSession,
        disconnectFromSession,
        sendMessage,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

// AI Service for interacting with the backend AI services
export const useAIService = () => {
  const { sendMessage } = useWebSocket();

  // Send a message to the AI
  const sendUserMessage = async (sessionId: number, content: string) => {
    try {
      const response = await axios.post(`/api/sandbox/sessions/${sessionId}/message`, {
        content,
        session_id: sessionId,
      });
      
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  // Get agent response in persona mode
  const getPersonaResponse = async (agentId: number, content: string) => {
    try {
      const response = await axios.post('/api/persona/message', {
        content,
        agent_id: agentId,
      });
      
      return response.data;
    } catch (error) {
      console.error('Error getting persona response:', error);
      throw error;
    }
  };

  return {
    sendUserMessage,
    getPersonaResponse,
  };
};
