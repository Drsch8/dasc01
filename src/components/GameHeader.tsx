'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useGameStore } from '@/store/game-store'
import { useSpeech } from '@/hooks/use-speech'

function MicIcon({ crossed }: { crossed?: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      {/* mic body */}
      <rect x="5.5" y="1" width="5" height="8" rx="2.5" />
      {/* stand + base */}
      <path d="M3 7.5a5 5 0 0 0 10 0" />
      <line x1="8" y1="12.5" x2="8" y2="15" />
      <line x1="5.5" y1="15" x2="10.5" y2="15" />
      {crossed && <line x1="2" y1="2" x2="14" y2="14" strokeWidth="1.5" />}
    </svg>
  )
}

/** "SET 1 · LEG 2 · BEST OF 5" — the broadcast strap line. */
function MatchMeta() {
  const config = useGameStore(s => s.config)
  const legs = useGameStore(s => s.legs)
  const sets = useGameStore(s => s.sets)

  if (config.training) return <>TRAINING &middot; {config.startScore}</>

  const parts: string[] = []
  if (config.setsToWin > 1) parts.push(`SET ${sets[0] + sets[1] + 1}`)
  parts.push(`LEG ${legs[0] + legs[1] + 1}`)
  parts.push(`FIRST TO ${config.legsToWin}`)
  parts.push(String(config.startScore))

  return <>{parts.join(' · ')}</>
}

export function GameHeader() {
  const setScreen = useGameStore(s => s.setScreen)
  const undo = useGameStore(s => s.undo)
  const newGame = useGameStore(s => s.newGame)
  const { supported, muted, toggleMute } = useSpeech()
  const [menuOpen, setMenuOpen] = useState(false)
  const [confirmNew, setConfirmNew] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  function handleNewGame() {
    setMenuOpen(false)
    setConfirmNew(true)
  }

  function confirmYes() {
    setConfirmNew(false)
    newGame()
  }

  // Close on outside click
  useEffect(() => {
    if (!menuOpen) return
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [menuOpen])

  const hdrBtn = 'border border-rule-strong px-3 py-1.5 font-cond text-[13px] font-semibold tracking-caps text-ink-light active:border-ink active:text-ink active:scale-[0.97] transition-all duration-100 cursor-pointer bg-transparent uppercase'

  const voiceBtn = supported ? (
    <button
      onClick={toggleMute}
      title={muted ? 'Unmute voice' : 'Mute voice'}
      className={`border px-3 py-1.5 flex items-center transition-colors cursor-pointer bg-transparent ${
        muted
          ? 'border-rule-strong text-ink-faint active:border-ink active:text-ink'
          : 'border-finish text-finish'
      }`}
    >
      <MicIcon crossed={muted} />
    </button>
  ) : null

  return (
    <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-rule bg-bg sticky top-0 z-20 shrink-0">
      {/* Desktop: wordmark + full button row */}
      <button
        onClick={handleNewGame}
        className="hidden md:block font-num text-2xl leading-none tracking-[0.02em] bg-transparent border-none cursor-pointer text-ink"
      >
        DARTS
      </button>

      <div className="hidden md:block font-cond text-xs font-semibold tracking-label text-ink-light truncate">
        <MatchMeta />
      </div>

      {confirmNew && (
        <div className="fixed inset-0 bg-bg/70 backdrop-blur-sm z-50 flex items-center justify-center" onClick={() => setConfirmNew(false)}>
          <div className="bg-paper border border-rule-strong p-8 text-center max-w-xs w-[90%] flex flex-col gap-6 relative" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setConfirmNew(false)}
              className="absolute top-3 right-3 text-ink-faint active:text-ink font-cond text-lg leading-none"
              aria-label="Cancel"
            >✕</button>
            <p className="font-num text-3xl tracking-[0.02em]">NEW GAME?</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setConfirmNew(false)}
                className="py-5 border border-rule-strong text-ink-light active:border-ink active:text-ink active:scale-[0.97] font-cond text-lg font-semibold tracking-caps transition-all duration-100 cursor-pointer"
              >
                NO
              </button>
              <button
                onClick={confirmYes}
                className="py-5 bg-accent text-ink active:opacity-80 active:scale-[0.97] font-cond text-lg font-bold tracking-caps transition-all duration-100 cursor-pointer border-none"
              >
                YES
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop: all buttons inline */}
      <div className="hidden md:flex gap-2">
        <Link href="/leaderboard" className={hdrBtn}>Board</Link>
        <button className={hdrBtn} onClick={() => setScreen('stats')}>Stats</button>
        {voiceBtn}
        <button className={hdrBtn} onClick={undo}>Undo</button>
        <button className={hdrBtn} onClick={handleNewGame}>New</button>
      </div>

      {/* Mobile: burger · meta · voice + undo */}
      <div className="flex md:hidden items-center gap-2" ref={menuRef}>
        <button
          onClick={() => setMenuOpen(o => !o)}
          className="text-ink-light active:text-ink text-xl leading-none px-1 bg-transparent border-none cursor-pointer"
          aria-label="Menu"
        >
          ☰
        </button>

        {menuOpen && (
          <div className="absolute top-full left-0 mt-px bg-paper border border-rule-strong shadow-lg z-30 flex flex-col min-w-40">
            <Link
              href="/leaderboard"
              className="px-5 py-3 font-cond text-sm font-semibold tracking-caps uppercase text-ink-light active:bg-panel active:text-ink transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              Board
            </Link>
            <button
              className="px-5 py-3 font-cond text-sm font-semibold tracking-caps uppercase text-ink-light active:bg-panel active:text-ink transition-colors text-left"
              onClick={() => { setScreen('stats'); setMenuOpen(false) }}
            >
              Stats
            </button>
            <button
              className="px-5 py-3 font-cond text-sm font-semibold tracking-caps uppercase text-ink-light active:bg-panel active:text-ink transition-colors text-left"
              onClick={handleNewGame}
            >
              New game
            </button>
          </div>
        )}
      </div>

      <div className="md:hidden font-cond text-[11px] font-semibold tracking-label text-ink-light truncate">
        <MatchMeta />
      </div>

      <div className="flex md:hidden gap-2 items-center">
        {voiceBtn}
        <button className={hdrBtn} onClick={undo}>Undo</button>
      </div>
    </div>
  )
}
