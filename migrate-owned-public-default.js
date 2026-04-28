const https = require('https')
const fs = require('fs')
const path = require('path')

const APPID = 'wx13497267f3b92c0f'
const CLOUD_ENV = 'cloudbase-1g5rcsava7547769'
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
    https.get(url, res => {
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
    }, res => {
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

function normalizeOwnedBy(value) {
  return [...new Set((Array.isArray(value) ? value : []).filter(Boolean))].sort()
}

function normalizeVisibleBy(value, ownedBy) {
  const ownedSet = new Set(ownedBy)
  const source = value && typeof value === 'object' && !Array.isArray(value) ? value : {}
  const next = {}
  ownedBy.forEach(openid => { next[openid] = true })
  Object.keys(source).forEach(openid => {
    if (source[openid] && ownedSet.has(openid)) next[openid] = true
  })
  return next
}

function normalizeMetaBy(value, ownedBy) {
  const source = value && typeof value === 'object' && !Array.isArray(value) ? value : {}
  const next = {}
  ownedBy.forEach(openid => {
    const old = source[openid] || {}
    next[openid] = {
      status: 'owned',
      note: old.note ? String(old.note).slice(0, 80) : ''
    }
  })
  return next
}

function stableStringify(value) {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(',')}}`
  }
  return JSON.stringify(value)
}

function pickComparableImage(img) {
  return {
    ownedBy: normalizeOwnedBy(img && img.ownedBy),
    ownerContactVisibleBy: normalizeVisibleBy(img && img.ownerContactVisibleBy, normalizeOwnedBy(img && img.ownedBy)),
    ownerMetaBy: normalizeMetaBy(img && img.ownerMetaBy, normalizeOwnedBy(img && img.ownedBy))
  }
}

function migrateImages(images, ownerSet) {
  let changed = false
  const nextImages = (Array.isArray(images) ? images : []).map(img => {
    if (!img || typeof img === 'string') return img
    const ownedBy = normalizeOwnedBy(img.ownedBy)
    if (ownedBy.length === 0) return img
    ownedBy.forEach(openid => ownerSet.add(openid))
    const ownerContactVisibleBy = normalizeVisibleBy(img.ownerContactVisibleBy, ownedBy)
    const ownerMetaBy = normalizeMetaBy(img.ownerMetaBy, ownedBy)
    const next = { ...img, ownedBy, ownerContactVisibleBy, ownerMetaBy }
    if (stableStringify(pickComparableImage(next)) !== stableStringify(pickComparableImage(img))) changed = true
    return next
  })
  return { images: nextImages, changed }
}

async function updateSubsetItems(accessToken, docId, items) {
  return updateCloudDB(
    accessToken,
    `db.collection("my_series_subsets").doc(${quote(docId)}).update({data:${quote({
      items,
      updateTime: new Date().toISOString()
    })}})`
  )
}

async function updateSeriesFields(accessToken, seriesId, fields) {
  return updateCloudDB(
    accessToken,
    `db.collection("my_series").doc(${quote(seriesId)}).update({data:${quote({
      ...fields,
      updateTime: new Date().toISOString()
    })}})`
  )
}

async function updateProfile(accessToken, profile, openid) {
  const now = new Date().toISOString()
  if (profile && profile._id) {
    return updateCloudDB(
      accessToken,
      `db.collection("user_profiles").doc(${quote(profile._id)}).update({data:${quote({
        contactVisible: true,
        contactDefaultVisible: true,
        updateTime: now
      })}})`
    )
  }
  return addCloudDB(
    accessToken,
    `db.collection("user_profiles").add({data:${quote({
      openid,
      nickname: '',
      wechatId: '',
      xhsId: '',
      douyinId: '',
      contactVisible: true,
      contactDefaultVisible: true,
      createTime: now,
      updateTime: now
    })}})`
  )
}

async function main() {
  const apply = process.argv.includes('--apply')
  const env = loadEnv()
  const appSecret = env.APP_SECRET || process.env.APP_SECRET
  if (!appSecret) throw new Error('未找到 APP_SECRET，请先在 card/.env 配置')

  const accessToken = await getAccessToken(appSecret)
  const [seriesDocs, subsetDocs, profileDocs] = await Promise.all([
    fetchAll(accessToken, 'my_series'),
    fetchAll(accessToken, 'my_series_subsets'),
    fetchAll(accessToken, 'user_profiles')
  ])

  const ownerSet = new Set()
  const changedSubsets = []
  const changedSeries = []

  subsetDocs.forEach(doc => {
    let docChanged = false
    const items = (doc.items || []).map(item => {
      const result = migrateImages(item.images, ownerSet)
      if (result.changed) docChanged = true
      return { ...item, images: result.images }
    })
    if (docChanged) changedSubsets.push({ docId: doc._id, seriesId: doc.seriesId, subset: doc.subset || '', items })
  })

  seriesDocs.forEach(series => {
    let seriesChanged = false
    const checklist = (series.checklist || []).map(item => {
      const result = migrateImages(item.images, ownerSet)
      if (result.changed) seriesChanged = true
      return { ...item, images: result.images }
    })
    const freeResult = migrateImages(series.freeImages, ownerSet)
    if (freeResult.changed) seriesChanged = true
    if (seriesChanged) {
      changedSeries.push({
        seriesId: series._id,
        seriesName: series.name || '',
        checklist,
        freeImages: freeResult.images
      })
    }
  })

  const profilesByOpenid = new Map(profileDocs.map(profile => [profile.openid, profile]))
  const profilePlan = [...ownerSet].map(openid => {
    const profile = profilesByOpenid.get(openid)
    return {
      openid,
      action: profile && profile._id ? 'update' : 'create',
      alreadyPublic: !!(profile && profile.contactVisible && profile.contactDefaultVisible)
    }
  })
  const changedProfiles = profilePlan.filter(item => !item.alreadyPublic)

  if (apply) {
    for (const doc of changedSubsets) {
      await updateSubsetItems(accessToken, doc.docId, doc.items)
    }
    for (const series of changedSeries) {
      await updateSeriesFields(accessToken, series.seriesId, {
        checklist: series.checklist,
        freeImages: series.freeImages
      })
    }
    for (const item of changedProfiles) {
      await updateProfile(accessToken, profilesByOpenid.get(item.openid), item.openid)
    }
  }

  console.log(JSON.stringify({
    apply,
    changedSubsetDocCount: changedSubsets.length,
    changedSeriesCount: changedSeries.length,
    ownerCount: ownerSet.size,
    changedProfileCount: changedProfiles.length,
    changedSubsets: changedSubsets.map(item => ({ docId: item.docId, seriesId: item.seriesId, subset: item.subset })),
    changedSeries: changedSeries.map(item => ({ seriesId: item.seriesId, seriesName: item.seriesName })),
    changedProfiles
  }, null, 2))
}

main().catch(err => {
  console.error(err.stack || err.message)
  process.exit(1)
})
