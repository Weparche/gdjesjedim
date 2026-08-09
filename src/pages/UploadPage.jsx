import { useEffect, useState } from 'react'
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
import { getInvitation, saveInvitation } from '../data/invitationStore.js'
import { generateId } from '../lib/id.js'

const SCHEDULE_ICONS = [MapPin, Utensils]

function formatCroatianDate(isoDate) {
  const [year, month, day] = isoDate.split('-').map(Number)
  return `${day}.${month}.${year}.`
}

export default function UploadPage() {
  const navigate = useNavigate()
  const { draft, setExtractedData, setInvitation } = useEventDraft()
  const [uploaded, setUploaded] = useState(Boolean(draft.invitation))
  const [previewSrc, setPreviewSrc] = useState('')
  const data = mockExtractedData()

  useEffect(() => {
    let objectUrl = ''
    let cancelled = false
    async function loadInvitation() {
      if (!draft.invitation?.key) return
      const file = await getInvitation(draft.invitation.key).catch(() => null)
      if (!file || cancelled) return
      objectUrl = URL.createObjectURL(file)
      setPreviewSrc(objectUrl)
      setUploaded(true)
    }
    loadInvitation()
    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [draft.invitation])

  function confirm() {
    setExtractedData(data)
    navigate('/create/confirm')
  }

  async function handleFileSelected(file) {
    const key = `invitation-${generateId()}`
    await saveInvitation(key, file)
    setInvitation({ key, name: file.name, type: file.type, size: file.size })
    setPreviewSrc(URL.createObjectURL(file))
    setUploaded(true)
  }

  return (
    <AppShell>
      <PageHeader title="1. Učitaj pozivnicu" step={1} totalSteps={3} />

      <div className="mt-6">
        {!uploaded ? (
          <div>
            <p className="mb-3 font-ui text-base leading-relaxed text-charcoal-soft">
              Učitaj sliku pozivnice. Pročitat ćemo naziv proslave, datum i raspored, a ti ih možeš
              ispraviti u sljedećem koraku.
            </p>
            <InvitationUploader onFileSelected={handleFileSelected} />
          </div>
        ) : (
          <div className="space-y-4">
            <InvitationPreview src={previewSrc} type={draft.invitation?.type} name={draft.invitation?.name} />

            <div className="rounded-lg bg-white p-4 shadow-card">
              <p className="flex items-center gap-2 font-ui text-sm font-semibold text-charcoal">
                <Sparkles size={16} strokeWidth={1.5} className="text-gold-deep" aria-hidden="true" />
                AI je pročitao podatke
              </p>
              <dl className="mt-3 space-y-2 font-ui text-sm text-charcoal">
                <div className="flex items-center gap-2">
                  <User size={16} strokeWidth={1.5} className="text-charcoal-soft" aria-hidden="true" />
                  <dd>{data.title}</dd>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={16} strokeWidth={1.5} className="text-charcoal-soft" aria-hidden="true" />
                  <dd>{formatCroatianDate(data.date)}</dd>
                </div>
                {data.scheduleItems.map((item, index) => {
                  const Icon = SCHEDULE_ICONS[index] ?? MapPin
                  return (
                    <div key={`${item.time}-${item.locationName}`} className="flex items-center gap-2">
                      <Icon size={16} strokeWidth={1.5} className="text-charcoal-soft" aria-hidden="true" />
                      <dd>{item.time} · {item.locationName}</dd>
                    </div>
                  )
                })}
              </dl>
            </div>

            <PrimaryButton onClick={confirm}>Potvrdi podatke</PrimaryButton>
            <SecondaryButton
              onClick={() => {
                setInvitation(null)
                setPreviewSrc('')
                setUploaded(false)
              }}
            >
              Promijeni
            </SecondaryButton>
          </div>
        )}
      </div>
    </AppShell>
  )
}
