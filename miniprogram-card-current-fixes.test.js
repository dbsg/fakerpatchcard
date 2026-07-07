const assert = require('assert')
const fs = require('fs')
const path = require('path')
const vm = require('vm')

const root = path.resolve(__dirname, '..')

function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8')
}

function getRegisteredPagesFromAppJsonText(text) {
  const appJson = JSON.parse(text)
  const mainPages = Array.isArray(appJson.pages) ? appJson.pages : []
  const subPackages = Array.isArray(appJson.subPackages)
    ? appJson.subPackages
    : (Array.isArray(appJson.subpackages) ? appJson.subpackages : [])
  const subPages = subPackages.flatMap(pkg => {
    const pkgRoot = String((pkg && pkg.root) || '').replace(/\/$/, '')
    return (Array.isArray(pkg && pkg.pages) ? pkg.pages : [])
      .map(page => `${pkgRoot}/${page}`.replace(/\/+/g, '/'))
  })
  return [...mainPages, ...subPages]
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

function assertInOrder(source, markers, message) {
  let cursor = -1
  markers.forEach((marker) => {
    const next = source.indexOf(marker, cursor + 1)
    assert(next > cursor, `${message}: ${marker}`)
    cursor = next
  })
}

function loadCollectionSeriesPageForTest() {
  const source = read('miniprogram-card/pages/collection-series/collection-series.js')
  const ctx = { console, setTimeout, clearTimeout }
  ctx.Page = (page) => { ctx.page = page }
  ctx.getApp = () => ({ globalData: {} })
  ctx.wx = {
    getStorageSync() { return '' },
    setStorageSync() {},
    removeStorageSync() {},
    showToast() {},
    previewImage() {}
  }
  ctx.require = (request) => {
    if (request.includes('collectionProgress')) return require(path.join(root, 'miniprogram-card/utils/collectionProgress.js'))
    if (request.includes('playerRoster')) return require(path.join(root, 'miniprogram-card/utils/playerRoster.js'))
    if (request.includes('collectionData')) return {}
    if (request.includes('pagination')) return { buildPagedItems: (items) => ({ items, hasMore: false }) }
    if (request.includes('seriesAccess')) return {}
    if (request.includes('cardTaxonomy')) return {}
    if (request.startsWith('.') || request.startsWith('..')) {
      return require(path.resolve(root, 'miniprogram-card/pages/collection-series', request))
    }
    return require(request)
  }
  vm.runInNewContext(source, ctx, { filename: 'collection-series.js' })
  assert(ctx.page, 'collection series page should load in test harness')
  return ctx.page
}

test('1986 Fleer checklist players are covered by roster data', () => {
  const collectionSource = read('card/js/collection-data.js')
  const ctx = {}
  vm.runInNewContext(`${collectionSource}\nthis.collectionData = collectionData;`, ctx)
  const series = (ctx.collectionData || []).find((item) => item.name === '1986 Fleer')
  assert(series, 'missing 1986 Fleer collection')

  const roster = JSON.parse(read('scripts/data/nba-players-roster.json'))
  const extra = JSON.parse(read('scripts/data/nba-players-extra.json'))
  const bundledRoster = require(path.join(root, 'miniprogram-card/utils/nbaPlayersRoster.js'))
  const rosterNames = new Set([...roster, ...extra, ...bundledRoster].map((player) => player.enName))
  const missing = [...new Set((series.checklist || []).map((item) => String(item.text || '')
    .replace(/^\d+\s+/, '')
    .replace(/\s+-\s+.*$/, '')
    .replace(/\s+RC$/, '')
    .trim()))]
    .filter((name) => name && name !== 'Checklist' && !rosterNames.has(name))

  assert.deepStrictEqual(missing, [])
  assert(rosterNames.has('Jeff Malone'), 'Jeff Malone should be available in the bundled roster fallback')
})

test('Slam Dunk card subjects are covered by roster data', () => {
  const roster = JSON.parse(read('scripts/data/nba-players-roster.json'))
  const extra = JSON.parse(read('scripts/data/nba-players-extra.json'))
  const bundledRoster = require(path.join(root, 'miniprogram-card/utils/nbaPlayersRoster.js'))
  const playerRoster = require(path.join(root, 'miniprogram-card/utils/playerRoster.js'))
  const allRoster = [...roster, ...extra, ...bundledRoster]
  const rosterNames = new Set(allRoster.map((player) => player.enName))
  ;[
    'Hanamichi Sakuragi',
    'Kaede Rukawa',
    'Takenori Akagi',
    'Hisashi Mitsui',
    'Ryota Miyagi',
    'Akira Sendoh',
    'Shinichi Maki',
    'Eiji Sawakita'
  ].forEach((name) => {
    assert(rosterNames.has(name), `${name} should be available for Slam Dunk card entry`)
  })
  assert.strictEqual(playerRoster.findPlayerMeta(allRoster, '樱木花道').enName, 'Hanamichi Sakuragi')
  assert.strictEqual(playerRoster.findPlayerMeta(allRoster, '流川').enName, 'Kaede Rukawa')
  assert.strictEqual(playerRoster.findPlayerMeta(allRoster, '三井').enName, 'Hisashi Mitsui')
})

test('catalog enum caches are invalidated by remote manifest versions', () => {
  const collectionDataJs = read('miniprogram-card/utils/collectionData.js')
  const myCollectionJs = read('miniprogram-card/pages/my-collection/my-collection.js')
  const myCollectionWxml = read('miniprogram-card/pages/my-collection/my-collection.wxml')
  const appJs = read('miniprogram-card/app.js')
  const taxonomyJs = read('miniprogram-card/utils/cardTaxonomy.js')
  const cardTaxonomy = require(path.join(root, 'miniprogram-card/utils/cardTaxonomy.js'))
  const manifest = JSON.parse(read('scripts/data/card-catalog-manifest.json'))
  const catalogOptions = JSON.parse(read('scripts/data/card-catalog-options.json'))
  const bundledTeams = require(path.join(root, 'miniprogram-card/utils/nbaTeamsRoster.js'))

  assert(collectionDataJs.includes('CATALOG_MANIFEST_PATH = \'static/card-catalog-manifest.json\''), 'collection data should load a remote catalog manifest')
  assert(collectionDataJs.includes('CATALOG_MANIFEST_MAX_AGE = 5 * 60 * 1000'), 'manifest should be refreshed during long-running app sessions')
  assert(collectionDataJs.includes('catalogUrl(CATALOG_MANIFEST_PATH)'), 'manifest requests should bypass stale data with a timestamp URL')
  assert(collectionDataJs.includes('readVersionedCache(PLAYERS_CACHE_KEY, version, validator)'), 'players cache should be keyed by manifest version')
  assert(collectionDataJs.includes('readVersionedCache(TEAMS_CACHE_KEY, version, validator)'), 'teams cache should be keyed by manifest version')
  assert(collectionDataJs.includes('readVersionedCache(CARD_CATALOG_OPTIONS_CACHE_KEY, version, validator)'), 'card catalog options cache should be keyed by manifest version')
  assert(collectionDataJs.includes('loadCatalogVersionToken'), 'collection data should expose a version token for dependent caches')
  assert(appJs.includes('loadCatalogVersionToken'), 'suggestion cache should compare against the current catalog version')
  assert(appJs.includes('data.catalogVersion === catalogVersion'), 'suggestion cache should be invalidated when catalog versions change')
  assert(taxonomyJs.includes('function buildBrandOptions(cards = [], options = {})'), 'brand options should accept remote taxonomy options')
  assert(taxonomyJs.includes('function buildSeriesOptions(cards = [], options = {})'), 'series options should accept remote taxonomy options')
  assert(myCollectionJs.includes('suggestSeriesAliases'), 'my collection add-card modal should keep loaded series aliases')
  assert(myCollectionJs.includes('this.data.suggestSeriesAliases'), 'my collection add-card modal should search with loaded series aliases')
  assert(myCollectionWxml.includes('上镜'), 'my collection add-card series field should mention the 上镜 alias')
  assert.strictEqual(manifest.players.version, '2026-06-15-2018-players-v1')
  assert.strictEqual(manifest.players.path, 'static/nba-players-roster-2003-slam-dunk-v1.json')
  assert.strictEqual(manifest.players.minCount, 2018)
  assert.strictEqual(manifest.teams.minCount, bundledTeams.length)
  assert.strictEqual(manifest.cardCatalogOptions.version, '2026-06-15-card-taxonomy-v7')
  assert.strictEqual(manifest.cardCatalogOptions.minBrands, 41)
  assert.strictEqual(manifest.cardCatalogOptions.minSeries, 229)
  assert(manifest.cardCatalogOptions.minCardVersions >= 300)
  assert(manifest.cardCatalogOptions.minCardVersionAliases >= 50)
  assert(Array.isArray(catalogOptions.brands) && catalogOptions.brands.includes('Panini'))
  assert(Array.isArray(catalogOptions.series) && catalogOptions.series.includes('Prizm'))
  assert(catalogOptions.brands.includes('Bandai'), 'manufacturer suggestions should include common Japanese card makers')
  assert(catalogOptions.series.includes('PhotoGenic'), 'post-2012 Panini suggestions should include newer standalone lines')
  assert(catalogOptions.seriesAliases.PhotoGenic.includes('上镜'), 'PhotoGenic should be searchable by its domestic 上镜 alias')
  assert(catalogOptions.series.includes('Brilliance'), 'post-2012 Panini suggestions should include early Panini lines')
  assert(catalogOptions.series.includes('Topps Pristine'), 'pre-2012 suggestions should include popular Topps lines')
  assert(catalogOptions.series.includes('SkyBox Premium'), 'pre-2012 suggestions should include popular Fleer/SkyBox lines')
  assert(catalogOptions.seriesAliases.Prizm.includes('金折'), 'existing aliases should remain intact')
  assert.strictEqual(cardTaxonomy.filterOptions(catalogOptions.series, '上镜', catalogOptions.seriesAliases)[0], 'PhotoGenic')
})

test('manual metadata values create approved catalog supplements before entering dropdowns', () => {
  const collectionDataJs = read('miniprogram-card/utils/collectionData.js')
  const seriesOpsJs = read('miniprogram-card/cloudfunctions/seriesOps/index.js')
  const adminOpsJs = read('miniprogram-card/cloudfunctions/adminOps/index.js')
  const adminJs = read('miniprogram-card/pages/admin/admin.js')
  const adminWxml = read('miniprogram-card/pages/admin/admin.wxml')
  const detailJs = read('miniprogram-card/pages/collection-card-detail/collection-card-detail.js')
  const collectionSeriesJs = read('miniprogram-card/pages/collection-series/collection-series.js')
  const myCollectionJs = read('miniprogram-card/pages/my-collection/my-collection.js')
  const myCollectionSeriesDetailJs = read('miniprogram-card/pages/my-collection-series-detail/my-collection-series-detail.js')
  const rules = read('miniprogram-card/PRODUCT_RULES.md')

  assert(collectionSeriesJs.includes('function collectCatalogOptionSuggestions'), 'manual metadata helper should detect values outside existing dropdown data')
  assert(collectionSeriesJs.includes('CATALOG_OPTION_PAYLOAD_KEYS'), 'manual metadata helper should map form fields to catalog supplement buckets')
  assert(collectionSeriesJs.includes('cardVersions'), 'card version should be part of approved dropdown supplements')
  assert(collectionDataJs.includes('loadCatalogOptionSupplements'), 'collection data should load approved catalog supplements')
  assert(collectionDataJs.includes('mergeCardCatalogOptions'), 'approved catalog supplements should merge into card taxonomy options')
  assert(collectionDataJs.includes('mergePlayerSupplements'), 'approved player supplements should merge into roster suggestions')
  assert(collectionDataJs.includes('submitCatalogOptionSuggestions'), 'collection data should expose catalog supplement approval submission')
  assert(seriesOpsJs.includes("CARD_CATALOG_SUPPLEMENTS_CONFIG_KEY = 'card_catalog_supplements'"), 'seriesOps should use app_configs for approved catalog supplements')
  assert(seriesOpsJs.includes("type: 'catalog_option_approval'"), 'manual dropdown supplements should create approval records')
  assert(seriesOpsJs.includes("action === 'submitCatalogOptionSuggestions'"), 'seriesOps should expose catalog supplement approval submission')
  assert(seriesOpsJs.includes("action === 'getCatalogOptionSupplements'"), 'seriesOps should expose approved catalog supplements')
  assert(adminOpsJs.includes('approveCatalogOptionCorrection'), 'adminOps should approve dropdown supplement corrections')
  assert(adminOpsJs.includes('catalog_option_supplement'), 'approved dropdown supplements should be written to app config')
  assert(adminJs.includes('isCatalogOptionCorrection'), 'admin page should identify dropdown supplement approvals')
  assert(adminWxml.includes("correctionDetail.type === 'catalog_option_approval'"), 'admin page should allow direct approval of dropdown supplement records')
  assert(detailJs.includes('submitQualityCatalogOptionSuggestions'), 'card detail supplement form should create dropdown supplement approvals')
  assert(collectionSeriesJs.includes('submitImageCatalogOptionSuggestions'), 'collection upload and edit flows should create dropdown supplement approvals')
  assert(myCollectionJs.includes('submitFormCatalogOptionSuggestions'), 'my collection add/edit should create dropdown supplement approvals')
  assert(myCollectionSeriesDetailJs.includes('submitFormCatalogOptionSuggestions'), 'series-scoped my collection add/edit should create dropdown supplement approvals')
  assert(!collectionSeriesJs.includes("require('./utils/catalogOptionSuggestions')"), 'collection series should not depend on an extra catalog suggestion module')
  assert(!myCollectionJs.includes("require('./utils/catalogOptionSuggestions')"), 'my collection should not depend on an extra catalog suggestion module')
  assert(!myCollectionSeriesDetailJs.includes("require('./utils/catalogOptionSuggestions')"), 'series-scoped my collection should not depend on an extra catalog suggestion module')
  assert(!detailJs.includes("require('./utils/catalogOptionSuggestions')"), 'card detail should not depend on an extra catalog suggestion module')
  assert(rules.includes('下拉数据补充'), 'product rules should require approval before manual metadata enters dropdowns')
})

test('collection card detail handles standalone user cards without a series', () => {
  const js = read('miniprogram-card/pages/collection-card-detail/collection-card-detail.js')
  assert(js.includes('function normalizeSeriesCardFeatures(series = {})'))
  assert(js.includes('series = series || {}'))
})

test('upload modal is cleared only after a successful upload', () => {
  const js = read('miniprogram-card/pages/collection-series/collection-series.js')
  const start = js.indexOf('async confirmUpload()')
  const body = js.slice(start, js.indexOf('\n  removeCardImage', start))
  assert(start >= 0, 'missing confirmUpload')
  assert(!body.includes('this.setData({ showUploadModal: false })'), 'upload modal should not close before async work finishes')
  assert(body.includes('this.closeUploadModal()'), 'successful upload should close and clear modal state')
})

test('collection series upload modal uses full-width image pickers', () => {
  const wxml = read('miniprogram-card/pages/collection-series/collection-series.wxml')
  const wxss = read('miniprogram-card/pages/collection-series/collection-series.wxss')
  assert(wxml.includes('upload-scroll upload-form-scroll series-upload-scroll'))
  assert(wxml.includes('upload-scroll upload-form-scroll series-upload-scroll edit-image-scroll'), 'edit image modal should reuse the same full-width image upload layout')
  assert(wxml.includes('class="upload-thumb" src="{{item.tempFilePath}}" mode="aspectFit"'))
  assert(wxml.includes('class="upload-thumb" src="{{editImageUrl}}" mode="aspectFit"'), 'edit image front preview should match upload modal aspect-fit behavior')
  assert(wxss.includes('.series-upload-scroll .upload-face-block'))
  assert(wxss.includes('flex: 1; width: auto; height: 300rpx'))
  assert(wxss.includes('.series-upload-scroll .upload-image-btn'))
})

test('collection series batch upload creates a confirm queue before saving', () => {
  const js = read('miniprogram-card/pages/collection-series/collection-series.js')
  const wxml = read('miniprogram-card/pages/collection-series/collection-series.wxml')
  const wxss = read('miniprogram-card/pages/collection-series/collection-series.wxss')
  const rules = read('miniprogram-card/PRODUCT_RULES.md')
  assert(wxml.includes('bindtap="openBatchUpload"'), 'collection detail upload mode should expose batch entry')
  assert(wxml.includes('showBatchUploadModal'), 'batch upload should render a local confirm queue modal')
  assert(wxml.includes('下一张作背面'), 'batch queue should support manually pairing the next image as back')
  assert(wxml.includes('加入重复卡'), 'batch queue should expose duplicate append handling')
  assert(wxml.includes('替换图片'), 'batch queue should expose duplicate replace handling')
  assert(wxml.includes('showBatchUploadModal') && wxml.includes('value="{{publicUserIdDraft}}" bindinput="onUploadPublicUserId"'), 'batch queue should let new uploaders fill the required public uploader id')
  assert(wxml.includes('bindtap="confirmBatchUpload"'), 'batch queue should submit confirmed drafts in one action')
  assert(wxml.includes('data-scope="bulk" data-field="player" bindfocus="onBatchMetaSuggestFocus"'), 'batch bulk player should reuse metadata suggestion input')
  assert(wxml.includes('data-scope="draft" data-i="{{batchIndex}}" data-field="player" bindfocus="onBatchMetaSuggestFocus"'), 'batch draft player should reuse metadata suggestion input')
  assert(wxml.includes('data-field="numberPrefix" bindinput="onBatchBulkInput"'), 'batch number prefix should bind through the explicit bulk state map')
  assert(wxml.includes('batchDraftSelectionMap[item.draftId]'), 'batch drafts should be selectable for partial bulk edits')
  assert(wxml.includes("batchDraftSelectedCount > 0 ? '应用到选中草稿' : '应用到全部草稿'"), 'batch apply button should clarify selected-vs-all scope')
  assert(wxml.includes('previewBatchDuplicateImage'), 'duplicate warnings should expose existing image previews')
  assert(js.includes('_buildBatchDraftItemsFromSelectedFiles'), 'batch upload should build drafts from selected files')
  assert(js.includes('_inferBatchNumberFromFileName'), 'batch upload should infer card numbers from file names')
  assert(js.includes('_guessBatchTargetIndex'), 'batch upload should suggest checklist targets')
  assert(js.includes('BATCH_BULK_FIELD_STATE_KEYS'), 'batch bulk fields should use explicit state keys')
  assert(js.includes('filterBatchSuggestions(scope, field, idx, keyword)'), 'batch metadata inputs should share the suggestion filter')
  assert(js.includes('_saveBatchDraftCache'), 'batch drafts should be persisted locally')
  assert(js.includes('_restoreBatchDraftCache'), 'batch drafts should restore from local cache')
  assert(js.includes('selectedIds'), 'batch apply should support selected-only edits')
  assert(js.includes('已应用到${appliedCount}张'), 'batch apply should show a success toast')
  assert(js.includes('batchError'), 'batch upload should keep failed drafts in the queue')
  assert(wxss.includes('.batch-draft-card'), 'batch queue cards should have stable styling')
  assert(wxss.includes('.batch-upload-scroll .suggest-list'), 'batch suggestion dropdown should be styled in the batch modal')
  assert(wxss.includes('.batch-draft-select'), 'batch selectable drafts should have stable checkbox styling')
  assert(wxss.includes('.batch-duplicate-thumb'), 'duplicate image previews should have stable thumbnail styling')
  assert(rules.includes('所有填写卡片资料的入口'), 'product rules should require unified metadata input behavior')
  assert(rules.includes('批量录入必须先进入本地待确认队列'), 'product rules should document persistent batch draft queues')

  const page = loadCollectionSeriesPageForTest()
  const instance = {
    ...page,
    data: {
      ...(page.data || {}),
      isFreeMode: false,
      series: {
        defaultInfoEnabled: true,
        defaultYear: '2012-13',
        defaultBrand: 'Panini',
        defaultCardSeries: 'Immaculate Collection',
        checklist: [
          {
            text: '5 Anderson Varejao',
            productNumber: '5',
            printRun: 40,
            subset: 'Numbers Patch',
            cardKind: 'Numbers Patch',
            images: [{ url: 'cloud://old.png', serialNumber: '23/40', cardKind: 'Numbers Patch · /40' }]
          }
        ]
      },
      batchTargetOptions: [],
      batchTargetLabels: [],
      presetCardFeatures: []
    },
    _openid: 'me',
    _playersRoster: [],
    _playersList: [],
    _normalizeImages(images = []) { return images }
  }
  const targetOptions = instance._buildBatchTargetOptions()
  instance.data.batchTargetOptions = targetOptions
  instance.data.batchTargetLabels = targetOptions.map(item => item.label)
  const drafts = instance._buildBatchDraftItemsFromSelectedFiles([
    { tempFilePath: '/tmp/LeBron-23_front.jpg' },
    { tempFilePath: '/tmp/LeBron-23_back.jpg' }
  ])
  assert.strictEqual(drafts.length, 1, 'front/back file names should pair into one draft')
  assert.strictEqual(drafts[0].backTempFilePath, '/tmp/LeBron-23_back.jpg')
  assert.strictEqual(drafts[0].serialNumber, '23/40')
  assert.strictEqual(drafts[0].targetIdx, 0)
  assert.strictEqual(drafts[0].cardKind, 'Numbers Patch · /40')
  assert.strictEqual(drafts[0].year, '2012-13')
  assert(drafts[0].duplicateText.includes('疑似重复'), 'same target, number and card kind should warn as duplicate')
  assert.strictEqual(drafts[0].duplicateImages.length, 1, 'duplicate warning should include existing image preview data')
  assert.strictEqual(drafts[0].canSubmit, false, 'duplicate drafts should wait for append or replace decision')
  drafts[0].duplicateMode = 'append'
  const ready = instance._refreshBatchDraftItems(drafts)
  assert.strictEqual(ready[0].canSubmit, true, 'duplicate drafts become ready after choosing append mode')
  instance.setData = function setData(patch) {
    this.data = { ...this.data, ...patch }
  }
  instance.data.batchDraftItems = [
    { ...ready[0], draftId: 'draft_untouched', player: 'Keep Me' },
    { ...ready[0], draftId: 'draft_selected', player: 'Old Player' }
  ]
  instance.data.batchDraftSelectionMap = { draft_selected: true }
  instance.data.batchDraftSelectedCount = 1
  instance.data.batchBulkPlayer = 'LeBron James'
  instance.applyBatchBulkPatch()
  assert.strictEqual(instance.data.batchDraftItems[0].player, 'Keep Me', 'selected-only bulk edit should not touch unselected drafts')
  assert.strictEqual(instance.data.batchDraftItems[1].player, 'LeBron James', 'selected-only bulk edit should update selected drafts')
})

test('collection series manage modal supports default meta suggestions', () => {
  const js = read('miniprogram-card/pages/collection-series/collection-series.js')
  const wxml = read('miniprogram-card/pages/collection-series/collection-series.wxml')
  const wxss = read('miniprogram-card/pages/collection-series/collection-series.wxss')
  const rules = read('miniprogram-card/PRODUCT_RULES.md')
  assert(wxml.includes('value="{{item.year}}" data-i="{{uploadIndex}}" data-field="year" bindfocus="onUploadMetaSuggestFocus" bindinput="onUploadItemYear"'), 'upload image year should use the shared suggestion input')
  assert(wxml.includes("activeUploadSuggest === 'year' && uploadSuggestIdx === uploadIndex && uploadSuggestFiltered.length > 0"), 'upload image year should render a dropdown suggestion list')
  assert(wxml.includes('value="{{editImageYear}}" data-field="year" bindfocus="onEditMetaSuggestFocus" bindinput="onEditImageYear"'), 'edit image year should use the shared suggestion input')
  assert(wxml.includes("activeEditSuggest === 'year' && editSuggestFiltered.length > 0"), 'edit image year should render a dropdown suggestion list')
  assert(wxml.includes('value="{{editSeriesDefaultYear}}" data-field="year" bindfocus="onManageMetaSuggestFocus" bindinput="onEditSeriesDefaultYear"'), 'default year should use the manage suggestion input')
  assert(wxml.includes("activeManageSuggest === 'year' && manageSuggestFiltered.length > 0"), 'default year should render a dropdown suggestion list')
  assert(wxml.includes('value="{{editSeriesDefaultBrand}}" data-field="brand" bindfocus="onManageMetaSuggestFocus" bindinput="onEditSeriesDefaultBrand"'), 'default brand should use the manage suggestion input')
  assert(wxml.includes("activeManageSuggest === 'brand' && manageSuggestFiltered.length > 0"), 'default brand should render a dropdown suggestion list')
  assert(wxml.includes('value="{{editSeriesDefaultCardSeries}}" data-field="cardSeries" bindfocus="onManageMetaSuggestFocus" bindinput="onEditSeriesDefaultCardSeries"'), 'default series should use the manage suggestion input')
  assert(wxml.includes("activeManageSuggest === 'cardSeries' && manageSuggestFiltered.length > 0"), 'default series should render a dropdown suggestion list')
  assert(wxml.includes('class="form-textarea-modal manage-compact-textarea" value="{{editSeriesDescription}}"'), 'manage description should use a compact textarea')
  assert(wxml.includes('class="form-textarea-modal manage-compact-textarea" value="{{editSeriesSourceNote}}"'), 'manage source note should use a compact textarea')
  assert(wxss.includes('.manage-compact-textarea { height: 132rpx; min-height: 132rpx; max-height: 132rpx;'), 'manage textareas should not take half the modal height')
  assert(js.includes("const META_SUGGEST_FIELDS = ['player', 'year', 'brand', 'cardSeries', 'cardKind']"), 'all card metadata suggestions should allow player, year, brand, series and card kind')
  assert(js.includes('_getManageSuggestValue(field)'), 'manage meta suggestions should read the active default field value')
  assert(js.includes("this.scheduleUploadSuggestions('year', i, value)"), 'upload year input should debounce year suggestions')
  assert(js.includes("this.scheduleEditSuggestions('year', value)"), 'edit year input should debounce year suggestions')
  assert(js.includes('update.editSeriesDefaultYear = value'), 'manage suggestion selection should fill the default year')
  assert(js.includes('update.editSeriesDefaultBrand = value'), 'manage suggestion selection should fill the default brand')
  assert(js.includes('update.editSeriesDefaultCardSeries = value'), 'manage suggestion selection should fill the default series')
  assert(rules.includes('图鉴默认信息、上传图片、编辑图片里的年份、球员、厂商、系列等有建议数据的字段，都需要复用建议数据并支持搜索和下拉选择'), 'product rules should document searchable metadata fields across collection forms')
})

test('fixed card slots keep an upload entrance after one image exists', () => {
  const wxml = read('miniprogram-card/pages/collection-series/collection-series.wxml')
  const wxss = read('miniprogram-card/pages/collection-series/collection-series.wxss')
  assert(wxml.includes('class="fixed-grid-image-wrap'), 'missing fixed grid image block')
  assert(wxml.includes('class="fixed-grid-add-btn"'), 'existing fixed slot images need a visible upload entrance')
  assert(wxml.includes('data-idx="{{card._idx}}" data-item-id="{{card.itemId}}"'), 'upload entrance should target the same fixed slot')
  assert(wxml.includes('catchtap="addCardImage"'), 'upload entrance should append through the existing upload flow')
  assert(wxss.includes('.fixed-grid-add-btn'), 'upload entrance needs explicit overlay styling')
  assert(wxss.includes('.fixed-grid-add-btn { position: absolute; left: 8rpx; bottom: 8rpx;'), 'upload entrance should sit in the bottom-left corner')
})

test('collection managers can see and use fixed-grid upload controls', () => {
  const js = read('miniprogram-card/pages/collection-series/collection-series.js')
  const wxml = read('miniprogram-card/pages/collection-series/collection-series.wxml')
  assert(wxml.includes('{{(canContribute || canManageSeries) && !fixedGridPureMode && !isDerivedThemeSeries}}'), 'fixed image-grid upload button should match the upload permission guard')
  assert(wxml.includes('seriesLevel < 3 && (canContribute || canManageSeries) && !fixedGridPureMode'), 'subset upload button should match the upload permission guard')
  assert(wxml.includes('{{(canContribute || canManageSeries) && !fixedGridPureMode && !isDerivedThemeSeries}}" class="card-upload-btn"'), 'card upload button should match the upload permission guard')
  assert(wxml.includes('wx:elif="{{(canContribute || canManageSeries) && !isDerivedThemeSeries}}" class="fixed-grid-placeholder"'), 'empty fixed-slot upload placeholders should match the upload permission guard')
  assert(wxml.includes('fixed-grid-placeholder-readonly'), 'non-contributors should see a readonly empty slot instead of a tappable upload placeholder')
  assert(wxml.includes("slot.type === 'upload' && (canContribute || canManageSeries) && !fixedGridPureMode"), 'print-run upload slots should match the upload permission guard and be hidden in pure image mode')
  assert(wxml.includes("slot.type === 'gap' && !fixedGridPureMode"), 'print-run gap placeholders should be hidden in pure image mode')
  assert(wxml.includes("slot.type === 'collapse' && !fixedGridPureMode"), 'print-run collapse placeholders should be hidden in pure image mode')
  assert(!wxml.includes('(canContribute || canManageImages) && !fixedGridPureMode'), 'upload entry visibility should not use canManageImages because users with only own images fail the upload guard')
  assert(!wxml.includes('(isFixedImageGrid || isFixedCardSlots) && (canContribute || canManageSeries)}}" class="action-btn action-btn-upload"'), 'non-free fixed-grid collections should not show a top-level upload button')
  assert(js.includes('if (canContribute || canManageSeries) return true'), 'upload permission guard should allow series managers')
})

test('collection detail keeps search and pure/upload display controls', () => {
  const appWxss = read('miniprogram-card/app.wxss')
  const wxml = read('miniprogram-card/pages/collection-series/collection-series.wxml')
  const json = read('miniprogram-card/pages/collection-series/collection-series.json')
  const js = read('miniprogram-card/pages/collection-series/collection-series.js')
  const wxss = read('miniprogram-card/pages/collection-series/collection-series.wxss')
  const labelComponentWxss = read('miniprogram-card/components/image-meta-label/image-meta-label.wxss')
  const labelComponentWxml = read('miniprogram-card/components/image-meta-label/image-meta-label.wxml')
  const numberDisplay = read('miniprogram-card/pages/collection-series/numberDisplay.wxs')
  assert(wxml.includes('bindtap="toggleCardSearch"'), 'collection detail should render card search entry')
  assert(wxml.includes('series-card-search-input'), 'collection detail should render search input when opened')
  assert(wxml.includes('bindtap="toggleFixedGridPureMode">{{fixedGridPureMode ? \'纯图模式\' : \'上传模式\'}}</view>'), 'collections should show the current pure/upload mode')
  assert(wxml.includes('wx:if="{{((!fixedGridPureMode && !isDerivedThemeSeries) || card._gridImage) && !card._filterHidden}}"'), 'pure image mode should hide empty upload placeholders and respect search')
  assert(wxml.includes('lazy-load="{{true}}"'), 'collection list images should lazy-load')
  assert(wxml.includes("class=\"subset-count-badge {{card._isComplete ? 'complete' : ''}}\""), 'card progress should use a unified badge style')
  assert(wxss.includes('.subset-count-badge.complete'), 'complete card progress badge should have explicit styling')
  assert(wxml.includes('wx:if="{{!isFreeMode && checklistGroups.length > 0}}" class="action-btn action-btn-search"'), 'fixed collections should also expose search')
  assert(wxml.indexOf('bindtap="cycleImageGridViewMode"') < wxml.indexOf('bindtap="toggleCardSearch"'), 'search entry should stay after display controls')
  assert(!wxml.includes('class="card-edit-btn" data-idx="{{card._idx}}" catchtap="onRenameCardTap">卡种'), 'card rows should not render a standalone card-kind edit button')
  assert(wxml.includes('<block wx:for="{{checklistGroups}}" wx:key="subset">'), 'collection search should separate group iteration from group visibility')
  assert(wxml.includes('wx:if="{{!item._filterHidden}}" class="checklist-group"'), 'collection search should hide non-matching checklist groups, not just their images')
  assert(wxml.includes('<block wx:for="{{item.items}}" wx:for-item="card" wx:key="_idx">'), 'collection search should separate card iteration from card visibility')
  assert(wxml.includes('wx:if="{{!card._filterHidden}}" class="card-block"'), 'collection search should hide non-matching card title rows')
  assert(!wxml.includes('fixed-grid-complete-label'), 'fixed-grid thumbnails should not render completion checkmarks')
  assert(wxml.includes('seriesLevel >= 3 && canAddSubset && !checklistComplete'), 'complete checklists should not render the add-card-kind action')
  assert(wxml.includes('wx:for="{{visibleFreeImages}}"'), 'free image collections should render a paged image list')
  assert(wxml.includes('class="free-load-more"'), 'free image collections should expose pagination when needed')
  assert(wxml.includes('class="detail-desc-text" user-select="{{true}}"'), 'long detail description text should be selectable')
  assert(wxml.includes('class="row-text" user-select="{{true}}"'), 'long card titles should be selectable')
  assert(js.includes('_imageLabelDefaultYear: this._getImageLabelDefaultYear(series, defaultInfoEnabled)'), 'image labels should use series-level year fallback for duplicate suppression')
  assert(js.includes('_imageLabelDefaultCardSeries: defaultInfoEnabled ? String(series.defaultCardSeries || \'\').trim() : \'\''), 'image labels should expose series-level card series defaults')
  assert(js.includes('_imageLabelDefaultPlayer: defaultInfoEnabled ? String(series.defaultPlayer || \'\').trim() : \'\''), 'image labels should expose series-level player defaults')
  assert(js.includes('_buildChecklistGroupSetData(checklist, series)'), 'initial collection load should build checklist groups with the freshly computed series metadata')
  assert(js.includes('_buildChecklistGroupSetData(cl, series)'), 'checklist updates should rebuild groups with the freshly computed series metadata')
  assert(js.includes('_buildChecklistGroupSetData(checklist, seriesContext = this.data.series || {}, opts = {})'), 'group builder should accept an explicit series context instead of only reading stale page data')
  assert(wxml.includes('series._imageLabelDefaultYear'), 'image meta labels should compare against the effective series year')
  assert(wxml.includes('numfmt.galleryLabel'), 'collection detail image labels should use the layout-aware gallery label')
  assert(wxml.includes('series._imageLabelDefaultCardSeries'), 'collection detail image labels should receive card series defaults')
  assert(wxml.includes('series._imageLabelDefaultPlayer'), 'collection detail image labels should receive player defaults')
  assert(json.includes('"/components/image-meta-label/image-meta-label"'), 'collection detail should register the shared image label component')
  assert(wxml.includes('<image-meta-label mode="single"'), 'collection image labels should use the shared single-label component')
  assert(!wxml.includes('<image-meta-label mode="fixed-pair"'), 'fixed-grid labels should no longer split number and series into separate labels')
  assert(!wxss.includes('.view-small .image-number-label'), 'collection detail should not keep per-page image label sizing')
  assert(!wxss.includes('.image-number-label {'), 'collection detail should not duplicate the shared image label base style')
  assert(!wxss.includes('.fixed-grid-top-labels'), 'collection detail should not duplicate fixed-grid label layout styles')
  assert(!wxss.includes('.image-preview-icon {'), 'collection detail should not duplicate shared preview icon styling')
  assert(appWxss.includes('.image-preview-icon'), 'global styles should define shared preview icon styling')
  assert(labelComponentWxml.includes('mode === \'fixed-pair\''), 'image label component should support fixed-grid pair labels')
  assert(labelComponentWxss.includes('.image-label-cols-3 .image-label-chip'), 'shared label component should keep 3-column labels compact')
  assert(labelComponentWxss.includes('.image-label-cols-2 .image-label-chip'), 'shared label component should keep 2-column labels medium sized')
  assert(labelComponentWxss.includes('.image-label-cols-1 .image-label-chip'), 'shared label component should keep 1-column labels larger')
  assert(numberDisplay.includes('function seasonKey'), 'image meta label matching should normalize season year formats')
  assert(numberDisplay.includes('function galleryLabel'), 'WXS should provide layout-aware gallery image labels')
  assert(!numberDisplay.includes('.match(/'), 'WXS should avoid regex literals because the mini program compiler rejects them')
  assert(!/(^|[^A-Za-z0-9_$])Number\(/.test(numberDisplay), 'WXS should avoid Number() because the mini program compiler rejects it')
  const numberSandbox = { module: { exports: {} } }
  vm.runInNewContext(numberDisplay, numberSandbox)
  assert.strictEqual(numberSandbox.module.exports.galleryLabel('1/1', '2006', 'UD', '', 'LeBron James', '', 1, '', '', '', '', '', 0, '', true), '1/1 · 2006 · UD · LeBron James', 'one-column image labels should include number, year, series and player')
  assert.strictEqual(numberSandbox.module.exports.galleryLabel('1/1', '2006', 'UD', '', 'LeBron James', '', 2, '', '', '', '', '', 0, '', true), '2006 · UD · LeBron James', 'two-column image labels should include year, series and player')
  assert.strictEqual(numberSandbox.module.exports.galleryLabel('1/1', '2006', 'UD', '', 'LeBron James', '', 3, '', '', '', '', '', 0, '', true), '2006 · UD', 'three-column image labels should include only year and series')
  assert.strictEqual(numberSandbox.module.exports.galleryLabel('', '', '', '', '', '', 3, '2004-05', 'Exquisite Collection', 'Limited Logos', '', '', 0, '', true), '', 'three-column image labels should not repeat series-level default info')
  assert.strictEqual(numberSandbox.module.exports.galleryLabel('', '2004-05', 'Exquisite Collection', '', '', '', 3, '2004-05', 'Exquisite Collection', 'Limited Logos', '', '', 0, '', true), '', 'explicit image labels matching series defaults should stay hidden')
  assert.strictEqual(numberSandbox.module.exports.galleryLabel('', '2005-06', 'Exquisite Collection', '', '', '', 3, '2004-05', 'Exquisite Collection', 'Limited Logos', '', '', 0, '', true), '2005-06', 'image labels should still show fields that differ from series defaults')
  assert.strictEqual(numberSandbox.module.exports.metaLabel('', '1997-98', '红宝', '1997-1998', '', 0, '', true), '红宝', 'same season labels should not repeat the series year')
  assert.strictEqual(numberSandbox.module.exports.metaLabel('', '1998-99', '红宝', '1997-1998', '', 0, '', true), '1998-99 · 红宝', 'different season labels should still show the image year')
  const progress = require('../miniprogram-card/utils/collectionProgress')
  const slots = progress.buildPrintRunSlots({
    text: 'Avery Johnson',
    completionTarget: 2,
    images: [{ url: 'red.jpg', year: '1997-98', cardKind: '红宝' }]
  }, {}, { imageLabelDefaults: { defaultYear: '1997-1998', defaultInfoEnabled: true } })
  const firstImageSlot = slots.find(slot => slot.type === 'image')
  assert.strictEqual(firstImageSlot.displayLabel, '红宝', 'progress-slot image labels should also suppress the series default year')
})

test('collection image edit opens full card-kind editor with print run fields', () => {
  const js = read('miniprogram-card/pages/collection-series/collection-series.js')
  const wxml = read('miniprogram-card/pages/collection-series/collection-series.wxml')
  assert(wxml.includes("{{editImageCardTitle || '编辑卡种信息'}}"), 'image edit modal should label the entry as full card-kind editing')
  assert(wxml.includes('限编/数量'), 'card-kind editor should expose print run quantity')
  assert(wxml.includes('bindinput="onEditCardPrintRun"'), 'print run input should bind into the card editor state')
  assert(js.includes('const printRun = progressData.parsePrintRunValue(value)'), 'card-kind print run input should parse the latest print run quantity')
  assert(js.includes("patch.editCardCompletionTarget = printRun ? String(printRun) : ''"), 'card-kind print run input should keep completion target in sync')
  assert(js.includes('renameEditImageCard()'), 'image edit card entry should keep the existing handler')
  assert(js.includes('this._openEditCardModal(editImageIdx, false)'), 'image edit card entry should open the full card editor instead of a rename-only prompt')
  assert(js.includes('this._openEditSubsetCardModal(subset)'), 'subset card-kind title should open the full card editor instead of a rename-only prompt')
  assert(js.includes('editCardSubsetMode: true'), 'subset card-kind editor should save through subset-aware mode')
  assert(js.includes('if (editCardSubsetMode)'), 'saving should handle subset card-kind edits')
  assert(js.includes("if (Number(editImageIdx) === Number(editCardIdx)) this.setData({ editImageCardTitle: nextItem.text || '' })"), 'saving card-kind edits should refresh the image edit modal title')
  assert(!js.includes("title: '修改名称'"), 'card-kind title editing should not use a rename-only modal')
  assert(!js.includes("title: '修改卡片名称'"), 'image edit card entry should not use a rename-only modal')
})

test('print run parser only trusts explicit trailing print run tokens', () => {
  const progress = require('../miniprogram-card/utils/collectionProgress')
  const seriesOps = read('miniprogram-card/cloudfunctions/seriesOps/index.js')
  const adminOps = read('miniprogram-card/cloudfunctions/adminOps/index.js')
  const ledgerMatcher = read('miniprogram-card/cloudfunctions/seriesOps/ledgerMatcher.js')
  const staticProgress = read('card/js/collection-progress.js')
  assert.strictEqual(progress.parsePrintRunText('Title Card 1/9'), 0, 'card-kind text like Title Card 1/9 should not be treated as print run')
  assert.strictEqual(progress.getPrintRun({ text: '1 Title Card 1/9', completionTarget: 1 }), 0, 'Slam Dunk fixed slot text should not infer /9 print run')
  assert.strictEqual(progress.parsePrintRunText('NBA Championship /199'), 199, 'space-separated /199 should remain a print run')
  assert.strictEqual(progress.parsePrintRunText('NBA Championship #/199'), 199, '#/199 should remain a print run')
  assert.strictEqual(progress.parsePrintRunText('NBA Championship /199编'), 199, '/199编 should remain a print run')
  assert.strictEqual(progress.parsePrintRunText('Normal Card 199'), 0, 'plain trailing numbers should not be print run')
  assert(ledgerMatcher.includes("return parsePrintRunText((item && (item.text || item.subset)) || '')"), 'ledger matching should not infer print run from cardKind')
  ;[seriesOps, adminOps, ledgerMatcher, staticProgress].forEach(source => {
    assert(source.includes('(?:^|\\s)#?\\/\\s*([1-9]\\d{0,5})\\s*(?:编)?$'), 'all runtime print-run parsers should use the explicit trailing-token rule')
  })
})

test('pure image collections show the top upload action', () => {
  const wxml = read('miniprogram-card/pages/collection-series/collection-series.wxml')
  assert(wxml.includes('wx:if="{{isFreeMode && (canContribute || canManageSeries) && !fixedGridPureMode && !isDerivedThemeSeries}}" class="action-btn action-btn-upload" bindtap="topBarUpload">上传图片</view>'), 'pure image collections need a top-level upload button in upload mode')
  assert(wxml.includes('wx:if="{{subsetType && (canContribute || canManageSeries) && !fixedGridPureMode && !isDerivedThemeSeries}}" class="empty-upload-btn"'), 'empty-state upload buttons should also match the upload permission guard')
  assert(!wxml.includes('wx:if="{{(isFixedImageGrid || isFixedCardSlots) && (canContribute || canManageSeries)}}" class="action-btn action-btn-upload"'), 'fixed card/slot collections should not get a top-level upload button')
})

test('collection card detail shows every image from the same card slot', () => {
  const js = read('miniprogram-card/pages/collection-card-detail/collection-card-detail.js')
  const wxml = read('miniprogram-card/pages/collection-card-detail/collection-card-detail.wxml')
  const wxss = read('miniprogram-card/pages/collection-card-detail/collection-card-detail.wxss')
  assert(js.includes('imageSlides: []'), 'detail page should track a carousel slide list')
  assert(js.includes('_isFixedSlotSeries(series = {})'), 'detail page should identify fixed-slot series')
  assert(js.includes('_getDetailImageGroup(series = {}, item = {}, images = [], selected = {})'), 'detail page should choose the right image group')
  assert(js.includes('if (this._isFixedSlotSeries(series)) return list'), 'fixed slots should keep grouping by card slot')
  assert(js.includes('const selectedNumber = this._getDetailGroupNumber(selected, item)'), 'ordinary limited cards should group by selected number')
  assert(js.includes('this._getDetailGroupNumber(img, item) === selectedNumber'), 'ordinary limited cards should only include the same number')
  assert(js.includes('const groupedImages = this._getDetailImageGroup(series, item, images, image)'), 'loaded collection detail should compute grouped images')
  assert(js.includes('_buildImageSlides(images = [], selected = {}, item = {})'), 'detail page should build slides from card-slot images')
  assert(js.includes('subset: item.subset || doc.subset') && js.includes('imageIndex'), 'subset image lookup should keep all images in the same slot')
  assert(js.includes('item: { ...item, _idx: itemIndex }') && js.includes('imageIndex'), 'checklist image lookup should keep all images in the same slot')
  assert(js.includes('imageSlides: this._buildImageSlides(groupedImages, image, item)'), 'loaded collection detail should show grouped images')
  assert(js.includes('this.data.imageSlides.map(slide => slide.url)'), 'preview should include all carousel images')
  assert(wxml.includes('indicator-dots="{{imageSlides.length > 1}}"'), 'carousel should indicate multiple same-slot images')
  assert(wxml.includes('wx:for="{{imageSlides}}"'), 'detail hero should render all same-slot slides')
  assert(wxml.includes('class="image-slide-count"'), 'detail hero should show a visible image count')
  assert(wxss.includes('.image-slide-count'), 'image count badge should be styled')
})

test('remaining export and dashboard canvases use Canvas 2D', () => {
  const seriesDetailJs = read('miniprogram-card/pages/my-collection-series-detail/my-collection-series-detail.js')
  const seriesDetailWxml = read('miniprogram-card/pages/my-collection-series-detail/my-collection-series-detail.wxml')
  const cardDetailJs = read('miniprogram-card/pages/collection-card-detail/collection-card-detail.js')
  const cardDetailWxml = read('miniprogram-card/pages/collection-card-detail/collection-card-detail.wxml')
  const dashboardJs = read('miniprogram-card/pages/my-collection-dashboard/my-collection-dashboard.js')
  const dashboardWxml = read('miniprogram-card/pages/my-collection-dashboard/my-collection-dashboard.wxml')

  assert(seriesDetailWxml.includes('<canvas type="2d" id="seriesDetailExportCardCanvas"'), 'my collection series detail export should use Canvas 2D')
  assert(seriesDetailJs.includes("getCanvas2DContext('#seriesDetailExportCardCanvas'"), 'my collection series detail export should draw through the Canvas 2D node API')
  assert(!seriesDetailJs.includes("wx.createCanvasContext('exportCardCanvas'"), 'my collection series detail export should not use the legacy canvas context')
  assert(seriesDetailJs.includes('drawCardExportInfoPanel'), 'my collection series detail export should draw a styled title and details panel')
  assert(seriesDetailJs.includes("ctx.fillStyle = '#f5f7fb'"), 'my collection series detail export should use a styled canvas background')

  assert(cardDetailWxml.includes('<canvas type="2d" id="collectionCardExportCanvas"'), 'collection card detail export should use Canvas 2D')
  assert(cardDetailJs.includes("getCanvas2DContext('#collectionCardExportCanvas'"), 'collection card detail export should draw through the Canvas 2D node API')
  assert(!cardDetailJs.includes("wx.createCanvasContext('collectionCardExportCanvas'"), 'collection card detail export should not use the legacy canvas context')
  assert(cardDetailJs.includes('drawCardExportInfoPanel'), 'collection card detail export should draw a styled title and details panel')
  assert(cardDetailJs.includes("ctx.fillStyle = '#f5f7fb'"), 'collection card detail export should use a styled canvas background')

  ;['seriesPie', 'playerPie', 'conditionPie', 'statusPie'].forEach(id => {
    assert(dashboardWxml.includes(`type="2d" id="${id}"`), `${id} should use Canvas 2D`)
  })
  assert(dashboardJs.includes("drawPieChart('#seriesPie'"), 'dashboard should select pie canvases by node id')
  assert(dashboardJs.includes('getCanvas2DContext(canvasSelector, this)'), 'dashboard should draw pies through the Canvas 2D node API')
  assert(!dashboardJs.includes('wx.createCanvasContext'), 'dashboard should not use legacy canvas contexts')
})

test('collection series chooses a concrete image before editing grouped fixed-slot images', () => {
  const js = read('miniprogram-card/pages/collection-series/collection-series.js')
  const wxml = read('miniprogram-card/pages/collection-series/collection-series.wxml')
  const wxss = read('miniprogram-card/pages/collection-series/collection-series.wxss')
  assert(wxml.includes('data-grouped="1"'), 'fixed-grid representative image controls should mark grouped image actions')
  assert(wxml.includes('wx:if="{{showImageChoiceModal}}"'), 'grouped image actions need a chooser modal')
  assert(wxml.includes('wx:for="{{imageChoiceItems}}"'), 'chooser should render every candidate image')
  assert(wxml.includes('bindtap="onImageChoiceSelect"'), 'chooser items should select the concrete target image')
  assert(wxml.includes('catchtap="previewImageChoice"'), 'tapping chooser thumbnails should preview instead of selecting')
  assert(wxml.includes('data-url="{{item.url}}"'), 'chooser thumbnail preview should know the tapped image url')
  assert(js.includes('showImageChoiceModal: false'), 'page state should track chooser visibility')
  assert(js.includes('_openChecklistImageChoice(idx, action, fallbackImgIdx = 0, choiceNumber = \'\')'), 'grouped actions should open a checklist image chooser')
  assert(js.includes('_runChecklistImageChoice(action, idx, imgIdx, choiceNumber = \'\')'), 'selected image should be routed to edit or delete')
  assert(js.includes("this._openChecklistImageChoice(idx, 'delete', imgIdx, choiceNumber)"), 'grouped delete should choose the target image first')
  assert(js.includes("this._openChecklistImageChoice(idx, 'edit', imgIdx, choiceNumber)"), 'grouped edit should choose the target image first')
  assert(js.includes('previewImageChoice(e)'), 'chooser should support image preview')
  assert(js.includes('wx.previewImage({ current, urls: urls.length ? urls : [current] })'), 'chooser preview should include all candidate images')
  assert(js.includes('imageChoiceAction'), 'chooser should remember whether the action is edit or delete')
  assert(wxss.includes('.image-choice-item'), 'chooser needs explicit item styling')
})

test('collection series supports manager-only supplemental images', () => {
  const seriesJs = read('miniprogram-card/pages/collection-series/collection-series.js')
  const seriesWxml = read('miniprogram-card/pages/collection-series/collection-series.wxml')
  const detailJs = read('miniprogram-card/pages/collection-card-detail/collection-card-detail.js')
  const detailWxml = read('miniprogram-card/pages/collection-card-detail/collection-card-detail.wxml')
  const detailWxss = read('miniprogram-card/pages/collection-card-detail/collection-card-detail.wxss')
  assert(seriesWxml.includes('wx:if="{{editImageCanEdit && canManageSeries && !editImageIsFree}}"'), 'edit modal supplemental switch should only be visible to series managers')
  assert(seriesWxml.includes('bindchange="onEditImageSupplemental"'), 'edit modal should toggle supplemental state')
  assert(seriesJs.includes('isSupplemental: false'), 'upload items should default supplemental switch off')
  assert(seriesJs.includes('isSupplemental: !!img.isSupplemental'), 'image normalization should preserve supplemental state')
  assert(seriesJs.includes('if (existingHasPrimary || addedPrimaryInBatch) isSupplemental = true'), 'batch upload should mark extra images as supplemental after the first primary image')
  assert(seriesJs.includes('const latestImage = [...sourceImages].reverse().find(img => img && !img.isSupplemental) || [...sourceImages].reverse().find(Boolean)'), 'fixed grid should default to latest uploaded image')
  assert(seriesJs.includes('editImageIsSupplemental: !!img.isSupplemental'), 'edit modal should reflect current supplemental state')
  assert(seriesJs.includes('onEditImageSupplemental(e) { this.setData({ editImageIsSupplemental: !!e.detail.value }) }'), 'edit modal should save supplemental switch changes')
  assert(detailJs.includes('img.isSupplemental) return'), 'detail number slots should ignore supplemental images')
  assert(detailWxml.includes('wx:if="{{item.numberBadgeLabel}}" class="primary-image-badge"'), 'detail page should show number badge on slides')
  assert(detailWxss.includes('.primary-image-badge'), 'primary badge should be styled')
})

test('collection card detail omits face labels and only badges primary front images', () => {
  const detailJs = read('miniprogram-card/pages/collection-card-detail/collection-card-detail.js')
  const detailWxml = read('miniprogram-card/pages/collection-card-detail/collection-card-detail.wxml')
  const start = detailJs.indexOf('_buildImageSlides(images = [], selected = {}, item = {})')
  const end = detailJs.indexOf('\n  _findImage', start)
  const body = detailJs.slice(start, end)
  assert(start >= 0 && end > start, 'missing image slide builder')
  assert(body.includes('badgeLabel: prefix'), 'detail slide labels should only keep the image count prefix')
  assert(!body.includes("'正面'"), 'detail slides should not label front images')
  assert(!body.includes("'背面'"), 'detail slides should not label back images')
  assert(body.includes("numberBadgeLabel: ''"), 'back and detail slides should not inherit the number badge')
  assert(detailWxml.includes('imageSlides.length > 1 && item.badgeLabel'), 'empty slide labels should not render a blank badge')
})

test('print-run collection view groups same-number images under one representative tile', () => {
  const progress = require('../miniprogram-card/utils/collectionProgress')
  const wxml = read('miniprogram-card/pages/collection-series/collection-series.wxml')
  const js = read('miniprogram-card/pages/collection-series/collection-series.js')
  const withSupplemental = progress.buildPrintRunSlots({
    text: 'Ray Allen /18',
    images: [
      { imageId: 'old', url: 'old.jpg', serialNumber: '11/18' },
      { imageId: 'latest', url: 'latest.jpg', serialNumber: '11/18' },
      { imageId: 'supplemental', url: 'supplemental.jpg', serialNumber: '11/18', isSupplemental: true }
    ]
  }).filter(slot => slot.type === 'image' && slot.serial === '11')
  assert.strictEqual(withSupplemental.length, 1, 'same serial should render one image tile')
  assert.strictEqual(withSupplemental[0].image.url, 'latest.jpg', 'latest non-supplemental image should be the representative tile')
  assert.strictEqual(withSupplemental[0].imageCount, 2, 'representative tile should count same-number primary images')

  const withoutPrimary = progress.buildPrintRunSlots({
    text: 'Ray Allen /18',
    images: [
      { imageId: 'old', url: 'old.jpg', serialNumber: '11/18' },
      { imageId: 'latest', url: 'latest.jpg', serialNumber: '11/18' }
    ]
  }).filter(slot => slot.type === 'image' && slot.serial === '11')
  assert.strictEqual(withoutPrimary[0].image.url, 'latest.jpg', 'latest uploaded image should be the representative')
  assert(wxml.includes('slot.imageCount > 1 ? 1 : 0'), 'grouped print-run tiles should open the concrete image chooser')
  assert(wxml.includes('data-choice-number="{{slot.displayLabel}}"'), 'print-run image chooser should be scoped to the same number')
  assert(js.includes('const choiceNumber = e.currentTarget.dataset.choiceNumber || \'\''), 'edit/delete handlers should read the number scope')
})

test('completion-target collection view groups same-number images under one representative tile', () => {
  const progress = require('../miniprogram-card/utils/collectionProgress')
  const slots = progress.buildPrintRunSlots({
    text: 'Ray Allen',
    completionTarget: 18,
    images: [
      { imageId: 'old', url: 'old.jpg', serialNumber: '11/18' },
      { imageId: 'latest', url: 'latest.jpg', serialNumber: '11/18' },
      { imageId: 'supplemental', url: 'supplemental.jpg', serialNumber: '11/18', isSupplemental: true }
    ]
  })
  const imageSlots = slots.filter(slot => slot.type === 'image')
  assert.strictEqual(imageSlots.length, 1, 'same number should render one image tile even when only completionTarget is set')
  assert.strictEqual(imageSlots[0].serial, '11')
  assert.strictEqual(imageSlots[0].displayLabel, '11/18')
  assert.strictEqual(imageSlots[0].image.url, 'latest.jpg', 'latest non-supplemental image should be the representative tile')
  assert.strictEqual(imageSlots[0].imageCount, 2, 'representative tile should count same-number primary images')
  assert.strictEqual(progress.getItemCollectedCount({
    text: 'Ray Allen',
    completionTarget: 18,
    images: [
      { imageId: 'old', url: 'old.jpg', serialNumber: '11/18' },
      { imageId: 'latest', url: 'latest.jpg', serialNumber: '11/18' }
    ]
  }), 1, 'same number should count as one collected card')
})

test('checklist item completion target can be disabled', () => {
  const progress = require('../miniprogram-card/utils/collectionProgress')
  const seriesJs = read('miniprogram-card/pages/collection-series/collection-series.js')
  const seriesWxml = read('miniprogram-card/pages/collection-series/collection-series.wxml')
  const seriesOps = read('miniprogram-card/cloudfunctions/seriesOps/index.js')
  const adminOps = read('miniprogram-card/cloudfunctions/adminOps/index.js')
  const item = {
    text: 'Ray Allen /18',
    completionTarget: 0,
    images: [{ imageId: 'img', url: 'img.jpg', serialNumber: '11/18' }]
  }
  assert.strictEqual(progress.getCompletionTarget(item), 0, 'explicit zero target should disable progress')
  assert.deepStrictEqual(progress.buildPrintRunSlots(item), [], 'disabled targets should not generate empty slots')
  const stats = progress.buildChecklistProgressStats([item])
  assert.strictEqual(stats.totalCards, 0, 'disabled targets should not count toward checklist total')
  assert.strictEqual(stats.withImages, 0, 'disabled targets should not show a complete progress icon')
  assert.strictEqual(stats.listImageCount, 1, 'disabled targets should still preserve actual images')
  assert(seriesWxml.includes('无需补图目标'), 'edit modal should expose the no-target option')
  assert(seriesJs.includes('editCardNoCompletionTarget'), 'page state should track no-target mode')
  assert(seriesJs.includes('? 0'), 'saving no-target mode should persist zero target')
  assert(seriesOps.includes('else if (target === 0) next.completionTarget = 0'), 'series cloud function should allow clearing target')
  assert(adminOps.includes('else if (target === 0) next.completionTarget = 0'), 'admin cloud function should allow clearing target')
})

test('free series completion target can be disabled', () => {
  const seriesJs = read('miniprogram-card/pages/collection-series/collection-series.js')
  const seriesWxml = read('miniprogram-card/pages/collection-series/collection-series.wxml')
  assert(seriesWxml.includes('无需完成目标'), 'series manage modal should expose a no-target option')
  assert(seriesWxml.includes('editSeriesNoCompletionTarget'), 'series manage modal should bind no-target state')
  assert(seriesJs.includes('editSeriesNoCompletionTarget'), 'page state should track free-series no-target mode')
  assert(seriesJs.includes('if (rawTarget === 0) target = 0'), 'free-series stats should not fall back when target is explicitly zero')
  assert(seriesJs.includes('const target = editSeriesNoCompletionTarget ? 0'), 'saving free-series no-target mode should persist zero target')
  assert(seriesJs.includes('saveSeriesCompletionTarget({ auto: true })'), 'no-target switch should auto-save after toggling')
  assert(seriesJs.includes('editSeriesLastCompletionTarget'), 'page state should remember the last positive target when toggling back on')
})

test('series image uploads require a mutable globally unique public uploader id', () => {
  const seriesJs = read('miniprogram-card/pages/collection-series/collection-series.js')
  const seriesWxml = read('miniprogram-card/pages/collection-series/collection-series.wxml')
  const detailJs = read('miniprogram-card/pages/collection-card-detail/collection-card-detail.js')
  const detailWxml = read('miniprogram-card/pages/collection-card-detail/collection-card-detail.wxml')
  const cloudJs = read('miniprogram-card/cloudfunctions/seriesOps/index.js')
  const dataJs = read('miniprogram-card/utils/collectionData.js')
  const myCollectionJs = read('miniprogram-card/pages/my-collection/my-collection.js')
  const myCollectionWxml = read('miniprogram-card/pages/my-collection/my-collection.wxml')
  assert(seriesJs.includes('publicUserIdLocked: false'), 'collection page should treat public uploader id as editable')
  assert(seriesJs.includes('async _loadPublicUserProfile()'), 'collection page should refresh an existing public id after it is set elsewhere')
  assert(seriesJs.includes('onShow()'), 'collection page should reload public id when returning to the page')
  assert(seriesJs.includes('await this._loadPublicUserProfile().catch'), 'image editor should wait for existing public id before editing uploader metadata')
  assert(seriesJs.includes('_ensureUploadPublicUserId'), 'upload should validate/set public id before any series image submission')
  assert(seriesJs.includes('uploaderPublicId'), 'uploaded images should store public uploader id snapshots')
  assert(seriesJs.includes('uploaderPublicId: uploaderPublicId || this.data.publicUserId ||'), 'uploaded images should store uploader id regardless of image source')
  assert(seriesWxml.includes('上传用户 ID'), 'upload modal should ask for public uploader id')
  assert(seriesWxml.includes('<view wx:if="{{!publicUserId}}" class="form-row-inline form-row">'), 'upload modal should hide the public id input once an id exists')
  assert(seriesWxml.includes('editImageCanEdit && !editImageUploaderPublicId && !publicUserId'), 'edit image modal should hide the public id input once an id exists')
  assert(seriesWxml.includes('该 ID 会在卡片详情公开展示'), 'upload modal should disclose public visibility')
  assert(!seriesWxml.includes('可修改但需要全站唯一'), 'upload modal should not expose internal uniqueness rules in helper text')
  assert(!seriesWxml.includes('不能包含违禁内容'), 'upload modal should not expose content safety rules in helper text')
  assert(seriesJs.includes("{ value: 'user_photo', label: '用户上传' }"), 'collection image source options should label user photos as user uploads')
  assert(seriesWxml.includes("{{item.sourceLabel || '用户上传'}}"), 'upload source picker should use the user-upload source label')
  assert(detailWxml.includes('上传用户'), 'collection card detail should expose uploader as its own field')
  assert(detailJs.includes("user_photo: '用户上传'"), 'detail page should keep user upload as a fixed source type')
  assert(detailJs.includes('buildSourceDisplay({ sourceType: \'user_photo\' })'), 'standalone and ledger card details should use the fixed source type instead of entry labels')
  assert(myCollectionJs.includes('showPublicIdModal'), 'my collection home should provide a public id entry modal')
  assert(myCollectionJs.includes('savePublicUserId'), 'my collection home should allow setting public id')
  assert(myCollectionJs.includes('getPublicUserIdErrorMessage'), 'my collection home should show specific public id errors')
  assert(myCollectionWxml.includes('用户 ID'), 'my collection home should expose the public id entry')
  assert(!myCollectionWxml.includes('用户 ID 可修改'), 'my collection public id modal should omit the extra editability hint')
  assert(detailJs.includes('buildUploaderDisplay'), 'detail page should display uploader id separately from source')
  assert(detailJs.includes('return publicId'), 'detail page should show uploader id without a fixed prefix')
  assert(detailWxml.includes('持有人'), 'collection card detail should expose public holders as a separate field')
  assert(detailJs.includes('buildHolderDisplay'), 'detail page should derive holders from public owner snapshots')
  assert(cloudJs.includes("db.collection('user_public_profiles')"), 'cloud function should persist public user profiles')
  assert(cloudJs.includes('sanitizePublicUserId'), 'cloud function should sanitize public ids')
  assert(cloudJs.includes('security.msgSecCheck'), 'cloud function should check public id content safety')
  assert(cloudJs.includes('publicIdKey'), 'cloud function should enforce normalized global uniqueness')
  assert(cloudJs.includes('syncPublicUserIdSnapshots'), 'cloud function should update existing public id snapshots after rename')
  assert(dataJs.includes('getPublicUserProfile'), 'client data layer should expose public profile fetch')
  assert(dataJs.includes('setPublicUserId'), 'client data layer should expose public id setup')
  assert(dataJs.includes('getPublicUserIdErrorMessage'), 'client data layer should map public id errors to user-facing reasons')
})

test('series owned actions can choose whether holder id is public', () => {
  const seriesJs = read('miniprogram-card/pages/collection-series/collection-series.js')
  const seriesWxml = read('miniprogram-card/pages/collection-series/collection-series.wxml')
  const myJs = read('miniprogram-card/pages/my-collection/my-collection.js')
  const myWxml = read('miniprogram-card/pages/my-collection/my-collection.wxml')
  const myDetailJs = read('miniprogram-card/pages/my-collection-series-detail/my-collection-series-detail.js')
  const myDetailWxml = read('miniprogram-card/pages/my-collection-series-detail/my-collection-series-detail.wxml')
  const detailJs = read('miniprogram-card/pages/collection-card-detail/collection-card-detail.js')
  const detailWxml = read('miniprogram-card/pages/collection-card-detail/collection-card-detail.wxml')
  const cloudJs = read('miniprogram-card/cloudfunctions/seriesOps/index.js')
  const rules = read('miniprogram-card/PRODUCT_RULES.md')
  assert(seriesWxml.includes('公开持有'), 'owned forms should expose a public holder toggle')
  assert(seriesWxml.includes('bindchange="onUploadItemPublicVisible"'), 'upload owned form should toggle public holder visibility')
  assert(seriesWxml.includes('bindchange="onHoldLedgerPublicVisible"'), 'long-press hold form should toggle public holder visibility')
  assert(seriesWxml.includes('bindchange="onEditImageHoldPublicVisible"'), 'edit image owned form should toggle public holder visibility')
  assert(seriesWxml.includes('bindchange="onLedgerLinkPublicVisible"'), 'existing-ledger link form should toggle public holder visibility')
  assert(seriesWxml.includes('bindchange="onOwnerSettingPublicVisible"'), 'owner setting form should toggle public holder visibility')
  assert(seriesJs.includes('publicVisible: false,\n      sourceType: base.sourceType'), 'collection image upload public holder visibility should default off')
  assert(seriesJs.includes('publicVisible: owned ? uploadItems[i].publicVisible === true : uploadItems[i].publicVisible'), 'marking an uploaded image as owned should not turn on public visibility automatically')
  assert(seriesJs.includes('ownerSettingPublicVisible: meta.publicVisible === true'), 'owner setting should preserve explicit public visibility on existing owned records')
  assert(seriesJs.includes('ledgerLinkPublicVisible: false'), 'existing-ledger link public visibility should default off')
  assert(seriesJs.includes("publicVisible: false\n    },\n    holdGradingOptions"), 'long-press hold public visibility should default off')
  assert(/editImageHoldForm: \{[\s\S]*?publicVisible: editImageMeta\.publicVisible === true[\s\S]*?\},\n\s+editImageProductNumber/.test(seriesJs), 'edit image hold form should preserve explicit public visibility on existing records')
  assert(seriesJs.includes('publicVisible: form.publicVisible === true'), 'ledger payloads should only be public when the form is explicitly checked')
  assert(seriesJs.includes('ownerSettingPublicVisible === true'), 'owner setting saves should only publish when explicitly checked')
  assert(seriesJs.includes('ledgerLinkPublicVisible === true'), 'existing-ledger link saves should only publish when explicitly checked')
  assert(seriesJs.includes('editHoldForm.publicVisible === true'), 'edit image saves should only publish when explicitly checked')
  assert(seriesJs.includes('_ensureOwnerPublicId'), 'saving public ownership should require a public id')
  assert(seriesJs.includes("_updateOwnerMetaBy(ownerMetaBy, ownedBy, openid, owned, status, note, publicVisible = false, publicId = '')"), 'owner metadata should default to private and store public visibility and id')
  assert(myWxml.includes('bindchange="onFormPublicVisible"'), 'my collection form should toggle public card visibility')
  assert(myWxml.includes('bindchange="onSeriesLinkPublicVisible"'), 'my collection link modal should toggle public holder visibility')
  assert(!myWxml.includes('editingId && form.seriesId && form.imageUrl'), 'my collection should allow ordinary ledger cards to be public')
  assert(/const EMPTY_FORM = \{[\s\S]*?publicVisible: false/.test(myJs), 'ordinary ledger public visibility should default off')
  assert(myJs.includes('publicVisible: item.publicVisible === true,\n      publicId: item.publicId'), 'ordinary ledger edits should preserve explicit public visibility')
  assert(myJs.includes('seriesLinkPublicVisible: publicVisible'), 'my collection series-link should preserve explicit public visibility')
  assert(myJs.includes('seriesLinkPublicVisible === true'), 'my collection series-link saves should only publish when explicitly checked')
  assert(myJs.includes('syncOwnerPublicVisibility'), 'my collection saves should sync public holder visibility back to series images')
  assert(myDetailWxml.includes('bindchange="onFormPublicVisible"'), 'series-group detail form should toggle public card visibility')
  assert(myDetailWxml.includes('bindchange="onSeriesLinkPublicVisible"'), 'series-group detail link modal should toggle public holder visibility')
  assert(/const EMPTY_FORM = \{[\s\S]*?publicVisible: false/.test(myDetailJs), 'series-group detail ledger form public visibility should default off')
  assert(myDetailJs.includes('publicVisible: item.publicVisible === true,\n      publicId: item.publicId'), 'series-group detail ledger edits should preserve explicit public visibility')
  assert(myDetailJs.includes('seriesLinkPublicVisible: publicVisible'), 'series-group detail series-link should preserve explicit public visibility')
  assert(myDetailJs.includes('seriesLinkPublicVisible === true'), 'series-group detail series-link saves should only publish when explicitly checked')
  assert(myDetailJs.includes('syncOwnerPublicVisibility'), 'series-group detail saves should sync public holder visibility back to series images')
  assert(cloudJs.includes("updateOwnerMetaBy(ownerMetaBy, ownedBy, openid, owned, status = 'owned', note = '', publicVisible = false, publicId = '')"), 'cloud owner metadata should default private and store public visibility and id')
  assert(cloudJs.includes('const publicVisible = options.publicVisible === true'), 'cloud ownership mutations should only publish explicit public visibility')
  assert(cloudJs.includes('publicVisible: item.publicVisible === true'), 'existing-ledger link candidates should expose explicit public visibility for default selection')
  assert(detailWxml.includes('持有人'), 'card detail should render the public holder field')
  assert(detailJs.includes('meta.publicVisible === true && publicId'), 'card detail should only show explicitly public holders with public ids')
  assert(detailJs.includes('return publicVisible === true && id ? [{ publicId: id }] : []'), 'standalone user card detail should only show explicitly public holder ids')
  assert(rules.includes('没有历史公开状态时默认不勾选公开持有'), 'product rules should document default-off public holder behavior without initial public state')
})

test('public card shelf exposes only voluntary public ledger cards', () => {
  const appJson = read('miniprogram-card/app.json')
  const appWxss = read('miniprogram-card/app.wxss')
  const indexJs = read('miniprogram-card/pages/index/index.js')
  const indexWxml = read('miniprogram-card/pages/index/index.wxml')
  const indexWxss = read('miniprogram-card/pages/index/index.wxss')
  const publicJs = read('miniprogram-card/pages/public-cards/public-cards.js')
  const publicWxml = read('miniprogram-card/pages/public-cards/public-cards.wxml')
  const publicDetailJs = read('miniprogram-card/pages/public-card-detail/public-card-detail.js')
  const publicDetailJson = read('miniprogram-card/pages/public-card-detail/public-card-detail.json')
  const publicDetailWxml = read('miniprogram-card/pages/public-card-detail/public-card-detail.wxml')
  const publicDetailWxss = read('miniprogram-card/pages/public-card-detail/public-card-detail.wxss')
  const labelComponentJs = read('miniprogram-card/components/image-meta-label/image-meta-label.js')
  const labelComponentWxss = read('miniprogram-card/components/image-meta-label/image-meta-label.wxss')
  const cardDetailJs = read('miniprogram-card/pages/collection-card-detail/collection-card-detail.js')
  const cardDetailWxml = read('miniprogram-card/pages/collection-card-detail/collection-card-detail.wxml')
  const collectionData = read('miniprogram-card/utils/collectionData.js')
  const cloudJs = read('miniprogram-card/cloudfunctions/seriesOps/index.js')
  const rules = read('miniprogram-card/PRODUCT_RULES.md')

  const registeredPages = getRegisteredPagesFromAppJsonText(appJson)
  assert(registeredPages.includes('pages/public-cards/public-cards'), 'public card shelf page should be registered')
  assert(registeredPages.includes('pages/public-card-detail/public-card-detail'), 'public card shelf detail page should be registered')
  assert(indexWxml.includes('公开卡册'), 'collection home should expose the public shelf entry')
  assert(indexWxml.includes('bindtap="goPublicCards"'), 'public shelf entry should navigate to the public list page')
  assert(!indexWxml.includes('bindtap="togglePublicShelf"'), 'public shelf entry should not expand an inline preview')
  assert(!indexWxml.includes('public-shelf-card'), 'collection home should not render the public shelf list inline')
  assert(indexWxss.includes('.series-action-right'), 'my cards and public shelf entries should sit on the right side')
  assert(indexJs.includes("wx.navigateTo({ url: '/pages/public-cards/public-cards' })"), 'collection home should open the public list page directly')
  assert(!indexJs.includes('togglePublicShelf'), 'collection home should not keep inline public shelf toggle logic')
  assert(publicJs.includes('buildPublicShelfAlbum'), 'public list page should render public shelves as collection-style albums')
  assert(publicJs.includes('buildThumbSlots'), 'public list albums should reserve five thumbnail slots')
  assert(publicJs.includes('const description = cleanText(result.description)'), 'public list albums should show shelf descriptions')
  assert(!publicJs.includes('soldCount'), 'public list albums should not show sold counts as a public status')
  assert(publicJs.includes('cycleSort'), 'public list sort should cycle in place')
  assert(publicJs.includes('onSearchInput'), 'public list should support public id search')
  assert(publicJs.includes('onShareAppMessage'), 'public list should be shareable')
  assert(publicJs.includes('goPublicCardDetail'), 'public list page should drill into the public shelf detail page')
  assert(publicWxml.includes('public-album-card'), 'public list page should show card-shelf cards, not card rows')
  assert(publicWxml.includes('album-thumbs'), 'public list page should show up to five shelf thumbnails')
  assert(publicWxml.includes('album-desc'), 'public list page should render the shelf description when present')
  assert(!publicWxml.includes('album-thumb-status'), 'public list thumbnails should not badge sold public cards')
  assert(publicWxml.includes('wx:for="{{item.thumbSlots}}"'), 'public list page should render fixed thumbnail slots')
  assert(publicWxml.includes('placeholder="搜索公开 ID"'), 'public list page should expose public id search')
  assert(publicWxml.includes('bindtap="cycleSort"'), 'public list sort should not use a bottom action sheet')
  assert(!publicWxml.includes('card-item'), 'public list page should not directly render card rows')
  assert(publicDetailJs.includes('getPublicCardShelf'), 'public detail page should load the public card shelf')
  assert(publicDetailJs.includes('setPublicShelfDescription'), 'public detail should let the shelf owner/admin save a shelf description')
  assert(publicDetailJs.includes('batchCancelPublicCardItems'), 'public detail should batch cancel public visibility without deleting private ledger cards')
  assert(publicDetailJs.includes('openPublicExportModal'), 'public detail should expose owner-only bulk export')
  assert(publicDetailJs.includes('publicExportSelectedMap'), 'public detail export should allow freely selecting cards')
  assert(publicDetailJs.includes('publicExportSelectedMap: {}'), 'public detail export should open with no cards selected')
  assert(publicDetailJs.includes('selectAllPublicExportCards'), 'public detail export should still support select all')
  assert(publicDetailJs.includes('exportPublicShelfCards'), 'public detail should export selected public shelf cards')
  assert(!publicDetailJs.includes('statusLabel'), 'public detail should not carry public card status labels')
  assert(!publicDetailJs.includes('showStatus'), 'public detail export should not expose a public status field')
  assert(!publicDetailJs.includes('状态 已卖出'), 'public detail export should not write sold status text')
  assert(publicDetailJs.includes('buildPublicCardView'), 'public detail page should build sorted and filtered views')
  assert(publicDetailJs.includes('filterPublicCards'), 'public detail page should filter public cards')
  assert(publicDetailJs.includes('buildPublicFilterOptions'), 'public detail page should build filter chips')
  assert(publicDetailJs.includes('checkDuplicateBeforeAdd'), 'public detail long-press should report duplicate add attempts clearly')
  assert(publicDetailJs.includes('buildPublicImageLabel'), 'public detail page should build default public image labels')
  assert(publicDetailJs.includes('buildPublicMediumImageLabel'), 'public detail page should build two-column public image labels')
  assert(publicDetailJs.includes('buildPublicCompactImageLabel'), 'public detail page should build three-column public image labels')
  assert(publicDetailJs.includes('const cardSeries = cleanText(item.cardSeries) || cleanText(item.series)'), 'public detail image labels should prefer the card series over the serial number')
  assert(publicDetailJs.includes('cleanText(item.productNumber || item.cardNo),') && publicDetailJs.includes('cleanText(item.serialNumber || item.serialNo)'), 'public detail one-column labels should include standard card number fields when available')
  assert(publicDetailJs.includes('return joinPublicImageLabel([parts.cardNumber, parts.year, parts.cardSeries, cleanText(item.memorabiliaNote), parts.player])'), 'public detail one-column labels should render number, year, series, memorabilia note and player')
  assert(publicDetailJs.includes('return joinPublicImageLabel([parts.year, parts.cardSeries, parts.player])'), 'public detail two-column labels should render year, series and player')
  assert(publicDetailJs.includes('return joinPublicImageLabel([parts.year, parts.cardSeries])'), 'public detail three-column labels should render only year and series')
  assert(publicDetailJs.includes('mediumImageLabel: buildPublicMediumImageLabel(item)'), 'public detail should keep medium labels for two-column cards')
  assert(publicDetailJs.includes('compactImageLabel: buildPublicCompactImageLabel(item)'), 'public detail should keep compact labels for three-column cards')
  assert(publicDetailJs.includes('imageGridColumns'), 'public detail page should support 1/2/3 column layouts')
  assert(publicDetailJs.includes('cycleImageGridViewMode'), 'public detail layout should cycle like collection detail')
  assert(!publicDetailJs.includes('wx.showActionSheet'), 'public detail layout/sort controls should not use a bottom action sheet')
  assert(publicDetailJs.includes('onShareAppMessage'), 'public detail should be shareable')
  assert(publicDetailJs.includes('onPublicImageLongPress'), 'public detail page should support long-press ownership')
  assert(publicDetailJs.includes('addUserCardItem'), 'public detail long-press should add a same-card ledger item')
  assert(publicDetailJs.includes('buildDuplicateKey'), 'public detail long-press should check duplicate user cards')
  assert(publicDetailJs.includes('/pages/collection-card-detail/collection-card-detail?publicId='), 'public detail image tap should open card detail')
  assert(publicDetailWxml.includes('class="detail-stats public-detail-stats"'), 'public detail should use collection-detail style header')
  assert(publicDetailWxml.includes('class="detail-desc"'), 'public detail should show shelf description')
  assert(publicDetailWxml.includes('class="detail-head-actions"'), 'public detail should keep count and owner edit entry in the header')
  assert(publicDetailWxml.includes('class="detail-edit-icon"'), 'public detail edit entry should be a header icon')
  assert(publicDetailWxml.includes('class="detail-edit-icon" bindtap="openDescriptionModal"'), 'public detail header edit icon should edit the shelf description')
  assert(publicDetailWxml.includes('当前 {{displayCount}}/{{total}} 张'), 'public detail filtered count should reuse the header count slot instead of adding a new row')
  assert(!publicDetailWxml.includes('detail-filter-count'), 'public detail should not add a filtered-count row that shifts the page')
  assert(!publicDetailWxml.includes('>编辑公开</view>'), 'public detail public-visibility edit should no longer be a toolbar text button')
  assert(publicDetailWxml.includes('bindtap="enterBatchEditMode">编辑卡片</view>'), 'public detail card edit button should stay in the action bar')
  assert(publicDetailWxml.includes('class="action-bar"'), 'public detail should use collection-detail style action bar')
  assert(publicDetailWxml.includes('bindtap="openDescriptionModal"'), 'public detail should allow shelf description editing')
  assert(publicDetailWxml.includes('bindtap="enterBatchEditMode"'), 'public detail should allow editing public visibility')
  assert(publicDetailWxml.includes('bindtap="openPublicExportModal"'), 'public detail should expose bulk export for the owner')
  assert(publicDetailWxml.includes('bindtap="batchCancelPublicVisible"'), 'public detail should support batch cancelling public cards')
  assert(publicDetailWxml.includes('showPublicExportModal'), 'public detail should render a bulk export modal')
  assert(!publicDetailWxml.includes('public-card-status'), 'public detail image grid should not badge sold public cards')
  assert(!publicDetailWxml.includes('detail-status-count'), 'public detail header should not show a sold count badge')
  assert(!publicDetailWxml.includes('export-card-status'), 'public detail export picker should not badge sold public cards')
  assert(publicDetailWxml.includes('bindtap="cyclePublicSort"'), 'public detail sort should cycle in place')
  assert(publicDetailWxml.includes('bindtap="cyclePublicFilterType"'), 'public detail filter type should cycle in place')
  assert(publicDetailWxml.includes('placeholder="搜索球员、系列、年份、编号..."'), 'public detail should expose card search')
  assert(publicDetailWxml.includes('class="public-filter-chip'), 'public detail should expose lightweight filter chips')
  assert(publicDetailWxml.includes('class="public-filter-chip-text"'), 'public detail filter chips should wrap text so long labels truncate from the right')
  assert(publicDetailWxml.includes('class="public-filter-track"'), 'public detail filter chips should be wrapped for stable scroll-view layout')
  assert(publicDetailWxml.includes('open-type="share"'), 'public detail should expose a share button')
  assert(publicDetailWxml.includes('bindtap="cycleImageGridViewMode"'), 'public detail layout should cycle in place')
  assert(publicDetailWxml.includes('free-images view-small image-grid-cols-{{imageGridColumns}}'), 'public detail should render a pure-image style grid')
  assert(publicDetailWxml.includes('card-image-wrap'), 'public detail image cells should reuse collection detail image cells')
  assert(publicDetailJson.includes('"/components/image-meta-label/image-meta-label"'), 'public detail should register the shared image label component')
  assert(publicDetailWxml.includes('<image-meta-label mode="single"'), 'public detail should render a single collection-style image label')
  assert(publicDetailWxml.includes('imageGridColumns === 1 ? item.imageLabel : imageGridColumns === 2 ? item.mediumImageLabel : item.compactImageLabel'), 'public detail should choose label content by column count')
  assert(publicDetailWxml.includes('bindlongpress="onPublicImageLongPress"'), 'public detail images should handle long press')
  assert(publicDetailWxss.includes('.free-images.view-small.image-grid-cols-1 .card-image-wrap'), 'public detail should style one-column layout like collection detail')
  assert(publicDetailWxss.includes('flex-basis: calc((100% - 24rpx) / 3); height: 226rpx;'), 'public detail three-column cells should update size without relying on aspect-ratio')
  assert(publicDetailWxss.includes('flex-basis: calc((100% - 12rpx) / 2); height: 345rpx;'), 'public detail two-column cells should update size without relying on aspect-ratio')
  assert(publicDetailWxss.includes('flex-basis: 100%; height: 702rpx;'), 'public detail one-column cells should update size without relying on aspect-ratio')
  assert(publicDetailWxss.includes('width: auto !important'), 'public detail share button should override WeChat button default width')
  assert(publicDetailWxss.includes('.public-filter-track'), 'public detail filter row should keep a stable horizontal track')
  assert(publicDetailWxss.includes('height: 56rpx'), 'public detail filter chips should keep a stable height')
  assert(publicDetailWxss.includes('.public-filter-chip-text'), 'public detail filter chip text should own ellipsis styling')
  assert(publicDetailWxss.includes('.detail-edit-icon'), 'public detail should style the header edit icon')
  assert(publicDetailWxss.includes('color: #64748b; background: #f1f5f9;'), 'public detail header edit icon should use a neutral gray style')
  assert(publicDetailWxss.includes('.detail-count-wrap'), 'public detail count slot should have stable width when filtered')
  assert(!publicDetailWxss.includes('.public-card-status'), 'public detail should not keep sold badge styles for image cells')
  assert(!publicDetailWxss.includes('.export-card-status'), 'public detail should not keep sold badge styles for export cells')
  assert(publicDetailWxss.includes('.action-btn-export'), 'public detail export button should use a stable owner action style')
  assert(publicDetailWxss.includes('.batch-edit-bar'), 'public detail batch edit controls should be styled')
  assert(publicDetailWxss.includes('.export-card-grid'), 'public detail export card picker should be styled')
  assert(!publicDetailWxss.includes('aspect-ratio'), 'public detail should avoid aspect-ratio because mobile layout switching can leave stale heights')
  assert(!publicDetailWxss.includes('.image-number-label {'), 'public detail should not duplicate the shared label chip style')
  assert(!publicDetailWxss.includes('.image-preview-icon {'), 'public detail should not duplicate shared preview icon styling')
  assert(appWxss.includes('.image-preview-icon'), 'global styles should define shared preview icon styling')
  assert(labelComponentWxss.includes('.image-label-stack'), 'shared label component should define label stacks')
  assert(labelComponentWxss.includes('.image-label-chip'), 'shared label component should define label chips')
  assert(labelComponentWxss.includes('.image-label-cols-3 .image-label-chip'), '3-column shared labels should stay compact')
  assert(labelComponentWxss.includes('.image-label-cols-2 .image-label-chip'), '2-column shared labels should be medium sized')
  assert(labelComponentWxss.includes('.image-label-cols-1 .image-label-chip'), '1-column shared labels should be larger')
  assert(labelComponentWxss.includes('max-width: 90%'), 'shared labels should cap width so long labels do not cover images')
  assert(labelComponentJs.includes('Number(data.columns) === 3 && compactLabels.length'), 'shared label component should use compact labels in three-column layout')
  assert(!publicDetailWxml.includes('public-image-grid'), 'public detail should not keep custom public-grid markup')
  assert(cardDetailJs.includes('publicItemId'), 'card detail should support public card item routes')
  assert(cardDetailJs.includes('loadPublicCardItemDetail'), 'card detail should load public card detail from whitelisted shelf data')
  assert(cardDetailJs.includes('buildHolderList'), 'card detail should keep public holders as clickable structured data')
  assert(cardDetailJs.includes('goPublicShelfById'), 'card detail holder taps should open a public shelf only after checking it exists')
  assert(!cardDetailJs.includes("sourceDisplay: '我的卡片'"), 'my-card detail should not use the entry name as the source')
  assert(!cardDetailJs.includes("sourceDisplay: '公开卡册'"), 'public card detail should not use the shelf name as the source')
  assert(cardDetailJs.includes('uploaderDisplay: publicId'), 'public card detail should show the public shelf owner as uploader')
  assert(cardDetailJs.includes('holderList: publicId ? [{ publicId }] : []'), 'public card detail should keep holder visible even for sold public cards')
  assert(!cardDetailJs.includes('publicStatusLabel'), 'public card detail should not render a separate public status field')
  assert(cardDetailJs.includes('loadSamePublicHolders'), 'public card detail should load same-card public holders')
  assert(cardDetailJs.includes('getPublicSameCardHolders'), 'public card detail should use whitelisted same-holder data')
  assert(cardDetailJs.includes('samePublicHolderVisible: holders.length > 1'), 'same-card holder panel should show only when another public holder exists')
  assert(cardDetailWxml.includes('class="holder-link"'), 'card detail should render public holders as blue links')
  assert(cardDetailWxml.includes('bindtap="onHolderTap"'), 'card detail public holders should be tappable')
  assert(!cardDetailWxml.includes('公开状态'), 'card detail should not render a separate public status field')
  assert(!cardDetailWxml.includes('status-public-sold'), 'card detail should not keep public status styling in the meta grid')
  assert(!cardDetailWxml.includes('· 已卖出'), 'same-card public holders should not mark sold state publicly')
  assert(!cardDetailWxml.includes('same-holder-chip {{item.status'), 'same-card public holder chips should not style sold state publicly')
  assert(collectionData.includes('async function getPublicCardShelf'), 'data layer should expose public card shelf loading')
  assert(collectionData.includes('async function getPublicSameCardHolders'), 'data layer should expose same-card public holders')
  assert(collectionData.includes('async function setPublicShelfDescription'), 'data layer should expose public shelf description saving')
  assert(collectionData.includes('async function batchCancelPublicCardItems'), 'data layer should expose batch public visibility cancellation')
  assert(collectionData.includes("isUnsupportedSeriesActionError(err, 'getPublicSameCardHolders')"), 'same-holder loading should tolerate older undeployed seriesOps')
  assert(collectionData.includes("isUnsupportedSeriesActionError(err, 'getPublicCardShelf')"), 'data layer should tolerate an older undeployed seriesOps action')
  assert(collectionData.includes('getOwnPublicCardShelfFallback'), 'data layer should fallback to the current user public shelf before cloud deployment')
  assert(collectionData.includes('userCardItemsCol.where({ openid, publicVisible: true })'), 'public shelf fallback should only read the current user ledger cards')
  assert(cloudJs.includes("if (action === 'getPublicCardShelf')"), 'cloud function should support public shelf loading')
  assert(cloudJs.includes("if (action === 'setPublicShelfDescription')"), 'cloud function should support public shelf description saving')
  assert(cloudJs.includes("if (action === 'batchCancelPublicCardItems')"), 'cloud function should support batch public visibility cancellation')
  assert(cloudJs.includes("if (action === 'getPublicSameCardHolders')"), 'cloud function should support same-card holder loading')
  assert(cloudJs.includes('function buildPublicSameCardKey'), 'cloud function should match same-card public holders by public card identity')
  assert(cloudJs.includes('const query = { publicVisible: true }'), 'same-card holder loading should use a coarse public query before identity matching')
  assert(cloudJs.includes('publicVisible: true'), 'same-card holder loading should only read public cards')
  assert(cloudJs.includes('function sanitizePublicCardItemForShelf'), 'cloud function should whitelist public card fields')
  assert(cloudJs.includes('status: normalizeUserCardItemStatus(item.status)'), 'public card shelf should expose only public sale status, not sale amounts')
  assert(cloudJs.includes('function setPublicShelfDescription'), 'cloud function should persist public shelf descriptions with permission checks')
  assert(cloudJs.includes('function batchCancelPublicCardItems'), 'cloud function should batch cancel public cards with permission checks')
  assert(cloudJs.includes('publicVisible: input.publicVisible === true'), 'user card normalization should persist voluntary public visibility')
  assert(cloudJs.includes("publicId: input.publicVisible === true ? String(input.publicId || '').trim().slice(0, 24) : ''"), 'private user cards should clear public id snapshots')
  assert(!cloudJs.slice(cloudJs.indexOf('function sanitizePublicCardItemForShelf'), cloudJs.indexOf('async function getPublicCardShelf')).includes('purchasePrice'), 'public card shelf should not expose purchase fields')
  assert(!cloudJs.slice(cloudJs.indexOf('function sanitizePublicCardItemForShelf'), cloudJs.indexOf('async function getPublicSameCardHolders')).includes('salePrice'), 'public card shelf should not expose private sale amounts')
  assert(!publicWxml.includes('成本'), 'public list page should not show purchase costs')
  assert(!publicWxml.includes('卖出金额') && !publicWxml.includes('卖出日期') && !publicWxml.includes('盈亏'), 'public list page should not show private sale fields')
  assert(!publicDetailWxml.includes('成本'), 'public detail page should not show purchase costs')
  assert(!publicDetailWxml.includes('卖出金额') && !publicDetailWxml.includes('卖出日期') && !publicDetailWxml.includes('盈亏'), 'public detail page should not show private sale fields')
  assert(rules.includes('公开卡册'), 'product rules should document the public card shelf')
  assert(rules.includes('公开卡册列表页按卡册展示'), 'product rules should document the shelf-list interaction')
  assert(rules.includes('固定展示 5 个缩略图槽位'), 'product rules should document fixed public shelf thumbnail slots')
  assert(rules.includes('公开卡册详情页布局参考纯图片图鉴'), 'product rules should document the public shelf detail interaction')
  assert(rules.includes('公开卡册可以填写描述'), 'product rules should document public shelf descriptions')
  assert(rules.includes('批量取消卡片公开'), 'product rules should document batch public visibility cancellation')
  assert(rules.includes('公开卡册导出弹窗默认不选中任何卡片'), 'product rules should document empty default public export selection')
  assert(rules.includes('已卖出的公开卡片仍保留在公开卡册中'), 'product rules should document sold public card display')
  assert(rules.includes('公开卡册详情图片底部需要展示灰色 `已卖出` label'), 'product rules should document sold public card image labels')
  assert(publicDetailWxml.includes("item.status === 'sold'") && publicDetailWxml.includes('image-sold-label'), 'public detail should show sold image labels')
  assert(rules.includes('不能把 `我的卡片` 或 `公开卡册` 这类入口/容器当成来源'), 'product rules should document fixed card detail source labels')
  assert(rules.includes('不展示公开状态字段'), 'product rules should document that public card detail does not show a public status field')
  assert(rules.includes('已卖出的公开卡片仍需要展示持有人'), 'product rules should document sold public card holder visibility')
  assert(rules.includes('自由选择卡片'), 'product rules should document flexible public shelf export')
  assert(rules.includes('我的卡片页面需要提供全局导出入口'), 'product rules should document my collection global export')
  assert(rules.includes('可滚动列表多选'), 'product rules should document my collection export list selection')
  assert(rules.includes('不导出买入成本、卖出金额、购买日期、卖出日期、备注'), 'product rules should document private fields excluded from my collection export')
  assert(rules.includes('支持搜索、按球员/年份/系列筛选、1/2/3 列切换、排序和分享'), 'product rules should document public detail search/filter/share')
  assert(rules.includes('公开持有人 ID 使用蓝色可点击样式'), 'product rules should document holder-to-shelf navigation')
  assert(rules.includes('同款公开持有人'), 'product rules should document same-card public holders')
  assert(rules.includes('复用共享 `image-preview-icon` 样式'), 'product rules should document shared preview icon styling')
  assert(rules.includes('1 列展示 `编号 · 年份 · 系列 · 球员`'), 'product rules should document one-column public image labels')
  assert(rules.includes('2 列展示 `年份 · 系列 · 球员`'), 'product rules should document two-column public image labels')
  assert(rules.includes('3 列只展示 `年份 · 系列`'), 'product rules should keep three-column public labels compact')
  assert(rules.includes('图片标签不能拆成多个小标签'), 'product rules should keep public detail labels as a single collection-style label')
  assert(rules.includes('标签大小和间距跟随 `1/2/3` 列布局做区分'), 'product rules should document layout-aware public image label sizing')
  assert(rules.includes('复用 `components/image-meta-label` 组件'), 'product rules should document the shared image label component')
  assert(rules.includes('如果原记录明确 `publicVisible === true`，需要回显勾选'), 'product rules should document preserving explicit public holder state')
  assert(rules.includes('没有历史公开状态时默认不勾选公开持有'), 'product rules should document default-off public holder behavior for collection uploads')
})

test('series upload owned flow can capture purchase and grading details', () => {
  const seriesJs = read('miniprogram-card/pages/collection-series/collection-series.js')
  const seriesWxml = read('miniprogram-card/pages/collection-series/collection-series.wxml')
  const uploadHoldStart = seriesWxml.indexOf('<text class="modal-section-title">持有记录</text>\n              <view wx:if="{{item.owned}}" class="upload-owned-fields">')
  const uploadRatingStart = seriesWxml.indexOf('<text class="modal-section-title">评级信息</text>', uploadHoldStart)
  const uploadNoteStart = seriesWxml.indexOf('<text class="modal-section-title">备注</text>', uploadRatingStart)
  const uploadHoldBlock = seriesWxml.slice(uploadHoldStart, uploadRatingStart)
  const uploadRatingBlock = seriesWxml.slice(uploadRatingStart, uploadNoteStart)
  const uploadNoteBlock = seriesWxml.slice(uploadNoteStart, seriesWxml.indexOf('</scroll-view>', uploadNoteStart))
  assert(uploadHoldStart >= 0 && uploadRatingStart > uploadHoldStart && uploadNoteStart > uploadRatingStart, 'upload owned fields should be split into hold, grading, and note sections')
  assert(seriesJs.includes('UPLOAD_GRADE_OPTIONS'), 'upload flow should expose grade choices')
  assert(seriesJs.includes('onUploadItemLedgerInput'), 'upload owned fields should update purchase form state')
  assert(seriesJs.includes('onUploadItemGradingCompanyChange'), 'upload owned fields should support grading company selection')
  assert(seriesJs.includes('_createLedgerForOwnedUploads'), 'owned uploads should create private collection ledger entries')
  assert(seriesJs.includes('this._upsertHoldLedgerRecord(newImage.url, item, uploadItem, newImage)'), 'ledger creation should use the uploaded image metadata')
  assert(seriesJs.includes('buildCardVersionText(item.cardKind, item.cardVariant)'), 'direct upload should collapse legacy card variant into card version')
  assert(uploadHoldBlock.includes('class="form-group-modal"'), 'owned upload form should use the same vertical field style as long-press hold')
  assert(uploadHoldBlock.includes('class="hold-ledger-grid"'), 'owned upload form should use the same two-column grid as long-press hold')
  assert(uploadHoldBlock.includes('class="form-input-modal"'), 'owned upload form inputs should match long-press hold inputs')
  assert(uploadHoldBlock.includes('form-input-modal form-picker-modal'), 'owned upload form pickers should match long-press hold pickers')
  assert(uploadHoldBlock.includes('买入成本'), 'owned upload form should show purchase cost')
  assert(uploadHoldBlock.includes('data-field="quantity"'), 'owned upload form should capture quantity like long-press hold')
  assert(uploadHoldBlock.includes('公开持有'), 'owned upload form should include the public holder toggle after purchase fields')
  assert(seriesWxml.includes('data-field="cardKind" bindfocus="onUploadMetaSuggestFocus"'), 'owned upload form should search card version suggestions')
  assert(!seriesWxml.includes('value="{{item.cardVariant}}" data-i="{{uploadIndex}}" data-field="cardVariant"'), 'owned upload form should not expose a separate legacy card variant field')
  assert(uploadRatingBlock.includes('评级公司'), 'owned upload form should show grading company')
  assert(uploadRatingBlock.includes('评级分数'), 'owned upload form should show grade selector')
  assert(uploadRatingBlock.includes('data-field="autoGrade"'), 'owned upload form should capture autograph grade')
  assert(uploadRatingBlock.includes('data-field="certNo"'), 'owned upload form should capture certificate number')
  assert(uploadNoteBlock.includes('bindinput="onUploadItemNote"'), 'owned upload form should capture note in the note section')
  assert(seriesJs.includes('AUTHENTIC / 鉴真'), 'grade selector should include authentic-only grading')
})

test('card version taxonomy provides searchable built-in versions', () => {
  const taxonomyJs = read('miniprogram-card/utils/cardTaxonomy.js')
  const taxonomy = require(path.join(root, 'miniprogram-card/utils/cardTaxonomy.js'))
  const appJs = read('miniprogram-card/app.js')
  const myJs = read('miniprogram-card/pages/my-collection/my-collection.js')
  const myDetailJs = read('miniprogram-card/pages/my-collection-series-detail/my-collection-series-detail.js')
  const detailJs = read('miniprogram-card/pages/collection-card-detail/collection-card-detail.js')
  const rules = read('miniprogram-card/PRODUCT_RULES.md')
  assert(taxonomyJs.includes('BASE_CARD_VERSIONS'), 'taxonomy should define built-in card versions')
  ;['Silver Prizm', 'Blue Prizm', 'RPA', 'PA', 'VPA', 'HPA', 'SS', 'SSS', 'FPA', 'SPM', 'Sneaker Swatches', 'Treasured Tags', 'Gold Vinyl', 'Tie-Dye'].forEach(name => {
    assert(taxonomyJs.includes(`"${name}"`), `taxonomy should include ${name}`)
  })
  ;['Panini Flawless', 'Panini Immaculate', 'Panini National Treasures', 'Panini Prizm', 'Panini Select', 'Panini Optic', 'Panini Mosaic'].forEach(name => {
    assert(taxonomyJs.includes(`"${name}"`), `taxonomy should organize card versions by ${name}`)
  })
  const versionOptions = taxonomy.buildCardVersionOptions()
  assert.strictEqual(taxonomy.filterOptions(versionOptions, 'vpa', taxonomy.CARD_VERSION_ALIASES)[0], 'VPA', 'VPA abbreviation should rank before loose patch matches')
  assert.strictEqual(taxonomy.filterOptions(versionOptions, 'ss', taxonomy.CARD_VERSION_ALIASES)[0], 'SS', 'SS abbreviation should rank before ordinary words containing ss')
  assert(taxonomy.filterOptions(versionOptions, 'horizontal patch', taxonomy.CARD_VERSION_ALIASES).includes('HPA'), 'HPA should match horizontal patch search')
  assert(taxonomy.filterOptions(versionOptions, 'sneaker swatch', taxonomy.CARD_VERSION_ALIASES).includes('SS'), 'SS should match sneaker swatch search')
  assert(taxonomy.filterOptions(versionOptions, 'star swatch', taxonomy.CARD_VERSION_ALIASES).includes('SSS'), 'SSS should match star swatch search')
  assert(taxonomyJs.includes('"sliver"'), 'taxonomy should support the common Silver typo')
  assert(rules.includes('候选需要按厂商/系列维度维护'), 'product rules should require brand/series grouped card version candidates')
  assert(appJs.includes('2026-05-24-card-version-taxonomy-v2'), 'app suggest cache should invalidate old card version candidates')
  assert(appJs.includes('suggestCardVersions: cardTaxonomy.buildCardVersionOptions'), 'app suggest cache should preload card versions')
  assert(myJs.includes('cardName: this.data.suggestCardVersions'), 'my collection should use card version suggestions')
  assert(myDetailJs.includes('cardName: this.data.suggestCardVersions'), 'series-group detail should use card version suggestions')
  assert(detailJs.includes("const QUALITY_META_SUGGEST_FIELDS = ['player', 'year', 'brand', 'cardSeries', 'cardKind']"), 'card detail correction should search card version suggestions')
})

test('metadata suggestion inputs debounce candidate search without delayed value writes', () => {
  const rules = read('miniprogram-card/PRODUCT_RULES.md')
  const myJs = read('miniprogram-card/pages/my-collection/my-collection.js')
  const myDetailJs = read('miniprogram-card/pages/my-collection-series-detail/my-collection-series-detail.js')
  const seriesJs = read('miniprogram-card/pages/collection-series/collection-series.js')
  const detailJs = read('miniprogram-card/pages/collection-card-detail/collection-card-detail.js')

  assert(rules.includes('用户停止输入后再刷新候选'), 'product rules should require debounced candidate refreshes for metadata inputs')
  ;[
    myJs,
    myDetailJs,
    seriesJs,
    detailJs
  ].forEach(source => {
    assert(source.includes('META_SUGGEST_DEBOUNCE_MS = 200'), 'metadata suggest inputs should share a short debounce')
    assert(
      source.includes('String(current || \'\') !== String(keyword || \'\')') ||
      source.includes('String(getCurrentValue() || \'\') !== String(expectedValue || \'\')'),
      'stale debounced suggestion work should be discarded'
    )
  })
  assert(myJs.includes('this.setData(patch)') && myJs.includes('this.scheduleSuggestions(field, value)'), 'my collection should sync form values immediately and debounce suggestions')
  assert(myDetailJs.includes('this.setData(patch)') && myDetailJs.includes('this.scheduleSuggestions(field, value)'), 'series-group detail should sync form values immediately and debounce suggestions')
  assert(seriesJs.includes('scheduleUploadSuggestions') && seriesJs.includes('scheduleEditSuggestions') && seriesJs.includes('scheduleBatchSuggestions') && seriesJs.includes('scheduleManageSuggestions'), 'collection series metadata inputs should debounce every suggestion context')
  assert(detailJs.includes('this.setData(update)') && detailJs.includes('this.scheduleQualitySuggestions(field, value)'), 'card detail correction should sync values immediately and debounce suggestions')
  assert(!myJs.includes('this.filterSuggestions(field, e.detail.value)'), 'my collection bindinput should not filter candidates synchronously')
  assert(!myDetailJs.includes('this.filterSuggestions(field, e.detail.value)'), 'series-group bindinput should not filter candidates synchronously')
  assert(!seriesJs.includes("this.filterUploadSuggestions('cardKind', i, value)"), 'collection upload card version input should not filter candidates synchronously')
  assert(!seriesJs.includes("this.filterEditSuggestions('cardKind', value)"), 'collection edit card version input should not filter candidates synchronously')
})

test('all visible search inputs debounce list filtering without typing loading states', () => {
  const indexJs = read('miniprogram-card/pages/index/index.js')
  const indexWxml = read('miniprogram-card/pages/index/index.wxml')
  const seriesJs = read('miniprogram-card/pages/collection-series/collection-series.js')
  const seriesWxml = read('miniprogram-card/pages/collection-series/collection-series.wxml')
  const myJs = read('miniprogram-card/pages/my-collection/my-collection.js')
  const myDetailJs = read('miniprogram-card/pages/my-collection-series-detail/my-collection-series-detail.js')
  const publicJs = read('miniprogram-card/pages/public-cards/public-cards.js')
  const publicDetailJs = read('miniprogram-card/pages/public-card-detail/public-card-detail.js')
  const wikiJs = read('miniprogram-card/pages/card-wiki/card-wiki.js')

  assert(indexJs.includes("scheduleInputCommit(this, 'search', searchText"), 'home anomaly search should debounce filtering')
  assert(indexJs.includes("scheduleInputCommit(this, 'seriesSearch', seriesSearch"), 'home collection search should debounce filtering')
  assert(!indexJs.includes('searchLoading') && !indexJs.includes('seriesSearchLoading'), 'home search should not keep typing loading state')
  assert(!indexWxml.includes('搜索中'), 'home search should not render typing loading text')
  assert(seriesJs.includes("this._scheduleMetaSuggestFilter(\n      'cardSearch'"), 'collection detail search should debounce filtering')
  assert(!seriesJs.includes('cardSearchLoading') && !seriesWxml.includes('cardSearchLoading'), 'collection detail search should not keep typing loading state')
  assert(myJs.includes('scheduleKeywordFilter(keyword)') && myJs.includes('String(this.data.keyword || \'\') !== String(keyword || \'\')'), 'my collection keyword search should debounce filtering')
  assert(myDetailJs.includes('scheduleKeywordFilter(keyword)') && myDetailJs.includes('String(this.data.keyword || \'\') !== String(keyword || \'\')'), 'series-group keyword search should debounce filtering')
  assert(publicJs.includes('scheduleSearch(searchKeyword)') && publicDetailJs.includes('scheduleSearch(searchKeyword)'), 'public shelf searches should debounce filtering')
  assert(wikiJs.includes('scheduleSearch(searchText)'), 'card wiki search should debounce filtering')
  ;[
    'addSubsetPickerSearch',
    'appendPickerSearch',
    'subsetPickerSearch',
    'subsetPickerCardSearch',
    'batchMigrateSearch',
    'batchMigrateNewCardPickerSearch',
    'moveImageSearch',
    'moveNewCardPickerSearch'
  ].forEach(key => {
    assert(seriesJs.includes(`'${key}'`), `${key} should use debounced picker search`)
  })
})

test('series edit image owned flow can capture purchase and grading details', () => {
  const seriesJs = read('miniprogram-card/pages/collection-series/collection-series.js')
  const seriesWxml = read('miniprogram-card/pages/collection-series/collection-series.wxml')
  const editModalStart = seriesWxml.indexOf('wx:if="{{showEditImageModal}}"')
  const editHoldStart = seriesWxml.indexOf('<text class="modal-section-title">持有记录</text>', editModalStart)
  const editRatingStart = seriesWxml.indexOf('<text class="modal-section-title">评级信息</text>', editHoldStart)
  const editNoteStart = seriesWxml.indexOf('<text class="modal-section-title">备注</text>', editRatingStart)
  const editHoldBlock = seriesWxml.slice(editHoldStart, editRatingStart)
  const editRatingBlock = seriesWxml.slice(editRatingStart, editNoteStart)
  const editNoteBlock = seriesWxml.slice(editNoteStart, seriesWxml.indexOf('</scroll-view>', editNoteStart))
  assert(editModalStart >= 0 && editHoldStart > editModalStart && editRatingStart > editHoldStart && editNoteStart > editRatingStart, 'edit image owned fields should be split into hold, grading, and note sections')
  assert(editHoldBlock.includes('买入成本'), 'edit image owned form should show purchase cost')
  assert(seriesWxml.includes('value="{{editImageCardKind}}" data-field="cardKind" bindfocus="onEditMetaSuggestFocus"'), 'edit image form should capture searchable card version in the card info section')
  assert(!seriesWxml.includes('value="{{editImageHoldForm.cardVariant}}" data-field="cardVariant"'), 'edit image form should not expose a separate legacy card variant field')
  assert(editHoldBlock.includes('value="{{editImageHoldForm.quantity}}" data-field="quantity"'), 'edit image owned form should capture quantity')
  assert(editHoldBlock.includes('公开持有'), 'edit image owned form should include the public holder toggle after purchase fields')
  assert(editRatingBlock.includes('评级公司'), 'edit image owned form should show grading company')
  assert(editRatingBlock.includes('评级分数'), 'edit image owned form should show grade selector')
  assert(editNoteBlock.includes('value="{{editImageHoldForm.note}}" data-field="note"'), 'edit image owned form should keep note in the note section')
  assert(seriesJs.includes('editImageInitiallyOwned'), 'edit image modal should remember the original owned state')
  assert(seriesJs.includes('onEditImageHoldLedgerInput'), 'edit image owned fields should update ledger form state')
  assert(seriesJs.includes('onEditImageHoldGradingCompanyChange'), 'edit image owned fields should support grading company selection')
  assert(seriesJs.includes('_createLedgerForEditedOwnedImage'), 'edit image owned save should create a private collection ledger entry')
  assert(seriesJs.includes('await this._createLedgerForEditedOwnedImage'), 'saveEditImage should create ledger after saving the image owned state')
})

test('long-press hold ledger preserves image card version without a legacy variant input', () => {
  const seriesJs = read('miniprogram-card/pages/collection-series/collection-series.js')
  const seriesWxml = read('miniprogram-card/pages/collection-series/collection-series.wxml')
  const holdModal = seriesWxml.slice(seriesWxml.indexOf('<view class="modal-mask" wx:if="{{showHoldLedgerModal}}"'))
  assert(!holdModal.includes('data-field="cardVariant"'), 'long-press hold modal should not expose a separate legacy card variant input')
  assert(seriesWxml.includes('checked="{{holdLedgerForm.publicVisible}}"'), 'long-press hold modal should default to a public holder toggle')
  assert(seriesJs.includes("cardVariant: payload.cardVariant || ''"), 'hold modal should initialize card variant from the selected image')
  assert(seriesJs.includes("cardVariant: ''"), 'hold ledger payload should keep legacy card variant empty for new records')
})

test('collection detail my-owned progress filters the current page in place', () => {
  const seriesJs = read('miniprogram-card/pages/collection-series/collection-series.js')
  const seriesWxml = read('miniprogram-card/pages/collection-series/collection-series.wxml')
  const seriesWxss = read('miniprogram-card/pages/collection-series/collection-series.wxss')
  assert(seriesWxml.includes('bindtap="toggleMyOwnedOnly"'), 'my owned progress panel should toggle the current-page owned filter')
  assert(!seriesWxml.includes('只看持有'), 'my owned progress panel should not render a separate owned-only text button')
  assert(!seriesWxml.includes('显示全部'), 'my owned progress panel should not render a separate show-all text button')
  assert(seriesWxml.includes('myOwnedOnly && visibleChecklistItemCount === 0'), 'owned-only checklist view should show an empty state when nothing is visible')
  assert(seriesWxml.includes("{{cardViewFilter === 'qualityIssues' ? '暂无资料问题图片' : (myOwnedOnly ? '暂无我的持有图片' : '还没有图片')}}"), 'owned-only free-image view should show an owned-specific empty state')
  assert(seriesWxss.includes('.my-owned-progress:active'), 'clickable my owned progress should provide touch feedback')
  assert(seriesWxss.includes('.my-owned-progress.active'), 'owned-only progress panel should have an active state')
  assert(seriesWxss.includes('.my-owned-progress.active .my-owned-progress-title'), 'owned-only progress title should indicate the active green state without a text button')
  assert(seriesJs.includes('toggleMyOwnedOnly()'), 'collection detail should implement the in-page owned filter toggle')
  assert(seriesJs.includes('_getFreeImagesForDisplay'), 'free image mode should page over the filtered owned image list')
  assert(seriesJs.includes('const myOwnedOnly = !!this.data.myOwnedOnly'), 'checklist groups should read the owned-only filter state')
  assert(seriesJs.includes('const displayImages = myOwnedOnly ? this._filterMyOwnedImages(sourceImages) : sourceImages'), 'checklist cards should display only owned images when the filter is active')
  assert(!seriesJs.includes('openMyOwnedSeriesDetail()'), 'my owned progress should not navigate away from the collection detail page')
})

test('collection detail exposes series progress and public data quality status', () => {
  const seriesJs = read('miniprogram-card/pages/collection-series/collection-series.js')
  const seriesWxml = read('miniprogram-card/pages/collection-series/collection-series.wxml')
  const seriesWxss = read('miniprogram-card/pages/collection-series/collection-series.wxss')
  assert(seriesWxml.includes('图鉴进度'), 'collection detail should render the public series progress panel')
  assert(seriesWxml.includes('seriesProgressPercent'), 'series progress panel should render a progress bar')
  assert(seriesWxml.includes('data-filter="missing"'), 'series progress panel should expose the missing-card filter')
  assert(seriesWxml.includes('dataQuality.totalIssues'), 'series progress panel should surface data quality issue count')
  assert(seriesWxml.includes('dataQuality.completenessText'), 'data quality panel should render completeness')
  assert(seriesWxml.includes('data-quality-{{dataQuality.state}}'), 'data quality panel should expose review/confirmed state styling')
  assert(seriesJs.includes('showSeriesProgress'), 'series progress display state should be computed from checklist stats')
  assert(seriesJs.includes('seriesProgressText'), 'series progress display should expose a readable ratio')
  assert(seriesJs.includes('_buildDataQuality(checklist, freeImages = [], seriesContext = this.data.series || {})'), 'data quality should use the current series context')
  assert(seriesJs.includes("statusLabel = '已确认'"), 'data quality should expose confirmed status')
  assert(seriesJs.includes("statusLabel = '待审核'"), 'data quality should expose review status')
  assert(seriesJs.includes('missingPlayers'), 'data quality should detect missing player metadata')
  assert(seriesJs.includes('missingCardKinds'), 'data quality should detect missing card-kind metadata')
  assert(seriesJs.includes('missingSources'), 'data quality should detect missing source metadata')
  assert(seriesJs.includes('missingBackImages'), 'data quality should surface back-image improvement opportunities')
  assert(seriesWxss.includes('.series-progress-bar'), 'series progress should have a visible bar style')
  assert(seriesWxss.includes('.data-quality-score'), 'data quality completeness should have a compact score style')
})

test('public collection data quality uses suggestions, review and version records', () => {
  const seriesJs = read('miniprogram-card/pages/collection-series/collection-series.js')
  const seriesWxml = read('miniprogram-card/pages/collection-series/collection-series.wxml')
  const seriesWxss = read('miniprogram-card/pages/collection-series/collection-series.wxss')
  const detailJs = read('miniprogram-card/pages/collection-card-detail/collection-card-detail.js')
  const detailWxml = read('miniprogram-card/pages/collection-card-detail/collection-card-detail.wxml')
  const detailWxss = read('miniprogram-card/pages/collection-card-detail/collection-card-detail.wxss')
  const seriesReviewJs = read('miniprogram-card/pages/series-review/series-review.js')
  const seriesReviewWxml = read('miniprogram-card/pages/series-review/series-review.wxml')
  const seriesReviewWxss = read('miniprogram-card/pages/series-review/series-review.wxss')
  const adminJs = read('miniprogram-card/pages/admin/admin.js')
  const adminWxml = read('miniprogram-card/pages/admin/admin.wxml')
  const appJson = read('miniprogram-card/app.json')
  const adminOps = read('miniprogram-card/cloudfunctions/adminOps/index.js')
  const collectionData = read('miniprogram-card/utils/collectionData.js')
  const cloudData = read('miniprogram-card/utils/cloudData.js')
  const cloudJs = read('miniprogram-card/cloudfunctions/seriesOps/index.js')
  const rules = read('miniprogram-card/PRODUCT_RULES.md')

  assert(!seriesWxml.includes('openImageQualitySuggestion'), 'collection grid should not put data-quality buttons on top of images')
  assert(!seriesWxss.includes('.image-quality-btn'), 'collection grid should not keep the old image overlay style')
  assert(detailWxml.includes('bindtap="openQualitySuggestionModal"'), 'card detail should expose the data-quality contribution entry')
  assert(detailWxml.includes('wx:if="{{showQualitySuggestionModal}}"'), 'normal users need a correction suggestion modal on card detail')
  assert(detailWxml.includes('提交补齐申请'), 'suggestion modal should submit for review instead of directly saving')
  assert(detailWxml.includes('补背面图'), 'missing or poor image data should expose a back-image supplement entry on card detail')
  assert(detailWxml.includes('class="modal-panel quality-modal"'), 'card detail suggestion modal should reuse the my-collection modal shell')
  assert(detailWxml.includes('class="modal-body quality-scroll"'), 'card detail suggestion modal should reuse the my-collection scroll body')
  assert(detailWxml.includes('class="image-grid"'), 'card detail suggestion modal should reuse the my-collection front/back image selector')
  assert(detailWxml.includes('class="suggest-wrapper"'), 'card detail suggestion modal should reuse shared suggestion input wrappers')
  assert(detailWxml.includes('bindfocus="onQualityMetaSuggestFocus"'), 'card detail suggestion modal fields should load suggestions on focus')
  assert(detailWxml.includes('catchtap="onQualitySuggestSelect"'), 'card detail suggestion modal should support selecting suggestion rows')
  assert(!detailWxml.includes('bindblur="closeQualitySuggest"'), 'card detail suggestion dropdowns should not disappear when the modal scrolls')
  assertInOrder(detailWxml, ['图片', '补背面图', '卡片信息', '球员', '多人卡', '球员中文名', '年份', '卡片编号', '限编', '厂商/品牌', '系列', '卡片版本', '来源信息', '来源说明', '备注'], 'card detail suggestion modal should follow shared card form grouping and field order')
  assert(detailWxml.includes('qualitySuggestionForm.productNumber'), 'card detail suggestion modal should split product card number from serial number')
  assert(detailWxml.includes('qualitySuggestionForm.serialNumber'), 'card detail suggestion modal should split serial number from product card number')
  assert(detailWxml.includes('bindtap="setQualitySerialNumberQuick"'), 'card detail suggestion modal should offer an unnumbered quick fill for serial number')
  assert(detailWxml.includes('data-value="无编"'), 'card detail suggestion modal should use the shared unnumbered value')
  assert(!detailWxml.includes('qualitySuggestionForm.cardName'), 'card detail suggestion modal should not expose a separate card name field')
  assert(seriesWxml.includes('wx:if="{{canManageSeries && showSeriesProgress}}"'), 'series progress target stats should be manager-only')
  assert(seriesWxml.includes('wx:if="{{canManageSeries && !isDerivedThemeSeries && dataQuality && dataQuality.items && dataQuality.items.length}}"'), 'series data quality panel should be manager-only')
  assert(detailWxss.includes('.quality-entry'), 'card detail quality entry needs stable styling')
  assert(detailWxss.includes('.modal-panel { position: absolute; left: 0; right: 0; bottom: 0; max-height: 90vh;'), 'card detail suggestion modal should use the shared fixed header/body/footer shell')
  assert(detailWxss.includes('.form-input { width: 100%; height: 78rpx;'), 'card detail suggestion modal should use the shared gray input style')
  assert(detailWxss.includes('.number-input-row') && detailWxss.includes('.quick-btn'), 'card detail suggestion modal should reuse the shared unnumbered input styling')
  assert(detailJs.includes('setQualitySerialNumberQuick'), 'card detail suggestion logic should set unnumbered serial number')
  assert(detailWxml.includes('source-picker-blue'), 'card detail suggestion modal should render source picker values in the shared blue source style')
  assert(detailWxml.includes('source-input-value'), 'card detail suggestion modal should render source notes in the shared blue source style')
  assert(detailWxml.includes("wx:if=\"{{qualitySuggestionForm.sourceType === 'auction' || qualitySuggestionForm.sourceType === 'web_ref' || qualitySuggestionForm.sourceType === 'grading_db' || qualitySuggestionForm.sourceType === 'other'}}\""), 'card detail suggestion modal should hide source note for plain user uploads')
  assert(detailWxss.includes('.source-picker-blue'), 'card detail suggestion modal should define the shared blue source style')
  assert(seriesWxml.includes('source-value-text'), 'collection upload/edit source pickers should render values in the shared blue source style')
  assert(seriesWxml.includes('source-input-value'), 'collection upload/edit source notes should render values in the shared blue source style')
  assert(seriesWxss.includes('.source-value-text'), 'collection upload/edit source fields should define the shared blue source style')
  assert(seriesWxss.includes('.upload-form-scroll .source-input-value'), 'collection upload source note inputs should override the shared form input color')
  assert(detailWxss.includes('.image-picker { position: relative; height: 300rpx;'), 'card detail suggestion modal should use shared front/back image block styling')
  assert(detailWxss.includes('.suggest-list'), 'card detail suggestion modal should style suggestion dropdowns')
  assert(detailWxss.includes('.save-btn.disabled'), 'card detail suggestion modal should keep shared disabled submit state')
  assert(appJson.includes('"root": "pages/series-review"'), 'review center should be registered as a subpackage page')
  assert(seriesWxml.includes('bindtap="goReviewCenter"'), 'series managers need a unified review center entry')
  assert(!seriesWxml.includes('bindtap="openQualityReviewModal"'), 'quality review should not keep a separate visible entry')
  assert(!seriesWxml.includes('bindtap="openImageReviewModal"'), 'image review should not keep a separate visible entry')
  assert(seriesReviewWxml.includes('图片审核'), 'review center should include image reviews')
  assert(seriesReviewWxml.includes('资料补齐'), 'review center should include quality suggestions')
  assert(seriesReviewWxml.includes('data-decision="approved"'), 'review center should support approving reviews')
  assert(seriesReviewWxml.includes('data-decision="rejected"'), 'review center should support rejecting reviews')
  assert(seriesReviewWxml.includes('需管理员确认'), 'high-risk suggestions should be visibly marked')
  assert(seriesReviewWxss.includes('.review-card'), 'review center items should be styled')

  assert(seriesJs.includes("const QUALITY_HIGH_RISK_FIELDS = ['productNumber', 'serialNumber', 'cardSeries', 'cardKind']"), 'client should identify high-risk public catalog fields')
  assert(seriesJs.includes('_buildImageQuality(img = {}, item = null, seriesContext = this.data.series || {})'), 'page should compute per-image completeness')
  assert(detailJs.includes('submitQualitySuggestion()'), 'card detail should submit corrections as suggestions')
  assert(detailJs.includes('qualitySuggestionDirectApply'), 'admin card detail edits should use a direct-apply branch')
  assert(detailJs.includes('applyCardQualityPatch'), 'admin card detail edits should save directly through the data layer')
  assert(detailJs.includes('targetSnapshot'), 'card detail should save target snapshots so admin review can display the corrected card')
  assert(detailJs.includes("wx.showToast({ title: '已提交', icon: 'success' })"), 'card detail should use a short success toast that does not wrap vertically')
  assert(detailJs.includes("wx.showToast({ title: '已保存', icon: 'success' })"), 'admin direct edits should use a saved toast')
  assert(!detailJs.includes('已提交待审核'), 'card detail should not use long toast text that wraps vertically')
  assert(detailWxml.includes('保存修改'), 'admin direct edit modal should use save wording instead of review submission wording')
  assert(adminJs.includes('function buildQualityCorrectionTitle'), 'admin correction list should build readable titles for public card quality suggestions')
  assert(adminJs.includes('function buildUniqueTitleParts') && adminJs.includes('normalizeQualityTitle(item.targetTitle)'), 'admin correction titles should dedupe repeated player names')
  assert(adminJs.includes('function buildQualityCorrectionCardUrl'), 'admin correction actions should route quality suggestions back to collection card detail')
  assertInOrder(adminJs, [
    "if (target.sourceType === 'user_card_item' && (target.userItemId || item.userItemId))",
    "params.push(`userItemId=${target.userItemId || item.userItemId}`)",
    "if (fallbackImageUrl) params.push(`url=${encodeURIComponent(fallbackImageUrl)}`)"
  ], 'admin correction route should use user card item id before image url fallback')
  assert(adminJs.includes('const firstImageUrl = Array.isArray(item.imageUrls) ? item.imageUrls.find(Boolean) : \'\''), 'admin correction route should recover old quality suggestions from saved image urls')
  assert(adminJs.includes('snapshot.player || patch.playerCN || patch.player'), 'admin correction route should include patched metadata when it must fall back to image url')
  assert(adminJs.includes("wx.showToast({ title: '未找到', icon: 'none' })"), 'admin correction flow should use a short not-found toast')
  assert(!adminJs.includes('关联卡片不存在'), 'admin correction flow should not use long toast text that wraps vertically')
  assert(adminWxml.includes('item.displayTitle || (item.cardId || item.cardPlayer'), 'admin correction list should not fall back to empty card id titles')
  assert(adminWxml.includes('correction-card-link') && adminWxml.includes('wx:if="{{correctionDetail}}"'), 'admin correction detail should always expose a card detail link')
  assert(adminWxml.includes('correctionDetail.changeLines'), 'admin correction detail should show changed fields from quality suggestions')
  assert(adminWxml.includes("correctionDetail.type === 'collection_card_quality'") && adminWxml.includes('bindtap="approveCorrection">通过'), 'admin quality correction detail should approve directly instead of jumping to card detail')
  assert(adminJs.includes('async approveCorrection()') && adminJs.includes('adminApproveQualityCorrection(detail.id)'), 'admin quality correction approval should call the admin merge action')
  assert(cloudJs.includes('function buildUniqueProfileTitleParts') && cloudJs.includes('return buildUniqueProfileTitleParts(['), 'profile approval records should not store duplicate title parts')
  assert(cloudData.includes('adminApproveQualityCorrection(correctionId)'), 'data layer should expose quality correction approval')
  assert(adminOps.includes('async function approveQualityCorrection'), 'admin cloud function should approve quality corrections server-side')
  assert(adminOps.includes('buildUserCardItemQualityPatch'), 'admin cloud function should map quality correction fields onto user card items when possible')
  assert(adminOps.includes("appliedMode = target.publicItemId ? 'public_card_item' : 'user_card_item'"), 'admin cloud function should record whether a public or user card item was patched')
  assert(cloudJs.includes('productNumber: item.productNumber ||') && cloudJs.includes('serialNumber: item.serialNumber ||'), 'public card detail should receive split card number fields after approval')
  assert(detailJs.includes('loadSuggestData()'), 'card detail suggestion modal should load shared suggestion data')
  assert(detailJs.includes('filterQualitySuggestions(field, keyword)'), 'card detail suggestion modal should filter player/year/brand/series suggestions')
  assert(detailJs.includes('onQualitySuggestSelect(e)'), 'card detail suggestion modal should apply selected suggestion values')
  assert(detailJs.includes("update['qualitySuggestionForm.playerCN']"), 'selecting a player suggestion should fill the Chinese player name')
  assert(detailJs.includes('toggleQualitySuggestionMultiPlayer'), 'card detail suggestion modal should reuse multi-player selection behavior')
  assert(detailJs.includes("update['qualitySuggestionForm.sourceNote'] = ''"), 'card detail suggestion modal should clear source note when source type changes')
  assert(detailJs.includes('quality_back_'), 'back-image supplements should upload through the suggestion flow')
  assert(detailJs.includes('submitSeriesQualitySuggestion'), 'card detail should submit suggestions through the data layer')
  assert(seriesJs.includes('refreshQualityReviewCount()'), 'manager review count should refresh from pending suggestions')
  assert(seriesJs.includes('goReviewCenter()'), 'series detail should navigate to the unified review center')
  assert(seriesReviewJs.includes('listSeriesQualitySuggestions'), 'review center should load pending quality suggestions')
  assert(seriesReviewJs.includes('reviewSeriesQualitySuggestion'), 'review center should review suggestions through the data layer')
  assert(seriesReviewJs.includes('reviewSeriesImage'), 'review center should review pending images through the data layer')
  assert(seriesReviewJs.includes('canReviewSeriesImages'), 'review center should reuse image reviewer permissions')
  assert(seriesReviewJs.includes('canManageSeriesContent'), 'review center should reuse series manager permissions')
  assert(seriesReviewJs.includes('高风险字段需管理员确认'), 'client should block non-admin high-risk merges')
  assert(collectionData.includes('submitSeriesQualitySuggestion'), 'data layer should expose suggestion submission')
  assert(collectionData.includes('applyCardQualityPatch'), 'data layer should expose admin direct card-quality saving')
  assert(collectionData.includes('listSeriesQualitySuggestions'), 'data layer should expose manager review loading')
  assert(collectionData.includes('reviewSeriesQualitySuggestion'), 'data layer should expose suggestion review')

  assert(cloudJs.includes("db.collection('series_quality_suggestions')"), 'cloud function should persist public catalog quality suggestions')
  assert(cloudJs.includes('ensureSeriesQualitySuggestionCollection'), 'cloud function should tolerate missing quality suggestion collection')
  assert(cloudJs.includes('isCollectionNotFoundError'), 'cloud function should detect collection-not-exist deployment states')
  assert(cloudJs.includes('SERIES_QUALITY_SUGGESTION_FALLBACK_TYPE'), 'cloud function should have a fallback marker for environments that cannot create the collection')
  assert(cloudJs.includes('feedbacksCol.add({ data: buildSeriesQualityFallbackRecord(record) })'), 'submitting suggestions should fallback to an existing collection when needed')
  assert(cloudJs.includes('.where(fallbackCondition)'), 'review queues should read fallback suggestion records')
  assert(cloudJs.includes('submitSeriesQualitySuggestion'), 'cloud function should support user suggestion submission')
  assert(cloudJs.includes('async function applyCardQualityPatch'), 'cloud function should support admin direct card-quality saving')
  assert(cloudJs.includes("action === 'applyCardQualityPatch'"), 'cloud function should route admin direct card-quality saving')
  assert(cloudJs.includes('if (isAdminOpenid(openid))') && cloudJs.includes("directApplied: true"), 'admin submitted series quality data should apply directly instead of creating a pending suggestion')
  assert(cloudJs.includes('const applyResult = await applySeriesQualitySuggestionPatch') && cloudJs.includes('{ directApply: true }'), 'admin direct series quality submission should reuse the same merge path and edit history')
  assert(cloudJs.includes('listSeriesQualitySuggestions'), 'cloud function should support manager review queues')
  assert(cloudJs.includes('reviewSeriesQualitySuggestion'), 'cloud function should support review decisions')
  assert(cloudJs.includes('SERIES_QUALITY_HIGH_RISK_FIELDS'), 'cloud function should define high-risk fields')
  assert(cloudJs.includes('high risk suggestion requires admin'), 'cloud function should enforce admin confirmation for high-risk merges')
  assert(cloudJs.includes('beforePatch'), 'suggestions should keep original field snapshots')
  assert(cloudJs.includes('appliedPatch'), 'merged suggestions should keep applied field snapshots')
  assert(cloudJs.includes("'quality_suggestion'"), 'merged suggestions should append edit history version records')
  assert(cloudJs.includes("type: directApply ? 'admin_quality_edit' : 'quality_suggestion'"), 'admin direct edits should append direct-edit history records')
  assert(cloudJs.includes('editHistory: buildSeriesQualityEditHistory'), 'merge should write version records into the series')
  assert(cloudJs.includes('_quality'), 'cloud image normalization should strip transient client quality data')

  assert(rules.includes('公共图鉴资料质量'), 'product rules should document public catalog data quality')
  assert(rules.includes('普通用户只能提交资料补齐建议'), 'product rules should keep normal users out of direct public catalog writes')
  assert(rules.includes('小程序管理员修改卡片资料时不生成审批'), 'product rules should document admin direct card-quality edits')
  assert(rules.includes('高风险字段需要小程序管理员确认'), 'product rules should document high-risk admin confirmation')
  assert(rules.includes('保留提交记录、原字段快照、合并字段和审核人'), 'product rules should document version record requirements')
})

test('long validation toasts are globally converted to standard modals', () => {
  const appJs = read('miniprogram-card/app.js')
  const rules = read('miniprogram-card/PRODUCT_RULES.md')

  assert(appJs.includes('function installToastGuard()'), 'app should install a global toast guard')
  assert(appJs.includes('function shouldUseModalForToast(options = {})'), 'app should centralize long toast detection')
  assert(appJs.includes("options.icon !== 'none'"), 'toast guard should only redirect non-success validation toasts')
  assert(appJs.includes('wx.showModal({'), 'long validation prompts should use modal instead of black toast')
  assert(appJs.indexOf('installToastGuard()') < appJs.indexOf('App({'), 'toast guard must be installed before pages run')
  assert(rules.includes('`wx.showToast` 只用于短成功反馈或不超过 6 个中文字符的短提示'), 'product rules should document toast length constraints')
  assert(rules.includes("全局 toast 保护需要拦截 `icon: 'none'` 的长文案并转为 `wx.showModal`"), 'product rules should require the global modal fallback')
})

test('card info form fields keep the shared order across collection and anomaly forms', () => {
  const appWxss = read('miniprogram-card/app.wxss')
  const seriesWxml = read('miniprogram-card/pages/collection-series/collection-series.wxml')
  const myWxml = read('miniprogram-card/pages/my-collection/my-collection.wxml')
  const myWxss = read('miniprogram-card/pages/my-collection/my-collection.wxss')
  const myDetailWxml = read('miniprogram-card/pages/my-collection-series-detail/my-collection-series-detail.wxml')
  const myDetailWxss = read('miniprogram-card/pages/my-collection-series-detail/my-collection-series-detail.wxss')
  const detailWxml = read('miniprogram-card/pages/detail/detail.wxml')
  const feedbackWxml = read('miniprogram-card/pages/feedback/feedback.wxml')
  const adminWxml = read('miniprogram-card/pages/admin/admin.wxml')
  const rules = read('miniprogram-card/PRODUCT_RULES.md')

  assertInOrder(seriesWxml.slice(seriesWxml.indexOf('<view wx:if="{{showUploadModal}}"')), [
    'modal-section-title">图片',
    'modal-section-title">卡片信息',
    'form-label">球员',
    'form-label">多人卡',
    'form-label">年份',
    'form-label">卡片编号',
    'form-label">限编',
    'form-label">厂商/品牌',
    'form-label">系列',
    'form-label">卡片版本',
    'form-label">特色',
    'modal-section-title">上传设置',
    'modal-section-title">来源信息',
    'modal-section-title">持有记录',
    'form-label-modal">买入成本',
    'form-label-modal">品相',
    'form-label-modal">数量',
    'form-label-modal">购买日期',
    'form-label">公开持有',
    'modal-section-title">评级信息',
    'form-label-modal">评级公司',
    'form-label-modal">评级分数',
    'form-label-modal">签字评级',
    'form-label-modal">评级编号',
    'modal-section-title">备注'
  ], 'series upload modal should follow the shared form order')

  assert(appWxss.includes('.form-image-label'), 'front/back form image labels should use a shared global style')
  assert(myWxml.includes('class="image-label form-image-label"'), 'my collection form image labels should use the shared form label style')
  assert(myDetailWxml.includes('class="image-label form-image-label"'), 'series-group detail form image labels should use the shared form label style')
  assert(!myWxss.includes('.image-label {'), 'my collection should not duplicate form image label styling')
  assert(!myDetailWxss.includes('.image-label {'), 'series-group detail should not duplicate form image label styling')
  assert(rules.includes('共享 `form-image-label` 样式'), 'product rules should document shared front/back form image labels')

  assertInOrder(myWxml.slice(myWxml.indexOf('<view wx:if="{{showItemModal}}"')), [
    'modal-section-title">图片',
    'modal-section-title">卡片信息',
    'form-label">球员',
    'form-label">多人卡',
    'form-label">年份',
    'form-label">卡片编号',
    'form-label">限编',
    'form-label">厂商/品牌',
    'form-label">系列',
    'form-label">卡片版本',
    'form-label">切割说明',
    'form-label">特色',
    'modal-section-title">持有记录',
    'form-label">买入成本',
    'form-label">品相',
    'form-label">数量',
    'form-label">购买日期',
    'form-label">公开持有',
    'modal-section-title">评级信息',
    'form-label">评级公司',
    'form-label">评级分数',
    'form-label">签字评级',
    'form-label">评级编号',
    'modal-section-title">卖出信息',
    'form-label">卖出数量',
    'form-label">卖出到手',
    'form-label">卖出日期',
    'modal-section-title">备注'
  ], 'my collection modal should follow the shared form order')

  assertInOrder(myDetailWxml.slice(myDetailWxml.indexOf('<view wx:if="{{showItemModal}}"')), [
    'modal-section-title">图片',
    'modal-section-title">卡片信息',
    'form-label">球员',
    'form-label">多人卡',
    'form-label">年份',
    'form-label">卡片编号',
    'form-label">限编',
    'form-label">厂商/品牌',
    'form-label">系列',
    'form-label">卡片版本',
    'form-label">切割说明',
    'form-label">特色',
    'modal-section-title">持有记录',
    'form-label">买入成本',
    'form-label">品相',
    'form-label">数量',
    'form-label">购买日期',
    'form-label">公开持有',
    'modal-section-title">评级信息',
    'form-label">评级公司',
    'form-label">评级分数',
    'form-label">签字评级',
    'form-label">评级编号',
    'modal-section-title">卖出信息',
    'form-label">卖出数量',
    'form-label">卖出到手',
    'form-label">卖出日期',
    'modal-section-title">备注'
  ], 'my collection series detail modal should follow the shared form order')

  assert(!myWxml.includes('form-label">卡片名称'), 'my collection modal should not expose legacy card name label')
  assert(!myWxml.includes('form-label">卡片种类'), 'my collection modal should not expose legacy card variant label')
  assert(myWxml.includes('data-field="cardName" bindfocus="onSuggestFocus"'), 'my collection card version input should use shared suggestions')
  assert(!myDetailWxml.includes('form-label">卡片名称'), 'series-group detail modal should not expose legacy card name label')
  assert(!myDetailWxml.includes('form-label">卡片种类'), 'series-group detail modal should not expose legacy card variant label')
  assert(myDetailWxml.includes('data-field="cardName" bindfocus="onSuggestFocus"'), 'series-group detail card version input should use shared suggestions')

  assertInOrder(detailWxml.slice(detailWxml.indexOf('<view class="modal-mask" wx:if="{{showEditModal}}"')), [
    'modal-section-title">卡片信息',
    'data-field="player"',
    'data-field="playerCN"',
    'data-field="year"',
    'data-field="productNumber"',
    'data-field="serialNumber"',
    'data-field="brand"',
    'data-field="series"',
    'data-field="cardKind"',
    "editForm.category === 'backup' ? '备份资料' : '异常结论'",
    'modal-section-title">图片资料',
    'modal-section-title">来源信息'
  ], 'detail admin edit modal should follow the shared card info order')

  assertInOrder(adminWxml.slice(adminWxml.indexOf('<view class="modal-mask" wx:if="{{showApproveModal}}"')), [
    'modal-section-title">卡片信息',
    'data-field="player"',
    'data-field="playerCN"',
    'data-field="year"',
    'data-field="productNumber"',
    'data-field="serialNumber"',
    'data-field="brand"',
    'data-field="series"',
    'data-field="cardKind"',
    "approveForm.category === 'backup' ? '备份资料' : '异常结论'",
    'modal-section-title">图片资料',
    'modal-section-title">来源信息'
  ], 'admin approve modal should follow the shared card info order')

  assertInOrder(adminWxml.slice(adminWxml.indexOf('<view class="modal-mask" wx:if="{{showAddCardModal}}"')), [
    'modal-section-title">卡片信息',
    'data-field="player"',
    'data-field="playerCN"',
    'data-field="year"',
    'data-field="productNumber"',
    'data-field="serialNumber"',
    'data-field="brand"',
    'data-field="series"',
    'data-field="cardKind"',
    "addCardForm.category === 'backup' ? '备份资料' : '异常结论'",
    'modal-section-title">图片资料',
    'modal-section-title">来源信息'
  ], 'admin add-card modal should follow the shared card info order')

  assertInOrder(adminWxml.slice(adminWxml.indexOf('<view class="modal-mask" wx:if="{{showCorrectionEdit}}"')), [
    'modal-section-title">卡片信息',
    'data-field="player"',
    'data-field="playerCN"',
    'data-field="year"',
    'data-field="productNumber"',
    'data-field="serialNumber"',
    'data-field="brand"',
    'data-field="series"',
    'data-field="cardKind"',
    "correctionEditForm.category === 'backup' ? '备份资料' : '异常结论'",
    'modal-section-title">图片资料',
    'modal-section-title">来源信息'
  ], 'admin correction edit modal should follow the shared card info order')

  assertInOrder(feedbackWxml.slice(feedbackWxml.indexOf('section-title">卡片信息')), [
    'data-field="player"',
    'data-field="year"',
    'data-field="productNumber"',
    'data-field="serialNumber"',
    'data-field="brand"',
    'data-field="series"',
    'data-field="cardKind"',
    'data-field="notes"'
  ], 'feedback anomaly form should follow the shared standard card fields')
  assert(!feedbackWxml.includes('data-field="number"'), 'feedback anomaly form should not submit legacy number')
  assert(!adminWxml.includes('data-field="number"'), 'admin anomaly forms should not submit legacy number')
  assert(!detailWxml.includes('data-field="number"'), 'detail admin edit modal should not submit legacy number')
})

test('grading can be cleared and back image removal uses corner icons', () => {
  const seriesJs = read('miniprogram-card/pages/collection-series/collection-series.js')
  const seriesWxml = read('miniprogram-card/pages/collection-series/collection-series.wxml')
  const seriesWxss = read('miniprogram-card/pages/collection-series/collection-series.wxss')
  const myJs = read('miniprogram-card/pages/my-collection/my-collection.js')
  const myWxml = read('miniprogram-card/pages/my-collection/my-collection.wxml')
  const myWxss = read('miniprogram-card/pages/my-collection/my-collection.wxss')
  assert(seriesJs.includes("const HOLD_GRADING_OPTIONS = ['未评级'"), 'holding flow should allow clearing grading company')
  assert(seriesJs.includes('HOLD_GRADE_OPTIONS'), 'holding flow should provide grade selector options')
  assert(seriesJs.includes('AUTHENTIC / 鉴真'), 'holding flow should support authentic-only grade')
  assert(myJs.includes("const GRADING_OPTIONS = ['未评级'"), 'my collection should allow clearing grading company')
  assert(myJs.includes('GRADE_OPTIONS'), 'my collection should provide grade selector options')
  assert(myWxml.includes('bindchange="onGradeChange"'), 'my collection grade should use a picker')
  assert(seriesWxml.includes('upload-back-remove-icon'), 'series upload/edit should remove back image from a corner icon')
  assert(myWxml.includes('image-remove-corner'), 'my collection should remove back image from a corner icon')
  assert(seriesWxss.includes('.upload-back-remove-icon'), 'series corner remove icon should be styled')
  assert(myWxss.includes('.image-remove-corner'), 'my collection corner remove icon should be styled')
  assert(!seriesWxml.includes('>移除背面</text>'), 'series upload/edit should not show remove back as text button')
  assert(!myWxml.includes('移除背面'), 'my collection should not show remove back as a text button')
})

test('fixed slots center uploaded images without empty metadata below', () => {
  const wxml = read('miniprogram-card/pages/collection-series/collection-series.wxml')
  const wxss = read('miniprogram-card/pages/collection-series/collection-series.wxss')
  assert(wxml.includes('!card._gridImage'), 'fixed grid metadata should only render for empty slots')
  assert(wxss.includes('.fixed-grid-image { position: absolute; left: 0; top: 0; width: 100%; height: 100%;'), 'fixed grid images should fill the fixed-ratio image box')
  assert(wxss.includes('.fixed-grid-card.has-image'), 'fixed grid image cards should avoid blank bottom spacing')
})

test('collection series shows personal owned progress only when owned cards exist', () => {
  const js = read('miniprogram-card/pages/collection-series/collection-series.js')
  const wxml = read('miniprogram-card/pages/collection-series/collection-series.wxml')
  assert(js.includes('_buildMyOwnedProgressFromChecklist'))
  assert(js.includes('_buildMyOwnedProgressFromFreeImages'))
  assert(js.includes('showMyOwnedProgress: safePhysical > 0 && safeTotal > 0'))
  assert(js.includes('myOwnedProgressText: safeTotal > 0 && safePhysical > 0'))
  assert(js.includes('`${safeCount}/${safeTotal}（${safePhysical} 张）`'))
  assert(js.includes('myOwnedProgressPercent: percent'))
  assert(wxml.includes('wx:if="{{showMyOwnedProgress}}"'))
  assert(wxml.includes("{{myOwnedProgressNoCompletion ? myOwnedProgressTitle : ('我的拥有进度' + (myOwnedProgressText ? ' ' + myOwnedProgressText : ''))}}"))
  assert(wxml.includes('width: {{myOwnedProgressPercent}}%;'))
  assert(wxml.includes('我的拥有进度'))
})

test('collection series can customize my-owned progress mode in series settings', () => {
  const js = read('miniprogram-card/pages/collection-series/collection-series.js')
  const wxml = read('miniprogram-card/pages/collection-series/collection-series.wxml')
  const cloud = read('miniprogram-card/cloudfunctions/seriesOps/index.js')
  const rules = read('miniprogram-card/PRODUCT_RULES.md')
  const modeOptions = js.match(/const MY_OWNED_PROGRESS_MODE_OPTIONS = \[[\s\S]*?\n\]/)[0]
  assert(js.includes("const MY_OWNED_PROGRESS_DEFAULT_MODE = 'by_checklist'"), 'default progress mode should be checklist rows')
  assert(js.includes("const MY_OWNED_PROGRESS_MODE_OPTIONS = ["), 'page should define my-owned progress mode options')
  assert(modeOptions.includes("{ value: 'by_checklist', label: '每个清单一张'"), 'checklist-row mode should be available')
  assert(modeOptions.includes("{ value: 'by_player', label: '每个球员一张'"), 'player mode should be available')
  assert(modeOptions.includes("{ value: 'all_cards', label: '集齐全部'"), 'all-cards mode should be available')
  assert(modeOptions.includes("{ value: 'physical_only', label: '不统计完成度'"), 'physical-only mode should be available')
  assert(!modeOptions.includes("by_number"), 'number mode should not be exposed as a user-facing concept')
  assert(!modeOptions.includes("by_card_kind"), 'card-kind mode should not be exposed as a user-facing concept')
  assert(!modeOptions.includes("by_group_player"), 'group-player mode should not be exposed as a user-facing concept')
  assert(!modeOptions.includes("by_group_number"), 'group-number mode should not be exposed as a user-facing concept')
  assert(js.includes('_buildCustomMyOwnedProgressFromChecklist'), 'checklist progress should support custom target identities')
  assert(js.includes('_buildCustomMyOwnedProgressFromFreeImages'), 'free image progress should support custom target identities')
  assert(js.includes('_getProgressChecklistIdentitiesFromItem'), 'checklist progress should count checklist rows directly')
  assert(js.includes("if (mode === 'by_checklist') return this._getProgressChecklistIdentitiesFromItem(item, itemIndex, seriesContext)"), 'checklist target keys should use checklist rows')
  assert(js.includes("if (mode === 'by_checklist') return this._getProgressChecklistIdentitiesFromImage(img, item, itemIndex, seriesContext)"), 'owned checklist keys should use the containing checklist row')
  assert(js.includes('_buildMyOwnedProgressFromChecklist(checklist, stats = {}, seriesContext = this.data.series || {})'), 'checklist progress should accept the current series context')
  assert(js.includes('_buildMyOwnedProgressFromFreeImages(freeImages, stats = {}, seriesContext = this.data.series || {})'), 'free image progress should accept the current series context')
  assert(js.includes('this._buildMyOwnedProgressFromChecklist(cl, seriesStats, series)'), 'local checklist refresh should use the updated series context')
  assert(js.includes('this._buildMyOwnedProgressFromFreeImages(freeImagesNorm, stats, series)'), 'local free-image refresh should use the updated series context')
  assert(js.includes('this._buildMyOwnedProgressFromChecklist(checklist, seriesStats, series)'), 'initial checklist load should use the loaded series progress mode')
  assert(js.includes('this._buildMyOwnedProgressFromFreeImages(freeImages, seriesStats, series)'), 'initial free-image load should use the loaded series progress mode')
  assert(js.includes('saveMyOwnedProgressMode()'), 'series settings should save the selected progress mode')
  assert(js.includes('await this._updateSeriesFields({ myOwnedProgressMode: mode })'), 'progress mode should persist to the series document')
  assert(wxml.includes('我的进度口径'), 'manage modal should expose my-owned progress mode in completion settings')
  assert(wxml.includes('range="{{myOwnedProgressModeLabels}}"'), 'progress mode should use the configured option labels')
  assert(wxml.includes('bindchange="onEditMyOwnedProgressMode"'), 'progress mode picker should update edit state')
  assert(wxml.includes('推荐按图鉴列表每一行算一张；无编号、多人卡也只算当前行。'), 'progress hint should explain checklist rows without exposing implementation modes')
  assert(wxml.includes('bindtap="saveMyOwnedProgressMode"'), 'progress mode should have an explicit save action')
  assert(/SERIES_MANAGE_FIELD_KEYS[\s\S]*'myOwnedProgressMode'/.test(cloud), 'cloud updateSeriesFields should allow the progress mode field')
  assert(cloud.includes("const MY_OWNED_PROGRESS_MODE_VALUES = ['by_checklist', 'by_player', 'all_cards', 'physical_only']"), 'cloud should normalize only the simplified progress mode values')
  assert(rules.includes('默认并推荐按每个 checklist 清单条目一张统计，也可以按每个球员一张或集齐全部统计'), 'product rules should document simplified my-owned progress modes')
  assert(rules.includes('不要暴露分组×编号、分组×球员、每个卡种等实现口径'), 'product rules should prevent reintroducing implementation modes')
})

test('collection series checklist progress counts checklist rows without requiring numbers', () => {
  const page = loadCollectionSeriesPageForTest()
  const instance = {
    ...page,
    data: { ...(page.data || {}), subsetType: 'card', seriesLevel: 3 },
    _openid: 'me',
    _playersRoster: [],
    _playersList: []
  }
  const rookiePlayer = instance._getChecklistPlayerDefaults({ text: '14 Rookie Patches - John Henson', cardKind: 'Rookie Patches', subset: 'Base' })
  assert.strictEqual(rookiePlayer.player, 'John Henson')
  assert.strictEqual(rookiePlayer.playerCN, '')
  const regularPlayer = instance._getChecklistPlayerDefaults({ text: '1 Russell Westbrook - Oklahoma City Thunder', cardKind: 'Patches', subset: 'Base' })
  assert.strictEqual(regularPlayer.player, 'Russell Westbrook')
  assert.strictEqual(regularPlayer.playerCN, '')
  const result = instance._buildMyOwnedProgressFromChecklist([
    { text: 'Rookie Patches - John Henson', subset: 'Base', cardKind: 'Rookie Patches', images: [{ ownedBy: ['me'] }] },
    { text: 'Dual Memorabilia LeBron James/Kyrie Irving /3', subset: 'NBA Finals Dual Memorabilia', cardKind: 'Dual Memorabilia', images: [] }
  ], {}, { myOwnedProgressMode: 'by_checklist', defaultInfoEnabled: false, subsetType: 'card', seriesLevel: 3 })
  assert.strictEqual(result.myOwnedProgressMode, 'by_checklist')
  assert.strictEqual(result.myOwnedProgressText, '1/2（1 张）')
  assert.strictEqual(result.myOwnedProgressModeLabel, '')
  const defaultResult = instance._buildMyOwnedProgressFromChecklist([
    { text: '1 Russell Westbrook - Oklahoma City Thunder', number: '1', subset: 'Base', cardKind: 'Patches', images: [{ ownedBy: ['me'] }] },
    { text: '1 Russell Westbrook - Oklahoma City Thunder', number: '1', subset: 'Ruby', cardKind: 'Patches', images: [] }
  ], {}, { defaultInfoEnabled: false, subsetType: 'card', seriesLevel: 3 })
  assert.strictEqual(defaultResult.myOwnedProgressMode, 'by_checklist')
  assert.strictEqual(defaultResult.myOwnedProgressText, '1/2（1 张）')
})

test('my collection supports card export copy, single-year suggestions and series grouping', () => {
  const js = read('miniprogram-card/pages/my-collection/my-collection.js')
  const wxml = read('miniprogram-card/pages/my-collection/my-collection.wxml')
  const wxss = read('miniprogram-card/pages/my-collection/my-collection.wxss')
  const appJson = read('miniprogram-card/app.json')
  assert(js.includes('function buildMyCollectionYearOptions'))
  assert(js.includes('generated.push(String(year))'))
  assert(js.includes('function buildSeriesCostGroups'))
  assert(js.includes('const CARD_SORT_OPTIONS'))
  assert(js.includes('const SERIES_SORT_OPTIONS'))
  assert(js.includes("value: 'seriesTotalCost', label: '总买入'"))
  assert(js.includes("value: 'seriesHoldingCost', label: '持有成本'"))
  assert(js.includes("value: 'seriesSaleAmount', label: '卖出金额'"))
  assert(js.includes("value: 'seriesProfitAmount', label: '盈亏'"))
  assert(js.includes("value: 'seriesQuantity', label: '卡片数量'"))
  assert(js.includes("value: 'seriesLatestTime', label: '最近更新'"))
  assert(js.includes('function getSeriesSortValue'))
  assert(js.includes('const seriesGroupsFull = buildSeriesCostGroups(ledger, this.data.moneyVisible, itemMoneyVisibleMap, this.data.sortKey, this.data.sortOrder)'))
  assert(js.includes('seriesGroups: seriesPager.items'))
  assert(js.includes('moneyVisibilityKey: `series:${key}`'))
  assert(js.includes('moneyVisibleForItem: !!(moneyVisible || itemMoneyVisibleMap[group.moneyVisibilityKey])'))
  assert(js.includes('openSeriesGroupDetail'))
  assert(js.includes('/pages/my-collection-series-detail/my-collection-series-detail?'))
  assert(wxml.includes('如 2008 或 2016-17'))
  assert(wxml.includes('导出卡片'))
  assert(wxml.includes('bindtap="openBulkExportModal"'), 'my collection should expose a global export button')
  assert(wxml.includes('showBulkExportModal'), 'my collection should render a global export modal')
  assert(wxml.includes('bulkExportSelectedMap'), 'my collection global export should allow selecting cards')
  assert(wxml.includes('bulk-export-list'), 'my collection global export should use a scrollable list picker')
  assert(js.includes('openBulkExportModal'), 'my collection should open global export')
  assert(js.includes('bulkExportSelectedMap: {}'), 'my collection global export should default to no selected cards')
  assert(js.includes('exportBulkItemImages'), 'my collection should export selected cards globally')
  assert(js.includes('createDefaultBulkCardExportOptions'), 'my collection global export should support editable export options')
  assert(wxml.includes('<canvas type="2d" id="exportCardCanvas"'), 'my collection export canvas should use Canvas 2D')
  assert(js.includes("getCanvas2DContext('#exportCardCanvas'"), 'my collection export should draw through the Canvas 2D node API')
  assert(!js.includes("wx.createCanvasContext('exportCardCanvas'"), 'my collection export should not use the legacy canvas context')
  assert(js.includes('drawCardExportInfoPanel'), 'my collection single-card export should draw a styled title and details panel')
  assert(js.includes("ctx.fillStyle = '#f5f7fb'"), 'my collection single-card export should use a styled canvas background')
  assert(wxml.includes('按图鉴'))
  assert(wxml.includes('总花费'))
  assert(wxml.includes('{{sortOrderLabel}}'))
  assert(wxml.includes('bindtap="openSeriesGroupDetail"'))
  assert(wxml.includes('data-id="{{item.moneyVisibilityKey}}" catchtap="toggleItemMoneyVisible"'))
  assert(wxml.includes("item.moneyVisibleForItem ? '总花费 ¥' + item.totalCostText : '总花费 ••••'"))
  assert(wxml.includes("item.moneyVisibleForItem ? '持有成本 ¥' + item.holdingCostText : '持有成本 ••••'"))
  assert(wxss.includes('.series-summary-card { position: relative;'))
  assert(getRegisteredPagesFromAppJsonText(appJson).includes('pages/my-collection-series-detail/my-collection-series-detail'))
})

test('my collection can collapse same-card average groups', () => {
  const js = read('miniprogram-card/pages/my-collection/my-collection.js')
  const wxml = read('miniprogram-card/pages/my-collection/my-collection.wxml')
  const wxss = read('miniprogram-card/pages/my-collection/my-collection.wxss')
  const rules = read('miniprogram-card/PRODUCT_RULES.md')
  assert(js.includes('function buildSameCardDisplayItems'), 'my collection should build same-card grouped display rows')
  assert(js.includes('expandedSameCardGroupMap'), 'same-card groups should keep explicit expanded state')
  assert(js.includes('const groupKey = item.identityKey'), 'same-card groups should reuse the average-price identity key')
  assert(js.includes("const moneyVisibilityKey = `same-card:${groupKey}`"), 'same-card groups should have their own money visibility key')
  assert(js.includes('toggleSameCardGroup'), 'same-card groups should expand and collapse')
  assert(js.includes('const displayItemsFull = buildSameCardDisplayItems('), 'card list should build grouped display items before pagination')
  assert(js.includes('displayItems: displayPager.items'), 'card list should render paged grouped display items')
  assert(wxml.includes("item._displayType === 'sameCardGroup'"), 'card list should render a same-card group branch')
  assert(wxml.includes('bindtap="onSameCardGroupHeadTap"'), 'same-card group header should open same-card detail')
  assert(wxml.includes('catchtap="toggleSameCardGroup"'), 'same-card group expand control should collapse and expand')
  assert(wxml.includes('wx:for="{{item.children}}"'), 'expanded same-card groups should render child cards')
  assert(wxml.includes('same-card-group-badge'), 'same-card groups should label grouped rows')
  assert(wxss.includes('.same-card-group'), 'same-card group styles should exist')
  assert(wxss.includes('.same-card-children'), 'same-card children should be visually separated')
  assert(rules.includes('同类卡合并展示必须复用均价统计的同一个 `identityKey` 口径'), 'product rules should document same-card grouping scope')
})

test('my collection visually distinguishes sold cards beyond the status badge', () => {
  const wxml = read('miniprogram-card/pages/my-collection/my-collection.wxml')
  const wxss = read('miniprogram-card/pages/my-collection/my-collection.wxss')
  assert(wxml.includes('class="card-item status-{{item.statusClass}}'), 'normal card rows should carry status classes')
  assert(wxml.includes('class="card-item same-card-child status-{{child.statusClass}}"'), 'expanded same-card child rows should carry status classes')
  assert(wxml.includes('class="same-card-group status-{{item.statusClass}}"'), 'same-card groups should carry status classes')
  assert(wxss.includes('.card-item.status-sold'), 'sold card rows should have dedicated styling')
  assert(wxss.includes('background: #eef0f3'), 'sold card rows should use a neutral gray background')
  assert(!wxss.includes('.card-item.status-sold::before'), 'sold card rows should not use a left-side marker')
  assert(wxss.includes('.same-card-group.status-sold'), 'all-sold same-card groups should have dedicated styling')
})

test('my collection hides default status and condition badges', () => {
  const js = read('miniprogram-card/pages/my-collection/my-collection.js')
  const wxml = read('miniprogram-card/pages/my-collection/my-collection.wxml')
  const detailJs = read('miniprogram-card/pages/my-collection-series-detail/my-collection-series-detail.js')
  const detailWxml = read('miniprogram-card/pages/my-collection-series-detail/my-collection-series-detail.wxml')
  assert(js.includes("conditionLabel: condition === '通行' ? '' : condition"), 'only default 通行 condition should hide its badge')
  assert(js.includes("showStatusBadge: status !== 'holding'"), 'default 持有中 status should not render a badge')
  assert(js.includes("showStatusBadge: groupStatus !== 'holding'"), 'same-card holding groups should not render a status badge')
  assert(wxml.includes("item.showStatusBadge && item.status === 'sold'"), 'sold badge should render in the title row')
  assert(wxml.includes("item.showStatusBadge && item.status !== 'sold'"), 'non-sold non-default badges should stay in metadata')
  assert(wxml.includes("item.status === 'sold' && item.moneyVisibleForItem"), 'sold sale/profit row should only show when money is visible')
  assert(wxml.includes("child.status === 'sold' && child.moneyVisibleForItem"), 'expanded sold child sale/profit row should only show when money is visible')
  assert(detailJs.includes("conditionLabel: condition === '通行' ? '' : condition"), 'series detail should hide only default 通行 condition badge')
  assert(detailJs.includes("showStatusBadge: status !== 'holding'"), 'series detail should hide default 持有中 status badge')
  assert(detailWxml.includes('class="card-item status-{{item.statusClass}}'), 'series detail card rows should carry status classes')
  assert(detailWxml.includes("item.showStatusBadge && item.status === 'sold'"), 'series detail sold badge should render in title row')
  assert(detailWxml.includes("item.status === 'sold' && item.moneyVisibleForItem"), 'series detail sold sale/profit row should only show when money is visible')
})

test('my collection shows batch quantity for unnumbered multi-card ledger rows', () => {
  const js = read('miniprogram-card/pages/my-collection/my-collection.js')
  const wxml = read('miniprogram-card/pages/my-collection/my-collection.wxml')
  const detailJs = read('miniprogram-card/pages/my-collection-series-detail/my-collection-series-detail.js')
  const detailWxml = read('miniprogram-card/pages/my-collection-series-detail/my-collection-series-detail.wxml')
  const rules = read('miniprogram-card/PRODUCT_RULES.md')
  assert(js.includes('function buildQuantityLabel(item = {}, quantity = 1)'), 'my collection should derive a title quantity label')
  assert(js.includes('if (userCardLedger.shouldResetRepurchaseInstance(item)) return \'\''), 'only concrete serial-numbered cards should hide title quantity')
  assert(!js.includes('if (cleanCardNumber(item.cardNumber || item.number || \'\')) return \'\''), 'plain checklist card numbers should still show title quantity')
  assert(js.includes('quantityLabel: buildQuantityLabel(item, quantity)'), 'my collection rows should expose the quantity label')
  assert(wxml.includes('<text wx:if="{{item.quantityLabel}}" class="title-quantity">{{item.quantityLabel}}</text>'), 'my collection title rows should render quantity next to the title')
  assert(detailJs.includes('function buildQuantityLabel(item = {}, quantity = 1)'), 'series detail should derive the same title quantity label')
  assert(detailJs.includes('if (userCardLedger.shouldResetRepurchaseInstance(item)) return \'\''), 'series detail should only hide quantity for concrete serial-numbered cards')
  assert(detailJs.includes('quantityLabel: buildQuantityLabel(item, quantity)'), 'series detail rows should expose the quantity label')
  assert(detailWxml.includes('<text wx:if="{{item.quantityLabel}}" class="title-quantity">{{item.quantityLabel}}</text>'), 'series detail title rows should render quantity next to the title')
  assert(!detailWxml.includes('x{{item.quantity}}</text>'), 'series detail should not render raw quantity in metadata')
  assert(rules.includes('没有限编具体编号且数量大于 1 的单条台账'), 'product rules should document unnumbered batch quantity display')
})

test('collection series existing-ledger link modal is compact and selectable', () => {
  const js = read('miniprogram-card/pages/collection-series/collection-series.js')
  const wxml = read('miniprogram-card/pages/collection-series/collection-series.wxml')
  const wxss = read('miniprogram-card/pages/collection-series/collection-series.wxss')
  assert(!js.includes('candidates.length === 1'), 'single ledger-link candidate should use the closeable custom modal, not wx.showModal')
  assert(js.includes('if (candidates.length > 0)'), 'all ledger-link candidates should open the same closeable custom modal')
  assert(wxml.includes('wx:for="{{ledgerLinkCandidates}}"'), 'link modal should render all existing ledger candidates')
  assert(wxml.includes('class="ledger-link-candidate" data-id="{{item._id}}" bindtap="selectLedgerLinkCandidate"'), 'candidate rows should use the real ledger id and click handler')
  assert(wxml.includes('class="ledger-link-cover"'), 'candidate cover should use compact ledger-link cover styling')
  assert(wxml.includes('class="ledger-link-body"'), 'candidate content should use compact ledger-link body styling')
  assert(!wxml.includes('class="series-link-candidate" data-id="{{item.id}}"'), 'candidate rows should not use stale series-link classes or id fields')
  assert(wxss.includes('.ledger-link-candidate { display: flex;'), 'candidate row layout should be defined')
  assert(wxss.includes('.ledger-link-cover { width: 104rpx; height: 132rpx;'), 'candidate cover should be constrained instead of stretching')
})

test('user card item condition is persisted by cloud normalization', () => {
  const seriesOps = read('miniprogram-card/cloudfunctions/seriesOps/index.js')
  const myCollection = read('miniprogram-card/pages/my-collection/my-collection.js')
  const seriesDetail = read('miniprogram-card/pages/my-collection-series-detail/my-collection-series-detail.js')
  const myCollectionLedger = read('miniprogram-card/pages/my-collection/utils/userCardLedger.js')
  const seriesDetailLedger = read('miniprogram-card/pages/my-collection-series-detail/utils/userCardLedger.js')
  const collectionSeries = read('miniprogram-card/pages/collection-series/collection-series.js')
  const rules = read('miniprogram-card/PRODUCT_RULES.md')
  assert(myCollection.includes('const CONDITION_OPTIONS = userCardLedger.USER_CARD_CONDITION_VALUES'), 'my collection should use the shared condition options')
  assert(seriesDetail.includes('const CONDITION_OPTIONS = userCardLedger.USER_CARD_CONDITION_VALUES'), 'series detail card editor should use the shared condition options')
  assert(myCollectionLedger.includes("const USER_CARD_CONDITION_VALUES = ['通行', '瑕疵', '非原封', '评级瑕疵']"), 'my collection should expose all supported condition options')
  assert(seriesDetailLedger.includes("const USER_CARD_CONDITION_VALUES = ['通行', '瑕疵', '非原封', '评级瑕疵']"), 'series detail should expose all supported condition options')
  assert(collectionSeries.includes("const CONDITION_OPTIONS = ['通行', '瑕疵', '非原封', '评级瑕疵']"), 'series upload and long-press hold forms should expose all condition options')
  assert(seriesOps.includes("const USER_CARD_ITEM_CONDITION_VALUES = ['通行', '瑕疵', '非原封', '评级瑕疵']"), 'cloud function should whitelist supported condition values')
  assert(seriesOps.includes('function normalizeUserCardItemCondition(condition)'), 'cloud function should normalize user card condition')
  assert(/const condition = normalizeUserCardItemCondition\(input.condition\)[\s\S]*condition,/.test(seriesOps), 'cloud function should persist condition into user_card_items')
  assert(!myCollection.includes("{ value: 'non_sealed'"), '非原封 should not be modeled as a card feature')
  assert(!collectionSeries.includes("{ value: 'non_sealed'"), '非原封 should not be modeled as a series image feature')
  assert(rules.includes('默认品相是 `通行`，另有 `瑕疵`、`非原封` 和 `评级瑕疵` 分类。'), 'product rules should document supported condition values')
})

test('user card item saves only split card identity number fields', () => {
  const seriesOps = read('miniprogram-card/cloudfunctions/seriesOps/index.js')
  const myCollection = read('miniprogram-card/pages/my-collection/my-collection.js')
  const seriesDetail = read('miniprogram-card/pages/my-collection-series-detail/my-collection-series-detail.js')
  const normalizeBody = seriesOps.match(/function normalizeUserCardItem\(input = \{\}, openid = ''\) \{[\s\S]*?\n\}/)
  assert(normalizeBody, 'cloud function should keep user card normalization centralized')
  assert(normalizeBody[0].includes('productNumber,'), 'user_card_items should persist productNumber')
  assert(normalizeBody[0].includes('serialNumber,'), 'user_card_items should persist serialNumber')
  assert(!normalizeBody[0].includes('cardNumber,'), 'user_card_items should not persist legacy cardNumber')
  assert(seriesOps.includes('function buildLegacyCardIdentityRemovePatch()'), 'cloud updates should remove legacy card identity fields')
  assert(seriesOps.includes('...buildLegacyCardIdentityRemovePatch(),'), 'user card updates should actively clear legacy card identity fields')
  ;[myCollection, seriesDetail].forEach(source => {
    assert(source.includes('function stripLegacyCardIdentityFields(fields = {})'), 'client save path should strip legacy card identity fields')
    assert(source.includes('const saveFields = stripLegacyCardIdentityFields(form)'), 'client should build a clean save payload')
    assert(source.includes('userCardLedger.stripPartialSaleFields(saveFields)'), 'client add/update calls should use the clean save payload')
  })
})

test('repurchase keeps series linkage and skips stale series image sync warnings', () => {
  const js = read('miniprogram-card/pages/my-collection/my-collection.js')
  const detailJs = read('miniprogram-card/pages/my-collection-series-detail/my-collection-series-detail.js')
  const wxml = read('miniprogram-card/pages/my-collection/my-collection.wxml')
  const detailWxml = read('miniprogram-card/pages/my-collection-series-detail/my-collection-series-detail.wxml')
  ;[js, detailJs].forEach(source => {
    assert(source.includes('function buildRepurchaseSeriesLinkPatch(item = {})'), 'repurchase should share a focused series-link patch')
    assert(source.includes('seriesId: item.seriesId || \'\''), 'repurchase should preserve series id')
    assert(source.includes('seriesName: item.seriesName || \'\''), 'repurchase should preserve series name')
    assert(source.includes('itemId: item.itemId || \'\''), 'repurchase should preserve checklist item id')
    assert(source.includes('const repurchasePatch = userCardLedger.buildRepurchaseInstancePatch(item)') && source.includes('...repurchasePatch'), 'repurchase form should clear concrete numbered-card instance fields')
    assert(source.includes('...buildRepurchaseSeriesLinkPatch(item)'), 'repurchase form should apply the series-link patch')
    assert(source.includes('duplicateKey: userCardLedger.buildDuplicateKey({'), 'duplicate detection should use an exact card key instead of the same-card grouping key')
    assert(source.includes('hasSeriesImageLink: !!(item.hasCurrentSeriesImageLink || userCardLedger.hasSeriesImageLink(item))'), 'series link actions should respect synced url-only historical image links')
    assert(source.includes('userCardLedger.isSeriesImageNumberMismatch(item, currentMeta)'), 'stale image links should be detected when saved card number differs from the linked series image number')
    assert(source.includes('userCardLedger.unlinkStaleRepurchaseSeriesImage(form, originalItem)'), 'repurchase should clear stale image linkage when the user changes serial number')
    assert(source.includes('function isMissingSeriesDocumentError(err)'), 'stale series sync should detect missing series documents')
    assert(source.includes('if (!isMissingSeriesDocumentError(err))'), 'missing series documents should not spam sync warnings')
  })
  assert(wxml.includes('wx:if="{{!child.isProductSet && !child.hasSeriesImageLink}}"'), 'grouped cards should show link action when they lack a concrete series image')
  assert(wxml.includes('wx:if="{{!item.isProductSet && !item.hasSeriesImageLink}}"'), 'single cards should show link action when they lack a concrete series image')
  assert(detailWxml.includes('wx:if="{{!item.isProductSet && !item.hasSeriesImageLink}}"'), 'series detail cards should show link action when they lack a concrete series image')
})

test('series link can offer a create-from-user-card candidate for empty numbered slots', () => {
  const seriesOps = read('miniprogram-card/cloudfunctions/seriesOps/index.js')
  assert(seriesOps.includes('function buildUserCardCreateImageCandidate'), 'cloud link search should build a candidate from an existing user-card image')
  assert(seriesOps.includes('function userItemHasMatchingSeriesImageLink'), 'cloud link search should distinguish valid image links from stale image ids')
  assert(seriesOps.includes('if (userItemHasMatchingSeriesImageLink(userItem, series, subsetDocs)) return null'), 'stale image ids should not block create-from-user-card candidates')
  assert(seriesOps.includes('createFromUserCard: true'), 'create candidate should mark that the user-card image needs to be inserted into the series')
  assert(seriesOps.includes('async function createSeriesImageFromUserCardItem'), 'linking a create candidate should insert the user-card image into the target card kind')
  assert(seriesOps.includes('if (mutationOptions.createFromUserCard)'), 'link action should use create-from-user-card flow before toggling ownership')
  assert(seriesOps.includes('uploaderOpenid: openid'), 'created series image should keep uploader ownership')
  assert(seriesOps.includes('const siblingSourceItems = await listLinkedSiblingSourceItems(contextUserItem, openid)'), 'series link search should inspect linked cards from the same owned-card group')
  assert(seriesOps.includes('const linkedPeers = findLinkedSameCardPeers(contextUserItem, siblingSourceItems)'), 'series link search should derive linked same-card peers')
  assert(seriesOps.includes('buildSiblingSeriesLinkCandidates(matchUserItem, linkedPeers, seriesMap, subsetDocs, openid)'), 'same-card linked peers should produce scoped candidates from their bound series card kind')
  assert(seriesOps.includes('function buildSeriesImageLinkCandidateKey'), 'series link candidates should use one canonical key for old url-only images')
  assert(seriesOps.includes('function normalizeSeriesImageUrlForIdentity'), 'series link candidate keys should normalize cloud and CDN urls before dedupe')
  assert(seriesOps.includes('const imageUrlKey = normalizeSeriesImageUrlForIdentity(draft.imageUrl)'), 'series link candidate keys should prefer stable image urls over generated legacy image ids')
  assert(seriesOps.includes('dedupeSeriesImageLinkCandidates([...siblingCandidates, ...candidates, ...globalCreateCandidates])'), 'same-card scoped candidates should be deduped with direct candidates before returning')
  assert(seriesOps.includes('buildSeriesImageLinkCandidateKey(draft)'), 'candidate response and dedupe should share the same encoded url key')
  assert(seriesOps.includes('function canUseExistingSeriesImageForUserCard'), 'existing image candidates should be checked against concrete serial numbers')
  assert(seriesOps.includes('if (!canUseExistingSeriesImageForUserCard(userItem, itemWithSubset, draft)) return'), 'specific numbered user cards should not match broad base images from a different print run')
  assert(seriesOps.includes('function buildGlobalUserCardCreateImageCandidates'), 'link search should also offer create candidates for globally matched empty numbered slots')
  assert(seriesOps.includes('seriesBaseContextMatchesUserItem(userItem, series)'), 'global empty-slot candidates should skip unrelated series before scanning card kinds')
  assert(seriesOps.includes('seriesContextMatchesUserItem(userItem, series, item)'), 'global empty-slot candidates should still match the card to the target series context')
  assert(seriesOps.includes('itemMatchesEmptyNumberedSlot(item, userItem, series)'), 'global empty-slot candidates should require the serial denominator to match the card kind target')
  assert(seriesOps.includes('itemTextMatchesUserPlayer(item, userItem, series)'), 'global empty-slot candidates should cheaply require the target player before full matching')
  assert(seriesOps.includes('findBestChecklistItemMatch([normalizedItem], userItem, { series })'), 'global empty-slot candidates should require the checklist slot to match player identity')
  assert(seriesOps.includes('function buildSeriesLinkSubsetSearchSeriesIds'), 'link search should choose relevant series ids before reading subset documents')
  assert(seriesOps.includes('async function listSubsetDocsForSeriesIds'), 'link search should fetch subset documents by selected series ids instead of loading all subsets')
  assert(seriesOps.includes('const subsetSeriesIds = buildSeriesLinkSubsetSearchSeriesIds(contextUserItem, visibleSeriesList, linkedPeers)'), 'link search should derive subset fetch scope from the target card and linked peers')
  assert(seriesOps.includes('const subsetDocs = await listSubsetDocsForSeriesIds(subsetSeriesIds)'), 'link search should use scoped subset reads for candidate generation')
  assert(seriesOps.includes('const globalCreateCandidates = buildGlobalUserCardCreateImageCandidates(matchUserItem, visibleSeriesList, subsetDocs, openid)'), 'global empty-slot candidates should be added to the returned link candidates')
})

test('url-only historical series links are treated as linked after current-series sync', () => {
  const js = read('miniprogram-card/pages/my-collection/my-collection.js')
  const detailJs = read('miniprogram-card/pages/my-collection-series-detail/my-collection-series-detail.js')
  ;[js, detailJs].forEach(source => {
    assert(source.includes('hasCurrentSeriesImageLink: true'), 'valid url-only historical links should be marked during current image sync')
    assert(source.includes('hasCurrentSeriesImageLink: false'), 'stale number mismatches should explicitly clear the synced link marker')
    assert(source.includes('hasSeriesImageLink: !!(item.hasCurrentSeriesImageLink || userCardLedger.hasSeriesImageLink(item))'), 'link action should be hidden for url-only links that still match current series images')
  })
})

test('my collection series detail drills into grouped cards', () => {
  const js = read('miniprogram-card/pages/my-collection-series-detail/my-collection-series-detail.js')
  const wxml = read('miniprogram-card/pages/my-collection-series-detail/my-collection-series-detail.wxml')
  const json = read('miniprogram-card/pages/my-collection-series-detail/my-collection-series-detail.json')
  assert(js.includes('filterItemsForSeriesGroup'))
  assert(js.includes('goSeriesDetail'))
  assert(js.includes('/pages/collection-series/collection-series?id='))
  assert(js.includes("groupTitle: '未关联图鉴'"))
  assert(js.includes('groupStats: this.buildStats(ledger)'))
  assert(wxml.includes('series-detail-header'))
  assert(wxml.includes('class="page series-detail-page"'))
  assert(wxml.includes('bindtap="goSeriesDetail"'))
  assert(wxml.includes('{{groupTitle}}'))
  assert(wxml.includes('{{groupStats.totalQuantity}}'))
  assert(wxml.includes('openCollectionCardDetail'))
  assert(wxml.includes('openEditModal'))
  assert(wxml.includes('openRepurchaseModal'))
  assert(!wxml.includes('openSameTypeModal'), 'series grouped cards should not show the redundant same-type add action')
  assert(!wxml.includes('同款新增'), 'series grouped cards should not show the redundant same-type add label')
  assert(wxml.includes('exportItemImage'))
  assert(wxml.includes('deleteItem'))
  const wxss = read('miniprogram-card/pages/my-collection-series-detail/my-collection-series-detail.wxss')
  assert(wxss.includes('.series-detail-page .toolbar { margin-bottom: 18rpx; }'))
  assert(wxss.includes('.series-detail-page .sort-bar { margin: 0 0 18rpx; }'))
  assert(wxss.includes('.series-detail-page .status-tab,'))
  assert(json.includes('图鉴卡片'))
})

test('my collection dashboard visualizes private ledger data', () => {
  const appJson = read('miniprogram-card/app.json')
  const homeJs = read('miniprogram-card/pages/my-collection/my-collection.js')
  const homeWxml = read('miniprogram-card/pages/my-collection/my-collection.wxml')
  const dashboardJs = read('miniprogram-card/pages/my-collection-dashboard/my-collection-dashboard.js')
  const dashboardWxml = read('miniprogram-card/pages/my-collection-dashboard/my-collection-dashboard.wxml')
  const dashboardWxss = read('miniprogram-card/pages/my-collection-dashboard/my-collection-dashboard.wxss')
  const dashboardJson = read('miniprogram-card/pages/my-collection-dashboard/my-collection-dashboard.json')
  const rules = read('miniprogram-card/PRODUCT_RULES.md')

  assert(getRegisteredPagesFromAppJsonText(appJson).includes('pages/my-collection-dashboard/my-collection-dashboard'), 'dashboard page should be registered')
  assert(homeJs.includes('openDashboard'), 'my collection should expose a dashboard navigation handler')
  assert(homeJs.includes('/pages/my-collection-dashboard/my-collection-dashboard'), 'dashboard entry should navigate to the private dashboard page')
  assert(homeWxml.includes('openDashboard'), 'my collection should render a dashboard entry')
  assert(homeWxml.includes('看板'), 'dashboard entry should be visible from my collection')
  assert(dashboardJson.includes('我的卡片看板'), 'dashboard page should use a dedicated navigation title')
  assert(dashboardJs.includes('function buildDashboardGroups'), 'dashboard should build reusable grouped chart data')
  assert(dashboardJs.includes("type: 'series'"), 'dashboard should support series share analysis')
  assert(dashboardJs.includes("type: 'player'"), 'dashboard should support player share analysis')
  assert(dashboardJs.includes("type: 'condition'"), 'dashboard should support condition distribution')
  assert(dashboardJs.includes("type: 'status'"), 'dashboard should support status distribution')
  assert(dashboardJs.includes('activeMetric'), 'dashboard should switch between cost and quantity views')
  assert(dashboardJs.includes('function buildDashboardViewState'), 'dashboard metric changes should build the next view state before setData')
  assert(dashboardJs.includes('refreshDashboard({ activeMetric: metric })'), 'dashboard metric changes should avoid showing stale chart data between states')
  assert(dashboardJs.includes('openDashboardDetail'), 'dashboard rows should drill into detail lists')
  assert(!dashboardJs.includes('openTopDashboardDetail'), 'dashboard chart visual area should not carry a low-value largest-category shortcut')
  assert(dashboardJs.includes('selectedDashboardKey'), 'dashboard should keep a visible selected category state')
  assert(dashboardJs.includes('function getPieCanvasSize'), 'dashboard pie canvas should convert rpx size to device px to avoid clipped charts')
  assert(dashboardJs.includes('function buildSeriesEfficiencyRows'), 'dashboard should expose collection investment efficiency insights')
  assert(!dashboardJs.includes("'已收'"), 'series investment rows should not show low-value collected labels for no-target series')
  assert(dashboardJs.includes('function isLinkedSeriesItem'), 'dashboard should distinguish linked series items from unlinked ledger cards')
  assert(dashboardJs.includes("card.type === 'series' ? filterLinkedSeriesItems(items) : items"), 'series share charts should exclude unlinked cards')
  assert(dashboardJs.includes('const linkedSeriesItems = filterLinkedSeriesItems(items)'), 'series investment and concentration should use only linked series cards')
  assert(dashboardJs.includes("const seriesRows = buildCostMap(linkedSeriesItems, 'series')"), 'series concentration should exclude unlinked cards')
  assert(dashboardJs.includes('const seriesTotalCost = linkedSeriesItems.reduce'), 'series concentration percentages should be based on linked series cards only')
  assert(dashboardJs.includes('function buildMonthlyTrendRows'), 'dashboard should expose purchase trend insights')
  assert(dashboardJs.includes('function buildConcentrationSummary'), 'dashboard should expose concentration risk insights')
  assert(dashboardJs.includes('function buildSameCardInsights'), 'dashboard should expose same-card average price insights')
  assert(dashboardJs.includes('function buildSameCardInsightTitle'), 'same-card insights should use a concise collector-facing title')
  assert(dashboardJs.includes("return printRun ? `${player} ${printRun}编` : player"), 'same-card insight title should show player plus print run only')
  assert(dashboardJs.includes('function buildSameCardInsightSubtitle'), 'same-card insights should keep brand and series context')
  assert(dashboardJs.includes('return [item.year, item.brand, item.cardSeries]'), 'same-card insight subtitle should show year, manufacturer and series without long card names')
  assert(dashboardJs.includes('cover: normalizeImageUrl(item.imageUrl)'), 'same-card insights should keep a representative cover image')
  assert(dashboardJs.includes('function buildTodoInsights'), 'dashboard should expose actionable private ledger reminders')
  assert(dashboardJs.includes('insightSectionsCollapsed'), 'dashboard should allow static insight sections to be collapsed')
  assert(dashboardJs.includes('toggleInsightSections'), 'dashboard should expose a static insight collapse handler')
  assert(!dashboardJs.includes("key: 'missing-series'"), 'dashboard reminders should not treat unlinked series as a pending task')
  assert(!dashboardJs.includes('待关联图鉴'), 'dashboard reminders should not prompt users to link cards that do not belong to curated series')
  assert(dashboardJs.includes("const userCardLedger = require('../my-collection/utils/userCardLedger')"), 'dashboard should share the same identity helper as my collection')
  assert(dashboardJs.includes('const key = getDashboardIdentityKey(item)'), 'same-card insights must use the dashboard identity key helper')
  assert(dashboardJs.includes('return cleanText(item.identityKey) || userCardLedger.buildIdentityKey(item)'), 'same-card insights should prefer persisted identityKey and fall back to the same-card rule')
  assert(!dashboardJs.includes("'无目标'"), 'dashboard should not expose an ambiguous no-target label in insight rows')
  assert(dashboardWxml.includes('type="2d" id="seriesPie"'), 'series chart should render as a Canvas 2D pie canvas')
  assert(dashboardWxml.includes('type="2d" id="playerPie"'), 'player chart should render as a Canvas 2D pie canvas')
  assert(dashboardWxml.includes('dashboard-detail-list'), 'dashboard should render filtered card details')
  assert(dashboardWxml.includes('series-efficiency-list'), 'dashboard should render collection efficiency cards')
  assert(dashboardWxml.includes('wx:if="{{series.completionPercentText}}"'), 'series investment status should render only when a target percentage exists')
  assert(dashboardWxml.includes('monthly-trend-list'), 'dashboard should render monthly purchase trend rows')
  assert(dashboardWxml.includes('concentration-grid'), 'dashboard should render concentration summary cards')
  assert(dashboardWxml.includes('same-card-insights'), 'dashboard should render same-card average price insights')
  assert(dashboardWxml.includes('图鉴投入度'), 'series investment section should use positioning wording instead of efficiency wording')
  assert(!dashboardWxml.includes('图鉴投入效率'), 'series investment section should not imply efficiency evaluation')
  assert(dashboardWxml.indexOf('same-card-insights') < dashboardWxml.indexOf('series-efficiency-list'), 'series investment section should appear after same-card average insights')
  assert(dashboardWxml.includes('same-card-subtitle'), 'same-card average rows should keep manufacturer and series context')
  assert(dashboardWxml.includes('class="same-card-cover"'), 'same-card average rows should show a representative card image')
  assert(dashboardWxml.includes('todo-insights'), 'dashboard should render private ledger reminder cards')
  assert(dashboardWxml.includes('insight-collapse-bar'), 'dashboard should render one collapse control for metric-independent insight sections')
  assert(dashboardWxml.includes('wx:if="{{!insightSectionsCollapsed}}"'), 'dashboard should hide metric-independent insight sections when collapsed')
  assert(dashboardWxml.includes("{{insightSectionsCollapsed ? '展开' : '收起'}}"), 'dashboard collapse control should switch label between expand and collapse')
  assert(!dashboardWxml.includes('identityKey'), 'dashboard should not show implementation terms to users')
  assert(!dashboardWxml.includes('无目标'), 'dashboard should not show ambiguous no-target wording to users')
  assert(dashboardWxml.includes('toggleMoneyVisible'), 'dashboard should share the same money visibility behavior')
  assert(!dashboardWxml.includes('bindtap="openTopDashboardDetail"'), 'dashboard chart visual area should not expose the largest-category shortcut')
  assert(!dashboardWxml.includes('查看最大项'), 'dashboard chart visual area should not show a largest-category action label')
  assert(dashboardWxml.includes('selectedDashboardKey === row.detailKey'), 'dashboard ranking rows should show the selected category')
  assert(dashboardWxml.includes('chart-visual-row'), 'dashboard charts should keep the visual summary above ranking rows')
  assert(dashboardWxml.includes('chart-summary-value'), 'dashboard charts should show a compact top summary beside the chart')
  assert(!dashboardWxml.includes('row.recordCount}} 条'), 'dashboard ranking meta should only show card quantity, not record count')
  assert(dashboardWxml.includes('wx:if="{{activeMetric !== \'quantity\'}}"'), 'quantity charts should not duplicate quantity as the value meta')
  assert(dashboardWxss.includes('.dashboard-chart-card'), 'dashboard should have chart card styling')
  assert(dashboardWxss.includes('.dashboard-section-card'), 'dashboard insight sections should share card styling')
  assert(dashboardWxss.includes('.trend-bar'), 'dashboard purchase trends should use compact bar visuals')
  assert(dashboardWxss.includes('.todo-insight-card'), 'dashboard reminders should have explicit styling')
  assert(dashboardWxss.includes('.insight-collapse-bar'), 'dashboard collapse control should have explicit styling')
  assert(dashboardWxss.includes('.chart-body { display: flex; flex-direction: column;'), 'dashboard chart body should stack chart and ranking on mobile')
  assert(dashboardWxss.includes('.chart-row.active'), 'dashboard selected category should be visually highlighted')
  assert(dashboardWxss.includes('.dashboard-detail-card'), 'dashboard detail rows should have card styling')
  assert(rules.includes('我的卡片看板只分析私人台账数据'), 'product rules should keep dashboard private and scoped')
  assert(rules.includes('图鉴投入度、购买趋势、集中度、同款均价和待处理提醒'), 'product rules should document the dashboard insight modules')
  assert(!rules.includes('图鉴投入效率'), 'product rules should avoid efficiency wording for series investment')
  assert(rules.includes('图鉴相关维度不纳入未关联图鉴'), 'product rules should document that unlinked cards are excluded from series-specific dashboard views')
  assert(rules.includes('待处理提醒不把未关联图鉴作为待办'), 'product rules should document that missing series linkage is not a dashboard todo')
  assert(rules.includes('不随 `花费/数量` 维度切换的辅助分析模块，可以提供统一收起/展开入口'), 'product rules should document collapsible metric-independent dashboard insight sections')
})

test('problem card list supports category filtering and counterfeit wording', () => {
  const js = read('miniprogram-card/pages/index/index.js')
  const wxml = read('miniprogram-card/pages/index/index.wxml')
  const wxss = read('miniprogram-card/pages/index/index.wxss')
  const detail = read('miniprogram-card/pages/detail/detail.wxml')
  assert(js.includes('CATEGORY_FILTER_OPTIONS'))
  assert(js.includes('setCategoryFilter'))
  assert(js.includes('(card.category || \'fake-patch\') !== activeCategory'))
  assert(!wxml.includes('全部球员'))
  assert(!wxml.includes('全部品牌'))
  assert(!wxml.includes('全部年份'))
  assert(wxml.includes('category-filter-tag'))
  assert(wxml.includes('假卡'))
  assert(wxml.includes('换 Patch'))
  assert(wxss.includes('.category-filter-tag.active { background: #667eea; color: #fff;'))
  assert(!wxss.includes('.category-filter-tag.active { background: #111827;'))
  const disclaimer = '请仔细查看来源资料或者当前页面相关信息后再做判断，本网站不构成任何鉴定结论、交易建议或维权证据。'
  assert(detail.includes(`这张卡已进入明确 Patch 异常记录：同一张卡出现 Patch 不一致，或已有明确换 Patch / 来源冲突记录。${disclaimer}`))
  assert(detail.includes(`这张卡已进入高度存疑 Patch 线索：疑点来自同款卡 Patch 材质、位置、复杂度或球队/年份合理性对比，但尚未形成明确结论。${disclaimer}`))
  assert.strictEqual(detail.split(disclaimer).length - 1, 6)
  assert(!detail.includes('请仔细查看来源资料后再做判断。'))
  assert(!detail.includes('本资料仅供参考'))
  assert(!detail.includes('具体信息请查看资料来源'))
  assert(!detail.includes('不应按普通同款差异理解'))
  assert(detail.includes('假卡仅凭图片通常难以完全判断'))
})

test('backup materials have a separate reviewed archive flow', () => {
  const appJson = read('miniprogram-card/app.json')
  const indexJs = read('miniprogram-card/pages/index/index.js')
  const indexWxml = read('miniprogram-card/pages/index/index.wxml')
  const backupJs = read('miniprogram-card/pages/card-backups/card-backups.js')
  const backupWxml = read('miniprogram-card/pages/card-backups/card-backups.wxml')
  const feedbackJs = read('miniprogram-card/pages/feedback/feedback.js')
  const feedbackWxml = read('miniprogram-card/pages/feedback/feedback.wxml')
  const adminJs = read('miniprogram-card/pages/admin/admin.js')
  const adminWxml = read('miniprogram-card/pages/admin/admin.wxml')
  const adminOps = read('miniprogram-card/cloudfunctions/adminOps/index.js')
  const detailJs = read('miniprogram-card/pages/detail/detail.js')
  const detailWxml = read('miniprogram-card/pages/detail/detail.wxml')
  const detailWxss = read('miniprogram-card/pages/detail/detail.wxss')
  const rules = read('miniprogram-card/PRODUCT_RULES.md')
  const registeredPages = getRegisteredPagesFromAppJsonText(appJson)

  assert(registeredPages.includes('pages/card-backups/card-backups'), 'backup materials page should be registered')
  assert(indexWxml.includes('bindtap="goCardBackups"'), 'home problem-card area should expose the backup entry')
  assert(indexJs.includes("goCardBackups() { wx.navigateTo({ url: '/pages/card-backups/card-backups' }) }"), 'backup entry should navigate to the backup page')
  assert(indexJs.includes(".filter(card => (card && card.category) !== 'backup')"), 'backup cards should stay out of the abnormal-card list')

  assert(backupJs.includes(".filter(card => card && card.category === 'backup')"), 'backup page should only load backup category cards')
  assert(backupJs.includes('applySearch'), 'backup page should support search')
  assert(backupJs.includes('/pages/feedback/feedback?category=backup'), 'backup page should submit through the backup feedback entry')
  assert(backupWxml.includes('下面的卡片具有较高改造风险'), 'backup page should explain the archive purpose')
  assert(backupWxml.includes('反馈备份资料'), 'backup page should expose a feedback action')
  assert(backupWxml.includes('backup-card'), 'backup list should render card-style rows')

  assert(feedbackJs.includes("'backup'"), 'feedback page should accept backup category')
  assert(feedbackJs.includes("title: '反馈备份资料'"), 'backup feedback should set a backup-specific title')
  assert(feedbackJs.includes("feedbackMode: isBackupMode ? 'backup' : 'problem'"), 'feedback page should lock backup and abnormal entry modes')
  assert(feedbackJs.includes("this.data.feedbackMode === 'backup' && category !== 'backup'"), 'backup feedback should not switch to abnormal categories')
  assert(feedbackWxml.includes('wx:if="{{feedbackMode === \'backup\'}}"'), 'backup feedback should render a dedicated backup type row')
  assert(feedbackWxml.includes('class="category-option active locked"'), 'backup feedback type should be locked')
  assert(feedbackWxml.includes('备份图片 <text class="required">*</text>'), 'backup feedback should require backup images')
  const backupFeedbackBlock = feedbackWxml.slice(feedbackWxml.indexOf('wx:if="{{category === \'backup\'}}"'), feedbackWxml.indexOf('<!-- Patch 异常'))
  assert(!backupFeedbackBlock.includes('补充对比'), 'backup feedback should not ask for supplemental comparison images')
  assert(!backupFeedbackBlock.includes('data-group="before"'), 'backup feedback should only upload backup images')
  assert(feedbackWxml.includes('提交备份资料'), 'backup feedback should use archive wording on submit')

  assert(adminJs.includes("{ value: 'backup', label: '备份资料' }"), 'admin category options should include backup')
  assert(adminJs.includes('function getScopedCategoryOptions(category)'), 'admin detail edit flows should scope category options by archive mode')
  assert(adminJs.includes('if (!canUseScopedCategory(this.data.approveCategoryOptions, category)) return'), 'admin feedback approval should reject category switches outside its mode')
  assert(adminJs.includes('if (!canUseScopedCategory(this.data.correctionEditCategoryOptions, category)) return'), 'admin card edit should reject category switches outside its mode')
  assert(adminJs.includes("feedbackCategory === 'backup' ? 'archived' : 'confirmed'"), 'approved backup feedback should default to archived status')
  assert(adminJs.includes("category === 'backup' ? 'archived' : form.status"), 'edited backup cards should stay archived')
  assert(adminOps.includes("cleanCardInfo.category === 'backup' ? 'archived' : (cleanCardInfo.cardStatus || 'confirmed')"), 'cloud approval should store approved backup cards as archived')
  assert(adminWxml.includes("approveForm.category === 'backup' ? '备份资料' : '异常结论'"), 'admin approval modal should use backup wording')
  assert(adminWxml.includes('wx:for="{{approveCategoryOptions}}"'), 'admin feedback approval should not render global category options')
  assert(adminWxml.includes('approveForm.category !== \'backup\''), 'admin approval modal should hide conclusion level for backup')
  assert(adminWxml.includes("correctionEditForm.category === 'backup' ? '备份资料' : '异常结论'"), 'admin edit modal should use backup wording')
  assert(adminWxml.includes('wx:for="{{correctionEditCategoryOptions}}"'), 'admin card edit should not render global category options')

  assert(detailJs.includes("category === 'backup' ? 'archived' : form.status"), 'detail admin edit should keep backup cards archived')
  assert(detailJs.includes('function getScopedCategoryOptions(category)'), 'detail card edit should scope category options by archive mode')
  assert(detailJs.includes('if (!canUseScopedCategory(this.data.editCategoryOptions, category)) return'), 'detail card edit should reject category switches outside its mode')
  assert(detailWxml.includes('资料提示：备份资料'), 'backup detail should show a neutral archive warning')
  assert(detailWxml.includes('wx:for="{{editCategoryOptions}}"'), 'detail card edit should not render global category options')
  assert(detailWxml.includes("card.category === 'backup' ? '备份说明' : '问题说明'"), 'backup detail should use backup note labels')
  assert(detailWxml.includes("card.category === 'backup' ? '本资料仅用于记录公开出现过的卡片状态"), 'backup detail should use neutral reference wording')
  assert(detailWxss.includes('.warning-archive'), 'backup detail warning should have archive styling')
  assert(rules.includes('`备份资料` 入口'), 'product rules should document the backup archive module')
  assert(rules.includes("`category: 'backup'`"), 'product rules should document the backup data category')
  assert(rules.includes('异常卡和备份资料是独立模式'), 'product rules should document independent abnormal and backup edit modes')
})

test('feedback submission warns when a likely duplicate problem card exists', () => {
  const js = read('miniprogram-card/pages/feedback/feedback.js')
  assert(js.includes('function normalizeDuplicateText'))
  assert(js.includes('findDuplicateCandidates'))
  assert(js.includes('confirmDuplicateIfNeeded'))
  assert(js.includes('可能重复'))
  assert(js.includes('继续反馈'))
})

test('feedback submission keeps optional public user id separate from source', () => {
  const js = read('miniprogram-card/pages/feedback/feedback.js')
  const wxml = read('miniprogram-card/pages/feedback/feedback.wxml')
  const adminJs = read('miniprogram-card/pages/admin/admin.js')
  const adminWxml = read('miniprogram-card/pages/admin/admin.wxml')
  const adminOps = read('miniprogram-card/cloudfunctions/adminOps/index.js')
  const detailWxml = read('miniprogram-card/pages/detail/detail.wxml')
  assert(js.includes('loadPublicUserProfile'), 'feedback page should load the same public id profile as series uploads')
  assert(js.includes('ensureFeedbackPublicUserId'), 'feedback submit should normalize the optional public id')
  assert(js.includes("if (!publicId) return ''"), 'feedback public id should be optional')
  assert(js.includes('publicUserIdLocked: !!publicId'), 'existing public id should be locked in feedback forms')
  assert(!js.includes('请填写反馈用户 ID'), 'feedback public id should not be required')
  assert(js.includes('if (this.data.publicUserId) return this.data.publicUserId'), 'existing public id should still be submitted while the field is hidden')
  assert(js.includes('submitterPublicId'), 'feedback records should store public id separately')
  assert(!js.includes('请填写厂商'), 'feedback card info should no longer require brand')
  assert(!js.includes('请填写年份'), 'feedback card info should no longer require year')
  assert(!js.includes('请填写系列'), 'feedback card info should no longer require series')
  assert(!js.includes('请填写编号'), 'feedback card info should no longer require legacy number')
  assert(wxml.includes('反馈用户 ID'), 'feedback form should ask for a feedback public id')
  assert(wxml.includes('wx:if="{{!publicUserIdLocked}}"'), 'existing feedback public id should hide the feedback user section')
  assert(!wxml.includes('disabled="{{publicUserIdLocked}}"'), 'existing feedback public id should not render a disabled input')
  assert(!wxml.includes('反馈用户 ID <text class="required">'), 'feedback public id label should not be marked required')
  assert(wxml.includes('资料来源'), 'source field should remain separate')
  assert(adminJs.includes('submitterPublicId: approveForm.submitterPublicId'), 'approval should carry public id through cardInfo')
  assert(adminWxml.includes('反馈用户'), 'admin detail should display the feedback public id')
  assert(adminOps.includes('submitterPublicId: cleanCardInfo.submitterPublicId || feedback.submitterPublicId ||'), 'approved cards should keep public id')
  assert(detailWxml.includes('card.submitterPublicId'), 'problem card detail should display public id separately from source')
})

test('problem card detail source supports long-press copy', () => {
  const detailWxml = read('miniprogram-card/pages/detail/detail.wxml')
  const detailJs = read('miniprogram-card/pages/detail/detail.js')
  assert(detailWxml.includes('bindlongpress="copySource"'), 'problem card source should support long-press copy')
  assert(detailWxml.includes('user-select="{{true}}"'), 'problem card source should be text-selectable')
  assertInOrder(detailWxml, ['资料来源', '创建时间', '最近更新'], 'problem card detail should keep time fields after source')
  assert(detailJs.includes("title: '已复制来源'"), 'copy toast should work for all source text, not only links')
})

test('problem card feedback copy uses anomaly feedback wording', () => {
  const feedbackJson = read('miniprogram-card/pages/feedback/feedback.json')
  const feedbackWxml = read('miniprogram-card/pages/feedback/feedback.wxml')
  const feedbackJs = read('miniprogram-card/pages/feedback/feedback.js')
  const indexWxml = read('miniprogram-card/pages/index/index.wxml')
  const guideWxml = read('miniprogram-card/pages/guide/guide.wxml')
  const adminWxml = read('miniprogram-card/pages/admin/admin.wxml')
  const adminWxss = read('miniprogram-card/pages/admin/admin.wxss')
  const adminJs = read('miniprogram-card/pages/admin/admin.js')
  const detailWxml = read('miniprogram-card/pages/detail/detail.wxml')
  assert(feedbackJson.includes('反馈异常卡片'), 'feedback page title should use anomaly feedback wording')
  assert(indexWxml.includes('反馈异常卡片'), 'home entry should use anomaly feedback wording')
  assert(guideWxml.includes('如何反馈异常卡片？'), 'guide should explain anomaly feedback')
  assert(feedbackWxml.includes('反馈人信息'), 'feedback form should use feedback submitter wording')
  assert(feedbackWxml.includes('提交异常反馈'), 'primary button should describe the submit action clearly')
  assert(feedbackJs.includes('反馈已提交'), 'success toast should use feedback wording')
  assert(feedbackJs.includes('反馈失败，请重试'), 'failure toast should use feedback wording')
  assert(adminWxml.includes('总反馈'), 'admin stats should use feedback wording')
  assert(adminWxml.includes('异常反馈'), 'admin tab should use anomaly feedback wording')
  assert(adminWxml.includes('暂无异常反馈'), 'admin empty state should use feedback wording')
  assert(adminJs.includes('这条异常反馈'), 'admin reject dialog should use feedback wording')
  assert(adminWxss.includes('padding: 18rpx 4rpx 22rpx;') && adminWxss.includes('bottom: 10rpx;'), 'admin main tab underline should sit close to the active label')
  assert(detailWxml.includes('反馈资料修正'), 'detail correction modal should avoid submit-material wording')
  assert(!indexWxml.includes('提交资料'), 'home entry should not use old submit-material wording')
  assert(!adminWxml.includes('资料提交'), 'admin tab and comments should not use old submit-material wording')
})

test('admin and detail edit modals reserve footer space on real devices', () => {
  const adminWxml = read('miniprogram-card/pages/admin/admin.wxml')
  const adminWxss = read('miniprogram-card/pages/admin/admin.wxss')
  const detailWxss = read('miniprogram-card/pages/detail/detail.wxss')
  assert(adminWxml.includes('modal-panel detail-modal-panel'), 'admin feedback detail modal should use a fixed-height scroll panel')
  assert(adminWxml.includes('modal-body detail-modal-body'), 'admin feedback detail modal should give scroll-view a dedicated body class')
  assert(!adminWxml.includes('wx:if="{{showModal}}" bindtap="closeModal" catchtouchmove="noop"'), 'admin feedback detail mask should not swallow inner scroll gestures')
  assert(adminWxss.includes('.detail-modal-panel {\n  height: 85vh;\n  max-height: 85vh;'), 'admin feedback detail modal should have a definite viewport height')
  assert(adminWxss.includes('.detail-modal-body {\n  flex: 1;\n  height: 0;\n  min-height: 0;'), 'admin feedback detail scroll-view should have a resolvable flex height')
  assert(adminWxss.includes('.approve-panel {\n  height: 90vh;'), 'admin upload/edit modals should have a fixed flex height')
  assert(adminWxss.includes('min-height: 0;'), 'admin modal scroll body should be allowed to shrink inside flex layout')
  assert(adminWxss.includes('.approve-form {\n  padding-bottom: 180rpx;'), 'admin form content should leave room above the fixed footer')
  assert(adminWxss.includes('.modal-footer .submit-approve {\n  width: 100%;\n  max-width: 560rpx;'), 'admin modal footer button should be centered with stable width')
  assert(detailWxss.includes('.edit-panel {\n  width: 100%;\n  height: 85vh;'), 'detail edit modal should have a fixed flex height')
  assert(detailWxss.includes('.edit-modal-body {\n  max-height: none;'), 'detail edit modal body should not use a competing viewport max-height')
  assert(detailWxss.includes('.edit-form {\n  padding-top: 0;\n  padding-bottom: 180rpx;'), 'detail edit form should leave room above the fixed footer')
  assert(detailWxss.includes('.save-edit-btn {\n  width: 100%;\n  max-width: 560rpx;'), 'detail edit save button should be centered with stable width')
})

test('admin and detail edit modals use feedback-style section cards', () => {
  const adminWxss = read('miniprogram-card/pages/admin/admin.wxss')
  const detailWxss = read('miniprogram-card/pages/detail/detail.wxss')
  assert(adminWxss.includes('background: #f5f7fa;'), 'admin modal body should use a soft gray form background')
  assert(adminWxss.includes('.modal-section {\n  padding: 32rpx;\n  margin-bottom: 24rpx;\n  background: #fff;\n  border-radius: 20rpx;'), 'admin modal sections should render as card blocks')
  assert(adminWxss.includes('border-left: 6rpx solid #667eea;'), 'admin section titles should match feedback page hierarchy')
  assert(detailWxss.includes('background: #f5f7fa;'), 'detail modal body should use a soft gray form background')
  assert(detailWxss.includes('.modal-section {\n  padding: 32rpx;\n  margin-bottom: 24rpx;\n  background: #fff;\n  border-radius: 20rpx;'), 'detail modal sections should render as card blocks')
  assert(detailWxss.includes('border-left: 6rpx solid #667eea;'), 'detail section titles should match feedback page hierarchy')
})

test('card image uploads support front back and detail images', () => {
  const seriesJs = read('miniprogram-card/pages/collection-series/collection-series.js')
  const seriesWxml = read('miniprogram-card/pages/collection-series/collection-series.wxml')
  const myJs = read('miniprogram-card/pages/my-collection/my-collection.js')
  const myWxml = read('miniprogram-card/pages/my-collection/my-collection.wxml')
  const detailJs = read('miniprogram-card/pages/collection-card-detail/collection-card-detail.js')
  const seriesOps = read('miniprogram-card/cloudfunctions/seriesOps/index.js')
  assert(seriesJs.includes('detailImageUrls: []'), 'series image metadata should include detail image URLs')
  assert(seriesJs.includes('_buildUploadItemsFromSelectedFiles'), 'series upload should map one multi-select batch to one card image record')
  assert(seriesJs.includes('item.backTempFilePath = paths[1] ||'), 'second selected image should default to back image')
  assert(seriesJs.includes('item.detailTempFilePaths = paths.slice(2)'), 'remaining selected images should default to detail images')
  assert(seriesWxml.includes('细节图'), 'series upload modal should expose detail images')
  assert(seriesWxml.includes('chooseUploadItemDetails'), 'series upload modal should allow adding detail images')
  assert(myJs.includes("const count = field === 'imageUrl' ? 9 : 1"), 'my collection front image picker should support multi-select')
  assert(myJs.includes("'form.detailImageUrls': paths.slice(2)"), 'my collection multi-select should map remaining images to details')
  assert(myWxml.includes('chooseDetailImages'), 'my collection modal should allow detail images')
  assert(detailJs.includes('img.detailImageUrls'), 'collection card detail should include detail images in the carousel')
  assert(seriesOps.includes('detailImageUrls: Array.isArray(input.detailImageUrls)'), 'cloud function should persist user card detail image URLs')
})

test('collection series can export whole series or one card kind image grid', () => {
  const seriesJs = read('miniprogram-card/pages/collection-series/collection-series.js')
  const seriesWxml = read('miniprogram-card/pages/collection-series/collection-series.wxml')
  const seriesWxss = read('miniprogram-card/pages/collection-series/collection-series.wxss')
  const rules = read('miniprogram-card/PRODUCT_RULES.md')
  assert(seriesJs.includes('showSeriesExportModal'), 'collection detail should keep export modal state')
  assert(seriesJs.includes('openSeriesExportModal'), 'collection detail should expose a whole-series export entry')
  assert(seriesJs.includes('openCardKindExportModal'), 'collection detail should expose a card-kind export entry')
  assert(seriesJs.includes('_collectExportImages'), 'collection export should collect images by scope and ownership')
  assert(seriesJs.includes('exportImageFace'), 'collection export should choose front or back image')
  assert(seriesJs.includes('exportOwnedScope'), 'collection export should choose all or owned images')
  assert(seriesJs.includes('exportMissingMode'), 'collection export should choose whether missing cards become placeholders')
  assert(seriesJs.includes('exportAutoGridColumns'), 'collection export should expose the resolved automatic grid column layout')
  assert(seriesJs.includes('exportLayoutHintText'), 'collection export should explain the automatic layout')
  assert(seriesJs.includes('function normalizeExportGridColumns'), 'collection export should normalize column limits by image face mode')
  assert(seriesJs.includes("return imageFace === 'both' ? SERIES_EXPORT_MAX_COLUMNS_BOTH : SERIES_EXPORT_MAX_COLUMNS_FRONT"), 'front-back export should cap layout separately from front-only exports')
  assert(seriesJs.includes('const SERIES_EXPORT_MAX_COLUMNS_FRONT = 6'), 'front-only export should allow wide automatic layouts')
  assert(seriesJs.includes('const SERIES_EXPORT_MAX_COLUMNS_BOTH = 3'), 'front-back export should cap layout at 3 columns')
  assert(seriesJs.includes("backInfo: imageFace === 'both' && entry && entry.backUrl"), 'front-back export should load back images when available')
  assert(seriesJs.includes('drawExportImageSide(ctx, image, info, sideX, top'), 'front-back export should draw front and back sides inside one card cell')
  assert(seriesJs.includes('SERIES_EXPORT_MAX_CANVAS_WIDTH'), 'export canvas should be allowed to grow beyond the old fixed width')
  assert(seriesJs.includes('buildSeriesExportCanvasLayout(infos, safeColumns, imageFace,'), 'export should size the canvas from image dimensions and selected columns')
  assert(seriesJs.includes('findMaxFittingExportSideWidth('), 'export should fit cell width to canvas limits')
  assert(seriesJs.includes('getSeriesExportPixelBudget(entryCount, imageFace, options)'), 'export should choose automatic layouts within a pixel budget')
  assert(!seriesJs.includes('const canvasWidth = 900'), 'export should not squeeze every column layout into a fixed 900px canvas')
  assert(seriesJs.includes('getCanvas2DContext(\'#seriesExportCanvas\''), 'collection export should use Canvas 2D node API')
  assert(seriesJs.includes('exportingSeriesImages'), 'exports should track a page-level running state')
  assert(seriesJs.includes('exportProgressText'), 'exports should expose real-time progress')
  assert(seriesWxml.includes('series-export-overlay'), 'exports should show an in-page progress overlay')
  assert(seriesWxml.includes('cancelSeriesExport'), 'exports should allow cancellation')
  assert(seriesWxml.includes('bindtap="openSeriesExportModal">导出图鉴'), 'action bar should render the whole-series export button')
  assert(seriesWxml.includes('openCardKindExportModal'), 'card-kind rows should render an export button')
  assert(seriesWxml.includes('card._exportableImageCount > 0'), 'card-kind export should use the normalized card image count')
  assert(!seriesWxml.includes('fixed-grid-export-btn'), 'fixed card slots should not render per-slot export buttons')
  assert(!seriesWxss.includes('.fixed-grid-export-btn'), 'fixed slot export button styles should be removed')
  assert(seriesWxml.includes('series-export-option'), 'export modal should render selectable export options')
  assert(seriesWxml.includes('data-field="exportMissingMode"'), 'export modal should expose missing-card display options')
  assert(seriesWxml.includes('data-value="placeholder"'), 'export modal should allow blank placeholders for missing cards')
  assert(seriesWxml.includes('data-value="both"'), 'export modal should expose a front-back combined option')
  assert(seriesWxml.includes('data-field="exportOutputMode"'), 'export modal should expose output mode options')
  assert(seriesWxml.includes('data-value="paged"'), 'export modal should expose high-quality paged output')
  assert(seriesWxml.includes('exportLayoutHintText'), 'export modal should show automatic layout hints')
  assert(seriesWxml.includes('<canvas type="2d" id="seriesExportCanvas"'), 'export should provide a hidden Canvas 2D node')
  assert(seriesWxss.includes('.series-export-canvas'), 'hidden export canvas should be styled off screen')
  assert(seriesWxss.includes('.series-export-overlay'), 'export progress overlay should be styled')
  assert(seriesJs.includes('planSeriesExportPagedChunks(exportEntries.length, imageFace, previewOptions)'), 'paged collection exports should split work into safe canvas pages')
  assert(seriesJs.includes('resolveProbedSeriesExportLayout('), 'single-image exports should probe saveable canvas layouts')
  assert(seriesJs.includes('_runSeriesPagedImageExport(exportEntries)'), 'paged export should use a dedicated async runner')
  assert(seriesJs.includes('_runSeriesImageExport(exportEntries)'), 'single-image export should use a dedicated async runner')
  assert(seriesJs.includes("title: '导出完成'"), 'paged collection exports should tell the user multiple images were saved when needed')
  assert(seriesJs.includes('saveImageToPhotosAlbumWithPermission(tempFilePath)'), 'collection export should retry through album permission handling on real phones')
  assert(seriesJs.includes("title: '需要相册权限'"), 'collection export should guide users to enable album permission')
  assert(seriesJs.includes("title: '导出失败'"), 'collection export failures should use a modal instead of a long toast')
  assert(!seriesJs.includes("wx.showToast({ title: '导出失败，请检查相册权限'"), 'collection export should not collapse all failures into the old permission toast')
  assert(seriesJs.includes('drawExportMissingPlaceholder'), 'export canvas should draw blank placeholders for missing cards')
  assert(seriesJs.includes('ctx.moveTo(centerX - plusSize / 2, centerY)'), 'missing-card placeholder should use a plus icon')
  assert(!seriesJs.includes("ctx.fillText('待补图'"), 'missing-card placeholder should not draw text')
  assert(seriesJs.includes('if (entry.placeholder)'), 'placeholder entries should skip image loading')
  assert(seriesJs.includes('_getExportContextPlayerName'), 'export labels should know whether the current scope already identifies one player')
  assert(seriesJs.includes('_getExportImagePlayerName'), 'export labels should include the player English name when needed')
  assert(seriesJs.includes('[number, includePlayer ? playerName : \'\']'), 'export labels should keep number and English name on one line')
  assert(!seriesJs.includes('const metaText = ['), 'export canvas should not draw the description line under the title')
  assert(rules.includes('不再让用户手选列数'), 'product rules should document automatic export layout')
  assert(rules.includes('正面模式最多 6 列'), 'product rules should document the front-only column cap')
  assert(rules.includes('正面+背面'), 'product rules should document combined front-back export')
  assert(rules.includes('缺卡不展示或空白占位'), 'product rules should document missing-card export behavior')
  assert(rules.includes('正面+背面模式最多 3 列'), 'product rules should document the front-back column cap')
  assert(rules.includes('导出画布需要按图片原始尺寸和自动布局动态放大'), 'product rules should document high-resolution export sizing')
  assert(rules.includes('当前页面展示 loading 遮罩和实时进度'), 'product rules should document the export progress overlay')

  const page = loadCollectionSeriesPageForTest()
  const instance = {
    ...page,
    data: {
      ...(page.data || {}),
      isFreeMode: false,
      exportScope: 'card',
      exportTargetIdx: 0,
      exportImageFace: 'front',
      exportOwnedScope: 'all',
      exportMissingMode: 'placeholder',
      series: {
        name: '2014-15 Panini Flawless Greats Dual Memorabilia Autographs',
        checklist: [
          {
            text: 'GDM-AD Adrian Dantley',
            subset: 'Base',
            printRun: 25,
            completionTarget: 25,
            images: [{ url: 'cloud://front-1.png', serialNumber: '1/25', player: 'Adrian Dantley' }]
          },
          {
            text: 'Other Card',
            subset: 'Base',
            printRun: 902,
            completionTarget: 902,
            images: []
          }
        ]
      }
    },
    _openid: 'me',
    _playersRoster: [],
    _playersList: [],
    setData(patch) { this.data = { ...this.data, ...patch } },
    _normalizeImages(images = []) { return images },
    _sortImages(images = []) { return images }
  }
  const cardEntries = instance._collectExportImages()
  assert.strictEqual(cardEntries.length, 25, 'card-kind placeholder export should only use the selected card kind target')
  assert(cardEntries.some(entry => entry.placeholder && entry.label.includes('25/25')), 'card-kind placeholder export should fill only the selected print-run slots')
  const pagePlan = instance._buildSeriesExportPagingPlan(cardEntries, 5, 'front')
  assert.strictEqual(pagePlan.total, 25, 'card-kind paging estimate should use only selected card-kind entries')
  assert.strictEqual(pagePlan.layout && pagePlan.layout.columns, 5, 'five-column card-kind export should keep the selected small-set layout')
  instance.openCardKindExportModal({ currentTarget: { dataset: { idx: 0 } } })
  assert.strictEqual(instance.data.exportTargetTitle, 'Base · GDM-AD Adrian Dantley', 'card-kind export title should include the current subset context')
})

test('grouped fixed-slot hold actions ask which concrete image to update', () => {
  const seriesJs = read('miniprogram-card/pages/collection-series/collection-series.js')
  assert(seriesJs.includes("this._openChecklistImageChoice(idx, 'hold'"), 'grouped long-press hold should open image chooser')
  assert(seriesJs.includes("action === 'hold' ? '选择要标记持有的图片'"), 'image chooser should label hold selection explicitly')
  assert(seriesJs.includes("if (action === 'hold')"), 'image chooser runner should handle hold action')
  assert(seriesJs.includes('this._handleHoldLongPress(img.url, context.item, context.idx, false)'), 'hold action should target the selected image URL')
})

test('repurchase saves skip duplicate prompt while normal add and edit keep duplicate checks', () => {
  const myCollectionJs = read('miniprogram-card/pages/my-collection/my-collection.js')
  const seriesDetailJs = read('miniprogram-card/pages/my-collection-series-detail/my-collection-series-detail.js')
  ;[myCollectionJs, seriesDetailJs].forEach(source => {
    const confirmStart = source.indexOf('confirmDuplicateIfNeeded(form, duplicate = null)')
    assert(confirmStart >= 0, 'duplicate confirmation method should exist')
    const confirmBody = source.slice(confirmStart, source.indexOf('\n  async saveItem', confirmStart))
    assert(confirmBody.includes('this.data.repurchaseSourceId'), 'duplicate confirmation should know the repurchase flow')
    assert(confirmBody.includes('return Promise.resolve(true)'), 'repurchase duplicate checks should resolve without prompting')
    assert(source.includes('const duplicate = this.findDuplicateItemForForm(form, editingId)'), 'normal saves should still build exact duplicate candidates')
  })
})

test('item money visibility updates rendered rows without rebuilding paged lists', () => {
  const myCollectionJs = read('miniprogram-card/pages/my-collection/my-collection.js')
  const seriesDetailJs = read('miniprogram-card/pages/my-collection-series-detail/my-collection-series-detail.js')
  ;[myCollectionJs, seriesDetailJs].forEach(source => {
    assert(source.includes('_refreshMoneyVisibilityOnly'), 'page should expose a money-only refresh helper')
    const toggleStart = source.indexOf('toggleItemMoneyVisible(e)')
    assert(toggleStart >= 0, 'item money toggle should exist')
    const toggleBody = source.slice(toggleStart, source.indexOf('\n  async loadData', toggleStart) > 0 ? source.indexOf('\n  async loadData', toggleStart) : source.indexOf('\n  openDashboard', toggleStart))
    assert(toggleBody.includes('_refreshMoneyVisibilityOnly'), 'item money toggle should refresh rendered money flags only')
    assert(!toggleBody.includes('applyFilter()'), 'item money toggle should not rebuild filter pages and scroll position')
  })
})

test('my collection first paint only waits for ledger items', () => {
  const homeJs = read('miniprogram-card/pages/my-collection/my-collection.js')
  const detailJs = read('miniprogram-card/pages/my-collection-series-detail/my-collection-series-detail.js')
  const homeWxml = read('miniprogram-card/pages/my-collection/my-collection.wxml')
  const rules = read('miniprogram-card/PRODUCT_RULES.md')
  ;[
    ['my collection', homeJs],
    ['my collection series detail', detailJs]
  ].forEach(([name, source]) => {
    const loadStart = source.indexOf('async loadData(')
    const syncRefreshEnd = source.indexOf('\n  refreshLedgerItemsLocally', loadStart)
    const asyncRefreshEnd = source.indexOf('\n  async refreshLedgerItemsLocally', loadStart)
    const loadEnd = syncRefreshEnd >= 0 ? syncRefreshEnd : asyncRefreshEnd
    const loadBody = source.slice(loadStart, loadEnd)
    assert(loadBody.includes('const ledgerItems = await colData.loadUserCardItems(this._openid)'), `${name} first paint should wait only for user_card_items`)
    assert(!loadBody.includes('await this.loadSuggestData()'), `${name} first paint should not wait for suggestion data`)
    assert(!loadBody.includes('this.loadLegacyHoldings()'), `${name} first paint should not scan legacy holdings`)
    assert(!loadBody.includes('await this.enrichLedgerItemsWithCurrentSeriesImages'), `${name} first paint should not fully hydrate series images`)
    assert(source.includes('loadSuggestDataDeferred()'), `${name} should defer suggestion loading`)
    assert(source.includes("const isMissingPurchaseFilter = activeStatus === 'missingPurchase'"), `${name} should load legacy holdings only on missing-purchase demand`)
    assert(source.includes('scheduleVisibleSeriesImageHydration(ledger.slice(0, DISPLAY_PAGE_SIZE)'), `${name} should hydrate only the visible first page`)
  })
  assert(homeJs.includes('buildFirstPaintListState(formatted)'), 'my collection home should build a visible-card first paint state immediately after ledger data returns')
  assert(homeJs.includes('displayItems: visibleLedger'), 'my collection home should render visible cards before full same-card grouping finishes')
  assert(homeJs.includes('setTimeout(() => {'), 'my collection home should move full grouping and summary hydration out of the first paint path')
  assert(homeJs.includes('deferAggregates: true'), 'my collection home should defer money and series aggregates after first paint')
  assert(homeJs.includes('scheduleDeferredSeriesAggregates'), 'my collection home should compute series grouping after first paint')
  assert(homeJs.includes('this.loadData({ silent: true }).catch'), 'my collection home should refresh data in the background when returning to the page')
  assert(homeJs.includes('const silent = options.silent === true'), 'my collection home should keep current rows visible during return-page refresh')
  assert(homeJs.includes('statsHydrating'), 'my collection home should track deferred money summary hydration')
  assert(homeWxml.includes('!statsHydrating || statsCacheReady'), 'my collection money fields should keep a silent placeholder when no cached totals exist')
  assert(!homeWxml.includes('计算中'), 'my collection should not expose internal aggregate calculation text')
  assert(!homeWxml.includes('正在整理图鉴汇总'), 'my collection series aggregation should be silent')
  assert(homeWxml.includes('!seriesAggregating && seriesGroups.length === 0'), 'my collection should only show empty series state after aggregation finishes')
  assert(rules.includes('首屏只允许阻塞读取 `user_card_items`'), 'product rules should document first-paint loading constraints')
  assert(rules.includes('先渲染当前筛选下的可见卡片列表'), 'product rules should require list-first rendering before money and series summaries')
  assert(rules.includes('最多只允许对当前可见的前 30 条记录做后台补全'), 'product rules should document bounded background hydration')
})

test('my collection mutations refresh the affected ledger rows locally', () => {
  const sources = [
    ['my collection', read('miniprogram-card/pages/my-collection/my-collection.js')],
    ['my collection series detail', read('miniprogram-card/pages/my-collection-series-detail/my-collection-series-detail.js')]
  ]
  const rules = read('miniprogram-card/PRODUCT_RULES.md')
  sources.forEach(([name, source]) => {
    assert(source.includes('refreshLedgerItemsLocally(items, options = {})'), `${name} should expose a local ledger refresh helper`)
    assert(source.includes('upsertLedgerItemsLocally(items = [], options = {})'), `${name} should upsert changed ledger records locally`)
    assert(source.includes('removeLedgerItemLocally(id)'), `${name} should remove deleted ledger records locally`)
    assert(source.includes('preserveVisibleCount'), `${name} local refreshes should preserve the current rendered page size`)
    assert(source.includes('delete next.groupQuantity'), `${name} local refreshes should clear stale same-card quantity stats`)
    assert(source.includes('const localRefreshReady = changedItems.length > 0 && changedItems.every(item => item && item._id)'), `${name} save should verify all changed records can be merged locally`)
    assert(source.includes('const usedLocalRefresh = localRefreshReady && this.upsertLedgerItemsLocally(changedItems)'), `${name} save should attempt a local refresh before reloading`)
    assert(source.includes('if (!usedLocalRefresh) await this.loadData()'), `${name} save should only fall back to full reload when the cloud result is missing`)
    assert(source.includes('if (!this.removeLedgerItemLocally(id)) await this.loadData()'), `${name} delete should only fall back to full reload when the row is missing locally`)
    assert(source.includes('if (!this.upsertLedgerItemsLocally(result && result.item)) await this.loadData()'), `${name} series link should update the linked row locally`)
  })
  assert(sources[1][1].includes('this._allLedgerItems = formatted'), 'series detail should refresh from the full ledger cache before filtering the current group')
  assert(rules.includes('我的卡片列表或图鉴聚合明细里编辑、关联图鉴、删除等单条台账变更成功后，优先局部更新当前列表、分组和统计'), 'product rules should document local refresh for my collection mutations')
})

test('collection image uploads use review status and reviewer permissions', () => {
  const seriesAccess = read('miniprogram-card/utils/seriesAccess.js')
  const cloudAccess = read('miniprogram-card/cloudfunctions/seriesOps/accessPolicy.js')
  const cloudOps = read('miniprogram-card/cloudfunctions/seriesOps/index.js')
  const seriesJs = read('miniprogram-card/pages/collection-series/collection-series.js')
  const seriesWxml = read('miniprogram-card/pages/collection-series/collection-series.wxml')
  const seriesReviewJs = read('miniprogram-card/pages/series-review/series-review.js')
  const appJson = read('miniprogram-card/app.json')
  const detailJs = read('miniprogram-card/pages/collection-card-detail/collection-card-detail.js')
  const detailWxml = read('miniprogram-card/pages/collection-card-detail/collection-card-detail.wxml')
  const anomalyDetailJs = read('miniprogram-card/pages/detail/detail.js')
  const rules = read('miniprogram-card/PRODUCT_RULES.md')

  ;[seriesAccess, cloudAccess].forEach(source => {
    assert(source.includes('function canReviewSeriesImages'), 'review permission helper should be shared by client and cloud')
    assert(source.includes('return isSeriesCreator(series, openid)'), 'series creators should be allowed to review uploaded images')
  })
  assert(cloudOps.includes("const IMAGE_REVIEW_STATUS_VALUES = ['pending', 'approved', 'rejected']"), 'cloud should normalize image review statuses')
  assert(cloudOps.includes('prepareSeriesImagesForWrite(series'), 'cloud writes should override client supplied review fields')
  assert(cloudOps.includes('async function reviewSeriesImage'), 'cloud should expose an image review action')
  assert(cloudOps.includes("if (action === 'reviewSeriesImage')"), 'seriesOps should route image review requests')
  assert(seriesJs.includes('_buildNewImageReviewFields()'), 'new uploads should get create/update time and review state')
  assert(seriesJs.includes("reviewStatus: canReview ? 'approved' : 'pending'"), 'non-reviewer uploads should enter pending review')
  assert(appJson.includes('"root": "pages/series-review"'), 'review center should be registered')
  assert(seriesWxml.includes('bindtap="goReviewCenter"'), 'series detail should expose a unified review entry')
  assert(seriesReviewJs.includes('loadImageReviewItems'), 'review center should load pending image reviews')
  assert(seriesReviewJs.includes('reviewSeriesImage'), 'review center should submit image review decisions')
  assert(detailJs.includes('reviewCurrentSeriesImage'), 'card detail should allow reviewers to finish pending review')
  assert(detailWxml.includes('审核状态'), 'card detail should display review status')
  assert(detailWxml.includes('创建时间'), 'card detail should display create time')
  assert(detailWxml.includes('最近更新'), 'card detail should display update time')
  assert(detailJs.includes('_hasMissingCardInfo(displayMeta'), 'card detail should detect missing core fields from displayed metadata')
  assert(detailWxml.includes('wx:if="{{canSuggestQuality}}"'), 'card detail should show supplement entry when core fields are missing')
  assert(detailWxml.includes('wx:if="{{canEdit}}"'), 'card detail should show edit entry only after core fields are complete')
  assert(detailJs.includes('_buildDetailActionState(displayMeta'), 'card detail should centralize source-agnostic action rules')
  assert(detailJs.includes('canSuggestQuality: hasMissingCardInfo'), 'supplement entry should be visible to every user when core fields are missing')
  assert(detailJs.includes('canEdit: !!(this._isAdmin && !hasMissingCardInfo)'), 'edit entry should only be visible to admins after core fields are complete')
  assert(rules.includes('无论从 `我的卡片`、`图鉴`、`公开卡册` 或分享入口进入'), 'product rules should require one source-agnostic card detail action model')
  assert(detailJs.includes("!['-', '未填', '未记录', '空'].includes(text)"), 'card detail should treat display placeholders as missing')
  assert(detailJs.includes('displayMeta.displayProductNumber'), 'card detail should check the split product card number field')
  assert(detailJs.includes('displayMeta.displaySerialNumber'), 'card detail should check the split serial number field')
  const detailMetaGrid = detailWxml.slice(detailWxml.indexOf('<view class="meta-grid">'), detailWxml.indexOf('</view>\n      </view>\n      <view wx:if="{{samePublicHolderVisible}}"'))
  assertInOrder(detailMetaGrid, ['限编', '特色', '来源', '上传用户', '审核状态', '持有人', '创建时间', '最近更新'], 'card detail meta fields should keep serial/features/source/uploader/review/holder/time order')
  assert(!detailMetaGrid.includes('meta-item meta-full'), 'card detail feature chips should stay in the normal two-column grid after serial number')
  assert(detailJs.includes('inferCreateTimeFromObjectId'), 'historical card details should infer create time from ObjectId when explicit fields are absent')
  assert(anomalyDetailJs.includes('id.slice(8, 16)'), 'historical anomaly cards should infer create time from CloudBase 32-char document ids')
  assert(detailJs.includes('id.slice(8, 16)'), 'card detail should infer create time from CloudBase 32-char document ids')
  assert(anomalyDetailJs.includes('getFeedbackById(raw.feedbackId)'), 'historical anomaly cards approved from feedback should fall back to feedback timestamps')
  assert(detailJs.includes("['createTime', 'createdAt', '_createTime'"), 'card detail should read common create-time fields')
  assert(detailJs.includes("['updateTime', 'updatedAt', '_updateTime'"), 'card detail should read common update-time fields')
  assert(rules.includes('其他用户上传的图片默认审核中'), 'product rules should document upload review status')
})

test('card profile id is persisted across card detail sources', () => {
  const cloudOps = read('miniprogram-card/cloudfunctions/seriesOps/index.js')
  const adminOps = read('miniprogram-card/cloudfunctions/adminOps/index.js')
  const ledgerMatcher = read('miniprogram-card/cloudfunctions/seriesOps/ledgerMatcher.js')
  const collectionData = read('miniprogram-card/utils/collectionData.js')
  const detailJs = read('miniprogram-card/pages/collection-card-detail/collection-card-detail.js')
  const rules = read('miniprogram-card/PRODUCT_RULES.md')

  assert(cloudOps.includes("const cardProfilesCol = db.collection('card_profiles')"), 'seriesOps should use card_profiles')
  assert(cloudOps.includes('function buildCardProfileKey'), 'seriesOps should build a stable card profile key')
  assert(cloudOps.includes('async function ensureCardProfile'), 'seriesOps should create or match card profiles')
  assert(cloudOps.includes('async function backfillCardProfiles'), 'seriesOps should expose a historical backfill')
  assert(cloudOps.includes('function normalizeBackfillPhase'), 'profile backfill should run in resumable phases')
  assert(cloudOps.includes('nextOptions'), 'profile backfill should return continuation options')
  assert(cloudOps.includes('listDocsPage'), 'profile backfill should read small pages instead of full collections')
  assert(!cloudOps.includes('const userItems = await listAllDocs(userCardItemsCol)\\n  for (const item of userItems)'), 'profile backfill should not scan every user card in one invocation')
  assert(cloudOps.includes("if (action === 'getCardProfile')"), 'seriesOps should route profile reads')
  assert(cloudOps.includes("if (action === 'backfillCardProfiles')"), 'seriesOps should route profile backfills')
  assert(cloudOps.includes('cardProfileId: input.cardProfileId ||'), 'user_card_items should persist cardProfileId')
  assert(cloudOps.includes('cardProfileId: rest.cardProfileId ||'), 'series images should persist cardProfileId')
  assert(cloudOps.includes('attachCardProfilesToImages(series'), 'series image writes should attach profile ids')
  assert(cloudOps.includes('ensureCardProfileForUserCardItem(record)'), 'new user cards should attach profile ids')
  assert(cloudOps.includes('ensureCardProfileForUserCardItem(next)'), 'edited user cards should refresh profile ids')
  assert(cloudOps.includes('async function syncCardProfileIdentityGroup'), 'card identity edits should sync same-profile records')
  assert(cloudOps.includes('sourceCardProfileId && identitySync.hasIdentity'), 'card number and version edits should keep the existing profile group')
  assert(adminOps.includes('async function syncCardProfileIdentityGroup'), 'approved card identity corrections should sync same-profile records')
  assert(cloudOps.includes('isAdminOpenid(openid) ? { _id: itemId } : { _id: itemId, openid }'), 'admins should be able to open approval-linked user cards by id')
  assert(ledgerMatcher.includes('cardProfileId: cleanText(existing.cardProfileId) || cleanText(target.cardProfileId)'), 'linking a card to a series image should keep cardProfileId')
  assert(collectionData.includes('async function getCardProfile'), 'data layer should expose card profile reads')
  assert(collectionData.includes('async function backfillCardProfiles'), 'data layer should expose card profile backfill')
  assert(detailJs.includes('_loadCardProfile(cardProfileId'), 'card detail should load a profile by cardProfileId')
  assert(detailJs.includes('_mergeCardProfileIntoImage(image'), 'card detail should merge profile fields into every detail source')
  assert(detailJs.includes('cardProfileId ? this._loadCardProfile(cardProfileId) : Promise.resolve(null)'), 'user/public card details should load profile fallback fields')
  assert(detailJs.includes('let image = this._mergeCardProfileIntoImage(context.image, profile)'), 'user/public card details should merge profile fallback fields')
  assert(rules.includes('系统需要区分 `cardProfileId`、`user_card_items._id` 和图鉴 `imageId`'), 'product rules should document the id boundaries')
  assert(rules.includes('修改某张卡的卡片编号或卡片版本时'), 'product rules should document same-profile card identity sync')
})

test('subpackage-only utilities are no longer kept in the main utils package', () => {
  const rootUtils = [
    'miniprogram-card/utils/cardWikiData.js',
    'miniprogram-card/utils/catalogOptionSuggestions.js',
    'miniprogram-card/utils/pagination.js',
    'miniprogram-card/utils/playerInference.js',
    'miniprogram-card/utils/userCardLedger.js'
  ]
  rootUtils.forEach(file => {
    assert(!fs.existsSync(path.join(root, file)), `${file} should not remain in the main package utils directory`)
  })
  assert(read('miniprogram-card/pages/collection-series/collection-series.js').includes("require('./utils/pagination')"), 'collection series should load pagination from its subpackage')
  assert(read('miniprogram-card/pages/collection-series/collection-series.js').includes('function collectCatalogOptionSuggestions'), 'collection series should keep catalog suggestions local to the page script')
  assert(read('miniprogram-card/pages/card-wiki/card-wiki.js').includes("require('./utils/cardWikiData')"), 'card wiki should load built-in data from its subpackage')
  assert(read('miniprogram-card/pages/my-collection/my-collection.js').includes("require('./utils/userCardLedger')"), 'my collection should load ledger utilities from its subpackage')
  assert(read('miniprogram-card/pages/my-collection/my-collection.js').includes('function collectCatalogOptionSuggestions'), 'my collection should keep catalog suggestions local to the page script')
  assert(read('miniprogram-card/pages/my-collection-series-detail/my-collection-series-detail.js').includes("require('./utils/playerInference')"), 'series ledger detail should load inference utilities from its subpackage')
  assert(read('miniprogram-card/pages/my-collection-series-detail/my-collection-series-detail.js').includes('function collectCatalogOptionSuggestions'), 'series ledger detail should keep catalog suggestions local to the page script')
  assert(read('miniprogram-card/pages/collection-card-detail/collection-card-detail.js').includes('function collectCatalogOptionSuggestions'), 'card detail should keep catalog suggestions local to the page script')
})
