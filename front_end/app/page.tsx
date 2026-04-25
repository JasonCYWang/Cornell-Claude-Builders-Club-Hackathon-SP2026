"use client"

import { useEffect, useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Navigation } from "@/components/navigation"
import { Dashboard } from "@/components/dashboard"
import { VoiceJournal } from "@/components/voice-journal"
import { FutureSelf } from "@/components/future-self"
import { DecisionForks } from "@/components/decision-forks"
import { Timeline } from "@/components/timeline"

export default function FutureMirrorApp() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [reopenEntryId, setReopenEntryId] = useState<string | null>(null)

  const stars = useMemo(
    () =>
      Array.from({ length: 50 }, () => ({
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        duration: 2 + Math.random() * 3,
        delay: Math.random() * 2,
      })),
    []
  )

  const handleNavigateToFutureSelf = () => {
    setActiveTab("future-self")
  }

  useEffect(() => {
    const onReopen = (e: Event) => {
      const detail = (e as CustomEvent<{ entryId?: string }>).detail
      if (!detail?.entryId) return
      setReopenEntryId(detail.entryId)
      setActiveTab("voice-journal")
    }
    window.addEventListener("futuremirror:reopen-reflection", onReopen)
    return () => window.removeEventListener("futuremirror:reopen-reflection", onReopen)
  }, [])

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Mystical background effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Gradient orbs */}
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-gradient-to-br from-primary/20 via-accent/10 to-transparent blur-3xl" />
        <div className="absolute bottom-[-30%] right-[-20%] w-[70%] h-[70%] rounded-full bg-gradient-to-tl from-primary/15 via-purple-500/10 to-transparent blur-3xl" />
        <div className="absolute top-[40%] right-[10%] w-[40%] h-[40%] rounded-full bg-gradient-to-bl from-accent/10 to-transparent blur-3xl" />
        
        {/* Stars effect */}
        <div className="absolute inset-0">
          {stars.map((s, i) => (
            <motion.div
              key={i}
              className="absolute w-0.5 h-0.5 bg-primary/40 rounded-full"
              style={{
                left: s.left,
                top: s.top,
              }}
              animate={{
                opacity: [0.2, 0.8, 0.2],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: s.duration,
                repeat: Infinity,
                delay: s.delay,
              }}
            />
          ))}
        </div>
      </div>

      {/* Main content area */}
      <main className="relative z-10 max-w-lg mx-auto px-5 py-8 pb-28">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
          >
            {activeTab === "dashboard" && (
              <Dashboard onNavigateToFutureSelf={handleNavigateToFutureSelf} />
            )}
            {activeTab === "voice-journal" && <VoiceJournal reopenEntryId={reopenEntryId} />}
            {activeTab === "future-self" && <FutureSelf />}
            {activeTab === "decision-forks" && <DecisionForks />}
            {activeTab === "timeline" && <Timeline />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom navigation */}
      <Navigation
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab)
          if (tab !== "voice-journal") setReopenEntryId(null)
        }}
      />
    </div>
  )
}
