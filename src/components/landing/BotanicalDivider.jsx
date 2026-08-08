// Corner motif rather than an inline centered rule. Sitting inline it read as a
// stray artifact stranded above ~200px of empty ivory; bled off the bottom-left
// corner it terminates the page the way the reference does.
export default function BotanicalDivider() {
  return (
    <svg
      viewBox="0 0 220 120"
      className="pointer-events-none absolute bottom-0 left-0 h-32 w-56 text-gold opacity-30"
      fill="none"
      aria-hidden="true"
    >
      <path d="M10 118 C 40 96, 66 70, 84 36" stroke="currentColor" strokeWidth="1.2" />
      <path d="M84 36 q -16 -4 -22 10 q 16 6 22 -10 Z" fill="currentColor" opacity="0.55" />
      <path d="M70 62 q -18 -6 -26 8 q 18 8 26 -8 Z" fill="currentColor" opacity="0.45" />
      <path d="M52 88 q -20 -6 -28 8 q 20 8 28 -8 Z" fill="currentColor" opacity="0.35" />
      <path d="M74 50 q 16 -8 26 2 q -16 10 -26 -2 Z" fill="currentColor" opacity="0.4" />
      <path d="M58 76 q 18 -8 28 2 q -18 10 -28 -2 Z" fill="currentColor" opacity="0.3" />
      <circle cx="86" cy="30" r="2.5" fill="currentColor" opacity="0.6" />
    </svg>
  )
}
