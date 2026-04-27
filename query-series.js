const https = require('https')
const fs = require('fs')
const path = require('path')

const APPID = 'wx13497267f3b92c0f'
const CLOUD_ENV = 'cloudbase-1g5rcsava7547769'
const ENV_PATH = path.join(__dirname, '.env')

function loadEnv() {
  if (!fs.existsSync(ENV_PATH)) return {}
  const content = fs.readFileSync(ENV_PATH, 'utf8')
  const env = {}
  content.split('\n').forEach(line => {
    const match = line.match(/^\s*([^#=]+?)\s*=\s*(.+?)\s*$/)
    if (match) env[match[1]] = match[2]
  })
  return env
}

function httpGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return httpGet(res.headers.location).then(resolve).catch(reject)
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`))
      }
      const chunks = []
      res.on('data', chunk => chunks.push(chunk))
      res.on('end', () => resolve(Buffer.concat(chunks)))
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
    }, (res) => {
      const chunks = []
      res.on('data', chunk => chunks.push(chunk))
      res.on('end', () => {
        try {
          resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')))
        } catch (err) {
          reject(new Error('Invalid JSON response'))
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
  const buf = await httpGet(url)
  const result = JSON.parse(buf.toString('utf8'))
  if (result.errcode) {
    throw new Error(`获取 access_token 失败: ${result.errmsg} (${result.errcode})`)
  }
  return result.access_token
}

async function queryCloudDB(accessToken, query) {
  const url = `https://api.weixin.qq.com/tcb/databasequery?access_token=${accessToken}`
  const result = await httpPost(url, { env: CLOUD_ENV, query })
  if (result.errcode !== 0) {
    throw new Error(`数据库查询失败: ${result.errmsg} (${result.errcode})`)
  }
  return result
}

async function fetchAllDocs(accessToken, collectionName, pageSize = 100) {
  const firstPage = await queryCloudDB(
    accessToken,
    `db.collection("${collectionName}").limit(1).get()`
  )
  const total = firstPage.pager.Total
  const docs = []

  for (let skip = 0; skip < total; skip += pageSize) {
    const page = await queryCloudDB(
      accessToken,
      `db.collection("${collectionName}").skip(${skip}).limit(${pageSize}).get()`
    )
    page.data.forEach(item => docs.push(JSON.parse(item)))
  }

  return docs
}

function subsetDocsToChecklist(subsetDocs) {
  const checklist = []
  for (const doc of subsetDocs) {
    const docSubset = doc.subset || ''
    const isBatch = docSubset.startsWith('_batch_')
    for (const item of (doc.items || [])) {
      checklist.push({
        itemId: item.itemId || '',
        text: item.text || '',
        subset: isBatch ? (item.subset || '') : docSubset,
        creatorOpenid: item.creatorOpenid || '',
        images: item.images || []
      })
    }
  }
  return checklist
}

function buildSeriesView(series, subsetDocs) {
  const checklist = subsetDocs.length > 0
    ? subsetDocsToChecklist(subsetDocs)
    : (series.checklist || [])

  return {
    _id: series._id,
    name: series.name || '',
    description: series.description || '',
    hasSubset: !!series.hasSubset,
    subsetType: series.subsetType || '',
    cardType: series.cardType || '',
    seriesLevel: series.seriesLevel || (series.hasSubset ? 3 : 1),
    totalCards: series.totalCards || 0,
    creatorOpenid: series.creatorOpenid || '',
    listCollectedCount: series.listCollectedCount || 0,
    listTotalCount: series.listTotalCount || 0,
    listProgress: series.listProgress || 0,
    listImageCount: series.listImageCount || 0,
    listRecentImages: series.listRecentImages || [],
    presetCardKinds: series.presetCardKinds || [],
    presetNumbers: series.presetNumbers || [],
    freeImages: series.freeImages || [],
    subsetDocCount: subsetDocs.length,
    subsetNames: [...new Set(checklist.map(item => item.subset).filter(Boolean))],
    checklistCount: checklist.length,
    checklistSample: checklist.slice(0, 20),
    subsetDocs
  }
}

function parseArgs(argv) {
  const args = argv.slice(2)
  const options = {
    keyword: '',
    exact: false
  }

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    if (arg === '--exact') {
      options.exact = true
      continue
    }
    if (!options.keyword) {
      options.keyword = arg
    }
  }

  return options
}

async function main() {
  const { keyword, exact } = parseArgs(process.argv)
  if (!keyword) {
    console.error('用法: node card/query-series.js "Panini Kaboom!" [--exact]')
    process.exit(1)
  }

  const env = loadEnv()
  const appSecret = env.APP_SECRET || process.env.APP_SECRET
  if (!appSecret) {
    throw new Error('未找到 APP_SECRET，请先在 card/.env 配置')
  }

  const token = await getAccessToken(appSecret)
  const [seriesDocs, subsetDocs] = await Promise.all([
    fetchAllDocs(token, 'my_series', 100),
    fetchAllDocs(token, 'my_series_subsets', 100)
  ])

  const normalizedKeyword = keyword.trim().toLowerCase()
  const matchedSeries = seriesDocs.filter(series => {
    const name = String(series.name || '')
    return exact
      ? name === keyword
      : name.toLowerCase().includes(normalizedKeyword)
  })

  const subsetsBySeriesId = new Map()
  subsetDocs.forEach(doc => {
    if (!doc.seriesId) return
    if (!subsetsBySeriesId.has(doc.seriesId)) subsetsBySeriesId.set(doc.seriesId, [])
    subsetsBySeriesId.get(doc.seriesId).push(doc)
  })

  const result = matchedSeries.map(series => (
    buildSeriesView(series, subsetsBySeriesId.get(series._id) || [])
  ))

  console.log(JSON.stringify({
    keyword,
    exact,
    count: result.length,
    results: result
  }, null, 2))
}

main().catch(err => {
  console.error(err.message || err)
  process.exit(1)
})
