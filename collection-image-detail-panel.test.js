const assert = require('assert')
const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')
const read = file => fs.readFileSync(path.join(root, file), 'utf8')

const html = read('card/collection-detail.html')
const js = read('card/js/collection-detail.js')
const css = read('card/css/collection.css')

assert(html.includes('<script src="js/data.js"></script>'), 'collection detail should load problem-card reference data')

assert(js.includes('openImageDetail'), 'collection images should open a detail panel')
assert(js.includes('renderImageDetailPanel'), 'detail panel renderer should exist')
assert(js.includes('buildImageDetailMeta'), 'detail panel should build card metadata')
assert(js.includes('buildRelatedReferences'), 'detail panel should build related problem-card references')
assert(js.includes('image.backImageUrl'), 'detail panel should support back image')
assert(js.includes('image-detail-ref-status'), 'related references should show status')
assert(js.includes('cardFeatures'), 'detail panel should expose card features')
assert(js.includes('sourceDisplay'), 'detail panel should expose source text')
assert(js.includes('detail.html?id='), 'related references should link to problem-card detail')
assert(js.includes('event.stopPropagation()'), 'image detail panel interactions should not close from inner clicks')

assert(css.includes('.image-detail-panel'), 'detail panel styles should exist')
assert(css.includes('.image-detail-carousel'), 'detail panel should have carousel styles')
assert(css.includes('.image-detail-meta-grid'), 'detail panel should have metadata grid styles')
assert(css.includes('.image-detail-feature'), 'detail panel should have feature chip styles')
assert(css.includes('.image-detail-reference'), 'detail panel should have related reference styles')

console.log('collection image detail panel tests passed')
