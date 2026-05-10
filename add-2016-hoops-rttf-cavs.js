const https = require('https')
const fs = require('fs')
const path = require('path')
const progressData = require('../miniprogram-card/utils/collectionProgress')

const APPID = 'wx13497267f3b92c0f'
const CLOUD_ENV = 'cloudbase-1g5rcsava7547769'
const ENV_PATH = path.join(__dirname, '.env')

const SERIES_NAME = '2016-17 Panini Hoops Road To The Finals - 骑士'
const DESCRIPTION = '2016-17 Panini Hoops Road To The Finals 骑士队相关图鉴，记录 2016 年骑士夺冠之路，按季后赛轮次和冠军主题整理 Cleveland Cavaliers 相关卡种。这次总冠军结束了克利夫兰 52 年冠军荒，也是 LeBron James、Kyrie Irving、Kevin Love 率队完成 1-3 逆转的重要纪念。'
const CREATOR_OPENID = 'oaQG05Ax1I_QRhOkD4lwqOXEucV8'

const SUBSETS = [
  {
    name: 'First Round /2016',
    order: 0,
    cards: [
      [1, 'Kyrie Irving, Cleveland Cavaliers'],
      [2, 'LeBron James, Cleveland Cavaliers'],
      [3, 'Kevin Love, Cleveland Cavaliers'],
      [4, 'J.R. Smith, Cleveland Cavaliers']
    ]
  },
  {
    name: 'Second Round /999',
    order: 1,
    cards: [
      [45, 'LeBron James, Cleveland Cavaliers'],
      [46, 'J.R. Smith, Cleveland Cavaliers'],
      [47, 'Channing Frye, Cleveland Cavaliers'],
      [48, 'Kevin Love, Cleveland Cavaliers']
    ]
  },
  {
    name: 'Conference Finals /499',
    order: 2,
    cards: [
      [67, 'LeBron James, Cleveland Cavaliers'],
      [68, 'Kyrie Irving, Cleveland Cavaliers'],
      [71, 'Kevin Love, Cleveland Cavaliers'],
      [72, 'LeBron James, Cleveland Cavaliers']
    ]
  },
  {
    name: 'NBA Championship /199',
    order: 3,
    cards: [
      [82, 'LeBron James, Cleveland Cavaliers'],
      [84, 'Kyrie Irving, Cleveland Cavaliers'],
      [85, 'LeBron James, Cleveland Cavaliers'],
      [86, 'LeBron James, Cleveland Cavaliers']
    ]
  },
  {
    name: 'Champions Trophy Portraits',
    order: 4,
    cards: [
      ['CTP-LJ', 'LeBron James']
    ]
  },
  {
    name: 'Champions',
    order: 5,
    cards: [
      ['CH-CLE', 'Cleveland Cavaliers']
    ]
  },
  {
    name: 'Finals MVP',
    order: 6,
    cards: [
      ['FMVP-CLE', 'Cleveland Cavaliers']
    ]
  }
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

function quote(value) {
  return JSON.stringify(value)
}

async function getAccessToken(appSecret) {
  const result = JSON.parse((await httpGet(`https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${APPID}&secret=${appSecret}`)).toString('utf8'))
  if (result.errcode) throw new Error(`获取 access_token 失败: ${result.errmsg} (${result.errcode})`)
  return result.access_token
}

async function callCloudApi(accessToken, apiName, body) {
  const result = await httpPost(`https://api.weixin.qq.com/tcb/${apiName}?access_token=${accessToken}`, { env: CLOUD_ENV, ...body })
  if (result.errcode) throw new Error(`${apiName} 失败: ${result.errmsg} (${result.errcode})`)
  return result
}

function queryCloudDB(accessToken, query) {
  return callCloudApi(accessToken, 'databasequery', { query })
}

function addCloudDB(accessToken, query) {
  return callCloudApi(accessToken, 'databaseadd', { query })
}

function updateCloudDB(accessToken, query) {
  return callCloudApi(accessToken, 'databaseupdate', { query })
}

async function findSeriesByName(accessToken, name) {
  const result = await queryCloudDB(accessToken, `db.collection("my_series").where({name:${quote(name)}}).limit(2).get()`)
  return result.data.map(item => JSON.parse(item))
}

async function findSubsetDocs(accessToken, seriesId) {
  const result = await queryCloudDB(accessToken, `db.collection("my_series_subsets").where({seriesId:${quote(seriesId)}}).limit(100).get()`)
  return result.data.map(item => JSON.parse(item))
}

function createItemId(subsetName, cardNo) {
  return `hoops_rttf_cavs_2016_${subsetName}_${cardNo}`.toLowerCase().replace(/[^a-z0-9]+/g, '_')
}

function buildItem(subset, card) {
  const [cardNo, cardKind] = card
  return {
    itemId: createItemId(subset.name, cardNo),
    text: `${cardNo} ${cardKind}`,
    subset: subset.name,
    number: String(cardNo),
    cardKind,
    completionTarget: 1,
    creatorOpenid: CREATOR_OPENID,
    images: [],
    cardId: null,
    collected: false
  }
}

function buildSubsetDocs(seriesId = '__DRY_RUN_SERIES_ID__') {
  const now = new Date().toISOString()
  return SUBSETS.map(subset => ({
    seriesId,
    subset: subset.name,
    order: subset.order,
    items: subset.cards.map(card => buildItem(subset, card)),
    createTime: now,
    updateTime: now
  }))
}

function buildSeriesDoc(subsetDocs) {
  const items = subsetDocs.flatMap(doc => doc.items)
  const stats = progressData.buildChecklistProgressStats(items)
  const now = new Date().toISOString()
  return {
    name: SERIES_NAME,
    description: DESCRIPTION,
    accessType: 'public',
    structureType: 'groupedChecklist',
    displayMode: 'fixedCardSlots',
    hasSubset: true,
    subsetType: 'card',
    cardType: 'card',
    seriesLevel: 3,
    checklistComplete: true,
    defaultInfoEnabled: true,
    defaultYear: '2016-17',
    defaultBrand: 'Panini',
    defaultCardSeries: 'Hoops Road To The Finals',
    totalCards: stats.totalCards,
    listCollectedCount: stats.listCollectedCount,
    listTotalCount: stats.listTotalCount,
    listProgress: stats.listProgress,
    listImageCount: stats.listImageCount,
    listRecentImages: stats.listRecentImages,
    listIsFree: false,
    freeImages: [],
    checklist: [],
    presetCardKinds: items.map(item => ({ value: item.cardKind, creatorOpenid: CREATOR_OPENID })),
    presetNumbers: [],
    creatorOpenid: CREATOR_OPENID,
    createTime: now,
    updateTime: now
  }
}

function mergeItems(expectedItems, existingItems = []) {
  const byItemId = new Map(existingItems.filter(item => item.itemId).map(item => [item.itemId, item]))
  const byText = new Map(existingItems.filter(item => item.text).map(item => [item.text, item]))
  return expectedItems.map(expected => {
    const existing = byItemId.get(expected.itemId) || byText.get(expected.text) || {}
    return {
      ...existing,
      ...expected,
      creatorOpenid: existing.creatorOpenid || expected.creatorOpenid,
      images: Array.isArray(existing.images) ? existing.images : []
    }
  })
}

async function syncExistingSeries(accessToken, seriesId) {
  const now = new Date().toISOString()
  const expectedSubsetDocs = buildSubsetDocs(seriesId)
  const existingSubsetDocs = await findSubsetDocs(accessToken, seriesId)
  const existingBySubset = new Map(existingSubsetDocs.map(doc => [doc.subset || '', doc]))
  const syncedDocs = []

  for (const expected of expectedSubsetDocs) {
    const existing = existingBySubset.get(expected.subset)
    const items = mergeItems(expected.items, existing && existing.items)
    const data = {
      seriesId,
      subset: expected.subset,
      order: expected.order,
      items,
      updateTime: now
    }
    if (existing && existing._id) {
      await updateCloudDB(accessToken, `db.collection("my_series_subsets").doc(${quote(existing._id)}).update({data:${JSON.stringify(data)}})`)
      syncedDocs.push({ ...existing, ...data })
    } else {
      await addCloudDB(accessToken, `db.collection("my_series_subsets").add({data:[${JSON.stringify({ ...data, createTime: now })}]})`)
      syncedDocs.push({ ...data, createTime: now })
    }
  }

  const items = syncedDocs.flatMap(doc => doc.items || [])
  const stats = progressData.buildChecklistProgressStats(items)
  await updateCloudDB(accessToken, `db.collection("my_series").doc(${quote(seriesId)}).update({data:${JSON.stringify({
    description: DESCRIPTION,
    accessType: 'public',
    structureType: 'groupedChecklist',
    displayMode: 'fixedCardSlots',
    hasSubset: true,
    subsetType: 'card',
    cardType: 'card',
    seriesLevel: 3,
    checklistComplete: true,
    defaultInfoEnabled: true,
    defaultYear: '2016-17',
    defaultBrand: 'Panini',
    defaultCardSeries: 'Hoops Road To The Finals',
    totalCards: stats.totalCards,
    listCollectedCount: stats.listCollectedCount,
    listTotalCount: stats.listTotalCount,
    listProgress: stats.listProgress,
    listImageCount: stats.listImageCount,
    listRecentImages: stats.listRecentImages,
    listIsFree: false,
    presetCardKinds: items.map(item => ({ value: item.cardKind, creatorOpenid: CREATOR_OPENID })),
    presetNumbers: [],
    updateTime: now
  })}})`)
  return summarize(syncedDocs)
}

function summarize(subsetDocs) {
  const items = subsetDocs.flatMap(doc => doc.items)
  const stats = progressData.buildChecklistProgressStats(items)
  return {
    seriesName: SERIES_NAME,
    subsetCount: subsetDocs.length,
    itemCount: items.length,
    totalCards: stats.totalCards,
    subsets: subsetDocs.map(doc => ({
      name: doc.subset,
      itemCount: doc.items.length,
      first: doc.items[0] && doc.items[0].text,
      last: doc.items[doc.items.length - 1] && doc.items[doc.items.length - 1].text
    }))
  }
}

async function main() {
  const apply = process.argv.includes('--apply')
  const drySubsetDocs = buildSubsetDocs()
  const summary = summarize(drySubsetDocs)
  console.log(JSON.stringify({ mode: apply ? 'apply' : 'dry-run', summary }, null, 2))
  if (!apply) return

  const env = loadEnv()
  const appSecret = env.APP_SECRET || process.env.APP_SECRET
  if (!appSecret) throw new Error(`缺少 ${ENV_PATH} 中的 APP_SECRET`)

  const accessToken = await getAccessToken(appSecret)
  const existing = await findSeriesByName(accessToken, SERIES_NAME)
  if (existing.length > 0) {
    if (existing.length > 1) throw new Error(`存在多个同名图鉴，停止同步: ${existing.map(item => item._id).join(', ')}`)
    const syncedSummary = await syncExistingSeries(accessToken, existing[0]._id)
    console.log(JSON.stringify({ synced: true, seriesId: existing[0]._id, summary: syncedSummary }, null, 2))
    return
  }

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

if (require.main === module) {
  main().catch(err => {
    console.error(err.message || err)
    process.exit(1)
  })
}

module.exports = {
  SUBSETS,
  buildSubsetDocs,
  buildSeriesDoc,
  mergeItems,
  summarize
}
