'use client'
import { useGameStore } from '@/store/game-store'

export function SetWonPopup() {
  const pendingSetWon = useGameStore(s => s.pendingSetWon)
  const config = useGameStore(s => s.config)
  const continueToNextSet = useGameStore(s => s.continueToNextSet)

  if (!pendingSetWon) return null

  const { winnerName, sets, setHistory } = pendingSetWon
  const setNumber = sets[0] + sets[1]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-bg/70 backdrop-blur-sm"
      style={{ animation: 'fade-in 0.2s ease both' }}
    >
      <div
        className="bg-paper border-l-[5px] border-l-accent border-y border-r border-rule-strong p-6 max-w-xs w-[92%] flex flex-col gap-5"
        style={{ animation: 'winner-bounce-in 0.45s cubic-bezier(0.34,1.56,0.64,1) both' }}
      >
        <div className="flex flex-col gap-1">
          <p className="font-cond text-[11px] font-semibold tracking-label uppercase text-ink-faint">Set {setNumber} complete</p>
          <p className="font-num text-3xl leading-none tracking-[0.02em] uppercase break-words">{winnerName}</p>
          <p className="font-cond text-base tracking-caps text-ink-light">{sets[0]} – {sets[1]}</p>
        </div>

        <div>
          <div className="grid grid-cols-[1.5rem_1fr_3.5rem_3.5rem] gap-x-2 font-cond text-[11px] font-semibold tracking-label uppercase text-ink-faint border-b border-rule-strong pb-1 mb-1">
            <span>#</span>
            <span>Winner</span>
            <span className="text-right truncate">{config.p1}</span>
            <span className="text-right truncate">{config.p2}</span>
          </div>
          {setHistory.map((h, i) => (
            <div key={i} className="grid grid-cols-[1.5rem_1fr_3.5rem_3.5rem] gap-x-2 font-cond text-sm tracking-[0.04em] border-b border-rule py-1 items-center">
              <span className="text-ink-faint">{i + 1}</span>
              <span className="text-ink truncate uppercase">{h.winner} <span className="text-ink-faint">({h.checkoutScore})</span></span>
              <span className="text-right text-ink">{h.p1avg}</span>
              <span className="text-right text-ink">{h.p2avg}</span>
            </div>
          ))}
        </div>

        <button
          onClick={continueToNextSet}
          className="w-full py-4 bg-accent text-ink border-none active:opacity-80 active:scale-[0.97] font-cond text-base font-bold tracking-label uppercase transition-all duration-100 cursor-pointer"
        >
          Set {setNumber + 1} →
        </button>
      </div>
    </div>
  )
}
