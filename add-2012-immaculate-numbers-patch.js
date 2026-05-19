const https = require('https')
const fs = require('fs')
const path = require('path')
const progressData = require('../miniprogram-card/utils/collectionProgress')
const playerRoster = require('../miniprogram-card/utils/playerRoster')

const APPID = 'wx13497267f3b92c0f'
const CLOUD_ENV = 'cloudbase-1g5rcsava7547769'
const ENV_PATH = path.join(__dirname, '.env')

const SERIES_NAME = '2012-13 Panini Immaculate Numbers Patch'
const SUBSET_NAME = 'Numbers Patch'
const CREATOR_OPENID = 'oaQG05Ax1I_QRhOkD4lwqOXEucV8'
const DESCRIPTION = '2012-13 Panini Immaculate Numbers Patch 球衣号码 Patch 图鉴，限编数量对应球员号码，包含 Kobe Bryant /24、LeBron James /6、Kevin Durant /35、Russell Westbrook /100、Dwyane Wade /3、Yao Ming /11 等球星和名宿。'

const CARD_LINES = `
1 Al Horford #/ 15
2 Louis Williams #/ 3
3 Dominique Wilkins #/ 21
4 Paul Pierce #/ 34
5 Kevin Garnett #/ 5
6 Rajon Rondo #/ 9
7 Larry Bird #/ 33
8 Reggie Lewis #/ 35
9 Deron Williams #/ 8
10 Joe Johnson #/ 7
11 Gerald Henderson #/ 9
12 Ben Gordon #/ 8
13 Ramon Sessions #/ 7
14 Derrick Rose #/ 1
15 Joakim Noah #/ 13
16 Scottie Pippen #/ 33
17 Dennis Rodman #/ 91
18 Anderson Varejao #/ 17
19 Wayne Ellington #/ 21
20 Dirk Nowitzki #/ 41
21 Vince Carter #/ 25
22 O.J. Mayo #/ 32
23 Shawn Marion #/ 30
24 Andre Iguodala #/ 9
25 Ty Lawson #/ 3
26 Alex English #/ 2
27 Greg Monroe #/ 10
28 Isiah Thomas #/ 11
29 Joe Dumars #/ 4
30 Stephen Curry #/ 30
31 David Lee #/ 10
32 Chris Mullin #/ 17
33 Tim Hardaway #/ 5
34 James Harden #/ 13
35 Jeremy Lin #/ 7
36 Hakeem Olajuwon #/ 34
37 Yao Ming #/ 11
38 David West #/ 21
39 Paul George #/ 24
40 Tyler Hansbrough #/ 50
41 Chris Paul #/ 3
42 Blake Griffin #/ 32
43 Grant Hill #/ 33
44 Kobe Bryant #/ 24
45 Steve Nash #/ 10
46 Dwight Howard #/ 12
47 George Mikan #/ 9
48 Wilt Chamberlain #/ 13
49 Shaquille O'Neal #/ 34
50 Zach Randolph #/ 50
51 Marc Gasol #/ 33
52 Mike Conley #/ 11
53 LeBron James #/ 6
54 Dwyane Wade #/ 3
55 Chris Bosh #/ 1
56 Chris Andersen #/ 11
57 Brandon Jennings #/ 3
58 Monta Ellis #/ 11
59 Eric Gordon #/ 10
60 Ryan Anderson #/ 33
61 Greivis Vasquez #/ 21
62 Kevin Love #/ 42
63 Andrei Kirilenko #/ 47
64 Ricky Rubio #/ 9
65 Carmelo Anthony #/ 7
66 Jason Kidd #/ 5
67 Tyson Chandler #/ 6
68 Amar'e Stoudemire #/ 1
69 Kevin Martin #/ 23
70 Kevin Durant #/ 35
71 Russell Westbrook #/ 100
72 Serge Ibaka #/ 9
73 Arron Afflalo #/ 4
74 Jameer Nelson #/ 14
75 Jrue Holiday #/ 11
76 Evan Turner #/ 12
77 Julius Erving #/ 6
78 Moses Malone #/ 2
79 Allen Iverson #/ 3
80 Anfernee Hardaway #/ 1
81 Goran Dragic #/ 1
82 Luis Scola #/ 14
83 Kevin Johnson #/ 7
84 LaMarcus Aldridge #/ 12
85 J.J. Hickson #/ 21
86 DeMarcus Cousins #/ 15
87 Tyreke Evans #/ 13
88 Tim Duncan #/ 21
89 Tony Parker #/ 9
90 Manu Ginobili #/ 20
91 David Robinson #/ 50
92 Sean Elliott #/ 32
93 Rudy Gay #/ 22
94 DeMar DeRozan #/ 10
95 Al Jefferson #/ 25
96 Pete Maravich #/ 44
97 John Stockton #/ 12
98 John Wall #/ 2
99 Martell Webster #/ 9
100 Nene #/ 42
`

const PLAYER_CN_FALLBACK = {
  'Reggie Lewis': '雷吉·刘易斯',
  'Sean Elliott': '肖恩·埃利奥特'
}

const PLAYER_ROSTER = [
  ...require('../scripts/data/nba-players-roster.json'),
  ...require('../scripts/data/nba-players-extra.json')
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

function parseCards() {
  return CARD_LINES.split('\n').map(line => line.trim()).filter(Boolean).map(line => {
    const match = line.match(/^(\d+)\s+(.+?)\s+#\/\s*(\d+)$/)
    if (!match) throw new Error(`无法解析 Numbers Patch: ${line}`)
    const no = Number(match[1])
    const printRun = Number(match[3])
    if (!Number.isInteger(no) || no <= 0) throw new Error(`无效编号: ${line}`)
    if (!Number.isInteger(printRun) || printRun <= 0) throw new Error(`无效限编: ${line}`)
    return {
      no,
      player: match[2].trim(),
      printRun
    }
  })
}

function getPlayerCN(player) {
  const meta = playerRoster.findPlayerMeta(PLAYER_ROSTER, player)
  return (meta && meta.zhName) || PLAYER_CN_FALLBACK[player] || ''
}

function createItemId(card) {
  return `immaculate_numbers_patch_2012_${String(card.no).padStart(3, '0')}`
}

function buildItem(card) {
  return {
    itemId: createItemId(card),
    text: `${card.no} ${card.player}`,
    subset: SUBSET_NAME,
    number: String(card.no),
    player: card.player,
    playerCN: getPlayerCN(card.player),
    cardKind: SUBSET_NAME,
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
    items: parseCards().map(buildItem),
    createTime: now,
    updateTime: now
  }]
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
    defaultCardSeries: 'Immaculate',
    defaultCardKind: SUBSET_NAME,
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
    presetCardKinds: [{ value: SUBSET_NAME, creatorOpenid: CREATOR_OPENID }],
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
    first: `${items[0].text} #/${items[0].printRun}`,
    last: `${items[items.length - 1].text} #/${items[items.length - 1].printRun}`,
    presetNumbers: buildPresetNumbers(items).map(item => item.value)
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
  if (existing.length > 0) throw new Error(`同名图鉴已存在，停止创建: ${existing.map(item => item._id).join(', ')}`)

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
  CARD_LINES,
  buildSubsetDocs,
  buildSeriesDoc,
  parseCards,
  summarize
}
