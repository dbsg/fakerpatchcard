const https = require('https')
const fs = require('fs')
const path = require('path')

const APPID = 'wx13497267f3b92c0f'
const CLOUD_ENV = 'cloudbase-1g5rcsava7547769'
const ENV_PATH = path.join(__dirname, '.env')
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

async function fetchAll(accessToken, collectionName) {
  const docs = []
  for (let skip = 0; ; skip += 100) {
    const page = parseDocs(await queryCloudDB(
      accessToken,
      `db.collection("${collectionName}").skip(${skip}).limit(100).get()`
    ))
    docs.push(...page)
    if (page.length < 100) break
  }
  return docs
}

function normalizeUrlKey(url, seriesId) {
  if (!url) return ''
  const value = String(url)
  const marker = `/collection-series/${seriesId}/`
  const idx = value.indexOf(marker)
  if (idx >= 0) return value.slice(idx + marker.length)
  return value.split('/').slice(-1)[0]
}

function collectLegacyOwned(series) {
  const map = new Map()
  function scanImages(images, context) {
    ;(images || []).forEach((img, imgIdx) => {
      if (!img || img.owned !== true) return
      const key = normalizeUrlKey(img.url, series._id)
      if (key) map.set(key, { ...context, imgIdx, url: img.url })
    })
  }
  ;(series.checklist || []).forEach((item, itemIdx) => {
    scanImages(item.images, {
      source: 'checklist',
      itemIdx,
      text: item.text || '',
      subset: item.subset || ''
    })
  })
  scanImages(series.freeImages, { source: 'freeImages' })
  return map
}

function collectCurrent(series, subsetDocs) {
  const map = new Map()
  function addImage(img, context) {
    const key = normalizeUrlKey(img && img.url, series._id)
    if (!key) return
    map.set(key, {
      ownedBy: Array.isArray(img.ownedBy) ? img.ownedBy : [],
      context
    })
  }
  if (subsetDocs.length > 0) {
    subsetDocs.forEach(doc => {
      ;(doc.items || []).forEach((item, itemIdx) => {
        ;(item.images || []).forEach((img, imgIdx) => {
          addImage(img, { type: 'subsetDoc', doc, itemIdx, imgIdx, text: item.text || '', subset: item.subset || doc.subset || '' })
        })
      })
    })
  } else {
    ;(series.checklist || []).forEach((item, itemIdx) => {
      ;(item.images || []).forEach((img, imgIdx) => {
        addImage(img, { type: 'seriesChecklist', itemIdx, imgIdx, text: item.text || '', subset: item.subset || '' })
      })
    })
    ;(series.freeImages || []).forEach((img, imgIdx) => {
      addImage(img, { type: 'seriesFreeImages', imgIdx })
    })
  }
  return map
}

async function updateSubsetItems(accessToken, docId, items) {
  const query = `db.collection("my_series_subsets").doc(${quote(docId)}).update({data:{
    items:${quote(items)},
    updateTime:${quote(new Date().toISOString())}
  }})`
  return updateCloudDB(accessToken, query)
}

async function updateSeriesFields(accessToken, seriesId, fields) {
  const query = `db.collection("my_series").doc(${quote(seriesId)}).update({data:${quote({
    ...fields,
    updateTime: new Date().toISOString()
  })}})`
  return updateCloudDB(accessToken, query)
}

async function main() {
  const apply = process.argv.includes('--apply')
  const env = loadEnv()
  const appSecret = env.APP_SECRET || process.env.APP_SECRET
  if (!appSecret) throw new Error('未找到 APP_SECRET，请先在 card/.env 配置')

  const accessToken = await getAccessToken(appSecret)
  const [seriesDocs, subsetDocs] = await Promise.all([
    fetchAll(accessToken, 'my_series'),
    fetchAll(accessToken, 'my_series_subsets')
  ])

  const subsetsBySeriesId = new Map()
  subsetDocs.forEach(doc => {
    if (!doc.seriesId) return
    if (!subsetsBySeriesId.has(doc.seriesId)) subsetsBySeriesId.set(doc.seriesId, [])
    subsetsBySeriesId.get(doc.seriesId).push(doc)
  })

  const changedSubsetDocs = new Map()
  const changedSeries = new Map()
  const plan = []
  const unmatched = []

  seriesDocs.forEach(series => {
    const legacyOwned = collectLegacyOwned(series)
    if (legacyOwned.size === 0) return
    const seriesSubsetDocs = subsetsBySeriesId.get(series._id) || []
    const current = collectCurrent(series, seriesSubsetDocs)
    const seriesPlan = []

    legacyOwned.forEach((oldInfo, key) => {
      const cur = current.get(key)
      if (!cur) {
        unmatched.push({ seriesId: series._id, seriesName: series.name || '', key, oldInfo })
        return
      }
      if (cur.ownedBy.includes(OWNER_OPENID)) return

      const context = cur.context
      if (context.type === 'subsetDoc') {
        const doc = context.doc
        if (!changedSubsetDocs.has(doc._id)) {
          changedSubsetDocs.set(doc._id, JSON.parse(JSON.stringify(doc.items || [])))
        }
        const items = changedSubsetDocs.get(doc._id)
        const img = items[context.itemIdx].images[context.imgIdx]
        const ownedBy = Array.isArray(img.ownedBy) ? [...img.ownedBy] : []
        ownedBy.push(OWNER_OPENID)
        items[context.itemIdx].images[context.imgIdx] = { ...img, ownedBy }
      } else if (context.type === 'seriesChecklist') {
        if (!changedSeries.has(series._id)) changedSeries.set(series._id, JSON.parse(JSON.stringify(series)))
        const s = changedSeries.get(series._id)
        const img = s.checklist[context.itemIdx].images[context.imgIdx]
        const ownedBy = Array.isArray(img.ownedBy) ? [...img.ownedBy] : []
        ownedBy.push(OWNER_OPENID)
        s.checklist[context.itemIdx].images[context.imgIdx] = { ...img, ownedBy }
      } else if (context.type === 'seriesFreeImages') {
        if (!changedSeries.has(series._id)) changedSeries.set(series._id, JSON.parse(JSON.stringify(series)))
        const s = changedSeries.get(series._id)
        const img = s.freeImages[context.imgIdx]
        const ownedBy = Array.isArray(img.ownedBy) ? [...img.ownedBy] : []
        ownedBy.push(OWNER_OPENID)
        s.freeImages[context.imgIdx] = { ...img, ownedBy }
      }

      seriesPlan.push({
        key,
        target: context.type,
        text: context.text || oldInfo.text || '',
        subset: context.subset || oldInfo.subset || ''
      })
    })

    if (seriesPlan.length > 0 || unmatched.some(item => item.seriesId === series._id)) {
      plan.push({
        seriesId: series._id,
        seriesName: series.name || '',
        legacyOwnedCount: legacyOwned.size,
        migrateCount: seriesPlan.length,
        items: seriesPlan
      })
    }
  })

  if (apply) {
    for (const [docId, items] of changedSubsetDocs.entries()) {
      await updateSubsetItems(accessToken, docId, items)
    }
    for (const [seriesId, series] of changedSeries.entries()) {
      await updateSeriesFields(accessToken, seriesId, {
        checklist: series.checklist || [],
        freeImages: series.freeImages || []
      })
    }
  }

  console.log(JSON.stringify({
    apply,
    changedSubsetDocCount: changedSubsetDocs.size,
    changedSeriesCount: changedSeries.size,
    migrateImageCount: plan.reduce((sum, item) => sum + item.migrateCount, 0),
    unmatchedCount: unmatched.length,
    unmatched,
    plan
  }, null, 2))
}

main().catch(err => {
  console.error(err.stack || err.message)
  process.exit(1)
})
