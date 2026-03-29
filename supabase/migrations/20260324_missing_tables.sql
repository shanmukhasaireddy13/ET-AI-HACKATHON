-- Migration: 20260324_missing_tables.sql
-- Description: Adds missing tables for Meeting Mind agent engine to Supabase

-- Events Table
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    time TEXT,
    attendees JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bug Tickets Table
CREATE TABLE IF NOT EXISTS bug_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    severity TEXT DEFAULT 'medium',
    jira_ticket_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Followups Table
CREATE TABLE IF NOT EXISTS followups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
    item TEXT NOT NULL,
    owner TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agent Reasoning Table (Detailed Log)
CREATE TABLE IF NOT EXISTS agent_reasoning (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
    agent TEXT NOT NULL,
    reasoning TEXT NOT NULL,
    outputs JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE bug_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE followups ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_reasoning ENABLE ROW LEVEL SECURITY;

-- Policies (Simplified: User can see all for now, or link to meeting's user_id)
-- For proper isolation, we should use a JOIN or store user_id here too.
-- For this hackathon, we'll assume sharing via meeting_id is enough if meetings are secure.

CREATE POLICY "Users can view events for their meetings" ON events
    FOR SELECT USING (EXISTS (SELECT 1 FROM meetings WHERE meetings.id = events.meeting_id AND meetings.user_id = auth.uid()));

CREATE POLICY "Users can view bugs for their meetings" ON bug_tickets
    FOR SELECT USING (EXISTS (SELECT 1 FROM meetings WHERE meetings.id = bug_tickets.meeting_id AND meetings.user_id = auth.uid()));

CREATE POLICY "Users can view followups for their meetings" ON followups
    FOR SELECT USING (EXISTS (SELECT 1 FROM meetings WHERE meetings.id = followups.meeting_id AND meetings.user_id = auth.uid()));

CREATE POLICY "Users can view reasoning for their meetings" ON agent_reasoning
    FOR SELECT USING (EXISTS (SELECT 1 FROM meetings WHERE meetings.id = agent_reasoning.meeting_id AND meetings.user_id = auth.uid()));
