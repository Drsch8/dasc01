'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { PillGroup } from './PillGroup'
import { PlayerNameInput } from './PlayerNameInput'
import { SetupStats } from './SetupStats'
import { useGameStore } from '@/store/game-store'
import type { GameConfig, OutRule, StartScore } from '@/types/game'
import { START_SCORES, LEGS_OPTIONS, SETS_OPTIONS } from '@/lib/constants'

const HELP_SECTIONS = [
  {
    title: 'Entering scores',
    items: [
      ['Numpad / keyboard', 'Type the 3-dart score, press Enter to confirm.'],
      ['Quick buttons', 'Tap a preset value — it registers immediately.'],
      ['0', 'Records a miss (zero score).'],
      ['Rest', 'Interprets your typed number as the remaining score instead of what was scored.'],
      ['Finish', 'Auto-enters your full remaining score as a checkout.'],
    ],
  },
  {
    title: 'During a leg',
    items: [
      ['Undo', 'Removes the last single player throw.'],
      ['Finish dart', 'After a checkout, select which dart finished — impossible darts are greyed out.'],
      ['Scores', 'Opens the round-by-round score list (mobile).'],
    ],
  },
  {
    title: 'Voice (desktop / Chrome)',
    items: [
      ['🎙', 'Tap the mic icon to enable. Say the score — e.g. "sixty", "one forty", "max". Tap again to mute.'],
    ],
  },
  {
    title: 'Modes',
    items: [
      ['Match', 'Two players alternate throws. Career stats are saved after the match.'],
      ['Training', 'Solo practice — only one player, no career record saved.'],
    ],
  },
]

function HelpOverlay({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col" onClick={onClose}>
      {/* title area stays visible — overlay starts below it */}
      <div className="shrink-0" style={{ height: 'clamp(4rem,10vw,6rem)', marginTop: '1.5rem' }} />
      <div
        className="flex-1 overflow-y-auto bg-bg/95 backdrop-blur-sm p-6 md:p-12"
        onClick={e => e.stopPropagation()}
      >
        <div className="max-w-2xl mx-auto flex flex-col gap-8">
          <div className="flex items-center justify-between">
            <span className="font-display font-bold text-2xl">How to use</span>
            <button
              onClick={onClose}
              className="font-mono text-sm text-ink-light active:text-ink px-3 py-1.5 border border-rule active:border-ink transition-colors"
            >
              ✕ Close
            </button>
          </div>

          {HELP_SECTIONS.map(section => (
            <div key={section.title}>
              <div className="text-2xs tracking-[0.12em] uppercase text-ink-light font-mono mb-3">
                {section.title}
              </div>
              <div className="bg-paper border border-rule divide-y divide-rule">
                {section.items.map(([key, desc]) => (
                  <div key={key} className="flex gap-4 px-4 py-3">
                    <span className="font-mono text-sm text-ink shrink-0 w-24">{key}</span>
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

export function SetupScreen() {
  const startGame = useGameStore(s => s.startGame)
  const [trainingMode, setTrainingMode] = useState<'match' | 'training'>('match')
  const [p1, setP1] = useState('')
  const [p2, setP2] = useState('')
  const [startScore, setStartScore] = useState<StartScore>(501)
  const [outRule, setOutRule] = useState<OutRule>('double')
  const [legsToWin, setLegsToWin] = useState(3)
  const [setsToWin, setSetsToWin] = useState(1)
  const [showHelp, setShowHelp] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem('help-seen-v2')) {
      setShowHelp(true)
      localStorage.setItem('help-seen-v2', '1')
    }
  }, [])

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
    <div className="min-h-screen bg-bg p-4 md:p-12">
      <div className="flex items-end justify-between mb-4 md:mb-12">
        <div className="flex items-end gap-5">
          <h1 className="font-display font-black text-[clamp(3rem,8vw,5rem)] leading-[0.9] tracking-tight">
            Darts
          </h1>
          <Link
            href="/cricket"
            className="font-display font-black text-[clamp(3rem,8vw,5rem)] leading-[0.9] tracking-tight text-ink-faint active:text-ink transition-colors"
          >
            Cricket
          </Link>
        </div>
        <button
          onClick={() => setShowHelp(true)}
          className="font-mono text-sm text-ink-light active:text-ink border border-rule active:border-ink px-3 py-1.5 transition-colors mb-1"
        >
          ?
        </button>
      </div>

      {showHelp && <HelpOverlay onClose={() => setShowHelp(false)} />}

      <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-start">

        {/* ── Config form ── */}
        <div className="bg-paper border border-rule w-full md:w-[380px] md:flex-shrink-0 p-4 md:p-8 flex flex-col gap-3 md:gap-6">
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
            className="bg-ink text-bg py-3 font-mono text-sm tracking-[0.06em] active:opacity-80 transition-opacity w-full"
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
