const https = require('https')
const fs = require('fs')
const path = require('path')

const APPID = 'wx13497267f3b92c0f'
const CLOUD_ENV = 'cloudbase-1g5rcsava7547769'
const ENV_PATH = path.join(__dirname, '.env')
const SERIES_ID = 'f0df711e69e0abf80486fafe28f4cb3b'
const WRONG_ITEM_TEXT = '22 Matthew Dellavedova, Cleveland Cavaliers'
const EXPECTED_CARD_NAME = '22 Matthew Dellavedova, Cleveland Cavaliers /21'
const CARD_NUMBER = '17/21'

const args = new Set(process.argv.slice(2))
const APPLY = args.has('--apply')
const VERIFY_EMPTY = args.has('--verify-empty')

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

async function updateCloudDB(accessToken, query) {
  return callCloudApi(accessToken, 'databaseupdate', { query })
}

async function deleteCloudDB(accessToken, query) {
  return callCloudApi(accessToken, 'databasedelete', { query })
}

function parseDocs(result) {
  return (result.data || []).map(item => JSON.parse(item))
}

async function fetchAll(accessToken, collectionName, where = '') {
  const docs = []
  for (let skip = 0; ; skip += 100) {
    const query = `db.collection(${quote(collectionName)})${where}.skip(${skip}).limit(100).get()`
    const page = parseDocs(await queryCloudDB(accessToken, query))
    docs.push(...page)
    if (page.length < 100) break
  }
  return docs
}

function normalizeNumber(value) {
  return String(value || '').trim().replace(/\s*\/\s*/g, '/')
}

function imageMatches(img) {
  return img && typeof img !== 'string' && normalizeNumber(img.number) === CARD_NUMBER
}

function itemMatchesWrongSlot(item = {}) {
  return String(item.text || '').trim() === WRONG_ITEM_TEXT
}

function collectWrongSeriesImages(series = {}, subsetDocs = []) {
  const matches = []
  const visitItems = (items, context) => {
    ;(Array.isArray(items) ? items : []).forEach((item, itemIndex) => {
      if (!itemMatchesWrongSlot(item)) return
      const images = Array.isArray(item.images) ? item.images : []
      images.forEach((img, imageIndex) => {
        if (!imageMatches(img)) return
        matches.push({ ...context, itemIndex, imageIndex, item, image: img })
      })
    })
  }
  visitItems(series.checklist, { collection: 'my_series', docId: series._id, legacy: true })
  subsetDocs.forEach(doc => visitItems(doc.items, { collection: 'my_series_subsets', docId: doc._id, subsetDoc: doc }))
  return matches
}

function isTargetUserCardItem(item = {}, image = {}) {
  if (item.seriesId !== SERIES_ID) return false
  if (normalizeNumber(item.cardNumber || item.number) !== CARD_NUMBER) return false
  if (String(item.cardName || item.itemText || '').trim() !== EXPECTED_CARD_NAME) return false
  if (image.imageId && item.imageId && item.imageId === image.imageId) return true
  if (image.url && item.imageUrl && item.imageUrl === image.url) return true
  return !item.imageId && !image.imageId
}

function buildPlan(series, subsetDocs, userItems, relations) {
  const wrongImages = collectWrongSeriesImages(series, subsetDocs)
  const plans = wrongImages.map(match => {
    const image = match.image || {}
    const linkedUserItems = userItems.filter(item => isTargetUserCardItem(item, image))
    const linkedRelations = relations.filter(rel => {
      if (rel.seriesId !== SERIES_ID) return false
      if (image.imageId && rel.imageId === image.imageId) return true
      if (image.url && rel.imageUrl === image.url) return true
      return false
    })
    return {
      match,
      linkedUserItems,
      linkedRelations
    }
  })
  return plans
}

function summarizePlan(plans) {
  return plans.map(plan => ({
    seriesDoc: plan.match.docId,
    collection: plan.match.collection,
    itemText: plan.match.item.text || '',
    itemId: plan.match.item.itemId || '',
    subset: plan.match.item.subset || '',
    imageId: plan.match.image.imageId || '',
    imageUrl: plan.match.image.url || '',
    imageNumber: plan.match.image.number || '',
    userCardItems: plan.linkedUserItems.map(item => ({
      _id: item._id,
      cardName: item.cardName || '',
      cardNumber: item.cardNumber || '',
      imageId: item.imageId || '',
      imageUrl: item.imageUrl || ''
    })),
    relationIds: plan.linkedRelations.map(rel => rel._id || rel.relationId || '')
  }))
}

function assertSafePlan(plans) {
  if (VERIFY_EMPTY) {
    if (plans.length !== 0) throw new Error(`预期错误关联已清空，实际仍命中 ${plans.length}`)
    return
  }
  if (plans.length !== 1) throw new Error(`预期只命中 1 张错误图鉴图片，实际 ${plans.length}`)
  if (plans[0].linkedUserItems.length !== 1) throw new Error(`预期只命中 1 条我的卡片记录，实际 ${plans[0].linkedUserItems.length}`)
}

async function applyPlan(accessToken, plan) {
  const now = new Date().toISOString()
  const { match, linkedUserItems, linkedRelations } = plan
  const nextItems = (match.subsetDoc ? match.subsetDoc.items : null) || null

  if (match.collection === 'my_series_subsets') {
    const items = nextItems.map((item, index) => {
      if (index !== match.itemIndex) return item
      return {
        ...item,
        images: (Array.isArray(item.images) ? item.images : []).filter((_, imageIndex) => imageIndex !== match.imageIndex)
      }
    })
    await updateCloudDB(accessToken, `db.collection("my_series_subsets").doc(${quote(match.docId)}).update({
      data: ${JSON.stringify({ items, updateTime: now })}
    })`)
  } else {
    throw new Error('当前脚本只允许修复 subset doc 中的错误图片')
  }

  const unlinkPatch = {
    seriesId: '',
    seriesName: '',
    subset: '',
    itemId: '',
    itemText: '',
    imageId: '',
    detachedSeriesId: '',
    detachedSeriesName: '',
    seriesDeleted: false,
    updateTime: now
  }
  for (const item of linkedUserItems) {
    await updateCloudDB(accessToken, `db.collection("user_card_items").doc(${quote(item._id)}).update({
      data: ${JSON.stringify(unlinkPatch)}
    })`)
  }

  for (const rel of linkedRelations) {
    const relId = rel._id || rel.relationId
    if (!relId) continue
    await deleteCloudDB(accessToken, `db.collection("user_card_relations").doc(${quote(relId)}).remove()`)
  }
}

async function main() {
  const env = loadEnv()
  const appSecret = env.APP_SECRET || process.env.APP_SECRET
  if (!appSecret) throw new Error(`缺少 ${ENV_PATH} 中的 APP_SECRET`)

  const accessToken = await getAccessToken(appSecret)
  const [seriesDocs, subsetDocs, userItems, relations] = await Promise.all([
    fetchAll(accessToken, 'my_series', `.where({_id:${quote(SERIES_ID)}})`),
    fetchAll(accessToken, 'my_series_subsets', `.where({seriesId:${quote(SERIES_ID)}})`),
    fetchAll(accessToken, 'user_card_items', `.where({seriesId:${quote(SERIES_ID)}, cardNumber:${quote(CARD_NUMBER)}})`),
    fetchAll(accessToken, 'user_card_relations', `.where({seriesId:${quote(SERIES_ID)}, cardNumber:${quote(CARD_NUMBER)}})`)
  ])
  const series = seriesDocs[0]
  if (!series) throw new Error(`未找到图鉴 ${SERIES_ID}`)
  const plans = buildPlan(series, subsetDocs, userItems, relations)

  console.log(JSON.stringify({
    mode: VERIFY_EMPTY ? 'verify-empty' : (APPLY ? 'apply' : 'dry-run'),
    series: { _id: series._id, name: series.name || '' },
    subsetDocs: subsetDocs.length,
    candidateUserItems: userItems.length,
    candidateRelations: relations.length,
    updateCount: plans.length,
    updates: summarizePlan(plans)
  }, null, 2))

  assertSafePlan(plans)
  if (VERIFY_EMPTY) {
    console.log(JSON.stringify({ ok: true, verifiedEmpty: true }, null, 2))
    return
  }
  if (!APPLY) {
    console.log('Dry-run only. Use --apply to unlink this card from the wrong series image.')
    return
  }

  await applyPlan(accessToken, plans[0])
  console.log(JSON.stringify({ ok: true, unlinked: summarizePlan(plans)[0] }, null, 2))
}

main().catch(err => {
  console.error(err.message || err)
  process.exit(1)
})
