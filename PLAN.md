# Agent Platform Architecture Plan

## Summary
Build the backend into a LangGraph-first, multi-agent platform for full-meeting transcript processing, with Supabase/Postgres as the system-of-record for structured workflow data and MongoDB as the long-lived agent memory/context store.

Chosen defaults:
- LangGraph becomes the primary runtime.
- First milestone covers the full chain: `classifier -> planner -> executor -> monitor -> recovery`.
- Executor is approval-first and simulates downstream actions rather than performing real external side effects.
- Initial product model is a single workspace team with multiple users and approvals.
- Frontend planning stays backend-first, with clear API contracts for later UI integration.

## Implementation Changes
### Runtime and orchestration
- Keep the current FastAPI entrypoints and Express gateway contract stable, but make LangGraph the canonical execution engine behind them.
- Refactor the current orchestrator into a thin compatibility/service layer that:
  - creates graph input state from the API request,
  - invokes the LangGraph workflow,
  - maps graph output into API response shape,
  - records execution metadata and errors.
- Define a single graph state model that includes:
  - meeting metadata,
  - transcript and optional chunk summaries,
  - detected workflows,
  - planned tasks,
  - execution proposals,
  - approval requirements,
  - audit trail,
  - retry/recovery state,
  - memory references into MongoDB.

### Agent set and behavior
- Classifier:
  - consume full transcript text,
  - detect workflow types, stakeholders, deadlines, risks, approvals, and unresolved issues,
  - emit normalized workflow objects with confidence and reasoning.
- Planner:
  - turn workflows into task plans with owners, due dates, dependencies, and approval requirements,
  - produce deterministic task IDs and stable task schemas.
- Executor:
  - convert approved plans into execution proposals only,
  - support simulated adapters first for Slack/Jira/Calendar/email-style actions,
  - write proposal status and payloads to Supabase instead of calling external systems.
- Monitor:
  - validate graph outputs, detect missing owners/dates/approvals, and flag ambiguous tasks.
- Recovery:
  - handle parse failures, low-confidence classification, invalid plans, and missing approvals,
  - either retry with revised prompts or mark the meeting as `needs_review`.
- Standardize every agent to return:
  - updated graph state,
  - audit entries,
  - memory upserts,
  - explicit failure category when it cannot proceed.

### Data architecture
- Supabase/Postgres responsibilities:
  - workspaces, users, memberships, meetings, meeting runs, workflows, tasks, approvals, audit logs, execution proposals, adapter runs, and graph run metadata.
- MongoDB responsibilities:
  - agent memory documents,
  - transcript chunk storage and derived summaries,
  - conversation/history context,
  - retrieval-ready long-form notes,
  - retry context and unstructured tool/agent observations.
- Recommended Supabase schema groups:
  - identity/workspace: `workspaces`, `users`, `workspace_members`
  - meeting pipeline: `meetings`, `meeting_runs`, `meeting_artifacts`
  - agent outputs: `workflows`, `tasks`, `approvals`, `execution_proposals`, `audit_logs`
  - observability: `graph_runs`, `agent_runs`, `run_errors`
- Recommended MongoDB collections:
  - `agent_memories`
  - `transcript_chunks`
  - `meeting_context`
  - `retrieval_cache`
  - `agent_observations`
- Use Supabase `jsonb` for bounded structured metadata, but keep long-form mutable memory in MongoDB.
- Migrate off SQLite entirely once Supabase integration lands; no dual-write beyond a temporary migration window.

### API and contract changes
- Keep `POST /api/meetings/process` as the main intake endpoint, but define a stable response contract with:
  - `meeting_id`
  - `run_id`
  - `status`
  - `current_stage`
  - `workflows`
  - `tasks`
  - `approvals`
  - `execution_proposals`
  - `audit_summary`
  - `errors`
- Add or formalize backend endpoints for:
  - meeting run status/detail,
  - workflow/task review,
  - approvals queue and approval decision submission,
  - audit timeline retrieval,
  - memory/analysis inspection for internal debugging only.
- Keep Express as the BFF/gateway that forwards request IDs and normalizes backend responses for the frontend.

### Codebase cleanup and structure
- Reorganize backend into clean subsystem boundaries:
  - graph/runtime
  - agents
  - adapters
  - repositories/persistence
  - api/schemas
  - observability
- Remove demo-only language from production paths and clearly separate:
  - local fallback classifier,
  - mock/test clients,
  - provider-backed LLM clients.
- Standardize config loading and provider selection in one config module.
- Normalize encoding/logging/docstrings and remove mojibake/demo banner noise.
- Keep no more than one source of truth for:
  - agent state schema,
  - persistence models,
  - API schemas,
  - provider configuration.

## Test Plan
- Unit tests:
  - each agent’s success path and failure path,
  - graph state transitions,
  - provider selection/config validation,
  - repository logic for Supabase and MongoDB persistence.
- Integration tests:
  - full transcript -> full graph run,
  - low-confidence/ambiguous transcript -> recovery or review path,
  - approval-required meeting -> paused execution proposal path,
  - malformed provider config -> clear startup/runtime failure.
- Contract tests:
  - Express -> FastAPI request/response shape,
  - approval endpoints,
  - audit and run-status endpoints.
- Data tests:
  - Supabase writes for structured entities,
  - MongoDB writes for memory/chunks/context,
  - run rehydration from persisted state.
- Acceptance scenarios:
  - transcript with tasks + approval + scheduling + issue produces complete graph output,
  - rerun preserves meeting history and memory references,
  - no external side effects occur before approval.

## Assumptions and Defaults
- First production milestone does not execute real Jira/Slack/Calendar actions.
- LangGraph is the runtime engine; the existing orchestrator remains only as a compatibility wrapper.
- Supabase is the operational database and MongoDB is the unstructured memory store.
- Initial architecture is single-workspace-team, not multi-tenant SaaS.
- Frontend work in this phase is limited to API-ready contracts and the minimum backend support for transcript upload, review, approvals, and audit views.
- Real LLM provider support remains configurable by environment, with local/mock modes preserved for development and test.
