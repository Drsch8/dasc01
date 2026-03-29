import type { GameConfig, PlayerStats } from '@/types/game'
import { getSupabaseClient } from './supabase'

export interface MatchPayload {
  config: GameConfig
  winner: string
  sets: [number, number]
  allStats: Record<string, PlayerStats>
}

function toAvg(stats: PlayerStats): number | null {
  return stats.darts > 0
    ? parseFloat((stats.scored / stats.darts * 3).toFixed(2))
    : null
}

function toFirst9(stats: PlayerStats): number | null {
  return stats.first9darts > 0
    ? parseFloat((stats.first9scored / stats.first9darts * 3).toFixed(2))
    : null
}

function toCoPct(stats: PlayerStats): number | null {
  return stats.attempts > 0
    ? parseFloat((stats.checkouts / stats.attempts * 100).toFixed(1))
    : null
}

/**
 * Saves a completed match to Supabase.
 * Silently no-ops if Supabase is not configured.
 */
export async function saveMatch(payload: MatchPayload): Promise<void> {
  const client = getSupabaseClient()
  if (!client) return

  const { config, winner, sets, allStats } = payload
  const p1 = allStats[config.p1] ?? null
  const p2 = allStats[config.p2] ?? null

  const { error } = await client.from('match_summaries').insert({
    p1_name:     config.p1,
    p2_name:     config.p2,
    winner,
    start_score: config.startScore,
    out_rule:    config.outRule,
    legs_to_win: config.legsToWin,
    sets_to_win: config.setsToWin,
    p1_sets:     sets[0],
    p2_sets:     sets[1],
    p1_legs_won: p1?.legs    ?? 0,
    p2_legs_won: p2?.legs    ?? 0,
    p1_avg:      p1 ? toAvg(p1)    : null,
    p2_avg:      p2 ? toAvg(p2)    : null,
    p1_first9:   p1 ? toFirst9(p1) : null,
    p2_first9:   p2 ? toFirst9(p2) : null,
    p1_co_pct:   p1 ? toCoPct(p1)  : null,
    p2_co_pct:   p2 ? toCoPct(p2)  : null,
    p1_180s:     p1?.ton80  ?? 0,
    p2_180s:     p2?.ton80  ?? 0,
    p1_140s:     p1?.ton40  ?? 0,
    p2_140s:     p2?.ton40  ?? 0,
    p1_100s:     p1?.tons   ?? 0,
    p2_100s:     p2?.tons   ?? 0,
  })

  if (error) {
    console.error('[saveMatch]', error.message)
  }
}
