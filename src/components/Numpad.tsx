'use client'
import { useGameStore } from '@/store/game-store'

export function Numpad() {
  const appendDigit = useGameStore(s => s.appendDigit)
  const deleteDigit = useGameStore(s => s.deleteDigit)
  const enterScore = useGameStore(s => s.enterScore)

  const btn = 'bg-paper py-4 text-lg font-mono text-ink active:bg-ink active:text-bg select-none cursor-pointer border-none outline-none touch-none transition-colors duration-75'
  const enter = `${btn} bg-ink text-bg text-[0.85rem] tracking-widest active:bg-rule active:text-ink`

  return (
    <div className="grid grid-cols-3 gap-px bg-rule border-t border-rule">
      {['1','2','3','4','5','6','7','8','9'].map(d => (
        <button key={d} className={btn} onClick={() => appendDigit(d)}>{d}</button>
      ))}
      <button className={`${btn} text-2xl md:text-lg`} onClick={deleteDigit}>⌫</button>
      <button className={btn} onClick={() => appendDigit('0')}>0</button>
      <button className={enter} onClick={enterScore}>ENTER</button>
    </div>
  )
}
