// A table tile is a passive status surface, not a control — so it gets a flat
// cream fill and no shadow. Only the guest rows next to it are tappable, and
// giving these a white-card-plus-border-plus-shadow treatment made the
// non-interactive thing look more tappable than the interactive one.
export default function TableCard({ table, assignedCount }) {
  const full = table.capacity != null && assignedCount >= table.capacity
  return (
    <div className={`rounded-lg bg-cream p-4 text-center ${full ? 'border-2 border-gold' : ''}`}>
      <p className="font-ui text-sm font-semibold text-charcoal">{table.name}</p>
      <p className="mt-1 font-display text-xl text-charcoal">
        {assignedCount}
        {table.capacity != null && <span className="text-charcoal-soft"> / {table.capacity}</span>}
      </p>
    </div>
  )
}
