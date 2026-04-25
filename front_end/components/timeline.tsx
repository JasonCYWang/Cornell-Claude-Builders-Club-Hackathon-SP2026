"use client"

import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, Moon, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import type { JournalEntry } from "@/lib/journal-types"
import { getJournalEntries, onJournalEntriesUpdated } from "@/lib/journal-store"
import { Button } from "@/components/ui/button"

function formatGroupLabel(iso: string) {
  const d = new Date(iso)
  const today = new Date()
  const sameDay =
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()
  if (sameDay) return "Today"

  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)
  const isYesterday =
    d.getFullYear() === yesterday.getFullYear() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getDate() === yesterday.getDate()
  if (isYesterday) return "Yesterday"

  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" })
}

function groupEntries(entries: JournalEntry[]) {
  const grouped = new Map<string, JournalEntry[]>()
  for (const e of entries) {
    const label = formatGroupLabel(e.date)
    const prev = grouped.get(label) ?? []
    prev.push(e)
    grouped.set(label, prev)
  }
  return Array.from(grouped.entries())
}

export function Timeline() {
  const [entries, setEntries] = useState<JournalEntry[]>(() => getJournalEntries())

  useEffect(() => {
    return onJournalEntriesUpdated(() => setEntries(getJournalEntries()))
  }, [])

  const groupedEntries = useMemo(() => groupEntries(entries), [entries])

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
          <span className="text-xs text-primary font-medium tracking-wide uppercase">Chronicle</span>
        </motion.div>
        <h1 className="text-3xl font-serif font-light text-foreground tracking-tight">
          Your Cosmic <span className="italic text-primary">Journey</span>
        </h1>
        <p className="text-muted-foreground text-sm font-light">
          Every reflection shapes your destiny
        </p>
      </motion.div>

      {/* Timeline */}
      <div className="space-y-10">
        {groupedEntries.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground font-light font-serif">
              Your timeline is empty for now. Save a voice memo to begin your mirror-history.
            </p>
          </motion.div>
        ) : (
          groupedEntries.map(([date, group], groupIndex) => (
            <motion.div
              key={date}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: groupIndex * 0.1 }}
            >
              {/* Date header */}
              <div className="flex items-center gap-4 mb-5">
                <span className="text-sm font-serif font-medium text-primary">{date}</span>
                <div className="flex-1 h-px bg-gradient-to-r from-primary/30 to-transparent" />
              </div>

              {/* Entries */}
              <div className="space-y-4 relative">
                {/* Timeline line */}
                <div className="absolute left-[22px] top-0 bottom-0 w-px bg-gradient-to-b from-primary/30 via-accent/20 to-transparent" />

                {group.map((entry, i) => {
                  const timeLabel = new Date(entry.date).toLocaleTimeString(undefined, {
                    hour: "numeric",
                    minute: "2-digit",
                  })

                  return (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: i * 0.08 }}
                      className="relative pl-14"
                    >
                      {/* Timeline dot */}
                      <div
                        className={cn(
                          "absolute left-2 top-5 w-[22px] h-[22px] rounded-full flex items-center justify-center bg-gradient-to-br border",
                          "from-primary/30 via-accent/20 to-primary/10",
                          "border-primary/30"
                        )}
                      >
                        <Sparkles className={cn("w-3 h-3", "text-primary")} />
                      </div>

                      <Card className="border-border/50 shadow-lg shadow-primary/5 hover:shadow-xl hover:shadow-primary/10 hover:border-primary/30 transition-all duration-500 bg-card/80 backdrop-blur-sm rounded-2xl overflow-hidden group">
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <p className="font-serif font-normal text-foreground group-hover:text-primary transition-colors">
                                Voice journal
                              </p>
                              <p className="text-xs text-muted-foreground font-light mt-0.5">
                                {entry.duration}
                              </p>
                            </div>
                            <span className="text-xs text-muted-foreground shrink-0 ml-3 font-light">
                              {timeLabel}
                            </span>
                          </div>

                          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed font-light font-serif italic">
                            &ldquo;{entry.summary}&rdquo;
                          </p>

                          <div className="mt-4 pt-4 border-t border-border/50 space-y-3">
                            <div className="flex items-center gap-2">
                              <Heart className="w-3.5 h-3.5 text-accent" />
                              <div className="flex flex-wrap gap-2">
                                {entry.emotionalThemes.map((theme) => (
                                  <span
                                    key={theme}
                                    className="px-2.5 py-1 bg-primary/10 text-primary/80 text-xs rounded-full font-light border border-primary/10"
                                  >
                                    {theme}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div className="p-3 rounded-xl border border-primary/15 bg-gradient-to-r from-primary/10 to-transparent">
                              <p className="text-[11px] font-serif text-primary flex items-center gap-1.5">
                                <Sparkles className="w-3 h-3" />
                                Pattern detected
                              </p>
                              <p className="text-xs text-muted-foreground font-light font-serif mt-1">
                                {entry.patternDetected}
                              </p>
                            </div>

                            <Button
                              variant="outline"
                              className="w-full rounded-full border-primary/30 hover:bg-primary/10 font-serif font-light"
                              onClick={() => {
                                window.dispatchEvent(
                                  new CustomEvent("futuremirror:reopen-reflection", {
                                    detail: { entryId: entry.id },
                                  })
                                )
                              }}
                            >
                              Reopen Reflection
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}
