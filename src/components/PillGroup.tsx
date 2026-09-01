'use client'

interface Option<T> {
  label: string
  value: T
}

interface PillGroupProps<T extends string | number> {
  options: Option<T>[]
  value: T
  onChange: (value: T) => void
  /** Numerals get Anton, words get condensed caps. */
  numeric?: boolean
}

export function PillGroup<T extends string | number>({ options, value, onChange, numeric }: PillGroupProps<T>) {
  return (
    <div className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
      {options.map(opt => {
        const selected = value === opt.value
        return (
          <button
            key={String(opt.value)}
            onClick={() => onChange(opt.value)}
            className={`py-2.5 text-center border-none cursor-pointer transition-colors active:scale-[0.97] transition-transform duration-100
              ${numeric
                ? 'font-num text-xl leading-none'
                : 'font-cond text-[15px] font-bold tracking-caps uppercase'}
              ${selected
                ? 'bg-accent text-ink'
                : 'bg-paper text-ink-light active:bg-rule-strong active:text-ink'
              }`}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
