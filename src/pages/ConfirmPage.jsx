import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AppShell from '../components/layout/AppShell.jsx'
import PageHeader from '../components/layout/PageHeader.jsx'
import PrimaryButton from '../components/buttons/PrimaryButton.jsx'
import SecondaryButton from '../components/buttons/SecondaryButton.jsx'
import ExtractedDataCard from '../components/upload/ExtractedDataCard.jsx'
import { useEventDraft } from '../context/EventDraftContext.jsx'
import repository from '../data/repositoryInstance.js'

export default function ConfirmPage() {
  const navigate = useNavigate()
  const { draft, setEvent } = useEventDraft()

  useEffect(() => {
    if (!draft.extractedData) navigate('/create/upload', { replace: true })
  }, [draft.extractedData, navigate])

  if (!draft.extractedData) return null

  const { title, date, scheduleItems } = draft.extractedData
  const displayDate = new Intl.DateTimeFormat('hr-HR', { day: 'numeric', month: 'long', year: 'numeric' }).format(
    new Date(date)
  )

  async function confirm() {
    const event = await repository.createEvent({ title, type: draft.event?.type ?? 'other', date })
    await repository.addScheduleItems(
      event.id,
      scheduleItems.map((item) => ({ time: item.time, title: item.title, locationName: item.locationName }))
    )
    setEvent(event)
    navigate('/create/guests')
  }

  return (
    <AppShell>
      <PageHeader title="Potvrdi podatke" step={1} totalSteps={4} onBack={() => navigate('/create/upload')} />
      <div className="mt-6 space-y-4">
        <ExtractedDataCard title={title} date={displayDate} scheduleItems={scheduleItems} />
        <PrimaryButton onClick={confirm}>Potvrdi podatke</PrimaryButton>
        <SecondaryButton onClick={() => navigate('/create/upload')}>Promijeni</SecondaryButton>
      </div>
    </AppShell>
  )
}
