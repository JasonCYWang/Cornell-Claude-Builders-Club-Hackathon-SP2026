import { GlassCard } from './GlassCard'

export function LetterDisplay({
  title,
  text,
  loading,
  subtitle,
}: {
  title: string
  text: string
  loading?: boolean
  subtitle?: string
}) {
  return (
    <GlassCard className="p-5 bg-[linear-gradient(135deg,rgba(123,91,255,0.16),rgba(255,126,217,0.14),rgba(86,186,255,0.14))]">
      <div className="flex items-center justify-between gap-3">
        <div className="font-display text-[20px] italic text-textDark">{title}</div>
        {loading ? <div className="text-[12px] text-textSoft">Writing…</div> : null}
      </div>
      {subtitle ? <div className="mt-1 text-[12px] text-textSoft">{subtitle}</div> : null}
      <div className="mt-4 whitespace-pre-wrap font-ai text-[24px] italic leading-[1.7] text-textDark">
        {text || 'Select a future self to receive a letter.'}
      </div>
    </GlassCard>
  )
}

