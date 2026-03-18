"""
Central application configuration.
"""
from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path

from dotenv import load_dotenv


load_dotenv()
BASE_DIR = Path(__file__).resolve().parent


@dataclass(slots=True)
class AppConfig:
    app_name: str
    api_host: str
    api_port: int
    debug: bool
    log_level: str
    relational_database_url: str
    mongodb_url: str | None
    mongodb_database: str
    workspace_name: str
    default_user_email: str
    classifier_mode: str
    llm_provider: str
    gemini_api_key: str | None
    gemini_model: str
    groq_api_key: str | None
    groq_model: str

    @property
    def use_provider_llm(self) -> bool:
        return self.classifier_mode == "provider"


def _get_bool(name: str, default: bool) -> bool:
    return os.getenv(name, str(default)).strip().lower() in {"1", "true", "yes", "on"}


def load_config() -> AppConfig:
    relational_database_url = (
        os.getenv("SUPABASE_DATABASE_URL")
        or os.getenv("DATABASE_URL")
        or "sqlite:///./agent_system.db"
    )

    if relational_database_url.startswith("sqlite:///./"):
        sqlite_name = relational_database_url.removeprefix("sqlite:///./")
        relational_database_url = f"sqlite:///{(BASE_DIR / sqlite_name).resolve()}"

    return AppConfig(
        app_name=os.getenv("APP_NAME", "AutoExec AI Engine"),
        api_host=os.getenv("API_HOST", "0.0.0.0"),
        api_port=int(os.getenv("PORT", "8000")),
        debug=_get_bool("DEBUG", True),
        log_level=os.getenv("LOG_LEVEL", "INFO"),
        relational_database_url=relational_database_url,
        mongodb_url=os.getenv("MONGODB_URL"),
        mongodb_database=os.getenv("MONGODB_DATABASE", "autoexec_ai"),
        workspace_name=os.getenv("WORKSPACE_NAME", "default-workspace"),
        default_user_email=os.getenv("DEFAULT_USER_EMAIL", "system@autoexec.local"),
        classifier_mode=os.getenv("CLASSIFIER_MODE", "local").strip().lower(),
        llm_provider=os.getenv("LLM_PROVIDER", "groq").strip().lower(),
        gemini_api_key=os.getenv("GEMINI_API_KEY") or None,
        gemini_model=os.getenv("GEMINI_MODEL", "gemini-1.5-flash"),
        groq_api_key=os.getenv("GROQ_API_KEY") or None,
        groq_model=os.getenv("GROQ_MODEL", "llama-3.1-8b-instant"),
    )
