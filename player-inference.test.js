const assert = require('assert')
const roster = require('../miniprogram-card/utils/nbaPlayersRoster')
const {
  inferPlayerFromText,
  buildPlayerInfoPatch
} = require('../miniprogram-card/utils/playerInference')
const { buildMigrationPlans, buildUpdate } = require('./backfill-legacy-owned-player-info')

function test(name, fn) {
  try {
    fn()
    console.log(`ok - ${name}`)
  } catch (err) {
    console.error(`not ok - ${name}`)
    throw err
  }
}

test('infers a player and Chinese name from card item text', () => {
  const result = inferPlayerFromText('27 Richard Jefferson, Cleveland Cavaliers', roster)

  assert.strictEqual(result.player, 'Richard Jefferson')
  assert.strictEqual(result.playerCN, '理查德 杰弗森')
})

test('infers LeBron from card text with leading card number', () => {
  const result = inferPlayerFromText('6 LeBron James, Cleveland Cavaliers', roster)

  assert.strictEqual(result.player, 'LeBron James')
  assert.strictEqual(result.playerCN, '勒布朗·詹姆斯')
})

test('builds a player patch for legacy owned records without overriding existing player data', () => {
  const missing = buildPlayerInfoPatch({
    itemText: '36 James Jones, Cleveland Cavaliers',
    cardName: '',
    player: '',
    playerCN: ''
  }, roster)
  const existing = buildPlayerInfoPatch({
    itemText: '36 James Jones, Cleveland Cavaliers',
    player: 'James Jones',
    playerCN: ''
  }, roster)

  assert.deepStrictEqual(missing, {
    player: 'James Jones',
    playerCN: '詹姆斯·琼斯'
  })
  assert.deepStrictEqual(existing, { playerCN: '詹姆斯·琼斯' })
})

test('builds a historical data update for legacy owned records', () => {
  const update = buildUpdate('user_card_relations', {
    _id: 'rel_1',
    itemText: '28 Richard Jefferson, Cleveland Cavaliers',
    player: '',
    playerCN: ''
  })

  assert.strictEqual(update.collection, 'user_card_relations')
  assert.strictEqual(update._id, 'rel_1')
  assert.strictEqual(update.confidence, 'direct')
  assert.deepStrictEqual(update.after, {
    player: 'Richard Jefferson',
    playerCN: '理查德 杰弗森'
  })
})

test('keeps indirect historical matches for manual review by default', () => {
  const plan = buildMigrationPlans('user_card_items', [{
    _id: 'item_1',
    itemText: 'Base',
    cardName: 'Base',
    subset: '20 Allen Iverson',
    player: '',
    playerCN: ''
  }])

  assert.strictEqual(plan.updates.length, 0)
  assert.strictEqual(plan.needsReview.length, 1)
  assert.strictEqual(plan.needsReview[0].confidence, 'review')
  assert.deepStrictEqual(plan.needsReview[0].after, {
    player: 'Allen Iverson',
    playerCN: '阿伦·艾弗森'
  })
})
