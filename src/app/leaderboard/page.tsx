import Link from 'next/link'
import { getServerSupabaseClient } from '@/lib/supabase-server'

interface CareerRow {
  name: string
  matches: number
  wins: number
  legs_won: number
  avg_score: number | null
  first9_avg: number | null
  co_pct: number | null
  total_180s: number
  total_140s: number
  total_100s: number
}

interface RecentMatch {
  id: string
  played_at: string
  p1_name: string
  p2_name: string
  winner: string
  start_score: number
  p1_sets: number
  p2_sets: number
  p1_legs_won: number
  p2_legs_won: number
  p1_avg: number | null
  p2_avg: number | null
}

async function getData() {
  const supabase = getServerSupabaseClient()
  if (!supabase) return { career: [], recent: [] }

  const [careerRes, recentRes] = await Promise.all([
    supabase
      .from('career_stats')
      .select('*')
      .neq('name', 'Player 1')
      .neq('name', 'Player 2'),
    supabase
      .from('match_summaries')
      .select('id, played_at, p1_name, p2_name, winner, start_score, p1_sets, p2_sets, p1_legs_won, p2_legs_won, p1_avg, p2_avg')
      .neq('p1_name', 'Player 1')
      .neq('p1_name', 'Player 2')
      .neq('p2_name', 'Player 1')
      .neq('p2_name', 'Player 2')
      .order('played_at', { ascending: false })
      .limit(20),
  ])

  return {
    career: (careerRes.data ?? []) as CareerRow[],
    recent: (recentRes.data ?? []) as RecentMatch[],
  }
}

function fmt(n: number | null, decimals = 1): string {
  return n != null ? n.toFixed(decimals) : '—'
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 60) return `${m}M`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}H`
  return `${Math.floor(h / 24)}D`
}

export default async function LeaderboardPage() {
  const { career, recent } = await getData()

  // Ranked by average — the leader gets the green bar.
  const ranked = [...career].sort((a, b) => (b.avg_score ?? -1) - (a.avg_score ?? -1))

  const sectionLabel = 'block font-cond text-[11px] font-semibold tracking-label uppercase text-ink-faint mb-2.5'

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-rule bg-bg sticky top-0 z-10">
        <h1 className="font-cond text-xs font-semibold tracking-label uppercase text-ink-light">Leaderboard</h1>
        <Link
          href="/"
          className="border border-rule-strong px-3 py-1.5 font-cond text-[13px] font-semibold tracking-caps uppercase text-ink-light active:border-ink active:text-ink transition-colors"
        >
          Back
        </Link>
      </div>

      <div className="px-4 md:px-8 py-6 max-w-3xl mx-auto flex flex-col gap-7">

        {/* Ranked by average */}
        <section>
          <span className={sectionLabel}>Ranked by average</span>

          {ranked.length === 0 ? (
            <p className="text-sm text-ink-light">No matches recorded yet.</p>
          ) : (
            <div className="flex flex-col gap-0.5">
              {ranked.map((row, i) => (
                <div
                  key={row.name}
                  className="bg-paper px-3.5 py-3 flex items-center gap-3"
                  style={{ borderLeft: `4px solid ${i === 0 ? 'var(--finish)' : 'var(--rule-strong)'}` }}
                >
                  <div className="font-num text-xl leading-none text-ink-faint w-6 shrink-0">{i + 1}</div>
                  <div className="flex-1 min-w-0">
                    <div className={`font-cond text-xl font-semibold tracking-[0.06em] uppercase truncate ${i === 0 ? 'text-ink' : 'text-ink'}`}>
                      {row.name}
                    </div>
                    <div className="font-cond text-xs tracking-caps uppercase text-ink-light truncate">
                      {row.matches} M · {row.wins} W · {row.legs_won} Legs · CO {fmt(row.co_pct)}% · F9 {fmt(row.first9_avg)}
                      <span className="hidden sm:inline"> · {row.total_180s}×180 · {row.total_140s}×140 · {row.total_100s}×100</span>
                    </div>
                  </div>
                  <div className={`font-num text-[32px] leading-none shrink-0 ${i === 0 ? 'text-finish' : 'text-ink'}`}>
                    {fmt(row.avg_score)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Recent matches */}
        {recent.length > 0 && (
          <section>
            <span className={sectionLabel}>Recent matches</span>
            <div className="flex flex-col gap-0.5">
              {recent.map(m => {
                const showSets = Math.max(m.p1_sets, m.p2_sets) > 1
                const [a, b] = showSets
                  ? [m.p1_sets, m.p2_sets]
                  : [m.p1_legs_won, m.p2_legs_won]
                const p1Won = m.winner === m.p1_name
                return (
                  <div key={m.id} className="bg-panel px-3.5 py-3 flex items-center justify-between gap-3">
                    <div className="flex items-baseline gap-2.5 min-w-0">
                      <span className={`font-cond text-lg tracking-[0.06em] uppercase truncate ${p1Won ? 'font-semibold text-ink' : 'font-medium text-ink-light'}`}>
                        {m.p1_name}
                      </span>
                      <span className={`font-num text-xl leading-none shrink-0 ${p1Won ? 'text-ink' : 'text-ink-light'}`}>{a}</span>
                      <span className="font-cond text-sm text-ink-faint shrink-0">–</span>
                      <span className={`font-num text-xl leading-none shrink-0 ${p1Won ? 'text-ink-light' : 'text-ink'}`}>{b}</span>
                      <span className={`font-cond text-lg tracking-[0.06em] uppercase truncate ${p1Won ? 'font-medium text-ink-light' : 'font-semibold text-ink'}`}>
                        {m.p2_name}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 font-cond text-xs tracking-caps uppercase text-ink-faint shrink-0">
                      <span className="hidden sm:inline">{fmt(m.p1_avg)} / {fmt(m.p2_avg)}</span>
                      <span className="hidden sm:inline">{m.start_score}</span>
                      <span>{timeAgo(m.played_at)}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
