import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaChartLine, FaChartBar, FaChartPie, FaChartArea } from 'react-icons/fa';

interface AgentMetricsControlPanelProps {
  agentId: number;
  agentName: string;
  onMetricsCalculated?: () => void;
}

const AgentMetricsControlPanel: React.FC<AgentMetricsControlPanelProps> = ({ 
  agentId, 
  agentName,
  onMetricsCalculated 
}) => {
  const [sessions, setSessions] = useState<Array<{id: number, name: string}>>([]);
  const [selectedSession, setSelectedSession] = useState<number | null>(null);
  const [metricTypes, setMetricTypes] = useState<string[]>([
    'response_time',
    'message_length',
    'feedback_correlation',
    'task_completion'
  ]);
  const [calculating, setCalculating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await axios.get(`/api/sessions/?agent_id=${agentId}`);
        setSessions(response.data);
      } catch (err) {
        console.error('Error fetching sessions:', err);
      }
    };

    fetchSessions();
  }, [agentId]);

  const handleMetricTypeChange = (metricType: string) => {
    if (metricTypes.includes(metricType)) {
      setMetricTypes(metricTypes.filter(type => type !== metricType));
    } else {
      setMetricTypes([...metricTypes, metricType]);
    }
  };

  const calculateMetrics = async () => {
    try {
      setCalculating(true);
      setError(null);
      setSuccess(null);
      
      await axios.post('/api/metrics/calculate', {
        agent_id: agentId,
        session_id: selectedSession,
        metric_types: metricTypes
      });
      
      setSuccess('Metrics calculated successfully!');
      
      if (onMetricsCalculated) {
        onMetricsCalculated();
      }
    } catch (err) {
      setError('Failed to calculate metrics. Please try again.');
      console.error('Error calculating metrics:', err);
    } finally {
      setCalculating(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 mb-4">
      <h3 className="text-lg font-semibold mb-3 flex items-center">
        <FaChartLine className="mr-2" />
        Metrics Control Panel
      </h3>
      
      {error && (
        <div className="bg-red-900 text-white p-3 rounded mb-3 text-sm">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-900 text-white p-3 rounded mb-3 text-sm">
          {success}
        </div>
      )}
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Session (optional)</label>
        <select
          className="w-full bg-gray-700 text-white rounded px-3 py-2"
          value={selectedSession || ''}
          onChange={(e) => setSelectedSession(e.target.value ? parseInt(e.target.value) : null)}
        >
          <option value="">All Sessions</option>
          {sessions.map(session => (
            <option key={session.id} value={session.id}>
              {session.name}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-400 mt-1">
          Select a specific session or calculate metrics across all sessions.
        </p>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Metric Types</label>
        <div className="space-y-2">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="response_time"
              checked={metricTypes.includes('response_time')}
              onChange={() => handleMetricTypeChange('response_time')}
              className="mr-2"
            />
            <label htmlFor="response_time" className="text-sm">
              Response Time
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="message_length"
              checked={metricTypes.includes('message_length')}
              onChange={() => handleMetricTypeChange('message_length')}
              className="mr-2"
            />
            <label htmlFor="message_length" className="text-sm">
              Message Length
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="feedback_correlation"
              checked={metricTypes.includes('feedback_correlation')}
              onChange={() => handleMetricTypeChange('feedback_correlation')}
              className="mr-2"
            />
            <label htmlFor="feedback_correlation" className="text-sm">
              Feedback Correlation
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="task_completion"
              checked={metricTypes.includes('task_completion')}
              onChange={() => handleMetricTypeChange('task_completion')}
              className="mr-2"
            />
            <label htmlFor="task_completion" className="text-sm">
              Task Completion
            </label>
          </div>
        </div>
      </div>
      
      <button
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
        onClick={calculateMetrics}
        disabled={calculating || metricTypes.length === 0}
      >
        {calculating ? 'Calculating...' : 'Calculate Metrics'}
      </button>
      
      <p className="text-xs text-gray-400 mt-2 text-center">
        This will analyze {agentName}'s interactions and generate performance metrics.
      </p>
    </div>
  );
};

export default AgentMetricsControlPanel;
