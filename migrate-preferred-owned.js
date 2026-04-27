const https = require('https')
const fs = require('fs')
const path = require('path')

const APPID = 'wx13497267f3b92c0f'
const CLOUD_ENV = 'cloudbase-1g5rcsava7547769'
const ENV_PATH = path.join(__dirname, '.env')
const TARGET_SERIES_ID = 'f6fcfb9c69e0b4ee0485c6c602c17789'
const OWNER_OPENID = 'oaQG05Ax1I_QRhOkD4lwqOXEucV8'

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
      if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode} for ${url}`))
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
  if (result.errcode) {
    throw new Error(`获取 access_token 失败: ${result.errmsg} (${result.errcode})`)
  }
  return result.access_token
}

async function callCloudApi(accessToken, apiName, body) {
  const url = `https://api.weixin.qq.com/tcb/${apiName}?access_token=${accessToken}`
  const result = await httpPost(url, { env: CLOUD_ENV, ...body })
  if (result.errcode !== 0) {
    throw new Error(`${apiName} 失败: ${result.errmsg} (${result.errcode})`)
  }
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

function parseDocs(result) {
  return (result.data || []).map(item => JSON.parse(item))
}

function normalizeUrlKey(url) {
  if (!url) return ''
  const value = String(url)
  const marker = `/collection-series/${TARGET_SERIES_ID}/`
  const idx = value.indexOf(marker)
  if (idx >= 0) return value.slice(idx + marker.length)
  return value.split('/').slice(-1)[0]
}

function collectLegacyOwnedUrls(series) {
  const map = new Map()
  ;(series.checklist || []).forEach(item => {
    ;(item.images || []).forEach(img => {
      if (!img || img.owned !== true) return
      const key = normalizeUrlKey(img.url)
      if (!key) return
      map.set(key, { url: img.url, text: item.text || '', subset: item.subset || '' })
    })
  })
  return map
}

async function fetchSubsetDocs(accessToken) {
  const docs = []
  for (let skip = 0; ; skip += 100) {
    const page = parseDocs(await queryCloudDB(
      accessToken,
      `db.collection("my_series_subsets").where({seriesId:${quote(TARGET_SERIES_ID)}}).skip(${skip}).limit(100).get()`
    ))
    docs.push(...page)
    if (page.length < 100) break
  }
  return docs
}

async function updateSubsetItems(accessToken, docId, items) {
  const query = `db.collection("my_series_subsets").doc(${quote(docId)}).update({data:{
    items:${quote(items)},
    updateTime:${quote(new Date().toISOString())}
  }})`
  return updateCloudDB(accessToken, query)
}

async function main() {
  const apply = process.argv.includes('--apply')
  const env = loadEnv()
  const appSecret = env.APP_SECRET || process.env.APP_SECRET
  if (!appSecret) throw new Error('未找到 APP_SECRET，请先在 card/.env 配置')

  const accessToken = await getAccessToken(appSecret)
  const series = parseDocs(await queryCloudDB(
    accessToken,
    `db.collection("my_series").doc(${quote(TARGET_SERIES_ID)}).get()`
  ))[0]
  if (!series) throw new Error(`未找到图鉴: ${TARGET_SERIES_ID}`)

  const legacyOwned = collectLegacyOwnedUrls(series)
  const subsetDocs = await fetchSubsetDocs(accessToken)
  const changes = []
  const matchedKeys = new Set()

  subsetDocs.forEach(doc => {
    const items = JSON.parse(JSON.stringify(doc.items || []))
    const docChanges = []
    items.forEach((item, itemIdx) => {
      ;(item.images || []).forEach((img, imgIdx) => {
        const key = normalizeUrlKey(img && img.url)
        if (!legacyOwned.has(key)) return
        matchedKeys.add(key)
        const ownedBy = Array.isArray(img.ownedBy) ? [...img.ownedBy] : []
        if (!ownedBy.includes(OWNER_OPENID)) {
          ownedBy.push(OWNER_OPENID)
          item.images[imgIdx] = { ...img, ownedBy }
          docChanges.push({
            itemIdx,
            imgIdx,
            text: item.text || '',
            subset: item.subset || doc.subset || '',
            key
          })
        }
      })
    })
    if (docChanges.length > 0) {
      changes.push({ docId: doc._id, docSubset: doc.subset || '', items, docChanges })
    }
  })

  if (apply) {
    for (const change of changes) {
      await updateSubsetItems(accessToken, change.docId, change.items)
    }
  }

  const unmatched = [...legacyOwned.keys()].filter(key => !matchedKeys.has(key))
  console.log(JSON.stringify({
    apply,
    seriesId: TARGET_SERIES_ID,
    seriesName: series.name || '',
    legacyOwnedCount: legacyOwned.size,
    matchedCount: matchedKeys.size,
    unmatchedCount: unmatched.length,
    changedDocCount: changes.length,
    migratedImageCount: changes.reduce((sum, change) => sum + change.docChanges.length, 0),
    unmatched,
    changes: changes.map(({ items, ...rest }) => rest)
  }, null, 2))
}

main().catch(err => {
  console.error(err.stack || err.message)
  process.exit(1)
})
