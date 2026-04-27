const https = require('https')
const fs = require('fs')
const path = require('path')
const { execFileSync } = require('child_process')

const APPID = 'wx13497267f3b92c0f'
const CLOUD_ENV = 'cloudbase-1g5rcsava7547769'
const STORAGE_ENV = 'prod-8g8ay186059e4264'
const ENV_PATH = path.join(__dirname, '.env')
const TARGET_SERIES_NAME = 'Panini Kaboom!'
const KABOOM_DIR = path.join(__dirname, '..', 'kaboom')
const CDN_BASE = 'https://7072-prod-8g8ay186059e4264-1418320285.tcb.qcloud.la'
const PLAYERS_JSON_URL = `${CDN_BASE}/static/nba-players-roster.json`
const IGNORE_FILES = new Set(['IMG_9823.JPG'])

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

function httpMultipartPost(url, fields, fileField, filePath) {
  return new Promise((resolve, reject) => {
    const boundary = `----CodexForm${Date.now().toString(16)}`
    const parsed = new URL(url)
    const fileBuffer = fs.readFileSync(filePath)
    const fileName = path.basename(filePath)
    const parts = []

    Object.entries(fields).forEach(([key, value]) => {
      if (value == null || value === '') return
      parts.push(Buffer.from(
        `--${boundary}\r\n` +
        `Content-Disposition: form-data; name="${key}"\r\n\r\n` +
        `${value}\r\n`
      ))
    })

    parts.push(Buffer.from(
      `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="${fileField}"; filename="${fileName}"\r\n` +
      `Content-Type: application/octet-stream\r\n\r\n`
    ))
    parts.push(fileBuffer)
    parts.push(Buffer.from(`\r\n--${boundary}--\r\n`))

    const body = Buffer.concat(parts)
    const req = https.request({
      hostname: parsed.hostname,
      port: parsed.port || 443,
      path: parsed.pathname + parsed.search,
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': body.length
      }
    }, (res) => {
      const chunks = []
      res.on('data', chunk => chunks.push(chunk))
      res.on('end', () => {
        const text = Buffer.concat(chunks).toString('utf8')
        if (res.statusCode !== 204 && res.statusCode !== 201 && res.statusCode !== 200) {
          return reject(new Error(`文件上传失败: HTTP ${res.statusCode} ${text}`))
        }
        resolve(text)
      })
      res.on('error', reject)
    })
    req.on('error', reject)
    req.write(body)
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

async function callCloudApi(accessToken, apiName, body, env = CLOUD_ENV) {
  const url = `https://api.weixin.qq.com/tcb/${apiName}?access_token=${accessToken}`
  const result = await httpPost(url, { env, ...body })
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

async function addCloudDB(accessToken, query) {
  return callCloudApi(accessToken, 'databaseadd', { query })
}

async function requestUpload(accessToken, cloudPath) {
  return callCloudApi(accessToken, 'uploadfile', { path: cloudPath }, STORAGE_ENV)
}

function quote(value) {
  return JSON.stringify(value)
}

function normalizeOwnedBy(ownedBy) {
  return [...new Set((Array.isArray(ownedBy) ? ownedBy : []).filter(Boolean))]
}

function normalizeText(value) {
  return String(value || '')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ')
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
    return { url: img, ownedBy: [], number: '', year: '', cardKind: '', uploaderOpenid: '' }
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

function generateItemId() {
  return `item_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`
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

function buildNormalizedItem(doc, seriesCreatorOpenid) {
  const allItems = Array.isArray(doc.items) ? doc.items : []
  const images = uniqueImages(allItems.flatMap(item => item.images || []))
  const creatorOpenid =
    allItems.map(item => item.creatorOpenid || '').find(Boolean) ||
    seriesCreatorOpenid ||
    ''

  return {
    itemId: allItems.map(item => item.itemId || '').find(Boolean) || generateItemId(),
    text: '',
    subset: doc.subset || '',
    collected: false,
    cardId: null,
    playerId: null,
    creatorOpenid,
    images
  }
}

function collectPresetCardKinds(items) {
  const result = []
  const seen = new Set()
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
  const allUrls = []
  items.forEach(item => {
    ;(item.images || []).forEach(img => {
      if (img.url) allUrls.push(img.url)
    })
  })
  const listCollectedCount = items.filter(item => (item.images || []).length > 0).length
  const listTotalCount = items.length
  return {
    totalCards: items.length,
    listCollectedCount,
    listTotalCount,
    listProgress: listTotalCount ? Math.round(listCollectedCount / listTotalCount * 100) : 0,
    listImageCount: allUrls.length,
    listRecentImages: allUrls.slice(-5).reverse()
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
  const subsetDocs = []
  const pageSize = 100
  for (let skip = 0; ; skip += pageSize) {
    const subsetResult = await queryCloudDB(
      accessToken,
      `db.collection("my_series_subsets").where({ seriesId: ${quote(series._id)} }).skip(${skip}).limit(${pageSize}).get()`
    )
    const pageDocs = subsetResult.data.map(item => JSON.parse(item))
    subsetDocs.push(...pageDocs)
    if (pageDocs.length < pageSize) break
  }
  return { series, subsetDocs }
}

async function fetchPlayersRoster() {
  const buf = await httpGet(PLAYERS_JSON_URL)
  const result = JSON.parse(buf.toString('utf8'))
  return Array.isArray(result) ? result : []
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

async function addSubsetDoc(accessToken, seriesId, subsetName, items) {
  const now = new Date().toISOString()
  const query = `db.collection("my_series_subsets").add({
    data: [{
      seriesId: ${quote(seriesId)},
      subset: ${quote(subsetName)},
      items: ${JSON.stringify(items)},
      createTime: ${quote(now)},
      updateTime: ${quote(now)}
    }]
  })`
  return addCloudDB(accessToken, query)
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

async function uploadLocalImage(accessToken, filePath, cloudPath) {
  const uploadInfo = await requestUpload(accessToken, cloudPath)
  await httpMultipartPost(uploadInfo.url, {
    key: cloudPath,
    Signature: uploadInfo.authorization,
    'x-cos-security-token': uploadInfo.token,
    'x-cos-meta-fileid': uploadInfo.cos_file_id || uploadInfo.file_id,
    success_action_status: '200'
  }, 'file', filePath)
  return uploadInfo.file_id
}

function runOcr(filePath) {
  try {
    return execFileSync('tesseract', [filePath, 'stdout', '--psm', '6'], {
      encoding: 'utf8',
      maxBuffer: 1024 * 1024 * 8
    })
  } catch (err) {
    return (err.stdout || '').toString('utf8')
  }
}

function detectYear(text) {
  const matches = text.match(/\b20(1[0-9]|2[0-9])\b/g) || []
  return matches[0] || ''
}

function detectCardKind(text) {
  const t = normalizeText(text)
  const hasVertical = /\bVERTICAL\b/.test(t)
  const hasHorizontal = /\bHORIZONTAL\b/.test(t)
  const hasGold = /\bGOLD\b/.test(t)
  const hasGreen = /\bGREEN\b/.test(t)

  const tags = []
  if (hasGold) tags.push('Gold')
  if (hasGreen) tags.push('Green')
  let suffix = ''
  if (hasVertical) suffix = '竖版'
  else if (hasHorizontal) suffix = '横版'

  if (tags.length > 0 && suffix) return `${tags.join(' ')} ${suffix}`
  if (suffix) return suffix
  if (tags.length > 0) return tags.join(' ')
  return ''
}

function buildSubsetLookup(players, existingSubsetNames) {
  const lookup = new Map()

  existingSubsetNames.forEach(name => {
    const parts = String(name || '').split('/').map(s => s.trim()).filter(Boolean)
    const english = parts[parts.length - 1] || name
    lookup.set(normalizeText(english), name)
  })

  players.forEach(player => {
    const zh = String(player.zhName || '').trim()
    const en = String(player.enName || '').trim()
    if (!en) return
    const display = zh ? `${zh} / ${en}` : `${en} / ${en}`
    const keys = [en, zh, ...(player.nicknames || [])]
    keys.forEach(key => {
      const normalized = normalizeText(key)
      if (normalized && !lookup.has(normalized)) {
        lookup.set(normalized, display)
      }
    })
  })

  return lookup
}

function detectSubset(text, subsetLookup) {
  const lines = String(text || '')
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)

  const candidates = []
  lines.forEach(line => {
    const cleaned = normalizeText(line)
    if (!cleaned) return
    if (/^\d{4}\b/.test(cleaned)) return
    if (/KABOOM|REVOLUTION|CROWN ROYALE|GEM MT|NM MT|MINT|PSA|#\d+/.test(cleaned)) return
    candidates.push(cleaned)
  })

  for (const candidate of candidates) {
    if (subsetLookup.has(candidate)) return subsetLookup.get(candidate)
  }

  for (const candidate of candidates) {
    for (const [key, value] of subsetLookup.entries()) {
      if (candidate.includes(key) || key.includes(candidate)) {
        return value
      }
    }
  }

  return ''
}

function listKaboomFiles() {
  return fs.readdirSync(KABOOM_DIR)
    .filter(name => /\.(png|jpg|jpeg)$/i.test(name))
    .filter(name => !IGNORE_FILES.has(name))
    .sort()
    .map(name => path.join(KABOOM_DIR, name))
}

function buildDuplicateKey(subset, year, cardKind) {
  return `${subset}__${year}__${normalizeCardKind(cardKind)}`
}

async function main() {
  const env = loadEnv()
  const appSecret = env.APP_SECRET || process.env.APP_SECRET
  if (!appSecret) {
    throw new Error('未找到 APP_SECRET，请先在 card/.env 配置')
  }
  if (!fs.existsSync(KABOOM_DIR)) {
    throw new Error(`目录不存在: ${KABOOM_DIR}`)
  }

  const token = await getAccessToken(appSecret)
  const [{ series, subsetDocs }, players] = await Promise.all([
    fetchTargetSeries(token),
    fetchPlayersRoster()
  ])
  const creatorOpenid = series.creatorOpenid || ''
  const normalizedDocs = subsetDocs.map(doc => ({
    ...doc,
    items: [buildNormalizedItem(doc, creatorOpenid)]
  }))

  const subsetLookup = buildSubsetLookup(players, normalizedDocs.map(doc => doc.subset || ''))
  const subsetMap = new Map(normalizedDocs.map(doc => [doc.subset || '', doc]))
  const existingKeys = new Set()
  normalizedDocs.forEach(doc => {
    const item = doc.items[0]
    ;(item.images || []).forEach(img => {
      existingKeys.add(buildDuplicateKey(doc.subset || '', img.year || '', img.cardKind || ''))
    })
  })

  const files = listKaboomFiles()
  const summary = {
    scanned: files.length,
    added: [],
    skippedDuplicates: [],
    skippedUnknown: [],
    errors: []
  }

  for (const filePath of files) {
    const ocrText = runOcr(filePath)
    const year = detectYear(ocrText)
    const subset = detectSubset(ocrText, subsetLookup)
    const cardKind = detectCardKind(ocrText)

    if (!year || !subset) {
      summary.skippedUnknown.push({
        file: path.basename(filePath),
        reason: !year && !subset ? '无法识别年份和球员' : (!year ? '无法识别年份' : '无法识别球员'),
        year,
        subset,
        cardKind
      })
      continue
    }

    const dupKey = buildDuplicateKey(subset, year, cardKind)
    if (existingKeys.has(dupKey)) {
      summary.skippedDuplicates.push({
        file: path.basename(filePath),
        subset,
        year,
        cardKind
      })
      continue
    }

    try {
      let targetDoc = subsetMap.get(subset)
      if (!targetDoc) {
        targetDoc = {
          _id: '',
          subset,
          items: [{
            itemId: generateItemId(),
            text: '',
            subset,
            collected: false,
            cardId: null,
            playerId: null,
            creatorOpenid,
            images: []
          }]
        }
        normalizedDocs.push(targetDoc)
        subsetMap.set(subset, targetDoc)
      }

      const ext = (path.extname(filePath) || '.png').toLowerCase()
      const cloudPath = `collection-series/${series._id}/batch_${Date.now()}_${path.basename(filePath, ext)}${ext}`
      const fileId = await uploadLocalImage(token, filePath, cloudPath)

      const targetItem = targetDoc.items[0]
      targetItem.images = uniqueImages([
        ...(targetItem.images || []),
        {
          url: fileId,
          ownedBy: [],
          number: '',
          year,
          cardKind,
          uploaderOpenid: creatorOpenid
        }
      ])
      existingKeys.add(dupKey)
      summary.added.push({
        file: path.basename(filePath),
        subset,
        year,
        cardKind,
        fileId
      })
    } catch (err) {
      summary.errors.push({
        file: path.basename(filePath),
        message: err.message || String(err)
      })
    }
  }

  for (const doc of normalizedDocs) {
    if (doc._id) {
      await updateSubsetDoc(token, doc._id, doc.items)
    } else {
      await addSubsetDoc(token, series._id, doc.subset, doc.items)
    }
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
    seriesName: series.name,
    totalCards: stats.totalCards,
    listImageCount: stats.listImageCount,
    presetCardKinds: presetCardKinds.map(item => item.value),
    summary
  }, null, 2))
}

main().catch(err => {
  console.error(err.message || err)
  process.exit(1)
})
