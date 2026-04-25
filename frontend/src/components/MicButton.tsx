import { useMemo } from 'react'

export function MicButton({
  isRecording,
  disabled,
  onClick,
}: {
  isRecording: boolean
  disabled?: boolean
  onClick: () => void
}) {
  const ringClass = useMemo(() => {
    if (!isRecording) return ''
    return 'fm-mic-pulse'
  }, [isRecording])

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={[
        'relative grid h-[88px] w-[88px] place-items-center rounded-full',
        'border border-glassBorder bg-glassBg shadow-soft',
        'backdrop-blur-[16px] [-webkit-backdrop-filter:blur(16px)]',
        'transition-transform duration-200 hover:scale-[1.02] active:scale-[0.99]',
        disabled ? 'opacity-60' : '',
      ].join(' ')}
      aria-label={isRecording ? 'Stop recording' : 'Start recording'}
    >
      <span
        className={[
          'absolute inset-0 rounded-full border border-[rgba(155,143,176,0.55)]',
          ringClass,
        ].join(' ')}
      />
      <div className="relative z-10 grid h-[62px] w-[62px] place-items-center rounded-full bg-[rgba(200,192,216,0.18)]">
        <div
          className={[
            'h-[18px] w-[18px] rounded-full',
            isRecording ? 'bg-roseDeep' : 'bg-lavenderDeep',
          ].join(' ')}
        />
      </div>
    </button>
  )
}

