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

function hasCompletionTarget(item) {
  const raw = Number(item && item.completionTarget)
  return Number.isInteger(raw) && raw > 0
}

function initCompletionTarget(item) {
  if (!item || hasCompletionTarget(item)) return false
  item.completionTarget = getPrintRun(item) || 1
  return true
}

async function updateSubsetDoc(accessToken, doc) {
  return updateCloudDB(accessToken, `db.collection("my_series_subsets").doc(${quote(doc._id)}).update({
    data: {
      items: ${JSON.stringify(doc.items || [])},
      updateTime: ${quote(new Date().toISOString())}
    }
  })`)
}

async function updateSeriesChecklist(accessToken, doc) {
  return updateCloudDB(accessToken, `db.collection("my_series").doc(${quote(doc._id)}).update({
    data: {
      checklist: ${JSON.stringify(doc.checklist || [])},
      updateTime: ${quote(new Date().toISOString())}
    }
  })`)
}

async function main() {
  const apply = process.argv.includes('--apply')
  const env = loadEnv()
  if (!env.APP_SECRET) throw new Error(`缺少 ${ENV_PATH} 中的 APP_SECRET`)

  const accessToken = await getAccessToken(env.APP_SECRET)
  const [seriesDocs, subsetDocs] = await Promise.all([
    fetchAll(accessToken, 'my_series'),
    fetchAll(accessToken, 'my_series_subsets')
  ])

  const changedSeries = []
  const changedSubsets = []
  const changedItems = []

  seriesDocs.forEach(series => {
    let changed = false
    ;(Array.isArray(series.checklist) ? series.checklist : []).forEach((item, index) => {
      if (!initCompletionTarget(item)) return
      changed = true
      changedItems.push({
        collection: 'my_series',
        seriesId: series._id,
        seriesName: series.name || '',
        itemIndex: index,
        itemName: item.text || item.subset || '',
        printRun: getPrintRun(item) || 0,
        completionTarget: item.completionTarget
      })
    })
    if (changed) changedSeries.push(series)
  })

  const seriesById = new Map(seriesDocs.map(series => [series._id, series]))
  subsetDocs.forEach(doc => {
    let changed = false
    ;(Array.isArray(doc.items) ? doc.items : []).forEach((item, index) => {
      if (!initCompletionTarget(item)) return
      changed = true
      const series = seriesById.get(doc.seriesId) || {}
      changedItems.push({
        collection: 'my_series_subsets',
        seriesId: doc.seriesId,
        seriesName: series.name || '',
        subsetDocId: doc._id,
        subset: doc.subset || '',
        itemIndex: index,
        itemName: item.text || item.subset || '',
        printRun: getPrintRun(item) || 0,
        completionTarget: item.completionTarget
      })
    })
    if (changed) changedSubsets.push(doc)
  })

  console.log(JSON.stringify({
    mode: apply ? 'apply' : 'dry-run',
    seriesCount: seriesDocs.length,
    subsetDocCount: subsetDocs.length,
    pendingSeriesCount: changedSeries.length,
    pendingSubsetDocCount: changedSubsets.length,
    pendingItemCount: changedItems.length,
    samples: changedItems.slice(0, 30)
  }, null, 2))

  if (!apply) {
    console.log('Dry-run only. Use --apply to initialize completionTarget fields.')
    return
  }

  for (let i = 0; i < changedSeries.length; i += 1) {
    const doc = changedSeries[i]
    console.log(`[series ${i + 1}/${changedSeries.length}] update ${doc._id} ${doc.name || ''}`)
    await updateSeriesChecklist(accessToken, doc)
  }

  for (let i = 0; i < changedSubsets.length; i += 1) {
    const doc = changedSubsets[i]
    console.log(`[subset ${i + 1}/${changedSubsets.length}] update ${doc._id} ${doc.subset || ''}`)
    await updateSubsetDoc(accessToken, doc)
  }

  console.log(JSON.stringify({
    updatedSeries: changedSeries.length,
    updatedSubsetDocs: changedSubsets.length,
    updatedItems: changedItems.length
  }, null, 2))
}

main().catch(err => {
  console.error(err.message || err)
  process.exit(1)
})
