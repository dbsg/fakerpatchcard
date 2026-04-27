const https = require('https')
const fs = require('fs')
const path = require('path')

const APPID = 'wx13497267f3b92c0f'
const CLOUD_ENV = 'cloudbase-1g5rcsava7547769'
const TARGET_SERIES_NAME = 'Panini Kaboom!'
const ENV_PATH = path.join(__dirname, '.env')

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

async function fetchAllSubsets(accessToken, seriesId) {
  const docs = []
  for (let skip = 0; ; skip += 100) {
    const page = parseDocs(await queryCloudDB(
      accessToken,
      `db.collection("my_series_subsets").where({seriesId:${quote(seriesId)}}).skip(${skip}).limit(100).get()`
    ))
    docs.push(...page)
    if (page.length < 100) break
  }
  return docs
}

function mergeItems(items) {
  const result = []
  const indexByKey = new Map()
  const duplicateGroups = []

  ;(items || []).forEach(item => {
    const subset = item.subset || ''
    const text = item.text || ''
    const key = `${subset}\u0000${text}`
    const existingIndex = indexByKey.get(key)
    if (existingIndex == null) {
      indexByKey.set(key, result.length)
      result.push({ ...item, images: Array.isArray(item.images) ? [...item.images] : [] })
      return
    }

    const existing = result[existingIndex]
    existing.images = [...(existing.images || []), ...(Array.isArray(item.images) ? item.images : [])]
    if (!existing.creatorOpenid && item.creatorOpenid) existing.creatorOpenid = item.creatorOpenid
    duplicateGroups.push({ subset, text, addedImages: Array.isArray(item.images) ? item.images.length : 0 })
  })

  return { items: result, duplicateGroups }
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
  const seriesList = parseDocs(await queryCloudDB(
    accessToken,
    `db.collection("my_series").where({name:${quote(TARGET_SERIES_NAME)}}).limit(1).get()`
  ))
  const series = seriesList[0]
  if (!series) throw new Error(`未找到图鉴: ${TARGET_SERIES_NAME}`)

  const subsetDocs = await fetchAllSubsets(accessToken, series._id)
  const changes = []

  subsetDocs.forEach(doc => {
    const beforeItems = Array.isArray(doc.items) ? doc.items : []
    const beforeImages = beforeItems.reduce((sum, item) => sum + ((item.images || []).length), 0)
    const merged = mergeItems(beforeItems)
    const afterImages = merged.items.reduce((sum, item) => sum + ((item.images || []).length), 0)
    if (merged.items.length !== beforeItems.length) {
      changes.push({
        docId: doc._id,
        subset: doc.subset || '',
        beforeItemCount: beforeItems.length,
        afterItemCount: merged.items.length,
        beforeImageCount: beforeImages,
        afterImageCount: afterImages,
        duplicateGroups: merged.duplicateGroups,
        items: merged.items
      })
    }
  })

  if (apply) {
    for (const change of changes) {
      await updateSubsetItems(accessToken, change.docId, change.items)
    }
  }

  console.log(JSON.stringify({
    apply,
    seriesId: series._id,
    changedDocCount: changes.length,
    totalRemovedDuplicateItems: changes.reduce((sum, item) => sum + item.beforeItemCount - item.afterItemCount, 0),
    imageCountBefore: changes.reduce((sum, item) => sum + item.beforeImageCount, 0),
    imageCountAfter: changes.reduce((sum, item) => sum + item.afterImageCount, 0),
    changes: changes.map(({ items, ...rest }) => rest)
  }, null, 2))
}

main().catch(err => {
  console.error(err.stack || err.message)
  process.exit(1)
})
