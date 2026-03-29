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
    GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
    
    # ─── NVIDIA / MINIMAX ───
    NVIDIA_API_KEY = os.getenv("NVIDIA_API_KEY", "")
    NVIDIA_BASE_URL = os.getenv("NVIDIA_BASE_URL", "https://integrate.api.nvidia.com/v1")
    NVIDIA_MODEL = os.getenv("NVIDIA_MODEL", "minimaxai/minimax-m2.1")

config = Config()
