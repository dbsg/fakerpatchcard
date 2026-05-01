const https = require('https')
const fs = require('fs')
const path = require('path')

const APPID = 'wx13497267f3b92c0f'
const CLOUD_ENV = 'cloudbase-1g5rcsava7547769'
const ENV_PATH = path.join(__dirname, '.env')

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

async function fetchAll(accessToken, collectionName) {
  const docs = []
  for (let skip = 0; ; skip += 100) {
    const result = await queryCloudDB(accessToken, `db.collection(${quote(collectionName)}).skip(${skip}).limit(100).get()`)
    const page = result.data.map(item => JSON.parse(item))
    docs.push(...page)
    if (page.length < 100) break
  }
  return docs
}

function extractImageUrl(img) {
  if (!img) return ''
  return typeof img === 'string' ? img : (img.url || '')
}

function parsePrintRunText(value) {
  const text = String(value || '').trim()
  const match = text.match(/\/\s*([1-9]\d{0,5})\s*$/)
  return match ? Number(match[1]) : 0
}

function getPrintRun(item) {
  const raw = Number(item && item.printRun)
  if (Number.isInteger(raw) && raw > 0) return raw
  return parsePrintRunText((item && (item.text || item.subset)) || '')
}

function getCompletionTarget(item) {
  const raw = Number(item && item.completionTarget)
  if (Number.isInteger(raw) && raw > 0) return raw
  return getPrintRun(item) || 1
}

function parseImageSerial(value) {
  const text = String(value || '').trim()
  if (!text) return ''
  const match = text.match(/^0*([1-9]\d*)(?:\s*\/\s*[1-9]\d*)?(?:\s*编)?$/)
  return match ? String(Number(match[1])) : ''
}

function getItemTargetCount(item) {
  return getCompletionTarget(item)
}

function getItemCollectedCount(item) {
  const images = Array.isArray(item && item.images) ? item.images : []
  const validImages = images.filter(img => !!extractImageUrl(img))
  const target = getItemTargetCount(item)
  const printRun = getPrintRun(item)
  if (!printRun) return Math.min(target, validImages.length)
  const serials = new Set()
  let independentCount = 0
  validImages.forEach(img => {
    const serial = typeof img === 'string' ? '' : parseImageSerial(img.number)
    if (serial) serials.add(serial)
    else independentCount += 1
  })
  return Math.min(target, serials.size + independentCount)
}

function buildChecklistStats(items) {
  const allItems = Array.isArray(items) ? items : []
  const urls = []
  let collected = 0
  let total = 0
  allItems.forEach(item => {
    collected += getItemCollectedCount(item)
    total += getItemTargetCount(item)
    ;(Array.isArray(item.images) ? item.images : []).forEach(img => {
      const url = extractImageUrl(img)
      if (url) urls.push(url)
    })
  })
  return {
    listCollectedCount: collected,
    listTotalCount: total,
    listProgress: total ? Math.round(collected / total * 100) : 0,
    listImageCount: urls.length,
    listRecentImages: urls.slice(-5).reverse(),
    listIsFree: false
  }
}

function buildFreeStats(freeImages) {
  const urls = (Array.isArray(freeImages) ? freeImages : []).map(extractImageUrl).filter(Boolean)
  return {
    listCollectedCount: urls.length,
    listTotalCount: urls.length,
    listProgress: urls.length > 0 ? 100 : 0,
    listImageCount: urls.length,
    listRecentImages: urls.slice(-5).reverse(),
    listIsFree: true
  }
}

function sameStats(series, stats) {
  return series.listCollectedCount === stats.listCollectedCount
    && series.listTotalCount === stats.listTotalCount
    && series.listProgress === stats.listProgress
    && series.listImageCount === stats.listImageCount
    && series.listIsFree === stats.listIsFree
    && JSON.stringify(series.listRecentImages || []) === JSON.stringify(stats.listRecentImages || [])
}

async function updateSeriesStats(accessToken, seriesId, stats) {
  return updateCloudDB(accessToken, `db.collection("my_series").doc(${quote(seriesId)}).update({
    data: ${JSON.stringify({ ...stats, updateTime: new Date().toISOString() })}
  })`)
}

async function main() {
  const apply = process.argv.includes('--apply')
  const env = loadEnv()
  if (!env.APP_SECRET) throw new Error(`缺少 ${ENV_PATH} 中的 APP_SECRET`)
  const accessToken = await getAccessToken(env.APP_SECRET)
  const seriesDocs = await fetchAll(accessToken, 'my_series')
  const subsetDocs = await fetchAll(accessToken, 'my_series_subsets')
  const subsetsBySeries = new Map()
  subsetDocs.forEach(doc => {
    const list = subsetsBySeries.get(doc.seriesId) || []
    list.push(doc)
    subsetsBySeries.set(doc.seriesId, list)
  })

  const changes = seriesDocs.map(series => {
    const docs = subsetsBySeries.get(series._id) || []
    const isFree = !series.hasSubset && docs.length === 0
    const items = docs.length > 0
      ? docs.flatMap(doc => doc.items || [])
      : (Array.isArray(series.checklist) ? series.checklist : [])
    const stats = isFree ? buildFreeStats(series.freeImages) : buildChecklistStats(items)
    return { series, stats, changed: !sameStats(series, stats) }
  }).filter(item => item.changed)

  console.log(JSON.stringify({
    mode: apply ? 'apply' : 'dry-run',
    seriesCount: seriesDocs.length,
    changedCount: changes.length,
    samples: changes.slice(0, 20).map(({ series, stats }) => ({
      seriesName: series.name,
      before: {
        collected: series.listCollectedCount || 0,
        total: series.listTotalCount || 0,
        progress: series.listProgress || 0
      },
      after: {
        collected: stats.listCollectedCount,
        total: stats.listTotalCount,
        progress: stats.listProgress
      }
    }))
  }, null, 2))

  if (!apply) {
    console.log('Dry-run only. Use --apply to update my_series progress fields.')
    return
  }

  for (let i = 0; i < changes.length; i++) {
    const { series, stats } = changes[i]
    console.log(`[${i + 1}/${changes.length}] update ${series.name}`)
    await updateSeriesStats(accessToken, series._id, stats)
  }
  console.log(JSON.stringify({ updatedSeries: changes.length }, null, 2))
}

main().catch(err => {
  console.error(err.message || err)
  process.exit(1)
})
