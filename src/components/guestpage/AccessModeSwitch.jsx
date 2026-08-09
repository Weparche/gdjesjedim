import { ShieldCheck, UserRound } from 'lucide-react'

export default function AccessModeSwitch({ adminPending = false, onGuest, onAdmin }) {
  return (
    <div
      role="group"
      aria-label="Način pregleda"
      className="mx-auto grid w-full max-w-[260px] grid-cols-2 rounded-pill bg-cream p-1"
    >
      <button
        type="button"
        aria-pressed={!adminPending}
        onClick={onGuest}
        className={`flex min-h-11 items-center justify-center gap-2 rounded-pill px-3 font-ui text-sm font-semibold transition-[background-color,color,box-shadow] ${
          adminPending ? 'text-charcoal-soft' : 'bg-white text-charcoal shadow-card'
        }`}
      >
        <UserRound size={16} strokeWidth={1.7} aria-hidden="true" />
        Gost
      </button>
      <button
        type="button"
        aria-pressed={adminPending}
        onClick={onAdmin}
        className={`flex min-h-11 items-center justify-center gap-2 rounded-pill px-3 font-ui text-sm font-semibold transition-[background-color,color,box-shadow] ${
          adminPending ? 'bg-charcoal text-white shadow-card' : 'text-charcoal-soft'
        }`}
      >
        <ShieldCheck size={16} strokeWidth={1.7} aria-hidden="true" />
        Admin
      </button>
    </div>
  )
}
