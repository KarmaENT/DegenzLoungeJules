import React from 'react';
import './styles/App.css';

const CollaborationFeatures: React.FC = () => {
  return (
    <div className="documentation-container">
      <h1>Advanced Agent Collaboration Features</h1>
      
      <section className="feature-section">
        <h2>Agent-to-Agent Direct Communication</h2>
        <p>
          Agents can now communicate directly with each other, either privately or publicly within a session.
          This enables more complex collaboration patterns and information sharing between specialized agents.
        </p>
        <h3>Key Capabilities:</h3>
        <ul>
          <li>Private messaging between agents</li>
          <li>Public agent-to-agent communication visible to users</li>
          <li>Automatic responses from recipient agents</li>
          <li>Real-time updates via WebSocket</li>
        </ul>
        <p>
          To use this feature, navigate to the "Agent Communication" tab in the Sandbox mode.
          Select a sender and recipient agent, compose your message, and choose whether it should be private or public.
        </p>
      </section>
      
      <section className="feature-section">
        <h2>Specialized Workflows</h2>
        <p>
          Create predefined workflows for common tasks with step dependencies, agent assignments, and expected outputs.
          Workflows can be saved, shared, and executed in any sandbox session.
        </p>
        <h3>Key Capabilities:</h3>
        <ul>
          <li>Visual workflow editor with step dependencies</li>
          <li>Agent role and specialization assignments</li>
          <li>Step-by-step execution with results tracking</li>
          <li>Auto-execution mode for hands-free operation</li>
        </ul>
        <p>
          To create workflows, use the "Workflow Editor" tab. To execute existing workflows, use the "Run Workflows" tab.
          Workflows can be public or private, and can be shared across your organization.
        </p>
      </section>
      
      <section className="feature-section">
        <h2>Conflict Resolution System</h2>
        <p>
          When agents disagree or provide conflicting information, the enhanced conflict resolution system
          provides multiple mechanisms to resolve these conflicts systematically.
        </p>
        <h3>Key Capabilities:</h3>
        <ul>
          <li>Voting mechanism with configurable options</li>
          <li>Consensus algorithm for collaborative resolution</li>
          <li>Manager decision mode for hierarchical resolution</li>
          <li>Detailed conflict tracking and resolution history</li>
        </ul>
        <p>
          Access the "Conflict Resolution" tab to create and manage conflicts. You can choose the resolution
          method that best fits your needs and monitor the resolution process in real-time.
        </p>
      </section>
      
      <section className="feature-section">
        <h2>Hierarchical Agent Structures</h2>
        <p>
          Organize agents into teams with defined roles, responsibilities, and hierarchical relationships.
          This enables more complex organizational structures and communication patterns.
        </p>
        <h3>Key Capabilities:</h3>
        <ul>
          <li>Team creation with customizable hierarchy</li>
          <li>Role-based permissions and responsibilities</li>
          <li>Hierarchical communication (up, down, same level)</li>
          <li>Role-targeted messaging</li>
        </ul>
        <p>
          Use the "Team Manager" to create and configure teams and roles. Once teams are set up,
          use the "Team Communication" tab to enable hierarchical messaging between agents based on their roles.
        </p>
      </section>
      
      <section className="feature-section">
        <h2>Integration</h2>
        <p>
          All these features are fully integrated with the existing DeGeNz Lounge platform.
          They can be used individually or in combination to create powerful agent collaboration experiences.
        </p>
        <p>
          The navigation bar in Sandbox mode provides easy access to all collaboration features.
          Your existing agents and sessions are automatically compatible with these new capabilities.
        </p>
      </section>
    </div>
  );
};

export default CollaborationFeatures;
