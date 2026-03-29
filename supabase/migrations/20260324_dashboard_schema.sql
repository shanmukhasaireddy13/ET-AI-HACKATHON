-- Migration: Dashboard and Agent Features

-- Table: meetings
CREATE TABLE IF NOT EXISTS public.meetings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  status          TEXT DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
  summary         TEXT,
  risk_level      TEXT CHECK (risk_level IN ('low', 'medium', 'high')),
  health_score    INT CHECK (health_score >= 0 AND health_score <= 100),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_meetings_user_id ON public.meetings(user_id);
CREATE INDEX idx_meetings_status ON public.meetings(status);

ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "meetings_select_own" ON public.meetings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "meetings_insert_own" ON public.meetings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "meetings_update_own" ON public.meetings FOR UPDATE USING (auth.uid() = user_id);

-- Table: tasks
CREATE TABLE IF NOT EXISTS public.tasks (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id      UUID NOT NULL REFERENCES public.meetings(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  assignee_name   TEXT,
  priority        TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  status          TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  due_at          TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tasks_meeting_id ON public.tasks(meeting_id);
CREATE INDEX idx_tasks_user_id ON public.tasks(user_id);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tasks_select_own" ON public.tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "tasks_insert_own" ON public.tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "tasks_update_own" ON public.tasks FOR UPDATE USING (auth.uid() = user_id);

-- Table: approvals
CREATE TABLE IF NOT EXISTS public.approvals (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id      UUID NOT NULL REFERENCES public.meetings(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tool_name       TEXT NOT NULL,
  args            JSONB DEFAULT '{}',
  source_agent    TEXT,
  status          TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reason          TEXT,
  feedback        TEXT,
  decided_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_approvals_meeting_id ON public.approvals(meeting_id);
CREATE INDEX idx_approvals_user_id ON public.approvals(user_id);

ALTER TABLE public.approvals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "approvals_select_own" ON public.approvals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "approvals_update_own" ON public.approvals FOR UPDATE USING (auth.uid() = user_id);

-- Table: integrations
CREATE TABLE IF NOT EXISTS public.integrations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  service_name    TEXT NOT NULL,
  status          TEXT DEFAULT 'connected' CHECK (status IN ('connected', 'disconnected', 'error')),
  settings        JSONB DEFAULT '{}',
  last_sync_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, service_name)
);

ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "integrations_select_own" ON public.integrations FOR SELECT USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER set_meetings_updated_at BEFORE UPDATE ON public.meetings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
