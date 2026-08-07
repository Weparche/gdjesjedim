import { useState } from 'react'
import { GripVertical, X } from 'lucide-react'

export default function GuestRow({ guest, onRemove, onRename }) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(guest.name)

  function commit() {
    setEditing(false)
    if (value.trim() && value.trim() !== guest.name) onRename(guest.id, value.trim())
    else setValue(guest.name)
  }

  return (
    <li className="flex items-center gap-2 border-b border-cream py-2 last:border-b-0">
      <GripVertical size={18} strokeWidth={1.5} className="text-charcoal-soft/50" aria-hidden="true" />
      {editing ? (
        <input
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => e.key === 'Enter' && commit()}
          className="min-h-[44px] flex-1 rounded-md border border-gold px-2 font-ui text-sm text-charcoal"
        />
      ) : (
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="min-h-[44px] flex-1 truncate text-left font-ui text-sm text-charcoal"
        >
          {guest.name}
        </button>
      )}
      <button
        type="button"
        onClick={() => onRemove(guest.id)}
        aria-label={`Ukloni ${guest.name}`}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-charcoal-soft hover:bg-cream"
      >
        <X size={18} strokeWidth={1.5} />
      </button>
    </li>
  )
}
