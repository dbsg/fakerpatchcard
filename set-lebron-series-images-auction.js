const https = require('https')
const fs = require('fs')
const path = require('path')

const APPID = 'wx13497267f3b92c0f'
const CLOUD_ENV = 'cloudbase-1g5rcsava7547769'
const ENV_PATH = path.join(__dirname, '.env')
const OWNER_OPENID = 'oaQG05Ax1I_QRhOkD4lwqOXEucV8'

const SOURCE_RULES = [
  ['1986 Fleer', 'auction'],
  ['1997-98 Metal Universe', 'auction'],
  ['1998 Carddass Masters Slam Dunk Takehiko Inoue Illustration Collection', 'auction'],
  ['2003-04 Limited Logos Autographs', 'auction'],
  ['2004-05 Limited Logos Autographs', 'auction'],
  ['2006-07 Limited Logos Autographs', 'auction'],
  ['2008 Topps Chrome', 'auction'],
  ['2009-10 Limited Logos Autographs', 'auction'],
  ['2012 Prizm 金折', 'auction'],
  ['2012-13 Panini Flawless Greats Dual Patches Autographs', 'auction'],
  ['2012-13 Panini Flawless Patches', 'auction'],
  ['2014-15 Panini Flawless Greats Dual Memorabilia Autographs', 'auction'],
  ['2015-16 Flawless 钻石', 'user_photo'],
  ['2015-16 Panini Flawless Greats Dual Memorabilia Autographs', 'auction'],
  ['2015-16 Panini Preferred NBA Finals 骑士', 'auction'],
  ['2016-17 Panini Hoops Road To The Finals - 骑士', 'auction'],
  ['2016-17 Panini Preferred NBA Finals 骑士', 'auction'],
  ['2017-18 Panini Opulence NBA Finals 骑士', 'auction'],
  ['2018-19 Panini Opulence NBA Finals 骑士', 'auction'],
  ['2024-25 Panini Silhouette NBA Finals 骑士', 'auction'],
  ['暴力切割', 'web_ref', { includeOwned: true }],
  ['勒布朗 2016-17 Panini National Treasures Colossal Materials', 'auction'],
  ['勒布朗 经典球星卡', 'auction'],
  ['勒布朗 木盒 RPA/99', 'auction'],
  ['勒布朗 撒镁粉', 'auction'],
  ['勒布朗 油画 画布', 'auction'],
  ['勒布朗 downtown', 'auction'],
  ['勒布朗 Logoman', 'auction'],
  ['勒布朗 Prizm 金折', 'auction'],
  ['Panini Kaboom!', 'auction']
].map(([name, sourceType, options = {}]) => ({ name, sourceType, ...options }))

function parseArgs(argv) {
  const args = new Set(argv.slice(2))
  return {
    apply: args.has('--apply')
  }
}

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
  const result = JSON.parse((await httpGet(`https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${APPID}&secret=${appSecret}`)).toString('utf8'))
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

async function fetchAllDocs(accessToken, collectionName, pageSize = 100) {
  const docs = []
  for (let skip = 0; ; skip += pageSize) {
    const result = await queryCloudDB(accessToken, `db.collection(${quote(collectionName)}).skip(${skip}).limit(${pageSize}).get()`)
    const page = parseDocs(result)
    docs.push(...page)
    if (page.length < pageSize) break
  }
  return docs
}

function normalizeName(value) {
  return String(value || '').replace(/\s+/g, '').trim()
}

function imageUrl(img) {
  return typeof img === 'string' ? img : (img && img.url) || ''
}

function isOwnedByMe(img) {
  return !!(img && typeof img === 'object' && Array.isArray(img.ownedBy) && img.ownedBy.includes(OWNER_OPENID))
}

function emptyCounts() {
  return {
    total: 0,
    auction: 0,
    user_photo: 0,
    web_ref: 0,
    other: 0,
    ownedByMe: 0,
    changed: 0,
    skippedOwned: 0
  }
}

function addSourceCount(counts, img) {
  if (!imageUrl(img)) return
  counts.total += 1
  const sourceType = typeof img === 'string' ? '' : String(img.sourceType || '')
  if (sourceType === 'auction') counts.auction += 1
  else if (sourceType === 'user_photo') counts.user_photo += 1
  else if (sourceType === 'web_ref') counts.web_ref += 1
  else counts.other += 1
  if (isOwnedByMe(img)) counts.ownedByMe += 1
}

function summarizeSeriesImages(series, subsetDocs) {
  const counts = emptyCounts()
  ;(Array.isArray(series.freeImages) ? series.freeImages : []).forEach(img => addSourceCount(counts, img))
  subsetDocs.forEach(doc => {
    ;(doc.items || []).forEach(item => {
      ;(item.images || []).forEach(img => addSourceCount(counts, img))
    })
  })
  return counts
}

function normalizeImageSource(img, rule, stats) {
  if (!imageUrl(img)) return img
  const current = typeof img === 'string' ? '' : String(img.sourceType || '')
  if (!rule.includeOwned && isOwnedByMe(img)) {
    stats.skippedOwned += 1
    return img
  }
  if (current === rule.sourceType && typeof img === 'object') return img
  stats.changed += 1
  if (typeof img === 'string') {
    return {
      url: img,
      sourceType: rule.sourceType,
      sourceNote: ''
    }
  }
  return {
    ...img,
    sourceType: rule.sourceType,
    sourceNote: ''
  }
}

function normalizeImages(images, rule, stats) {
  return (Array.isArray(images) ? images : []).map(img => normalizeImageSource(img, rule, stats))
}

function normalizeSeriesFreeImages(series, rule, stats) {
  return normalizeImages(series.freeImages, rule, stats)
}

function normalizeSubsetItems(doc, rule, stats) {
  return (Array.isArray(doc.items) ? doc.items : []).map(item => ({
    ...item,
    images: normalizeImages(item.images, rule, stats)
  }))
}

async function main() {
  const { apply } = parseArgs(process.argv)
  const env = loadEnv()
  const appSecret = env.APP_SECRET || process.env.APP_SECRET
  if (!appSecret) throw new Error(`缺少 ${ENV_PATH} 中的 APP_SECRET`)

  const accessToken = await getAccessToken(appSecret)
  const [allSeries, allSubsetDocs] = await Promise.all([
    fetchAllDocs(accessToken, 'my_series'),
    fetchAllDocs(accessToken, 'my_series_subsets')
  ])
  const ruleByName = new Map(SOURCE_RULES.map(rule => [normalizeName(rule.name), rule]))
  const targetSeries = allSeries.filter(series => ruleByName.has(normalizeName(series.name)))
  if (targetSeries.length !== SOURCE_RULES.length) {
    const matched = new Set(targetSeries.map(series => normalizeName(series.name)))
    const missing = SOURCE_RULES.map(rule => rule.name).filter(name => !matched.has(normalizeName(name)))
    throw new Error(`图鉴匹配数量异常: expected ${SOURCE_RULES.length}, got ${targetSeries.length}. missing: ${missing.join(', ')}`)
  }

  const subsetDocsBySeriesId = new Map()
  allSubsetDocs.forEach(doc => {
    if (!doc.seriesId) return
    if (!subsetDocsBySeriesId.has(doc.seriesId)) subsetDocsBySeriesId.set(doc.seriesId, [])
    subsetDocsBySeriesId.get(doc.seriesId).push(doc)
  })

  const plan = targetSeries.map(series => {
    const rule = ruleByName.get(normalizeName(series.name))
    const subsetDocs = subsetDocsBySeriesId.get(series._id) || []
    const mutationStats = { changed: 0, skippedOwned: 0 }
    const nextSeries = { ...series, freeImages: normalizeSeriesFreeImages(series, rule, mutationStats) }
    const nextSubsetDocs = subsetDocs.map(doc => ({ ...doc, items: normalizeSubsetItems(doc, rule, mutationStats) }))
    const before = summarizeSeriesImages(series, subsetDocs)
    const after = summarizeSeriesImages(nextSeries, nextSubsetDocs)
    before.changed = mutationStats.changed
    before.skippedOwned = mutationStats.skippedOwned
    return {
      seriesId: series._id,
      name: series.name,
      targetSourceType: rule.sourceType,
      includeOwned: !!rule.includeOwned,
      subsetDocCount: subsetDocs.length,
      before,
      after
    }
  }).sort((a, b) => a.name.localeCompare(b.name, 'zh-Hans-CN'))

  console.log(JSON.stringify({ mode: apply ? 'apply' : 'dry-run', targets: plan }, null, 2))
  if (!apply) {
    console.log('Dry-run only. Use --apply to update configured image sourceType fields.')
    return
  }

  const now = new Date().toISOString()
  for (const series of targetSeries) {
    const rule = ruleByName.get(normalizeName(series.name))
    const subsetDocs = subsetDocsBySeriesId.get(series._id) || []
    const mutationStats = { changed: 0, skippedOwned: 0 }
    const freeImages = normalizeSeriesFreeImages(series, rule, mutationStats)
    await updateCloudDB(
      accessToken,
      `db.collection("my_series").doc(${quote(series._id)}).update({data:{freeImages:${quote(freeImages)},updateTime:${quote(now)}}})`
    )
    for (const doc of subsetDocs) {
      const items = normalizeSubsetItems(doc, rule, mutationStats)
      await updateCloudDB(
        accessToken,
        `db.collection("my_series_subsets").doc(${quote(doc._id)}).update({data:{items:${quote(items)},updateTime:${quote(now)}}})`
      )
    }
  }

  console.log(JSON.stringify({
    ok: true,
    updatedSeries: targetSeries.map(series => ({ id: series._id, name: series.name }))
  }, null, 2))
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
