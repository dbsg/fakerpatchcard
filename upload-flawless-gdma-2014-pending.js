const https = require('https')
const fs = require('fs')
const path = require('path')
const progressData = require('../miniprogram-card/utils/collectionProgress')

const APPID = 'wx13497267f3b92c0f'
const CLOUD_ENV = 'cloudbase-1g5rcsava7547769'
const STORAGE_ENV = 'prod-8g8ay186059e4264'
const ENV_PATH = path.join(__dirname, '.env')
const PENDING_PATH = path.join(__dirname, 'flawless-gdma-2014-pending-images.json')

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
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    }, res => {
      const chunks = []
      res.on('data', chunk => chunks.push(chunk))
      res.on('end', () => {
        const text = Buffer.concat(chunks).toString('utf8')
        try {
          resolve(JSON.parse(text))
        } catch (_) {
          reject(new Error(`Invalid JSON response: ${text}`))
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
    }, res => {
      const chunks = []
      res.on('data', chunk => chunks.push(chunk))
      res.on('end', () => {
        const text = Buffer.concat(chunks).toString('utf8')
        if (![200, 201, 204].includes(res.statusCode)) {
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
  const result = JSON.parse((await httpGet(url)).toString('utf8'))
  if (result.errcode) throw new Error(`获取 access_token 失败: ${result.errmsg} (${result.errcode})`)
  return result.access_token
}

async function callCloudApi(accessToken, apiName, body, env = CLOUD_ENV) {
  const result = await httpPost(`https://api.weixin.qq.com/tcb/${apiName}?access_token=${accessToken}`, { env, ...body })
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

async function requestUpload(accessToken, cloudPath) {
  return callCloudApi(accessToken, 'uploadfile', { path: cloudPath }, STORAGE_ENV)
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

function loadPending() {
  return JSON.parse(fs.readFileSync(PENDING_PATH, 'utf8'))
}

function savePending(data) {
  fs.writeFileSync(PENDING_PATH, `${JSON.stringify(data, null, 2)}\n`)
}

async function fetchSeriesAndSubsets(accessToken, seriesId) {
  const seriesResult = await queryCloudDB(
    accessToken,
    `db.collection("my_series").doc(${quote(seriesId)}).get()`
  )
  const series = seriesResult.data[0] ? JSON.parse(seriesResult.data[0]) : null
  if (!series) throw new Error(`未找到图鉴: ${seriesId}`)

  const subsetDocs = []
  for (let skip = 0; ; skip += 100) {
    const result = await queryCloudDB(
      accessToken,
      `db.collection("my_series_subsets").where({ seriesId: ${quote(seriesId)} }).skip(${skip}).limit(100).get()`
    )
    const docs = result.data.map(item => JSON.parse(item))
    subsetDocs.push(...docs)
    if (docs.length < 100) break
  }

  return { series, subsetDocs }
}

function normalizeText(value) {
  return String(value || '').trim().replace(/\s+/g, ' ')
}

function imageUrl(img) {
  return typeof img === 'string' ? img : (img && img.url) || ''
}

function buildTargetMap(subsetDocs) {
  const map = new Map()
  subsetDocs.forEach(doc => {
    ;(doc.items || []).forEach((item, index) => {
      const subset = normalizeText(doc.subset || item.subset)
      const text = normalizeText(item.text)
      const code = text.split(/\s+/)[0]
      if (subset && code) map.set(`${subset}::${code}`, { doc, item, index })
    })
  })
  return map
}

function buildImageRecord(fileId, entry, uploaderOpenid) {
  return {
    imageId: `img_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`,
    url: fileId,
    ownedBy: [],
    ownerContactVisibleBy: {},
    ownerMetaBy: {},
    number: entry.printNumber || '',
    year: '',
    cardKind: '',
    uploaderOpenid: uploaderOpenid || '',
    sourceType: 'catalog',
    sourceNote: entry.sourceNote || ''
  }
}

function buildStats(subsetDocs) {
  const items = subsetDocs.flatMap(doc => doc.items || [])
  return progressData.buildChecklistProgressStats(items)
}

async function updateSubsetDoc(accessToken, doc) {
  return updateCloudDB(accessToken, `db.collection("my_series_subsets").doc(${quote(doc._id)}).update({
    data: {
      items: ${JSON.stringify(doc.items || [])},
      updateTime: ${quote(new Date().toISOString())}
    }
  })`)
}

async function updateSeriesDoc(accessToken, seriesId, fields) {
  return updateCloudDB(accessToken, `db.collection("my_series").doc(${quote(seriesId)}).update({
    data: ${JSON.stringify({ ...fields, updateTime: new Date().toISOString() })}
  })`)
}

function parseArgs(argv) {
  return {
    apply: argv.includes('--apply'),
    force: argv.includes('--force')
  }
}

function extFor(filePath) {
  const ext = path.extname(filePath).toLowerCase()
  return ext && /^\.[a-z0-9]+$/.test(ext) ? ext : '.jpg'
}

async function main() {
  const { apply, force } = parseArgs(process.argv.slice(2))
  const env = loadEnv()
  const appSecret = env.APP_SECRET || process.env.APP_SECRET
  if (!appSecret) throw new Error(`缺少 ${ENV_PATH} 中的 APP_SECRET`)

  const pendingData = loadPending()
  const pending = pendingData.items.filter(item => force || !item.uploaded)
  const missingFiles = pending.filter(item => !fs.existsSync(item.localPath))
  if (missingFiles.length) {
    throw new Error(`本地图片不存在: ${missingFiles.map(item => item.localPath).join(', ')}`)
  }

  const accessToken = await getAccessToken(appSecret)
  const { series, subsetDocs } = await fetchSeriesAndSubsets(accessToken, pendingData.seriesId)
  const targets = buildTargetMap(subsetDocs)
  const targetChecks = pending.map(entry => {
    const key = `${normalizeText(entry.subset)}::${normalizeText(entry.cardCode)}`
    return { entry, key, target: targets.get(key) }
  })
  const unmatched = targetChecks.filter(item => !item.target)
  if (unmatched.length) {
    throw new Error(`未匹配到卡种: ${unmatched.map(item => `${item.entry.subset}/${item.entry.cardCode}`).join(', ')}`)
  }

  const existingDuplicates = targetChecks.filter(({ entry, target }) => {
    return (target.item.images || []).some(img => imageUrl(img) && normalizeText(img.number) === normalizeText(entry.printNumber))
  })
  const uploadTargets = force
    ? targetChecks
    : targetChecks.filter(item => !existingDuplicates.includes(item))

  console.log(JSON.stringify({
    mode: apply ? 'apply' : 'dry-run',
    force,
    seriesId: series._id,
    seriesName: series.name,
    pendingCount: pending.length,
    uploadCount: uploadTargets.length,
    existingDuplicateSkippedCount: existingDuplicates.length,
    existingDuplicateSkipped: existingDuplicates.map(({ entry }) => `${entry.subset}/${entry.cardCode}/${entry.printNumber}`)
  }, null, 2))

  if (!apply) {
    console.log('Dry-run only. Use --apply to upload and update cloud data.')
    return
  }

  const touchedDocs = new Map()
  for (let i = 0; i < uploadTargets.length; i++) {
    const { entry, target } = uploadTargets[i]
    const ext = extFor(entry.localPath)
    const safeCode = entry.cardCode.toLowerCase().replace(/[^a-z0-9]+/g, '_')
    const safeSubset = entry.subset.toLowerCase().replace(/[^a-z0-9]+/g, '_')
    const safeNumber = entry.printNumber.replace(/[^0-9a-z]+/gi, '_')
    const cloudPath = `collection-series/${series._id}/flawless_gdma_2014_${safeSubset}_${safeCode}_${safeNumber}_${Date.now()}${ext}`

    console.log(`[${i + 1}/${uploadTargets.length}] upload ${entry.subset}/${entry.cardCode}/${entry.printNumber}`)
    const fileId = await uploadLocalImage(accessToken, entry.localPath, cloudPath)
    target.item.images = [...(target.item.images || []), buildImageRecord(fileId, entry, series.creatorOpenid)]
    touchedDocs.set(target.doc._id, target.doc)

    entry.uploaded = true
    entry.fileId = fileId
    entry.cloudPath = cloudPath
    entry.uploadedAt = new Date().toISOString()
    savePending(pendingData)
  }

  let updatedSubsetDocs = 0
  for (const doc of touchedDocs.values()) {
    await updateSubsetDoc(accessToken, doc)
    updatedSubsetDocs++
  }

  const stats = buildStats(subsetDocs)
  await updateSeriesDoc(accessToken, series._id, stats)

  console.log(JSON.stringify({
    uploaded: uploadTargets.length,
    updatedSubsetDocs,
    stats
  }, null, 2))
}

main().catch(err => {
  console.error(err.message || err)
  process.exit(1)
})
