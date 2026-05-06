const assert = require('assert')
const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')
const js = fs.readFileSync(path.join(root, 'miniprogram-card/pages/my-collection/my-collection.js'), 'utf8')
const wxml = fs.readFileSync(path.join(root, 'miniprogram-card/pages/my-collection/my-collection.wxml'), 'utf8')
const wxss = fs.readFileSync(path.join(root, 'miniprogram-card/pages/my-collection/my-collection.wxss'), 'utf8')

function test(name, fn) {
  try {
    fn()
    console.log(`ok - ${name}`)
  } catch (err) {
    console.error(`not ok - ${name}`)
    throw err
  }
}

test('money privacy is hidden by default and has an explicit toggle', () => {
  assert(js.includes('moneyVisible: false'))
  assert(js.includes('toggleMoneyVisible()'))
  assert(wxml.includes('bindtap="toggleMoneyVisible"'))
  assert(wxml.includes("moneyVisible ? '隐藏金额' : '显示金额'"))
})

test('stats and list monetary values are masked unless money is visible', () => {
  assert(wxml.includes("moneyVisible ? '¥' + stats.totalCost : '••••'"))
  assert(wxml.includes("item.moneyVisibleForItem ? '成本 ¥' + item.costText : '成本 ••••'"))
  assert(wxml.includes("item.moneyVisibleForItem ? '同款均价 ¥' + item.groupAvgCostText : '同款均价 ••••'"))
  assert(wxml.includes("item.moneyVisibleForItem ? '盈亏 ¥' + item.profitText : '盈亏 ••••'"))
})

test('a hidden-money card has a per-card eye toggle', () => {
  assert(js.includes('itemMoneyVisibleMap: {}'))
  assert(js.includes('toggleItemMoneyVisible(e)'))
  assert(wxml.includes('wx:if="{{item._type === \'ledger\' && !moneyVisible}}"'))
  assert(wxml.includes('catchtap="toggleItemMoneyVisible"'))
  assert(wxml.includes('moneyVisibleForItem'))
})

test('per-card hidden-money icon uses a minimal closed-eye style', () => {
  assert(wxss.includes('.item-money-eye::before'))
  assert(wxss.includes('border-bottom'))
  assert(wxss.includes('.item-money-eye:not(.open) .item-money-eye-dot'))
  assert(wxss.includes('box-shadow'))
  assert(wxss.includes('.item-money-eye.open::before'))
})
