'use client'
import { create } from 'zustand'
import type { CricketConfig, CricketSnapshot } from '@/types/cricket'

interface CricketStore extends CricketSnapshot {
  screen: 'setup' | 'game'
  config: CricketConfig
  history: CricketSnapshot[]

  startGame: (config: CricketConfig) => void
  addMark: (num: number, multiplier?: 1 | 2 | 3) => void
  endTurn: () => void
  undo: () => void
  newGame: () => void
}

function initMarks(numbers: number[]): Record<number, [number, number]> {
  return Object.fromEntries(numbers.map(n => [n, [0, 0]]))
}

function checkWinner(
  numbers: number[],
  marks: Record<number, [number, number]>,
  scores: [number, number],
): 0 | 1 | null {
  for (const p of [0, 1] as const) {
    const allClosed = numbers.every(n => marks[n][p] >= 3)
    if (allClosed && scores[p] >= scores[p === 0 ? 1 : 0]) return p
  }
  return null
}

function snap(s: CricketStore): CricketSnapshot {
  return { marks: s.marks, scores: s.scores, current: s.current, dartsThisRound: s.dartsThisRound, winner: s.winner }
}

const BLANK: CricketSnapshot = {
  marks: {}, scores: [0, 0], current: 0, dartsThisRound: 0, winner: null,
}

export const useCricketStore = create<CricketStore>((set, get) => ({
  screen: 'setup',
  config: { p1: '', p2: '', numbers: [20, 19, 18, 17, 16, 15, 25] },
  history: [],
  ...BLANK,

  startGame: (config) => {
    set({
      screen: 'game',
      config,
      history: [],
      marks: initMarks(config.numbers),
      scores: [0, 0],
      current: 0,
      dartsThisRound: 0,
      winner: null,
    })
  },

  addMark: (num, multiplier = 1) => {
    const s = get()
    if (s.winner !== null) return
    const opp: 0 | 1 = s.current === 0 ? 1 : 0

    let curMarks = s.marks[num][s.current]
    const oppMarks = s.marks[num][opp]
    const newScores: [number, number] = [s.scores[0], s.scores[1]]
    const pointValue = num === 25 ? 25 : num

    // Apply multiplier marks one at a time so scoring logic is correct
    for (let i = 0; i < multiplier; i++) {
      if (curMarks >= 3 && oppMarks < 3) {
        newScores[s.current] += pointValue
      }
      curMarks++
    }

    const newPair: [number, number] = s.current === 0
      ? [curMarks, s.marks[num][1]]
      : [s.marks[num][0], curMarks]
    const newMarks = { ...s.marks, [num]: newPair }

    const newDarts = s.dartsThisRound + 1
    const winner = checkWinner(s.config.numbers, newMarks, newScores)

    set({
      marks: newMarks,
      scores: newScores,
      dartsThisRound: newDarts,
      winner,
      history: [...s.history, snap(s)],
    })
  },

  endTurn: () => {
    const s = get()
    if (s.winner !== null) return
    const next: 0 | 1 = s.current === 0 ? 1 : 0
    set({ current: next, dartsThisRound: 0, history: [...s.history, snap(s)] })
  },

  undo: () => {
    const { history } = get()
    if (history.length === 0) return
    const prev = history[history.length - 1]
    set({ ...prev, history: history.slice(0, -1) })
  },

  newGame: () => {
    set({ screen: 'setup', history: [], ...BLANK })
  },
}))
