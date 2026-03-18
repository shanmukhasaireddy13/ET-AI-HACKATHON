"""
Gemini Flash LLM Helper
Reusable utility for calling Gemini Flash from any agent.
Includes retry logic for rate-limit (429) errors.
"""

import json
import time
import google.generativeai as genai
from config import config

# Configure Gemini
genai.configure(api_key=config.GEMINI_API_KEY)
model = genai.GenerativeModel(config.GEMINI_MODEL)

MAX_RETRIES = 3
BASE_WAIT = 25  # seconds to wait on rate limit


def call_gemini(prompt: str, expect_json: bool = False):
    """
    Calls Gemini Flash with the given prompt.
    Retries automatically on rate-limit (429) errors.
    
    Args:
        prompt: The full prompt string to send.
        expect_json: If True, attempts to parse the response as JSON.
        
    Returns:
        Raw text string, or parsed JSON (dict/list) if expect_json=True.
    """
    for attempt in range(MAX_RETRIES):
        try:
            response = model.generate_content(prompt)
            text = response.text.strip()
            
            if expect_json:
                # Strip markdown code fences if Gemini wraps the output
                if text.startswith("```"):
                    lines = text.split("\n")
                    lines = [l for l in lines if not l.strip().startswith("```")]
                    text = "\n".join(lines).strip()
                
                return json.loads(text)
            
            return text
            
        except json.JSONDecodeError:
            print(f"   [LLM] Non-JSON response. Raw: {text[:200]}")
            return {} if expect_json else text
            
        except Exception as e:
            error_str = str(e)
            if "429" in error_str or "quota" in error_str.lower():
                wait_time = BASE_WAIT * (attempt + 1)
                print(f"   [LLM] Rate limited (429). Retrying in {wait_time}s... (attempt {attempt + 1}/{MAX_RETRIES})")
                time.sleep(wait_time)
                continue
            else:
                print(f"   [LLM] API Error: {e}")
                return {} if expect_json else f"Error: {e}"
    
    # All retries exhausted
    print(f"   [LLM] All {MAX_RETRIES} retries exhausted.")
    return {} if expect_json else "Error: Rate limit exceeded after retries"


def call_gemini_safe(prompt: str, fallback=None):
    """
    Calls Gemini expecting JSON. Returns fallback on any failure.
    The fallback type should match what the caller expects (dict or list).
    """
    result = call_gemini(prompt, expect_json=True)
    if isinstance(result, dict) and result:
        return result
    if isinstance(result, list) and result:
        return result
    return fallback if fallback is not None else {}
