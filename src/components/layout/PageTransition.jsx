import { motion, useReducedMotion } from 'framer-motion'
import { useLocation } from 'react-router-dom'

// Entrance-only, deliberately. An AnimatePresence exit would keep the outgoing
// route mounted after the URL has already changed, so the previous step's
// buttons stay clickable during the transition — a real race for users and for
// the e2e suite alike. Keying on pathname re-runs the entrance on every step.
//
// framer-motion animates via JS, so the global prefers-reduced-motion CSS rule
// in styles/index.css does not reach it; useReducedMotion is what opts out here.
export default function PageTransition({ children }) {
  const { pathname } = useLocation()
  const reduceMotion = useReducedMotion()

  if (reduceMotion) return children

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 1, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}
