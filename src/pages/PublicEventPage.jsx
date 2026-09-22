import { useEffect, useMemo, useState } from 'react'
import { Heart, MapPin, MapPinned } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import AppShell from '../components/layout/AppShell.jsx'
import AccessModeSwitch from '../components/guestpage/AccessModeSwitch.jsx'
import AdminUnlockSheet from '../components/guestpage/AdminUnlockSheet.jsx'
// import SearchGuestCard from '../components/guestpage/SearchGuestCard.jsx'
// import TableResultCard from '../components/guestpage/TableResultCard.jsx'
import ScheduleRow from '../components/guestpage/ScheduleRow.jsx'
import TableMap from '../components/tables/TableMap.jsx'
import SeatingAssignmentOverview from '../components/tables/SeatingAssignmentOverview.jsx'
import EventGallery from '../components/gallery/EventGallery.jsx'
import { useEventDraft } from '../context/EventDraftContext.jsx'
import { getPublicEventExtras } from '../data/publicEventExtras.js'
import {
  clearPublicAdminSession,
  hasPublicAdminSession,
  setPublicAdminSession
} from '../data/photoAdminSession.js'
import repository from '../data/repositoryInstance.js'

export default function PublicEventPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { setEvent } = useEventDraft()
  const [layout, setLayout] = useState(undefined)
  const [scheduleItems, setScheduleItems] = useState([])
  const [focusedTableId, setFocusedTableId] = useState(null)
  const [adminSheetOpen, setAdminSheetOpen] = useState(false)
  const [galleryAdminActive, setGalleryAdminActive] = useState(false)

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

  useEffect(() => {
    if (!layout?.event?.id) return
    setGalleryAdminActive(hasPublicAdminSession(sessionStorage, layout.event.id))
  }, [layout?.event?.id])

  const guestsByTable = useMemo(
    () => (layout?.tables ?? []).reduce((resultMap, table) => ({ ...resultMap, [table.id]: table.guests }), {}),
    [layout]
  )

  async function handleAdminUnlock(password) {
    const unlockedEvent = await repository.unlockAdmin(slug, password)
    setPublicAdminSession(sessionStorage, unlockedEvent.id)
    setGalleryAdminActive(true)
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

  const { event, tables, unassignedGuests = [] } = layout
  const { parking } = getPublicEventExtras(slug)
  const showScheduleSection = scheduleItems.length > 0 || Boolean(parking)
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
          onGuest={() => {
            if (layout?.event?.id) {
              clearPublicAdminSession(sessionStorage, layout.event.id)
              setGalleryAdminActive(false)
            }
            setAdminSheetOpen(false)
          }}
          onAdmin={() => setAdminSheetOpen(true)}
        />
      </div>

      <div className="mt-7">
        <EventGallery slug={slug} eventId={event.id} adminSessionActive={galleryAdminActive} />
      </div>

      {showScheduleSection && (
        <section className="mt-8" aria-labelledby="public-schedule-title">
          <h2 id="public-schedule-title" className="font-display text-2xl text-charcoal">Raspored događaja</h2>
          <div className="mt-2 overflow-hidden rounded-lg bg-white shadow-card">
            {scheduleItems.length > 0 && (
              <ul className="px-4">
                {scheduleItems.map((item) => <ScheduleRow key={item.id} {...item} />)}
              </ul>
            )}
            {parking && (
              <div className={`flex items-center justify-between px-4 py-3 ${scheduleItems.length > 0 ? 'border-t border-cream' : ''}`}>
                <p className="font-ui text-base font-semibold text-charcoal">{parking.label}</p>
                <a
                  href={parking.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Otvori ${parking.label} na karti`}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-gold-deep hover:bg-cream"
                >
                  <MapPin size={20} strokeWidth={1.5} aria-hidden="true" />
                </a>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Sekcija „Gdje sjedim?” (pretraga stola) privremeno isključena
      <div className="mt-8">
        <SearchGuestCard onSearch={handleSearch} status={status} guestName={foundName} />
      </div>
      */}

      <section className="mt-8" aria-labelledby="public-map-title">
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
            onFocusTable={setFocusedTableId}
            onCloseFocus={() => setFocusedTableId(null)}
            readOnly
          />
        </div>
        <div className="mt-4 rounded-lg bg-white/80 p-4 shadow-card">
          <SeatingAssignmentOverview
            tables={tables}
            guestsByTable={guestsByTable}
            unassignedGuests={unassignedGuests}
          />
        </div>
      </section>

      {/* {result && (
        <div className="mt-6">
          <TableResultCard tableName={result.table.name} />
        </div>
      )} */}

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
