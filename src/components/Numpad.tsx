'use client'
import { useGameStore } from '@/store/game-store'

export function Numpad() {
  const appendDigit = useGameStore(s => s.appendDigit)
  const deleteDigit = useGameStore(s => s.deleteDigit)
  const enterScore = useGameStore(s => s.enterScore)

  const btn = 'bg-paper py-4 text-lg font-mono text-ink active:bg-bg select-none cursor-pointer border-none outline-none touch-none'
  const enter = `${btn} bg-ink text-bg text-[0.85rem] tracking-widest active:bg-ink/80`

  return (
    <div className="grid grid-cols-3 gap-px bg-rule border-t border-rule md:hidden">
      {['1','2','3','4','5','6','7','8','9'].map(d => (
        <button key={d} className={btn} onClick={() => appendDigit(d)}>{d}</button>
      ))}
      <button className={btn} onClick={deleteDigit}>⌫</button>
      <button className={btn} onClick={() => appendDigit('0')}>0</button>
      <button className={enter} onClick={enterScore}>ENTER</button>
    </div>
  )
}
