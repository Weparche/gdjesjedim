import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { QrCode } from 'lucide-react'

export default function QRCard({ url }) {
  const [dataUrl, setDataUrl] = useState(null)

  useEffect(() => {
    let cancelled = false
    QRCode.toDataURL(url, { margin: 1, width: 480, color: { dark: '#2B2420', light: '#FFFFFF' } }).then((d) => {
      if (!cancelled) setDataUrl(d)
    })
    return () => {
      cancelled = true
    }
  }, [url])

  return (
    <div className="rounded-lg bg-white p-4 text-center shadow-card">
      {dataUrl ? (
        <img src={dataUrl} alt="QR kod za stranicu događaja" className="mx-auto w-48" />
      ) : (
        <div className="mx-auto h-48 w-48 animate-pulse rounded-md bg-cream" />
      )}
      {dataUrl && (
        <a
          href={dataUrl}
          download="gdjesjedim-qr.png"
          className="mt-3 inline-flex min-h-[44px] items-center gap-2 font-ui text-sm font-semibold text-gold-deep"
        >
          <QrCode size={18} strokeWidth={1.5} aria-hidden="true" />
          Preuzmi QR
        </a>
      )}
    </div>
  )
}
