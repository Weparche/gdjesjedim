import { motion } from 'framer-motion'

const CONFETTI = [
  { top: '8%', left: '12%', color: '#E7A9AE' },
  { top: '15%', left: '78%', color: '#C79A4B' },
  { top: '75%', left: '18%', color: '#C79A4B' },
  { top: '80%', left: '82%', color: '#E7A9AE' },
  { top: '10%', left: '45%', color: '#C79A4B' }
]

export default function TableResultCard({ tableName }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="relative overflow-hidden rounded-lg bg-blush-soft p-6 text-center shadow-elevated"
    >
      {CONFETTI.map((c, i) => (
        <span
          key={i}
          aria-hidden="true"
          style={{ top: c.top, left: c.left, backgroundColor: c.color }}
          className="absolute h-2 w-2 rounded-pill opacity-70"
        />
      ))}
      <p className="relative font-ui text-sm text-charcoal-soft">Tvoje mjesto je:</p>
      <p className="relative mt-1 font-display text-5xl text-gold-deep">{tableName.toUpperCase()}</p>
      <p className="relative mt-2 font-ui text-sm text-charcoal">Vidimo se na proslavi! 🎉</p>
    </motion.div>
  )
}
