const https = require('https')
const fs = require('fs')
const path = require('path')
const progressData = require('../miniprogram-card/utils/collectionProgress')

const APPID = 'wx13497267f3b92c0f'
const CLOUD_ENV = 'cloudbase-1g5rcsava7547769'
const ENV_PATH = path.join(__dirname, '.env')
const SERIES_NAME = '2014-15 Panini Flawless Greats Dual Memorabilia Autographs'
const REMOVE_SUBSETS = new Set(['Ruby', 'Gold', 'Emerald'])
const REMOVE_TEXT = 'GDM-RH Robert Horry'

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
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) return httpGet(res.headers.location).then(resolve).catch(reject)
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

async function queryCloudDB(accessToken, query) {
  return callCloudApi(accessToken, 'databasequery', { query })
}

async function updateCloudDB(accessToken, query) {
  return callCloudApi(accessToken, 'databaseupdate', { query })
}

async function findSeries(accessToken) {
  const result = await queryCloudDB(accessToken, `db.collection("my_series").where({name:${quote(SERIES_NAME)}}).limit(2).get()`)
  return result.data.map(item => JSON.parse(item))
}

async function fetchSubsetDocs(accessToken, seriesId) {
  const docs = []
  for (let skip = 0; ; skip += 100) {
    const result = await queryCloudDB(accessToken, `db.collection("my_series_subsets").where({seriesId:${quote(seriesId)}}).skip(${skip}).limit(100).get()`)
    const page = result.data.map(item => JSON.parse(item))
    docs.push(...page)
    if (page.length < 100) break
  }
  return docs
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

function summarize(subsetDocs) {
  const items = subsetDocs.flatMap(doc => doc.items || [])
  return {
    itemCount: items.length,
    totalCards: progressData.buildChecklistProgressStats(items).totalCards,
    subsets: subsetDocs
      .slice()
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .map(doc => ({
        name: doc.subset,
        itemCount: (doc.items || []).length,
        hasRobertHorry: (doc.items || []).some(item => item.text === REMOVE_TEXT)
      }))
  }
}

async function main() {
  const apply = process.argv.includes('--apply')
  const env = loadEnv()
  const appSecret = env.APP_SECRET || process.env.APP_SECRET
  if (!appSecret) throw new Error(`缺少 ${ENV_PATH} 中的 APP_SECRET`)

  const accessToken = await getAccessToken(appSecret)
  const matches = await findSeries(accessToken)
  if (matches.length !== 1) throw new Error(`图鉴匹配数量异常: ${matches.length}`)

  const series = matches[0]
  const subsetDocs = await fetchSubsetDocs(accessToken, series._id)
  const nextDocs = subsetDocs.map(doc => {
    if (!REMOVE_SUBSETS.has(doc.subset)) return doc
    return {
      ...doc,
      items: (doc.items || []).filter(item => item.text !== REMOVE_TEXT)
    }
  })

  const plan = {
    mode: apply ? 'apply' : 'dry-run',
    seriesId: series._id,
    before: summarize(subsetDocs),
    after: summarize(nextDocs)
  }
  console.log(JSON.stringify(plan, null, 2))

  if (!apply) return

  const now = new Date().toISOString()
  for (const doc of nextDocs) {
    const old = subsetDocs.find(item => item._id === doc._id)
    if (!old || JSON.stringify(old.items || []) === JSON.stringify(doc.items || [])) continue
    await updateCloudDB(accessToken, `db.collection("my_series_subsets").doc(${quote(doc._id)}).update({data:${JSON.stringify({ items: doc.items || [], updateTime: now })}})`)
  }

  const stats = buildStats(nextDocs)
  await updateCloudDB(accessToken, `db.collection("my_series").doc(${quote(series._id)}).update({data:${JSON.stringify({ ...stats, totalCards: stats.totalCards, updateTime: now })}})`)
  console.log(JSON.stringify({ fixed: true, seriesId: series._id, after: summarize(nextDocs) }, null, 2))
}

main().catch(err => {
  console.error(err.message || err)
  process.exit(1)
})
