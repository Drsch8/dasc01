import { create } from 'zustand'
import type { GameConfig, GameState, Screen, OverlayData } from '@/types/game'
import {
  createInitialGameState,
  processEnterScore,
  appendDigit,
  deleteDigit,
  toggleInputMode,
  resetLeg,
  undoLastTurn,
} from '@/lib/engine'
import { saveMatch } from '@/lib/save-match'
import { REM_SENTINEL } from '@/lib/constants'

interface GameStore extends GameState {
  screen: Screen
  overlay: OverlayData | null

  // Actions
  startGame: (config: GameConfig) => void
  appendDigit: (digit: string) => void
  deleteDigit: () => void
  toggleMode: () => void
  enterScore: () => void
  quickScore: (value: number) => void
  undo: () => void
  nextLeg: () => void
  newGame: () => void
  setScreen: (screen: Screen) => void
}

const DEFAULT_CONFIG: GameConfig = {
  p1: 'Player 1',
  p2: 'Player 2',
  startScore: 501,
  outRule: 'double',
  legsToWin: 1,
  setsToWin: 1,
}

const INITIAL_GAME = createInitialGameState(DEFAULT_CONFIG)

export const useGameStore = create<GameStore>((set, get) => ({
  // ── Initial state ──
  screen: 'setup',
  overlay: null,
  ...INITIAL_GAME,

  // ── Actions ──

  startGame: (config) => {
    set({ screen: 'game', overlay: null, ...createInitialGameState(config) })
  },

  appendDigit: (digit) => {
    set(s => appendDigit(gs(s), digit))
  },

  deleteDigit: () => {
    set(s => deleteDigit(gs(s)))
  },

  toggleMode: () => {
    set(s => toggleInputMode(gs(s)))
  },

  enterScore: () => {
    const outcome = processEnterScore(gs(get()))
    if (outcome.type === 'invalid') return

    if (outcome.type === 'leg-won') {
      const { state, winner, checkoutScore, setWon, matchWon } = outcome
      const winnerName = winner === 0 ? state.config.p1 : state.config.p2
      const legAvgRaw = get().dartsThrown[winner] > 0
        ? (get().totalScored[winner] / get().dartsThrown[winner] * 3).toFixed(1)
        : '—'

      const setsToWin = state.config.setsToWin
      const scoreSummary = setsToWin > 1
        ? `Sets ${state.sets[0]}–${state.sets[1]}  ·  Legs ${state.legs[0]}–${state.legs[1]}`
        : `Legs ${state.legs[0]}–${state.legs[1]}`

      const overlay: OverlayData = {
        label: matchWon ? 'Match Win!' : setWon ? 'Set Win!' : 'Checkout!',
        winner: winnerName,
        checkoutScore,
        legAvg: `Leg avg: ${legAvgRaw}`,
        scoreSummary,
        isMatchOver: matchWon,
      }

      set({ ...state, overlay })

      if (matchWon) {
        // Fire-and-forget — doesn't block the UI
        saveMatch({
          config: state.config,
          winner: winnerName,
          sets: state.sets,
          allStats: state.allStats,
        })
      }
    } else {
      set({ ...outcome.state })
    }
  },

  quickScore: (value) => {
    set(s => ({ ...s, inputStr: String(value) }))
    // auto-enter after a tick so display updates first
    setTimeout(() => get().enterScore(), 60)
  },

  undo: () => {
    set(s => ({ ...undoLastTurn(gs(s)) }))
  },

  nextLeg: () => {
    set(s => ({ ...resetLeg(gs(s)), overlay: null }))
  },

  newGame: () => {
    set({ screen: 'setup', overlay: null })
  },

  setScreen: (screen) => {
    set({ screen })
  },
}))

/** Extract pure GameState slice from store for engine functions */
function gs(s: GameStore): GameState {
  return {
    config: s.config,
    current: s.current,
    scores: s.scores,
    legs: s.legs,
    sets: s.sets,
    dartsThrown: s.dartsThrown,
    totalScored: s.totalScored,
    rounds: s.rounds,
    currentRound: s.currentRound,
    inputStr: s.inputStr,
    inputMode: s.inputMode,
    history: s.history,
    allStats: s.allStats,
  }
}
