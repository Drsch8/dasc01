'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useGameStore } from '@/store/game-store'
import { useSpeech } from '@/hooks/use-speech'

function MicIcon({ crossed }: { crossed?: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
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

  const hdrBtn = 'border border-rule px-4 py-2 text-sm text-ink-light font-mono active:border-ink active:text-ink active:scale-[0.97] transition-all duration-100 cursor-pointer bg-transparent'

  const voiceBtn = supported ? (
    <button
      onClick={toggleMute}
      title={muted ? 'Unmute voice' : 'Mute voice'}
      className={`border px-4 py-2 text-sm font-mono transition-colors cursor-pointer bg-transparent ${
        muted
          ? 'border-rule text-ink-faint active:border-ink active:text-ink'
          : 'border-finish text-finish'
      }`}
    >
      <MicIcon crossed={muted} />
    </button>
  ) : null

  return (
    <div className="flex items-center justify-between px-5 py-3 border-b border-rule bg-paper sticky top-0 z-20">
      <button onClick={handleNewGame} className="font-display font-bold text-2xl tracking-tight bg-transparent border-none cursor-pointer">Darts</button>

      {confirmNew && (
        <div className="fixed inset-0 bg-bg/60 backdrop-blur-sm z-50 flex items-center justify-center" onClick={() => setConfirmNew(false)}>
          <div className="bg-paper border-2 border-ink p-8 text-center max-w-xs w-[90%] flex flex-col gap-6 relative" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setConfirmNew(false)}
              className="absolute top-3 right-3 text-ink-faint active:text-ink font-mono text-lg leading-none"
              aria-label="Cancel"
            >✕</button>
            <p className="font-display font-black text-3xl">New game?</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setConfirmNew(false)}
                className="py-5 border-2 border-rule active:border-ink active:bg-bg active:scale-[0.97] font-mono text-2xl transition-all duration-100 cursor-pointer"
              >
                No
              </button>
              <button
                onClick={confirmYes}
                className="py-5 border-2 border-ink bg-ink text-bg active:opacity-80 active:scale-[0.97] font-mono text-2xl transition-all duration-100 cursor-pointer"
              >
                Yes
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

      {/* Mobile: voice + undo + burger */}
      <div className="flex md:hidden gap-2 items-center" ref={menuRef}>
        {voiceBtn}
        <button className={hdrBtn} onClick={undo}>Undo</button>
        <button
          onClick={() => setMenuOpen(o => !o)}
          className={hdrBtn}
          aria-label="Menu"
        >
          ☰
        </button>

        {menuOpen && (
          <div className="absolute top-full right-0 mt-px bg-paper border border-rule shadow-lg z-30 flex flex-col min-w-36">
            <Link
              href="/leaderboard"
              className="px-5 py-3 text-sm font-mono text-ink-light active:bg-bg active:text-ink transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              Board
            </Link>
            <button
              className="px-5 py-3 text-sm font-mono text-ink-light active:bg-bg active:text-ink transition-colors text-left"
              onClick={() => { setScreen('stats'); setMenuOpen(false) }}
            >
              Stats
            </button>
            <button
              className="px-5 py-3 text-sm font-mono text-ink-light active:bg-bg active:text-ink transition-colors text-left"
              onClick={handleNewGame}
            >
              New game
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
