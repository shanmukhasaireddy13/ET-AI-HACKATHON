-- Migration: Basic user authentication

-- Table: profiles
CREATE TABLE public.profiles (
  id                  UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email               TEXT NOT NULL UNIQUE,
  first_name          TEXT,
  last_name           TEXT,
  full_name           TEXT GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED,
  avatar_url          TEXT,
  theme               TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'system')),
  is_active           BOOLEAN DEFAULT TRUE,
  last_seen_at        TIMESTAMPTZ,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_is_active ON public.profiles(is_active);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "profiles_select_own"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "profiles_update_own"
ON public.profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Profile is inserted via trigger, not client
CREATE POLICY "profiles_insert_trigger_only"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- Table: user_sessions (optional tracking)
CREATE TABLE public.user_sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  supabase_session_id TEXT,
  device_name     TEXT,
  browser         TEXT,
  os              TEXT,
  ip_address      INET,
  location        TEXT,
  is_current      BOOLEAN DEFAULT FALSE,
  last_active_at  TIMESTAMPTZ DEFAULT NOW(),
  expires_at      TIMESTAMPTZ,
  revoked_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sessions_select_own"
ON public.user_sessions FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "sessions_update_own"
ON public.user_sessions FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Function & Trigger: handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function & Trigger: set_updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
