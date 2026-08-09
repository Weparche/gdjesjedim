import { Pencil, X } from 'lucide-react'
import TableIllustration from './TableIllustration.jsx'

function GuestSeatCard({ guest, seatNumber, tableName, highlighted, readOnly, dragging, onPointerDown, onClick }) {
  const content = (
    <>
      <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-pill font-ui text-xs font-bold text-white ${highlighted ? 'bg-terracotta' : 'bg-gold'}`}>
        {seatNumber}
      </span>
      <span className="min-w-0 break-words text-left font-ui text-xs font-semibold leading-tight text-charcoal">{guest.name}</span>
    </>
  )

  const classes = `flex min-h-[44px] w-full min-w-0 items-center gap-2 rounded-md border px-2 py-1.5 shadow-card transition-[border-color,background-color,transform,box-shadow] ${
    dragging
      ? 'scale-[1.03] border-gold bg-cream shadow-elevated'
      : highlighted
        ? 'border-terracotta bg-blush-soft ring-2 ring-terracotta/25'
        : 'border-cream bg-white/95'
  }`

  if (readOnly) {
    return <div className={classes} aria-label={`${seatNumber}. ${guest.name}, ${tableName}`}>{content}</div>
  }

  return (
    <button
      type="button"
      className={classes}
      onPointerDown={(event) => onPointerDown?.(event, guest.id)}
      onClick={() => onClick?.(guest.id)}
      style={{ touchAction: 'none' }}
      aria-label={`${seatNumber}. ${guest.name}, ${tableName}`}
    >
      {content}
    </button>
  )
}

export default function FocusedTableView({
  table,
  guests,
  highlightedGuestId,
  readOnly,
  draggingGuestId,
  onClose,
  onEdit,
  onGuestPointerDown,
  onGuestClick
}) {
  const splitAt = Math.ceil(guests.length / 2)
  const leftGuests = guests.slice(0, splitAt)
  const rightGuests = guests.slice(splitAt)
  const compactOrbit = guests.length <= 10

  function renderGuest(guest, seatNumber) {
    return (
      <li key={guest.id}>
        <GuestSeatCard
          guest={guest}
          seatNumber={seatNumber}
          tableName={table.name}
          highlighted={highlightedGuestId === guest.id}
          readOnly={readOnly}
          dragging={draggingGuestId === guest.id}
          onPointerDown={onGuestPointerDown}
          onClick={onGuestClick}
        />
      </li>
    )
  }

  return (
    <div className="flex h-full min-h-0 flex-col px-3 pb-3 pt-2" role="region" aria-label={`Detalji za ${table.name}`}>
      <div className="flex min-h-[48px] items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-display text-xl leading-tight text-charcoal">{table.name}</p>
          <p className="font-ui text-xs text-charcoal-soft">{guests.length}/{table.capacity} mjesta</p>
        </div>
        <div className="flex items-center gap-1">
          {onEdit && (
            <button
              type="button"
              onClick={() => onEdit(table.id)}
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-pill px-3 font-ui text-sm font-semibold text-charcoal transition-colors hover:bg-cream"
            >
              <Pencil size={15} strokeWidth={1.5} aria-hidden="true" />
              Uredi stol
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-charcoal-soft transition-colors hover:bg-cream"
            aria-label="Zatvori detalje stola"
          >
            <X size={19} strokeWidth={1.5} aria-hidden="true" />
          </button>
        </div>
      </div>

      {guests.length === 0 ? (
        <div className="flex flex-1 items-center justify-center px-8 text-center">
          <div>
            <TableIllustration
              table={table}
              guestCount={guests.length}
              className="mx-auto h-32 w-32 drop-shadow-[0_5px_10px_rgba(43,36,32,0.18)]"
              nameClassName="text-sm"
              countClassName="text-[10px]"
            />
            <p className="mt-4 font-ui text-sm text-charcoal-soft">Za ovim stolom još nema gostiju.</p>
          </div>
        </div>
      ) : compactOrbit ? (
        <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_112px_minmax(0,1fr)] items-center gap-2 py-2">
          <ol className="space-y-2">
            {leftGuests.map((guest, index) => renderGuest(guest, index + 1))}
          </ol>

          <TableIllustration
            table={table}
            guestCount={guests.length}
            className="h-28 w-28 drop-shadow-[0_5px_10px_rgba(43,36,32,0.18)]"
            nameClassName="text-xs"
            countClassName="text-[9px]"
          />

          <ol className="space-y-2">
            {rightGuests.map((guest, index) => renderGuest(guest, splitAt + index + 1))}
          </ol>
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col pt-2">
          <TableIllustration
            table={table}
            guestCount={guests.length}
            className="mx-auto h-24 w-24 shrink-0 drop-shadow-[0_4px_8px_rgba(43,36,32,0.16)]"
            nameClassName="text-[11px]"
            countClassName="text-[8px]"
          />
          <ol className="mt-3 grid min-h-0 grid-cols-2 gap-2 overflow-y-auto pb-1 pr-1">
            {guests.map((guest, index) => renderGuest(guest, index + 1))}
          </ol>
        </div>
      )}
    </div>
  )
}
