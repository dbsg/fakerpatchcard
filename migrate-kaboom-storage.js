const https = require('https')
const fs = require('fs')
const path = require('path')

const APPID = 'wx13497267f3b92c0f'
const DB_ENV = 'cloudbase-1g5rcsava7547769'
const STORAGE_ENV = 'prod-8g8ay186059e4264'
const TARGET_SERIES_NAME = 'Panini Kaboom!'
const ENV_PATH = path.join(__dirname, '.env')
const SOURCE_PREFIX = 'cloud://cloudbase-1g5rcsava7547769.636c-cloudbase-1g5rcsava7547769-1418320285/'

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

function httpMultipartPost(url, fields, fileField, fileName, fileBuffer) {
  return new Promise((resolve, reject) => {
    const boundary = `----CodexForm${Date.now().toString(16)}`
    const parsed = new URL(url)
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

async function callCloudApi(accessToken, apiName, body, env = DB_ENV) {
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

async function requestUpload(accessToken, cloudPath) {
  return callCloudApi(accessToken, 'uploadfile', { path: cloudPath }, STORAGE_ENV)
}

async function batchDownload(accessToken, fileIds) {
  const result = await callCloudApi(accessToken, 'batchdownloadfile', {
    file_list: fileIds.map(fileid => ({ fileid, max_age: 7200 }))
  })
  return result.file_list || []
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

function getUrl(img) {
  return typeof img === 'string' ? img : (img && img.url) || ''
}

function getExtFromFileId(fileId) {
  const clean = fileId.split('?')[0]
  return path.extname(clean).toLowerCase() || '.png'
}

async function uploadBuffer(accessToken, sourceFileId, buffer) {
  const ext = getExtFromFileId(sourceFileId)
  const cloudPath = `images/collection/kaboom_migrated_${Date.now()}_${Math.random().toString(36).slice(2, 8)}${ext}`
  const uploadInfo = await requestUpload(accessToken, cloudPath)
  await httpMultipartPost(uploadInfo.url, {
    key: cloudPath,
    Signature: uploadInfo.authorization,
    'x-cos-security-token': uploadInfo.token,
    'x-cos-meta-fileid': uploadInfo.cos_file_id || uploadInfo.file_id,
    success_action_status: '200'
  }, 'file', path.basename(cloudPath), buffer)
  return uploadInfo.file_id
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
  const targets = []
  subsetDocs.forEach(doc => {
    ;(doc.items || []).forEach((item, itemIdx) => {
      ;(item.images || []).forEach((img, imgIdx) => {
        const url = getUrl(img)
        if (url.startsWith(SOURCE_PREFIX)) {
          targets.push({ doc, itemIdx, imgIdx, url })
        }
      })
    })
  })

  const changedDocs = new Map()
  const errors = []
  const migrated = []

  if (apply) {
    for (let i = 0; i < targets.length; i++) {
      const target = targets[i]
      try {
        const downloadInfo = (await batchDownload(accessToken, [target.url]))[0]
        if (!downloadInfo || !downloadInfo.download_url) {
          throw new Error(downloadInfo ? `download status ${downloadInfo.status || ''} ${downloadInfo.errmsg || ''}` : 'empty download info')
        }
        const buffer = await httpGet(downloadInfo.download_url)
        const newFileId = await uploadBuffer(accessToken, target.url, buffer)

        if (!changedDocs.has(target.doc._id)) {
          changedDocs.set(target.doc._id, JSON.parse(JSON.stringify(target.doc.items || [])))
        }
        const items = changedDocs.get(target.doc._id)
        const image = items[target.itemIdx].images[target.imgIdx]
        if (typeof image === 'string') {
          items[target.itemIdx].images[target.imgIdx] = newFileId
        } else {
          items[target.itemIdx].images[target.imgIdx] = { ...image, url: newFileId }
        }
        migrated.push({ oldUrl: target.url, newUrl: newFileId })
        if ((i + 1) % 10 === 0) console.log(`migrated ${i + 1}/${targets.length}`)
      } catch (err) {
        errors.push({ url: target.url, message: err.message })
      }
    }

    for (const [docId, items] of changedDocs.entries()) {
      await updateSubsetItems(accessToken, docId, items)
    }
  }

  console.log(JSON.stringify({
    apply,
    seriesId: series._id,
    targetCount: targets.length,
    changedDocCount: changedDocs.size,
    migratedCount: migrated.length,
    errorCount: errors.length,
    errors: errors.slice(0, 20)
  }, null, 2))
}

main().catch(err => {
  console.error(err.stack || err.message)
  process.exit(1)
})
