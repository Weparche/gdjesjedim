export default function InvitationPreview({ src, type, name }) {
  if (src) {
    return (
      <div className="overflow-hidden rounded-lg bg-white shadow-card">
        {type === 'application/pdf' ? (
          <object data={src} type="application/pdf" className="h-[420px] w-full" aria-label={name ?? 'Učitana pozivnica'}>
            <a href={src} download={name}>Otvori učitanu pozivnicu</a>
          </object>
        ) : (
          <img src={src} alt={name ?? 'Učitana pozivnica'} className="max-h-[520px] w-full object-contain" />
        )}
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-lg bg-white shadow-card">
      <svg viewBox="0 0 320 360" className="w-full" role="img" aria-label="Pozivnica za Marijino krštenje">
        <rect width="320" height="360" fill="#FFFDF9" />
        <g stroke="#E7A9AE" strokeWidth="1.4" fill="none" opacity="0.7">
          <path d="M30 40 C 50 20, 70 20, 90 40" />
          <path d="M230 40 C 250 20, 270 20, 290 40" />
          <path d="M30 320 C 50 340, 70 340, 90 320" />
          <path d="M230 320 C 250 340, 270 340, 290 320" />
        </g>
        <g fill="#E7A9AE" opacity="0.6">
          <circle cx="45" cy="30" r="5" />
          <circle cx="65" cy="24" r="4" />
          <circle cx="275" cy="30" r="5" />
          <circle cx="255" cy="24" r="4" />
        </g>
        <path d="M160 70 L160 100 M148 82 L172 82" stroke="#C79A4B" strokeWidth="2" />
        <text x="160" y="150" textAnchor="middle" fontFamily="'DM Serif Display', serif" fontSize="14" fill="#6B5F55">
          Pozivamo vas na
        </text>
        <text x="160" y="195" textAnchor="middle" fontFamily="'DM Serif Display', serif" fontSize="30" fill="#2B2420">
          Marijino
        </text>
        <text x="160" y="228" textAnchor="middle" fontFamily="'DM Serif Display', serif" fontSize="30" fill="#2B2420">
          krštenje
        </text>
        <line x1="120" y1="250" x2="200" y2="250" stroke="#C79A4B" strokeWidth="1" />
        <text x="160" y="278" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="13" fill="#6B5F55">
          26. rujna 2026.
        </text>
        <text x="160" y="304" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="12" fill="#6B5F55">
          12:00 · Crkva Sv. Mati Slobode
        </text>
        <text x="160" y="322" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="12" fill="#6B5F55">
          13:00 · Lido
        </text>
      </svg>
    </div>
  )
}
