'use client'
import { useGameStore } from '@/store/game-store'
import { getCheckoutSuggestions, isFinishable } from '@/lib/checkouts'

export function CheckoutHint() {
  const current = useGameStore(s => s.current)
  const score = useGameStore(s => s.scores[current])

  if (!isFinishable(score)) return <div className="hidden md:block h-10 border-b border-rule" />

  const suggestions = getCheckoutSuggestions(score, 2)
  if (suggestions.length === 0) return <div className="hidden md:block h-10 border-b border-rule" />

  return (
    <div className="hidden md:flex items-center gap-3 px-5 py-2.5 bg-finish-bg border-b border-rule text-finish text-sm md:text-base min-h-[2.5rem] overflow-hidden">
      <span className="text-xs md:text-sm uppercase tracking-[0.1em] opacity-70 font-mono shrink-0">Finish</span>
      <span className="font-mono truncate min-w-0">{suggestions[0]}</span>
      {suggestions[1] && (
        <span className="hidden md:inline opacity-60 font-mono truncate min-w-0 shrink">{suggestions[1]}</span>
      )}
    </div>
  )
}
