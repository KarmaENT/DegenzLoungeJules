"""
Database models for application settings.
"""
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Enum as SQLAlchemyEnum
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
import enum

Base = declarative_base()

class ThemeEnum(str, enum.Enum):
    system = "system"
    light = "light"
    dark = "dark"

class FontSizeEnum(str, enum.Enum):
    small = "small"
    medium = "medium"
    large = "large"

class TimeFormatEnum(str, enum.Enum):
    h12 = "12h"
    h24 = "24h"

class UserSettings(Base):
    __tablename__ = "user_settings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False) # Assuming a User model with users.id
    
    # User Preferences
    theme = Column(SQLAlchemyEnum(ThemeEnum), default=ThemeEnum.system, nullable=False)
    font_size = Column(SQLAlchemyEnum(FontSizeEnum), default=FontSizeEnum.medium, nullable=False)
    time_format = Column(SQLAlchemyEnum(TimeFormatEnum), default=TimeFormatEnum.h12, nullable=False)

    # Agent Defaults - These are user-specific defaults
    default_ai_provider = Column(String, default="gemini") # Store provider ID string
    default_model = Column(String, default="gemini-flash-2.0") # Store model ID string
    default_temperature = Column(Integer, default=70) # Store as integer 0-100, scale on frontend (e.g., 0.7 * 100)
    default_max_tokens = Column(Integer, default=2048)

    # Sandbox Settings - User-specific sandbox defaults
    manager_style = Column(String, default="collaborative") # "strict" or "collaborative"
    conflict_resolution_mode = Column(String, default="ask_user") # "automatic" or "ask_user"
    session_memory_duration = Column(String, default="session") # "session", "7d", "30d", "unlimited"

    # Notifications - User-specific notification preferences
    notifications_task_alerts_push = Column(Boolean, default=True)
    notifications_task_alerts_email = Column(Boolean, default=False)
    notifications_task_alerts_in_app = Column(Boolean, default=True)
    notifications_dnd_enabled = Column(Boolean, default=False)
    notifications_dnd_start_time = Column(String, default="22:00") # Store as HH:MM string
    notifications_dnd_end_time = Column(String, default="07:00") # Store as HH:MM string

    # Data Settings - User-specific data preferences
    data_storage_location = Column(String, default="local") # "local" or "cloud"
    data_auto_delete_policy = Column(String, default="30d") # "7d", "30d", "90d", "never"
    data_rag_whitelist = Column(String, default="") # Store as comma-separated string or JSON

    # Accessibility - User-specific accessibility preferences
    accessibility_high_contrast_mode = Column(Boolean, default=False)

    user = relationship("User", back_populates="settings") # Assuming User model has a 'settings' relationship

# For AI Provider API Keys - these are also user-specific and should be encrypted
class UserAIProviderKey(Base):
    __tablename__ = "user_ai_provider_keys"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    provider_id = Column(String, nullable=False) # e.g., "gemini", "openrouter"
    api_key_encrypted = Column(String, nullable=False) # Store encrypted API key

    user = relationship("User") # Add back_populates if User model has a relationship for keys

# Global/Admin settings might be stored in a separate table or a key-value store
class AppSetting(Base):
    __tablename__ = "app_settings"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String, unique=True, nullable=False, index=True) # e.g., "admin_agent_approval_enabled"
    value = Column(String, nullable=True) # Store value as string, parse as needed
    # Possible keys:
    # admin_agent_approval_enabled (Boolean)
    # admin_system_default_provider_lock (Boolean)

# Ensure User model is defined elsewhere and has relationships:
# class User(Base):
#     __tablename__ = "users"
#     id = Column(Integer, primary_key=True, index=True)
#     # ... other user fields
#     settings = relationship("UserSettings", uselist=False, back_populates="user")
#     ai_provider_keys = relationship("UserAIProviderKey", back_populates="user")


