const assert = require('assert')
const pagination = require('../miniprogram-card/utils/pagination')

const images = Array.from({ length: 35 }, (_, index) => ({ url: `u${index + 1}` }))

{
  const state = pagination.buildPagedItems(images, 30)
  assert.strictEqual(state.items.length, 30)
  assert.strictEqual(state.hasMore, true)
  assert.strictEqual(state.total, 35)
  assert.strictEqual(state.items[0]._freeIndex, 0)
  assert.strictEqual(state.items[29]._freeIndex, 29)
}

{
  const state = pagination.buildPagedItems(images, 60)
  assert.strictEqual(state.items.length, 35)
  assert.strictEqual(state.hasMore, false)
  assert.strictEqual(state.items[34]._freeIndex, 34)
}

console.log('free image pagination tests passed')
