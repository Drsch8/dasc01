import type { GameConfig, PlayerStats } from '@/types/game'

export interface MatchPayload {
  config: GameConfig
  winner: string
  sets: [number, number]
  allStats: Record<string, PlayerStats>
}

/**
 * Saves a completed match by POSTing to /api/save-match (server-side handler).
 * Keeps Supabase entirely off the client bundle.
 * Silently no-ops if the server isn't configured.
 */
export async function saveMatch(payload: MatchPayload): Promise<void> {
  try {
    await fetch('/api/save-match', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  } catch (err) {
    console.error('[saveMatch]', err)
  }
}
