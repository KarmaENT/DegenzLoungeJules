import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from main import app

# Create test database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
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

@pytest.fixture(scope="function")
def test_db():
    # Create the database tables
    Base.metadata.create_all(bind=engine)
    yield
    # Drop the database tables
    Base.metadata.drop_all(bind=engine)

def test_read_root(test_db):
    response = client.get("/")
    assert response.status_code == 200
    assert "message" in response.json()

def test_register_user(test_db):
    response = client.post(
        "/auth/register",
        json={"username": "testuser", "email": "test@example.com", "password": "password123"},
    )
    assert response.status_code == 200
    assert response.json()["username"] == "testuser"
    assert response.json()["email"] == "test@example.com"

def test_login(test_db):
    # First register a user
    client.post(
        "/auth/register",
        json={"username": "testuser", "email": "test@example.com", "password": "password123"},
    )
    
    # Then try to login
    response = client.post(
        "/auth/token",
        data={"username": "testuser", "password": "password123"},
    )
    assert response.status_code == 200
    assert "access_token" in response.json()
    assert response.json()["token_type"] == "bearer"

def test_create_agent(test_db):
    # First register and login
    client.post(
        "/auth/register",
        json={"username": "testuser", "email": "test@example.com", "password": "password123"},
    )
    login_response = client.post(
        "/auth/token",
        data={"username": "testuser", "password": "password123"},
    )
    token = login_response.json()["access_token"]
    
    # Create an agent
    response = client.post(
        "/agents/",
        json={
            "name": "Test Agent",
            "role": "Tester",
            "personality": "Analytical",
            "system_instructions": "You are a test agent.",
            "examples": []
        },
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    assert response.json()["name"] == "Test Agent"
    assert response.json()["role"] == "Tester"

def test_get_agents(test_db):
    # First register, login, and create an agent
    client.post(
        "/auth/register",
        json={"username": "testuser", "email": "test@example.com", "password": "password123"},
    )
    login_response = client.post(
        "/auth/token",
        data={"username": "testuser", "password": "password123"},
    )
    token = login_response.json()["access_token"]
    
    client.post(
        "/agents/",
        json={
            "name": "Test Agent",
            "role": "Tester",
            "personality": "Analytical",
            "system_instructions": "You are a test agent.",
            "examples": []
        },
        headers={"Authorization": f"Bearer {token}"}
    )
    
    # Get all agents
    response = client.get(
        "/agents/",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["name"] == "Test Agent"

def test_start_sandbox(test_db):
    # First register, login, and create an agent
    client.post(
        "/auth/register",
        json={"username": "testuser", "email": "test@example.com", "password": "password123"},
    )
    login_response = client.post(
        "/auth/token",
        data={"username": "testuser", "password": "password123"},
    )
    token = login_response.json()["access_token"]
    
    # Start a sandbox session
    response = client.post(
        "/sandbox/start",
        json={"name": "Test Session", "description": "A test session"},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    assert response.json()["name"] == "Test Session"
    assert response.json()["description"] == "A test session"
