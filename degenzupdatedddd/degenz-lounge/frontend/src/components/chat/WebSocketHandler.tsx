import React, { useEffect, useState, useCallback } from 'react';
import { useWebSocket } from '../../services/AIService';

interface WebSocketHandlerProps {
  sessionId: number;
  clientId: string;
  onMessage: (message: any) => void;
  onConnectionChange: (isConnected: boolean) => void;
}

const WebSocketHandler: React.FC<WebSocketHandlerProps> = ({
  sessionId,
  clientId,
  onMessage,
  onConnectionChange
}) => {
  const { socket, isConnected, connectToSession, disconnectFromSession } = useWebSocket();

  // Connect to WebSocket when component mounts
  useEffect(() => {
    if (sessionId) {
      connectToSession(sessionId.toString(), clientId);
      onConnectionChange(true);
    }

    return () => {
      disconnectFromSession();
      onConnectionChange(false);
    };
  }, [sessionId, clientId, connectToSession, disconnectFromSession, onConnectionChange]);

  // Update connection status when it changes
  useEffect(() => {
    onConnectionChange(isConnected);
  }, [isConnected, onConnectionChange]);

  // Listen for messages from WebSocket
  useEffect(() => {
    if (socket) {
      // Handle agent messages
      const handleAgentMessage = (data: any) => {
        onMessage({
          type: 'agent_message',
          data
        });
      };

      // Handle notifications
      const handleNotification = (data: any) => {
        onMessage({
          type: 'notification',
          data
        });
      };

      // Handle errors
      const handleError = (data: any) => {
        onMessage({
          type: 'error',
          data
        });
      };

      // Register event listeners
      socket.on('agent_message', handleAgentMessage);
      socket.on('notification', handleNotification);
      socket.on('error', handleError);

      // Clean up event listeners
      return () => {
        socket.off('agent_message', handleAgentMessage);
        socket.off('notification', handleNotification);
        socket.off('error', handleError);
      };
    }
  }, [socket, onMessage]);

  return null; // This is a non-visual component
};

export default WebSocketHandler;
