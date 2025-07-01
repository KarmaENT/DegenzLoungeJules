import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaComments, FaRobot, FaUserFriends, FaCode, FaLightbulb } from 'react-icons/fa';
import { AnimatedButton, AnimatedCard, LoadingSpinner } from '../ui/MicroInteractions';

interface SandboxWorkspaceProps {
  sessionId: string;
}

const EnhancedSandboxWorkspace: React.FC<SandboxWorkspaceProps> = ({ sessionId }) => {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'user', content: 'Plan eco-friendly shoe launch', timestamp: new Date().toISOString() },
    { id: 2, sender: 'manager', content: 'I\'ll help coordinate this task among specialized agents.', timestamp: new Date().toISOString() },
    { id: 3, sender: 'researcher', content: 'I\'ll analyze the market for eco-friendly footwear trends.', timestamp: new Date().toISOString() },
    { id: 4, sender: 'copywriter', content: 'I\'ll work on compelling slogans for the launch.', timestamp: new Date().toISOString() },
    { id: 5, sender: 'designer', content: 'I\'ll create sustainable packaging concepts.', timestamp: new Date().toISOString() },
  ]);
  
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeAgents, setActiveAgents] = useState([
    { id: 1, name: 'Manager', role: 'Coordinator', avatar: '👨‍💼' },
    { id: 2, name: 'Researcher', role: 'Market Analyst', avatar: '🔍' },
    { id: 3, name: 'Copywriter', role: 'Content Creator', avatar: '✍️' },
    { id: 4, name: 'Designer', role: 'Visual Artist', avatar: '🎨' },
  ]);

  const handleSendMessage = () => {
    if (inputValue.trim() === '') return;
    
    // Add user message
    const newMessage = {
      id: messages.length + 1,
      sender: 'user',
      content: inputValue,
      timestamp: new Date().toISOString()
    };
    
    setMessages([...messages, newMessage]);
    setInputValue('');
    
    // Simulate agent typing
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      
      // Add agent response
      const agentResponse = {
        id: messages.length + 2,
        sender: 'manager',
        content: 'I\'m processing your request about: ' + inputValue,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, agentResponse]);
    }, 2000);
  };

  const getSenderColor = (sender: string) => {
    switch(sender) {
      case 'user': return 'bg-blue-600';
      case 'manager': return 'bg-purple-600';
      case 'researcher': return 'bg-green-600';
      case 'copywriter': return 'bg-yellow-600';
      case 'designer': return 'bg-pink-600';
      default: return 'bg-gray-600';
    }
  };
  
  const getSenderIcon = (sender: string) => {
    switch(sender) {
      case 'user': return <FaUserFriends />;
      case 'manager': return <FaRobot />;
      case 'researcher': return <FaCode />;
      case 'copywriter': return <FaLightbulb />;
      case 'designer': return <FaComments />;
      default: return <FaRobot />;
    }
  };

  return (
    <motion.div 
      className="bg-gray-800 text-white rounded-lg p-4 h-full flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div 
        className="flex justify-between items-center mb-4"
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <h2 className="text-xl font-bold flex items-center">
          <FaRobot className="mr-2" />
          Sandbox Workspace
        </h2>
        
        <div className="text-sm text-gray-400">
          Session ID: {sessionId}
        </div>
      </motion.div>
      
      <div className="flex-grow flex flex-col">
        <div className="active-agents mb-4 flex space-x-2 overflow-x-auto pb-2">
          {activeAgents.map((agent, index) => (
            <motion.div
              key={agent.id}
              className="flex-shrink-0 bg-gray-700 rounded-lg p-2 flex items-center"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5, boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}
            >
              <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-lg mr-2">
                {agent.avatar}
              </div>
              <div>
                <div className="font-medium">{agent.name}</div>
                <div className="text-xs text-gray-400">{agent.role}</div>
              </div>
            </motion.div>
          ))}
        </div>
        
        <AnimatedCard className="flex-grow bg-gray-700 mb-4 overflow-hidden flex flex-col">
          <div className="p-3 border-b border-gray-600 font-medium">
            Conversation
          </div>
          
          <div className="flex-grow overflow-y-auto p-4 space-y-4">
            <AnimatePresence>
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <motion.div 
                    className={`max-w-3/4 rounded-lg p-3 ${
                      message.sender === 'user' ? 'bg-blue-600' : getSenderColor(message.sender)
                    }`}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center mb-1">
                      <span className="mr-2">
                        {getSenderIcon(message.sender)}
                      </span>
                      <span className="font-medium capitalize">{message.sender}</span>
                      <span className="text-xs text-gray-300 ml-2">
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div>{message.content}</div>
                  </motion.div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {isTyping && (
              <motion.div
                className="flex justify-start"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="bg-gray-600 rounded-lg p-3">
                  <div className="flex items-center">
                    <span className="mr-2">
                      <FaRobot />
                    </span>
                    <span className="font-medium">Manager</span>
                  </div>
                  <div className="flex items-center mt-1">
                    <span className="mr-2">Typing</span>
                    <motion.div
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      •••
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
          
          <div className="p-3 border-t border-gray-600">
            <div className="flex">
              <input
                type="text"
                className="flex-grow p-2 bg-gray-600 border border-gray-500 rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Type your message..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <AnimatedButton
                className="bg-blue-600 hover:bg-blue-700 rounded-l-none"
                onClick={handleSendMessage}
              >
                Send
              </AnimatedButton>
            </div>
          </div>
        </AnimatedCard>
      </div>
    </motion.div>
  );
};

export default EnhancedSandboxWorkspace;
