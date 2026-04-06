'use client'

interface Option<T> {
  label: string
  value: T
}

interface PillGroupProps<T extends string | number> {
  options: Option<T>[]
  value: T
  onChange: (value: T) => void
}

export function PillGroup<T extends string | number>({ options, value, onChange }: PillGroupProps<T>) {
  return (
    <div className="flex gap-2 flex-wrap">
      {options.map(opt => (
        <button
          key={String(opt.value)}
          onClick={() => onChange(opt.value)}
          className={`px-4 py-1.5 border text-[13px] transition-colors active:scale-[0.97] transition-transform duration-100 cursor-pointer font-mono
            ${value === opt.value
              ? 'bg-ink text-bg border-ink'
              : 'bg-bg text-ink border-rule active:border-ink'
            }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
