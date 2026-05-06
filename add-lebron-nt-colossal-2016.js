const https = require('https')
const fs = require('fs')
const path = require('path')
const progressData = require('../miniprogram-card/utils/collectionProgress')

const APPID = 'wx13497267f3b92c0f'
const CLOUD_ENV = 'cloudbase-1g5rcsava7547769'
const ENV_PATH = path.join(__dirname, '.env')

const SERIES_NAME = '勒布朗 2016-17 Panini National Treasures Colossal Materials'
const DESCRIPTION = '2016-17 Panini National Treasures Colossal Materials 勒布朗骑士大球衣图鉴，围绕 Base、Prime、Super Prime 三个低编版本展开，以大幅实物球衣窗口和 National Treasures 高端配置为核心，是勒布朗骑士时期材质卡收藏中辨识度很高的一支。'
const SUBSET_NAME = 'Colossal Materials'
const CREATOR_OPENID = 'oaQG05Ax1I_QRhOkD4lwqOXEucV8'

const CARDS = [
  { name: 'Base', printRun: 30 },
  { name: 'Prime', printRun: 25 },
  { name: 'Super Prime', printRun: 3 }
]

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

async function addCloudDB(accessToken, query) {
  return callCloudApi(accessToken, 'databaseadd', { query })
}

async function findSeriesByName(accessToken, name) {
  const result = await queryCloudDB(accessToken, `db.collection("my_series").where({name:${quote(name)}}).limit(2).get()`)
  return result.data.map(item => JSON.parse(item))
}

function createItemId(name) {
  return `lebron_nt_colossal_2016_${name.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`
}

function buildItem(card) {
  return {
    itemId: createItemId(card.name),
    text: card.name,
    subset: SUBSET_NAME,
    printRun: card.printRun,
    completionTarget: card.printRun,
    creatorOpenid: CREATOR_OPENID,
    images: [],
    cardId: null,
    collected: false
  }
}

function buildSubsetDocs(seriesId = '__DRY_RUN_SERIES_ID__') {
  const now = new Date().toISOString()
  return [{
    seriesId,
    subset: SUBSET_NAME,
    order: 0,
    items: CARDS.map(buildItem),
    createTime: now,
    updateTime: now
  }]
}

function buildSeriesDoc(subsetDocs) {
  const items = subsetDocs.flatMap(doc => doc.items)
  const stats = progressData.buildChecklistProgressStats(items)
  const now = new Date().toISOString()
  return {
    name: SERIES_NAME,
    description: DESCRIPTION,
    hasSubset: true,
    subsetType: 'card',
    cardType: '',
    seriesLevel: 3,
    checklistComplete: true,
    totalCards: stats.totalCards,
    withImages: stats.withImages,
    missing: stats.missing,
    listCollectedCount: stats.listCollectedCount,
    listTotalCount: stats.listTotalCount,
    listProgress: stats.listProgress,
    listImageCount: stats.listImageCount,
    listRecentImages: stats.listRecentImages,
    listIsFree: false,
    freeImages: [],
    checklist: [],
    presetCardKinds: [],
    presetNumbers: [
      { value: '/3', creatorOpenid: CREATOR_OPENID },
      { value: '/25', creatorOpenid: CREATOR_OPENID },
      { value: '/30', creatorOpenid: CREATOR_OPENID }
    ],
    creatorOpenid: CREATOR_OPENID,
    createTime: now,
    updateTime: now
  }
}

function summarize(subsetDocs) {
  const items = subsetDocs.flatMap(doc => doc.items)
  const stats = progressData.buildChecklistProgressStats(items)
  return {
    seriesName: SERIES_NAME,
    description: DESCRIPTION,
    subsetCount: subsetDocs.length,
    itemCount: items.length,
    totalCards: stats.totalCards,
    collected: stats.withImages,
    missing: stats.missing,
    subsets: subsetDocs.map(doc => ({
      name: doc.subset,
      itemCount: doc.items.length,
      totalCards: progressData.buildChecklistProgressStats(doc.items).totalCards,
      items: doc.items.map(item => ({
        text: `${item.text} /${item.printRun}`,
        printRun: item.printRun,
        completionTarget: item.completionTarget
      }))
    }))
  }
}

async function main() {
  const apply = process.argv.includes('--apply')
  const drySubsetDocs = buildSubsetDocs()
  const summary = summarize(drySubsetDocs)

  if (!apply) {
    console.log(JSON.stringify({ mode: 'dry-run', summary }, null, 2))
    console.log('Dry-run only. Use --apply to create cloud data.')
    return
  }

  const env = loadEnv()
  const appSecret = env.APP_SECRET || process.env.APP_SECRET
  if (!appSecret) throw new Error(`缺少 ${ENV_PATH} 中的 APP_SECRET`)

  const accessToken = await getAccessToken(appSecret)
  const existing = await findSeriesByName(accessToken, SERIES_NAME)
  if (existing.length > 0) throw new Error(`同名图鉴已存在，停止创建: ${existing.map(item => item._id).join(', ')}`)

  console.log(JSON.stringify({ mode: 'apply', summary }, null, 2))

  const seriesDoc = buildSeriesDoc(drySubsetDocs)
  const addSeriesResult = await addCloudDB(accessToken, `db.collection("my_series").add({data:[${JSON.stringify(seriesDoc)}]})`)
  const seriesId = addSeriesResult.id_list && addSeriesResult.id_list[0]
  if (!seriesId) throw new Error(`创建图鉴失败: ${JSON.stringify(addSeriesResult)}`)

  const subsetDocs = buildSubsetDocs(seriesId)
  for (const doc of subsetDocs) {
    await addCloudDB(accessToken, `db.collection("my_series_subsets").add({data:[${JSON.stringify(doc)}]})`)
  }

  console.log(JSON.stringify({ created: true, seriesId, summary: summarize(subsetDocs) }, null, 2))
}

main().catch(err => {
  console.error(err.message || err)
  process.exit(1)
})
