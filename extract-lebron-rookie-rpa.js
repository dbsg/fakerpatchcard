const https = require('https')
const fs = require('fs')
const path = require('path')
const progressData = require('../miniprogram-card/utils/collectionProgress')

const APPID = 'wx13497267f3b92c0f'
const CLOUD_ENV = 'cloudbase-1g5rcsava7547769'
const ENV_PATH = path.join(__dirname, '.env')

const SOURCE_SERIES_NAME = '勒布朗 经典球星卡'
const TARGET_SERIES_NAME = '勒布朗 新秀卡'
const TARGET_SUBSET_NAME = 'RPA /99'

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

function buildStatsFromItems(items) {
  return progressData.buildChecklistProgressStats(items || {})
}

function toSeriesStats(items) {
  const stats = buildStatsFromItems(items)
  return {
    listCollectedCount: stats.listCollectedCount,
    listTotalCount: stats.listTotalCount,
    listProgress: stats.listProgress,
    listImageCount: stats.listImageCount,
    listRecentImages: stats.listRecentImages,
    listIsFree: false
  }
}

function cloneTargetItem(item) {
  return {
    ...item,
    subset: TARGET_SUBSET_NAME,
    text: '',
    printRun: 99,
    completionTarget: 99,
    images: Array.isArray(item.images) ? item.images : []
  }
}

function getItemsFromDocs(subsetDocs) {
  return subsetDocs.flatMap(doc => doc.items || [])
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

async function findSeriesByName(accessToken, name) {
  const result = await queryCloudDB(accessToken, `db.collection("my_series").where({name:${quote(name)}}).limit(2).get()`)
  return result.data.map(item => JSON.parse(item))
}

async function main() {
  const apply = process.argv.includes('--apply')
  const env = loadEnv()
  if (!env.APP_SECRET) throw new Error(`缺少 ${ENV_PATH} 中的 APP_SECRET`)

  const accessToken = await getAccessToken(env.APP_SECRET)
  const [sourceMatches, targetMatches, allSubsetDocs] = await Promise.all([
    findSeriesByName(accessToken, SOURCE_SERIES_NAME),
    findSeriesByName(accessToken, TARGET_SERIES_NAME),
    fetchAll(accessToken, 'my_series_subsets')
  ])

  if (sourceMatches.length !== 1) throw new Error(`源图鉴匹配数量异常: ${sourceMatches.length}`)
  if (targetMatches.length > 1) throw new Error(`目标图鉴重复: ${targetMatches.length}`)

  const sourceSeries = sourceMatches[0]
  const sourceDocs = allSubsetDocs.filter(doc => doc.seriesId === sourceSeries._id)
  const targetDoc = sourceDocs.find(doc => doc.subset === TARGET_SUBSET_NAME)
  if (!targetDoc) throw new Error(`源图鉴没有找到子系列: ${TARGET_SUBSET_NAME}`)

  const targetItems = (targetDoc.items || []).filter(item => (item.subset || targetDoc.subset) === TARGET_SUBSET_NAME)
  if (targetItems.length !== 1) throw new Error(`目标卡种数量异常: ${targetItems.length}`)

  const movedItem = cloneTargetItem(targetItems[0])
  const targetExistingSeries = targetMatches[0] || null
  const targetExistingDocs = targetExistingSeries
    ? allSubsetDocs.filter(doc => doc.seriesId === targetExistingSeries._id)
    : []
  const targetExistingRpaDoc = targetExistingDocs.find(doc => doc.subset === TARGET_SUBSET_NAME)

  const sourceDocsAfter = sourceDocs.filter(doc => doc._id !== targetDoc._id)
  const sourceItemsAfter = getItemsFromDocs(sourceDocsAfter)
  const targetItemsAfter = [movedItem]
  const sourceStatsAfter = toSeriesStats(sourceItemsAfter)
  const targetStatsAfter = toSeriesStats(targetItemsAfter)
  const now = new Date().toISOString()

  const plan = {
    mode: apply ? 'apply' : 'dry-run',
    source: {
      name: sourceSeries.name,
      id: sourceSeries._id,
      removeSubsetDocId: targetDoc._id,
      beforeSubsetCount: sourceDocs.length,
      afterSubsetCount: sourceDocsAfter.length,
      afterStats: sourceStatsAfter
    },
    target: {
      name: TARGET_SERIES_NAME,
      exists: !!targetExistingSeries,
      id: targetExistingSeries && targetExistingSeries._id,
      subsetDocExists: !!targetExistingRpaDoc,
      cardName: TARGET_SUBSET_NAME,
      imageCount: movedItem.images.length,
      printRun: movedItem.printRun,
      stats: targetStatsAfter
    }
  }

  console.log(JSON.stringify(plan, null, 2))

  if (!apply) {
    console.log('Dry-run only. Use --apply to create/update target series and remove source subset.')
    return
  }

  let targetSeriesId
  if (!targetExistingSeries) {
    await addSeriesDoc(accessToken, {
      name: TARGET_SERIES_NAME,
      description: '',
      hasSubset: true,
      subsetType: '',
      cardType: '',
      seriesLevel: 2,
      checklistComplete: true,
      totalCards: 1,
      freeImages: [],
      creatorOpenid: movedItem.creatorOpenid || sourceSeries.creatorOpenid || '',
      createTime: now,
      updateTime: now,
      ...targetStatsAfter
    })
    const created = await findSeriesByName(accessToken, TARGET_SERIES_NAME)
    if (created.length !== 1) throw new Error(`创建目标图鉴后查询数量异常: ${created.length}`)
    targetSeriesId = created[0]._id
  } else {
    targetSeriesId = targetExistingSeries._id
    await updateSeriesDoc(accessToken, targetSeriesId, {
      name: TARGET_SERIES_NAME,
      hasSubset: true,
      subsetType: '',
      cardType: '',
      seriesLevel: 2,
      checklistComplete: true,
      totalCards: 1,
      freeImages: [],
      ...targetStatsAfter
    })
  }

  if (targetExistingRpaDoc) {
    await updateSubsetDoc(accessToken, targetExistingRpaDoc._id, {
      seriesId: targetSeriesId,
      subset: TARGET_SUBSET_NAME,
      order: 0,
      items: targetItemsAfter
    })
  } else {
    await addSubsetDoc(accessToken, {
      seriesId: targetSeriesId,
      subset: TARGET_SUBSET_NAME,
      order: 0,
      items: targetItemsAfter,
      createTime: now,
      updateTime: now
    })
  }

  await deleteSubsetDoc(accessToken, targetDoc._id)
  await updateSeriesDoc(accessToken, sourceSeries._id, {
    totalCards: sourceItemsAfter.length,
    hasSubset: true,
    freeImages: [],
    ...sourceStatsAfter
  })

  console.log(JSON.stringify({
    ok: true,
    targetSeriesId,
    movedImages: movedItem.images.length,
    removedSourceSubsetDocId: targetDoc._id
  }, null, 2))
}

main().catch(err => {
  console.error(err.message || err)
  process.exit(1)
})
