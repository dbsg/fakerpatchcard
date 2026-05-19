const https = require('https')
const fs = require('fs')
const path = require('path')

const APPID = 'wx13497267f3b92c0f'
const CLOUD_ENV = 'cloudbase-1g5rcsava7547769'
const ENV_PATH = path.join(__dirname, '.env')

const args = new Set(process.argv.slice(2))
const APPLY = args.has('--apply')
const AUDIT_ALL = args.has('--audit-all')
const LINK_ALL = args.has('--link-all')
const INSPECT_MIKE_MILLER = args.has('--inspect-mike-miller')
const INSPECT_LEDGER_NUMBERS = args.has('--inspect-ledger-numbers')
const REPAIR_LEDGER_NUMBERS = args.has('--repair-ledger-numbers')
const PUBLIC_ID = readArg('--public-id') || 'dbsg'

function readArg(name) {
  const index = process.argv.indexOf(name)
  return index >= 0 ? process.argv[index + 1] : ''
}

function loadEnv() {
  if (!fs.existsSync(ENV_PATH)) return {}
  const env = {}
  fs.readFileSync(ENV_PATH, 'utf8').split('\n').forEach(line => {
    const match = line.match(/^\s*([^#=]+?)\s*=\s*(.+?)\s*$/)
    if (match) env[match[1]] = match[2]
  })
  return env
}

function httpGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return httpGet(res.headers.location).then(resolve).catch(reject)
      }
      const chunks = []
      res.on('data', chunk => chunks.push(chunk))
      res.on('end', () => {
        const body = Buffer.concat(chunks)
        if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}: ${body.toString('utf8')}`))
        resolve(body)
      })
      res.on('error', reject)
    }).on('error', reject)
  })
}

function httpPost(url, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body)
    const parsed = new URL(url)
    const req = https.request({
      hostname: parsed.hostname,
      port: parsed.port || 443,
      path: parsed.pathname + parsed.search,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
    }, res => {
      const chunks = []
      res.on('data', chunk => chunks.push(chunk))
      res.on('end', () => {
        const text = Buffer.concat(chunks).toString('utf8')
        try { resolve(JSON.parse(text)) } catch (_) { reject(new Error(`Invalid JSON response: ${text}`)) }
      })
      res.on('error', reject)
    })
    req.on('error', reject)
    req.write(data)
    req.end()
  })
}

async function getAccessToken(appSecret) {
  const result = JSON.parse((await httpGet(`https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${APPID}&secret=${appSecret}`)).toString('utf8'))
  if (result.errcode) throw new Error(`获取 access_token 失败: ${result.errmsg} (${result.errcode})`)
  return result.access_token
}

async function callCloudApi(accessToken, apiName, body) {
  const result = await httpPost(`https://api.weixin.qq.com/tcb/${apiName}?access_token=${accessToken}`, { env: CLOUD_ENV, ...body })
  if (result.errcode !== 0) throw new Error(`${apiName} 失败: ${result.errmsg} (${result.errcode})`)
  return result
}

function quote(value) {
  return JSON.stringify(value)
}

function parseDocs(result) {
  return (result.data || []).map(item => JSON.parse(item))
}

async function queryCloudDB(accessToken, query) {
  return callCloudApi(accessToken, 'databasequery', { query })
}

async function updateCloudDB(accessToken, query) {
  return callCloudApi(accessToken, 'databaseupdate', { query })
}

async function fetchAll(accessToken, collectionName, where = '') {
  const docs = []
  for (let skip = 0; ; skip += 100) {
    const page = parseDocs(await queryCloudDB(accessToken, `db.collection(${quote(collectionName)})${where}.skip(${skip}).limit(100).get()`))
    docs.push(...page)
    if (page.length < 100) break
  }
  return docs
}

function cleanText(value) {
  return String(value || '').trim()
}

function compareText(value) {
  return cleanText(value).toLowerCase().replace(/[·\s_#\-/,，、'’]+/g, '')
}

function cleanCardNumber(value) {
  return cleanText(value).replace(/^#\s*/, '').replace(/\s*\/\s*/g, '/')
}

function numberParts(value) {
  const text = cleanCardNumber(value)
  const match = text.match(/^(\d+)?\/(\d+)$/)
  if (!match) return { numerator: '', denominator: '' }
  return { numerator: match[1] || '', denominator: match[2] || '' }
}

function parsePrintRunFromText(value) {
  const match = cleanText(value).match(/(?:^|\s)#?\/\s*([1-9]\d{0,5})\s*(?:编)?$/)
  return match ? String(Number(match[1])) : ''
}

function getPrintRun(item = {}) {
  const numeric = Number(item.printRun)
  if (Number.isInteger(numeric) && numeric > 0) return String(numeric)
  return parsePrintRunFromText(item.text || item.itemText || item.cardName || item.number || item.cardNumber)
}

function getPrintRunWithSource(label, item = {}) {
  const numeric = Number(item.printRun)
  if (Number.isInteger(numeric) && numeric > 0) {
    return { printRun: String(numeric), source: `${label}.printRun` }
  }
  const fields = ['text', 'itemText', 'cardName', 'cardKind', 'number', 'cardNumber']
  for (const field of fields) {
    const printRun = parsePrintRunFromText(item[field])
    if (printRun) return { printRun, source: `${label}.${field}` }
  }
  return null
}

function getRepairPrintRun(item = {}, imageRef, relation) {
  const candidates = [
    imageRef && imageRef.item ? getPrintRunWithSource('imageItem', imageRef.item) : null,
    relation ? getPrintRunWithSource('relation', relation) : null,
    getPrintRunWithSource('ledger', item)
  ].filter(Boolean)
  return candidates[0] || null
}

function includesAny(value, needles) {
  const text = compareText(value)
  return needles.some(needle => text.includes(compareText(needle)))
}

function hasKanterIdentity(item = {}) {
  return includesAny([
    item.player,
    item.playerCN,
    item.cardName,
    item.itemText,
    item.text,
    item.seriesName
  ].filter(Boolean).join(' '), ['enes kanter', 'kanter', '埃内斯坎特', '坎特'])
}

function hasFlawless2015(item = {}) {
  const haystack = [
    item.seriesName,
    item.year,
    item.brand,
    item.cardSeries,
    item.subset,
    item.cardName,
    item.itemText,
    item.text
  ].filter(Boolean).join(' ')
  const text = compareText(haystack)
  return text.includes('201516') && text.includes('panini') && text.includes('flawless')
}

function isMikeMillerItem(item = {}) {
  return includesAny([
    item.player,
    item.playerCN,
    item.cardName,
    item.cardKind,
    item.itemText,
    item.text,
    item.seriesName,
    item.cardSeries
  ].filter(Boolean).join(' '), ['mike miller', 'mikemiller', '迈克米勒', '麦克米勒'])
}

function summarizeMikeLedger(item = {}) {
  return {
    _id: item._id || '',
    status: item.status || '',
    player: item.player || '',
    playerCN: item.playerCN || '',
    year: item.year || '',
    brand: item.brand || '',
    cardSeries: item.cardSeries || '',
    cardName: item.cardName || '',
    cardNumber: item.cardNumber || item.number || '',
    cardFeatures: item.cardFeatures || [],
    condition: item.condition || '',
    quantity: item.quantity || '',
    seriesId: item.seriesId || '',
    seriesName: item.seriesName || '',
    subset: item.subset || '',
    itemId: item.itemId || '',
    itemText: item.itemText || '',
    imageId: item.imageId || '',
    imageUrl: item.imageUrl || '',
    legacyRelationId: item.legacyRelationId || '',
    createTime: item.createTime || '',
    updateTime: item.updateTime || ''
  }
}

function summarizeLedgerNumber(item = {}) {
  const rawNumber = item.cardNumber || item.number || ''
  const cleanNumber = cleanCardNumber(rawNumber)
  const printRunInfo = getPrintRunWithSource('ledger', item)
  return {
    _id: item._id || '',
    status: item.status || '',
    player: item.player || '',
    playerCN: item.playerCN || '',
    year: item.year || '',
    brand: item.brand || '',
    cardSeries: item.cardSeries || '',
    cardName: item.cardName || '',
    cardKind: item.cardKind || '',
    cardNumber: item.cardNumber || '',
    number: item.number || '',
    cleanNumber,
    numberType: isSerialNumber(cleanNumber)
      ? 'full'
      : (parsePlainSerialNumerator(cleanNumber) ? 'pure-numerator' : (/^\/[1-9]\d*$/.test(cleanNumber) ? 'denominator-only' : (cleanNumber ? 'other' : 'empty'))),
    inferredPrintRun: printRunInfo ? printRunInfo.printRun : '',
    inferredPrintRunSource: printRunInfo ? printRunInfo.source : '',
    seriesId: item.seriesId || '',
    seriesName: item.seriesName || '',
    itemId: item.itemId || '',
    itemText: item.itemText || '',
    imageId: item.imageId || '',
    imageUrl: item.imageUrl || ''
  }
}

function summarizeMikeImageRef(ref = {}) {
  const img = ref.img || {}
  return {
    source: ref.collection || '',
    docId: ref.docId || '',
    itemIndex: ref.itemIndex,
    imageIndex: ref.imageIndex,
    seriesId: (ref.series && ref.series._id) || '',
    seriesName: (ref.series && ref.series.name) || '',
    itemId: (ref.item && ref.item.itemId) || '',
    itemText: (ref.item && ref.item.text) || '',
    itemSubset: (ref.item && ref.item.subset) || '',
    imageId: img.imageId || '',
    url: img.url || '',
    number: img.number || '',
    player: img.player || '',
    playerCN: img.playerCN || '',
    year: img.year || '',
    brand: img.brand || '',
    cardSeries: img.cardSeries || '',
    cardKind: img.cardKind || '',
    cardFeatures: img.cardFeatures || [],
    ownedBy: img.ownedBy || []
  }
}

function isFiveOfFiveLedger(item = {}) {
  const parts = numberParts(item.cardNumber || item.number)
  return parts.numerator === '5' && parts.denominator === '5'
}

function isFiveRunLegacy(item = {}) {
  const parts = numberParts(item.cardNumber || item.number)
  if (parts.denominator === '5') return true
  return getPrintRun(item) === '5'
}

function listSeriesFeatures(series = {}) {
  if (Array.isArray(series.defaultCardFeatures)) return series.defaultCardFeatures
  if (Array.isArray(series.cardFeatures)) return series.cardFeatures
  return []
}

function relationIdFor(seriesId, img, openid) {
  return `${seriesId}_${(img && img.imageId) || encodeURIComponent((img && img.url) || '')}_${openid}`
}

function buildScannedRelation(series, item, img, openid) {
  const relationId = relationIdFor(series._id, img, openid)
  const ownerMetaBy = img.ownerMetaBy && typeof img.ownerMetaBy === 'object' ? img.ownerMetaBy : {}
  const meta = ownerMetaBy[openid] || {}
  return {
    _id: relationId,
    relationId,
    _synthetic: true,
    openid,
    seriesId: series._id,
    seriesName: series.name || '',
    imageId: img.imageId || '',
    imageUrl: img.url || '',
    backImageUrl: img.backImageUrl || '',
    detailImageUrls: Array.isArray(img.detailImageUrls) ? img.detailImageUrls : [],
    subset: item.subset || '',
    itemId: item.itemId || '',
    itemText: item.text || '',
    status: meta.status || 'owned',
    note: meta.note || '',
    player: img.player || '',
    playerCN: img.playerCN || '',
    year: img.year || '',
    brand: img.brand || '',
    cardSeries: img.cardSeries || '',
    cardName: img.cardKind || '',
    cardNumber: cleanCardNumber(img.number),
    cardFeatures: Array.from(new Set([...(Array.isArray(img.cardFeatures) ? img.cardFeatures : []), ...listSeriesFeatures(series)].filter(Boolean))),
    cardKind: img.cardKind || '',
    number: cleanCardNumber(img.number),
    printRun: Number(getPrintRun(item)) || 0,
    updateTime: img.updateTime || series.updateTime || ''
  }
}

function collectScannedRelations(seriesList, subsetDocs, openid) {
  const seriesMap = new Map(seriesList.map(series => [series._id, series]))
  const result = []
  const push = (series, item, img) => {
    if (!series || !img || typeof img === 'string' || !img.url) return
    const ownedBy = Array.isArray(img.ownedBy) ? img.ownedBy : []
    if (!ownedBy.includes(openid)) return
    result.push(buildScannedRelation(series, item || {}, img, openid))
  }

  seriesList.forEach(series => {
    ;(series.freeImages || []).forEach(img => push(series, { text: '自由图片', subset: '' }, img))
    ;(series.checklist || []).forEach(item => {
      ;((item && item.images) || []).forEach(img => push(series, item, img))
    })
  })
  subsetDocs.forEach(doc => {
    const series = seriesMap.get(doc.seriesId) || { _id: doc.seriesId, name: '' }
    ;(doc.items || []).forEach(item => {
      const nextItem = { ...item, subset: item.subset || doc.subset || '' }
      ;((item && item.images) || []).forEach(img => push(series, nextItem, img))
    })
  })
  return result
}

function mergeRelations(storedRelations, scannedRelations) {
  const map = new Map()
  const put = doc => {
    const id = doc.relationId || doc._id || `${doc.seriesId || ''}_${doc.imageId || encodeURIComponent(doc.imageUrl || '')}_${doc.openid || ''}`
    if (!id) return
    const old = map.get(id) || {}
    map.set(id, { ...old, ...doc, _id: old._id || doc._id || id, relationId: id })
  }
  storedRelations.forEach(doc => put({ ...doc, _synthetic: false }))
  scannedRelations.forEach(put)
  return [...map.values()]
}

function normalizeImageUrl(value) {
  const text = cleanText(value)
  const cdnPrefix = 'https://7072-prod-8g8ay186059e4264-1418320285.tcb.qcloud.la/'
  const cloudPrefix = 'cloud://prod-8g8ay186059e4264.7072-prod-8g8ay186059e4264-1418320285/'
  if (text.startsWith(cdnPrefix)) return cloudPrefix + text.slice(cdnPrefix.length)
  return text
}

function imageKeyById(seriesId, imageId) {
  return seriesId && imageId ? `${seriesId}::imageId::${imageId}` : ''
}

function imageKeyByUrl(seriesId, imageUrl) {
  const url = normalizeImageUrl(imageUrl)
  return seriesId && url ? `${seriesId}::url::${url}` : ''
}

function putImageRef(map, series, ref) {
  const img = ref.img || {}
  const byId = imageKeyById(series._id, img.imageId || '')
  const byUrl = imageKeyByUrl(series._id, img.url || '')
  if (byId) map.set(byId, ref)
  if (byUrl) map.set(byUrl, ref)
}

function collectImageRefs(seriesList, subsetDocs) {
  const map = new Map()
  const seriesMap = new Map(seriesList.map(series => [series._id, series]))

  seriesList.forEach(series => {
    ;(series.freeImages || []).forEach((img, imageIndex) => {
      putImageRef(map, series, {
        collection: 'my_series',
        field: 'freeImages',
        docId: series._id,
        series,
        item: { text: '自由图片', subset: '' },
        imageIndex,
        img
      })
    })
    ;(series.checklist || []).forEach((item, itemIndex) => {
      ;((item && item.images) || []).forEach((img, imageIndex) => {
        putImageRef(map, series, {
          collection: 'my_series',
          field: 'checklist',
          docId: series._id,
          series,
          item,
          itemIndex,
          imageIndex,
          img
        })
      })
    })
  })

  subsetDocs.forEach(doc => {
    const series = seriesMap.get(doc.seriesId) || { _id: doc.seriesId, name: '' }
    ;(doc.items || []).forEach((item, itemIndex) => {
      ;((item && item.images) || []).forEach((img, imageIndex) => {
        putImageRef(map, series, {
          collection: 'my_series_subsets',
          docId: doc._id,
          doc,
          series,
          item: { ...item, subset: item.subset || doc.subset || '' },
          itemIndex,
          imageIndex,
          img
        })
      })
    })
  })
  return map
}

function getImageRefForLedger(item, imageRefs) {
  return imageRefs.get(imageKeyById(item.seriesId, item.imageId)) ||
    imageRefs.get(imageKeyByUrl(item.seriesId, item.imageUrl)) ||
    null
}

function relationKeyById(seriesId, imageId) {
  return seriesId && imageId ? `${seriesId}::imageId::${imageId}` : ''
}

function relationKeyByUrl(seriesId, imageUrl) {
  const url = normalizeImageUrl(imageUrl)
  return seriesId && url ? `${seriesId}::url::${url}` : ''
}

function collectRelationsByImage(relations) {
  const map = new Map()
  relations.forEach(rel => {
    const byId = relationKeyById(rel.seriesId, rel.imageId)
    const byUrl = relationKeyByUrl(rel.seriesId, rel.imageUrl)
    if (byId) map.set(byId, rel)
    if (byUrl) map.set(byUrl, rel)
  })
  return map
}

function getRelationForLedger(item, relationByImage) {
  return relationByImage.get(relationKeyById(item.seriesId, item.imageId)) ||
    relationByImage.get(relationKeyByUrl(item.seriesId, item.imageUrl)) ||
    null
}

function isSerialNumber(value) {
  const parts = numberParts(value)
  return !!(parts.numerator && parts.denominator)
}

function parsePlainSerialNumerator(value) {
  const text = cleanCardNumber(value)
  if (!/^[1-9]\d*$/.test(text)) return ''
  return String(Number(text))
}

function buildLedgerNumberRepair(item, imageRef, relation) {
  const oldCardNumber = cleanCardNumber(item.cardNumber || item.number)
  const serial = parsePlainSerialNumerator(oldCardNumber)
  if (!serial) return null
  const printRunInfo = getRepairPrintRun(item, imageRef, relation)
  if (!printRunInfo || !printRunInfo.printRun) return null
  const serialNumber = Number(serial)
  const printRunNumber = Number(printRunInfo.printRun)
  if (!Number.isInteger(serialNumber) || !Number.isInteger(printRunNumber)) return null
  if (serialNumber <= 0 || printRunNumber <= 0 || serialNumber > printRunNumber) return null
  return {
    ledgerId: item._id,
    seriesId: item.seriesId || (imageRef && imageRef.series && imageRef.series._id) || '',
    seriesName: item.seriesName || (imageRef && imageRef.series && imageRef.series.name) || '',
    itemId: item.itemId || '',
    itemText: item.itemText || (imageRef && imageRef.item && imageRef.item.text) || '',
    player: item.player || '',
    playerCN: item.playerCN || '',
    cardName: item.cardName || '',
    oldCardNumber,
    nextCardNumber: `${serial}/${printRunInfo.printRun}`,
    printRun: printRunInfo.printRun,
    printRunSource: printRunInfo.source,
    imageId: item.imageId || (imageRef && imageRef.img && imageRef.img.imageId) || '',
    imageUrl: item.imageUrl || (imageRef && imageRef.img && imageRef.img.url) || ''
  }
}

function buildImageNumberRepairFromLedgerRepair(repair, imageRef) {
  if (!repair || !imageRef || !imageRef.img) return null
  const imageNumber = cleanCardNumber(imageRef.img.number)
  if (imageNumber === repair.nextCardNumber) return null
  const denominatorOnly = `/${repair.printRun}`
  const isSafeImageNumber = !imageNumber || imageNumber === repair.oldCardNumber || imageNumber === denominatorOnly
  if (!isSafeImageNumber) return null
  return {
    ledgerId: repair.ledgerId,
    seriesId: repair.seriesId,
    seriesName: repair.seriesName || (imageRef.series && imageRef.series.name) || '',
    itemId: repair.itemId || '',
    itemText: repair.itemText || (imageRef.item && imageRef.item.text) || '',
    player: repair.player || '',
    playerCN: repair.playerCN || '',
    ledgerNumber: repair.nextCardNumber,
    oldImageNumber: imageNumber,
    nextImageNumber: repair.nextCardNumber,
    collection: imageRef.collection,
    docId: imageRef.docId,
    field: imageRef.field || '',
    itemIndex: imageRef.itemIndex,
    imageIndex: imageRef.imageIndex,
    imageId: imageRef.img.imageId || '',
    imageUrl: imageRef.img.url || ''
  }
}

function buildStandaloneImageNumberRepair(imageRef) {
  if (!imageRef || !imageRef.img || !imageRef.item) return null
  const imageNumber = cleanCardNumber(imageRef.img.number)
  const serial = parsePlainSerialNumerator(imageNumber)
  if (!serial) return null
  const printRun = getPrintRun(imageRef.item)
  if (!printRun) return null
  const serialNumber = Number(serial)
  const printRunNumber = Number(printRun)
  if (!Number.isInteger(serialNumber) || !Number.isInteger(printRunNumber)) return null
  if (serialNumber <= 0 || printRunNumber <= 0 || serialNumber > printRunNumber) return null
  const nextImageNumber = `${serial}/${printRun}`
  if (imageNumber === nextImageNumber) return null
  return {
    ledgerId: '',
    seriesId: (imageRef.series && imageRef.series._id) || '',
    seriesName: (imageRef.series && imageRef.series.name) || '',
    itemId: (imageRef.item && imageRef.item.itemId) || '',
    itemText: (imageRef.item && imageRef.item.text) || '',
    player: imageRef.img.player || '',
    playerCN: imageRef.img.playerCN || '',
    ledgerNumber: '',
    oldImageNumber: imageNumber,
    nextImageNumber,
    collection: imageRef.collection,
    docId: imageRef.docId,
    field: imageRef.field || '',
    itemIndex: imageRef.itemIndex,
    imageIndex: imageRef.imageIndex,
    imageId: imageRef.img.imageId || '',
    imageUrl: imageRef.img.url || ''
  }
}

function buildRelationNumberRepairFromLedgerRepair(repair, relation) {
  if (!repair || !relation || relation._synthetic || !relation._id) return null
  const oldCardNumber = cleanCardNumber(relation.cardNumber || relation.number)
  if (oldCardNumber === repair.nextCardNumber) return null
  const isSafeRelationNumber = !oldCardNumber || oldCardNumber === repair.oldCardNumber || oldCardNumber === `/${repair.printRun}`
  if (!isSafeRelationNumber) return null
  return {
    relationId: relation._id,
    ledgerId: repair.ledgerId,
    seriesId: repair.seriesId,
    seriesName: repair.seriesName || relation.seriesName || '',
    player: repair.player || relation.player || '',
    playerCN: repair.playerCN || relation.playerCN || '',
    oldCardNumber,
    nextCardNumber: repair.nextCardNumber
  }
}

function buildNumberRepair(item, imageRef) {
  if (!imageRef || !imageRef.img) return null
  const ledgerNumber = cleanCardNumber(item.cardNumber || item.number)
  const imageNumber = cleanCardNumber(imageRef.img.number)
  const ledgerParts = numberParts(ledgerNumber)
  const imageParts = numberParts(imageNumber)
  if (!ledgerParts.numerator || !ledgerParts.denominator) return null
  if (ledgerNumber === imageNumber) return null
  if (imageParts.numerator) return null
  const itemPrintRun = getPrintRun(imageRef.item || {})
  const imageIsSerialNumerator = /^[1-9]\d*$/.test(imageNumber) &&
    imageNumber === ledgerParts.numerator &&
    itemPrintRun === ledgerParts.denominator
  if (!imageIsSerialNumerator && imageParts.denominator !== ledgerParts.denominator) return null
  return {
    ledgerId: item._id,
    seriesId: item.seriesId,
    seriesName: item.seriesName || imageRef.series.name || '',
    itemId: item.itemId || '',
    itemText: item.itemText || imageRef.item.text || '',
    player: item.player || '',
    playerCN: item.playerCN || '',
    ledgerNumber,
    oldImageNumber: imageNumber,
    nextImageNumber: ledgerNumber,
    collection: imageRef.collection,
    docId: imageRef.docId,
    itemIndex: imageRef.itemIndex,
    imageIndex: imageRef.imageIndex,
    imageId: imageRef.img.imageId || '',
    imageUrl: imageRef.img.url || ''
  }
}

function buildLegacyLinkRepair(item, relation) {
  if (!relation || !relation._id || cleanText(item.legacyRelationId) === cleanText(relation._id)) return null
  return {
    ledgerId: item._id,
    seriesId: item.seriesId,
    seriesName: item.seriesName || relation.seriesName || '',
    itemId: item.itemId || relation.itemId || '',
    itemText: item.itemText || relation.itemText || '',
    player: item.player || relation.player || '',
    playerCN: item.playerCN || relation.playerCN || '',
    cardNumber: item.cardNumber || '',
    oldLegacyRelationId: item.legacyRelationId || '',
    nextLegacyRelationId: relation._id,
    relationId: relation.relationId || '',
    imageId: item.imageId || relation.imageId || '',
    imageUrl: item.imageUrl || relation.imageUrl || ''
  }
}

function buildAuditPlan(ledgerItems, relations, imageRefs) {
  const relationByImage = collectRelationsByImage(relations)
  const ledgerNumberRepairs = []
  const numberRepairs = []
  const relationNumberRepairs = []
  const legacyLinkRepairs = []
  const skippedMismatches = []
  const numberRepairKeys = new Set()
  const relationNumberRepairIds = new Set()

  const pushNumberRepair = repair => {
    if (!repair) return
    const key = [
      repair.collection || '',
      repair.docId || '',
      repair.itemIndex == null ? '' : repair.itemIndex,
      repair.imageIndex == null ? '' : repair.imageIndex,
      repair.nextImageNumber || ''
    ].join('|')
    if (numberRepairKeys.has(key)) return
    numberRepairKeys.add(key)
    numberRepairs.push(repair)
  }

  const pushRelationNumberRepair = repair => {
    if (!repair || relationNumberRepairIds.has(repair.relationId)) return
    relationNumberRepairIds.add(repair.relationId)
    relationNumberRepairs.push(repair)
  }

  imageRefs.forEach(ref => {
    pushNumberRepair(buildStandaloneImageNumberRepair(ref))
  })

  ledgerItems.forEach(item => {
    const hasImageLink = !!(item.seriesId && (item.imageId || item.imageUrl))
    const imageRef = hasImageLink ? getImageRefForLedger(item, imageRefs) : null
    const relation = hasImageLink ? getRelationForLedger(item, relationByImage) : null
    const ledgerRepair = buildLedgerNumberRepair(item, imageRef, relation)
    if (ledgerRepair) {
      ledgerNumberRepairs.push(ledgerRepair)
      pushNumberRepair(buildImageNumberRepairFromLedgerRepair(ledgerRepair, imageRef))
      pushRelationNumberRepair(buildRelationNumberRepairFromLedgerRepair(ledgerRepair, relation))
    }
    if (!hasImageLink) return
    if (imageRef) {
      const numberRepair = buildNumberRepair(item, imageRef)
      pushNumberRepair(numberRepair)
      const ledgerNumber = cleanCardNumber(item.cardNumber || item.number)
      const imageNumber = cleanCardNumber(imageRef.img && imageRef.img.number)
      if (
        isSerialNumber(ledgerNumber) &&
        imageNumber &&
        ledgerNumber !== imageNumber &&
        !numberRepair
      ) {
        skippedMismatches.push({
          ledgerId: item._id,
          seriesName: item.seriesName || imageRef.series.name || '',
          player: item.player || '',
          playerCN: item.playerCN || '',
          ledgerNumber,
          imageNumber,
          reason: '不是安全的 /分母 -> 分子/分母 修复'
        })
      }
    }
    const linkRepair = buildLegacyLinkRepair(item, relation)
    if (linkRepair) legacyLinkRepairs.push(linkRepair)
  })

  return { ledgerNumberRepairs, numberRepairs, relationNumberRepairs, legacyLinkRepairs, skippedMismatches }
}

async function applyLedgerNumberRepair(accessToken, repair) {
  await updateCloudDB(accessToken, `db.collection("user_card_items").doc(${quote(repair.ledgerId)}).update({
    data: ${JSON.stringify({ cardNumber: repair.nextCardNumber, updateTime: new Date().toISOString() })}
  })`)
}

async function applyNumberRepair(accessToken, repair, subsetDocsById, seriesById) {
  const now = new Date().toISOString()
  if (repair.collection === 'my_series_subsets') {
    const doc = subsetDocsById.get(repair.docId)
    if (!doc) throw new Error(`未找到 subset doc ${repair.docId}`)
    const items = JSON.parse(JSON.stringify(doc.items || []))
    const img = items[repair.itemIndex] && items[repair.itemIndex].images && items[repair.itemIndex].images[repair.imageIndex]
    if (!img) throw new Error(`未找到 subset image ${repair.docId}/${repair.itemIndex}/${repair.imageIndex}`)
    img.number = repair.nextImageNumber
    await updateCloudDB(accessToken, `db.collection("my_series_subsets").doc(${quote(repair.docId)}).update({
      data: ${JSON.stringify({ items, updateTime: now })}
    })`)
    doc.items = items
    return
  }

  const series = seriesById.get(repair.docId)
  if (!series) throw new Error(`未找到 series ${repair.docId}`)
  if (repair.field === 'freeImages') {
    const freeImages = JSON.parse(JSON.stringify(series.freeImages || []))
    if (!freeImages[repair.imageIndex]) throw new Error(`未找到 free image ${repair.docId}/${repair.imageIndex}`)
    freeImages[repair.imageIndex].number = repair.nextImageNumber
    await updateCloudDB(accessToken, `db.collection("my_series").doc(${quote(repair.docId)}).update({
      data: ${JSON.stringify({ freeImages, updateTime: now })}
    })`)
    series.freeImages = freeImages
    return
  }

  const checklist = JSON.parse(JSON.stringify(series.checklist || []))
  const img = checklist[repair.itemIndex] && checklist[repair.itemIndex].images && checklist[repair.itemIndex].images[repair.imageIndex]
  if (!img) throw new Error(`未找到 checklist image ${repair.docId}/${repair.itemIndex}/${repair.imageIndex}`)
  img.number = repair.nextImageNumber
  await updateCloudDB(accessToken, `db.collection("my_series").doc(${quote(repair.docId)}).update({
    data: ${JSON.stringify({ checklist, updateTime: now })}
  })`)
  series.checklist = checklist
}

async function applyLegacyLinkRepair(accessToken, repair) {
  await updateCloudDB(accessToken, `db.collection("user_card_items").doc(${quote(repair.ledgerId)}).update({
    data: ${JSON.stringify({ legacyRelationId: repair.nextLegacyRelationId, updateTime: new Date().toISOString() })}
  })`)
}

async function applyRelationNumberRepair(accessToken, repair) {
  await updateCloudDB(accessToken, `db.collection("user_card_relations").doc(${quote(repair.relationId)}).update({
    data: ${JSON.stringify({ cardNumber: repair.nextCardNumber, updateTime: new Date().toISOString() })}
  })`)
}

function summarizeItem(item = {}) {
  return {
    _id: item._id || '',
    relationId: item.relationId || '',
    legacyRelationId: item.legacyRelationId || '',
    synthetic: !!item._synthetic,
    seriesId: item.seriesId || '',
    seriesName: item.seriesName || '',
    itemId: item.itemId || '',
    itemText: item.itemText || item.text || '',
    player: item.player || '',
    playerCN: item.playerCN || '',
    year: item.year || '',
    brand: item.brand || '',
    cardSeries: item.cardSeries || '',
    cardName: item.cardName || '',
    cardNumber: item.cardNumber || item.number || '',
    printRun: item.printRun || '',
    imageId: item.imageId || '',
    imageUrl: item.imageUrl || ''
  }
}

function buildPatch(ledger, legacy) {
  const now = new Date().toISOString()
  const patch = {
    legacyRelationId: legacy._id || legacy.relationId || ledger.legacyRelationId || '',
    seriesId: legacy.seriesId || ledger.seriesId || '',
    seriesName: legacy.seriesName || ledger.seriesName || '',
    subset: legacy.subset || ledger.subset || '',
    itemId: legacy.itemId || ledger.itemId || '',
    itemText: legacy.itemText || ledger.itemText || '',
    imageId: legacy.imageId || ledger.imageId || '',
    imageUrl: legacy.imageUrl || ledger.imageUrl || '',
    backImageUrl: legacy.backImageUrl || ledger.backImageUrl || '',
    detailImageUrls: Array.isArray(legacy.detailImageUrls) ? legacy.detailImageUrls : (Array.isArray(ledger.detailImageUrls) ? ledger.detailImageUrls : []),
    updateTime: now
  }
  Object.keys(patch).forEach(key => {
    if (patch[key] == null) patch[key] = ''
  })
  return patch
}

async function main() {
  const env = loadEnv()
  const appSecret = env.APP_SECRET || process.env.APP_SECRET
  if (!appSecret) throw new Error(`缺少 ${ENV_PATH} 中的 APP_SECRET`)

  const accessToken = await getAccessToken(appSecret)
  const publicIdKey = PUBLIC_ID.toLowerCase()
  const profiles = parseDocs(await queryCloudDB(
    accessToken,
    `db.collection("user_public_profiles").where({publicIdKey:${quote(publicIdKey)}}).limit(20).get()`
  ))
  const openid = profiles[0] && (profiles[0].openid || profiles[0]._openid)
  if (!openid) throw new Error(`未找到公开 ID ${PUBLIC_ID} 对应用户`)

  const [ledgerItems, storedRelations, seriesList, subsetDocs] = await Promise.all([
    fetchAll(accessToken, 'user_card_items', `.where({openid:${quote(openid)}})`),
    fetchAll(accessToken, 'user_card_relations', `.where({openid:${quote(openid)}})`),
    fetchAll(accessToken, 'my_series'),
    fetchAll(accessToken, 'my_series_subsets')
  ])
  const relations = mergeRelations(storedRelations, collectScannedRelations(seriesList, subsetDocs, openid))
  const imageRefs = collectImageRefs(seriesList, subsetDocs)
  const seriesById = new Map(seriesList.map(series => [series._id, series]))
  const subsetDocsById = new Map(subsetDocs.map(doc => [doc._id, doc]))

  if (INSPECT_LEDGER_NUMBERS) {
    const summaries = ledgerItems.map(summarizeLedgerNumber)
    const counts = summaries.reduce((map, item) => {
      map[item.numberType] = (map[item.numberType] || 0) + 1
      return map
    }, {})
    const printRunCandidates = summaries.filter(item => item.inferredPrintRun)
    const repairableShape = summaries.filter(item => item.numberType === 'pure-numerator' && item.inferredPrintRun)
    const pureNumerator = summaries.filter(item => item.numberType === 'pure-numerator')
    const denominatorOnly = summaries.filter(item => item.numberType === 'denominator-only')
    console.log(JSON.stringify({
      mode: 'inspect-ledger-numbers',
      publicId: PUBLIC_ID,
      openid,
      totalLedgerItems: ledgerItems.length,
      counts,
      printRunCandidateCount: printRunCandidates.length,
      pureNumeratorCount: pureNumerator.length,
      repairableShapeCount: repairableShape.length,
      denominatorOnlyCount: denominatorOnly.length,
      pureNumerator,
      repairableShape,
      denominatorOnly,
      printRunCandidates
    }, null, 2))
    return
  }

  if (INSPECT_MIKE_MILLER) {
    const mikeLedgerItems = ledgerItems.filter(isMikeMillerItem)
    const mikeImageRefs = []
    const seenRefs = new Set()
    imageRefs.forEach(ref => {
      const img = ref.img || {}
      const haystack = [
        ref.series && ref.series.name,
        ref.item && ref.item.text,
        ref.item && ref.item.subset,
        img.player,
        img.playerCN,
        img.cardKind,
        img.number,
        img.url
      ].filter(Boolean).join(' ')
      if (!isMikeMillerItem({ text: haystack })) return
      const key = [
        (ref.series && ref.series._id) || '',
        img.imageId || '',
        normalizeImageUrl(img.url || ''),
        ref.collection || '',
        ref.docId || '',
        ref.itemIndex,
        ref.imageIndex
      ].join('|')
      if (seenRefs.has(key)) return
      seenRefs.add(key)
      mikeImageRefs.push(ref)
    })
    const refsByUrl = {}
    mikeImageRefs.forEach(ref => {
      const url = normalizeImageUrl((ref.img && ref.img.url) || '')
      if (!url) return
      refsByUrl[url] = refsByUrl[url] || []
      refsByUrl[url].push(summarizeMikeImageRef(ref))
    })
    const duplicateImageUrls = Object.keys(refsByUrl)
      .filter(url => refsByUrl[url].length > 1)
      .map(url => ({ url, refs: refsByUrl[url] }))
    console.log(JSON.stringify({
      mode: 'inspect-mike-miller',
      publicId: PUBLIC_ID,
      openid,
      ledgerCount: mikeLedgerItems.length,
      ledgerItems: mikeLedgerItems.map(summarizeMikeLedger),
      imageRefCount: mikeImageRefs.length,
      imageRefs: mikeImageRefs.map(summarizeMikeImageRef),
      duplicateImageUrls
    }, null, 2))
    return
  }

  if (AUDIT_ALL) {
    const plan = buildAuditPlan(ledgerItems, relations, imageRefs)
    const numberRepairLedgerIds = new Set(plan.numberRepairs.map(item => item.ledgerId))
    const targetedLegacyLinkRepairs = plan.legacyLinkRepairs.filter(item => numberRepairLedgerIds.has(item.ledgerId))
    console.log(JSON.stringify({
      mode: APPLY ? 'audit-all-apply' : 'audit-all-dry-run',
      publicId: PUBLIC_ID,
      openid,
      totalLedgerItems: ledgerItems.length,
      totalRelations: relations.length,
      ledgerNumberRepairCount: plan.ledgerNumberRepairs.length,
      numberRepairCount: plan.numberRepairs.length,
      relationNumberRepairCount: plan.relationNumberRepairs.length,
      legacyLinkRepairCount: plan.legacyLinkRepairs.length,
      targetedLegacyLinkRepairCount: targetedLegacyLinkRepairs.length,
      skippedMismatchCount: plan.skippedMismatches.length,
      ledgerNumberRepairs: plan.ledgerNumberRepairs,
      numberRepairs: plan.numberRepairs,
      relationNumberRepairs: plan.relationNumberRepairs,
      targetedLegacyLinkRepairs,
      legacyLinkRepairs: plan.legacyLinkRepairs,
      skippedMismatches: plan.skippedMismatches
    }, null, 2))

    if (!APPLY) {
      console.log('Dry-run only. Use --audit-all --apply to apply safe history repairs.')
      return
    }

    for (const repair of plan.ledgerNumberRepairs) {
      await applyLedgerNumberRepair(accessToken, repair)
    }
    for (const repair of plan.numberRepairs) {
      await applyNumberRepair(accessToken, repair, subsetDocsById, seriesById)
    }
    for (const repair of plan.relationNumberRepairs) {
      await applyRelationNumberRepair(accessToken, repair)
    }
    const legacyLinkRepairsToApply = LINK_ALL ? plan.legacyLinkRepairs : targetedLegacyLinkRepairs
    for (const repair of legacyLinkRepairsToApply) {
      await applyLegacyLinkRepair(accessToken, repair)
    }
    console.log(JSON.stringify({
      ok: true,
      ledgerNumberRepaired: plan.ledgerNumberRepairs.length,
      numberRepaired: plan.numberRepairs.length,
      relationNumberRepaired: plan.relationNumberRepairs.length,
      legacyLinked: legacyLinkRepairsToApply.length,
      legacyLinkScope: LINK_ALL ? 'all' : 'number-repair-targeted'
    }, null, 2))
    return
  }

  if (REPAIR_LEDGER_NUMBERS) {
    const plan = buildAuditPlan(ledgerItems, relations, imageRefs)
    const ledgerRepairIds = new Set(plan.ledgerNumberRepairs.map(repair => repair.ledgerId))
    const imageNumberRepairs = plan.numberRepairs.filter(repair => ledgerRepairIds.has(repair.ledgerId))
    console.log(JSON.stringify({
      mode: APPLY ? 'repair-ledger-numbers-apply' : 'repair-ledger-numbers-dry-run',
      publicId: PUBLIC_ID,
      openid,
      totalLedgerItems: ledgerItems.length,
      ledgerNumberRepairCount: plan.ledgerNumberRepairs.length,
      imageNumberRepairCount: imageNumberRepairs.length,
      relationNumberRepairCount: plan.relationNumberRepairs.length,
      ledgerNumberRepairs: plan.ledgerNumberRepairs,
      imageNumberRepairs,
      relationNumberRepairs: plan.relationNumberRepairs
    }, null, 2))

    if (!APPLY) {
      console.log('Dry-run only. Use --repair-ledger-numbers --apply to apply safe ledger number repairs.')
      return
    }

    for (const repair of plan.ledgerNumberRepairs) {
      await applyLedgerNumberRepair(accessToken, repair)
    }
    for (const repair of imageNumberRepairs) {
      await applyNumberRepair(accessToken, repair, subsetDocsById, seriesById)
    }
    for (const repair of plan.relationNumberRepairs) {
      await applyRelationNumberRepair(accessToken, repair)
    }
    console.log(JSON.stringify({
      ok: true,
      ledgerNumberRepaired: plan.ledgerNumberRepairs.length,
      imageNumberRepaired: imageNumberRepairs.length,
      relationNumberRepaired: plan.relationNumberRepairs.length
    }, null, 2))
    return
  }

  const ledgerCandidates = ledgerItems.filter(item => (
    hasKanterIdentity(item) &&
    hasFlawless2015(item) &&
    isFiveOfFiveLedger(item)
  ))
  const legacyCandidates = relations.filter(item => (
    hasKanterIdentity(item) &&
    hasFlawless2015(item) &&
    isFiveRunLegacy(item) &&
    !!item.imageUrl
  ))

  const targetLedger = ledgerCandidates.find(item => !item.imageUrl) || ledgerCandidates[0] || null
  const targetLegacy = legacyCandidates.find(item => item.imageUrl) || null
  const patch = targetLedger && targetLegacy ? buildPatch(targetLedger, targetLegacy) : null

  console.log(JSON.stringify({
    mode: APPLY ? 'apply' : 'dry-run',
    publicId: PUBLIC_ID,
    openid,
    ledgerCandidateCount: ledgerCandidates.length,
    legacyCandidateCount: legacyCandidates.length,
    ledgerCandidates: ledgerCandidates.map(summarizeItem),
    legacyCandidates: legacyCandidates.map(summarizeItem),
    selected: {
      ledger: summarizeItem(targetLedger),
      legacy: summarizeItem(targetLegacy),
      patch
    }
  }, null, 2))

  if (ledgerCandidates.length !== 1) {
    throw new Error(`为避免误修复，预期只命中 1 条新台账，实际 ${ledgerCandidates.length}`)
  }
  if (legacyCandidates.length !== 1) {
    throw new Error(`为避免误修复，预期只命中 1 条旧持有，实际 ${legacyCandidates.length}`)
  }
  if (!patch || !patch.imageUrl) throw new Error('旧持有记录没有可回填的图片')

  if (!APPLY) {
    console.log('Dry-run only. Use --apply to link the ledger item to the legacy owned image.')
    return
  }

  await updateCloudDB(accessToken, `db.collection("user_card_items").doc(${quote(targetLedger._id)}).update({
    data: ${JSON.stringify(patch)}
  })`)
  console.log(JSON.stringify({ ok: true, updated: targetLedger._id, patch }, null, 2))
}

main().catch(err => {
  console.error(err.message || err)
  process.exit(1)
})
