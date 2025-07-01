import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FeedbackComponent from '../feedback/FeedbackComponent';

interface ChatMessageProps {
  message: {
    id: number;
    content: string;
    message_type: string;
    session_id: number;
    session_agent_id: number | null;
    user_id: number | null;
    created_at: string;
  };
  agentName: string;
  sessionId: number;
  showFeedback: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, agentName, sessionId, showFeedback }) => {
  const [showFeedbackForm, setShowFeedbackForm] = useState<boolean>(false);
  
  const isAgentMessage = message.message_type === 'agent';
  
  return (
    <div className={`chat-message ${isAgentMessage ? 'agent-message' : 'user-message'} mb-4`}>
      <div className="flex items-start">
        <div className={`avatar ${isAgentMessage ? 'bg-blue-600' : 'bg-gray-600'} rounded-full w-8 h-8 flex items-center justify-center mr-2`}>
          {isAgentMessage ? agentName.charAt(0).toUpperCase() : 'U'}
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-center mb-1">
            <div className="font-semibold">{isAgentMessage ? agentName : 'You'}</div>
            <div className="text-xs text-gray-400">
              {new Date(message.created_at).toLocaleTimeString()}
            </div>
          </div>
          <div className="message-content bg-gray-700 rounded-lg p-3">
            {message.content}
          </div>
          
          {isAgentMessage && showFeedback && (
            <div className="mt-1">
              {showFeedbackForm ? (
                <FeedbackComponent 
                  messageId={message.id}
                  sessionId={sessionId}
                  agentId={message.session_agent_id || 0}
                  agentName={agentName}
                />
              ) : (
                <button 
                  className="text-xs text-blue-400 hover:text-blue-300 mt-1"
                  onClick={() => setShowFeedbackForm(true)}
                >
                  Rate this response
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
