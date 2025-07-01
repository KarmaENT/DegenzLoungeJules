import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronDown, FaSearch, FaPlus, FaFilter } from 'react-icons/fa';
import { AnimatedButton, AnimatedInput, AnimatedDropdown, NotificationBadge, LoadingSpinner } from '../ui/MicroInteractions';

interface Agent {
  id: number;
  name: string;
  role: string;
  personality: string;
}

interface EnhancedAgentLibraryProps {
  onAgentSelect?: (agentId: number, agentName: string) => void;
}

const EnhancedAgentLibrary: React.FC<EnhancedAgentLibraryProps> = ({ onAgentSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'role' | 'personality'>('all');
  const [selectedAgentId, setSelectedAgentId] = useState<number | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [notification, setNotification] = useState(3); // Example notification count
  
  // Simulate loading agents
  useEffect(() => {
    const timer = setTimeout(() => {
      setAgents([
        { id: 1, name: 'Research Agent', role: 'Researcher', personality: 'Analytical' },
        { id: 2, name: 'Creative Writer', role: 'Writer', personality: 'Creative' },
        { id: 3, name: 'Data Analyst', role: 'Analyst', personality: 'Precise' },
        { id: 4, name: 'Customer Support', role: 'Support', personality: 'Helpful' },
        { id: 5, name: 'Marketing Expert', role: 'Marketer', personality: 'Persuasive' },
      ]);
      setIsLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  const filteredAgents = agents.filter(agent => {
    if (searchTerm === '') return true;
    
    switch (filter) {
      case 'role':
        return agent.role.toLowerCase().includes(searchTerm.toLowerCase());
      case 'personality':
        return agent.personality.toLowerCase().includes(searchTerm.toLowerCase());
      case 'all':
      default:
        return (
          agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          agent.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
          agent.personality.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }
  });

  const handleAgentSelect = (agentId: number, agentName: string) => {
    setSelectedAgentId(agentId);
    if (onAgentSelect) {
      onAgentSelect(agentId, agentName);
    }
    
    if (notification > 0) {
      setNotification(prev => Math.max(0, prev - 1));
    }
  };

  return (
    <motion.div 
      className="agent-library-container h-full flex flex-col bg-gray-800 rounded-lg p-4 text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-between items-center mb-4">
        <motion.h2 
          className="text-xl font-bold"
          initial={{ x: -20 }}
          animate={{ x: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          Agent Library
        </motion.h2>
        
        <div className="relative">
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <NotificationBadge count={notification} className="absolute -top-2 -right-2" />
            <button className="p-2 bg-blue-600 rounded-full">
              <FaPlus className="text-white" />
            </button>
          </motion.div>
        </div>
      </div>
      
      <div className="search-bar mb-4">
        <div className="relative">
          <AnimatedInput
            type="text"
            placeholder="Search agents..."
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            className="pl-10 pr-10 py-2 bg-gray-700 text-white border-gray-600 w-full"
          />
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
          
          <motion.button
            className="absolute right-3 top-2"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsFilterOpen(!isFilterOpen)}
          >
            <FaFilter className="text-gray-400" />
          </motion.button>
        </div>
        
        <AnimatedDropdown isOpen={isFilterOpen} className="mt-2 bg-gray-700 rounded shadow-lg">
          <div className="p-2">
            <div className="text-sm font-medium mb-2">Filter by:</div>
            <div className="space-y-1">
              <motion.div 
                className={`px-3 py-1 rounded cursor-pointer ${filter === 'all' ? 'bg-blue-600' : 'hover:bg-gray-600'}`}
                whileHover={{ x: 5 }}
                onClick={() => setFilter('all')}
              >
                All
              </motion.div>
              <motion.div 
                className={`px-3 py-1 rounded cursor-pointer ${filter === 'role' ? 'bg-blue-600' : 'hover:bg-gray-600'}`}
                whileHover={{ x: 5 }}
                onClick={() => setFilter('role')}
              >
                Role
              </motion.div>
              <motion.div 
                className={`px-3 py-1 rounded cursor-pointer ${filter === 'personality' ? 'bg-blue-600' : 'hover:bg-gray-600'}`}
                whileHover={{ x: 5 }}
                onClick={() => setFilter('personality')}
              >
                Personality
              </motion.div>
            </div>
          </div>
        </AnimatedDropdown>
      </div>
      
      <div className="agent-list flex-grow overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <LoadingSpinner size={40} />
          </div>
        ) : filteredAgents.length > 0 ? (
          <AnimatePresence>
            {filteredAgents.map((agent, index) => (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <motion.div
                  className={`p-4 mb-3 rounded-lg cursor-pointer ${
                    selectedAgentId === agent.id 
                      ? 'bg-blue-600' 
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                  whileHover={{ y: -5, boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleAgentSelect(agent.id, agent.name)}
                  layout
                >
                  <h3 className="text-lg font-semibold">{agent.name}</h3>
                  <div className="text-sm text-gray-300 font-medium mt-1">{agent.role}</div>
                  <div className="text-xs text-gray-400 mt-2">Personality: {agent.personality}</div>
                  
                  <motion.div 
                    className="mt-3 flex justify-end"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <span className="inline-block bg-gray-800 text-gray-300 text-xs px-2 py-1 rounded">
                      {selectedAgentId === agent.id ? 'Selected' : 'Click to select'}
                    </span>
                  </motion.div>
                </motion.div>
              </motion.div>
            ))}
          </AnimatePresence>
        ) : (
          <motion.div 
            className="text-center py-8 text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            No agents found
          </motion.div>
        )}
      </div>
      
      <div className="create-agent mt-4">
        <AnimatedButton
          className="w-full bg-blue-600 text-white hover:bg-blue-700"
          onClick={() => {/* Open agent creator modal */}}
        >
          Create New Agent
        </AnimatedButton>
      </div>
    </motion.div>
  );
};

export default EnhancedAgentLibrary;

