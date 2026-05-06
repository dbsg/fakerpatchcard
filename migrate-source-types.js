const https = require('https')
const fs = require('fs')
const path = require('path')

const APPID = 'wx13497267f3b92c0f'
const CLOUD_ENV = 'cloudbase-1g5rcsava7547769'
const ENV_PATH = path.join(__dirname, '.env')

const args = new Set(process.argv.slice(2))
const APPLY = args.has('--apply')
const OVERWRITE = args.has('--overwrite')
const ONLY = [...args].find(arg => arg.startsWith('--only='))?.slice('--only='.length) || ''
const SAMPLE_LIMIT = Number(process.env.SAMPLE_LIMIT || 20)

const PROBLEM_SOURCE_TYPES = new Set(['web_public', 'user_submission', 'manual_curation'])
const PROBLEM_SOURCE_LEGACY_MAP = {
  personal_observation: 'user_submission',
  web_source: 'web_public',
  public_listing: 'web_public',
  grading_label: 'web_public',
  official_checklist: 'web_public'
}

const IMAGE_SOURCE_TYPES = new Set(['user_photo', 'grading_db', 'official', 'auction', 'web_ref', 'other'])
const AUCTION_PATTERNS = [
  /\balt\b/i,
  /\bgolding\b/i,
  /\bpwcc\b/i,
  /\bebay\b/i,
  /\bfanatics\s*collect\b/i,
  /卡淘/,
  /微卡家/,
  /拍卖/,
  /auction/i
]
const GRADING_PATTERNS = [
  /\bpsa\b/i,
  /\bcgc\b/i,
  /\bbgs\b/i,
  /\bsgc\b/i,
  /\bbgn\b/i,
  /\bbeckett\b/i,
  /\bcert(?:ificate)?\b/i,
  /评级/,
  /证书/,
  /编号查询/
]
const WEB_PATTERNS = [
  /https?:\/\//i,
  /\bwww\./i,
  /\bxhslink\.com\b/i,
  /\bxiaohongshu\.com\b/i,
  /\bx\.com\b/i,
  /\btwitter\.com\b/i,
  /\binstagram\.com\b/i,
  /\bweibo\.com\b/i,
  /小红书/,
  /网络/,
  /分享/
]
const OFFICIAL_PATTERNS = [
  /官方/,
  /official/i,
  /\bchecklist\b/i
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

function pick(value) {
  return String(value || '').trim()
}

function joinedText(...values) {
  return values.map(pick).filter(Boolean).join(' ')
}

function hasAny(text, patterns) {
  return patterns.some(pattern => pattern.test(text))
}

function inferProblemSourceType(doc = {}) {
  const cardInfo = doc.cardInfo || {}
  const current = pick(doc.sourceType || cardInfo.sourceType)
  const sourceText = joinedText(doc.source, cardInfo.source, doc.description)

  if (/小程序用户|用户投稿|用户反馈|用户提交/.test(sourceText) || (doc.feedbackId && !/小丁卡册|人工整理/.test(sourceText))) {
    return { sourceType: 'user_submission', reason: 'user-submission-text-or-feedback' }
  }
  if (/小丁卡册|人工整理|公开图片与卡片特征对比收录/.test(sourceText)) {
    return { sourceType: 'manual_curation', reason: 'manual-curation-text' }
  }
  if (hasAny(sourceText, WEB_PATTERNS)) {
    return { sourceType: 'web_public', reason: 'web-source-text' }
  }
  if (PROBLEM_SOURCE_LEGACY_MAP[current]) {
    return { sourceType: PROBLEM_SOURCE_LEGACY_MAP[current], reason: `legacy-${current}` }
  }
  return { sourceType: '', reason: '' }
}

function shouldUpdateProblemSourceType(current, inferred) {
  const normalizedCurrent = PROBLEM_SOURCE_LEGACY_MAP[current] || current
  if (!inferred) return false
  if (!current || !PROBLEM_SOURCE_TYPES.has(current) || PROBLEM_SOURCE_LEGACY_MAP[current]) return normalizedCurrent !== inferred
  return OVERWRITE && current !== inferred
}

function inferImageSourceType(img = {}) {
  const current = pick(img.sourceType)
  const text = joinedText(img.sourceNote, img.source, img.note)

  if (hasAny(text, GRADING_PATTERNS)) return { sourceType: 'grading_db', reason: 'grading-source-note' }
  if (hasAny(text, AUCTION_PATTERNS)) return { sourceType: 'auction', reason: 'auction-source-note' }
  if (hasAny(text, OFFICIAL_PATTERNS)) return { sourceType: 'official', reason: 'official-source-note' }
  if (hasAny(text, WEB_PATTERNS)) return { sourceType: 'web_ref', reason: 'web-source-note' }
  if (current && !IMAGE_SOURCE_TYPES.has(current)) {
    if (/目录导入/.test(text)) return { sourceType: 'other', reason: `invalid-${current}-catalog-import` }
    return { sourceType: 'user_photo', reason: `invalid-${current}` }
  }
  return { sourceType: '', reason: '' }
}

function shouldUpdateImageSourceType(current, inferred) {
  if (!inferred) return false
  if (!current || !IMAGE_SOURCE_TYPES.has(current)) return true
  if (current === inferred) return false
  if (inferred === 'grading_db') return true
  if (OVERWRITE) return true
  return current === 'user_photo' || current === 'other'
}

function migrateImages(images, context, samples, stats) {
  let changed = false
  const nextImages = (Array.isArray(images) ? images : []).map((img, index) => {
    if (!img || typeof img === 'string') return img
    const current = pick(img.sourceType)
    const inferred = inferImageSourceType(img)
    if (!shouldUpdateImageSourceType(current, inferred.sourceType)) return img

    changed = true
    const next = { ...img, sourceType: inferred.sourceType }
    const key = `${current || '(empty)'} -> ${inferred.sourceType}`
    stats[key] = (stats[key] || 0) + 1
    if (samples.length < SAMPLE_LIMIT) {
      samples.push({
        ...context,
        imageIndex: index,
        imageId: img.imageId || '',
        number: img.number || '',
        sourceNote: img.sourceNote || '',
        before: current || '',
        after: inferred.sourceType,
        reason: inferred.reason
      })
    }
    return next
  })
  return { images: nextImages, changed }
}

function buildCardPlan(cards) {
  const updates = []
  cards.forEach(card => {
    const current = pick(card.sourceType)
    const inferred = inferProblemSourceType(card)
    if (!shouldUpdateProblemSourceType(current, inferred.sourceType)) return
    updates.push({
      _id: card._id,
      id: card.id,
      player: card.player || '',
      number: card.number || '',
      source: card.source || '',
      before: current,
      after: inferred.sourceType,
      reason: inferred.reason
    })
  })
  return updates
}

function buildFeedbackPlan(feedbacks) {
  const updates = []
  feedbacks.forEach(feedback => {
    const cardInfo = feedback.cardInfo || {}
    const inferred = inferProblemSourceType(feedback)
    const fields = {}
    const currentTop = pick(feedback.sourceType)
    const currentInfo = pick(cardInfo.sourceType)

    if (shouldUpdateProblemSourceType(currentTop, inferred.sourceType)) fields.sourceType = inferred.sourceType
    if (shouldUpdateProblemSourceType(currentInfo, inferred.sourceType)) fields.cardInfo = { ...cardInfo, sourceType: inferred.sourceType }
    if (!Object.keys(fields).length) return

    updates.push({
      _id: feedback._id,
      id: feedback.id,
      status: feedback.status || '',
      source: feedback.source || cardInfo.source || '',
      before: { sourceType: currentTop, cardInfoSourceType: currentInfo },
      after: fields,
      reason: inferred.reason
    })
  })
  return updates
}

function buildSeriesPlan(seriesDocs) {
  const updates = []
  const samples = []
  const stats = {}

  seriesDocs.forEach(series => {
    const fields = {}
    const freeResult = migrateImages(series.freeImages, { collection: 'my_series', seriesId: series._id, seriesName: series.name || '', area: 'freeImages' }, samples, stats)
    if (freeResult.changed) fields.freeImages = freeResult.images

    let checklistChanged = false
    const checklist = (Array.isArray(series.checklist) ? series.checklist : []).map((item, itemIndex) => {
      const result = migrateImages(item.images, {
        collection: 'my_series',
        seriesId: series._id,
        seriesName: series.name || '',
        area: 'checklist',
        itemIndex,
        itemText: item.text || item.subset || ''
      }, samples, stats)
      if (result.changed) checklistChanged = true
      return result.changed ? { ...item, images: result.images } : item
    })
    if (checklistChanged) fields.checklist = checklist

    if (Object.keys(fields).length) {
      updates.push({
        _id: series._id,
        name: series.name || '',
        fields
      })
    }
  })

  return { updates, samples, stats }
}

function buildSubsetPlan(subsetDocs) {
  const updates = []
  const samples = []
  const stats = {}

  subsetDocs.forEach(doc => {
    let changed = false
    const items = (Array.isArray(doc.items) ? doc.items : []).map((item, itemIndex) => {
      const result = migrateImages(item.images, {
        collection: 'my_series_subsets',
        docId: doc._id,
        seriesId: doc.seriesId || '',
        subset: doc.subset || '',
        itemIndex,
        itemText: item.text || item.subset || ''
      }, samples, stats)
      if (result.changed) changed = true
      return result.changed ? { ...item, images: result.images } : item
    })
    if (changed) updates.push({ _id: doc._id, seriesId: doc.seriesId || '', subset: doc.subset || '', items })
  })

  return { updates, samples, stats }
}

function shouldRun(scope) {
  return !ONLY || ONLY.split(',').map(item => item.trim()).includes(scope)
}

function summarizeList(list, mapper = item => item) {
  return list.slice(0, SAMPLE_LIMIT).map(mapper)
}

async function main() {
  const env = loadEnv()
  const appSecret = env.APP_SECRET || process.env.APP_SECRET
  if (!appSecret) throw new Error(`缺少 ${ENV_PATH} 中的 APP_SECRET`)

  const accessToken = await getAccessToken(appSecret)
  const [cards, feedbacks, seriesDocs, subsetDocs] = await Promise.all([
    shouldRun('cards') ? fetchAll(accessToken, 'cards') : [],
    shouldRun('feedbacks') ? fetchAll(accessToken, 'feedbacks') : [],
    shouldRun('series') ? fetchAll(accessToken, 'my_series') : [],
    shouldRun('subsets') ? fetchAll(accessToken, 'my_series_subsets') : []
  ])

  const cardPlan = buildCardPlan(cards)
  const feedbackPlan = buildFeedbackPlan(feedbacks)
  const seriesPlan = buildSeriesPlan(seriesDocs)
  const subsetPlan = buildSubsetPlan(subsetDocs)

  const summary = {
    mode: APPLY ? 'apply' : 'dry-run',
    overwrite: OVERWRITE,
    only: ONLY || 'all',
    cards: {
      total: cards.length,
      updateCount: cardPlan.length,
      samples: summarizeList(cardPlan, item => ({
        id: item.id,
        player: item.player,
        number: item.number,
        source: item.source,
        before: item.before,
        after: item.after,
        reason: item.reason
      }))
    },
    feedbacks: {
      total: feedbacks.length,
      updateCount: feedbackPlan.length,
      samples: summarizeList(feedbackPlan, item => ({
        id: item.id,
        status: item.status,
        source: item.source,
        before: item.before,
        after: item.after,
        reason: item.reason
      }))
    },
    series: {
      total: seriesDocs.length,
      updateDocCount: seriesPlan.updates.length,
      imageChangeStats: seriesPlan.stats,
      samples: seriesPlan.samples
    },
    subsets: {
      total: subsetDocs.length,
      updateDocCount: subsetPlan.updates.length,
      imageChangeStats: subsetPlan.stats,
      samples: subsetPlan.samples
    }
  }

  console.log(JSON.stringify(summary, null, 2))

  if (!APPLY) {
    console.log('Dry-run only. Use --apply to update sourceType fields.')
    return
  }

  const now = new Date().toISOString()
  for (const item of cardPlan) {
    await updateCloudDB(accessToken, `db.collection("cards").doc(${quote(item._id)}).update({data:${quote({
      sourceType: item.after,
      updateTime: now
    })}})`)
  }
  for (const item of feedbackPlan) {
    await updateCloudDB(accessToken, `db.collection("feedbacks").doc(${quote(item._id)}).update({data:${quote({
      ...item.after,
      updateTime: now
    })}})`)
  }
  for (const item of seriesPlan.updates) {
    await updateCloudDB(accessToken, `db.collection("my_series").doc(${quote(item._id)}).update({data:${quote({
      ...item.fields,
      updateTime: now
    })}})`)
  }
  for (const item of subsetPlan.updates) {
    await updateCloudDB(accessToken, `db.collection("my_series_subsets").doc(${quote(item._id)}).update({data:${quote({
      items: item.items,
      updateTime: now
    })}})`)
  }

  console.log(JSON.stringify({
    ok: true,
    cardsUpdated: cardPlan.length,
    feedbacksUpdated: feedbackPlan.length,
    seriesDocsUpdated: seriesPlan.updates.length,
    subsetDocsUpdated: subsetPlan.updates.length
  }, null, 2))
}

main().catch(err => {
  console.error(err.stack || err.message || err)
  process.exit(1)
})
