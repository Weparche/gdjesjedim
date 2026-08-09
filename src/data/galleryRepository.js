import { addLocalPhoto, listLocalPhotos } from './localGalleryStore.js'
import { preparePhoto } from '../lib/photo.js'

const useLocal = ['localhost', '127.0.0.1'].includes(window.location.hostname)

async function remoteRequest(path, options) {
  const response = await fetch(path, options)
  const payload = await response.json().catch(() => null)
  if (!response.ok) throw new Error(payload?.error ?? 'Fotografiju nije moguće spremiti.')
  return payload
}

const galleryRepository = {
  async listPhotos(slug) {
    if (useLocal) return listLocalPhotos(slug)
    return remoteRequest(`/api/events/${encodeURIComponent(slug)}/photos`)
  },
  async uploadPhoto(slug, sourceFile) {
    const prepared = await preparePhoto(sourceFile)
    if (useLocal) return addLocalPhoto(slug, prepared.file, prepared)
    return remoteRequest(`/api/events/${encodeURIComponent(slug)}/photos`, {
      method: 'POST',
      headers: {
        'Content-Type': prepared.file.type,
        'X-File-Name': encodeURIComponent(sourceFile.name)
      },
      body: prepared.file
    })
  }
}

export default galleryRepository
