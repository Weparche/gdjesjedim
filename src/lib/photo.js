const MAX_UPLOAD_BYTES = 20 * 1024 * 1024

function loadBitmap(file) {
  if ('createImageBitmap' in window) return createImageBitmap(file, { imageOrientation: 'from-image' })
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Fotografiju nije moguće otvoriti.'))
    image.src = URL.createObjectURL(file)
  })
}

function canvasBlob(canvas, type, quality) {
  return new Promise((resolve, reject) => canvas.toBlob(
    (blob) => blob ? resolve(blob) : reject(new Error('Fotografiju nije moguće pripremiti.')),
    type,
    quality
  ))
}

export async function preparePhoto(file) {
  if (!file?.type?.startsWith('image/')) throw new Error('Odabrana datoteka nije fotografija.')
  const bitmap = await loadBitmap(file)
  const sourceWidth = bitmap.width || bitmap.naturalWidth
  const sourceHeight = bitmap.height || bitmap.naturalHeight
  const scale = Math.min(1, 4096 / Math.max(sourceWidth, sourceHeight))
  const width = Math.max(1, Math.round(sourceWidth * scale))
  const height = Math.max(1, Math.round(sourceHeight * scale))

  if (file.size <= MAX_UPLOAD_BYTES && scale === 1 && !/hei[cf]/i.test(file.type)) {
    bitmap.close?.()
    return { file, width, height }
  }

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  canvas.getContext('2d', { alpha: false }).drawImage(bitmap, 0, 0, width, height)
  bitmap.close?.()
  const blob = await canvasBlob(canvas, 'image/jpeg', 0.88)
  if (blob.size > MAX_UPLOAD_BYTES) throw new Error('Fotografija je prevelika i nakon optimizacije.')
  return { file: new File([blob], file.name.replace(/\.[^.]+$/, '') + '.jpg', { type: 'image/jpeg' }), width, height }
}
