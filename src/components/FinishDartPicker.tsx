'use client'
import { useEffect } from 'react'
import { useGameStore } from '@/store/game-store'

/** Returns which dart numbers are physically possible for this checkout score */
function possibleDarts(checkoutScore: number, outRule: 'double' | 'single'): Set<1 | 2 | 3> {
  const possible = new Set<1 | 2 | 3>()

  if (outRule === 'double') {
    // Dart 1: finishing dart must be a valid double (even, 2–50; bull=50 counts)
    if (checkoutScore >= 2 && checkoutScore <= 50 && checkoutScore % 2 === 0) possible.add(1)
    // Dart 2: dart1 scores 0–60, dart2 is a double (max 50) → max 110
    if (checkoutScore <= 110) possible.add(2)
  } else {
    // Single out: any valid dart score 1–60
    if (checkoutScore <= 60) possible.add(1)
    if (checkoutScore <= 120) possible.add(2)
  }
  possible.add(3)

  return possible
}

export function FinishDartPicker() {
  const pendingCheckout = useGameStore(s => s.pendingCheckout)
  const confirmFinishDart = useGameStore(s => s.confirmFinishDart)
  const undo = useGameStore(s => s.undo)
  const outRule = useGameStore(s => s.config.outRule)

  const possible = pendingCheckout
    ? possibleDarts(pendingCheckout.checkoutScore, outRule)
    : new Set<1 | 2 | 3>()

  // Auto-confirm if only one dart is possible
  useEffect(() => {
    if (!pendingCheckout) return
    if (possible.size === 1) {
      const only = [...possible][0]
      confirmFinishDart(only)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingCheckout?.checkoutScore])

  if (!pendingCheckout) return null
  if (possible.size === 1) return null  // auto-confirming, don't flash the picker

  return (
    <div className="fixed inset-0 bg-bg/60 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-paper border-2 border-ink p-8 text-center max-w-xs w-[90%] flex flex-col gap-6 relative">
        <div>
          <p className="text-xs tracking-[0.15em] uppercase text-ink-light font-mono mb-2">
            Checked out {pendingCheckout.checkoutScore}
          </p>
          <p className="font-display font-black text-3xl">Which dart?</p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {([1, 2, 3] as const).map(d => {
            const enabled = possible.has(d)
            return (
              <button
                key={d}
                onClick={() => enabled && confirmFinishDart(d)}
                disabled={!enabled}
                className={`py-5 border-2 font-mono text-2xl transition-colors
                  ${enabled
                    ? 'border-rule active:border-ink active:bg-ink-faint active:scale-[0.97] transition-transform duration-100 cursor-pointer'
                    : 'border-rule/30 text-ink-faint cursor-not-allowed'
                  }`}
              >
                {d}
              </button>
            )
          })}
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={undo}
            className="font-mono text-xs tracking-[0.1em] uppercase text-ink-faint active:text-ink transition-colors cursor-pointer bg-transparent border-none"
          >
            ← Undo
          </button>
          <p className="text-xs text-ink-light font-mono">Press 1 · 2 · 3</p>
        </div>
      </div>
    </div>
  )
}
