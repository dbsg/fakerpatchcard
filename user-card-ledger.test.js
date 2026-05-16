const assert = require('assert')
const {
  buildDuplicateKey,
  buildRepurchaseInstancePatch,
  buildStatusQuantitySummary,
  createPartialSaleSplit,
  hasSeriesImageLink,
  isSeriesImageNumberMismatch,
  unlinkStaleRepurchaseSeriesImage
} = require('../miniprogram-card/utils/userCardLedger')

function test(name, fn) {
  try {
    fn()
    console.log(`ok - ${name}`)
  } catch (err) {
    console.error(`not ok - ${name}`)
    throw err
  }
}

const statusMeta = {
  holding: { label: '持有中' },
  selling: { label: '出售中' },
  sold: { label: '已卖出' }
}

test('summarizes mixed same-card statuses by card quantity', () => {
  const summary = buildStatusQuantitySummary([
    { status: 'holding', quantity: 8 },
    { status: 'sold', quantity: 1 }
  ], statusMeta)

  assert.strictEqual(summary, '持有中8 · 已卖出1')
})

test('splits one sold copy out of a multi-quantity ledger record', () => {
  const split = createPartialSaleSplit(
    { _id: 'item_1', status: 'holding', quantity: 9 },
    {
      player: 'Tristan Thompson',
      year: '2024-25',
      brand: 'Panini',
      cardSeries: 'Silhouette',
      cardName: 'NBA Finals',
      cardNumber: '',
      quantity: '9',
      saleQuantity: '1',
      purchasePrice: '950',
      purchaseDate: '2026-05-01',
      status: 'sold',
      salePrice: '120',
      saleDate: '2026-05-15',
      note: 'partial sale'
    }
  )

  assert.strictEqual(split.shouldSplit, true)
  assert.strictEqual(split.remainingFields.quantity, '8')
  assert.strictEqual(split.remainingFields.status, 'holding')
  assert.strictEqual(split.remainingFields.purchasePrice, '844.44')
  assert.strictEqual(split.remainingFields.salePrice, '')
  assert.strictEqual(split.soldFields.quantity, '1')
  assert.strictEqual(split.soldFields.status, 'sold')
  assert.strictEqual(split.soldFields.purchasePrice, '105.56')
  assert.strictEqual(split.soldFields.salePrice, '120')
  assert.strictEqual(split.soldFields.saleQuantity, undefined)
})

test('keeps remaining copies selling when the original record was selling', () => {
  const split = createPartialSaleSplit(
    { _id: 'item_1', status: 'selling', quantity: 3 },
    { quantity: '3', saleQuantity: '1', purchasePrice: '300', status: 'sold', salePrice: '120' }
  )

  assert.strictEqual(split.shouldSplit, true)
  assert.strictEqual(split.remainingFields.quantity, '2')
  assert.strictEqual(split.remainingFields.status, 'selling')
})

test('does not split when the sold quantity is the full record quantity', () => {
  const split = createPartialSaleSplit(
    { _id: 'item_1', status: 'holding', quantity: 2 },
    { quantity: '2', saleQuantity: '2', purchasePrice: '200', status: 'sold', salePrice: '220' }
  )

  assert.strictEqual(split.shouldSplit, false)
})

test('duplicate keys keep serial-numbered cards distinct within the same print run', () => {
  const base = {
    player: 'Matthew Dellavedova',
    playerCN: '马修·德拉维多瓦',
    year: '2024-25',
    brand: 'Panini',
    cardSeries: 'Silhouette',
    cardName: '22 Matthew Dellavedova, Cleveland Cavaliers /21',
    condition: '通行'
  }

  assert.notStrictEqual(
    buildDuplicateKey({ ...base, cardNumber: '17/21' }),
    buildDuplicateKey({ ...base, cardNumber: '19/21' })
  )
  assert.strictEqual(
    buildDuplicateKey({ ...base, cardNumber: '17 / 21' }),
    buildDuplicateKey({ ...base, cardNumber: '17/21' })
  )
})

test('repurchase clears stale series image linkage when the serial number changes', () => {
  const original = {
    seriesId: 'series_1',
    seriesName: '2024-25 Panini Silhouette NBA Finals',
    itemId: 'item_22',
    itemText: '22 Matthew Dellavedova, Cleveland Cavaliers /21',
    imageId: 'img_19',
    imageUrl: 'cloud://bucket/19.png',
    backImageUrl: 'cloud://bucket/19_back.png',
    detailImageUrls: ['cloud://bucket/19_detail.png'],
    cardNumber: '19/21'
  }
  const next = unlinkStaleRepurchaseSeriesImage({
    ...original,
    cardNumber: '17/21'
  }, original)

  assert.strictEqual(next.seriesId, 'series_1')
  assert.strictEqual(next.seriesName, '2024-25 Panini Silhouette NBA Finals')
  assert.strictEqual(next.itemId, 'item_22')
  assert.strictEqual(next.imageId, '')
  assert.strictEqual(next.imageUrl, '')
  assert.deepStrictEqual(next.detailImageUrls, [])
  assert.strictEqual(hasSeriesImageLink(next), false)
})

test('repurchase keeps a newly uploaded front image while clearing the stale series image id', () => {
  const original = {
    seriesId: 'series_1',
    imageId: 'img_19',
    imageUrl: 'cloud://bucket/19.png',
    cardNumber: '19/21'
  }
  const next = unlinkStaleRepurchaseSeriesImage({
    ...original,
    imageUrl: 'cloud://bucket/user-uploaded-17.png',
    cardNumber: '17/21'
  }, original)

  assert.strictEqual(next.imageId, '')
  assert.strictEqual(next.imageUrl, 'cloud://bucket/user-uploaded-17.png')
  assert.strictEqual(hasSeriesImageLink(next), false)
})

test('repurchase of a numbered card clears the concrete image and serial numerator', () => {
  const patch = buildRepurchaseInstancePatch({
    imageId: 'img_19',
    imageUrl: 'cloud://bucket/19.png',
    backImageUrl: 'cloud://bucket/19_back.png',
    detailImageUrls: ['cloud://bucket/19_detail.png'],
    cardNumber: '19/21'
  })

  assert.strictEqual(patch.imageId, '')
  assert.strictEqual(patch.imageUrl, '')
  assert.strictEqual(patch.backImageUrl, '')
  assert.deepStrictEqual(patch.detailImageUrls, [])
  assert.strictEqual(patch.cardNumber, '/21')
})

test('repurchase of an unnumbered card keeps the reusable image context', () => {
  const patch = buildRepurchaseInstancePatch({
    imageId: 'img_base',
    imageUrl: 'cloud://bucket/base.png',
    backImageUrl: 'cloud://bucket/base_back.png',
    detailImageUrls: ['cloud://bucket/base_detail.png'],
    cardNumber: ''
  })

  assert.strictEqual(patch.imageId, 'img_base')
  assert.strictEqual(patch.imageUrl, 'cloud://bucket/base.png')
  assert.strictEqual(patch.backImageUrl, 'cloud://bucket/base_back.png')
  assert.deepStrictEqual(patch.detailImageUrls, ['cloud://bucket/base_detail.png'])
  assert.strictEqual(patch.cardNumber, '')
})

test('detects stale series image links when the stored image number differs from the card number', () => {
  assert.strictEqual(
    isSeriesImageNumberMismatch(
      { cardNumber: '17/21' },
      { cardNumber: '19 / 21' }
    ),
    true
  )
  assert.strictEqual(
    isSeriesImageNumberMismatch(
      { cardNumber: '17 / 21' },
      { cardNumber: '17/21' }
    ),
    false
  )
})
