-- Keepalive heartbeat.
-- A single row that the scheduled workflow writes to every day.
--
-- Why a write and not a read: a plain anon SELECT through PostgREST ran green
-- every two days from 2026-09-03 onward and Supabase still issued a pause
-- warning, so a read does not register as activity for the free-tier timer.
-- An UPDATE produces WAL and disk writes, which is unambiguous.

CREATE TABLE IF NOT EXISTS heartbeat (
  id        SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  pinged_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Exactly one row, created once. Re-running this migration is a no-op.
INSERT INTO heartbeat (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

ALTER TABLE heartbeat ENABLE ROW LEVEL SECURITY;

-- The table holds no data and the CHECK constraint caps it at one row, so
-- letting the public anon key write it costs nothing — and keeps a
-- service_role key (which would bypass RLS entirely) out of CI secrets.
--
-- Dropped first because Postgres has no CREATE POLICY IF NOT EXISTS, and this
-- file is meant to survive being pasted into the SQL editor twice.
DROP POLICY IF EXISTS "anyone_select_heartbeat" ON heartbeat;
CREATE POLICY "anyone_select_heartbeat" ON heartbeat
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "anyone_update_heartbeat" ON heartbeat;
CREATE POLICY "anyone_update_heartbeat" ON heartbeat
  FOR UPDATE USING (id = 1) WITH CHECK (id = 1);
