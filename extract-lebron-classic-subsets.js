const https = require('https')
const fs = require('fs')
const path = require('path')
const progressData = require('../miniprogram-card/utils/collectionProgress')

const APPID = 'wx13497267f3b92c0f'
const CLOUD_ENV = 'cloudbase-1g5rcsava7547769'
const ENV_PATH = path.join(__dirname, '.env')

const SOURCE_SERIES_NAME = '勒布朗 经典球星卡'

const TARGETS = [
  {
    sourceSubset: '画布',
    targetName: '勒布朗 油画 画布',
    description: '以勒布朗·詹姆斯 Canvas/画布题材为核心的图鉴，收录不同时期油画质感与艺术化卡面，是勒布朗形象类收藏中辨识度很高的一条线。'
  },
  {
    sourceSubset: 'Downtown',
    targetName: '勒布朗 downtown',
    description: '收录勒布朗·詹姆斯 Downtown 题材卡，围绕城市地标、漫画感视觉和球星叙事展开，是现代 Panini 插卡体系里人气极高的收藏分支。'
  },
  {
    sourceSubset: 'Gold Prizm',
    targetName: '勒布朗 Prizm 金折',
    description: '收录勒布朗·詹姆斯 Prizm Gold 金折题材卡，Prizm 代表性的金色折射与低编属性结合，是其现代折射卡收藏中的核心高端线。'
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
    const page = result.data.map(item => JSON.parse(item))
    docs.push(...page)
    if (page.length < 100) break
  }
  return docs
}

async function findSeriesByName(accessToken, name) {
  const result = await queryCloudDB(accessToken, `db.collection("my_series").where({name:${quote(name)}}).limit(2).get()`)
  return result.data.map(item => JSON.parse(item))
}

function allItems(docs) {
  return docs.flatMap(doc => doc.items || [])
}

function imageUrl(img) {
  return typeof img === 'string' ? img : (img && img.url) || ''
}

function uniqueImages(images) {
  const seen = new Set()
  const result = []
  images.forEach(img => {
    const url = imageUrl(img)
    if (!url || seen.has(url)) return
    seen.add(url)
    result.push(img)
  })
  return result
}

function buildStats(items) {
  return progressData.buildChecklistProgressStats(items || [])
}

function buildSeriesFields({ name, description, creatorOpenid, items, now }) {
  const stats = buildStats(items)
  return {
    name,
    description,
    hasSubset: true,
    subsetType: '',
    cardType: '',
    seriesLevel: 2,
    checklistComplete: true,
    totalCards: stats.totalCards,
    freeImages: [],
    creatorOpenid: creatorOpenid || '',
    createTime: now,
    updateTime: now,
    listCollectedCount: stats.listCollectedCount,
    listTotalCount: stats.listTotalCount,
    listProgress: stats.listProgress,
    listImageCount: stats.listImageCount,
    listRecentImages: stats.listRecentImages,
    listIsFree: false
  }
}

function buildTargetItem(target, sourceDoc) {
  const sourceItems = sourceDoc.items || []
  const images = uniqueImages(sourceItems.flatMap(item => item.images || []))
  const creatorOpenid = sourceItems.find(item => item.creatorOpenid) && sourceItems.find(item => item.creatorOpenid).creatorOpenid
  return {
    itemId: `item_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`,
    text: '',
    subset: target.targetName,
    creatorOpenid: creatorOpenid || sourceDoc._openid || '',
    images,
    cardId: null,
    collected: false,
    completionTarget: 1
  }
}

async function addSeriesDoc(accessToken, fields) {
  return addCloudDB(accessToken, `db.collection("my_series").add({data:[${JSON.stringify(fields)}]})`)
}

async function addSubsetDoc(accessToken, fields) {
  return addCloudDB(accessToken, `db.collection("my_series_subsets").add({data:[${JSON.stringify(fields)}]})`)
}

async function updateSeriesDoc(accessToken, seriesId, fields) {
  return updateCloudDB(accessToken, `db.collection("my_series").doc(${quote(seriesId)}).update({
    data: ${JSON.stringify({ ...fields, updateTime: new Date().toISOString() })}
  })`)
}

async function updateSubsetDoc(accessToken, docId, fields) {
  return updateCloudDB(accessToken, `db.collection("my_series_subsets").doc(${quote(docId)}).update({
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
  const [sourceMatches, allSubsetDocs] = await Promise.all([
    findSeriesByName(accessToken, SOURCE_SERIES_NAME),
    fetchAll(accessToken, 'my_series_subsets')
  ])

  if (sourceMatches.length !== 1) throw new Error(`源图鉴匹配数量异常: ${sourceMatches.length}`)
  const sourceSeries = sourceMatches[0]
  const sourceDocs = allSubsetDocs.filter(doc => doc.seriesId === sourceSeries._id)
  const now = new Date().toISOString()

  const preparedTargets = []
  for (const target of TARGETS) {
    const sourceDoc = sourceDocs.find(doc => doc.subset === target.sourceSubset)
    if (!sourceDoc) throw new Error(`源图鉴没有找到子系列: ${target.sourceSubset}`)

    const targetMatches = await findSeriesByName(accessToken, target.targetName)
    if (targetMatches.length > 1) throw new Error(`目标图鉴重复: ${target.targetName}`)
    const targetSeries = targetMatches[0] || null
    const targetDocs = targetSeries ? allSubsetDocs.filter(doc => doc.seriesId === targetSeries._id) : []
    if (targetDocs.length > 1) throw new Error(`目标图鉴已有多个子系列，暂不自动覆盖: ${target.targetName}`)

    const item = buildTargetItem(target, sourceDoc)
    const items = [item]
    const stats = buildStats(items)

    preparedTargets.push({
      ...target,
      sourceDoc,
      targetSeries,
      targetSubsetDoc: targetDocs[0] || null,
      item,
      items,
      stats
    })
  }

  const removeDocIds = new Set(preparedTargets.map(item => item.sourceDoc._id))
  const sourceDocsAfter = sourceDocs.filter(doc => !removeDocIds.has(doc._id))
  const sourceItemsAfter = allItems(sourceDocsAfter)
  const sourceStatsAfter = buildStats(sourceItemsAfter)

  const plan = {
    mode: apply ? 'apply' : 'dry-run',
    source: {
      id: sourceSeries._id,
      name: sourceSeries.name,
      beforeSubsetCount: sourceDocs.length,
      removeSubsets: preparedTargets.map(item => ({
        subset: item.sourceSubset,
        docId: item.sourceDoc._id,
        imageCount: item.stats.listImageCount
      })),
      afterSubsetCount: sourceDocsAfter.length,
      afterStats: sourceStatsAfter
    },
    targets: preparedTargets.map(item => ({
      sourceSubset: item.sourceSubset,
      targetName: item.targetName,
      exists: !!item.targetSeries,
      targetSeriesId: item.targetSeries && item.targetSeries._id,
      targetSubsetDocId: item.targetSubsetDoc && item.targetSubsetDoc._id,
      imageCount: item.stats.listImageCount,
      stats: item.stats
    }))
  }

  console.log(JSON.stringify(plan, null, 2))

  if (!apply) {
    console.log('Dry-run only. Use --apply to create/update target series and remove source subsets.')
    return
  }

  for (const item of preparedTargets) {
    let targetSeriesId = item.targetSeries && item.targetSeries._id
    const seriesFields = buildSeriesFields({
      name: item.targetName,
      description: item.description,
      creatorOpenid: item.item.creatorOpenid || sourceSeries.creatorOpenid,
      items: item.items,
      now
    })

    if (!targetSeriesId) {
      await addSeriesDoc(accessToken, seriesFields)
      const created = await findSeriesByName(accessToken, item.targetName)
      if (created.length !== 1) throw new Error(`创建目标图鉴后查询数量异常: ${item.targetName} ${created.length}`)
      targetSeriesId = created[0]._id
    } else {
      await updateSeriesDoc(accessToken, targetSeriesId, seriesFields)
    }

    const subsetFields = {
      seriesId: targetSeriesId,
      subset: item.targetName,
      order: 0,
      items: item.items,
      createTime: now,
      updateTime: now
    }

    if (item.targetSubsetDoc) {
      await updateSubsetDoc(accessToken, item.targetSubsetDoc._id, subsetFields)
    } else {
      await addSubsetDoc(accessToken, subsetFields)
    }
  }

  for (const item of preparedTargets) {
    await deleteSubsetDoc(accessToken, item.sourceDoc._id)
  }

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
    createdOrUpdated: preparedTargets.map(item => item.targetName),
    removedSourceSubsetDocIds: preparedTargets.map(item => item.sourceDoc._id)
  }, null, 2))
}

main().catch(err => {
  console.error(err.message || err)
  process.exit(1)
})
