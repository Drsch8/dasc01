'use client'
import { Fragment, useEffect, useRef } from 'react'
import { useGameStore } from '@/store/game-store'
import { validateInput } from '@/lib/engine'
import type { RoundEntry } from '@/types/game'

export function LiveList() {
  const rounds = useGameStore(s => s.rounds)
  const currentRound = useGameStore(s => s.currentRound)
  const current = useGameStore(s => s.current)
  const inputStr = useGameStore(s => s.inputStr)
  const inputMode = useGameStore(s => s.inputMode)
  const scores = useGameStore(s => s.scores)
  const outRule = useGameStore(s => s.config.outRule)
  const training = useGameStore(s => s.config.training)
  const scrollRef = useRef<HTMLDivElement>(null)
  const prevInputRef = useRef('')

  const scrollToBottom = (smooth = true) => {
    const el = scrollRef.current
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior: smooth ? 'smooth' : 'instant' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [rounds.length, current])

  useEffect(() => {
    if (inputStr !== '' && prevInputRef.current === '') {
      scrollToBottom()
    }
    prevInputRef.current = inputStr
  }, [inputStr])

  const validation = validateInput(inputStr, inputMode, scores[current], outRule)
  const isInvalid = inputStr !== '' && !validation.valid

  // 2-player: p0_score | p0_remain | dart# | p1_remain | p1_score
  // training:  dart# | p0_score | p0_remain
  const p2Started = !training && rounds.length > 0 && rounds[0].p0 === null
  // When P2 started, the last rounds entry has P2's score but no P1 yet.
  // We fold it into the live row so P1's input and P2's score share one row.
  const p2LiveEntry = p2Started ? (rounds[rounds.length - 1]?.p1 ?? null) : null
  const completedRounds = p2Started
    ? rounds.slice(0, -1).map((round, i) => ({ p0: rounds[i + 1]!.p0, p1: round.p1 }))
    : rounds
  const liveDartNum = p2Started
    ? (current === 0 ? rounds.length : rounds.length + 1)
    : rounds.length + 1

  const gridCols = training
    ? 'grid-cols-[2.5rem_1fr_1fr]'
    : 'grid-cols-[minmax(0,1fr)_minmax(0,1fr)_2.5rem_minmax(0,1fr)_minmax(0,1fr)]'

  // Cells use flex for vertical centering; border-b stretches with cell height
  const cL = 'flex items-center px-2.5 py-2.5 border-b border-rule'       // left-aligned
  const cR = 'flex items-center justify-end px-2.5 py-2.5 border-b border-rule'  // right-aligned
  const cC = 'flex items-center justify-center px-1 py-2.5 border-b border-rule'  // centered

  function completedScore(entry: RoundEntry | null) {
    if (!entry) return null
    return <span className={`font-num text-2xl md:text-lg leading-none ${entry.bust ? 'text-bust' : 'text-ink'}`}>{entry.score}</span>
  }

  function completedRemain(entry: RoundEntry | null) {
    if (!entry) return null
    return <span className="font-cond text-base md:text-sm tracking-[0.1em] text-ink-faint leading-none">{entry.remain}</span>
  }

  function activeScore() {
    return (
      <span className={`font-num text-2xl md:text-lg leading-none border-b-2 pb-0.5 min-w-[2.5rem] inline-block
        ${isInvalid ? 'text-bust border-bust' : 'text-ink border-accent'}`}>
        {inputStr || ' '}
      </span>
    )
  }

  const hdr = 'flex items-center px-2.5 py-1.5 font-cond text-[11px] font-semibold uppercase tracking-label text-ink-faint border-b border-rule'
  const hdrR = `${hdr} justify-end`
  const hdrC = `${hdr} justify-center px-1`
  const hdrL = hdr

  const innerW = training ? 'w-[260px]' : 'w-full'

  return (
    <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto flex flex-col bg-bg">

      {/* ── Sticky header ── */}
      <div className="sticky top-0 z-10 bg-bg shrink-0 flex justify-center">
        <div className={`grid ${gridCols} ${innerW}`}>
          {training ? <>
            <div className={hdrR}>#</div>
            <div className={hdrL}>score</div>
            <div className={hdrR}>rest</div>
          </> : <>
            <div className={hdrL}>score</div>
            <div className={hdrR}>rest</div>
            <div className={hdrC}>#</div>
            <div className={hdrL}>rest</div>
            <div className={hdrR}>score</div>
          </>}
        </div>
      </div>

      {/* ── Data rows ── */}
      <div className="flex justify-center">
      <div className={`grid ${gridCols} ${innerW}`}>

        {completedRounds.map((round, i) => (
          <Fragment key={i}>
            {training && (
              <div className={`${cR} font-cond text-sm tracking-[0.1em] text-ink-faint`}>{(i + 1) * 3}</div>
            )}
            {/* p0 score — outer left */}
            <div className={cL}>{completedScore(round.p0)}</div>
            {/* p0 remain — toward center */}
            <div className={cR}>{completedRemain(round.p0)}</div>
            {!training && (
              <div className={`${cC} font-cond text-sm tracking-[0.1em] text-ink-faint`}>{(i + 1) * 3}</div>
            )}
            {/* p1 remain — toward center */}
            {!training && <div className={cL}>{completedRemain(round.p1)}</div>}
            {/* p1 score — outer right */}
            {!training && <div className={cR}>{completedScore(round.p1)}</div>}
          </Fragment>
        ))}

        {/* Live row */}
        <Fragment key="live">
          {training && (
            <div className={`${cR} font-cond text-sm tracking-[0.1em] text-ink-faint`}>{(rounds.length + 1) * 3}</div>
          )}

          {/* P0 score — outer left */}
          <div className={cL}>
            {currentRound.p0
              ? completedScore(currentRound.p0)
              : current === 0
                ? activeScore()
                : null}
          </div>

          {/* P0 remain — toward center */}
          <div className={cR}>
            {currentRound.p0 ? completedRemain(currentRound.p0) : null}
          </div>

          {!training && <>
            {/* dart# center */}
            <div className={`${cC} font-cond text-sm tracking-[0.1em] text-ink-faint`}>{liveDartNum * 3}</div>

            {/* P1 remain — toward center */}
            <div className={cL}>
              {currentRound.p1
                ? completedRemain(currentRound.p1)
                : (p2LiveEntry && current === 0)
                  ? completedRemain(p2LiveEntry)
                  : null}
            </div>

            {/* P1 score — outer right */}
            <div className={cR}>
              {currentRound.p1
                ? completedScore(currentRound.p1)
                : current === 1
                  ? activeScore()
                  : (p2LiveEntry && current === 0)
                    ? completedScore(p2LiveEntry)
                    : null}
            </div>
          </>}
        </Fragment>

      </div>
      </div>

    </div>
  )
}
