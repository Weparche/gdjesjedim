import BottomSheet from '../common/BottomSheet.jsx'

// `title` stays the stable "Odaberi stol" (it is the dialog's accessible name);
// the guest being assigned goes in the subtitle so you never have to remember
// which row you tapped.
export default function TableSelectorSheet({ open, onClose, tables, onSelect, guestName, assignedTableId }) {
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
          return (
            <li key={table.id}>
              <button
                type="button"
                onClick={() => onSelect(table.id)}
                aria-pressed={current}
                className={`flex min-h-[52px] w-full items-center justify-between rounded-md px-3 text-left font-ui text-base text-charcoal transition-colors hover:bg-cream ${
                  current ? 'bg-cream font-semibold' : ''
                }`}
              >
                <span>{table.name}</span>
                {table.capacity != null && (
                  <span className="font-ui text-sm text-charcoal-soft">kapacitet {table.capacity}</span>
                )}
              </button>
            </li>
          )
        })}
      </ul>

      {assignedTableId != null && (
        <button
          type="button"
          onClick={() => onSelect(null)}
          className="mt-2 flex min-h-[52px] w-full items-center rounded-md px-3 text-left font-ui text-base text-charcoal-soft transition-colors hover:bg-cream"
        >
          Ukloni sa stola
        </button>
      )}
    </BottomSheet>
  )
}
