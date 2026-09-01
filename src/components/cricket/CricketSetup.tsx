'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useCricketStore } from '@/store/cricket-store'

const CRICKET_HELP = [
  {
    title: 'Goal',
    items: [
      ['Win', 'Close all numbers and have a score equal to or higher than your opponent.'],
    ],
  },
  {
    title: 'Marks',
    items: [
      ['Close a number', 'Hit it 3 times. Single = 1 mark, double = 2, triple = 3.'],
      ['Score points', 'Once you close a number, further hits score its face value — until your opponent closes it too.'],
      ['Dead number', 'When both players have 3 marks on a number, no more points can be scored on it.'],
    ],
  },
  {
    title: 'Winning',
    items: [
      ['Close all', 'First to close all numbers wins — provided your score is not lower than your opponent\'s.'],
      ['Behind on points', 'Keep scoring until your score meets or exceeds theirs.'],
    ],
  },
  {
    title: 'This app',
    items: [
      ['Tap a number row', 'Adds one mark for the active player.'],
      ['Keyboard', '5–0 = 15–20, 1–4 = 11–14, B = Bull, Enter = End Turn.'],
      ['Undo', 'Removes the last action.'],
    ],
  },
]

function HelpOverlay({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col" onClick={onClose}>
      <div className="shrink-0" style={{ height: 'clamp(4rem,10vw,6rem)', marginTop: '1.5rem' }} />
      <div
        className="flex-1 overflow-y-auto bg-bg/95 backdrop-blur-sm p-6 md:p-12"
        onClick={e => e.stopPropagation()}
      >
        <div className="max-w-2xl mx-auto flex flex-col gap-8">
          <div className="flex items-center justify-between">
            <span className="font-num text-2xl tracking-[0.02em] uppercase">How to play Cricket</span>
            <button
              onClick={onClose}
              className="font-cond text-[13px] font-semibold tracking-caps uppercase text-ink-light active:text-ink px-3 py-1.5 border border-rule-strong active:border-ink transition-colors"
            >
              ✕ Close
            </button>
          </div>

          {CRICKET_HELP.map(section => (
            <div key={section.title}>
              <div className="font-cond text-[11px] font-semibold tracking-label uppercase text-ink-faint mb-2.5">
                {section.title}
              </div>
              <div className="bg-paper divide-y divide-rule">
                {section.items.map(([key, desc]) => (
                  <div key={key} className="flex gap-4 px-4 py-3">
                    <span className="font-cond text-[15px] font-semibold tracking-[0.04em] uppercase text-ink shrink-0 w-32">{key}</span>
                    <span className="text-sm text-ink-light">{desc}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <button
            onClick={onClose}
            className="w-full border border-rule-strong py-3 font-cond text-[15px] font-semibold tracking-caps uppercase text-ink-light active:border-ink active:text-ink transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  )
}

export function CricketSetup() {
  const startGame = useCricketStore(s => s.startGame)
  const [p1, setP1] = useState('')
  const [p2, setP2] = useState('')
  const [numbers, setNumbers] = useState<number[]>([20, 19, 18, 17, 16, 15, 25])
  const [showHelp, setShowHelp] = useState(false)

  function toggleNumber(n: number) {
    setNumbers(prev =>
      prev.includes(n) ? prev.filter(x => x !== n) : [...prev, n]
    )
  }

  function handleStart() {
    if (numbers.length === 0) return
    const sorted = [...numbers].sort((a, b) => {
      if (a === 25) return 1
      if (b === 25) return -1
      return b - a
    })
    startGame({ p1: p1.trim() || 'Player 1', p2: p2.trim() || 'Player 2', numbers: sorted })
  }

  const input = 'w-full bg-paper px-3 py-2.5 font-cond text-lg tracking-[0.06em] uppercase text-ink placeholder:text-ink-faint placeholder:normal-case outline-none border-none focus:bg-key'
  const sectionLabel = 'block font-cond text-[11px] font-semibold tracking-label uppercase text-ink-faint mb-2.5'
  const fieldLabel = 'block font-cond text-xs tracking-[0.14em] uppercase text-ink-light mb-1.5'

  return (
    <div className="h-dvh flex flex-col bg-bg">
      <div className="shrink-0 flex items-end justify-between px-4 pt-6 pb-4 md:px-12 md:pt-10 md:pb-6 border-b border-rule">
        <div className="flex items-end gap-3">
          <h1 className="font-num text-[clamp(2.5rem,8vw,4rem)] leading-[0.9] tracking-[0.01em]">
            Cricket
          </h1>
          <Link
            href="/"
            className="font-cond text-[15px] font-semibold tracking-label uppercase text-ink-light active:text-ink transition-colors pb-1.5"
          >
            501
          </Link>
        </div>
        <button
          onClick={() => setShowHelp(true)}
          className="font-cond text-[13px] font-semibold tracking-caps uppercase text-ink-light active:text-ink border border-rule-strong active:border-ink px-3 py-1.5 transition-colors active:scale-[0.97] transition-transform duration-100 mb-1"
        >
          Rules
        </button>
      </div>

      {showHelp && <HelpOverlay onClose={() => setShowHelp(false)} />}

      <div className="flex-1 overflow-y-auto px-4 py-5 md:px-12 md:py-8">
      <div className="w-full md:w-[420px] flex flex-col gap-6">

        <div>
          <span className={sectionLabel}>Players</span>
          <div className="flex flex-col gap-3">
            <div>
              <label className={fieldLabel}>Player 1</label>
              <div className="flex" style={{ borderLeft: '4px solid var(--accent)' }}>
                <input
                  className={input}
                  value={p1}
                  onChange={e => setP1(e.target.value)}
                  placeholder="Player 1"
                  maxLength={20}
                />
              </div>
            </div>

            <div>
              <label className={fieldLabel}>Player 2</label>
              <div className="flex" style={{ borderLeft: '4px solid var(--p2)' }}>
                <input
                  className={input}
                  value={p2}
                  onChange={e => setP2(e.target.value)}
                  placeholder="Player 2"
                  maxLength={20}
                  onKeyDown={e => e.key === 'Enter' && handleStart()}
                />
              </div>
            </div>
          </div>
        </div>

        <div>
          <span className={sectionLabel}>Numbers in play</span>
          <div className="grid grid-cols-6 gap-0.5">
            {([20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 25] as const).map(n => {
              const isActive = numbers.includes(n)
              return (
                <button
                  key={n}
                  onClick={() => toggleNumber(n)}
                  className={`py-3 border-none cursor-pointer transition-colors active:scale-[0.97] transition-transform duration-100
                    ${n === 25 ? 'font-cond text-base font-bold tracking-caps uppercase' : 'font-num text-xl leading-none'}
                    ${isActive
                      ? 'bg-accent text-ink'
                      : 'bg-paper text-ink-light active:bg-rule-strong active:text-ink'
                    }`}
                >
                  {n === 25 ? 'Bull' : n}
                </button>
              )
            })}
          </div>
        </div>

        <button
          onClick={handleStart}
          disabled={numbers.length === 0}
          className="bg-ink text-bg py-5 font-cond text-xl font-bold tracking-label uppercase active:opacity-80 active:scale-[0.98] transition-all duration-100 w-full disabled:opacity-30 border-none cursor-pointer"
        >
          Throw first dart
        </button>
      </div>
      </div>
    </div>
  )
}
