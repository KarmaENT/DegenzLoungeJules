import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Scene3D, AgentAvatar3D, Button3D, Card3D, Spinner3D } from '../ui/ThreeDElements';

const ThreeDShowcase: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleLoadingDemo = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 3000);
  };

  return (
    <div className="bg-gray-900 text-white p-6 rounded-lg">
      <h2 className="text-2xl font-bold mb-6">3D Design Elements</h2>
      
      <div className="space-y-8">
        {/* 3D Scene */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-3">3D Logo Scene</h3>
          <p className="text-gray-400 mb-4">Interactive 3D scene with logo and animated elements</p>
          <Scene3D height="350px" logoText="DeGeNz" />
        </div>
        
        {/* 3D Avatars */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-3">3D Agent Avatars</h3>
          <p className="text-gray-400 mb-4">Personalized 3D avatars for agents</p>
          <div className="flex flex-wrap gap-4">
            <div className="text-center">
              <AgentAvatar3D letter="R" color="#ef4444" size="80px" />
              <p className="mt-2">Researcher</p>
            </div>
            <div className="text-center">
              <AgentAvatar3D letter="W" color="#10b981" size="80px" />
              <p className="mt-2">Writer</p>
            </div>
            <div className="text-center">
              <AgentAvatar3D letter="D" color="#3b82f6" size="80px" />
              <p className="mt-2">Designer</p>
            </div>
            <div className="text-center">
              <AgentAvatar3D letter="A" color="#8b5cf6" size="80px" />
              <p className="mt-2">Analyst</p>
            </div>
          </div>
        </div>
        
        {/* 3D Buttons */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-3">3D Buttons</h3>
          <p className="text-gray-400 mb-4">Interactive buttons with 3D effects</p>
          <div className="flex flex-wrap gap-4">
            <Button3D color="#3b82f6" hoverColor="#2563eb">
              Primary Action
            </Button3D>
            <Button3D color="#10b981" hoverColor="#059669">
              Success
            </Button3D>
            <Button3D color="#ef4444" hoverColor="#dc2626">
              Danger
            </Button3D>
            <Button3D color="#6b7280" hoverColor="#4b5563" disabled>
              Disabled
            </Button3D>
          </div>
        </div>
        
        {/* 3D Cards */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-3">3D Cards</h3>
          <p className="text-gray-400 mb-4">Content cards with depth and dimension</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card3D color="#1e3a8a" className="h-48">
              <h4 className="text-lg font-semibold">Agent Performance</h4>
              <p className="text-gray-300 mt-2">Track and analyze agent metrics over time</p>
            </Card3D>
            <Card3D color="#065f46" className="h-48">
              <h4 className="text-lg font-semibold">Workflow Builder</h4>
              <p className="text-gray-300 mt-2">Create custom agent workflows for complex tasks</p>
            </Card3D>
          </div>
        </div>
        
        {/* 3D Loading Spinner */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-3">3D Loading Indicator</h3>
          <p className="text-gray-400 mb-4">Animated 3D spinner for loading states</p>
          <div className="flex items-center gap-6">
            <Spinner3D size="80px" color="#3b82f6" />
            <div>
              <Button3D onClick={handleLoadingDemo}>
                {isLoading ? "Loading..." : "Trigger Loading Demo"}
              </Button3D>
              {isLoading && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-gray-400 mt-2"
                >
                  Processing request...
                </motion.p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThreeDShowcase;
