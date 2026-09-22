import { addLocalPhoto, listLocalPhotos, removeLocalPhoto } from './localGalleryStore.js'
import { preparePhoto } from '../lib/photo.js'
import { apiUrl } from '../lib/apiBase.js'
import { getEventAdminToken } from './apiRepository.js'
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

function isEventAdmin(storage, eventId) {
  return Boolean(getEventAdminToken(storage, eventId))
}

const galleryRepository = {
  async listPhotos(slug, eventId) {
    if (useLocal) {
      const photos = await listLocalPhotos(slug)
      return photos.map((photo) => ({ ...photo, canDelete: true }))
    }
    const store = storage()
    const photos = (await remoteRequest(`/api/events/${encodeURIComponent(slug)}/photos`)).map(withRemoteMediaUrls)
    if (isEventAdmin(store, eventId)) return photos.map((photo) => ({ ...photo, canDelete: true }))
    return markDeletablePhotos(store, slug, photos)
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
  async deletePhoto(slug, photoId, eventId) {
    if (useLocal) {
      await removeLocalPhoto(slug, photoId)
      return
    }
    const store = storage()
    const adminToken = getEventAdminToken(store, eventId)
    const headers = {}
    if (adminToken) headers.Authorization = `Bearer ${adminToken}`
    else {
      const token = getPhotoDeleteToken(store, slug, photoId)
      if (!token) throw new Error('Ovu fotografiju može obrisati samo osoba koja ju je dodala.')
      headers['X-Photo-Token'] = token
    }
    const response = await fetch(apiUrl(`/api/photos/${encodeURIComponent(photoId)}`), {
      method: 'DELETE',
      headers
    })
    if (response.status === 204) {
      removePhotoDeleteToken(store, slug, photoId)
      return
    }
    const payload = await response.json().catch(() => null)
    throw new Error(payload?.error ?? 'Fotografiju nije moguće obrisati.')
  },
  async deleteAllPhotos(slug, eventId) {
    if (useLocal) {
      const photos = await listLocalPhotos(slug)
      await Promise.all(photos.map((photo) => removeLocalPhoto(slug, photo.id)))
      return
    }
    const adminToken = getEventAdminToken(storage(), eventId)
    if (!adminToken) throw new Error('Samo administrator događaja može obrisati cijelu galeriju.')
    const response = await fetch(apiUrl(`/api/events/${encodeURIComponent(slug)}/photos`), {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` }
    })
    if (response.status === 204) return
    const payload = await response.json().catch(() => null)
    throw new Error(payload?.error ?? 'Galeriju nije moguće obrisati.')
  }
}

export default galleryRepository
