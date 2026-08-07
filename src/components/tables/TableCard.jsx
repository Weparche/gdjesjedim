export default function TableCard({ table, assignedCount }) {
  const full = table.capacity != null && assignedCount >= table.capacity
  return (
    <div className={`rounded-lg bg-white p-4 text-center shadow-card ${full ? 'border-2 border-gold' : 'border border-cream'}`}>
      <p className="font-ui text-sm font-semibold text-charcoal">{table.name}</p>
      <p className="mt-1 font-display text-lg text-gold">
        {assignedCount}
        {table.capacity != null && <span className="text-charcoal-soft"> / {table.capacity}</span>}
      </p>
    </div>
  )
}
