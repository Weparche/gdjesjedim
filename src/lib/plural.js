// Croatian numeral-noun agreement.
//
// Croatian picks the noun form from the LAST digits of the count, not from
// "is it 1 or not" as English does:
//   - counts ending in 1  (1, 21, 101)      -> `one`   ("1 stol")
//   - counts ending in 2-4 (2, 3, 4, 22)    -> `few`   ("3 stola")
//   - everything else (0, 5-20, 25, 111)    -> `many`  ("5 stolova")
// The teens are the exception that trips people up: 11-14 (and 111-114, ...)
// always take `many`, even though they end in 1-4.
export function pluralHr(n, one, few, many) {
  const abs = Math.abs(Math.trunc(n))
  const lastTwo = abs % 100
  if (lastTwo >= 11 && lastTwo <= 14) return many
  const last = abs % 10
  if (last === 1) return one
  if (last >= 2 && last <= 4) return few
  return many
}

// "gost" collapses `one` and `few` onto the same surface form. This is only
// correct in the ACCUSATIVE frame ("Dodaj N gosta") used on the Guests page
// (guest-import button) and the Guests page's "Dodaj N gosta" affordance:
//   1 gosta, 2 gosta, 3 gosta, 4 gosta, 5 gostiju, 11 gostiju, 21 gosta
// Do not reuse this for NOMINATIVE contexts (e.g. "N gost(a/iju) na popisu")
// -- use `pluralizeGostiNominative` below for those instead.
export function pluralizeGosti(n) {
  return pluralHr(n, 'gosta', 'gosta', 'gostiju')
}

// Nominative form of "gost", for contexts like "1 gost", "2 gosta", "5
// gostiju" (e.g. a summary count, or as the subject of a sentence).
export function pluralizeGostiNominative(n) {
  return pluralHr(n, 'gost', 'gosta', 'gostiju')
}

// "nemati" (3rd person) agreement with a quantified noun phrase: singular
// "nema" for one and for genitive-plural counts (5+), "nemaju" for the
// paucal 2-4 case, which is grammatically plural.
export function pluralizeNema(n) {
  return pluralHr(n, 'nema', 'nemaju', 'nema')
}

export function pluralizeStolovi(n) {
  return pluralHr(n, 'stol', 'stola', 'stolova')
}

export function pluralizeLokacije(n) {
  return pluralHr(n, 'lokacija', 'lokacije', 'lokacija')
}
