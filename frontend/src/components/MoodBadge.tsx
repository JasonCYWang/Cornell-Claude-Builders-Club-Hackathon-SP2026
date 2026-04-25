import type { MoodKey } from '../types'
import { MOOD_COLORS } from '../constants/moods'

const sizes = {
  sm: 'px-3 py-1 text-[12px]',
  md: 'px-4 py-1.5 text-[13px]',
  lg: 'px-5 py-2 text-[15px]',
} as const

export function MoodBadge({
  mood,
  label,
  size = 'md',
}: {
  mood: MoodKey
  label: string
  size?: 'sm' | 'md' | 'lg'
}) {
  const color = MOOD_COLORS[mood]
  return (
    <div
      className={[
        'inline-flex items-center gap-2 rounded-full border font-medium',
        sizes[size],
      ].join(' ')}
      style={{
        background: `${color}33`,
        borderColor: color,
        color: 'var(--text-dark)',
      }}
    >
      <span
        className="inline-block h-[6px] w-[6px] rounded-full"
        style={{ background: color }}
      />
      <span className="leading-none">{label}</span>
    </div>
  )
}

