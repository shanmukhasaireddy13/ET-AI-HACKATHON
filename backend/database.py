"""
Database connection utilities.
"""
from __future__ import annotations

from sqlalchemy import inspect
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from config import load_config
from models import Base


_config = load_config()
DATABASE_URL = _config.relational_database_url


if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
else:
    engine = create_engine(DATABASE_URL, pool_pre_ping=True)


SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db_session() -> Session:
    return SessionLocal()


def _sqlite_schema_is_legacy() -> bool:
    if not DATABASE_URL.startswith("sqlite"):
        return False

    inspector = inspect(engine)
    if "meetings" not in inspector.get_table_names():
        return False

    meeting_columns = {column["name"] for column in inspector.get_columns("meetings")}
    required_meeting_columns = {"workspace_id", "status", "current_stage"}
    if not required_meeting_columns.issubset(meeting_columns):
        return True

    if "agent_runs" in inspector.get_table_names():
        agent_run_columns = {column["name"] for column in inspector.get_columns("agent_runs")}
        required_agent_run_columns = {"stage", "failure_category", "retries", "tools_used"}
        if not required_agent_run_columns.issubset(agent_run_columns):
            return True

    return False


def init_db() -> None:
    if _sqlite_schema_is_legacy():
        Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
