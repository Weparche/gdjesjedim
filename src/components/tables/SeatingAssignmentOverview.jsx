export default function SeatingAssignmentOverview({
  tables,
  guestsByTable,
  unassignedGuests = [],
  onGuestSelect
}) {
  const totalGuests =
    tables.reduce((count, table) => count + (guestsByTable[table.id]?.length ?? 0), 0) + unassignedGuests.length

  function renderGuestRow(guest, index, badgeClass) {
    const content = (
      <>
        <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-pill font-ui text-xs font-bold text-white ${badgeClass}`} aria-hidden="true">
          {index + 1}
        </span>
        <span className="min-w-0 truncate font-ui text-sm font-semibold text-charcoal" aria-hidden={onGuestSelect ? 'true' : undefined}>{guest.name}</span>
      </>
    )

    if (onGuestSelect) {
      return (
        <button
          type="button"
          onClick={() => onGuestSelect(guest.id)}
          aria-label={`Odaberi stol za ${guest.name}`}
          className="flex min-h-[48px] min-w-0 w-full items-center gap-2 rounded-md border border-cream bg-white/80 px-2 py-2 text-left transition-colors hover:bg-cream"
        >
          {content}
        </button>
      )
    }

    return (
      <div className="flex min-h-[48px] min-w-0 items-center gap-2 rounded-md border border-cream bg-white/80 px-2 py-2">
        {content}
      </div>
    )
  }

  return (
    <div className="mt-4 border-t border-cream pt-3">
      <p className="font-ui text-xs font-semibold uppercase tracking-[0.14em] text-charcoal-soft">Pregled dodjele</p>
      <div className="mt-2 space-y-3">
        {tables.map((table) => {
          const tableGuests = guestsByTable[table.id] ?? []
          return (
            <section key={`assignment-table-${table.id}`} className="rounded-md border border-cream bg-ivory/70 p-2">
              <div className="flex items-baseline justify-between gap-2 px-1">
                <h3 className="font-ui text-sm font-semibold text-charcoal">{table.name}</h3>
                <span className="font-ui text-[11px] text-charcoal-soft">{tableGuests.length}/{table.capacity} mjesta</span>
              </div>
              {tableGuests.length > 0 ? (
                <ol className="mt-2 grid grid-cols-2 gap-2">
                  {tableGuests.map((guest, index) => (
                    <li key={`assignment-${guest.id}`}>{renderGuestRow(guest, index, 'bg-gold')}</li>
                  ))}
                </ol>
              ) : (
                <p className="px-1 pt-2 font-ui text-xs text-charcoal-soft">Nema dodijeljenih gostiju</p>
              )}
            </section>
          )
        })}

        {unassignedGuests.length > 0 && (
          <section className="rounded-md border border-dashed border-gold/60 bg-cream/40 p-2">
            <h3 className="px-1 font-ui text-sm font-semibold text-charcoal">Bez mjesta</h3>
            <ol className="mt-2 grid grid-cols-2 gap-2">
              {unassignedGuests.map((guest, index) => (
                <li key={`assignment-unassigned-${guest.id}`}>{renderGuestRow(guest, index, 'bg-charcoal-soft')}</li>
              ))}
            </ol>
          </section>
        )}
      </div>
      <p className="mt-3 flex items-center justify-between border-t border-cream pt-3 font-ui text-sm text-charcoal-soft">
        <span>Ukupno gostiju</span>
        <strong className="font-display text-xl text-charcoal">{totalGuests}</strong>
      </p>
    </div>
  )
}
