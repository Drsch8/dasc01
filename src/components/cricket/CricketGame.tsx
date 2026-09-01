'use client'
import { useEffect, useState, useCallback } from 'react'
import { useCricketStore } from '@/store/cricket-store'
import { Marks } from './Marks'

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
  const [activeRow, setActiveRow] = useState<number | null>(null)
  const clearActive = useCallback(() => setActiveRow(null), [])

  useEffect(() => {
    window.scrollTo(0, 0)
    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'
    return () => {
      document.documentElement.style.overflow = ''
      document.body.style.overflow = ''
    }
  }, [])

  useEffect(() => {
    const keyMap: Record<string, number> = {
      '1': 11, '2': 12, '3': 13, '4': 14,
      '5': 15, '6': 16, '7': 17, '8': 18, '9': 19, '0': 20,
      'b': 25, 'B': 25,
    }
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'z' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); undo(); return }
      if (winner !== null) return
      if (e.key === 'Enter') { endTurn(); return }
      const n = keyMap[e.key]
      if (n !== undefined) addMark(n)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [winner, addMark, endTurn, undo])

  const numbers = config.numbers
  const name    = (p: 0 | 1) => p === 0 ? config.p1 : config.p2
  const active  = (p: 0 | 1) => current === p && winner === null
  const marker  = (p: 0 | 1) => p === 0 ? 'var(--accent)' : 'var(--p2)'

  const hdrBtn = 'border border-rule-strong px-3 py-1.5 font-cond text-[13px] font-semibold tracking-caps uppercase text-ink-light active:border-ink active:text-ink active:scale-[0.97] transition-all duration-100 cursor-pointer bg-transparent'

  return (
    <div className="h-dvh bg-bg flex flex-col overflow-hidden">

      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-rule bg-bg shrink-0">
        <button
          onClick={() => setConfirmNew(true)}
          className="font-cond text-xs font-semibold tracking-label uppercase text-ink-light bg-transparent border-none cursor-pointer"
        >
          Cricket
        </button>
        <div className="flex gap-2">
          <button className={hdrBtn} onClick={undo}>Undo</button>
          <button className={hdrBtn} onClick={() => setConfirmNew(true)}>New</button>
        </div>
      </div>

      {/* ── Scoreboard ── */}
      <div className="shrink-0 bg-bg">
        <div className="flex md:justify-center">
          <div className="w-full md:max-w-2xl md:border-x border-b border-rule flex">
            {([0, 1] as const).map(p => (
              <div
                key={p}
                className={`flex-1 px-3.5 py-3 ${active(p) ? 'bg-paper' : 'bg-bg'}`}
                style={{
                  borderLeft: `5px solid ${active(p) ? marker(p) : 'var(--rule)'}`,
                  transition: 'background-color 200ms ease-in-out, border-color 200ms ease-in-out',
                }}
              >
                <div className={`font-cond text-base tracking-[0.1em] uppercase truncate ${active(p) ? 'font-semibold text-ink' : 'font-medium text-ink-light'}`}>
                  {name(p)}
                </div>
                <div className={`font-num text-[clamp(2rem,11vw,46px)] leading-none ${active(p) ? 'text-ink' : 'text-ink-light'}`}>
                  {scores[p]}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Number grid ── */}
      <div className="flex-1 min-h-0 bg-bg md:flex md:justify-center">
        <div className="w-full h-full md:max-w-2xl md:border-x md:border-rule flex flex-col">
          {numbers.map(n => {
            const [p1m, p2m] = marks[n] ?? [0, 0]
            const fullyClosed = p1m >= 3 && p2m >= 3
            const label = n === 25 ? 'Bull' : String(n)

            return (
              <button
                key={n}
                onClick={() => addMark(n)}
                disabled={winner !== null}
                onPointerDown={() => { if (winner === null) setActiveRow(n) }}
                onPointerUp={clearActive}
                onPointerLeave={clearActive}
                onTouchEnd={e => { clearActive(); (e.currentTarget as HTMLElement).blur() }}
                className={`relative flex-1 grid border-b border-rule
                  ${winner === null ? 'cursor-pointer' : 'cursor-default'}
                  ${fullyClosed ? 'opacity-35' : ''}
                `}
                style={{ gridTemplateColumns: '1fr 5.25rem 1fr' }}
              >
                {/* P1 marks */}
                <div
                  className="flex items-center justify-center px-4 transition-colors duration-75"
                  style={{
                    color: 'var(--accent)',
                    backgroundColor: activeRow === n && current === 0
                      ? 'rgba(214,58,38,0.18)'
                      : active(0) && !fullyClosed ? 'var(--paper)' : 'transparent',
                  }}
                  onClick={current === 1 ? e => e.stopPropagation() : undefined}
                >
                  <Marks count={p1m} />
                </div>

                {/* Number */}
                <div className="flex items-center justify-center bg-panel">
                  <span className={`${n === 25 ? 'font-cond text-2xl font-bold tracking-[0.06em] uppercase' : 'font-num text-3xl leading-none'} ${fullyClosed ? 'text-ink-light' : 'text-ink'}`}>
                    {label}
                  </span>
                </div>

                {/* P2 marks */}
                <div
                  className="flex items-center justify-center px-4 transition-colors duration-75"
                  style={{
                    color: 'var(--p2)',
                    backgroundColor: activeRow === n && current === 1
                      ? 'rgba(47,111,232,0.18)'
                      : active(1) && !fullyClosed ? 'var(--paper)' : 'transparent',
                  }}
                  onClick={current === 0 ? e => e.stopPropagation() : undefined}
                >
                  <Marks count={p2m} />
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── End Turn bar ── */}
      {winner === null && (
        <div className="shrink-0 bg-bg p-3 md:flex md:justify-center">
          <button
            onClick={endTurn}
            className="w-full md:max-w-2xl py-5 text-bg font-cond text-xl font-bold tracking-label uppercase active:opacity-80 active:scale-[0.99] transition-all duration-100 cursor-pointer border-none"
            style={{ backgroundColor: marker(current), color: 'var(--ink)' }}
          >
            End turn · {name(current)}
          </button>
        </div>
      )}

      {/* ── Winner overlay ── */}
      {winner !== null && (
        <div
          className="fixed inset-0 bg-bg/70 backdrop-blur-sm z-50 flex items-center justify-center"
          style={{ animation: 'fade-in 0.2s ease both' }}
        >
          <div
            className="bg-paper border-y border-r border-rule-strong p-8 text-center max-w-xs w-[90%] flex flex-col gap-6"
            style={{
              borderLeft: `5px solid ${marker(winner)}`,
              animation: 'winner-bounce-in 0.45s cubic-bezier(0.34,1.56,0.64,1) both',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex flex-col gap-2">
              <p className="font-cond text-xs font-semibold tracking-label uppercase text-ink-light">Winner</p>
              <p className="font-num text-5xl leading-[0.9] tracking-[0.01em] uppercase break-words">{name(winner)}</p>
              <p className="font-cond text-base tracking-caps uppercase text-ink-light">{scores[winner]} pts</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => useCricketStore.getState().startGame(config)}
                className="py-4 bg-accent text-ink border-none active:opacity-80 active:scale-[0.97] font-cond text-base font-bold tracking-caps uppercase transition-all duration-100 cursor-pointer"
              >
                Rematch
              </button>
              <button
                onClick={newGame}
                className="py-4 border border-rule-strong text-ink-light active:border-ink active:text-ink active:scale-[0.97] font-cond text-base font-semibold tracking-caps uppercase transition-all duration-100 cursor-pointer bg-transparent"
              >
                New game
              </button>
            </div>
            <button
              onClick={undo}
              className="font-cond text-xs font-semibold tracking-caps uppercase text-ink-faint active:text-ink transition-colors cursor-pointer bg-transparent border-none"
            >
              ← Undo
            </button>
          </div>
        </div>
      )}

      {/* ── New game confirm ── */}
      {confirmNew && (
        <div className="fixed inset-0 bg-bg/70 backdrop-blur-sm z-50 flex items-center justify-center" onClick={() => setConfirmNew(false)}>
          <div className="bg-paper border-l-[5px] border-l-accent border-y border-r border-rule-strong p-8 text-center max-w-xs w-[90%] flex flex-col gap-6 relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setConfirmNew(false)} className="absolute top-3 right-3 text-ink-faint active:text-ink font-cond text-lg leading-none" aria-label="Cancel">✕</button>
            <p className="font-num text-3xl tracking-[0.02em] uppercase">New game?</p>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setConfirmNew(false)} className="py-5 border border-rule-strong text-ink-light active:border-ink active:text-ink active:scale-[0.97] font-cond text-lg font-semibold tracking-caps uppercase transition-all duration-100 cursor-pointer">No</button>
              <button onClick={() => { setConfirmNew(false); newGame() }} className="py-5 bg-accent text-ink border-none active:opacity-80 active:scale-[0.97] font-cond text-lg font-bold tracking-caps uppercase transition-all duration-100 cursor-pointer">Yes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
