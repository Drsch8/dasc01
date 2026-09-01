'use client'
import { useGameStore } from '@/store/game-store'

export function Numpad() {
  const appendDigit = useGameStore(s => s.appendDigit)
  const deleteDigit = useGameStore(s => s.deleteDigit)
  const enterScore = useGameStore(s => s.enterScore)

  const btn = 'bg-key text-ink font-num text-[30px] leading-none py-4 active:bg-rule-strong select-none cursor-pointer border-none outline-none touch-none transition-colors duration-75'
  const word = 'bg-panel text-ink-light font-cond text-base font-bold tracking-caps uppercase py-[18px] active:bg-rule-strong select-none cursor-pointer border-none outline-none touch-none transition-colors duration-75'
  const enter = 'bg-accent text-ink font-cond text-base font-bold tracking-caps uppercase py-[18px] active:opacity-80 select-none cursor-pointer border-none outline-none touch-none transition-opacity duration-75'

  return (
    <>
      <div className="grid grid-cols-3 gap-0.5 bg-bg px-0.5 pb-0.5">
        {['1','2','3','4','5','6','7','8','9'].map(d => (
          <button key={d} className={btn} onClick={() => appendDigit(d)}>{d}</button>
        ))}
        <button className={`${word} flex items-center justify-center`} onClick={deleteDigit} aria-label="Delete">
          {/* Barlow Condensed has no U+232B, so the backspace arrow is drawn. */}
          <svg width="31" height="24" viewBox="0 0 26 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M8.5 2.5H24a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H8.5L1 10z" />
            <path d="M13 7l7 6M20 7l-7 6" />
          </svg>
        </button>
        <button className={btn} onClick={() => appendDigit('0')}>0</button>
        <button className={enter} onClick={enterScore}>ENTER</button>
      </div>
      <div className="bg-bg" style={{ height: 'env(safe-area-inset-bottom)' }} />
    </>
  )
}
