-- Simplified match summary table.
-- One row per completed match — easy to insert, easy to query.
-- The normalized legs/leg_stats schema in 001 is available for deeper analytics later.

CREATE TABLE match_summaries (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  played_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Match config
  p1_name      TEXT NOT NULL,
  p2_name      TEXT NOT NULL,
  winner       TEXT NOT NULL,
  start_score  SMALLINT NOT NULL,
  out_rule     TEXT NOT NULL CHECK (out_rule IN ('double', 'single')),
  legs_to_win  SMALLINT NOT NULL,
  sets_to_win  SMALLINT NOT NULL,

  -- Final score
  p1_sets      SMALLINT NOT NULL DEFAULT 0,
  p2_sets      SMALLINT NOT NULL DEFAULT 0,
  p1_legs_won  SMALLINT NOT NULL DEFAULT 0,
  p2_legs_won  SMALLINT NOT NULL DEFAULT 0,

  -- Per-player stats (cumulative across all legs in the match)
  p1_avg       NUMERIC(5,2),
  p2_avg       NUMERIC(5,2),
  p1_first9    NUMERIC(5,2),
  p2_first9    NUMERIC(5,2),
  p1_co_pct    NUMERIC(5,1),
  p2_co_pct    NUMERIC(5,1),
  p1_180s      SMALLINT NOT NULL DEFAULT 0,
  p2_180s      SMALLINT NOT NULL DEFAULT 0,
  p1_140s      SMALLINT NOT NULL DEFAULT 0,
  p2_140s      SMALLINT NOT NULL DEFAULT 0,
  p1_100s      SMALLINT NOT NULL DEFAULT 0,
  p2_100s      SMALLINT NOT NULL DEFAULT 0
);

-- RLS: allow anonymous reads and inserts (no sign-in required)
ALTER TABLE match_summaries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone_insert" ON match_summaries FOR INSERT WITH CHECK (true);
CREATE POLICY "anyone_select" ON match_summaries FOR SELECT USING (true);

-- Career stats view — aggregates per player across all their matches.
-- Always up to date; no materialized view refresh needed at this scale.
CREATE VIEW career_stats AS
SELECT
  name,
  COUNT(*)                                            AS matches,
  SUM(wins)                                           AS wins,
  SUM(legs_won)                                       AS legs_won,
  ROUND(AVG(avg_score) FILTER (WHERE avg_score IS NOT NULL), 1) AS avg_score,
  ROUND(AVG(first9)    FILTER (WHERE first9    IS NOT NULL), 1) AS first9_avg,
  ROUND(AVG(co_pct)    FILTER (WHERE co_pct    IS NOT NULL), 1) AS co_pct,
  SUM(s180s)                                          AS total_180s,
  SUM(s140s)                                          AS total_140s
FROM (
  SELECT
    p1_name       AS name,
    CASE WHEN winner = p1_name THEN 1 ELSE 0 END AS wins,
    p1_legs_won   AS legs_won,
    p1_avg        AS avg_score,
    p1_first9     AS first9,
    p1_co_pct     AS co_pct,
    p1_180s       AS s180s,
    p1_140s       AS s140s
  FROM match_summaries

  UNION ALL

  SELECT
    p2_name,
    CASE WHEN winner = p2_name THEN 1 ELSE 0 END,
    p2_legs_won, p2_avg, p2_first9, p2_co_pct, p2_180s, p2_140s
  FROM match_summaries
) t
GROUP BY name
ORDER BY avg_score DESC NULLS LAST;
