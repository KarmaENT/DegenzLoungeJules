import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  GlassCard, 
  GlassButton, 
  GlassInput, 
  GlassDropdown, 
  GlassTooltip, 
  GlassBadge, 
  GlassModal 
} from '../ui/GlassmorphismElements';

const GlassmorphismShowcase: React.FC = () => {
  const [searchValue, setSearchValue] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Background gradient for better glassmorphism effect demonstration
  const backgroundStyle = {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    minHeight: '100vh',
    padding: '2rem',
  };

  return (
    <div style={backgroundStyle} className="text-white">
      <h2 className="text-3xl font-bold mb-8">Glassmorphism UI Elements</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Glass Cards */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold mb-4">Glass Cards</h3>
          
          <GlassCard className="p-6">
            <h4 className="text-lg font-medium mb-2">Standard Glass Card</h4>
            <p className="text-white/80">
              Cards with frosted glass effect provide depth while maintaining transparency.
            </p>
          </GlassCard>
          
          <GlassCard className="p-6" opacity={0.3} blur={15}>
            <h4 className="text-lg font-medium mb-2">Higher Opacity Card</h4>
            <p className="text-white/80">
              Adjust opacity and blur to create different glass effects.
            </p>
          </GlassCard>
          
          <GlassCard className="p-6" border={false} blur={5}>
            <h4 className="text-lg font-medium mb-2">Borderless Card</h4>
            <p className="text-white/80">
              Remove borders for a cleaner look while maintaining the glass effect.
            </p>
          </GlassCard>
        </div>
        
        {/* Interactive Glass Elements */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold mb-4">Interactive Elements</h3>
          
          <GlassCard className="p-6">
            <h4 className="text-lg font-medium mb-4">Glass Buttons</h4>
            <div className="flex flex-wrap gap-3">
              <GlassButton variant="primary">Primary</GlassButton>
              <GlassButton variant="secondary">Secondary</GlassButton>
              <GlassButton variant="success">Success</GlassButton>
              <GlassButton variant="danger">Danger</GlassButton>
              <GlassButton variant="neutral" disabled>Disabled</GlassButton>
            </div>
          </GlassCard>
          
          <GlassCard className="p-6">
            <h4 className="text-lg font-medium mb-4">Glass Input & Dropdown</h4>
            <div className="space-y-4">
              <GlassInput 
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search..."
                className="w-full"
              />
              
              <div>
                <GlassButton 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full justify-between flex items-center"
                >
                  <span>Select an option</span>
                  <motion.span
                    animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    ▼
                  </motion.span>
                </GlassButton>
                
                <GlassDropdown isOpen={isDropdownOpen} className="mt-1">
                  <div className="p-2">
                    <div className="p-2 hover:bg-white/20 rounded cursor-pointer">Option 1</div>
                    <div className="p-2 hover:bg-white/20 rounded cursor-pointer">Option 2</div>
                    <div className="p-2 hover:bg-white/20 rounded cursor-pointer">Option 3</div>
                  </div>
                </GlassDropdown>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
      
      {/* Tooltips and Badges */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">Tooltips & Badges</h3>
        
        <GlassCard className="p-6">
          <div className="flex flex-wrap gap-6 items-center">
            <GlassTooltip content="This is a tooltip on top" position="top">
              <GlassButton>Hover Me (Top)</GlassButton>
            </GlassTooltip>
            
            <GlassTooltip content="This is a tooltip on bottom" position="bottom">
              <GlassButton variant="secondary">Hover Me (Bottom)</GlassButton>
            </GlassTooltip>
            
            <GlassTooltip content="This is a tooltip on left" position="left">
              <GlassButton variant="success">Hover Me (Left)</GlassButton>
            </GlassTooltip>
            
            <GlassTooltip content="This is a tooltip on right" position="right">
              <GlassButton variant="danger">Hover Me (Right)</GlassButton>
            </GlassTooltip>
          </div>
          
          <div className="mt-6 flex flex-wrap gap-3">
            <GlassBadge variant="primary">New</GlassBadge>
            <GlassBadge variant="secondary">Updated</GlassBadge>
            <GlassBadge variant="success">Completed</GlassBadge>
            <GlassBadge variant="danger">Alert</GlassBadge>
            <GlassBadge variant="neutral">Default</GlassBadge>
          </div>
        </GlassCard>
      </div>
      
      {/* Modal */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">Glass Modal</h3>
        
        <GlassCard className="p-6">
          <p className="mb-4">Click the button below to open a glass modal dialog</p>
          <GlassButton onClick={() => setIsModalOpen(true)}>Open Modal</GlassButton>
        </GlassCard>
        
        <GlassModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <div className="p-6">
            <h3 className="text-xl font-semibold mb-4">Glass Modal Dialog</h3>
            <p className="mb-6">
              This modal uses glassmorphism effects to create a frosted glass appearance
              while maintaining focus on the content.
            </p>
            <div className="flex justify-end gap-3">
              <GlassButton variant="neutral" onClick={() => setIsModalOpen(false)}>
                Cancel
              </GlassButton>
              <GlassButton onClick={() => setIsModalOpen(false)}>
                Confirm
              </GlassButton>
            </div>
          </div>
        </GlassModal>
      </div>
      
      {/* Application Example */}
      <div className="mt-12">
        <h3 className="text-2xl font-semibold mb-6">Application Example</h3>
        
        <GlassCard className="p-0 overflow-hidden">
          <div className="p-4 border-b border-white/10 flex justify-between items-center">
            <h4 className="font-medium">Agent Performance Dashboard</h4>
            <div className="flex gap-2">
              <GlassBadge variant="success">Live</GlassBadge>
              <GlassBadge variant="primary">Beta</GlassBadge>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <GlassCard className="p-4" opacity={0.15}>
                <div className="text-sm text-white/70">Total Agents</div>
                <div className="text-2xl font-bold">24</div>
              </GlassCard>
              
              <GlassCard className="p-4" opacity={0.15}>
                <div className="text-sm text-white/70">Active Sessions</div>
                <div className="text-2xl font-bold">12</div>
              </GlassCard>
              
              <GlassCard className="p-4" opacity={0.15}>
                <div className="text-sm text-white/70">Avg. Response Time</div>
                <div className="text-2xl font-bold">1.2s</div>
              </GlassCard>
            </div>
            
            <GlassCard className="p-4 mb-6" opacity={0.15}>
              <h5 className="font-medium mb-3">Recent Activity</h5>
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex justify-between items-center p-2 rounded hover:bg-white/10">
                    <div>Agent {i} completed task #{Math.floor(Math.random() * 1000)}</div>
                    <GlassBadge variant="secondary">{Math.floor(Math.random() * 60)}m ago</GlassBadge>
                  </div>
                ))}
              </div>
            </GlassCard>
            
            <div className="flex justify-end">
              <GlassButton>View Full Report</GlassButton>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default GlassmorphismShowcase;
