export default function LeaderboardLoading() {
  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-rule bg-bg sticky top-0 z-10">
        <span className="font-cond text-xs font-semibold tracking-label uppercase text-ink-light">Leaderboard</span>
        <div className="border border-rule-strong px-3 py-1.5 font-cond text-[13px] font-semibold tracking-caps uppercase text-ink-faint opacity-40">Back</div>
      </div>

      <div className="px-4 md:px-8 py-6 max-w-3xl mx-auto flex flex-col gap-7 animate-pulse">

        {/* Ranked skeleton */}
        <section>
          <div className="h-2.5 w-32 bg-paper mb-2.5" />
          <div className="flex flex-col gap-0.5">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-paper h-[68px]" style={{ borderLeft: '4px solid var(--rule-strong)' }} />
            ))}
          </div>
        </section>

        {/* Recent matches skeleton */}
        <section>
          <div className="h-2.5 w-32 bg-paper mb-2.5" />
          <div className="flex flex-col gap-0.5">
            {[1, 2, 3, 5].map(i => (
              <div key={i} className="bg-panel h-12" />
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
