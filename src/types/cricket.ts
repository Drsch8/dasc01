export const CRICKET_ALL_NUMBERS = [20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10, 25] as const

export interface CricketConfig {
  p1: string
  p2: string
  numbers: number[] // 25 = Bull; should be sorted descending with 25 last
}

export interface CricketSnapshot {
  marks: Record<number, [number, number]> // [p1marks, p2marks]
  scores: [number, number]
  current: 0 | 1
  dartsThisRound: number
  winner: 0 | 1 | null
}
