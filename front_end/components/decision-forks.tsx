"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { GitFork, Plus, ChevronRight, Sparkles, Moon } from "lucide-react"
import { cn } from "@/lib/utils"

interface Decision {
  id: string
  title: string
  paths: { id: string; label: string; explored: boolean }[]
  createdAt: string
}

const mockDecisions: Decision[] = [
  {
    id: "1",
    title: "Career pivot decision",
    paths: [
      { id: "1a", label: "Stay and negotiate", explored: true },
      { id: "1b", label: "Apply to new roles", explored: true },
      { id: "1c", label: "Start freelancing", explored: true },
    ],
    createdAt: "2 days ago",
  },
  {
    id: "2",
    title: "Move to a new city",
    paths: [
      { id: "2a", label: "Stay where you are", explored: true },
      { id: "2b", label: "Move to Portland", explored: true },
    ],
    createdAt: "5 days ago",
  },
]

export function DecisionForks() {
  const [decisions, setDecisions] = useState<Decision[]>(mockDecisions)
  const [isAdding, setIsAdding] = useState(false)
  const [newDecision, setNewDecision] = useState("")
  const [selectedDecision, setSelectedDecision] = useState<Decision | null>(null)

  const handleAddDecision = () => {
    if (!newDecision.trim()) return
    const decision: Decision = {
      id: Date.now().toString(),
      title: newDecision,
      paths: [],
      createdAt: "Just now",
    }
    setDecisions([decision, ...decisions])
    setNewDecision("")
    setIsAdding(false)
    setSelectedDecision(decision)
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
          <span className="text-xs text-primary font-medium tracking-wide uppercase">Destiny Paths</span>
        </motion.div>
        <h1 className="text-3xl font-serif font-light text-foreground tracking-tight">
          Crossroads of <span className="italic text-primary">Fate</span>
        </h1>
        <p className="text-muted-foreground text-sm font-light">
          Explore parallel timelines before choosing your path
        </p>
      </motion.div>

      {/* Add new decision */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <AnimatePresence mode="wait">
          {isAdding ? (
            <motion.div
              key="input"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4"
            >
              <div className="relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-accent/20 rounded-xl blur opacity-50" />
                <Input
                  value={newDecision}
                  onChange={(e) => setNewDecision(e.target.value)}
                  placeholder="What crossroads do you face?"
                  className="relative bg-card border-primary/20 text-foreground placeholder:text-muted-foreground/60 font-serif font-light rounded-xl h-14"
                  autoFocus
                  onKeyDown={(e) => e.key === "Enter" && handleAddDecision()}
                />
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={handleAddDecision}
                  disabled={!newDecision.trim()}
                  className="flex-1 bg-gradient-to-r from-primary to-accent/80 text-primary-foreground font-serif font-light h-12 rounded-xl"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Create Crossroads
                </Button>
                <Button
                  onClick={() => setIsAdding(false)}
                  variant="outline"
                  className="border-border text-foreground font-serif font-light h-12 rounded-xl px-6"
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div key="button" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Button
                onClick={() => setIsAdding(true)}
                variant="outline"
                className="w-full h-16 border-dashed border-2 border-primary/30 hover:border-primary/50 hover:bg-primary/5 text-muted-foreground hover:text-foreground transition-all duration-500 rounded-2xl font-serif font-light text-base"
              >
                <Plus className="w-5 h-5 mr-3" />
                Open New Crossroads
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Decision detail view */}
      <AnimatePresence>
        {selectedDecision && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.95 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="border-primary/20 shadow-xl shadow-primary/10 bg-gradient-to-br from-card via-card to-primary/5 overflow-hidden rounded-2xl">
              <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl font-serif font-normal text-foreground">
                      {selectedDecision.title}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-2 font-light">
                      {selectedDecision.paths.length} timelines explored
                    </p>
                  </div>
                  <Button
                    onClick={() => setSelectedDecision(null)}
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-foreground font-light"
                  >
                    Close
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                {/* Existing paths */}
                {selectedDecision.paths.map((path, i) => (
                  <motion.div
                    key={path.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={cn(
                      "p-5 rounded-xl border transition-all duration-500 cursor-pointer group",
                      path.explored
                        ? "bg-gradient-to-r from-muted/50 to-transparent border-border/50 hover:border-primary/30"
                        : "bg-card border-primary/30 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center text-sm font-serif font-light",
                            path.explored
                              ? "bg-primary/15 text-primary border border-primary/20"
                              : "bg-muted text-muted-foreground border border-border"
                          )}
                        >
                          {i + 1}
                        </div>
                        <span className="font-serif font-light text-foreground group-hover:text-primary transition-colors">{path.label}</span>
                      </div>
                      {path.explored && (
                        <span className="text-xs text-primary/70 font-light font-serif italic">Explored</span>
                      )}
                    </div>
                  </motion.div>
                ))}

                {/* Add path button */}
                <Button
                  variant="outline"
                  className="w-full border-dashed border-primary/30 hover:border-primary/50 text-muted-foreground hover:text-foreground font-serif font-light rounded-xl h-14"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Reveal Another Timeline
                </Button>

                {/* AI insight */}
                <div className="p-5 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 rounded-xl border border-primary/20">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                      <Sparkles className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-serif text-primary mb-2">
                        Cosmic Insight
                      </p>
                      <p className="text-sm text-muted-foreground leading-relaxed font-light font-serif italic">
                        &ldquo;Based on your reflections, you seem most energized when
                        discussing the freelancing path. The universe responds to that energy.&rdquo;
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Decisions list */}
      {!selectedDecision && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-4"
        >
          {decisions.map((decision, i) => (
            <motion.div
              key={decision.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 + i * 0.08 }}
            >
              <Card
                className="border-border/50 shadow-lg shadow-primary/5 hover:shadow-xl hover:shadow-primary/10 hover:border-primary/30 transition-all duration-500 cursor-pointer bg-card/80 backdrop-blur-sm rounded-2xl overflow-hidden group"
                onClick={() => setSelectedDecision(decision)}
              >
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-accent/10 border border-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                        <GitFork className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-serif font-normal text-foreground group-hover:text-primary transition-colors">{decision.title}</p>
                        <p className="text-xs text-muted-foreground font-light mt-1">
                          {decision.paths.length} paths in the cosmic web
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  )
}
