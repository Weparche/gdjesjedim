import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, Armchair, MapPin } from 'lucide-react'
import { pluralizeGostiNominative, pluralizeStolovi, pluralizeLokacije, pluralizeNema } from '../lib/plural.js'
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
    setSummary({
      guestCount: guests.length,
      tableCount: tables.length,
      locationCount: locations.size,
      unassignedCount: guests.filter((g) => g.tableId == null).length
    })
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
      <PageHeader title="3. Objavi" step={3} totalSteps={3} onBack={() => navigate('/create/tables')} />

      <div className="mt-6 rounded-lg bg-white p-5 shadow-card">
        <p className="font-display text-xl text-charcoal">{draft.event.title}</p>
        <p className="mt-1 font-ui text-sm text-charcoal-soft">{displayDate}</p>
        <ul className="mt-4 space-y-2 font-ui text-sm text-charcoal">
          <li className="flex items-center gap-2">
            <Users size={16} strokeWidth={1.5} className="shrink-0 text-gold-deep" aria-hidden="true" />
            {summary.guestCount} {pluralizeGostiNominative(summary.guestCount)}
          </li>
          <li className="flex items-center gap-2">
            <Armchair size={16} strokeWidth={1.5} className="shrink-0 text-gold-deep" aria-hidden="true" />
            {summary.tableCount} {pluralizeStolovi(summary.tableCount)}
          </li>
          <li className="flex items-center gap-2">
            <MapPin size={16} strokeWidth={1.5} className="shrink-0 text-gold-deep" aria-hidden="true" />
            {summary.locationCount} {pluralizeLokacije(summary.locationCount)}
          </li>
        </ul>

        {summary.unassignedCount > 0 && (
          <p className="mt-4 rounded-md bg-cream p-3 font-ui text-sm text-charcoal">
            {summary.unassignedCount} {pluralizeGostiNominative(summary.unassignedCount)} još{' '}
            {pluralizeNema(summary.unassignedCount)} stol. Možeš objaviti sada i rasporediti ih kasnije.
          </p>
        )}
      </div>

      <div className="mt-6">
        <PrimaryButton onClick={publish}>Objavi stranicu</PrimaryButton>
      </div>
    </AppShell>
  )
}
