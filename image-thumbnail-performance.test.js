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

test('thumbnail urls use CDN image processing urls for cloud images only', () => {
  const imageUrl = require('../miniprogram-card/utils/imageUrl')
  const fileId = 'cloud://prod-8g8ay186059e4264.7072-prod-8g8ay186059e4264-1418320285/user-card/foo.jpg'

  const thumb = imageUrl.buildThumbnailUrl(fileId, { width: 320, quality: 72 })

  assert.strictEqual(
    thumb,
    'https://7072-prod-8g8ay186059e4264-1418320285.tcb.qcloud.la/user-card/foo.jpg?imageMogr2/thumbnail/320x/quality/72'
  )
  assert.strictEqual(
    imageUrl.buildThumbnailUrl('https://7072-prod-8g8ay186059e4264-1418320285.tcb.qcloud.la/user-card/foo.jpg', { width: 220 }),
    'https://7072-prod-8g8ay186059e4264-1418320285.tcb.qcloud.la/user-card/foo.jpg?imageMogr2/thumbnail/220x/quality/75'
  )
  assert(!thumb.includes('cloud://'), 'thumbnail imageMogr urls must not use cloud:// because image src treats them as local paths')
  assert.strictEqual(imageUrl.buildThumbnailUrl('/images/placeholder.png'), '/images/placeholder.png')
  assert.strictEqual(imageUrl.buildThumbnailUrl('https://example.com/foo.jpg'), 'https://example.com/foo.jpg')
})

test('responsive thumbnail urls expose small medium and large sizes', () => {
  const imageUrl = require('../miniprogram-card/utils/imageUrl')
  const fileId = 'cloud://prod-8g8ay186059e4264.7072-prod-8g8ay186059e4264-1418320285/series/bar.jpg'

  const thumbs = imageUrl.buildResponsiveThumbnailUrls(fileId)

  assert(thumbs.thumbSmallUrl.includes('/thumbnail/360x/quality/75'), '3-column thumbnail should use 360px q75')
  assert(thumbs.thumbMediumUrl.includes('/thumbnail/640x/quality/75'), '2-column thumbnail should use 640px q75')
  assert(thumbs.thumbLargeUrl.includes('/thumbnail/1200x/quality/80'), '1-column thumbnail should use 1200px q80')
  assert.strictEqual(thumbs.thumbUrl, thumbs.thumbSmallUrl)
})

test('my collection uses lazy thumbnail covers and paged rendering', () => {
  const js = read('miniprogram-card/pages/my-collection/my-collection.js')
  const wxml = read('miniprogram-card/pages/my-collection/my-collection.wxml')
  const detailJs = read('miniprogram-card/pages/my-collection-series-detail/my-collection-series-detail.js')
  const detailWxml = read('miniprogram-card/pages/my-collection-series-detail/my-collection-series-detail.wxml')

  assert(js.includes('DISPLAY_PAGE_SIZE'), 'my collection should define a render page size')
  assert(js.includes('this._displayItemsFull'), 'my collection should keep a full filtered list outside setData')
  assert(js.includes('loadMoreDisplayItems'), 'my collection should append visible items on reach-bottom')
  assert(js.includes('coverThumb: colData.buildThumbnailUrl'), 'ledger cards should expose thumbnail covers')
  assert(wxml.includes('src="{{item.coverThumb || item.cover}}" mode="aspectFit" lazy-load="{{true}}"'), 'top-level cards should render lazy thumbnails')
  assert(wxml.includes('src="{{child.coverThumb || child.cover}}" mode="aspectFit" lazy-load="{{true}}"'), 'same-card children should render lazy thumbnails')
  assert(wxml.includes('src="{{item.imageThumbUrl || item.imageUrl || \'/images/placeholder.png\'}}" mode="aspectFill" lazy-load="{{true}}"'), 'link candidates should render lazy thumbnails')

  assert(detailJs.includes('DISPLAY_PAGE_SIZE'), 'series detail should define a render page size')
  assert(detailJs.includes('this._displayItemsFull'), 'series detail should keep a full filtered list outside setData')
  assert(detailWxml.includes('src="{{item.coverThumb || item.cover}}" mode="aspectFit" lazy-load="{{true}}"'), 'series detail cards should render lazy thumbnails')
})

test('collection series grids use thumbnails while preserving original preview urls', () => {
  const wxml = read('miniprogram-card/pages/collection-series/collection-series.wxml')
  const js = read('miniprogram-card/pages/collection-series/collection-series.js')
  const indexJs = read('miniprogram-card/pages/index/index.js')
  const indexWxml = read('miniprogram-card/pages/index/index.wxml')

  assert(js.includes('...colData.buildResponsiveThumbnailUrls'), 'normalized collection images should expose responsive thumbnail urls')
  assert(wxml.includes("imageGridColumns === 1 ? (item.thumbLargeUrl || item.thumbUrl || item.url) : imageGridColumns === 2 ? (item.thumbMediumUrl || item.thumbUrl || item.url) : (item.thumbSmallUrl || item.thumbUrl || item.url)"), 'free image grid should choose thumbnail size by column count')
  assert(wxml.includes("imageGridColumns === 1 ? (card._gridImage.thumbLargeUrl || card._gridImage.thumbUrl || card._gridImage.url) : imageGridColumns === 2 ? (card._gridImage.thumbMediumUrl || card._gridImage.thumbUrl || card._gridImage.url) : (card._gridImage.thumbSmallUrl || card._gridImage.thumbUrl || card._gridImage.url)"), 'fixed grid should choose thumbnail size by column count')
  assert(wxml.includes("imageGridColumns === 1 ? (slot.image.thumbLargeUrl || slot.image.thumbUrl || slot.image.url) : imageGridColumns === 2 ? (slot.image.thumbMediumUrl || slot.image.thumbUrl || slot.image.url) : (slot.image.thumbSmallUrl || slot.image.thumbUrl || slot.image.url)"), 'print-run slots should choose thumbnail size by column count')
  assert(wxml.includes("imageGridColumns === 1 ? (img.thumbLargeUrl || img.thumbUrl || img.url) : imageGridColumns === 2 ? (img.thumbMediumUrl || img.thumbUrl || img.url) : (img.thumbSmallUrl || img.thumbUrl || img.url)"), 'ordinary card image grids should choose thumbnail size by column count')
  assert(wxml.includes('src="{{item.thumbUrl || item.url}}" mode="aspectFit" lazy-load="{{true}}" data-url="{{item.url}}" catchtap="previewImageChoice"'), 'image choice modal should render thumbnails and preview original')
  assert(indexJs.includes('_recentThumbImages'), 'collection index should expose recent thumbnail images')
  assert(indexWxml.includes('wx:for="{{item._recentThumbImages}}"'), 'collection index should render recent thumbnail images')
})
