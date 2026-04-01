'use client'
import { useGameStore } from '@/store/game-store'
import { getScoreTag } from '@/lib/checkouts'
import { computeAvg, computeFirst9Avg, computeCheckoutPct } from '@/lib/engine'

function PlayerBoard({ idx, isStarter }: { idx: 0 | 1; isStarter: boolean }) {
  const score = useGameStore(s => s.scores[idx])
  const legs = useGameStore(s => s.legs[idx])
  const sets = useGameStore(s => s.sets[idx])
  const current = useGameStore(s => s.current)
  const allStats = useGameStore(s => s.allStats)
  const config = useGameStore(s => s.config)
  const setsToWin = useGameStore(s => s.config.setsToWin)

  const name = idx === 0 ? config.p1 : config.p2
  const isCurrent = current === idx
  const tag = getScoreTag(score)
  const stats = allStats[name]
  const training = useGameStore(s => s.config.training)
  const right = idx === 1
  const showLabels = idx === 0  // labels only for player 1

  const avg = stats ? computeAvg(stats) : '—'
  const f9 = stats ? computeFirst9Avg(stats) : '—'
  const coPct = stats ? computeCheckoutPct(stats) : '—'
  const ton80 = stats?.ton80 ?? 0
  const ton40 = stats?.ton40 ?? 0
  const tons = stats?.tons ?? 0

  // Same font size for both players → equal tile heights → no whitespace gap.
  // Active/passive distinction via color + box-shadow only.
  const scoreColor = isCurrent
    ? (tag === 'finish' ? 'text-finish' : tag === 'bogey' ? 'text-bogey' : tag === 'caution' ? 'text-caution' : 'text-ink')
    : 'text-ink-faint'

  const tagColor =
    tag === 'finish' ? 'text-finish' :
    tag === 'bogey' ? 'text-bogey' :
    tag === 'caution' ? 'text-caution' : ''

  return (
    <div
      className={`relative flex-1 flex flex-col px-3 pt-2 pb-4 md:p-6
        ${!training && idx === 0 ? 'border-r border-rule' : ''}
        ${training ? 'items-center' : ''}
        ${isCurrent ? 'bg-paper shadow-[inset_0_0_0_2px_#1a1a18] z-10' : 'bg-bg'}`}
      style={{ transition: 'background-color 200ms ease-in-out, box-shadow 200ms ease-in-out' }}
    >
      {/* Name */}
      <div
        className={`text-sm md:text-base font-mono uppercase tracking-wide mb-1 truncate
          ${!training && right ? 'text-right' : ''}
          ${isCurrent ? 'text-ink' : 'text-ink-light'}`}
        style={{ transition: 'color 200ms ease-in-out' }}
      >
        {right
          ? <>{isStarter && <span className="opacity-50 mr-1">*</span>}{name}</>
          : <>{name}{isStarter && <span className="opacity-50 ml-1">*</span>}</>}
      </div>

      {/* Score + stats side by side.
          Same font size → same row height → both panels exactly the same height. */}
      <div className={`flex items-end gap-2 ${training ? 'justify-center' : 'justify-between'} ${!training && right ? 'flex-row-reverse' : ''}`}>
        <div
          className={`font-display font-black leading-none tracking-tight shrink-0
            text-[clamp(2.5rem,11vw,5rem)] ${scoreColor}`}
          style={{ transition: 'color 200ms ease-in-out' }}
        >
          {score}
        </div>

        {/* Mobile stats */}
        <div className={`md:hidden font-mono text-[12px] leading-tight shrink-0
          ${training ? 'text-left' : right ? 'text-left' : 'text-right'}
          ${isCurrent ? 'text-ink-light' : 'text-ink-faint'}`}
        >
          {showLabels
            ? <>
                <div>avg {avg}</div>
                {setsToWin > 1 && <div>sets {sets}</div>}
                <div>legs {legs}</div>
              </>
            : <>
                <div>{avg}</div>
                {setsToWin > 1 && <div>{sets}</div>}
                <div>{legs}</div>
              </>}
        </div>
      </div>

      {/* Tag — desktop only; score color already signals finish/bogey on mobile */}
      <div
        className={`hidden md:block text-xs tracking-[0.1em] uppercase h-4 mt-1
          ${right ? 'text-right' : ''}
          ${isCurrent ? tagColor : 'opacity-0'}`}
        style={{ transition: 'opacity 200ms ease-in-out, color 200ms ease-in-out' }}
      >
        {tag === 'finish' ? 'Finish' : tag === 'bogey' ? 'Bogey' : ''}
      </div>

      {/* Desktop stats */}
      <div
        className={`hidden md:block mt-auto pt-2 ${isCurrent ? 'opacity-100' : 'opacity-50'}`}
        style={{ transition: 'opacity 200ms ease-in-out' }}
      >
        <div className={`grid grid-cols-3 gap-x-4 gap-y-1 text-sm text-ink-light font-mono whitespace-nowrap
          ${right ? 'text-right' : ''}`}>
          <span>avg {avg}</span>
          <span>f9 {f9}</span>
          <span>co {coPct}</span>
          <span>180 {ton80}</span>
          <span>140+ {ton40}</span>
          <span>100+ {tons}</span>
          <span className="col-span-3">{setsToWin > 1 ? `sets ${sets}  legs ${legs}` : `legs ${legs}`}</span>
        </div>
      </div>
    </div>
  )
}

export function Scoreboard() {
  const training = useGameStore(s => s.config.training)
  const rounds = useGameStore(s => s.rounds)
  const currentRound = useGameStore(s => s.currentRound)

  const legStarter: 0 | 1 =
    rounds.length > 0
      ? (rounds[0].p0 === null ? 1 : 0)
      : (currentRound.p1 !== null && currentRound.p0 === null ? 1 : 0)

  return (
    <div className="shrink-0 border-b border-rule">
      <div className="flex items-start md:items-stretch">
        <PlayerBoard idx={0} isStarter={!training && legStarter === 0} />
        {!training && <PlayerBoard idx={1} isStarter={legStarter === 1} />}
      </div>
    </div>
  )
}
