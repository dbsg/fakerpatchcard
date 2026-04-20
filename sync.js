const https = require('https')
const http = require('http')
const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const APPID = 'wx13497267f3b92c0f'
const CDN_BASE = 'https://7072-prod-8g8ay186059e4264-1418320285.tcb.qcloud.la'
const CLOUD_ENV = 'cloudbase-1g5rcsava7547769'
const CARD_DIR = __dirname
const IMAGES_DIR = path.join(CARD_DIR, 'images', 'sample')
const COLLECTION_IMAGES_DIR = path.join(CARD_DIR, 'images', 'collection')
const DATA_JS_PATH = path.join(CARD_DIR, 'js', 'data.js')
const COLLECTION_JS_PATH = path.join(CARD_DIR, 'js', 'collection-data.js')
const ENV_PATH = path.join(CARD_DIR, '.env')

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
    const client = url.startsWith('https') ? https : http
    client.get(url, (res) => {
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
    const options = {
      hostname: parsed.hostname,
      port: parsed.port || 443,
      path: parsed.pathname + parsed.search,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
    }
    const req = https.request(options, (res) => {
      const chunks = []
      res.on('data', chunk => chunks.push(chunk))
      res.on('end', () => {
        try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf8'))) }
        catch (e) { reject(new Error('Invalid JSON response')) }
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
  if (result.errcode) throw new Error(`获取 access_token 失败: ${result.errmsg} (${result.errcode})`)
  return result.access_token
}

async function queryCloudDB(accessToken, query) {
  const url = `https://api.weixin.qq.com/tcb/databasequery?access_token=${accessToken}`
  return httpPost(url, { env: CLOUD_ENV, query })
}

async function fetchCardsFromCloudDB(accessToken) {
  console.log('   从云数据库 cards 集合直接读取...')

  const firstPage = await queryCloudDB(accessToken,
    `db.collection("cards").limit(1).get()`
  )
  if (firstPage.errcode !== 0) throw new Error(`查询失败: ${firstPage.errmsg} (${firstPage.errcode})`)
  const total = firstPage.pager.Total
  console.log(`   共 ${total} 条记录`)

  const allDocs = []
  const PAGE = 100
  for (let skip = 0; skip < total; skip += PAGE) {
    const result = await queryCloudDB(accessToken,
      `db.collection("cards").skip(${skip}).limit(${PAGE}).get()`
    )
    if (result.errcode !== 0) throw new Error(`查询失败(skip=${skip}): ${result.errmsg} (${result.errcode})`)
    result.data.forEach(d => allDocs.push(JSON.parse(d)))
  }

  const activeCards = allDocs.filter(c => !c.deleted)
  console.log(`   过滤后 ${activeCards.length} 张有效卡片`)

  return activeCards.map(c => ({
    id: c.id,
    player: c.player,
    playerCN: c.playerCN || '',
    brand: c.brand,
    year: c.year,
    series: c.series,
    number: c.number,
    status: c.status || 'confirmed',
    highRiskReason: c.highRiskReason || '',
    category: c.category || 'fake-patch',
    source: c.source || '',
    images: (c.images || []).map(img => ({
      url: img.url,
      note: img.note || '',
      type: img.type || 'after'
    }))
  }))
}

async function fetchCardsFromCDN() {
  console.log('   从 CDN 下载 cards.json (旧模式)...')
  const buf = await httpGet(`${CDN_BASE}/exports/cards.json`)
  return JSON.parse(buf.toString('utf8'))
}

async function downloadImage(url, destPath) {
  if (fs.existsSync(destPath)) return false
  const data = await httpGet(url)
  fs.writeFileSync(destPath, data)
  return true
}

function cdnUrlToLocalPath(url) {
  if (!url.startsWith(CDN_BASE + '/')) return url
  const cloudPath = url.slice(CDN_BASE.length + 1)
  if (cloudPath.startsWith('images/')) {
    return `images/sample/${path.basename(cloudPath)}`
  }
  const filename = cloudPath
    .replace(/^(card-images|feedback-images|correction-images)\//, '')
    .replace(/\//g, '_')
  return `images/sample/${filename}`
}

function fileIdToCdnUrl(fileId) {
  if (!fileId || !fileId.startsWith('cloud://')) return fileId
  const withoutProtocol = fileId.slice('cloud://'.length)
  const slashIndex = withoutProtocol.indexOf('/')
  if (slashIndex === -1) return fileId
  const cloudPath = withoutProtocol.slice(slashIndex + 1)
  return `${CDN_BASE}/${cloudPath}`
}

function collectionUrlToLocalPath(url) {
  if (!url.startsWith(CDN_BASE + '/')) return url
  const cloudPath = url.slice(CDN_BASE.length + 1)
  const filename = cloudPath.replace(/^collection-series\//, '').replace(/\//g, '_')
  return `images/collection/${filename}`
}

async function fetchAllDocs(accessToken, collectionName, pageSize = 20) {
  const firstPage = await queryCloudDB(accessToken,
    `db.collection("${collectionName}").limit(1).get()`
  )
  if (firstPage.errcode !== 0) throw new Error(`查询 ${collectionName} 失败: ${firstPage.errmsg} (${firstPage.errcode})`)
  const total = firstPage.pager.Total
  const allDocs = []
  for (let skip = 0; skip < total; skip += pageSize) {
    const result = await queryCloudDB(accessToken,
      `db.collection("${collectionName}").skip(${skip}).limit(${pageSize}).get()`
    )
    if (result.errcode !== 0) throw new Error(`查询 ${collectionName}(skip=${skip}) 失败: ${result.errmsg} (${result.errcode})`)
    result.data.forEach(d => allDocs.push(JSON.parse(d)))
  }
  return { total, docs: allDocs }
}

function normalizeImage(img) {
  if (typeof img === 'string') return { url: img, owned: false, number: '', year: '' }
  return { url: img.url || '', owned: !!img.owned, number: img.number || '', year: img.year || '' }
}

function subsetDocsToChecklist(subsetDocs) {
  const checklist = []
  for (const doc of subsetDocs) {
    const subsetName = doc.subset || ''
    for (const item of (doc.items || [])) {
      checklist.push({
        text: item.text || '',
        subset: subsetName,
        images: (item.images || []).map(normalizeImage)
      })
    }
  }
  return checklist
}

async function fetchSeriesFromCloudDB(accessToken) {
  console.log('   从云数据库 my_series 集合读取...')
  const { total, docs: seriesDocs } = await fetchAllDocs(accessToken, 'my_series', 20)
  console.log(`   共 ${total} 个系列`)

  console.log('   从云数据库 my_series_subsets 集合读取...')
  const { total: subTotal, docs: allSubsetDocs } = await fetchAllDocs(accessToken, 'my_series_subsets', 100)
  console.log(`   共 ${subTotal} 个子系列文档`)

  const subsetsBySeriesId = new Map()
  for (const doc of allSubsetDocs) {
    if (!doc.seriesId) continue
    if (!subsetsBySeriesId.has(doc.seriesId)) subsetsBySeriesId.set(doc.seriesId, [])
    subsetsBySeriesId.get(doc.seriesId).push(doc)
  }

  return seriesDocs.map(s => {
    const subDocs = subsetsBySeriesId.get(s._id)
    let checklist
    if (subDocs && subDocs.length > 0) {
      checklist = subsetDocsToChecklist(subDocs)
    } else {
      checklist = (s.checklist || []).map(item => ({
        text: item.text || '',
        subset: item.subset || '',
        images: (item.images || []).map(normalizeImage)
      }))
    }

    return {
      _id: s._id,
      name: s.name || '',
      hasSubset: !!s.hasSubset,
      checklist,
      freeImages: (s.freeImages || []).map(normalizeImage)
    }
  })
}

function generateCollectionJs(seriesList) {
  return `const collectionData = ${JSON.stringify(seriesList, null, 2)};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = collectionData;
}
`
}

function generateDataJs(cards) {
  const indent = '  '
  const lines = ['const cardsData = [']

  cards.forEach((card, cardIdx) => {
    lines.push(`${indent}{`)
    lines.push(`${indent}${indent}id: ${card.id},`)
    lines.push(`${indent}${indent}player: ${JSON.stringify(card.player)},`)
    if (card.playerCN) {
      lines.push(`${indent}${indent}playerCN: ${JSON.stringify(card.playerCN)},`)
    }
    lines.push(`${indent}${indent}brand: ${JSON.stringify(card.brand)},`)
    lines.push(`${indent}${indent}year: ${JSON.stringify(card.year)},`)
    lines.push(`${indent}${indent}series: ${JSON.stringify(card.series)},`)
    lines.push(`${indent}${indent}number: ${JSON.stringify(card.number)},`)
    lines.push(`${indent}${indent}status: ${JSON.stringify(card.status || 'confirmed')},`)
    lines.push(`${indent}${indent}category: ${JSON.stringify(card.category || 'fake-patch')},`)
    if (card.highRiskReason) {
      lines.push(`${indent}${indent}highRiskReason: ${JSON.stringify(card.highRiskReason)},`)
    }
    if (card.source) {
      lines.push(`${indent}${indent}source: ${JSON.stringify(card.source)},`)
    }
    lines.push(`${indent}${indent}images: [`)
    card.images.forEach((img, imgIdx) => {
      const comma = imgIdx < card.images.length - 1 ? ',' : ''
      lines.push(`${indent}${indent}${indent}{`)
      lines.push(`${indent}${indent}${indent}${indent}url: ${JSON.stringify(img.url)},`)
      lines.push(`${indent}${indent}${indent}${indent}note: ${JSON.stringify(img.note || '')},`)
      lines.push(`${indent}${indent}${indent}${indent}type: ${JSON.stringify(img.type || 'after')}`)
      lines.push(`${indent}${indent}${indent}}${comma}`)
    })
    lines.push(`${indent}${indent}]`)
    const comma = cardIdx < cards.length - 1 ? ',' : ''
    lines.push(`${indent}}${comma}`)
  })

  lines.push('];')
  lines.push('')
  lines.push("if (typeof module !== 'undefined' && module.exports) {")
  lines.push('  module.exports = cardsData;')
  lines.push('}')
  lines.push('')

  return lines.join('\n')
}

async function main() {
  console.log('=== 同步小程序数据到 card 项目 ===\n')

  const env = loadEnv()
  const appSecret = env.APP_SECRET || process.env.APP_SECRET

  let cards
  console.log('1. 获取卡片数据 ...')

  if (appSecret) {
    try {
      const token = await getAccessToken(appSecret)
      cards = await fetchCardsFromCloudDB(token)
    } catch (e) {
      console.warn(`   云数据库读取失败: ${e.message}`)
      console.log('   尝试 CDN 兜底...')
      cards = await fetchCardsFromCDN()
    }
  } else {
    console.log('   未配置 APP_SECRET，使用 CDN 模式')
    console.log('   如需云数据库直读，在 card/.env 中添加 APP_SECRET=你的小程序密钥')
    cards = await fetchCardsFromCDN()
  }
  console.log(`   获取到 ${cards.length} 张卡片\n`)

  console.log('2. 处理图片 ...')
  if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true })
  }

  let downloaded = 0
  let skipped = 0
  for (const card of cards) {
    for (const img of card.images) {
      let downloadUrl = img.url
      if (downloadUrl.startsWith('cloud://')) {
        downloadUrl = fileIdToCdnUrl(downloadUrl)
      }
      const localRelPath = cdnUrlToLocalPath(downloadUrl)
      const localAbsPath = path.join(CARD_DIR, localRelPath)

      if (downloadUrl.startsWith(CDN_BASE + '/')) {
        const didDownload = await downloadImage(downloadUrl, localAbsPath)
        if (didDownload) {
          downloaded++
          console.log(`   下载: ${path.basename(localAbsPath)}`)
        } else {
          skipped++
        }
      }

      img.url = localRelPath
    }
  }
  console.log(`   下载 ${downloaded} 张新图片，跳过 ${skipped} 张已有图片\n`)

  console.log('3. 生成 data.js ...')
  cards.sort((a, b) => a.id - b.id)
  const content = generateDataJs(cards)
  fs.writeFileSync(DATA_JS_PATH, content, 'utf8')
  console.log(`   写入 ${DATA_JS_PATH}\n`)

  console.log('4. 同步收藏数据 (my_series) ...')
  if (appSecret) {
    try {
      const token2 = await getAccessToken(appSecret)
      const seriesList = await fetchSeriesFromCloudDB(token2)

      if (!fs.existsSync(COLLECTION_IMAGES_DIR)) {
        fs.mkdirSync(COLLECTION_IMAGES_DIR, { recursive: true })
      }

      let colDownloaded = 0
      let colSkipped = 0
      for (const series of seriesList) {
        const allImages = [
          ...series.checklist.flatMap(item => item.images),
          ...series.freeImages
        ]
        for (const img of allImages) {
          let downloadUrl = img.url
          if (downloadUrl.startsWith('cloud://')) {
            downloadUrl = fileIdToCdnUrl(downloadUrl)
          }
          if (downloadUrl.startsWith(CDN_BASE + '/')) {
            const localRelPath = collectionUrlToLocalPath(downloadUrl)
            const localAbsPath = path.join(CARD_DIR, localRelPath)
            const didDownload = await downloadImage(downloadUrl, localAbsPath)
            if (didDownload) { colDownloaded++; console.log(`   下载: ${path.basename(localAbsPath)}`) }
            else { colSkipped++ }
            img.url = localRelPath
          }
        }
      }
      console.log(`   下载 ${colDownloaded} 张收藏图片，跳过 ${colSkipped} 张已有\n`)

      console.log('5. 生成 collection-data.js ...')
      const colContent = generateCollectionJs(seriesList)
      fs.writeFileSync(COLLECTION_JS_PATH, colContent, 'utf8')
      console.log(`   写入 ${COLLECTION_JS_PATH}\n`)
    } catch (e) {
      console.warn(`   收藏数据同步失败: ${e.message}\n`)
    }
  } else {
    console.log('   未配置 APP_SECRET，跳过收藏数据同步\n')
  }

  console.log('6. Git 提交并推送 ...')
  try {
    execSync('git add .', { cwd: CARD_DIR, stdio: 'pipe' })
    const status = execSync('git status --porcelain', { cwd: CARD_DIR, encoding: 'utf8' })
    if (!status.trim()) {
      console.log('   没有变更，无需提交\n')
    } else {
      const msg = `sync: update ${cards.length} cards from miniprogram`
      execSync(`git commit -m "${msg}"`, { cwd: CARD_DIR, stdio: 'pipe' })
      execSync('git push', { cwd: CARD_DIR, stdio: 'inherit' })
      console.log(`   已推送到 GitHub\n`)
    }
  } catch (e) {
    console.error(`   Git 操作失败: ${e.message}`)
    console.error('   请手动执行 cd card && git add . && git commit && git push')
  }

  console.log('=== 同步完成 ===')
}

main().catch(e => {
  console.error('同步失败:', e)
  process.exit(1)
})
