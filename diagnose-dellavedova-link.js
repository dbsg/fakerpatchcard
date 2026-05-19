const https = require('https')
const fs = require('fs')
const path = require('path')
const {
  buildSameCardIdentityKey,
  findLinkedSameCardPeers,
  scoreLedgerLinkCandidate
} = require('../miniprogram-card/cloudfunctions/seriesOps/ledgerMatcher')

const APPID = 'wx13497267f3b92c0f'
const CLOUD_ENV = 'cloudbase-1g5rcsava7547769'
const ENV_PATH = path.join(__dirname, '.env')
const SERIES_ID = 'f0df711e69e0abf80486fafe28f4cb3b'
const TARGET_CARD_NUMBER = '17/21'
const TARGET_CARD_NAME = '22 Matthew Dellavedova, Cleveland Cavaliers /21'

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

async function queryCloudDB(accessToken, query) {
  return callCloudApi(accessToken, 'databasequery', { query })
}

function parseDocs(result) {
  return (result.data || []).map(item => JSON.parse(item))
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

function normalizeNumber(value) {
  return String(value || '').trim().replace(/\s*\/\s*/g, '/')
}

function parsePrintRunText(value) {
  const match = String(value || '').trim().match(/(?:^|\s)#?\/\s*([1-9]\d{0,5})\s*(?:编)?$/)
  return match ? Number(match[1]) : 0
}

function getPrintRun(item) {
  const raw = Number(item && item.printRun)
  if (Number.isInteger(raw) && raw > 0) return raw
  return parsePrintRunText((item && (item.text || item.subset)) || '')
}

function normalizeImageNumber(value, printRun) {
  const text = String(value || '').trim()
  if (!text) return ''
  if (text.indexOf('/') >= 0) return text.replace(/\s*\/\s*/g, '/')
  const match = text.match(/^0*([1-9]\d*)(?:\s*\/\s*[1-9]\d*)?(?:\s*编)?$/)
  if (match && printRun) return `${Number(match[1])}/${printRun}`
  return text
}

function findTargetSeriesItem(series = {}, subsetDocs = [], userItem = {}) {
  const allItems = []
  subsetDocs.filter(doc => doc.seriesId === SERIES_ID).forEach(doc => {
    ;(doc.items || []).forEach((item, itemIndex) => allItems.push({ item: { ...item, subset: item.subset || doc.subset || '' }, doc, itemIndex }))
  })
  ;(series.checklist || []).forEach((item, itemIndex) => allItems.push({ item, itemIndex }))
  return allItems.find(entry => {
    if (userItem.itemId && entry.item.itemId === userItem.itemId) return true
    return String(entry.item.text || '').trim() === TARGET_CARD_NAME
  }) || null
}

function exactImagesForUserCard(entry, userItem) {
  if (!entry || !entry.item) return []
  const printRun = getPrintRun(entry.item)
  const targetNumber = normalizeNumber(userItem.cardNumber || userItem.number)
  return (entry.item.images || []).filter(img => img && typeof img !== 'string' && normalizeImageNumber(img.number, printRun) === targetNumber)
}

async function main() {
  const env = loadEnv()
  const appSecret = env.APP_SECRET || process.env.APP_SECRET
  if (!appSecret) throw new Error(`缺少 ${ENV_PATH} 中的 APP_SECRET`)

  const token = await getAccessToken(appSecret)
  const [targetItems, allUserItems, seriesDocs, subsetDocs] = await Promise.all([
    fetchAll(token, 'user_card_items', `.where({cardNumber:${quote(TARGET_CARD_NUMBER)}, cardName:${quote(TARGET_CARD_NAME)}})`),
    fetchAll(token, 'user_card_items', '.where({openid:"oaQG05Ax1I_QRhOkD4lwqOXEucV8"})'),
    fetchAll(token, 'my_series', `.where({_id:${quote(SERIES_ID)}})`),
    fetchAll(token, 'my_series_subsets', `.where({seriesId:${quote(SERIES_ID)}})`)
  ])
  const target = targetItems[0]
  if (!target) throw new Error('未找到目标 17/21 台账')
  const targetKey = buildSameCardIdentityKey(target)
  const sameKeyItems = allUserItems.filter(item => buildSameCardIdentityKey(item) === targetKey)
  const linkedPeers = findLinkedSameCardPeers(target, allUserItems)
  const targetFromPeer = linkedPeers[0] ? { ...target, seriesId: linkedPeers[0].seriesId, itemId: linkedPeers[0].itemId, itemText: linkedPeers[0].itemText || linkedPeers[0].cardName } : target
  const targetEntry = findTargetSeriesItem(seriesDocs[0] || {}, subsetDocs, targetFromPeer)
  const exactImages = exactImagesForUserCard(targetEntry, targetFromPeer)

  const scoreSamples = exactImages.map(img => {
    const draft = {
      seriesId: SERIES_ID,
      seriesName: (seriesDocs[0] && seriesDocs[0].name) || '',
      subset: targetEntry.item.subset || '',
      itemId: targetEntry.item.itemId || '',
      itemText: targetEntry.item.text || '',
      player: target.player || '',
      playerCN: target.playerCN || '',
      year: target.year || '',
      brand: target.brand || '',
      cardSeries: target.cardSeries || '',
      cardName: img.cardKind || targetEntry.item.cardKind || targetEntry.item.subset || '',
      cardNumber: normalizeImageNumber(img.number, getPrintRun(targetEntry.item)),
      cardFeatures: img.cardFeatures || []
    }
    return { imageId: img.imageId || '', number: img.number || '', score: scoreLedgerLinkCandidate(target, draft) }
  })

  console.log(JSON.stringify({
    target: {
      _id: target._id,
      seriesId: target.seriesId || '',
      itemId: target.itemId || '',
      imageId: target.imageId || '',
      imageUrl: target.imageUrl || '',
      cardName: target.cardName || '',
      cardNumber: target.cardNumber || '',
      identityKey: targetKey
    },
    sameKeyItems: sameKeyItems.map(item => ({
      _id: item._id,
      cardNumber: item.cardNumber || '',
      seriesId: item.seriesId || '',
      itemId: item.itemId || '',
      imageId: item.imageId || '',
      cardName: item.cardName || '',
      status: item.status || ''
    })),
    linkedPeers: linkedPeers.map(item => ({
      _id: item._id,
      cardNumber: item.cardNumber || '',
      seriesId: item.seriesId || '',
      itemId: item.itemId || '',
      imageId: item.imageId || '',
      itemText: item.itemText || '',
      cardName: item.cardName || ''
    })),
    targetEntry: targetEntry ? {
      docId: targetEntry.doc && targetEntry.doc._id,
      itemIndex: targetEntry.itemIndex,
      itemId: targetEntry.item.itemId || '',
      text: targetEntry.item.text || '',
      subset: targetEntry.item.subset || '',
      imageCount: (targetEntry.item.images || []).length
    } : null,
    exactImages: exactImages.map(img => ({ imageId: img.imageId || '', number: img.number || '', url: img.url || '' })),
    scoreSamples
  }, null, 2))
}

main().catch(err => {
  console.error(err.message || err)
  process.exit(1)
})
