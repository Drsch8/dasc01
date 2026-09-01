'use client'
import { useGameStore } from '@/store/game-store'
import { getScoreTag, getCheckoutSuggestions, isFinishable } from '@/lib/checkouts'
import { computeAvg } from '@/lib/engine'

/** Green checkout band under the thrower's score — always occupies its row so
 *  the board never shifts when a finish becomes available. */
function FinishBand({ score }: { score: number }) {
  const route = isFinishable(score) ? getCheckoutSuggestions(score, 1)[0] : null

  return (
    <div
      className={`mt-2 h-[34px] px-3 flex items-center gap-3.5 overflow-hidden
        ${route ? 'bg-finish-bg text-finish' : 'bg-transparent'}`}
    >
      {route && (
        <>
          <span className="font-cond text-xs font-semibold tracking-label shrink-0">FINISH</span>
          <span className="font-cond text-xl font-semibold tracking-[0.06em] truncate">{route}</span>
        </>
      )}
    </div>
  )
}

/** The thrower: top third of the screen, red bar, 104px numeral. */
function ActiveRow({ idx, isStarter }: { idx: 0 | 1; isStarter: boolean }) {
  const score = useGameStore(s => s.scores[idx])
  const legs = useGameStore(s => s.legs[idx])
  const sets = useGameStore(s => s.sets[idx])
  const darts = useGameStore(s => s.dartsThrown[idx])
  const config = useGameStore(s => s.config)
  const allStats = useGameStore(s => s.allStats)
  const setsToWin = config.setsToWin

  const name = idx === 0 ? config.p1 : config.p2
  const stats = allStats[name]
  const avg = stats ? computeAvg(stats) : '—'
  const tag = getScoreTag(score)

  // A finish is announced by the green band below, so the numeral itself stays
  // white and readable; only a bogey number needs its own warning colour.
  const scoreColor = tag === 'bogey' ? 'text-bogey' : 'text-ink'

  return (
    <div
      className="bg-paper px-4 pt-4 pb-3.5"
      style={{ borderLeft: '5px solid var(--accent)', transition: 'background-color 200ms ease-in-out' }}
    >
      <div className="flex items-baseline justify-between gap-3">
        <div className="font-cond font-semibold text-[22px] leading-none tracking-[0.08em] uppercase truncate">
          {name}{isStarter && <span className="text-ink-faint ml-1.5">*</span>}
        </div>
        <div className="font-cond text-xs font-semibold tracking-[0.16em] text-ink-light shrink-0">
          {setsToWin > 1 && <>SETS {sets} &middot; </>}LEGS {legs} &middot; THROW
        </div>
      </div>

      <div className="flex items-end justify-between gap-3 mt-0.5">
        <div
          className={`font-num text-[clamp(3.5rem,24vw,104px)] leading-[0.82] tracking-[-0.02em] ${scoreColor}`}
          style={{ transition: 'color 200ms ease-in-out' }}
        >
          {score}
        </div>
        <div className="font-cond text-[13px] tracking-[0.1em] text-ink-light text-right pb-1.5 shrink-0">
          <div>AVG {avg}</div>
          <div>DARTS {darts}</div>
        </div>
      </div>

      <FinishBand score={score} />
    </div>
  )
}

/** The player waiting: one muted line. */
function IdleRow({ idx, isStarter, last }: { idx: 0 | 1; isStarter: boolean; last: boolean }) {
  const score = useGameStore(s => s.scores[idx])
  const legs = useGameStore(s => s.legs[idx])
  const sets = useGameStore(s => s.sets[idx])
  const config = useGameStore(s => s.config)
  const allStats = useGameStore(s => s.allStats)
  const setsToWin = config.setsToWin

  const name = idx === 0 ? config.p1 : config.p2
  const stats = allStats[name]
  const avg = stats ? computeAvg(stats) : '—'

  return (
    <div className={`flex items-center justify-between gap-3 pl-[21px] pr-4 py-3 ${last ? '' : 'border-b border-rule'}`}>
      <div className="font-cond font-medium text-xl leading-none tracking-[0.08em] uppercase text-ink-light truncate">
        {name}{isStarter && <span className="text-ink-faint ml-1.5">*</span>}
      </div>
      <div className="flex items-baseline gap-3.5 shrink-0">
        <div className="font-cond text-xs tracking-[0.14em] text-ink-faint">
          {setsToWin > 1 && <>S {sets} &middot; </>}L {legs} &middot; AVG {avg}
        </div>
        <div className="font-num text-[40px] leading-none text-ink-light">{score}</div>
      </div>
    </div>
  )
}

export function Scoreboard() {
  const training = useGameStore(s => s.config.training)
  const current = useGameStore(s => s.current)
  const rounds = useGameStore(s => s.rounds)
  const currentRound = useGameStore(s => s.currentRound)

  const legStarter: 0 | 1 =
    rounds.length > 0
      ? (rounds[0].p0 === null ? 1 : 0)
      : (currentRound.p1 !== null && currentRound.p0 === null ? 1 : 0)

  if (training) {
    return (
      <div className="shrink-0 border-b border-rule">
        <ActiveRow idx={0} isStarter={false} />
      </div>
    )
  }

  // Two rows, player order fixed: name 1 / score 1, then name 2 / score 2.
  // Only the emphasis moves with the throw, so the board never reorders.
  return (
    <div className="shrink-0 border-b border-rule">
      {([0, 1] as const).map(idx =>
        current === idx
          ? <ActiveRow key={idx} idx={idx} isStarter={legStarter === idx} />
          : <IdleRow key={idx} idx={idx} isStarter={legStarter === idx} last={idx === 1} />
      )}
    </div>
  )
}
