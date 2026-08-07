import GuestRow from './GuestRow.jsx'

export default function GuestList({ guests, onRemove, onRename }) {
  if (guests.length === 0) {
    return <p className="mt-4 font-ui text-sm text-charcoal-soft">Još nema dodanih gostiju.</p>
  }

  return (
    <ul className="mt-4 rounded-lg bg-white px-4 shadow-card">
      {guests.map((guest) => (
        <GuestRow key={guest.id} guest={guest} onRemove={onRemove} onRename={onRename} />
      ))}
    </ul>
  )
}
