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
      ['Mic', 'Tap the mic icon to enable. Say the score — e.g. "sixty", "one forty", "max". Tap again to mute.'],
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
            <span className="font-num text-2xl tracking-[0.02em] uppercase">How to use</span>
            <button
              onClick={onClose}
              className="font-cond text-[13px] font-semibold tracking-caps uppercase text-ink-light active:text-ink px-3 py-1.5 border border-rule-strong active:border-ink transition-colors"
            >
              ✕ Close
            </button>
          </div>

          {HELP_SECTIONS.map(section => (
            <div key={section.title}>
              <div className="font-cond text-[11px] font-semibold tracking-label uppercase text-ink-faint mb-2.5">
                {section.title}
              </div>
              <div className="bg-paper divide-y divide-rule">
                {section.items.map(([key, desc]) => (
                  <div key={key} className="flex gap-4 px-4 py-3">
                    <span className="font-cond text-[15px] font-semibold tracking-[0.04em] uppercase text-ink shrink-0 w-28">{key}</span>
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
    window.scrollTo(0, 0)
  }

  const input = 'w-full bg-paper px-3 py-2.5 font-cond text-lg tracking-[0.06em] uppercase text-ink placeholder:text-ink-faint placeholder:normal-case outline-none border-none focus:bg-key'
  const sectionLabel = 'block font-cond text-[11px] font-semibold tracking-label uppercase text-ink-faint mb-2.5'
  const fieldLabel = 'block font-cond text-xs tracking-[0.14em] uppercase text-ink-light mb-1.5'

  return (
    <div className="h-dvh flex flex-col bg-bg">
      <div className="shrink-0 flex items-end justify-between px-4 pt-6 pb-4 md:px-12 md:pt-10 md:pb-6 border-b border-rule">
        <div className="flex items-end gap-3">
          <h1 className="font-num text-[clamp(2.5rem,8vw,4rem)] leading-[0.9] tracking-[0.01em]">
            501
          </h1>
          <Link
            href="/cricket"
            className="font-cond text-[15px] font-semibold tracking-label uppercase text-ink-light active:text-ink transition-colors pb-1.5"
          >
            Cricket
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
      <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-start">

        {/* ── Config form ── */}
        <div className="w-full md:w-[420px] md:flex-shrink-0 flex flex-col gap-6">

          <div>
            <span className={sectionLabel}>Players</span>
            <div className="flex flex-col gap-3">
              <PlayerNameInput label="Player 1" value={p1} onChange={setP1} inputClassName={input} accent="var(--accent)" />
              {trainingMode === 'match' && (
                <PlayerNameInput label="Player 2" value={p2} onChange={setP2} inputClassName={input} onEnter={handleStart} accent="var(--p2)" />
              )}
            </div>
          </div>

          <div>
            <span className={sectionLabel}>Format</span>
            <div className="flex flex-col gap-3.5">
              <div>
                <label className={fieldLabel}>Start</label>
                <PillGroup
                  numeric
                  options={START_SCORES.map(s => ({ label: String(s), value: s }))}
                  value={startScore}
                  onChange={setStartScore}
                />
              </div>

              <div>
                <label className={fieldLabel}>Out</label>
                <PillGroup
                  options={[
                    { label: 'Double', value: 'double' as OutRule },
                    { label: 'Single', value: 'single' as OutRule },
                  ]}
                  value={outRule}
                  onChange={setOutRule}
                />
              </div>

              <div className="flex gap-2">
                <div className="flex-1">
                  <label className={fieldLabel}>Legs</label>
                  <PillGroup
                    numeric
                    options={LEGS_OPTIONS.map(n => ({ label: String(n), value: n }))}
                    value={legsToWin}
                    onChange={setLegsToWin}
                  />
                </div>
                <div className="flex-1">
                  <label className={fieldLabel}>Sets</label>
                  <PillGroup
                    numeric
                    options={SETS_OPTIONS.map(n => ({ label: String(n), value: n }))}
                    value={setsToWin}
                    onChange={setSetsToWin}
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <span className={sectionLabel}>Mode</span>
            <PillGroup
              options={[
                { label: 'Match', value: 'match' },
                { label: 'Training', value: 'training' },
              ]}
              value={trainingMode}
              onChange={v => setTrainingMode(v as 'match' | 'training')}
            />
          </div>

          <button
            onClick={handleStart}
            className="bg-ink text-bg py-5 font-cond text-xl font-bold tracking-label uppercase active:opacity-80 active:scale-[0.98] transition-all duration-100 w-full border-none cursor-pointer"
          >
            Throw first dart
          </button>
        </div>

        {/* ── Career stats ── */}
        <div className="w-full md:flex-1">
          <SetupStats />
        </div>

      </div>
      </div>
    </div>
  )
}
