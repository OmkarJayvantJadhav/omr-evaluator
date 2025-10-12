from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
import os
from dotenv import load_dotenv

load_dotenv()

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./omr_evaluator.db")

# Create engine with appropriate configuration
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        DATABASE_URL, 
        connect_args={"check_same_thread": False}
    )
elif DATABASE_URL.startswith("mysql"):
    # MySQL configuration with connection pooling
    engine = create_engine(
        DATABASE_URL,
        pool_size=10,
        max_overflow=20,
        pool_pre_ping=True,
        pool_recycle=3600,  # MySQL recommended: 1 hour
        connect_args={
            "charset": "utf8mb4",
            "autocommit": False
        },
        echo=False  # Set to True for SQL debugging
    )
else:
    # Generic database configuration (fallback for other databases)
    engine = create_engine(
        DATABASE_URL,
        pool_size=10,
        max_overflow=20,
        pool_pre_ping=True,
        pool_recycle=300,
        echo=False  # Set to True for SQL debugging
    )

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create Base class
Base = declarative_base()

# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Create tables
def create_tables():
    from models import Base
    Base.metadata.create_all(bind=engine)

# Initialize database
def init_db():
    create_tables()
    print("Database tables created successfully!")