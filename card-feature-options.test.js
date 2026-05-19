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
  ['sealed_brick', '原封砖'],
  ['gold_label', '金标'],
  ['double_ten', '双10']
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

test('multi-player card is a separate player option, not a feature chip', () => {
  files.forEach(file => {
    const text = read(file)
    assert(!text.includes('multi_player'), `${file} should not keep multi_player in feature vocabulary`)
  })

  const myCollection = read('miniprogram-card/pages/my-collection/my-collection.wxml')
  const seriesDetail = read('miniprogram-card/pages/my-collection-series-detail/my-collection-series-detail.wxml')
  const collectionSeries = read('miniprogram-card/pages/collection-series/collection-series.wxml')
  assert(myCollection.includes('bindchange="toggleFormMultiPlayer"'), 'my collection form should expose a separate multi-player switch')
  assert(seriesDetail.includes('bindchange="toggleFormMultiPlayer"'), 'series detail form should expose a separate multi-player switch')
  assert(collectionSeries.includes('bindchange="onUploadItemMultiPlayer"'), 'series upload form should expose a separate multi-player switch')
  assert(collectionSeries.includes('bindchange="onEditImageMultiPlayer"'), 'series image edit form should expose a separate multi-player switch')

  const myCollectionJs = read('miniprogram-card/pages/my-collection/my-collection.js')
  const seriesDetailJs = read('miniprogram-card/pages/my-collection-series-detail/my-collection-series-detail.js')
  const collectionSeriesJs = read('miniprogram-card/pages/collection-series/collection-series.js')
  const seriesOps = read('miniprogram-card/cloudfunctions/seriesOps/index.js')
  assert(myCollectionJs.includes('isMultiPlayer: false'), 'my collection form should default isMultiPlayer')
  assert(myCollectionJs.includes("'form.isMultiPlayer': !!e.detail.value"), 'my collection form should update isMultiPlayer')
  assert(seriesDetailJs.includes('isMultiPlayer: false'), 'series detail form should default isMultiPlayer')
  assert(seriesDetailJs.includes("'form.isMultiPlayer': !!e.detail.value"), 'series detail form should update isMultiPlayer')
  assert(collectionSeriesJs.includes('isMultiPlayer: false'), 'series upload image meta should default isMultiPlayer')
  assert(collectionSeriesJs.includes('onUploadItemMultiPlayer'), 'series upload form should update isMultiPlayer')
  assert(collectionSeriesJs.includes('editImageIsMultiPlayer'), 'series image edit form should save isMultiPlayer')
  assert(seriesOps.includes('isMultiPlayer: !!input.isMultiPlayer'), 'user card item normalization should persist isMultiPlayer')
  assert(seriesOps.includes('isMultiPlayer: !!rest.isMultiPlayer'), 'series image normalization should persist isMultiPlayer')
})

test('multi-player card player fields support selecting multiple players', () => {
  const formPages = [
    ['miniprogram-card/pages/my-collection/my-collection.js', 'miniprogram-card/pages/my-collection/my-collection.wxml'],
    ['miniprogram-card/pages/my-collection-series-detail/my-collection-series-detail.js', 'miniprogram-card/pages/my-collection-series-detail/my-collection-series-detail.wxml']
  ]
  formPages.forEach(([jsFile, wxmlFile]) => {
    const js = read(jsFile)
    const wxml = read(wxmlFile)
    assert(js.includes('function splitMultiPlayerValues'), `${jsFile} should split multi-player text into selected players`)
    assert(js.includes('appendMultiPlayerValue'), `${jsFile} should append selected player suggestions`)
    assert(js.includes('removeFormPlayerTag'), `${jsFile} should allow removing selected players`)
    assert(js.includes("field === 'player' && this.data.form.isMultiPlayer"), `${jsFile} should append player suggestions when multi-player is enabled`)
    assert(js.includes('formPlayerSearch'), `${jsFile} should keep a separate multi-player search input`)
    assert(wxml.includes('formPlayerTags'), `${wxmlFile} should render selected player tags`)
    assert(wxml.includes('bindtap="removeFormPlayerTag"'), `${wxmlFile} should expose tag removal`)
    assert(wxml.includes('form.isMultiPlayer ? formPlayerSearch : form.player'), `${wxmlFile} should keep selected players out of the search input`)
    assert(wxml.includes("form.isMultiPlayer ? '搜索并添加多个球员'"), `${wxmlFile} should change player input placeholder in multi-player mode`)
  })

  const collectionSeriesJs = read('miniprogram-card/pages/collection-series/collection-series.js')
  const collectionSeriesWxml = read('miniprogram-card/pages/collection-series/collection-series.wxml')
  assert(collectionSeriesJs.includes('function splitMultiPlayerValues'), 'collection series should split multi-player text into selected players')
  assert(collectionSeriesJs.includes('appendMultiPlayerValue'), 'collection series should append selected player suggestions')
  assert(collectionSeriesJs.includes('removeUploadItemPlayerTag'), 'collection series upload form should remove selected players')
  assert(collectionSeriesJs.includes('removeEditImagePlayerTag'), 'collection series image edit form should remove selected players')
  assert(collectionSeriesJs.includes('playerSearch'), 'collection series upload form should keep a separate multi-player search input')
  assert(collectionSeriesJs.includes('editImagePlayerSearch'), 'collection series edit form should keep a separate multi-player search input')
  assert(/field === 'player' &&[^\n]*item\.isMultiPlayer/.test(collectionSeriesJs), 'collection series upload suggestions should append players in multi-player mode')
  assert(collectionSeriesJs.includes("field === 'player' && this.data.editImageIsMultiPlayer"), 'collection series edit suggestions should append players in multi-player mode')
  assert(collectionSeriesWxml.includes('upload-player-tag'), 'collection series upload form should render selected player tags')
  assert(collectionSeriesWxml.includes('edit-player-tag'), 'collection series image edit form should render selected player tags')
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

test('exports expose title and card metadata visibility options', () => {
  const seriesJs = read('miniprogram-card/pages/collection-series/collection-series.js')
  const seriesWxml = read('miniprogram-card/pages/collection-series/collection-series.wxml')
  assert(seriesJs.includes('exportShowTitle'), 'series export should keep title visibility state')
  assert(seriesWxml.includes('data-field="exportShowTitle"'), 'series export modal should expose title visibility option')
  assert(seriesJs.includes('const titleLines = this.data.exportShowTitle ?'), 'series export should skip title drawing when disabled')

  ;[
    ['miniprogram-card/pages/my-collection/my-collection.js', 'miniprogram-card/pages/my-collection/my-collection.wxml'],
    ['miniprogram-card/pages/my-collection-series-detail/my-collection-series-detail.js', 'miniprogram-card/pages/my-collection-series-detail/my-collection-series-detail.wxml'],
    ['miniprogram-card/pages/collection-card-detail/collection-card-detail.js', 'miniprogram-card/pages/collection-card-detail/collection-card-detail.wxml']
  ].forEach(([jsFile, wxmlFile]) => {
    const js = read(jsFile)
    const wxml = read(wxmlFile)
    assert(js.includes('showCardExportModal'), `${jsFile} should open a card export options modal`)
    assert(js.includes('cardExportHasBack'), `${jsFile} should track whether the exported card has a back image`)
    assert(js.includes('openCardExportModal'), `${jsFile} should separate opening export options from running export`)
    assert(js.includes('toggleCardExportField'), `${jsFile} should toggle card export fields`)
    assert(js.includes('这张卡片没有上传背面图'), `${jsFile} should explain disabled back export options`)
    assert(js.includes('buildCardExportMetaLines'), `${jsFile} should build selectable export metadata`)
    assert(js.includes('buildCardExportImageLayout(infos, exportImageFace)'), `${jsFile} should lay out card export images from original dimensions`)
    assert(js.includes('drawCardExportImages(ctx, canvasImages, blocks, padding, y)'), `${jsFile} should draw card export images from shared block layout`)
    assert(js.includes('destWidth: canvas.width'), `${jsFile} should export using canvas pixel dimensions`)
    assert(wxml.includes('showCardExportModal'), `${wxmlFile} should render the card export modal`)
    assert(wxml.includes('data-field="showTitle"'), `${wxmlFile} should allow hiding card title`)
    assert(wxml.includes('data-field="showCardInfo"'), `${wxmlFile} should allow hiding card identity info`)
    assert(wxml.includes('data-field="showGrade"'), `${wxmlFile} should allow hiding grade info`)
    assert(wxml.includes("{{!cardExportHasBack ? 'disabled' : ''}}"), `${wxmlFile} should visually disable back export options without a back image`)
  })

  const rules = read('miniprogram-card/PRODUCT_RULES.md')
  assert(rules.includes('导出图鉴或卡种图片时，图鉴名/卡种名默认显示但可以关闭'), 'rules should document optional series export titles')
  assert(rules.includes('单卡导出需要先展示导出选项'), 'rules should document single card export options')
  assert(rules.includes('单卡正面和背面导出时左右排布'), 'rules should document side-by-side single card export')
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

test('non-original condition removes sealed brick from saved and merged features', () => {
  const myCollection = read('miniprogram-card/pages/my-collection/my-collection.js')
  const seriesDetail = read('miniprogram-card/pages/my-collection-series-detail/my-collection-series-detail.js')
  const collectionSeries = read('miniprogram-card/pages/collection-series/collection-series.js')
  const detail = read('miniprogram-card/pages/collection-card-detail/collection-card-detail.js')
  const cloud = read('miniprogram-card/cloudfunctions/seriesOps/index.js')
  const rules = read('miniprogram-card/PRODUCT_RULES.md')

  ;[myCollection, seriesDetail, collectionSeries, detail, cloud].forEach(source => {
    assert(source.includes('function normalizeCardFeaturesForCondition'), 'card feature normalization should accept card condition')
    assert(source.includes("condition === '非原封'"), 'non-original condition should be checked explicitly')
    assert(source.includes("feature !== 'sealed_brick'"), 'sealed brick should be stripped for non-original condition')
  })
  ;[myCollection, seriesDetail, detail, cloud].forEach(source => {
    assert(source.includes("function mergeCardFeatures(features, sharedFeatures, legacyNumber = '', condition = '通行')"), 'shared feature merging should receive condition')
  })
  assert(/normalizeUserCardItem[\s\S]*const condition = normalizeUserCardItemCondition\(input.condition\)[\s\S]*normalizeCardFeaturesForCondition\(input.cardFeatures, input.cardNumber, condition\)/.test(cloud), 'cloud user card normalization should strip sealed brick before saving')
  assert(/saveItem[\s\S]*form.condition = normalizeCondition\(form.condition\)[\s\S]*form.cardFeatures = normalizeCardFeaturesForCondition\([\s\S]*form.condition/.test(myCollection), 'my collection save should strip sealed brick')
  assert(/saveItem[\s\S]*form.condition = normalizeCondition\(form.condition\)[\s\S]*form.cardFeatures = normalizeCardFeaturesForCondition\([\s\S]*form.condition/.test(seriesDetail), 'series detail save should strip sealed brick')
  assert(rules.includes('品相为 `非原封` 时，单卡保存和展示都必须移除 `原封砖` 特色'), 'product rules should document condition priority over sealed brick')
})
