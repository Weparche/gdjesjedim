import { useEffect, useMemo, useState } from 'react'
import { Heart, MapPinned } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import AppShell from '../components/layout/AppShell.jsx'
import AccessModeSwitch from '../components/guestpage/AccessModeSwitch.jsx'
import AdminUnlockSheet from '../components/guestpage/AdminUnlockSheet.jsx'
import SearchGuestCard from '../components/guestpage/SearchGuestCard.jsx'
import TableResultCard from '../components/guestpage/TableResultCard.jsx'
import ScheduleRow from '../components/guestpage/ScheduleRow.jsx'
import TableMap from '../components/tables/TableMap.jsx'
import EventGallery from '../components/gallery/EventGallery.jsx'
import { useEventDraft } from '../context/EventDraftContext.jsx'
import repository from '../data/repositoryInstance.js'

export default function PublicEventPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { setEvent } = useEventDraft()
  const [layout, setLayout] = useState(undefined)
  const [scheduleItems, setScheduleItems] = useState([])
  const [result, setResult] = useState(null)
  const [status, setStatus] = useState(null)
  const [foundName, setFoundName] = useState('')
  const [focusedTableId, setFocusedTableId] = useState(null)
  const [adminSheetOpen, setAdminSheetOpen] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const nextLayout = await repository.getPublishedLayout(slug)
        setLayout(nextLayout ?? null)
        if (nextLayout) setScheduleItems(await repository.getScheduleItems(nextLayout.event.id))
      } catch {
        setLayout(null)
      }
    }
    load()
  }, [slug])

  async function handleSearch(query) {
    const found = await repository.searchGuest(slug, query)
    if (found && found.table) {
      setResult(found)
      setFoundName(found.guest.name)
      setFocusedTableId(found.table.id)
      setStatus(null)
    } else if (found) {
      setResult(null)
      setFoundName(found.guest.name)
      setFocusedTableId(null)
      setStatus('noTable')
    } else {
      setResult(null)
      setFoundName('')
      setFocusedTableId(null)
      setStatus('notFound')
    }
  }

  const guestsByTable = useMemo(
    () => (layout?.tables ?? []).reduce((resultMap, table) => ({ ...resultMap, [table.id]: table.guests }), {}),
    [layout]
  )

  async function handleAdminUnlock(password) {
    const unlockedEvent = await repository.unlockAdmin(slug, password)
    setEvent(unlockedEvent)
    navigate('/create/tables')
  }

  if (layout === undefined) return null

  if (layout === null) {
    return (
      <AppShell>
        <p className="mt-10 text-center font-ui text-base text-charcoal-soft">Stranica nije pronađena.</p>
      </AppShell>
    )
  }

  const { event, tables } = layout
  const displayDate = new Intl.DateTimeFormat('hr-HR', { day: 'numeric', month: 'long', year: 'numeric' }).format(
    new Date(event.date)
  )

  return (
    <AppShell className="pb-12">
      <div className="pt-2 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-pill bg-cream">
          <MapPinned size={22} strokeWidth={1.5} className="text-gold-deep" aria-hidden="true" />
        </div>
        <h1 className="mt-3 font-display text-3xl text-charcoal">{event.title}</h1>
        <p className="mt-1 font-ui text-base text-charcoal-soft">{displayDate}</p>
      </div>

      <div className="mt-5">
        <AccessModeSwitch
          adminPending={adminSheetOpen}
          onGuest={() => setAdminSheetOpen(false)}
          onAdmin={() => setAdminSheetOpen(true)}
        />
      </div>

      <div className="mt-7">
        <EventGallery slug={slug} />
      </div>

      <div className="mt-8">
        <SearchGuestCard onSearch={handleSearch} status={status} guestName={foundName} />
      </div>

      <section className="mt-6" aria-labelledby="public-map-title">
        <div className="flex items-baseline justify-between gap-3">
          <div>
            <h2 id="public-map-title" className="font-display text-2xl text-charcoal">Raspored stolova</h2>
            <p className="mt-1 font-ui text-sm text-charcoal-soft">Pronađi poznata lica ili svoj stol.</p>
          </div>
          <span className="rounded-pill bg-cream px-3 py-1 font-ui text-xs font-semibold text-charcoal-soft">
            {tables.length} {tables.length === 1 ? 'stol' : 'stolova'}
          </span>
        </div>
        <div className="mt-3">
          <TableMap
            tables={tables}
            guestsByTable={guestsByTable}
            focusedTableId={focusedTableId}
            highlightedTableId={result?.table?.id}
            highlightedGuestId={result?.guest?.id}
            onFocusTable={setFocusedTableId}
            onCloseFocus={() => setFocusedTableId(null)}
            readOnly
          />
        </div>
      </section>

      {result && (
        <div className="mt-6">
          <TableResultCard tableName={result.table.name} />
        </div>
      )}

      {scheduleItems.length > 0 && (
        <div className="mt-6">
          <p className="font-ui text-sm font-semibold text-charcoal-soft">Raspored događaja</p>
          <ul className="mt-2 rounded-lg bg-white px-4 shadow-card">
            {scheduleItems.map((item) => <ScheduleRow key={item.id} {...item} />)}
          </ul>
        </div>
      )}

      <p className="mt-10 flex items-center justify-center gap-1.5 font-ui text-sm text-charcoal-soft">
        <Heart size={14} strokeWidth={1.5} className="text-blush" aria-hidden="true" />
        Hvala što ste s nama
      </p>

      <AdminUnlockSheet
        open={adminSheetOpen}
        eventTitle={event.title}
        onClose={() => setAdminSheetOpen(false)}
        onUnlock={handleAdminUnlock}
      />
    </AppShell>
  )
}
