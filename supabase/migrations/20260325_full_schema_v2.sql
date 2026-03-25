-- New tables for full dynamic hydration

-- 1. Agents Table
CREATE TABLE IF NOT EXISTS public.agents (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    description TEXT,
    model TEXT,
    version TEXT,
    tools TEXT[],
    permissions TEXT[],
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Agent Metrics Table
CREATE TABLE IF NOT EXISTS public.agent_metrics (
    agent_id TEXT REFERENCES public.agents(id) ON DELETE CASCADE,
    tasks_done INTEGER DEFAULT 0,
    success_rate FLOAT DEFAULT 100.0,
    avg_response_time FLOAT DEFAULT 0.0, -- in seconds
    last_active_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (agent_id)
);

-- 3. Activity Events Table (Unified Audit Log)
CREATE TABLE IF NOT EXISTS public.activity_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    category TEXT NOT NULL, -- 'meeting', 'task', 'agent', 'integration', 'system'
    action TEXT NOT NULL, -- 'analyzed', 'created', 'approved', 'connected'
    entity_id UUID, -- reference to meeting_id or task_id or approval_id
    entity_type TEXT,
    description TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Initial Seed Data for Agents
INSERT INTO public.agents (id, name, type, model, version, tools, permissions)
VALUES 
('p1', 'Transcript Parser Agent', 'Parser', 'Claude 3.5 Sonnet', 'v2.1.4', ARRAY['File System', 'Natural Language Processing'], ARRAY['Read', 'Write']),
('e1', 'Decision Extractor Agent', 'Extractor', 'Claude 3.5 Sonnet', 'v1.0.2', ARRAY['Database', 'Logic'], ARRAY['Read']),
('g1', 'Task Generator Agent', 'Generator', 'Claude 3.5 Sonnet', 'v1.2.0', ARRAY['Jira API', 'Asana'], ARRAY['Read', 'Write']),
('a1', 'Assignment Agent', 'Assignment', 'GPT-4o', 'v2.0.1', ARRAY['Slack', 'Email'], ARRAY['Read', 'Write']),
('j1', 'Jira Integration Agent', 'Integration', 'System', 'v3.0.0', ARRAY['Jira Enterprise'], ARRAY['Read', 'Write']);

-- Initial Seed Data for Metrics
INSERT INTO public.agent_metrics (agent_id, tasks_done, success_rate, avg_response_time)
VALUES 
('p1', 1450, 99.9, 1.2),
('e1', 842, 98.5, 0.8),
('g1', 1204, 99.1, 2.1),
('a1', 512, 94.2, 1.5),
('j1', 2108, 100.0, 0.5);

-- Enable RLS (though I'll likely keep them open for demo if needed, but let's define policies)
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read for demo" ON public.agents FOR SELECT USING (true);
CREATE POLICY "Allow public read for demo" ON public.agent_metrics FOR SELECT USING (true);
CREATE POLICY "Allow public read for demo" ON public.activity_events FOR SELECT USING (true);

-- Allow anonymous inserts for agent workers (or use service role)
CREATE POLICY "Allow public insert for demo" ON public.activity_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update for demo" ON public.agent_metrics FOR UPDATE USING (true);
