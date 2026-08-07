import BottomSheet from '../common/BottomSheet.jsx'

export default function TableSelectorSheet({ open, onClose, tables, onSelect }) {
  return (
    <BottomSheet open={open} onClose={onClose} title="Odaberi stol">
      <ul className="max-h-[50vh] space-y-1 overflow-y-auto">
        {tables.map((table) => (
          <li key={table.id}>
            <button
              type="button"
              onClick={() => onSelect(table.id)}
              className="flex min-h-[52px] w-full items-center justify-between rounded-md px-3 text-left font-ui text-sm text-charcoal hover:bg-cream"
            >
              <span>{table.name}</span>
              {table.capacity != null && <span className="text-charcoal-soft">kapacitet {table.capacity}</span>}
            </button>
          </li>
        ))}
      </ul>
    </BottomSheet>
  )
}
