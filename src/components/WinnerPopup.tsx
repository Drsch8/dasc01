'use client'
import { useGameStore } from '@/store/game-store'

// Burst directions from card center — (dx, dy) in px
const PARTICLES: { char: string; dx: number; dy: number; delay: number; size: number }[] = [
  { char: '★', dx:   0,   dy: -220, delay: 0,    size: 52 },
  { char: '✦', dx:  155,  dy: -155, delay: 0.04, size: 40 },
  { char: '◆', dx:  220,  dy:    0, delay: 0.02, size: 34 },
  { char: '★', dx:  155,  dy:  155, delay: 0.06, size: 44 },
  { char: '✦', dx:    0,  dy:  220, delay: 0.01, size: 36 },
  { char: '◆', dx: -155,  dy:  155, delay: 0.05, size: 38 },
  { char: '★', dx: -220,  dy:    0, delay: 0.03, size: 48 },
  { char: '✦', dx: -155,  dy: -155, delay: 0.07, size: 36 },
]
const DURATION = 1.2

export function WinnerPopup() {
  const winnerName    = useGameStore(s => s.winnerName)
  const dismissWinner = useGameStore(s => s.dismissWinner)
  const undoWinner    = useGameStore(s => s.undoWinner)
  const rematch       = useGameStore(s => s.rematch)
  const newGame       = useGameStore(s => s.newGame)

  if (!winnerName) return null

  const btnGhost = 'py-4 border border-rule-strong text-ink-light active:border-ink active:text-ink active:scale-[0.97] font-cond text-base font-semibold tracking-caps uppercase transition-all duration-100 cursor-pointer bg-transparent'
  const btnFill  = 'py-4 bg-accent text-ink border-none active:opacity-80 active:scale-[0.97] font-cond text-base font-bold tracking-caps uppercase transition-all duration-100 cursor-pointer'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-bg/70 backdrop-blur-sm"
      style={{ animation: 'fade-in 0.2s ease both' }}
    >
      <div
        className="bg-paper border-l-[5px] border-l-accent border-y border-r border-rule-strong p-8 text-center max-w-xs w-[90%] flex flex-col gap-6 relative overflow-visible"
        style={{ animation: 'winner-bounce-in 0.45s cubic-bezier(0.34,1.56,0.64,1) both' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Particles burst from card center — 2 bursts then stop */}
        {PARTICLES.map((p, i) => (
          <span
            key={i}
            className="pointer-events-none select-none text-accent absolute"
            style={{
              top: '50%',
              left: '50%',
              fontSize: p.size,
              lineHeight: 1,
              '--dx': `${p.dx}px`,
              '--dy': `${p.dy}px`,
              animation: `particle-burst ${DURATION}s ${p.delay}s ease-out 2 forwards`,
            } as React.CSSProperties}
          >
            {p.char}
          </span>
        ))}

        <div className="flex flex-col gap-2">
          <p className="font-cond text-xs font-semibold tracking-label uppercase text-ink-light">Winner</p>
          <p className="font-num text-5xl leading-[0.9] tracking-[0.01em] uppercase break-words">{winnerName}</p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button onClick={rematch}  className={btnFill}>Rematch</button>
          <button onClick={newGame}  className={btnGhost}>New game</button>
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={undoWinner}
            className="font-cond text-xs font-semibold tracking-caps uppercase text-ink-faint active:text-ink transition-colors cursor-pointer bg-transparent border-none"
          >
            ← Undo
          </button>
          <button
            onClick={dismissWinner}
            className="font-cond text-xs font-semibold tracking-caps uppercase text-ink-faint active:text-ink transition-colors cursor-pointer bg-transparent border-none"
          >
            Stats →
          </button>
        </div>
      </div>
    </div>
  )
}
