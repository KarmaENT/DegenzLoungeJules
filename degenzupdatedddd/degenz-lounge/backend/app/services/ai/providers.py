"""
AI Provider Integration Module for DeGeNz Lounge

This module implements integration with various AI providers:
- Gemini Flash 2.0 (default)
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
import logging
from typing import Dict, List, Any, Optional, Union
from abc import ABC, abstractmethod

logger = logging.getLogger(__name__)

class AIProvider(ABC):
    """Base abstract class for all AI providers"""
    
    @abstractmethod
    def generate_response(self, messages: List[Dict[str, str]], system_prompt: str = None, 
                         temperature: float = 0.7, max_tokens: int = 1024) -> str:
        """
        Generate a response from the AI provider
        
        Args:
            messages: List of message dictionaries with 'role' and 'content' keys
            system_prompt: Optional system prompt to guide the model
            temperature: Controls randomness (0.0 to 1.0)
            max_tokens: Maximum number of tokens to generate
            
        Returns:
            Generated text response
        """
        pass
    
    @abstractmethod
    def get_available_models(self) -> List[Dict[str, str]]:
        """
        Get list of available models from this provider
        
        Returns:
            List of model dictionaries with 'id' and 'name' keys
        """
        pass

class GeminiProvider(AIProvider):
    """Integration with Google's Gemini Flash 2.0"""
    
    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.environ.get("GEMINI_API_KEY")
        if not self.api_key:
            raise ValueError("Gemini API key is required")
        self.base_url = "https://generativelanguage.googleapis.com/v1beta"
        
    def generate_response(self, messages: List[Dict[str, str]], system_prompt: str = None,
                         temperature: float = 0.7, max_tokens: int = 1024) -> str:
        """Generate a response using Gemini Flash 2.0"""
        
        model = "models/gemini-flash-2.0"
        url = f"{self.base_url}/{model}:generateContent?key={self.api_key}"
        
        # Format messages for Gemini
        formatted_messages = []
        
        # Add system prompt if provided
        if system_prompt:
            formatted_messages.append({
                "role": "user",
                "parts": [{"text": f"System: {system_prompt}"}]
            })
        
        # Add conversation messages
        for msg in messages:
            role = "model" if msg["role"] == "assistant" else "user"
            formatted_messages.append({
                "role": role,
                "parts": [{"text": msg["content"]}]
            })
        
        payload = {
            "contents": formatted_messages,
            "generationConfig": {
                "temperature": temperature,
                "maxOutputTokens": max_tokens,
                "topP": 0.95,
                "topK": 40
            }
        }
        
        try:
            response = requests.post(url, json=payload)
            response.raise_for_status()
            result = response.json()
            
            # Extract the generated text
            if "candidates" in result and len(result["candidates"]) > 0:
                candidate = result["candidates"][0]
                if "content" in candidate and "parts" in candidate["content"]:
                    return candidate["content"]["parts"][0]["text"]
            
            return "No response generated"
        
        except Exception as e:
            logger.error(f"Error generating response from Gemini: {str(e)}")
            return f"Error: {str(e)}"
    
    def get_available_models(self) -> List[Dict[str, str]]:
        """Get available Gemini models"""
        return [
            {"id": "gemini-flash-2.0", "name": "Gemini Flash 2.0"},
            {"id": "gemini-pro", "name": "Gemini Pro"},
            {"id": "gemini-ultra", "name": "Gemini Ultra"}
        ]

class OpenRouterProvider(AIProvider):
    """Integration with OpenRouter API"""
    
    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.environ.get("OPENROUTER_API_KEY")
        if not self.api_key:
            raise ValueError("OpenRouter API key is required")
        self.base_url = "https://openrouter.ai/api/v1"
        
    def generate_response(self, messages: List[Dict[str, str]], system_prompt: str = None,
                         temperature: float = 0.7, max_tokens: int = 1024, 
                         model: str = "anthropic/claude-3-opus") -> str:
        """Generate a response using OpenRouter"""
        
        url = f"{self.base_url}/chat/completions"
        
        # Format messages for OpenRouter (OpenAI-compatible format)
        formatted_messages = []
        
        # Add system prompt if provided
        if system_prompt:
            formatted_messages.append({
                "role": "system",
                "content": system_prompt
            })
        
        # Add conversation messages
        formatted_messages.extend(messages)
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": model,
            "messages": formatted_messages,
            "temperature": temperature,
            "max_tokens": max_tokens
        }
        
        try:
            response = requests.post(url, headers=headers, json=payload)
            response.raise_for_status()
            result = response.json()
            
            if "choices" in result and len(result["choices"]) > 0:
                return result["choices"][0]["message"]["content"]
            
            return "No response generated"
        
        except Exception as e:
            logger.error(f"Error generating response from OpenRouter: {str(e)}")
            return f"Error: {str(e)}"
    
    def get_available_models(self) -> List[Dict[str, str]]:
        """Get available models through OpenRouter"""
        url = f"{self.base_url}/models"
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        try:
            response = requests.get(url, headers=headers)
            response.raise_for_status()
            result = response.json()
            
            models = []
            for model in result.get("data", []):
                models.append({
                    "id": model.get("id"),
                    "name": model.get("name", model.get("id"))
                })
            
            return models
        
        except Exception as e:
            logger.error(f"Error fetching models from OpenRouter: {str(e)}")
            return [
                {"id": "anthropic/claude-3-opus", "name": "Claude 3 Opus"},
                {"id": "anthropic/claude-3-sonnet", "name": "Claude 3 Sonnet"},
                {"id": "anthropic/claude-3-haiku", "name": "Claude 3 Haiku"},
                {"id": "openai/gpt-4o", "name": "GPT-4o"},
                {"id": "openai/gpt-4-turbo", "name": "GPT-4 Turbo"},
                {"id": "meta-llama/llama-3-70b-instruct", "name": "Llama 3 70B"}
            ]

class GrokProvider(AIProvider):
    """Integration with Grok AI API"""
    
    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.environ.get("GROK_API_KEY")
        if not self.api_key:
            raise ValueError("Grok API key is required")
        self.base_url = "https://api.grok.ai/v1"
        
    def generate_response(self, messages: List[Dict[str, str]], system_prompt: str = None,
                         temperature: float = 0.7, max_tokens: int = 1024) -> str:
        """Generate a response using Grok"""
        
        url = f"{self.base_url}/chat/completions"
        
        # Format messages for Grok (OpenAI-compatible format)
        formatted_messages = []
        
        # Add system prompt if provided
        if system_prompt:
            formatted_messages.append({
                "role": "system",
                "content": system_prompt
            })
        
        # Add conversation messages
        formatted_messages.extend(messages)
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": "grok-2",
            "messages": formatted_messages,
            "temperature": temperature,
            "max_tokens": max_tokens
        }
        
        try:
            response = requests.post(url, headers=headers, json=payload)
            response.raise_for_status()
            result = response.json()
            
            if "choices" in result and len(result["choices"]) > 0:
                return result["choices"][0]["message"]["content"]
            
            return "No response generated"
        
        except Exception as e:
            logger.error(f"Error generating response from Grok: {str(e)}")
            return f"Error: {str(e)}"
    
    def get_available_models(self) -> List[Dict[str, str]]:
        """Get available Grok models"""
        return [
            {"id": "grok-2", "name": "Grok-2"},
            {"id": "grok-1.5", "name": "Grok-1.5"}
        ]

class DeepSeekProvider(AIProvider):
    """Integration with DeepSeek AI API"""
    
    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.environ.get("DEEPSEEK_API_KEY")
        if not self.api_key:
            raise ValueError("DeepSeek API key is required")
        self.base_url = "https://api.deepseek.com/v1"
        
    def generate_response(self, messages: List[Dict[str, str]], system_prompt: str = None,
                         temperature: float = 0.7, max_tokens: int = 1024) -> str:
        """Generate a response using DeepSeek"""
        
        url = f"{self.base_url}/chat/completions"
        
        # Format messages for DeepSeek (OpenAI-compatible format)
        formatted_messages = []
        
        # Add system prompt if provided
        if system_prompt:
            formatted_messages.append({
                "role": "system",
                "content": system_prompt
            })
        
        # Add conversation messages
        formatted_messages.extend(messages)
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": "deepseek-chat",
            "messages": formatted_messages,
            "temperature": temperature,
            "max_tokens": max_tokens
        }
        
        try:
            response = requests.post(url, headers=headers, json=payload)
            response.raise_for_status()
            result = response.json()
            
            if "choices" in result and len(result["choices"]) > 0:
                return result["choices"][0]["message"]["content"]
            
            return "No response generated"
        
        except Exception as e:
            logger.error(f"Error generating response from DeepSeek: {str(e)}")
            return f"Error: {str(e)}"
    
    def get_available_models(self) -> List[Dict[str, str]]:
        """Get available DeepSeek models"""
        return [
            {"id": "deepseek-chat", "name": "DeepSeek Chat"},
            {"id": "deepseek-coder", "name": "DeepSeek Coder"}
        ]

class PerplexityProvider(AIProvider):
    """Integration with Perplexity AI API"""
    
    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.environ.get("PERPLEXITY_API_KEY")
        if not self.api_key:
            raise ValueError("Perplexity API key is required")
        self.base_url = "https://api.perplexity.ai"
        
    def generate_response(self, messages: List[Dict[str, str]], system_prompt: str = None,
                         temperature: float = 0.7, max_tokens: int = 1024) -> str:
        """Generate a response using Perplexity"""
        
        url = f"{self.base_url}/chat/completions"
        
        # Format messages for Perplexity (OpenAI-compatible format)
        formatted_messages = []
        
        # Add system prompt if provided
        if system_prompt:
            formatted_messages.append({
                "role": "system",
                "content": system_prompt
            })
        
        # Add conversation messages
        formatted_messages.extend(messages)
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": "sonar-medium-online",
            "messages": formatted_messages,
            "temperature": temperature,
            "max_tokens": max_tokens
        }
        
        try:
            response = requests.post(url, headers=headers, json=payload)
            response.raise_for_status()
            result = response.json()
            
            if "choices" in result and len(result["choices"]) > 0:
                return result["choices"][0]["message"]["content"]
            
            return "No response generated"
        
        except Exception as e:
            logger.error(f"Error generating response from Perplexity: {str(e)}")
            return f"Error: {str(e)}"
    
    def get_available_models(self) -> List[Dict[str, str]]:
        """Get available Perplexity models"""
        return [
            {"id": "sonar-medium-online", "name": "Sonar Medium (Online)"},
            {"id": "sonar-small-online", "name": "Sonar Small (Online)"},
            {"id": "sonar-medium-chat", "name": "Sonar Medium Chat"},
            {"id": "sonar-small-chat", "name": "Sonar Small Chat"}
        ]

class HuggingFaceProvider(AIProvider):
    """Integration with Hugging Face Inference API"""
    
    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.environ.get("HUGGINGFACE_API_KEY")
        if not self.api_key:
            raise ValueError("Hugging Face API key is required")
        self.base_url = "https://api-inference.huggingface.co/models"
        
    def generate_response(self, messages: List[Dict[str, str]], system_prompt: str = None,
                         temperature: float = 0.7, max_tokens: int = 1024, 
                         model: str = "mistralai/Mixtral-8x7B-Instruct-v0.1") -> str:
        """Generate a response using Hugging Face Inference API"""
        
        url = f"{self.base_url}/{model}"
        
        # Format messages for Hugging Face
        prompt = ""
        
        # Add system prompt if provided
        if system_prompt:
            prompt += f"<|system|>\n{system_prompt}\n"
        
        # Add conversation messages in Mixtral format
        for msg in messages:
            role = "assistant" if msg["role"] == "assistant" else "user"
            prompt += f"<|{role}|>\n{msg['content']}\n"
        
        # Add final assistant prompt
        prompt += "<|assistant|>\n"
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "inputs": prompt,
            "parameters": {
                "temperature": temperature,
                "max_new_tokens": max_tokens,
                "return_full_text": False
            }
        }
        
        try:
            response = requests.post(url, headers=headers, json=payload)
            response.raise_for_status()
            result = response.json()
            
            if isinstance(result, list) and len(result) > 0:
                return result[0].get("generated_text", "No response generated")
            
            return "No response generated"
        
        except Exception as e:
            logger.error(f"Error generating response from Hugging Face: {str(e)}")
            return f"Error: {str(e)}"
    
    def get_available_models(self) -> List[Dict[str, str]]:
        """Get popular Hugging Face models"""
        return [
            {"id": "mistralai/Mixtral-8x7B-Instruct-v0.1", "name": "Mixtral 8x7B"},
            {"id": "meta-llama/Llama-2-70b-chat-hf", "name": "Llama 2 70B"},
            {"id": "tiiuae/falcon-180B-chat", "name": "Falcon 180B"},
            {"id": "bigscience/bloom", "name": "BLOOM 176B"},
            {"id": "google/flan-t5-xxl", "name": "Flan-T5 XXL"}
        ]

class MistralProvider(AIProvider):
    """Integration with Mistral AI API"""
    
    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.environ.get("MISTRAL_API_KEY")
        if not self.api_key:
            raise ValueError("Mistral API key is required")
        self.base_url = "https://api.mistral.ai/v1"
        
    def generate_response(self, messages: List[Dict[str, str]], system_prompt: str = None,
                         temperature: float = 0.7, max_tokens: int = 1024) -> str:
        """Generate a response using Mistral AI"""
        
        url = f"{self.base_url}/chat/completions"
        
        # Format messages for Mistral (OpenAI-compatible format)
        formatted_messages = []
        
        # Add system prompt if provided
        if system_prompt:
            formatted_messages.append({
                "role": "system",
                "content": system_prompt
            })
        
        # Add conversation messages
        formatted_messages.extend(messages)
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": "mistral-large-latest",
            "messages": formatted_messages,
            "temperature": temperature,
            "max_tokens": max_tokens
        }
        
        try:
            response = requests.post(url, headers=headers, json=payload)
            response.raise_for_status()
            result = response.json()
            
            if "choices" in result and len(result["choices"]) > 0:
                return result["choices"][0]["message"]["content"]
            
            return "No response generated"
        
        except Exception as e:
            logger.error(f"Error generating response from Mistral: {str(e)}")
            return f"Error: {str(e)}"
    
    def get_available_models(self) -> List[Dict[str, str]]:
        """Get available Mistral models"""
        return [
            {"id": "mistral-large-latest", "name": "Mistral Large"},
            {"id": "mistral-medium-latest", "name": "Mistral Medium"},
            {"id": "mistral-small-latest", "name": "Mistral Small"},
            {"id": "open-mistral-7b", "name": "Open Mistral 7B"}
        ]

def get_provider(provider_name: str, api_key: str = None) -> AIProvider:
    """
    Factory function to get the appropriate AI provider
    
    Args:
        provider_name: Name of the provider
        api_key: Optional API key (will use environment variable if not provided)
        
    Returns:
        An instance of the requested AI provider
    """
    providers = {
        "gemini": GeminiProvider,
        "openrouter": OpenRouterProvider,
        "grok": GrokProvider,
        "deepseek": DeepSeekProvider,
        "perplexity": PerplexityProvider,
        "huggingface": HuggingFaceProvider,
        "mistral": MistralProvider
    }
    
    if provider_name.lower() not in providers:
        raise ValueError(f"Unknown provider: {provider_name}")
    
    return providers[provider_name.lower()](api_key)

def get_all_providers() -> Dict[str, Dict[str, Any]]:
    """
    Get information about all available providers
    
    Returns:
        Dictionary mapping provider names to their information
    """
    return {
        "gemini": {
            "name": "Gemini Flash 2.0",
            "description": "Google's advanced AI model with strong reasoning capabilities",
            "requires_api_key": True,
            "env_var": "GEMINI_API_KEY",
            "default": True
        },
        "openrouter": {
            "name": "OpenRouter",
            "description": "Gateway to multiple AI models including Claude, GPT-4, and more",
            "requires_api_key": True,
            "env_var": "OPENROUTER_API_KEY",
            "default": False
        },
        "grok": {
            "name": "Grok",
            "description": "xAI's conversational AI with real-time knowledge",
            "requires_api_key": True,
            "env_var": "GROK_API_KEY",
            "default": False
        },
        "deepseek": {
            "name": "DeepSeek",
            "description": "Advanced AI models with strong coding and reasoning capabilities",
            "requires_api_key": True,
            "env_var": "DEEPSEEK_API_KEY",
            "default": False
        },
        "perplexity": {
            "name": "Perplexity",
            "description": "AI with online search capabilities for up-to-date information",
            "requires_api_key": True,
            "env_var": "PERPLEXITY_API_KEY",
            "default": False
        },
        "huggingface": {
            "name": "Hugging Face",
            "description": "Access to thousands of open-source AI models",
            "requires_api_key": True,
            "env_var": "HUGGINGFACE_API_KEY",
            "default": False
        },
        "mistral": {
            "name": "Mistral AI",
            "description": "Efficient and powerful AI models with strong reasoning",
            "requires_api_key": True,
            "env_var": "MISTRAL_API_KEY",
            "default": False
        }
    }
