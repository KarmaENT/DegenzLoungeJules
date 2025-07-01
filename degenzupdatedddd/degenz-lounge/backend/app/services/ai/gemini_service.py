import os
from langchain.llms import Gemini
from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate
from typing import Dict, List, Any, Optional
import json

class GeminiService:
    """
    Service for interacting with Gemini Flash 2.0
    """
    def __init__(self):
        # In a real implementation, you would use the actual Gemini API
        # For now, we'll create a mock implementation
        self.api_key = os.getenv("GEMINI_API_KEY", "mock_key")
        self.model = self._initialize_model()
    
    def _initialize_model(self):
        # This is a placeholder for the actual Gemini model initialization
        # In a real implementation, you would use the Gemini API
        return Gemini(api_key=self.api_key, model_name="gemini-flash-2.0")
    
    async def generate_response(self, prompt: str, system_instructions: str = None) -> str:
        """
        Generate a response from Gemini
        """
        # Create a prompt template
        template = """
        {system_instructions}
        
        User: {prompt}
        
        Assistant:
        """
        
        prompt_template = PromptTemplate(
            template=template,
            input_variables=["prompt", "system_instructions"]
        )
        
        # Create a chain
        chain = LLMChain(llm=self.model, prompt=prompt_template)
        
        # Generate response
        response = await chain.arun(
            prompt=prompt,
            system_instructions=system_instructions or "You are a helpful AI assistant."
        )
        
        return response
    
    async def apply_agent_persona(self, prompt: str, agent: Dict[str, Any]) -> str:
        """
        Generate a response with an agent's persona
        """
        system_instructions = f"""
        You are an AI assistant with the following characteristics:
        Name: {agent['name']}
        Role: {agent['role']}
        Personality: {agent['personality']}
        
        {agent['system_instructions']}
        
        Respond in character, maintaining the personality and role described above.
        """
        
        response = await self.generate_response(prompt, system_instructions)
        
        # Format the response with the agent's name and role
        return f"{agent['name']} ({agent['role']}): {response}"

class LangChainService:
    """
    Service for LangChain workflows
    """
    def __init__(self, gemini_service: GeminiService):
        self.gemini_service = gemini_service
    
    async def run_manager_workflow(self, user_message: str, available_agents: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Run the manager agent workflow to delegate tasks
        """
        # Create a system instruction for the manager agent
        agents_str = "\n".join([
            f"ID: {agent['id']}, Name: {agent['name']}, Role: {agent['role']}, Personality: {agent['personality']}"
            for agent in available_agents
        ])
        
        system_instructions = f"""
        You are a Manager Agent responsible for orchestrating tasks between different AI agents.
        
        Available agents:
        {agents_str}
        
        Based on the user message, decide which agent(s) should handle this task.
        
        Your response should be in the following JSON format:
        {{
            "thought": "your reasoning process",
            "assigned_agents": [
                {{
                    "agent_id": "id of the agent",
                    "task": "specific task for this agent"
                }}
            ]
        }}
        """
        
        # Generate response
        response = await self.gemini_service.generate_response(user_message, system_instructions)
        
        try:
            # Parse the response as JSON
            result = json.loads(response)
            return result
        except json.JSONDecodeError:
            # Fallback in case the response is not valid JSON
            return {
                "thought": "Failed to parse response",
                "assigned_agents": []
            }
    
    async def run_agent_workflow(self, agent: Dict[str, Any], task: str) -> str:
        """
        Run an agent workflow for a specific task
        """
        return await self.gemini_service.apply_agent_persona(task, agent)
    
    async def resolve_conflicts(self, responses: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Resolve conflicts between agent responses
        """
        if not responses:
            return {"result": "No responses to resolve"}
        
        # Format the responses for the conflict resolution prompt
        responses_str = "\n\n".join([
            f"Agent {i+1} ({response.get('agent_name', 'Unknown')}): {response.get('content', '')}"
            for i, response in enumerate(responses)
        ])
        
        system_instructions = f"""
        You are a Conflict Resolution Agent responsible for evaluating multiple agent responses and selecting the best one.
        
        Agent responses:
        {responses_str}
        
        Evaluate the responses and select the best one. If there are conflicts, resolve them by combining the best parts of each response.
        
        Your response should be in the following JSON format:
        {{
            "thought": "your reasoning process",
            "result": "the final resolved response"
        }}
        """
        
        # Generate response
        response = await self.gemini_service.generate_response("Resolve the conflicts between these agent responses.", system_instructions)
        
        try:
            # Parse the response as JSON
            result = json.loads(response)
            return result
        except json.JSONDecodeError:
            # Fallback in case the response is not valid JSON
            return {
                "thought": "Failed to parse response",
                "result": responses[0].get('content', 'No valid response')
            }
