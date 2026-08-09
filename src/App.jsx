import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { EventDraftProvider } from './context/EventDraftContext.jsx'
import { ToastProvider } from './components/common/Toast.jsx'
import ErrorBoundary from './components/common/ErrorBoundary.jsx'
import PageTransition from './components/layout/PageTransition.jsx'
import LandingPage from './pages/LandingPage.jsx'
import UploadPage from './pages/UploadPage.jsx'
import ConfirmPage from './pages/ConfirmPage.jsx'
import TablesPage from './pages/TablesPage.jsx'
import PublishPage from './pages/PublishPage.jsx'
import SharePage from './pages/SharePage.jsx'
import PublicEventPage from './pages/PublicEventPage.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <EventDraftProvider>
          <div className="mx-auto max-w-[480px] min-h-screen bg-ivory">
            <ErrorBoundary>
            <PageTransition>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/create/upload" element={<UploadPage />} />
              <Route path="/create/confirm" element={<ConfirmPage />} />
              <Route path="/create/guests" element={<Navigate to="/create/tables" replace />} />
              <Route path="/create/tables" element={<TablesPage />} />
              <Route path="/create/publish" element={<PublishPage />} />
              <Route path="/create/share" element={<SharePage />} />
              <Route path="/e/:slug" element={<PublicEventPage />} />
            </Routes>
            </PageTransition>
            </ErrorBoundary>
          </div>
        </EventDraftProvider>
      </ToastProvider>
    </BrowserRouter>
  )
}
