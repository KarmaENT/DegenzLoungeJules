import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaFlask, FaPlay, FaStop, FaChartBar, FaTrash, FaCheck, FaTimes, FaExchangeAlt } from 'react-icons/fa';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface AgentParameters { // Re-using from AgentFineTuning or define a shared one
  temperature: number;
  top_p: number;
  max_tokens: number;
  // Add other expected parameters
}

interface AgentVersion {
  id: number;
  agent_id: number;
  version_number: number;
  name: string;
  parameters: AgentParameters | null; // Use a more specific type if possible
  created_at: string;
  is_active: boolean;
}

interface ABTestParameters {
  min_sessions: number;
  min_feedback: number;
  metrics_to_compare: string[];
  // Add other specific test parameters if known
}

interface FeedbackMetrics {
  avg_rating: number | null;
  count: number;
  positive_percentage?: number | null; 
}

interface PerformanceMetrics {
  response_time: number | null;
  task_completion_rate: number | null;
  // Add other specific performance metrics
}

interface VersionTestResult {
  session_count: number;
  feedback: FeedbackMetrics;
  performance: PerformanceMetrics;
}

interface TestComparisonResult {
  winner: 'control' | 'variant' | 'tie';
  confidence: number;
  rating_diff: number;
  response_time_diff: number;
  completion_rate_diff: number;
}

interface ABTestResults {
  control: VersionTestResult;
  variant: VersionTestResult;
  comparison: TestComparisonResult;
  // Add other result fields if known
}

interface ABTest {
  id: number;
  name: string;
  description: string | null;
  control_version_id: number;
  variant_version_id: number;
  test_parameters: ABTestParameters;
  status: 'created' | 'running' | 'completed' | 'analyzed' | string; // Allow other strings for flexibility
  start_date: string | null;
  end_date: string | null;
  results: ABTestResults | null;
  created_at: string;
}

interface ABTestSession {
  id: number;
  ab_test_id: number;
  session_id: number; // Assuming this is a number
  version_used: 'control' | 'variant';
  metrics: Record<string, any> | null; // Can be more specific if metrics structure is known
  created_at: string;
}

interface ABTestingProps {
  agentId: number;
  agentName: string;
}

const ABTesting: React.FC<ABTestingProps> = ({ agentId, agentName }) => {
  const [versions, setVersions] = useState<AgentVersion[]>([]);
  const [tests, setTests] = useState<ABTest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('tests');
  const [selectedTest, setSelectedTest] = useState<ABTest | null>(null);
  const [testSessions, setTestSessions] = useState<ABTestSession[]>([]);
  
  const [showNewTestForm, setShowNewTestForm] = useState<boolean>(false);
  const [newTestName, setNewTestName] = useState<string>('');
  const [newTestDescription, setNewTestDescription] = useState<string>('');
  const [controlVersionId, setControlVersionId] = useState<number | null>(null);
  const [variantVersionId, setVariantVersionId] = useState<number | null>(null);
  const [testParameters, setTestParameters] = useState<ABTestParameters>({
    min_sessions: 10,
    min_feedback: 5,
    metrics_to_compare: ['response_time', 'task_completion_rate', 'user_rating']
  });
  const [creatingTest, setCreatingTest] = useState<boolean>(false);

  useEffect(() => {
    fetchData();
  }, [agentId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const versionsResponse = await axios.get<AgentVersion[]>(`/api/agent_versions/?agent_id=${agentId}`);
      setVersions(versionsResponse.data);
      
      const testsResponse = await axios.get<ABTest[]>(`/api/ab_tests/?agent_id=${agentId}`);
      setTests(testsResponse.data);
      
      if (versionsResponse.data.length >= 1) {
        const activeVersion = versionsResponse.data.find(v => v.is_active);
        if (activeVersion) {
          setControlVersionId(activeVersion.id);
          if (versionsResponse.data.length >=2) {
            const otherVersions = versionsResponse.data
              .filter(v => v.id !== activeVersion.id)
              .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            if (otherVersions.length > 0) {
              setVariantVersionId(otherVersions[0].id);
            }
          }
        } else if (versionsResponse.data.length > 0) {
          // If no active, pick the latest as control
          const sortedVersions = [...versionsResponse.data].sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          setControlVersionId(sortedVersions[0].id);
          if (sortedVersions.length >=2) {
             setVariantVersionId(sortedVersions[1].id);
          }
        }
      }
      
    } catch (err) {
      setError('Failed to load data');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const createTest = async () => {
    if (!newTestName || controlVersionId === null || variantVersionId === null) {
      setError('Please fill in all required fields (Test Name, Control Version, Variant Version)');
      return;
    }
    
    if (controlVersionId === variantVersionId) {
      setError('Control and variant versions must be different');
      return;
    }
    
    try {
      setCreatingTest(true);
      setError(null);
      
      const response = await axios.post<ABTest>('/api/ab_tests/', {
        name: newTestName,
        description: newTestDescription || null,
        control_version_id: controlVersionId,
        variant_version_id: variantVersionId,
        test_parameters: testParameters,
        status: 'created' // Initial status
      });
      
      setTests(prev => [response.data, ...prev]);
      setShowNewTestForm(false);
      setNewTestName('');
      setNewTestDescription('');
      setSuccess('A/B test created successfully!');
      
    } catch (err) {
      setError('Failed to create A/B test');
      console.error('Error creating A/B test:', err);
    } finally {
      setCreatingTest(false);
    }
  };

  const startTest = async (testId: number) => {
    try {
      setError(null);
      const response = await axios.put<ABTest>(`/api/ab_tests/${testId}/start`);
      setTests(prev => prev.map(t => t.id === testId ? response.data : t));
      if(selectedTest && selectedTest.id === testId) setSelectedTest(response.data);
      setSuccess('A/B test started successfully!');
    } catch (err) {
      setError('Failed to start A/B test');
      console.error('Error starting A/B test:', err);
    }
  };

  const stopTest = async (testId: number) => {
    try {
      setError(null);
      const response = await axios.put<ABTest>(`/api/ab_tests/${testId}/stop`);
      setTests(prev => prev.map(t => t.id === testId ? response.data : t));
      if(selectedTest && selectedTest.id === testId) setSelectedTest(response.data);
      setSuccess('A/B test stopped successfully!');
    } catch (err) {
      setError('Failed to stop A/B test');
      console.error('Error stopping A/B test:', err);
    }
  };

  const analyzeTest = async (testId: number) => {
    try {
      setError(null);
      const response = await axios.put<ABTest>(`/api/ab_tests/${testId}/analyze`);
      setTests(prev => prev.map(t => t.id === testId ? response.data : t));
      setSelectedTest(response.data);
      setActiveTab('results');
      setSuccess('A/B test analyzed successfully!');
    } catch (err) {
      setError('Failed to analyze A/B test');
      console.error('Error analyzing A/B test:', err);
    }
  };

  const deleteTest = async (testId: number) => {
    if (!window.confirm('Are you sure you want to delete this A/B test?')) {
      return;
    }
    try {
      setError(null);
      await axios.delete(`/api/ab_tests/${testId}`);
      setTests(prev => prev.filter(t => t.id !== testId));
      if (selectedTest && selectedTest.id === testId) {
        setSelectedTest(null);
        setActiveTab('tests');
      }
      setSuccess('A/B test deleted successfully!');
    } catch (err) {
      setError('Failed to delete A/B test');
      console.error('Error deleting A/B test:', err);
    }
  };

  const viewTestDetails = async (test: ABTest) => {
    setSelectedTest(test);
    setActiveTab('details');
    try {
      const sessionsResponse = await axios.get<ABTestSession[]>(`/api/ab_tests/${test.id}/sessions`);
      setTestSessions(sessionsResponse.data);
    } catch (err) {
      setTestSessions([]); // Clear previous sessions on error
      console.error('Error fetching test sessions:', err);
    }
  };

  const getVersionName = (versionId: number | null) => {
    if (versionId === null) return 'N/A';
    const version = versions.find(v => v.id === versionId);
    return version ? `${version.name} (v${version.version_number})` : `Version ${versionId}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'created':
        return <span className="bg-gray-600 text-white text-xs px-2 py-1 rounded">Created</span>;
      case 'running':
        return <span className="bg-green-600 text-white text-xs px-2 py-1 rounded">Running</span>;
      case 'completed':
        return <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded">Completed</span>;
      case 'analyzed':
        return <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded">Analyzed</span>;
      default:
        return <span className="bg-gray-500 text-white text-xs px-2 py-1 rounded">{status}</span>;
    }
  };

  const renderTestResults = () => {
    if (!selectedTest || !selectedTest.results) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-400">No results available for this test. Ensure the test has been run and analyzed.</p>
        </div>
      );
    }
    
    const results = selectedTest.results;
    
    const comparisonData = {
      labels: ['Average Rating', 'Response Time (s)', 'Task Completion (%)'],
      datasets: [
        {
          label: 'Control',
          data: [
            results.control.feedback.avg_rating ?? 0,
            results.control.performance.response_time ?? 0,
            (results.control.performance.task_completion_rate ?? 0) * 100
          ],
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
        },
        {
          label: 'Variant',
          data: [
            results.variant.feedback.avg_rating ?? 0,
            results.variant.performance.response_time ?? 0,
            (results.variant.performance.task_completion_rate ?? 0) * 100
          ],
          backgroundColor: 'rgba(255, 99, 132, 0.6)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1,
        }
      ],
    };
    
    const chartOptions = {
      scales: {
        y: {
          beginAtZero: true,
          ticks: { color: 'rgba(255, 255, 255, 0.7)' },
          grid: { color: 'rgba(255, 255, 255, 0.1)' },
        },
        x: {
          ticks: { color: 'rgba(255, 255, 255, 0.7)' },
          grid: { color: 'rgba(255, 255, 255, 0.1)' },
        },
      },
      plugins: {
        legend: { labels: { color: 'rgba(255, 255, 255, 0.7)' } },
      },
      maintainAspectRatio: false,
    };

    return (
      <div className="space-y-6">
        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3">Test Results Summary: {selectedTest.name}</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-gray-800 p-3 rounded">
              <div className="text-sm text-gray-400 mb-1">Winner</div>
              <div className="flex items-center">
                {results.comparison.winner === 'control' && (
                  <>
                    <div className="text-lg font-bold text-blue-400">Control</div>
                    <div className="ml-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                      {results.comparison.confidence.toFixed(0)}% confidence
                    </div>
                  </>
                )}
                {results.comparison.winner === 'variant' && (
                  <>
                    <div className="text-lg font-bold text-pink-400">Variant</div>
                    <div className="ml-2 bg-pink-600 text-white text-xs px-2 py-1 rounded">
                      {results.comparison.confidence.toFixed(0)}% confidence
                    </div>
                  </>
                )}
                {results.comparison.winner === 'tie' && (
                  <div className="text-lg font-bold text-gray-400">Tie</div>
                )}
              </div>
            </div>
            
            <div className="bg-gray-800 p-3 rounded">
              <div className="text-sm text-gray-400 mb-1">Sample Size</div>
              <div className="text-lg">
                <span className="font-bold text-blue-400">{results.control.session_count}</span>
                <span className="text-gray-400 mx-2">vs</span>
                <span className="font-bold text-pink-400">{results.variant.session_count}</span>
              </div>
              <div className="text-xs text-gray-400">Control vs Variant Sessions</div>
            </div>
            
            <div className="bg-gray-800 p-3 rounded">
              <div className="text-sm text-gray-400 mb-1">Feedback Count</div>
              <div className="text-lg">
                <span className="font-bold text-blue-400">{results.control.feedback.count}</span>
                <span className="text-gray-400 mx-2">vs</span>
                <span className="font-bold text-pink-400">{results.variant.feedback.count}</span>
              </div>
              <div className="text-xs text-gray-400">Control vs Variant Feedback</div>
            </div>
          </div>
          
          <div className="h-64 mb-4">
            <Bar data={comparisonData} options={chartOptions as any} />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-md font-medium mb-2">Key Differences</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex justify-between">
                  <span>Rating Difference:</span>
                  <span className={results.comparison.rating_diff > 0 ? 'text-green-400' : results.comparison.rating_diff < 0 ? 'text-red-400' : 'text-gray-400'}>
                    {results.comparison.rating_diff > 0 ? '+' : ''}{results.comparison.rating_diff.toFixed(2)}
                  </span>
                </li>
                <li className="flex justify-between">
                  <span>Response Time Difference (s):</span>
                  <span className={results.comparison.response_time_diff < 0 ? 'text-green-400' : results.comparison.response_time_diff > 0 ? 'text-red-400' : 'text-gray-400'}>
                    {results.comparison.response_time_diff > 0 ? '+' : ''}{results.comparison.response_time_diff.toFixed(2)}
                  </span>
                </li>
                <li className="flex justify-between">
                  <span>Completion Rate Difference (%):</span>
                  <span className={results.comparison.completion_rate_diff > 0 ? 'text-green-400' : results.comparison.completion_rate_diff < 0 ? 'text-red-400' : 'text-gray-400'}>
                    {results.comparison.completion_rate_diff > 0 ? '+' : ''}{(results.comparison.completion_rate_diff * 100).toFixed(1)}
                  </span>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-md font-medium mb-2">Recommendation</h4>
              <div className="bg-gray-800 p-3 rounded text-sm">
                {results.comparison.winner === 'variant' && results.comparison.confidence >= 70 && (
                  <p>
                    The variant version significantly outperforms the control version. 
                    We recommend making the variant version the new default.
                  </p>
                )}
                {results.comparison.winner === 'variant' && results.comparison.confidence < 70 && (
                  <p>
                    The variant version shows some improvements over the control version, 
                    but with limited confidence. Consider running the test longer or 
                    making more significant changes to the variant.
                  </p>
                )}
                {results.comparison.winner === 'control' && results.comparison.confidence >= 70 && (
                  <p>
                    The control version significantly outperforms the variant version. 
                    We recommend keeping the control version and trying different changes 
                    for future variants.
                  </p>
                )}
                {results.comparison.winner === 'control' && results.comparison.confidence < 70 && (
                  <p>
                    The control version performs slightly better than the variant, 
                    but with limited confidence. Consider keeping the control version 
                    and trying different changes for future variants.
                  </p>
                )}
                {results.comparison.winner === 'tie' && (
                  <p>
                    No significant difference was found between the control and variant versions. 
                    Consider making more substantial changes to the variant or focusing on 
                    different aspects of the agent configuration.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-700 rounded-lg p-4">
            <h3 className="text-md font-semibold mb-3">Control Version Details ({getVersionName(selectedTest.control_version_id)})</h3>
            <div className="space-y-3 text-sm">
              <div><span className="text-gray-400">Avg Rating:</span> {results.control.feedback.avg_rating?.toFixed(2) ?? 'N/A'}</div>
              <div><span className="text-gray-400">Positive Feedback:</span> {results.control.feedback.positive_percentage?.toFixed(1) ?? 'N/A'}%</div>
              <div><span className="text-gray-400">Response Time (s):</span> {results.control.performance.response_time?.toFixed(2) ?? 'N/A'}</div>
              <div><span className="text-gray-400">Task Completion:</span> {(results.control.performance.task_completion_rate === null || results.control.performance.task_completion_rate === undefined) ? 'N/A' : `${(results.control.performance.task_completion_rate * 100).toFixed(1)}%`}</div>
            </div>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-4">
            <h3 className="text-md font-semibold mb-3">Variant Version Details ({getVersionName(selectedTest.variant_version_id)})</h3>
            <div className="space-y-3 text-sm">
              <div><span className="text-gray-400">Avg Rating:</span> {results.variant.feedback.avg_rating?.toFixed(2) ?? 'N/A'}</div>
              <div><span className="text-gray-400">Positive Feedback:</span> {results.variant.feedback.positive_percentage?.toFixed(1) ?? 'N/A'}%</div>
              <div><span className="text-gray-400">Response Time (s):</span> {results.variant.performance.response_time?.toFixed(2) ?? 'N/A'}</div>
              <div><span className="text-gray-400">Task Completion:</span> {(results.variant.performance.task_completion_rate === null || results.variant.performance.task_completion_rate === undefined) ? 'N/A' : `${(results.variant.performance.task_completion_rate * 100).toFixed(1)}%`}</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className="p-4 text-center">Loading A/B testing interface...</div>;
  }

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold flex items-center">
          <FaFlask className="mr-2 text-yellow-400" />
          {agentName} A/B Testing
        </h2>
        
        {activeTab === 'tests' && !showNewTestForm && (
          <button 
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-1 px-3 rounded"
            onClick={() => setShowNewTestForm(true)}
          >
            New A/B Test
          </button>
        )}
        
        {(activeTab === 'details' || activeTab === 'results') && selectedTest && (
          <button 
            className="text-gray-400 hover:text-white text-sm"
            onClick={() => {
              setActiveTab('tests');
              setSelectedTest(null);
              setTestSessions([]);
            }}
          >
            &larr; Back to Tests
          </button>
        )}
      </div>
      
      {error && (
        <div className="bg-red-900 text-white p-3 rounded mb-4 text-sm">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-900 text-white p-3 rounded mb-4 text-sm">
          {success}
        </div>
      )}
      
      {activeTab === 'tests' && showNewTestForm && (
        <div className="bg-gray-700 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold mb-3">Create New A/B Test</h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="newTestName" className="block text-sm font-medium mb-1">Test Name*</label>
              <input 
                type="text"
                id="newTestName"
                className="w-full bg-gray-800 text-white rounded px-3 py-2 border border-gray-600 focus:border-blue-500 outline-none"
                value={newTestName}
                onChange={(e) => setNewTestName(e.target.value)}
                placeholder="e.g., Temperature Comparison Test"
              />
            </div>
            <div>
              <label htmlFor="newTestDescription" className="block text-sm font-medium mb-1">Description</label>
              <textarea 
                id="newTestDescription"
                className="w-full bg-gray-800 text-white rounded px-3 py-2 border border-gray-600 focus:border-blue-500 outline-none"
                value={newTestDescription}
                onChange={(e) => setNewTestDescription(e.target.value)}
                placeholder="Optional: Describe what you are testing (e.g., comparing temperature 0.5 vs 0.9)"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="controlVersion" className="block text-sm font-medium mb-1">Control Version*</label>
                <select 
                  id="controlVersion"
                  className="w-full bg-gray-800 text-white rounded px-3 py-2 border border-gray-600 focus:border-blue-500 outline-none"
                  value={controlVersionId === null ? '' : controlVersionId}
                  onChange={(e) => setControlVersionId(e.target.value ? parseInt(e.target.value) : null)}
                >
                  <option value="">Select Control Version</option>
                  {versions.map(version => (
                    <option key={`control-${version.id}`} value={version.id}>
                      {version.name} (v{version.version_number}) {version.is_active ? '(Active)' : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="variantVersion" className="block text-sm font-medium mb-1">Variant Version*</label>
                <select 
                  id="variantVersion"
                  className="w-full bg-gray-800 text-white rounded px-3 py-2 border border-gray-600 focus:border-blue-500 outline-none"
                  value={variantVersionId === null ? '' : variantVersionId}
                  onChange={(e) => setVariantVersionId(e.target.value ? parseInt(e.target.value) : null)}
                >
                  <option value="">Select Variant Version</option>
                  {versions.map(version => (
                    <option key={`variant-${version.id}`} value={version.id}>
                      {version.name} (v{version.version_number}) {version.is_active ? '(Active)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Test Parameters</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-3 bg-gray-800 rounded">
                <div>
                  <label htmlFor="minSessions" className="block text-xs text-gray-400 mb-1">Min Sessions</label>
                  <input 
                    type="number"
                    id="minSessions"
                    className="w-full bg-gray-700 text-white rounded px-3 py-2 border border-gray-600 focus:border-blue-500 outline-none"
                    value={testParameters.min_sessions}
                    onChange={(e) => setTestParameters(prev => ({ ...prev, min_sessions: parseInt(e.target.value) || 0 }))}
                    min={1}
                  />
                </div>
                <div>
                  <label htmlFor="minFeedback" className="block text-xs text-gray-400 mb-1">Min Feedback</label>
                  <input 
                    type="number"
                    id="minFeedback"
                    className="w-full bg-gray-700 text-white rounded px-3 py-2 border border-gray-600 focus:border-blue-500 outline-none"
                    value={testParameters.min_feedback}
                    onChange={(e) => setTestParameters(prev => ({ ...prev, min_feedback: parseInt(e.target.value) || 0 }))}
                    min={0}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Metrics to Compare</label>
                  <div className="space-y-1 mt-1">
                    {['response_time', 'task_completion_rate', 'user_rating'].map(metric => (
                      <div key={metric} className="flex items-center">
                        <input 
                          type="checkbox"
                          id={`metric-${metric}`}
                          checked={testParameters.metrics_to_compare.includes(metric)}
                          onChange={(e) => {
                            const metrics = e.target.checked
                              ? [...testParameters.metrics_to_compare, metric]
                              : testParameters.metrics_to_compare.filter(m => m !== metric);
                            setTestParameters(prev => ({ ...prev, metrics_to_compare: metrics }));
                          }}
                          className="mr-2 h-4 w-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                        />
                        <label htmlFor={`metric-${metric}`} className="text-xs">
                          {metric.split('_').map(s => s.charAt(0).toUpperCase() + s.substring(1)).join(' ')}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-4">
              <button
                className="bg-gray-600 hover:bg-gray-500 text-white text-sm font-medium py-2 px-4 rounded"
                onClick={() => setShowNewTestForm(false)}
              >
                Cancel
              </button>
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded flex items-center"
                onClick={createTest}
                disabled={creatingTest}
              >
                {creatingTest ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating...
                    </>
                ) : 'Create Test'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'tests' && !showNewTestForm && (
        <div>
          {tests.length === 0 ? (
            <div className="text-center py-8">
              <FaFlask className="mx-auto text-4xl text-gray-500 mb-3" />
              <p className="text-gray-400">No A/B tests found for this agent.</p>
              <p className="text-sm text-gray-500">Click "New A/B Test" to create one.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tests.map(test => (
                <div key={test.id} className="bg-gray-700 rounded-lg p-4 hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-blue-400 hover:underline cursor-pointer" onClick={() => viewTestDetails(test)}>{test.name}</h3>
                      <p className="text-xs text-gray-400 mb-1">Created: {new Date(test.created_at).toLocaleDateString()}</p>
                      <p className="text-sm text-gray-300 truncate w-96" title={test.description || ''}>{test.description || 'No description'}</p>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                        {getStatusBadge(test.status)}
                        <div className="text-xs text-gray-400">
                            {test.start_date && <>Started: {new Date(test.start_date).toLocaleDateString()}</>}
                            {test.end_date && <><br/>Ended: {new Date(test.end_date).toLocaleDateString()}</>}
                        </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-600">
                    <div className="grid grid-cols-2 gap-x-4 text-sm">
                        <div>
                            <span className="font-medium text-gray-400">Control:</span> {getVersionName(test.control_version_id)}
                        </div>
                        <div>
                            <span className="font-medium text-gray-400">Variant:</span> {getVersionName(test.variant_version_id)}
                        </div>
                    </div>
                  </div>

                  <div className="mt-3 flex justify-end space-x-2">
                    {test.status === 'created' && (
                      <button 
                        className="bg-green-600 hover:bg-green-700 text-white text-xs font-semibold py-1 px-2 rounded flex items-center"
                        onClick={() => startTest(test.id)}
                      >
                        <FaPlay className="mr-1" /> Start
                      </button>
                    )}
                    {test.status === 'running' && (
                      <button 
                        className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold py-1 px-2 rounded flex items-center"
                        onClick={() => stopTest(test.id)}
                      >
                        <FaStop className="mr-1" /> Stop
                      </button>
                    )}
                    {(test.status === 'completed' || test.status === 'analyzed') && (
                      <button 
                        className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold py-1 px-2 rounded flex items-center"
                        onClick={() => analyzeTest(test.id)}
                      >
                        <FaChartBar className="mr-1" /> {test.status === 'analyzed' ? 'Re-Analyze' : 'Analyze'}
                      </button>
                    )}
                     <button 
                        className="bg-gray-600 hover:bg-gray-500 text-white text-xs font-semibold py-1 px-2 rounded flex items-center"
                        onClick={() => viewTestDetails(test)}
                      >
                        Details
                      </button>
                    <button 
                      className="text-red-400 hover:text-red-300 text-xs font-semibold py-1 px-2 rounded border border-red-400 hover:border-red-300 flex items-center"
                      onClick={() => deleteTest(test.id)}
                    >
                      <FaTrash className="mr-1" /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {activeTab === 'details' && selectedTest && (
        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-1">Test Details: {selectedTest.name}</h3>
          <p className="text-sm text-gray-400 mb-3">Status: {getStatusBadge(selectedTest.status)}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
            <div><span className="font-medium text-gray-300">Control:</span> {getVersionName(selectedTest.control_version_id)}</div>
            <div><span className="font-medium text-gray-300">Variant:</span> {getVersionName(selectedTest.variant_version_id)}</div>
            <div><span className="font-medium text-gray-300">Created:</span> {new Date(selectedTest.created_at).toLocaleString()}</div>
            {selectedTest.start_date && <div><span className="font-medium text-gray-300">Started:</span> {new Date(selectedTest.start_date).toLocaleString()}</div>}
            {selectedTest.end_date && <div><span className="font-medium text-gray-300">Ended:</span> {new Date(selectedTest.end_date).toLocaleString()}</div>}
          </div>

          <h4 className="text-md font-semibold mt-4 mb-2">Test Parameters</h4>
          <pre className="bg-gray-800 p-3 rounded text-xs whitespace-pre-wrap">
            {JSON.stringify(selectedTest.test_parameters, null, 2)}
          </pre>

          <h4 className="text-md font-semibold mt-4 mb-2">Sessions ({testSessions.length})</h4>
          {testSessions.length > 0 ? (
            <div className="max-h-96 overflow-y-auto bg-gray-800 p-2 rounded">
                {testSessions.map(session => (
                    <div key={session.id} className="text-xs p-2 border-b border-gray-700">
                        <p>Session ID: {session.session_id} | Version Used: <span className={session.version_used === 'control' ? 'text-blue-400' : 'text-pink-400'}>{session.version_used}</span></p>
                        <p>Metrics: {session.metrics ? JSON.stringify(session.metrics) : 'N/A'}</p>
                        <p>Recorded: {new Date(session.created_at).toLocaleString()}</p>
                    </div>
                ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No session data recorded for this test yet.</p>
          )}

          {selectedTest.status === 'analyzed' && selectedTest.results && (
             <button 
                className="mt-4 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold py-2 px-4 rounded flex items-center"
                onClick={() => setActiveTab('results')}
              >
                <FaChartBar className="mr-2" /> View Full Results
            </button>
          )}
        </div>
      )}

      {activeTab === 'results' && selectedTest && renderTestResults()}
      
    </div>
  );
};

export default ABTesting;

