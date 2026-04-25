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
    <button
      type="button"
      onClick={onSelect}
      className="text-left transition-transform duration-200 hover:-translate-y-1"
    >
      <GlassCard
        className={[
          'h-full p-4 transition-all duration-200',
          selected
            ? 'border-[rgba(123,91,255,0.7)] bg-[linear-gradient(135deg,rgba(255,126,217,0.27),rgba(86,186,255,0.24),rgba(255,177,102,0.24))] shadow-[0_14px_34px_rgba(123,91,255,0.28)]'
            : 'hover:border-[rgba(123,91,255,0.4)] hover:bg-[rgba(253,249,245,0.88)]',
        ].join(' ')}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="font-display text-[21px] italic text-textDark">{meta.name}</div>
            <div className="mt-1 text-[12px] leading-relaxed text-textMid">{meta.subtitle}</div>
          </div>
          <div className="text-[24px]">{meta.emoji}</div>
        </div>
        <div className={['mt-4 h-[54px] w-full rounded-glass border border-white/40', meta.gradientClass].join(' ')} />
        {selected ? <div className="mt-2 text-[11px] font-medium text-textDark">Selected fighter ⚔️</div> : null}
      </GlassCard>
    </button>
  )
}

