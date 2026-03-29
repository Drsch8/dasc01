'use client'
import Link from 'next/link'
import { useGameStore } from '@/store/game-store'

export function GameHeader() {
  const setScreen = useGameStore(s => s.setScreen)
  const undo = useGameStore(s => s.undo)
  const newGame = useGameStore(s => s.newGame)

  const hdrBtn = 'border border-rule px-3 py-1.5 text-xs text-ink-light font-mono hover:border-ink hover:text-ink transition-colors cursor-pointer bg-transparent'

  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-rule bg-paper sticky top-0 z-10">
      <span className="font-display font-bold text-lg tracking-tight">Darts</span>
      <div className="flex gap-2">
        <Link href="/leaderboard" className={hdrBtn}>Board</Link>
        <button className={hdrBtn} onClick={() => setScreen('stats')}>Stats</button>
        <button className={hdrBtn} onClick={undo}>Undo</button>
        <button className={hdrBtn} onClick={newGame}>New</button>
      </div>
    </div>
  )
}
