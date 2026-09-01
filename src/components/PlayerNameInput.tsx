'use client'
import { useState, useEffect, useRef } from 'react'
import type { PlayerStat } from '@/app/api/players/route'

interface Props {
  label: string
  value: string
  onChange: (v: string) => void
  inputClassName?: string
  onEnter?: () => void
  /** Colour of the marker bar down the left edge. */
  accent?: string
}

export function PlayerNameInput({ label, value, onChange, inputClassName, onEnter, accent }: Props) {
  const [names, setNames] = useState<string[]>([])
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/players')
      .then(r => r.json())
      .then(d => setNames((d.players as PlayerStat[]).map(p => p.name)))
      .catch(() => {})
  }, [])

  const filtered = names.filter(n =>
    n.toLowerCase().includes(value.toLowerCase()) && n !== value
  )

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div ref={ref} className="relative">
      <label className="block font-cond text-[11px] font-semibold tracking-label uppercase text-ink-faint mb-2">{label}</label>
      <div className="flex" style={accent ? { borderLeft: `4px solid ${accent}` } : undefined}>
        <input
          className={inputClassName}
          value={value}
          placeholder={label}
          maxLength={20}
          onChange={e => { onChange(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          onKeyDown={e => { if (e.key === 'Enter') { setOpen(false); onEnter?.() } }}
        />
      </div>
      {open && filtered.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-20 border border-rule-strong bg-paper shadow-lg max-h-48 overflow-y-auto">
          {filtered.map(name => (
            <button
              key={name}
              type="button"
              className="w-full text-left px-3 py-2 font-cond text-base tracking-[0.06em] uppercase text-ink active:bg-key transition-colors"
              onMouseDown={() => { onChange(name); setOpen(false) }}
            >
              {name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
