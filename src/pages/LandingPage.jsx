import { useNavigate } from 'react-router-dom'
import { Church, Gem, Cake, Wine, ArrowRight } from 'lucide-react'
import AppShell from '../components/layout/AppShell.jsx'
import PrimaryButton from '../components/buttons/PrimaryButton.jsx'
import EventTypeCard from '../components/landing/EventTypeCard.jsx'
import BotanicalDivider from '../components/landing/BotanicalDivider.jsx'
import { useEventDraft } from '../context/EventDraftContext.jsx'

const EVENT_TYPES = [
  { type: 'christening', label: 'Krštenje', icon: Church },
  { type: 'wedding', label: 'Vjenčanje', icon: Gem },
  { type: 'birthday', label: 'Rođendan', icon: Cake },
  { type: 'communion', label: 'Pričest / Krizma', icon: Wine }
]

export default function LandingPage() {
  const navigate = useNavigate()
  const { draft, setEvent } = useEventDraft()

  function selectType(type) {
    setEvent({ ...draft.event, type })
  }

  function goToCreate() {
    if (!draft.event?.type) setEvent({ ...draft.event, type: 'other' })
    navigate('/create/upload')
  }

  return (
    <AppShell>
      <div className="flex items-center gap-2 pt-2">
        <span className="font-display text-lg text-gold" aria-hidden="true">
          🪑
        </span>
        <span className="font-display text-lg text-charcoal">GdjeSjedim.hr</span>
      </div>

      <h1 className="mt-8 font-display text-4xl leading-tight text-charcoal">
        Jedan link za
        <br />
        svaku proslavu
      </h1>

      <p className="mt-4 font-ui text-base leading-relaxed text-charcoal-soft">
        Učitaj pozivnicu, rasporedi goste i pošalji gostima link gdje vide svoj stol i raspored
        događaja.
      </p>

      <div className="mt-6">
        <PrimaryButton onClick={goToCreate}>
          Napravi besplatno
          <ArrowRight size={18} strokeWidth={2} />
        </PrimaryButton>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3">
        {EVENT_TYPES.map(({ type, label, icon }) => (
          <EventTypeCard
            key={type}
            icon={icon}
            label={label}
            selected={draft.event?.type === type}
            onClick={() => selectType(type)}
          />
        ))}
      </div>

      <BotanicalDivider />
    </AppShell>
  )
}
