'use client'
import { useGameStore } from '@/store/game-store'
import { getCheckoutSuggestions, isFinishable } from '@/lib/checkouts'

export function CheckoutHint() {
  const current = useGameStore(s => s.current)
  const score = useGameStore(s => s.scores[current])

  if (!isFinishable(score)) return <div className="h-8 border-b border-rule" />

  const suggestions = getCheckoutSuggestions(score, 2)
  if (suggestions.length === 0) return <div className="h-8 border-b border-rule" />

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-finish-bg border-b border-rule text-finish text-xs flex-wrap min-h-[2rem]">
      <span className="text-2xs uppercase tracking-[0.1em] opacity-70">Finish</span>
      <span>{suggestions[0]}</span>
      {suggestions[1] && (
        <span className="hidden md:inline opacity-60">{suggestions[1]}</span>
      )}
    </div>
  )
}
