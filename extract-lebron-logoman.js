const https = require('https')
const fs = require('fs')
const path = require('path')
const progressData = require('../miniprogram-card/utils/collectionProgress')

const APPID = 'wx13497267f3b92c0f'
const CLOUD_ENV = 'cloudbase-1g5rcsava7547769'
const ENV_PATH = path.join(__dirname, '.env')

const SOURCE_SERIES_NAME = '勒布朗 经典球星卡'
const SOURCE_SUBSET = 'Logoman'
const TARGET_SERIES_NAME = '勒布朗 Logoman'
const REFERENCE_SERIES_NAME = '勒布朗 Prizm 金折'
const ADMIN_OPENID = 'oaQG05Ax1I_QRhOkD4lwqOXEucV8'
const TARGET_DESCRIPTION = '收录勒布朗·詹姆斯 Logoman 题材卡，围绕 NBA 标志切割、队标/联盟标识和高端 1/1 配置展开，是勒布朗实物切割收藏中的核心高端线。'

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

function parseDocs(result) {
  return (result.data || []).map(item => JSON.parse(item))
}

async function queryCloudDB(accessToken, query) {
  return callCloudApi(accessToken, 'databasequery', { query })
}

async function updateCloudDB(accessToken, query) {
  return callCloudApi(accessToken, 'databaseupdate', { query })
}

async function addCloudDB(accessToken, query) {
  return callCloudApi(accessToken, 'databaseadd', { query })
}

async function deleteCloudDB(accessToken, query) {
  return callCloudApi(accessToken, 'databasedelete', { query })
}

async function fetchAll(accessToken, collectionName) {
  const docs = []
  for (let skip = 0; ; skip += 100) {
    const result = await queryCloudDB(accessToken, `db.collection(${quote(collectionName)}).skip(${skip}).limit(100).get()`)
    const page = parseDocs(result)
    docs.push(...page)
    if (page.length < 100) break
  }
  return docs
}

async function findSeriesByName(accessToken, name) {
  const result = await queryCloudDB(accessToken, `db.collection("my_series").where({name:${quote(name)}}).limit(2).get()`)
  return parseDocs(result)
}

function imageUrl(img) {
  return typeof img === 'string' ? img : (img && img.url) || ''
}

function normalizeFreeImage(img) {
  const normalized = typeof img === 'string' ? { url: img } : { ...(img || {}) }
  const cardFeatures = Array.isArray(normalized.cardFeatures) ? [...normalized.cardFeatures] : []
  if (!cardFeatures.includes('logoman')) cardFeatures.push('logoman')
  return {
    ...normalized,
    url: imageUrl(normalized),
    ownedBy: Array.isArray(normalized.ownedBy) ? normalized.ownedBy : [],
    ownerContactVisibleBy: normalized.ownerContactVisibleBy || {},
    ownerMetaBy: normalized.ownerMetaBy || {},
    uploaderOpenid: normalized.uploaderOpenid || ADMIN_OPENID,
    sourceType: normalized.sourceType || 'user_photo',
    sourceNote: normalized.sourceNote || '',
    cardFeatures
  }
}

function uniqueImages(images) {
  const seen = new Set()
  const result = []
  images.forEach(img => {
    const normalized = normalizeFreeImage(img)
    if (!normalized.url || seen.has(normalized.url)) return
    seen.add(normalized.url)
    result.push(normalized)
  })
  return result
}

function buildFreeStats(freeImages) {
  const urls = freeImages.map(imageUrl).filter(Boolean)
  return {
    totalCards: urls.length,
    listCollectedCount: urls.length,
    listTotalCount: urls.length,
    listProgress: urls.length > 0 ? 100 : 0,
    listImageCount: urls.length,
    listRecentImages: urls.slice(-5).reverse(),
    listIsFree: true
  }
}

function buildChecklistStats(subsetDocs) {
  const items = subsetDocs.flatMap(doc => doc.items || [])
  return {
    totalCards: progressData.buildChecklistProgressStats(items).totalCards,
    ...progressData.buildChecklistProgressStats(items)
  }
}

function buildTargetSeriesFields(referenceSeries, freeImages, now) {
  const stats = buildFreeStats(freeImages)
  return {
    name: TARGET_SERIES_NAME,
    description: TARGET_DESCRIPTION,
    hasSubset: false,
    subsetType: '',
    cardType: '',
    seriesLevel: referenceSeries.seriesLevel || 1,
    checklistComplete: false,
    freeImages,
    creatorOpenid: referenceSeries.creatorOpenid || ADMIN_OPENID,
    accessType: referenceSeries.accessType || 'public',
    curationStatus: referenceSeries.curationStatus || 'curating',
    createTime: now,
    updateTime: now,
    ...stats
  }
}

async function addSeriesDoc(accessToken, fields) {
  return addCloudDB(accessToken, `db.collection("my_series").add({data:[${JSON.stringify(fields)}]})`)
}

async function updateSeriesDoc(accessToken, seriesId, fields) {
  return updateCloudDB(accessToken, `db.collection("my_series").doc(${quote(seriesId)}).update({
    data: ${JSON.stringify({ ...fields, updateTime: new Date().toISOString() })}
  })`)
}

async function deleteSubsetDoc(accessToken, docId) {
  return deleteCloudDB(accessToken, `db.collection("my_series_subsets").doc(${quote(docId)}).remove()`)
}

async function main() {
  const apply = process.argv.includes('--apply')
  const env = loadEnv()
  if (!env.APP_SECRET) throw new Error(`缺少 ${ENV_PATH} 中的 APP_SECRET`)

  const accessToken = await getAccessToken(env.APP_SECRET)
  const [sourceMatches, targetMatches, referenceMatches, allSubsetDocs] = await Promise.all([
    findSeriesByName(accessToken, SOURCE_SERIES_NAME),
    findSeriesByName(accessToken, TARGET_SERIES_NAME),
    findSeriesByName(accessToken, REFERENCE_SERIES_NAME),
    fetchAll(accessToken, 'my_series_subsets')
  ])

  if (sourceMatches.length !== 1) throw new Error(`源图鉴匹配数量异常: ${sourceMatches.length}`)
  if (targetMatches.length > 1) throw new Error(`目标图鉴重复: ${TARGET_SERIES_NAME}`)
  if (referenceMatches.length !== 1) throw new Error(`参考图鉴匹配数量异常: ${referenceMatches.length}`)

  const sourceSeries = sourceMatches[0]
  const targetSeries = targetMatches[0] || null
  const referenceSeries = referenceMatches[0]
  const sourceDocs = allSubsetDocs.filter(doc => doc.seriesId === sourceSeries._id)
  const sourceDoc = sourceDocs.find(doc => doc.subset === SOURCE_SUBSET)
  if (!sourceDoc) throw new Error(`源图鉴没有找到子系列: ${SOURCE_SUBSET}`)

  const targetSubsetDocs = targetSeries ? allSubsetDocs.filter(doc => doc.seriesId === targetSeries._id) : []
  if (targetSubsetDocs.length) throw new Error(`目标图鉴已存在子集文档，不符合 ${REFERENCE_SERIES_NAME} 的自由图片结构`)

  const freeImages = uniqueImages((sourceDoc.items || []).flatMap(item => item.images || []))
  const sourceDocsAfter = sourceDocs.filter(doc => doc._id !== sourceDoc._id)
  const sourceStatsAfter = buildChecklistStats(sourceDocsAfter)
  const now = new Date().toISOString()
  const targetFields = buildTargetSeriesFields(referenceSeries, freeImages, now)

  const plan = {
    mode: apply ? 'apply' : 'dry-run',
    reference: {
      id: referenceSeries._id,
      name: referenceSeries.name,
      hasSubset: !!referenceSeries.hasSubset,
      seriesLevel: referenceSeries.seriesLevel || 1,
      freeImageCount: Array.isArray(referenceSeries.freeImages) ? referenceSeries.freeImages.length : 0
    },
    source: {
      id: sourceSeries._id,
      name: sourceSeries.name,
      beforeSubsetCount: sourceDocs.length,
      removeSubset: {
        subset: sourceDoc.subset,
        docId: sourceDoc._id,
        itemCount: (sourceDoc.items || []).length,
        imageCount: freeImages.length
      },
      afterSubsetCount: sourceDocsAfter.length,
      afterStats: sourceStatsAfter
    },
    target: {
      name: TARGET_SERIES_NAME,
      exists: !!targetSeries,
      targetSeriesId: targetSeries && targetSeries._id,
      hasSubset: targetFields.hasSubset,
      seriesLevel: targetFields.seriesLevel,
      freeImageCount: freeImages.length,
      stats: buildFreeStats(freeImages),
      sampleImages: freeImages.slice(0, 5).map(img => ({
        year: img.year || '',
        cardKind: img.cardKind || '',
        number: img.number || '',
        url: img.url
      }))
    }
  }

  console.log(JSON.stringify(plan, null, 2))

  if (!apply) {
    console.log('Dry-run only. Use --apply to create/update target series and remove source Logoman subset.')
    return
  }

  let targetSeriesId = targetSeries && targetSeries._id
  if (!targetSeriesId) {
    await addSeriesDoc(accessToken, targetFields)
    const created = await findSeriesByName(accessToken, TARGET_SERIES_NAME)
    if (created.length !== 1) throw new Error(`创建目标图鉴后查询数量异常: ${TARGET_SERIES_NAME} ${created.length}`)
    targetSeriesId = created[0]._id
  } else {
    const { createTime, ...fieldsForUpdate } = targetFields
    await updateSeriesDoc(accessToken, targetSeriesId, fieldsForUpdate)
  }

  await deleteSubsetDoc(accessToken, sourceDoc._id)
  await updateSeriesDoc(accessToken, sourceSeries._id, {
    totalCards: sourceStatsAfter.totalCards,
    listCollectedCount: sourceStatsAfter.listCollectedCount,
    listTotalCount: sourceStatsAfter.listTotalCount,
    listProgress: sourceStatsAfter.listProgress,
    listImageCount: sourceStatsAfter.listImageCount,
    listRecentImages: sourceStatsAfter.listRecentImages,
    listIsFree: false,
    freeImages: []
  })

  console.log(JSON.stringify({
    ok: true,
    sourceSeriesId: sourceSeries._id,
    targetSeriesId,
    targetName: TARGET_SERIES_NAME,
    movedImageCount: freeImages.length,
    removedSourceSubsetDocId: sourceDoc._id
  }, null, 2))
}

main().catch(err => {
  console.error(err.message || err)
  process.exit(1)
})
