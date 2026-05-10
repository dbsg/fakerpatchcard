const assert = require('assert')

const importer = require('./add-2016-hoops-rttf-cavs')

const subsetDocs = importer.buildSubsetDocs()
const items = subsetDocs.flatMap(doc => doc.items || [])
const seriesDoc = importer.buildSeriesDoc(subsetDocs)
const summary = importer.summarize(subsetDocs)

assert.strictEqual(subsetDocs.length, 7)
assert.deepStrictEqual(subsetDocs.map(doc => doc.subset), [
  'First Round /2016',
  'Second Round /999',
  'Conference Finals /499',
  'NBA Championship /199',
  'Champions Trophy Portraits',
  'Champions',
  'Finals MVP'
])
assert.deepStrictEqual(subsetDocs.map(doc => doc.items.length), [4, 4, 4, 4, 1, 1, 1])
assert.strictEqual(items.length, 19)
assert.strictEqual(items.every(item => item.completionTarget === 1), true)
assert.strictEqual(items.some(item => item.printRun), false)
assert.strictEqual(items[0].text, '1 Kyrie Irving, Cleveland Cavaliers')
assert.strictEqual(items[1].text, '2 LeBron James, Cleveland Cavaliers')
assert.strictEqual(items[15].text, '86 LeBron James, Cleveland Cavaliers')
assert.strictEqual(items[16].text, 'CTP-LJ LeBron James')
assert.strictEqual(items[17].text, 'CH-CLE Cleveland Cavaliers')
assert.strictEqual(items[18].text, 'FMVP-CLE Cleveland Cavaliers')

assert.strictEqual(seriesDoc.name, '2016-17 Panini Hoops Road To The Finals - 骑士')
assert.strictEqual(seriesDoc.structureType, 'groupedChecklist')
assert.strictEqual(seriesDoc.displayMode, 'fixedCardSlots')
assert.strictEqual(seriesDoc.seriesLevel, 3)
assert.strictEqual(seriesDoc.checklistComplete, true)
assert.strictEqual(seriesDoc.defaultYear, '2016-17')
assert.strictEqual(seriesDoc.defaultBrand, 'Panini')
assert.strictEqual(seriesDoc.defaultCardSeries, 'Hoops Road To The Finals')
assert(seriesDoc.description.includes('2016 年骑士夺冠之路'))
assert(seriesDoc.description.includes('结束了克利夫兰 52 年冠军荒'))
assert.strictEqual(seriesDoc.description.includes('每个卡位只需要一张代表图'), false)
assert.strictEqual(seriesDoc.totalCards, 19)
assert.strictEqual(seriesDoc.listTotalCount, 19)
assert.strictEqual(seriesDoc.presetCardKinds.length, 19)

assert.strictEqual(summary.subsetCount, 7)
assert.strictEqual(summary.totalCards, 19)

console.log('2016 Hoops Road To The Finals Cavs importer tests passed')
