export default function BotanicalDivider() {
  return (
    <svg
      viewBox="0 0 200 40"
      className="mx-auto mt-10 h-8 w-40 text-gold opacity-60"
      fill="none"
      aria-hidden="true"
    >
      <path d="M100 20 C 70 5, 40 5, 20 20" stroke="currentColor" strokeWidth="1.2" />
      <path d="M100 20 C 130 5, 160 5, 180 20" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="100" cy="20" r="3" fill="currentColor" />
      <path d="M60 14 q4 -6 8 0 q-4 6 -8 0 Z" fill="currentColor" opacity="0.5" />
      <path d="M132 14 q4 -6 8 0 q-4 6 -8 0 Z" fill="currentColor" opacity="0.5" />
    </svg>
  )
}
