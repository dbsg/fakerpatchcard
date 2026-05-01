const fs = require('fs')
const path = require('path')

const ROOT_DIR = path.join(__dirname, '..', 'flawless-gdma-2014')
const PENDING_PATH = path.join(__dirname, 'flawless-gdma-2014-pending-images.json')

const PLAYER_MAP = {
  'Adrian Dantley': { code: 'GDM-AD', player: 'Adrian Dantley', label: 'Adrian Dantley' },
  'Clyde Drexler': { code: 'GDM-CD', player: 'Clyde Drexler', label: 'Clyde Drexler' },
  'David Robinson': { code: 'GDM-DR', player: 'David Robinson', label: 'David Robinson' },
  'Gary Payton': { code: 'GDM-GP', player: 'Gary Payton', label: 'Gary Payton' },
  'Hakeem Olajuwon': { code: 'GDM-HKO', player: 'Hakeem Olajuwon', label: 'Hakeem Olajuwon' },
  'Ralph Sampson': { code: 'GDM-RS', player: 'Ralph Sampson', label: 'Ralph Sampson' },
  'Ray Allen': { code: 'GDM-RA', player: 'Ray Allen', label: 'Ray Allen' },
  'Robert Parish': { code: 'GDM-RP', player: 'Robert Parish', label: 'Robert Parish' },
  "Shaquille O'Neal": { code: 'GDM-SO', player: "Shaquille O'Neal", label: "Shaquille O'Neal" },
  '约翰 斯托克顿': { code: 'GDM-JS', player: 'John Stockton', label: '约翰 斯托克顿' }
}

const SUBSET_BY_PRINT_RUN = {
  25: 'Base',
  15: 'Ruby',
  10: 'Gold',
  5: 'Emerald',
  1: 'Black'
}

function loadJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

function saveJson(filePath, data) {
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`)
}

function listFiles(dir) {
  const result = []
  fs.readdirSync(dir, { withFileTypes: true }).forEach(entry => {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      listFiles(fullPath).forEach(file => result.push(file))
    } else if (entry.isFile() && /\.(jpe?g|png|webp)$/i.test(entry.name)) {
      result.push(fullPath)
    }
  })
  return result
}

function parseEntry(filePath) {
  const playerDir = path.basename(path.dirname(filePath))
  const playerInfo = PLAYER_MAP[playerDir]
  if (!playerInfo) throw new Error(`未配置球员目录映射: ${playerDir}`)

  const baseName = path.basename(filePath, path.extname(filePath))
  const match = baseName.match(/^([1-9]\d*)-([1-9]\d*)$/)
  if (!match) throw new Error(`文件名无法解析编号: ${filePath}`)

  const serial = Number(match[1])
  const printRun = Number(match[2])
  const subset = SUBSET_BY_PRINT_RUN[printRun]
  if (!subset) throw new Error(`未配置总编数到平行版本映射: ${filePath}`)

  return {
    localPath: filePath,
    subset,
    cardCode: playerInfo.code,
    player: playerInfo.player,
    cardText: `${playerInfo.code} ${playerInfo.player}`,
    printNumber: `${serial}/${printRun}`,
    sourceNote: `目录导入：${playerInfo.label} ${serial}/${printRun}`,
    uploaded: false
  }
}

function main() {
  if (!fs.existsSync(ROOT_DIR)) throw new Error(`目录不存在: ${ROOT_DIR}`)
  const pending = loadJson(PENDING_PATH)
  const existingPaths = new Set((pending.items || []).map(item => item.localPath))
  const files = listFiles(ROOT_DIR).sort((a, b) => a.localeCompare(b))
  const entries = files.map(parseEntry)
  const newEntries = entries.filter(entry => !existingPaths.has(entry.localPath))

  pending.items = [...(pending.items || []), ...newEntries]
  saveJson(PENDING_PATH, pending)

  const bySubset = newEntries.reduce((acc, item) => {
    acc[item.subset] = (acc[item.subset] || 0) + 1
    return acc
  }, {})

  console.log(JSON.stringify({
    scanned: files.length,
    appended: newEntries.length,
    skippedExistingPath: entries.length - newEntries.length,
    bySubset
  }, null, 2))
}

main()
