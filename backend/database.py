"""
Database configuration and session management.
Uses SQLAlchemy with SQLite (easily switchable to PostgreSQL).
"""

from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./crm_hcp.db")

# For SQLite, we need connect_args to allow multi-threaded access
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False},
        echo=False
    )
else:
    engine = create_engine(DATABASE_URL, echo=False)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """Dependency to get database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Create all database tables and apply lightweight migrations."""
    Base.metadata.create_all(bind=engine)
    _run_migrations()


def _run_migrations():
    """
    Idempotent, additive migration for columns introduced after the initial
    schema. SQLAlchemy's create_all() will not add new columns to an existing
    table, so we ADD COLUMN for any that are missing. Safe to run every startup.
    """
    # column_name -> SQL type used in the ADD COLUMN statement
    new_interaction_columns = {
        "attendees": "JSON",
        "materials_shared": "JSON",
        "samples_distributed": "JSON",
        "ai_suggested_follow_ups": "JSON",
    }

    inspector = inspect(engine)
    if "interactions" not in inspector.get_table_names():
        return

    existing = {col["name"] for col in inspector.get_columns("interactions")}
    with engine.begin() as conn:
        for column, col_type in new_interaction_columns.items():
            if column not in existing:
                conn.execute(
                    text(f"ALTER TABLE interactions ADD COLUMN {column} {col_type}")
                )
                print(f"[migrate] Added interactions.{column}")
