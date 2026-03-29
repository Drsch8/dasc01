'use client'
import { useEffect, useRef } from 'react'
import { useGameStore } from '@/store/game-store'

export function GameLog() {
  const rounds = useGameStore(s => s.rounds)
  const config = useGameStore(s => s.config)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [rounds.length])

  return (
    <div className="flex-1 overflow-y-auto bg-bg">
      <div className="px-4 py-2">
        {/* Header row */}
        <div className="grid grid-cols-[3.5rem_1fr_1fr] gap-2 text-2xs tracking-[0.1em] uppercase text-ink-light border-b-2 border-rule pb-2 mb-1">
          <span>Round</span>
          <span>{config.p1}</span>
          <span className="text-right">{config.p2}</span>
        </div>

        {/* Round rows */}
        {rounds.map((round, i) => {
          const p0 = round.p0
          const p1 = round.p1
          return (
            <div key={i} className="grid grid-cols-[3.5rem_1fr_1fr] gap-2 text-xs border-b border-rule py-1.5 items-center">
              <span className="text-ink-light text-[11px]">{i + 1}</span>
              <span>
                {p0 ? (
                  <>
                    <span className="font-medium">{p0.score}</span>
                    {p0.bust && <span className="text-bust ml-0.5">B</span>}
                    <span className="text-ink-light ml-1">{p0.remain}</span>
                  </>
                ) : '—'}
              </span>
              <span className="text-right">
                {p1 ? (
                  <>
                    <span className="font-medium">{p1.score}</span>
                    {p1.bust && <span className="text-bust ml-0.5">B</span>}
                    <span className="text-ink-light ml-1">{p1.remain}</span>
                  </>
                ) : '—'}
              </span>
            </div>
          )
        })}

        <div ref={bottomRef} />
      </div>
    </div>
  )
}
