import { addLocalPhoto, deleteLocalPhoto, listLocalPhotos } from './localGalleryStore.js'
import { preparePhoto } from '../lib/photo.js'
import { backendUrl } from './backendUrl.js'

const useLocal = ['localhost', '127.0.0.1'].includes(window.location.hostname)
const DELETE_TOKENS_KEY = 'gdjesjedim.photo-delete-tokens.v1'

function readDeleteTokens() {
  try {
    return JSON.parse(window.localStorage.getItem(DELETE_TOKENS_KEY) ?? '{}')
  } catch {
    return {}
  }
}

function writeDeleteTokens(tokens) {
  try {
    window.localStorage.setItem(DELETE_TOKENS_KEY, JSON.stringify(tokens))
  } catch {
    // The photo remains uploaded if browser storage is unavailable, but this
    // device cannot prove ownership for a later delete request.
  }
}

function rememberDeleteToken(photoId, token) {
  if (!photoId || !token) return
  writeDeleteTokens({ ...readDeleteTokens(), [photoId]: token })
}

function forgetDeleteToken(photoId) {
  const tokens = readDeleteTokens()
  delete tokens[photoId]
  writeDeleteTokens(tokens)
}

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
    const deleteTokens = readDeleteTokens()
    const photos = await remoteRequest(`/api/events/${encodeURIComponent(slug)}/photos`)
    return photos.map((photo) => ({ ...absolutePhotoUrls(photo), canDelete: Boolean(deleteTokens[photo.id]) }))
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
    rememberDeleteToken(photo.id, photo.deleteToken)
    const { deleteToken, ...publicPhoto } = photo
    return { ...absolutePhotoUrls(publicPhoto), canDelete: true }
  },
  async deletePhoto(slug, photoId) {
    if (useLocal) return deleteLocalPhoto(slug, photoId)
    const token = readDeleteTokens()[photoId]
    if (!token) throw new Error('Ovu fotografiju može obrisati samo osoba koja ju je dodala.')
    await remoteRequest(`/api/events/${encodeURIComponent(slug)}/photos/${encodeURIComponent(photoId)}`, {
      method: 'DELETE',
      headers: { 'X-Photo-Delete-Token': token }
    })
    forgetDeleteToken(photoId)
  }
}

export default galleryRepository
