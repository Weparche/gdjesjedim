import { test } from 'node:test'
import assert from 'node:assert/strict'
import { pluralHr, pluralizeGosti, pluralizeStolovi, pluralizeLokacije } from './plural.js'

test('pluralizeGosti follows Croatian numeral-noun agreement', () => {
  // paucal: counts ending in 1-4 take "gosta"
  assert.equal(pluralizeGosti(1), 'gosta')
  assert.equal(pluralizeGosti(2), 'gosta')
  assert.equal(pluralizeGosti(3), 'gosta')
  assert.equal(pluralizeGosti(4), 'gosta')
  assert.equal(pluralizeGosti(21), 'gosta')
  assert.equal(pluralizeGosti(22), 'gosta')
  assert.equal(pluralizeGosti(104), 'gosta')

  // genitive plural: 5-20, and anything ending in 5-0
  assert.equal(pluralizeGosti(5), 'gostiju')
  assert.equal(pluralizeGosti(9), 'gostiju')
  assert.equal(pluralizeGosti(30), 'gostiju')
  assert.equal(pluralizeGosti(0), 'gostiju')

  // the teen exception: 11-14 take "gostiju" despite ending in 1-4
  assert.equal(pluralizeGosti(11), 'gostiju')
  assert.equal(pluralizeGosti(12), 'gostiju')
  assert.equal(pluralizeGosti(13), 'gostiju')
  assert.equal(pluralizeGosti(14), 'gostiju')
  assert.equal(pluralizeGosti(111), 'gostiju')
  assert.equal(pluralizeGosti(112), 'gostiju')
})

test('pluralHr distinguishes all three forms', () => {
  assert.equal(pluralizeStolovi(1), 'stol')
  assert.equal(pluralizeStolovi(2), 'stola')
  assert.equal(pluralizeStolovi(4), 'stola')
  assert.equal(pluralizeStolovi(5), 'stolova')
  assert.equal(pluralizeStolovi(11), 'stolova')
  assert.equal(pluralizeStolovi(21), 'stol')

  assert.equal(pluralizeLokacije(1), 'lokacija')
  assert.equal(pluralizeLokacije(2), 'lokacije')
  assert.equal(pluralizeLokacije(5), 'lokacija')
  assert.equal(pluralizeLokacije(12), 'lokacija')
})

test('pluralHr is defensive about non-integer and negative input', () => {
  assert.equal(pluralHr(0, 'a', 'b', 'c'), 'c')
  assert.equal(pluralHr(-3, 'a', 'b', 'c'), 'b')
  assert.equal(pluralHr(2.7, 'a', 'b', 'c'), 'b')
})
