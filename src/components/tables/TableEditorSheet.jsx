import { Trash2 } from 'lucide-react'
import BottomSheet from '../common/BottomSheet.jsx'

export default function TableEditorSheet({ open, table, guestCount, onClose, onChange, onDelete }) {
  if (!table) return null
  const overCapacity = guestCount > Number(table.capacity)

  return (
    <BottomSheet open={open} onClose={onClose} title="Uredi stol" subtitle={`${guestCount} gostiju za ovim stolom`}>
      <div className="space-y-4">
        <label className="block font-ui text-sm font-semibold text-charcoal">
          Naziv stola
          <input
            value={table.name}
            onChange={(event) => onChange({ name: event.target.value })}
            className="mt-1 min-h-[48px] w-full rounded-md border border-cream bg-ivory px-4 font-ui text-base text-charcoal focus:border-gold"
          />
        </label>

        <label className="block font-ui text-sm font-semibold text-charcoal">
          Broj mjesta
          <input
            type="number"
            min="1"
            max="99"
            value={table.capacity}
            onChange={(event) => onChange({ capacity: Math.max(1, Number(event.target.value) || 1) })}
            className="mt-1 min-h-[48px] w-full rounded-md border border-cream bg-ivory px-4 font-ui text-base text-charcoal focus:border-gold"
          />
        </label>

        <fieldset>
          <legend className="font-ui text-sm font-semibold text-charcoal">Oblik stola</legend>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {[
              ['round', 'Okrugli'],
              ['square', 'Četvrtasti']
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                aria-pressed={table.shape === value}
                onClick={() => onChange({ shape: value })}
                className={`min-h-[52px] rounded-md border font-ui text-sm font-semibold transition-colors ${
                  table.shape === value ? 'border-gold bg-cream text-charcoal' : 'border-cream bg-white text-charcoal-soft hover:bg-cream'
                }`}
              >
                <span className={`mx-auto mb-1 block h-5 w-5 border-2 border-gold ${value === 'round' ? 'rounded-pill' : 'rounded-sm'}`} />
                {label}
              </button>
            ))}
          </div>
        </fieldset>

        {overCapacity && (
          <p role="alert" className="rounded-md bg-blush-soft px-3 py-2 font-ui text-sm text-charcoal">
            Ovaj stol ima više gostiju nego mjesta. Povećaj kapacitet ili premjesti gosta.
          </p>
        )}

        <button
          type="button"
          onClick={onDelete}
          className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-md border border-blush px-4 font-ui text-sm font-semibold text-charcoal transition-colors hover:bg-blush-soft"
        >
          <Trash2 size={17} strokeWidth={1.5} aria-hidden="true" />
          Ukloni stol
        </button>
      </div>
    </BottomSheet>
  )
}
