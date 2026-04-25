"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mic, Pause, Square, Save, Check, Sparkles, Heart, Moon, Play } from "lucide-react"
import { cn } from "@/lib/utils"
import type { JournalEntry } from "@/lib/journal-types"
import { saveJournalEntry } from "@/lib/journal-api"
import { getJournalEntryById } from "@/lib/journal-store"

type RecordingState = "idle" | "recording" | "paused" | "saved"

type VoiceJournalProps = {
  reopenEntryId?: string | null
}

const MOCK_TRANSCRIPT =
  "I keep putting off applications because I feel behind. I compare myself to friends who seem to have it all figured out, and then I freeze. I tell myself I’ll start when I’m more confident, but the confidence never comes."
const MOCK_SUMMARY =
  "You talked about feeling behind, delaying applications, and worrying that you are not ready."
const MOCK_EMOTION = "anxious"
const MOCK_THEMES = ["anxiety", "comparison", "perfectionism"]
const MOCK_PATTERN = "Waiting for confidence before taking action"

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
}

async function blobToDataUrl(blob: Blob): Promise<string> {
  const reader = new FileReader()
  return await new Promise((resolve, reject) => {
    reader.onerror = () => reject(new Error("Failed to read audio blob"))
    reader.onload = () => resolve(String(reader.result))
    reader.readAsDataURL(blob)
  })
}

export function VoiceJournal({ reopenEntryId }: VoiceJournalProps) {
  const [recordingState, setRecordingState] = useState<RecordingState>("idle")
  const [time, setTime] = useState(0)
  const [showSummary, setShowSummary] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [savedEntry, setSavedEntry] = useState<JournalEntry | null>(null)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [recordError, setRecordError] = useState<string | null>(null)

  const intervalRef = useRef<number | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<BlobPart[]>([])

  useEffect(() => {
    if (recordingState === "recording") {
      intervalRef.current = window.setInterval(() => {
        setTime((t) => t + 1)
      }, 1000)
    } else if (intervalRef.current) {
      window.clearInterval(intervalRef.current)
    }
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current)
    }
  }, [recordingState])

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        try {
          mediaRecorderRef.current.stop()
        } catch {}
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop())
      }
      if (audioUrl) URL.revokeObjectURL(audioUrl)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!reopenEntryId) return
    const entry = getJournalEntryById(reopenEntryId)
    if (!entry) return

    setRecordingState("saved")
    setShowSummary(true)
    setSavedEntry(entry)
    setTime(0)
    setRecordError(null)
    setAudioBlob(null)
    if (audioUrl) URL.revokeObjectURL(audioUrl)
    setAudioUrl(entry.audioUrl ?? null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reopenEntryId])

  const waveform = useMemo(
    () =>
      Array.from({ length: 50 }, (_, i) => ({
        i,
        peak: Math.random() * 70 + 20,
        speed: 0.4 + Math.random() * 0.4,
      })),
    []
  )

  const canRecord = typeof window !== "undefined" && typeof MediaRecorder !== "undefined"

  const handleRecord = async () => {
    setRecordError(null)
    if (!canRecord) {
      setRecordError("Voice recording isn’t supported in this browser.")
      return
    }

    try {
      if (audioUrl && audioUrl.startsWith("blob:")) URL.revokeObjectURL(audioUrl)
      setAudioUrl(null)
      setAudioBlob(null)
      setSavedEntry(null)
      setRecordingState("recording")
      chunksRef.current = []

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaStreamRef.current = stream

      const recorder = new MediaRecorder(stream)
      mediaRecorderRef.current = recorder

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data)
      }
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" })
        setAudioBlob(blob)
        setAudioUrl(URL.createObjectURL(blob))

        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach((t) => t.stop())
          mediaStreamRef.current = null
        }
      }

      recorder.start()
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Couldn’t access your microphone."
      setRecordError(message)
      setRecordingState("idle")
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop())
        mediaStreamRef.current = null
      }
      mediaRecorderRef.current = null
    }

    setTime(0)
    setShowSummary(false)
  }

  const handlePause = () => {
    setRecordingState("paused")
    try {
      mediaRecorderRef.current?.pause()
    } catch {}
  }

  const handleResume = () => {
    setRecordingState("recording")
    try {
      mediaRecorderRef.current?.resume()
    } catch {}
  }

  const handleStop = () => {
    setRecordingState("saved")
    setShowSummary(true)
    try {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop()
      }
    } catch {}
  }

  const handleSave = async () => {
    setIsSaving(true)
    setRecordError(null)
    try {
      const id = crypto.randomUUID()
      const now = new Date()
      const date = now.toISOString()

      const persistedAudioUrl =
        audioBlob ? await blobToDataUrl(audioBlob) : audioUrl ?? undefined

      const entry: JournalEntry = {
        id,
        date,
        duration: formatTime(time),
        audioUrl: persistedAudioUrl,
        transcript: MOCK_TRANSCRIPT,
        summary: MOCK_SUMMARY,
        emotion: MOCK_EMOTION,
        emotionalThemes: MOCK_THEMES,
        patternDetected: MOCK_PATTERN,
      }

      const saved = await saveJournalEntry(entry)
      setSavedEntry(saved)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save voice memo."
      setRecordError(message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleNewRecording = () => {
    setRecordingState("idle")
    setTime(0)
    setShowSummary(false)
    setSavedEntry(null)
    setAudioBlob(null)
    if (audioUrl && audioUrl.startsWith("blob:")) URL.revokeObjectURL(audioUrl)
    setAudioUrl(null)
    setRecordError(null)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-3"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 rounded-full border border-primary/20"
        >
          <Moon className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs text-primary font-medium tracking-wide uppercase">Voice Portal</span>
        </motion.div>
        <h1 className="text-3xl font-serif font-light text-foreground tracking-tight">
          Speak Your <span className="italic text-primary">Truth</span>
        </h1>
        <p className="text-muted-foreground text-sm font-light">
          Let your voice become a vessel for clarity
        </p>
      </motion.div>

      {/* Recording Interface */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex flex-col items-center py-8"
      >
        {/* Waveform Animation */}
        <div className="relative w-full h-28 mb-8 flex items-center justify-center gap-0.5">
          {recordingState === "recording" &&
            waveform.map((b) => (
              <motion.div
                key={b.i}
                className="w-1 bg-gradient-to-t from-primary/40 to-primary rounded-full"
                animate={{
                  height: [6, b.peak, 6],
                }}
                transition={{
                  duration: b.speed,
                  repeat: Infinity,
                  delay: b.i * 0.015,
                }}
              />
            ))}
          {(recordingState === "idle" || recordingState === "paused" || recordingState === "saved") &&
            waveform.map((b) => (
              <motion.div
                key={b.i}
                className="w-1 bg-muted-foreground/10 rounded-full"
                style={{ height: 4 + Math.sin(b.i * 0.3) * 3 }}
                animate={recordingState === "paused" ? { opacity: [0.3, 0.6, 0.3] } : {}}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            ))}
        </div>

        {/* Timer */}
        <motion.p
          className={cn(
            "text-5xl font-serif font-light tracking-widest mb-10",
            recordingState === "recording" ? "text-primary" : "text-muted-foreground/60"
          )}
          animate={recordingState === "recording" ? { opacity: [1, 0.6, 1] } : {}}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          {formatTime(time)}
        </motion.p>

        {recordError && (
          <div className="max-w-md mx-auto text-center -mt-6 mb-8">
            <p className="text-xs text-destructive/90 font-light font-serif">{recordError}</p>
          </div>
        )}

        {/* Record Button */}
        <AnimatePresence mode="wait">
          {recordingState === "idle" && (
            <motion.div
              key="record"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-accent/20 rounded-full blur-2xl animate-pulse" />
              <button
                onClick={handleRecord}
                className="relative w-28 h-28 rounded-full bg-gradient-to-br from-primary via-primary/90 to-accent/80 flex items-center justify-center shadow-2xl shadow-primary/40 hover:shadow-primary/60 transition-all duration-500 hover:scale-105 group"
                aria-label="Start recording"
              >
                <div className="absolute inset-2 rounded-full border border-primary-foreground/20" />
                <Mic className="w-12 h-12 text-primary-foreground group-hover:scale-110 transition-transform" />
              </button>
            </motion.div>
          )}

          {(recordingState === "recording" || recordingState === "paused") && (
            <motion.div
              key="controls"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="flex items-center gap-6"
            >
              <button
                onClick={recordingState === "recording" ? handlePause : handleResume}
                className="w-16 h-16 rounded-full bg-card border border-border flex items-center justify-center hover:bg-primary/10 hover:border-primary/30 transition-all duration-300"
                aria-label={recordingState === "recording" ? "Pause" : "Resume"}
              >
                {recordingState === "recording" ? (
                  <Pause className="w-6 h-6 text-foreground" />
                ) : (
                  <Mic className="w-6 h-6 text-primary" />
                )}
              </button>

              <div className="relative">
                <div className="absolute inset-0 bg-primary/30 rounded-full blur-xl animate-pulse" />
                <button
                  onClick={handleStop}
                  className="relative w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent/80 flex items-center justify-center shadow-2xl shadow-primary/40"
                  aria-label="Stop and save"
                >
                  <Square className="w-10 h-10 text-primary-foreground" fill="currentColor" />
                </button>
              </div>

              <button
                onClick={handleStop}
                className="w-16 h-16 rounded-full bg-card border border-border flex items-center justify-center hover:bg-accent/10 hover:border-accent/30 transition-all duration-300"
                aria-label="Stop and review"
              >
                <Save className="w-6 h-6 text-accent" />
              </button>
            </motion.div>
          )}

          {recordingState === "saved" && (
            <motion.div
              key="saved"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="flex flex-col items-center gap-4"
            >
              {audioUrl ? (
                <div className="w-full max-w-md rounded-2xl border border-border/60 bg-card/70 backdrop-blur-sm p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center">
                      <Play className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-serif text-foreground">Voice memo ready</p>
                      <p className="text-xs text-muted-foreground font-light">{formatTime(time)}</p>
                    </div>
                  </div>
                  <audio controls className="w-full">
                    <source src={audioUrl} />
                  </audio>
                  <div className="mt-4 flex gap-3">
                    <Button
                      onClick={handleSave}
                      disabled={isSaving || !!savedEntry}
                      className="flex-1 rounded-full bg-gradient-to-br from-primary to-accent/80 hover:from-primary/90 hover:to-accent/70 text-primary-foreground shadow-lg shadow-primary/25"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {savedEntry ? "Saved" : isSaving ? "Saving..." : "Save Voice Memo"}
                    </Button>
                    <Button
                      onClick={handleNewRecording}
                      variant="outline"
                      className="rounded-full border-primary/30 hover:bg-primary/10 font-serif font-light"
                    >
                      New
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  onClick={handleNewRecording}
                  variant="outline"
                  className="rounded-full px-8 py-6 border-primary/30 hover:bg-primary/10 font-serif font-light text-base"
                >
                  <Mic className="w-5 h-5 mr-3" />
                  Begin New Reflection
                </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* AI Summary Card */}
      <AnimatePresence>
        {showSummary && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.6 }}
            className="space-y-5"
          >
            {/* Saved Confirmation */}
            <motion.div 
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="flex items-center justify-center gap-2 text-accent"
            >
              <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                <Check className="w-4 h-4" />
              </div>
              <span className="text-sm font-serif">Reflection captured in the cosmos</span>
            </motion.div>

            {/* Summary Card */}
            <Card className="border-primary/20 shadow-xl shadow-primary/10 bg-gradient-to-br from-card via-card to-primary/5 overflow-hidden">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNhODU1ZjciIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMSIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
              <CardHeader className="relative pb-3">
                <CardTitle className="text-lg font-serif font-normal flex items-center gap-2.5 text-foreground">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Cosmic Interpretation
                </CardTitle>
              </CardHeader>
              <CardContent className="relative space-y-5">
                <p className="text-sm text-muted-foreground leading-relaxed font-light italic font-serif">
                  &ldquo;{savedEntry?.summary ?? MOCK_SUMMARY}&rdquo;
                </p>

                {/* Emotional Themes */}
                <div>
                  <p className="text-xs font-serif text-foreground mb-3 flex items-center gap-2">
                    <Heart className="w-3.5 h-3.5 text-accent" />
                    Emotional Energies Detected
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(savedEntry?.emotionalThemes ?? MOCK_THEMES).map((theme, idx) => (
                      <span
                        key={`${theme}-${idx}`}
                        className={cn(
                          "px-3 py-1.5 text-xs rounded-full font-medium border",
                          idx === 0
                            ? "bg-primary/15 text-primary border-primary/20"
                            : idx === 1
                              ? "bg-accent/15 text-accent border-accent/20"
                              : "bg-muted text-muted-foreground border-border"
                        )}
                      >
                        {theme}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Pattern Detected */}
                <div className="p-4 bg-gradient-to-r from-primary/10 to-transparent rounded-xl border border-primary/20">
                  <p className="text-xs font-serif text-primary mb-1.5 flex items-center gap-2">
                    <Sparkles className="w-3 h-3" />
                    Recurring Pattern
                  </p>
                  <p className="text-sm text-muted-foreground font-light font-serif leading-relaxed">
                    {savedEntry?.patternDetected ?? MOCK_PATTERN}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
