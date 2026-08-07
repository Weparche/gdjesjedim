const DIACRITIC_MAP = { đ: 'd', Đ: 'd' }

export function normalizeName(name) {
  const mapped = String(name ?? '')
    .split('')
    .map((ch) => DIACRITIC_MAP[ch] ?? ch)
    .join('')

  return mapped
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
}
