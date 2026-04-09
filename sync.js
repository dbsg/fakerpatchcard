const https = require('https')
const http = require('http')
const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const CDN_BASE = 'https://7072-prod-8g8ay186059e4264-1418320285.tcb.qcloud.la'
const CARDS_JSON_URL = `${CDN_BASE}/exports/cards.json`
const CARD_DIR = path.join(__dirname, 'card')
const IMAGES_DIR = path.join(CARD_DIR, 'images', 'sample')
const DATA_JS_PATH = path.join(CARD_DIR, 'js', 'data.js')

function fetch(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http
    client.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetch(res.headers.location).then(resolve).catch(reject)
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

async function downloadImage(url, destPath) {
  if (fs.existsSync(destPath)) return false
  const data = await fetch(url)
  fs.writeFileSync(destPath, data)
  return true
}

function cdnUrlToLocalPath(url) {
  if (!url.startsWith(CDN_BASE + '/')) return url

  const cloudPath = url.slice(CDN_BASE.length + 1)

  if (cloudPath.startsWith('images/')) {
    const filename = path.basename(cloudPath)
    return `images/sample/${filename}`
  }

  const filename = cloudPath
    .replace(/^(card-images|feedback-images|correction-images)\//, '')
    .replace(/\//g, '_')
  return `images/sample/${filename}`
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
    if (card.highRiskReason) {
      lines.push(`${indent}${indent}highRiskReason: ${JSON.stringify(card.highRiskReason)},`)
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

  console.log('1. 下载 cards.json ...')
  let cards
  try {
    const buf = await fetch(CARDS_JSON_URL)
    cards = JSON.parse(buf.toString('utf8'))
  } catch (e) {
    console.error(`下载失败: ${e.message}`)
    console.error('请先在小程序管理页点击「同步到网站」导出数据')
    process.exit(1)
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
      const originalUrl = img.url
      const localRelPath = cdnUrlToLocalPath(originalUrl)
      const localAbsPath = path.join(CARD_DIR, localRelPath)

      if (originalUrl.startsWith(CDN_BASE + '/')) {
        const didDownload = await downloadImage(originalUrl, localAbsPath)
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

  console.log('4. Git 提交并推送 ...')
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
