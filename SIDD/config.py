import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Central configuration."""
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL = "gemini-2.5-flash"

config = Config()
