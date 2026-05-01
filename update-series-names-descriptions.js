const https = require('https')
const fs = require('fs')
const path = require('path')

const APPID = 'wx13497267f3b92c0f'
const CLOUD_ENV = 'cloudbase-1g5rcsava7547769'
const ENV_PATH = path.join(__dirname, '.env')

const RENAMES = {
  '2008 Toops Chrome': '2008 Topps Chrome',
  '2016-17 Panini Preferred NBA Final 骑士': '2016-17 Panini Preferred NBA Finals 骑士',
  '2017-18 Panini Opulence NBA Final 骑士': '2017-18 Panini Opulence NBA Finals 骑士',
  '2018-19 Panini Opulence NBA Final 骑士': '2018-19 Panini Opulence NBA Finals 骑士'
}

const DESCRIPTIONS = {
  '2024-25 Panini Silhouette NBA Finals 骑士': 'Panini Silhouette NBA Finals 骑士主题图鉴，围绕总决赛实物球衣与 Patch 配置展开，适合按球员、版本和限编系统补齐。',
  '2015-16 Panini Preferred NBA Finals 骑士': '围绕骑士总决赛主题打造的 Panini Preferred 图鉴，聚焦球衣、Patch 与总决赛元素，是勒布朗骑士冠军线收藏的重要分支。',
  '勒布朗 撒镁粉': '以勒布朗标志性的赛前撒镁粉动作为主题，记录其最具辨识度的个人符号之一，是球星形象类收藏中的经典题材。',
  '1986 Fleer': '篮球卡历史上最重要的经典套系之一，汇集乔丹新秀及大量名人堂球星，是现代篮球卡收藏体系的起点级图鉴。',
  '2015-16 Flawless 钻石': 'Panini Flawless 高端钻石系列图鉴，以真钻嵌入、限编配置和顶级产品定位为核心，是现代高端篮球卡收藏的重要代表。',
  '2016-17 Panini Preferred NBA Finals 骑士': '延续骑士总决赛题材的 Preferred 系列图鉴，记录勒布朗时代骑士核心阵容与比赛实物元素，适合按队史冠军线系统收藏。',
  '2017-18 Panini Opulence NBA Finals 骑士': 'Panini Opulence 高端线中的骑士总决赛主题图鉴，以奢华版面、限编配置和实物元素为核心，呈现勒布朗骑士末期高端收藏线。',
  '2018-19 Panini Opulence NBA Finals 骑士': 'Opulence 总决赛题材的延续图鉴，聚焦骑士冠军阵容与高端实物卡设计，是勒布朗骑士时代收藏体系的补充章节。',
  '暴力切割': '聚焦大面积 Patch、Logo、Tag 等强视觉实物切割卡的主题图鉴，突出材料观赏性和稀缺部位，是实物卡收藏中的高冲击力分支。',
  '1997-98 Metal Universe': '90 年代篮球卡设计美学的代表作之一，以大胆金属视觉和时代球星阵容闻名，是复古卡收藏中极具辨识度的经典系列。',
  '2003-04 Limited Logos Autographs': '2003-04 Exquisite 木盒中的经典签字 Patch 子系列，以新秀年背景、高端配置和强球星阵容成为木盒体系里的代表性收藏。',
  '2004-05 Limited Logos Autographs': 'Exquisite 木盒早期的核心签字 Patch 子系列，延续 Limited Logos 的高端定位，是 2000 年代高端篮球卡的重要组成部分。',
  '2006-07 Limited Logos Autographs': '2006-07 Exquisite Limited Logos 签字 Patch 图鉴，兼具球星阵容、Patch 观赏性和木盒品牌地位，是高端实物签收藏的重要分支。',
  '勒布朗 经典球星卡': '收录勒布朗·詹姆斯职业生涯中具有代表性的经典球星卡，覆盖新秀、巅峰与关键产品线，是梳理其收藏体系的核心入口。',
  'Panini Kaboom!': 'Panini 旗下最具视觉冲击力的经典插画特卡系列之一，以爆炸漫画风格和高人气球星阵容著称，是现代篮球卡收藏中的标志性图鉴。',
  '2009-10 Limited Logos Autographs': 'Exquisite 后期 Limited Logos 签字 Patch 图鉴，延续木盒高端血统，是 Upper Deck 篮球卡尾声阶段的重要收藏系列。',
  '2008 Topps Chrome': '2008 年 Topps Chrome 篮球卡图鉴，承接 Chrome 系列一贯的折射质感和新秀阵容，是 Topps 时代末期的重要收藏节点。',
  '2012 Prizm 金折': 'Panini Prizm 首年金折系列，/10 限编奠定了 Prizm Gold 在现代篮球卡中的核心地位，是新世代折射卡收藏的标杆之一。',
  '勒布朗 木盒 RPA/99': '勒布朗·詹姆斯最正统、最具代表性的 RPA 之一，来自 2003-04 Exquisite 木盒元年，/99 限编，是其新秀卡体系里最核心的收藏标杆。'
}

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

async function fetchAllSeries(accessToken) {
  const first = await queryCloudDB(accessToken, 'db.collection("my_series").limit(1).get()')
  const total = first.pager.Total
  const docs = []
  for (let skip = 0; skip < total; skip += 100) {
    const page = await queryCloudDB(accessToken, `db.collection("my_series").skip(${skip}).limit(100).get()`)
    page.data.forEach(item => docs.push(JSON.parse(item)))
  }
  return docs
}

async function main() {
  const apply = process.argv.includes('--apply')
  const env = loadEnv()
  if (!env.APP_SECRET) throw new Error(`缺少 ${ENV_PATH} 中的 APP_SECRET`)

  const accessToken = await getAccessToken(env.APP_SECRET)
  const seriesList = await fetchAllSeries(accessToken)
  const byName = new Map(seriesList.map(series => [series.name, series]))
  const plan = []

  for (const series of seriesList) {
    const nextName = RENAMES[series.name] || series.name
    const nextDescription = DESCRIPTIONS[nextName]
    if (!nextDescription) continue
    if (nextName !== series.name) {
      const conflict = byName.get(nextName)
      if (conflict && conflict._id !== series._id) throw new Error(`重命名冲突: ${series.name} -> ${nextName}`)
    }
    if (series.name === nextName && (series.description || '') === nextDescription) continue
    plan.push({
      _id: series._id,
      before: { name: series.name, description: series.description || '' },
      after: { name: nextName, description: nextDescription }
    })
  }

  const missing = Object.keys(DESCRIPTIONS).filter(name => {
    if (byName.has(name)) return false
    return !Object.entries(RENAMES).some(([oldName, newName]) => newName === name && byName.has(oldName))
  })

  console.log(JSON.stringify({
    mode: apply ? 'apply' : 'dry-run',
    totalSeries: seriesList.length,
    updateCount: plan.length,
    missing,
    updates: plan
  }, null, 2))

  if (!apply) {
    console.log('Dry-run only. Use --apply to update series names and descriptions.')
    return
  }

  for (const item of plan) {
    await updateCloudDB(accessToken, `db.collection("my_series").doc(${quote(item._id)}).update({data:${JSON.stringify({
      name: item.after.name,
      description: item.after.description,
      updateTime: new Date().toISOString()
    })}})`)
  }

  console.log(JSON.stringify({ ok: true, updated: plan.length }, null, 2))
}

main().catch(err => {
  console.error(err.message || err)
  process.exit(1)
})
