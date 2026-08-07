export default function StepIndicator({ step, totalSteps }) {
  return (
    <ol className="mt-4 flex items-center" aria-label={`Korak ${step} od ${totalSteps}`}>
      {Array.from({ length: totalSteps }, (_, i) => i + 1).map((n, i) => (
        <li key={n} className="flex items-center">
          <span
            aria-current={n === step ? 'step' : undefined}
            className={`flex h-7 w-7 items-center justify-center rounded-pill font-ui text-sm font-semibold ${
              n === step
                ? 'bg-gold text-white'
                : n < step
                ? 'border-2 border-gold text-gold'
                : 'bg-cream text-charcoal-soft'
            }`}
          >
            {n}
          </span>
          {i < totalSteps - 1 && (
            <span className={`mx-1.5 h-px w-6 ${n < step ? 'bg-gold' : 'bg-cream'}`} aria-hidden="true" />
          )}
        </li>
      ))}
    </ol>
  )
}
