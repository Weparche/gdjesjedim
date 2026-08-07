import { motion } from 'framer-motion'

export default function EventTypeCard({ icon: Icon, label, selected, onClick }) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      aria-pressed={selected}
      className={`flex min-h-[92px] flex-col items-center justify-center gap-2 rounded-lg border bg-white px-3 py-4 shadow-card transition-colors ${
        selected ? 'border-gold' : 'border-cream'
      }`}
    >
      <Icon size={24} strokeWidth={1.5} className="text-gold" />
      <span className="font-ui text-sm font-medium text-charcoal">{label}</span>
    </motion.button>
  )
}
