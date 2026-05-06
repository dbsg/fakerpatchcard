const https = require('https')
const fs = require('fs')
const path = require('path')
const progressData = require('../miniprogram-card/utils/collectionProgress')

const APPID = 'wx13497267f3b92c0f'
const CLOUD_ENV = 'cloudbase-1g5rcsava7547769'
const ENV_PATH = path.join(__dirname, '.env')

const SERIES_NAME = '2012-13 Panini Flawless Greats Dual Patches Autographs'
const DESCRIPTION = '2012-13 Panini Flawless Greats Dual Patches Autographs 高端名宿双 Patch 签字系列，包含 Base、Ruby、Gold、Emerald、Platinum 1/1 多个平行版本，收录 Kobe Bryant、Kareem Abdul-Jabbar、Julius Erving、Larry Bird、Shaquille O’Neal 等球星与名宿。'
const CREATOR_OPENID = 'oaQG05Ax1I_QRhOkD4lwqOXEucV8'

const RAW_SUBSETS = [
  {
    name: 'Base',
    order: 0,
    raw: `
1 Kobe Bryant - Los Angeles Lakers #/25
2 Kareem Abdul-Jabbar - Los Angeles Lakers #/25
3 Julius Erving - Philadelphia 76ers #/25
4 Grant Hill - Detroit Pistons #/20
5 David Robinson - San Antonio Spurs #/25
6 Shaquille O'Neal - Los Angeles Lakers #/20
8 Danny Manning - Los Angeles Clippers #/25
9 Scottie Pippen - Chicago Bulls #/20
10 Grant Hill - Los Angeles Clippers #/20
11 John Stockton - Utah Jazz #/25
13 Artis Gilmore - San Antonio Spurs #/20
14 Clyde Drexler - Houston Rockets #/20
15 Larry Bird - Boston Celtics #/20
16 Mitch Richmond - Sacramento Kings #/20
17 Anfernee Hardaway - Orlando Magic #/25
18 Ralph Sampson - Houston Rockets #/20
19 Robert Parish - Boston Celtics #/20
20 Larry Johnson - Charlotte Hornets #/25
21 World B. Free - Golden State Warriors #/20
22 Calvin Murphy - Houston Rockets #/20
23 Bill Laimbeer - Detroit Pistons #/20
24 Paul Westphal - New York Knicks #/25
25 Vince Carter - Dallas Mavericks #/15
`
  },
  {
    name: 'Ruby',
    order: 1,
    raw: `
1 Kobe Bryant - Los Angeles Lakers #/15
2 Kareem Abdul-Jabbar - Los Angeles Lakers #/15
3 Julius Erving - Philadelphia 76ers #/15
4 Grant Hill - Detroit Pistons #/15
5 David Robinson - San Antonio Spurs #/15
6 Shaquille O'Neal - Los Angeles Lakers #/15
8 Danny Manning - Los Angeles Clippers #/15
9 Scottie Pippen - Chicago Bulls #/15
10 Grant Hill - Los Angeles Clippers #/15
11 John Stockton - Utah Jazz #/15
13 Artis Gilmore - San Antonio Spurs #/15
14 Clyde Drexler - Houston Rockets #/15
15 Larry Bird - Boston Celtics #/10
16 Mitch Richmond - Sacramento Kings #/15
17 Anfernee Hardaway - Orlando Magic #/15
18 Ralph Sampson - Houston Rockets #/15
19 Robert Parish - Boston Celtics #/15
20 Larry Johnson - Charlotte Hornets #/15
21 World B. Free - Golden State Warriors #/15
22 Calvin Murphy - Houston Rockets #/15
23 Bill Laimbeer - Detroit Pistons #/15
24 Paul Westphal - New York Knicks #/15
25 Vince Carter - Dallas Mavericks #/12
`
  },
  {
    name: 'Gold',
    order: 2,
    raw: `
1 Kobe Bryant - Los Angeles Lakers #/10
2 Kareem Abdul-Jabbar - Los Angeles Lakers #/10
3 Julius Erving - Philadelphia 76ers #/10
4 Grant Hill - Detroit Pistons #/10
5 David Robinson - San Antonio Spurs #/10
6 Shaquille O'Neal - Los Angeles Lakers #/10
7 Tom Chambers - Utah Jazz #/5
8 Danny Manning - Los Angeles Clippers #/10
9 Scottie Pippen - Chicago Bulls #/10
10 Grant Hill - Los Angeles Clippers #/10
11 John Stockton - Utah Jazz #/10
13 Artis Gilmore - San Antonio Spurs #/10
14 Clyde Drexler - Houston Rockets #/10
15 Larry Bird - Boston Celtics #/5
16 Mitch Richmond - Sacramento Kings #/10
17 Anfernee Hardaway - Orlando Magic #/10
18 Ralph Sampson - Houston Rockets #/10
19 Robert Parish - Boston Celtics #/10
20 Larry Johnson - Charlotte Hornets #/10
21 World B. Free - Golden State Warriors #/10
22 Calvin Murphy - Houston Rockets #/10
23 Bill Laimbeer - Detroit Pistons #/10
24 Paul Westphal - New York Knicks #/10
25 Vince Carter - Dallas Mavericks #/10
`
  },
  {
    name: 'Emerald',
    order: 3,
    raw: `
1 Kobe Bryant - Los Angeles Lakers #/5
2 Kareem Abdul-Jabbar - Los Angeles Lakers #/3
3 Julius Erving - Philadelphia 76ers #/5
4 Grant Hill - Detroit Pistons #/5
5 David Robinson - San Antonio Spurs #/5
6 Shaquille O'Neal - Los Angeles Lakers #/5
7 Tom Chambers - Utah Jazz #/3
8 Danny Manning - Los Angeles Clippers #/5
9 Scottie Pippen - Chicago Bulls #/4
10 Grant Hill - Los Angeles Clippers #/5
11 John Stockton - Utah Jazz #/5
13 Artis Gilmore - San Antonio Spurs #/5
14 Clyde Drexler - Houston Rockets #/5
15 Larry Bird - Boston Celtics #/3
16 Mitch Richmond - Sacramento Kings #/5
17 Anfernee Hardaway - Orlando Magic #/5
18 Ralph Sampson - Houston Rockets #/5
19 Robert Parish - Boston Celtics #/5
20 Larry Johnson - Charlotte Hornets #/5
21 World B. Free - Golden State Warriors #/5
22 Calvin Murphy - Houston Rockets #/5
23 Bill Laimbeer - Detroit Pistons #/5
24 Paul Westphal - New York Knicks #/5
25 Vince Carter - Dallas Mavericks #/5
`
  },
  {
    name: 'Platinum',
    order: 4,
    defaultPrintRun: 1,
    raw: `
1 Kobe Bryant - Los Angeles Lakers
2 Kareem Abdul-Jabbar - Los Angeles Lakers
3 Julius Erving - Philadelphia 76ers
4 Grant Hill - Detroit Pistons
5 David Robinson - San Antonio Spurs
6 Shaquille O'Neal - Los Angeles Lakers
7 Tom Chambers - Utah Jazz
8 Danny Manning - Los Angeles Clippers
9 Scottie Pippen - Chicago Bulls
10 Grant Hill - Los Angeles Clippers
11 John Stockton - Utah Jazz
13 Artis Gilmore - San Antonio Spurs
14 Clyde Drexler - Houston Rockets
15 Larry Bird - Boston Celtics
16 Mitch Richmond - Sacramento Kings
17 Anfernee Hardaway - Orlando Magic
18 Ralph Sampson - Houston Rockets
19 Robert Parish - Boston Celtics
20 Larry Johnson - Charlotte Hornets
21 World B. Free - Golden State Warriors
22 Calvin Murphy - Houston Rockets
23 Bill Laimbeer - Detroit Pistons
24 Paul Westphal - New York Knicks
25 Vince Carter - Dallas Mavericks
`
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

function parseRawCards(config) {
  return config.raw.split('\n').map(line => line.trim()).filter(Boolean).map(line => {
    const match = line.match(/^(\d+)\s+(.+?)\s+[-–—]\s+(.+?)(?:\s+#\/(\d+))?$/)
    if (!match) throw new Error(`无法解析 ${config.name}: ${line}`)
    const printRun = match[4] ? Number(match[4]) : Number(config.defaultPrintRun || 0)
    if (!Number.isInteger(printRun) || printRun <= 0) throw new Error(`缺少限编 ${config.name}: ${line}`)
    return {
      no: Number(match[1]),
      player: match[2].trim(),
      team: match[3].trim(),
      printRun
    }
  })
}

function createItemId(subsetName, no) {
  return `flawless_gdpa_2012_${subsetName.toLowerCase()}_${no}`
}

function buildItem(subsetName, card) {
  return {
    itemId: createItemId(subsetName, card.no),
    text: `${card.no} ${card.player} - ${card.team}`,
    subset: subsetName,
    cardKind: 'Greats Dual Patches Autographs',
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
  return RAW_SUBSETS.map(config => ({
    seriesId,
    subset: config.name,
    order: config.order,
    items: parseRawCards(config).map(card => buildItem(config.name, card)),
    createTime: now,
    updateTime: now
  }))
}

function buildPresetNumbers(items) {
  return [...new Set(items.map(item => item.printRun).filter(Boolean))]
    .sort((a, b) => a - b)
    .map(num => ({ value: `/${num}`, creatorOpenid: CREATOR_OPENID }))
}

function buildSeriesDoc(subsetDocs) {
  const items = subsetDocs.flatMap(doc => doc.items)
  const stats = progressData.buildChecklistProgressStats(items)
  const now = new Date().toISOString()
  return {
    name: SERIES_NAME,
    description: DESCRIPTION,
    accessType: 'public',
    hasSubset: true,
    subsetType: 'card',
    cardType: 'card',
    seriesLevel: 3,
    checklistComplete: true,
    defaultInfoEnabled: true,
    defaultYear: '2012-13',
    defaultBrand: 'Panini',
    defaultCardSeries: 'Flawless',
    totalCards: stats.totalCards,
    listCollectedCount: stats.listCollectedCount,
    listTotalCount: stats.listTotalCount,
    listProgress: stats.listProgress,
    listImageCount: stats.listImageCount,
    listRecentImages: stats.listRecentImages,
    listIsFree: false,
    freeImages: [],
    checklist: [],
    presetCardKinds: [{ value: 'Greats Dual Patches Autographs', creatorOpenid: CREATOR_OPENID }],
    presetNumbers: buildPresetNumbers(items),
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
      first: `${doc.items[0].text} #/${doc.items[0].printRun}`,
      last: `${doc.items[doc.items.length - 1].text} #/${doc.items[doc.items.length - 1].printRun}`
    })),
    presetNumbers: buildPresetNumbers(items).map(item => item.value)
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
