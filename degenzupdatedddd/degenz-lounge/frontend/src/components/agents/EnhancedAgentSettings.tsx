import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronDown, FaChevronUp, FaCog, FaTrash, FaEdit, FaCheck } from 'react-icons/fa';
import { AnimatedButton, AnimatedCard, AnimatedToggle, AnimatedTabIndicator } from '../ui/MicroInteractions';

interface AgentSettingsProps {
  agentId?: number;
  agentName?: string;
}

const EnhancedAgentSettings: React.FC<AgentSettingsProps> = ({ agentId = 1, agentName = 'Default Agent' }) => {
  const [activeTab, setActiveTab] = useState('general');
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState('You are a helpful assistant specialized in research and data analysis.');
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(2048);
  const [enableMemory, setEnableMemory] = useState(true);
  const [enableWeb, setEnableWeb] = useState(true);
  
  // Ref for measuring tab widths
  const tabRefs = {
    general: React.useRef<HTMLButtonElement>(null),
    appearance: React.useRef<HTMLButtonElement>(null),
    behavior: React.useRef<HTMLButtonElement>(null),
    advanced: React.useRef<HTMLButtonElement>(null),
  };
  
  const [tabWidths, setTabWidths] = useState<number[]>([0, 0, 0, 0]);
  
  React.useEffect(() => {
    // Measure tab widths
    setTabWidths([
      tabRefs.general.current?.offsetWidth || 0,
      tabRefs.appearance.current?.offsetWidth || 0,
      tabRefs.behavior.current?.offsetWidth || 0,
      tabRefs.advanced.current?.offsetWidth || 0,
    ]);
  }, []);
  
  const getTabIndex = () => {
    switch (activeTab) {
      case 'general': return 0;
      case 'appearance': return 1;
      case 'behavior': return 2;
      case 'advanced': return 3;
      default: return 0;
    }
  };

  const handleSave = () => {
    // Animation for save button
    console.log('Saving agent settings...');
  };

  return (
    <motion.div 
      className="bg-gray-800 text-white rounded-lg p-4 h-full flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div 
        className="flex justify-between items-center mb-6"
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <h2 className="text-xl font-bold flex items-center">
          <FaCog className="mr-2" />
          Agent Settings
        </h2>
        
        <AnimatedButton
          className="bg-blue-600 hover:bg-blue-700 text-sm"
          onClick={handleSave}
        >
          <FaCheck className="mr-1 inline-block" /> Save Changes
        </AnimatedButton>
      </motion.div>
      
      {agentId ? (
        <motion.div 
          className="mb-6 p-3 bg-gray-700 rounded-lg"
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="text-sm text-gray-400">Selected Agent</div>
          <div className="text-lg font-semibold">{agentName}</div>
          <div className="text-xs text-gray-400">ID: {agentId}</div>
        </motion.div>
      ) : (
        <motion.div 
          className="mb-6 p-3 bg-gray-700 rounded-lg text-center text-gray-400"
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          No agent selected
        </motion.div>
      )}
      
      <div className="tabs-container mb-4 relative">
        <div className="flex border-b border-gray-700">
          <motion.button
            ref={tabRefs.general}
            className={`py-2 px-4 font-medium ${activeTab === 'general' ? 'text-blue-400' : 'text-gray-400 hover:text-white'}`}
            onClick={() => setActiveTab('general')}
            whileHover={{ y: -2 }}
            whileTap={{ y: 0 }}
          >
            General
          </motion.button>
          
          <motion.button
            ref={tabRefs.appearance}
            className={`py-2 px-4 font-medium ${activeTab === 'appearance' ? 'text-blue-400' : 'text-gray-400 hover:text-white'}`}
            onClick={() => setActiveTab('appearance')}
            whileHover={{ y: -2 }}
            whileTap={{ y: 0 }}
          >
            Appearance
          </motion.button>
          
          <motion.button
            ref={tabRefs.behavior}
            className={`py-2 px-4 font-medium ${activeTab === 'behavior' ? 'text-blue-400' : 'text-gray-400 hover:text-white'}`}
            onClick={() => setActiveTab('behavior')}
            whileHover={{ y: -2 }}
            whileTap={{ y: 0 }}
          >
            Behavior
          </motion.button>
          
          <motion.button
            ref={tabRefs.advanced}
            className={`py-2 px-4 font-medium ${activeTab === 'advanced' ? 'text-blue-400' : 'text-gray-400 hover:text-white'}`}
            onClick={() => setActiveTab('advanced')}
            whileHover={{ y: -2 }}
            whileTap={{ y: 0 }}
          >
            Advanced
          </motion.button>
        </div>
        
        <AnimatedTabIndicator activeIndex={getTabIndex()} tabWidths={tabWidths} />
      </div>
      
      <div className="tab-content flex-grow overflow-y-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'general' && (
            <motion.div
              key="general"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <AnimatedCard className="bg-gray-700">
                <label className="block mb-2 font-medium">Agent Name</label>
                <input 
                  type="text" 
                  className="w-full p-2 bg-gray-600 border border-gray-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={agentName}
                  onChange={(e) => {/* Update agent name */}}
                />
              </AnimatedCard>
              
              <AnimatedCard className="bg-gray-700">
                <label className="block mb-2 font-medium">Role</label>
                <select className="w-full p-2 bg-gray-600 border border-gray-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Researcher</option>
                  <option>Writer</option>
                  <option>Analyst</option>
                  <option>Support</option>
                  <option>Custom...</option>
                </select>
              </AnimatedCard>
              
              <AnimatedCard className="bg-gray-700">
                <label className="block mb-2 font-medium">Personality</label>
                <select className="w-full p-2 bg-gray-600 border border-gray-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Analytical</option>
                  <option>Creative</option>
                  <option>Friendly</option>
                  <option>Professional</option>
                  <option>Custom...</option>
                </select>
              </AnimatedCard>
            </motion.div>
          )}
          
          {activeTab === 'appearance' && (
            <motion.div
              key="appearance"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <AnimatedCard className="bg-gray-700">
                <label className="block mb-2 font-medium">Avatar</label>
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-2xl font-bold">
                    {agentName?.charAt(0) || 'A'}
                  </div>
                  <AnimatedButton className="bg-gray-600 hover:bg-gray-500">
                    Change Avatar
                  </AnimatedButton>
                </div>
              </AnimatedCard>
              
              <AnimatedCard className="bg-gray-700">
                <label className="block mb-2 font-medium">Color Theme</label>
                <div className="grid grid-cols-5 gap-2">
                  {['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'].map((color, index) => (
                    <motion.div
                      key={color}
                      className="w-8 h-8 rounded-full cursor-pointer"
                      style={{ backgroundColor: color }}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                    />
                  ))}
                </div>
              </AnimatedCard>
              
              <AnimatedCard className="bg-gray-700">
                <label className="block mb-2 font-medium">Display Name</label>
                <input 
                  type="text" 
                  className="w-full p-2 bg-gray-600 border border-gray-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={agentName}
                  onChange={(e) => {/* Update display name */}}
                />
              </AnimatedCard>
            </motion.div>
          )}
          
          {activeTab === 'behavior' && (
            <motion.div
              key="behavior"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <AnimatedCard className="bg-gray-700">
                <label className="block mb-2 font-medium">System Prompt</label>
                <textarea 
                  className="w-full p-2 bg-gray-600 border border-gray-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                />
              </AnimatedCard>
              
              <AnimatedCard className="bg-gray-700">
                <div className="flex justify-between items-center">
                  <label className="font-medium">Enable Memory</label>
                  <AnimatedToggle isOn={enableMemory} onToggle={() => setEnableMemory(!enableMemory)} />
                </div>
                <p className="text-sm text-gray-400 mt-1">Allow agent to remember conversation history</p>
              </AnimatedCard>
              
              <AnimatedCard className="bg-gray-700">
                <div className="flex justify-between items-center">
                  <label className="font-medium">Web Access</label>
                  <AnimatedToggle isOn={enableWeb} onToggle={() => setEnableWeb(!enableWeb)} />
                </div>
                <p className="text-sm text-gray-400 mt-1">Allow agent to search the web for information</p>
              </AnimatedCard>
            </motion.div>
          )}
          
          {activeTab === 'advanced' && (
            <motion.div
              key="advanced"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <AnimatedCard className="bg-gray-700">
                <div className="flex justify-between items-center mb-2">
                  <label className="font-medium">Temperature</label>
                  <span className="text-sm bg-gray-600 px-2 py-1 rounded">{temperature.toFixed(1)}</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.1" 
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full"
                />
                <p className="text-sm text-gray-400 mt-1">Controls randomness: lower is more deterministic</p>
              </AnimatedCard>
              
              <AnimatedCard className="bg-gray-700">
                <div className="flex justify-between items-center mb-2">
                  <label className="font-medium">Max Tokens</label>
                  <span className="text-sm bg-gray-600 px-2 py-1 rounded">{maxTokens}</span>
                </div>
                <input 
                  type="range" 
                  min="256" 
                  max="4096" 
                  step="256" 
                  value={maxTokens}
                  onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                  className="w-full"
                />
                <p className="text-sm text-gray-400 mt-1">Maximum length of generated responses</p>
              </AnimatedCard>
              
              <motion.div
                className="bg-gray-700 rounded-lg overflow-hidden"
                initial={false}
                animate={{ height: isAdvancedOpen ? 'auto' : '48px' }}
                transition={{ duration: 0.3 }}
              >
                <div 
                  className="p-3 flex justify-between items-center cursor-pointer"
                  onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                >
                  <h3 className="font-medium">Developer Options</h3>
                  <motion.div
                    animate={{ rotate: isAdvancedOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <FaChevronDown />
                  </motion.div>
                </div>
                
                {isAdvancedOpen && (
                  <div className="p-3 pt-0 space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-sm">Debug Mode</label>
                      <AnimatedToggle isOn={false} onToggle={() => {}} />
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <label className="text-sm">API Fallback</label>
                      <AnimatedToggle isOn={true} onToggle={() => {}} />
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <label className="text-sm">Custom Model</label>
                      <select className="text-sm p-1 bg-gray-600 border border-gray-500 rounded">
                        <option>Default</option>
                        <option>GPT-4</option>
                        <option>Claude 3</option>
                        <option>Custom...</option>
                      </select>
                    </div>
                  </div>
                )}
              </motion.div>
              
              <AnimatedCard className="bg-red-900/30 border border-red-800">
                <h3 className="font-medium text-red-400 mb-2">Danger Zone</h3>
                <div className="flex space-x-2">
                  <AnimatedButton className="bg-gray-700 hover:bg-gray-600 text-sm">
                    <FaEdit className="mr-1 inline-block" /> Reset to Default
                  </AnimatedButton>
                  <AnimatedButton className="bg-red-700 hover:bg-red-600 text-sm">
                    <FaTrash className="mr-1 inline-block" /> Delete Agent
                  </AnimatedButton>
                </div>
              </AnimatedCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default EnhancedAgentSettings;
