import { GripVertical } from 'lucide-react'
import TableIllustration from './TableIllustration.jsx'

export default function TableCard({
  table,
  guests = [],
  highlighted = false,
  draggable = false,
  dropActive = false,
  onPointerDown,
  onActivate
}) {
  const full = table.capacity != null && guests.length >= table.capacity
  const state = highlighted
    ? 'drop-shadow-[0_3px_8px_rgba(199,154,75,0.72)]'
    : dropActive
      ? 'drop-shadow-[0_3px_8px_rgba(184,98,74,0.58)]'
      : full
        ? 'drop-shadow-[0_3px_6px_rgba(184,98,74,0.42)]'
        : 'drop-shadow-[0_3px_6px_rgba(43,36,32,0.16)]'

  return (
    <button
      type="button"
      data-table-drop-id={table.id}
      onPointerDown={draggable ? onPointerDown : undefined}
      onClick={(event) => {
        if (!draggable || event.detail === 0) onActivate?.()
      }}
      className={`table-node absolute h-[120px] w-[120px] -translate-x-1/2 -translate-y-1/2 bg-transparent p-0 text-center transition-[filter,transform,opacity] ${state} ${
        draggable ? 'cursor-grab touch-none active:cursor-grabbing' : 'cursor-pointer'
      }`}
      aria-label={`${table.name}, ${guests.length} od ${table.capacity} mjesta`}
    >
      {draggable && (
        <span className="absolute left-1 top-1 z-10 flex h-7 w-7 items-center justify-center rounded-pill bg-white/95 text-gold-deep shadow-card" aria-hidden="true">
          <GripVertical size={13} strokeWidth={1.5} />
        </span>
      )}
      <TableIllustration
        table={table}
        guestCount={guests.length}
        className="absolute left-1/2 top-1/2 h-[132px] w-[132px] -translate-x-1/2 -translate-y-1/2"
        nameClassName="text-[13px]"
        countClassName="text-[9px]"
      />
    </button>
  )
}
