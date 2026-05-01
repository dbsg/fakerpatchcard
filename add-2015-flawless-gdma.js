const https = require('https')
const fs = require('fs')
const path = require('path')
const progressData = require('../miniprogram-card/utils/collectionProgress')

const APPID = 'wx13497267f3b92c0f'
const CLOUD_ENV = 'cloudbase-1g5rcsava7547769'
const ENV_PATH = path.join(__dirname, '.env')

const SERIES_NAME = '2015-16 Panini Flawless Greats Dual Memorabilia Autographs'
const DESCRIPTION = "2015-16 Panini Flawless 高端名宿双物料签字系列，国内常被称为“腰子”。卡面为 on-card auto + dual memorabilia 设计，收录 Kobe Bryant、Stephen Curry、Kevin Durant、Magic Johnson、Larry Bird 等球星与名宿，并包含 Base、Ruby、Sapphire、Emerald、Platinum 多个平行版本。"
const CREATOR_OPENID = 'oaQG05Ax1I_QRhOkD4lwqOXEucV8'

const CARDS = [
  { no: 1, player: 'Kobe Bryant', team: 'Los Angeles Lakers', runs: { Base: 25, Ruby: 15, Sapphire: 10, Emerald: 5, Platinum: 1 } },
  { no: 3, player: 'Stephen Curry', team: 'Golden State Warriors', runs: { Base: 25, Ruby: 15, Sapphire: 10, Emerald: 5, Platinum: 1 } },
  { no: 4, player: 'Kevin Durant', team: 'Oklahoma City Thunder', runs: { Base: 25, Ruby: 15, Sapphire: 10, Emerald: 5, Platinum: 1 } },
  { no: 5, player: 'Pau Gasol', team: 'Chicago Bulls', runs: { Base: 25, Ruby: 15, Sapphire: 10, Emerald: 5, Platinum: 1 } },
  { no: 6, player: 'David Robinson', team: 'San Antonio Spurs', runs: { Base: 25, Ruby: 15, Sapphire: 10, Emerald: 5, Platinum: 1 } },
  { no: 7, player: 'Jason Kidd', team: 'Dallas Mavericks', runs: { Base: 18, Ruby: 15, Sapphire: 10, Emerald: 5, Platinum: 1 } },
  { no: 9, player: 'Grant Hill', team: 'Detroit Pistons', runs: { Base: 25, Ruby: 15, Sapphire: 10, Emerald: 5, Platinum: 1 } },
  { no: 10, player: 'Hakeem Olajuwon', team: 'Houston Rockets', runs: { Base: 25, Ruby: 15, Sapphire: 10, Emerald: 5, Platinum: 1 } },
  { no: 11, player: 'Clyde Drexler', team: 'Portland Trail Blazers', runs: { Base: 18, Ruby: 15, Sapphire: 10, Emerald: 5, Platinum: 1 } },
  { no: 12, player: 'John Stockton', team: 'Utah Jazz', runs: { Base: 25, Ruby: 15, Sapphire: 10, Emerald: 5, Platinum: 1 } },
  { no: 13, player: 'Karl Malone', team: 'Utah Jazz', runs: { Base: 25, Ruby: 15, Sapphire: 10, Emerald: 5, Platinum: 1 } },
  { no: 14, player: 'Magic Johnson', team: 'Los Angeles Lakers', runs: { Base: 18, Ruby: 14, Sapphire: 10, Emerald: 5, Platinum: 1 } },
  { no: 15, player: 'Larry Bird', team: 'Boston Celtics', runs: { Sapphire: 8, Emerald: 5, Platinum: 1 } }
]

const SUBSETS = ['Base', 'Ruby', 'Sapphire', 'Emerald', 'Platinum']

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

function createItemId(subsetName, no) {
  return `gdma_2015_${subsetName.toLowerCase()}_${no}`
}

function buildItem(subsetName, card, printRun) {
  return {
    itemId: createItemId(subsetName, card.no),
    text: `${card.no} ${card.player} - ${card.team}`,
    subset: subsetName,
    printRun,
    completionTarget: printRun || 1,
    creatorOpenid: CREATOR_OPENID,
    images: [],
    cardId: null,
    collected: false
  }
}

function buildSubsetDocs(seriesId = '__DRY_RUN_SERIES_ID__') {
  const now = new Date().toISOString()
  return SUBSETS.map((subset, order) => ({
    seriesId,
    subset,
    order,
    items: CARDS
      .filter(card => !!card.runs[subset])
      .map(card => buildItem(subset, card, card.runs[subset])),
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
    hasSubset: true,
    subsetType: 'card',
    cardType: '',
    seriesLevel: 3,
    checklistComplete: true,
    totalCards: stats.totalCards,
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
      { value: '/1', creatorOpenid: CREATOR_OPENID },
      { value: '/5', creatorOpenid: CREATOR_OPENID },
      { value: '/8', creatorOpenid: CREATOR_OPENID },
      { value: '/10', creatorOpenid: CREATOR_OPENID },
      { value: '/14', creatorOpenid: CREATOR_OPENID },
      { value: '/15', creatorOpenid: CREATOR_OPENID },
      { value: '/18', creatorOpenid: CREATOR_OPENID },
      { value: '/25', creatorOpenid: CREATOR_OPENID }
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
    subsetCount: subsetDocs.length,
    itemCount: items.length,
    totalCards: stats.totalCards,
    subsets: subsetDocs.map(doc => ({
      name: doc.subset,
      itemCount: doc.items.length,
      totalCards: progressData.buildChecklistProgressStats(doc.items).totalCards,
      items: doc.items.map(item => `${item.text} /${item.printRun}`)
    }))
  }
}

async function main() {
  const apply = process.argv.includes('--apply')
  const env = loadEnv()
  const appSecret = env.APP_SECRET || process.env.APP_SECRET
  if (!appSecret) throw new Error(`缺少 ${ENV_PATH} 中的 APP_SECRET`)

  const accessToken = await getAccessToken(appSecret)
  const existing = await findSeriesByName(accessToken, SERIES_NAME)
  if (existing.length > 0) throw new Error(`同名图鉴已存在，停止创建: ${existing.map(item => item._id).join(', ')}`)

  const drySubsetDocs = buildSubsetDocs()
  const summary = summarize(drySubsetDocs)
  console.log(JSON.stringify({ mode: apply ? 'apply' : 'dry-run', summary }, null, 2))
  if (!apply) return

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
