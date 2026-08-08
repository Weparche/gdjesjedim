import { Copy, MessageCircle } from 'lucide-react'
import { useToast } from '../common/Toast.jsx'

export default function ShareLinkCard({ url }) {
  const { showToast } = useToast()

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url)
      showToast('Link kopiran')
    } catch {
      showToast('Kopiranje nije uspjelo')
    }
  }

  const waHref = `https://wa.me/?text=${encodeURIComponent(url)}`

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between rounded-lg bg-white px-4 py-3 shadow-card">
        <span className="truncate font-ui text-sm text-charcoal">{url.replace(/^https?:\/\//, '')}</span>
      </div>

      <button
        type="button"
        onClick={copyLink}
        className="flex min-h-[52px] w-full items-center gap-3 rounded-md bg-cream px-4 font-ui text-base font-semibold text-charcoal"
      >
        <Copy size={18} strokeWidth={1.5} aria-hidden="true" />
        Kopiraj link
      </button>

      <a
        href={waHref}
        target="_blank"
        rel="noreferrer"
        className="flex min-h-[52px] w-full items-center gap-3 rounded-md bg-whatsapp/15 px-4 font-ui text-base font-semibold text-charcoal"
      >
        <MessageCircle size={18} strokeWidth={1.5} className="text-whatsapp" aria-hidden="true" />
        Pošalji na WhatsApp
      </a>
    </div>
  )
}
