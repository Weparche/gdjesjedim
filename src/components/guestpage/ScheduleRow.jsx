import { MapPin } from 'lucide-react'

export default function ScheduleRow({ time, title, locationName, address }) {
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address ?? locationName)}`

  return (
    <li className="flex items-center justify-between border-b border-cream py-3 last:border-b-0">
      <div>
        <p className="font-ui text-sm font-semibold text-charcoal">
          {time} · {title}
        </p>
        <p className="font-ui text-sm text-charcoal-soft">{locationName}</p>
      </div>
      <a
        href={mapsUrl}
        target="_blank"
        rel="noreferrer"
        aria-label={`Otvori lokaciju ${locationName} na karti`}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-gold hover:bg-cream"
      >
        <MapPin size={20} strokeWidth={1.5} />
      </a>
    </li>
  )
}
