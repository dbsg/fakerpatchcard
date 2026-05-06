const https = require('https')
const fs = require('fs')
const path = require('path')

const APPID = 'wx13497267f3b92c0f'
const CLOUD_ENV = 'cloudbase-1g5rcsava7547769'
const ENV_PATH = path.join(__dirname, '.env')

const args = new Set(process.argv.slice(2))
const APPLY = args.has('--apply')
const OVERWRITE = args.has('--overwrite')

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

function normalizeName(value) {
  return String(value || '').replace(/\s+/g, ' ').replace(/[–—]/g, '-').trim()
}

function inferYear(name) {
  const normalized = normalizeName(name)
  const season = normalized.match(/((?:19|20)\d{2})\s*-\s*(\d{2})/)
  if (season) return `${season[1]}-${season[2]}`
  const year = normalized.match(/(?:^|\D)((?:19|20)\d{2})(?:\D|$)/)
  return year ? year[1] : ''
}

function inferBrand(name) {
  const text = normalizeName(name).toLowerCase()
  if (text.includes('topps')) return 'Topps'
  if (text.includes('upper deck') || text.includes('exquisite') || text.includes('limited logos') || text.includes('木盒')) return 'Upper Deck'
  if (text.includes('fleer')) return 'Fleer'
  if (text.includes('skybox') || text.includes('metal universe')) return 'SkyBox'
  if (/(panini|prizm|kaboom|flawless|national treasures|preferred|opulence|eminence|impeccable|immaculate|silhouette|gold standard|obsidian|spectra|optic|mosaic|revolution|origins|downtown|court kings|colossal materials)/i.test(text)) return 'Panini'
  if (/(国宝|钻石|手提|油画|画布|金折|金砖|大真金|小真金|剪影|黑曜石|光谱|光学|马赛克|革命|起源|奢华)/.test(name)) return 'Panini'
  return ''
}

function inferCardSeries(name) {
  const text = normalizeName(name).toLowerCase()
  const raw = String(name || '')
  if (text.includes('topps chrome')) return 'Topps Chrome'
  if (text.includes('chrome')) return 'Topps Chrome'
  if (text.includes('exquisite') || text.includes('limited logos') || raw.includes('木盒')) return 'Exquisite Collection'
  if (text.includes('metal universe')) return 'Metal Universe'
  if (text.includes('national treasures') || text.includes('colossal materials') || raw.includes('国宝')) return 'National Treasures'
  if (text.includes('flawless') || raw.includes('钻石')) return 'Flawless'
  if (text.includes('preferred') || raw.includes('手提')) return 'Preferred'
  if (text.includes('opulence')) return 'Opulence'
  if (text.includes('eminence') || raw.includes('大真金')) return 'Eminence'
  if (text.includes('impeccable') || raw.includes('小真金')) return 'Impeccable'
  if (text.includes('gold standard') || raw.includes('金砖') || raw.includes('黄金标准')) return 'Gold Standard'
  if (text.includes('silhouette') || raw.includes('剪影')) return 'Silhouette'
  if (text.includes('obsidian') || raw.includes('黑曜石')) return 'Obsidian'
  if (text.includes('spectra') || raw.includes('光谱')) return 'Spectra'
  if (text.includes('optic') || raw.includes('光学')) return 'Optic'
  if (text.includes('mosaic') || raw.includes('马赛克')) return 'Mosaic'
  if (text.includes('revolution') || raw.includes('革命')) return 'Revolution'
  if (text.includes('origins') || raw.includes('起源')) return 'Origins'
  if (text.includes('prizm') || raw.includes('金折')) return 'Prizm'
  if (text.includes('kaboom')) return 'Kaboom!'
  if (text.includes('court kings') || text.includes('canvas') || raw.includes('油画') || raw.includes('画布')) return 'Court Kings'
  if (text.includes('downtown')) return 'Downtown'
  if (text.includes('silhouette')) return 'Silhouette'
  if (text.includes('immaculate')) return 'Immaculate'
  if (text.includes('fleer')) return 'Fleer'
  return ''
}

function inferSeriesDefaultInfo(series) {
  const name = normalizeName(series && series.name)
  return {
    defaultYear: inferYear(name),
    defaultBrand: inferBrand(name),
    defaultCardSeries: inferCardSeries(name)
  }
}

function hasAnyDefaultInfo(series) {
  return !!(series.defaultYear || series.defaultBrand || series.defaultCardSeries)
}

function buildUpdate(series) {
  const inferred = inferSeriesDefaultInfo(series)
  const fields = {}
  const conflicts = []

  ;['defaultYear', 'defaultBrand', 'defaultCardSeries'].forEach(key => {
    const nextValue = inferred[key]
    const currentValue = String(series[key] || '').trim()
    if (!nextValue) return
    if (!currentValue || OVERWRITE) {
      fields[key] = nextValue
      return
    }
    if (currentValue !== nextValue) {
      conflicts.push({ field: key, current: currentValue, inferred: nextValue })
    }
  })

  const willHaveDefaultInfo = hasAnyDefaultInfo({ ...series, ...fields })
  if (willHaveDefaultInfo && (series.defaultInfoEnabled !== true) && (series.defaultInfoEnabled !== false || OVERWRITE)) {
    fields.defaultInfoEnabled = true
  }

  return { inferred, fields, conflicts }
}

async function main() {
  const env = loadEnv()
  if (!env.APP_SECRET) throw new Error(`缺少 ${ENV_PATH} 中的 APP_SECRET`)

  const accessToken = await getAccessToken(env.APP_SECRET)
  const seriesList = await fetchAll(accessToken, 'my_series')
  const plan = []
  const conflicts = []

  seriesList.forEach(series => {
    const update = buildUpdate(series)
    if (update.conflicts.length) conflicts.push({ _id: series._id, name: series.name, conflicts: update.conflicts })
    if (!Object.keys(update.fields).length) return
    plan.push({
      _id: series._id,
      name: series.name,
      before: {
        defaultInfoEnabled: series.defaultInfoEnabled,
        defaultYear: series.defaultYear || '',
        defaultBrand: series.defaultBrand || '',
        defaultCardSeries: series.defaultCardSeries || ''
      },
      after: update.fields
    })
  })

  console.log(JSON.stringify({
    mode: APPLY ? 'apply' : 'dry-run',
    overwrite: OVERWRITE,
    totalSeries: seriesList.length,
    updateCount: plan.length,
    conflictCount: conflicts.length,
    updates: plan,
    conflicts
  }, null, 2))

  if (!APPLY) {
    console.log('Dry-run only. Use --apply to update my_series default info.')
    return
  }

  for (const item of plan) {
    await updateCloudDB(accessToken, `db.collection("my_series").doc(${quote(item._id)}).update({
      data: ${JSON.stringify({ ...item.after, updateTime: new Date().toISOString() })}
    })`)
  }

  console.log(JSON.stringify({ ok: true, updated: plan.length }, null, 2))
}

main().catch(err => {
  console.error(err.message || err)
  process.exit(1)
})
