import { test } from 'node:test'
import assert from 'node:assert/strict'
import { slugify } from './slug.js'

test('slugifies a Croatian title', () => {
  assert.equal(slugify('Marijino krštenje'), 'marijino-krstenje')
})

test('strips punctuation and collapses dashes', () => {
  assert.equal(slugify('Ana & Marko!!  Vjenčanje'), 'ana-marko-vjencanje')
})

test('trims leading and trailing dashes', () => {
  assert.equal(slugify('  -Rođendan-  '), 'rodendan')
})
