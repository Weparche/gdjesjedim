import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
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
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    async function load() {
      const found = await repository.getEventBySlug(slug)
      setEvent(found ?? null)
      if (found) setScheduleItems(await repository.getScheduleItems(found.id))
    }
    load()
  }, [slug])

  async function handleSearch(query) {
    const found = await repository.searchGuest(slug, query)
    if (found && found.table) {
      setResult(found)
      setNotFound(false)
    } else {
      setResult(null)
      setNotFound(true)
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
        <p className="mt-1 font-ui text-sm text-charcoal-soft">{displayDate}</p>
      </div>

      <div className="mt-6">
        <SearchGuestCard onSearch={handleSearch} notFound={notFound} />
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
    </AppShell>
  )
}
