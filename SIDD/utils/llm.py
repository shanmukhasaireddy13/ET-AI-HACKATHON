"""
LLM Helper Engine
Reusable utility for calling Groq (or Gemini) from any agent.
Includes retry logic for rate-limit (429) errors.
"""

import json
import time
import os
from config import config

# --- Setup Providers ---
active_provider = config.LLM_PROVIDER.lower()

gemini_model = None
groq_client = None

if active_provider == "gemini":
    import google.generativeai as genai
    genai.configure(api_key=config.GEMINI_API_KEY)
    gemini_model = genai.GenerativeModel(config.GEMINI_MODEL)
else:
    # Default to Groq
    from groq import Groq
    groq_client = Groq(api_key=config.GROQ_API_KEY)

nvidia_client = None
if active_provider == "nvidia":
    from openai import OpenAI
    nvidia_client = OpenAI(
        base_url=config.NVIDIA_BASE_URL,
        api_key=config.NVIDIA_API_KEY
    )

MAX_RETRIES = 3
BASE_WAIT = 25  # seconds to wait on rate limit


def call_gemini(prompt: str, expect_json: bool = False):
    """
    Calls the configured LLM (Groq or Gemini) with the given prompt.
    Keeps the function name 'call_gemini' for backward compatibility.
    
    Args:
        prompt: The full prompt string to send.
        expect_json: If True, attempts to parse the response as JSON.
        
    Returns:
        Raw text string, or parsed JSON (dict/list) if expect_json=True.
    """
    for attempt in range(MAX_RETRIES):
        try:
            if active_provider == "gemini":
                response = gemini_model.generate_content(prompt)
                text = response.text.strip()
            elif active_provider == "nvidia":
                response = nvidia_client.chat.completions.create(
                    model=config.NVIDIA_MODEL,
                    messages=[
                        {"role": "system", "content": "You are a helpful AI assistant. Always return ONLY valid JSON when requested." if expect_json else "You are a helpful AI assistant."},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.1,
                    # Nvidia doesn't always support response_format={"type": "json_object"} same as Groq/OpenAI, 
                    # but we can try if the model supports it. Minimax might not.
                    # response_format={"type": "json_object"} if expect_json else None
                )
                text = response.choices[0].message.content.strip()
            else:
                response = groq_client.chat.completions.create(
                    messages=[
                        {
                            "role": "system",
                            "content": "You are a helpful AI assistant. Always return ONLY valid JSON when requested." if expect_json else "You are a helpful AI assistant."
                        },
                        {
                            "role": "user",
                            "content": prompt,
                        }
                    ],
                    model=config.GROQ_MODEL,
                    temperature=0.1,
                    response_format={"type": "json_object"} if expect_json else None
                )
                text = response.choices[0].message.content.strip()
            
            if expect_json:
                # Strip markdown code fences if wrapped
                if text.startswith("```"):
                    lines = text.split("\n")
                    lines = [l for l in lines if not l.strip().startswith("```")]
                    text = "\n".join(lines).strip()
                
                return json.loads(text)
            
            return text
            
        except json.JSONDecodeError:
            print(f"   [LLM - {active_provider}] Non-JSON response. Raw: {text[:200]}")
            return {} if expect_json else text
            
        except Exception as e:
            error_str = str(e)
            if "429" in error_str or "quota" in error_str.lower():
                wait_time = BASE_WAIT * (attempt + 1)
                print(f"   [LLM - {active_provider}] Rate limited (429). Retrying in {wait_time}s... (attempt {attempt + 1}/{MAX_RETRIES})")
                time.sleep(wait_time)
                continue
            else:
                print(f"   [LLM - {active_provider}] API Error: {e}")
                return {} if expect_json else f"Error: {e}"
    
    # All retries exhausted
    print(f"   [LLM - {active_provider}] All {MAX_RETRIES} retries exhausted.")
    return {} if expect_json else "Error: Rate limit exceeded after retries"


def call_gemini_safe(prompt: str, fallback=None):
    """
    Calls the LLM expecting JSON. Returns fallback on any failure.
    The fallback type should match what the caller expects (dict or list).
    """
    result = call_gemini(prompt, expect_json=True)
    if isinstance(result, dict) and result:
        return result
    if isinstance(result, list) and result:
        return result
    return fallback if fallback is not None else {}
