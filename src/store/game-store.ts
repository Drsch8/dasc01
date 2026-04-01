'use client'
import { create } from 'zustand'
import type { GameConfig, GameState, Screen, PendingCheckout } from '@/types/game'
import {
  createInitialGameState,
  processEnterScore,
  processCheckout,
  appendDigit,
  deleteDigit,
  toggleInputMode,
  resetLeg,
  undoLastTurn,
} from '@/lib/engine'
import { saveMatch } from '@/lib/save-match'
import { REM_SENTINEL, FINISH_SENTINEL } from '@/lib/constants'

interface GameStore extends GameState {
  screen: Screen
  pendingCheckout: PendingCheckout | null
  matchFinished: boolean

  startGame: (config: GameConfig) => void
  appendDigit: (digit: string) => void
  deleteDigit: () => void
  toggleMode: () => void
  enterScore: () => void
  quickScore: (value: number) => void
  confirmFinishDart: (darts: 1 | 2 | 3) => void
  undo: () => void
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
  pendingCheckout: null,
  matchFinished: false,
  ...INITIAL_GAME,

  // ── Actions ──

  startGame: (config) => {
    set({ screen: 'game', pendingCheckout: null, matchFinished: false, ...createInitialGameState(config) })
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
    if (outcome.type === 'pending-checkout') {
      set({ pendingCheckout: outcome.pending })
      return
    }
    // type === 'ok'
    set({ ...outcome.state })
  },

  quickScore: (value) => {
    if (value === REM_SENTINEL) {
      const state = gs(get())
      if (!state.inputStr) return
      const outcome = processEnterScore({ ...state, inputMode: 'remaining' })
      if (outcome.type === 'invalid') return
      if (outcome.type === 'pending-checkout') { set({ pendingCheckout: outcome.pending }); return }
      set({ ...outcome.state, inputMode: 'score' })
      return
    }
    if (value === FINISH_SENTINEL) {
      const state = gs(get())
      const remaining = state.scores[state.current]
      const outcome = processEnterScore({ ...state, inputStr: String(remaining), inputMode: 'score' })
      if (outcome.type === 'invalid') return
      if (outcome.type === 'pending-checkout') { set({ pendingCheckout: outcome.pending }); return }
      set({ ...outcome.state })
      return
    }
    // Regular preset score: process directly without flashing inputStr
    const outcome = processEnterScore({ ...gs(get()), inputStr: String(value), inputMode: 'score' })
    if (outcome.type === 'invalid') return
    if (outcome.type === 'pending-checkout') { set({ pendingCheckout: outcome.pending }); return }
    set({ ...outcome.state })
  },

  confirmFinishDart: (darts) => {
    const { pendingCheckout } = get()
    if (!pendingCheckout) return

    const outcome = processCheckout(pendingCheckout, darts)
    set({ pendingCheckout: null })

    const { state, winner, matchWon } = outcome

    if (matchWon) {
      if (!state.config.training) {
        const winnerName = winner === 0 ? state.config.p1 : state.config.p2
        saveMatch({
          config: state.config,
          winner: winnerName,
          sets: state.sets,
          allStats: state.allStats,
        })
      }
      set({ ...state, screen: 'stats', matchFinished: true })
    } else {
      // Auto-advance to next leg without any overlay
      set({ ...resetLeg(state) })
    }
  },

  undo: () => {
    // Cancel pending dart picker
    if (get().pendingCheckout) {
      set({ pendingCheckout: null })
      return
    }
    set(s => ({ ...undoLastTurn(gs(s)) }))
  },

  newGame: () => {
    set({ screen: 'setup', pendingCheckout: null })
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
