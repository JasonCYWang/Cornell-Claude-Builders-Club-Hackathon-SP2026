import { GlassCard } from './GlassCard'

export function PatternBanner({ text }: { text: string }) {
  return (
    <GlassCard className="px-4 py-3">
      <div className="text-[12px] font-medium text-textSoft">Pattern</div>
      <div className="mt-1 font-ai text-[19px] italic leading-relaxed text-textDark">{text}</div>
    </GlassCard>
  )
}

