const https = require('https')
const fs = require('fs')
const path = require('path')
const roster = require('../scripts/data/nba-players-roster.json')
const playerInference = require('../miniprogram-card/utils/playerInference')

const APPID = 'wx13497267f3b92c0f'
const CLOUD_ENV = 'cloudbase-1g5rcsava7547769'
const ENV_PATH = path.join(__dirname, '.env')
const APPLY = process.argv.includes('--apply')
const INCLUDE_REVIEW = process.argv.includes('--include-review')
const SUMMARY_ONLY = process.argv.includes('--summary-only')
const DIRECT_FIELDS = ['itemText', 'cardName', 'cardKind']
const REVIEW_FIELDS = ['title', 'subtitle', 'subset', 'seriesName']

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

async function fetchAll(accessToken, collectionName) {
  const docs = []
  for (let skip = 0; ; skip += 100) {
    const result = await queryCloudDB(accessToken, `db.collection(${quote(collectionName)}).skip(${skip}).limit(100).get()`)
    const page = result.data.map(item => JSON.parse(item))
    docs.push(...page)
    if (page.length < 100) break
  }
  return docs
}

function buildBefore(doc) {
  return {
    player: doc.player || '',
    playerCN: doc.playerCN || '',
    itemText: doc.itemText || '',
    cardName: doc.cardName || '',
    cardKind: doc.cardKind || '',
    title: doc.title || '',
    subtitle: doc.subtitle || '',
    subset: doc.subset || '',
    seriesName: doc.seriesName || ''
  }
}

function buildUpdate(collection, doc, options = {}) {
  const fields = Array.isArray(options.fields) ? options.fields : DIRECT_FIELDS
  const patch = playerInference.buildPlayerInfoPatch(doc, roster, { fields })
  if (!Object.keys(patch).length) return null
  return {
    collection,
    _id: doc._id,
    confidence: options.confidence || 'direct',
    sourceFields: fields,
    before: buildBefore(doc),
    after: patch
  }
}

function buildMigrationPlans(collection, docs) {
  const updates = []
  const needsReview = []
  ;(Array.isArray(docs) ? docs : []).forEach(doc => {
    const direct = buildUpdate(collection, doc, { fields: DIRECT_FIELDS, confidence: 'direct' })
    if (direct) {
      updates.push(direct)
      return
    }
    const review = buildUpdate(collection, doc, { fields: REVIEW_FIELDS, confidence: 'review' })
    if (review) needsReview.push(review)
  })
  return { updates, needsReview }
}

async function main() {
  const env = loadEnv()
  const appSecret = env.APP_SECRET || process.env.APP_SECRET
  if (!appSecret) throw new Error(`缺少 ${ENV_PATH} 中的 APP_SECRET`)

  const accessToken = await getAccessToken(appSecret)
  const [relations, userCardItems] = await Promise.all([
    fetchAll(accessToken, 'user_card_relations'),
    fetchAll(accessToken, 'user_card_items')
  ])
  const relationPlan = buildMigrationPlans('user_card_relations', relations)
  const userCardItemPlan = buildMigrationPlans('user_card_items', userCardItems)
  const updates = [...relationPlan.updates, ...userCardItemPlan.updates]
  const needsReview = [...relationPlan.needsReview, ...userCardItemPlan.needsReview]
  const plan = INCLUDE_REVIEW ? [...updates, ...needsReview] : updates

  const output = {
    mode: APPLY ? 'apply' : 'dry-run',
    includeReview: INCLUDE_REVIEW,
    totalRelations: relations.length,
    totalUserCardItems: userCardItems.length,
    autoUpdateCount: updates.length,
    reviewCount: needsReview.length,
    updateCount: plan.length,
    updates: SUMMARY_ONLY ? updates.slice(0, 10) : updates,
    needsReview: SUMMARY_ONLY ? needsReview.slice(0, 10) : needsReview
  }
  if (SUMMARY_ONLY) {
    output.summaryOnly = true
    output.sampleSize = 10
  }
  console.log(JSON.stringify(output, null, 2))

  if (!APPLY) {
    console.log('Dry-run only. Use --apply to backfill direct player/playerCN matches. Use --include-review only after manually checking needsReview.')
    return
  }

  const updateTime = new Date().toISOString()
  for (const item of plan) {
    await updateCloudDB(accessToken, `db.collection(${quote(item.collection)}).doc(${quote(item._id)}).update({
      data: ${JSON.stringify({ ...item.after, updateTime })}
    })`)
  }
  console.log(JSON.stringify({ ok: true, updated: plan.length }, null, 2))
}

if (require.main === module) {
  main().catch(err => {
    console.error(err.message || err)
    process.exit(1)
  })
}

module.exports = {
  buildMigrationPlans,
  buildUpdate
}
