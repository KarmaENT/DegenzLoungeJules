"""
AI Provider Service Integration for DeGeNz Lounge.
This module integrates all AI providers into a unified service.
"""

import os
import logging
from typing import Dict, List, Any, Optional, Union

from .gemini_service import GeminiService
from .additional_providers import (
    OpenRouterService,
    GrokService,
    DeepSeekService,
    PerplexityService,
    HuggingFaceService,
    MistralService,
    AIProviderFactory
)

logger = logging.getLogger(__name__)

class UnifiedAIService:
    """Unified service for interacting with multiple AI providers."""
    
    def __init__(self):
        """Initialize the unified AI service with all providers."""
        self.providers = {}
        self._initialize_providers()
    
    def _initialize_providers(self):
        """Initialize all available AI providers."""
        # Initialize default Gemini service
        self.providers['gemini'] = GeminiService()
        
        # Initialize additional providers if API keys are available
        provider_keys = {
            'openrouter': os.environ.get('OPENROUTER_API_KEY'),
            'grok': os.environ.get('GROK_API_KEY'),
            'deepseek': os.environ.get('DEEPSEEK_API_KEY'),
            'perplexity': os.environ.get('PERPLEXITY_API_KEY'),
            'huggingface': os.environ.get('HUGGINGFACE_API_KEY'),
            'mistral': os.environ.get('MISTRAL_API_KEY'),
        }
        
        # Add OpenAI provider from existing implementation
        try:
            from .openai_service import OpenAIService
            self.providers['openai'] = OpenAIService()
        except (ImportError, Exception) as e:
            logger.warning(f"Could not initialize OpenAI service: {e}")
        
        # Initialize additional providers
        for provider_name, api_key in provider_keys.items():
            if api_key:
                try:
                    self.providers[provider_name] = AIProviderFactory.get_provider(provider_name, api_key)
                    logger.info(f"Initialized {provider_name} provider")
                except Exception as e:
                    logger.error(f"Failed to initialize {provider_name} provider: {e}")
    
    def add_provider(self, provider_name: str, api_key: str) -> bool:
        """Add or update an AI provider with the given API key."""
        try:
            self.providers[provider_name] = AIProviderFactory.get_provider(provider_name, api_key)
            logger.info(f"Added/updated {provider_name} provider")
            return True
        except Exception as e:
            logger.error(f"Failed to add {provider_name} provider: {e}")
            return False
    
    def remove_provider(self, provider_name: str) -> bool:
        """Remove an AI provider."""
        if provider_name in self.providers:
            try:
                del self.providers[provider_name]
                logger.info(f"Removed {provider_name} provider")
                return True
            except Exception as e:
                logger.error(f"Failed to remove {provider_name} provider: {e}")
                return False
        return False
    
    def list_providers(self) -> List[str]:
        """List all available AI providers."""
        return list(self.providers.keys())
    
    def list_models(self, provider_name: str) -> List[Dict[str, Any]]:
        """List available models for the specified provider."""
        provider = self.providers.get(provider_name)
        if not provider:
            logger.error(f"Provider {provider_name} not found")
            return []
        
        try:
            # Check if the provider has a list_models method
            if hasattr(provider, 'list_models') and callable(getattr(provider, 'list_models')):
                return provider.list_models()
            else:
                logger.warning(f"Provider {provider_name} does not support listing models")
                return []
        except Exception as e:
            logger.error(f"Error listing models for {provider_name}: {e}")
            return []
    
    def generate_response(self, 
                         provider_name: str,
                         prompt: str, 
                         model: Optional[str] = None,
                         system_prompt: Optional[str] = None,
                         temperature: float = 0.7,
                         max_tokens: int = 1024) -> Dict[str, Any]:
        """Generate a response using the specified AI provider and model."""
        provider = self.providers.get(provider_name)
        if not provider:
            logger.error(f"Provider {provider_name} not found")
            return {"error": f"Provider {provider_name} not found"}
        
        try:
            # Default models for each provider if not specified
            default_models = {
                'gemini': 'gemini-flash-2.0',
                'openai': 'gpt-4',
                'openrouter': 'openai/gpt-3.5-turbo',
                'grok': 'grok-1',
                'deepseek': 'deepseek-chat',
                'perplexity': 'pplx-7b-online',
                'huggingface': 'meta-llama/Llama-2-70b-chat-hf',
                'mistral': 'mistral-medium',
            }
            
            # Use default model if not specified
            if not model:
                model = default_models.get(provider_name)
            
            # Generate response
            return provider.generate_response(
                prompt=prompt,
                model=model,
                system_prompt=system_prompt,
                temperature=temperature,
                max_tokens=max_tokens
            )
        except Exception as e:
            logger.error(f"Error generating response from {provider_name}: {e}")
            return {"error": str(e)}
    
    def get_provider_info(self) -> List[Dict[str, Any]]:
        """Get information about all available providers."""
        provider_info = []
        
        for provider_name, provider in self.providers.items():
            info = {
                "name": provider_name,
                "available": True,
                "models": []
            }
            
            # Try to get models if the provider supports it
            try:
                if hasattr(provider, 'list_models') and callable(getattr(provider, 'list_models')):
                    models = provider.list_models()
                    if models:
                        info["models"] = models
            except Exception:
                pass
            
            provider_info.append(info)
        
        return provider_info
