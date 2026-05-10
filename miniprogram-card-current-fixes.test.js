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

test('fixed card slots keep an upload entrance after one image exists', () => {
  const wxml = read('miniprogram-card/pages/collection-series/collection-series.wxml')
  const wxss = read('miniprogram-card/pages/collection-series/collection-series.wxss')
  const start = wxml.indexOf('<view wx:if="{{card._gridImage}}" class="fixed-grid-image-wrap">')
  const end = wxml.indexOf('<view wx:else class="fixed-grid-placeholder"', start)
  const imageBlock = wxml.slice(start, end)
  assert(start >= 0 && end > start, 'missing fixed grid image block')
  assert(imageBlock.includes('class="fixed-grid-add-btn"'), 'existing fixed slot images need a visible upload entrance')
  assert(imageBlock.includes('data-idx="{{card._idx}}"'), 'upload entrance should target the same fixed slot')
  assert(imageBlock.includes('catchtap="addCardImage"'), 'upload entrance should append through the existing upload flow')
  assert(wxss.includes('.fixed-grid-add-btn'), 'upload entrance needs explicit overlay styling')
  assert(wxss.includes('.fixed-grid-add-btn { position: absolute; left: 8rpx; bottom: 8rpx;'), 'upload entrance should sit in the bottom-left corner')
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
  assert(js.includes('const groupedImages = this._getDetailImageGroup(series, found.item, found.images, found.image)'), 'loaded collection detail should compute grouped images')
  assert(js.includes('_buildImageSlides(images = [], selected = {})'), 'detail page should build slides from card-slot images')
  assert(js.includes('return { item: { ...item, subset: item.subset || doc.subset }, image: img, images }'), 'subset image lookup should keep all images in the same slot')
  assert(js.includes('return { item, image: img, images }'), 'checklist image lookup should keep all images in the same slot')
  assert(js.includes('imageSlides: this._buildImageSlides(groupedImages, found.image)'), 'loaded collection detail should show grouped images')
  assert(js.includes('this.data.imageSlides.map(slide => slide.url)'), 'preview should include all carousel images')
  assert(wxml.includes('indicator-dots="{{imageSlides.length > 1}}"'), 'carousel should indicate multiple same-slot images')
  assert(wxml.includes('wx:for="{{imageSlides}}"'), 'detail hero should render all same-slot slides')
  assert(wxml.includes('class="image-slide-count"'), 'detail hero should show a visible image count')
  assert(wxss.includes('.image-slide-count'), 'image count badge should be styled')
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

test('collection series supports manager-only primary images', () => {
  const seriesJs = read('miniprogram-card/pages/collection-series/collection-series.js')
  const seriesWxml = read('miniprogram-card/pages/collection-series/collection-series.wxml')
  const detailJs = read('miniprogram-card/pages/collection-card-detail/collection-card-detail.js')
  const detailWxml = read('miniprogram-card/pages/collection-card-detail/collection-card-detail.wxml')
  const detailWxss = read('miniprogram-card/pages/collection-card-detail/collection-card-detail.wxss')
  assert(seriesWxml.includes('wx:if="{{canManageSeries && !isFreeMode}}"'), 'upload primary switch should only be visible to series managers')
  assert(seriesWxml.includes('bindchange="onUploadItemPrimary"'), 'upload modal should toggle primary state')
  assert(seriesWxml.includes('wx:if="{{canManageSeries && !editImageIsFree}}"'), 'edit modal primary switch should only be visible to series managers')
  assert(seriesWxml.includes('bindchange="onEditImagePrimary"'), 'edit modal should toggle primary state')
  assert(seriesJs.includes('isPrimary: false'), 'upload items should default primary switch off')
  assert(seriesJs.includes('isPrimary: !!img.isPrimary'), 'image normalization should preserve primary state')
  assert(seriesJs.includes('_markPrimaryImageInList(images, targetImageId = \'\')'), 'saving should normalize primary images to one item')
  assert(seriesJs.includes('const explicitPrimary = newImages.find(img => img.isPrimary)'), 'upload should respect manager-selected primary image')
  assert(seriesJs.includes('const images = this._markPrimaryImageInList([...this._normalizeImages(checklist[uploadIdx].images), ...newImages], explicitPrimary && explicitPrimary.imageId)'), 'upload should default to latest image when no explicit primary is selected')
  assert(seriesJs.includes('const primaryImage = images.find(img => img && img.isPrimary && !img.isSupplemental) || images.find(img => img && img.isPrimary)'), 'fixed grid should prefer explicit primary image')
  assert(seriesJs.includes('const latestImage = [...sourceImages].reverse().find(img => img && !img.isSupplemental) || [...sourceImages].reverse().find(Boolean)'), 'fixed grid should default to latest uploaded image')
  assert(seriesJs.includes('editImageIsPrimary: !!img.isPrimary'), 'edit modal should reflect current primary state')
  assert(seriesJs.includes('onEditImagePrimary(e) { this.setData({ editImageIsPrimary: !!e.detail.value }) }'), 'edit modal should save primary switch changes')
  assert(detailJs.includes('isPrimary: !!img.isPrimary'), 'detail page should preserve primary state')
  assert(detailJs.includes('isPrimary: !!img.isPrimary'), 'detail slides should know primary state')
  assert(detailWxml.includes('wx:if="{{item.isPrimary}}" class="primary-image-badge"'), 'detail page should show primary badge on primary slides')
  assert(detailWxss.includes('.primary-image-badge'), 'primary badge should be styled')
})

test('collection card detail omits face labels and only badges primary front images', () => {
  const detailJs = read('miniprogram-card/pages/collection-card-detail/collection-card-detail.js')
  const detailWxml = read('miniprogram-card/pages/collection-card-detail/collection-card-detail.wxml')
  const start = detailJs.indexOf('_buildImageSlides(images = [], selected = {})')
  const end = detailJs.indexOf('\n  _findImage', start)
  const body = detailJs.slice(start, end)
  assert(start >= 0 && end > start, 'missing image slide builder')
  assert(body.includes('badgeLabel: prefix'), 'detail slide labels should only keep the image count prefix')
  assert(!body.includes("'正面'"), 'detail slides should not label front images')
  assert(!body.includes("'背面'"), 'detail slides should not label back images')
  assert(body.includes('isPrimary: false'), 'back slides should not inherit the primary badge')
  assert(detailWxml.includes('imageSlides.length > 1 && item.badgeLabel'), 'empty slide labels should not render a blank badge')
})

test('print-run collection view groups same-number images under one primary tile', () => {
  const progress = require('../miniprogram-card/utils/collectionProgress')
  const wxml = read('miniprogram-card/pages/collection-series/collection-series.wxml')
  const js = read('miniprogram-card/pages/collection-series/collection-series.js')
  const withPrimary = progress.buildPrintRunSlots({
    text: 'Ray Allen /18',
    images: [
      { imageId: 'old', url: 'old.jpg', number: '11/18' },
      { imageId: 'primary', url: 'primary.jpg', number: '11/18', isPrimary: true },
      { imageId: 'latest', url: 'latest.jpg', number: '11/18' }
    ]
  }).filter(slot => slot.type === 'image' && slot.serial === '11')
  assert.strictEqual(withPrimary.length, 1, 'same serial should render one image tile')
  assert.strictEqual(withPrimary[0].image.url, 'primary.jpg', 'explicit primary should be the representative tile')
  assert.strictEqual(withPrimary[0].imageCount, 3, 'representative tile should know how many same-number images it covers')

  const withoutPrimary = progress.buildPrintRunSlots({
    text: 'Ray Allen /18',
    images: [
      { imageId: 'old', url: 'old.jpg', number: '11/18' },
      { imageId: 'latest', url: 'latest.jpg', number: '11/18' }
    ]
  }).filter(slot => slot.type === 'image' && slot.serial === '11')
  assert.strictEqual(withoutPrimary[0].image.url, 'latest.jpg', 'latest uploaded image should be the representative when no primary exists')
  assert(wxml.includes('slot.imageCount > 1 ? 1 : 0'), 'grouped print-run tiles should open the concrete image chooser')
  assert(wxml.includes('data-choice-number="{{slot.displayLabel}}"'), 'print-run image chooser should be scoped to the same number')
  assert(js.includes('const choiceNumber = e.currentTarget.dataset.choiceNumber || \'\''), 'edit/delete handlers should read the number scope')
})

test('completion-target collection view groups same-number images under one primary tile', () => {
  const progress = require('../miniprogram-card/utils/collectionProgress')
  const slots = progress.buildPrintRunSlots({
    text: 'Ray Allen',
    completionTarget: 18,
    images: [
      { imageId: 'old', url: 'old.jpg', number: '11/18' },
      { imageId: 'primary', url: 'primary.jpg', number: '11/18', isPrimary: true },
      { imageId: 'latest', url: 'latest.jpg', number: '11/18' }
    ]
  })
  const imageSlots = slots.filter(slot => slot.type === 'image')
  assert.strictEqual(imageSlots.length, 1, 'same number should render one image tile even when only completionTarget is set')
  assert.strictEqual(imageSlots[0].serial, '11')
  assert.strictEqual(imageSlots[0].displayLabel, '11/18')
  assert.strictEqual(imageSlots[0].image.url, 'primary.jpg', 'explicit primary should be the representative tile')
  assert.strictEqual(imageSlots[0].imageCount, 3, 'representative tile should know how many same-number images it covers')
  assert.strictEqual(progress.getItemCollectedCount({
    text: 'Ray Allen',
    completionTarget: 18,
    images: [
      { imageId: 'old', url: 'old.jpg', number: '11/18' },
      { imageId: 'latest', url: 'latest.jpg', number: '11/18' }
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
    images: [{ imageId: 'img', url: 'img.jpg', number: '11/18' }]
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
  assert(seriesWxml.includes('该 ID 会在卡片详情公开展示'), 'upload modal should disclose public visibility')
  assert(seriesWxml.includes('不能包含违禁内容'), 'upload modal should explain public id safety rules')
  assert(detailWxml.includes('上传用户'), 'collection card detail should expose uploader as its own field')
  assert(myCollectionJs.includes('showPublicIdModal'), 'my collection home should provide a public id entry modal')
  assert(myCollectionJs.includes('savePublicUserId'), 'my collection home should allow setting public id')
  assert(myCollectionJs.includes('getPublicUserIdErrorMessage'), 'my collection home should show specific public id errors')
  assert(myCollectionWxml.includes('用户 ID'), 'my collection home should expose the public id entry')
  assert(!myCollectionWxml.includes('用户 ID 可修改'), 'my collection public id modal should omit the extra editability hint')
  assert(detailJs.includes('buildUploaderDisplay'), 'detail page should display uploader id separately from source')
  assert(detailJs.includes('return publicId'), 'detail page should show uploader id without a fixed prefix')
  assert(cloudJs.includes("db.collection('user_public_profiles')"), 'cloud function should persist public user profiles')
  assert(cloudJs.includes('sanitizePublicUserId'), 'cloud function should sanitize public ids')
  assert(cloudJs.includes('security.msgSecCheck'), 'cloud function should check public id content safety')
  assert(cloudJs.includes('publicIdKey'), 'cloud function should enforce normalized global uniqueness')
  assert(cloudJs.includes('syncPublicUserIdSnapshots'), 'cloud function should update existing public id snapshots after rename')
  assert(dataJs.includes('getPublicUserProfile'), 'client data layer should expose public profile fetch')
  assert(dataJs.includes('setPublicUserId'), 'client data layer should expose public id setup')
  assert(dataJs.includes('getPublicUserIdErrorMessage'), 'client data layer should map public id errors to user-facing reasons')
})

test('series upload owned flow can capture purchase and grading details', () => {
  const seriesJs = read('miniprogram-card/pages/collection-series/collection-series.js')
  const seriesWxml = read('miniprogram-card/pages/collection-series/collection-series.wxml')
  assert(seriesJs.includes('UPLOAD_GRADE_OPTIONS'), 'upload flow should expose grade choices')
  assert(seriesJs.includes('onUploadItemLedgerInput'), 'upload owned fields should update purchase form state')
  assert(seriesJs.includes('onUploadItemGradingCompanyChange'), 'upload owned fields should support grading company selection')
  assert(seriesJs.includes('_createLedgerForOwnedUploads'), 'owned uploads should create private collection ledger entries')
  assert(seriesJs.includes('this._buildHoldLedgerPayload(newImage.url, item, uploadItem, newImage)'), 'ledger creation should use the uploaded image metadata')
  assert(seriesWxml.includes('买入成本'), 'owned upload form should show purchase cost')
  assert(seriesWxml.includes('评级公司'), 'owned upload form should show grading company')
  assert(seriesWxml.includes('评级分数'), 'owned upload form should show grade selector')
  assert(seriesJs.includes('AUTHENTIC / 鉴真'), 'grade selector should include authentic-only grading')
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
  assert(wxss.includes('.fixed-grid-image-wrap { display: flex; align-items: center; justify-content: center; }'), 'fixed grid images should be centered')
  assert(wxss.includes('.fixed-grid-card.has-image'), 'fixed grid image cards should avoid blank bottom spacing')
})

test('collection series shows personal owned progress only when owned cards exist', () => {
  const js = read('miniprogram-card/pages/collection-series/collection-series.js')
  const wxml = read('miniprogram-card/pages/collection-series/collection-series.wxml')
  assert(js.includes('_buildMyOwnedProgressFromChecklist'))
  assert(js.includes('_buildMyOwnedProgressFromFreeImages'))
  assert(js.includes('showMyOwnedProgress: count > 0'))
  assert(wxml.includes('wx:if="{{showMyOwnedProgress}}"'))
  assert(wxml.includes('我的拥有进度'))
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
  assert(js.includes('seriesGroups: buildSeriesCostGroups(ledger, this.data.moneyVisible, itemMoneyVisibleMap, this.data.sortKey, this.data.sortOrder)'))
  assert(js.includes('moneyVisibilityKey: `series:${key}`'))
  assert(js.includes('moneyVisibleForItem: !!(moneyVisible || itemMoneyVisibleMap[group.moneyVisibilityKey])'))
  assert(js.includes('openSeriesGroupDetail'))
  assert(js.includes('/pages/my-collection-series-detail/my-collection-series-detail?'))
  assert(wxml.includes('如 2008 或 2016-17'))
  assert(wxml.includes('导出卡片'))
  assert(wxml.includes('按图鉴'))
  assert(wxml.includes('总花费'))
  assert(wxml.includes('{{sortOrderLabel}}'))
  assert(wxml.includes('bindtap="openSeriesGroupDetail"'))
  assert(wxml.includes('data-id="{{item.moneyVisibilityKey}}" catchtap="toggleItemMoneyVisible"'))
  assert(wxml.includes("item.moneyVisibleForItem ? '总花费 ¥' + item.totalCostText : '总花费 ••••'"))
  assert(wxml.includes("item.moneyVisibleForItem ? '持有成本 ¥' + item.holdingCostText : '持有成本 ••••'"))
  assert(wxss.includes('.series-summary-card { position: relative;'))
  assert(appJson.includes('pages/my-collection-series-detail/my-collection-series-detail'))
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
  assert(wxml.includes('openSameTypeModal'))
  assert(wxml.includes('exportItemImage'))
  assert(wxml.includes('deleteItem'))
  const wxss = read('miniprogram-card/pages/my-collection-series-detail/my-collection-series-detail.wxss')
  assert(wxss.includes('.series-detail-page .toolbar { margin-bottom: 18rpx; }'))
  assert(wxss.includes('.series-detail-page .sort-bar { margin: 0 0 18rpx; }'))
  assert(wxss.includes('.series-detail-page .status-tab,'))
  assert(json.includes('图鉴卡片'))
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

test('feedback submission warns when a likely duplicate problem card exists', () => {
  const js = read('miniprogram-card/pages/feedback/feedback.js')
  assert(js.includes('function normalizeDuplicateText'))
  assert(js.includes('findDuplicateCandidates'))
  assert(js.includes('confirmDuplicateIfNeeded'))
  assert(js.includes('可能重复'))
  assert(js.includes('仍然提交'))
})

test('feedback submission requires a public user id separate from source', () => {
  const js = read('miniprogram-card/pages/feedback/feedback.js')
  const wxml = read('miniprogram-card/pages/feedback/feedback.wxml')
  const adminJs = read('miniprogram-card/pages/admin/admin.js')
  const adminWxml = read('miniprogram-card/pages/admin/admin.wxml')
  const adminOps = read('miniprogram-card/cloudfunctions/adminOps/index.js')
  const detailWxml = read('miniprogram-card/pages/detail/detail.wxml')
  assert(js.includes('loadPublicUserProfile'), 'feedback page should load the same public id profile as series uploads')
  assert(js.includes('ensureFeedbackPublicUserId'), 'feedback submit should validate or create the public id')
  assert(js.includes('submitterPublicId'), 'feedback records should store public id separately')
  assert(wxml.includes('提交用户 ID'), 'feedback form should ask for a submitter public id')
  assert(wxml.includes('资料来源'), 'source field should remain separate')
  assert(adminJs.includes('submitterPublicId: approveForm.submitterPublicId'), 'approval should carry public id through cardInfo')
  assert(adminWxml.includes('提交用户 ID'), 'admin detail should display the submitter public id')
  assert(adminOps.includes('submitterPublicId: cleanCardInfo.submitterPublicId || feedback.submitterPublicId ||'), 'approved cards should keep public id')
  assert(detailWxml.includes('card.submitterPublicId'), 'problem card detail should display public id separately from source')
})
