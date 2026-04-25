"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, TrendingUp, GitFork, Moon, Stars } from "lucide-react"

interface DashboardProps {
  onNavigateToFutureSelf: () => void
}

export function Dashboard({ onNavigateToFutureSelf }: DashboardProps) {
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
          <span className="text-xs text-primary font-medium tracking-wide uppercase">Friday, April 25</span>
        </motion.div>
        <h1 className="text-3xl font-serif font-light text-foreground tracking-tight">
          Welcome back, <span className="italic text-primary">dreamer</span>
        </h1>
        <p className="text-muted-foreground text-sm font-light">
          The universe is listening to your intentions
        </p>
      </motion.div>

      {/* Today's Reflection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="bg-gradient-to-br from-card via-card to-primary/5 border-primary/10 shadow-xl shadow-primary/5 overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNhODU1ZjciIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMSIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
          <CardHeader className="relative pb-3">
            <CardTitle className="text-lg font-serif font-normal flex items-center gap-2.5 text-foreground">
              <Stars className="w-5 h-5 text-primary" />
              Today&apos;s Cosmic Reflection
            </CardTitle>
          </CardHeader>
          <CardContent className="relative space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed font-light italic">
              &ldquo;You&apos;ve been thinking about career changes lately. Your last three
              entries mentioned feeling restless but hopeful about new possibilities.&rdquo;
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1.5 bg-primary/15 text-primary text-xs rounded-full font-medium border border-primary/20">
                restless
              </span>
              <span className="px-3 py-1.5 bg-accent/15 text-accent text-xs rounded-full font-medium border border-accent/20">
                hopeful
              </span>
              <span className="px-3 py-1.5 bg-muted text-muted-foreground text-xs rounded-full font-medium border border-border">
                growth
              </span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Emotional Pattern */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="border-border/50 shadow-lg shadow-primary/5 bg-card/80 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-serif font-normal flex items-center gap-2.5 text-foreground">
              <TrendingUp className="w-4 h-4 text-accent" />
              Emotional Constellation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-1.5 h-20">
              {[40, 55, 45, 70, 65, 80, 75].map((height, i) => (
                <motion.div
                  key={i}
                  className="flex-1 bg-gradient-to-t from-primary/40 via-primary/60 to-accent/40 rounded-t-full"
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ delay: 0.3 + i * 0.1, duration: 0.8, ease: "easeOut" }}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-4 text-center font-light italic">
              Your clarity has increased 23% this lunar cycle
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Active Crossroads */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card className="border-border/50 shadow-lg shadow-primary/5 bg-card/80 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-serif font-normal flex items-center gap-2.5 text-foreground">
              <GitFork className="w-4 h-4 text-primary" />
              Crossroads of Destiny
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-4 bg-gradient-to-r from-muted/50 to-transparent rounded-xl border border-border/50">
              <p className="text-sm font-serif text-foreground">Career pivot decision</p>
              <p className="text-xs text-muted-foreground mt-1 font-light">
                3 paths explored in the cosmic web
              </p>
            </div>
            <div className="p-4 bg-gradient-to-r from-muted/50 to-transparent rounded-xl border border-border/50">
              <p className="text-sm font-serif text-foreground">Move to a new city</p>
              <p className="text-xs text-muted-foreground mt-1 font-light">
                2 paths explored in the cosmic web
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Growth Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card className="border-border/50 shadow-lg shadow-primary/5 bg-card/80 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-serif font-normal text-foreground">
              Your Journey
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 rounded-xl bg-gradient-to-b from-primary/10 to-transparent border border-primary/10">
                <p className="text-3xl font-serif font-light text-primary">12</p>
                <p className="text-xs text-muted-foreground font-light mt-1">Reflections</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-gradient-to-b from-accent/10 to-transparent border border-accent/10">
                <p className="text-3xl font-serif font-light text-accent">5</p>
                <p className="text-xs text-muted-foreground font-light mt-1">Decisions</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-gradient-to-b from-primary/10 to-transparent border border-primary/10">
                <p className="text-3xl font-serif font-light text-primary">8</p>
                <p className="text-xs text-muted-foreground font-light mt-1">Day streak</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Future Self CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Button
          onClick={onNavigateToFutureSelf}
          className="relative w-full h-16 bg-gradient-to-r from-primary via-primary/90 to-accent/80 hover:from-primary/90 hover:via-primary/80 hover:to-accent/70 text-primary-foreground font-serif text-lg font-light rounded-2xl shadow-2xl shadow-primary/30 transition-all duration-500 overflow-hidden group"
        >
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIxIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-30 group-hover:opacity-50 transition-opacity" />
          <Sparkles className="w-5 h-5 mr-3 group-hover:animate-pulse" />
          <span className="relative">Gaze Into Your Future Self</span>
        </Button>
      </motion.div>
    </div>
  )
}
