import GuestRow from './GuestRow.jsx'

export default function GuestList({ guests, onRemove, onRename }) {
  if (guests.length === 0) {
    return <p className="font-ui text-sm text-charcoal-soft">Još nema dodanih gostiju.</p>
  }

  return (
    <div>
      <p className="font-ui text-sm font-semibold text-charcoal-soft">Gosti ({guests.length})</p>
      <ul className="mt-2 rounded-lg bg-white px-4 shadow-card">
        {guests.map((guest) => (
          <GuestRow key={guest.id} guest={guest} onRemove={onRemove} onRename={onRename} />
        ))}
      </ul>
    </div>
  )
}
