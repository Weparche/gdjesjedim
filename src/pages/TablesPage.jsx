import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Plus, MousePointer2, Users } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import AppShell from '../components/layout/AppShell.jsx'
import PageHeader from '../components/layout/PageHeader.jsx'
import PrimaryButton from '../components/buttons/PrimaryButton.jsx'
import SecondaryButton from '../components/buttons/SecondaryButton.jsx'
import TableMap from '../components/tables/TableMap.jsx'
import TableEditorSheet from '../components/tables/TableEditorSheet.jsx'
import TableSelectorSheet from '../components/tables/TableSelectorSheet.jsx'
import GuestImportTextarea from '../components/guests/GuestImportTextarea.jsx'
import BottomSheet from '../components/common/BottomSheet.jsx'
import { useEventDraft } from '../context/EventDraftContext.jsx'
import repository from '../data/repositoryInstance.js'

export default function TablesPage() {
  const navigate = useNavigate()
  const { draft } = useEventDraft()
  const [tables, setTables] = useState([])
  const [guests, setGuests] = useState([])
  const [focusedTableId, setFocusedTableId] = useState(null)
  const [editingTableId, setEditingTableId] = useState(null)
  const [activeGuestId, setActiveGuestId] = useState(null)
  const [isGuestSheetOpen, setIsGuestSheetOpen] = useState(false)
  const [draggingGuestId, setDraggingGuestId] = useState(null)
  const dragRef = useRef({ id: null, x: 0, y: 0, moved: false })

  const refresh = useCallback(async () => {
    if (!draft.event) return
    const [nextTables, nextGuests] = await Promise.all([
      repository.getTables(draft.event.id),
      repository.getGuests(draft.event.id)
    ])
    setTables(nextTables)
    setGuests(nextGuests)
  }, [draft.event])

  useEffect(() => {
    if (!draft.event) {
      navigate('/create/upload', { replace: true })
      return
    }
    refresh()
  }, [draft.event, navigate, refresh])

  useEffect(() => {
    function onPointerMove(event) {
      if (!dragRef.current.id) return
      if (Math.hypot(event.clientX - dragRef.current.x, event.clientY - dragRef.current.y) > 6) {
        dragRef.current.moved = true
        setDraggingGuestId(dragRef.current.id)
        setFocusedTableId(null)
      }
    }

    async function onPointerUp(event) {
      const current = dragRef.current
      if (!current.id) return
      dragRef.current = { id: null, x: 0, y: 0, moved: false }
      setDraggingGuestId(null)
      const dropTarget = document.elementFromPoint(event.clientX, event.clientY)?.closest('[data-table-drop-id]')
      if (dropTarget?.dataset.tableDropId) {
        await assignGuest(current.id, dropTarget.dataset.tableDropId)
      } else if (!current.moved) {
        setActiveGuestId(current.id)
      }
    }

    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
    }
  })

  const guestsByTable = useMemo(
    () => tables.reduce((result, table) => ({ ...result, [table.id]: guests.filter((guest) => guest.tableId === table.id) }), {}),
    [tables, guests]
  )
  const unassignedGuests = guests.filter((guest) => guest.tableId == null)
  const editingTable = tables.find((table) => table.id === editingTableId)
  const activeGuest = guests.find((guest) => guest.id === activeGuestId)
  const assignedCount = guests.length - unassignedGuests.length

  if (!draft.event) return null

  async function addTable() {
    await repository.addTables(draft.event.id, [{ capacity: 8, shape: 'round' }])
    await refresh()
  }

  async function assignGuest(guestId, tableId) {
    await repository.assignGuestToTable(guestId, tableId)
    setActiveGuestId(null)
    setFocusedTableId(tableId ?? null)
    await refresh()
  }

  async function addGuests(names) {
    await repository.addGuests(draft.event.id, names)
    setIsGuestSheetOpen(false)
    await refresh()
  }

  async function updateTable(patch) {
    await repository.updateTable(editingTableId, patch)
    await refresh()
  }

  async function moveTable(id, position) {
    await repository.updateTable(id, position)
    await refresh()
  }

  async function deleteSelectedTable() {
    await repository.removeTable(editingTableId)
    if (focusedTableId === editingTableId) setFocusedTableId(null)
    setEditingTableId(null)
    await refresh()
  }

  function startGuestDrag(event, guestId) {
    event.preventDefault()
    dragRef.current = { id: guestId, x: event.clientX, y: event.clientY, moved: false }
  }

  return (
    <AppShell className="pb-28">
      <PageHeader title="2. Raspored stolova" step={2} totalSteps={3} onBack={() => navigate('/create/confirm')} />

      <div className="mt-5 rounded-lg bg-white/70 p-4 shadow-card">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-display text-xl text-charcoal">Složi svoju mapu</p>
            <p className="mt-1 font-ui text-sm leading-relaxed text-charcoal-soft">
              Povuci stol na mjesto, a zatim povuci ime gosta na njega.
            </p>
          </div>
          <span className="shrink-0 rounded-pill bg-cream px-3 py-1 font-ui text-xs font-semibold text-charcoal-soft">
            {assignedCount}/{guests.length}
          </span>
        </div>
      </div>

      <div className="mt-4">
        <TableMap
          tables={tables}
          guestsByTable={guestsByTable}
          focusedTableId={focusedTableId}
          highlightedTableId={null}
          highlightedGuestId={null}
          onMoveTable={moveTable}
          onFocusTable={setFocusedTableId}
          onCloseFocus={() => setFocusedTableId(null)}
          onEditTable={setEditingTableId}
          onGuestPointerDown={startGuestDrag}
          onGuestClick={setActiveGuestId}
          onGuestDrop={assignGuest}
          draggingGuestId={draggingGuestId}
        />
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <SecondaryButton onClick={addTable} className="!min-h-[48px] flex-1 justify-center gap-2">
          <Plus size={18} strokeWidth={1.5} aria-hidden="true" />
          Dodaj stol
        </SecondaryButton>
        <p className="flex items-center gap-1 font-ui text-xs text-charcoal-soft">
          <MousePointer2 size={14} strokeWidth={1.5} aria-hidden="true" />
          Dodirni stol za detalje
        </p>
      </div>

      <section className="mt-6 rounded-lg bg-white/80 p-4 shadow-card" aria-labelledby="guest-pool-title">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-pill bg-cream">
              <Users size={19} strokeWidth={1.5} className="text-gold-deep" aria-hidden="true" />
            </span>
            <div>
              <h2 id="guest-pool-title" className="font-display text-xl text-charcoal">Gosti</h2>
              <p className="font-ui text-xs text-charcoal-soft">Imena su prikazana oko stolova</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsGuestSheetOpen(true)}
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-pill border border-gold px-3 font-ui text-sm font-semibold text-charcoal transition-colors hover:bg-cream"
          >
            <Plus size={16} strokeWidth={1.5} aria-hidden="true" />
            Dodaj goste
          </button>
        </div>

        {unassignedGuests.length > 0 && (
          <div className="mt-4 rounded-md bg-cream/60 p-3">
            <div className="flex items-baseline justify-between gap-3">
              <p className="font-ui text-sm font-semibold text-charcoal">Gosti bez mjesta</p>
              <span className="font-ui text-xs text-charcoal-soft">{unassignedGuests.length}</span>
            </div>
            <p className="mt-1 font-ui text-xs text-charcoal-soft">Povuci ime na stol ili ga dodirni za izbor.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {unassignedGuests.map((guest) => (
                <button
                  key={guest.id}
                  type="button"
                  onPointerDown={(event) => startGuestDrag(event, guest.id)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      setActiveGuestId(guest.id)
                    }
                  }}
                  className={`min-h-[44px] rounded-pill border border-dashed border-gold/70 bg-white px-3 py-2 text-left font-ui text-sm font-semibold text-charcoal transition-all ${draggingGuestId === guest.id ? 'scale-105 shadow-elevated' : ''}`}
                  style={{ touchAction: 'none' }}
                  aria-label={guest.name}
                >
                  {guest.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4 border-t border-cream pt-3">
          <p className="font-ui text-xs font-semibold uppercase tracking-[0.14em] text-charcoal-soft">Pregled dodjele</p>
          <div className="mt-2 space-y-3">
            {tables.map((table) => {
              const tableGuests = guestsByTable[table.id] ?? []
              return (
                <section key={`assignment-table-${table.id}`} className="rounded-md border border-cream bg-ivory/70 p-2">
                  <div className="flex items-baseline justify-between gap-2 px-1">
                    <h3 className="font-ui text-sm font-semibold text-charcoal">{table.name}</h3>
                    <span className="font-ui text-[11px] text-charcoal-soft">{tableGuests.length}/{table.capacity} mjesta</span>
                  </div>
                  {tableGuests.length > 0 ? (
                    <ol className="mt-2 grid grid-cols-2 gap-2">
                      {tableGuests.map((guest, index) => (
                        <li key={`assignment-${guest.id}`} className="flex min-h-[48px] min-w-0 items-center gap-2 rounded-md border border-cream bg-white/80 px-2 py-2">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-pill bg-gold font-ui text-xs font-bold text-white">{index + 1}</span>
                          <span className="min-w-0 truncate font-ui text-sm font-semibold text-charcoal">{guest.name}</span>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p className="px-1 pt-2 font-ui text-xs text-charcoal-soft">Nema dodijeljenih gostiju</p>
                  )}
                </section>
              )
            })}

            {unassignedGuests.length > 0 && (
              <section className="rounded-md border border-dashed border-gold/60 bg-cream/40 p-2">
                <h3 className="px-1 font-ui text-sm font-semibold text-charcoal">Bez mjesta</h3>
                <ol className="mt-2 grid grid-cols-2 gap-2">
                  {unassignedGuests.map((guest, index) => (
                    <li key={`assignment-unassigned-${guest.id}`} className="flex min-h-[48px] min-w-0 items-center gap-2 rounded-md border border-cream bg-white/80 px-2 py-2">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-pill bg-charcoal-soft font-ui text-xs font-bold text-white">{index + 1}</span>
                      <span className="min-w-0 truncate font-ui text-sm font-semibold text-charcoal">{guest.name}</span>
                    </li>
                  ))}
                </ol>
              </section>
            )}
          </div>
          <p className="mt-3 flex items-center justify-between border-t border-cream pt-3 font-ui text-sm text-charcoal-soft">
            <span>Ukupno gostiju</span>
            <strong className="font-display text-xl text-charcoal">{guests.length}</strong>
          </p>
        </div>
      </section>

      <div className="fixed bottom-0 left-1/2 z-20 w-full max-w-[480px] -translate-x-1/2 bg-ivory/95 px-5 pb-5 pt-3 backdrop-blur-sm">
        <PrimaryButton disabled={tables.length === 0} onClick={() => navigate('/create/publish')}>
          Nastavi na objavu
        </PrimaryButton>
      </div>

      <TableEditorSheet
        open={editingTableId != null}
        table={editingTable}
        guestCount={editingTable ? (guestsByTable[editingTable.id] ?? []).length : 0}
        onClose={() => setEditingTableId(null)}
        onChange={updateTable}
        onDelete={deleteSelectedTable}
      />

      <TableSelectorSheet
        open={activeGuestId != null}
        onClose={() => setActiveGuestId(null)}
        tables={tables}
        onSelect={(tableId) => assignGuest(activeGuestId, tableId)}
        guestName={activeGuest?.name}
        assignedTableId={activeGuest?.tableId}
      />

      <BottomSheet
        open={isGuestSheetOpen}
        onClose={() => setIsGuestSheetOpen(false)}
        title="Dodaj goste"
        subtitle="Jedno ime po retku"
      >
        <GuestImportTextarea onImport={addGuests} />
      </BottomSheet>
    </AppShell>
  )
}
