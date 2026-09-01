'use client'
import { useState, useEffect } from 'react'
import type { PlayerStat } from '@/app/api/players/route'

export function SetupStats() {
  const [players, setPlayers] = useState<PlayerStat[] | null>(null)

  useEffect(() => {
    fetch('/api/players')
      .then(r => r.json())
      .then(d => setPlayers(d.players))
      .catch(() => setPlayers([]))
  }, [])

  const sectionLabel = 'block font-cond text-[11px] font-semibold tracking-label uppercase text-ink-faint mb-2.5'

  if (players === null) return (
    <div className="animate-pulse">
      <span className={sectionLabel}>Career Stats</span>
      <div className="flex flex-col gap-0.5">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-paper h-11" />
        ))}
      </div>
    </div>
  )

  if (players.length === 0) return null

  const th = 'font-cond text-[11px] font-semibold tracking-label uppercase text-ink-faint font-normal pb-2'

  return (
    <div>
      <span className={sectionLabel}>Career Stats</span>
      <table className="w-full">
        <thead>
          <tr className="border-b border-rule-strong">
            <th className={`${th} text-left pl-3`}>Player</th>
            <th className={`${th} text-right`}>M</th>
            <th className={`${th} text-right`}>W</th>
            <th className={`${th} text-right`}>Avg</th>
            <th className={`${th} text-right`}>Co%</th>
            <th className={`${th} text-right`}>180</th>
            <th className={`${th} text-right`}>140</th>
            <th className={`${th} text-right pr-3`}>100</th>
          </tr>
        </thead>
        <tbody>
          {players.map(p => (
            <tr key={p.name} className="bg-paper border-b-2 border-bg">
              <td className="py-2 pl-3 font-cond text-base font-semibold tracking-[0.06em] uppercase text-ink truncate max-w-[8rem]">{p.name}</td>
              <td className="py-2 text-right font-cond text-sm tracking-[0.08em] text-ink-light">{p.matches}</td>
              <td className="py-2 text-right font-cond text-sm tracking-[0.08em] text-ink-light">{p.wins}</td>
              <td className="py-2 text-right font-num text-lg leading-none text-ink">{p.avg_score ?? '—'}</td>
              <td className="py-2 text-right font-cond text-sm tracking-[0.08em] text-ink-light">{p.co_pct != null ? `${p.co_pct}%` : '—'}</td>
              <td className="py-2 text-right font-cond text-sm tracking-[0.08em] text-ink-light">{p.total_180s}</td>
              <td className="py-2 text-right font-cond text-sm tracking-[0.08em] text-ink-light">{p.total_140s}</td>
              <td className="py-2 pr-3 text-right font-cond text-sm tracking-[0.08em] text-ink-light">{p.total_100s}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
