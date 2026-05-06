const assert = require('assert')
const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')
const read = file => fs.readFileSync(path.join(root, file), 'utf8')

const indexHtml = read('card/index.html')
const appJs = read('card/js/app.js')
const detailJs = read('card/js/detail.js')
const collectionDetailJs = read('card/js/collection-detail.js')
const cardCss = read('card/css/style.css')
const miniDetailCss = read('miniprogram-card/pages/detail/detail.wxss')

assert(indexHtml.includes('鉴别资料库'), 'home tab should use 鉴别资料库 wording')
assert(indexHtml.includes('查卡避坑·资料参考'), 'home tab subtitle should match mini program positioning')
assert(!indexHtml.includes('问题球星卡'), 'old problem-card tab wording should be removed from web home')

assert(appJs.includes("'高度存疑'"), 'web list should display suspected records as 高度存疑')
assert(appJs.includes("'明确异常'"), 'web list should display confirmed records as 明确异常')
assert(appJs.includes("'Patch 异常'"), 'category label should use Patch 异常')
assert(appJs.includes("'签字异常'"), 'category label should use 签字异常')
assert(appJs.includes("'卡片异常'"), 'category label should use 卡片异常')
assert(appJs.includes('buildKeywordTerms'), 'web search should support tokenized combo search')
assert(appJs.includes('buildCardSearchText'), 'web search should search against a combined card text index')

assert(detailJs.includes('资料提示：明确异常记录'), 'detail confirmed title should use 明确异常记录')
assert(detailJs.includes('资料提示：高度存疑线索'), 'detail suspected title should use 高度存疑线索')
assert(detailJs.includes('问题说明'), 'detail high-risk reason label should be 问题说明')
assert(detailJs.includes('异常样本'), 'detail after image label should use 异常样本')
assert(detailJs.includes('原始 Patch 参考'), 'detail before image label should use 原始 Patch 参考')
assert(detailJs.includes('不构成鉴定结论、交易建议或维权依据'), 'detail should show compliance disclaimer')

assert(collectionDetailJs.includes('shouldShowImageYear'), 'collection image labels should decide whether repeated year is useful')
assert(collectionDetailJs.includes('getSeriesKnownYears'), 'collection detail should detect years already defined by the series')

assert(/\.warning-danger\s*{[^}]*background:\s*#fee2e2/i.test(cardCss), 'web confirmed warning should use a stronger red background')
assert(/\.warning-danger\s*{[^}]*border-left:\s*4px solid #ef4444/i.test(cardCss), 'web confirmed warning should use a red border')
assert(/\.warning-danger\s*{[^}]*background:\s*#fee2e2/i.test(miniDetailCss), 'mini confirmed warning should use a stronger red background')
assert(/\.warning-danger \.warning-desc\s*{[^}]*color:\s*#991b1b/i.test(miniDetailCss), 'mini confirmed warning text should be red, not gray')

console.log('static display copy tests passed')
