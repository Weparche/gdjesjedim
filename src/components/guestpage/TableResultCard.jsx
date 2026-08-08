import { useEffect, useRef } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { PartyPopper } from 'lucide-react'

// Confetti colors come from the palette via Tailwind classes rather than hex
// literals, so they follow the tokens. Each piece varies in size, shape, tilt
// and delay — five identical static dots read as dust on the lens, not joy.
const CONFETTI = [
  { top: '10%', left: '11%', className: 'h-2 w-1.5 bg-blush', tilt: -24, delay: 0.05 },
  { top: '16%', left: '79%', className: 'h-1.5 w-1.5 rounded-pill bg-gold', tilt: 0, delay: 0.16 },
  { top: '72%', left: '15%', className: 'h-1.5 w-1.5 rounded-pill bg-gold', tilt: 0, delay: 0.24 },
  { top: '78%', left: '84%', className: 'h-2 w-1.5 bg-blush', tilt: 32, delay: 0.12 },
  { top: '9%', left: '46%', className: 'h-2.5 w-1 bg-gold', tilt: 18, delay: 0.2 },
  { top: '84%', left: '52%', className: 'h-1.5 w-1.5 rounded-pill bg-blush', tilt: 0, delay: 0.28 },
  { top: '30%', left: '90%', className: 'h-2 w-1 bg-blush', tilt: -12, delay: 0.32 },
  { top: '62%', left: '6%', className: 'h-2 w-1 bg-gold', tilt: 40, delay: 0.36 }
]

export default function TableResultCard({ tableName }) {
  const reduceMotion = useReducedMotion()
  const ref = useRef(null)

  // With the on-screen keyboard up, the reveal can render entirely below the
  // fold — scroll it into view so it is never missed. `nearest` scrolls the
  // minimum needed, so when the card is already visible nothing moves and the
  // event title stays on screen.
  useEffect(() => {
    ref.current?.scrollIntoView({
      behavior: reduceMotion ? 'auto' : 'smooth',
      block: 'nearest'
    })
  }, [reduceMotion, tableName])

  return (
    <motion.div
      ref={ref}
      role="status"
      aria-live="polite"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="relative overflow-hidden rounded-lg bg-white p-6 text-center shadow-elevated"
    >
      {CONFETTI.map((c, i) => (
        <motion.span
          key={i}
          aria-hidden="true"
          style={{ top: c.top, left: c.left }}
          className={`absolute ${c.className}`}
          initial={reduceMotion ? { opacity: 0.75 } : { opacity: 0, y: -18, rotate: 0 }}
          animate={reduceMotion ? { opacity: 0.75 } : { opacity: 0.75, y: 0, rotate: c.tilt }}
          transition={reduceMotion ? { duration: 0 } : { duration: 0.5, delay: c.delay, ease: 'easeOut' }}
        />
      ))}

      <p className="relative font-ui text-base text-charcoal-soft">Tvoje mjesto je:</p>

      <motion.p
        initial={reduceMotion ? false : { scale: 0.86, opacity: 0 }}
        animate={reduceMotion ? {} : { scale: 1, opacity: 1 }}
        transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 220, damping: 18, delay: 0.1 }}
        className="relative mt-1 font-display text-6xl leading-none text-gold-deep"
      >
        {tableName.toUpperCase()}
      </motion.p>

      <p className="relative mt-3 inline-flex items-center justify-center gap-2 font-ui text-base text-charcoal">
        Vidimo se na proslavi!
        <PartyPopper size={18} strokeWidth={1.5} className="shrink-0 text-blush" aria-hidden="true" />
      </p>
    </motion.div>
  )
}
