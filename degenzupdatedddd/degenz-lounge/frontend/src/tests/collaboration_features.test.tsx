import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

// Import components to test
import AgentCommunication from '../components/agents/AgentCommunication';
import WorkflowEditor from '../components/sandbox/WorkflowEditor';
import WorkflowRunner from '../components/sandbox/WorkflowRunner';
import ConflictResolutionPanel from '../components/sandbox/ConflictResolutionPanel';
import TeamManager from '../components/sandbox/TeamManager';
import HierarchicalCommunication from '../components/sandbox/HierarchicalCommunication';

// Mock axios
const mock = new MockAdapter(axios);

// Mock data
const mockAgents = [
  { id: 1, name: 'Research Agent', role: 'Researcher' },
  { id: 2, name: 'Writing Agent', role: 'Writer' }
];

const mockDirectMessages = [
  {
    id: 1,
    content: 'Hello from Agent 1 to Agent 2',
    sender_name: 'Research Agent',
    sender_role: 'Researcher',
    recipient_name: 'Writing Agent',
    recipient_role: 'Writer',
    is_private: true,
    timestamp: '2025-04-20T00:00:00.000Z'
  }
];

const mockWorkflows = [
  {
    id: 1,
    name: 'Research and Write',
    description: 'Research a topic and write an article',
    steps: [
      {
        name: 'Research Step',
        description: 'Research a topic',
        agent_id: 1,
        instructions: 'Research AI advancements',
        depends_on: []
      },
      {
        name: 'Writing Step',
        description: 'Write about the research',
        agent_id: 2,
        instructions: 'Write an article based on the research',
        depends_on: [0]
      }
    ],
    is_public: true,
    owner_id: 1,
    created_at: '2025-04-20T00:00:00.000Z',
    updated_at: '2025-04-20T00:00:00.000Z'
  }
];

const mockWorkflowSessions = [
  {
    id: 1,
    workflow_id: 1,
    session_id: 1,
    status: 'in_progress',
    current_step: 1,
    results: {
      '0': {
        agent_name: 'Research Agent',
        agent_role: 'Researcher',
        content: 'Research results on AI advancements',
        timestamp: '2025-04-20T00:05:00.000Z'
      }
    },
    created_at: '2025-04-20T00:00:00.000Z',
    updated_at: '2025-04-20T00:05:00.000Z'
  }
];

const mockConflicts = [
  {
    id: 1,
    session_id: 1,
    conflict_message_id: 1,
    resolution_method: 'voting',
    resolution_data: {
      options: ['Option A', 'Option B', 'Option C'],
      votes: {},
      total_votes: 0,
      status: 'in_progress'
    },
    resolved_by_agent_id: null,
    created_at: '2025-04-20T00:00:00.000Z',
    resolved_at: null
  }
];

const mockRoles = [
  {
    id: 1,
    name: 'Team Leader',
    description: 'Leads the team',
    permissions: { can_assign_tasks: true },
    role_type: 'leader',
    created_at: '2025-04-20T00:00:00.000Z'
  },
  {
    id: 2,
    name: 'Team Member',
    description: 'Regular team member',
    permissions: {},
    role_type: 'member',
    created_at: '2025-04-20T00:00:00.000Z'
  }
];

const mockTeams = [
  {
    id: 1,
    name: 'Research Team',
    description: 'A team for research tasks',
    owner_id: 1,
    is_public: true,
    hierarchy_structure: {
      levels: [
        {
          name: 'Leadership',
          roles: ['leader']
        },
        {
          name: 'Members',
          roles: ['member']
        }
      ]
    },
    created_at: '2025-04-20T00:00:00.000Z',
    updated_at: '2025-04-20T00:00:00.000Z',
    members: mockAgents,
    available_roles: mockRoles
  }
];

const mockTeamSessions = [
  {
    id: 1,
    team_id: 1,
    session_id: 1,
    active_hierarchy: mockTeams[0].hierarchy_structure,
    created_at: '2025-04-20T00:00:00.000Z'
  }
];

const mockHierarchicalMessages = [
  {
    id: 1,
    team_session_id: 1,
    sender_agent_id: 1,
    content: 'Team instruction from leader',
    message_type: 'instruction',
    target_level: 'down',
    target_roles: null,
    created_at: '2025-04-20T00:00:00.000Z'
  },
  {
    id: 2,
    team_session_id: 1,
    sender_agent_id: 2,
    content: 'Report to leader',
    message_type: 'report',
    target_level: 'up',
    target_roles: null,
    created_at: '2025-04-20T00:05:00.000Z',
    parent_id: 1
  }
];

// Setup mock API responses
beforeEach(() => {
  mock.reset();
  
  // Agent Communication endpoints
  mock.onGet('/api/sessions/1/agents').reply(200, mockAgents);
  mock.onGet('/api/direct-messages/session/1').reply(200, mockDirectMessages);
  mock.onPost('/api/direct-messages/').reply(200, {
    id: 2,
    content: 'New message',
    sender_name: 'Research Agent',
    sender_role: 'Researcher',
    recipient_name: 'Writing Agent',
    recipient_role: 'Writer',
    is_private: true,
    timestamp: '2025-04-20T00:10:00.000Z'
  });
  
  // Workflow endpoints
  mock.onGet('/api/workflows/').reply(200, mockWorkflows);
  mock.onPost('/api/workflows/').reply(200, {
    id: 2,
    name: 'New Workflow',
    description: 'A new workflow',
    steps: [],
    is_public: false,
    owner_id: 1,
    created_at: '2025-04-20T00:10:00.000Z',
    updated_at: '2025-04-20T00:10:00.000Z'
  });
  mock.onGet('/api/workflows/sessions/1').reply(200, mockWorkflowSessions);
  mock.onPost('/api/workflows/sessions/').reply(200, {
    id: 2,
    workflow_id: 1,
    session_id: 1,
    status: 'pending',
    current_step: 0,
    results: {},
    created_at: '2025-04-20T00:10:00.000Z',
    updated_at: '2025-04-20T00:10:00.000Z'
  });
  mock.onPost('/api/workflows/execute/1').reply(200, {
    status: 'completed',
    current_step: 2,
    total_steps: 2,
    step_result: {
      agent_name: 'Writing Agent',
      agent_role: 'Writer',
      content: 'Article written based on research',
      timestamp: '2025-04-20T00:10:00.000Z'
    },
    message: 'Step 1 executed successfully'
  });
  
  // Conflict Resolution endpoints
  mock.onGet('/api/conflict-resolution/session/1').reply(200, mockConflicts);
  mock.onPost('/api/conflict-resolution/').reply(200, {
    id: 2,
    session_id: 1,
    conflict_message_id: 2,
    resolution_method: 'consensus',
    resolution_data: {
      proposals: {},
      rounds: 0,
      status: 'in_progress'
    },
    resolved_by_agent_id: null,
    created_at: '2025-04-20T00:10:00.000Z',
    resolved_at: null
  });
  mock.onPost('/api/conflict-resolution/1/vote').reply(200, {
    ...mockConflicts[0],
    resolution_data: {
      ...mockConflicts[0].resolution_data,
      votes: { '1': 'Option A' },
      total_votes: 1
    }
  });
  
  // Team Hierarchy endpoints
  mock.onGet('/api/hierarchy/roles/').reply(200, mockRoles);
  mock.onGet('/api/hierarchy/teams/').reply(200, mockTeams);
  mock.onPost('/api/hierarchy/roles/').reply(200, {
    id: 3,
    name: 'Specialist',
    description: 'Specialized team member',
    permissions: {},
    role_type: 'specialist',
    created_at: '2025-04-20T00:10:00.000Z'
  });
  mock.onPost('/api/hierarchy/teams/').reply(200, {
    id: 2,
    name: 'New Team',
    description: 'A new team',
    owner_id: 1,
    is_public: false,
    hierarchy_structure: {
      levels: [
        {
          name: 'Leadership',
          roles: ['leader']
        },
        {
          name: 'Members',
          roles: ['member']
        }
      ]
    },
    created_at: '2025-04-20T00:10:00.000Z',
    updated_at: '2025-04-20T00:10:00.000Z',
    members: [],
    available_roles: []
  });
  mock.onGet('/api/hierarchy/sessions/1/team-sessions').reply(200, mockTeamSessions);
  mock.onGet('/api/hierarchy/teams/1').reply(200, mockTeams[0]);
  mock.onGet('/api/hierarchy/teams/1/roles').reply(200, mockRoles);
  mock.onGet('/api/hierarchy/teams/1/role-assignments').reply(200, [
    {
      id: 1,
      team_id: 1,
      agent_id: 1,
      role_id: 1,
      assigned_by: 1,
      created_at: '2025-04-20T00:00:00.000Z'
    },
    {
      id: 2,
      team_id: 1,
      agent_id: 2,
      role_id: 2,
      assigned_by: 1,
      created_at: '2025-04-20T00:00:00.000Z'
    }
  ]);
  mock.onGet('/api/hierarchy/teams/sessions/1/messages').reply(200, mockHierarchicalMessages);
  mock.onPost('/api/hierarchy/teams/sessions/1/messages').reply(200, {
    id: 3,
    team_session_id: 1,
    sender_agent_id: 1,
    content: 'New hierarchical message',
    message_type: 'instruction',
    target_level: 'all',
    target_roles: null,
    created_at: '2025-04-20T00:10:00.000Z'
  });
});

// Wrapper for router context
const renderWithRouter = (ui, { route = '/' } = {}) => {
  window.history.pushState({}, 'Test page', route);
  return render(ui, { wrapper: BrowserRouter });
};

describe('Agent Communication Component', () => {
  test('renders agent communication interface', async () => {
    renderWithRouter(<AgentCommunication />);
    
    // Check if component renders
    expect(screen.getByText('Agent Communication')).toBeInTheDocument();
    
    // Wait for agents to load
    await waitFor(() => {
      expect(screen.getByText('Select sender')).toBeInTheDocument();
      expect(screen.getByText('Select recipient')).toBeInTheDocument();
    });
    
    // Check if message history loads
    await waitFor(() => {
      expect(screen.getByText('Message History')).toBeInTheDocument();
    });
  });
  
  test('can send a message', async () => {
    renderWithRouter(<AgentCommunication />);
    
    // Wait for agents to load
    await waitFor(() => {
      expect(screen.getByText('Select sender')).toBeInTheDocument();
    });
    
    // Select sender and recipient
    fireEvent.change(screen.getByLabelText('Sender Agent'), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText('Recipient Agent'), { target: { value: '2' } });
    
    // Enter message
    fireEvent.change(screen.getByLabelText('Message'), { target: { value: 'Test message' } });
    
    // Send message
    fireEvent.click(screen.getByText('Send Message'));
    
    // Check if API was called
    await waitFor(() => {
      expect(mock.history.post.length).toBe(1);
      expect(JSON.parse(mock.history.post[0].data)).toEqual({
        content: 'Test message',
        session_id: 1,
        sender_agent_id: 1,
        recipient_agent_id: 2,
        is_private: true
      });
    });
  });
});

describe('Workflow Components', () => {
  test('renders workflow editor', async () => {
    renderWithRouter(<WorkflowEditor />);
    
    // Check if component renders
    expect(screen.getByText('Workflow Editor')).toBeInTheDocument();
    
    // Wait for form elements to load
    await waitFor(() => {
      expect(screen.getByText('Workflow Details')).toBeInTheDocument();
      expect(screen.getByText('Add New Step')).toBeInTheDocument();
    });
  });
  
  test('renders workflow runner', async () => {
    renderWithRouter(<WorkflowRunner />);
    
    // Check if component renders
    expect(screen.getByText('Workflow Runner')).toBeInTheDocument();
    
    // Wait for workflows to load
    await waitFor(() => {
      expect(screen.getByText('Start New Workflow')).toBeInTheDocument();
      expect(screen.getByText('Select Workflow')).toBeInTheDocument();
    });
  });
  
  test('can create a workflow', async () => {
    renderWithRouter(<WorkflowEditor />);
    
    // Wait for form to load
    await waitFor(() => {
      expect(screen.getByText('Workflow Details')).toBeInTheDocument();
    });
    
    // Fill in workflow details
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'New Workflow' } });
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'A new workflow' } });
    
    // Add a step
    fireEvent.change(screen.getByLabelText('Step Name'), { target: { value: 'First Step' } });
    fireEvent.change(screen.getByLabelText('Instructions'), { target: { value: 'Step instructions' } });
    fireEvent.click(screen.getByText('Add Step'));
    
    // Save workflow
    fireEvent.click(screen.getByText('Save Workflow'));
    
    // Check if API was called
    await waitFor(() => {
      expect(mock.history.post.length).toBe(1);
      const requestData = JSON.parse(mock.history.post[0].data);
      expect(requestData.name).toBe('New Workflow');
      expect(requestData.description).toBe('A new workflow');
      expect(requestData.steps.length).toBe(1);
    });
  });
});

describe('Conflict Resolution Component', () => {
  test('renders conflict resolution panel', async () => {
    renderWithRouter(<ConflictResolutionPanel />);
    
    // Check if component renders
    expect(screen.getByText('Conflict Resolution')).toBeInTheDocument();
    
    // Wait for conflicts to load
    await waitFor(() => {
      expect(screen.getByText('Conflicts')).toBeInTheDocument();
      expect(screen.getByText('Create New Conflict')).toBeInTheDocument();
    });
  });
  
  test('can create a conflict', async () => {
    renderWithRouter(<ConflictResolutionPanel />);
    
    // Wait for form to load
    await waitFor(() => {
      expect(screen.getByText('Create New Conflict')).toBeInTheDocument();
    });
    
    // Select resolution method and agent
    fireEvent.change(screen.getByLabelText('Resolution Method'), { target: { value: 'consensus' } });
    fireEvent.change(screen.getByLabelText('Initial Agent'), { target: { value: '1' } });
    
    // Create conflict
    fireEvent.click(screen.getByText('Create Conflict'));
    
    // Check if API was called
    await waitFor(() => {
      expect(mock.history.post.length).toBe(1);
      const requestData = JSON.parse(mock.history.post[0].data);
      expect(requestData.resolution_method).toBe('consensus');
    });
  });
});

describe('Team Hierarchy Components', () => {
  test('renders team manager', async () => {
    renderWithRouter(<TeamManager />);
    
    // Check if component renders
    expect(screen.getByText('Team Hierarchy Manager')).toBeInTheDocument();
    
    // Wait for teams to load
    await waitFor(() => {
      expect(screen.getByText('Teams')).toBeInTheDocument();
      expect(screen.getByText('Create New Team')).toBeInTheDocument();
      expect(screen.getByText('Create New Role')).toBeInTheDocument();
    });
  });
  
  test('renders hierarchical communication', async () => {
    renderWithRouter(<HierarchicalCommunication />);
    
    // Check if component renders
    expect(screen.getByText('Hierarchical Team Communication')).toBeInTheDocument();
    
    // Wait for team sessions to load
    await waitFor(() => {
      expect(screen.getByText('Select Team Session')).toBeInTheDocument();
      expect(screen.getByText('Message History')).toBeInTheDocument();
    });
  });
  
  test('can create a team', async () => {
    renderWithRouter(<TeamManager />);
    
    // Wait for form to load
    await waitFor(() => {
      expect(screen.getByText('Create New Team')).toBeInTheDocument();
    });
    
    // Fill in team details
    fireEvent.change(screen.getByLabelText('Team Name'), { target: { value: 'New Team' } });
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'A new team' } });
    
    // Create team
    fireEvent.click(screen.getByText('Create Team'));
    
    // Check if API was called
    await waitFor(() => {
      expect(mock.history.post.length).toBe(1);
      const requestData = JSON.parse(mock.history.post[0].data);
      expect(requestData.name).toBe('New Team');
      expect(requestData.description).toBe('A new team');
    });
  });
  
  test('can send hierarchical message', async () => {
    renderWithRouter(<HierarchicalCommunication />);
    
    // Wait for team sessions to load
    await waitFor(() => {
      expect(screen.getByText('Select Team Session')).toBeInTheDocument();
    });
    
    // Select team session
    fireEvent.change(screen.getByLabelText('Select Team Session'), { target: { value: '1' } });
    
    // Wait for team details to load
    await waitFor(() => {
      expect(screen.getByText('Send Message')).toBeInTheDocument();
    });
    
    // Select sender agent
    fireEvent.change(screen.getByLabelText('Sender Agent'), { target: { value: '1' } });
    
    // Enter message
    fireEvent.change(screen.getByLabelText('Message'), { target: { value: 'Test hierarchical message' } });
    
    // Send message
    fireEvent.click(screen.getByText('Send Message'));
    
    // Check if API was called
    await waitFor(() => {
      expect(mock.history.post.length).toBe(1);
      const requestData = JSON.parse(mock.history.post[0].data);
      expect(requestData.content).toBe('Test hierarchical message');
      expect(requestData.sender_agent_id).toBe(1);
    });
  });
});
