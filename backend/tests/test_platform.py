import os
import sys
from pathlib import Path

from fastapi.testclient import TestClient


BACKEND_DIR = Path(__file__).resolve().parents[1]
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

os.environ["DATABASE_URL"] = "sqlite:///./test_agent_system.db"
os.environ["CLASSIFIER_MODE"] = "local"
os.environ.pop("MONGODB_URL", None)

import main  # noqa: E402


def test_process_meeting_full_flow():
    with TestClient(main.app) as client:
        response = client.post(
            "/api/meetings/process",
            json={
                "meeting_id": "meeting-test-1",
                "transcript": (
                    "Anita will prepare release notes by Friday. "
                    "We need legal approval before launch. "
                    "Schedule a launch sync next Monday. "
                    "The payment bug is failing in production."
                ),
            },
        )

    assert response.status_code == 200
    payload = response.json()
    assert payload["meeting_id"] == "meeting-test-1"
    assert payload["run_id"]
    assert payload["status"] in {"completed", "needs_review"}
    assert len(payload["workflows"]) >= 3
    assert len(payload["tasks"]) >= 3
    assert len(payload["execution_proposals"]) == len(payload["tasks"])
    assert payload["audit_summary"]["count"] >= 4


def test_memory_endpoint_returns_chunks():
    with TestClient(main.app) as client:
        client.post(
            "/api/meetings/process",
            json={
                "meeting_id": "meeting-memory-1",
                "transcript": "Rahul will build the API by Friday and schedule a review next Monday.",
            },
        )
        response = client.get("/api/meetings/meeting-memory-1/memory")

    assert response.status_code == 200
    payload = response.json()
    assert payload["meeting_id"] == "meeting-memory-1"
    assert len(payload["transcript_chunks"]) >= 1


def test_approval_decision_updates_status():
    with TestClient(main.app) as client:
        response = client.post(
            "/api/meetings/process",
            json={
                "meeting_id": "meeting-approval-1",
                "transcript": "We need CFO approval for the budget before we continue the project.",
            },
        )
        process_payload = response.json()
        approval = process_payload["approvals"][0]

        decision_response = client.post(
            f"/api/approvals/{approval['task_id']}/decision",
            json={"status": "approved", "approved_by": "cfo@example.com", "feedback": "Looks good"},
        )

    assert decision_response.status_code == 200
    payload = decision_response.json()
    assert payload["status"] == "approved"
    assert payload["approved_by"] == "cfo@example.com"


def test_latest_run_endpoint():
    with TestClient(main.app) as client:
        client.post(
            "/api/meetings/process",
            json={
                "meeting_id": "meeting-latest-run",
                "transcript": "Schedule a retrospective next Tuesday and prepare the notes.",
            },
        )
        response = client.get("/api/meetings/meeting-latest-run/runs/latest")

    assert response.status_code == 200
    payload = response.json()
    assert payload["meeting_id"] == "meeting-latest-run"
    assert payload["run_id"]
