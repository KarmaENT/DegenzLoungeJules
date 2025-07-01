import pytest
from unittest.mock import patch, MagicMock
from app.services.ai.gemini_service import GeminiService, LangChainService

@pytest.fixture
def gemini_service():
    return GeminiService()

@pytest.fixture
def langchain_service(gemini_service):
    return LangChainService(gemini_service)

@patch('app.services.ai.gemini_service.Gemini')
def test_gemini_service_initialization(mock_gemini):
    # Arrange
    mock_gemini_instance = MagicMock()
    mock_gemini.return_value = mock_gemini_instance
    
    # Act
    service = GeminiService()
    
    # Assert
    assert service.model == mock_gemini_instance
    mock_gemini.assert_called_once()

@patch.object(GeminiService, 'generate_response')
async def test_apply_agent_persona(mock_generate_response, gemini_service):
    # Arrange
    mock_generate_response.return_value = "This is a test response"
    agent = {
        "name": "Test Agent",
        "role": "Tester",
        "personality": "Analytical",
        "system_instructions": "You are a test agent."
    }
    prompt = "Hello, agent!"
    
    # Act
    result = await gemini_service.apply_agent_persona(prompt, agent)
    
    # Assert
    assert "Test Agent (Tester): This is a test response" == result
    mock_generate_response.assert_called_once()
    
@patch.object(GeminiService, 'generate_response')
async def test_run_manager_workflow(mock_generate_response, langchain_service):
    # Arrange
    mock_generate_response.return_value = '{"thought": "test thought", "assigned_agents": [{"agent_id": "1", "task": "test task"}]}'
    user_message = "Hello, manager!"
    available_agents = [
        {
            "id": 1,
            "name": "Test Agent",
            "role": "Tester",
            "personality": "Analytical",
            "system_instructions": "You are a test agent."
        }
    ]
    
    # Act
    result = await langchain_service.run_manager_workflow(user_message, available_agents)
    
    # Assert
    assert result["thought"] == "test thought"
    assert len(result["assigned_agents"]) == 1
    assert result["assigned_agents"][0]["agent_id"] == "1"
    assert result["assigned_agents"][0]["task"] == "test task"
    mock_generate_response.assert_called_once()

@patch.object(GeminiService, 'apply_agent_persona')
async def test_run_agent_workflow(mock_apply_agent_persona, langchain_service):
    # Arrange
    mock_apply_agent_persona.return_value = "Test Agent (Tester): This is a test response"
    agent = {
        "id": 1,
        "name": "Test Agent",
        "role": "Tester",
        "personality": "Analytical",
        "system_instructions": "You are a test agent."
    }
    task = "Perform a test task"
    
    # Act
    result = await langchain_service.run_agent_workflow(agent, task)
    
    # Assert
    assert result == "Test Agent (Tester): This is a test response"
    mock_apply_agent_persona.assert_called_once_with(task, agent)

@patch.object(GeminiService, 'generate_response')
async def test_resolve_conflicts(mock_generate_response, langchain_service):
    # Arrange
    mock_generate_response.return_value = '{"thought": "test resolution", "result": "resolved response"}'
    responses = [
        {"agent_name": "Agent 1", "content": "Response 1"},
        {"agent_name": "Agent 2", "content": "Response 2"}
    ]
    
    # Act
    result = await langchain_service.resolve_conflicts(responses)
    
    # Assert
    assert result["thought"] == "test resolution"
    assert result["result"] == "resolved response"
    mock_generate_response.assert_called_once()
