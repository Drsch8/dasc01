'use client'
import { useState } from 'react'
import { useGameStore } from '@/store/game-store'
import { computeAvg, computeFirst9Avg, computeCheckoutPct } from '@/lib/engine'

export function StatsScreen() {
  const config = useGameStore(s => s.config)
  const allStats = useGameStore(s => s.allStats)
  const history = useGameStore(s => s.history)
  const setScreen = useGameStore(s => s.setScreen)
  const startGame = useGameStore(s => s.startGame)
  const matchFinished = useGameStore(s => s.matchFinished)
  const [confirmNew, setConfirmNew] = useState(false)

  const statLabel = 'text-2xs tracking-[0.1em] uppercase text-ink-light'
  const statValue = 'font-display font-bold text-2xl leading-tight'

  return (
    <div className="min-h-screen bg-bg">
      <div className="flex items-center justify-between px-5 py-3 border-b border-rule bg-paper sticky top-0">
        <span className="font-display font-bold text-2xl tracking-tight">Statistics</span>
        <div className="flex gap-2">
          {!matchFinished && (
            <button
              onClick={() => setScreen('game')}
              className="border border-rule px-4 py-2 text-sm text-ink-light font-mono active:border-ink active:text-ink transition-colors"
            >
              ← Back
            </button>
          )}
          {matchFinished && (
            <button
              onClick={() => startGame(config)}
              className="border border-rule px-4 py-2 text-sm text-ink-light font-mono active:border-ink active:text-ink transition-colors"
            >
              Rematch
            </button>
          )}
          <button
            onClick={() => setConfirmNew(true)}
            className="border border-rule px-4 py-2 text-sm text-ink-light font-mono active:border-ink active:text-ink transition-colors"
          >
            New game
          </button>
        </div>
      </div>

      <div className="p-4 flex flex-col gap-4 max-w-2xl mx-auto">
        {(config.training ? [config.p1] : [config.p1, config.p2]).map(name => {
          const st = allStats[name]
          if (!st) return null
          return (
            <div key={name} className="bg-paper border border-rule p-4">
              <h2 className="font-display font-bold text-xl border-b border-rule pb-2 mb-4">{name}</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div><div className={statLabel}>3-dart avg</div><div className={statValue}>{computeAvg(st)}</div></div>
                <div><div className={statLabel}>First 9 avg</div><div className={statValue}>{computeFirst9Avg(st)}</div></div>
                <div><div className={statLabel}>Checkout %</div><div className={statValue}>{computeCheckoutPct(st)}</div></div>
                <div><div className={statLabel}>Legs won</div><div className={statValue}>{st.legs}</div></div>
                <div><div className={statLabel}>180s</div><div className={statValue}>{st.ton80}</div></div>
                <div><div className={statLabel}>140+ tons</div><div className={statValue}>{st.ton40}</div></div>
                <div><div className={statLabel}>100+ tons</div><div className={statValue}>{st.tons}</div></div>
                <div><div className={statLabel}>Darts thrown</div><div className={statValue}>{st.darts}</div></div>
              </div>
            </div>
          )
        })}

        {history.length > 0 && (
          <div className="bg-paper border border-rule p-4">
            <h3 className="text-2xs tracking-[0.1em] uppercase text-ink-light mb-3">Leg History</h3>
            <div className="flex flex-col gap-2 max-h-72 overflow-y-auto">
              {history.map((h, i) => (
                <div key={i} className="flex justify-between text-xs border-b border-rule pb-2">
                  <span className="font-medium">Leg {i + 1}: {h.winner} ({h.checkoutScore})</span>
                  <span className="text-ink-light">{config.p1} {h.p1avg} / {config.p2} {h.p2avg}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {confirmNew && (
        <div className="fixed inset-0 bg-bg/60 backdrop-blur-sm z-50 flex items-center justify-center" onClick={() => setConfirmNew(false)}>
          <div className="bg-paper border-2 border-ink p-8 text-center max-w-xs w-[90%] flex flex-col gap-6 relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setConfirmNew(false)} className="absolute top-3 right-3 text-ink-faint active:text-ink font-mono text-lg leading-none" aria-label="Cancel">✕</button>
            <p className="font-display font-black text-3xl">New game?</p>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setConfirmNew(false)} className="py-5 border-2 border-rule active:border-ink active:bg-bg active:scale-[0.97] font-mono text-2xl transition-all duration-100 cursor-pointer">No</button>
              <button onClick={() => { setConfirmNew(false); setScreen('setup') }} className="py-5 border-2 border-ink bg-ink text-bg active:opacity-80 active:scale-[0.97] font-mono text-2xl transition-all duration-100 cursor-pointer">Yes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
