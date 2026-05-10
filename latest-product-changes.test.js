const assert = require('assert')
const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')
const read = file => fs.readFileSync(path.join(root, file), 'utf8')

const collectionSeriesJs = read('miniprogram-card/pages/collection-series/collection-series.js')
const collectionSeriesWxml = read('miniprogram-card/pages/collection-series/collection-series.wxml')
const indexJs = read('miniprogram-card/pages/index/index.js')
const indexWxml = read('miniprogram-card/pages/index/index.wxml')
const myCollectionJs = read('miniprogram-card/pages/my-collection/my-collection.js')
const myCollectionWxml = read('miniprogram-card/pages/my-collection/my-collection.wxml')
const seriesOpsJs = read('miniprogram-card/cloudfunctions/seriesOps/index.js')
const adminOpsJs = read('miniprogram-card/cloudfunctions/adminOps/index.js')
const cardDetailJs = read('miniprogram-card/pages/collection-card-detail/collection-card-detail.js')
const taxonomyJs = read('miniprogram-card/utils/cardTaxonomy.js')

function test(name, fn) {
  try {
    fn()
    console.log(`ok - ${name}`)
  } catch (err) {
    console.error(`not ok - ${name}`)
    throw err
  }
}

test('series default info supports a shared card kind end to end', () => {
  assert(collectionSeriesJs.includes('editSeriesDefaultCardKind'))
  assert(collectionSeriesJs.includes('defaultCardKind'))
  assert(collectionSeriesJs.includes('cardKind: String(series.defaultCardKind || \'\').trim()'))
  assert(collectionSeriesJs.includes('cardKind: defaults.cardKind'))
  assert(collectionSeriesWxml.includes('placeholder="卡种，如 Base、RPA、Gold"'))
  assert(seriesOpsJs.includes("'defaultCardKind'"))
  assert(seriesOpsJs.includes('series.defaultCardKind'))
  assert(adminOpsJs.includes('series.defaultCardKind'))
  assert(cardDetailJs.includes('series.defaultCardKind'))
})

test('series searches expose loading state while filtering catches up', () => {
  assert(indexJs.includes('seriesSearchLoading'))
  assert(indexJs.includes('this._seriesSearchSeq'))
  assert(indexWxml.includes('seriesSearchLoading'))
  assert(indexWxml.includes('搜索中'))
  assert(collectionSeriesJs.includes('cardSearchLoading'))
  assert(collectionSeriesJs.includes('this._cardSearchSeq'))
  assert(collectionSeriesWxml.includes('cardSearchLoading'))
  assert(collectionSeriesWxml.includes('搜索中'))
})

test('holding a card can be saved without purchase price', () => {
  assert(!myCollectionJs.includes("请填写买入成本"))
  assert(!collectionSeriesJs.includes("请填写买入成本"))
  assert(!myCollectionWxml.includes('买入成本 <text class="required">*</text>'))
  assert(!collectionSeriesWxml.includes('买入成本 *</text>'))
  assert(myCollectionWxml.includes('placeholder="可不填；仅记录持有时留空"'))
  assert(collectionSeriesWxml.includes('placeholder="可不填；仅记录持有时留空"'))
  assert(seriesOpsJs.includes('purchasePriceFilled'))
  assert(myCollectionJs.includes('item.purchasePriceFilled === false'))
})

test('same-card average price grouping is split by total print run', () => {
  assert(myCollectionJs.includes('function extractPrintRunForGrouping'))
  assert(myCollectionJs.includes('const printRunGroup = extractPrintRunForGrouping(item)'))
  assert(myCollectionJs.includes('printRunGroup'))
  assert(myCollectionJs.includes('/\\s*([1-9]\\d{0,5})\\s*$/'))
})

test('same-card average price grouping is split by grade and auto grade', () => {
  assert(myCollectionJs.includes('function buildGradeGroupForGrouping'))
  assert(myCollectionJs.includes('const gradeGroup = buildGradeGroupForGrouping(item)'))
  assert(myCollectionJs.includes('gradeGroup'))
  assert(myCollectionJs.includes('item.autoGrade'))
})

test('Gold Prizm is no longer a standalone series option', () => {
  assert(!taxonomyJs.includes("  'Gold Prizm'"))
  assert(!taxonomyJs.includes("'Gold Prizm':"))
  assert(taxonomyJs.includes("'Prizm': ['折射', 'prizm折射', '金折', 'prizm金折', 'gold prizm']"))
})

test('new collection image uploads default to auction source', () => {
  assert(collectionSeriesJs.includes("const DEFAULT_IMAGE_SOURCE_TYPE = 'auction'"))
  assert(collectionSeriesJs.includes('sourceType: DEFAULT_IMAGE_SOURCE_TYPE'))
  assert(collectionSeriesJs.includes('sourceIndex: this._getImageSourceIndex(base.sourceType)'))
})
