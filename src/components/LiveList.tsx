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
  const bottomRef = useRef<HTMLDivElement>(null)
  const prevInputRef = useRef('')

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [rounds.length, current])

  useEffect(() => {
    if (inputStr !== '' && prevInputRef.current === '') {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
    prevInputRef.current = inputStr
  }, [inputStr])

  const validation = validateInput(inputStr, inputMode, scores[current], outRule)
  const isInvalid = inputStr !== '' && !validation.valid

  // 2-player: p0_score | p0_remain | dart# | p1_remain | p1_score
  // training:  dart# | p0_score | p0_remain
  const gridCols = training
    ? 'grid-cols-[2.5rem_1fr_1fr]'
    : 'grid-cols-[minmax(0,1fr)_minmax(0,1fr)_2.5rem_minmax(0,1fr)_minmax(0,1fr)]'

  // Cells use flex for vertical centering; border-b stretches with cell height
  const cL = 'flex items-center px-2 py-3 font-mono border-b border-rule/40'       // left-aligned
  const cR = 'flex items-center justify-end px-2 py-3 font-mono border-b border-rule/40'  // right-aligned
  const cC = 'flex items-center justify-center px-1 py-3 font-mono border-b border-rule/40'  // centered

  function completedScore(entry: RoundEntry | null) {
    if (!entry) return null
    return <span className={`text-2xl md:text-base font-semibold ${entry.bust ? 'text-bust' : 'text-ink'}`}>{entry.score}</span>
  }

  function completedRemain(entry: RoundEntry | null) {
    if (!entry) return null
    return <span className="text-xl md:text-sm text-ink-light">{entry.remain}</span>
  }

  function activeScore() {
    return (
      <span className={`font-bold text-2xl md:text-base leading-tight
        ${isInvalid ? 'text-bust' : 'text-ink'}`}>
        {inputStr || '\u00A0\u00A0'}
      </span>
    )
  }

  const hdr = 'flex items-center px-2 py-1.5 font-mono text-xs uppercase tracking-wide text-ink-faint border-b border-rule'
  const hdrR = `${hdr} justify-end`
  const hdrC = `${hdr} justify-center px-1`
  const hdrL = hdr

  const innerW = training ? 'w-[260px]' : 'w-full'

  return (
    <div className="flex-1 min-h-0 overflow-y-auto flex flex-col">

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

        {rounds.map((round, i) => (
          <Fragment key={i}>
            {training && (
              <div className={`${cR} text-ink-faint text-sm`}>{(i + 1) * 3}</div>
            )}
            {/* p0 score — outer left */}
            <div className={cL}>{completedScore(round.p0)}</div>
            {/* p0 remain — toward center */}
            <div className={cR}>{completedRemain(round.p0)}</div>
            {!training && (
              <div className={`${cC} text-ink-faint text-sm`}>{(i + 1) * 3}</div>
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
            <div className={`${cR} text-ink-faint text-sm`}>{(rounds.length + 1) * 3}</div>
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
            <div className={`${cC} text-ink-faint text-sm`}>{(rounds.length + 1) * 3}</div>

            {/* P1 remain — toward center */}
            <div className={cL}>
              {currentRound.p1 ? completedRemain(currentRound.p1) : null}
            </div>

            {/* P1 score — outer right */}
            <div className={cR}>
              {currentRound.p1
                ? completedScore(currentRound.p1)
                : current === 1
                  ? activeScore()
                  : null}
            </div>
          </>}
        </Fragment>

      </div>
      </div>

      <div ref={bottomRef} />
    </div>
  )
}
