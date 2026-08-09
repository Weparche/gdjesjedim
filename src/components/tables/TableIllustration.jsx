export default function TableIllustration({ table, guestCount, className = '', nameClassName = '', countClassName = '' }) {
  const imageSrc = table.shape === 'square'
    ? '/assets/table-square-with-chairs.png'
    : '/assets/table-round-with-chairs.png'

  return (
    <span className={`relative isolate block shrink-0 ${className}`} aria-hidden="true">
      <img
        src={imageSrc}
        alt=""
        width="384"
        height="384"
        draggable="false"
        decoding="async"
        className="pointer-events-none absolute inset-0 h-full w-full select-none object-contain"
      />
      <span className="absolute inset-[20%] z-[1] flex flex-col items-center justify-center px-1 text-center">
        <span className={`max-w-full truncate font-ui font-bold leading-tight text-charcoal ${nameClassName}`}>
          {table.name}
        </span>
        <span className={`mt-1 font-ui leading-none text-charcoal-soft ${countClassName}`}>
          {guestCount}/{table.capacity ?? '—'} mjesta
        </span>
      </span>
    </span>
  )
}
