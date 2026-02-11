// 球星卡数据
// 格式说明：
// - id: 唯一标识符
// - player: 球员英文名称
// - playerCN: 球员中文名称（可选，用于中文搜索）
// - brand: 品牌
// - year: 年份
// - series: 系列
// - number: 编号
// - status: 状态 (confirmed=确定换patch, suspected=高危/对比发现)
// - images: 照片数组
//   - url: 图片路径（相对于项目根目录）
//   - note: 备注说明

const cardsData = [
  {
    id: 1,
    player: "Kyrie Irving",
    playerCN: "凯里·欧文",
    brand: "Panini",
    year: "2012-13",
    series: "Immaculate",
    number: "27/75编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/kyrie-1.jpg",
        note: "拍卖照片"
      },
      {
        url: "images/sample/kyrie-2.jpg",
        note: "PSA/DNA 认证照片"
      }
    ]
  },
  {
    id: 2,
    player: "Kyrie Irving",
    playerCN: "凯里·欧文",
    brand: "Panini",
    year: "2016-17",
    series: "Immaculate",
    number: "1/10编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/kyrie-2016-1.jpg",
        note: "对比图 - 左右两版本patch差异明显"
      }
    ]
  },
  {
    id: 3,
    player: "Kyrie Irving",
    playerCN: "凯里·欧文",
    brand: "Panini",
    year: "2016-17",
    series: "Immaculate",
    number: "6/10编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/kyrie-2016-2.jpg",
        note: "对比图 - 左右两版本patch差异明显"
      }
    ]
  },
  {
    id: 4,
    player: "Vince Carter",
    playerCN: "文斯·卡特",
    brand: "Panini",
    year: "2017-18",
    series: "Immaculate",
    number: "1/1编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/vince-carter-1.jpg",
        note: "原始照片"
      },
      {
        url: "images/sample/vince-carter-2.jpg",
        note: "换patch后 - Kings Logo patch"
      }
    ]
  },
  {
    id: 5,
    player: "Kobe Bryant",
    playerCN: "科比·布莱恩特",
    brand: "Panini",
    year: "2012-13",
    series: "Immaculate",
    number: "3/75编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/kobe-1.jpg",
        note: "BGS评级版本 - 三色patch（灰/黄/蓝）"
      },
      {
        url: "images/sample/kobe-2.jpg",
        note: "完整24号球衣patch（紫/黄/白）"
      },
      {
        url: "images/sample/kobe-3.jpg",
        note: "另一版本"
      }
    ]
  },
  {
    id: 6,
    player: "Tracy McGrady",
    playerCN: "特雷西·麦克格雷迪",
    brand: "Upper Deck",
    year: "2005-06",
    series: "Exquisite Noble Nameplates",
    number: "10/25编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/tmac-1.jpg",
        note: "对比图 - 上图BGS评级版黑色B字母patch vs 中图原卡红色patch，签名墨水也不同"
      }
    ]
  },
  {
    id: 7,
    player: "Gerald Wallace",
    playerCN: "杰拉德·华莱士",
    brand: "Panini",
    year: "2024-25",
    series: "Silhouette",
    number: "9/10编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/gerald-wallace-2.jpg",
        note: "多色条纹patch（灰/白/蓝）"
      },
      {
        url: "images/sample/gerald-wallace-1.jpg",
        note: "换patch后 - Adidas logo黑白patch"
      }
    ]
  },
  {
    id: 8,
    player: "Alec Burks",
    playerCN: "亚历克·伯克斯",
    brand: "Panini",
    year: "2024-25",
    series: "Silhouette Threads",
    number: "22/25编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/alec-burks-1.jpg",
        note: "对比图 - 左侧Thunder队logo patch vs 右侧橙蓝双色patch"
      }
    ]
  },
  {
    id: 9,
    player: "PJ Washington Jr",
    playerCN: "PJ·华盛顿",
    brand: "Panini",
    year: "2020-21",
    series: "One and One",
    number: "15/35编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/pj-washington-old.jpg",
        note: "原版 - 纯色蓝绿patch"
      },
      {
        url: "images/sample/pj-washington-new.jpg",
        note: "换patch后 - NBA logo多色patch"
      }
    ]
  },
  {
    id: 10,
    player: "Enrique Freeman",
    playerCN: "恩里克·弗里曼",
    brand: "Panini",
    year: "2024-25",
    series: "Silhouette",
    number: "10/10编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/enrique-freeman-old.jpg",
        note: "原版 - 大号字母patch（深蓝黄边）"
      },
      {
        url: "images/sample/enrique-freeman-new.jpg",
        note: "换patch后 - NBA logo patch"
      }
    ]
  },
  {
    id: 11,
    player: "Anthony Black & Jett Howard",
    playerCN: "安东尼·布莱克 & 杰特·霍华德",
    brand: "Panini",
    year: "2023-24",
    series: "Immaculate Rookie Jerseys",
    number: "44/75编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/black-howard-old.jpg",
        note: "原版 - 双白色patch"
      },
      {
        url: "images/sample/black-howard-new.jpg",
        note: "换patch后 - 左侧Nike logo + 右侧文字patch"
      }
    ]
  },
  {
    id: 12,
    player: "Kobe Bryant",
    playerCN: "科比·布莱恩特",
    brand: "Panini",
    year: "2015-16",
    series: "Preferred Silhouettes",
    number: "21/25编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/kobe-2015-old.jpg",
        note: "原版 - 纯黄色patch"
      },
      {
        url: "images/sample/kobe-2015-new.jpg",
        note: "换patch后 - BGS评级版 黄蓝双色patch"
      }
    ]
  },
  {
    id: 13,
    player: "Franz Wagner",
    playerCN: "弗朗茨·瓦格纳",
    brand: "Panini",
    year: "2021-22",
    series: "Immaculate Rookie Patch Autographs",
    number: "4/5编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/franz-wagner-old.jpg",
        note: "原版 - 编号patch（N3691）"
      },
      {
        url: "images/sample/franz-wagner-new.jpg",
        note: "换patch后 - BGS评级版 Nike logo patch"
      }
    ]
  },
  {
    id: 14,
    player: "Josh Giddey",
    playerCN: "约什·吉迪",
    brand: "Panini",
    year: "2023-24",
    series: "Immaculate Remarkable Jerseys",
    number: "73/99编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/josh-giddey-old.jpg",
        note: "原版 - 纯白色patch"
      },
      {
        url: "images/sample/josh-giddey-new.jpg",
        note: "换patch后 - Thunder队多色条纹patch（橙/黄/黑）"
      }
    ]
  },
  {
    id: 15,
    player: "Harrison Ingram",
    playerCN: "哈里森·英格拉姆",
    brand: "Panini",
    year: "2024-25",
    series: "Immaculate Jersey Number",
    number: "16/50编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/harrison-ingram-old.jpg",
        note: "原版 - 白色条纹patch（带黑色边框）"
      },
      {
        url: "images/sample/harrison-ingram-new.jpg",
        note: "换patch后 - 大号S字母patch（黑底白S）"
      }
    ]
  },
  {
    id: 16,
    player: "Chris Paul",
    playerCN: "克里斯·保罗",
    brand: "Panini",
    year: "2021-22",
    series: "Flawless Signature Prime Materials Gold",
    number: "4/10编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/chris-paul-old.jpg",
        note: "原版 - 纯白色patch"
      },
      {
        url: "images/sample/chris-paul-new.jpg",
        note: "换patch后 - BGS评级版 黑橙白三色patch"
      }
    ]
  },
  {
    id: 17,
    player: "Tyrese Haliburton",
    playerCN: "泰瑞斯·哈利伯顿",
    brand: "Panini",
    year: "2023-24",
    series: "Noir Box Office Memorabilia",
    number: "70/99编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/tyrese-haliburton-old.jpg",
        note: "原版 - 浅粉白色patch"
      },
      {
        url: "images/sample/tyrese-haliburton-new.jpg",
        note: "换patch后 - 深蓝白双色patch"
      }
    ]
  },
  {
    id: 18,
    player: "Stephen Curry",
    playerCN: "斯蒂芬·库里",
    brand: "Panini",
    year: "2015-16",
    series: "Immaculate Collection Premium Autograph Patches",
    number: "07/25编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/stephen-curry-07-old.jpg",
        note: "原版 - 纯蓝色patch"
      },
      {
        url: "images/sample/stephen-curry-07-new.jpg",
        note: "换patch后 - 蓝黄双色斜纹patch"
      }
    ]
  },
  {
    id: 19,
    player: "Stephen Curry",
    playerCN: "斯蒂芬·库里",
    brand: "Panini",
    year: "2015-16",
    series: "Immaculate Collection Premium Autograph Patches",
    number: "08/25编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/stephen-curry-08-old.jpg",
        note: "原版 - 蓝色主体+黄色角落双色patch"
      },
      {
        url: "images/sample/stephen-curry-08-new.jpg",
        note: "换patch后 - BGS评级版 蓝黄多条纹patch"
      }
    ]
  },
  {
    id: 20,
    player: "Kristaps Porzingis",
    playerCN: "克里斯塔普斯·波尔津吉斯",
    brand: "Panini",
    year: "2016-17",
    series: "Preferred Silhouettes",
    number: "06/10编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/porzingis-old.jpg",
        note: "原版 - 蓝橙竖条纹patch"
      },
      {
        url: "images/sample/porzingis-new.jpg",
        note: "换patch后 - 蓝橙不规则色块patch"
      }
    ]
  },
  {
    id: 21,
    player: "Jalen Williams",
    playerCN: "杰伦·威廉姆斯",
    brand: "Panini",
    year: "2022-23",
    series: "Impeccable Elegance RC",
    number: "53/99编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/jalen-williams-old.jpg",
        note: "原版 - 纯蓝色patch"
      },
      {
        url: "images/sample/jalen-williams-new.jpg",
        note: "换patch后 - 蓝白红三色patch"
      }
    ]
  },
  {
    id: 22,
    player: "Yao Ming & Tracy McGrady & Luis Scola",
    playerCN: "姚明 & 麦迪 & 斯科拉",
    brand: "Upper Deck",
    year: "2008-09",
    series: "Premier Rare Patches Triple",
    number: "3/15编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/rockets-triple-old.jpg",
        note: "原版 - 三人patch（姚明白蓝、麦迪浅蓝白、斯科拉白红）"
      },
      {
        url: "images/sample/rockets-triple-new.jpg",
        note: "换patch后 - PSA评级版 麦迪patch颜色明显不同"
      }
    ]
  },
  {
    id: 23,
    player: "Stephen Curry",
    playerCN: "斯蒂芬·库里",
    brand: "Panini",
    year: "2018-19",
    series: "Flawless Vertical Patch Autographs",
    number: "15/25编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/curry-flawless-old.jpg",
        note: "原版 - 纯黄色点状球衣patch"
      },
      {
        url: "images/sample/curry-flawless-new.jpg",
        note: "换patch后 - BGS9评级版 蓝金双色带WARRIORS字母patch"
      }
    ]
  },
  {
    id: 24,
    player: "Magic Johnson",
    playerCN: "魔术师约翰逊",
    brand: "Panini",
    year: "2016-17",
    series: "National Treasures Colossal Jersey Autos",
    number: "15/25编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/magic-johnson-comparison.jpg",
        note: "对比图 - 上方PSA版(黄白蓝patch) vs 下方BGS版(紫金A字母patch)"
      }
    ]
  },
  {
    id: 25,
    player: "Clyde Drexler",
    playerCN: "克莱德·德雷克斯勒",
    brand: "Panini",
    year: "2015-16",
    series: "Immaculate Collection",
    number: "5/10编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/clyde-drexler-comparison.jpg",
        note: "对比图 - 左侧红白N字母patch vs 右侧卡淘交易记录同编号不同patch"
      }
    ]
  },
  {
    id: 26,
    player: "Karl Malone",
    playerCN: "卡尔·马龙",
    brand: "Panini",
    year: "2015-16",
    series: "Immaculate Collection",
    number: "5/10编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/karl-malone-comparison.jpg",
        note: "对比图 - 左侧紫金J字母patch vs 右侧卡淘交易记录同编号不同patch"
      }
    ]
  },
  {
    id: 27,
    player: "Shaquille O'Neal",
    playerCN: "沙奎尔·奥尼尔",
    brand: "Panini",
    year: "2013-14",
    series: "Immaculate Collection",
    number: "26/34编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/shaq-comparison.jpg",
        note: "对比图 - 左侧现状(签字+patch) vs 右侧eBay原始记录(签字形态不同)"
      }
    ]
  },
  {
    id: 28,
    player: "Karl Malone",
    playerCN: "卡尔·马龙",
    brand: "Panini",
    year: "2014-15",
    series: "Flawless",
    number: "4/10编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/malone-flawless-comparison.jpg",
        note: "对比图 - 左侧蓝红白patch vs 右侧紫金patch 签字落点位置也不同"
      }
    ]
  },
  {
    id: 29,
    player: "Zach LaVine",
    playerCN: "扎克·拉文",
    brand: "Panini",
    year: "2015-16",
    series: "National Treasures Colossal Jersey Patch Auto",
    number: "23/25编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/zach-lavine-comparison.jpg",
        note: "对比图 - 左侧蓝底白M字母patch vs 右侧eBay 2018年记录棕白patch"
      }
    ]
  },
  {
    id: 30,
    player: "John Stockton",
    playerCN: "约翰·斯托克顿",
    brand: "Panini",
    year: "2013-14",
    series: "Immaculate Premium Patches Jumbo Patch Auto",
    number: "19/25编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/john-stockton-comparison.jpg",
        note: "对比图 - 左侧紫黄白多色patch vs 右侧eBay 2014年记录紫金patch"
      }
    ]
  },
  {
    id: 31,
    player: "Karl Malone",
    playerCN: "卡尔·马龙",
    brand: "Panini",
    year: "2013-14",
    series: "Immaculate Premium Patches",
    number: "⚠️同系列对比：未找到相同编号的换patch记录，此卡通过与同系列真品patch质感对比判断疑似被换",
    status: "suspected",
    images: [
      {
        url: "images/sample/malone-imm-series-comparison.jpg",
        note: "同系列对比 - 左侧三张实物patch质感颜色一致(透气孔染色劣等球衣) vs 右侧eBay同系列真品patch质感对比"
      }
    ]
  },
  {
    id: 32,
    player: "Kevin Garnett",
    playerCN: "凯文·加内特",
    brand: "Panini",
    year: "2020-21",
    series: "National Treasures Logoman Autograph",
    number: "1/1编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/kevin-garnett-old.jpg",
        note: "原版 - 球衣标签patch（EVERY PLAYER EVERY GAME + 编号MT102464）"
      },
      {
        url: "images/sample/kevin-garnett-new.jpg",
        note: "换patch后 - PSA评级版 NBA Logoman patch（红白蓝NBA标志）"
      }
    ]
  },
  {
    id: 33,
    player: "Derrick Rose",
    playerCN: "德里克·罗斯",
    brand: "Upper Deck",
    year: "2008-09",
    series: "Exquisite Collection Prime",
    number: "50/50编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/derrick-rose-old.jpg",
        note: "原版 - NBA Logoman patch（红白蓝NBA标志）"
      },
      {
        url: "images/sample/derrick-rose-new.jpg",
        note: "换patch后 - PSA评级版 公牛队logo patch（红色公牛头像）"
      }
    ]
  },
  {
    id: 34,
    player: "Derrick Rose",
    playerCN: "德里克·罗斯",
    brand: "Upper Deck",
    year: "2009-10",
    series: "Exquisite Collection Extra Exquisite",
    number: "10/15编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/rose-extra-old.jpg",
        note: "原版 - 红黑白竖条纹小patch"
      },
      {
        url: "images/sample/rose-extra-new.jpg",
        note: "换patch后 - 大号51号码patch（红白黑三色）"
      }
    ]
  },
  {
    id: 35,
    player: "Kevin Garnett",
    playerCN: "凯文·加内特",
    brand: "Panini",
    year: "2020-21",
    series: "Crown Royale Silhouettes",
    number: "12/12编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/garnett-silhouettes-old.jpg",
        note: "原版 - 纯深蓝色球衣patch"
      },
      {
        url: "images/sample/garnett-silhouettes-new.jpg",
        note: "换patch后 - eBay标注ALTERED PATCH 森林狼狼头logo patch"
      }
    ]
  },
  {
    id: 36,
    player: "Kevin Durant",
    playerCN: "凯文·杜兰特",
    brand: "Panini",
    year: "2018-19",
    series: "Immaculate Collection",
    number: "01/35编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/durant-imm-old.jpg",
        note: "原版 - 纯黄色点状球衣patch"
      },
      {
        url: "images/sample/durant-imm-new.jpg",
        note: "换patch后 - 闲鱼在售 黄色L字母patch"
      }
    ]
  },
  {
    id: 37,
    player: "Eddie Jones",
    playerCN: "埃迪·琼斯",
    brand: "Panini",
    year: "2014-15",
    series: "Immaculate Collection",
    number: "10/10编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/eddie-jones-old.jpg",
        note: "原版 - 紫白双色球衣patch"
      },
      {
        url: "images/sample/eddie-jones-new.jpg",
        note: "换patch后 - 紫金LA字母patch"
      }
    ]
  },
  {
    id: 38,
    player: "Vince Carter",
    playerCN: "文斯·卡特",
    brand: "Panini",
    year: "2013-14",
    series: "Immaculate Premium Patches",
    number: "25编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/vince-carter-premium.jpg",
        note: "对比图 - 上图蓝白条纹patch vs 下图黑白蓝D字母patch"
      }
    ]
  },
  {
    id: 39,
    player: "Gary Payton",
    playerCN: "加里·佩顿",
    brand: "Panini",
    year: "2014-15",
    series: "Flawless Greats",
    number: "04/25编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/gary-payton-old.jpg",
        note: "原版 - 左右两块黄绿双色竖条纹patch"
      },
      {
        url: "images/sample/gary-payton-new.jpg",
        note: "换patch后 - 左右两块鲜艳黄绿斜条纹patch"
      }
    ]
  },
  {
    id: 40,
    player: "Karl Malone",
    playerCN: "卡尔·马龙",
    brand: "Panini",
    year: "2014-15",
    series: "Flawless Greats",
    number: "09/10编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/malone-flawless-greats-old.jpg",
        note: "原版 - 左紫色+右白紫横条纹patch"
      },
      {
        url: "images/sample/malone-flawless-greats-new.jpg",
        note: "换patch后 - 左紫白横条纹+右紫色patch"
      }
    ]
  },
  {
    id: 41,
    player: "Kawhi Leonard",
    playerCN: "卡哇伊·莱昂纳德",
    brand: "Panini",
    year: "2014-15",
    series: "Immaculate Collection Premium Patches",
    number: "04/10编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/kawhi-leonard-comparison.jpg",
        note: "对比图 - 上图BGS8.5版黑白灰马刺logo patch vs 下图原版白灰patch"
      }
    ]
  },
  {
    id: 42,
    player: "Clyde Drexler",
    playerCN: "克莱德·德雷克斯勒",
    brand: "Panini",
    year: "2012-13",
    series: "Flawless Greats",
    number: "08/15编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/drexler-flawless.jpg",
        note: "左图实物+右图放大 - 红白蓝条纹patch"
      }
    ]
  },
  {
    id: 43,
    player: "John Stockton",
    playerCN: "约翰·斯托克顿",
    brand: "Panini",
    year: "2013-14",
    series: "Flawless",
    number: "09/10编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/stockton-flawless.jpg",
        note: "对比图 - 左图紫红多色patch vs 右图纯黄色patch"
      }
    ]
  },
  {
    id: 44,
    player: "David Robinson",
    playerCN: "大卫·罗宾逊",
    brand: "Panini",
    year: "2013-14",
    series: "Flawless",
    number: "01/10编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/david-robinson-flawless.jpg",
        note: "对比图 - 左图白L字母patch vs 右图纯黑色patch"
      }
    ]
  },
  {
    id: 45,
    player: "Magic Johnson",
    playerCN: "魔术师约翰逊",
    brand: "Panini",
    year: "2015-16",
    series: "Spectra",
    number: "08/10编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/magic-spectra.jpg",
        note: "左图实物+右图放大 - 黄紫双色patch"
      }
    ]
  }
];

// 导出数据
if (typeof module !== 'undefined' && module.exports) {
  module.exports = cardsData;
}
