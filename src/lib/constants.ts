import type { StartScore } from '@/types/game'

export const START_SCORES: StartScore[] = [301, 501, 701]

export const LEGS_OPTIONS = [1, 3, 5, 7]
export const SETS_OPTIONS = [1, 3, 5, 7]

/** Sentinel value in QUICK_SCORE_VALUES — triggers "remaining" mode toggle instead of entering a score */
export const REM_SENTINEL = -1

export const QUICK_SCORE_VALUES = [26, 41, 45, 60, 81, 85, 100, 121, 140, REM_SENTINEL, 180, 0]
export const QUICK_SCORE_LABELS = ['26', '41', '45', '60', '81', '85', '100', '121', '140', '→ rem', '180', 'Miss']
export const FKEY_LABELS = ['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12']
