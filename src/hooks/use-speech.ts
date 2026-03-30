'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { useGameStore } from '@/store/game-store'

function parseScore(transcript: string): number | null {
  const t = transcript.trim().toLowerCase().replace(/[.,!?]/g, '')

  // Direct digit match (speech API often returns digits)
  const numMatch = t.match(/\b(\d{1,3})\b/)
  if (numMatch) {
    const n = parseInt(numMatch[1])
    if (n >= 0 && n <= 180) return n
  }

  // Common spoken forms
  const exact: Record<string, number> = {
    'zero': 0, 'oh': 0, 'miss': 0, 'bust': 0,
    'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
    'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
    'eleven': 11, 'twelve': 12, 'thirteen': 13, 'fourteen': 14, 'fifteen': 15,
    'sixteen': 16, 'seventeen': 17, 'eighteen': 18, 'nineteen': 19,
    'twenty': 20, 'thirty': 30, 'forty': 40, 'fifty': 50,
    'sixty': 60, 'seventy': 70, 'eighty': 80, 'ninety': 90,
    'one hundred': 100, 'a hundred': 100,
    'one oh one': 101, 'one and one': 101,
    'one twenty': 120, 'one hundred twenty': 120, 'one hundred and twenty': 120,
    'one forty': 140, 'one hundred forty': 140, 'one hundred and forty': 140,
    'one sixty': 160, 'one hundred sixty': 160, 'one hundred and sixty': 160,
    'one eighty': 180, 'one hundred eighty': 180, 'one hundred and eighty': 180,
    'maximum': 180, 'max': 180,
  }
  if (exact[t] !== undefined) return exact[t]

  // "twenty six" style (tens + ones)
  const tens: Record<string, number> = {
    'twenty': 20, 'thirty': 30, 'forty': 40, 'fifty': 50,
    'sixty': 60, 'seventy': 70, 'eighty': 80, 'ninety': 90,
  }
  const ones: Record<string, number> = {
    'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
    'six': 6, 'seven': 7, 'eight': 8, 'nine': 9,
  }
  for (const [tw, tv] of Object.entries(tens)) {
    for (const [ow, ov] of Object.entries(ones)) {
      if (t === `${tw} ${ow}` || t === `${tw}-${ow}`) return tv + ov
    }
  }

  return null
}

// SpeechRecognition is not in all TS DOM libs — define locally
interface SpeechRec extends EventTarget {
  lang: string
  continuous: boolean
  interimResults: boolean
  start(): void
  stop(): void
  abort(): void
  onresult: ((e: { results: { [i: number]: { [i: number]: { transcript: string } } } }) => void) | null
  onend: (() => void) | null
  onerror: (() => void) | null
}

export function useSpeech() {
  const [supported, setSupported] = useState(false)
  const [muted, setMuted] = useState(true)
  const recRef = useRef<SpeechRec | null>(null)
  const mutedRef = useRef(false)
  const quickScoreRef = useRef(useGameStore.getState().quickScore)

  useEffect(() => {
    return useGameStore.subscribe(s => { quickScoreRef.current = s.quickScore })
  }, [])

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any
    const SR: (new () => SpeechRec) | undefined = w.SpeechRecognition ?? w.webkitSpeechRecognition
    if (!SR) return
    setSupported(true)

    const rec = new SR()
    rec.lang = 'en-US'
    rec.continuous = false  // more reliable cross-browser; we auto-restart on end
    rec.interimResults = false

    const tryStart = () => {
      if (mutedRef.current) return
      try { rec.start() } catch { /* already running */ }
    }

    rec.onresult = (e) => {
      const transcript = e.results[0][0].transcript
      const score = parseScore(transcript)
      if (score !== null) quickScoreRef.current(score)
    }
    rec.onend = () => {
      // auto-restart unless muted
      setTimeout(tryStart, 150)
    }
    rec.onerror = () => {
      setTimeout(tryStart, 500)
    }

    recRef.current = rec
    // don't auto-start — user must tap mic button

    return () => { rec.abort() }
  }, [])

  const toggleMute = useCallback(() => {
    setMuted(prev => {
      const next = !prev
      mutedRef.current = next
      if (next) {
        recRef.current?.abort()
      } else {
        try { recRef.current?.start() } catch { /* ignore */ }
      }
      return next
    })
  }, [])

  return { supported, muted, toggleMute }
}
