"""
Provider-backed and local classifier client selection.
"""
from __future__ import annotations

from typing import Any

import httpx

from config import AppConfig


class BaseHTTPClassifierClient:
    provider_name = "unknown"

    def __init__(self, model: str):
        self.model = model
        self.analysis_method = f"{self.provider_name} API model {self.model}"

    def generate_content(
        self,
        prompt: str,
        temperature: float = 0.3,
        max_tokens: int = 2000,
    ) -> str:
        raise NotImplementedError


class GroqClassifierClient(BaseHTTPClassifierClient):
    provider_name = "Groq"

    def __init__(self, api_key: str, model: str):
        super().__init__(model=model)
        self.api_key = api_key

    def generate_content(
        self,
        prompt: str,
        temperature: float = 0.3,
        max_tokens: int = 2000,
    ) -> str:
        response = httpx.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
            },
            json={
                "model": self.model,
                "temperature": temperature,
                "max_tokens": max_tokens,
                "messages": [{"role": "user", "content": prompt}],
            },
            timeout=60.0,
        )
        if response.is_error:
            raise RuntimeError(f"Groq API error {response.status_code}: {response.text}")
        data = response.json()
        return data["choices"][0]["message"]["content"]


class GeminiClassifierClient(BaseHTTPClassifierClient):
    provider_name = "Gemini"

    def __init__(self, api_key: str, model: str):
        super().__init__(model=model)
        self.api_key = api_key

    def generate_content(
        self,
        prompt: str,
        temperature: float = 0.3,
        max_tokens: int = 2000,
    ) -> str:
        url = (
            f"https://generativelanguage.googleapis.com/v1beta/models/"
            f"{self.model}:generateContent?key={self.api_key}"
        )
        response = httpx.post(
            url,
            headers={"Content-Type": "application/json"},
            json={
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {
                    "temperature": temperature,
                    "maxOutputTokens": max_tokens,
                },
            },
            timeout=60.0,
        )
        if response.is_error:
            raise RuntimeError(f"Gemini API error {response.status_code}: {response.text}")
        data = response.json()
        candidates = data.get("candidates", [])
        if not candidates:
            raise ValueError("Gemini returned no candidates")
        parts = candidates[0].get("content", {}).get("parts", [])
        text = "".join(part.get("text", "") for part in parts).strip()
        if not text:
            raise ValueError("Gemini returned empty text")
        return text


def create_classifier_llm_from_config(config: AppConfig, local_client: Any, mock_client: Any) -> Any:
    if config.classifier_mode == "mock":
        return mock_client
    if config.classifier_mode == "local":
        return local_client
    if config.classifier_mode != "provider":
        raise RuntimeError(f"Unsupported CLASSIFIER_MODE '{config.classifier_mode}'")

    if config.llm_provider == "groq":
        if not config.groq_api_key:
            raise RuntimeError("GROQ_API_KEY is missing")
        return GroqClassifierClient(api_key=config.groq_api_key, model=config.groq_model)

    if config.llm_provider == "gemini":
        if not config.gemini_api_key:
            raise RuntimeError("GEMINI_API_KEY is missing")
        return GeminiClassifierClient(api_key=config.gemini_api_key, model=config.gemini_model)

    raise RuntimeError("Unsupported LLM_PROVIDER. Use 'groq' or 'gemini'.")
