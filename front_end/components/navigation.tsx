"use client"

import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { LayoutDashboard, Mic, Sparkles, GitFork, Clock } from "lucide-react"

interface NavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

const tabs = [
  { id: "dashboard", label: "Home", icon: LayoutDashboard },
  { id: "voice-journal", label: "Journal", icon: Mic },
  { id: "future-self", label: "Mirror", icon: Sparkles },
  { id: "decision-forks", label: "Paths", icon: GitFork },
  { id: "timeline", label: "Timeline", icon: Clock },
]

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      {/* Glassmorphism background */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/95 to-background/80 backdrop-blur-xl border-t border-primary/10" />
      
      <div className="relative max-w-lg mx-auto px-4">
        <ul className="flex items-center justify-around py-3">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <li key={tab.id}>
                <button
                  onClick={() => onTabChange(tab.id)}
                  className={cn(
                    "relative flex flex-col items-center gap-1.5 px-4 py-2 rounded-2xl transition-all duration-500",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  aria-label={tab.label}
                  aria-current={isActive ? "page" : undefined}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-primary/10 rounded-2xl"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <Icon
                    className={cn(
                      "relative z-10 w-5 h-5 transition-all duration-300",
                      isActive && "drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]"
                    )}
                  />
                  <span className={cn(
                    "relative z-10 text-[10px] font-medium tracking-wide uppercase",
                    isActive && "font-semibold"
                  )}>
                    {tab.label}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}
