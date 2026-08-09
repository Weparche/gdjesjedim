import { addLocalPhoto, listLocalPhotos } from './localGalleryStore.js'
import { preparePhoto } from '../lib/photo.js'
import { backendUrl } from './backendUrl.js'

const useLocal = ['localhost', '127.0.0.1'].includes(window.location.hostname)

async function remoteRequest(path, options) {
  const response = await fetch(backendUrl(path), options)
  const payload = await response.json().catch(() => null)
  if (!response.ok) throw new Error(payload?.error ?? 'Fotografiju nije moguće spremiti.')
  return payload
}

function absolutePhotoUrls(photo) {
  return {
    ...photo,
    url: backendUrl(photo.url),
    thumbnailUrl: backendUrl(photo.thumbnailUrl)
  }
}

const galleryRepository = {
  async listPhotos(slug) {
    if (useLocal) return listLocalPhotos(slug)
    const photos = await remoteRequest(`/api/events/${encodeURIComponent(slug)}/photos`)
    return photos.map(absolutePhotoUrls)
  },
  async uploadPhoto(slug, sourceFile) {
    const prepared = await preparePhoto(sourceFile)
    if (useLocal) return addLocalPhoto(slug, prepared.file, prepared)
    const photo = await remoteRequest(`/api/events/${encodeURIComponent(slug)}/photos`, {
      method: 'POST',
      headers: {
        'Content-Type': prepared.file.type,
        'X-File-Name': encodeURIComponent(sourceFile.name)
      },
      body: prepared.file
    })
    return absolutePhotoUrls(photo)
  }
}

export default galleryRepository
