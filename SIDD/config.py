import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Central configuration."""
    LLM_PROVIDER = os.getenv("LLM_PROVIDER", "groq") # Switch to groq by default
    
    # ─── GROQ ───
    GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
    GROQ_MODEL = os.getenv("GROQ_MODEL", "llama3-70b-8192") # Recommend Llama3 70b

    # ─── GEMINI ───
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

config = Config()
