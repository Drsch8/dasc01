'use client'
import { useGameStore } from '@/store/game-store'
import { validateInput } from '@/lib/engine'

export function InputArea() {
  const inputStr = useGameStore(s => s.inputStr)
  const inputMode = useGameStore(s => s.inputMode)
  const current = useGameStore(s => s.current)
  const score = useGameStore(s => s.scores[current])
  const outRule = useGameStore(s => s.config.outRule)

  const validation = validateInput(inputStr, inputMode, score, outRule)
  const isInvalid = inputStr !== '' && !validation.valid

  return (
    <div className="px-4 py-3 bg-paper border-b border-rule">
      <div className="flex items-center gap-3">
        {/* Dart dots */}
        <div className="flex gap-1">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-2 h-2 rounded-full border border-ink-faint bg-transparent"
            />
          ))}
        </div>

        {/* Score display */}
        <div className={`font-display font-bold text-3xl md:text-4xl min-w-[72px] text-center
          border-b-2 pb-0.5 leading-tight transition-colors
          ${isInvalid ? 'text-bust border-bust' : 'text-ink border-ink'}`}>
          {inputStr || '_'}
        </div>
      </div>

      {/* Desktop keyboard hint */}
      <p className="hidden md:block mt-2 text-2xs text-ink-light tracking-wide">
        Type a score, press Enter — F1–F12 for quick scores · Ctrl+Z to undo
      </p>
    </div>
  )
}
