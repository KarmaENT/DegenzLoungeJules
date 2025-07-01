import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  WaveBackground, 
  BrainNetworkIllustration, 
  ChatBubbleIllustration, 
  WorkflowIllustration, 
  AgentCollaborationIllustration, 
  LearningIllustration 
} from '../ui/CustomIllustrations';
import { GlassCard, GlassButton } from '../ui/GlassmorphismElements';

const IllustrationsShowcase: React.FC = () => {
  const [activeIllustration, setActiveIllustration] = useState<string>('wave');
  
  // Background gradient for better illustration display
  const backgroundStyle = {
    background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
    minHeight: '100vh',
    padding: '2rem',
  };

  return (
    <div style={backgroundStyle} className="text-white">
      <h2 className="text-3xl font-bold mb-8">Custom Illustrations</h2>
      
      <div className="flex flex-wrap gap-3 mb-8">
        <GlassButton 
          variant={activeIllustration === 'wave' ? 'primary' : 'neutral'}
          onClick={() => setActiveIllustration('wave')}
        >
          Wave Background
        </GlassButton>
        <GlassButton 
          variant={activeIllustration === 'brain' ? 'primary' : 'neutral'}
          onClick={() => setActiveIllustration('brain')}
        >
          Brain Network
        </GlassButton>
        <GlassButton 
          variant={activeIllustration === 'chat' ? 'primary' : 'neutral'}
          onClick={() => setActiveIllustration('chat')}
        >
          Chat Bubbles
        </GlassButton>
        <GlassButton 
          variant={activeIllustration === 'workflow' ? 'primary' : 'neutral'}
          onClick={() => setActiveIllustration('workflow')}
        >
          Workflow
        </GlassButton>
        <GlassButton 
          variant={activeIllustration === 'collaboration' ? 'primary' : 'neutral'}
          onClick={() => setActiveIllustration('collaboration')}
        >
          Agent Collaboration
        </GlassButton>
        <GlassButton 
          variant={activeIllustration === 'learning' ? 'primary' : 'neutral'}
          onClick={() => setActiveIllustration('learning')}
        >
          Learning & Improvement
        </GlassButton>
      </div>
      
      <GlassCard className="p-6 relative overflow-hidden min-h-[400px]">
        <div className="absolute inset-0 opacity-20">
          <WaveBackground 
            primaryColor="#3b82f6" 
            secondaryColor="#8b5cf6" 
          />
        </div>
        
        <div className="relative z-10">
          <motion.div
            key={activeIllustration}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center"
          >
            {activeIllustration === 'wave' && (
              <>
                <h3 className="text-2xl font-semibold mb-4 text-center">Wave Background Illustration</h3>
                <p className="text-center max-w-2xl mb-8">
                  Animated wave backgrounds create a dynamic, flowing aesthetic that adds depth and movement to any interface.
                  These illustrations can be customized with different colors and animation speeds.
                </p>
                <div className="w-full max-w-2xl h-64 rounded-lg overflow-hidden">
                  <WaveBackground 
                    primaryColor="#3b82f6" 
                    secondaryColor="#8b5cf6" 
                    animate={true}
                  />
                </div>
              </>
            )}
            
            {activeIllustration === 'brain' && (
              <>
                <h3 className="text-2xl font-semibold mb-4 text-center">Brain Network Illustration</h3>
                <p className="text-center max-w-2xl mb-8">
                  This neural network visualization represents AI and machine learning concepts with animated nodes and connections.
                  Perfect for sections related to agent intelligence and learning capabilities.
                </p>
                <div className="w-full max-w-2xl h-64">
                  <BrainNetworkIllustration 
                    primaryColor="#3b82f6" 
                    secondaryColor="#8b5cf6" 
                    animate={true}
                  />
                </div>
              </>
            )}
            
            {activeIllustration === 'chat' && (
              <>
                <h3 className="text-2xl font-semibold mb-4 text-center">Chat Bubble Illustration</h3>
                <p className="text-center max-w-2xl mb-8">
                  Animated chat bubbles visualize conversation flows between users and agents.
                  These illustrations enhance messaging interfaces and conversation examples.
                </p>
                <div className="w-full max-w-2xl h-64">
                  <ChatBubbleIllustration 
                    userColor="#3b82f6" 
                    agentColor="#8b5cf6" 
                    animate={true}
                  />
                </div>
              </>
            )}
            
            {activeIllustration === 'workflow' && (
              <>
                <h3 className="text-2xl font-semibold mb-4 text-center">Workflow Illustration</h3>
                <p className="text-center max-w-2xl mb-8">
                  This animated workflow diagram visualizes process flows with connected nodes.
                  Ideal for explaining agent workflows, task assignments, and process automation.
                </p>
                <div className="w-full max-w-2xl h-64">
                  <WorkflowIllustration 
                    primaryColor="#3b82f6" 
                    secondaryColor="#8b5cf6" 
                    accentColor="#ef4444" 
                    animate={true}
                  />
                </div>
              </>
            )}
            
            {activeIllustration === 'collaboration' && (
              <>
                <h3 className="text-2xl font-semibold mb-4 text-center">Agent Collaboration Illustration</h3>
                <p className="text-center max-w-2xl mb-8">
                  This visualization shows how multiple agents collaborate through a central hub.
                  The animated data packets demonstrate information flow between specialized agents.
                </p>
                <div className="w-full max-w-2xl h-64">
                  <AgentCollaborationIllustration 
                    agentColors={["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6"]} 
                    animate={true}
                  />
                </div>
              </>
            )}
            
            {activeIllustration === 'learning' && (
              <>
                <h3 className="text-2xl font-semibold mb-4 text-center">Learning & Improvement Illustration</h3>
                <p className="text-center max-w-2xl mb-8">
                  This graph visualization shows performance improvement over time with key milestones.
                  Perfect for analytics dashboards and agent performance tracking.
                </p>
                <div className="w-full max-w-2xl h-64">
                  <LearningIllustration 
                    primaryColor="#3b82f6" 
                    secondaryColor="#10b981" 
                    animate={true}
                  />
                </div>
              </>
            )}
          </motion.div>
        </div>
      </GlassCard>
      
      <div className="mt-12">
        <h3 className="text-2xl font-semibold mb-6">Application Examples</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <GlassCard className="p-6 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <BrainNetworkIllustration 
                primaryColor="#3b82f6" 
                secondaryColor="#8b5cf6" 
                animate={true}
              />
            </div>
            <div className="relative z-10">
              <h4 className="text-xl font-medium mb-4">Agent Intelligence Dashboard</h4>
              <p className="mb-4">
                Monitor and analyze agent learning progress and performance metrics.
                Track improvements over time and identify optimization opportunities.
              </p>
              <GlassButton>View Dashboard</GlassButton>
            </div>
          </GlassCard>
          
          <GlassCard className="p-6 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <WorkflowIllustration 
                primaryColor="#10b981" 
                secondaryColor="#3b82f6" 
                accentColor="#f59e0b" 
                animate={true}
              />
            </div>
            <div className="relative z-10">
              <h4 className="text-xl font-medium mb-4">Workflow Builder</h4>
              <p className="mb-4">
                Create custom agent workflows for complex tasks with our visual editor.
                Define process steps, decision points, and agent assignments.
              </p>
              <GlassButton>Create Workflow</GlassButton>
            </div>
          </GlassCard>
          
          <GlassCard className="p-6 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <AgentCollaborationIllustration 
                agentColors={["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6"]} 
                animate={true}
              />
            </div>
            <div className="relative z-10">
              <h4 className="text-xl font-medium mb-4">Team Management</h4>
              <p className="mb-4">
                Organize agents into specialized teams with defined roles and responsibilities.
                Manage hierarchical structures and communication patterns.
              </p>
              <GlassButton>Manage Teams</GlassButton>
            </div>
          </GlassCard>
          
          <GlassCard className="p-6 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <ChatBubbleIllustration 
                userColor="#3b82f6" 
                agentColor="#8b5cf6" 
                animate={true}
              />
            </div>
            <div className="relative z-10">
              <h4 className="text-xl font-medium mb-4">Conversation Analytics</h4>
              <p className="mb-4">
                Analyze agent-user conversations to identify patterns and improvement areas.
                Track sentiment, response quality, and user satisfaction metrics.
              </p>
              <GlassButton>View Analytics</GlassButton>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default IllustrationsShowcase;
