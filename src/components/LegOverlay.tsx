'use client'
import { useGameStore } from '@/store/game-store'

export function LegOverlay() {
  const overlay = useGameStore(s => s.overlay)
  const nextLeg = useGameStore(s => s.nextLeg)
  const newGame = useGameStore(s => s.newGame)
  const setScreen = useGameStore(s => s.setScreen)

  if (!overlay) return null

  return (
    <div className="fixed inset-0 bg-ink/85 z-50 flex items-center justify-center">
      <div className="bg-paper border-2 border-ink p-10 text-center max-w-xs w-[90%] flex flex-col gap-4">
        <p className="text-2xs tracking-[0.15em] uppercase text-ink-light">{overlay.label}</p>
        <p className="font-display font-black text-4xl leading-tight">{overlay.winner}</p>
        <p className="text-lg">Checked out {overlay.checkoutScore}</p>
        <p className="text-xs text-ink-light">{overlay.legAvg}</p>
        <p className="text-xs text-ink-light">{overlay.scoreSummary}</p>

        <div className="flex flex-col gap-2 mt-2">
          {overlay.isMatchOver ? (
            <button
              onClick={newGame}
              className="bg-ink text-bg py-3 font-mono text-sm tracking-widest hover:opacity-80"
            >
              New Match
            </button>
          ) : (
            <button
              onClick={nextLeg}
              className="bg-ink text-bg py-3 font-mono text-sm tracking-widest hover:opacity-80"
            >
              {overlay.label === 'Set Win!' ? 'Next Set' : 'Next Leg'}
            </button>
          )}
          <button
            onClick={() => setScreen('stats')}
            className="border border-rule py-3 font-mono text-sm text-ink hover:border-ink transition-colors"
          >
            View Stats
          </button>
        </div>
      </div>
    </div>
  )
}
