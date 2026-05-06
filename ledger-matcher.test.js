const assert = require('assert')
const {
  findLedgerLinkCandidates,
  scoreLedgerLinkCandidate,
  buildLedgerLinkPatch
} = require('../miniprogram-card/cloudfunctions/seriesOps/ledgerMatcher')

function test(name, fn) {
  try {
    fn()
    console.log(`ok - ${name}`)
  } catch (err) {
    console.error(`not ok - ${name}`)
    throw err
  }
}

test('finds one existing ledger item by player, year, series and serial number', () => {
  const target = {
    seriesId: 'series_a',
    seriesName: '2024-25 Panini Silhouette NBA Finals',
    itemText: '27 Richard Jefferson, Cleveland Cavaliers /49',
    imageId: 'img_27_2',
    imageUrl: 'cloud://front',
    player: 'Richard Jefferson',
    playerCN: '理查德 杰弗森',
    year: '2024-25',
    brand: 'Panini',
    cardSeries: 'Silhouette',
    cardName: '27 Richard Jefferson, Cleveland Cavaliers /49',
    cardNumber: '2/49',
    cardFeatures: ['game_worn']
  }
  const items = [
    {
      _id: 'mine',
      openid: 'u1',
      player: 'Richard Jefferson',
      playerCN: '理查德 杰弗森',
      year: '2024-25',
      brand: 'Panini',
      cardSeries: 'Silhouette',
      cardName: 'Silhouette NBA Finals',
      cardNumber: '2/49',
      cardFeatures: ['game_worn'],
      status: 'holding'
    },
    {
      _id: 'other-number',
      openid: 'u1',
      player: 'Richard Jefferson',
      year: '2024-25',
      brand: 'Panini',
      cardSeries: 'Silhouette',
      cardNumber: '3/49',
      status: 'holding'
    }
  ]

  const candidates = findLedgerLinkCandidates(items, target)

  assert.strictEqual(candidates.length, 1)
  assert.strictEqual(candidates[0]._id, 'mine')
  assert(candidates[0]._matchReasons.includes('编号'))
})

test('returns multiple candidates when existing ledger data is ambiguous', () => {
  const target = {
    player: 'LeBron James',
    playerCN: '勒布朗 詹姆斯',
    year: '2016-17',
    brand: 'Panini',
    cardSeries: 'National Treasures',
    cardName: 'Colossal Materials',
    cardNumber: '23/99'
  }
  const items = [
    { _id: 'a', player: 'LeBron James', year: '2016-17', brand: 'Panini', cardSeries: 'National Treasures', cardNumber: '23/99', status: 'holding' },
    { _id: 'b', player: '勒布朗 詹姆斯', year: '2016-17', brand: 'Panini', cardSeries: 'National Treasures', cardNumber: '23/99', status: 'holding' }
  ]

  const candidates = findLedgerLinkCandidates(items, target)

  assert.deepStrictEqual(candidates.map(item => item._id), ['a', 'b'])
})

test('rejects sold records and records already linked to another live series image', () => {
  const target = {
    seriesId: 'current_series',
    imageId: 'current_image',
    player: 'Kevin Love',
    year: '2020-21',
    brand: 'Panini',
    cardSeries: 'Immaculate',
    cardNumber: '47/99'
  }
  const sold = { _id: 'sold', player: 'Kevin Love', year: '2020-21', brand: 'Panini', cardSeries: 'Immaculate', cardNumber: '47/99', status: 'sold' }
  const linkedElsewhere = { _id: 'linked', seriesId: 'other_series', imageId: 'other_image', player: 'Kevin Love', year: '2020-21', brand: 'Panini', cardSeries: 'Immaculate', cardNumber: '47/99', status: 'holding' }

  assert.strictEqual(scoreLedgerLinkCandidate(sold, target).matched, false)
  assert.strictEqual(scoreLedgerLinkCandidate(linkedElsewhere, target).matched, false)
})

test('builds a link patch without replacing private purchase data or an existing cover image', () => {
  const existing = {
    _id: 'mine',
    imageUrl: 'cloud://my-own-front',
    purchasePrice: 188,
    purchaseDate: '2026-05-01',
    note: 'private note',
    player: 'LeBron James',
    status: 'holding'
  }
  const target = {
    seriesId: 'series_a',
    seriesName: '2016-17 Panini National Treasures',
    subset: 'Base',
    itemId: 'item_1',
    itemText: 'LeBron James /99',
    imageId: 'img_1',
    imageUrl: 'cloud://series-front',
    backImageUrl: 'cloud://series-back',
    player: 'LeBron James',
    year: '2016-17',
    brand: 'Panini',
    cardSeries: 'National Treasures',
    cardName: 'Base',
    cardNumber: '1/99'
  }

  const patch = buildLedgerLinkPatch(existing, target)

  assert.strictEqual(patch.seriesId, 'series_a')
  assert.strictEqual(patch.imageId, 'img_1')
  assert.strictEqual(patch.imageUrl, 'cloud://my-own-front')
  assert.strictEqual(patch.backImageUrl, 'cloud://series-back')
  assert.strictEqual(patch.purchasePrice, undefined)
  assert.strictEqual(patch.note, undefined)
  assert.strictEqual(patch.cardNumber, '1/99')
})
