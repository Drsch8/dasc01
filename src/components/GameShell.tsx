'use client'
import { useGameStore } from '@/store/game-store'
import { SetupScreen } from './SetupScreen'
import { GameScreen } from './GameScreen'
import { StatsScreen } from './StatsScreen'

export function GameShell() {
  const screen = useGameStore(s => s.screen)

  if (screen === 'game') return <GameScreen />
  if (screen === 'stats') return <StatsScreen />
  return <SetupScreen />
}
