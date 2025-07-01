import React, { useState, useEffect } from 'react';
import { Tabs, Tab } from '../common/Tabs';
import FeedbackComponent from '../feedback/FeedbackComponent';
import AgentFeedbackDashboard from '../feedback/AgentFeedbackDashboard';
import PerformanceAnalytics from '../analytics/PerformanceAnalytics';
import AgentMetricsControlPanel from '../analytics/AgentMetricsControlPanel';
import AgentImprovementSuggestions from '../improvement/AgentImprovementSuggestions';
import AgentFineTuning from '../tuning/AgentFineTuning';
import ABTesting from '../testing/ABTesting';

interface AgentLearningProps {
  agentId: number;
  agentName: string;
}

const AgentLearning: React.FC<AgentLearningProps> = ({ agentId, agentName }) => {
  const [activeTab, setActiveTab] = useState<string>('feedback');
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="bg-gray-900 rounded-lg p-4">
      <h2 className="text-2xl font-bold mb-4">Agent Learning & Improvement</h2>
      
      <Tabs activeTab={activeTab} onChange={setActiveTab}>
        <Tab id="feedback" label="Feedback">
          <div className="mt-4 space-y-6">
            <AgentFeedbackDashboard 
              agentId={agentId} 
              agentName={agentName}
              key={`feedback-dashboard-${refreshTrigger}`}
            />
            <FeedbackComponent 
              agentId={agentId} 
              onFeedbackSubmitted={handleRefresh}
            />
          </div>
        </Tab>
        
        <Tab id="performance" label="Performance">
          <div className="mt-4 space-y-6">
            <PerformanceAnalytics 
              agentId={agentId} 
              agentName={agentName}
              key={`performance-${refreshTrigger}`}
            />
            <AgentMetricsControlPanel 
              agentId={agentId} 
              agentName={agentName}
              onMetricsCalculated={handleRefresh}
            />
          </div>
        </Tab>
        
        <Tab id="suggestions" label="Improvement Suggestions">
          <div className="mt-4">
            <AgentImprovementSuggestions 
              agentId={agentId} 
              agentName={agentName}
              onSuggestionImplemented={handleRefresh}
              key={`suggestions-${refreshTrigger}`}
            />
          </div>
        </Tab>
        
        <Tab id="tuning" label="Fine-Tuning">
          <div className="mt-4">
            <AgentFineTuning 
              agentId={agentId} 
              agentName={agentName}
              onVersionCreated={handleRefresh}
              key={`tuning-${refreshTrigger}`}
            />
          </div>
        </Tab>
        
        <Tab id="testing" label="A/B Testing">
          <div className="mt-4">
            <ABTesting 
              agentId={agentId} 
              agentName={agentName}
              key={`testing-${refreshTrigger}`}
            />
          </div>
        </Tab>
      </Tabs>
    </div>
  );
};

export default AgentLearning;
