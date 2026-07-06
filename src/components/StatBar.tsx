import { STAT_MAX } from '../lib/format'

interface Props {
  label: string
  value: number
}

export default function StatBar({ label, value }: Props) {
  const width = Math.min(100, (value / STAT_MAX) * 100)
  return (
    <div className="flex items-center gap-3">
      <span className="w-32 shrink-0 text-xs text-muted">{label}</span>
      <span className="w-8 shrink-0 text-right text-xs font-medium tabular-nums">
        {value}
      </span>
      <div
        role="meter"
        aria-label={label}
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={STAT_MAX}
        className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-line"
      >
        <div
          className="h-full origin-left animate-grow-x rounded-full bg-accent"
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  )
}
