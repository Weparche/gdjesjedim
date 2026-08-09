import BottomSheet from '../common/BottomSheet.jsx'

// `title` stays the stable "Odaberi stol" (it is the dialog's accessible name);
// the guest being assigned goes in the subtitle so you never have to remember
// which row you tapped.
export default function TableSelectorSheet({
  open,
  onClose,
  tables,
  onSelect,
  guestName,
  assignedTableId,
  guestCountsByTable = {},
  busy = false,
  error = ''
}) {
  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="Odaberi stol"
      subtitle={guestName ? `za ${guestName}` : undefined}
    >
      <ul className="max-h-[50vh] space-y-1 overflow-y-auto">
        {tables.map((table) => {
          const current = table.id === assignedTableId
          const occupied = guestCountsByTable[table.id] ?? 0
          const full = !current && occupied >= table.capacity
          return (
            <li key={table.id}>
              <button
                type="button"
                onClick={() => onSelect(table.id)}
                aria-pressed={current}
                disabled={busy}
                className={`flex min-h-[52px] w-full items-center justify-between rounded-md px-3 text-left font-ui text-base text-charcoal transition-colors hover:bg-cream ${
                  current ? 'bg-cream font-semibold' : ''
                } disabled:pointer-events-none disabled:opacity-50`}
              >
                <span>{table.name}</span>
                <span className={`font-ui text-sm ${full ? 'font-semibold text-terracotta' : 'text-charcoal-soft'}`}>
                  {occupied}/{table.capacity} {full ? '· puno' : 'mjesta'}
                </span>
              </button>
            </li>
          )
        })}
      </ul>

      {assignedTableId != null && (
        <button
          type="button"
          onClick={() => onSelect(null)}
          disabled={busy}
          className="mt-2 flex min-h-[52px] w-full items-center rounded-md px-3 text-left font-ui text-base text-charcoal-soft transition-colors hover:bg-cream"
        >
          Ukloni sa stola
        </button>
      )}
      {error && <p role="alert" className="mt-3 font-ui text-sm font-semibold text-terracotta">{error}</p>}
    </BottomSheet>
  )
}
