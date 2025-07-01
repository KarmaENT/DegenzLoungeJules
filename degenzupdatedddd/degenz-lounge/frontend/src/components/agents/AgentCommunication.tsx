import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

interface Agent {
  id: number;
  name: string;
  role: string;
}

interface DirectMessage {
  id: number;
  content: string;
  sender_name: string;
  sender_role: string;
  recipient_name: string;
  recipient_role: string;
  is_private: boolean;
  timestamp: string;
}

const AgentCommunication: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedSender, setSelectedSender] = useState<number | null>(null);
  const [selectedRecipient, setSelectedRecipient] = useState<number | null>(null);
  const [messageContent, setMessageContent] = useState('');
  const [isPrivate, setIsPrivate] = useState(true);
  const [directMessages, setDirectMessages] = useState<DirectMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch agents in the session
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await axios.get(`/api/sessions/${sessionId}/agents`);
        setAgents(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load agents');
        setLoading(false);
      }
    };

    fetchAgents();
  }, [sessionId]);

  // Fetch direct messages
  useEffect(() => {
    const fetchDirectMessages = async () => {
      if (!sessionId) return;
      
      try {
        const response = await axios.get(`/api/direct-messages/session/${sessionId}`);
        setDirectMessages(response.data);
      } catch (err) {
        setError('Failed to load direct messages');
      }
    };

    fetchDirectMessages();
    
    // Set up interval to refresh messages
    const intervalId = setInterval(fetchDirectMessages, 5000);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, [sessionId]);

  // Handle WebSocket messages for real-time updates
  useEffect(() => {
    // This would connect to the WebSocket and listen for direct message events
    const socket = new WebSocket(`ws://${window.location.host}/ws/${sessionId}/${Date.now()}`);
    
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'agent_to_agent_message' || data.type === 'direct_agent_message') {
        setDirectMessages(prevMessages => [...prevMessages, data.data]);
      }
    };
    
    socket.onclose = () => {
      console.log('WebSocket connection closed');
    };
    
    return () => {
      socket.close();
    };
  }, [sessionId]);

  const handleSendMessage = async () => {
    if (!selectedSender || !selectedRecipient || !messageContent.trim()) {
      setError('Please select both agents and enter a message');
      return;
    }

    try {
      await axios.post('/api/direct-messages/', {
        content: messageContent,
        session_id: parseInt(sessionId || '0'),
        sender_agent_id: selectedSender,
        recipient_agent_id: selectedRecipient,
        is_private: isPrivate
      });

      // Clear the message input
      setMessageContent('');
      
      // Fetch the updated messages
      const response = await axios.get(`/api/direct-messages/session/${sessionId}`);
      setDirectMessages(response.data);
    } catch (err) {
      setError('Failed to send message');
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  if (loading) {
    return <div className="p-4">Loading agents...</div>;
  }

  return (
    <div className="bg-gray-800 text-white rounded-lg shadow-lg p-4 h-full flex flex-col">
      <h2 className="text-xl font-bold mb-4">Agent Communication</h2>
      
      {error && (
        <div className="bg-red-600 text-white p-2 mb-4 rounded">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block mb-2">Sender Agent</label>
          <select 
            className="w-full bg-gray-700 text-white p-2 rounded"
            value={selectedSender || ''}
            onChange={(e) => setSelectedSender(parseInt(e.target.value))}
          >
            <option value="">Select sender</option>
            {agents.map(agent => (
              <option key={`sender-${agent.id}`} value={agent.id}>
                {agent.name} ({agent.role})
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block mb-2">Recipient Agent</label>
          <select 
            className="w-full bg-gray-700 text-white p-2 rounded"
            value={selectedRecipient || ''}
            onChange={(e) => setSelectedRecipient(parseInt(e.target.value))}
          >
            <option value="">Select recipient</option>
            {agents.map(agent => (
              <option key={`recipient-${agent.id}`} value={agent.id}>
                {agent.name} ({agent.role})
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="mb-4">
        <label className="block mb-2">Message</label>
        <textarea 
          className="w-full bg-gray-700 text-white p-2 rounded resize-none"
          rows={4}
          value={messageContent}
          onChange={(e) => setMessageContent(e.target.value)}
          placeholder="Enter your message here..."
        />
      </div>
      
      <div className="mb-4 flex items-center">
        <input 
          type="checkbox" 
          id="isPrivate" 
          checked={isPrivate} 
          onChange={() => setIsPrivate(!isPrivate)}
          className="mr-2"
        />
        <label htmlFor="isPrivate">Private message (only visible to you)</label>
      </div>
      
      <button 
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
        onClick={handleSendMessage}
        disabled={!selectedSender || !selectedRecipient || !messageContent.trim()}
      >
        Send Message
      </button>
      
      <div className="flex-grow overflow-y-auto bg-gray-900 rounded p-4">
        <h3 className="text-lg font-semibold mb-2">Message History</h3>
        
        {directMessages.length === 0 ? (
          <p className="text-gray-400">No messages yet</p>
        ) : (
          <div className="space-y-4">
            {directMessages.map(message => (
              <div 
                key={message.id} 
                className={`p-3 rounded-lg ${message.is_private ? 'bg-purple-900' : 'bg-gray-700'}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <span className="font-bold">{message.sender_name}</span>
                    <span className="text-gray-400 text-sm ml-2">({message.sender_role})</span>
                    <span className="text-gray-400 mx-2">→</span>
                    <span className="font-bold">{message.recipient_name}</span>
                    <span className="text-gray-400 text-sm ml-2">({message.recipient_role})</span>
                  </div>
                  <div className="text-xs text-gray-400">
                    {formatTimestamp(message.timestamp)}
                    {message.is_private && (
                      <span className="ml-2 bg-purple-700 text-white text-xs px-2 py-1 rounded">Private</span>
                    )}
                  </div>
                </div>
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentCommunication;
