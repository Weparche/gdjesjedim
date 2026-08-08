import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useEffect } from 'react'

export default function BottomSheet({ open, onClose, title, subtitle, children }) {
  useEffect(() => {
    if (!open) return
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <motion.button
            type="button"
            aria-label="Zatvori"
            onClick={onClose}
            className="absolute inset-0 bg-charcoal/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="relative z-10 w-full max-w-[480px] rounded-t-lg bg-white px-5 pb-8 pt-4 shadow-elevated"
          >
            <div className="flex items-start justify-between pb-3">
              <div className="min-w-0 py-1">
                <h2 className="font-display text-xl leading-tight text-charcoal">{title}</h2>
                {subtitle && (
                  <p className="mt-0.5 truncate font-ui text-sm text-charcoal-soft">{subtitle}</p>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Zatvori"
                className="flex h-11 w-11 items-center justify-center rounded-md text-charcoal-soft hover:bg-cream"
              >
                <X size={20} strokeWidth={1.5} />
              </button>
            </div>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
