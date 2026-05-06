const https = require('https')
const fs = require('fs')
const path = require('path')

const APPID = 'wx13497267f3b92c0f'
const CLOUD_ENV = 'cloudbase-1g5rcsava7547769'
const ENV_PATH = path.join(__dirname, '.env')

const args = new Set(process.argv.slice(2))
const APPLY = args.has('--apply')

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

function isSeriesDefaultInfoEnabled(series = {}) {
  if (series.defaultInfoEnabled === true) return true
  if (series.defaultInfoEnabled === false) return false
  return !!(series.defaultYear || series.defaultBrand || series.defaultCardSeries)
}

function isSameText(a, b) {
  return !!a && !!b && String(a).trim() === String(b).trim()
}

function buildUpdate(item, seriesById) {
  const series = seriesById.get(item.seriesId)
  if (!series || !isSeriesDefaultInfoEnabled(series)) return null

  const fields = {}
  if (!item.seriesName && series.name) fields.seriesName = series.name
  if (!item.year && series.defaultYear) fields.year = series.defaultYear
  if (!item.brand && series.defaultBrand) fields.brand = series.defaultBrand
  if (
    series.defaultCardSeries &&
    (!item.cardSeries || isSameText(item.cardSeries, item.subset))
  ) {
    fields.cardSeries = series.defaultCardSeries
  }

  if (!Object.keys(fields).length) return null
  return {
    _id: item._id,
    seriesId: item.seriesId,
    cardName: item.cardName || item.itemText || '',
    before: {
      seriesName: item.seriesName || '',
      year: item.year || '',
      brand: item.brand || '',
      cardSeries: item.cardSeries || '',
      subset: item.subset || ''
    },
    after: fields
  }
}

async function main() {
  const env = loadEnv()
  if (!env.APP_SECRET) throw new Error(`缺少 ${ENV_PATH} 中的 APP_SECRET`)

  const accessToken = await getAccessToken(env.APP_SECRET)
  const [seriesList, itemList] = await Promise.all([
    fetchAll(accessToken, 'my_series'),
    fetchAll(accessToken, 'user_card_items')
  ])
  const seriesById = new Map(seriesList.map(series => [series._id, series]))
  const plan = itemList.map(item => buildUpdate(item, seriesById)).filter(Boolean)

  console.log(JSON.stringify({
    mode: APPLY ? 'apply' : 'dry-run',
    totalSeries: seriesList.length,
    totalUserCardItems: itemList.length,
    updateCount: plan.length,
    updates: plan
  }, null, 2))

  if (!APPLY) {
    console.log('Dry-run only. Use --apply to backfill user_card_items.')
    return
  }

  for (const item of plan) {
    await updateCloudDB(accessToken, `db.collection("user_card_items").doc(${quote(item._id)}).update({
      data: ${JSON.stringify({ ...item.after, updateTime: new Date().toISOString() })}
    })`)
  }

  console.log(JSON.stringify({ ok: true, updated: plan.length }, null, 2))
}

main().catch(err => {
  console.error(err.message || err)
  process.exit(1)
})
