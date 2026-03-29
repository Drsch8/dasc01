'use client'
import { useGameStore } from '@/store/game-store'
import { computeAvg, computeFirst9Avg, computeCheckoutPct } from '@/lib/engine'

export function StatsScreen() {
  const config = useGameStore(s => s.config)
  const allStats = useGameStore(s => s.allStats)
  const history = useGameStore(s => s.history)
  const setScreen = useGameStore(s => s.setScreen)

  const statLabel = 'text-2xs tracking-[0.1em] uppercase text-ink-light'
  const statValue = 'font-display font-bold text-2xl leading-tight'

  return (
    <div className="min-h-screen bg-bg">
      <div className="flex items-center justify-between px-4 py-3 border-b border-rule bg-paper sticky top-0">
        <span className="font-display font-bold text-lg">Statistics</span>
        <button
          onClick={() => setScreen('game')}
          className="border border-rule px-3 py-1.5 text-xs text-ink-light font-mono hover:border-ink hover:text-ink transition-colors"
        >
          ← Back
        </button>
      </div>

      <div className="p-4 flex flex-col gap-4 max-w-2xl mx-auto">
        {[config.p1, config.p2].map(name => {
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
    </div>
  )
}
