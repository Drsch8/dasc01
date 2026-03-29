import type { GameConfig, GameState, PlayerStats, Round, LegHistory } from '@/types/game'
import { CHECKOUTS, BOGEY_NUMBERS } from './checkouts'

// ── Helpers ──────────────────────────────────────────────────────────────────

export function createDefaultStats(): PlayerStats {
  return { legs: 0, darts: 0, scored: 0, checkouts: 0, attempts: 0, tons: 0, ton40: 0, ton80: 0, first9scored: 0, first9darts: 0 }
}

export function createInitialGameState(config: GameConfig): GameState {
  return {
    config,
    current: 0,
    scores: [config.startScore, config.startScore],
    legs: [0, 0],
    sets: [0, 0],
    dartsThrown: [0, 0],
    totalScored: [0, 0],
    rounds: [],
    currentRound: { p0: null, p1: null },
    inputStr: '',
    inputMode: 'score',
    history: [],
    allStats: {
      [config.p1]: createDefaultStats(),
      [config.p2]: createDefaultStats(),
    },
  }
}

// ── Input validation ──────────────────────────────────────────────────────────

export interface InputValidation {
  valid: boolean
  score: number
  remaining: number
}

export function validateInput(
  inputStr: string,
  inputMode: 'score' | 'remaining',
  currentScore: number,
  outRule: 'double' | 'single',
): InputValidation {
  if (!inputStr) return { valid: true, score: 0, remaining: currentScore }

  const val = parseInt(inputStr)
  if (isNaN(val)) return { valid: false, score: 0, remaining: currentScore }

  let score: number, remaining: number
  if (inputMode === 'score') {
    score = val
    remaining = currentScore - val
  } else {
    remaining = val
    score = currentScore - val
  }

  if (score > 180 || score < 0 || remaining < 0) return { valid: false, score, remaining }
  if (outRule === 'double' && remaining === 1) return { valid: false, score, remaining }

  return { valid: true, score, remaining }
}

// ── Input manipulation ────────────────────────────────────────────────────────

export function appendDigit(state: GameState, digit: string): GameState {
  if (state.inputStr.length >= 3) return state
  return { ...state, inputStr: state.inputStr + digit }
}

export function deleteDigit(state: GameState): GameState {
  return { ...state, inputStr: state.inputStr.slice(0, -1) }
}

export function toggleInputMode(state: GameState): GameState {
  return {
    ...state,
    inputMode: state.inputMode === 'score' ? 'remaining' : 'score',
    inputStr: '',
  }
}

// ── Turn processing ───────────────────────────────────────────────────────────

export type ScoreOutcome =
  | { type: 'invalid' }
  | { type: 'ok'; state: GameState }
  | { type: 'leg-won'; state: GameState; winner: 0 | 1; checkoutScore: number; setWon: boolean; matchWon: boolean }

export function processEnterScore(state: GameState): ScoreOutcome {
  const v = validateInput(state.inputStr, state.inputMode, state.scores[state.current], state.config.outRule)
  if (!v.valid || !state.inputStr) return { type: 'invalid' }

  const p = state.current
  const { score, remaining } = v
  const pName = p === 0 ? state.config.p1 : state.config.p2

  const wasAttempt = state.scores[p] <= 170 &&
    !BOGEY_NUMBERS.has(state.scores[p]) &&
    !!CHECKOUTS[state.scores[p]]

  // Update stats
  const prevDarts = state.dartsThrown[p]
  const newDartsThrown = tuple2(state.dartsThrown, p, prevDarts + 3)
  const newTotalScored = tuple2(state.totalScored, p, state.totalScored[p] + score)
  const newScores = tuple2(state.scores, p, remaining)

  const st = { ...state.allStats[pName] }
  st.darts += 3
  st.scored += score
  if (prevDarts < 9) {
    const dartsToCount = Math.min(3, 9 - prevDarts)
    st.first9scored += Math.round(score * dartsToCount / 3)
    st.first9darts += dartsToCount
  }
  if (score >= 180) st.ton80++
  else if (score >= 140) st.ton40++
  else if (score >= 100) st.tons++
  if (wasAttempt) st.attempts++

  const newCurrentRound: Round = {
    ...state.currentRound,
    [p === 0 ? 'p0' : 'p1']: { score, remain: remaining },
  }

  let newState: GameState = {
    ...state,
    scores: newScores,
    dartsThrown: newDartsThrown,
    totalScored: newTotalScored,
    currentRound: newCurrentRound,
    allStats: { ...state.allStats, [pName]: st },
    inputStr: '',
  }

  if (remaining === 0) {
    // Checkout!
    const st2 = { ...newState.allStats[pName] }
    if (wasAttempt) st2.checkouts++
    st2.legs++
    newState = { ...newState, allStats: { ...newState.allStats, [pName]: st2 } }

    return processFinishLeg(newState, p, score)
  }

  return { type: 'ok', state: processFinishTurn(newState, p) }
}

function processFinishTurn(state: GameState, p: 0 | 1): GameState {
  if (p === 0) {
    return { ...state, current: 1 }
  }
  // P2 just went — log the round
  const newRounds = [...state.rounds, { ...state.currentRound }]
  return {
    ...state,
    rounds: newRounds,
    currentRound: { p0: null, p1: null },
    current: 0,
  }
}

function processFinishLeg(
  state: GameState,
  winner: 0 | 1,
  checkoutScore: number,
): { type: 'leg-won'; state: GameState; winner: 0 | 1; checkoutScore: number; setWon: boolean; matchWon: boolean } {
  const newLegs = tuple2(state.legs, winner, state.legs[winner] + 1) as [number, number]
  let newSets = [...state.sets] as [number, number]
  let setWon = false
  let matchWon = false
  let legsForHistory = newLegs

  if (newLegs[winner] >= state.config.legsToWin) {
    if (state.config.setsToWin > 1) {
      setWon = true
      newSets = tuple2(newSets, winner, newSets[winner] + 1) as [number, number]
      if (newSets[winner] >= state.config.setsToWin) matchWon = true
      legsForHistory = [0, 0]
    } else {
      matchWon = true
    }
  }

  const p1avg = state.dartsThrown[0] > 0 ? (state.totalScored[0] / state.dartsThrown[0] * 3).toFixed(1) : '—'
  const p2avg = state.dartsThrown[1] > 0 ? (state.totalScored[1] / state.dartsThrown[1] * 3).toFixed(1) : '—'

  const entry: LegHistory = {
    winner: winner === 0 ? state.config.p1 : state.config.p2,
    checkoutScore,
    p1avg,
    p2avg,
    legsAfter: [...legsForHistory] as [number, number],
    setsAfter: [...newSets] as [number, number],
  }

  const finalLegs = setWon ? ([0, 0] as [number, number]) : newLegs

  return {
    type: 'leg-won',
    state: {
      ...state,
      legs: finalLegs,
      sets: newSets,
      history: [...state.history, entry],
    },
    winner,
    checkoutScore,
    setWon,
    matchWon,
  }
}

// ── Next leg / reset ──────────────────────────────────────────────────────────

export function resetLeg(state: GameState): GameState {
  const newAllStats = { ...state.allStats }
  for (const name of [state.config.p1, state.config.p2]) {
    if (newAllStats[name]) {
      newAllStats[name] = { ...newAllStats[name], first9scored: 0, first9darts: 0 }
    }
  }
  return {
    ...state,
    scores: [state.config.startScore, state.config.startScore],
    rounds: [],
    currentRound: { p0: null, p1: null },
    dartsThrown: [0, 0],
    totalScored: [0, 0],
    inputStr: '',
    inputMode: 'score',
    current: state.current === 0 ? 1 : 0, // alternate starter
    allStats: newAllStats,
  }
}

// ── Undo ──────────────────────────────────────────────────────────────────────

export function undoLastTurn(state: GameState): GameState {
  // Case 1: P1 has gone, P2 hasn't yet
  if (state.currentRound.p0 !== null && state.currentRound.p1 === null && state.current === 1) {
    const p0data = state.currentRound.p0
    const score = p0data.score ?? 0
    const pName = state.config.p1
    const st = { ...state.allStats[pName] }
    st.darts -= 3
    st.scored -= score

    return {
      ...state,
      scores: tuple2(state.scores, 0, p0data.remain + score),
      dartsThrown: tuple2(state.dartsThrown, 0, state.dartsThrown[0] - 3),
      totalScored: tuple2(state.totalScored, 0, state.totalScored[0] - score),
      allStats: { ...state.allStats, [pName]: st },
      currentRound: { p0: null, p1: null },
      current: 0,
      inputStr: '',
    }
  }

  // Case 2: Undo last full round
  if (state.rounds.length === 0) return state

  const newRounds = [...state.rounds]
  const last = newRounds.pop()!

  let newScores = [...state.scores] as [number, number]
  let newDartsThrown = [...state.dartsThrown] as [number, number]
  let newTotalScored = [...state.totalScored] as [number, number]
  const newAllStats = { ...state.allStats }

  if (last.p1) {
    const d = last.p1
    const s = d.score ?? 0
    newScores[1] = d.remain + s
    newDartsThrown[1] -= 3
    newTotalScored[1] -= s
    const st = { ...newAllStats[state.config.p2] }
    st.darts -= 3
    st.scored -= s
    newAllStats[state.config.p2] = st
  }
  if (last.p0) {
    const d = last.p0
    const s = d.score ?? 0
    newScores[0] = d.remain + s
    newDartsThrown[0] -= 3
    newTotalScored[0] -= s
    const st = { ...newAllStats[state.config.p1] }
    st.darts -= 3
    st.scored -= s
    newAllStats[state.config.p1] = st
  }

  return {
    ...state,
    scores: newScores,
    dartsThrown: newDartsThrown,
    totalScored: newTotalScored,
    allStats: newAllStats,
    rounds: newRounds,
    currentRound: { p0: null, p1: null },
    current: 0,
    inputStr: '',
  }
}

// ── Stats helpers ─────────────────────────────────────────────────────────────

export function computeAvg(stats: PlayerStats): string {
  return stats.darts > 0 ? (stats.scored / stats.darts * 3).toFixed(1) : '—'
}

export function computeFirst9Avg(stats: PlayerStats): string {
  if (stats.first9darts === 0) return '—'
  const avg = (stats.first9scored / stats.first9darts * 3).toFixed(1)
  return stats.first9darts < 9 ? `${avg}*` : avg
}

export function computeCheckoutPct(stats: PlayerStats): string {
  if (stats.attempts === 0) return '—'
  return `${(stats.checkouts / stats.attempts * 100).toFixed(0)}%`
}

// ── Utils ─────────────────────────────────────────────────────────────────────

function tuple2<T>(arr: [T, T], idx: 0 | 1, val: T): [T, T] {
  const next = [...arr] as [T, T]
  next[idx] = val
  return next
}
