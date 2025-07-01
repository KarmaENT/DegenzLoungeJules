"""
Additional AI providers integration for DeGeNz Lounge.
This module implements connections to various AI providers:
- OpenRouter
- Grok
- DeepSeek
- Perplexity
- Hugging Face
- Mistral
"""

import os
import json
import requests
from typing import Dict, List, Any, Optional
import logging

logger = logging.getLogger(__name__)

class OpenRouterService:
    """Service for interacting with OpenRouter API."""
    
    def __init__(self, api_key: Optional[str] = None):
        """Initialize OpenRouter service with API key."""
        self.api_key = api_key or os.environ.get("OPENROUTER_API_KEY")
        self.base_url = "https://openrouter.ai/api/v1"
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://degenz-lounge.com"  # Replace with your actual domain
        }
    
    def list_models(self) -> List[Dict[str, Any]]:
        """Get available models from OpenRouter."""
        try:
            response = requests.get(f"{self.base_url}/models", headers=self.headers)
            response.raise_for_status()
            return response.json().get("data", [])
        except Exception as e:
            logger.error(f"Error fetching OpenRouter models: {e}")
            return []
    
    def generate_response(self, 
                         prompt: str, 
                         model: str = "openai/gpt-3.5-turbo", 
                         system_prompt: Optional[str] = None,
                         temperature: float = 0.7,
                         max_tokens: int = 1024) -> Dict[str, Any]:
        """Generate a response using OpenRouter API."""
        try:
            messages = []
            if system_prompt:
                messages.append({"role": "system", "content": system_prompt})
            messages.append({"role": "user", "content": prompt})
            
            payload = {
                "model": model,
                "messages": messages,
                "temperature": temperature,
                "max_tokens": max_tokens
            }
            
            response = requests.post(
                f"{self.base_url}/chat/completions", 
                headers=self.headers,
                json=payload
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Error generating OpenRouter response: {e}")
            return {"error": str(e)}


class GrokService:
    """Service for interacting with Grok API."""
    
    def __init__(self, api_key: Optional[str] = None):
        """Initialize Grok service with API key."""
        self.api_key = api_key or os.environ.get("GROK_API_KEY")
        self.base_url = "https://api.grok.ai/v1"
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
    
    def generate_response(self, 
                         prompt: str, 
                         system_prompt: Optional[str] = None,
                         temperature: float = 0.7,
                         max_tokens: int = 1024) -> Dict[str, Any]:
        """Generate a response using Grok API."""
        try:
            messages = []
            if system_prompt:
                messages.append({"role": "system", "content": system_prompt})
            messages.append({"role": "user", "content": prompt})
            
            payload = {
                "messages": messages,
                "temperature": temperature,
                "max_tokens": max_tokens
            }
            
            response = requests.post(
                f"{self.base_url}/chat/completions", 
                headers=self.headers,
                json=payload
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Error generating Grok response: {e}")
            return {"error": str(e)}


class DeepSeekService:
    """Service for interacting with DeepSeek API."""
    
    def __init__(self, api_key: Optional[str] = None):
        """Initialize DeepSeek service with API key."""
        self.api_key = api_key or os.environ.get("DEEPSEEK_API_KEY")
        self.base_url = "https://api.deepseek.com/v1"
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
    
    def list_models(self) -> List[Dict[str, Any]]:
        """Get available models from DeepSeek."""
        try:
            response = requests.get(f"{self.base_url}/models", headers=self.headers)
            response.raise_for_status()
            return response.json().get("data", [])
        except Exception as e:
            logger.error(f"Error fetching DeepSeek models: {e}")
            return []
    
    def generate_response(self, 
                         prompt: str, 
                         model: str = "deepseek-chat",
                         system_prompt: Optional[str] = None,
                         temperature: float = 0.7,
                         max_tokens: int = 1024) -> Dict[str, Any]:
        """Generate a response using DeepSeek API."""
        try:
            messages = []
            if system_prompt:
                messages.append({"role": "system", "content": system_prompt})
            messages.append({"role": "user", "content": prompt})
            
            payload = {
                "model": model,
                "messages": messages,
                "temperature": temperature,
                "max_tokens": max_tokens
            }
            
            response = requests.post(
                f"{self.base_url}/chat/completions", 
                headers=self.headers,
                json=payload
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Error generating DeepSeek response: {e}")
            return {"error": str(e)}


class PerplexityService:
    """Service for interacting with Perplexity API."""
    
    def __init__(self, api_key: Optional[str] = None):
        """Initialize Perplexity service with API key."""
        self.api_key = api_key or os.environ.get("PERPLEXITY_API_KEY")
        self.base_url = "https://api.perplexity.ai"
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
    
    def generate_response(self, 
                         prompt: str, 
                         model: str = "pplx-7b-online",
                         system_prompt: Optional[str] = None,
                         temperature: float = 0.7,
                         max_tokens: int = 1024) -> Dict[str, Any]:
        """Generate a response using Perplexity API."""
        try:
            messages = []
            if system_prompt:
                messages.append({"role": "system", "content": system_prompt})
            messages.append({"role": "user", "content": prompt})
            
            payload = {
                "model": model,
                "messages": messages,
                "temperature": temperature,
                "max_tokens": max_tokens
            }
            
            response = requests.post(
                f"{self.base_url}/chat/completions", 
                headers=self.headers,
                json=payload
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Error generating Perplexity response: {e}")
            return {"error": str(e)}


class HuggingFaceService:
    """Service for interacting with Hugging Face Inference API."""
    
    def __init__(self, api_key: Optional[str] = None):
        """Initialize Hugging Face service with API key."""
        self.api_key = api_key or os.environ.get("HUGGINGFACE_API_KEY")
        self.base_url = "https://api-inference.huggingface.co/models"
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
    
    def generate_response(self, 
                         prompt: str, 
                         model: str = "meta-llama/Llama-2-70b-chat-hf",
                         system_prompt: Optional[str] = None,
                         temperature: float = 0.7,
                         max_tokens: int = 1024) -> Dict[str, Any]:
        """Generate a response using Hugging Face Inference API."""
        try:
            # Format prompt based on whether system prompt is provided
            formatted_prompt = prompt
            if system_prompt:
                formatted_prompt = f"{system_prompt}\n\n{prompt}"
            
            payload = {
                "inputs": formatted_prompt,
                "parameters": {
                    "temperature": temperature,
                    "max_new_tokens": max_tokens,
                    "return_full_text": False
                }
            }
            
            response = requests.post(
                f"{self.base_url}/{model}", 
                headers=self.headers,
                json=payload
            )
            response.raise_for_status()
            
            # Format response to match other providers
            result = response.json()
            if isinstance(result, list) and len(result) > 0:
                return {
                    "choices": [
                        {
                            "message": {
                                "content": result[0].get("generated_text", "")
                            }
                        }
                    ]
                }
            return result
        except Exception as e:
            logger.error(f"Error generating Hugging Face response: {e}")
            return {"error": str(e)}


class MistralService:
    """Service for interacting with Mistral AI API."""
    
    def __init__(self, api_key: Optional[str] = None):
        """Initialize Mistral service with API key."""
        self.api_key = api_key or os.environ.get("MISTRAL_API_KEY")
        self.base_url = "https://api.mistral.ai/v1"
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
    
    def list_models(self) -> List[Dict[str, Any]]:
        """Get available models from Mistral."""
        try:
            response = requests.get(f"{self.base_url}/models", headers=self.headers)
            response.raise_for_status()
            return response.json().get("data", [])
        except Exception as e:
            logger.error(f"Error fetching Mistral models: {e}")
            return []
    
    def generate_response(self, 
                         prompt: str, 
                         model: str = "mistral-medium",
                         system_prompt: Optional[str] = None,
                         temperature: float = 0.7,
                         max_tokens: int = 1024) -> Dict[str, Any]:
        """Generate a response using Mistral AI API."""
        try:
            messages = []
            if system_prompt:
                messages.append({"role": "system", "content": system_prompt})
            messages.append({"role": "user", "content": prompt})
            
            payload = {
                "model": model,
                "messages": messages,
                "temperature": temperature,
                "max_tokens": max_tokens
            }
            
            response = requests.post(
                f"{self.base_url}/chat/completions", 
                headers=self.headers,
                json=payload
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Error generating Mistral response: {e}")
            return {"error": str(e)}


class AIProviderFactory:
    """Factory for creating AI provider service instances."""
    
    @staticmethod
    def get_provider(provider_name: str, api_key: Optional[str] = None):
        """Get an AI provider service instance based on provider name."""
        providers = {
            "openrouter": OpenRouterService,
            "grok": GrokService,
            "deepseek": DeepSeekService,
            "perplexity": PerplexityService,
            "huggingface": HuggingFaceService,
            "mistral": MistralService
        }
        
        provider_class = providers.get(provider_name.lower())
        if not provider_class:
            raise ValueError(f"Unknown AI provider: {provider_name}")
        
        return provider_class(api_key)
