export type OutRule = 'double' | 'single'
export type InputMode = 'score' | 'remaining'
export type Screen = 'setup' | 'game' | 'stats'
export type StartScore = 301 | 501 | 701

export interface GameConfig {
  p1: string
  p2: string
  startScore: StartScore
  outRule: OutRule
  legsToWin: number
  setsToWin: number
}

export interface PlayerStats {
  legs: number
  darts: number
  scored: number
  checkouts: number
  attempts: number
  tons: number    // 100–139
  ton40: number   // 140–179
  ton80: number   // 180
  first9scored: number
  first9darts: number
}

export interface RoundEntry {
  score: number
  remain: number
  bust?: boolean
}

export interface Round {
  p0: RoundEntry | null
  p1: RoundEntry | null
}

export interface LegHistory {
  winner: string
  checkoutScore: number
  p1avg: string
  p2avg: string
  legsAfter: [number, number]
  setsAfter: [number, number]
}

export interface OverlayData {
  label: string
  winner: string
  checkoutScore: number
  legAvg: string
  scoreSummary: string
  isMatchOver: boolean
}

/** Pure game state — no UI concerns. Passed to engine functions. */
export interface GameState {
  config: GameConfig
  current: 0 | 1
  scores: [number, number]
  legs: [number, number]
  sets: [number, number]
  dartsThrown: [number, number]
  totalScored: [number, number]
  rounds: Round[]
  currentRound: Round
  inputStr: string
  inputMode: InputMode
  history: LegHistory[]
  allStats: Record<string, PlayerStats>
}
