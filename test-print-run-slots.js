const assert = require('assert')
const progress = require('../miniprogram-card/utils/collectionProgress')

function image(number, url) {
  return { number, url: url || `cloud://image-${number || 'blank'}-${Math.random()}.jpg` }
}

assert.strictEqual(progress.parsePrintRunValue('99'), 99)
assert.strictEqual(progress.parsePrintRunValue('/99'), 99)
assert.strictEqual(progress.parsePrintRunValue('99编'), 99)
assert.strictEqual(progress.parsePrintRunValue('1/1'), 1)
assert.strictEqual(progress.parsePrintRunValue('17/21'), 21)
assert.strictEqual(progress.parsePrintRunValue('0'), 0)
assert.strictEqual(progress.parsePrintRunValue('abc'), 0)

{
  const slots = progress.buildPrintRunSlots(
    { text: 'LeBron James /20', images: [image('1', 'u1'), image('10', 'u10')] },
    {}
  )
  assert.deepStrictEqual(slots.map(slot => slot.type), ['image', 'gap', 'image', 'gap'])
  assert.deepStrictEqual(slots.map(slot => slot.serial || slot.rangeLabel), ['1', '2-9', '10', '11-20'])
  assert.deepStrictEqual(slots.filter(slot => slot.type === 'image').map(slot => slot.displayLabel), ['1/20', '10/20'])
}

{
  const slots = progress.buildPrintRunSlots(
    { text: 'LeBron James /20', images: [image('1', 'u1'), image('10', 'u10')] },
    { '2-9': true }
  )
  assert.deepStrictEqual(slots.map(slot => slot.type), ['image', 'upload', 'upload', 'upload', 'upload', 'upload', 'upload', 'upload', 'upload', 'collapse', 'image', 'gap'])
  assert.deepStrictEqual(slots.filter(slot => slot.type === 'upload').map(slot => slot.serial), ['2', '3', '4', '5', '6', '7', '8', '9'])
}

{
  const slots = progress.buildPrintRunSlots(
    { text: 'LeBron James /20', images: [] },
    {}
  )
  assert.deepStrictEqual(slots.map(slot => slot.type), ['upload', 'upload', 'upload', 'upload', 'upload', 'gap'])
  assert.deepStrictEqual(slots.map(slot => slot.serial || slot.rangeLabel), ['1', '2', '3', '4', '5', '6-20'])
  assert.deepStrictEqual(slots.filter(slot => slot.type === 'upload').map(slot => slot.displayLabel), ['1/20', '2/20', '3/20', '4/20', '5/20'])
}

{
  const slots = progress.buildPrintRunSlots(
    { text: 'Andrei Kirilenko /50', images: [] },
    { '6-50': true }
  )
  assert.deepStrictEqual(slots.slice(0, 7).map(slot => slot.type), ['upload', 'upload', 'upload', 'upload', 'upload', 'upload', 'upload'])
  assert.deepStrictEqual(slots.slice(0, 7).map(slot => slot.serial), ['1', '2', '3', '4', '5', '6', '7'])
  assert.strictEqual(slots.some(slot => slot.type === 'collapse' && slot.rangeLabel === '6-50'), true)
}

{
  const slots = progress.buildPrintRunSlots(
    { text: 'Andrei Kirilenko /50', images: [] },
    { '6-50': true, '26-50': true }
  )
  assert.strictEqual(slots.some(slot => slot.type === 'gap' && slot.rangeLabel === '26-50'), false)
  assert.strictEqual(slots.some(slot => slot.type === 'upload' && slot.serial === '26'), true)
  assert.strictEqual(slots.some(slot => slot.type === 'upload' && slot.serial === '45'), true)
  assert.strictEqual(slots.some(slot => slot.type === 'gap' && slot.rangeLabel === '46-50'), true)
}

{
  const slots = progress.buildPrintRunSlots(
    { text: 'LeBron James /20', images: [image('', 'blank1'), image('', 'blank2')] },
    {}
  )
  assert.deepStrictEqual(slots.map(slot => slot.type), ['upload', 'upload', 'upload', 'upload', 'upload', 'gap', 'unknownGroup'])
  assert.strictEqual(slots[6].images.length, 2)
}

{
  const stats = progress.buildChecklistProgressStats([
    { text: '', completionTarget: 3, images: [image('', 'u1'), image('', 'u2')] }
  ])
  assert.strictEqual(stats.totalCards, 3)
  assert.strictEqual(stats.withImages, 2)
  assert.strictEqual(stats.missing, 1)
}

{
  const slots = progress.buildPrintRunSlots(
    {
      text: 'Base /30',
      printRun: 30,
      completionTarget: 1,
      images: [image('6', 'numbered'), image('', 'blank')]
    },
    {}
  )
  assert.deepStrictEqual(slots.map(slot => slot.type), ['image', 'unknownGroup'])
  assert.strictEqual(slots[0].displayLabel, '6/30')
  assert.strictEqual(slots[1].title, '更多图片')
  assert.strictEqual(slots[1].images[0].displayLabel, '未标编号')
}

{
  const slots = progress.buildPrintRunSlots(
    {
      text: 'Base /30',
      printRun: 30,
      completionTarget: 1,
      images: []
    },
    {}
  )
  assert.deepStrictEqual(slots.map(slot => slot.type), ['upload'])
  assert.strictEqual(slots[0].displayLabel, '1/30')
}

console.log('print-run slot tests passed')
