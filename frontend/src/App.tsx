import { Navigate, Route, Routes } from 'react-router-dom'
import { Nav } from './components/Nav'
import { Dashboard } from './pages/Dashboard'
import { VoiceJournal } from './pages/VoiceJournal'
import { FutureSelves } from './pages/FutureSelves'
import { Timeline } from './pages/Timeline'

export default function App() {
  return (
    <div className="min-h-screen">
      <div className="fm-orb fm-orb--lavender" />
      <div className="fm-orb fm-orb--mist" />
      <div className="fm-orb fm-orb--rose" />

      <Nav />

      <main className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-16 pt-8">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/journal" element={<VoiceJournal />} />
          <Route path="/selves" element={<FutureSelves />} />
          <Route path="/timeline" element={<Timeline />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        <div className="mt-10 text-center text-[12px] text-textSoft">
          Future Fighter — Build the version of you who wins.
        </div>
      </main>
    </div>
  )
}

