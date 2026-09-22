import { addLocalPhoto, listLocalPhotos, removeLocalPhoto } from './localGalleryStore.js'
import { preparePhoto } from '../lib/photo.js'
import { apiUrl } from '../lib/apiBase.js'
import {
  getPhotoDeleteToken,
  markDeletablePhotos,
  removePhotoDeleteToken,
  savePhotoDeleteToken
} from './photoTokenStore.js'

const useLocal = ['localhost', '127.0.0.1'].includes(window.location.hostname)

function storage() {
  try {
    return window.localStorage
  } catch {
    return undefined
  }
}

async function remoteRequest(path, options) {
  const response = await fetch(apiUrl(path), options)
  const payload = await response.json().catch(() => null)
  if (!response.ok) throw new Error(payload?.error ?? 'Fotografiju nije moguće spremiti.')
  return payload
}

function withRemoteMediaUrls(photo) {
  return {
    ...photo,
    url: apiUrl(photo.url),
    thumbnailUrl: apiUrl(photo.thumbnailUrl)
  }
}

const galleryRepository = {
  async listPhotos(slug) {
    if (useLocal) {
      const photos = await listLocalPhotos(slug)
      return photos.map((photo) => ({ ...photo, canDelete: true }))
    }
    const photos = await remoteRequest(`/api/events/${encodeURIComponent(slug)}/photos`)
    return markDeletablePhotos(storage(), slug, photos.map(withRemoteMediaUrls))
  },
  async uploadPhoto(slug, sourceFile) {
    const prepared = await preparePhoto(sourceFile)
    if (useLocal) return { ...(await addLocalPhoto(slug, prepared.file, prepared)), canDelete: true }
    const photo = withRemoteMediaUrls(await remoteRequest(`/api/events/${encodeURIComponent(slug)}/photos`, {
      method: 'POST',
      headers: {
        'Content-Type': prepared.file.type,
        'X-File-Name': encodeURIComponent(sourceFile.name)
      },
      body: prepared.file
    }))
    if (photo.deleteToken) savePhotoDeleteToken(storage(), slug, photo.id, photo.deleteToken)
    return { ...photo, canDelete: true }
  },
  async deletePhoto(slug, photoId) {
    if (useLocal) {
      await removeLocalPhoto(slug, photoId)
      return
    }
    const token = getPhotoDeleteToken(storage(), slug, photoId)
    if (!token) throw new Error('Ovu fotografiju može obrisati samo osoba koja ju je dodala.')
    const response = await fetch(apiUrl(`/api/photos/${encodeURIComponent(photoId)}`), {
      method: 'DELETE',
      headers: { 'X-Photo-Token': token }
    })
    if (response.status === 204) {
      removePhotoDeleteToken(storage(), slug, photoId)
      return
    }
    const payload = await response.json().catch(() => null)
    throw new Error(payload?.error ?? 'Fotografiju nije moguće obrisati.')
  }
}

export default galleryRepository
