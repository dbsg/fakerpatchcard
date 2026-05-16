const assert = require('assert')
const {
  findLedgerLinkCandidates,
  scoreLedgerLinkCandidate,
  buildLedgerLinkPatch,
  findBestChecklistItemMatch,
  buildSameCardIdentityKey,
  findLinkedSameCardPeers
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

test('allows a series-scoped repurchase with a private front image to link to a concrete series image', () => {
  const item = {
    _id: 'repurchased',
    seriesId: 'current_series',
    imageId: '',
    imageUrl: 'cloud://user-card-front-17',
    player: 'Matthew Dellavedova',
    playerCN: '马修·德拉维多瓦',
    year: '2024-25',
    brand: 'Panini',
    cardSeries: 'Silhouette',
    cardName: '22 Matthew Dellavedova, Cleveland Cavaliers /21',
    cardNumber: '17/21',
    status: 'holding'
  }
  const target = {
    seriesId: 'current_series',
    imageId: 'series_image_17',
    imageUrl: 'cloud://series-front-17',
    player: 'Matthew Dellavedova',
    playerCN: '马修·德拉维多瓦',
    year: '2024-25',
    brand: 'Panini',
    cardSeries: 'Silhouette',
    cardName: '22 Matthew Dellavedova, Cleveland Cavaliers /21',
    cardNumber: '17/21'
  }

  const score = scoreLedgerLinkCandidate(item, target)

  assert.strictEqual(score.matched, true)
  assert(score.reasons.includes('编号'))
})

test('allows a stale image id to be relinked when the edited card number matches the target image', () => {
  const item = {
    _id: 'repurchased',
    seriesId: 'current_series',
    imageId: 'series_image_19',
    imageUrl: 'cloud://series-front-19',
    player: 'Matthew Dellavedova',
    year: '2024-25',
    brand: 'Panini',
    cardSeries: 'Silhouette',
    cardName: '22 Matthew Dellavedova, Cleveland Cavaliers /21',
    cardNumber: '17/21',
    status: 'holding'
  }
  const target = {
    seriesId: 'current_series',
    imageId: 'series_image_17',
    imageUrl: 'cloud://series-front-17',
    player: 'Matthew Dellavedova',
    year: '2024-25',
    brand: 'Panini',
    cardSeries: 'Silhouette',
    cardName: '22 Matthew Dellavedova, Cleveland Cavaliers /21',
    cardNumber: '17/21'
  }

  assert.strictEqual(scoreLedgerLinkCandidate(item, target).matched, true)
})

test('chooses the checklist card kind with the same print run over a loose title prefix', () => {
  const items = [
    {
      itemId: 'base',
      text: '22 Matthew Dellavedova, Cleveland Cavaliers',
      subset: 'NBA Finals Memorabilia',
      completionTarget: 1
    },
    {
      itemId: 'holo-silver',
      text: '22 Matthew Dellavedova, Cleveland Cavaliers /21',
      subset: 'NBA Finals Memorabilia Holo Silver',
      printRun: 21,
      completionTarget: 21
    }
  ]
  const userItem = {
    itemId: 'base',
    cardName: '22 Matthew Dellavedova, Cleveland Cavaliers /21',
    cardNumber: '17/21'
  }

  const match = findBestChecklistItemMatch(items, userItem)

  assert(match, 'expected a checklist match')
  assert.strictEqual(match.item.itemId, 'holo-silver')
})

test('finds linked peers from the same owned-card group while ignoring serial numerator', () => {
  const target = {
    _id: 'target',
    player: 'Matthew Dellavedova',
    playerCN: '马修·德拉维多瓦',
    year: '2024-25',
    brand: 'Panini',
    cardSeries: 'Silhouette',
    cardName: '22 Matthew Dellavedova, Cleveland Cavaliers /21',
    cardNumber: '17/21',
    condition: '通行'
  }
  const linkedPeer = {
    _id: 'peer',
    seriesId: 'series_a',
    itemId: '',
    imageId: 'img_19',
    player: 'Matthew Dellavedova',
    playerCN: '马修·德拉维多瓦',
    year: '2024-25',
    brand: 'Panini',
    cardSeries: 'Silhouette',
    cardName: '22 Matthew Dellavedova, Cleveland Cavaliers /21',
    cardNumber: '19/21',
    condition: '通行',
    updateTime: '2026-05-16T01:00:00.000Z'
  }
  const otherPrintRun = {
    _id: 'other',
    seriesId: 'series_a',
    itemId: 'item_49',
    player: 'Matthew Dellavedova',
    year: '2024-25',
    brand: 'Panini',
    cardSeries: 'Silhouette',
    cardName: '22 Matthew Dellavedova, Cleveland Cavaliers /49',
    cardNumber: '19/49',
    condition: '通行'
  }

  assert.strictEqual(buildSameCardIdentityKey(target), buildSameCardIdentityKey(linkedPeer))
  assert.notStrictEqual(buildSameCardIdentityKey(target), buildSameCardIdentityKey(otherPrintRun))
  assert.deepStrictEqual(findLinkedSameCardPeers(target, [otherPrintRun, linkedPeer]).map(item => item._id), ['peer'])
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
