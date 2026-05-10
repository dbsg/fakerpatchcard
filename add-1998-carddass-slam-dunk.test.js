const assert = require('assert')

const importer = require('./add-1998-carddass-slam-dunk')

const subsetDocs = importer.buildSubsetDocs()
const items = subsetDocs.flatMap(doc => doc.items || [])

assert.strictEqual(subsetDocs.length, 1)
assert.deepStrictEqual(subsetDocs.map(doc => doc.subset), [''])
assert.strictEqual(items.length, 140)
assert.strictEqual(subsetDocs[0].items.length, 140)
assert.strictEqual(items[0].text, '1 Title Card 1/9')
assert.strictEqual(items[0].number, '1')
assert.strictEqual(items[0].cardKind, 'Title Card 1/9')
assert.strictEqual(items[13].text, '14 Sakuragi & Mitsui')
assert.strictEqual(items[134].text, '135 Team Shohoku')
assert.strictEqual(items[135].text, 'SP1 Hanamichi Sakuragi')
assert.strictEqual(items[139].text, 'SP5 Takenori Akagi')

const flattened = importer.buildFlattenedItems([
  {
    subset: 'SP',
    items: [
      { itemId: 'carddass_slam_dunk_1998_sp_sp1', text: 'SP1 Hanamichi Sakuragi', subset: 'SP', images: [{ url: 'sp1.png' }] }
    ]
  },
  {
    subset: 'Base',
    items: [
      { itemId: 'carddass_slam_dunk_1998_base_1', text: '1 Title Card 1/9', subset: 'Base', images: [{ url: 'base1.png' }] }
    ]
  }
])
assert.strictEqual(flattened.length, 140)
assert.strictEqual(flattened[0].text, '1 Title Card 1/9')
assert.strictEqual(flattened[0].subset, '')
assert.strictEqual(flattened[0].images[0].url, 'base1.png')
assert.strictEqual(flattened[135].text, 'SP1 Hanamichi Sakuragi')
assert.strictEqual(flattened[135].subset, '')
assert.strictEqual(flattened[135].images[0].url, 'sp1.png')

const seriesDoc = importer.buildSeriesDoc(subsetDocs)
assert.strictEqual(seriesDoc.name, '1998 Carddass Masters Slam Dunk Takehiko Inoue Illustration Collection')
assert.strictEqual(seriesDoc.totalCards, 140)
assert.strictEqual(seriesDoc.defaultYear, '1998')
assert.strictEqual(seriesDoc.defaultBrand, 'Bandai')
assert.strictEqual(seriesDoc.defaultCardSeries, 'Carddass Masters Slam Dunk Takehiko Inoue Illustration Collection')
assert.strictEqual(seriesDoc.structureType, 'fixedChecklist')
assert.strictEqual(seriesDoc.displayMode, 'fixedImageGrid')
assert(seriesDoc.description.includes('动画原画卡'))
assert(seriesDoc.description.includes('湘北高中篮球队'))
assert(seriesDoc.description.includes('樱木花道'))

console.log('1998 Carddass Slam Dunk importer tests passed')
