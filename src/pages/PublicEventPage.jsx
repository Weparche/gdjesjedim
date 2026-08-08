import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Heart } from 'lucide-react'
import AppShell from '../components/layout/AppShell.jsx'
import SearchGuestCard from '../components/guestpage/SearchGuestCard.jsx'
import TableResultCard from '../components/guestpage/TableResultCard.jsx'
import ScheduleRow from '../components/guestpage/ScheduleRow.jsx'
import repository from '../data/repositoryInstance.js'

export default function PublicEventPage() {
  const { slug } = useParams()
  const [event, setEvent] = useState(undefined)
  const [scheduleItems, setScheduleItems] = useState([])
  const [result, setResult] = useState(null)
  // null | 'notFound' | 'noTable' — a guest who exists but has no table yet used
  // to be told they don't exist, so they would retype their own name forever.
  const [status, setStatus] = useState(null)
  const [foundName, setFoundName] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const found = await repository.getEventBySlug(slug)
        setEvent(found ?? null)
        if (found) setScheduleItems(await repository.getScheduleItems(found.id))
      } catch {
        setEvent(null)
      }
    }
    load()
  }, [slug])

  async function handleSearch(query) {
    const found = await repository.searchGuest(slug, query)
    if (found && found.table) {
      setResult(found)
      setFoundName(found.guest.name)
      setStatus(null)
    } else if (found) {
      setResult(null)
      setFoundName(found.guest.name)
      setStatus('noTable')
    } else {
      setResult(null)
      setFoundName('')
      setStatus('notFound')
    }
  }

  if (event === undefined) return null

  if (event === null) {
    return (
      <AppShell>
        <p className="mt-10 text-center font-ui text-base text-charcoal-soft">Stranica nije pronađena.</p>
      </AppShell>
    )
  }

  const displayDate = new Intl.DateTimeFormat('hr-HR', { day: 'numeric', month: 'long', year: 'numeric' }).format(
    new Date(event.date)
  )

  return (
    <AppShell>
      <div className="text-center">
        <h1 className="font-display text-2xl text-charcoal">{event.title}</h1>
        <p className="mt-1 font-ui text-base text-charcoal-soft">{displayDate}</p>
      </div>

      <div className="mt-6">
        <SearchGuestCard onSearch={handleSearch} status={status} guestName={foundName} />
      </div>

      {result && (
        <div className="mt-6">
          <TableResultCard tableName={result.table.name} />
        </div>
      )}

      {scheduleItems.length > 0 && (
        <div className="mt-6">
          <p className="font-ui text-sm font-semibold text-charcoal-soft">Raspored događaja</p>
          <ul className="mt-2 rounded-lg bg-white px-4 shadow-card">
            {scheduleItems.map((item) => (
              <ScheduleRow key={item.id} {...item} />
            ))}
          </ul>
        </div>
      )}

      {/* Blush is reserved for the decorative heart here: as running text on
          ivory it measures 1.80:1, well under AA. */}
      <p className="mt-10 flex items-center justify-center gap-1.5 font-ui text-sm text-charcoal-soft">
        <Heart size={14} strokeWidth={1.5} className="text-blush" aria-hidden="true" />
        Hvala što ste s nama
      </p>
    </AppShell>
  )
}
