import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { PartyPopper } from 'lucide-react'
import AppShell from '../components/layout/AppShell.jsx'
import ShareLinkCard from '../components/share/ShareLinkCard.jsx'
import QRCard from '../components/share/QRCard.jsx'
import { useEventDraft } from '../context/EventDraftContext.jsx'

export default function SharePage() {
  const navigate = useNavigate()
  const { draft } = useEventDraft()

  useEffect(() => {
    if (!draft.event?.published) navigate('/create/publish', { replace: true })
  }, [draft.event, navigate])

  if (!draft.event?.published) return null

  const url = `${window.location.origin}/e/${draft.event.slug}`

  return (
    <AppShell>
      <div className="flex flex-col items-center pt-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-pill bg-blush-soft">
          <PartyPopper size={28} strokeWidth={1.5} className="text-blush" aria-hidden="true" />
        </div>
        <h1 className="mt-4 font-display text-2xl text-charcoal">Stranica je spremna</h1>
        <p className="mt-2 font-ui text-sm leading-relaxed text-charcoal-soft">
          Podijelite link s gostima kako bi mogli pronaći svoj stol i raspored.
        </p>
      </div>

      <div className="mt-6 space-y-4">
        <ShareLinkCard url={url} />
        <QRCard url={url} />
      </div>
    </AppShell>
  )
}
