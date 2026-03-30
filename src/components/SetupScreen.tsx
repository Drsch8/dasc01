'use client'
import { useState } from 'react'
import { PillGroup } from './PillGroup'
import { PlayerNameInput } from './PlayerNameInput'
import { SetupStats } from './SetupStats'
import { useGameStore } from '@/store/game-store'
import type { GameConfig, OutRule, StartScore } from '@/types/game'
import { START_SCORES, LEGS_OPTIONS, SETS_OPTIONS } from '@/lib/constants'

export function SetupScreen() {
  const startGame = useGameStore(s => s.startGame)
  const [trainingMode, setTrainingMode] = useState<'match' | 'training'>('match')
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
      training: trainingMode === 'training',
    }
    startGame(config)
  }

  const input = 'w-full border border-rule bg-bg px-3 py-2 font-mono text-sm text-ink outline-none focus:border-ink'
  const fieldLabel = 'block text-2xs tracking-[0.12em] uppercase text-ink-light mb-2'

  return (
    <div className="min-h-screen bg-bg p-6 md:p-12">
      <h1 className="font-display font-black text-[clamp(3rem,8vw,5rem)] leading-[0.9] tracking-tight mb-8 md:mb-12">
        Darts
      </h1>

      <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-start">

        {/* ── Config form ── */}
        <div className="bg-paper border border-rule w-full md:w-[380px] md:flex-shrink-0 p-8 flex flex-col gap-6">
          <div>
            <label className={fieldLabel}>Mode</label>
            <PillGroup
              options={[
                { label: 'Match', value: 'match' },
                { label: 'Training', value: 'training' },
              ]}
              value={trainingMode}
              onChange={v => setTrainingMode(v as 'match' | 'training')}
            />
          </div>

          <PlayerNameInput label="Player 1" value={p1} onChange={setP1} inputClassName={input} />
          {trainingMode === 'match' && (
            <PlayerNameInput label="Player 2" value={p2} onChange={setP2} inputClassName={input} onEnter={handleStart} />
          )}

          <div>
            <label className={fieldLabel}>Starting Score</label>
            <PillGroup
              options={START_SCORES.map(s => ({ label: String(s), value: s }))}
              value={startScore}
              onChange={setStartScore}
            />
          </div>

          <div>
            <label className={fieldLabel}>Out Rule</label>
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
            <label className={fieldLabel}>Legs to win (per set)</label>
            <PillGroup
              options={LEGS_OPTIONS.map(n => ({ label: String(n), value: n }))}
              value={legsToWin}
              onChange={setLegsToWin}
            />
          </div>

          <div>
            <label className={fieldLabel}>Sets to win</label>
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

        {/* ── Career stats ── */}
        <div className="w-full md:flex-1">
          <SetupStats />
        </div>

      </div>
    </div>
  )
}
