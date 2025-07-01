import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

interface AgentRole {
  id: number;
  name: string;
  description: string;
  permissions: any; // Consider defining a more specific type for permissions
  role_type: string;
  created_at: string;
}

interface Team {
  id: number;
  name: string;
  description: string;
  owner_id: number;
  is_public: boolean;
  hierarchy_structure: any; // Consider defining a more specific type for hierarchy
  created_at: string;
  updated_at: string;
  members: Agent[]; // Assuming this comes populated or is handled separately
  available_roles: AgentRole[]; // Assuming this comes populated or is handled separately
}

interface Agent {
  id: number;
  name: string;
  role: string; // This might be a general role, not specific to a team context initially
}

interface AgentRoleAssignment {
  id: number;
  team_id: number;
  agent_id: number;
  role_id: number;
  assigned_by: number; // Assuming this is a user ID
  created_at: string;
}

const TeamManager: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [teams, setTeams] = useState<Team[]>([]);
  const [roles, setRoles] = useState<AgentRole[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [roleAssignments, setRoleAssignments] = useState<AgentRoleAssignment[]>([]);
  const [newTeam, setNewTeam] = useState({
    name: '',
    description: '',
    is_public: false,
    hierarchy_structure: {
      levels: [
        {
          name: 'Leadership',
          roles: ['leader']
        },
        {
          name: 'Specialists',
          roles: ['specialist']
        },
        {
          name: 'Members',
          roles: ['member']
        }
      ]
    }
  });
  const [newRole, setNewRole] = useState<Omit<AgentRole, 'id' | 'created_at'>>({
    name: '',
    description: '',
    permissions: {},
    role_type: 'member'
  });
  const [selectedAgentsForNewTeam, setSelectedAgentsForNewTeam] = useState<number[]>([]);
  const [selectedRolesForNewTeam, setSelectedRolesForNewTeam] = useState<number[]>([]);
  const [agentToAssign, setAgentToAssign] = useState<number | ''>('');
  const [roleToAssign, setRoleToAssign] = useState<number | ''>('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch teams
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await axios.get<Team[]>('/api/hierarchy/teams/');
        setTeams(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load teams');
        setLoading(false);
      }
    };
    fetchTeams();
  }, []);

  // Fetch roles
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await axios.get<AgentRole[]>('/api/hierarchy/roles/');
        setRoles(response.data);
      } catch (err) {
        setError('Failed to load roles');
      }
    };
    fetchRoles();
  }, []);

  // Fetch agents
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await axios.get<Agent[]>('/api/agents/'); // Assuming a general agent endpoint
        setAgents(response.data);
      } catch (err) {
        setError('Failed to load agents');
      }
    };
    fetchAgents();
  }, []);

  // Fetch role assignments when a team is selected
  useEffect(() => {
    const fetchRoleAssignments = async () => {
      if (!selectedTeam) {
        setRoleAssignments([]); // Clear assignments if no team is selected
        return;
      }
      try {
        const response = await axios.get<AgentRoleAssignment[]>(`/api/hierarchy/teams/${selectedTeam.id}/role-assignments`);
        setRoleAssignments(response.data);
      } catch (err) {
        setError('Failed to load role assignments for the selected team');
        setRoleAssignments([]); // Clear on error too
      }
    };
    fetchRoleAssignments();
  }, [selectedTeam]);

  const handleCreateTeam = async () => {
    if (!newTeam.name) {
        setError('Team name is required.');
        return;
    }
    try {
      const response = await axios.post<Team>('/api/hierarchy/teams/', {
        ...newTeam,
        agent_ids: selectedAgentsForNewTeam, // Pass selected agent IDs
        role_ids: selectedRolesForNewTeam   // Pass selected role IDs
      });
      setTeams([...teams, response.data]);
      setSelectedTeam(response.data); // Select the newly created team
      setNewTeam({
        name: '',
        description: '',
        is_public: false,
        hierarchy_structure: { levels: [{ name: 'Leadership', roles: ['leader'] }, { name: 'Specialists', roles: ['specialist'] }, { name: 'Members', roles: ['member'] }] }
      });
      setSelectedAgentsForNewTeam([]);
      setSelectedRolesForNewTeam([]);
      setSuccessMessage('Team created successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Failed to create team');
    }
  };

  const handleCreateRole = async () => {
    if (!newRole.name) {
        setError('Role name is required.');
        return;
    }
    try {
      const response = await axios.post<AgentRole>('/api/hierarchy/roles/', newRole);
      setRoles([...roles, response.data]);
      setNewRole({ name: '', description: '', permissions: {}, role_type: 'member' });
      setSuccessMessage('Role created successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Failed to create role');
    }
  };

  const handleAssignRoleToAgentInTeam = async () => {
    if (!selectedTeam || !agentToAssign || !roleToAssign) {
        setError('Please select a team, agent, and role to assign.');
        return;
    }
    try {
      const response = await axios.post<AgentRoleAssignment>(`/api/hierarchy/teams/${selectedTeam.id}/assign-role`, {
        agent_id: agentToAssign,
        role_id: roleToAssign
      });
      setRoleAssignments([...roleAssignments, response.data]);
      setAgentToAssign(''); // Reset selection
      setRoleToAssign('');  // Reset selection
      setSuccessMessage('Role assigned successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Failed to assign role');
    }
  };

  const handleRemoveRoleAssignment = async (assignmentId: number) => {
    if (!selectedTeam) return;
    try {
      await axios.delete(`/api/hierarchy/teams/${selectedTeam.id}/remove-role/${assignmentId}`);
      setRoleAssignments(roleAssignments.filter(ra => ra.id !== assignmentId));
      setSuccessMessage('Role assignment removed successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Failed to remove role assignment');
    }
  };

  const handleCreateTeamSession = async () => {
    if (!selectedTeam || !sessionId) {
        setError('Please select a team to use in the current session.');
        return;
    }
    try {
      // Assuming the backend expects the team ID and session ID in the URL or body
      // And the active_hierarchy is part of the team object or needs to be sent
      await axios.post(`/api/hierarchy/teams/${selectedTeam.id}/sessions/${sessionId}`, {
        active_hierarchy: selectedTeam.hierarchy_structure // Or however the backend expects this
      });
      setSuccessMessage(`Team '${selectedTeam.name}' is now active in this session.`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Failed to activate team in session');
    }
  };

  const formatTimestamp = (timestamp: string): string => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleString();
  };

  const getAgentName = (agentId: number): string => agents.find(a => a.id === agentId)?.name || 'Unknown Agent';
  const getRoleName = (roleId: number): string => roles.find(r => r.id === roleId)?.name || 'Unknown Role';

  if (loading && teams.length === 0) { // Only show initial loading if no teams are loaded yet
    return <div className="p-4 text-center text-gray-400">Loading team management console...</div>;
  }

  return (
    <div className="bg-gray-800 text-white rounded-lg shadow-xl p-6 h-full flex flex-col space-y-6">
      <h2 className="text-2xl font-bold text-purple-400">Team Hierarchy Manager</h2>
      
      {error && <div className="bg-red-700 text-white p-3 rounded-md text-sm">{error}</div>}
      {successMessage && <div className="bg-green-700 text-white p-3 rounded-md text-sm">{successMessage}</div>}
      
      <div className="grid md:grid-cols-3 gap-6 flex-grow min-h-0"> {/* min-h-0 for flex child scroll */} 
        {/* Teams List and Creation Panel */}
        <div className="md:col-span-1 bg-gray-900 rounded-lg p-4 flex flex-col space-y-4 overflow-y-auto">
          <div>
            <h3 className="text-lg font-semibold mb-3 text-purple-300">Teams</h3>
            {teams.length === 0 && !loading ? (
              <p className="text-gray-400 text-sm">No teams created yet. Create one below.</p>
            ) : (
              <div className="space-y-2">
                {teams.map(team => (
                  <div 
                    key={team.id} 
                    className={`p-3 rounded-md cursor-pointer transition-all duration-150 ${selectedTeam?.id === team.id ? 'bg-purple-700 shadow-lg' : 'bg-gray-700 hover:bg-gray-600'}`}
                    onClick={() => setSelectedTeam(team)}
                  >
                    <div className="font-semibold">{team.name}</div>
                    <div className="text-xs text-gray-400">{team.description.substring(0,50)}{team.description.length > 50 ? '...' : ''}</div>
                    <div className="text-xs text-gray-500 mt-1">Created: {formatTimestamp(team.created_at)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-gray-700">
            <h3 className="text-lg font-semibold mb-3 text-purple-300">Create New Team</h3>
            <div className="space-y-3">
              <input type="text" className="w-full bg-gray-700 text-white p-2 rounded-md border border-gray-600 focus:ring-purple-500 focus:border-purple-500" value={newTeam.name} onChange={(e) => setNewTeam({...newTeam, name: e.target.value})} placeholder="Team Name" />
              <textarea className="w-full bg-gray-700 text-white p-2 rounded-md border border-gray-600 resize-none focus:ring-purple-500 focus:border-purple-500" rows={2} value={newTeam.description} onChange={(e) => setNewTeam({...newTeam, description: e.target.value})} placeholder="Team Description" />
              <div className="flex items-center"><input type="checkbox" id="is_public_new_team" checked={newTeam.is_public} onChange={() => setNewTeam({...newTeam, is_public: !newTeam.is_public})} className="mr-2 h-4 w-4 text-purple-600 bg-gray-600 border-gray-500 rounded focus:ring-purple-500" /><label htmlFor="is_public_new_team" className="text-sm">Make Public</label></div>
              {/* Agent and Role selection for new team can be added here if needed, or handled by assigning after creation */}
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition-colors disabled:opacity-50" onClick={handleCreateTeam} disabled={!newTeam.name}>Create Team</button>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-700">
            <h3 className="text-lg font-semibold mb-3 text-purple-300">Create New Role</h3>
            <div className="space-y-3">
              <input type="text" className="w-full bg-gray-700 text-white p-2 rounded-md border border-gray-600 focus:ring-purple-500 focus:border-purple-500" value={newRole.name} onChange={(e) => setNewRole({...newRole, name: e.target.value})} placeholder="Role Name" />
              <textarea className="w-full bg-gray-700 text-white p-2 rounded-md border border-gray-600 resize-none focus:ring-purple-500 focus:border-purple-500" rows={2} value={newRole.description} onChange={(e) => setNewRole({...newRole, description: e.target.value})} placeholder="Role Description" />
              <select className="w-full bg-gray-700 text-white p-2 rounded-md border border-gray-600 focus:ring-purple-500 focus:border-purple-500" value={newRole.role_type} onChange={(e) => setNewRole({...newRole, role_type: e.target.value})}>
                <option value="leader">Leader</option> <option value="member">Member</option> <option value="specialist">Specialist</option> <option value="observer">Observer</option>
              </select>
              <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-md transition-colors disabled:opacity-50" onClick={handleCreateRole} disabled={!newRole.name}>Create Role</button>
            </div>
          </div>
        </div>

        {/* Selected Team Details and Management Panel */}
        <div className="md:col-span-2 bg-gray-900 rounded-lg p-4 flex flex-col space-y-4 overflow-y-auto">
          {selectedTeam ? (
            <>
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-purple-300">Team: {selectedTeam.name}</h3>
                {sessionId && <button className="bg-green-600 hover:bg-green-700 text-white font-semibold py-1.5 px-3 rounded-md text-sm transition-colors" onClick={handleCreateTeamSession}>Use in Session</button>}
              </div>
              <p className="text-gray-400 text-sm">{selectedTeam.description}</p>
              <div className="text-xs text-gray-500">{selectedTeam.is_public ? 'Public Team' : 'Private Team'} | Created: {formatTimestamp(selectedTeam.created_at)} | Updated: {formatTimestamp(selectedTeam.updated_at)}</div>
              
              {/* Role Assignments Section */}
              <div>
                <h4 className="font-semibold mb-2 text-purple-300 border-b border-gray-700 pb-1">Role Assignments</h4>
                {roleAssignments.length === 0 ? <p className="text-gray-400 text-sm">No roles assigned in this team yet.</p> : (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                    {roleAssignments.map(ra => (
                      <div key={ra.id} className="bg-gray-700 p-2.5 rounded-md flex justify-between items-center">
                        <div>
                          <span className="font-medium text-white">{getAgentName(ra.agent_id)}</span> as <span className="font-medium text-purple-400">{getRoleName(ra.role_id)}</span>
                          <div className="text-xs text-gray-500">Assigned: {formatTimestamp(ra.created_at)}</div>
                        </div>
                        <button className="text-red-500 hover:text-red-400 text-xs font-medium" onClick={() => handleRemoveRoleAssignment(ra.id)}>Remove</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Assign New Role Section */}
              <div className="pt-4 border-t border-gray-700">
                <h4 className="font-semibold mb-2 text-purple-300">Assign Role to Agent</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                  <select value={agentToAssign} onChange={(e) => setAgentToAssign(Number(e.target.value))} className="md:col-span-1 w-full bg-gray-700 text-white p-2 rounded-md border border-gray-600 focus:ring-purple-500 focus:border-purple-500">
                    <option value="">Select Agent</option>
                    {agents.map(agent => <option key={agent.id} value={agent.id}>{agent.name}</option>)}
                  </select>
                  <select value={roleToAssign} onChange={(e) => setRoleToAssign(Number(e.target.value))} className="md:col-span-1 w-full bg-gray-700 text-white p-2 rounded-md border border-gray-600 focus:ring-purple-500 focus:border-purple-500">
                    <option value="">Select Role</option>
                    {roles.map(role => <option key={role.id} value={role.id}>{role.name}</option> // Show all available roles
                    )}
                  </select>
                  <button className="md:col-span-1 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-3 rounded-md transition-colors disabled:opacity-50" onClick={handleAssignRoleToAgentInTeam} disabled={!agentToAssign || !roleToAssign}>Assign Role</button>
                </div>
              </div>
              {/* TODO: Display Hierarchy Structure, Members, Available Roles for the selected team */}
            </>
          ) : (
            <p className="text-gray-400 text-center py-10">Select a team from the list to view its details and manage roles, or create a new team.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamManager;

