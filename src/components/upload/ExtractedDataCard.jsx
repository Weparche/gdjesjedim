export default function ExtractedDataCard({ title, date, scheduleItems }) {
  return (
    <div className="rounded-lg bg-white p-5 shadow-card">
      <p className="font-display text-xl text-charcoal">{title}</p>
      <p className="mt-1 font-ui text-sm text-charcoal-soft">{date}</p>
      <ul className="mt-4 space-y-2">
        {scheduleItems.map((item) => (
          <li key={item.time} className="font-ui text-sm text-charcoal">
            <span className="font-semibold">{item.time}</span> — {item.locationName}
          </li>
        ))}
      </ul>
    </div>
  )
}
