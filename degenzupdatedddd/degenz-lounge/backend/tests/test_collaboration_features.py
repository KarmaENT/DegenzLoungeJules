import unittest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from main import app
from app.models import models

# Create an in-memory SQLite database for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Override the get_db dependency
def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

# Create test client
client = TestClient(app)

class TestCollaborationFeatures(unittest.TestCase):
    def setUp(self):
        # Create the database tables
        Base.metadata.create_all(bind=engine)
        
        # Create a test user
        db = TestingSessionLocal()
        test_user = models.User(
            username="testuser",
            email="test@example.com",
            hashed_password="hashed_password"
        )
        db.add(test_user)
        db.commit()
        
        # Create test agents
        test_agent1 = models.Agent(
            name="Test Agent 1",
            role="Researcher",
            personality="Analytical and thorough",
            system_instructions="Research topics thoroughly",
            examples="Example research task",
            owner_id=1
        )
        test_agent2 = models.Agent(
            name="Test Agent 2",
            role="Writer",
            personality="Creative and articulate",
            system_instructions="Write engaging content",
            examples="Example writing task",
            owner_id=1
        )
        db.add(test_agent1)
        db.add(test_agent2)
        db.commit()
        
        # Create a test session
        test_session = models.Session(
            name="Test Session",
            owner_id=1
        )
        db.add(test_session)
        db.commit()
        
        # Add agents to the session
        test_session_agent1 = models.SessionAgent(
            session_id=1,
            agent_id=1,
            is_manager=False
        )
        test_session_agent2 = models.SessionAgent(
            session_id=1,
            agent_id=2,
            is_manager=False
        )
        db.add(test_session_agent1)
        db.add(test_session_agent2)
        db.commit()
        
        db.close()
        
        # Mock authentication
        self.auth_headers = {"Authorization": "Bearer test_token"}
    
    def tearDown(self):
        # Drop the database tables
        Base.metadata.drop_all(bind=engine)
    
    def test_agent_to_agent_communication(self):
        """Test direct messaging between agents"""
        # Create a direct message
        direct_message_data = {
            "content": "Hello from Agent 1 to Agent 2",
            "session_id": 1,
            "sender_agent_id": 1,
            "recipient_agent_id": 2,
            "is_private": True
        }
        
        response = client.post(
            "/direct-messages/",
            json=direct_message_data,
            headers=self.auth_headers
        )
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["content"], direct_message_data["content"])
        self.assertEqual(data["sender_agent_id"], direct_message_data["sender_agent_id"])
        self.assertEqual(data["recipient_agent_id"], direct_message_data["recipient_agent_id"])
        
        # Get direct messages for the session
        response = client.get(
            "/direct-messages/session/1",
            headers=self.auth_headers
        )
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertGreaterEqual(len(data), 1)
    
    def test_workflows(self):
        """Test workflow creation and execution"""
        # Create a workflow
        workflow_data = {
            "name": "Test Workflow",
            "description": "A test workflow",
            "steps": [
                {
                    "name": "Research Step",
                    "description": "Research a topic",
                    "agent_id": 1,
                    "instructions": "Research AI advancements",
                    "depends_on": []
                },
                {
                    "name": "Writing Step",
                    "description": "Write about the research",
                    "agent_id": 2,
                    "instructions": "Write an article based on the research",
                    "depends_on": [0]
                }
            ],
            "is_public": True
        }
        
        response = client.post(
            "/workflows/",
            json=workflow_data,
            headers=self.auth_headers
        )
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["name"], workflow_data["name"])
        self.assertEqual(len(data["steps"]), len(workflow_data["steps"]))
        
        # Create a workflow session
        workflow_session_data = {
            "workflow_id": 1,
            "session_id": 1,
            "status": "pending",
            "current_step": 0,
            "results": {}
        }
        
        response = client.post(
            "/workflows/sessions/",
            json=workflow_session_data,
            headers=self.auth_headers
        )
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["workflow_id"], workflow_session_data["workflow_id"])
        self.assertEqual(data["session_id"], workflow_session_data["session_id"])
    
    def test_conflict_resolution(self):
        """Test conflict resolution system"""
        # Create a conflict resolution
        conflict_data = {
            "session_id": 1,
            "conflict_message_id": 1,  # This would be a real message ID in practice
            "resolution_method": "voting",
            "resolution_data": {
                "options": ["Option A", "Option B", "Option C"]
            },
            "resolved_by_agent_id": None
        }
        
        response = client.post(
            "/conflict-resolution/",
            json=conflict_data,
            headers=self.auth_headers
        )
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["session_id"], conflict_data["session_id"])
        self.assertEqual(data["resolution_method"], conflict_data["resolution_method"])
        
        # Submit a vote
        vote_data = {
            "agent_id": 1,
            "vote": "Option A"
        }
        
        response = client.post(
            f"/conflict-resolution/{data['id']}/vote",
            json=vote_data,
            headers=self.auth_headers
        )
        
        self.assertEqual(response.status_code, 200)
        vote_result = response.json()
        self.assertIn("votes", vote_result["resolution_data"])
    
    def test_hierarchical_structures(self):
        """Test team and role management"""
        # Create a role
        role_data = {
            "name": "Team Leader",
            "description": "Leads the team",
            "permissions": {"can_assign_tasks": True},
            "role_type": "leader"
        }
        
        response = client.post(
            "/hierarchy/roles/",
            json=role_data,
            headers=self.auth_headers
        )
        
        self.assertEqual(response.status_code, 200)
        role = response.json()
        self.assertEqual(role["name"], role_data["name"])
        
        # Create a team
        team_data = {
            "name": "Research Team",
            "description": "A team for research tasks",
            "is_public": True,
            "hierarchy_structure": {
                "levels": [
                    {
                        "name": "Leadership",
                        "roles": ["leader"]
                    },
                    {
                        "name": "Members",
                        "roles": ["member"]
                    }
                ]
            },
            "agent_ids": [1, 2],
            "role_ids": [1]
        }
        
        response = client.post(
            "/hierarchy/teams/",
            json=team_data,
            headers=self.auth_headers
        )
        
        self.assertEqual(response.status_code, 200)
        team = response.json()
        self.assertEqual(team["name"], team_data["name"])
        
        # Assign a role to an agent
        assignment_data = {
            "agent_id": 1,
            "role_id": 1
        }
        
        response = client.post(
            f"/hierarchy/teams/{team['id']}/assign-role",
            json=assignment_data,
            headers=self.auth_headers
        )
        
        self.assertEqual(response.status_code, 200)
        assignment = response.json()
        self.assertEqual(assignment["agent_id"], assignment_data["agent_id"])
        self.assertEqual(assignment["role_id"], assignment_data["role_id"])
        
        # Create a team session
        team_session_data = {
            "active_hierarchy": team["hierarchy_structure"]
        }
        
        response = client.post(
            f"/hierarchy/teams/{team['id']}/sessions/1",
            json=team_session_data,
            headers=self.auth_headers
        )
        
        self.assertEqual(response.status_code, 200)
        team_session = response.json()
        self.assertEqual(team_session["team_id"], team["id"])
        self.assertEqual(team_session["session_id"], 1)

if __name__ == "__main__":
    unittest.main()
