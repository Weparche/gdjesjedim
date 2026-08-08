import { ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import StepIndicator from './StepIndicator.jsx'

export default function PageHeader({ title, onBack, step, totalSteps }) {
  const navigate = useNavigate()
  const handleBack = onBack ?? (() => navigate(-1))

  return (
    <header>
      <div className="flex items-center gap-3">
        {onBack !== null && (
          <button
            type="button"
            onClick={handleBack}
            aria-label="Natrag"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-charcoal hover:bg-cream"
          >
            <ChevronLeft size={22} strokeWidth={1.5} />
          </button>
        )}
        <h1 className="font-display text-2xl leading-tight text-charcoal">{title}</h1>
      </div>
      {step && totalSteps && <StepIndicator step={step} totalSteps={totalSteps} />}
    </header>
  )
}
