import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabaseClient } from '@/lib/supabase-server'
import type { MatchPayload } from '@/lib/save-match'
import type { PlayerStats } from '@/types/game'

function toAvg(st: PlayerStats): number | null {
  return st.darts > 0 ? parseFloat((st.scored / st.darts * 3).toFixed(2)) : null
}
function toFirst9(st: PlayerStats): number | null {
  return st.first9darts > 0 ? parseFloat((st.first9scored / st.first9darts * 3).toFixed(2)) : null
}
function toCoPct(st: PlayerStats): number | null {
  return st.attempts > 0 ? parseFloat((st.checkouts / st.attempts * 100).toFixed(1)) : null
}

export async function POST(request: NextRequest) {
  const supabase = getServerSupabaseClient()
  if (!supabase) {
    return NextResponse.json({ ok: false, reason: 'not configured' }, { status: 503 })
  }

  const payload: MatchPayload = await request.json()
  const { config, winner, sets, allStats } = payload
  const p1 = allStats[config.p1] ?? null
  const p2 = allStats[config.p2] ?? null

  const { error } = await supabase.from('match_summaries').insert({
    p1_name:     config.p1,
    p2_name:     config.p2,
    winner,
    start_score: config.startScore,
    out_rule:    config.outRule,
    legs_to_win: config.legsToWin,
    sets_to_win: config.setsToWin,
    p1_sets:     sets[0],
    p2_sets:     sets[1],
    p1_legs_won: p1?.legs   ?? 0,
    p2_legs_won: p2?.legs   ?? 0,
    p1_avg:      p1 ? toAvg(p1)    : null,
    p2_avg:      p2 ? toAvg(p2)    : null,
    p1_first9:   p1 ? toFirst9(p1) : null,
    p2_first9:   p2 ? toFirst9(p2) : null,
    p1_co_pct:   p1 ? toCoPct(p1)  : null,
    p2_co_pct:   p2 ? toCoPct(p2)  : null,
    p1_180s:     p1?.ton80 ?? 0,
    p2_180s:     p2?.ton80 ?? 0,
    p1_140s:     p1?.ton40 ?? 0,
    p2_140s:     p2?.ton40 ?? 0,
    p1_100s:     p1?.tons  ?? 0,
    p2_100s:     p2?.tons  ?? 0,
  })

  if (error) {
    console.error('[save-match]', error.message)
    return NextResponse.json({ ok: false, reason: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
