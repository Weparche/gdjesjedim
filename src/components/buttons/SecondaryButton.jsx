import { motion } from 'framer-motion'

export default function SecondaryButton({ children, className = '', type = 'button', ...props }) {
  return (
    <motion.button
      type={type}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.15 }}
      className={`inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-md bg-transparent px-6 font-ui text-base font-medium text-charcoal-soft transition-colors hover:text-charcoal disabled:opacity-50 disabled:pointer-events-none ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  )
}
