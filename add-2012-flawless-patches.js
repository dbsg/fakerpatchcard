const https = require('https')
const fs = require('fs')
const path = require('path')
const progressData = require('../miniprogram-card/utils/collectionProgress')

const APPID = 'wx13497267f3b92c0f'
const CLOUD_ENV = 'cloudbase-1g5rcsava7547769'
const ENV_PATH = path.join(__dirname, '.env')

const SERIES_NAME = '2012-13 Panini Flawless Patches'
const DESCRIPTION = '2012-13 Panini Flawless Patches patch 实物系列，包含 Base、Ruby、Gold、Emerald、Platinum 1/1 多个平行版本，收录 LeBron James、Kevin Durant、Anthony Davis、Kyrie Irving、Damian Lillard 等球星及多位名宿。'
const CREATOR_OPENID = 'oaQG05Ax1I_QRhOkD4lwqOXEucV8'

const RAW_SUBSETS = [
  {
    name: 'Base',
    order: 0,
    raw: `
1 Russell Westbrook - Oklahoma City Thunder #/25
2 Amar'e Stoudemire - New York Knicks #/25
3 Andrei Kirilenko - Minnesota Timberwolves #/25
4 David Lee - Golden State Warriors #/25
5 David West - Indiana Pacers #/25
6 Goran Dragic - Phoenix Suns #/14
7 Grant Hill - Los Angeles Clippers #/25
8 Alex English - Dallas Mavericks #/25
9 LaMarcus Aldridge - Portland Trail Blazers #/25
10 Roy Hibbert - Indiana Pacers #/25
11 Ricky Rubio - Minnesota Timberwolves #/25
12 Jason Terry - Boston Celtics #/25
14 Reggie Lewis - Boston Celtics #/25
15 DeMarcus Cousins - Sacramento Kings #/25
16 Glen Davis - Orlando Magic #/25
17 Greg Monroe - Detroit Pistons #/25
18 Kevin Love - Minnesota Timberwolves #/25
19 Magic Johnson - Los Angeles Lakers #/25
20 Tim Duncan - San Antonio Spurs #/25
21 Ray Allen - Miami Heat #/25
22 Andre Iguodala - Denver Nuggets #/20
23 Blake Griffin - Los Angeles Clippers #/25
24 John Wall - Washington Wizards #/25
25 Derrick Favors - Utah Jazz #/25
26 Eric Gordon - New Orleans Pelicans #/21
27 James Harden - Houston Rockets #/21
28 Kevin Garnett - Boston Celtics #/25
29 Marc Gasol - Memphis Grizzlies #/12
30 Tony Parker - San Antonio Spurs #/25
31 Rajon Rondo - Boston Celtics #/25
32 Al Jefferson - Utah Jazz #/25
33 Brandon Jennings - Milwaukee Bucks #/25
34 Chris Paul - Los Angeles Clippers #/17
35 Allen Iverson - Philadelphia 76ers #/18
36 Dwyane Wade - Miami Heat #/25
37 Jeremy Lin - Houston Rockets #/25
38 Kevin Durant - Oklahoma City Thunder #/25
39 Marcin Gortat - Phoenix Suns #/18
40 Tyreke Evans - Sacramento Kings #/25
41 Paul Pierce - Boston Celtics #/25
42 Manu Ginobili - San Antonio Spurs #/25
43 Carlos Boozer - Chicago Bulls #/25
44 Carmelo Anthony - New York Knicks #/25
45 Dirk Nowitzki - Dallas Mavericks #/25
46 Dwight Howard - Los Angeles Lakers #/25
47 Joakim Noah - Chicago Bulls #/25
48 Josh Smith - Atlanta Hawks #/15
49 O.J. Mayo - Dallas Mavericks #/25
50 LeBron James - Miami Heat #/25
51 Alonzo Mourning - Charlotte Hornets #/15
52 Karl Malone - Utah Jazz #/25
53 Wilt Chamberlain - Los Angeles Lakers #/10
54 Shaquille O'Neal - Orlando Magic #/22
55 David Robinson - San Antonio Spurs #/24
56 Kevin McHale - Boston Celtics #/25
57 Jason Williams - Orlando Magic #/19
58 Manute Bol - Philadelphia 76ers #/25
59 Fat Lever - Denver Nuggets #/24
60 Larry Bird - Boston Celtics #/25
61 Gus Williams - Washington Bullets #/25
62 John Stockton - Utah Jazz #/25
64 Lou Hudson - Atlanta Hawks #/23
65 Pete Maravich - Boston Celtics #/9
67 Hakeem Olajuwon - Houston Rockets #/25
69 Rasheed Wallace - New York Knicks #/17
70 Jamaal Wilkes - Los Angeles Lakers #/20
71 Hal Greer - Philadelphia 76ers #/15
73 Patrick Ewing - New York Knicks #/25
74 Jack Sikma - Milwaukee Bucks #/14
75 Isiah Thomas - Detroit Pistons #/25
`
  },
  {
    name: 'Ruby',
    order: 1,
    raw: `
1 Russell Westbrook - Oklahoma City Thunder #/15
2 Amar'e Stoudemire - New York Knicks #/15
3 Andrei Kirilenko - Minnesota Timberwolves #/15
4 David Lee - Golden State Warriors #/15
5 David West - Indiana Pacers #/15
6 Goran Dragic - Phoenix Suns #/12
7 Grant Hill - Los Angeles Clippers #/15
8 Alex English - Dallas Mavericks #/15
9 LaMarcus Aldridge - Portland Trail Blazers #/15
10 Roy Hibbert - Indiana Pacers #/15
11 Ricky Rubio - Minnesota Timberwolves #/15
12 Jason Terry - Boston Celtics #/15
13 Moses Malone - Atlanta Hawks #/11
14 Reggie Lewis - Boston Celtics #/15
15 DeMarcus Cousins - Sacramento Kings #/15
16 Glen Davis - Orlando Magic #/15
17 Greg Monroe - Detroit Pistons #/15
18 Kevin Love - Minnesota Timberwolves #/15
19 Magic Johnson - Los Angeles Lakers #/15
20 Tim Duncan - San Antonio Spurs #/15
21 Ray Allen - Miami Heat #/15
22 Andre Iguodala - Denver Nuggets #/15
23 Blake Griffin - Los Angeles Clippers #/15
24 John Wall - Washington Wizards #/15
25 Derrick Favors - Utah Jazz #/15
26 Eric Gordon - New Orleans Pelicans #/15
27 James Harden - Houston Rockets #/15
28 Kevin Garnett - Boston Celtics #/15
29 Marc Gasol - Memphis Grizzlies #/15
30 Tony Parker - San Antonio Spurs #/15
31 Rajon Rondo - Boston Celtics #/15
32 Al Jefferson - Utah Jazz #/15
33 Brandon Jennings - Milwaukee Bucks #/15
34 Chris Paul - Los Angeles Clippers #/15
35 Allen Iverson - Philadelphia 76ers #/15
36 Dwyane Wade - Miami Heat #/15
37 Jeremy Lin - Houston Rockets #/15
38 Kevin Durant - Oklahoma City Thunder #/15
39 Marcin Gortat - Phoenix Suns #/10
40 Tyreke Evans - Sacramento Kings #/15
41 Paul Pierce - Boston Celtics #/15
42 Manu Ginobili - San Antonio Spurs #/15
43 Carlos Boozer - Chicago Bulls #/15
44 Carmelo Anthony - New York Knicks #/15
45 Dirk Nowitzki - Dallas Mavericks #/15
46 Dwight Howard - Los Angeles Lakers #/15
47 Joakim Noah - Chicago Bulls #/15
48 Josh Smith - Atlanta Hawks #/15
49 O.J. Mayo - Dallas Mavericks #/15
50 LeBron James - Miami Heat #/15
51 Alonzo Mourning - Charlotte Hornets #/12
52 Karl Malone - Utah Jazz #/15
53 Wilt Chamberlain - Los Angeles Lakers #/8
54 Shaquille O'Neal - Orlando Magic #/15
55 David Robinson - San Antonio Spurs #/15
56 Kevin McHale - Boston Celtics #/15
57 Jason Williams - Orlando Magic #/12
58 Manute Bol - Philadelphia 76ers #/15
59 Fat Lever - Denver Nuggets #/15
60 Larry Bird - Boston Celtics #/15
61 Gus Williams - Washington Bullets #/15
62 John Stockton - Utah Jazz #/15
63 Gail Goodrich - Phoenix Suns #/14
64 Lou Hudson - Atlanta Hawks #/15
65 Pete Maravich - Boston Celtics #/5
67 Hakeem Olajuwon - Houston Rockets #/15
69 Rasheed Wallace - New York Knicks #/15
70 Jamaal Wilkes - Los Angeles Lakers #/15
71 Hal Greer - Philadelphia 76ers #/10
72 Nate Thurmond - Golden State Warriors #/11
73 Patrick Ewing - New York Knicks #/15
74 Jack Sikma - Milwaukee Bucks #/12
75 Isiah Thomas - Detroit Pistons #/15
`
  },
  {
    name: 'Gold',
    order: 2,
    raw: `
1 Russell Westbrook - Oklahoma City Thunder #/10
2 Amar'e Stoudemire - New York Knicks #/10
3 Andrei Kirilenko - Minnesota Timberwolves #/10
4 David Lee - Golden State Warriors #/10
5 David West - Indiana Pacers #/10
6 Goran Dragic - Phoenix Suns #/10
7 Grant Hill - Los Angeles Clippers #/10
8 Alex English - Dallas Mavericks #/10
9 LaMarcus Aldridge - Portland Trail Blazers #/10
10 Roy Hibbert - Indiana Pacers #/10
11 Ricky Rubio - Minnesota Timberwolves #/10
12 Jason Terry - Boston Celtics #/10
13 Moses Malone - Atlanta Hawks #/10
14 Reggie Lewis - Boston Celtics #/10
15 DeMarcus Cousins - Sacramento Kings #/10
16 Glen Davis - Orlando Magic #/10
17 Greg Monroe - Detroit Pistons #/10
18 Kevin Love - Minnesota Timberwolves #/10
19 Magic Johnson - Los Angeles Lakers #/10
20 Tim Duncan - San Antonio Spurs #/10
21 Ray Allen - Miami Heat #/10
22 Andre Iguodala - Denver Nuggets #/10
23 Blake Griffin - Los Angeles Clippers #/10
24 John Wall - Washington Wizards #/10
25 Derrick Favors - Utah Jazz #/10
26 Eric Gordon - New Orleans Pelicans #/10
27 James Harden - Houston Rockets #/10
28 Kevin Garnett - Boston Celtics #/10
29 Marc Gasol - Memphis Grizzlies #/10
30 Tony Parker - San Antonio Spurs #/10
31 Rajon Rondo - Boston Celtics #/10
32 Al Jefferson - Utah Jazz #/10
33 Brandon Jennings - Milwaukee Bucks #/10
34 Chris Paul - Los Angeles Clippers #/10
35 Allen Iverson - Philadelphia 76ers #/10
36 Dwyane Wade - Miami Heat #/10
37 Jeremy Lin - Houston Rockets #/10
38 Kevin Durant - Oklahoma City Thunder #/10
39 Marcin Gortat - Phoenix Suns #/8
40 Tyreke Evans - Sacramento Kings #/10
41 Paul Pierce - Boston Celtics #/10
42 Manu Ginobili - San Antonio Spurs #/10
43 Carlos Boozer - Chicago Bulls #/10
44 Carmelo Anthony - New York Knicks #/10
45 Dirk Nowitzki - Dallas Mavericks #/10
46 Dwight Howard - Los Angeles Lakers #/10
47 Joakim Noah - Chicago Bulls #/10
48 Josh Smith - Atlanta Hawks #/10
49 O.J. Mayo - Dallas Mavericks #/10
50 LeBron James - Miami Heat #/10
51 Alonzo Mourning - Charlotte Hornets #/10
52 Karl Malone - Utah Jazz #/10
53 Wilt Chamberlain - Los Angeles Lakers #/5
54 Shaquille O'Neal - Orlando Magic #/10
55 David Robinson - San Antonio Spurs #/10
56 Kevin McHale - Boston Celtics #/10
57 Jason Williams - Orlando Magic #/10
58 Manute Bol - Philadelphia 76ers #/10
59 Fat Lever - Denver Nuggets #/10
60 Larry Bird - Boston Celtics #/10
61 Gus Williams - Washington Bullets #/10
62 John Stockton - Utah Jazz #/10
63 Gail Goodrich - Phoenix Suns #/10
64 Lou Hudson - Atlanta Hawks #/10
65 Pete Maravich - Boston Celtics #/3
66 James Worthy - Los Angeles Lakers #/10
67 Hakeem Olajuwon - Houston Rockets #/10
68 Moses Malone - Philadelphia 76ers #/10
69 Rasheed Wallace - New York Knicks #/10
70 Jamaal Wilkes - Los Angeles Lakers #/10
71 Hal Greer - Philadelphia 76ers #/8
72 Nate Thurmond - Golden State Warriors #/10
73 Patrick Ewing - New York Knicks #/10
74 Jack Sikma - Milwaukee Bucks #/8
75 Isiah Thomas - Detroit Pistons #/10
`
  },
  {
    name: 'Emerald',
    order: 3,
    raw: `
1 Russell Westbrook - Oklahoma City Thunder #/5
2 Amar'e Stoudemire - New York Knicks #/5
3 Andrei Kirilenko - Minnesota Timberwolves #/5
4 David Lee - Golden State Warriors #/5
5 David West - Indiana Pacers #/5
6 Goran Dragic - Phoenix Suns #/5
7 Grant Hill - Los Angeles Clippers #/5
8 Alex English - Dallas Mavericks #/5
9 LaMarcus Aldridge - Portland Trail Blazers #/5
10 Roy Hibbert - Indiana Pacers #/5
11 Ricky Rubio - Minnesota Timberwolves #/5
12 Jason Terry - Boston Celtics #/5
13 Moses Malone - Atlanta Hawks #/5
14 Reggie Lewis - Boston Celtics #/5
15 DeMarcus Cousins - Sacramento Kings #/5
16 Glen Davis - Orlando Magic #/5
17 Greg Monroe - Detroit Pistons #/5
18 Kevin Love - Minnesota Timberwolves #/5
19 Magic Johnson - Los Angeles Lakers #/5
20 Tim Duncan - San Antonio Spurs #/5
21 Ray Allen - Miami Heat #/5
22 Andre Iguodala - Denver Nuggets #/5
23 Blake Griffin - Los Angeles Clippers #/5
24 John Wall - Washington Wizards #/5
25 Derrick Favors - Utah Jazz #/5
26 Eric Gordon - New Orleans Pelicans #/5
27 James Harden - Houston Rockets #/5
28 Kevin Garnett - Boston Celtics #/5
29 Marc Gasol - Memphis Grizzlies #/5
30 Tony Parker - San Antonio Spurs #/5
31 Rajon Rondo - Boston Celtics #/5
32 Al Jefferson - Utah Jazz #/5
33 Brandon Jennings - Milwaukee Bucks #/5
34 Chris Paul - Los Angeles Clippers #/5
35 Allen Iverson - Philadelphia 76ers #/5
36 Dwyane Wade - Miami Heat #/5
37 Jeremy Lin - Houston Rockets #/5
38 Kevin Durant - Oklahoma City Thunder #/5
39 Marcin Gortat - Phoenix Suns #/5
40 Tyreke Evans - Sacramento Kings #/5
41 Paul Pierce - Boston Celtics #/5
42 Manu Ginobili - San Antonio Spurs #/5
43 Carlos Boozer - Chicago Bulls #/5
44 Carmelo Anthony - New York Knicks #/5
45 Dirk Nowitzki - Dallas Mavericks #/5
46 Dwight Howard - Los Angeles Lakers #/5
47 Joakim Noah - Chicago Bulls #/5
48 Josh Smith - Atlanta Hawks #/5
49 O.J. Mayo - Dallas Mavericks #/5
50 LeBron James - Miami Heat #/5
51 Alonzo Mourning - Charlotte Hornets #/5
52 Karl Malone - Utah Jazz #/5
53 Wilt Chamberlain - Los Angeles Lakers #/2
54 Shaquille O'Neal - Orlando Magic #/4
55 David Robinson - San Antonio Spurs #/5
56 Kevin McHale - Boston Celtics #/5
57 Jason Williams - Orlando Magic #/5
58 Manute Bol - Philadelphia 76ers #/5
59 Fat Lever - Denver Nuggets #/5
60 Larry Bird - Boston Celtics #/5
61 Gus Williams - Washington Bullets #/5
62 John Stockton - Utah Jazz #/5
63 Gail Goodrich - Phoenix Suns #/5
64 Lou Hudson - Atlanta Hawks #/5
65 Pete Maravich - Boston Celtics #/2
66 James Worthy - Los Angeles Lakers #/5
67 Hakeem Olajuwon - Houston Rockets #/5
68 Moses Malone - Philadelphia 76ers #/5
69 Rasheed Wallace - New York Knicks #/5
70 Jamaal Wilkes - Los Angeles Lakers #/5
71 Hal Greer - Philadelphia 76ers #/3
72 Nate Thurmond - Golden State Warriors #/5
73 Patrick Ewing - New York Knicks #/5
74 Jack Sikma - Milwaukee Bucks #/3
75 Isiah Thomas - Detroit Pistons #/5
`
  },
  {
    name: 'Platinum',
    order: 4,
    defaultPrintRun: 1,
    raw: `
1 Russell Westbrook - Oklahoma City Thunder
2 Amar'e Stoudemire - New York Knicks
3 Andrei Kirilenko - Minnesota Timberwolves
4 David Lee - Golden State Warriors
5 David West - Indiana Pacers
6 Goran Dragic - Phoenix Suns
7 Grant Hill - Los Angeles Clippers
8 Alex English - Dallas Mavericks
9 LaMarcus Aldridge - Portland Trail Blazers
10 Roy Hibbert - Indiana Pacers
11 Ricky Rubio - Minnesota Timberwolves
12 Jason Terry - Boston Celtics
13 Moses Malone - Atlanta Hawks
14 Reggie Lewis - Boston Celtics
15 DeMarcus Cousins - Sacramento Kings
16 Glen Davis - Orlando Magic
17 Greg Monroe - Detroit Pistons
18 Kevin Love - Minnesota Timberwolves
19 Magic Johnson - Los Angeles Lakers
20 Tim Duncan - San Antonio Spurs
21 Ray Allen - Miami Heat
22 Andre Iguodala - Denver Nuggets
23 Blake Griffin - Los Angeles Clippers
24 John Wall - Washington Wizards
25 Derrick Favors - Utah Jazz
26 Eric Gordon - New Orleans Pelicans
27 James Harden - Houston Rockets
28 Kevin Garnett - Boston Celtics
29 Marc Gasol - Memphis Grizzlies
30 Tony Parker - San Antonio Spurs
31 Rajon Rondo - Boston Celtics
32 Al Jefferson - Utah Jazz
33 Brandon Jennings - Milwaukee Bucks
34 Chris Paul - Los Angeles Clippers
35 Allen Iverson - Philadelphia 76ers
36 Dwyane Wade - Miami Heat
37 Jeremy Lin - Houston Rockets
38 Kevin Durant - Oklahoma City Thunder
39 Marcin Gortat - Phoenix Suns
40 Tyreke Evans - Sacramento Kings
41 Paul Pierce - Boston Celtics
42 Manu Ginobili - San Antonio Spurs
43 Carlos Boozer - Chicago Bulls
44 Carmelo Anthony - New York Knicks
45 Dirk Nowitzki - Dallas Mavericks
46 Dwight Howard - Los Angeles Lakers
47 Joakim Noah - Chicago Bulls
48 Josh Smith - Atlanta Hawks
49 O.J. Mayo - Dallas Mavericks
50 LeBron James - Miami Heat
51 Alonzo Mourning - Charlotte Hornets
52 Karl Malone - Utah Jazz
53 Wilt Chamberlain - Los Angeles Lakers
54 Shaquille O'Neal - Orlando Magic
55 David Robinson - San Antonio Spurs
56 Kevin McHale - Boston Celtics
57 Jason Williams - Orlando Magic
58 Manute Bol - Philadelphia 76ers
59 Fat Lever - Denver Nuggets
60 Larry Bird - Boston Celtics
61 Gus Williams - Washington Bullets
62 John Stockton - Utah Jazz
63 Gail Goodrich - Phoenix Suns
64 Lou Hudson - Atlanta Hawks
65 Pete Maravich - Boston Celtics
66 James Worthy - Los Angeles Lakers
67 Hakeem Olajuwon - Houston Rockets
68 Moses Malone - Philadelphia 76ers
69 Rasheed Wallace - New York Knicks
70 Jamaal Wilkes - Los Angeles Lakers
71 Hal Greer - Philadelphia 76ers
72 Nate Thurmond - Golden State Warriors
73 Patrick Ewing - New York Knicks
74 Jack Sikma - Milwaukee Bucks
75 Isiah Thomas - Detroit Pistons
`
  }
]

const ROOKIE_PATCH_PLAYERS = `
1 Harrison Barnes
2 Kenneth Faried
3 Chandler Parsons
4 Damian Lillard
5 Klay Thompson
6 Andre Drummond
7 Jared Sullinger
8 Anthony Davis
9 Jonas Valanciunas
10 Michael Kidd-Gilchrist
11 Isaiah Thomas
12 Austin Rivers
13 Kawhi Leonard
14 John Henson
15 Iman Shumpert
16 Bradley Beal
17 Kemba Walker
18 Kyrie Irving
19 Dion Waiters
20 Brandon Knight
21 Thomas Robinson
22 Tristan Thompson
23 Jimmer Fredette
24 Kyrie Irving
25 Damian Lillard
`

const ROOKIE_PATCH_RUNS = {
  Base: 25,
  Ruby: 15,
  Gold: 10,
  Emerald: 5,
  Platinum: 1
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

async function addCloudDB(accessToken, query) {
  return callCloudApi(accessToken, 'databaseadd', { query })
}

async function updateCloudDB(accessToken, query) {
  return callCloudApi(accessToken, 'databaseupdate', { query })
}

async function findSeriesByName(accessToken, name) {
  const result = await queryCloudDB(accessToken, `db.collection("my_series").where({name:${quote(name)}}).limit(2).get()`)
  return result.data.map(item => JSON.parse(item))
}

function parseRawCards(config) {
  return config.raw.split('\n').map(line => line.trim()).filter(Boolean).map(line => {
    const match = line.match(/^(\d+)\s+(.+?)\s+[-–—]\s+(.+?)(?:\s+#\/(\d+))?$/)
    if (!match) throw new Error(`无法解析 ${config.name}: ${line}`)
    const printRun = match[4] ? Number(match[4]) : Number(config.defaultPrintRun || 0)
    if (!Number.isInteger(printRun) || printRun <= 0) throw new Error(`缺少限编 ${config.name}: ${line}`)
    return {
      no: Number(match[1]),
      player: match[2].trim(),
      team: match[3].trim(),
      printRun,
      cardKind: 'Patches',
      kindKey: 'patches'
    }
  })
}

function parseRookiePatchCards(subsetName) {
  const printRun = ROOKIE_PATCH_RUNS[subsetName]
  if (!printRun) return []
  return ROOKIE_PATCH_PLAYERS.split('\n').map(line => line.trim()).filter(Boolean).map(line => {
    const match = line.match(/^(\d+)\s+(.+)$/)
    if (!match) throw new Error(`无法解析 Rookie Patches: ${line}`)
    return {
      no: Number(match[1]),
      player: match[2].trim(),
      team: '',
      printRun,
      cardKind: 'Rookie Patches',
      kindKey: 'rookie_patches'
    }
  })
}

function createItemId(subsetName, card) {
  return `flawless_patches_2012_${subsetName.toLowerCase()}_${card.kindKey}_${card.no}`
}

function buildItem(subsetName, card) {
  return {
    itemId: createItemId(subsetName, card),
    text: card.team
      ? `${card.no} ${card.player} - ${card.team}`
      : `${card.no} ${card.cardKind} - ${card.player}`,
    subset: subsetName,
    cardKind: card.cardKind,
    printRun: card.printRun,
    completionTarget: card.printRun,
    creatorOpenid: CREATOR_OPENID,
    images: [],
    cardId: null,
    collected: false
  }
}

function buildSubsetDocs(seriesId = '__DRY_RUN_SERIES_ID__') {
  const now = new Date().toISOString()
  return RAW_SUBSETS.map(config => ({
    seriesId,
    subset: config.name,
    order: config.order,
    items: [
      ...parseRawCards(config),
      ...parseRookiePatchCards(config.name)
    ].map(card => buildItem(config.name, card)),
    createTime: now,
    updateTime: now
  }))
}

function buildPresetNumbers(items) {
  return [...new Set(items.map(item => item.printRun).filter(Boolean))]
    .sort((a, b) => a - b)
    .map(num => ({ value: `/${num}`, creatorOpenid: CREATOR_OPENID }))
}

function buildSeriesDoc(subsetDocs) {
  const items = subsetDocs.flatMap(doc => doc.items)
  const stats = progressData.buildChecklistProgressStats(items)
  const now = new Date().toISOString()
  return {
    name: SERIES_NAME,
    description: DESCRIPTION,
    accessType: 'public',
    hasSubset: true,
    subsetType: 'card',
    cardType: 'card',
    seriesLevel: 3,
    checklistComplete: true,
    defaultInfoEnabled: true,
    defaultYear: '2012-13',
    defaultBrand: 'Panini',
    defaultCardSeries: 'Flawless',
    totalCards: stats.totalCards,
    listCollectedCount: stats.listCollectedCount,
    listTotalCount: stats.listTotalCount,
    listProgress: stats.listProgress,
    listImageCount: stats.listImageCount,
    listRecentImages: stats.listRecentImages,
    listIsFree: false,
    freeImages: [],
    checklist: [],
    presetCardKinds: [
      { value: 'Patches', creatorOpenid: CREATOR_OPENID },
      { value: 'Rookie Patches', creatorOpenid: CREATOR_OPENID }
    ],
    presetNumbers: buildPresetNumbers(items),
    creatorOpenid: CREATOR_OPENID,
    createTime: now,
    updateTime: now
  }
}

function summarize(subsetDocs) {
  const items = subsetDocs.flatMap(doc => doc.items)
  const stats = progressData.buildChecklistProgressStats(items)
  return {
    seriesName: SERIES_NAME,
    subsetCount: subsetDocs.length,
    itemCount: items.length,
    totalCards: stats.totalCards,
    subsets: subsetDocs.map(doc => ({
      name: doc.subset,
      itemCount: doc.items.length,
      totalCards: progressData.buildChecklistProgressStats(doc.items).totalCards,
      first: `${doc.items[0].text} #/${doc.items[0].printRun}`,
      last: `${doc.items[doc.items.length - 1].text} #/${doc.items[doc.items.length - 1].printRun}`
    })),
    presetNumbers: buildPresetNumbers(items).map(item => item.value)
  }
}

async function main() {
  const apply = process.argv.includes('--apply')
  const updateDescription = process.argv.includes('--update-description')
  const env = loadEnv()
  const appSecret = env.APP_SECRET || process.env.APP_SECRET
  if (!appSecret) throw new Error(`缺少 ${ENV_PATH} 中的 APP_SECRET`)

  const accessToken = await getAccessToken(appSecret)
  const existing = await findSeriesByName(accessToken, SERIES_NAME)
  if (existing.length > 0) {
    if (!updateDescription) throw new Error(`同名图鉴已存在，停止创建: ${existing.map(item => item._id).join(', ')}`)
    if (existing.length > 1) throw new Error(`存在多个同名图鉴，停止更新: ${existing.map(item => item._id).join(', ')}`)
    await updateCloudDB(accessToken, `db.collection("my_series").doc(${quote(existing[0]._id)}).update({data:${JSON.stringify({
      description: DESCRIPTION,
      updateTime: new Date().toISOString()
    })}})`)
    console.log(JSON.stringify({ updatedDescription: true, seriesId: existing[0]._id, description: DESCRIPTION }, null, 2))
    return
  }

  const drySubsetDocs = buildSubsetDocs()
  const summary = summarize(drySubsetDocs)
  console.log(JSON.stringify({ mode: apply ? 'apply' : 'dry-run', summary }, null, 2))
  if (!apply) return

  const seriesDoc = buildSeriesDoc(drySubsetDocs)
  const addSeriesResult = await addCloudDB(accessToken, `db.collection("my_series").add({data:[${JSON.stringify(seriesDoc)}]})`)
  const seriesId = addSeriesResult.id_list && addSeriesResult.id_list[0]
  if (!seriesId) throw new Error(`创建图鉴失败: ${JSON.stringify(addSeriesResult)}`)

  const subsetDocs = buildSubsetDocs(seriesId)
  for (const doc of subsetDocs) {
    await addCloudDB(accessToken, `db.collection("my_series_subsets").add({data:[${JSON.stringify(doc)}]})`)
  }

  console.log(JSON.stringify({ created: true, seriesId, summary: summarize(subsetDocs) }, null, 2))
}

main().catch(err => {
  console.error(err.message || err)
  process.exit(1)
})
