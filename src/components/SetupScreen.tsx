'use client'
import { useState } from 'react'
import { PillGroup } from './PillGroup'
import { useGameStore } from '@/store/game-store'
import type { GameConfig, OutRule, StartScore } from '@/types/game'
import { START_SCORES, LEGS_OPTIONS, SETS_OPTIONS } from '@/lib/constants'

export function SetupScreen() {
  const startGame = useGameStore(s => s.startGame)
  const [p1, setP1] = useState('Player 1')
  const [p2, setP2] = useState('Player 2')
  const [startScore, setStartScore] = useState<StartScore>(501)
  const [outRule, setOutRule] = useState<OutRule>('double')
  const [legsToWin, setLegsToWin] = useState(1)
  const [setsToWin, setSetsToWin] = useState(1)

  function handleStart() {
    const config: GameConfig = {
      p1: p1.trim() || 'Player 1',
      p2: p2.trim() || 'Player 2',
      startScore,
      outRule,
      legsToWin,
      setsToWin,
    }
    startGame(config)
  }

  const label = 'block text-2xs tracking-[0.12em] uppercase text-ink-light mb-2'
  const input = 'w-full border border-rule bg-bg px-3 py-2 font-mono text-sm text-ink outline-none focus:border-ink'

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 gap-8 bg-bg">
      <h1 className="font-display font-black text-[clamp(3rem,10vw,6rem)] leading-[0.9] tracking-tight text-center">
        Darts
      </h1>

      <div className="bg-paper border border-rule w-full max-w-md p-8 flex flex-col gap-6">
        <div>
          <label className={label}>Player 1</label>
          <input
            className={input}
            value={p1}
            onChange={e => setP1(e.target.value)}
            maxLength={20}
            onKeyDown={e => e.key === 'Enter' && handleStart()}
          />
        </div>

        <div>
          <label className={label}>Player 2</label>
          <input
            className={input}
            value={p2}
            onChange={e => setP2(e.target.value)}
            maxLength={20}
            onKeyDown={e => e.key === 'Enter' && handleStart()}
          />
        </div>

        <div>
          <label className={label}>Starting Score</label>
          <PillGroup
            options={START_SCORES.map(s => ({ label: String(s), value: s }))}
            value={startScore}
            onChange={setStartScore}
          />
        </div>

        <div>
          <label className={label}>Out Rule</label>
          <PillGroup
            options={[
              { label: 'Double out', value: 'double' as OutRule },
              { label: 'Single out', value: 'single' as OutRule },
            ]}
            value={outRule}
            onChange={setOutRule}
          />
        </div>

        <div>
          <label className={label}>Legs to win (per set)</label>
          <PillGroup
            options={LEGS_OPTIONS.map(n => ({ label: String(n), value: n }))}
            value={legsToWin}
            onChange={setLegsToWin}
          />
        </div>

        <div>
          <label className={label}>Sets to win</label>
          <PillGroup
            options={SETS_OPTIONS.map(n => ({ label: String(n), value: n }))}
            value={setsToWin}
            onChange={setSetsToWin}
          />
        </div>

        <button
          onClick={handleStart}
          className="bg-ink text-bg py-3 font-mono text-sm tracking-[0.06em] hover:opacity-80 transition-opacity w-full"
        >
          Start Game
        </button>
      </div>
    </div>
  )
}
