'use client'
import { useEffect } from 'react'
import { useGameStore } from '@/store/game-store'
import { QUICK_SCORE_VALUES, FKEY_LABELS } from '@/lib/constants'

export function useKeyboard() {
  const appendDigit = useGameStore(s => s.appendDigit)
  const deleteDigit = useGameStore(s => s.deleteDigit)
  const enterScore = useGameStore(s => s.enterScore)
  const quickScore = useGameStore(s => s.quickScore)
  const overlay = useGameStore(s => s.overlay)
  const nextLeg = useGameStore(s => s.nextLeg)

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      // If overlay is open, only handle Enter/Space
      if (overlay) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          if (!overlay.isMatchOver) nextLeg()
        }
        return
      }

      const fIdx = FKEY_LABELS.indexOf(e.key)
      if (fIdx >= 0) {
        e.preventDefault()
        quickScore(QUICK_SCORE_VALUES[fIdx])
        return
      }
      if (e.key >= '0' && e.key <= '9') { appendDigit(e.key); return }
      if (e.key === 'Backspace') { e.preventDefault(); deleteDigit(); return }
      if (e.key === 'Enter') { e.preventDefault(); enterScore(); return }
    }

    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [overlay, appendDigit, deleteDigit, enterScore, quickScore, nextLeg])
}
