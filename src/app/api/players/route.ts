import { NextResponse } from 'next/server'
import { getServerSupabaseClient } from '@/lib/supabase-server'

export interface PlayerStat {
  name: string
  matches: number
  wins: number
  legs_won: number
  avg_score: number | null
  first9_avg: number | null
  co_pct: number | null
  total_180s: number
  total_140s: number
}

export async function GET() {
  const supabase = getServerSupabaseClient()
  if (!supabase) {
    return NextResponse.json({ players: [] })
  }

  const { data, error } = await supabase
    .from('career_stats')
    .select('*')

  if (error) {
    return NextResponse.json({ players: [] }, { status: 500 })
  }

  return NextResponse.json({ players: data as PlayerStat[] })
}
