from fastapi import WebSocket, WebSocketDisconnect
from typing import Dict, List, Any
import json
import asyncio

class ConnectionManager:
    """
    Manager for WebSocket connections
    """
    def __init__(self):
        self.active_connections: Dict[str, Dict[str, WebSocket]] = {}
    
    async def connect(self, websocket: WebSocket, session_id: str, client_id: str):
        """
        Connect a client to a session
        """
        await websocket.accept()
        if session_id not in self.active_connections:
            self.active_connections[session_id] = {}
        self.active_connections[session_id][client_id] = websocket
    
    def disconnect(self, session_id: str, client_id: str):
        """
        Disconnect a client from a session
        """
        if session_id in self.active_connections:
            if client_id in self.active_connections[session_id]:
                del self.active_connections[session_id][client_id]
            if not self.active_connections[session_id]:
                del self.active_connections[session_id]
    
    async def send_message(self, message: Dict[str, Any], session_id: str, client_id: str = None):
        """
        Send a message to a specific client or broadcast to all clients in a session
        """
        if session_id in self.active_connections:
            if client_id:
                if client_id in self.active_connections[session_id]:
                    await self.active_connections[session_id][client_id].send_json(message)
            else:
                for connection in self.active_connections[session_id].values():
                    await connection.send_json(message)
    
    async def broadcast_agent_message(self, message: Dict[str, Any], session_id: str):
        """
        Broadcast an agent message to all clients in a session
        """
        if session_id in self.active_connections:
            formatted_message = {
                "type": "agent_message",
                "data": message
            }
            for connection in self.active_connections[session_id].values():
                await connection.send_json(formatted_message)

class WebSocketService:
    """
    Service for handling WebSocket connections and messages
    """
    def __init__(self, connection_manager, agent_service):
        self.connection_manager = connection_manager
        self.agent_service = agent_service
    
    async def handle_message(self, data: Dict[str, Any], session_id: str, client_id: str):
        """
        Handle a message from a client
        """
        message_type = data.get("type")
        
        if message_type == "user_message":
            # Process user message
            user_message = data.get("content", "")
            
            # In a real implementation, we would:
            # 1. Save the message to the database
            # 2. Get the manager agent for this session
            # 3. Get all agents in this session
            # 4. Have the manager agent process the message and delegate tasks
            # 5. Generate responses from the assigned agents
            # 6. Broadcast the responses to all clients
            
            # For now, we'll just echo the message back
            await self.connection_manager.broadcast_agent_message({
                "content": f"Received: {user_message}",
                "agent_name": "Echo Agent",
                "agent_role": "Echo"
            }, session_id)
        
        elif message_type == "agent_added":
            # Notify all clients that an agent was added
            agent_id = data.get("agent_id")
            agent_name = data.get("agent_name", "Unknown Agent")
            
            await self.connection_manager.broadcast_agent_message({
                "content": f"Agent {agent_name} has joined the session",
                "agent_name": "System",
                "agent_role": "Notification"
            }, session_id)
        
        else:
            # Unknown message type
            await self.connection_manager.send_message({
                "type": "error",
                "message": f"Unknown message type: {message_type}"
            }, session_id, client_id)
