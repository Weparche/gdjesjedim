const LIDO_PARKING = {
  label: 'Lido parking',
  url: 'https://maps.app.goo.gl/x2C1p515xGxpGJgE6'
}

/** Dodatni linkovi na javnoj stranici po slug-u događaja. */
export function getPublicEventExtras(slug) {
  if (slug?.startsWith('marijino-krstenje')) {
    return { parking: LIDO_PARKING }
  }
  return {}
}
