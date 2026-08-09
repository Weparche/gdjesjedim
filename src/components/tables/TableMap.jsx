import { AnimatePresence, motion } from 'framer-motion'
import { Minus, Plus } from 'lucide-react'
import { useRef, useState } from 'react'
import FocusedTableView from './FocusedTableView.jsx'
import TableCard from './TableCard.jsx'

const TABLE_POSITION_GUTTER = 6
const MIN_ZOOM = 0.7
const MAX_ZOOM = 1.8
const ZOOM_STEP = 0.2
const FIT_ZOOM = 0.8

function ringSizes(total) {
  const ringCount = Math.ceil(total / 10)
  const baseSize = Math.floor(total / ringCount)
  const extra = total % ringCount
  return Array.from({ length: ringCount }, (_, ring) => baseSize + (ring < extra ? 1 : 0))
}

function guestOffset(index, total) {
  const sizes = ringSizes(total)
  let ring = 0
  let position = index
  while (position >= sizes[ring]) {
    position -= sizes[ring]
    ring += 1
  }

  const slots = sizes[ring]
  const radius = Math.max(68, 56 + slots * 4) + ring * 76
  const startAngle = slots >= 7 ? 0 : slots === 1 ? -Math.PI / 2 : -Math.PI / 2 + Math.PI / slots
  const angle = startAngle + (position / slots) * Math.PI * 2 + (ring % 2 === 1 ? Math.PI / slots : 0)
  return {
    x: Math.round(Math.cos(angle) * radius),
    y: Math.round(Math.sin(angle) * radius)
  }
}

function OverviewGuestCard({ guest, table, highlighted, dragging, readOnly, onPointerDown, onClick, offset }) {
  const visual = (
    <span className={`block max-w-[58px] break-words rounded-pill border px-2 py-1 text-center font-ui text-[9px] font-semibold leading-[1.1] shadow-card ${
      dragging
        ? 'border-gold bg-cream text-charcoal shadow-elevated'
        : highlighted
          ? 'border-terracotta bg-blush-soft text-charcoal ring-2 ring-terracotta/25'
          : 'border-cream bg-white/95 text-charcoal'
    }`}>
      {guest.name}
    </span>
  )

  const positionStyle = {
    left: '50%',
    top: '50%',
    transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px))`
  }

  if (readOnly) {
    return (
      <div
        className="pointer-events-none absolute z-10 flex h-11 w-20 items-center justify-center"
        style={positionStyle}
        aria-label={`${guest.name}, ${table.name}`}
      >
        {visual}
      </div>
    )
  }

  return (
    <button
      type="button"
      data-map-interactive
      data-overview-guest-id={guest.id}
      data-seat-x={offset.x}
      data-seat-y={offset.y}
      className="absolute z-10 flex h-11 w-20 touch-none items-center justify-center"
      style={positionStyle}
      onPointerDown={(event) => {
        event.preventDefault()
        event.stopPropagation()
        onPointerDown?.(event, guest.id)
      }}
      onClick={(event) => {
        event.stopPropagation()
        onClick?.(guest.id)
      }}
      aria-label={`${guest.name}, ${table.name}`}
    >
      {visual}
    </button>
  )
}

export default function TableMap({
  tables,
  guestsByTable,
  focusedTableId,
  highlightedTableId,
  highlightedGuestId,
  readOnly = false,
  onMoveTable,
  onFocusTable,
  onCloseFocus,
  onEditTable,
  onGuestPointerDown,
  onGuestClick,
  onGuestDrop,
  draggingGuestId
}) {
  const mapRef = useRef(null)
  const pointerCacheRef = useRef(new Map())
  const pinchRef = useRef(null)
  const [draggingTable, setDraggingTable] = useState(null)
  const [panGesture, setPanGesture] = useState(null)
  const [view, setView] = useState({ zoom: FIT_ZOOM, x: 0, y: 0 })
  const focusedTable = tables.find((table) => table.id === focusedTableId)

  function clampPan(x, y, zoom = view.zoom) {
    const rect = mapRef.current?.getBoundingClientRect()
    if (!rect) return { x, y }
    const maxX = rect.width * Math.max(0.32, zoom * 0.56)
    const maxY = rect.height * Math.max(0.32, zoom * 0.56)
    return {
      x: Math.max(-maxX, Math.min(maxX, x)),
      y: Math.max(-maxY, Math.min(maxY, y))
    }
  }

  function changeZoom(delta) {
    setView((current) => {
      const zoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, Number((current.zoom + delta).toFixed(2))))
      return { ...current, zoom, ...clampPan(current.x, current.y, zoom) }
    })
  }

  function fitMap() {
    setView({ zoom: FIT_ZOOM, x: 0, y: 0 })
  }

  function pointerDistance(first, second) {
    return Math.hypot(second.x - first.x, second.y - first.y)
  }

  function pointerMidpoint(first, second, rect) {
    return {
      x: (first.x + second.x) / 2 - rect.left,
      y: (first.y + second.y) / 2 - rect.top
    }
  }

  function positionFromEvent(event) {
    const rect = mapRef.current?.getBoundingClientRect()
    if (!rect) return { x: 50, y: 28 }

    const screenX = event.clientX - rect.left
    const screenY = event.clientY - rect.top
    const canvasX = rect.width / 2 + (screenX - rect.width / 2 - view.x) / view.zoom
    const canvasY = rect.height / 2 + (screenY - rect.height / 2 - view.y) / view.zoom
    return {
      x: Math.max(TABLE_POSITION_GUTTER, Math.min(100 - TABLE_POSITION_GUTTER, (canvasX / rect.width) * 100)),
      y: Math.max(TABLE_POSITION_GUTTER, Math.min(100 - TABLE_POSITION_GUTTER, (canvasY / rect.height) * 100))
    }
  }

  function startPanning(event) {
    const pointers = pointerCacheRef.current
    const alreadyTracking = pointers.size > 0
    if (
      focusedTable
      || event.button !== 0
      || (!alreadyTracking && event.target.closest?.('[data-map-interactive], [data-table-drop-id]'))
    ) return

    event.preventDefault()
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY })
    try {
      event.currentTarget.setPointerCapture?.(event.pointerId)
    } catch {
      // Synthetic pointer events used in tests do not own real pointer capture.
    }

    if (pointers.size === 1) {
      setPanGesture({ pointerId: event.pointerId, x: event.clientX, y: event.clientY, originX: view.x, originY: view.y })
      return
    }

    if (pointers.size === 2) {
      const rect = mapRef.current?.getBoundingClientRect()
      if (!rect) return
      const [first, second] = [...pointers.values()]
      pinchRef.current = {
        distance: pointerDistance(first, second),
        midpoint: pointerMidpoint(first, second, rect),
        zoom: view.zoom,
        x: view.x,
        y: view.y
      }
      setPanGesture(null)
    }
  }

  function startDragging(event, table) {
    if (readOnly) return
    event.preventDefault()
    event.stopPropagation()
    setDraggingTable({ id: table.id, moved: false, position: { x: table.x ?? 50, y: table.y ?? 28 } })
    try {
      event.currentTarget.setPointerCapture?.(event.pointerId)
    } catch {
      // Pointer capture is an enhancement; dragging still works without it.
    }
  }

  function moveInteraction(event) {
    const pointers = pointerCacheRef.current
    if (pointers.has(event.pointerId)) {
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY })
    }

    if (pointers.size >= 2 && pinchRef.current) {
      const rect = mapRef.current?.getBoundingClientRect()
      if (!rect) return
      const [first, second] = [...pointers.values()]
      const pinch = pinchRef.current
      const midpoint = pointerMidpoint(first, second, rect)
      const zoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, pinch.zoom * (pointerDistance(first, second) / pinch.distance)))
      const ratio = zoom / pinch.zoom
      const x = midpoint.x - rect.width / 2 - ratio * (pinch.midpoint.x - rect.width / 2 - pinch.x)
      const y = midpoint.y - rect.height / 2 - ratio * (pinch.midpoint.y - rect.height / 2 - pinch.y)
      setView({ zoom: Number(zoom.toFixed(3)), ...clampPan(x, y, zoom) })
      return
    }

    if (panGesture?.pointerId === event.pointerId) {
      const next = clampPan(
        panGesture.originX + event.clientX - panGesture.x,
        panGesture.originY + event.clientY - panGesture.y
      )
      setView((current) => ({ ...current, ...next }))
      return
    }

    if (!draggingTable) return
    const nextPosition = positionFromEvent(event)
    setDraggingTable((current) => ({ ...current, moved: true, position: nextPosition }))
  }

  function finishInteraction(event) {
    const pointers = pointerCacheRef.current
    if (pointers.has(event.pointerId)) {
      pointers.delete(event.pointerId)
      if (pinchRef.current) {
        pinchRef.current = null
        pointers.clear()
        setPanGesture(null)
        event.stopPropagation()
        return
      }
    }

    if (panGesture?.pointerId === event.pointerId) {
      setPanGesture(null)
      event.stopPropagation()
      return
    }

    if (!draggingTable) {
      if (draggingGuestId) {
        const dropTarget = event.target.closest?.('[data-table-drop-id]')
        if (dropTarget?.dataset.tableDropId) {
          onGuestDrop?.(draggingGuestId, dropTarget.dataset.tableDropId)
          event.stopPropagation()
        }
      }
      return
    }

    const current = draggingTable
    setDraggingTable(null)
    if (current.moved) onMoveTable?.(current.id, current.position)
    else onFocusTable?.(current.id)
    event.stopPropagation()
  }

  function zoomWithWheel(event) {
    if (focusedTable) return
    event.preventDefault()
    changeZoom(event.deltaY < 0 ? 0.1 : -0.1)
  }

  return (
    <div
      ref={mapRef}
      role="region"
      aria-label="Mapa rasporeda stolova"
      data-zoom={view.zoom}
      data-pan-x={Math.round(view.x)}
      data-pan-y={Math.round(view.y)}
      className={`relative min-h-[432px] overflow-hidden rounded-lg border border-cream bg-cover bg-center shadow-inner ${panGesture ? 'cursor-grabbing' : 'cursor-grab'}`}
      style={{ backgroundImage: "url('/assets/seating-paper-bg.png')", touchAction: focusedTable ? 'auto' : 'none' }}
      onPointerDown={startPanning}
      onPointerMove={moveInteraction}
      onPointerUp={finishInteraction}
      onPointerCancel={finishInteraction}
      onWheel={zoomWithWheel}
    >
      <div className="pointer-events-none absolute inset-3 rounded-md border border-dashed border-gold/30" aria-hidden="true" />
      <p className="pointer-events-none absolute left-4 top-4 z-10 font-ui text-[11px] font-semibold uppercase tracking-[0.16em] text-gold-deep">
        Mapa prostora
      </p>

      <div
        data-map-canvas
        className="absolute inset-0 origin-center transition-transform duration-200 ease-out"
        style={{ transform: `translate3d(${view.x}px, ${view.y}px, 0) scale(${view.zoom})` }}
      >
        {tables.map((table) => {
          const tableGuests = guestsByTable[table.id] ?? []
          const activePosition = draggingTable?.id === table.id
            ? draggingTable.position
            : { x: table.x ?? 50, y: table.y ?? 28 }

          return (
            <div
              key={table.id}
              data-table-position-x={Number(activePosition.x).toFixed(1)}
              data-table-position-y={Number(activePosition.y).toFixed(1)}
              className={`absolute transition-opacity ${draggingTable?.id === table.id ? 'z-20' : 'z-0'}`}
              style={{ left: `${activePosition.x}%`, top: `${activePosition.y}%` }}
            >
              {tableGuests.map((guest, index) => (
                <OverviewGuestCard
                  key={guest.id}
                  guest={guest}
                  table={table}
                  offset={guestOffset(index, tableGuests.length)}
                  highlighted={highlightedGuestId === guest.id}
                  dragging={draggingGuestId === guest.id}
                  readOnly={readOnly}
                  onPointerDown={onGuestPointerDown}
                  onClick={onGuestClick}
                />
              ))}
              <TableCard
                table={table}
                guests={tableGuests}
                highlighted={highlightedTableId === table.id}
                draggable={!readOnly}
                dropActive={Boolean(draggingGuestId)}
                onPointerDown={(event) => startDragging(event, table)}
                onActivate={() => onFocusTable?.(table.id)}
              />
            </div>
          )
        })}

        {tables.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center px-12 text-center">
            <p className="font-ui text-sm leading-relaxed text-charcoal-soft">Dodaj prvi stol i složi mapu prostora.</p>
          </div>
        )}
      </div>

      {!focusedTable && (
        <div data-map-interactive className="absolute bottom-3 right-3 z-30 flex flex-col items-center overflow-hidden rounded-md bg-white/95 shadow-card">
          <button
            type="button"
            onClick={() => changeZoom(ZOOM_STEP)}
            disabled={view.zoom >= MAX_ZOOM}
            className="flex h-11 w-11 items-center justify-center text-charcoal transition-colors hover:bg-cream disabled:text-charcoal-soft/40"
            aria-label="Povećaj mapu"
          >
            <Plus size={17} strokeWidth={1.5} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={fitMap}
            className="flex h-11 w-11 items-center justify-center border-y border-cream font-ui text-[10px] font-semibold text-charcoal transition-colors hover:bg-cream"
            aria-label="Prikaži cijelu mapu"
          >
            {Math.round(view.zoom * 100)}%
          </button>
          <button
            type="button"
            onClick={() => changeZoom(-ZOOM_STEP)}
            disabled={view.zoom <= MIN_ZOOM}
            className="flex h-11 w-11 items-center justify-center text-charcoal transition-colors hover:bg-cream disabled:text-charcoal-soft/40"
            aria-label="Smanji mapu"
          >
            <Minus size={17} strokeWidth={1.5} aria-hidden="true" />
          </button>
        </div>
      )}

      <AnimatePresence>
        {focusedTable && (
          <motion.div
            key={focusedTable.id}
            className="absolute inset-0 z-40 overflow-hidden rounded-lg bg-ivory/80 backdrop-blur-[1px]"
            initial={{ opacity: 0, scale: 0.985, filter: 'blur(3px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.99, filter: 'blur(2px)' }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <FocusedTableView
              table={focusedTable}
              guests={guestsByTable[focusedTable.id] ?? []}
              highlightedGuestId={highlightedGuestId}
              readOnly={readOnly}
              draggingGuestId={draggingGuestId}
              onClose={onCloseFocus}
              onEdit={onEditTable}
              onGuestPointerDown={onGuestPointerDown}
              onGuestClick={onGuestClick}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
