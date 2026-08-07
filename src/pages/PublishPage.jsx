import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppShell from '../components/layout/AppShell.jsx'
import PageHeader from '../components/layout/PageHeader.jsx'
import PrimaryButton from '../components/buttons/PrimaryButton.jsx'
import { useEventDraft } from '../context/EventDraftContext.jsx'
import repository from '../data/repositoryInstance.js'

export default function PublishPage() {
  const navigate = useNavigate()
  const { draft, setEvent } = useEventDraft()
  const [summary, setSummary] = useState(null)

  const refresh = useCallback(async () => {
    if (!draft.event) return
    const [guests, tables, scheduleItems] = await Promise.all([
      repository.getGuests(draft.event.id),
      repository.getTables(draft.event.id),
      repository.getScheduleItems(draft.event.id)
    ])
    const locations = new Set(scheduleItems.map((s) => s.locationName))
    setSummary({ guestCount: guests.length, tableCount: tables.length, locationCount: locations.size })
  }, [draft.event])

  useEffect(() => {
    if (!draft.event) {
      navigate('/create/tables', { replace: true })
      return
    }
    refresh()
  }, [draft.event, navigate, refresh])

  if (!draft.event || !summary) return null

  const displayDate = new Intl.DateTimeFormat('hr-HR', { day: 'numeric', month: 'long', year: 'numeric' }).format(
    new Date(draft.event.date)
  )

  async function publish() {
    const updated = await repository.publishEvent(draft.event.id)
    setEvent(updated)
    navigate('/create/share')
  }

  return (
    <AppShell>
      <PageHeader title="4. Objavi" step={4} totalSteps={4} onBack={() => navigate('/create/tables')} />

      <div className="mt-6 rounded-lg bg-white p-5 shadow-card">
        <p className="font-display text-xl text-charcoal">{draft.event.title}</p>
        <p className="mt-1 font-ui text-sm text-charcoal-soft">{displayDate}</p>
        <dl className="mt-4 space-y-1 font-ui text-sm text-charcoal">
          <div>{summary.guestCount} gosta</div>
          <div>{summary.tableCount} stola</div>
          <div>{summary.locationCount} lokacije</div>
        </dl>
      </div>

      <div className="mt-6">
        <PrimaryButton onClick={publish}>Objavi stranicu</PrimaryButton>
      </div>
    </AppShell>
  )
}
