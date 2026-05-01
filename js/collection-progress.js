const collectionProgress = (() => {
  function extractImageUrl(img) {
    if (!img) return ''
    return typeof img === 'string' ? img : (img.url || '')
  }

  function parsePrintRunText(value) {
    const text = String(value || '').trim()
    const match = text.match(/\/\s*([1-9]\d{0,5})\s*$/)
    return match ? Number(match[1]) : 0
  }

  function parsePrintRunValue(value) {
    const text = String(value || '').trim()
    if (!text) return 0
    const match = text.match(/^\/?\s*([1-9]\d{0,5})\s*(?:编)?$/)
    return match ? Number(match[1]) : 0
  }

  function getPrintRun(item) {
    const raw = Number(item && item.printRun)
    if (Number.isInteger(raw) && raw > 0) return raw
    return parsePrintRunText((item && (item.text || item.subset)) || '')
  }

  function getCompletionTarget(item) {
    const raw = Number(item && item.completionTarget)
    if (Number.isInteger(raw) && raw > 0) return raw
    return getPrintRun(item) || 1
  }

  function parseImageSerial(value) {
    const text = String(value || '').trim()
    if (!text) return ''
    const match = text.match(/^0*([1-9]\d*)(?:\s*\/\s*[1-9]\d*)?(?:\s*编)?$/)
    return match ? String(Number(match[1])) : ''
  }

  function normalizeImageNumber(value, printRun) {
    const text = String(value || '').trim()
    if (!text) return ''
    if (text.indexOf('/') >= 0) return text.replace(/\s*\/\s*/g, '/')
    const serial = parseImageSerial(text)
    if (serial && printRun) return `${serial}/${printRun}`
    return text
  }

  function getItemTargetCount(item) {
    return getCompletionTarget(item)
  }

  function getItemCollectedCount(item) {
    const images = Array.isArray(item && item.images) ? item.images : []
    const validImages = images.filter(img => !!extractImageUrl(img))
    const target = getItemTargetCount(item)
    const printRun = getPrintRun(item)
    if (!printRun) return Math.min(target, validImages.length)

    const serials = new Set()
    let independentCount = 0
    validImages.forEach(img => {
      const serial = typeof img === 'string' ? '' : parseImageSerial(img.number)
      if (serial) serials.add(serial)
      else independentCount += 1
    })
    return Math.min(target, serials.size + independentCount)
  }

  function buildChecklistProgressStats(checklist) {
    const items = Array.isArray(checklist) ? checklist : []
    const allImages = []
    let collected = 0
    let total = 0

    items.forEach(item => {
      collected += getItemCollectedCount(item)
      total += getItemTargetCount(item)
      ;(Array.isArray(item && item.images) ? item.images : []).forEach(img => {
        const url = extractImageUrl(img)
        if (url) allImages.push(url)
      })
    })

    return {
      totalCards: total,
      withImages: collected,
      missing: Math.max(0, total - collected),
      listCollectedCount: collected,
      listTotalCount: total,
      listProgress: total ? Math.round(collected / total * 100) : 0,
      listImageCount: allImages.length,
      listRecentImages: allImages.slice(-5).reverse(),
      listIsFree: false
    }
  }

  function itemPassesProgressFilter(item, filter) {
    const collected = getItemCollectedCount(item)
    const target = getItemTargetCount(item)
    if (filter === 'withImage') return collected > 0
    if (filter === 'missing') return collected < target
    return true
  }

  return {
    extractImageUrl,
    parsePrintRunText,
    parsePrintRunValue,
    getPrintRun,
    getCompletionTarget,
    parseImageSerial,
    normalizeImageNumber,
    getItemTargetCount,
    getItemCollectedCount,
    buildChecklistProgressStats,
    itemPassesProgressFilter
  }
})()

if (typeof module !== 'undefined' && module.exports) {
  module.exports = collectionProgress
}
