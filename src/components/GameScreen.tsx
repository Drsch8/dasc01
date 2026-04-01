'use client'
import { useKeyboard } from '@/hooks/use-keyboard'
import { GameHeader } from './GameHeader'
import { Scoreboard } from './Scoreboard'
import { CheckoutHint } from './CheckoutHint'
import { LiveList } from './LiveList'
import { QuickScores } from './QuickScores'
import { Numpad } from './Numpad'
import { FinishDartPicker } from './FinishDartPicker'

export function GameScreen() {
  useKeyboard()

  return (
    <div className="h-dvh bg-bg flex flex-col overflow-hidden">
      <GameHeader />

      {/* ── Desktop: centered column with scrollable LiveList ── */}
      <div className="hidden md:flex flex-1 min-h-0 justify-center overflow-hidden">
        <div className="w-full max-w-2xl bg-paper flex flex-col overflow-hidden border-x border-rule">
          <Scoreboard />
          <CheckoutHint />
          <LiveList />
          <QuickScores />
        </div>
      </div>

      {/* ── Mobile: scoreboard → live scores (with integrated input) → shortkeys → numpad ── */}
      <div className="md:hidden flex-1 min-h-0 flex flex-col overflow-hidden bg-paper">
        <Scoreboard />
        <LiveList />
        <QuickScores />
        <Numpad />
      </div>

      <FinishDartPicker />
    </div>
  )
}
