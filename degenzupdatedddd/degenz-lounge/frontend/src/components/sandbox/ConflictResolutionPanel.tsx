import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

interface ConflictResolution {
  id: number;
  session_id: number;
  conflict_message_id: number;
  resolution_method: string;
  resolution_data: any;
  resolved_by_agent_id: number | null;
  resolution_message_id: number | null;
  created_at: string;
  resolved_at: string | null;
}

interface Agent {
  id: number;
  name: string;
  role: string;
}

interface Message {
  id: number;
  content: string;
  agent_name?: string;
  agent_role?: string;
  timestamp: string;
}

const ConflictResolutionPanel: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [conflicts, setConflicts] = useState<ConflictResolution[]>([]);
  const [activeConflict, setActiveConflict] = useState<ConflictResolution | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [conflictMessage, setConflictMessage] = useState<Message | null>(null);
  const [relatedMessages, setRelatedMessages] = useState<Message[]>([]);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [selectedAgent, setSelectedAgent] = useState<number | null>(null);
  const [proposalText, setProposalText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch conflicts for this session
  useEffect(() => {
    const fetchConflicts = async () => {
      if (!sessionId) return;
      
      try {
        const response = await axios.get(`/api/conflict-resolution/session/${sessionId}`);
        setConflicts(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load conflicts');
        setLoading(false);
      }
    };

    fetchConflicts();
  }, [sessionId]);

  // Fetch agents in the session
  useEffect(() => {
    const fetchAgents = async () => {
      if (!sessionId) return;
      
      try {
        const response = await axios.get(`/api/sessions/${sessionId}/agents`);
        setAgents(response.data);
      } catch (err) {
        setError('Failed to load agents');
      }
    };

    fetchAgents();
  }, [sessionId]);

  // Fetch conflict details when an active conflict is selected
  useEffect(() => {
    const fetchConflictDetails = async () => {
      if (!activeConflict) return;
      
      try {
        // Fetch the conflict message
        const messageResponse = await axios.get(`/api/messages/${activeConflict.conflict_message_id}`);
        setConflictMessage(messageResponse.data);
        
        // Fetch related messages (messages with the same parent)
        if (messageResponse.data.parent_id) {
          const relatedResponse = await axios.get(`/api/messages/parent/${messageResponse.data.parent_id}`);
          setRelatedMessages(relatedResponse.data);
        }
      } catch (err) {
        setError('Failed to load conflict details');
      }
    };

    fetchConflictDetails();
  }, [activeConflict]);

  const handleCreateConflict = async () => {
    if (!selectedOption || !selectedAgent) {
      setError('Please select a resolution method and an agent');
      return;
    }

    try {
      // For this example, we'll assume we're creating a conflict for the most recent message
      const messagesResponse = await axios.get(`/api/messages/session/${sessionId}?limit=1`);
      const latestMessage = messagesResponse.data[0];
      
      let resolutionData = {};
      
      if (selectedOption === 'voting') {
        // For voting, we need options
        resolutionData = {
          options: relatedMessages.map(msg => msg.content.substring(0, 100) + '...')
        };
      } else if (selectedOption === 'consensus') {
        // For consensus, we initialize an empty proposals object
        resolutionData = {
          proposals: {}
        };
      } else if (selectedOption === 'manager_decision') {
        // For manager decision, we need options
        resolutionData = {
          options: relatedMessages.map(msg => msg.content.substring(0, 100) + '...')
        };
      }
      
      const response = await axios.post('/api/conflict-resolution/', {
        session_id: parseInt(sessionId || '0'),
        conflict_message_id: latestMessage.id,
        resolution_method: selectedOption,
        resolution_data: resolutionData,
        resolved_by_agent_id: selectedOption === 'manager_decision' ? selectedAgent : null
      });
      
      // Add the new conflict to the list and set it as active
      setConflicts([...conflicts, response.data]);
      setActiveConflict(response.data);
      setSuccessMessage('Conflict resolution created successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Failed to create conflict resolution');
    }
  };

  const handleVote = async (agentId: number, option: string) => {
    if (!activeConflict) return;
    
    try {
      const response = await axios.post(`/api/conflict-resolution/${activeConflict.id}/vote`, {
        agent_id: agentId,
        vote: option
      });
      
      // Update the active conflict with the new data
      setActiveConflict(response.data);
      
      // Update the conflict in the list
      setConflicts(conflicts.map(c => 
        c.id === activeConflict.id ? response.data : c
      ));
      
      setSuccessMessage('Vote submitted successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Failed to submit vote');
    }
  };

  const handleSubmitProposal = async () => {
    if (!activeConflict || !selectedAgent || !proposalText) {
      setError('Please select an agent and enter a proposal');
      return;
    }
    
    try {
      const response = await axios.post(`/api/conflict-resolution/${activeConflict.id}/consensus`, {
        agent_id: selectedAgent,
        proposal: proposalText
      });
      
      // Update the active conflict with the new data
      setActiveConflict(response.data);
      
      // Update the conflict in the list
      setConflicts(conflicts.map(c => 
        c.id === activeConflict.id ? response.data : c
      ));
      
      // Clear the proposal text
      setProposalText('');
      
      setSuccessMessage('Proposal submitted successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Failed to submit proposal');
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const getAgentName = (agentId: number | null) => {
    if (!agentId) return 'Unknown';
    const agent = agents.find(a => a.id === agentId);
    return agent ? agent.name : 'Unknown';
  };

  const getVotingStatus = () => {
    if (!activeConflict || activeConflict.resolution_method !== 'voting') return null;
    
    const votingData = activeConflict.resolution_data;
    const totalVotes = votingData.total_votes || 0;
    const totalAgents = agents.length;
    
    return (
      <div className="mb-4">
        <div className="text-sm text-gray-300 mb-2">
          Voting Progress: {totalVotes} / {totalAgents} votes
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2.5">
          <div 
            className="bg-blue-600 h-2.5 rounded-full" 
            style={{ width: `${(totalVotes / totalAgents) * 100}%` }}
          ></div>
        </div>
      </div>
    );
  };

  const getConsensusStatus = () => {
    if (!activeConflict || activeConflict.resolution_method !== 'consensus') return null;
    
    const consensusData = activeConflict.resolution_data;
    const totalProposals = Object.keys(consensusData.proposals || {}).length;
    const totalAgents = agents.length;
    
    return (
      <div className="mb-4">
        <div className="text-sm text-gray-300 mb-2">
          Consensus Progress: {totalProposals} / {totalAgents} proposals
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2.5">
          <div 
            className="bg-blue-600 h-2.5 rounded-full" 
            style={{ width: `${(totalProposals / totalAgents) * 100}%` }}
          ></div>
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className="p-4">Loading conflicts...</div>;
  }

  return (
    <div className="bg-gray-800 text-white rounded-lg shadow-lg p-4 h-full flex flex-col">
      <h2 className="text-xl font-bold mb-4">Conflict Resolution</h2>
      
      {error && (
        <div className="bg-red-600 text-white p-2 mb-4 rounded">
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className="bg-green-600 text-white p-2 mb-4 rounded">
          {successMessage}
        </div>
      )}
      
      <div className="grid grid-cols-3 gap-4 flex-grow">
        <div className="col-span-1 bg-gray-900 rounded p-4 overflow-y-auto">
          <h3 className="text-lg font-semibold mb-3">Conflicts</h3>
          
          {conflicts.length === 0 ? (
            <p className="text-gray-400">No conflicts found</p>
          ) : (
            <div className="space-y-3">
              {conflicts.map(conflict => (
                <div 
                  key={conflict.id} 
                  className={`p-3 rounded-lg cursor-pointer ${
                    activeConflict?.id === conflict.id ? 'bg-blue-900' : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                  onClick={() => setActiveConflict(conflict)}
                >
                  <div className="flex justify-between items-start mb-1">
                    <div className="font-semibold">
                      Conflict #{conflict.id}
                    </div>
                    <div className={`text-xs px-2 py-1 rounded ${
                      conflict.resolved_at ? 'bg-green-700' : 'bg-yellow-700'
                    }`}>
                      {conflict.resolved_at ? 'Resolved' : 'Pending'}
                    </div>
                  </div>
                  <div className="text-xs text-gray-400">
                    Method: {conflict.resolution_method}
                  </div>
                  <div className="text-xs text-gray-400">
                    Created: {formatTimestamp(conflict.created_at)}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="mt-4 pt-4 border-t border-gray-700">
            <h3 className="text-lg font-semibold mb-3">Create New Conflict</h3>
            
            <div className="mb-3">
              <label className="block mb-1 text-sm">Resolution Method</label>
              <select 
                className="w-full bg-gray-700 text-white p-2 rounded"
                value={selectedOption}
                onChange={(e) => setSelectedOption(e.target.value)}
              >
                <option value="">Select method</option>
                <option value="voting">Voting</option>
                <option value="manager_decision">Manager Decision</option>
                <option value="consensus">Consensus</option>
              </select>
            </div>
            
            <div className="mb-3">
              <label className="block mb-1 text-sm">
                {selectedOption === 'manager_decision' ? 'Manager Agent' : 'Initial Agent'}
              </label>
              <select 
                className="w-full bg-gray-700 text-white p-2 rounded"
                value={selectedAgent || ''}
                onChange={(e) => setSelectedAgent(e.target.value ? parseInt(e.target.value) : null)}
              >
                <option value="">Select agent</option>
                {agents.map(agent => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name} ({agent.role})
                  </option>
                ))}
              </select>
            </div>
            
            <button 
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full"
              onClick={handleCreateConflict}
              disabled={!selectedOption || !selectedAgent}
            >
              Create Conflict
            </button>
          </div>
        </div>
        
        <div className="col-span-2 bg-gray-900 rounded p-4 overflow-y-auto">
          {activeConflict ? (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">
                  Conflict Resolution #{activeConflict.id}
                </h3>
                <div className={`text-xs px-2 py-1 rounded ${
                  activeConflict.resolved_at ? 'bg-green-700' : 'bg-yellow-700'
                }`}>
                  {activeConflict.resolved_at ? 'Resolved' : 'Pending'}
                </div>
              </div>
              
              <div className="mb-4 grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-400">Method</div>
                  <div className="font-semibold">{activeConflict.resolution_method}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Created</div>
                  <div>{formatTimestamp(activeConflict.created_at)}</div>
                </div>
                {activeConflict.resolved_at && (
                  <>
                    <div>
                      <div className="text-sm text-gray-400">Resolved</div>
                      <div>{formatTimestamp(activeConflict.resolved_at)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Resolved By</div>
                      <div>{getAgentName(activeConflict.resolved_by_agent_id)}</div>
                    </div>
                  </>
                )}
              </div>
              
              {/* Conflict Message */}
              {conflictMessage && (
                <div className="mb-4">
                  <div className="text-sm text-gray-400 mb-1">Conflict Message</div>
                  <div className="bg-gray-700 p-3 rounded-lg">
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <span className="font-bold">{conflictMessage.agent_name || 'User'}</span>
                        {conflictMessage.agent_role && (
                          <span className="text-gray-400 text-sm ml-2">({conflictMessage.agent_role})</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-400">
                        {formatTimestamp(conflictMessage.timestamp)}
                      </div>
                    </div>
                    <p className="whitespace-pre-wrap">{conflictMessage.content}</p>
                  </div>
                </div>
              )}
              
              {/* Related Messages */}
              {relatedMessages.length > 0 && (
                <div className="mb-4">
                  <div className="text-sm text-gray-400 mb-1">Related Messages</div>
                  <div className="space-y-2">
                    {relatedMessages.map(message => (
                      <div key={message.id} className="bg-gray-700 p-3 rounded-lg">
                        <div className="flex justify-between items-start mb-1">
                          <div>
                            <span className="font-bold">{message.agent_name || 'User'}</span>
                            {message.agent_role && (
                              <span className="text-gray-400 text-sm ml-2">({message.agent_role})</span>
                            )}
                          </div>
                          <div className="text-xs text-gray-400">
                            {formatTimestamp(message.timestamp)}
                          </div>
                        </div>
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Voting Interface */}
              {activeConflict.resolution_method === 'voting' && !activeConflict.resolved_at && (
                <div className="mb-4">
                  <div className="text-sm text-gray-400 mb-1">Voting</div>
                  
                  {getVotingStatus()}
                  
                  <div className="bg-gray-700 p-3 rounded-lg">
                    <h4 className="font-semibold mb-2">Cast Vote</h4>
                    
                    <div className="mb-3">
                      <label className="block mb-1 text-sm">Voting Agent</label>
                      <select 
                        className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600"
                        value={selectedAgent || ''}
                        onChange={(e) => setSelectedAgent(e.target.value ? parseInt(e.target.value) : null)}
                      >
                        <option value="">Select agent</option>
                        {agents.map(agent => (
                          <option key={agent.id} value={agent.id}>
                            {agent.name} ({agent.role})
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="mb-3">
                      <label className="block mb-1 text-sm">Options</label>
                      <div className="space-y-2">
                        {activeConflict.resolution_data.options?.map((option: string, index: number) => (
                          <button 
                            key={index}
                            className="w-full text-left p-2 rounded border border-gray-600 hover:bg-gray-600"
                            onClick={() => selectedAgent && handleVote(selectedAgent, option)}
                            disabled={!selectedAgent}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Voting Results */}
                  {activeConflict.resolution_data.vote_counts && (
                    <div className="mt-3 bg-gray-700 p-3 rounded-lg">
                      <h4 className="font-semibold mb-2">Voting Results</h4>
                      
                      <div className="space-y-2">
                        {Object.entries(activeConflict.resolution_data.vote_counts).map(([option, count]: [string, any]) => (
                          <div key={option} className="flex justify-between items-center">
                            <div className="truncate flex-grow">{option}</div>
                            <div className="ml-2">{count} votes</div>
                          </div>
                        ))}
                      </div>
                      
                      {activeConflict.resolution_data.result && (
                        <div className="mt-3 pt-3 border-t border-gray-600">
                          <div className="font-semibold">Winning Option:</div>
                          <div className="bg-green-900 p-2 rounded mt-1">
                            {activeConflict.resolution_data.result}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              
              {/* Consensus Interface */}
              {activeConflict.resolution_method === 'consensus' && !activeConflict.resolved_at && (
                <div className="mb-4">
                  <div className="text-sm text-gray-400 mb-1">Consensus Building</div>
                  
                  {getConsensusStatus()}
                  
                  <div className="bg-gray-700 p-3 rounded-lg">
                    <h4 className="font-semibold mb-2">Submit Proposal</h4>
                    
                    <div className="mb-3">
                      <label className="block mb-1 text-sm">Proposing Agent</label>
                      <select 
                        className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600"
                        value={selectedAgent || ''}
                        onChange={(e) => setSelectedAgent(e.target.value ? parseInt(e.target.value) : null)}
                      >
                        <option value="">Select agent</option>
                        {agents.map(agent => (
                          <option key={agent.id} value={agent.id}>
                            {agent.name} ({agent.role})
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="mb-3">
                      <label className="block mb-1 text-sm">Proposal</label>
                      <textarea 
                        className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600 resize-none"
                        rows={4}
                        value={proposalText}
                        onChange={(e) => setProposalText(e.target.value)}
                        placeholder="Enter your proposal for resolving the conflict..."
                      />
                    </div>
                    
                    <button 
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                      onClick={handleSubmitProposal}
                      disabled={!selectedAgent || !proposalText.trim()}
                    >
                      Submit Proposal
                    </button>
                  </div>
                  
                  {/* Submitted Proposals */}
                  {activeConflict.resolution_data.proposals && Object.keys(activeConflict.resolution_data.proposals).length > 0 && (
                    <div className="mt-3 bg-gray-700 p-3 rounded-lg">
                      <h4 className="font-semibold mb-2">Submitted Proposals</h4>
                      
                      <div className="space-y-3">
                        {Object.entries(activeConflict.resolution_data.proposals).map(([agentId, proposal]: [string, any]) => (
                          <div key={agentId} className="border border-gray-600 rounded p-2">
                            <div className="font-semibold mb-1">
                              {getAgentName(parseInt(agentId))}
                            </div>
                            <div className="text-sm whitespace-pre-wrap">
                              {proposal}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Consensus Result */}
                  {activeConflict.resolution_data.synthesis && (
                    <div className="mt-3 bg-gray-700 p-3 rounded-lg">
                      <h4 className="font-semibold mb-2">Consensus Result</h4>
                      <div className="bg-green-900 p-2 rounded whitespace-pre-wrap">
                        {activeConflict.resolution_data.synthesis}
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Manager Decision Interface */}
              {activeConflict.resolution_method === 'manager_decision' && (
                <div className="mb-4">
                  <div className="text-sm text-gray-400 mb-1">Manager Decision</div>
                  
                  <div className="bg-gray-700 p-3 rounded-lg">
                    <h4 className="font-semibold mb-2">Decision Status</h4>
                    
                    <div className="mb-2">
                      <div className="text-sm">Manager:</div>
                      <div>{getAgentName(activeConflict.resolved_by_agent_id)}</div>
                    </div>
                    
                    <div className="mb-2">
                      <div className="text-sm">Status:</div>
                      <div>{activeConflict.resolution_data.status || 'pending'}</div>
                    </div>
                    
                    {activeConflict.resolution_data.manager_decision && (
                      <div className="mt-3 pt-3 border-t border-gray-600">
                        <div className="font-semibold mb-1">Manager's Decision:</div>
                        <div className="bg-blue-900 p-2 rounded whitespace-pre-wrap">
                          {activeConflict.resolution_data.manager_decision}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Resolution Message */}
              {activeConflict.resolution_message_id && (
                <div className="mb-4">
                  <div className="text-sm text-gray-400 mb-1">Resolution</div>
                  <div className="bg-green-900 p-3 rounded-lg">
                    <div className="font-semibold mb-2">Final Resolution</div>
                    <p className="whitespace-pre-wrap">
                      {/* We would fetch and display the resolution message here */}
                      {activeConflict.resolution_data.synthesis || 
                       activeConflict.resolution_data.manager_decision || 
                       `Conflict resolved by ${activeConflict.resolution_method}.`}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              Select a conflict or create a new one
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConflictResolutionPanel;
