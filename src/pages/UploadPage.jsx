import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, User, Calendar, MapPin, Utensils } from 'lucide-react'
import AppShell from '../components/layout/AppShell.jsx'
import PageHeader from '../components/layout/PageHeader.jsx'
import PrimaryButton from '../components/buttons/PrimaryButton.jsx'
import SecondaryButton from '../components/buttons/SecondaryButton.jsx'
import InvitationUploader from '../components/upload/InvitationUploader.jsx'
import InvitationPreview from '../components/upload/InvitationPreview.jsx'
import { mockExtractedData } from '../lib/mockExtraction.js'
import { useEventDraft } from '../context/EventDraftContext.jsx'

export default function UploadPage() {
  const navigate = useNavigate()
  const { setExtractedData } = useEventDraft()
  const [uploaded, setUploaded] = useState(false)
  const data = mockExtractedData()

  function confirm() {
    setExtractedData(data)
    navigate('/create/confirm')
  }

  return (
    <AppShell>
      <PageHeader title="1. Učitaj pozivnicu" step={1} totalSteps={4} />

      <div className="mt-6">
        {!uploaded ? (
          <InvitationUploader onFileSelected={() => setUploaded(true)} />
        ) : (
          <div className="space-y-4">
            <InvitationPreview />

            <div className="rounded-lg bg-white p-4 shadow-card">
              <p className="flex items-center gap-2 font-ui text-sm font-semibold text-gold">
                <Sparkles size={16} strokeWidth={1.5} aria-hidden="true" />
                AI je pročitao podatke
              </p>
              <dl className="mt-3 space-y-2 font-ui text-sm text-charcoal">
                <div className="flex items-center gap-2">
                  <User size={16} strokeWidth={1.5} className="text-charcoal-soft" aria-hidden="true" />
                  <dd>{data.title}</dd>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={16} strokeWidth={1.5} className="text-charcoal-soft" aria-hidden="true" />
                  <dd>26.9.2026.</dd>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={16} strokeWidth={1.5} className="text-charcoal-soft" aria-hidden="true" />
                  <dd>12:00 · Crkva Sv. Mati Slobode</dd>
                </div>
                <div className="flex items-center gap-2">
                  <Utensils size={16} strokeWidth={1.5} className="text-charcoal-soft" aria-hidden="true" />
                  <dd>13:00 · Lido</dd>
                </div>
              </dl>
            </div>

            <PrimaryButton onClick={confirm}>Potvrdi podatke</PrimaryButton>
            <SecondaryButton onClick={() => setUploaded(false)}>Promijeni</SecondaryButton>
          </div>
        )}
      </div>
    </AppShell>
  )
}
