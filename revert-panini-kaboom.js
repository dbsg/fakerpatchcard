const https = require('https')
const fs = require('fs')
const path = require('path')

const APPID = 'wx13497267f3b92c0f'
const CLOUD_ENV = 'cloudbase-1g5rcsava7547769'
const ENV_PATH = path.join(__dirname, '.env')
const TARGET_SERIES_NAME = 'Panini Kaboom!'
const ORIGINAL_SUBSETS = [
  '勒布朗·詹姆斯 / LeBron James',
  '卢卡·东契奇 / Luka Doncic',
  '蒂姆·邓肯 / Tim Duncan',
  '科比·布莱恩特 / Kobe Bryant',
  '斯蒂芬·库里 / Stephen Curry',
  '维克托·文班亚马 / Victor Wembanyama',
  '谢伊·吉尔杰斯-亚历山大 / Shai Gilgeous-Alexander',
  '阿门·汤普森 / Amen Thompson',
  '杰森·塔图姆 / Jayson Tatum',
  '安东尼·爱德华兹 / Anthony Edwards',
  '沙奎尔·奥尼尔 / Shaquille O\'Neal',
  '贾·莫兰特 / Ja Morant',
  '凯德·坎宁安 / Cade Cunningham',
  '加里·佩顿 / Gary Payton',
  '朱利叶斯·欧文 / Julius Erving',
  '尼古拉·约基奇 / Nikola Jokic',
  '朗佐·鲍尔 / Lonzo Ball',
  '凯尔·库兹马 / Kyle Kuzma',
  '科扬特·乔治 / Keyonte George'
]
const LEGACY_DUPLICATE_SUBSETS = {
  '卢卡·东契奇 / Luka Doncic': 'luka',
  '蒂姆·邓肯 / Tim Duncan': 'tim'
}

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
        } catch (_) {
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

async function callCloudApi(accessToken, apiName, body) {
  const url = `https://api.weixin.qq.com/tcb/${apiName}?access_token=${accessToken}`
  const result = await httpPost(url, { env: CLOUD_ENV, ...body })
  if (result.errcode !== 0) {
    throw new Error(`${apiName} 失败: ${result.errmsg} (${result.errcode})`)
  }
  return result
}

async function queryCloudDB(accessToken, query) {
  return callCloudApi(accessToken, 'databasequery', { query })
}

async function updateCloudDB(accessToken, query) {
  return callCloudApi(accessToken, 'databaseupdate', { query })
}

async function deleteCloudDB(accessToken, query) {
  return callCloudApi(accessToken, 'databasedelete', { query })
}

async function deleteCloudFiles(accessToken, fileList) {
  if (!fileList.length) return { fileList: [] }
  return callCloudApi(accessToken, 'batchdeletefile', { fileid_list: fileList })
}

async function deleteCloudFilesInBatches(accessToken, fileList, batchSize = 50) {
  const chunks = []
  for (let i = 0; i < fileList.length; i += batchSize) {
    chunks.push(fileList.slice(i, i + batchSize))
  }
  const results = []
  for (const chunk of chunks) {
    results.push(await deleteCloudFiles(accessToken, chunk))
  }
  return results
}

function quote(value) {
  return JSON.stringify(value)
}

function parseArgs(argv) {
  const args = argv.slice(2)
  return {
    apply: args.includes('--apply')
  }
}

function normalizeOwnedBy(ownedBy) {
  return [...new Set((Array.isArray(ownedBy) ? ownedBy : []).filter(Boolean))]
}

function normalizeCardKind(value) {
  const raw = String(value || '').trim()
  if (!raw) return ''
  return raw.split(/\s+/).map(token => {
    if (/^[A-Za-z]+$/.test(token)) {
      return token.slice(0, 1).toUpperCase() + token.slice(1).toLowerCase()
    }
    return token
  }).join(' ')
}

function normalizeImage(img) {
  if (!img) return null
  if (typeof img === 'string') {
    return { url: img, ownedBy: [], number: '', year: '', cardKind: '', uploaderOpenid: '' }
  }
  return {
    url: img.url || '',
    ownedBy: normalizeOwnedBy(img.ownedBy),
    number: String(img.number || '').trim(),
    year: String(img.year || '').trim(),
    cardKind: normalizeCardKind(img.cardKind),
    uploaderOpenid: img.uploaderOpenid || ''
  }
}

function uniqueImages(images) {
  const seen = new Set()
  const result = []
  for (const image of images) {
    const normalized = normalizeImage(image)
    if (!normalized || !normalized.url || seen.has(normalized.url)) continue
    seen.add(normalized.url)
    result.push(normalized)
  }
  return result
}

function buildLegacyItem(subset, text, images, creatorOpenid) {
  return {
    itemId: '',
    text,
    subset,
    collected: false,
    cardId: null,
    playerId: null,
    creatorOpenid: creatorOpenid || '',
    images
  }
}

function buildLegacyItems(subset, images, creatorOpenid) {
  const cleanedImages = uniqueImages(images)
  if (LEGACY_DUPLICATE_SUBSETS[subset] === 'luka') {
    return [
      buildLegacyItem(subset, '', cleanedImages, creatorOpenid),
      buildLegacyItem(subset, subset, [], creatorOpenid)
    ]
  }
  if (LEGACY_DUPLICATE_SUBSETS[subset] === 'tim') {
    return [
      buildLegacyItem(subset, '', [], creatorOpenid),
      buildLegacyItem(subset, '', cleanedImages, creatorOpenid)
    ]
  }
  return [buildLegacyItem(subset, '', cleanedImages, creatorOpenid)]
}

function buildSeriesStats(allItems) {
  const urls = []
  allItems.forEach(item => {
    ;(item.images || []).forEach(img => {
      if (img.url) urls.push(img.url)
    })
  })
  const listCollectedCount = allItems.filter(item => (item.images || []).length > 0).length
  const listTotalCount = allItems.length
  return {
    totalCards: allItems.length,
    listCollectedCount,
    listTotalCount,
    listProgress: listTotalCount ? Math.round(listCollectedCount / listTotalCount * 100) : 0,
    listImageCount: urls.length,
    listRecentImages: urls.slice(-5).reverse()
  }
}

async function fetchTargetSeries(accessToken) {
  const seriesResult = await queryCloudDB(
    accessToken,
    `db.collection("my_series").where({ name: ${quote(TARGET_SERIES_NAME)} }).get()`
  )
  const seriesDocs = seriesResult.data.map(item => JSON.parse(item))
  if (seriesDocs.length === 0) throw new Error(`未找到图鉴: ${TARGET_SERIES_NAME}`)
  if (seriesDocs.length > 1) throw new Error(`找到多条同名图鉴: ${TARGET_SERIES_NAME}`)

  const series = seriesDocs[0]
  const subsetDocs = []
  const pageSize = 100
  for (let skip = 0; ; skip += pageSize) {
    const subsetResult = await queryCloudDB(
      accessToken,
      `db.collection("my_series_subsets").where({ seriesId: ${quote(series._id)} }).skip(${skip}).limit(${pageSize}).get()`
    )
    const pageDocs = subsetResult.data.map(item => JSON.parse(item))
    subsetDocs.push(...pageDocs)
    if (pageDocs.length < pageSize) break
  }
  return { series, subsetDocs }
}

function isUploadedThisRound(seriesId, url) {
  const value = String(url || '')
  return (
    value.includes(`/collection-series/${seriesId}/manual_`) ||
    value.includes(`/collection-series/${seriesId}/batch_`)
  )
}

function collectCreatorOpenid(doc, seriesCreatorOpenid) {
  return (doc.items || []).map(item => item.creatorOpenid || '').find(Boolean) || seriesCreatorOpenid || ''
}

function collectAllImages(doc) {
  return (doc.items || []).flatMap(item => item.images || []).map(normalizeImage).filter(Boolean)
}

async function main() {
  const { apply } = parseArgs(process.argv)
  const env = loadEnv()
  const appSecret = env.APP_SECRET || process.env.APP_SECRET
  if (!appSecret) {
    throw new Error('未找到 APP_SECRET，请先在 card/.env 配置')
  }

  const token = await getAccessToken(appSecret)
  const { series, subsetDocs } = await fetchTargetSeries(token)
  const originalSubsetSet = new Set(ORIGINAL_SUBSETS)
  const creatorOpenid = series.creatorOpenid || ''

  const plan = {
    seriesId: series._id,
    seriesName: series.name,
    dryRun: !apply,
    updateDocs: [],
    deleteDocs: [],
    deleteFileIds: [],
    warnings: []
  }

  const docsBySubset = new Map()
  subsetDocs.forEach(doc => {
    if (!docsBySubset.has(doc.subset || '')) docsBySubset.set(doc.subset || '', [])
    docsBySubset.get(doc.subset || '').push(doc)
  })

  for (const subset of ORIGINAL_SUBSETS) {
    const docs = docsBySubset.get(subset) || []
    if (docs.length === 0) {
      throw new Error(`缺少原始子系列，无法安全回滚: ${subset}`)
    }
    if (docs.length > 1) {
      throw new Error(`发现重复子系列文档，无法安全回滚: ${subset}`)
    }
  }

  for (const doc of subsetDocs) {
    const subset = doc.subset || ''
    const allImages = collectAllImages(doc)
    const uploadedImages = allImages.filter(img => isUploadedThisRound(series._id, img.url))
    const remainingImages = allImages.filter(img => !isUploadedThisRound(series._id, img.url))

    uploadedImages.forEach(img => {
      if (img.url) plan.deleteFileIds.push(img.url)
    })

    if (!originalSubsetSet.has(subset)) {
      const foreignImages = remainingImages.filter(img => img.url)
      if (foreignImages.length > 0) {
        plan.warnings.push(`新增子系列 ${subset} 含有非本轮上传图片，已停止自动删除`)
        continue
      }
      plan.deleteDocs.push({
        docId: doc._id,
        subset,
        removedImageCount: uploadedImages.length
      })
      continue
    }

    const legacyItems = buildLegacyItems(
      subset,
      remainingImages,
      collectCreatorOpenid(doc, creatorOpenid)
    )

    plan.updateDocs.push({
      docId: doc._id,
      subset,
      removedImageCount: uploadedImages.length,
      items: legacyItems
    })
  }

  const dedupFileIds = [...new Set(plan.deleteFileIds)].filter(Boolean)
  plan.deleteFileIds = dedupFileIds

  const allRestoredItems = plan.updateDocs.flatMap(entry => entry.items)
  const stats = buildSeriesStats(allRestoredItems)
  const seriesUpdate = {
    hasSubset: true,
    subsetType: 'player',
    cardType: '',
    seriesLevel: 2,
    checklist: [],
    freeImages: [],
    presetCardKinds: [],
    presetNumbers: [],
    ...stats,
    updateTime: new Date().toISOString()
  }

  if (apply) {
    for (const entry of plan.updateDocs) {
      await updateCloudDB(
        token,
        `db.collection("my_series_subsets").doc(${quote(entry.docId)}).update({
          data: {
            items: ${JSON.stringify(entry.items)},
            updateTime: ${quote(new Date().toISOString())}
          }
        })`
      )
    }

    for (const entry of plan.deleteDocs) {
      await deleteCloudDB(
        token,
        `db.collection("my_series_subsets").doc(${quote(entry.docId)}).remove()`
      )
    }

    if (plan.deleteFileIds.length > 0) {
      await deleteCloudFilesInBatches(token, plan.deleteFileIds)
    }

    await updateCloudDB(
      token,
      `db.collection("my_series").doc(${quote(series._id)}).update({
        data: ${JSON.stringify(seriesUpdate)}
      })`
    )
  }

  console.log(JSON.stringify({
    ok: true,
    dryRun: !apply,
    seriesId: series._id,
    seriesName: series.name,
    updateDocCount: plan.updateDocs.length,
    deleteDocCount: plan.deleteDocs.length,
    deleteFileCount: plan.deleteFileIds.length,
    warnings: plan.warnings,
    restoredStats: stats,
    originalSubsetCount: ORIGINAL_SUBSETS.length,
    restoredItemCount: allRestoredItems.length,
    examples: {
      deletedSubsets: plan.deleteDocs.slice(0, 10).map(item => item.subset),
      deletedFiles: plan.deleteFileIds.slice(0, 10),
      updatedSubsets: plan.updateDocs.slice(0, 10).map(item => item.subset)
    }
  }, null, 2))
}

main().catch(err => {
  console.error(err.message || err)
  process.exit(1)
})
