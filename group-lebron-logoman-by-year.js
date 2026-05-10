const https = require('https')
const fs = require('fs')
const path = require('path')
const progressData = require('../miniprogram-card/utils/collectionProgress')

const APPID = 'wx13497267f3b92c0f'
const CLOUD_ENV = 'cloudbase-1g5rcsava7547769'
const ENV_PATH = path.join(__dirname, '.env')
const SERIES_NAME = '勒布朗 Logoman'
const FALLBACK_YEAR = '未填年份'
const CREATOR_OPENID = 'oaQG05Ax1I_QRhOkD4lwqOXEucV8'

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

async function addCloudDB(accessToken, query) {
  return callCloudApi(accessToken, 'databaseadd', { query })
}

async function deleteCloudDB(accessToken, query) {
  return callCloudApi(accessToken, 'databasedelete', { query })
}

async function findSeriesByName(accessToken, name) {
  const result = await queryCloudDB(accessToken, `db.collection("my_series").where({name:${quote(name)}}).limit(2).get()`)
  return parseDocs(result)
}

async function fetchSubsets(accessToken, seriesId) {
  const docs = []
  for (let skip = 0; ; skip += 100) {
    const result = await queryCloudDB(accessToken, `db.collection("my_series_subsets").where({seriesId:${quote(seriesId)}}).skip(${skip}).limit(100).get()`)
    const page = parseDocs(result)
    docs.push(...page)
    if (page.length < 100) break
  }
  return docs
}

function imageUrl(img) {
  return typeof img === 'string' ? img : (img && img.url) || ''
}

function yearKey(img) {
  const year = String((img && typeof img === 'object' && img.year) || '').trim()
  return year || FALLBACK_YEAR
}

function yearSortValue(year) {
  const n = Number(year)
  return Number.isInteger(n) ? n : Number.MAX_SAFE_INTEGER
}

function collectImages(series, subsetDocs) {
  const images = []
  ;(Array.isArray(series.freeImages) ? series.freeImages : []).forEach(img => {
    if (imageUrl(img)) images.push(img)
  })
  subsetDocs.forEach(doc => {
    ;(doc.items || []).forEach(item => {
      ;(item.images || []).forEach(img => {
        if (imageUrl(img)) images.push(img)
      })
    })
  })
  const seen = new Set()
  return images.filter(img => {
    const url = imageUrl(img)
    if (!url || seen.has(url)) return false
    seen.add(url)
    return true
  })
}

function buildYearDocs(seriesId, images, now) {
  const groups = new Map()
  images.forEach(img => {
    const key = yearKey(img)
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(img)
  })
  return [...groups.entries()]
    .sort((a, b) => yearSortValue(a[0]) - yearSortValue(b[0]) || String(a[0]).localeCompare(String(b[0])))
    .map(([year, yearImages], index) => ({
      seriesId,
      subset: year,
      order: index,
      createTime: now,
      updateTime: now,
      items: [{
        itemId: `item_${Date.now().toString(36)}_${index}_${Math.random().toString(36).slice(2, 8)}`,
        text: '',
        subset: year,
        creatorOpenid: CREATOR_OPENID,
        images: yearImages,
        cardId: null,
        collected: false,
        completionTarget: yearImages.length
      }]
    }))
}

function buildStats(subsetDocs) {
  const items = subsetDocs.flatMap(doc => doc.items || [])
  const stats = progressData.buildChecklistProgressStats(items)
  return {
    totalCards: stats.totalCards,
    listCollectedCount: stats.listCollectedCount,
    listTotalCount: stats.listTotalCount,
    listProgress: stats.listProgress,
    listImageCount: stats.listImageCount,
    listRecentImages: stats.listRecentImages,
    listIsFree: false
  }
}

async function main() {
  const apply = process.argv.includes('--apply')
  const env = loadEnv()
  if (!env.APP_SECRET) throw new Error(`缺少 ${ENV_PATH} 中的 APP_SECRET`)

  const accessToken = await getAccessToken(env.APP_SECRET)
  const matches = await findSeriesByName(accessToken, SERIES_NAME)
  if (matches.length !== 1) throw new Error(`图鉴匹配数量异常: ${matches.length}`)

  const series = matches[0]
  const existingSubsetDocs = await fetchSubsets(accessToken, series._id)
  const images = collectImages(series, existingSubsetDocs)
  const now = new Date().toISOString()
  const yearDocs = buildYearDocs(series._id, images, now)
  const stats = buildStats(yearDocs)
  const plan = {
    mode: apply ? 'apply' : 'dry-run',
    seriesId: series._id,
    name: series.name,
    before: {
      hasSubset: !!series.hasSubset,
      subsetType: series.subsetType || '',
      seriesLevel: series.seriesLevel || 1,
      freeImageCount: Array.isArray(series.freeImages) ? series.freeImages.length : 0,
      subsetDocCount: existingSubsetDocs.length
    },
    after: {
      hasSubset: true,
      subsetType: 'year',
      seriesLevel: 2,
      subsetDocCount: yearDocs.length,
      stats,
      yearGroups: yearDocs.map(doc => ({ year: doc.subset, imageCount: (doc.items[0].images || []).length }))
    }
  }

  console.log(JSON.stringify(plan, null, 2))
  if (!apply) {
    console.log('Dry-run only. Use --apply to group LeBron Logoman images by year.')
    return
  }

  for (const doc of existingSubsetDocs) {
    await deleteCloudDB(accessToken, `db.collection("my_series_subsets").doc(${quote(doc._id)}).remove()`)
  }
  for (const doc of yearDocs) {
    await addCloudDB(accessToken, `db.collection("my_series_subsets").add({data:[${JSON.stringify(doc)}]})`)
  }
  await updateCloudDB(accessToken, `db.collection("my_series").doc(${quote(series._id)}).update({
    data: ${JSON.stringify({
      hasSubset: true,
      subsetType: 'year',
      seriesLevel: 2,
      freeImages: [],
      updateTime: now,
      ...stats
    })}
  })`)

  console.log(JSON.stringify({
    ok: true,
    seriesId: series._id,
    name: SERIES_NAME,
    imageCount: images.length,
    yearGroupCount: yearDocs.length
  }, null, 2))
}

main().catch(err => {
  console.error(err.message || err)
  process.exit(1)
})
