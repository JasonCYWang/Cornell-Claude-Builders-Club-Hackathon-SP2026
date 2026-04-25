export type MoodKey =
  | 'joyful'
  | 'hopeful'
  | 'calm'
  | 'anxious'
  | 'stuck'
  | 'sad'
  | 'restless'
  | 'frustrated'
  | 'overwhelmed'
  | 'grateful'

export type JournalEntry = {
  id: string
  date: string
  dateKey: string
  duration: string
  audioUrl?: string
  transcript: string
  summary: string
  mood: MoodKey
  moodLabel: string
  moodColor: string
  emotionalThemes: string[]
  patternDetected: string
  nextQuestion?: string
}

export type CalendarEntriesMap = Record<string, JournalEntry[]>

export type CalendarDaySummary = {
  count: number
  mood: MoodKey
  moodColor: string
}
export type CalendarSummaryMap = Record<string, CalendarDaySummary>

export type FutureSelfType =
  | 'ceo'
  | 'brutal'
  | 'zen'
  | 'villain'
  | 'main-character'
  | 'risk-taker'
  | 'soft-life'

export type FutureSelfMeta = {
  id: FutureSelfType
  name: string
  subtitle: string
  emoji: string
  gradientClass: string
  strength?: string
  weakness?: string
  specialMove?: string
}

export type ReflectionResponse = {
  letter: string
  futureSelfType: FutureSelfType
  source?: 'gemini' | 'fallback'
}

export type ApprovalResponse = {
  badge: 'Approved' | 'Character Development' | 'Deeply Concerning' | 'Villain Origin Story' | 'Future Cringe Detected'
  reason: string
}

export type DelusionResponse = {
  severity: 'Low' | 'Medium' | 'High' | 'Extreme'
  message: string
}

