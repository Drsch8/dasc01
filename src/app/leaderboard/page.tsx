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
    supabase.from('career_stats').select('*'),
    supabase
      .from('match_summaries')
      .select('id, played_at, p1_name, p2_name, winner, start_score, p1_sets, p2_sets, p1_legs_won, p2_legs_won, p1_avg, p2_avg')
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
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export default async function LeaderboardPage() {
  const { career, recent } = await getData()

  const th = 'text-left text-2xs tracking-[0.12em] uppercase text-ink-light font-normal py-2 pr-4 border-b-2 border-rule'
  const td = 'py-2 pr-4 text-sm border-b border-rule'
  const tdMono = `${td} font-mono`

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-rule bg-paper sticky top-0 z-10">
        <h1 className="font-display font-black text-2xl tracking-tight">Leaderboard</h1>
        <Link
          href="/"
          className="border border-rule px-4 py-2 text-sm text-ink-light font-mono active:border-ink active:text-ink transition-colors"
        >
          ← Back
        </Link>
      </div>

      <div className="px-4 md:px-8 py-6 max-w-5xl mx-auto flex flex-col gap-10">

        {/* Career stats table */}
        <section>
          <h2 className="text-2xs tracking-[0.12em] uppercase text-ink-light mb-4">Career Stats</h2>

          {career.length === 0 ? (
            <p className="text-sm text-ink-light">No matches recorded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full font-mono text-ink whitespace-nowrap">
                <thead>
                  <tr>
                    <th className={th}>Player</th>
                    <th className={`${th} text-right`}>M</th>
                    <th className={`${th} text-right`}>W</th>
                    <th className={`${th} text-right`}>Legs</th>
                    <th className={`${th} text-right`}>Avg</th>
                    <th className={`${th} text-right`}>First 9</th>
                    <th className={`${th} text-right`}>CO%</th>
                    <th className={`${th} text-right`}>180s</th>
                    <th className={`${th} text-right`}>140+</th>
                    <th className={`${th} text-right`}>100+</th>
                  </tr>
                </thead>
                <tbody>
                  {career.map((row, i) => (
                    <tr key={row.name} className={i % 2 === 0 ? 'bg-paper' : ''}>
                      <td className={`${td} font-display font-bold text-base`}>{row.name}</td>
                      <td className={`${tdMono} text-right`}>{row.matches}</td>
                      <td className={`${tdMono} text-right`}>{row.wins}</td>
                      <td className={`${tdMono} text-right`}>{row.legs_won}</td>
                      <td className={`${tdMono} text-right font-medium ${row.avg_score && row.avg_score >= 80 ? 'text-finish' : ''}`}>
                        {fmt(row.avg_score)}
                      </td>
                      <td className={`${tdMono} text-right`}>{fmt(row.first9_avg)}</td>
                      <td className={`${tdMono} text-right`}>{fmt(row.co_pct)}%</td>
                      <td className={`${tdMono} text-right`}>{row.total_180s}</td>
                      <td className={`${tdMono} text-right`}>{row.total_140s}</td>
                      <td className={`${tdMono} text-right`}>{row.total_100s}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Recent matches */}
        {recent.length > 0 && (
          <section>
            <h2 className="text-2xs tracking-[0.12em] uppercase text-ink-light mb-4">Recent Matches</h2>
            <div className="flex flex-col gap-2">
              {recent.map(m => {
                const setsToWin = Math.max(m.p1_sets, m.p2_sets)
                const showSets = setsToWin > 1
                const score = showSets
                  ? `${m.p1_sets}–${m.p2_sets} sets`
                  : `${m.p1_legs_won}–${m.p2_legs_won} legs`
                return (
                  <div key={m.id} className="bg-paper border border-rule px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                    <div className="flex items-center gap-3">
                      <span className={`font-display font-bold text-lg ${m.winner === m.p1_name ? 'text-ink' : 'text-ink-light'}`}>
                        {m.p1_name}
                      </span>
                      <span className="text-ink-light text-sm font-mono">{score}</span>
                      <span className={`font-display font-bold text-lg ${m.winner === m.p2_name ? 'text-ink' : 'text-ink-light'}`}>
                        {m.p2_name}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-ink-light font-mono">
                      <span>{fmt(m.p1_avg)} / {fmt(m.p2_avg)} avg</span>
                      <span>{m.start_score}</span>
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
