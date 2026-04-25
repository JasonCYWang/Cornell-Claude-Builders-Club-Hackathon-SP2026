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
        'relative grid h-[104px] w-[104px] place-items-center rounded-full',
        'border border-[rgba(255,255,255,0.55)] bg-[linear-gradient(135deg,rgba(255,126,217,0.35),rgba(86,186,255,0.28),rgba(255,177,102,0.3))]',
        'backdrop-blur-[16px] [-webkit-backdrop-filter:blur(16px)]',
        'transition-transform duration-200 hover:scale-[1.05] active:scale-[0.98]',
        'fm-glow-button',
        disabled ? 'opacity-60' : '',
      ].join(' ')}
      aria-label={isRecording ? 'Stop recording' : 'Start recording'}
    >
      <span
        className={[
          'absolute inset-0 rounded-full border border-[rgba(255,255,255,0.65)]',
          ringClass,
        ].join(' ')}
      />
      <div className="relative z-10 grid h-[68px] w-[68px] place-items-center rounded-full bg-[rgba(255,255,255,0.28)]">
        <div
          className={[
            'h-[20px] w-[20px] rounded-full',
            isRecording ? 'bg-[#FF4D8D]' : 'bg-[#7B5BFF]',
          ].join(' ')}
        />
      </div>
    </button>
  )
}

