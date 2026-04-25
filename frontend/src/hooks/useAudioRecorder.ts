import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

export function useAudioRecorder() {
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<number | null>(null)

  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)

  const clearTimer = useCallback(() => {
    if (timerRef.current != null) {
      window.clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const startTimer = useCallback(() => {
    clearTimer()
    timerRef.current = window.setInterval(() => {
      setElapsedSeconds((s) => s + 1)
    }, 1000)
  }, [clearTimer])

  useEffect(() => {
    return () => {
      clearTimer()
      recorderRef.current?.stop()
      recorderRef.current = null
      chunksRef.current = []
    }
  }, [clearTimer])

  const start = useCallback(async () => {
    setAudioBlob(null)
    setElapsedSeconds(0)
    setIsPaused(false)

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' })
    recorderRef.current = recorder
    chunksRef.current = []

    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunksRef.current.push(e.data)
    }
    recorder.onstop = () => {
      stream.getTracks().forEach((t) => t.stop())
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
      setAudioBlob(blob)
      chunksRef.current = []
    }

    recorder.start()
    setIsRecording(true)
    startTimer()
  }, [startTimer])

  const pause = useCallback(() => {
    const r = recorderRef.current
    if (!r || r.state !== 'recording') return
    r.pause()
    setIsPaused(true)
    clearTimer()
  }, [clearTimer])

  const resume = useCallback(() => {
    const r = recorderRef.current
    if (!r || r.state !== 'paused') return
    r.resume()
    setIsPaused(false)
    startTimer()
  }, [startTimer])

  const stop = useCallback(() => {
    const r = recorderRef.current
    if (!r) return
    if (r.state === 'inactive') return
    r.stop()
    recorderRef.current = null
    setIsRecording(false)
    setIsPaused(false)
    clearTimer()
  }, [clearTimer])

  const reset = useCallback(() => {
    clearTimer()
    setIsRecording(false)
    setIsPaused(false)
    setElapsedSeconds(0)
    setAudioBlob(null)
    chunksRef.current = []
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop()
    }
    recorderRef.current = null
  }, [clearTimer])

  const durationStr = useMemo(() => {
    const m = Math.floor(elapsedSeconds / 60)
    const s = elapsedSeconds % 60
    return `${m}:${String(s).padStart(2, '0')}`
  }, [elapsedSeconds])

  return {
    isRecording,
    isPaused,
    elapsedSeconds,
    durationStr,
    audioBlob,
    start,
    pause,
    resume,
    stop,
    reset,
  }
}

