'use client'
import { useEffect } from 'react'
import { useKeyboard } from '@/hooks/use-keyboard'
import { GameHeader } from './GameHeader'
import { Scoreboard } from './Scoreboard'
import { LiveList } from './LiveList'
import { QuickScores } from './QuickScores'
import { Numpad } from './Numpad'
import { FinishDartPicker } from './FinishDartPicker'
import { WinnerPopup } from './WinnerPopup'
import { SetWonPopup } from './SetWonPopup'

export function GameScreen() {
  useKeyboard()

  useEffect(() => {
    window.scrollTo(0, 0)
    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'
    return () => {
      document.documentElement.style.overflow = ''
      document.body.style.overflow = ''
    }
  }, [])

  return (
    <div className="h-dvh bg-bg flex flex-col overflow-hidden">
      <GameHeader />

      {/* ── Desktop: centered column with scrollable LiveList ── */}
      <div className="hidden md:flex flex-1 min-h-0 justify-center overflow-hidden">
        <div className="w-full max-w-2xl bg-bg flex flex-col overflow-hidden border-x border-rule">
          <Scoreboard />
          <LiveList />
          <QuickScores />
        </div>
      </div>

      {/* ── Mobile: scoreboard → live scores (with integrated input) → shortkeys → numpad ── */}
      <div className="md:hidden flex-1 min-h-0 flex flex-col overflow-hidden bg-bg">
        <Scoreboard />
        <LiveList />
        <QuickScores />
        <Numpad />
      </div>

      <FinishDartPicker />
      <SetWonPopup />
      <WinnerPopup />
    </div>
  )
}
