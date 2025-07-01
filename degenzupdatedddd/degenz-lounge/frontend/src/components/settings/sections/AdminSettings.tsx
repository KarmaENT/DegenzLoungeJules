import React, { useState } from 'react';

const ToggleSwitch: React.FC<{ label: string, enabled: boolean, onToggle: () => void, tooltip?: string }> = 
  ({ label, enabled, onToggle, tooltip }) => {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-gray-300">
        {label}
        {tooltip && <span className="ml-1 text-xs text-gray-500">({tooltip})</span>}
      </span>
      <button
        onClick={onToggle}
        className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-200 ease-in-out 
                    ${enabled ? 'bg-purple-600' : 'bg-gray-600'}`}
      >
        <span className="sr-only">{label}</span>
        <span
          className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 ease-in-out 
                      ${enabled ? 'translate-x-6' : 'translate-x-1'}`}
        />
      </button>
    </div>
  );
};

// Mock data for users - this would come from an API
const mockUsers = [
  { id: 'user1', name: 'Alice Wonderland', email: 'alice@example.com', role: 'Admin' },
  { id: 'user2', name: 'Bob The Builder', email: 'bob@example.com', role: 'Editor' },
  { id: 'user3', name: 'Charlie Brown', email: 'charlie@example.com', role: 'Viewer' },
];

const userRoles = ['Viewer', 'Editor', 'Admin'];

const AdminSettings: React.FC = () => {
  const [users, setUsers] = useState(mockUsers);
  const [agentApproval, setAgentApproval] = useState(false);
  const [lockDefaultProvider, setLockDefaultProvider] = useState(false);

  const handleRoleChange = (userId: string, newRole: string) => {
    setUsers(prevUsers => prevUsers.map(user => 
      user.id === userId ? { ...user, role: newRole } : user
    ));
    console.log(`User ${userId} role changed to ${newRole}`);
  };

  return (
    <div>
      <h3 className="text-2xl font-semibold mb-6 text-gray-100">Admin Settings</h3>
      <p className="text-sm text-yellow-400 bg-yellow-900/30 p-3 rounded-md mb-6 border border-yellow-700">
        These settings are powerful and affect all users. Visible only to admin users.
      </p>
      <div className="space-y-8">
        {/* User Role Management Setting */}
        <div className="p-4 bg-gray-700 rounded-lg">
          <h4 className="text-lg font-medium text-gray-300 mb-3">User Role Management</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-600">
              <thead className="bg-gray-600">
                <tr>
                  <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Name</th>
                  <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Email</th>
                  <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Role</th>
                </tr>
              </thead>
              <tbody className="bg-gray-700 divide-y divide-gray-600">
                {users.map(user => (
                  <tr key={user.id}>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-300">{user.name}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-400">{user.email}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm">
                      <select 
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        className="p-1 bg-gray-600 border border-gray-500 rounded-md focus:ring-purple-500 focus:border-purple-500 text-white text-xs"
                      >
                        {userRoles.map(role => (
                          <option key={role} value={role}>{role}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 mt-3">Assign roles and permissions to users.</p>
        </div>

        {/* Agent Approval Workflow Setting */}
        <div className="p-4 bg-gray-700 rounded-lg">
          <ToggleSwitch 
            label="Agent Approval Workflow"
            enabled={agentApproval}
            onToggle={() => setAgentApproval(!agentApproval)}
            tooltip="If enabled, new agents or significant modifications to existing agents require admin approval."
          />
        </div>
        
        {/* System-Wide Default AI Provider Lock Setting */}
        <div className="p-4 bg-gray-700 rounded-lg">
          <ToggleSwitch 
            label="Lock System-Wide Default AI Provider"
            enabled={lockDefaultProvider}
            onToggle={() => setLockDefaultProvider(!lockDefaultProvider)}
            tooltip="Lock the system-wide default AI provider, preventing users from changing their agent defaults (can still select per agent)."
          />
        </div>

        {/* Reset Button */}
        <div className="mt-8">
          <button className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors">
            Reset Admin Settings to Default
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;

