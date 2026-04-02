'use client'
import { useEffect, useState } from 'react'
import { useCricketStore } from '@/store/cricket-store'

function Marks({ count }: { count: number }) {
  if (count === 0) return null
  const src = count === 1 ? '/1.svg' : count === 2 ? '/2.svg' : '/3.svg'
  const height = count >= 3 ? 32 : 44
  return <img src={src} style={{ height }} className="w-auto select-none" aria-hidden alt="" />
}

export function CricketGame() {
  const config         = useCricketStore(s => s.config)
  const marks          = useCricketStore(s => s.marks)
  const scores         = useCricketStore(s => s.scores)
  const current        = useCricketStore(s => s.current)
  const winner         = useCricketStore(s => s.winner)
  const addMark        = useCricketStore(s => s.addMark)
  const endTurn        = useCricketStore(s => s.endTurn)
  const undo           = useCricketStore(s => s.undo)
  const newGame        = useCricketStore(s => s.newGame)
  const [confirmNew, setConfirmNew] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'
    return () => {
      document.documentElement.style.overflow = ''
      document.body.style.overflow = ''
    }
  }, [])

  const numbers = config.numbers
  const name    = (p: 0 | 1) => p === 0 ? config.p1 : config.p2
  const active  = (p: 0 | 1) => current === p && winner === null

  const hdrBtn = 'border border-rule px-4 py-2 text-sm text-ink-light font-mono hover:border-ink hover:text-ink transition-colors cursor-pointer bg-transparent'

  return (
    <div className="h-dvh bg-bg flex flex-col overflow-hidden">

      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-rule bg-paper shrink-0">
        <button
          onClick={() => setConfirmNew(true)}
          className="font-display font-bold text-2xl tracking-tight bg-transparent border-none cursor-pointer"
        >
          Cricket
        </button>
        <div className="flex gap-2">
          <button className={hdrBtn} onClick={undo}>Undo</button>
          <button className={hdrBtn} onClick={() => setConfirmNew(true)}>New</button>
        </div>
      </div>

      {/* ── Scoreboard ── */}
      <div className="shrink-0 border-b border-rule">
        <div className="flex md:justify-center">
          <div className="w-full md:max-w-2xl flex">
            {([0, 1] as const).map(p => (
              <div
                key={p}
                className={`flex-1 flex flex-col px-4 pt-3 pb-4 transition-colors
                  ${p === 0 ? 'border-r border-rule' : ''}
                  ${active(p) ? 'bg-paper shadow-[inset_0_0_0_2px_#1a1a18] z-10' : 'bg-bg'}`}
                style={{ transition: 'background-color 200ms ease-in-out, box-shadow 200ms ease-in-out' }}
              >
                <div className={`font-mono text-sm uppercase tracking-wide truncate mb-1 ${active(p) ? 'text-ink' : 'text-ink-light'}`}>
                  {name(p)}
                </div>
                <div className={`font-display font-black text-[clamp(2.5rem,10vw,4rem)] leading-none ${active(p) ? 'text-ink' : 'text-ink-faint'}`}>
                  {scores[p]}
                </div>

              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Number grid ── */}
      <div className="flex-1 min-h-0 overflow-y-auto bg-paper md:flex md:justify-center">
        <div className="w-full md:max-w-2xl md:border-x md:border-rule">
          {numbers.map(n => {
            const [p1m, p2m] = marks[n] ?? [0, 0]
            const fullyClosed = p1m >= 3 && p2m >= 3
            const label = n === 25 ? 'Bull' : String(n)

            return (
              <button
                key={n}
                onClick={() => addMark(n)}
                disabled={winner !== null}
                onTouchEnd={e => (e.currentTarget as HTMLElement).blur()}
                className={`w-full grid border-b border-rule
                  ${winner === null ? 'cursor-pointer' : 'cursor-default'}
                `}
                style={{ gridTemplateColumns: '1fr 5rem 1fr' }}
              >
                {/* P1 marks */}
                <div className={`flex items-center justify-center px-4 py-4 border-r border-rule
                  ${active(0) && !fullyClosed ? 'bg-paper' : 'bg-bg'}`}
                >
                  <div className={fullyClosed ? 'opacity-25' : ''}>
                    <Marks count={p1m} />
                  </div>
                </div>

                {/* Number */}
                <div className="flex items-center justify-center py-4 bg-paper active:bg-ink/10 transition-colors">
                  <span className={`font-display font-black text-2xl ${fullyClosed ? 'text-ink-faint' : 'text-ink'}`}>
                    {label}
                  </span>
                </div>

                {/* P2 marks */}
                <div className={`flex items-center justify-center px-4 py-4 border-l border-rule
                  ${active(1) && !fullyClosed ? 'bg-paper' : 'bg-bg'}`}
                >
                  <div className={fullyClosed ? 'opacity-25' : ''}>
                    <Marks count={p2m} />
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── End Turn bar ── */}
      {winner === null && (
        <div className="shrink-0 border-t border-rule">
          <button
            onClick={endTurn}
            className="w-full py-4 bg-paper font-mono text-sm tracking-widest text-ink hover:bg-bg transition-colors cursor-pointer border-none"
          >
            END TURN
          </button>
        </div>
      )}

      {/* ── Winner overlay ── */}
      {winner !== null && (
        <div
          className="fixed inset-0 bg-bg/60 backdrop-blur-sm z-50 flex items-center justify-center"
          style={{ animation: 'fade-in 0.2s ease both' }}
        >
          <div
            className="bg-paper border-2 border-ink p-8 text-center max-w-xs w-[90%] flex flex-col gap-6"
            style={{ animation: 'winner-bounce-in 0.45s cubic-bezier(0.34,1.56,0.64,1) both' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex flex-col gap-2">
              <p className="text-xs tracking-[0.15em] uppercase text-ink-light font-mono">Winner</p>
              <p className="font-display font-black text-5xl leading-tight break-words">{name(winner)}</p>
              <p className="font-mono text-sm text-ink-light">{scores[winner]} pts</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => useCricketStore.getState().startGame(config)}
                className="py-4 border-2 border-ink bg-ink text-bg hover:opacity-80 font-mono text-sm tracking-wide transition-opacity cursor-pointer"
              >
                Rematch
              </button>
              <button
                onClick={newGame}
                className="py-4 border-2 border-rule hover:border-ink font-mono text-sm tracking-wide transition-colors cursor-pointer bg-transparent"
              >
                New game
              </button>
            </div>
            <button
              onClick={undo}
              className="font-mono text-xs tracking-[0.1em] uppercase text-ink-faint hover:text-ink transition-colors cursor-pointer bg-transparent border-none"
            >
              ← Undo
            </button>
          </div>
        </div>
      )}

      {/* ── New game confirm ── */}
      {confirmNew && (
        <div className="fixed inset-0 bg-bg/60 backdrop-blur-sm z-50 flex items-center justify-center" onClick={() => setConfirmNew(false)}>
          <div className="bg-paper border-2 border-ink p-8 text-center max-w-xs w-[90%] flex flex-col gap-6 relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setConfirmNew(false)} className="absolute top-3 right-3 text-ink-faint hover:text-ink font-mono text-lg leading-none">✕</button>
            <p className="font-display font-black text-3xl">New game?</p>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setConfirmNew(false)} className="py-5 border-2 border-rule hover:border-ink hover:bg-bg font-mono text-2xl transition-colors cursor-pointer">No</button>
              <button onClick={() => { setConfirmNew(false); newGame() }} className="py-5 border-2 border-ink bg-ink text-bg hover:opacity-80 font-mono text-2xl transition-opacity cursor-pointer">Yes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
