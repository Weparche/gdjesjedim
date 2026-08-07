import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { EventDraftProvider } from './context/EventDraftContext.jsx'

function LandingPlaceholder() {
  return (
    <main className="min-h-screen bg-ivory flex items-center justify-center">
      <h1 className="font-display text-2xl text-charcoal">GdjeSjedim.hr</h1>
    </main>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <EventDraftProvider>
        <div className="mx-auto max-w-[480px] min-h-screen bg-ivory">
          <Routes>
            <Route path="/" element={<LandingPlaceholder />} />
          </Routes>
        </div>
      </EventDraftProvider>
    </BrowserRouter>
  )
}
