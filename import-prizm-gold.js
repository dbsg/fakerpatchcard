const https = require('https')
const fs = require('fs')
const path = require('path')

const APPID = 'wx13497267f3b92c0f'
const CLOUD_ENV = 'cloudbase-1g5rcsava7547769'
const STORAGE_ENV = 'prod-8g8ay186059e4264'
const ENV_PATH = path.join(__dirname, '.env')
const TARGET_SERIES_NAME = '2012 Prizm 金折'
const IMAGE_DIR = path.join(__dirname, '..', 'prizm-gold')

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
  for (let skip = 0; ; skip += 100) {
    const result = await queryCloudDB(
      accessToken,
      `db.collection("my_series_subsets").where({ seriesId: ${quote(series._id)} }).skip(${skip}).limit(100).get()`
    )
    const docs = result.data.map(item => JSON.parse(item))
    subsetDocs.push(...docs)
    if (docs.length < 100) break
  }

  return { series, subsetDocs }
}

function listLocalImages() {
  return fs.readdirSync(IMAGE_DIR)
    .filter(name => /\.(jpe?g|png|webp)$/i.test(name))
    .map(name => {
      const base = path.basename(name, path.extname(name))
      const number = Number(base)
      return { number, name, filePath: path.join(IMAGE_DIR, name), ext: path.extname(name).toLowerCase() }
    })
    .filter(item => Number.isInteger(item.number) && item.number > 0)
    .sort((a, b) => a.number - b.number)
}

function getItemNumber(item) {
  const text = `${item.subset || ''} ${item.text || ''}`.trim()
  const match = text.match(/^(\d+)\b/)
  return match ? Number(match[1]) : null
}

function buildImageRecord(fileId, number, uploaderOpenid) {
  return {
    imageId: `img_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`,
    url: fileId,
    ownedBy: [],
    ownerContactVisibleBy: {},
    ownerMetaBy: {},
    number: String(number),
    year: '',
    cardKind: '',
    uploaderOpenid: uploaderOpenid || '',
    sourceType: 'user_photo',
    sourceNote: ''
  }
}

function buildStats(subsetDocs) {
  const items = subsetDocs.flatMap(doc => doc.items || [])
  const urls = []
  items.forEach(item => {
    ;(item.images || []).forEach(img => {
      const url = typeof img === 'string' ? img : img && img.url
      if (url) urls.push(url)
    })
  })
  const listCollectedCount = items.filter(item => (item.images || []).length > 0).length
  const listTotalCount = items.length
  return {
    listCollectedCount,
    listTotalCount,
    listProgress: listTotalCount ? Math.round(listCollectedCount / listTotalCount * 100) : 0,
    listImageCount: urls.length,
    listRecentImages: urls.slice(-5).reverse()
  }
}

async function updateSubsetDoc(accessToken, docId, items) {
  return updateCloudDB(accessToken, `db.collection("my_series_subsets").doc(${quote(docId)}).update({
    data: {
      items: ${JSON.stringify(items)},
      updateTime: ${quote(new Date().toISOString())}
    }
  })`)
}

async function updateSeriesDoc(accessToken, seriesId, fields) {
  return updateCloudDB(accessToken, `db.collection("my_series").doc(${quote(seriesId)}).update({
    data: ${JSON.stringify({ ...fields, updateTime: new Date().toISOString() })}
  })`)
}

async function main() {
  const apply = process.argv.includes('--apply')
  const env = loadEnv()
  if (!env.APP_SECRET) throw new Error(`缺少 ${ENV_PATH} 中的 APP_SECRET`)

  const accessToken = await getAccessToken(env.APP_SECRET)
  const { series, subsetDocs } = await fetchTargetSeries(accessToken)
  const localImages = listLocalImages()

  const targetsByNumber = new Map()
  subsetDocs.forEach(doc => {
    ;(doc.items || []).forEach((item, index) => {
      const number = getItemNumber(item)
      if (number) targetsByNumber.set(number, { doc, item, index })
    })
  })

  const unmatched = localImages.filter(file => !targetsByNumber.has(file.number))
  const duplicate = localImages.filter(file => {
    const target = targetsByNumber.get(file.number)
    return target && (target.item.images || []).length > 0
  })
  const pending = localImages.filter(file => {
    const target = targetsByNumber.get(file.number)
    return target && (target.item.images || []).length === 0
  })

  console.log(JSON.stringify({
    mode: apply ? 'apply' : 'dry-run',
    seriesId: series._id,
    localImageCount: localImages.length,
    matchedCount: localImages.length - unmatched.length,
    pendingCount: pending.length,
    duplicateSkippedCount: duplicate.length,
    unmatched: unmatched.map(item => item.name),
    duplicateSkipped: duplicate.map(item => item.name).slice(0, 20)
  }, null, 2))

  if (!apply) {
    console.log('Dry-run only. Use --apply to upload and update cloud data.')
    return
  }

  const touchedDocs = new Map()
  for (let i = 0; i < pending.length; i++) {
    const file = pending[i]
    const target = targetsByNumber.get(file.number)
    const cloudPath = `collection-series/${series._id}/prizm_gold_${String(file.number).padStart(3, '0')}_${Date.now()}${file.ext}`
    console.log(`[${i + 1}/${pending.length}] upload #${file.number}: ${file.name}`)
    const fileId = await uploadLocalImage(accessToken, file.filePath, cloudPath)
    const imageRecord = buildImageRecord(fileId, file.number, series.creatorOpenid)
    target.item.images = [...(target.item.images || []), imageRecord]
    touchedDocs.set(target.doc._id, target.doc)
  }

  let updatedDocs = 0
  for (const doc of touchedDocs.values()) {
    await updateSubsetDoc(accessToken, doc._id, doc.items || [])
    updatedDocs++
  }
  const stats = buildStats(subsetDocs)
  await updateSeriesDoc(accessToken, series._id, {
    totalCards: stats.listTotalCount,
    ...stats
  })

  console.log(JSON.stringify({
    uploaded: pending.length,
    updatedSubsetDocs: updatedDocs,
    stats
  }, null, 2))
}

main().catch(err => {
  console.error(err.message || err)
  process.exit(1)
})
