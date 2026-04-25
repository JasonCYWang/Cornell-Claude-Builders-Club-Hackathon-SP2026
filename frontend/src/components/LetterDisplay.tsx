import { GlassCard } from './GlassCard'

export function LetterDisplay({
  title,
  text,
  loading,
}: {
  title: string
  text: string
  loading?: boolean
}) {
  return (
    <GlassCard className="p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="font-display text-[20px] italic text-textDark">{title}</div>
        {loading ? <div className="text-[12px] text-textSoft">Writing…</div> : null}
      </div>
      <div className="mt-4 whitespace-pre-wrap font-display text-[19px] italic leading-[1.7] text-textDark">
        {text || 'Select a future self to receive a letter.'}
      </div>
    </GlassCard>
  )
}

