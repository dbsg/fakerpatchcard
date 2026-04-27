const https = require('https')
const fs = require('fs')
const path = require('path')

const APPID = 'wx13497267f3b92c0f'
const CLOUD_ENV = 'cloudbase-1g5rcsava7547769'
const ENV_PATH = path.join(__dirname, '.env')
const TARGET_SERIES_NAME = 'Panini Kaboom!'

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

function generateItemId() {
  return `item_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`
}

function normalizeOwnedBy(ownedBy) {
  return [...new Set((Array.isArray(ownedBy) ? ownedBy : []).filter(Boolean))]
}

function normalizeCardKind(value) {
  const raw = String(value || '').trim()
  if (!raw) return ''
  return raw.split(/\s+/).map(token => {
    if (/^[A-Za-z]+$/.test(token)) {
      return token.slice(0, 1).toUpperCase() + token.slice(1).toLowerCase()
    }
    return token
  }).join(' ')
}

function normalizeImage(img) {
  if (!img) return null
  if (typeof img === 'string') {
    return {
      url: img,
      ownedBy: [],
      number: '',
      year: '',
      cardKind: '',
      uploaderOpenid: ''
    }
  }
  return {
    url: img.url || '',
    ownedBy: normalizeOwnedBy(img.ownedBy),
    number: String(img.number || '').trim(),
    year: String(img.year || '').trim(),
    cardKind: normalizeCardKind(img.cardKind),
    uploaderOpenid: img.uploaderOpenid || ''
  }
}

function uniqueImages(images) {
  const seen = new Set()
  const result = []
  for (const img of images) {
    const normalized = normalizeImage(img)
    if (!normalized || !normalized.url || seen.has(normalized.url)) continue
    seen.add(normalized.url)
    result.push(normalized)
  }
  return result
}

function buildSubsetItem(doc, seriesCreatorOpenid) {
  const allItems = Array.isArray(doc.items) ? doc.items : []
  const allImages = uniqueImages(allItems.flatMap(item => item.images || []))
  const creatorOpenid =
    allItems.map(item => item.creatorOpenid || '').find(Boolean) ||
    seriesCreatorOpenid ||
    ''

  return {
    itemId: generateItemId(),
    text: '',
    subset: doc.subset || '',
    collected: false,
    cardId: null,
    playerId: null,
    creatorOpenid,
    images: allImages
  }
}

function collectPresetCardKinds(items) {
  const values = []
  const seen = new Set()
  items.forEach(item => {
    ;(item.images || []).forEach(img => {
      const cardKind = normalizeCardKind(img.cardKind)
      if (!cardKind || seen.has(cardKind)) return
      seen.add(cardKind)
      values.push(cardKind)
    })
  })
  return values.map(value => ({ value, creatorOpenid: '' }))
}

function buildSeriesStats(items) {
  const listRecentImages = []
  items.forEach(item => {
    ;(item.images || []).forEach(img => {
      if (img.url) listRecentImages.push(img.url)
    })
  })
  const listCollectedCount = items.filter(item => (item.images || []).length > 0).length
  const listTotalCount = items.length
  return {
    totalCards: items.length,
    listCollectedCount,
    listTotalCount,
    listProgress: listTotalCount ? Math.round(listCollectedCount / listTotalCount * 100) : 0,
    listImageCount: listRecentImages.length,
    listRecentImages: listRecentImages.slice(-5).reverse()
  }
}

async function fetchTargetSeries(accessToken) {
  const seriesResult = await queryCloudDB(
    accessToken,
    `db.collection("my_series").where({ name: ${quote(TARGET_SERIES_NAME)} }).get()`
  )
  const seriesDocs = seriesResult.data.map(item => JSON.parse(item))
  if (seriesDocs.length === 0) throw new Error(`未找到图鉴: ${TARGET_SERIES_NAME}`)
  if (seriesDocs.length > 1) throw new Error(`找到多条同名图鉴: ${TARGET_SERIES_NAME}`)

  const series = seriesDocs[0]
  const subsetResult = await queryCloudDB(
    accessToken,
    `db.collection("my_series_subsets").where({ seriesId: ${quote(series._id)} }).get()`
  )
  const subsetDocs = subsetResult.data.map(item => JSON.parse(item))
  return { series, subsetDocs }
}

async function updateSubsetDoc(accessToken, docId, items) {
  const query = `db.collection("my_series_subsets").doc(${quote(docId)}).update({
    data: {
      items: ${JSON.stringify(items)},
      updateTime: ${quote(new Date().toISOString())}
    }
  })`
  return updateCloudDB(accessToken, query)
}

async function updateSeriesDoc(accessToken, seriesId, fields) {
  const query = `db.collection("my_series").doc(${quote(seriesId)}).update({
    data: ${JSON.stringify({
      ...fields,
      updateTime: new Date().toISOString()
    })}
  })`
  return updateCloudDB(accessToken, query)
}

async function main() {
  const env = loadEnv()
  const appSecret = env.APP_SECRET || process.env.APP_SECRET
  if (!appSecret) {
    throw new Error('未找到 APP_SECRET，请先在 card/.env 配置')
  }

  const token = await getAccessToken(appSecret)
  const { series, subsetDocs } = await fetchTargetSeries(token)

  const normalizedDocs = subsetDocs.map(doc => {
    const item = buildSubsetItem(doc, series.creatorOpenid || '')
    return {
      ...doc,
      items: [item]
    }
  })

  for (const doc of normalizedDocs) {
    await updateSubsetDoc(token, doc._id, doc.items)
  }

  const normalizedItems = normalizedDocs.map(doc => doc.items[0])
  const presetCardKinds = collectPresetCardKinds(normalizedItems)
  const stats = buildSeriesStats(normalizedItems)

  await updateSeriesDoc(token, series._id, {
    hasSubset: true,
    subsetType: 'player',
    cardType: '',
    seriesLevel: 2,
    checklist: [],
    freeImages: [],
    presetCardKinds,
    presetNumbers: [],
    ...stats
  })

  console.log(JSON.stringify({
    ok: true,
    seriesId: series._id,
    name: series.name,
    subsetDocCount: normalizedDocs.length,
    totalCards: stats.totalCards,
    listImageCount: stats.listImageCount,
    presetCardKinds: presetCardKinds.map(item => item.value)
  }, null, 2))
}

main().catch(err => {
  console.error(err.message || err)
  process.exit(1)
})
