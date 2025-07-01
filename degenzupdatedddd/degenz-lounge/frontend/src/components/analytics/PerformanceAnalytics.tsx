import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line, Bar, Radar, Doughnut } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement, 
  RadialLinearScale, 
  ArcElement, 
  Title, 
  Tooltip, 
  Legend,
  Filler
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface PerformanceMetric {
  id: number;
  agent_id: number;
  session_id: number | null;
  metric_name: string;
  metric_value: number;
  metadata: Record<string, any>;
  timestamp: string;
}

interface AgentPerformanceSummary {
  agent_id: number;
  agent_name: string;
  total_metrics_count: number;
  time_period: string;
  metrics_by_name: Record<string, {
    count: number;
    sum: number;
    min: number;
    max: number;
    avg: number;
  }>;
  recent_metrics: PerformanceMetric[];
  trend_data: Record<string, {
    dates: string[];
    values: number[];
  }>;
}

interface PerformanceAnalyticsProps {
  agentId: number;
  agentName: string;
}

const PerformanceAnalytics: React.FC<PerformanceAnalyticsProps> = ({ agentId, agentName }) => {
  const [performanceSummary, setPerformanceSummary] = useState<AgentPerformanceSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [calculatingMetrics, setCalculatingMetrics] = useState<boolean>(false);

  useEffect(() => {
    const fetchPerformanceSummary = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await axios.get(`/api/metrics/summary/agent/${agentId}?time_period=${timeRange}`);
        setPerformanceSummary(response.data);
      } catch (err) {
        setError('Failed to load performance summary');
        console.error('Error fetching performance summary:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPerformanceSummary();
  }, [agentId, timeRange]);

  const calculateMetrics = async () => {
    try {
      setCalculatingMetrics(true);
      
      await axios.post('/api/metrics/calculate', {
        agent_id: agentId,
        session_id: null,
        metric_types: ['response_time', 'message_length', 'feedback_correlation', 'task_completion']
      });
      
      // Refresh the data
      const response = await axios.get(`/api/metrics/summary/agent/${agentId}?time_period=${timeRange}`);
      setPerformanceSummary(response.data);
      
    } catch (err) {
      setError('Failed to calculate metrics');
      console.error('Error calculating metrics:', err);
    } finally {
      setCalculatingMetrics(false);
    }
  };

  if (loading) {
    return <div className="p-4 text-center">Loading performance data...</div>;
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button 
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!performanceSummary || performanceSummary.total_metrics_count === 0) {
    return (
      <div className="p-4 text-center">
        <p className="mb-4">No performance data available for this agent yet.</p>
        <button 
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
          onClick={calculateMetrics}
          disabled={calculatingMetrics}
        >
          {calculatingMetrics ? 'Calculating...' : 'Calculate Performance Metrics'}
        </button>
        <p className="text-sm text-gray-400 mt-2">
          This will analyze the agent's past interactions and generate performance metrics.
        </p>
      </div>
    );
  }

  // Prepare data for response time trend chart
  const responseTimeTrendData = performanceSummary.trend_data['response_time'] ? {
    labels: performanceSummary.trend_data['response_time'].dates,
    datasets: [
      {
        label: 'Response Time (seconds)',
        data: performanceSummary.trend_data['response_time'].values,
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: true,
        tension: 0.4,
      },
    ],
  } : null;

  // Prepare data for message length trend chart
  const messageLengthTrendData = performanceSummary.trend_data['message_length'] ? {
    labels: performanceSummary.trend_data['message_length'].dates,
    datasets: [
      {
        label: 'Message Length (characters)',
        data: performanceSummary.trend_data['message_length'].values,
        borderColor: 'rgba(54, 162, 235, 1)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        fill: true,
        tension: 0.4,
      },
    ],
  } : null;

  // Prepare data for metrics comparison chart
  const metricNames = Object.keys(performanceSummary.metrics_by_name);
  const metricAverages = metricNames.map(name => performanceSummary.metrics_by_name[name].avg);
  
  const metricsComparisonData = {
    labels: metricNames.map(name => name.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')),
    datasets: [
      {
        label: 'Average Value',
        data: metricAverages,
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">{agentName} Performance Analytics</h2>
        <div className="flex space-x-2">
          <select 
            className="bg-gray-700 text-white rounded px-3 py-1"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option value="all">All Time</option>
            <option value="month">Last Month</option>
            <option value="week">Last Week</option>
            <option value="day">Last 24 Hours</option>
          </select>
          <button 
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-1 px-3 rounded"
            onClick={calculateMetrics}
            disabled={calculatingMetrics}
          >
            {calculatingMetrics ? 'Calculating...' : 'Recalculate'}
          </button>
        </div>
      </div>
      
      <div className="mb-4">
        <div className="flex border-b border-gray-700">
          <button 
            className={`py-2 px-4 font-medium ${activeTab === 'overview' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={`py-2 px-4 font-medium ${activeTab === 'response_time' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}`}
            onClick={() => setActiveTab('response_time')}
          >
            Response Time
          </button>
          <button 
            className={`py-2 px-4 font-medium ${activeTab === 'message_length' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}`}
            onClick={() => setActiveTab('message_length')}
          >
            Message Length
          </button>
          <button 
            className={`py-2 px-4 font-medium ${activeTab === 'correlations' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}`}
            onClick={() => setActiveTab('correlations')}
          >
            Correlations
          </button>
        </div>
      </div>
      
      {activeTab === 'overview' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-700 rounded-lg p-4 flex flex-col items-center justify-center">
              <div className="text-3xl font-bold text-blue-400">
                {performanceSummary.total_metrics_count}
              </div>
              <div className="text-sm text-gray-300">Total Metrics</div>
            </div>
            
            {performanceSummary.metrics_by_name['response_time'] && (
              <div className="bg-gray-700 rounded-lg p-4 flex flex-col items-center justify-center">
                <div className="text-3xl font-bold text-green-400">
                  {performanceSummary.metrics_by_name['response_time'].avg.toFixed(2)}s
                </div>
                <div className="text-sm text-gray-300">Average Response Time</div>
              </div>
            )}
            
            {performanceSummary.metrics_by_name['task_completion_rate'] && (
              <div className="bg-gray-700 rounded-lg p-4 flex flex-col items-center justify-center">
                <div className="text-3xl font-bold text-yellow-400">
                  {(performanceSummary.metrics_by_name['task_completion_rate'].avg * 100).toFixed(0)}%
                </div>
                <div className="text-sm text-gray-300">Task Completion Rate</div>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3">Metrics Comparison</h3>
              <div className="h-64">
                <Bar 
                  data={metricsComparisonData} 
                  options={{
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          color: 'rgba(255, 255, 255, 0.7)',
                        },
                        grid: {
                          color: 'rgba(255, 255, 255, 0.1)',
                        },
                      },
                      x: {
                        ticks: {
                          color: 'rgba(255, 255, 255, 0.7)',
                        },
                        grid: {
                          color: 'rgba(255, 255, 255, 0.1)',
                        },
                      },
                    },
                    plugins: {
                      legend: {
                        display: false,
                      },
                      tooltip: {
                        callbacks: {
                          label: function(context) {
                            const label = context.dataset.label || '';
                            const value = context.parsed.y;
                            return `${label}: ${value.toFixed(2)}`;
                          }
                        }
                      }
                    },
                    maintainAspectRatio: false,
                  }}
                />
              </div>
            </div>
            
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3">Recent Metrics</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {performanceSummary.recent_metrics.map(metric => (
                  <div key={metric.id} className="bg-gray-800 p-3 rounded">
                    <div className="flex justify-between items-start">
                      <div className="text-sm font-medium">
                        {metric.metric_name.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </div>
                      <div className="text-sm font-bold">
                        {metric.metric_value.toFixed(2)}
                        {metric.metric_name === 'response_time' && 's'}
                        {metric.metric_name === 'task_completion_rate' && '%'}
                      </div>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {new Date(metric.timestamp).toLocaleString()}
                    </div>
                    {metric.metadata && (
                      <div className="text-xs text-gray-400 mt-1">
                        {Object.entries(metric.metadata).map(([key, value]) => (
                          <span key={key} className="mr-2">
                            {key}: {typeof value === 'number' ? value.toFixed(2) : value}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
      
      {activeTab === 'response_time' && responseTimeTrendData && (
        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3">Response Time Trend</h3>
          <div className="h-80">
            <Line 
              data={responseTimeTrendData} 
              options={{
                scales: {
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: 'Response Time (seconds)',
                      color: 'rgba(255, 255, 255, 0.7)',
                    },
                    ticks: {
                      color: 'rgba(255, 255, 255, 0.7)',
                    },
                    grid: {
                      color: 'rgba(255, 255, 255, 0.1)',
                    },
                  },
                  x: {
                    title: {
                      display: true,
                      text: 'Date',
                      color: 'rgba(255, 255, 255, 0.7)',
                    },
                    ticks: {
                      color: 'rgba(255, 255, 255, 0.7)',
                    },
                    grid: {
                      color: 'rgba(255, 255, 255, 0.1)',
                    },
                  },
                },
                plugins: {
                  legend: {
                    labels: {
                      color: 'rgba(255, 255, 255, 0.7)',
                    },
                  },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        const label = context.dataset.label || '';
                        const value = context.parsed.y;
                        return `${label}: ${value.toFixed(2)}s`;
                      }
                    }
                  }
                },
                maintainAspectRatio: false,
              }}
            />
          </div>
          
          {performanceSummary.metrics_by_name['response_time'] && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
              <div className="bg-gray-800 p-3 rounded text-center">
                <div className="text-sm text-gray-400">Average</div>
                <div className="text-xl font-bold text-white">
                  {performanceSummary.metrics_by_name['response_time'].avg.toFixed(2)}s
                </div>
              </div>
              <div className="bg-gray-800 p-3 rounded text-center">
                <div className="text-sm text-gray-400">Minimum</div>
                <div className="text-xl font-bold text-green-400">
                  {performanceSummary.metrics_by_name['response_time'].min.toFixed(2)}s
                </div>
              </div>
              <div className="bg-gray-800 p-3 rounded text-center">
                <div className="text-sm text-gray-400">Maximum</div>
                <div className="text-xl font-bold text-red-400">
                  {performanceSummary.metrics_by_name['response_time'].max.toFixed(2)}s
                </div>
              </div>
              <div className="bg-gray-800 p-3 rounded text-center">
                <div className="text-sm text-gray-400">Samples</div>
                <div className="text-xl font-bold text-blue-400">
                  {performanceSummary.metrics_by_name['response_time'].count}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
      {activeTab === 'message_length' && messageLengthTrendData && (
        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3">Message Length Trend</h3>
          <div className="h-80">
            <Line 
              data={messageLengthTrendData} 
              options={{
                scales: {
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: 'Message Length (characters)',
                      color: 'rgba(255, 255, 255, 0.7)',
                    },
                    ticks: {
                      color: 'rgba(255, 255, 255, 0.7)',
                    },
                    grid: {
                      color: 'rgba(255, 255, 255, 0.1)',
                    },
                  },
                  x: {
                    title: {
                      display: true,
                      text: 'Date',
                      color: 'rgba(255, 255, 255, 0.7)',
                    },
                    ticks: {
                      color: 'rgba(255, 255, 255, 0.7)',
                    },
                    grid: {
                      color: 'rgba(255, 255, 255, 0.1)',
                    },
                  },
                },
                plugins: {
                  legend: {
                    labels: {
                      color: 'rgba(255, 255, 255, 0.7)',
                    },
                  },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        const label = context.dataset.label || '';
                        const value = context.parsed.y;
                        return `${label}: ${value.toFixed(0)} chars`;
                      }
                    }
                  }
                },
                maintainAspectRatio: false,
              }}
            />
          </div>
          
          {performanceSummary.metrics_by_name['message_length'] && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
              <div className="bg-gray-800 p-3 rounded text-center">
                <div className="text-sm text-gray-400">Average</div>
                <div className="text-xl font-bold text-white">
                  {performanceSummary.metrics_by_name['message_length'].avg.toFixed(0)} chars
                </div>
              </div>
              <div className="bg-gray-800 p-3 rounded text-center">
                <div className="text-sm text-gray-400">Minimum</div>
                <div className="text-xl font-bold text-yellow-400">
                  {performanceSummary.metrics_by_name['message_length'].min.toFixed(0)} chars
                </div>
              </div>
              <div className="bg-gray-800 p-3 rounded text-center">
                <div className="text-sm text-gray-400">Maximum</div>
                <div className="text-xl font-bold text-blue-400">
                  {performanceSummary.metrics_by_name['message_length'].max.toFixed(0)} chars
                </div>
              </div>
              <div className="bg-gray-800 p-3 rounded text-center">
                <div className="text-sm text-gray-400">Samples</div>
                <div className="text-xl font-bold text-blue-400">
                  {performanceSummary.metrics_by_name['message_length'].count}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
      {activeTab === 'correlations' && (
        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3">Performance Correlations</h3>
          
          {performanceSummary.metrics_by_name['length_rating_correlation'] ? (
            <>
              <div className="mb-4">
                <h4 className="text-md font-medium mb-2">Message Length vs. User Rating</h4>
                <div className="bg-gray-800 p-4 rounded">
                  <div className="flex items-center justify-between">
                    <div className="text-sm">
                      Correlation Coefficient: 
                      <span className={`ml-2 font-bold ${
                        performanceSummary.metrics_by_name['length_rating_correlation'].avg > 0.5 ? 'text-green-400' :
                        performanceSummary.metrics_by_name['length_rating_correlation'].avg < -0.5 ? 'text-red-400' :
                        'text-yellow-400'
                      }`}>
                        {performanceSummary.metrics_by_name['length_rating_correlation'].avg.toFixed(2)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400">
                      Based on {performanceSummary.metrics_by_name['length_rating_correlation'].count} samples
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <div className="text-sm mb-1">Interpretation:</div>
                    <div className="text-sm text-gray-300">
                      {performanceSummary.metrics_by_name['length_rating_correlation'].avg > 0.7 ? (
                        'Strong positive correlation: Longer messages tend to receive higher ratings.'
                      ) : performanceSummary.metrics_by_name['length_rating_correlation'].avg > 0.3 ? (
                        'Moderate positive correlation: Longer messages somewhat tend to receive higher ratings.'
                      ) : performanceSummary.metrics_by_name['length_rating_correlation'].avg > -0.3 ? (
                        'Weak or no correlation: Message length does not significantly affect ratings.'
                      ) : performanceSummary.metrics_by_name['length_rating_correlation'].avg > -0.7 ? (
                        'Moderate negative correlation: Shorter messages somewhat tend to receive higher ratings.'
                      ) : (
                        'Strong negative correlation: Shorter messages tend to receive higher ratings.'
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mb-4">
                <h4 className="text-md font-medium mb-2">Response Time vs. Task Completion</h4>
                {performanceSummary.metrics_by_name['response_time'] && performanceSummary.metrics_by_name['task_completion_rate'] ? (
                  <div className="bg-gray-800 p-4 rounded">
                    <div className="text-sm mb-3">
                      Average response time: <span className="font-bold">{performanceSummary.metrics_by_name['response_time'].avg.toFixed(2)}s</span>
                      <span className="mx-2">|</span>
                      Task completion rate: <span className="font-bold">{(performanceSummary.metrics_by_name['task_completion_rate'].avg * 100).toFixed(0)}%</span>
                    </div>
                    
                    <div className="text-sm text-gray-300">
                      {performanceSummary.metrics_by_name['response_time'].avg < 2 && performanceSummary.metrics_by_name['task_completion_rate'].avg > 0.8 ? (
                        'Excellent performance: Fast response times with high task completion rate.'
                      ) : performanceSummary.metrics_by_name['response_time'].avg < 5 && performanceSummary.metrics_by_name['task_completion_rate'].avg > 0.6 ? (
                        'Good performance: Reasonable response times with good task completion rate.'
                      ) : performanceSummary.metrics_by_name['response_time'].avg > 10 && performanceSummary.metrics_by_name['task_completion_rate'].avg < 0.5 ? (
                        'Poor performance: Slow response times with low task completion rate.'
                      ) : performanceSummary.metrics_by_name['response_time'].avg < 5 && performanceSummary.metrics_by_name['task_completion_rate'].avg < 0.5 ? (
                        'Mixed performance: Fast response times but low task completion rate.'
                      ) : performanceSummary.metrics_by_name['response_time'].avg > 10 && performanceSummary.metrics_by_name['task_completion_rate'].avg > 0.8 ? (
                        'Mixed performance: Slow response times but high task completion rate.'
                      ) : (
                        'Average performance: Moderate response times and task completion rate.'
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-400">
                    Insufficient data to analyze correlation between response time and task completion.
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400 mb-4">No correlation data available yet.</p>
              <button 
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
                onClick={calculateMetrics}
                disabled={calculatingMetrics}
              >
                {calculatingMetrics ? 'Calculating...' : 'Calculate Correlations'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PerformanceAnalytics;
