const https = require('https')
const fs = require('fs')
const path = require('path')

const APPID = 'wx13497267f3b92c0f'
const CLOUD_ENV = 'cloudbase-1g5rcsava7547769'
const ENV_PATH = path.join(__dirname, '.env')
const ADMIN_OPENID = 'oaQG05Ax1I_QRhOkD4lwqOXEucV8'
const PUBLIC_ID = 'dbsg'
const PUBLIC_ID_KEY = PUBLIC_ID.toLowerCase()

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
  const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${APPID}&secret=${appSecret}`
  const result = JSON.parse((await httpGet(url)).toString('utf8'))
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

function parseDocs(result) {
  return (result.data || []).map(item => JSON.parse(item))
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

async function ensureCollection(accessToken, collectionName) {
  try {
    await queryCloudDB(accessToken, `db.collection(${quote(collectionName)}).limit(1).get()`)
    return { collectionName, action: 'exists' }
  } catch (err) {
    if (!/Db or Table not exist|ResourceNotFound/.test(String(err && err.message))) throw err
  }

  try {
    await callCloudApi(accessToken, 'databasecollectionadd', { collection_name: collectionName })
    return { collectionName, action: 'created' }
  } catch (err) {
    if (/already exist|AlreadyExists|existed/i.test(String(err && err.message))) {
      return { collectionName, action: 'exists' }
    }
    throw err
  }
}

async function fetchAll(accessToken, collectionName) {
  const docs = []
  for (let skip = 0; ; skip += 100) {
    const page = parseDocs(await queryCloudDB(
      accessToken,
      `db.collection(${quote(collectionName)}).skip(${skip}).limit(100).get()`
    ))
    docs.push(...page)
    if (page.length < 100) break
  }
  return docs
}

async function upsertPublicProfile(accessToken) {
  const now = new Date().toISOString()
  const byPublicId = parseDocs(await queryCloudDB(
    accessToken,
    `db.collection("user_public_profiles").where({publicIdKey:${quote(PUBLIC_ID_KEY)}}).limit(10).get()`
  ))
  const duplicate = byPublicId.find(item => item.openid && item.openid !== ADMIN_OPENID)
  if (duplicate) {
    throw new Error(`公开用户 ID ${PUBLIC_ID} 已被其他 openid 占用，docId=${duplicate._id || ''}`)
  }

  const byOpenid = parseDocs(await queryCloudDB(
    accessToken,
    `db.collection("user_public_profiles").where({openid:${quote(ADMIN_OPENID)}}).limit(1).get()`
  ))
  const current = byOpenid[0]
  const data = {
    openid: ADMIN_OPENID,
    _openid: ADMIN_OPENID,
    publicId: PUBLIC_ID,
    publicIdKey: PUBLIC_ID_KEY,
    updateTime: now
  }

  if (current && current._id) {
    await updateCloudDB(
      accessToken,
      `db.collection("user_public_profiles").doc(${quote(current._id)}).update({data:${JSON.stringify(data)}})`
    )
    return { action: 'updated', previousPublicId: current.publicId || '', docId: current._id }
  }

  await addCloudDB(
    accessToken,
    `db.collection("user_public_profiles").add({data:[${JSON.stringify({ ...data, createTime: now })}]})`
  )
  return { action: 'created', previousPublicId: '', docId: '' }
}

function shouldBackfillImage(img) {
  if (!img || typeof img !== 'object') return false
  const currentPublicId = String(img.uploaderPublicId || '').trim()
  if (currentPublicId && currentPublicId !== PUBLIC_ID) return false
  const currentOpenid = String(img.uploaderOpenid || '').trim()
  if (currentOpenid && currentOpenid !== ADMIN_OPENID) return false
  return img.uploaderPublicId !== PUBLIC_ID
}

function backfillImagePublicId(img) {
  if (!shouldBackfillImage(img)) return false
  if (!img.uploaderOpenid) img.uploaderOpenid = ADMIN_OPENID
  img.uploaderPublicId = PUBLIC_ID
  return true
}

function backfillSeriesDoc(doc) {
  let changed = false
  const freeImages = Array.isArray(doc.freeImages) ? doc.freeImages : []
  freeImages.forEach(img => { if (backfillImagePublicId(img)) changed = true })
  return changed ? { freeImages, updateTime: new Date().toISOString() } : null
}

function backfillSubsetDoc(doc) {
  let changed = false
  const items = Array.isArray(doc.items) ? doc.items : []
  items.forEach(item => {
    ;(Array.isArray(item.images) ? item.images : []).forEach(img => {
      if (backfillImagePublicId(img)) changed = true
    })
  })
  return changed ? { items, updateTime: new Date().toISOString() } : null
}

async function backfillImageSnapshots(accessToken) {
  const seriesDocs = await fetchAll(accessToken, 'my_series')
  const subsetDocs = await fetchAll(accessToken, 'my_series_subsets')
  let seriesUpdated = 0
  let subsetUpdated = 0

  for (const doc of seriesDocs) {
    const patch = backfillSeriesDoc(doc)
    if (!patch) continue
    await updateCloudDB(
      accessToken,
      `db.collection("my_series").doc(${quote(doc._id)}).update({data:${JSON.stringify(patch)}})`
    )
    seriesUpdated += 1
  }

  for (const doc of subsetDocs) {
    const patch = backfillSubsetDoc(doc)
    if (!patch) continue
    await updateCloudDB(
      accessToken,
      `db.collection("my_series_subsets").doc(${quote(doc._id)}).update({data:${JSON.stringify(patch)}})`
    )
    subsetUpdated += 1
  }

  return { seriesUpdated, subsetUpdated }
}

async function main() {
  const env = loadEnv()
  if (!env.APP_SECRET) throw new Error(`缺少 ${ENV_PATH} 中的 APP_SECRET`)
  const accessToken = await getAccessToken(env.APP_SECRET)
  const collection = await ensureCollection(accessToken, 'user_public_profiles')
  const profile = await upsertPublicProfile(accessToken)
  const snapshots = await backfillImageSnapshots(accessToken)
  console.log(JSON.stringify({
    ok: true,
    openid: ADMIN_OPENID,
    publicId: PUBLIC_ID,
    collection,
    profile,
    snapshots
  }, null, 2))
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
