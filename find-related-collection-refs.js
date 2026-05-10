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

function cleanText(value) {
  return String(value || '').trim()
}

function normalizeCompareText(value) {
  return cleanText(value).toLowerCase().replace(/[·\s_#\-/,，、]+/g, '')
}

function parseSeriesYear(name) {
  const match = cleanText(name).match(/\b(?:19|20)\d{2}(?:-\d{2})?\b/)
  return match ? match[0] : ''
}

function cleanCardNumber(value) {
  return cleanText(value).replace(/^#\s*/, '')
}

function getPrintRun(item) {
  const numeric = Number(item && item.printRun)
  if (numeric) return numeric
  const text = cleanText(item && item.text)
  const match = text.match(/#?\/\s*(\d{1,6})\s*$/)
  return match ? Number(match[1]) : 0
}

function displayNumber(number, printRun) {
  const cleaned = cleanCardNumber(number)
  if (!cleaned) return ''
  if (/\/\s*\d+/.test(cleaned)) return cleaned
  return printRun ? `${cleaned}/${printRun}` : cleaned
}

function buildCardDisplayText(item) {
  const text = cleanText(item && item.text)
  if (!text) return ''
  const printRun = getPrintRun(item)
  if (!printRun || /\/\s*[1-9]\d{0,5}\s*$/.test(text)) return text
  return `${text} /${printRun}`
}

function defaultInfoEnabled(series) {
  return !!(series && (series.defaultInfoEnabled === true || (
    series.defaultInfoEnabled == null &&
    (series.defaultPlayer || series.defaultPlayerCN || series.defaultYear || series.defaultBrand || series.defaultCardSeries || series.defaultCardKind)
  )))
}

function buildDisplayMeta(series, item, image) {
  const enabled = defaultInfoEnabled(series)
  const printRun = getPrintRun(item)
  const imagePlayer = cleanText(image && image.playerCN) || cleanText(image && image.player)
  const seriesPlayer = cleanText(series && series.defaultPlayerCN) || cleanText(series && series.defaultPlayer)
  const isFreeItem = !cleanText(item && item.subset) && cleanText(item && item.text) === '自由图片'
  const cardKind = cleanText(image && image.cardKind) ||
    cleanText(item && item.subset) ||
    cleanText(item && item.cardKind) ||
    (enabled ? cleanText(series && series.defaultCardKind) : '')
  const player = imagePlayer || (enabled ? seriesPlayer : '')
  const number = displayNumber(cleanCardNumber(image && image.number), printRun)
  const cardTitle = isFreeItem
    ? [player, cardKind, number].filter(Boolean).join(' ')
    : buildCardDisplayText(item)

  return {
    displayTitle: cardTitle,
    displayPlayer: player,
    displayYear: cleanText(image && image.year) || (enabled ? cleanText(series && series.defaultYear) : '') || parseSeriesYear(series && series.name),
    displayBrand: cleanText(image && image.brand) || (enabled ? cleanText(series && series.defaultBrand) : ''),
    displaySeries: cleanText(image && image.cardSeries) || (enabled ? cleanText(series && series.defaultCardSeries) : ''),
    displayCardKind: cardKind,
    displayCardVariant: cleanText(image && image.cardVariant),
    displayNumber: number,
    rawPlayer: cleanText(image && image.player),
    rawPlayerCN: cleanText(image && image.playerCN),
    rawNumber: cleanText(image && image.number)
  }
}

function collectionSearchText(series, item, imageMeta) {
  return [
    series && series.name,
    item && item.subset,
    item && item.text,
    imageMeta && imageMeta.displayTitle,
    imageMeta && imageMeta.displayPlayer,
    imageMeta && imageMeta.displayYear,
    imageMeta && imageMeta.displayBrand,
    imageMeta && imageMeta.displaySeries,
    imageMeta && imageMeta.displayCardKind,
    imageMeta && imageMeta.displayCardVariant,
    imageMeta && imageMeta.displayNumber
  ].map(normalizeCompareText).join(' ')
}

function referenceScore(card, searchText) {
  if (!searchText) return 0
  let score = 0
  const player = normalizeCompareText(card.player)
  const playerCN = normalizeCompareText(card.playerCN)
  const year = normalizeCompareText(card.year)
  const cardSeries = normalizeCompareText(card.series)
  const brand = normalizeCompareText(card.brand)
  const number = normalizeCompareText(card.number)
  if (player && searchText.includes(player)) score += 3
  else if (playerCN && searchText.includes(playerCN)) score += 3
  if (year && searchText.includes(year)) score += 2
  if (cardSeries && searchText.includes(cardSeries)) score += 2
  if (brand && searchText.includes(brand)) score += 1
  if (number && searchText.includes(number)) score += 1
  return score
}

function subsetDocsToChecklist(series, subsetDocs) {
  const result = []
  for (const doc of subsetDocs || []) {
    const docSubset = cleanText(doc.subset)
    const isBatch = docSubset.startsWith('_batch_')
    for (const item of (doc.items || [])) {
      result.push({
        ...item,
        subset: cleanText(item.subset) || (isBatch ? cleanText(item.subset) : docSubset)
      })
    }
  }
  if (!result.length) {
    for (const item of (series && series.checklist) || []) result.push(item)
  }
  return result
}

function imageLabel(series, item, meta) {
  const parts = [
    cleanText(item && item.subset),
    cleanText(meta && meta.displayTitle)
  ].filter(Boolean)
  return parts.join(' / ') || cleanText(series && series.name) || '未命名图鉴卡'
}

function statusLabel(card) {
  return card.status === 'suspected' ? '高度存疑' : '明确异常'
}

function categoryLabel(card) {
  const map = {
    'fake-patch': 'Patch 异常',
    'signature': '签字异常',
    'fake-card': '假卡',
    'numbering': '编号异常'
  }
  return map[card.category] || '鉴别资料'
}

function scanCandidates(seriesDocs, subsetDocs, cards) {
  const subsetsBySeriesId = new Map()
  subsetDocs.forEach(doc => {
    if (!doc.seriesId) return
    if (!subsetsBySeriesId.has(doc.seriesId)) subsetsBySeriesId.set(doc.seriesId, [])
    subsetsBySeriesId.get(doc.seriesId).push(doc)
  })

  const activeCards = cards.filter(card => card && card.deleted !== true)
  const candidates = []

  for (const series of seriesDocs) {
    const subsetItems = subsetDocsToChecklist(series, subsetsBySeriesId.get(series._id) || [])
    const allItems = [
      ...subsetItems,
      ...((series.freeImages || []).map((image, index) => ({
        itemId: `free_${index}`,
        text: '自由图片',
        subset: '',
        images: [image]
      })))
    ]

    for (const item of allItems) {
      for (const image of item.images || []) {
        if (!image || typeof image === 'string' || !image.url) continue
        const meta = buildDisplayMeta(series, item, image)
        const searchText = collectionSearchText(series, item, meta)
        const related = activeCards
          .map(card => ({ card, score: referenceScore(card, searchText) }))
          .filter(entry => entry.score >= 5)
          .sort((a, b) => b.score - a.score || Number(b.card.id || 0) - Number(a.card.id || 0))
          .slice(0, 3)

        if (!related.length) continue
        candidates.push({
          seriesId: series._id,
          seriesName: cleanText(series.name),
          imageId: cleanText(image.imageId),
          imageUrl: cleanText(image.url),
          itemId: cleanText(item.itemId),
          label: imageLabel(series, item, meta),
          meta,
          bestScore: related[0].score,
          relatedCount: related.length,
          related: related.map(({ card, score }) => ({
            score,
            id: card.id,
            player: cleanText(card.player),
            playerCN: cleanText(card.playerCN),
            year: cleanText(card.year),
            brand: cleanText(card.brand),
            series: cleanText(card.series),
            number: cleanText(card.number),
            category: categoryLabel(card),
            status: statusLabel(card)
          }))
        })
      }
    }
  }

  return candidates.sort((a, b) =>
    b.bestScore - a.bestScore ||
    b.relatedCount - a.relatedCount ||
    a.seriesName.localeCompare(b.seriesName, 'zh-Hans-CN')
  )
}

function parseArgs(argv) {
  const options = { limit: 20, keyword: '' }
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === '--limit') {
      options.limit = Number(argv[++i]) || options.limit
      continue
    }
    if (arg === '--keyword') {
      options.keyword = cleanText(argv[++i])
      continue
    }
  }
  return options
}

async function main() {
  const options = parseArgs(process.argv)
  const env = loadEnv()
  const appSecret = env.APP_SECRET || process.env.APP_SECRET
  if (!appSecret) throw new Error('未找到 APP_SECRET，请先在 card/.env 配置')

  const token = await getAccessToken(appSecret)
  const [cards, seriesDocs, subsetDocs] = await Promise.all([
    fetchAllDocs(token, 'cards', 100),
    fetchAllDocs(token, 'my_series', 100),
    fetchAllDocs(token, 'my_series_subsets', 100)
  ])

  let candidates = scanCandidates(seriesDocs, subsetDocs, cards)
  if (options.keyword) {
    const keyword = normalizeCompareText(options.keyword)
    candidates = candidates.filter(item =>
      normalizeCompareText(`${item.seriesName} ${item.label} ${item.meta.rawPlayer} ${item.meta.rawPlayerCN} ${item.meta.displayPlayer}`).includes(keyword)
    )
  }

  console.log(`扫描完成：问题卡 ${cards.length} 条，图鉴 ${seriesDocs.length} 个，子系列文档 ${subsetDocs.length} 个。`)
  console.log(`当前有 ${candidates.length} 张已上传的图鉴图片会展示“鉴别参考”（score >= 5）。`)
  console.log('')

  candidates.slice(0, options.limit).forEach((item, index) => {
    console.log(`${index + 1}. [${item.bestScore}分] ${item.seriesName}`)
    console.log(`   图鉴卡：${item.label}`)
    console.log(`   元信息：${[
      item.meta.rawPlayerCN || item.meta.displayPlayer,
      item.meta.rawPlayer && item.meta.rawPlayer !== item.meta.displayPlayer ? item.meta.rawPlayer : '',
      item.meta.displayYear,
      item.meta.displayBrand,
      item.meta.displaySeries,
      item.meta.displayCardKind,
      item.meta.displayNumber
    ].filter(Boolean).join(' · ')}`)
    console.log(`   图片ID：${item.imageId || '(无 imageId)'}`)
    item.related.forEach(ref => {
      console.log(`   关联：#${ref.id} ${ref.playerCN || ref.player} · ${ref.year} · ${ref.series} · ${ref.number || '无编号'} · ${ref.category} · ${ref.status} · ${ref.score}分`)
    })
    console.log('')
  })
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
