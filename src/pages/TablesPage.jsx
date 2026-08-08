import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, ChevronRight } from 'lucide-react'
import AppShell from '../components/layout/AppShell.jsx'
import PageHeader from '../components/layout/PageHeader.jsx'
import PrimaryButton from '../components/buttons/PrimaryButton.jsx'
import SecondaryButton from '../components/buttons/SecondaryButton.jsx'
import TableCard from '../components/tables/TableCard.jsx'
import TableSelectorSheet from '../components/tables/TableSelectorSheet.jsx'
import { useEventDraft } from '../context/EventDraftContext.jsx'
import repository from '../data/repositoryInstance.js'

export default function TablesPage() {
  const navigate = useNavigate()
  const { draft } = useEventDraft()
  const [tables, setTables] = useState([])
  const [guests, setGuests] = useState([])
  const [activeGuestId, setActiveGuestId] = useState(null)
  const [isAddingTable, setIsAddingTable] = useState(false)
  // Ref backs the reentrancy check so it's synchronous even if two clicks land
  // before React re-renders the disabled button (state alone can't guarantee that).
  const isAddingTableRef = useRef(false)

  const refresh = useCallback(async () => {
    if (!draft.event) return
    const [t, g] = await Promise.all([repository.getTables(draft.event.id), repository.getGuests(draft.event.id)])
    setTables(t)
    setGuests(g)
  }, [draft.event])

  useEffect(() => {
    if (!draft.event) {
      navigate('/create/guests', { replace: true })
      return
    }
    refresh()
  }, [draft.event, navigate, refresh])

  if (!draft.event) return null

  async function addTable() {
    if (isAddingTableRef.current) return
    isAddingTableRef.current = true
    setIsAddingTable(true)
    try {
      await repository.addTables(draft.event.id, [{ name: `Stol ${tables.length + 1}`, capacity: 8 }])
      await refresh()
    } finally {
      isAddingTableRef.current = false
      setIsAddingTable(false)
    }
  }

  async function assign(tableId) {
    await repository.assignGuestToTable(activeGuestId, tableId)
    setActiveGuestId(null)
    refresh()
  }

  function countAt(tableId) {
    return guests.filter((g) => g.tableId === tableId).length
  }

  const assignedCount = guests.filter((g) => g.tableId != null).length
  const activeGuest = guests.find((g) => g.id === activeGuestId)

  return (
    <AppShell>
      <PageHeader title="3. Stolovi" step={3} totalSteps={4} onBack={() => navigate('/create/guests')} />

      <div className="mt-6">
        <p className="font-ui text-sm font-semibold text-charcoal-soft">Stolovi</p>
        <div className="mt-2 grid grid-cols-2 gap-3">
          {tables.map((table) => (
            <TableCard key={table.id} table={table} assignedCount={countAt(table.id)} />
          ))}
        </div>
        <div className="mt-3">
          <SecondaryButton onClick={addTable} disabled={isAddingTable} className="!min-h-[44px] justify-start gap-2">
            <Plus size={18} strokeWidth={1.5} aria-hidden="true" />
            Dodaj stol
          </SecondaryButton>
        </div>
      </div>

      <div className="mt-6">
        <div className="flex items-baseline justify-between">
          <p className="font-ui text-sm font-semibold text-charcoal-soft">Gosti</p>
          <p className="font-ui text-sm text-charcoal-soft">
            {assignedCount}/{guests.length} raspoređeno
          </p>
        </div>
        <p className="mt-1 font-ui text-sm text-charcoal-soft">
          Dodirni ime gosta i odaberi njegov stol.
        </p>
        <ul className="mt-2 rounded-lg bg-white px-4 shadow-card">
          {guests.map((guest) => {
            const table = tables.find((t) => t.id === guest.tableId)
            return (
              <li key={guest.id} className="flex items-center justify-between border-b border-cream py-1 last:border-b-0">
                <button
                  type="button"
                  onClick={() => setActiveGuestId(guest.id)}
                  className="flex min-h-[44px] flex-1 items-center gap-2 text-left font-ui text-base text-charcoal"
                >
                  {guest.name}
                  {!table && (
                    <ChevronRight
                      size={16}
                      strokeWidth={1.5}
                      className="shrink-0 text-charcoal-soft"
                      aria-hidden="true"
                    />
                  )}
                </button>
                {table && (
                  <span className="rounded-pill bg-cream px-3 py-1 font-ui text-xs font-semibold text-charcoal">
                    {table.name}
                  </span>
                )}
              </li>
            )
          })}
        </ul>
      </div>

      <div className="mt-6">
        <PrimaryButton disabled={tables.length === 0} onClick={() => navigate('/create/publish')}>
          Nastavi na objavu
        </PrimaryButton>
      </div>

      <TableSelectorSheet
        open={activeGuestId != null}
        onClose={() => setActiveGuestId(null)}
        tables={tables}
        onSelect={assign}
        guestName={activeGuest?.name}
        assignedTableId={activeGuest?.tableId}
      />
    </AppShell>
  )
}
