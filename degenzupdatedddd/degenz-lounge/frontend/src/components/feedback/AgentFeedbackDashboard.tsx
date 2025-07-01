import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line, Bar, Radar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, RadialLinearScale, ArcElement, Title, Tooltip, Legend } from 'chart.js';

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
  Legend
);

interface FeedbackSummary {
  agent_id: number;
  total_feedback_count: number;
  average_rating: number | null;
  positive_feedback_percentage: number | null;
  feedback_by_category: Record<string, number>;
  recent_comments: Array<{
    id: number;
    comment: string;
    created_at: string;
    rating?: number;
    is_positive?: boolean;
    category: string;
  }>;
}

interface AgentFeedbackDashboardProps {
  agentId: number;
  agentName: string;
}

const AgentFeedbackDashboard: React.FC<AgentFeedbackDashboardProps> = ({ agentId, agentName }) => {
  const [feedbackSummary, setFeedbackSummary] = useState<FeedbackSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<string>('all');

  useEffect(() => {
    const fetchFeedbackSummary = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await axios.get(`/api/feedback/summary/agent/${agentId}`);
        setFeedbackSummary(response.data);
      } catch (err) {
        setError('Failed to load feedback summary');
        console.error('Error fetching feedback summary:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFeedbackSummary();
  }, [agentId, timeRange]);

  if (loading) {
    return <div className="p-4 text-center">Loading feedback data...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }

  if (!feedbackSummary || feedbackSummary.total_feedback_count === 0) {
    return (
      <div className="p-4 text-center">
        <p>No feedback data available for this agent yet.</p>
        <p className="text-sm text-gray-400 mt-2">Feedback will appear here once users start rating responses.</p>
      </div>
    );
  }

  // Prepare data for category radar chart
  const categoryData = {
    labels: Object.keys(feedbackSummary.feedback_by_category).map(key => 
      key.charAt(0).toUpperCase() + key.slice(1)
    ),
    datasets: [
      {
        label: 'Rating by Category',
        data: Object.values(feedbackSummary.feedback_by_category),
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Prepare data for positive/negative pie chart
  const sentimentData = {
    labels: ['Positive', 'Negative'],
    datasets: [
      {
        data: [
          feedbackSummary.positive_feedback_percentage || 0,
          100 - (feedbackSummary.positive_feedback_percentage || 0)
        ],
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 99, 132, 0.6)',
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">{agentName} Feedback Dashboard</h2>
        <div>
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
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-700 rounded-lg p-4 flex flex-col items-center justify-center">
          <div className="text-3xl font-bold text-blue-400">
            {feedbackSummary.total_feedback_count}
          </div>
          <div className="text-sm text-gray-300">Total Feedback</div>
        </div>
        
        <div className="bg-gray-700 rounded-lg p-4 flex flex-col items-center justify-center">
          <div className="text-3xl font-bold text-yellow-400">
            {feedbackSummary.average_rating ? feedbackSummary.average_rating.toFixed(1) : 'N/A'}
          </div>
          <div className="text-sm text-gray-300">Average Rating</div>
        </div>
        
        <div className="bg-gray-700 rounded-lg p-4 flex flex-col items-center justify-center">
          <div className="text-3xl font-bold text-green-400">
            {feedbackSummary.positive_feedback_percentage 
              ? `${feedbackSummary.positive_feedback_percentage.toFixed(0)}%` 
              : 'N/A'}
          </div>
          <div className="text-sm text-gray-300">Positive Feedback</div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3">Ratings by Category</h3>
          <div className="h-64">
            <Radar 
              data={categoryData} 
              options={{
                scales: {
                  r: {
                    min: 0,
                    max: 5,
                    ticks: {
                      stepSize: 1,
                      showLabelBackdrop: false,
                      color: 'rgba(255, 255, 255, 0.7)',
                    },
                    pointLabels: {
                      color: 'rgba(255, 255, 255, 0.7)',
                    },
                    grid: {
                      color: 'rgba(255, 255, 255, 0.2)',
                    },
                    angleLines: {
                      color: 'rgba(255, 255, 255, 0.2)',
                    },
                  },
                },
                plugins: {
                  legend: {
                    labels: {
                      color: 'rgba(255, 255, 255, 0.7)',
                    },
                  },
                },
                maintainAspectRatio: false,
              }}
            />
          </div>
        </div>
        
        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3">Feedback Sentiment</h3>
          <div className="h-64 flex items-center justify-center">
            {feedbackSummary.positive_feedback_percentage !== null ? (
              <Pie 
                data={sentimentData} 
                options={{
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: {
                        color: 'rgba(255, 255, 255, 0.7)',
                      },
                    },
                  },
                  maintainAspectRatio: false,
                }}
              />
            ) : (
              <div className="text-center text-gray-400">
                No thumbs up/down feedback available
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="bg-gray-700 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-3">Recent Comments</h3>
        {feedbackSummary.recent_comments.length > 0 ? (
          <div className="space-y-3">
            {feedbackSummary.recent_comments.map(comment => (
              <div key={comment.id} className="bg-gray-800 p-3 rounded">
                <div className="flex justify-between items-start">
                  <div className="text-sm">{comment.comment}</div>
                  <div className="flex items-center space-x-2">
                    {comment.rating && (
                      <span className="bg-yellow-600 text-white text-xs px-2 py-1 rounded">
                        {comment.rating.toFixed(1)} ★
                      </span>
                    )}
                    {comment.is_positive !== undefined && (
                      <span className={`text-xs px-2 py-1 rounded ${
                        comment.is_positive ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                      }`}>
                        {comment.is_positive ? 'Positive' : 'Negative'}
                      </span>
                    )}
                    <span className="text-xs text-gray-400">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  Category: {comment.category.charAt(0).toUpperCase() + comment.category.slice(1)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-400 py-4">
            No detailed comments available
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentFeedbackDashboard;
