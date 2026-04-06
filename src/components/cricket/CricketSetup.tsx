'use client'
import { useState } from 'react'

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
            <span className="font-display font-bold text-2xl">How to play Cricket</span>
            <button
              onClick={onClose}
              className="font-mono text-sm text-ink-light active:text-ink px-3 py-1.5 border border-rule active:border-ink transition-colors"
            >
              ✕ Close
            </button>
          </div>

          {CRICKET_HELP.map(section => (
            <div key={section.title}>
              <div className="text-2xs tracking-[0.12em] uppercase text-ink-light font-mono mb-3">
                {section.title}
              </div>
              <div className="bg-paper border border-rule divide-y divide-rule">
                {section.items.map(([key, desc]) => (
                  <div key={key} className="flex gap-4 px-4 py-3">
                    <span className="font-mono text-sm text-ink shrink-0 w-32">{key}</span>
                    <span className="text-sm text-ink-light">{desc}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <button
            onClick={onClose}
            className="w-full border border-rule py-3 font-mono text-sm text-ink-light active:border-ink active:text-ink transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  )
}
import Link from 'next/link'
import { useCricketStore } from '@/store/cricket-store'
import { CRICKET_ALL_NUMBERS } from '@/types/cricket'

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

  const input = 'w-full border border-rule bg-bg px-3 py-2 font-mono text-sm text-ink outline-none focus:border-ink'
  const fieldLabel = 'block text-2xs tracking-[0.12em] uppercase text-ink-light mb-2'

  return (
    <div className="min-h-screen bg-bg p-4 md:p-12">
      <div className="flex items-end justify-between mb-4 md:mb-12">
        <div className="flex items-end gap-5">
          <Link
            href="/"
            className="font-display font-black text-[clamp(3rem,8vw,5rem)] leading-[0.9] tracking-tight text-ink-faint active:text-ink transition-colors"
          >
            Darts
          </Link>
          <h1 className="font-display font-black text-[clamp(3rem,8vw,5rem)] leading-[0.9] tracking-tight">
            Cricket
          </h1>
        </div>
        <button
          onClick={() => setShowHelp(true)}
          className="font-mono text-sm text-ink-light active:text-ink border border-rule active:border-ink px-3 py-1.5 transition-colors mb-1"
        >
          ?
        </button>
      </div>

      {showHelp && <HelpOverlay onClose={() => setShowHelp(false)} />}

      <div className="bg-paper border border-rule w-full md:w-[380px] p-4 md:p-8 flex flex-col gap-3 md:gap-6">
        <div>
          <label className={fieldLabel}>Player 1</label>
          <input
            className={input}
            value={p1}
            onChange={e => setP1(e.target.value)}
            placeholder="Player 1"
          />
        </div>

        <div>
          <label className={fieldLabel}>Player 2</label>
          <input
            className={input}
            value={p2}
            onChange={e => setP2(e.target.value)}
            placeholder="Player 2"
            onKeyDown={e => e.key === 'Enter' && handleStart()}
          />
        </div>

        <div>
          <label className={fieldLabel}>Numbers in play</label>
          <div className="grid grid-cols-2 gap-2">
            {([[20, 19, 18, 17, 16, 15], [14, 13, 12, 11, 25]] as const).map((col, ci) => (
              <div key={ci} className="flex flex-col gap-2">
                {col.map(n => {
                  const active = numbers.includes(n)
                  return (
                    <button
                      key={n}
                      onClick={() => toggleNumber(n)}
                      className={`px-4 py-2 font-mono text-sm border transition-colors cursor-pointer
                        ${active
                          ? 'border-ink bg-ink text-bg'
                          : 'border-rule bg-bg text-ink-light active:border-ink active:text-ink'
                        }`}
                    >
                      {n === 25 ? 'Bull' : n}
                    </button>
                  )
                })}
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={handleStart}
          disabled={numbers.length === 0}
          className="bg-ink text-bg py-3 font-mono text-sm tracking-[0.06em] active:opacity-80 transition-opacity w-full disabled:opacity-30"
        >
          Start Game
        </button>
      </div>
    </div>
  )
}
