import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

// Unselected keeps a transparent 2px border so selecting one doesn't reflow the
// grid. The old always-on cream border was a third separation cue on top of the
// white fill and the shadow, and made the selected state (a 1px gold border)
// effectively invisible.
export default function EventTypeCard({ icon: Icon, label, selected, onClick }) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      aria-pressed={selected}
      className={`relative flex min-h-[92px] flex-col items-center justify-center gap-2 rounded-lg border-2 px-3 py-4 shadow-card transition-colors ${
        selected ? 'border-gold bg-cream' : 'border-transparent bg-white'
      }`}
    >
      {selected && (
        <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-pill bg-gold">
          <Check size={12} strokeWidth={2.5} className="text-white" aria-hidden="true" />
        </span>
      )}
      <Icon size={24} strokeWidth={1.5} className="text-gold-deep" aria-hidden="true" />
      <span className="font-ui text-sm font-medium text-charcoal">{label}</span>
    </motion.button>
  )
}
