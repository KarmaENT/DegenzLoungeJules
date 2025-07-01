import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

interface HierarchicalMessage {
  id: number;
  team_session_id: number;
  sender_agent_id: number;
  content: string;
  message_type: string;
  target_level: string;
  target_roles: number[] | null;
  created_at: string;
  parent_id?: number;
}

interface Agent {
  id: number;
  name: string;
  role: string;
}

interface TeamSession {
  id: number;
  team_id: number;
  session_id: number;
  active_hierarchy: any;
  created_at: string;
}

interface Team {
  id: number;
  name: string;
  description: string;
}

interface AgentRole {
  id: number;
  name: string;
  role_type: string;
}

interface AgentRoleAssignment {
  id: number;
  team_id: number;
  agent_id: number;
  role_id: number;
}

const HierarchicalCommunication: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [teamSessions, setTeamSessions] = useState<TeamSession[]>([]);
  const [selectedTeamSession, setSelectedTeamSession] = useState<TeamSession | null>(null);
  const [messages, setMessages] = useState<HierarchicalMessage[]>([]);
  const [sessionAgents, setSessionAgents] = useState<Agent[]>([]);
  const [team, setTeam] = useState<Team | null>(null);
  const [roles, setRoles] = useState<AgentRole[]>([]);
  const [roleAssignments, setRoleAssignments] = useState<AgentRoleAssignment[]>([]);
  const [messageContent, setMessageContent] = useState('');
  const [messageType, setMessageType] = useState('instruction');
  const [targetLevel, setTargetLevel] = useState('all');
  const [targetRoles, setTargetRoles] = useState<number[]>([]);
  const [selectedSender, setSelectedSender] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch team sessions for this sandbox session
  useEffect(() => {
    const fetchTeamSessions = async () => {
      if (!sessionId) return;
      
      try {
        // This would need to be implemented in the backend
        const response = await axios.get(`/api/hierarchy/sessions/${sessionId}/team-sessions`);
        setTeamSessions(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load team sessions');
        setLoading(false);
      }
    };

    fetchTeamSessions();
  }, [sessionId]);

  // Fetch session agents
  useEffect(() => {
    const fetchSessionAgents = async () => {
      if (!sessionId) return;
      
      try {
        const response = await axios.get(`/api/sessions/${sessionId}/agents`);
        setSessionAgents(response.data);
      } catch (err) {
        setError('Failed to load session agents');
      }
    };

    fetchSessionAgents();
  }, [sessionId]);

  // Fetch team details and hierarchical messages when a team session is selected
  useEffect(() => {
    const fetchTeamSessionDetails = async () => {
      if (!selectedTeamSession) return;
      
      try {
        // Fetch team details
        const teamResponse = await axios.get(`/api/hierarchy/teams/${selectedTeamSession.team_id}`);
        setTeam(teamResponse.data);
        
        // Fetch roles for this team
        const rolesResponse = await axios.get(`/api/hierarchy/teams/${selectedTeamSession.team_id}/roles`);
        setRoles(rolesResponse.data);
        
        // Fetch role assignments for this team
        const assignmentsResponse = await axios.get(`/api/hierarchy/teams/${selectedTeamSession.team_id}/role-assignments`);
        setRoleAssignments(assignmentsResponse.data);
        
        // Fetch hierarchical messages
        const messagesResponse = await axios.get(`/api/hierarchy/teams/sessions/${selectedTeamSession.id}/messages`);
        setMessages(messagesResponse.data);
      } catch (err) {
        setError('Failed to load team session details');
      }
    };

    fetchTeamSessionDetails();
    
    // Set up interval to refresh messages
    const intervalId = setInterval(async () => {
      if (selectedTeamSession) {
        try {
          const messagesResponse = await axios.get(`/api/hierarchy/teams/sessions/${selectedTeamSession.id}/messages`);
          setMessages(messagesResponse.data);
        } catch (err) {
          console.error('Failed to refresh messages');
        }
      }
    }, 5000);
    
    return () => clearInterval(intervalId);
  }, [selectedTeamSession]);

  const handleSendMessage = async () => {
    if (!selectedTeamSession || !selectedSender || !messageContent.trim()) {
      setError('Please select a sender agent and enter a message');
      return;
    }

    try {
      const response = await axios.post(`/api/hierarchy/teams/sessions/${selectedTeamSession.id}/messages`, {
        sender_agent_id: selectedSender,
        content: messageContent,
        message_type: messageType,
        target_level: targetLevel,
        target_roles: targetRoles.length > 0 ? targetRoles : null
      });

      // Add the new message to the list
      setMessages([...messages, response.data]);
      
      // Clear the message input
      setMessageContent('');
      
      setSuccessMessage('Message sent successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Failed to send message');
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  const getAgentName = (agentId: number) => {
    const agent = sessionAgents.find(a => a.id === agentId);
    return agent ? agent.name : 'Unknown';
  };

  const getAgentRole = (agentId: number) => {
    const agent = sessionAgents.find(a => a.id === agentId);
    return agent ? agent.role : 'Unknown';
  };

  const getAgentHierarchyRole = (agentId: number) => {
    const assignment = roleAssignments.find(ra => ra.agent_id === agentId);
    if (!assignment) return 'Member';
    
    const role = roles.find(r => r.id === assignment.role_id);
    return role ? role.name : 'Member';
  };

  const getMessageTypeColor = (type: string) => {
    switch (type) {
      case 'instruction':
        return 'bg-blue-700';
      case 'report':
        return 'bg-green-700';
      case 'question':
        return 'bg-yellow-700';
      case 'response':
        return 'bg-purple-700';
      case 'acknowledgment':
        return 'bg-indigo-700';
      case 'answer':
        return 'bg-pink-700';
      case 'feedback':
        return 'bg-orange-700';
      default:
        return 'bg-gray-700';
    }
  };

  const getTargetLevelLabel = (level: string) => {
    switch (level) {
      case 'up':
        return 'To Leaders';
      case 'down':
        return 'To Members';
      case 'same':
        return 'To Peers';
      case 'all':
        return 'To Everyone';
      case 'direct':
        return 'Direct Reply';
      default:
        return level;
    }
  };

  if (loading) {
    return <div className="p-4">Loading team sessions...</div>;
  }

  return (
    <div className="bg-gray-800 text-white rounded-lg shadow-lg p-4 h-full flex flex-col">
      <h2 className="text-xl font-bold mb-4">Hierarchical Team Communication</h2>
      
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
      
      <div className="mb-4">
        <label className="block mb-2">Select Team Session</label>
        <select 
          className="w-full bg-gray-700 text-white p-2 rounded"
          value={selectedTeamSession?.id || ''}
          onChange={(e) => {
            const id = parseInt(e.target.value);
            const session = teamSessions.find(ts => ts.id === id) || null;
            setSelectedTeamSession(session);
          }}
        >
          <option value="">Select a team session</option>
          {teamSessions.map(ts => (
            <option key={ts.id} value={ts.id}>
              Team Session #{ts.id} (Created: {formatTimestamp(ts.created_at)})
            </option>
          ))}
        </select>
      </div>
      
      {selectedTeamSession && team && (
        <div className="mb-4 bg-gray-700 p-3 rounded">
          <h3 className="font-semibold">{team.name}</h3>
          <p className="text-sm text-gray-300">{team.description}</p>
          <div className="text-xs text-gray-400 mt-1">
            Active hierarchy with {roles.length} roles and {roleAssignments.length} assignments
          </div>
        </div>
      )}
      
      <div className="flex-grow grid grid-cols-3 gap-4">
        <div className="col-span-2 bg-gray-900 rounded p-4 overflow-y-auto">
          <h3 className="text-lg font-semibold mb-3">Message History</h3>
          
          {!selectedTeamSession ? (
            <div className="text-gray-400">Select a team session to view messages</div>
          ) : messages.length === 0 ? (
            <div className="text-gray-400">No messages yet</div>
          ) : (
            <div className="space-y-4">
              {messages.map(message => {
                const isResponse = message.parent_id !== undefined;
                
                return (
                  <div 
                    key={message.id} 
                    className={`p-3 rounded-lg ${isResponse ? 'ml-8 border-l-2 border-gray-700' : ''}`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <span className="font-bold">{getAgentName(message.sender_agent_id)}</span>
                        <span className="text-gray-400 text-sm ml-2">
                          ({getAgentRole(message.sender_agent_id)})
                        </span>
                        <span className="text-gray-400 text-xs ml-2">
                          [{getAgentHierarchyRole(message.sender_agent_id)}]
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className={`text-xs px-2 py-1 rounded mr-2 ${getMessageTypeColor(message.message_type)}`}>
                          {message.message_type}
                        </span>
                        <span className="text-xs text-gray-400">
                          {formatTimestamp(message.created_at)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-400 mb-1">
                      {getTargetLevelLabel(message.target_level)}
                      {message.target_roles && message.target_roles.length > 0 && (
                        <span> • Targeted roles: {message.target_roles.map(id => {
                          const role = roles.find(r => r.id === id);
                          return role ? role.name : id;
                        }).join(', ')}</span>
                      )}
                    </div>
                    
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        <div className="col-span-1 bg-gray-900 rounded p-4">
          <h3 className="text-lg font-semibold mb-3">Send Message</h3>
          
          {!selectedTeamSession ? (
            <div className="text-gray-400">Select a team session to send messages</div>
          ) : (
            <>
              <div className="mb-3">
                <label className="block mb-1 text-sm">Sender Agent</label>
                <select 
                  className="w-full bg-gray-700 text-white p-2 rounded"
                  value={selectedSender || ''}
                  onChange={(e) => setSelectedSender(e.target.value ? parseInt(e.target.value) : null)}
                >
                  <option value="">Select sender</option>
                  {sessionAgents.map(agent => {
                    // Check if this agent is in the team
                    const assignment = roleAssignments.find(ra => ra.agent_id === agent.id);
                    if (!assignment) return null;
                    
                    return (
                      <option key={agent.id} value={agent.id}>
                        {agent.name} ({getAgentHierarchyRole(agent.id)})
                      </option>
                    );
                  })}
                </select>
              </div>
              
              <div className="mb-3">
                <label className="block mb-1 text-sm">Message Type</label>
                <select 
                  className="w-full bg-gray-700 text-white p-2 rounded"
                  value={messageType}
                  onChange={(e) => setMessageType(e.target.value)}
                >
                  <option value="instruction">Instruction</option>
                  <option value="report">Report</option>
                  <option value="question">Question</option>
                </select>
              </div>
              
              <div className="mb-3">
                <label className="block mb-1 text-sm">Target Level</label>
                <select 
                  className="w-full bg-gray-700 text-white p-2 rounded"
                  value={targetLevel}
                  onChange={(e) => setTargetLevel(e.target.value)}
                >
                  <option value="all">Everyone</option>
                  <option value="up">Up (to leaders)</option>
                  <option value="down">Down (to members)</option>
                  <option value="same">Same (to peers)</option>
                </select>
              </div>
              
              <div className="mb-3">
                <label className="block mb-1 text-sm">Target Specific Roles (Optional)</label>
                <div className="max-h-40 overflow-y-auto bg-gray-700 rounded p-2">
                  {roles.map(role => (
                    <div key={role.id} className="flex items-center mb-1">
                      <input 
                        type="checkbox" 
                        id={`role-${role.id}`} 
                        checked={targetRoles.includes(role.id)} 
                        onChange={() => {
                          if (targetRoles.includes(role.id)) {
                            setTargetRoles(targetRoles.filter(id => id !== role.id));
                          } else {
                            setTargetRoles([...targetRoles, role.id]);
                          }
                        }}
                        className="mr-2"
                      />
                      <label htmlFor={`role-${role.id}`}>
                        {role.name} ({role.role_type})
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mb-3">
                <label className="block mb-1 text-sm">Message</label>
                <textarea 
                  className="w-full bg-gray-700 text-white p-2 rounded resize-none"
                  rows={6}
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  placeholder="Enter your message here..."
                />
              </div>
              
              <button 
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full"
                onClick={handleSendMessage}
                disabled={!selectedSender || !messageContent.trim()}
              >
                Send Message
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default HierarchicalCommunication;
