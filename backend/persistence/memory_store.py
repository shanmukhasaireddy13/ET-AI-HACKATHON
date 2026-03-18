"""
Mongo-backed memory storage with in-memory fallback for local development/tests.
"""
from __future__ import annotations

from collections import defaultdict
from typing import Any, Dict, List

from pymongo import MongoClient

from config import AppConfig
from graph.state import utc_now_iso


class BaseMemoryStore:
    def save_transcript_chunks(self, meeting_id: str, transcript: str) -> List[Dict[str, Any]]:
        raise NotImplementedError

    def upsert_agent_memory(self, meeting_id: str, agent_name: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        raise NotImplementedError

    def get_meeting_memory(self, meeting_id: str) -> Dict[str, Any]:
        raise NotImplementedError


class InMemoryMemoryStore(BaseMemoryStore):
    def __init__(self) -> None:
        self.agent_memories: dict[str, dict[str, Dict[str, Any]]] = defaultdict(dict)
        self.transcript_chunks: dict[str, List[Dict[str, Any]]] = defaultdict(list)

    def save_transcript_chunks(self, meeting_id: str, transcript: str) -> List[Dict[str, Any]]:
        chunks: List[Dict[str, Any]] = []
        chunk_size = 1200
        for index in range(0, len(transcript), chunk_size):
            chunk_text = transcript[index:index + chunk_size]
            chunks.append(
                {
                    "chunk_id": f"{meeting_id}-chunk-{(index // chunk_size) + 1}",
                    "meeting_id": meeting_id,
                    "content": chunk_text,
                    "created_at": utc_now_iso(),
                }
            )
        self.transcript_chunks[meeting_id] = chunks
        return chunks

    def upsert_agent_memory(self, meeting_id: str, agent_name: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        document = {
            "meeting_id": meeting_id,
            "agent_name": agent_name,
            "updated_at": utc_now_iso(),
            **payload,
        }
        self.agent_memories[meeting_id][agent_name] = document
        return document

    def get_meeting_memory(self, meeting_id: str) -> Dict[str, Any]:
        return {
            "agent_memories": list(self.agent_memories.get(meeting_id, {}).values()),
            "transcript_chunks": self.transcript_chunks.get(meeting_id, []),
        }


class MongoMemoryStore(BaseMemoryStore):
    def __init__(self, config: AppConfig) -> None:
        self.client = MongoClient(config.mongodb_url)
        self.db = self.client[config.mongodb_database]

    def save_transcript_chunks(self, meeting_id: str, transcript: str) -> List[Dict[str, Any]]:
        chunks: List[Dict[str, Any]] = []
        chunk_size = 1200
        self.db.transcript_chunks.delete_many({"meeting_id": meeting_id})
        for index in range(0, len(transcript), chunk_size):
            chunk_text = transcript[index:index + chunk_size]
            chunk = {
                "chunk_id": f"{meeting_id}-chunk-{(index // chunk_size) + 1}",
                "meeting_id": meeting_id,
                "content": chunk_text,
                "created_at": utc_now_iso(),
            }
            chunks.append(chunk)
        if chunks:
            self.db.transcript_chunks.insert_many(chunks)
        return chunks

    def upsert_agent_memory(self, meeting_id: str, agent_name: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        document = {
            "meeting_id": meeting_id,
            "agent_name": agent_name,
            "updated_at": utc_now_iso(),
            **payload,
        }
        self.db.agent_memories.update_one(
            {"meeting_id": meeting_id, "agent_name": agent_name},
            {"$set": document},
            upsert=True,
        )
        return document

    def get_meeting_memory(self, meeting_id: str) -> Dict[str, Any]:
        return {
            "agent_memories": list(self.db.agent_memories.find({"meeting_id": meeting_id}, {"_id": 0})),
            "transcript_chunks": list(self.db.transcript_chunks.find({"meeting_id": meeting_id}, {"_id": 0})),
        }


def create_memory_store(config: AppConfig) -> BaseMemoryStore:
    if config.mongodb_url:
        return MongoMemoryStore(config)
    return InMemoryMemoryStore()
