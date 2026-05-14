const assert = require('assert')
const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')

function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8')
}

function test(name, fn) {
  try {
    fn()
    console.log(`ok - ${name}`)
  } catch (err) {
    console.error(`not ok - ${name}`)
    throw err
  }
}

const files = [
  'miniprogram-card/pages/my-collection/my-collection.js',
  'miniprogram-card/pages/my-collection-series-detail/my-collection-series-detail.js',
  'miniprogram-card/pages/collection-series/collection-series.js',
  'miniprogram-card/pages/collection-card-detail/collection-card-detail.js',
  'miniprogram-card/cloudfunctions/seriesOps/index.js',
  'miniprogram-card/cloudfunctions/adminOps/index.js'
]

const requiredFeatures = [
  ['first_year', '元年'],
  ['final_year', '末年'],
  ['diamond', '钻石'],
  ['np', 'np'],
  ['npa', 'npa'],
  ['lake_blue', '湖水蓝'],
  ['signature_pose', '招牌动作'],
  ['data_stat', '数据'],
  ['sealed_brick', '原封砖']
]

test('feature enums include current card feature vocabulary everywhere', () => {
  files.forEach(file => {
    const text = read(file)
    requiredFeatures.forEach(([key, label]) => {
      assert(text.includes(key), `${file} missing ${key}`)
      assert(text.includes(label), `${file} missing ${label} label or alias`)
    })
  })
})

test('feature chips expose current vocabulary in collection forms', () => {
  const myCollection = read('miniprogram-card/pages/my-collection/my-collection.wxml')
  const collectionSeries = read('miniprogram-card/pages/collection-series/collection-series.wxml')
  ;[myCollection, collectionSeries].forEach(text => {
    assert(text.includes('wx:for="{{cardFeatureOptions}}"'), 'feature chips should render from cardFeatureOptions')
    assert(text.includes('feature.value'), 'feature chips should bind the option value dynamically')
    assert(text.includes('feature.label'), 'feature chips should render the option label dynamically')
    assert(text.includes('data-feature="{{feature.value}}"'), 'feature chip taps should pass the selected value')
  })
})

test('series edit image save keeps the selected feature map in scope', () => {
  const text = read('miniprogram-card/pages/collection-series/collection-series.js')
  const start = text.indexOf('async saveEditImage()')
  assert(start >= 0, 'missing saveEditImage')
  const body = text.slice(start, text.indexOf('\n  async ', start + 1))
  assert(body.includes('editImageFeatureMap'), 'saveEditImage should include editImageFeatureMap')
  assert(body.includes('this.data.editImageFeatureMap') || /const\s+\{[^}]*editImageFeatureMap/.test(body), 'editImageFeatureMap must be read from page data')
})

test('collection export does not draw front/back section titles', () => {
  ;[
    'miniprogram-card/pages/my-collection/my-collection.js',
    'miniprogram-card/pages/collection-card-detail/collection-card-detail.js'
  ].forEach(file => {
    const text = read(file)
    assert(!text.includes("label: '正面'"), `${file} still builds front label`)
    assert(!text.includes("label: '背面'"), `${file} still builds back label`)
    assert(!text.includes('ctx.fillText(block.label'), `${file} still draws image block label`)
  })
})

test('collection exports include both English and Chinese player names when available', () => {
  ;[
    'miniprogram-card/pages/my-collection/my-collection.js',
    'miniprogram-card/pages/collection-card-detail/collection-card-detail.js'
  ].forEach(file => {
    const text = read(file)
    assert(text.includes('function buildExportPlayerLine'), `${file} missing export player line helper`)
    const exportStart = text.indexOf(file.includes('my-collection') ? 'async exportItemImage' : 'async exportCardImage')
    assert(exportStart >= 0, `${file} missing export method`)
    const exportBody = text.slice(exportStart, text.indexOf('\n  },', exportStart))
    assert(exportBody.includes('buildExportPlayerLine'), `${file} export should use both-name player line helper`)
    assert(exportBody.includes('playerLine'), `${file} export should include playerLine in meta lines`)
  })
})

test('series supports preset card features', () => {
  const page = read('miniprogram-card/pages/collection-series/collection-series.js')
  const cloud = read('miniprogram-card/cloudfunctions/seriesOps/index.js')
  assert(page.includes('presetCardFeatures'), 'page missing presetCardFeatures')
  assert(cloud.includes('presetCardFeatures'), 'cloud missing presetCardFeatures')
})

test('series shared features are editable from basic info and normalized through preset storage', () => {
  const page = read('miniprogram-card/pages/collection-series/collection-series.js')
  const wxml = read('miniprogram-card/pages/collection-series/collection-series.wxml')
  const cloud = read('miniprogram-card/cloudfunctions/seriesOps/index.js')
  assert(wxml.includes('共享特色'), 'manage modal should expose shared features in basic info')
  assert(wxml.includes('toggleEditSeriesFeature'), 'shared feature chips should be directly selectable')
  assert(wxml.includes('data-type="feature" bindtap="openPresetManage"'), 'shared features should keep the existing preset management entry')
  assert(page.includes('editSeriesFeatureMap'), 'page missing shared feature form state')
  assert(page.includes('toggleEditSeriesFeature'), 'page missing shared feature toggle handler')
  assert(/presetCardFeatures:\s*normalizeCardFeatures/.test(page), 'saveSeriesMeta should save shared features directly')
  assert(/SERIES_MANAGE_FIELD_KEYS[\s\S]*'presetCardFeatures'/.test(cloud), 'cloud updateSeriesFields should allow shared features')
})

test('linked owned cards merge series shared features', () => {
  const myCollection = read('miniprogram-card/pages/my-collection/my-collection.js')
  const detail = read('miniprogram-card/pages/collection-card-detail/collection-card-detail.js')
  const cloud = read('miniprogram-card/cloudfunctions/seriesOps/index.js')
  assert(myCollection.includes('function normalizeSeriesCardFeatures'), 'my collection missing series feature normalizer')
  assert(myCollection.includes('function mergeCardFeatures'), 'my collection missing feature merge helper')
  assert(/collectCurrentSeriesImageMeta[\s\S]*normalizeSeriesCardFeatures/.test(myCollection), 'series image meta should include shared features')
  assert(/enrichLedgerItemsWithCurrentSeriesImages[\s\S]*mergeCardFeatures/.test(myCollection), 'linked ledger items should merge shared features')
  assert(detail.includes('function normalizeSeriesCardFeatures'), 'card detail missing series feature normalizer')
  assert(/_buildDisplayMeta[\s\S]*mergeCardFeatures/.test(detail), 'card detail display should merge shared features')
  assert(/buildUserCardItemDraftFromImage[\s\S]*mergeCardFeatures/.test(cloud), 'cloud ledger draft should persist shared features for new links')
})
