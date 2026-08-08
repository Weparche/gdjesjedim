import { motion } from 'framer-motion'

// `radius` is an explicit prop rather than a className override: both `rounded-md`
// and `rounded-pill` are border-radius utilities of equal specificity, so which one
// won would depend on Tailwind's stylesheet emission order, not on class order.
export default function PrimaryButton({
  children,
  className = '',
  radius = 'rounded-md',
  type = 'button',
  ...props
}) {
  return (
    <motion.button
      type={type}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.15 }}
      className={`inline-flex min-h-[52px] w-full items-center justify-center gap-2 ${radius} bg-gold px-6 font-ui text-base font-semibold text-white shadow-card transition-colors hover:bg-gold-deep disabled:bg-cream disabled:text-charcoal-soft disabled:shadow-none disabled:pointer-events-none ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  )
}
