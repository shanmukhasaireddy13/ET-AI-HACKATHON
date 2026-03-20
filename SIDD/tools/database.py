"""
💾 SQLite Persistence Layer for SIDD
=====================================
Stores all meeting workflow results in a local sidd.db file.
"""

import sqlite3
import json
import uuid
from datetime import datetime
from pathlib import Path

DB_PATH = Path(__file__).resolve().parent.parent / "sidd.db"


def _get_conn() -> sqlite3.Connection:
    """Get a connection with row_factory for dict-like access."""
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    return conn


def init_db():
    """Create all tables if they don't already exist."""
    conn = _get_conn()
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS meetings (
            id              TEXT PRIMARY KEY,
            transcript      TEXT NOT NULL,
            summary         TEXT DEFAULT '',
            orchestrator_reasoning TEXT DEFAULT '',
            dynamic_steps   TEXT DEFAULT '[]',
            completed_steps TEXT DEFAULT '[]',
            created_at      TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS tasks (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            meeting_id  TEXT NOT NULL REFERENCES meetings(id),
            assignee    TEXT DEFAULT '',
            task        TEXT NOT NULL,
            priority    TEXT DEFAULT 'medium',
            status      TEXT DEFAULT 'pending',
            due_at      TEXT DEFAULT ''
        );

        CREATE TABLE IF NOT EXISTS events (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            meeting_id  TEXT NOT NULL REFERENCES meetings(id),
            title       TEXT NOT NULL,
            time        TEXT DEFAULT '',
            attendees   TEXT DEFAULT '[]'
        );

        CREATE TABLE IF NOT EXISTS bug_tickets (
            id              INTEGER PRIMARY KEY AUTOINCREMENT,
            meeting_id      TEXT NOT NULL REFERENCES meetings(id),
            title           TEXT NOT NULL,
            severity        TEXT DEFAULT 'medium',
            jira_ticket_id  TEXT DEFAULT ''
        );

        CREATE TABLE IF NOT EXISTS followups (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            meeting_id  TEXT NOT NULL REFERENCES meetings(id),
            item        TEXT NOT NULL,
            owner       TEXT DEFAULT ''
        );

        CREATE TABLE IF NOT EXISTS execution_results (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            meeting_id  TEXT NOT NULL REFERENCES meetings(id),
            step        INTEGER DEFAULT 0,
            tool        TEXT DEFAULT '',
            source      TEXT DEFAULT '',
            result      TEXT DEFAULT '{}'
        );

        CREATE TABLE IF NOT EXISTS audit_log (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            meeting_id  TEXT NOT NULL REFERENCES meetings(id),
            entry       TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS pending_approvals (
            id          TEXT PRIMARY KEY,
            meeting_id  TEXT NOT NULL REFERENCES meetings(id),
            tool        TEXT NOT NULL,
            args        TEXT DEFAULT '{}',
            source_agent TEXT DEFAULT '',
            status      TEXT DEFAULT 'pending',
            reason      TEXT DEFAULT '',
            approved_by TEXT DEFAULT '',
            feedback    TEXT DEFAULT '',
            created_at  TEXT NOT NULL,
            decided_at  TEXT DEFAULT ''
        );

        CREATE TABLE IF NOT EXISTS agent_reasoning (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            meeting_id  TEXT NOT NULL REFERENCES meetings(id),
            agent       TEXT NOT NULL,
            reasoning   TEXT NOT NULL,
            outputs     TEXT DEFAULT '[]',
            created_at  TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS integrations (
            id          TEXT PRIMARY KEY,
            service     TEXT NOT NULL UNIQUE,
            base_url    TEXT DEFAULT '',
            email       TEXT DEFAULT '',
            api_token   TEXT DEFAULT '',
            project_key TEXT DEFAULT '',
            extra       TEXT DEFAULT '{}',
            status      TEXT DEFAULT 'connected',
            connected_at TEXT NOT NULL
        );
    """)
    
    # Safely inject missing columns for older databases
    _safe_alter(conn, "meetings", "dynamic_steps", "TEXT DEFAULT '[]'")
    _safe_alter(conn, "meetings", "completed_steps", "TEXT DEFAULT '[]'")
    _safe_alter(conn, "tasks", "status", "TEXT DEFAULT 'pending'")
    _safe_alter(conn, "tasks", "due_at", "TEXT DEFAULT ''")

    conn.commit()
    conn.close()


def _safe_alter(conn, table, column, col_type):
    """Add a column if it doesn't exist (SQLite has no IF NOT EXISTS for ALTER)."""
    try:
        conn.execute(f"ALTER TABLE {table} ADD COLUMN {column} {col_type}")
    except sqlite3.OperationalError:
        pass


def save_meeting_results(state: dict) -> str:
    """
    Persist the final LangGraph state into SQLite.
    Returns the generated meeting_id.
    """
    init_db()
    conn = _get_conn()

    meeting_id = state.get("meeting_id") or f"mtg-{uuid.uuid4().hex[:8]}-{datetime.now().strftime('%Y%m%d%H%M%S')}"

    # ── meetings table ──
    conn.execute(
        "INSERT INTO meetings (id, transcript, summary, orchestrator_reasoning, dynamic_steps, completed_steps, created_at) VALUES (?,?,?,?,?,?,?)",
        (
            meeting_id,
            state.get("meeting_transcript", ""),
            state.get("meeting_summary", ""),
            state.get("orchestrator_reasoning", ""),
            json.dumps(state.get("dynamic_steps", [])),
            json.dumps(state.get("completed_steps", [])),
            datetime.now().isoformat(),
        ),
    )

    # ── tasks ──
    for t in state.get("assigned_tasks", []):
        conn.execute(
            "INSERT INTO tasks (meeting_id, assignee, task, priority) VALUES (?,?,?,?)",
            (meeting_id, t.get("assignee", ""), t.get("task", str(t)), t.get("priority", "medium")),
        )

    # ── events ──
    for ev in state.get("scheduled_events", []):
        conn.execute(
            "INSERT INTO events (meeting_id, title, time, attendees) VALUES (?,?,?,?)",
            (meeting_id, ev.get("title", str(ev)), ev.get("time", ""), json.dumps(ev.get("attendees", []))),
        )

    # ── bug_tickets ──
    for bt in state.get("bug_tickets", []):
        conn.execute(
            "INSERT INTO bug_tickets (meeting_id, title, severity, jira_ticket_id) VALUES (?,?,?,?)",
            (meeting_id, bt.get("title", str(bt)), bt.get("severity", "medium"), bt.get("jira_ticket_id", "")),
        )

    # ── followups ──
    for fu in state.get("followup_items", []):
        conn.execute(
            "INSERT INTO followups (meeting_id, item, owner) VALUES (?,?,?)",
            (meeting_id, fu.get("item", str(fu)), fu.get("owner", "")),
        )

    # ── execution_results ──
    for er in state.get("execution_results", []):
        conn.execute(
            "INSERT INTO execution_results (meeting_id, step, tool, source, result) VALUES (?,?,?,?,?)",
            (meeting_id, er.get("step", 0), er.get("tool", ""), er.get("source", ""), json.dumps(er.get("result", {}))),
        )

    # ── audit_log ──
    for entry in state.get("audit_log", []):
        conn.execute(
            "INSERT INTO audit_log (meeting_id, entry) VALUES (?,?)",
            (meeting_id, str(entry)),
        )

    # ── pending_approvals ──
    for ap in state.get("pending_approvals", []):
        try:
            conn.execute(
                "INSERT OR REPLACE INTO pending_approvals (id, meeting_id, tool, args, source_agent, status, reason, created_at) VALUES (?,?,?,?,?,?,?,?)",
                (ap.get("id", ""), meeting_id, ap.get("tool", ""), json.dumps(ap.get("args", {})),
                 ap.get("source_agent", ""), ap.get("status", "pending"), ap.get("reason", ""),
                 ap.get("created_at", datetime.now().isoformat())),
            )
        except Exception:
            pass

    # ── agent_reasoning ──
    for ar in state.get("agent_reasoning", []):
        conn.execute(
            "INSERT INTO agent_reasoning (meeting_id, agent, reasoning, outputs, created_at) VALUES (?,?,?,?,?)",
            (meeting_id, ar.get("agent", ""), ar.get("reasoning", ""),
             json.dumps(ar.get("outputs_produced", [])), ar.get("timestamp", datetime.now().isoformat())),
        )

    conn.commit()
    conn.close()

    print(f"   💾 Meeting results saved to database  (id: {meeting_id})")
    return meeting_id


# ═════════════════════════════════════════
#  QUERY HELPERS
# ═════════════════════════════════════════

def get_meeting(meeting_id: str) -> dict:
    """Retrieve a single meeting and all related data."""
    init_db()
    conn = _get_conn()

    row = conn.execute("SELECT * FROM meetings WHERE id = ?", (meeting_id,)).fetchone()
    if not row:
        conn.close()
        return {}

    meeting = dict(row)
    meeting["dynamic_steps"] = json.loads(meeting.get("dynamic_steps", "[]"))
    meeting["completed_steps"] = json.loads(meeting.get("completed_steps", "[]"))
    meeting["tasks"] = [dict(r) for r in conn.execute("SELECT * FROM tasks WHERE meeting_id = ?", (meeting_id,)).fetchall()]
    meeting["events"] = [dict(r) for r in conn.execute("SELECT * FROM events WHERE meeting_id = ?", (meeting_id,)).fetchall()]
    meeting["bug_tickets"] = [dict(r) for r in conn.execute("SELECT * FROM bug_tickets WHERE meeting_id = ?", (meeting_id,)).fetchall()]
    meeting["followups"] = [dict(r) for r in conn.execute("SELECT * FROM followups WHERE meeting_id = ?", (meeting_id,)).fetchall()]
    meeting["execution_results"] = [dict(r) for r in conn.execute("SELECT * FROM execution_results WHERE meeting_id = ?", (meeting_id,)).fetchall()]
    meeting["audit_log"] = [dict(r) for r in conn.execute("SELECT * FROM audit_log WHERE meeting_id = ?", (meeting_id,)).fetchall()]
    meeting["pending_approvals"] = [dict(r) for r in conn.execute("SELECT * FROM pending_approvals WHERE meeting_id = ?", (meeting_id,)).fetchall()]
    meeting["agent_reasoning"] = [dict(r) for r in conn.execute("SELECT * FROM agent_reasoning WHERE meeting_id = ?", (meeting_id,)).fetchall()]

    conn.close()
    return meeting


def get_all_meetings() -> list:
    """List all meetings (summary only, no child records)."""
    init_db()
    conn = _get_conn()
    rows = conn.execute("SELECT id, summary, orchestrator_reasoning, dynamic_steps, created_at FROM meetings ORDER BY created_at DESC").fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_pending_approvals(meeting_id: str = None, status: str = None) -> list:
    """Get pending approvals, optionally filtered by meeting_id and/or status."""
    init_db()
    conn = _get_conn()
    query = "SELECT * FROM pending_approvals WHERE 1=1"
    params = []
    if meeting_id:
        query += " AND meeting_id = ?"
        params.append(meeting_id)
    if status:
        query += " AND status = ?"
        params.append(status)
    query += " ORDER BY created_at DESC"
    rows = conn.execute(query, params).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def decide_approval(approval_id: str, decision: str, approved_by: str = "", feedback: str = "") -> dict:
    """Approve or reject a pending approval. Returns the updated record."""
    init_db()
    conn = _get_conn()
    conn.execute(
        "UPDATE pending_approvals SET status = ?, approved_by = ?, feedback = ?, decided_at = ? WHERE id = ?",
        (decision, approved_by, feedback, datetime.now().isoformat(), approval_id)
    )
    conn.commit()
    row = conn.execute("SELECT * FROM pending_approvals WHERE id = ?", (approval_id,)).fetchone()
    conn.close()
    if row:
        return dict(row)
    return {}

