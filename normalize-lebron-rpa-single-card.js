const https = require('https')
const fs = require('fs')
const path = require('path')
const progressData = require('../miniprogram-card/utils/collectionProgress')

const APPID = 'wx13497267f3b92c0f'
const CLOUD_ENV = 'cloudbase-1g5rcsava7547769'
const ENV_PATH = path.join(__dirname, '.env')
const SERIES_NAME = '勒布朗 木盒 RPA/99'
const OLD_SUBSET_NAME = 'RPA /99'
const DESCRIPTION = '勒布朗·詹姆斯最正统、最具代表性的 RPA 之一，来自 2003-04 Exquisite 木盒元年，/99 限编，是其新秀卡体系里最核心的收藏标杆。'

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
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    }, res => {
      const chunks = []
      res.on('data', chunk => chunks.push(chunk))
      res.on('end', () => {
        const text = Buffer.concat(chunks).toString('utf8')
        try {
          resolve(JSON.parse(text))
        } catch (_) {
          reject(new Error(`Invalid JSON response: ${text}`))
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

async function updateCloudDB(accessToken, query) {
  return callCloudApi(accessToken, 'databaseupdate', { query })
}

function parseDocs(result) {
  return (result.data || []).map(item => JSON.parse(item))
}

function normalizeItem(item) {
  return {
    ...item,
    text: '',
    subset: SERIES_NAME,
    printRun: 99,
    completionTarget: 99
  }
}

function buildListRecentImages(items) {
  const urls = []
  items.forEach(item => {
    ;(item.images || []).forEach(img => {
      const url = typeof img === 'string' ? img : (img && img.url)
      if (url) urls.push(url)
    })
  })
  return urls.slice(-5).reverse()
}

async function main() {
  const apply = process.argv.includes('--apply')
  const env = loadEnv()
  if (!env.APP_SECRET) throw new Error(`缺少 ${ENV_PATH} 中的 APP_SECRET`)

  const accessToken = await getAccessToken(env.APP_SECRET)
  const seriesResult = await queryCloudDB(accessToken, `db.collection("my_series").where({name:${quote(SERIES_NAME)}}).limit(2).get()`)
  const seriesDocs = parseDocs(seriesResult)
  if (seriesDocs.length !== 1) throw new Error(`图鉴匹配数量异常: ${seriesDocs.length}`)
  const series = seriesDocs[0]

  const subsetResult = await queryCloudDB(accessToken, `db.collection("my_series_subsets").where({seriesId:${quote(series._id)}}).limit(100).get()`)
  const subsetDocs = parseDocs(subsetResult)
  if (subsetDocs.length !== 1) throw new Error(`子系列数量异常: ${subsetDocs.length}`)
  const subsetDoc = subsetDocs[0]

  const items = (subsetDoc.items || []).map(normalizeItem)
  if (items.length !== 1) throw new Error(`卡种数量异常: ${items.length}`)
  const stats = progressData.buildChecklistProgressStats(items)
  const seriesFields = {
    name: SERIES_NAME,
    description: DESCRIPTION,
    totalCards: stats.totalCards,
    checklistComplete: true,
    listCollectedCount: stats.listCollectedCount,
    listTotalCount: stats.listTotalCount,
    listProgress: stats.listProgress,
    listImageCount: stats.listImageCount,
    listRecentImages: buildListRecentImages(items),
    listIsFree: false,
    updateTime: new Date().toISOString()
  }
  if (Array.isArray(series.checklist)) seriesFields.checklist = items

  const subsetFields = {
    subset: SERIES_NAME,
    items,
    updateTime: new Date().toISOString()
  }

  console.log(JSON.stringify({
    mode: apply ? 'apply' : 'dry-run',
    seriesId: series._id,
    subsetDocId: subsetDoc._id,
    before: {
      seriesTotalCards: series.totalCards,
      listTotalCount: series.listTotalCount,
      subset: subsetDoc.subset,
      itemSubset: subsetDoc.items && subsetDoc.items[0] && subsetDoc.items[0].subset,
      itemText: subsetDoc.items && subsetDoc.items[0] && subsetDoc.items[0].text,
      printRun: subsetDoc.items && subsetDoc.items[0] && subsetDoc.items[0].printRun
    },
    after: {
      seriesTotalCards: seriesFields.totalCards,
      listTotalCount: seriesFields.listTotalCount,
      subset: subsetFields.subset,
      itemSubset: items[0].subset,
      itemText: items[0].text,
      printRun: items[0].printRun,
      imageCount: stats.listImageCount,
      collected: stats.listCollectedCount
    }
  }, null, 2))

  if (!apply) {
    console.log('Dry-run only. Use --apply to update cloud data.')
    return
  }

  await updateCloudDB(accessToken, `db.collection("my_series_subsets").doc(${quote(subsetDoc._id)}).update({data:${JSON.stringify(subsetFields)}})`)
  await updateCloudDB(accessToken, `db.collection("my_series").doc(${quote(series._id)}).update({data:${JSON.stringify(seriesFields)}})`)
  console.log(JSON.stringify({ ok: true, seriesId: series._id, subsetDocId: subsetDoc._id }, null, 2))
}

main().catch(err => {
  console.error(err.message || err)
  process.exit(1)
})
