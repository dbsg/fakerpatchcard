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

test('card wiki page stays registered while collection toolbar entry is hidden', () => {
  const appJson = JSON.parse(read('miniprogram-card/app.json'))
  const indexJs = read('miniprogram-card/pages/index/index.js')
  const indexWxml = read('miniprogram-card/pages/index/index.wxml')
  const indexWxss = read('miniprogram-card/pages/index/index.wxss')

  assert(appJson.pages.includes('pages/card-wiki/card-wiki'), 'card wiki page should stay registered in app.json')
  assert(appJson.pages.includes('pages/card-wiki-detail/card-wiki-detail'), 'card wiki detail page should stay registered in app.json')
  assert(indexJs.includes('goCardWiki()'), 'index page should keep a card wiki navigation handler for later rollout')
  assert(indexJs.includes("wx.navigateTo({ url: '/pages/card-wiki/card-wiki' })"), 'card wiki handler should still navigate to the wiki page')
  assert(indexJs.includes('showCardWikiEntry: false'), 'collection toolbar should default to hiding the card wiki entry')
  assert(indexWxml.includes('wx:if="{{showCardWikiEntry}}" class="series-sort-btn card-wiki-entry" bindtap="goCardWiki"'), 'collection toolbar should gate the card wiki entrance behind a switch')
  assert(!indexWxml.includes('<view class="series-sort-btn card-wiki-entry" bindtap="goCardWiki">'), 'collection toolbar should not render an unconditional card wiki entrance')
  assert(indexWxml.indexOf('series-search-bar') < indexWxml.indexOf('series-action-scroll'), 'search should render above the action chips')
  assert(indexWxml.includes('bindtap="goMyCollection"'), 'my collection entry should remain visible')
  assert(indexWxss.includes('.series-toolbar { display: flex; flex-direction: column;'), 'collection toolbar should keep the vertical search/actions layout')
  assert(indexWxss.includes('.series-action-scroll { width: 100%;'), 'action chips should keep horizontal scrolling')
})

test('built-in card wiki data is preserved for later iteration', () => {
  const wikiData = require('../miniprogram-card/utils/cardWikiData')

  assert(Array.isArray(wikiData.topicOptions), 'wiki data should export topic options')
  assert(Array.isArray(wikiData.seriesList), 'wiki data should keep the current built-in series list')
  assert(wikiData.seriesList.length >= 1, 'wiki data should not be removed while the entry is hidden')
  wikiData.seriesList.forEach(item => {
    assert(item.id && item.name && item.zhName, 'each wiki item needs stable identity and names')
    assert(item.summary && item.origin && item.background, `${item.name} should keep core article copy`)
    assert(Array.isArray(item.features) && item.features.length >= 1, `${item.name} should keep feature bullets`)
    assert(Array.isArray(item.signatureCards) && item.signatureCards.length >= 1, `${item.name} should keep representative card types`)
    if (item.officialImageUrl) {
      assert(item.officialImageUrl.startsWith('https://'), `${item.name} image url should be web-safe when present`)
      assert(item.officialImageSourceUrl && item.officialImageSourceUrl.startsWith('https://'), `${item.name} should include a traceable image source page`)
      assert(item.officialImageSourceName, `${item.name} should include an image source name`)
    }
  })
})

test('hidden card wiki pages still render list and detail content', () => {
  const listWxml = read('miniprogram-card/pages/card-wiki/card-wiki.wxml')
  const listJs = read('miniprogram-card/pages/card-wiki/card-wiki.js')
  const detailWxml = read('miniprogram-card/pages/card-wiki-detail/card-wiki-detail.wxml')
  const detailJs = read('miniprogram-card/pages/card-wiki-detail/card-wiki-detail.js')

  assert(listJs.includes("require('../../utils/cardWikiData')"), 'wiki list should keep using built-in data')
  assert(listJs.includes('filteredSeriesList'), 'wiki list should keep local filtering state')
  assert(listJs.includes('goWikiDetail(e)'), 'wiki list should keep detail navigation')
  assert(listWxml.includes('class="wiki-list-item"'), 'wiki list should keep compact list items')
  assert(listWxml.includes('bindtap="goWikiDetail"'), 'wiki list items should remain tappable after the entry is restored')
  assert(listWxml.includes('src="{{item.listImageUrl || item.officialImageUrl}}"'), 'wiki list should keep configured list images before fallback visuals')

  assert(detailJs.includes("require('../../utils/cardWikiData')"), 'wiki detail should keep using built-in data')
  assert(detailJs.includes('wikiData.seriesList.find'), 'wiki detail should find entries from the current built-in series list')
  assert(detailJs.includes('copySourceUrl'), 'wiki detail should keep source copy support')
  assert(detailWxml.includes('src="{{series.officialImageUrl}}"'), 'wiki detail should render official images')
  assert(detailWxml.includes('series.domesticAliasReason'), 'wiki detail should render domestic alias explanation when available')
  assert(detailWxml.includes('series.showcaseImages'), 'wiki detail should render showcase images when available')
  assert(detailWxml.includes('起源'), 'wiki detail should render origin copy')
  assert(detailWxml.includes('背景'), 'wiki detail should render background copy')
  assert(detailWxml.includes('系列特征'), 'wiki detail should render feature bullets')
  assert(detailWxml.includes('特色卡种'), 'wiki detail should render representative card types')
})
