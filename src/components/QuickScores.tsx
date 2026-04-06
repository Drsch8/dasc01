'use client'
import { useGameStore } from '@/store/game-store'
import { QUICK_SCORE_VALUES, QUICK_SCORE_LABELS, FKEY_LABELS, REM_SENTINEL, FINISH_SENTINEL } from '@/lib/constants'
import { isFinishable } from '@/lib/checkouts'

export function QuickScores() {
  const quickScore = useGameStore(s => s.quickScore)
  const current = useGameStore(s => s.current)
  const currentScore = useGameStore(s => s.scores[current])

  const canFinish = isFinishable(currentScore)

  return (
    <div className="grid grid-cols-6 md:grid-cols-12 gap-px bg-rule border-t border-rule shrink-0">
      {QUICK_SCORE_VALUES.map((val, i) => {
        const isFinish = val === FINISH_SENTINEL

        let cls = 'bg-paper text-ink active:bg-ink-faint'
        if (isFinish && canFinish) cls = 'bg-finish-bg text-finish active:bg-finish/10'
        else if (isFinish) cls = 'bg-paper text-ink-faint'

        return (
          <button
            key={i}
            onClick={() => quickScore(val)}
            onTouchEnd={e => (e.currentTarget as HTMLElement).blur()}
            className={`py-3 text-center font-mono text-sm md:text-base select-none cursor-pointer border-none outline-none touch-none transition-colors ${cls}`}
          >
            <span className="hidden md:block text-xs leading-none mb-0.5 text-ink-light">
              {FKEY_LABELS[i]}
            </span>
            {QUICK_SCORE_LABELS[i]}
          </button>
        )
      })}
    </div>
  )
}
