export default function TableGuestList({
  tables,
  guestsByTable,
  unassignedGuests = [],
  onGuestClick,
  showTotal = true
}) {
  const totalGuests = tables.reduce((total, table) => total + (guestsByTable[table.id] ?? []).length, 0)
    + unassignedGuests.length

  function guestRow(guest, index, tableName, unassigned = false) {
    const content = (
      <>
        <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-pill font-ui text-xs font-bold text-white ${unassigned ? 'bg-charcoal-soft' : 'bg-gold'}`}>
          {index + 1}
        </span>
        <span
          data-assignment-guest-name
          className="line-clamp-2 min-w-0 font-ui text-sm font-semibold leading-tight text-charcoal [overflow-wrap:normal] [word-break:normal]"
        >
          {guest.name}
        </span>
      </>
    )

    return (
      <li key={`${unassigned ? 'unassigned' : tableName}-${guest.id}`} className="min-w-0">
        {onGuestClick ? (
          <button
            type="button"
            onClick={() => onGuestClick(guest.id)}
            className="flex min-h-[48px] w-full min-w-0 items-center gap-2 rounded-md border border-cream bg-white/80 px-2 py-2 text-left transition-colors hover:bg-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-deep"
            aria-label={`Promijeni stol za ${guest.name}`}
          >
            {content}
          </button>
        ) : (
          <div className="flex min-h-[48px] min-w-0 items-center gap-2 rounded-md border border-cream bg-white/80 px-2 py-2">
            {content}
          </div>
        )}
      </li>
    )
  }

  return (
    <>
      <div className="space-y-3">
        {tables.map((table) => {
          const tableGuests = guestsByTable[table.id] ?? []
          return (
            <section key={`assignment-table-${table.id}`} className="rounded-md border border-cream bg-ivory/70 p-2">
              <div className="flex items-baseline justify-between gap-2 px-1">
                <h3 className="min-w-0 truncate font-ui text-sm font-semibold text-charcoal">{table.name}</h3>
                <span className="shrink-0 font-ui text-[11px] text-charcoal-soft">{tableGuests.length}/{table.capacity} mjesta</span>
              </div>
              {tableGuests.length > 0 ? (
                <ol className="mt-2 grid grid-cols-2 gap-2">
                  {tableGuests.map((guest, index) => guestRow(guest, index, table.name))}
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
              {unassignedGuests.map((guest, index) => guestRow(guest, index, 'Bez mjesta', true))}
            </ol>
          </section>
        )}
      </div>

      {showTotal && (
        <p className="mt-3 flex items-center justify-between border-t border-cream pt-3 font-ui text-sm text-charcoal-soft">
          <span>Ukupno gostiju</span>
          <strong className="font-display text-xl text-charcoal">{totalGuests}</strong>
        </p>
      )}
    </>
  )
}
