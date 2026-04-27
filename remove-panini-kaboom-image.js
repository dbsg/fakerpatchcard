const https = require('https')
const fs = require('fs')
const path = require('path')

const APPID = 'wx13497267f3b92c0f'
const CLOUD_ENV = 'cloudbase-1g5rcsava7547769'
const ENV_PATH = path.join(__dirname, '.env')
const TARGET_SERIES_NAME = 'Panini Kaboom!'
const TARGET_FILE_ID = 'cloud://cloudbase-1g5rcsava7547769.636c-cloudbase-1g5rcsava7547769-1418320285/collection-series/c946dc2a69e7347100010a507fdf4cf5/batch_1776941348832_IMG_9823.JPG.jpg'

function loadEnv() {
  if (!fs.existsSync(ENV_PATH)) return {}
  const content = fs.readFileSync(ENV_PATH, 'utf8')
  const env = {}
  content.split('\n').forEach(line => {
    const match = line.match(/^\s*([^#=]+?)\s*=\s*(.+?)\s*$/)
    if (match) env[match[1]] = match[2]
  })
  return env
}

function httpGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return httpGet(res.headers.location).then(resolve).catch(reject)
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`))
      }
      const chunks = []
      res.on('data', chunk => chunks.push(chunk))
      res.on('end', () => resolve(Buffer.concat(chunks)))
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
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    }, (res) => {
      const chunks = []
      res.on('data', chunk => chunks.push(chunk))
      res.on('end', () => {
        try {
          resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')))
        } catch (_) {
          reject(new Error('Invalid JSON response'))
        }
      })
      res.on('error', reject)
    })
    req.on('error', reject)
    req.write(data)
    req.end()
  })
}

async function getAccessToken(appSecret) {
  const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${APPID}&secret=${appSecret}`
  const buf = await httpGet(url)
  const result = JSON.parse(buf.toString('utf8'))
  if (result.errcode) throw new Error(`获取 access_token 失败: ${result.errmsg} (${result.errcode})`)
  return result.access_token
}

async function callCloudApi(accessToken, apiName, body) {
  const url = `https://api.weixin.qq.com/tcb/${apiName}?access_token=${accessToken}`
  const result = await httpPost(url, { env: CLOUD_ENV, ...body })
  if (result.errcode !== 0) throw new Error(`${apiName} 失败: ${result.errmsg} (${result.errcode})`)
  return result
}

async function queryCloudDB(accessToken, query) {
  return callCloudApi(accessToken, 'databasequery', { query })
}

async function updateCloudDB(accessToken, query) {
  return callCloudApi(accessToken, 'databaseupdate', { query })
}

function quote(value) {
  return JSON.stringify(value)
}

function normalizeCardKind(value) {
  const raw = String(value || '').trim()
  if (!raw) return ''
  return raw.split(/\s+/).map(token => {
    if (/^[A-Za-z]+$/.test(token)) return token.slice(0, 1).toUpperCase() + token.slice(1).toLowerCase()
    return token
  }).join(' ')
}

function normalizeImage(img) {
  if (!img) return null
  if (typeof img === 'string') {
    return { url: img, ownedBy: [], number: '', year: '', cardKind: '', uploaderOpenid: '' }
  }
  return {
    url: img.url || '',
    ownedBy: Array.isArray(img.ownedBy) ? img.ownedBy.filter(Boolean) : [],
    number: String(img.number || '').trim(),
    year: String(img.year || '').trim(),
    cardKind: normalizeCardKind(img.cardKind),
    uploaderOpenid: img.uploaderOpenid || ''
  }
}

function collectPresetCardKinds(items) {
  const seen = new Set()
  const result = []
  items.forEach(item => {
    ;(item.images || []).forEach(img => {
      const value = normalizeCardKind(img.cardKind)
      if (!value || seen.has(value)) return
      seen.add(value)
      result.push({ value, creatorOpenid: '' })
    })
  })
  return result
}

function buildSeriesStats(items) {
  const urls = []
  items.forEach(item => {
    ;(item.images || []).forEach(img => {
      if (img.url) urls.push(img.url)
    })
  })
  const listCollectedCount = items.filter(item => (item.images || []).length > 0).length
  const listTotalCount = items.length
  return {
    totalCards: items.length,
    listCollectedCount,
    listTotalCount,
    listProgress: listTotalCount ? Math.round(listCollectedCount / listTotalCount * 100) : 0,
    listImageCount: urls.length,
    listRecentImages: urls.slice(-5).reverse()
  }
}

async function main() {
  const env = loadEnv()
  const appSecret = env.APP_SECRET || process.env.APP_SECRET
  if (!appSecret) throw new Error('未找到 APP_SECRET，请先在 card/.env 配置')

  const token = await getAccessToken(appSecret)
  const seriesResult = await queryCloudDB(
    token,
    `db.collection("my_series").where({ name: ${quote(TARGET_SERIES_NAME)} }).get()`
  )
  const series = JSON.parse(seriesResult.data[0])
  const subsetDocs = []
  for (let skip = 0; ; skip += 100) {
    const subsetResult = await queryCloudDB(
      token,
      `db.collection("my_series_subsets").where({ seriesId: ${quote(series._id)} }).skip(${skip}).limit(100).get()`
    )
    const page = subsetResult.data.map(item => JSON.parse(item))
    subsetDocs.push(...page)
    if (page.length < 100) break
  }

  let touched = false
  const itemsForStats = []
  for (const doc of subsetDocs) {
    const items = (doc.items || []).map(item => ({
      ...item,
      images: (item.images || []).map(normalizeImage).filter(Boolean).filter(img => img.url !== TARGET_FILE_ID)
    }))
    if (JSON.stringify(items) !== JSON.stringify(doc.items || [])) touched = true
    await updateCloudDB(token, `db.collection("my_series_subsets").doc(${quote(doc._id)}).update({ data: { items: ${JSON.stringify(items)}, updateTime: ${quote(new Date().toISOString())} } })`)
    if (items[0]) itemsForStats.push(items[0])
  }

  const presetCardKinds = collectPresetCardKinds(itemsForStats)
  const stats = buildSeriesStats(itemsForStats)
  await updateCloudDB(token, `db.collection("my_series").doc(${quote(series._id)}).update({ data: ${JSON.stringify({
    presetCardKinds,
    presetNumbers: [],
    ...stats,
    updateTime: new Date().toISOString()
  })} })`)

  console.log(JSON.stringify({
    ok: true,
    touched,
    removedFileId: TARGET_FILE_ID,
    totalCards: stats.totalCards,
    listImageCount: stats.listImageCount
  }, null, 2))
}

main().catch(err => {
  console.error(err.message || err)
  process.exit(1)
})
