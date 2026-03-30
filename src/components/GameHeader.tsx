'use client'
import Link from 'next/link'
import { useGameStore } from '@/store/game-store'
import { useSpeech } from '@/hooks/use-speech'

export function GameHeader() {
  const setScreen = useGameStore(s => s.setScreen)
  const undo = useGameStore(s => s.undo)
  const newGame = useGameStore(s => s.newGame)
  const { listening, supported, toggle } = useSpeech()

  const hdrBtn = 'border border-rule px-4 py-2 text-sm text-ink-light font-mono hover:border-ink hover:text-ink transition-colors cursor-pointer bg-transparent'

  return (
    <div className="flex items-center justify-between px-5 py-3 border-b border-rule bg-paper sticky top-0 z-20">
      <span className="font-display font-bold text-2xl tracking-tight">Darts</span>
      <div className="flex gap-2">
        <Link href="/leaderboard" className={hdrBtn}>Board</Link>
        <button className={hdrBtn} onClick={() => setScreen('stats')}>Stats</button>
        {supported && (
          <button
            onClick={toggle}
            className={`border px-4 py-2 text-sm font-mono transition-colors cursor-pointer bg-transparent ${
              listening
                ? 'border-finish text-finish animate-pulse'
                : 'border-rule text-ink-light hover:border-ink hover:text-ink'
            }`}
          >
            {listening ? '⏺ listening…' : '🎙'}
          </button>
        )}
        <button className={hdrBtn} onClick={undo}>Undo</button>
        <button className={hdrBtn} onClick={newGame}>New</button>
      </div>
    </div>
  )
}
