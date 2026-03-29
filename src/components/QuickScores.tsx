'use client'
import { useGameStore } from '@/store/game-store'
import { QUICK_SCORE_VALUES, QUICK_SCORE_LABELS, FKEY_LABELS } from '@/lib/constants'

export function QuickScores() {
  const quickScore = useGameStore(s => s.quickScore)

  return (
    <div className="grid grid-cols-6 md:grid-cols-12 gap-px bg-rule border-t border-b border-rule">
      {QUICK_SCORE_VALUES.map((val, i) => (
        <button
          key={i}
          onClick={() => quickScore(val)}
          className="bg-paper py-2 text-center font-mono text-xs text-ink hover:bg-bg active:bg-ink-faint select-none cursor-pointer border-none outline-none touch-none"
        >
          <span className="hidden md:block text-2xs text-ink-light leading-none mb-0.5">
            {FKEY_LABELS[i]}
          </span>
          {QUICK_SCORE_LABELS[i]}
        </button>
      ))}
    </div>
  )
}
