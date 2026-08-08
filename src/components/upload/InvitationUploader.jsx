import { useRef } from 'react'
import { UploadCloud } from 'lucide-react'

export default function InvitationUploader({ onFileSelected }) {
  const inputRef = useRef(null)

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex min-h-[220px] w-full flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-gold/50 bg-white px-6 py-10 text-center shadow-card"
      >
        <UploadCloud size={32} strokeWidth={1.5} className="text-gold-deep" aria-hidden="true" />
        <span className="font-ui text-base font-semibold text-charcoal">Učitaj pozivnicu</span>
        <span className="font-ui text-sm text-charcoal-soft">PNG, JPG ili PDF</span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept=".png,.jpg,.jpeg,.pdf,image/png,image/jpeg,application/pdf"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onFileSelected(file)
        }}
      />
    </div>
  )
}
