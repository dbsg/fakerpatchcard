const https = require('https')
const fs = require('fs')
const path = require('path')
const progressData = require('../miniprogram-card/utils/collectionProgress')

const APPID = 'wx13497267f3b92c0f'
const CLOUD_ENV = 'cloudbase-1g5rcsava7547769'
const ENV_PATH = path.join(__dirname, '.env')

const SERIES_NAME = '1998 Carddass Masters Slam Dunk Takehiko Inoue Illustration Collection'
const DEFAULT_CARD_SERIES = 'Carddass Masters Slam Dunk Takehiko Inoue Illustration Collection'
const STRUCTURE_TYPE = 'fixedChecklist'
const DISPLAY_MODE = 'fixedImageGrid'
const DESCRIPTION = '1998 Bandai Carddass Masters《灌篮高手》井上雄彦 Illustration Collection，动画原画卡图鉴，全套 140 张，包含 SP1-SP5 与 Base 1-135。《灌篮高手》是井上雄彦创作的篮球题材作品，动画围绕湘北高中篮球队展开，讲述樱木花道、流川枫、赤木刚宪、三井寿、宫城良田等角色的成长、比赛与青春热血。'
const CREATOR_OPENID = 'oaQG05Ax1I_QRhOkD4lwqOXEucV8'

const CARD_LINES = `
SP1 Hanamichi Sakuragi
SP2 Kaede Rukawa
SP3 Hisashi Mitsui
SP4 Ryota Miyagi
SP5 Takenori Akagi
1 Title Card 1/9
2 Title Card 2/9
3 Title Card 3/9
4 Title Card 4/9
5 Title Card 5/9
6 Title Card 6/9
7 Title Card 7/9
8 Title Card 8/9
9 Title Card 9/9
10 Hanamichi Sakuragi
11 Kaede Rukawa
12 Takenori Akagi
13 Ryota Miyagi
14 Sakuragi & Mitsui
15 Ayako
16 Team Shohoku
17 Team Shohoku
18 Team Shohoku
19 Haruko Akagi
20 Hanamichi & Haruko
21 Shohoku & Rivals
22 Team Shohoku
23 Team Shohoku
24 Team Shohoku
25 Team Shohoku
26 Kaede Rukawa
27 Haruko Akagi
28 Takenori Akagi
29 Hanamichi Sakuragi
30 Hanamichi Sakuragi
31 Kaede Rukawa
32 Takenori Akagi
33 Hisashi Mitsui
34 Ryota Miyagi
35 Ayako
36 Hanamichi Sakuragi
37 Haruko Akagi
38 Hanamichi Sakuragi
39 Hanamichi Sakuragi
40 Hanamichi Sakuragi
41 Hanamichi Sakuragi
42 Team Shohoku
43 Haruko Akagi
44 Fujii & Matsui
45 Ayako
46 Yohei Mito
47 Ryota Miyagi
48 Tetsuo
49 Hisashi Mitsui
50 Tohru Hanagata
51 Kenji Fujima
52 Kazushi Hasegawa
53 Goro Domoto
54 Moichi Taoka
55 Mitsuyoshi Anzai
56 Riki Takatoh
57 Hikoichi Aida
58 Jun Uozumi
59 Akira Sendoh
60 Kiccho Fukuda
61 Shinichi Maki
62 Soichiro Jin
63 Nobunaga Kiyota
64 Tsuyoshi Minami
65 Coach Kitano
66 Minori Kishimoto VS Hanamichi Sakuragi
67 Tsuyoshi Minami & Minori Kishimoto
68 Eiji Sawakita
69 Masashi Kawata
70 Kazunari Fukatsu
71 Mikio Kawata VS Hanamichi Sakuragi
72 Kaede Rukawa
73 Kiminobu Kogure
74 Hisashi Mitsui
75 Takenori Akagi
76 Haruko Akagi
77 Ryota Miyagi
78 Ayako
79 Yasuharu Yasuda
80 Hanamichi Sakuragi
81 Shinichi Maki
82 Sendoh & Rukawa
83 Team Shohoku
84 Hanamichi Sakuragi
85 Hanamichi Sakuragi
86 Ryota & Ayako
87 Haruko Akagi
88 Kaede Rukawa
89 Team Shohoku
90 Kaede Rukawa
91 Hanamichi Sakuragi
92 Kenji Fujima
93 Hanamichi & Ryota
94 VS Shoyo
95 VS Kainan
96 Hanamichi VS Nobunaga
97 Kaede Rukawa
98 Team Shohoku
99 VS Maki
100 VS Ryonan
101 Team Shohoku
102 VS Ryonan
103 VS Ryonan
104 Hanamichi Sakuragi
105 VS Sendoh
106 Sendoh VS Maki
107 Akira Sendoh
108 Shinichi Maki
109 Ryonan VS Kainan
110 All Star
111 Team Shohoku
112 Team Sannoh
113 VS Sannoh
114 Sakuragi & Rukawa
115 Team Shohoku
116 Team Shohoku
117 Team Shohoku
118 Hanamichi Sakuragi
119 Kaede Rukawa
120 Takenori Akagi
121 Ryota Miyagi
122 Hisashi Mitsui
123 Akira Sendoh
124 Kiccho Fukuda
125 Jun Uozumi
126 Kenji Fujima
127 Tohru Hanagata
128 Shinichi Maki
129 Nobunaga Kiyota
130 Soichiro Jin
131 Kazuma Takasago
132 Hanamichi Sakuragi
133 Team Shohoku
134 DR.T
135 Team Shohoku
`

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

async function updateCloudDB(accessToken, query) {
  return callCloudApi(accessToken, 'databaseupdate', { query })
}

async function deleteCloudDB(accessToken, query) {
  return callCloudApi(accessToken, 'databasedelete', { query })
}

async function findSeriesByName(accessToken, name) {
  const result = await queryCloudDB(accessToken, `db.collection("my_series").where({name:${quote(name)}}).limit(2).get()`)
  return result.data.map(item => JSON.parse(item))
}

async function findSubsetDocs(accessToken, seriesId) {
  const docs = []
  for (let skip = 0; ; skip += 100) {
    const result = await queryCloudDB(accessToken, `db.collection("my_series_subsets").where({seriesId:${quote(seriesId)}}).skip(${skip}).limit(100).get()`)
    const page = result.data.map(item => JSON.parse(item))
    docs.push(...page)
    if (page.length < 100) break
  }
  return docs
}

function parseCards() {
  return CARD_LINES.split('\n').map(line => line.trim()).filter(Boolean).map((line, index) => {
    const match = line.match(/^(\S+)\s+(.+)$/)
    if (!match) throw new Error(`无法解析卡种: ${line}`)
    const number = match[1]
    const name = match[2].trim()
    const subset = number.startsWith('SP') ? 'SP' : 'Base'
    return { number, name, subset, order: index }
  })
}

function createItemId(card) {
  return `carddass_slam_dunk_1998_${card.subset}_${card.number}`.toLowerCase().replace(/[^a-z0-9]+/g, '_')
}

function getFixedGridSortRank(card) {
  const number = String(card && card.number || '').trim()
  const spMatch = number.match(/^SP\s*(\d+)$/i)
  if (spMatch) return 100000 + (Number(spMatch[1]) || 0)
  const numeric = Number(number)
  if (Number.isFinite(numeric) && numeric > 0) return numeric
  return 90000
}

function getFixedGridCards() {
  return parseCards().sort((a, b) => {
    const rankDiff = getFixedGridSortRank(a) - getFixedGridSortRank(b)
    return rankDiff || a.order - b.order
  })
}

function buildItem(card) {
  return {
    itemId: createItemId(card),
    text: `${card.number} ${card.name}`,
    subset: '',
    number: card.number,
    cardKind: card.name,
    completionTarget: 1,
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
    subset: '',
    order: 0,
    items: getFixedGridCards().map(buildItem),
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
    structureType: STRUCTURE_TYPE,
    displayMode: DISPLAY_MODE,
    accessType: 'public',
    hasSubset: true,
    subsetType: 'card',
    cardType: 'card',
    seriesLevel: 3,
    checklistComplete: true,
    defaultInfoEnabled: true,
    defaultYear: '1998',
    defaultBrand: 'Bandai',
    defaultCardSeries: DEFAULT_CARD_SERIES,
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
    presetNumbers: [],
    creatorOpenid: CREATOR_OPENID,
    createTime: now,
    updateTime: now
  }
}

function parseItemNumber(text) {
  const match = String(text || '').trim().match(/^(\S+)\s+(.+)$/)
  return match ? match[1] : ''
}

function normalizeExistingItem(item = {}) {
  const number = item.number || parseItemNumber(item.text)
  return {
    ...item,
    number
  }
}

function buildFlattenedItems(existingSubsetDocs = [], seriesId = '__DRY_RUN_SERIES_ID__') {
  const expectedItems = buildSubsetDocs(seriesId)[0].items
  const existingItems = existingSubsetDocs.flatMap(doc => (doc.items || []).map(normalizeExistingItem))
  const byItemId = new Map(existingItems.filter(item => item.itemId).map(item => [item.itemId, item]))
  const byText = new Map(existingItems.filter(item => item.text).map(item => [item.text, item]))
  return expectedItems.map(template => {
    const existing = byItemId.get(template.itemId) || byText.get(template.text) || {}
    return {
      ...existing,
      ...template,
      creatorOpenid: existing.creatorOpenid || template.creatorOpenid,
      images: Array.isArray(existing.images) ? existing.images : []
    }
  })
}

async function flattenExistingSeries(accessToken, seriesId) {
  const existingSubsetDocs = await findSubsetDocs(accessToken, seriesId)
  const now = new Date().toISOString()
  const flatItems = buildFlattenedItems(existingSubsetDocs, seriesId)
  const existingFlat = existingSubsetDocs.find(doc => !doc.subset)
  const flatDoc = {
    seriesId,
    subset: '',
    order: 0,
    items: flatItems,
    updateTime: now
  }
  if (existingFlat) {
    await updateCloudDB(accessToken, `db.collection("my_series_subsets").doc(${quote(existingFlat._id)}).update({data:${JSON.stringify({
      subset: '',
      order: 0,
      items: flatItems,
      updateTime: now
    })}})`)
  } else {
    await addCloudDB(accessToken, `db.collection("my_series_subsets").add({data:[${JSON.stringify({
      ...flatDoc,
      createTime: now
    })}]})`)
  }
  for (const doc of existingSubsetDocs) {
    if (doc._id && doc.subset) {
      await deleteCloudDB(accessToken, `db.collection("my_series_subsets").doc(${quote(doc._id)}).remove()`)
    }
  }
  const stats = progressData.buildChecklistProgressStats(flatItems)
  await updateCloudDB(accessToken, `db.collection("my_series").doc(${quote(seriesId)}).update({data:${JSON.stringify({
    description: DESCRIPTION,
    structureType: STRUCTURE_TYPE,
    displayMode: DISPLAY_MODE,
    hasSubset: true,
    subsetType: 'card',
    cardType: 'card',
    seriesLevel: 3,
    checklistComplete: true,
    totalCards: stats.totalCards,
    listCollectedCount: stats.listCollectedCount,
    listTotalCount: stats.listTotalCount,
    listProgress: stats.listProgress,
    listImageCount: stats.listImageCount,
    listRecentImages: stats.listRecentImages,
    listIsFree: false,
    presetCardKinds: [],
    presetNumbers: [],
    updateTime: now
  })}})`)
  return {
    subsetDocCountBefore: existingSubsetDocs.length,
    itemCount: flatItems.length,
    first: flatItems[0] && flatItems[0].text,
    last: flatItems[flatItems.length - 1] && flatItems[flatItems.length - 1].text,
    imageCount: flatItems.reduce((sum, item) => sum + ((item.images || []).length), 0)
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
      first: doc.items[0] && doc.items[0].text,
      last: doc.items[doc.items.length - 1] && doc.items[doc.items.length - 1].text
    }))
  }
}

async function main() {
  const apply = process.argv.includes('--apply')
  const updateDescription = process.argv.includes('--update-description')
  const flattenFixedGrid = process.argv.includes('--flatten-fixed-grid')
  const drySubsetDocs = buildSubsetDocs()
  const summary = summarize(drySubsetDocs)
  console.log(JSON.stringify({ mode: flattenFixedGrid ? 'flatten-fixed-grid' : updateDescription ? 'update-description' : (apply ? 'apply' : 'dry-run'), summary }, null, 2))
  if (!apply && !updateDescription && !flattenFixedGrid) return

  const env = loadEnv()
  const appSecret = env.APP_SECRET || process.env.APP_SECRET
  if (!appSecret) throw new Error(`缺少 ${ENV_PATH} 中的 APP_SECRET`)

  const accessToken = await getAccessToken(appSecret)
  const existing = await findSeriesByName(accessToken, SERIES_NAME)
  if (flattenFixedGrid) {
    if (existing.length !== 1) throw new Error(`需要且只能存在一个同名图鉴，当前: ${existing.map(item => item._id).join(', ') || '0'}`)
    const result = await flattenExistingSeries(accessToken, existing[0]._id)
    console.log(JSON.stringify({ flattenedFixedGrid: true, seriesId: existing[0]._id, ...result }, null, 2))
    return
  }
  if (existing.length > 0) {
    if (!updateDescription) throw new Error(`同名图鉴已存在，停止创建: ${existing.map(item => item._id).join(', ')}`)
    if (existing.length > 1) throw new Error(`存在多个同名图鉴，停止更新: ${existing.map(item => item._id).join(', ')}`)
    await updateCloudDB(accessToken, `db.collection("my_series").doc(${quote(existing[0]._id)}).update({data:${JSON.stringify({
      description: DESCRIPTION,
      structureType: STRUCTURE_TYPE,
      displayMode: DISPLAY_MODE,
      updateTime: new Date().toISOString()
    })}})`)
    console.log(JSON.stringify({ updatedSeriesMeta: true, seriesId: existing[0]._id, description: DESCRIPTION, structureType: STRUCTURE_TYPE, displayMode: DISPLAY_MODE }, null, 2))
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
  buildSubsetDocs,
  buildSeriesDoc,
  buildFlattenedItems,
  getFixedGridCards,
  parseCards,
  summarize
}
