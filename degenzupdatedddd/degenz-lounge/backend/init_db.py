import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.models import Base
from app.database import get_db
from app.models.models import User
from app.routes.auth import get_password_hash
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def init_db():
    """
    Initialize the database with tables and initial data
    """
    from app.database import engine
    
    # Create tables
    logger.info("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created successfully")
    
    # Create admin user if it doesn't exist
    db = next(get_db())
    admin_user = db.query(User).filter(User.username == "admin").first()
    
    if not admin_user:
        logger.info("Creating admin user...")
        admin_user = User(
            username="admin",
            email="admin@example.com",
            hashed_password=get_password_hash("admin"),
            is_active=True
        )
        db.add(admin_user)
        db.commit()
        logger.info("Admin user created successfully")
    
    db.close()

if __name__ == "__main__":
    init_db()
