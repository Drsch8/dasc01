'use client'
import { useGameStore } from '@/store/game-store'
import { getScoreTag } from '@/lib/checkouts'
import { computeAvg, computeFirst9Avg, computeCheckoutPct } from '@/lib/engine'

function PlayerBoard({ idx }: { idx: 0 | 1 }) {
  const config = useGameStore(s => s.config)
  const score = useGameStore(s => s.scores[idx])
  const legs = useGameStore(s => s.legs[idx])
  const sets = useGameStore(s => s.sets[idx])
  const current = useGameStore(s => s.current)
  const allStats = useGameStore(s => s.allStats)
  const setsToWin = useGameStore(s => s.config.setsToWin)

  const name = idx === 0 ? config.p1 : config.p2
  const isCurrent = current === idx
  const tag = getScoreTag(score)
  const stats = allStats[name]

  const avg = stats ? computeAvg(stats) : '—'
  const f9 = stats ? computeFirst9Avg(stats) : '—'
  const coPct = stats ? computeCheckoutPct(stats) : '—'
  const ton80 = stats?.ton80 ?? 0
  const ton40 = stats?.ton40 ?? 0
  const tons = stats?.tons ?? 0

  const legsText = setsToWin > 1 ? `sets ${sets}  legs ${legs}` : `legs ${legs}`

  const scoreColor =
    tag === 'finish' ? 'text-finish' :
    tag === 'bogey' ? 'text-bogey' :
    tag === 'caution' ? 'text-caution' :
    'text-ink'

  const tagColor =
    tag === 'finish' ? 'text-finish' :
    tag === 'bogey' ? 'text-bogey' :
    tag === 'caution' ? 'text-caution' :
    ''

  return (
    <div className={`relative p-3 md:p-4 transition-colors
      ${idx === 0 ? 'border-r border-rule' : ''}
      ${isCurrent ? 'bg-bg' : 'bg-paper'}`}
    >
      {/* Active indicator */}
      {isCurrent && (
        <span className="absolute top-3 right-3 text-2xs text-ink-light">▶</span>
      )}

      {/* Name */}
      <div className="text-2xs tracking-[0.1em] uppercase text-ink-light mb-1 truncate pr-4">
        {name}
      </div>

      {/* Big score */}
      <div className={`font-display font-black leading-none tracking-tight transition-colors
        text-[clamp(2.5rem,8vw,4rem)] ${scoreColor}`}>
        {score}
      </div>

      {/* Tag */}
      <div className={`text-2xs tracking-[0.1em] uppercase h-3.5 mt-0.5 ${tagColor}`}>
        {tag === 'finish' ? 'Finish' : tag === 'bogey' ? 'Bogey' : ''}
      </div>

      {/* Mobile mini-stats */}
      <div className="flex gap-4 mt-2 text-[11px] text-ink-light md:hidden">
        <span>avg {avg}</span>
        <span>{legsText}</span>
      </div>

      {/* Desktop expanded stats */}
      <div className="hidden md:grid grid-cols-3 gap-x-3 gap-y-0.5 mt-2 text-[11px] text-ink-light">
        <span>avg {avg}</span>
        <span>f9 {f9}</span>
        <span>co {coPct}</span>
        <span>180s {ton80}</span>
        <span>140+ {ton40}</span>
        <span>100+ {tons}</span>
        <span className="col-span-3">{legsText}</span>
      </div>
    </div>
  )
}

export function Scoreboard() {
  return (
    <div className="grid grid-cols-2 border-b-2 border-ink">
      <PlayerBoard idx={0} />
      <PlayerBoard idx={1} />
    </div>
  )
}
