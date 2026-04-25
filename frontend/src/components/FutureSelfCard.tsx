import type { FutureSelfMeta } from '../types'
import { GlassCard } from './GlassCard'

export function FutureSelfCard({
  meta,
  selected,
  onSelect,
}: {
  meta: FutureSelfMeta
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button type="button" onClick={onSelect} className="text-left">
      <GlassCard
        className={[
          'h-full p-4 transition-colors duration-200',
          selected ? 'border-lavenderDeep bg-[rgba(253,249,245,0.82)]' : '',
        ].join(' ')}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="font-display text-[18px] italic text-textDark">{meta.name}</div>
            <div className="mt-1 text-[12px] leading-relaxed text-textSoft">{meta.subtitle}</div>
          </div>
          <div className="text-[20px]">{meta.emoji}</div>
        </div>
        <div className={['mt-4 h-[44px] w-full rounded-glass', meta.gradientClass].join(' ')} />
      </GlassCard>
    </button>
  )
}

