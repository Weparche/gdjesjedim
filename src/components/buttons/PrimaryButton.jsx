import { motion } from 'framer-motion'

export default function PrimaryButton({ children, className = '', type = 'button', ...props }) {
  return (
    <motion.button
      type={type}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.15 }}
      className={`inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-md bg-gold px-6 font-ui text-base font-semibold text-white shadow-card transition-colors hover:bg-gold-deep disabled:opacity-50 disabled:pointer-events-none ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  )
}
