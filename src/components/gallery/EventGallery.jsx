import { useEffect, useRef, useState } from 'react'
import { Camera, ChevronLeft, ChevronRight, ImagePlus, Images, LoaderCircle, X } from 'lucide-react'
import galleryRepository from '../../data/galleryRepository.js'

function GalleryButton({ icon: Icon, children, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-pill border border-gold/45 bg-white px-3 font-ui text-sm font-semibold text-charcoal shadow-card transition-colors hover:bg-cream disabled:opacity-50"
    >
      <Icon size={18} strokeWidth={1.7} aria-hidden="true" />
      {children}
    </button>
  )
}

function PhotoViewer({ photos, index, onIndex, onClose }) {
  const photo = photos[index]

  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === 'Escape') onClose()
      if (event.key === 'ArrowLeft' && index > 0) onIndex(index - 1)
      if (event.key === 'ArrowRight' && index < photos.length - 1) onIndex(index + 1)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [index, onClose, onIndex, photos.length])

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-charcoal/95" role="dialog" aria-modal="true" aria-label="Pregled fotografije">
      <div className="flex min-h-16 items-center justify-between px-3 text-white">
        <span className="px-2 font-ui text-sm tabular-nums">{index + 1} / {photos.length}</span>
        <button type="button" onClick={onClose} className="flex h-11 w-11 items-center justify-center rounded-pill bg-white/10" aria-label="Zatvori fotografiju">
          <X size={24} aria-hidden="true" />
        </button>
      </div>
      <div className="relative flex min-h-0 flex-1 items-center justify-center px-3 pb-6">
        <img src={photo.url} alt={`Fotografija ${index + 1}`} className="max-h-full max-w-full object-contain" />
        {index > 0 && (
          <button type="button" onClick={() => onIndex(index - 1)} className="absolute left-3 flex h-11 w-11 items-center justify-center rounded-pill bg-white/15 text-white" aria-label="Prethodna fotografija">
            <ChevronLeft size={25} aria-hidden="true" />
          </button>
        )}
        {index < photos.length - 1 && (
          <button type="button" onClick={() => onIndex(index + 1)} className="absolute right-3 flex h-11 w-11 items-center justify-center rounded-pill bg-white/15 text-white" aria-label="Sljedeća fotografija">
            <ChevronRight size={25} aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  )
}

export default function EventGallery({ slug }) {
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(0)
  const [error, setError] = useState('')
  const [viewerIndex, setViewerIndex] = useState(null)
  const cameraInput = useRef(null)
  const galleryInput = useRef(null)

  useEffect(() => {
    let active = true
    async function refresh({ quiet = false } = {}) {
      try {
        const next = await galleryRepository.listPhotos(slug)
        if (active) setPhotos(next)
      } catch {
        if (active && !quiet) setError('Galeriju trenutačno nije moguće učitati.')
      } finally {
        if (active && !quiet) setLoading(false)
      }
    }
    refresh()
    const isRemote = !['localhost', '127.0.0.1'].includes(window.location.hostname)
    const refreshTimer = isRemote ? window.setInterval(() => refresh({ quiet: true }), 15000) : null
    return () => {
      active = false
      if (refreshTimer) window.clearInterval(refreshTimer)
    }
  }, [slug])

  async function handleFiles(fileList) {
    const files = Array.from(fileList ?? [])
    if (!files.length) return
    setError('')
    setUploading(files.length)
    const added = []
    for (const file of files) {
      try {
        added.push(await galleryRepository.uploadPhoto(slug, file))
      } catch (caught) {
        setError(caught.message || 'Fotografiju nije moguće spremiti.')
      } finally {
        setUploading((count) => Math.max(0, count - 1))
      }
    }
    if (added.length) setPhotos((current) => [...added.reverse(), ...current])
    if (cameraInput.current) cameraInput.current.value = ''
    if (galleryInput.current) galleryInput.current.value = ''
  }

  return (
    <section aria-labelledby="gallery-title">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="font-ui text-xs font-semibold uppercase tracking-[0.18em] text-gold-deep">Zajedničke uspomene</p>
          <h2 id="gallery-title" className="mt-1 font-display text-2xl text-charcoal">Galerija</h2>
        </div>
        {photos.length > 0 && (
          <span className="pb-1 font-ui text-xs text-charcoal-soft">
            {photos.length} {photos.length === 1 ? 'fotografija' : photos.length < 5 ? 'fotografije' : 'fotografija'}
          </span>
        )}
      </div>

      <div className="mt-3 flex gap-2">
        <GalleryButton icon={Camera} onClick={() => cameraInput.current?.click()} disabled={uploading > 0}>Kamera</GalleryButton>
        <GalleryButton icon={ImagePlus} onClick={() => galleryInput.current?.click()} disabled={uploading > 0}>Iz galerije</GalleryButton>
      </div>
      <input ref={cameraInput} className="sr-only" type="file" accept="image/*" capture="environment" aria-label="Snimi fotografiju kamerom" onChange={(event) => handleFiles(event.target.files)} />
      <input ref={galleryInput} className="sr-only" type="file" accept="image/*" multiple aria-label="Dodaj fotografije iz galerije" onChange={(event) => handleFiles(event.target.files)} />

      {uploading > 0 && (
        <div className="mt-3 flex min-h-12 items-center gap-3 rounded-md bg-cream px-4" role="status">
          <LoaderCircle size={18} className="animate-spin text-gold-deep" aria-hidden="true" />
          <span className="font-ui text-sm font-semibold text-charcoal">Spremam {uploading === 1 ? 'fotografiju' : `${uploading} fotografije`}…</span>
        </div>
      )}
      {error && <p className="mt-3 rounded-md bg-blush-soft px-4 py-3 font-ui text-sm font-semibold text-terracotta" role="alert">{error}</p>}

      {loading ? (
        <div className="mt-3 aspect-[4/3] animate-pulse rounded-lg bg-cream" aria-label="Učitavanje galerije" />
      ) : photos.length > 0 ? (
        <div className="gallery-grid mt-3 overflow-hidden rounded-lg bg-cream" aria-label="Fotografije s događaja">
          {photos.map((photo, index) => (
            <button
              key={photo.id}
              type="button"
              onClick={() => setViewerIndex(index)}
              className={`gallery-photo relative min-h-20 overflow-hidden bg-cream ${index === 0 ? 'gallery-photo-featured' : ''}`}
              aria-label={`Otvori fotografiju ${index + 1}`}
            >
              <img src={photo.thumbnailUrl} alt="" loading={index > 2 ? 'lazy' : 'eager'} className="h-full w-full object-cover transition-transform duration-300 hover:scale-[1.03]" />
            </button>
          ))}
        </div>
      ) : (
        <div className="mt-3 flex min-h-40 flex-col items-center justify-center rounded-lg border border-dashed border-gold/45 bg-white/60 px-6 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-pill bg-cream text-gold-deep"><Images size={22} strokeWidth={1.6} aria-hidden="true" /></span>
          <p className="mt-3 font-display text-lg text-charcoal">Prva fotografija čeka vas</p>
          <p className="mt-1 font-ui text-sm leading-relaxed text-charcoal-soft">Snimi trenutak ili ga odaberi iz galerije mobitela.</p>
        </div>
      )}

      {viewerIndex !== null && photos[viewerIndex] && (
        <PhotoViewer photos={photos} index={viewerIndex} onIndex={setViewerIndex} onClose={() => setViewerIndex(null)} />
      )}
    </section>
  )
}
