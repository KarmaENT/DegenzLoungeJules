"""
API routes for managing application and user settings.
"""
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any

from app.database import get_db # Assuming you have a get_db dependency
from app.models.user_models import User # Assuming a User model for current_user
from app.models.settings_models import UserSettings, UserAIProviderKey, AppSetting, ThemeEnum, FontSizeEnum, TimeFormatEnum
from app.models.schemas import ( # Assuming these will be created or exist
    UserSettingsResponse, UserSettingsUpdate,
    UserAIProviderKeyResponse, UserAIProviderKeyCreate, UserAIProviderKeyUpdate,
    AppSettingResponse, AppSettingUpdate
)
from app.utils.auth import get_current_user # Assuming auth utility
# from app.services.security_service import encrypt_data, decrypt_data # For API key encryption

router = APIRouter(
    prefix="/api/settings",
    tags=["settings"],
    responses={404: {"description": "Not found"}},
)

# --- User Settings --- 
@router.get("/user", response_model=UserSettingsResponse)
async def get_user_settings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve settings for the current authenticated user."""
    user_settings = db.query(UserSettings).filter(UserSettings.user_id == current_user.id).first()
    if not user_settings:
        # Create default settings if none exist
        default_settings = UserSettings(user_id=current_user.id)
        db.add(default_settings)
        db.commit()
        db.refresh(default_settings)
        return default_settings
    return user_settings

@router.put("/user", response_model=UserSettingsResponse)
async def update_user_settings(
    settings_update: UserSettingsUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update settings for the current authenticated user."""
    user_settings = db.query(UserSettings).filter(UserSettings.user_id == current_user.id).first()
    if not user_settings:
        raise HTTPException(status_code=404, detail="User settings not found. GET first to create.")

    update_data = settings_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(user_settings, key, value)
    
    db.commit()
    db.refresh(user_settings)
    return user_settings

# --- User AI Provider API Keys --- 
@router.get("/user/ai-provider-keys", response_model=List[UserAIProviderKeyResponse])
async def get_user_ai_provider_keys(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve all AI provider API keys for the current user."""
    keys = db.query(UserAIProviderKey).filter(UserAIProviderKey.user_id == current_user.id).all()
    # Decrypt keys before sending (conceptual)
    # for key_record in keys:
    #     key_record.api_key = decrypt_data(key_record.api_key_encrypted) 
    return keys

@router.post("/user/ai-provider-keys", response_model=UserAIProviderKeyResponse)
async def add_user_ai_provider_key(
    key_data: UserAIProviderKeyCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add a new AI provider API key for the current user."""
    # Encrypt key before storing (conceptual)
    # encrypted_key = encrypt_data(key_data.api_key)
    db_key = UserAIProviderKey(
        user_id=current_user.id, 
        provider_id=key_data.provider_id, 
        api_key_encrypted=key_data.api_key # Store encrypted_key here
    )
    db.add(db_key)
    db.commit()
    db.refresh(db_key)
    # db_key.api_key = key_data.api_key # Add plain key for response after decryption
    return db_key

@router.put("/user/ai-provider-keys/{provider_id}", response_model=UserAIProviderKeyResponse)
async def update_user_ai_provider_key(
    provider_id: str,
    key_update: UserAIProviderKeyUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update an existing AI provider API key for the current user."""
    db_key = db.query(UserAIProviderKey).filter(
        UserAIProviderKey.user_id == current_user.id, 
        UserAIProviderKey.provider_id == provider_id
    ).first()

    if not db_key:
        raise HTTPException(status_code=404, detail=f"API key for provider {provider_id} not found.")

    # Encrypt key before storing (conceptual)
    # db_key.api_key_encrypted = encrypt_data(key_update.api_key)
    db_key.api_key_encrypted = key_update.api_key # Store encrypted_key here
    db.commit()
    db.refresh(db_key)
    # db_key.api_key = key_update.api_key # Add plain key for response after decryption
    return db_key

@router.delete("/user/ai-provider-keys/{provider_id}", status_code=204)
async def delete_user_ai_provider_key(
    provider_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete an AI provider API key for the current user."""
    db_key = db.query(UserAIProviderKey).filter(
        UserAIProviderKey.user_id == current_user.id, 
        UserAIProviderKey.provider_id == provider_id
    ).first()

    if not db_key:
        raise HTTPException(status_code=404, detail=f"API key for provider {provider_id} not found.")

    db.delete(db_key)
    db.commit()
    return

# --- App/Admin Settings --- (Requires admin privileges)
@router.get("/app", response_model=List[AppSettingResponse])
async def get_app_settings(
    # current_user: User = Depends(get_current_admin_user), # Add admin auth
    db: Session = Depends(get_db)
):
    """Retrieve all application-wide settings (admin only)."""
    return db.query(AppSetting).all()

@router.put("/app/{setting_key}", response_model=AppSettingResponse)
async def update_app_setting(
    setting_key: str,
    setting_update: AppSettingUpdate,
    # current_user: User = Depends(get_current_admin_user), # Add admin auth
    db: Session = Depends(get_db)
):
    """Update an application-wide setting (admin only)."""
    db_setting = db.query(AppSetting).filter(AppSetting.key == setting_key).first()
    if not db_setting:
        # Optionally create if not exists, or raise 404
        db_setting = AppSetting(key=setting_key, value=setting_update.value)
        db.add(db_setting)
    else:
        db_setting.value = setting_update.value
    db.commit()
    db.refresh(db_setting)
    return db_setting

# TODO: Define Pydantic schemas (UserSettingsResponse, UserSettingsUpdate, etc.) in app/models/schemas.py
# TODO: Implement get_current_admin_user dependency for admin routes
# TODO: Implement actual encryption/decryption for API keys
# TODO: Add these routes to the main FastAPI app instance in main.py

