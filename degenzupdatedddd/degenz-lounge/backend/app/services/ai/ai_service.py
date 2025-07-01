"""
AI Provider Service for DeGeNz Lounge

This service manages AI provider integrations and handles agent interactions.
"""

import os
import json
import logging
from typing import Dict, List, Any, Optional, Union

from app.services.ai.providers import get_provider, get_all_providers

logger = logging.getLogger(__name__)

class AIService:
    """Service for managing AI provider integrations and agent interactions"""
    
    def __init__(self):
        """Initialize the AI service"""
        self.default_provider = "gemini"
        self.providers_info = get_all_providers()
    
    def get_available_providers(self) -> Dict[str, Dict[str, Any]]:
        """
        Get information about all available AI providers
        
        Returns:
            Dictionary of provider information
        """
        return self.providers_info
    
    def get_provider_models(self, provider_name: str, api_key: str = None) -> List[Dict[str, str]]:
        """
        Get available models for a specific provider
        
        Args:
            provider_name: Name of the provider
            api_key: Optional API key
            
        Returns:
            List of model dictionaries with 'id' and 'name' keys
        """
        try:
            provider = get_provider(provider_name, api_key)
            return provider.get_available_models()
        except Exception as e:
            logger.error(f"Error getting models for provider {provider_name}: {str(e)}")
            return []
    
    def generate_agent_response(self, 
                               provider_name: str,
                               messages: List[Dict[str, str]],
                               agent_config: Dict[str, Any],
                               api_key: str = None) -> str:
        """
        Generate a response from an agent using the specified provider
        
        Args:
            provider_name: Name of the AI provider to use
            messages: List of message dictionaries with 'role' and 'content' keys
            agent_config: Configuration for the agent (system prompt, temperature, etc.)
            api_key: Optional API key for the provider
            
        Returns:
            Generated response text
        """
        try:
            # Use default provider if none specified
            if not provider_name:
                provider_name = self.default_provider
            
            # Get provider instance
            provider = get_provider(provider_name, api_key)
            
            # Extract agent configuration
            system_prompt = agent_config.get("system_prompt", "")
            temperature = agent_config.get("temperature", 0.7)
            max_tokens = agent_config.get("max_tokens", 1024)
            model = agent_config.get("model", "")
            
            # Generate response
            if provider_name in ["openrouter", "huggingface"] and model:
                # These providers need model specified in the method call
                return provider.generate_response(
                    messages=messages,
                    system_prompt=system_prompt,
                    temperature=temperature,
                    max_tokens=max_tokens,
                    model=model
                )
            else:
                # Standard provider call
                return provider.generate_response(
                    messages=messages,
                    system_prompt=system_prompt,
                    temperature=temperature,
                    max_tokens=max_tokens
                )
                
        except Exception as e:
            logger.error(f"Error generating agent response with provider {provider_name}: {str(e)}")
            return f"Error: Unable to generate response with {provider_name}. {str(e)}"
    
    def validate_api_key(self, provider_name: str, api_key: str) -> bool:
        """
        Validate an API key for a specific provider
        
        Args:
            provider_name: Name of the provider
            api_key: API key to validate
            
        Returns:
            True if the API key is valid, False otherwise
        """
        try:
            provider = get_provider(provider_name, api_key)
            
            # Try to get models as a simple validation test
            models = provider.get_available_models()
            
            # If we get here without an exception, the key is valid
            return True
            
        except Exception as e:
            logger.error(f"API key validation failed for provider {provider_name}: {str(e)}")
            return False
