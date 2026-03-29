-- Darts scorer schema
-- Run via: supabase db push

CREATE TABLE players (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name TEXT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE matches (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player1_id     UUID NOT NULL REFERENCES players(id),
  player2_id     UUID NOT NULL REFERENCES players(id),
  starting_score SMALLINT NOT NULL CHECK (starting_score IN (301, 501, 701)),
  out_rule       TEXT NOT NULL CHECK (out_rule IN ('double', 'single')),
  legs_to_win    SMALLINT NOT NULL,
  sets_to_win    SMALLINT NOT NULL,
  winner_id      UUID REFERENCES players(id),
  status         TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('in_progress', 'completed')),
  played_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE legs (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id       UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  set_number     SMALLINT NOT NULL,
  leg_number     SMALLINT NOT NULL,
  winner_id      UUID REFERENCES players(id),
  checkout_score SMALLINT
);

CREATE TABLE leg_stats (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  leg_id              UUID NOT NULL REFERENCES legs(id) ON DELETE CASCADE,
  player_id           UUID NOT NULL REFERENCES players(id),
  darts_thrown        SMALLINT NOT NULL DEFAULT 0,
  points_scored       SMALLINT NOT NULL DEFAULT 0,
  three_dart_avg      NUMERIC(5,2),
  first_9_avg         NUMERIC(5,2),
  checkout_attempts   SMALLINT NOT NULL DEFAULT 0,
  checkouts_hit       SMALLINT NOT NULL DEFAULT 0,
  tons_100            SMALLINT NOT NULL DEFAULT 0,
  tons_140            SMALLINT NOT NULL DEFAULT 0,
  tons_180            SMALLINT NOT NULL DEFAULT 0,
  is_winner           BOOLEAN NOT NULL DEFAULT false,
  UNIQUE (leg_id, player_id)
);

CREATE INDEX idx_leg_stats_player ON leg_stats(player_id);
CREATE INDEX idx_legs_match ON legs(match_id);

-- Career stats view (recomputed from raw data, never stale)
CREATE VIEW player_career_stats AS
SELECT
  p.id AS player_id,
  p.display_name,
  COUNT(DISTINCT l.match_id)                                    AS matches_played,
  COUNT(ls.id)                                                  AS legs_played,
  SUM(CASE WHEN ls.is_winner THEN 1 ELSE 0 END)                AS legs_won,
  ROUND(AVG(ls.three_dart_avg), 2)                              AS career_avg,
  ROUND(AVG(ls.first_9_avg), 2)                                 AS career_first9_avg,
  SUM(ls.tons_180)                                              AS total_180s,
  SUM(ls.tons_140)                                              AS total_140_plus,
  SUM(ls.tons_100)                                              AS total_100_plus,
  SUM(ls.checkouts_hit)                                         AS total_checkouts,
  SUM(ls.checkout_attempts)                                     AS total_attempts,
  CASE WHEN SUM(ls.checkout_attempts) > 0
    THEN ROUND(SUM(ls.checkouts_hit)::NUMERIC / SUM(ls.checkout_attempts) * 100, 1)
    ELSE NULL
  END AS checkout_pct
FROM leg_stats ls
JOIN players p ON p.id = ls.player_id
JOIN legs l ON l.id = ls.leg_id
GROUP BY p.id, p.display_name;

-- RLS: allow anonymous inserts (no auth required to save a match)
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE legs ENABLE ROW LEVEL SECURITY;
ALTER TABLE leg_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert players" ON players FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read players" ON players FOR SELECT USING (true);
CREATE POLICY "Anyone can insert matches" ON matches FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read matches" ON matches FOR SELECT USING (true);
CREATE POLICY "Anyone can insert legs" ON legs FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read legs" ON legs FOR SELECT USING (true);
CREATE POLICY "Anyone can insert leg_stats" ON leg_stats FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read leg_stats" ON leg_stats FOR SELECT USING (true);
