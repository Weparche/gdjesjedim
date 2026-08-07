import { normalizeName } from './normalize.js'

export function slugify(title) {
  const base = normalizeName(title)
  return base
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}
