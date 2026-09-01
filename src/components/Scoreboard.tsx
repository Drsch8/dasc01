'use client'
import { useEffect, useRef } from 'react'
import { useGameStore } from '@/store/game-store'
import { getScoreTag, getCheckoutSuggestions, isFinishable } from '@/lib/checkouts'
import { computeAvg, validateInput } from '@/lib/engine'
import type { RoundEntry } from '@/types/game'

/** Green checkout band under the thrower's score — always occupies its row so
 *  the board never shifts when a finish becomes available. */
function FinishBand({ score, right }: { score: number; right: boolean }) {
  const route = isFinishable(score) ? getCheckoutSuggestions(score, 1)[0] : null

  return (
    <div
      className={`mt-2 h-[34px] px-3 flex items-center gap-3.5 overflow-hidden
        ${right ? 'flex-row-reverse' : ''}
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

/**
 * This player's leg, read as one line under their own score: each round's
 * points with the remainder beneath, oldest to newest, newest kept in view.
 * The thrower's in-progress entry is the last tile.
 */
function RoundStrip({ idx, isCurrent, right }: { idx: 0 | 1; isCurrent: boolean; right: boolean }) {
  const rounds = useGameStore(s => s.rounds)
  const currentRound = useGameStore(s => s.currentRound)
  const inputStr = useGameStore(s => s.inputStr)
  const inputMode = useGameStore(s => s.inputMode)
  const score = useGameStore(s => s.scores[idx])
  const outRule = useGameStore(s => s.config.outRule)
  const scrollRef = useRef<HTMLDivElement>(null)

  const key = idx === 0 ? 'p0' : 'p1'

  // Taking this player's own entries sidesteps the paired-round bookkeeping
  // entirely: a leg that player 2 started simply has no p0 entry to skip.
  const entries: RoundEntry[] = [...rounds.map(r => r[key]), currentRound[key]]
    .filter((e): e is RoundEntry => e != null)

  const validation = validateInput(inputStr, inputMode, score, outRule)
  const isInvalid = inputStr !== '' && !validation.valid
  const showLive = isCurrent && currentRound[key] == null

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollLeft = el.scrollWidth
  }, [entries.length, inputStr, isCurrent])

  const tile = 'shrink-0 min-w-[3rem] px-2 py-1 bg-panel'

  return (
    <div
      ref={scrollRef}
      className="h-[46px] overflow-x-auto overflow-y-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {/* w-max grows past the container; min-w-full lets justify-end park a
          short line against this player's edge without clipping a long one. */}
      <div className={`flex gap-1 w-max min-w-full ${right ? 'justify-end text-right' : ''}`}>
        {entries.map((e, i) => (
          <div key={i} className={tile}>
            <div className={`font-num text-xl leading-none ${e.bust ? 'text-bust' : 'text-ink'}`}>{e.score}</div>
            <div className="font-cond text-[11px] leading-tight tracking-[0.08em] text-ink-faint">{e.remain}</div>
          </div>
        ))}

        {showLive && (
          <div className={`${tile} bg-transparent`}>
            <div
              className={`font-num text-xl leading-none border-b-2 min-w-[2rem] inline-block
                ${isInvalid ? 'text-bust border-bust' : 'text-ink border-accent'}`}
            >
              {inputStr || ' '}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/** The thrower: owns the screen, red bar down their own edge. */
function ActiveRow({ idx, isStarter, right }: { idx: 0 | 1; isStarter: boolean; right: boolean }) {
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
      className="bg-paper flex-1 min-h-0 flex flex-col justify-between px-4 py-3"
      style={{
        [right ? 'borderRight' : 'borderLeft']: '5px solid var(--accent)',
        transition: 'background-color 200ms ease-in-out',
      }}
    >
      <div className={`flex items-baseline justify-between gap-3 ${right ? 'flex-row-reverse' : ''}`}>
        <div className="font-cond font-semibold text-[22px] leading-none tracking-[0.08em] uppercase truncate min-w-0">
          {name}{isStarter && <span className="text-ink-faint ml-1.5">*</span>}
        </div>
        <div className="font-cond text-xs font-semibold tracking-[0.16em] text-ink-light shrink-0">
          {setsToWin > 1 && <>SETS {sets} &middot; </>}LEGS {legs} &middot; THROW
        </div>
      </div>

      {/* Three children under justify-between: the name sits at the top, the
          score group takes the middle, the leg line rests on the foot — so any
          slack the flex row absorbs is split above and below the numeral
          instead of pooling in one gap. */}
      <div>
        <div className={`flex items-end justify-between gap-3 ${right ? 'flex-row-reverse' : ''}`}>
          <div
            className={`font-num text-[clamp(3.5rem,24vw,104px)] leading-[0.82] tracking-[-0.02em] ${scoreColor}`}
            style={{ transition: 'color 200ms ease-in-out' }}
          >
            {score}
          </div>
          <div className={`font-cond text-[13px] tracking-[0.1em] text-ink-light pb-1.5 shrink-0 ${right ? 'text-left' : 'text-right'}`}>
            <div>AVG {avg}</div>
            <div>DARTS {darts}</div>
          </div>
        </div>

        <FinishBand score={score} right={right} />
      </div>

      <RoundStrip idx={idx} isCurrent right={right} />
    </div>
  )
}

/** The player waiting: one muted line, still on their own side. */
function IdleRow({ idx, isStarter, right }: { idx: 0 | 1; isStarter: boolean; right: boolean }) {
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
    <div className={`shrink-0 px-4 py-2.5 border-y border-rule ${right ? 'pr-[21px]' : 'pl-[21px]'}`}>
      <div className={`flex items-center justify-between gap-3 ${right ? 'flex-row-reverse' : ''}`}>
        <div className={`flex items-baseline gap-3 min-w-0 ${right ? 'flex-row-reverse' : ''}`}>
          <span className="font-cond font-medium text-xl leading-none tracking-[0.08em] uppercase text-ink-light truncate">
            {name}{isStarter && <span className="text-ink-faint ml-1.5">*</span>}
          </span>
          <span className="font-num text-[40px] leading-none text-ink-light shrink-0">{score}</span>
        </div>
        <div className="font-cond text-xs tracking-[0.14em] text-ink-faint shrink-0">
          {setsToWin > 1 && <>S {sets} &middot; </>}L {legs} &middot; AVG {avg}
        </div>
      </div>

      <div className="mt-2">
        <RoundStrip idx={idx} isCurrent={false} right={right} />
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
      <div className="flex-1 min-h-0 flex flex-col">
        <ActiveRow idx={0} isStarter={false} right={false} />
      </div>
    )
  }

  // Two rows, player order fixed: player 1 reads down the left edge, player 2
  // down the right. Only the emphasis moves with the throw.
  return (
    <div className="flex-1 min-h-0 flex flex-col">
      {([0, 1] as const).map(idx =>
        current === idx
          ? <ActiveRow key={idx} idx={idx} isStarter={legStarter === idx} right={idx === 1} />
          : <IdleRow key={idx} idx={idx} isStarter={legStarter === idx} right={idx === 1} />
      )}
    </div>
  )
}
