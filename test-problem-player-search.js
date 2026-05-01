const assert = require('assert')
const playerRoster = require('../miniprogram-card/utils/playerRoster')

const roster = [
  { enName: 'LeBron James', zhName: '勒布朗·詹姆斯', nicknames: ['老詹', '小皇帝'] },
  { enName: 'Stephen Curry', zhName: '斯蒂芬·库里', nicknames: ['库里', '萌神'] }
]

const cards = [
  { id: 1, player: 'LeBron James', playerCN: '', series: 'National Treasures', brand: 'Panini', year: '2016-17', number: '23/25' },
  { id: 2, player: 'Kobe Bryant / Stephen Curry', playerCN: '科比 / 库里', series: 'Dual Auto', brand: 'Panini', year: '2020-21', number: '1/5' }
]

const options = playerRoster.buildProblemPlayerOptions(roster, cards)
assert(options.includes('LeBron James'), 'full roster player should be included')
assert(options.includes('Stephen Curry'), 'full roster player should be included')
assert(options.includes('Kobe Bryant / Stephen Curry'), 'existing multi-player card should remain selectable')

const cnMap = playerRoster.buildPlayerCNMap(roster, cards)
assert.strictEqual(cnMap['LeBron James'], '勒布朗·詹姆斯')
assert.strictEqual(cnMap['Stephen Curry'], '斯蒂芬·库里')

const searchIndex = playerRoster.buildProblemCardSearchText(cards[0], roster)
assert(searchIndex.includes('小皇帝'), 'nickname should be indexed')
assert(searchIndex.includes('勒布朗·詹姆斯'), 'zhName should be indexed')

const multiSearchIndex = playerRoster.buildProblemCardSearchText(cards[1], roster)
assert(multiSearchIndex.includes('萌神'), 'nickname for a player inside multi-player card should be indexed')

const matchedByNickname = cards.filter(card =>
  playerRoster.problemCardMatchesKeyword(card, roster, '小皇帝')
)
assert.deepStrictEqual(matchedByNickname.map(card => card.id), [1])

const matchedByMultiNickname = cards.filter(card =>
  playerRoster.problemCardMatchesKeyword(card, roster, '萌神')
)
assert.deepStrictEqual(matchedByMultiNickname.map(card => card.id), [2])

console.log('problem player search tests passed')
