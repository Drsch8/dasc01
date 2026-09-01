'use client'

/**
 * The original hand-drawn cricket marks — one slash, a cross, a circled cross.
 * Same geometry as the old /1.svg /2.svg /3.svg assets, inlined so the strokes
 * pick up `currentColor` instead of being locked to black on the dark board.
 */
const STROKE = {
  strokeWidth: 13.75,
  strokeLinecap: 'butt',
  strokeLinejoin: 'miter',
  strokeMiterlimit: 8,
  fill: 'none',
  fillRule: 'evenodd',
} as const

export function Marks({ count }: { count: number }) {
  if (count <= 0) return null

  if (count === 1) {
    return (
      <svg viewBox="2782 802 256 261" height={32} className="w-auto select-none" aria-hidden stroke="currentColor" {...STROKE}>
        <path d="M2789.12 1053.97 3029.75 813.345" />
      </svg>
    )
  }

  if (count === 2) {
    return (
      <svg viewBox="2236 802 257 261" height={32} className="w-auto select-none" aria-hidden stroke="currentColor" {...STROKE}>
        <path d="M2244.69 813.345 2485.31 1053.97" />
        <path d="M2244.69 1053.97 2485.31 813.345" />
      </svg>
    )
  }

  return (
    <svg viewBox="1599 760 353 349" height={44} className="w-auto select-none" aria-hidden stroke="currentColor" {...STROKE}>
      <path d="M1655.57 813.345 1896.19 1053.97" />
      <path d="M1655.57 1053.97 1896.2 813.345" />
      <path d="M1611 934C1611 842.873 1684.87 769 1776 769 1867.13 769 1941 842.873 1941 934 1941 1025.13 1867.13 1099 1776 1099 1684.87 1099 1611 1025.13 1611 934Z" />
    </svg>
  )
}
