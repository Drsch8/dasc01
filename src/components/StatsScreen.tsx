'use client'
import { useState } from 'react'
import { useGameStore } from '@/store/game-store'
import { computeAvg, computeFirst9Avg, computeCheckoutPct } from '@/lib/engine'
import type { PlayerStats } from '@/types/game'

/** One stat, both players, label centred between them — the broadcast comparison row.
 *  The better of the two values goes green; a tie leaves both plain. */
function CompareRow({ label, left, right }: {
  label: string
  left: string | number
  right?: string | number
}) {
  const nl = typeof left === 'number' ? left : parseFloat(String(left))
  const nr = typeof right === 'number' ? right : parseFloat(String(right ?? ''))
  const comparable = Number.isFinite(nl) && Number.isFinite(nr) && nl !== nr
  const leadLeft = comparable && nl > nr
  const leadRight = comparable && nr > nl

  return (
    <div className="grid grid-cols-[1fr_7rem_1fr] items-center py-3 border-t border-rule">
      <div className={`font-num text-2xl leading-none ${leadLeft ? 'text-finish' : 'text-ink'}`}>{left}</div>
      <div className="text-center font-cond text-[11px] font-semibold tracking-label uppercase text-ink-faint">{label}</div>
      <div className={`text-right font-num text-2xl leading-none ${leadRight ? 'text-finish' : 'text-ink-light'}`}>{right ?? ''}</div>
    </div>
  )
}

export function StatsScreen() {
  const config = useGameStore(s => s.config)
  const allStats = useGameStore(s => s.allStats)
  const history = useGameStore(s => s.history)
  const legs = useGameStore(s => s.legs)
  const sets = useGameStore(s => s.sets)
  const setScreen = useGameStore(s => s.setScreen)
  const startGame = useGameStore(s => s.startGame)
  const matchFinished = useGameStore(s => s.matchFinished)
  const [confirmNew, setConfirmNew] = useState(false)

  const hdrBtn = 'border border-rule-strong px-3 py-1.5 font-cond text-[13px] font-semibold tracking-caps uppercase text-ink-light active:border-ink active:text-ink transition-colors cursor-pointer bg-transparent'

  const s1: PlayerStats | undefined = allStats[config.p1]
  const s2: PlayerStats | undefined = config.training ? undefined : allStats[config.p2]

  const val = (st: PlayerStats | undefined, pick: (s: PlayerStats) => string | number) =>
    st ? pick(st) : '—'

  const showSets = config.setsToWin > 1
  const tally: [number, number] = showSets ? sets : legs

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-rule bg-bg sticky top-0 z-10">
        <span className="font-cond text-xs font-semibold tracking-label uppercase text-ink-light">Match Stats</span>
        {!matchFinished && (
          <button onClick={() => setScreen('game')} className={hdrBtn}>Back</button>
        )}
      </div>

      <div className="flex-1 w-full max-w-2xl mx-auto px-4 pb-6">

        {/* ── Head-to-head ── */}
        <div className="flex items-end justify-between gap-3 py-5">
          <div className="min-w-0">
            <div className="font-cond text-xl font-semibold tracking-[0.08em] uppercase truncate">{config.p1}</div>
            <div className="font-num text-[56px] leading-[0.9]">{tally[0]}</div>
          </div>
          <div className="font-cond text-xs tracking-label uppercase text-ink-faint pb-4 shrink-0">
            {showSets ? 'Sets' : 'Legs'}
          </div>
          {!config.training && (
            <div className="text-right min-w-0">
              <div className="font-cond text-xl font-medium tracking-[0.08em] uppercase text-ink-light truncate">{config.p2}</div>
              <div className="font-num text-[56px] leading-[0.9] text-ink-light">{tally[1]}</div>
            </div>
          )}
        </div>

        {/* ── Stat comparison ── */}
        <div className="border-b border-rule">
          <CompareRow label="3-dart avg" left={val(s1, computeAvg)} right={s2 && computeAvg(s2)} />
          <CompareRow label="First 9"    left={val(s1, computeFirst9Avg)} right={s2 && computeFirst9Avg(s2)} />
          <CompareRow label="Checkout"   left={val(s1, computeCheckoutPct)} right={s2 && computeCheckoutPct(s2)} />
          <CompareRow label="180s"       left={val(s1, s => s.ton80)} right={s2?.ton80} />
          <CompareRow label="140+"       left={val(s1, s => s.ton40)} right={s2?.ton40} />
          <CompareRow label="100+"       left={val(s1, s => s.tons)}  right={s2?.tons} />
          <CompareRow label="Darts"      left={val(s1, s => s.darts)} right={s2?.darts} />
        </div>

        {/* ── Leg by leg ── */}
        {history.length > 0 && (
          <div className="mt-6">
            <div className="font-cond text-[11px] font-semibold tracking-label uppercase text-ink-faint mb-2.5">Leg by leg</div>
            <div className="flex flex-col gap-0.5">
              {history.map((h, i) => (
                <div key={i} className="bg-paper px-3 py-2.5 flex justify-between items-center gap-3">
                  <span className="font-cond text-base tracking-[0.06em] uppercase truncate">
                    Leg {i + 1} <span className="text-ink-faint mx-1">·</span> {h.winner}
                  </span>
                  <span className="font-cond text-sm tracking-[0.1em] uppercase text-ink-light shrink-0">
                    {h.checkoutScore} <span className="text-ink-faint">·</span> {config.p1} {h.p1avg} / {config.p2} {h.p2avg}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Footer actions ── */}
      <div className="sticky bottom-0 bg-bg p-3 grid grid-cols-2 gap-2 max-w-2xl w-full mx-auto">
        <button
          onClick={() => startGame(config)}
          className="border border-rule-strong py-4 font-cond text-[17px] font-semibold tracking-caps uppercase text-ink-light active:border-ink active:text-ink transition-colors cursor-pointer bg-transparent"
        >
          Rematch
        </button>
        <button
          onClick={() => setConfirmNew(true)}
          className="bg-ink text-bg py-4 font-cond text-[17px] font-bold tracking-caps uppercase active:opacity-80 transition-opacity cursor-pointer border-none"
        >
          New game
        </button>
      </div>

      {confirmNew && (
        <div className="fixed inset-0 bg-bg/70 backdrop-blur-sm z-50 flex items-center justify-center" onClick={() => setConfirmNew(false)}>
          <div className="bg-paper border-l-[5px] border-l-accent border-y border-r border-rule-strong p-8 text-center max-w-xs w-[90%] flex flex-col gap-6 relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setConfirmNew(false)} className="absolute top-3 right-3 text-ink-faint active:text-ink font-cond text-lg leading-none" aria-label="Cancel">✕</button>
            <p className="font-num text-3xl tracking-[0.02em] uppercase">New game?</p>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setConfirmNew(false)} className="py-5 border border-rule-strong text-ink-light active:border-ink active:text-ink active:scale-[0.97] font-cond text-lg font-semibold tracking-caps uppercase transition-all duration-100 cursor-pointer">No</button>
              <button onClick={() => { setConfirmNew(false); setScreen('setup') }} className="py-5 bg-accent text-ink border-none active:opacity-80 active:scale-[0.97] font-cond text-lg font-bold tracking-caps uppercase transition-all duration-100 cursor-pointer">Yes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
