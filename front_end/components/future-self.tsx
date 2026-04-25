"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Sparkles, Send, Moon } from "lucide-react"
import { cn } from "@/lib/utils"
import { getLatestJournalEntry, onJournalEntriesUpdated } from "@/lib/journal-store"

const sampleLetter = `You kept thinking confidence would come first.

It didn't.

You applied scared.
You spoke before you felt ready.
That changed everything.

The thing you feared most was never failure —
it was being seen trying.`

const followUpOptions = [
  "Tell me more",
  "What would I regret?",
  "What should I stop avoiding?",
  "Compare another path",
]

export function FutureSelf() {
  const [prompt, setPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [letter, setLetter] = useState(sampleLetter)
  const [showLetter, setShowLetter] = useState(true)
  const [latestPattern, setLatestPattern] = useState<string | null>(null)

  useEffect(() => {
    const refresh = () => setLatestPattern(getLatestJournalEntry()?.patternDetected ?? null)
    refresh()
    return onJournalEntriesUpdated(refresh)
  }, [])

  const handleGenerate = () => {
    if (!prompt.trim()) return
    setIsGenerating(true)
    setShowLetter(false)

    // Simulate generation
    setTimeout(() => {
      const responses = [
        `The question you're really asking isn't about staying.

It's about permission.

You've been waiting for someone to tell you it's okay to want more. To need change. To outgrow a place that was once home.

No one else can give you that permission.
Only you.

The discomfort you feel isn't a warning — it's a compass.`,
        `Five years from now, you won't remember the fear.

You'll remember the moment you decided to trust yourself anyway.

Every version of you that came before was preparing for this. The hesitation, the overthinking, the careful planning — it all led here.

What you're calling doubt is actually discernment. You know something needs to change.

The only question left is: when?`,
        `Here's what I wish someone had told you sooner:

Growth doesn't feel like growth while it's happening. It feels like confusion. Like losing your footing. Like not recognizing who you're becoming.

But looking back? You'll see it was always leading somewhere.

The path you're afraid to take? It's the one that matters most.`,
      ]
      setLetter(responses[Math.floor(Math.random() * responses.length)])
      setIsGenerating(false)
      setShowLetter(true)
      setPrompt("")
    }, 2000)
  }

  const handleFollowUp = (option: string) => {
    setPrompt(option)
    handleGenerate()
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-4"
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="relative inline-flex items-center justify-center w-20 h-20 mx-auto"
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/30 via-accent/20 to-primary/10 blur-xl animate-pulse" />
          <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-accent/10 border border-primary/30 flex items-center justify-center">
            <Moon className="w-8 h-8 text-primary" />
          </div>
        </motion.div>
        <h1 className="text-3xl font-serif font-light text-foreground tracking-tight">
          A Letter From <span className="italic text-primary">Tomorrow</span>
        </h1>
        <p className="text-muted-foreground text-sm font-light max-w-xs mx-auto leading-relaxed">
          Wisdom from the person you are becoming
        </p>
      </motion.div>

      {latestPattern && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative"
        >
          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 via-accent/10 to-primary/20 rounded-2xl blur opacity-50" />
          <div className="relative bg-card/70 backdrop-blur-sm border border-primary/20 rounded-2xl px-5 py-4">
            <p className="text-xs text-muted-foreground font-light font-serif">
              Based on your latest voice journal:
            </p>
            <p className="text-sm text-foreground/90 font-light font-serif mt-1">
              {latestPattern}
            </p>
          </div>
        </motion.div>
      )}

      {/* Letter Card */}
      <AnimatePresence mode="wait">
        {isGenerating ? (
          <motion.div
            key="generating"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <div className="relative">
              <motion.div
                className="w-16 h-16 rounded-full border-2 border-primary/30 border-t-primary"
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-primary animate-pulse" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-6 font-serif italic">
              Channeling wisdom from your future self...
            </p>
          </motion.div>
        ) : (
          showLetter && (
            <motion.div
              key="letter"
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30, scale: 0.95 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              <div className="relative">
                {/* Mystical glow effect */}
                <div className="absolute -inset-1 bg-gradient-to-br from-primary/20 via-accent/10 to-primary/20 rounded-3xl blur-xl opacity-60" />

                {/* Letter content */}
                <div className="relative bg-gradient-to-br from-card via-card to-primary/5 border border-primary/20 rounded-3xl p-8 shadow-2xl shadow-primary/10">
                  {/* Decorative corner elements */}
                  <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-primary/30 rounded-tl-lg" />
                  <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-primary/30 rounded-br-lg" />

                  {/* Opening quote mark */}
                  <div className="absolute -top-2 left-8 text-7xl text-primary/20 font-serif leading-none select-none">
                    &ldquo;
                  </div>

                  <div className="pt-8 space-y-5">
                    {letter.split("\n\n").map((paragraph, i) => (
                      <motion.p
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + i * 0.2, duration: 0.5 }}
                        className={cn(
                          "font-serif leading-relaxed",
                          paragraph.length < 50
                            ? "text-xl font-light text-primary"
                            : "text-base font-light text-foreground/90"
                        )}
                      >
                        {paragraph}
                      </motion.p>
                    ))}
                  </div>

                  {/* Signature */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                    className="mt-10 pt-6 border-t border-primary/20"
                  >
                    <p className="text-sm text-muted-foreground font-serif italic flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      — Your Future Self
                    </p>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )
        )}
      </AnimatePresence>

      {/* Follow-up buttons */}
      {showLetter && !isGenerating && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="flex flex-wrap gap-2 justify-center"
        >
          {followUpOptions.map((option, i) => (
            <motion.button
              key={option}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1 + i * 0.1 }}
              onClick={() => handleFollowUp(option)}
              className="px-5 py-2.5 bg-card/80 hover:bg-primary/10 text-foreground text-sm font-light rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 border border-border/50 hover:border-primary/30 font-serif"
            >
              {option}
            </motion.button>
          ))}
        </motion.div>
      )}

      {/* Prompt input */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="space-y-4"
      >
        <div className="relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 via-accent/10 to-primary/20 rounded-2xl blur opacity-50" />
          <div className="relative">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="What wisdom do you seek from your future self?"
              className="min-h-[120px] resize-none bg-card border-primary/20 rounded-2xl pr-14 text-foreground placeholder:text-muted-foreground/60 focus:border-primary/40 focus:ring-primary/20 font-serif font-light text-base"
            />
            <Button
              onClick={handleGenerate}
              disabled={!prompt.trim() || isGenerating}
              size="icon"
              className="absolute bottom-4 right-4 rounded-full w-11 h-11 bg-gradient-to-br from-primary to-accent/80 hover:from-primary/90 hover:to-accent/70 text-primary-foreground shadow-lg shadow-primary/30 disabled:opacity-30"
              aria-label="Generate reflection"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground text-center font-light font-serif italic">
          &ldquo;Will I regret staying where I am?&rdquo;
        </p>
      </motion.div>
    </div>
  )
}
