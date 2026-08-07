import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { EventDraftProvider } from './context/EventDraftContext.jsx'
import { ToastProvider } from './components/common/Toast.jsx'
import LandingPage from './pages/LandingPage.jsx'
import UploadPage from './pages/UploadPage.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <EventDraftProvider>
          <div className="mx-auto max-w-[480px] min-h-screen bg-ivory">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/create/upload" element={<UploadPage />} />
            </Routes>
          </div>
        </EventDraftProvider>
      </ToastProvider>
    </BrowserRouter>
  )
}
