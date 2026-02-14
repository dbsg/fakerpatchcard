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
        note: "版本1照片"
      },
      {
        url: "images/sample/vince-carter-2.jpg",
        note: "版本2 - Kings Logo patch"
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
        note: "对比图 - 上图BGS评级版黑色B字母patch vs 中图卡片红色patch"
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
        note: "版本2 - Adidas logo黑白patch"
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
        note: "版本1 - 纯色蓝绿patch"
      },
      {
        url: "images/sample/pj-washington-new.jpg",
        note: "版本2 - NBA logo多色patch"
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
        note: "版本1 - 大号字母patch（深蓝黄边）"
      },
      {
        url: "images/sample/enrique-freeman-new.jpg",
        note: "版本2 - NBA logo patch"
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
        note: "版本1 - 双白色patch"
      },
      {
        url: "images/sample/black-howard-new.jpg",
        note: "版本2 - 左侧Nike logo + 右侧文字patch"
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
        note: "版本1 - 纯黄色patch"
      },
      {
        url: "images/sample/kobe-2015-new.jpg",
        note: "版本2 - BGS评级版 黄蓝双色patch"
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
        note: "版本1 - 编号patch（N3691）"
      },
      {
        url: "images/sample/franz-wagner-new.jpg",
        note: "版本2 - BGS评级版 Nike logo patch"
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
        note: "版本1 - 纯白色patch"
      },
      {
        url: "images/sample/josh-giddey-new.jpg",
        note: "版本2 - Thunder队多色条纹patch（橙/黄/黑）"
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
        note: "版本1 - 白色条纹patch（带黑色边框）"
      },
      {
        url: "images/sample/harrison-ingram-new.jpg",
        note: "版本2 - 大号S字母patch（黑底白S）"
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
        note: "版本1 - 纯白色patch"
      },
      {
        url: "images/sample/chris-paul-new.jpg",
        note: "版本2 - BGS评级版 黑橙白三色patch"
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
        note: "版本1 - 浅粉白色patch"
      },
      {
        url: "images/sample/tyrese-haliburton-new.jpg",
        note: "版本2 - 深蓝白双色patch"
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
        note: "版本1 - 纯蓝色patch"
      },
      {
        url: "images/sample/stephen-curry-07-new.jpg",
        note: "版本2 - 蓝黄双色斜纹patch"
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
        note: "版本1 - 蓝色主体+黄色角落双色patch"
      },
      {
        url: "images/sample/stephen-curry-08-new.jpg",
        note: "版本2 - BGS评级版 蓝黄多条纹patch"
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
        note: "版本1 - 蓝橙竖条纹patch"
      },
      {
        url: "images/sample/porzingis-new.jpg",
        note: "版本2 - 蓝橙不规则色块patch"
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
        note: "版本1 - 纯蓝色patch"
      },
      {
        url: "images/sample/jalen-williams-new.jpg",
        note: "版本2 - 蓝白红三色patch"
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
        note: "版本1 - 三人patch（姚明白蓝、麦迪浅蓝白、斯科拉白红）"
      },
      {
        url: "images/sample/rockets-triple-new.jpg",
        note: "版本2 - PSA评级版 麦迪patch颜色明显不同"
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
        note: "版本1 - 纯黄色点状球衣patch"
      },
      {
        url: "images/sample/curry-flawless-new.jpg",
        note: "版本2 - BGS9评级版 蓝金双色带WARRIORS字母patch"
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
        note: "对比图 - 左侧现状(签字+patch) vs 右侧eBay早期记录(签字形态不同)"
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
    number: "未知",
    status: "suspected",
    highRiskReason: "未找到相同编号的换patch记录，此卡通过与同系列其他卡片patch对比判断疑似被换",
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
        note: "版本1 - 球衣标签patch（EVERY PLAYER EVERY GAME + 编号MT102464）"
      },
      {
        url: "images/sample/kevin-garnett-new.jpg",
        note: "版本2 - PSA评级版 NBA Logoman patch（红白蓝NBA标志）"
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
        note: "版本1 - NBA Logoman patch（红白蓝NBA标志）"
      },
      {
        url: "images/sample/derrick-rose-new.jpg",
        note: "版本2 - PSA评级版 公牛队logo patch（红色公牛头像）"
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
        note: "版本1 - 红黑白竖条纹小patch"
      },
      {
        url: "images/sample/rose-extra-new.jpg",
        note: "版本2 - 大号51号码patch（红白黑三色）"
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
        note: "版本1 - 纯深蓝色球衣patch"
      },
      {
        url: "images/sample/garnett-silhouettes-new.jpg",
        note: "版本2 - eBay标注ALTERED PATCH 森林狼狼头logo patch"
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
        note: "版本1 - 纯黄色点状球衣patch"
      },
      {
        url: "images/sample/durant-imm-new.jpg",
        note: "版本2 - 闲鱼在售 黄色L字母patch"
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
        note: "版本1 - 紫白双色球衣patch"
      },
      {
        url: "images/sample/eddie-jones-new.jpg",
        note: "版本2 - 紫金LA字母patch"
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
        note: "版本1 - 左右两块黄绿双色竖条纹patch"
      },
      {
        url: "images/sample/gary-payton-new.jpg",
        note: "版本2 - 左右两块鲜艳黄绿斜条纹patch"
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
        note: "版本1 - 左紫色+右白紫横条纹patch"
      },
      {
        url: "images/sample/malone-flawless-greats-new.jpg",
        note: "版本2 - 左紫白横条纹+右紫色patch"
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
        note: "对比图 - 上图BGS8.5版黑白灰马刺logo patch vs 下图其他版本白灰patch"
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
    status: "suspected",
    highRiskReason: "仅有正面照片无法100%确认，patch质感与同系列有差异但由于编号在卡片背面无法实锤",
    images: [
      {
        url: "images/sample/magic-spectra.jpg",
        note: "⚠️疑似换patch - 仅有正面照片无法100%确认，patch质感与同系列有差异但由于编号在卡片背面无法实锤"
      }
    ]
  },
  {
    id: 46,
    player: "Stephen Curry",
    playerCN: "斯蒂芬·库里",
    brand: "Panini",
    year: "2012-13",
    series: "Immaculate Collection",
    number: "26/50编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/curry-2012-comparison.jpg",
        note: "对比图 - 左侧PSA评级版黄蓝斜条纹patch vs 右下角其他版本纯蓝色patch"
      }
    ]
  },
  {
    id: 47,
    player: "Stephen Curry",
    playerCN: "斯蒂芬·库里",
    brand: "Panini",
    year: "2012-13",
    series: "Immaculate Collection",
    number: "23/50编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/curry-2012-23.jpg",
        note: "对比图 - 左侧大号N字母多色patch vs 右下角其他版本黄蓝patch"
      }
    ]
  },
  {
    id: 48,
    player: "Tyrese Haliburton",
    playerCN: "泰瑞斯·哈利伯顿",
    brand: "Panini",
    year: "2020-21",
    series: "Flawless",
    number: "25/25编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/haliburton-flawless-2.jpg",
        note: "版本1 - 白紫黑三色竖条纹patch"
      },
      {
        url: "images/sample/haliburton-flawless-3.jpg",
        note: "版本2"
      },
      {
        url: "images/sample/haliburton-flawless-1.jpg",
        note: "版本3 - 白紫双色横条纹patch"
      }
    ]
  },
  {
    id: 49,
    player: "Luka Dončić",
    playerCN: "卢卡·东契奇",
    brand: "Panini",
    year: "2020-21",
    series: "Immaculate Collection",
    number: "6/10编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/doncic-1.jpg",
        note: "版本1 - 灰白色patch"
      },
      {
        url: "images/sample/doncic-2.jpg",
        note: "版本2 - BGS 7.5评级 蓝白灰色patch"
      }
    ]
  },
  {
    id: 50,
    player: "Tyrese Haliburton",
    playerCN: "泰瑞斯·哈利伯顿",
    brand: "Panini",
    year: "2021-22",
    series: "Flawless",
    number: "05/15编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/haliburton-flawless-05-1.jpg",
        note: "版本1 - 中国红 白色带点点patch"
      },
      {
        url: "images/sample/haliburton-flawless-05-2.jpg",
        note: "版本2 - 红板SPM 三色球衣切割patch"
      }
    ]
  },
  {
    id: 51,
    player: "Tyrese Maxey",
    playerCN: "泰瑞斯·马克西",
    brand: "Panini",
    year: "2020-21",
    series: "Immaculate Collection",
    number: "13/50编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/maxey-1.jpg",
        note: "版本1 - 纯蓝色patch"
      },
      {
        url: "images/sample/maxey-2.jpg",
        note: "版本2 - 多色patch（白红蓝组合）"
      }
    ]
  },
  {
    id: 52,
    player: "Mikal Bridges",
    playerCN: "米卡尔·布里奇斯",
    brand: "Panini",
    year: "2018-19",
    series: "Impeccable",
    number: "69/99编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/bridges-1.jpg",
        note: "版本1 - 纯橙色patch"
      },
      {
        url: "images/sample/bridges-2.jpg",
        note: "版本2 - 蓝紫橙三色patch"
      }
    ]
  },
  {
    id: 53,
    player: "Kobe Bryant",
    playerCN: "科比·布莱恩特",
    brand: "Panini",
    year: "2015-16",
    series: "Flawless",
    number: "03/10编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/kobe-flawless-03.jpg",
        note: "对比图 - Before: 黄黑双色patch vs After: 橙白灰三色patch"
      }
    ]
  },
  {
    id: 54,
    player: "Andrew Wiggins",
    playerCN: "安德鲁·威金斯",
    brand: "Panini",
    year: "2015-16",
    series: "Flawless",
    number: "1/1",
    status: "confirmed",
    images: [
      {
        url: "images/sample/wiggins-2.jpg",
        note: "版本1 - BGS 6.5评级 浅蓝白色patch"
      },
      {
        url: "images/sample/wiggins-1.jpg",
        note: "版本2 - 彩虹色patch 手提箱白金卡签字（假铭文）"
      }
    ]
  },
  {
    id: 55,
    player: "Kawhi Leonard",
    playerCN: "科怀·莱昂纳德",
    brand: "Panini",
    year: "2012-13",
    series: "National Treasures",
    number: "114/199编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/kawhi-1.jpg",
        note: "版本1 - 黑白横条纹patch"
      },
      {
        url: "images/sample/kawhi-2.jpg",
        note: "版本2 - BGS 8.5评级 灰白横条纹patch"
      }
    ]
  },
  {
    id: 56,
    player: "Luka Dončić",
    playerCN: "卢卡·东契奇",
    brand: "Panini",
    year: "2021-22",
    series: "Impeccable",
    number: "14/25编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/doncic-elegance-1.jpg",
        note: "版本1 - 纯蓝色patch"
      },
      {
        url: "images/sample/doncic-elegance-2.jpg",
        note: "版本2 - 蓝白多色拼接patch"
      }
    ]
  },
  {
    id: 57,
    player: "Luka Dončić",
    playerCN: "卢卡·东契奇",
    brand: "Panini",
    year: "2020-21",
    series: "National Treasures Colossal",
    number: "17/49编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/doncic-colossal-1.jpg",
        note: "版本1 - 白灰双色patch"
      },
      {
        url: "images/sample/doncic-colossal-2.jpg",
        note: "版本2 - 蓝白双色拼接patch"
      }
    ]
  },
  {
    id: 58,
    player: "Cade Cunningham",
    playerCN: "凯德·坎宁安",
    brand: "Panini",
    year: "2021-22",
    series: "Crown Royale Rookie Silhouettes",
    number: "10/25编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/cunningham-1.jpg",
        note: "版本1 - 纯红色patch"
      },
      {
        url: "images/sample/cunningham-2.jpg",
        note: "版本2 - 红蓝双色拼接patch"
      }
    ]
  },
  {
    id: 59,
    player: "Kobe Bryant",
    playerCN: "科比·布莱恩特",
    brand: "Upper Deck",
    year: "2007-08",
    series: "Chronology Stitches in Time",
    number: "13/15编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/kobe-ud-chronology.jpg",
        note: "对比图 - ORIGINAL RAW: 白黄双色36号patch vs SWAPPED BGS: 黄白多色拼接patch vs SWAPPED PSA: 黄白多色拼接patch"
      }
    ]
  },
  {
    id: 60,
    player: "Zion Williamson",
    playerCN: "锡安·威廉姆森",
    brand: "Panini",
    year: "2020-21",
    series: "Flawless",
    number: "1/1",
    status: "confirmed",
    images: [
      {
        url: "images/sample/zion-legacy.jpg",
        note: "对比图 - 左侧：蓝绿多色拼接patch（正面） vs 右侧：卡背展示（同一张卡前后对比）"
      }
    ]
  },
  {
    id: 61,
    player: "Larry Bird",
    playerCN: "拉里·伯德",
    brand: "Panini",
    year: "2014-15",
    series: "Eminence",
    number: "6/10编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/bird-2.jpg",
        note: "版本2 - 黄白绿三色拼接patch"
      },
      {
        url: "images/sample/bird-1.jpg",
        note: "版本1 - 白绿双色patch"
      }
    ]
  },
  {
    id: 62,
    player: "LeBron James",
    playerCN: "勒布朗·詹姆斯",
    brand: "Upper Deck",
    year: "2006-07",
    series: "Exquisite Collection",
    number: "编号待确认",
    status: "confirmed",
    images: [
      {
        url: "images/sample/lebron-exquisite.jpg",
        note: "对比图 - 版本1: 黄白红三色条纹patch vs 版本2: PSA评级 红白双色patch（含签名对比）"
      }
    ]
  },
  {
    id: 63,
    player: "Kobe Bryant",
    playerCN: "科比·布莱恩特",
    brand: "Panini",
    year: "2014-15",
    series: "Immaculate Collection",
    number: "04/10编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/kobe-imm-04.jpg",
        note: "对比图 - 版本1: 黄白紫三色拼接patch vs 版本2: 蓝紫黄白多色拼接patch"
      }
    ]
  },
  {
    id: 64,
    player: "Kobe Bryant",
    playerCN: "科比·布莱恩特",
    brand: "Panini",
    year: "2012-13",
    series: "Immaculate Collection",
    number: "61/75编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/kobe-imm-61.jpg",
        note: "对比图 - 版本1: 黄白紫三色拼接patch vs 版本2: 黄紫双色patch"
      }
    ]
  },
  {
    id: 65,
    player: "LeBron James",
    playerCN: "勒布朗·詹姆斯",
    brand: "Upper Deck",
    year: "2003-04",
    series: "Exquisite Collection Limited Logos",
    number: "04/75编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/lebron-exquisite-04.jpg",
        note: "对比图 - 版本1: 深色纯色patch vs 版本2: 红白骑士logo大patch"
      }
    ]
  },
  {
    id: 66,
    player: "Kobe Bryant",
    playerCN: "科比·布莱恩特",
    brand: "Panini",
    year: "2012-13",
    series: "Immaculate Collection",
    number: "30/75编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/kobe-imm-30.jpg",
        note: "对比图 - 版本1: 纯紫色patch vs 版本2: 黄白蓝三色拼接patch"
      }
    ]
  },
  {
    id: 67,
    player: "Kobe Bryant",
    playerCN: "科比·布莱恩特",
    brand: "Upper Deck",
    year: "2008-09",
    series: "Exquisite Collection",
    number: "14/24编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/kobe-exquisite-14.jpg",
        note: "对比图 - 版本1: 黄紫双色拼接patch vs 版本2: 白黑双色拼接patch（含表情包）"
      }
    ]
  },
  {
    id: 68,
    player: "Dirk Nowitzki",
    playerCN: "德克·诺维茨基",
    brand: "Panini",
    year: "2017-18",
    series: "Flawless",
    number: "16/25编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/nowitzki-flawless.jpg",
        note: "对比图 - 版本1: 纯黑色patch（标注fake card） vs 版本2: 白黑双色拼接patch"
      }
    ]
  },
  {
    id: 69,
    player: "Kevin Durant",
    playerCN: "凯文·杜兰特",
    brand: "Panini",
    year: "2013-14",
    series: "Immaculate Collection",
    number: "13/25编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/durant-imm-13.jpg",
        note: "对比图 - 版本1: 白红蓝三色拼接patch vs 版本2: 白蓝双色35号patch（含表情包）"
      }
    ]
  },
  {
    id: 70,
    player: "Kevin Durant",
    playerCN: "凯文·杜兰特",
    brand: "Upper Deck",
    year: "2007-08",
    series: "Exquisite Collection Rookie",
    number: "41/99编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/durant-rookie-41.jpg",
        note: "对比图 - Before: 纯绿色patch vs After: BGS 9评级 黄绿黑三色拼接patch"
      }
    ]
  },
  {
    id: 71,
    player: "Kareem Abdul-Jabbar",
    playerCN: "卡里姆·阿卜杜勒-贾巴尔",
    brand: "Panini",
    year: "2012-13",
    series: "Immaculate Collection",
    number: "17/30编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/jabbar-imm-17.jpg",
        note: "对比图 - 版本1: 纯黄色patch vs 版本2: 黄白紫三色拼接patch"
      }
    ]
  },
  {
    id: 72,
    player: "Tracy McGrady",
    playerCN: "特雷西·麦克格雷迪",
    brand: "Upper Deck",
    year: "2007-08",
    series: "Exquisite Collection Limited Logos",
    number: "13/50编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/mcgrady-exquisite-13.jpg",
        note: "对比图 - 版本1: 纯红色patch vs 版本2: PSA/DNA认证 红白火箭logo patch"
      }
    ]
  },
  {
    id: 73,
    player: "Dwyane Wade",
    playerCN: "德韦恩·韦德",
    brand: "Panini",
    year: "2015-16",
    series: "Flawless",
    number: "08/25编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/wade-flawless-08.jpg",
        note: "对比图 - 版本1: 红黄黑三色横条纹patch vs 版本2: 白黑红三色拼接patch"
      }
    ]
  },
  {
    id: 74,
    player: "Stephen Curry",
    playerCN: "斯蒂芬·库里",
    brand: "Panini",
    year: "2018-19",
    series: "Immaculate Collection",
    number: "14/30编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/curry-imm-14.jpg",
        note: "对比图 - 版本1: 纯蓝色patch vs 版本2: 黄蓝双色拼接patch"
      }
    ]
  },
  {
    id: 75,
    player: "Kobe Bryant",
    playerCN: "科比·布莱恩特",
    brand: "Upper Deck",
    year: "2006-07",
    series: "Exquisite Collection",
    number: "45或46/100编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/kobe-exquisite-45.jpg",
        note: "对比图 - 版本1: 纯紫色patch vs 版本2: BGS 9.5评级 黄白紫三色拼接patch"
      }
    ]
  },
  {
    id: 76,
    player: "Donovan Mitchell",
    playerCN: "多诺万·米切尔",
    brand: "Panini",
    year: "2017-18",
    series: "National Treasures",
    number: "06/99编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/mitchell-nt-06.jpg",
        note: "对比图 - 版本1: 黄蓝黑三色拼接patch vs 版本2: 白绿黄蓝多色拼接patch"
      },
      {
        url: "images/sample/mitchell-nt-06-versions.jpg",
        note: "三版本时间线对比 - ORIGINAL(黄蓝黑) vs MAY 2019(白绿黄蓝) vs AUGUST 2020(黄黑) 同一张06/99编号卡在不同时期的patch变化"
      }
    ]
  },
  {
    id: 77,
    player: "Hakeem Olajuwon",
    playerCN: "哈基姆·奥拉朱旺",
    brand: "Panini",
    year: "2013-14",
    series: "Immaculate Collection",
    number: "04/10编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/olajuwon-imm-04.jpg",
        note: "对比图 - 版本1: 白红蓝三色拼接patch（标注FAKE） vs 版本2: 红色带白点patch"
      }
    ]
  },
  {
    id: 78,
    player: "Vince Carter",
    playerCN: "文斯·卡特",
    brand: "Panini",
    year: "2013-14",
    series: "Immaculate Collection",
    number: "10/25编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/carter-imm-10.jpg",
        note: "对比图 - 版本1: 蓝白双色横条纹patch vs 版本2: 蓝黑白三色拼接patch（含D字母）"
      }
    ]
  },
  {
    id: 79,
    player: "Kevin Durant",
    playerCN: "凯文·杜兰特",
    brand: "Panini",
    year: "2012-13",
    series: "Immaculate Collection",
    number: "25/25编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/durant-imm-25.jpg",
        note: "对比图 - 版本1: 蓝黄橙三色横条纹patch vs 版本2: 蓝白带点点patch"
      }
    ]
  },
  {
    id: 80,
    player: "Dirk Nowitzki",
    playerCN: "德克·诺维茨基",
    brand: "Panini",
    year: "2017-18",
    series: "Flawless",
    number: "12/15编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/nowitzki-flawless-12.jpg",
        note: "对比图 - 版本1: 白蓝双色拼接patch vs 版本2: 纯灰色patch"
      }
    ]
  },
  {
    id: 81,
    player: "Anthony Davis",
    playerCN: "安东尼·戴维斯",
    brand: "Panini",
    year: "2012-13",
    series: "National Treasures",
    number: "013/199编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/davis-nt-013.jpg",
        note: "对比图 - 版本1: 蓝黄双色大块拼接patch vs 版本2: 黄蓝多色横条纹patch"
      }
    ]
  },
  {
    id: 82,
    player: "Anthony Davis",
    playerCN: "安东尼·戴维斯",
    brand: "Panini",
    year: "2012-13",
    series: "National Treasures",
    number: "019/199编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/davis-nt-019.jpg",
        note: "对比图 - 左侧版本1: 蓝黄双色patch vs 右侧版本2: 黄蓝多色横条纹patch（含patch特写对比）"
      }
    ]
  },
  {
    id: 83,
    player: "Anthony Davis",
    playerCN: "安东尼·戴维斯",
    brand: "Panini",
    year: "2012-13",
    series: "National Treasures",
    number: "071/199编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/davis-nt-071.jpg",
        note: "对比图 - 蓝黄双色patch vs 黄蓝橙多色横条纹patch（含patch特写对比）"
      }
    ]
  },
  {
    id: 84,
    player: "Anthony Davis",
    playerCN: "安东尼·戴维斯",
    brand: "Panini",
    year: "2012-13",
    series: "National Treasures",
    number: "076/199编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/davis-nt-076.jpg",
        note: "对比图 - 蓝黄双色patch vs 黄蓝橙多色横条纹patch（含patch特写对比）"
      }
    ]
  },
  {
    id: 85,
    player: "Anthony Davis",
    playerCN: "安东尼·戴维斯",
    brand: "Panini",
    year: "2012-13",
    series: "National Treasures",
    number: "170/199编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/davis-nt-170.jpg",
        note: "对比图 - 蓝黄双色patch vs 黄蓝多色横条纹patch（含patch特写对比）"
      }
    ]
  },
  {
    id: 86,
    player: "Anthony Davis",
    playerCN: "安东尼·戴维斯",
    brand: "Panini",
    year: "2012-13",
    series: "National Treasures",
    number: "009/199编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/davis-nt-009.jpg",
        note: "对比图 - 蓝黄双色patch vs 纯蓝色patch（红圈标注新秀徽章位置差异）"
      }
    ]
  },
  {
    id: 87,
    player: "Dwyane Wade",
    playerCN: "德韦恩·韦德",
    brand: "Panini",
    year: "2015-16",
    series: "Flawless",
    number: "7/10编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/wade-flawless-07.jpg",
        note: "对比图 - 版本1: 白黑蓝三色拼接patch vs 版本2: 白黑红三色拼接patch（含patch特写对比）"
      }
    ]
  },
  {
    id: 88,
    player: "Kevin Durant",
    playerCN: "凯文·杜兰特",
    brand: "Panini",
    year: "2014-15",
    series: "Immaculate Collection",
    number: "9/10编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/durant-imm-14-09.jpg",
        note: "对比图 - 版本1: 浅色patch vs 版本2: 深色多彩patch（同一张09/10编号卡前后对比）"
      }
    ]
  },
  {
    id: 89,
    player: "Tracy McGrady",
    playerCN: "特雷西·麦克格雷迪",
    brand: "Upper Deck",
    year: "2005-06",
    series: "Exquisite Collection Limited Logos",
    number: "32/50编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/mcgrady-exquisite-32.jpg",
        note: "对比图 - 版本1: 浅色patch vs 版本2: 红白黑三色拼接patch（含PSA封装对比）"
      }
    ]
  },
  {
    id: 90,
    player: "Hakeem Olajuwon",
    playerCN: "哈基姆·奥拉朱旺",
    brand: "Panini",
    year: "2014-15",
    series: "Flawless",
    number: "02/25编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/olajuwon-flawless-02.jpg",
        note: "对比图 - 版本1: 三色拼接patch（黄白红蓝） vs 版本2: 三色拼接patch（红白蓝黄配色不同）"
      }
    ]
  },
  {
    id: 91,
    player: "Karl Malone",
    playerCN: "卡尔·马龙",
    brand: "Panini",
    year: "2014-15",
    series: "Eminence",
    number: "5/5编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/malone-immense-05.jpg",
        note: "对比图 - 版本1: 彩虹色多彩横条纹patch vs 版本2: 蓝绿色拼接patch（含淘宝拍卖截图）"
      }
    ]
  },
  {
    id: 92,
    player: "Ray Allen",
    playerCN: "雷·阿伦",
    brand: "Panini",
    year: "2014-15",
    series: "Flawless",
    number: "24/25编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/allen-flawless-24.jpg",
        note: "对比图 - 版本1: 红白色拼接patch vs 版本2: 深红色纯色patch（含淘宝拍卖截图）"
      }
    ]
  },
  {
    id: 93,
    player: "Hakeem Olajuwon",
    playerCN: "哈基姆·奥拉朱旺",
    brand: "Panini",
    year: "2014-15",
    series: "Flawless",
    number: "5/15编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/olajuwon-flawless-05.jpg",
        note: "对比图 - 版本1: 红白蓝三色拼接patch vs 版本2: 红白蓝灰多色拼接patch（含淘宝拍卖截图）"
      }
    ]
  },
  {
    id: 94,
    player: "Ray Allen",
    playerCN: "雷·阿伦",
    brand: "Panini",
    year: "2015-16",
    series: "National Treasures",
    number: "编号待确认",
    status: "confirmed",
    images: [
      {
        url: "images/sample/allen-nt-15.jpg",
        note: "对比图 - 版本1: 黄绿色拼接patch vs 版本2: 深绿白色拼接patch"
      }
    ]
  },
  {
    id: 95,
    player: "Ben Gordon",
    playerCN: "本·戈登",
    brand: "Upper Deck",
    year: "2004-05",
    series: "Ultimate Collection",
    number: "60/75编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/gordon-ultimate-60-2.jpg",
        note: "版本2 - 黑红拼接公牛logo patch"
      },
      {
        url: "images/sample/gordon-ultimate-60-1.jpg",
        note: "版本1 - 纯红色公牛logo patch"
      }
    ]
  },
  {
    id: 96,
    player: "Michael Jordan",
    playerCN: "迈克尔·乔丹",
    brand: "Upper Deck",
    year: "2004",
    series: "SP Game Used",
    number: "041/100编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/jordan-sp-041-2.jpg",
        note: "版本2 - 黑红拼接公牛logo patch"
      },
      {
        url: "images/sample/jordan-sp-041-1.jpg",
        note: "版本1 - 纯红色公牛logo patch"
      }
    ]
  },
  {
    id: 97,
    player: "Wayne Simien",
    playerCN: "韦恩·西米恩",
    brand: "Upper Deck",
    year: "2005-06",
    series: "Trilogy Rookie Premiere Patch Auto",
    number: "05/10编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/simien-trilogy-05-2.jpg",
        note: "版本2 - 纯白色patch"
      },
      {
        url: "images/sample/simien-trilogy-05-1.jpg",
        note: "版本1 - 黑红白三色拼接patch"
      }
    ]
  },
  {
    id: 98,
    player: "Andre Iguodala",
    playerCN: "安德烈·伊戈达拉",
    brand: "Upper Deck",
    year: "2006-07",
    series: "Ultimate Collection",
    number: "09/15编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/iguodala-ultimate-09-2.jpg",
        note: "版本2 - 纯黑色patch"
      },
      {
        url: "images/sample/iguodala-ultimate-09-1.jpg",
        note: "版本1 - 白红蓝三色拼接patch"
      }
    ]
  },
  {
    id: 99,
    player: "Chris Paul",
    playerCN: "克里斯·保罗",
    brand: "Upper Deck",
    year: "2007-08",
    series: "Exquisite Collection Limited Logos",
    number: "42/50编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/paul-exquisite-42-2.jpg",
        note: "版本2 - 黄蓝横条纹拼接patch"
      },
      {
        url: "images/sample/paul-exquisite-42-1.jpg",
        note: "版本1 - 蓝紫黄多色拼接patch"
      }
    ]
  },
  {
    id: 100,
    player: "LeBron James",
    playerCN: "勒布朗·詹姆斯",
    brand: "Panini",
    year: "2012-13",
    series: "National Treasures NBA Gear Dual Patch",
    number: "10/99编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/lebron-nt-gear-10-2.jpg",
        note: "版本2 - 左:纯白色patch + 右:黑白拼接patch"
      },
      {
        url: "images/sample/lebron-nt-gear-10-1.jpg",
        note: "版本1 - 左:黑橙红三色拼接patch + 右:白色带48号码patch"
      }
    ]
  },
  {
    id: 101,
    player: "LeBron James",
    playerCN: "勒布朗·詹姆斯",
    brand: "Panini",
    year: "2012-13",
    series: "National Treasures NBA Gear Dual Patch",
    number: "13/99编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/lebron-nt-gear-13-2.jpg",
        note: "版本2 - 左:纯白色patch + 右:纯黑色patch（含成交记录截图）"
      },
      {
        url: "images/sample/lebron-nt-gear-13-1.jpg",
        note: "版本1 - 左:蓝NBA logo patch + 右:黑橙红三色拼接patch（含eBay拍卖截图）"
      }
    ]
  },
  {
    id: 102,
    player: "LeBron James",
    playerCN: "勒布朗·詹姆斯",
    brand: "Upper Deck",
    year: "2003-04",
    series: "Exquisite Collection Rookie Patch Autograph",
    number: "编号待确认",
    status: "confirmed",
    images: [
      {
        url: "images/sample/lebron-exquisite-rpa-2.jpg",
        note: "版本2 - 纯白色patch（不同图案纹理）"
      },
      {
        url: "images/sample/lebron-exquisite-rpa-1.jpg",
        note: "版本1 - 纯白色patch"
      }
    ]
  },
  {
    id: 103,
    player: "Alonzo Mourning",
    playerCN: "阿朗佐·莫宁",
    brand: "Upper Deck",
    year: "2007-08",
    series: "Exquisite Collection Limited Logos",
    number: "22/50编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/mourning-exquisite-22-2.jpg",
        note: "版本2 - 橙白红横条纹拼接patch"
      },
      {
        url: "images/sample/mourning-exquisite-22-1.jpg",
        note: "版本1 - 红黑拼接patch"
      }
    ]
  },
  {
    id: 104,
    player: "Kevin Durant",
    playerCN: "凯文·杜兰特",
    brand: "Upper Deck",
    year: "2007-08",
    series: "Exquisite Collection Rookie Patch Autograph",
    number: "97/99编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/durant-exquisite-97.jpg",
        note: "对比图 - 左:绿白黄三色拼接patch vs 右:黄绿色拼接patch（含eBay拍卖截图）"
      }
    ]
  },
  {
    id: 105,
    player: "Kevin Durant",
    playerCN: "凯文·杜兰特",
    brand: "Panini",
    year: "2012-13",
    series: "Immaculate Collection Patch Auto",
    number: "04/75编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/durant-imm-04.jpg",
        note: "对比图 - 左:蓝橙色拼接patch vs 右:橙蓝色拼接patch（含eBay拍卖截图）"
      }
    ]
  },
  {
    id: 106,
    player: "Grant Hill",
    playerCN: "格兰特·希尔",
    brand: "Panini",
    year: "2012-13",
    series: "Immaculate Collection Patch Auto",
    number: "12/25编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/hill-imm-12.jpg",
        note: "对比图 - 左:纯红色patch vs 右:红白橙三色横条纹patch（含eBay拍卖截图）"
      }
    ]
  },
  {
    id: 107,
    player: "LeBron James / Allen Iverson / Joe Johnson",
    playerCN: "勒布朗·詹姆斯 / 阿伦·艾弗森 / 乔·约翰逊",
    brand: "Upper Deck",
    year: "2008-09",
    series: "Exquisite Collection 6 Color Patch Jersey Logo",
    number: "04/10编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/lebron-iverson-exquisite-04.jpg",
        note: "对比图 - 左:三人六色patch（含logo） vs 右:三人纯色patch（含eBay拍卖截图）"
      }
    ]
  },
  {
    id: 108,
    player: "Kobe Bryant",
    playerCN: "科比·布莱恩特",
    brand: "Panini",
    year: "2012-13",
    series: "Flawless",
    number: "07/25编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/kobe-flawless-07.jpg",
        note: "对比图 - 左:纯白色patch vs 右:紫黄拼接patch（含eBay拍卖截图及PSA封装对比）"
      }
    ]
  },
  {
    id: 109,
    player: "Kobe Bryant / Magic Johnson",
    playerCN: "科比·布莱恩特 / 魔术师·约翰逊",
    brand: "Upper Deck",
    year: "年份待确认",
    series: "SP Game Used Dual Jersey Patch",
    number: "08/25编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/kobe-magic-sp-08.jpg",
        note: "对比图 - 左:双人四色patch（紫黄色湖人配色） vs 右:双人纯色patch（含eBay拍卖截图）"
      }
    ]
  },
  {
    id: 110,
    player: "LeBron James",
    playerCN: "勒布朗·詹姆斯",
    brand: "Upper Deck",
    year: "2006-07",
    series: "Exquisite Collection Autograph Logo Jersey Patch",
    number: "88/100编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/lebron-exquisite-88.jpg",
        note: "对比图 - 左:红白双色logo patch vs 右:纯白色patch（含PSA封装及eBay拍卖截图）"
      }
    ]
  },
  {
    id: 111,
    player: "LeBron James",
    playerCN: "勒布朗·詹姆斯",
    brand: "Panini",
    year: "2012-13",
    series: "Flawless Jumbo GU Patch",
    number: "16/25编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/lebron-flawless-16.jpg",
        note: "对比图 - 左:红黑白三色拼接jumbo patch vs 右:纯白色patch（含PSA 10封装及eBay拍卖截图）"
      }
    ]
  },
  {
    id: 112,
    player: "Karl Malone",
    playerCN: "卡尔·马龙",
    brand: "Panini",
    year: "2012-13",
    series: "Flawless Jersey Patch Ruby",
    number: "11/15编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/malone-flawless-11.jpg",
        note: "对比图 - 左:蓝紫红三色拼接patch vs 右:蓝紫色拼接patch（含eBay拍卖截图）"
      }
    ]
  },
  {
    id: 113,
    player: "Tony Parker",
    playerCN: "托尼·帕克",
    brand: "Panini",
    year: "2012-13",
    series: "Flawless Patches Autographs",
    number: "21/25编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/parker-flawless-21.jpg",
        note: "对比图 - 左:灰黑蓝三色拼接patch vs 右:纯黑色patch（含亚马逊及eBay拍卖截图）"
      }
    ]
  },
  {
    id: 114,
    player: "Gary Payton",
    playerCN: "加里·佩顿",
    brand: "Panini",
    year: "2012-13",
    series: "Immaculate Collection Patch Auto",
    number: "10/25编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/payton-imm-10.jpg",
        note: "对比图 - 左:白黄绿三色拼接patch vs 右:黄绿橙三色拼接patch（含eBay拍卖截图）"
      }
    ]
  },
  {
    id: 115,
    player: "Dirk Nowitzki",
    playerCN: "德克·诺维茨基",
    brand: "Panini",
    year: "2020",
    series: "Crown Royale Silhouettes Autograph RLC FOTL",
    number: "12/12编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/nowitzki-crown-12-2.jpg",
        note: "版本2 - 蓝白拼接小logo patch"
      },
      {
        url: "images/sample/nowitzki-crown-12-1.jpg",
        note: "版本1 - 白黑蓝灰四色拼接大logo patch（含PSA 10封装）"
      }
    ]
  },
  {
    id: 116,
    player: "Andrew Wiggins / Khris Middleton",
    playerCN: "安德鲁·威金斯 / 克里斯·米德尔顿",
    brand: "Panini",
    year: "2018",
    series: "Immaculate Dual Patch Number 22",
    number: "09/22编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/wiggins-middleton-imm-09.jpg",
        note: "对比图 - 左:真球衣patch vs 右:假patch覆盖真球衣（标注\"Fake Patch over Real Jersey\"）双人四patch卡"
      }
    ]
  },
  {
    id: 117,
    player: "Cade Cunningham",
    playerCN: "凯德·坎宁安",
    brand: "Panini",
    year: "2021",
    series: "Immaculate Collection Patch Auto",
    number: "14/99编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/cunningham-imm-14-2.jpg",
        note: "版本2 - 纯红色patch"
      },
      {
        url: "images/sample/cunningham-imm-14-1.jpg",
        note: "版本1 - 蓝红拼接patch（活塞队配色）"
      }
    ]
  },
  {
    id: 118,
    player: "D'Angelo Russell",
    playerCN: "德安吉洛·拉塞尔",
    brand: "Panini",
    year: "2015",
    series: "National Treasures Colossal Jersey Auto",
    number: "03/49编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/russell-nt-03.jpg",
        note: "对比图 - 左:纯紫色大尺寸patch vs 右:紫黄白多色拼接大尺寸patch（含BGS封装）"
      }
    ]
  },
  {
    id: 119,
    player: "De'Aaron Fox",
    playerCN: "迪阿伦·福克斯",
    brand: "Panini",
    year: "2017",
    series: "Noir Jersey Auto",
    number: "96/99编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/fox-noir-96.jpg",
        note: "对比图 - 左:紫色大尺寸patch vs 右:白色网格点状patch（标注\"15/49\"）"
      }
    ]
  },
  {
    id: 120,
    player: "Kobe Bryant",
    playerCN: "科比·布莱恩特",
    brand: "Panini",
    year: "2012",
    series: "Anthology Memorabilia",
    number: "2/8编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/kobe-anthology-02.jpg",
        note: "对比图 - 左:纯紫色patch vs 右:紫黄白三色拼接patch（含BGS 8.5封装，标注\"是换的patch\"）"
      }
    ]
  },
  {
    id: 121,
    player: "Kyrie Irving",
    playerCN: "凯里·欧文",
    brand: "Panini",
    year: "2015-16",
    series: "National Treasures Legacies",
    number: "01/25编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/irving-nt-01.jpg",
        note: "对比图 - 左:纯白色patch vs 右:黄红蓝多色拼接patch（含中文标注\"这张欧文1杠25的卡呢 卖掉了\"）"
      }
    ]
  },
  {
    id: 122,
    player: "Kobe Bryant",
    playerCN: "科比·布莱恩特",
    brand: "Panini",
    year: "2009",
    series: "Limited Jumbo Jersey",
    number: "01/10编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/kobe-limited-01.jpg",
        note: "对比图 - 左:紫色大尺寸patch（标注01/10） vs 右:白紫拼接大尺寸patch（含GBTC BGS封装，中文标注\"那科比这张1杠十的卡呢\"）"
      }
    ]
  },
  {
    id: 123,
    player: "Stephen Curry",
    playerCN: "斯蒂芬·库里",
    brand: "Panini",
    year: "2022-23",
    series: "Noir Jumbo Material",
    number: "01/3编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/curry-noir-01.jpg",
        note: "对比图 - 左:白蓝拼接大尺寸patch vs 右:白蓝黄三色拼接大尺寸patch（含GBTC BGS封装，中文标注\"那库里这张1杠三的卡呢\"）"
      }
    ]
  },
  {
    id: 124,
    player: "Kobe Bryant",
    playerCN: "科比·布莱恩特",
    brand: "Upper Deck",
    year: "2002",
    series: "Ultimate Collection Game Jersey Patch",
    number: "47/100编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/kobe-ultimate-47.jpg",
        note: "对比图 - 左:纯白色patch vs 右:黄紫拼接patch（含GBTC BGS封装，中文标注\"还有这张科比的47杠100的卡呢\"）"
      }
    ]
  },
  {
    id: 125,
    player: "Stephen Curry",
    playerCN: "斯蒂芬·库里",
    brand: "Panini",
    year: "2017",
    series: "Noir Box Office Materials",
    number: "15/25编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/curry-noir-15.jpg",
        note: "对比图 - 左:纯白色大尺寸patch vs 右:黄蓝拼接大尺寸patch（含GBTC BGS封装，中文标注\"那还有这张库里的15跟25的卡呢\"）"
      }
    ]
  },
  {
    id: 126,
    player: "Kobe Bryant",
    playerCN: "科比·布莱恩特",
    brand: "Panini",
    year: "2015",
    series: "National Treasures NBA Material Prime",
    number: "09/25编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/kobe-nt-prime-09.jpg",
        note: "对比图 - 左:纯白色大尺寸patch vs 右:紫黄白三色拼接大尺寸patch（含GBTC BGS封装，中文标注\"9杠25那也被换了patch\"）"
      }
    ]
  },
  {
    id: 127,
    player: "Kobe Bryant",
    playerCN: "科比·布莱恩特",
    brand: "Panini",
    year: "2014",
    series: "Threads Authentic Threads Prime",
    number: "7/7编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/kobe-threads-07.jpg",
        note: "对比图 - 左:白黄拼接大尺寸patch vs 右:黄紫白三色拼接大尺寸patch（含GBTC BGS封装，中文标注\"还有这张科比的七杠七的卡呢\"）"
      }
    ]
  },
  {
    id: 128,
    player: "Stephen Curry",
    playerCN: "斯蒂芬·库里",
    brand: "Panini",
    year: "2021",
    series: "Immaculate The Standard",
    number: "16/25编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/curry-imm-16.jpg",
        note: "对比图 - 左:蓝黄拼接大尺寸patch（含BGS 9评级） vs 右:纯黑色大尺寸patch（含GBTC BGS封装，中文标注\"我们刚介绍过是这张，这是这张卡\"）"
      }
    ]
  },
  {
    id: 129,
    player: "Cade Cunningham",
    playerCN: "凯德·坎宁安",
    brand: "Panini",
    year: "2021-22",
    series: "National Treasures Clutch Factor",
    number: "06/25编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/cunningham-nt-06-2.jpg",
        note: "版本2 - 纯白色大尺寸patch（中文标注\"那你要如何防止这个换PATCH的\"）"
      },
      {
        url: "images/sample/cunningham-nt-06-1.jpg",
        note: "版本1 - 红蓝白多色拼接大尺寸patch（中文标注\"所以它价值就大打折扣了\"）"
      }
    ]
  },
  {
    id: 130,
    player: "Ziaire Williams",
    playerCN: "扎伊尔·威廉姆斯",
    brand: "Panini",
    year: "2021-22",
    series: "Flawless",
    number: "1/1编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/williams-flawless-01-1.jpg",
        note: "版本1 - 白紫白竖条纹字母patch（中文标注\"这在卡淘截标的扎伊尔\"）"
      },
      {
        url: "images/sample/williams-flawless-01-2.jpg",
        note: "版本对比 - 左:白灰黑横条纹patch vs 右:白紫白竖条纹字母patch（中文标注\"那我个人觉得这两个签字是一模一样的\"）"
      }
    ]
  },
  {
    id: 131,
    player: "Jake LaRavia",
    playerCN: "杰克·拉拉维亚",
    brand: "Panini",
    year: "2022-23",
    series: "Flawless Patch Autograph Emerald",
    number: "2/5编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/laravia-flawless-02-1.jpg",
        note: "版本1 - 白蓝黑条纹patch（含PSA评级标签，中文标注\"那这张PSA评过级的flawless的新秀卡呢\"）"
      },
      {
        url: "images/sample/laravia-flawless-02-2.jpg",
        note: "版本对比 - 左:深蓝白字母拼接patch（无铭文） vs 右:白蓝黑条纹patch（签名带假铭文\"#3Nicky\"）⚠️ 注意：此卡同时存在换patch和假铭文两个问题"
      }
    ]
  },
  {
    id: 132,
    player: "Vince Carter",
    playerCN: "文斯·卡特",
    brand: "Panini",
    year: "2020-21",
    series: "Immaculate Jersey Patch Autographs Au",
    number: "13/25编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/carter-imm-13.jpg",
        note: "对比图 - 左:白色网格状球衣patch（签名带铭文\"15\"） vs 右:橙色大尺寸patch（签名带铭文\"15\"）"
      }
    ]
  },
  {
    id: 133,
    player: "Paul Reed",
    playerCN: "保罗·里德",
    brand: "Panini",
    year: "2020-21",
    series: "Immaculate",
    number: "29/50编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/reed-imm-29.jpg",
        note: "对比图 - 左:白红蓝三色拼接patch vs 右:纯蓝色大尺寸patch"
      }
    ]
  },
  {
    id: 134,
    player: "Tyrese Maxey",
    playerCN: "泰瑞斯·马克西",
    brand: "Panini",
    year: "2020-21",
    series: "Impeccable",
    number: "15/88编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/maxey-impeccable-15.jpg",
        note: "对比图 - 左:纯蓝色大尺寸patch vs 右:白红蓝三色拼接patch"
      }
    ]
  },
  {
    id: 135,
    player: "Scottie Barnes",
    playerCN: "斯科蒂·巴恩斯",
    brand: "Panini",
    year: "2021-22",
    series: "Noir Rookie Patch Autographs",
    number: "66/99编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/barnes-noir-66.jpg",
        note: "对比图 - 左:纯红色大尺寸patch vs 右:红黑白三色拼接patch"
      }
    ]
  },
  {
    id: 136,
    player: "Tyrese Maxey",
    playerCN: "泰瑞斯·马克西",
    brand: "Panini",
    year: "2020-21",
    series: "Immaculate",
    number: "46/50编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/maxey-imm-46.jpg",
        note: "对比图 - 左:纯蓝色大尺寸patch vs 右:白红蓝三色拼接patch（含黑色边框）"
      }
    ]
  },
  {
    id: 137,
    player: "Nikola Jokic",
    playerCN: "尼古拉·约基奇",
    brand: "Panini",
    year: "2021-22",
    series: "Flawless",
    number: "22/25编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/jokic-flawless-22.jpg",
        note: "对比图 - 左:红黑白三色拼接patch vs 右:白色网格点状patch"
      }
    ]
  },
  {
    id: 138,
    player: "Tyrese Haliburton",
    playerCN: "泰瑞斯·哈利伯顿",
    brand: "Panini",
    year: "2020-21",
    series: "Impeccable",
    number: "73/99编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/haliburton-impeccable-73.jpg",
        note: "对比图 - 左:纯紫色大尺寸patch（Elegance 17/35） vs 右:紫白拼接patch（Impeccable 73/99）"
      }
    ]
  },
  {
    id: 139,
    player: "Tyrese Haliburton",
    playerCN: "泰瑞斯·哈利伯顿",
    brand: "Panini",
    year: "2020-21",
    series: "Immaculate",
    number: "60/99编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/haliburton-imm-60.jpg",
        note: "对比图 - 左:浅紫白拼接patch（标注60/99） vs 右:深紫色大尺寸patch（Immaculate 99编）"
      }
    ]
  },
  {
    id: 140,
    player: "Tyrese Haliburton",
    playerCN: "泰瑞斯·哈利伯顿",
    brand: "Panini",
    year: "2021-22",
    series: "Flawless",
    number: "02/15编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/haliburton-flawless-02.jpg",
        note: "对比图 - 左:白色网格点状patch（步行者队配色，02/15） vs 右:白紫拼接patch（32/35）"
      }
    ]
  },
  {
    id: 141,
    player: "Shai Gilgeous-Alexander",
    playerCN: "谢伊·吉尔杰斯-亚历山大",
    brand: "Panini",
    year: "2018-19",
    series: "Noir Rookie Patch Autographs",
    number: "16/99编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/sga-noir-16.jpg",
        note: "对比图 - 左:白色网格点状patch（16/99） vs 右:白蓝拼接patch（16/99）"
      }
    ]
  },
  {
    id: 142,
    player: "Lauri Markkanen",
    playerCN: "劳里·马尔卡宁",
    brand: "Panini",
    year: "2017-18",
    series: "Flawless",
    number: "12/25编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/markkanen-flawless-12.jpg",
        note: "对比图 - 左:纯红色大尺寸patch（12/25） vs 右:红白黑三色拼接patch（12/25）"
      }
    ]
  },
  {
    id: 143,
    player: "Kevin Durant",
    playerCN: "凯文·杜兰特",
    brand: "Panini",
    year: "2015-16",
    series: "National Treasures NBA Game Gear",
    number: "11/25编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/durant-nt-11-1.jpg",
        note: "版本1 - 红橙黑三色拼接patch（中文标注\"三色球衣切割 暴力切割 雷霆\"）"
      },
      {
        url: "images/sample/durant-nt-11-2.jpg",
        note: "版本对比 - 左:红橙黑三色拼接patch vs 右:浅灰白色球衣patch（11/25）"
      },
      {
        url: "images/sample/durant-nt-11-3.jpg",
        note: "多版本交易记录 - 显示同一编号11/25卡片的多个交易记录，价格从¥1,950到¥3,688.88不等，证实该卡被曝光换patch后又换回，但无法保证是原装球衣，且封装可能是假的"
      }
    ]
  },
  {
    id: 144,
    player: "Kevin Durant",
    playerCN: "凯文·杜兰特",
    brand: "Panini",
    year: "2014-15",
    series: "National Treasures",
    number: "26/35编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/durant-nt-26.jpg",
        note: "对比图 - 上:深蓝黄橙三色拼接patch（26/35） vs 下:纯蓝色大尺寸patch（26/35，中文标注\"衣物料 特\"）"
      }
    ]
  },
  {
    id: 145,
    player: "Kevin Durant",
    playerCN: "凯文·杜兰特",
    brand: "Panini",
    year: "2015-16",
    series: "National Treasures Legacies",
    number: "13/25编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/durant-nt-13.jpg",
        note: "对比图 - 左:红橙深蓝三色拼接patch（13/25） vs 右:纯蓝色大尺寸patch（13/25，中文标注\"一比什么\"）"
      }
    ]
  },
  {
    id: 146,
    player: "Tyrese Haliburton",
    playerCN: "泰瑞斯·哈利伯顿",
    brand: "Panini",
    year: "2020-21",
    series: "Flawless",
    number: "06/25编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/haliburton-flawless-06.jpg",
        note: "对比图 - 上:白黑紫三色拼接patch（06/25） vs 下:纯紫色大尺寸patch（中文标注\"球衣切割 低编 原封砖 步行者核心 新秀年 投资必备\"）"
      }
    ]
  },
  {
    id: 147,
    player: "Tyrese Haliburton",
    playerCN: "泰瑞斯·哈利伯顿",
    brand: "Panini",
    year: "2020-21",
    series: "Flawless",
    number: "08/15编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/haliburton-flawless-08.jpg",
        note: "对比图 - 上:蓝黑白三色拼接patch（08/15） vs 下:纯白色大尺寸patch（中文标注\"单色patch BGS8.5墨迹10 不累计 老夫子\"）"
      }
    ]
  },
  {
    id: 148,
    player: "Tyrese Haliburton",
    playerCN: "泰瑞斯·哈利伯顿",
    brand: "Panini",
    year: "2020-21",
    series: "Noir Rookie Patch Autographs",
    number: "28/99编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/haliburton-noir-28.jpg",
        note: "对比图 - 上:白紫拼接patch（28/99） vs 下:纯紫色大尺寸patch（中文标注\"超暴力球衣物料切割 卡签签字\"）"
      }
    ]
  },
  {
    id: 149,
    player: "Dwight Howard",
    playerCN: "德怀特·霍华德",
    brand: "Panini",
    year: "2021-22",
    series: "National Treasures Biography Materials",
    number: "1/1编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/howard-nt-01-2.jpg",
        note: "版本2 - 浅灰黑条纹拼接patch（1/1编，中文标注\"1of1 biography PATCH 四色切割\"）"
      },
      {
        url: "images/sample/howard-nt-01-1.jpg",
        note: "版本1 - 黄白红三色拼接patch（1/1编，中文标注\"魔术巅峰时期 德怀特霍华德 tag logoman切割 原封顶级好卡 One of One 仅一张\"）"
      }
    ]
  },
  {
    id: 150,
    player: "Stephen Curry",
    playerCN: "斯蒂芬·库里",
    brand: "Playoff",
    year: "2009",
    series: "National Treasures NBA Gear Dual Prime",
    number: "07/49编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/curry-nt-07.jpg",
        note: "对比图 - 左:蓝黄红白多色拼接双patch（7/49，含GBTC封装正反面） vs 右:深蓝白黑三色拼接双patch（正反面展示Warriors Guard字样）"
      }
    ]
  },
  {
    id: 151,
    player: "Kobe Bryant",
    playerCN: "科比·布莱恩特",
    brand: "Upper Deck",
    year: "2008-09",
    series: "Premier Triple",
    number: "34/50编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/kobe-premier-34.jpg",
        note: "对比图 - 左:蓝黄白三色拼接三格patch（34/50） vs 右:紫黄白三色拼接三格patch（34/50，Rare Remnants版）"
      }
    ]
  },
  {
    id: 152,
    player: "LeBron James",
    playerCN: "勒布朗·詹姆斯",
    brand: "Panini",
    year: "2016-17",
    series: "Immaculate Special Event Materials",
    number: "1/4编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/lebron-imm-01.jpg",
        note: "对比图 - 左:黑色adidas logo patch（含GBTC封装，中文标注\"2281想卖39000\"） vs 右:红黑黄三色patch（右侧交易详情显示2281元成交）"
      }
    ]
  },
  {
    id: 153,
    player: "Stephen Curry",
    playerCN: "斯蒂芬·库里",
    brand: "Panini",
    year: "2022-23",
    series: "National Treasures Treasured Threads",
    number: "10编",
    status: "suspected",
    highRiskReason: "与同系列10编出现不同patch的版本",
    images: [
      {
        url: "images/sample/curry-nt-10-2.jpg",
        note: "版本1 - 黄蓝拼接大尺寸patch（同款对比）"
      },
      {
        url: "images/sample/curry-nt-10-1.jpg",
        note: "版本2 - 蓝白S字母拼接patch⚠️ 注意：同系列同编号10编出现不同patch版本，标注为高危"
      }
    ]
  },
  {
    id: 154,
    player: "LeBron James",
    playerCN: "勒布朗·詹姆斯",
    brand: "Panini",
    year: "2021-22",
    series: "Immaculate The Standard",
    number: "15/25编",
    status: "suspected",
    highRiskReason: "来自球星卡TV的视频，为同一换patch团伙送评的卡片",
    images: [
      {
        url: "images/sample/lebron-imm-15-2.jpg",
        note: "对比证据 - 同系列其他编号对比：左为25编（纯黑色patch），右为25编（紫色patch），同系列不同编号patch差异明显异常"
      },
      {
        url: "images/sample/lebron-imm-15-1.jpg",
        note: "疑似卡片 - 紫黄白三色拼接大尺寸patch（含GBTC封装正反面，15/25编）⚠️ 高危警示：根据同系列对比，此卡patch与其他编号差异过大，换patch概率很高，请谨慎购买"
      }
    ]
  },
  {
    id: 155,
    player: "LeBron James",
    playerCN: "勒布朗·詹姆斯",
    brand: "Panini",
    year: "2021-22",
    series: "Flawless Patch",
    number: "14/20编",
    status: "suspected",
    highRiskReason: "来自球星卡TV的视频，为同一换patch团伙送评的卡片",
    images: [
      {
        url: "images/sample/lebron-flawless-14-2.jpg",
        note: "对比证据 - 同系列其他编号对比：左为05/20编（黄白紫三色拼接双格patch），右为另一版本（纯紫色单格patch含PSA封装），同系列patch样式存在明显异常"
      },
      {
        url: "images/sample/lebron-flawless-14-1.jpg",
        note: "疑似卡片 - 紫黄白三色拼接双格patch（含GBTC封装正反面，14/20编）⚠️ 高危警示：根据同系列对比，此卡patch样式与其他编号差异明显，换patch概率很高，请谨慎购买"
      }
    ]
  },
  {
    id: 156,
    player: "Stephen Curry",
    playerCN: "斯蒂芬·库里",
    brand: "Panini",
    year: "2021-22",
    series: "Immaculate The Standard",
    number: "16/25编",
    status: "suspected",
    highRiskReason: "来自球星卡TV的视频，为同一换patch团伙送评的卡片",
    images: [
      {
        url: "images/sample/curry-imm-standard-16.jpg",
        note: "蓝黄白三色拼接大尺寸库里patch（含GBTC封装正反面，16/25编）⚠️ 高危警示：根据同款卡片对比或相关经验判断，此卡换patch概率很大，请谨慎购买"
      }
    ]
  },
  {
    id: 157,
    player: "Stephen Curry",
    playerCN: "斯蒂芬·库里",
    brand: "Panini",
    year: "2018-19",
    series: "Opulence Precious Swatch Signatures",
    number: "3/10编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/curry-opulence-3-2.jpg",
        note: "原始卡片 - 蓝白两色拼接单块patch（含签名，3/10编）"
      },
      {
        url: "images/sample/curry-opulence-3-1.jpg",
        note: "换patch后 - 蓝黄三色拼接大尺寸三杠patch（含签名，3/10编）🚫 同一编号出现完全不同的patch样式，确认为换patch"
      }
    ]
  },
  {
    id: 158,
    player: "Stephen Curry",
    playerCN: "斯蒂芬·库里",
    brand: "Panini",
    year: "2018-19",
    series: "Opulence Precious Swatch Signatures",
    number: "08/10编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/curry-opulence-8.jpg",
        note: "版本1 - 蓝黄白三色拼接大尺寸三杠patch带勇士队Logo（含签名，08/10编）"
      },
      {
        url: "images/sample/curry-opulence-8-new1.jpg",
        note: "版本2 - 黄蓝三色拼接大尺寸patch带勇士队Logo（含签名，08/10编）"
      },
      {
        url: "images/sample/curry-opulence-8-new2.jpg",
        note: "多编号对比 - 该系列至少5个不同编号(1/10、2/10、7/10、8/10，以及之前的3/10)出现不同patch样式🚫 系统性换patch证据确凿，确认为换patch"
      }
    ]
  },
  {
    id: 159,
    player: "Jaden Ivey",
    playerCN: "杰登·艾维",
    brand: "Panini",
    year: "2022-23",
    series: "Noir",
    number: "02/99编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/ivey-noir-2.jpg",
        note: "同编号对比 - 左：纯红色单块patch（含签名），右：红白两色拼接patch（含签名）🚫 同一编号（02/99）出现完全不同的patch样式，确认为换patch"
      }
    ]
  },
  {
    id: 160,
    player: "Cade Cunningham",
    playerCN: "凯德·坎宁安",
    brand: "Panini",
    year: "2021-22",
    series: "Noir Rookie Patch Autograph",
    number: "94/99编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/cunningham-noir-94.jpg",
        note: "同编号对比 - 左：纯红色单块patch（含签名），右：红白蓝三色拼接patch（含签名）🚫 同一编号（94/99）出现完全不同的patch样式，确认为换patch"
      }
    ]
  },
  {
    id: 161,
    player: "Scottie Barnes",
    playerCN: "斯科蒂·巴恩斯",
    brand: "Panini",
    year: "2021-22",
    series: "Noir Rookie Patch Autograph",
    number: "81/99编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/barnes-noir-81.jpg",
        note: "同编号对比 - 左：纯红色单块patch（含签名），右：红白两色拼接patch（含签名）🚫 同一编号（81/99）出现完全不同的patch样式，确认为换patch"
      }
    ]
  },
  {
    id: 162,
    player: "Jalen Johnson",
    playerCN: "杰伦·约翰逊",
    brand: "Panini",
    year: "2021-22",
    series: "Noir Rookie Patch Autograph",
    number: "72/99编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/johnson-noir-72.jpg",
        note: "同编号对比 - 上：纯红色单块patch（含签名），下：白红黄三色拼接patch（含签名）🚫 同一编号（72/99）出现完全不同的patch样式，确认为换patch"
      }
    ]
  },
  {
    id: 163,
    player: "Bennedict Mathurin",
    playerCN: "本尼迪克特·马瑟林",
    brand: "Panini",
    year: "2022-23",
    series: "Impeccable Elegance",
    number: "99/99编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/mathurin-elegance-99.jpg",
        note: "同编号对比 - 左：深蓝色单块patch（含签名），右：深蓝色和米色拼接patch（含签名）🚫 同一编号（99/99）出现完全不同的patch样式，确认为换patch"
      }
    ]
  },
  {
    id: 164,
    player: "Bennedict Mathurin",
    playerCN: "本尼迪克特·马瑟林",
    brand: "Panini",
    year: "2022-23",
    series: "One and One",
    number: "21/99编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/mathurin-one-21.jpg",
        note: "同系列对比 - 上：黄黑两色拼接patch（含签名，21/99编），下：白蓝两色拼接patch（含签名）🚫 同系列不同编号patch样式差异巨大，确认存在换patch"
      }
    ]
  },
  {
    id: 165,
    player: "Jalen Williams",
    playerCN: "杰伦·威廉姆斯",
    brand: "Panini",
    year: "2022-23",
    series: "Noir Rookie Patch Autograph",
    number: "70/99编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/williams-noir-70.jpg",
        note: "同编号对比 - 上：蓝黄红三色拼接patch（含签名），下：纯蓝色单块patch（含签名）🚫 同一编号（70/99）出现完全不同的patch样式，确认为换patch"
      }
    ]
  },
  {
    id: 166,
    player: "Stephon Castle",
    playerCN: "斯蒂芬·卡斯尔",
    brand: "Panini",
    year: "2024-25",
    series: "Noir New Wave Jerseys",
    number: "10/25编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/castle-noir-10.jpg",
        note: "同编号对比 - 左：白黑两色拼接patch，右：纯白色单块patch 🚫 同一编号（10/25）出现完全不同的patch样式，确认为换patch"
      }
    ]
  },
  {
    id: 167,
    player: "Brandin Podziemski",
    playerCN: "布兰丁·波杰姆斯基",
    brand: "Panini",
    year: "2023-24",
    series: "Impeccable Elegance",
    number: "02/25编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/podziemski-elegance-2.jpg",
        note: "同编号对比 - 左：白蓝两色拼接patch（含签名），右：纯蓝色单块patch（含签名）🚫 同一编号（02/25）出现完全不同的patch样式，确认为换patch"
      }
    ]
  },
  {
    id: 168,
    player: "Kyshawn George",
    playerCN: "凯肖恩·乔治",
    brand: "Panini",
    year: "2024-25",
    series: "Noir Rookie Patch Autograph",
    number: "75/99编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/george-noir-75.jpg",
        note: "同编号对比 - 左：白红蓝三色拼接patch（含签名），右：纯蓝色单块patch（含签名）🚫 同一编号（75/99）出现完全不同的patch样式，确认为换patch"
      }
    ]
  },
  {
    id: 169,
    player: "Yves Missi",
    playerCN: "伊夫·米西",
    brand: "Panini",
    year: "2024-25",
    series: "National Treasures Clutch Factor",
    number: "08/49编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/missi-nt-8.jpg",
        note: "同编号对比 - 左：深蓝白金三色拼接patch（含签名），右：纯深蓝色单块patch（含签名）🚫 同一编号（08/49）出现完全不同的patch样式，确认为换patch"
      }
    ]
  },
  {
    id: 170,
    player: "Myles Turner",
    playerCN: "迈尔斯·特纳",
    brand: "Panini",
    year: "2016-17",
    series: "Grand Reserve Cornerstones",
    number: "02/49编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/turner-grand-2.jpg",
        note: "同编号对比 - 左：四块patch（深蓝、黑、黄色拼接，含签名），右：四块patch（全为白色和深蓝色，含签名）🚫 同一编号（02/49）出现完全不同的patch样式，确认为换patch"
      }
    ]
  },
  {
    id: 171,
    player: "Jalen Pickett",
    playerCN: "杰伦·皮克特",
    brand: "Panini",
    year: "2023-24",
    series: "National Treasures Colossal",
    number: "31/49编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/pickett-nt-31.jpg",
        note: "同编号对比 - 左：深蓝白黄三色拼接大尺寸patch（含签名），右：纯深蓝色单块patch（含签名）🚫 同一编号（31/49）出现完全不同的patch样式，确认为换patch"
      }
    ]
  },
  {
    id: 172,
    player: "Jalen Pickett",
    playerCN: "杰伦·皮克特",
    brand: "Panini",
    year: "2023-24",
    series: "Immaculate",
    number: "41/99编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/pickett-imm-41.jpg",
        note: "同编号对比 - 左：蓝黄白三色拼接patch（含签名），右：纯深蓝色单块patch（含签名）🚫 同一编号（41/99）出现完全不同的patch样式，确认为换patch"
      }
    ]
  },
  {
    id: 173,
    player: "CJ McCollum",
    playerCN: "CJ·麦科勒姆",
    brand: "Panini",
    year: "2022-23",
    series: "One and One",
    number: "25/49编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/mccollum-one-25.jpg",
        note: "同编号对比 - 左：白色和金色拼接patch（含签名），右：纯红色单块patch（含签名）🚫 同一编号（25/49）出现完全不同的patch样式，确认为换patch"
      }
    ]
  },
  {
    id: 174,
    player: "Kobe Brown",
    playerCN: "科比·布朗",
    brand: "Panini",
    year: "2023-24",
    series: "Immaculate",
    number: "10/99编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/brown-imm-10.jpg",
        note: "同编号对比 - 左：白蓝两色拼接patch（含签名），右：纯红色单块patch（含签名）🚫 同一编号（10/99）出现完全不同的patch样式，确认为换patch"
      }
    ]
  },
  {
    id: 175,
    player: "Tyler Kolek",
    playerCN: "泰勒·科莱克",
    brand: "Panini",
    year: "2024-25",
    series: "Noir Rookie Patch Autograph",
    number: "21/49编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/kolek-noir-21.jpg",
        note: "同编号对比 - 左：橙灰白三色拼接patch（含签名），右：纯橙色单块patch（含签名）🚫 同一编号（21/49）出现完全不同的patch样式，确认为换patch"
      }
    ]
  },
  {
    id: 176,
    player: "Stephen Curry",
    playerCN: "斯蒂芬·库里",
    brand: "Panini",
    year: "2017-18",
    series: "Immaculate Standout Memorabilia",
    number: "47/49编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/curry-imm-standout-47.jpg",
        note: "同编号对比 - 左：ALTERED（改动的）蓝白拼接大尺寸patch，右：REAL（真实的）纯蓝色单块patch 🚫 同一编号（47/49）出现完全不同的patch样式，左侧明确标注为ALTERED，确认为换patch"
      }
    ]
  },
  {
    id: 177,
    player: "James Harden",
    playerCN: "詹姆斯·哈登",
    brand: "Panini",
    year: "2009",
    series: "Absolute Memorabilia Rookie Premiere Materials",
    number: "1/5编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/harden-abs-2.jpg",
        note: "原始卡片 - NBA logo patch（红白蓝拼接）+ 橙色jersey + 黑色雷霆队logo patch，右下角无\"Prime\"标识"
      },
      {
        url: "images/sample/harden-abs-1.jpg",
        note: "换patch后 - NBA logo patch（红白蓝拼接）+ 橙色patch + 黑色雷霆队logo patch（含PSA 10 AUTO评级）🚫 右下角无\"Prime\"字样证明此卡应为jersey材质，却出现了大尺寸patch，确认为换patch"
      }
    ]
  },
  {
    id: 178,
    player: "Kevin Durant",
    playerCN: "凯文·杜兰特",
    brand: "Panini",
    year: "2010-11",
    series: "National Treasures NBA Gear Laundry Tag Combos Signatures",
    number: "5编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/durant-nt-gear-5-2.jpg",
        note: "原始卡片 - 左：白蓝拼接patch + 右：纯蓝色jersey（含签名）"
      },
      {
        url: "images/sample/durant-nt-gear-5-1.jpg",
        note: "换patch后 - 左：黑白灰三色拼接adidas logo patch + 右：黑灰拼接adidas logo patch（含签名，BGS 8.5 AUTO 10评级）🚫 同一编号出现完全不同的双patch样式，确认为换patch"
      }
    ]
  },
  {
    id: 179,
    player: "Anton Watson",
    playerCN: "安东·沃森",
    brand: "Panini",
    year: "2024-25",
    series: "Obsidian Rookie Patch Autograph",
    number: "55/75编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/watson-obsidian-55-2.jpg",
        note: "原始卡片 - 白蓝白三色拼接大尺寸patch（含签名）"
      },
      {
        url: "images/sample/watson-obsidian-55-1.jpg",
        note: "换patch后 - 白黑拼接耐克logo patch（含签名）🚫 同一编号（55/75）出现完全不同的patch样式，确认为换patch"
      }
    ]
  },
  {
    id: 180,
    player: "Anton Watson",
    playerCN: "安东·沃森",
    brand: "Panini",
    year: "2024-25",
    series: "Mosaic Rookie Patch Autograph",
    number: "编号待确认",
    status: "confirmed",
    images: [
      {
        url: "images/sample/watson-mosaic-2.jpg",
        note: "原始卡片 - 纯绿色单块patch（含签名）"
      },
      {
        url: "images/sample/watson-mosaic-1.jpg",
        note: "换patch后 - 白绿拼接大尺寸patch（含签名）🚫 同系列出现完全不同的patch样式，确认为换patch"
      }
    ]
  },
  {
    id: 181,
    player: "Kyrie Irving",
    playerCN: "凯里·欧文",
    brand: "Panini",
    year: "2019-20",
    series: "National Treasures Colossal Game Used Patch Auto",
    number: "08/10编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/irving-nt-colossal-8-2.jpg",
        note: "原始卡片 - 黄紫拼接大尺寸patch（含签名，08/10编）"
      },
      {
        url: "images/sample/irving-nt-colossal-8-1.jpg",
        note: "换patch后 - 白红拼接大尺寸patch（含签名，08/10编，PSA NM-MT 8评级）🚫 同一编号出现完全不同的patch样式，确认为换patch"
      }
    ]
  },
  {
    id: 182,
    player: "Kevin Durant",
    playerCN: "凯文·杜兰特",
    brand: "Panini",
    year: "2014-15",
    series: "Immaculate Collection",
    number: "18/25编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/durant-imm-18-2.jpg",
        note: "原始卡片 - 纯蓝色单块patch（含签名，18/25编）"
      },
      {
        url: "images/sample/durant-imm-18-1.jpg",
        note: "换patch后 - 白蓝拼接大尺寸patch（含签名，18/25编）🚫 同一编号出现完全不同的patch样式，确认为换patch"
      }
    ]
  },
  {
    id: 183,
    player: "Damian Lillard",
    playerCN: "达米安·利拉德",
    brand: "Panini",
    year: "2016-17",
    series: "Flawless",
    number: "06/25编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/lillard-flawless-6-3.jpg",
        note: "版本3 - 灰红黑三色拼接patch（含签名，06/25编）"
      },
      {
        url: "images/sample/lillard-flawless-6-2.jpg",
        note: "版本2 - 黑红拼接patch（含签名，06/25编，BGS 7评级）"
      },
      {
        url: "images/sample/lillard-flawless-6-1.jpg",
        note: "版本1 - 灰红拼接patch（含签名，06/25编）🚫 同一编号（06/25）出现至少三种完全不同的patch样式，确认为换patch"
      }
    ]
  },
  {
    id: 184,
    player: "Kevin Durant",
    playerCN: "凯文·杜兰特",
    brand: "Panini",
    year: "2017-18",
    series: "National Treasures",
    number: "04/25编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/durant-nt-4-2.jpg",
        note: "原始卡片 - 纯黄色单块patch（含签名，04/25编）"
      },
      {
        url: "images/sample/durant-nt-4-1.jpg",
        note: "换patch后 - 蓝黄拼接大尺寸patch（含签名，04/25编，PSA签字评分10）🚫 同一编号出现完全不同的patch样式，确认为换patch"
      }
    ]
  },
  {
    id: 185,
    player: "Scottie Barnes",
    playerCN: "斯科蒂·巴恩斯",
    brand: "Panini",
    year: "2021-22",
    series: "Immaculate",
    number: "06/49编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/barnes-imm-6-2.jpg",
        note: "原始卡片 - 红白黑三色拼接patch（含签名，06/49编）"
      },
      {
        url: "images/sample/barnes-imm-6-1.jpg",
        note: "换patch后 - 红白拼接patch（含签名，06/49编）🚫 同一编号出现完全不同的patch样式，确认为换patch"
      }
    ]
  },
  {
    id: 186,
    player: "Tyrese Maxey",
    playerCN: "泰瑞斯·马克西",
    brand: "Panini",
    year: "2020-21",
    series: "Noir Rookie Patch Autograph",
    number: "29/99编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/maxey-noir-29-2.jpg",
        note: "原始卡片 - 纯白色单块patch（含签名，29/99编）"
      },
      {
        url: "images/sample/maxey-noir-29-1.jpg",
        note: "换patch后 - 红蓝拼接patch（含签名，29/99编）🚫 同一编号出现完全不同的patch样式，确认为换patch"
      }
    ]
  },
  {
    id: 187,
    player: "Tyrese Haliburton",
    playerCN: "泰瑞斯·哈利伯顿",
    brand: "Panini",
    year: "2020-21",
    series: "Noir Rookie Patch Autograph",
    number: "09/99编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/haliburton-noir-9-2.jpg",
        note: "原始卡片 - 纯紫色单块patch（含签名，09/99编）"
      },
      {
        url: "images/sample/haliburton-noir-9-1.jpg",
        note: "换patch后 - 白紫拼接patch（含签名，09/99编）🚫 同一编号出现完全不同的patch样式，确认为换patch"
      }
    ]
  },
  {
    id: 188,
    player: "Shai Gilgeous-Alexander",
    playerCN: "谢伊·吉尔杰斯-亚历山大",
    brand: "Panini",
    year: "2021-22",
    series: "Flawless Signatures Prime Material Emerald",
    number: "5/5编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/sga-flawless-5-2.jpg",
        note: "原始卡片 - 纯蓝色单块patch（含签名，5/5编）"
      },
      {
        url: "images/sample/sga-flawless-5-1.jpg",
        note: "换patch后 - 蓝红拼接patch（含签名，5/5编，PSA NM-MT 8 AUTO 10评级）🚫 同一编号出现完全不同的patch样式，确认为换patch"
      }
    ]
  },
  {
    id: 189,
    player: "Tyrese Maxey",
    playerCN: "泰雷塞·马克西",
    brand: "Panini",
    year: "2020-21",
    series: "Noir Rookie Patch Autograph",
    number: "88/99编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/maxey-noir-88-2.jpg",
        note: "原始卡片 - 纯白色单块patch（含签名，76人新秀卡）"
      },
      {
        url: "images/sample/maxey-noir-88-1.jpg",
        note: "换patch后 - 红蓝拼接patch（含签名，88/99编）🚫 同一系列同一球员出现完全不同的patch样式，确认为换patch"
      }
    ]
  },
  {
    id: 190,
    player: "Tyrese Haliburton",
    playerCN: "泰瑞斯·哈利伯顿",
    brand: "Panini",
    year: "2020-21",
    series: "Impeccable Elegance Rookie 3Color Patch",
    number: "4/10编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/haliburton-impeccable-10-2.jpg",
        note: "原始卡片 - 纯紫色单块patch（含签名，金版RPA，国王队新秀卡）"
      },
      {
        url: "images/sample/haliburton-impeccable-10-1.jpg",
        note: "换patch后 - 蓝白拼接patch（含签名，4/10编，金版RPA）🚫 同一系列同一球员出现完全不同的patch样式，确认为换patch"
      }
    ]
  },
  {
    id: 191,
    player: "Max Christie",
    playerCN: "马克斯·克里斯蒂",
    brand: "Panini",
    year: "2022-23",
    series: "Noir Rookie Patch Autograph",
    number: "02/99编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/christie-noir-2-2.jpg",
        note: "原始卡片 - 纯紫色单块patch（含签名，湖人队新秀卡，02/99编）"
      },
      {
        url: "images/sample/christie-noir-2-1.jpg",
        note: "换patch后 - 黄白拼接patch（含签名，02/99编）🚫 同一编号出现完全不同的patch样式，确认为换patch"
      }
    ]
  },
  {
    id: 192,
    player: "Jalen Johnson",
    playerCN: "杰伦·约翰逊",
    brand: "Panini",
    year: "2021-22",
    series: "One And One Rookie Patch Autograph Purple",
    number: "16/35编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/johnson-oneandone-16-2.jpg",
        note: "原始卡片 - 纯红色单块patch（含签名，老鹰队新秀卡，16/35编）"
      },
      {
        url: "images/sample/johnson-oneandone-16-1.jpg",
        note: "换patch后 - 黄红拼接patch（含签名，16/35编）🚫 同一编号出现完全不同的patch样式，确认为换patch"
      }
    ]
  },
  {
    id: 193,
    player: "Stephen Curry",
    playerCN: "斯蒂芬·库里",
    brand: "Panini",
    year: "2022",
    series: "Flawless Vertical Patch",
    number: "15/15编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/curry-flawless-15.jpg",
        note: "换patch对比 - 左侧标注\"ALTERED\"的PSA评级卡显示黄色patch，右侧原卡显示纯黄色patch（含签名，15/15编）🚫 明确标注ALTERED，确认为换patch卡片"
      }
    ]
  },
  {
    id: 194,
    player: "Kevin Durant",
    playerCN: "凯文·杜兰特",
    brand: "Panini",
    year: "2014-15",
    series: "National Treasures Colossal",
    number: "11/25编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/durant-colossal-11-2.jpg",
        note: "原始卡片 - 纯蓝色大窗patch（含签名，雷霆队球衣，11/25编）"
      },
      {
        url: "images/sample/durant-colossal-11-1.jpg",
        note: "换patch后 - 蓝白红三色拼接patch（含签名，11/25编）🚫 同一编号出现完全不同的patch样式，确认为换patch。成交价¥4,651（2024年），远高于原版¥2,888（2021年）"
      }
    ]
  },
  {
    id: 195,
    player: "Kobe Bryant",
    playerCN: "科比·布莱恩特",
    brand: "Panini",
    year: "2012-13",
    series: "Immaculate Collection",
    number: "14/25编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/kobe-imm-14-3.jpg",
        note: "版本3 - 紫黄拼接patch（含签名，14/25编）🚫 同一编号出现至少三种完全不同的patch样式，确认为换patch。Immaculate元年产品，意义重大"
      },
      {
        url: "images/sample/kobe-imm-14-2.jpg",
        note: "版本2 - 黄紫白三色大尺寸patch（含签名，14/25编）"
      },
      {
        url: "images/sample/kobe-imm-14-1.jpg",
        note: "版本1 - 紫白拼接patch（含签名，湖人队球衣，14/25编）"
      }
    ]
  },
  {
    id: 196,
    player: "Allen Iverson",
    playerCN: "艾伦·艾弗森",
    brand: "Panini",
    year: "2013-14",
    series: "Immaculate Collection",
    number: "16/25编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/iverson-imm-16.jpg",
        note: "换patch卡片 - 红白蓝三色拼接大尺寸patch（含签名，16/25编，BGS 9评级）🚫 eBay卖家明确标注\"fake patch\"，证实为换patch卡片"
      }
    ]
  },
  {
    id: 197,
    player: "Allen Iverson",
    playerCN: "艾伦·艾弗森",
    brand: "Panini",
    year: "2013-14",
    series: "Immaculate Collection",
    number: "08/25编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/iverson-imm-8.jpg",
        note: "换patch卡片 - 红白黑三色拼接大尺寸patch（含签名，08/25编）🚫 eBay卖家明确标注\"fake patch\"，证实为换patch卡片"
      }
    ]
  },
  {
    id: 198,
    player: "Allen Iverson",
    playerCN: "艾伦·艾弗森",
    brand: "Panini",
    year: "2013-14",
    series: "Immaculate Collection",
    number: "24/25编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/iverson-imm-24.jpg",
        note: "换patch卡片 - 红黑蓝白条纹拼接大尺寸patch（含签名，24/25编）🚫 eBay卖家明确标注\"fake patch\"，售价仅US $0.99，证实为换patch卡片"
      }
    ]
  },
  {
    id: 199,
    player: "Jayson Tatum",
    playerCN: "杰森·塔图姆",
    brand: "Panini",
    year: "2018-19",
    series: "National Treasures Colossal",
    number: "16/49编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/tatum-nt-16-2.jpg",
        note: "换patch卡片 - 纯绿色大窗patch（含签名，凯尔特人队配色，16/49编）🚫 违反系列规则：2018-19 NT系列中49编全部应为jersey，只有25编及以下才是patch。此卡本应是jersey却被换成patch"
      },
      {
        url: "images/sample/tatum-nt-16-1.jpg",
        note: "换patch卡片 - 黑色大窗patch（含签名，16/49编）"
      }
    ]
  },
  {
    id: 200,
    player: "Tyrese Haliburton",
    playerCN: "泰瑞斯·哈利伯顿",
    brand: "Panini",
    year: "2020-21",
    series: "Immaculate Collection Rookie Patch Autograph",
    number: "67/99编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/haliburton-imm-67-2.jpg",
        note: "换patch后 - 紫色球衣patch（含签名，国王队配色，67/99编）🚫 同一编号出现完全不同的材质样式，确认为换patch"
      },
      {
        url: "images/sample/haliburton-imm-67-1.jpg",
        note: "原始卡片 - 镜面球衣签字卡（含签名，国王队新秀卡，67/99编，未开封状态）"
      }
    ]
  },
  {
    id: 201,
    player: "Chet Holmgren",
    playerCN: "切特·霍姆格伦",
    brand: "Panini",
    year: "2022-23",
    series: "Impeccable Elegance Rookie Patch Autograph",
    number: "03/99编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/holmgren-imp-3-2.jpg",
        note: "换patch后 - 纯蓝色单块patch（含签名#7，雷霆队配色，03/99编）🚫 同一编号出现完全不同的patch样式，确认为换patch"
      },
      {
        url: "images/sample/holmgren-imp-3-1.jpg",
        note: "原始卡片 - 蓝白红三色拼接patch（含签名#7，雷霆队新秀卡，03/99编）"
      }
    ]
  },
  {
    id: 202,
    player: "Cade Cunningham",
    playerCN: "凯德·坎宁安",
    brand: "Panini",
    year: "2021-22",
    series: "Impeccable Elegance Rookie Patch Autograph",
    number: "24/99编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/cunningham-imp-24-2.jpg",
        note: "换patch后 - 纯红色单块patch（含签名，活塞队配色，24/99编）🚫 同一编号出现完全不同的patch样式，确认为换patch"
      },
      {
        url: "images/sample/cunningham-imp-24-1.jpg",
        note: "原始卡片 - 红蓝拼接patch（含签名，活塞队新秀卡，24/99编）"
      }
    ]
  },
  {
    id: 203,
    player: "Tracy McGrady",
    playerCN: "特雷西·麦格雷迪",
    brand: "Upper Deck",
    year: "2005-06",
    series: "Exquisite Collection Limited Logos",
    number: "32/50编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/mcgrady-ud-32.jpg",
        note: "换patch对比 - 左：BGS 9评级，纯白色球衣patch（含签名，32/50编）；右：PSA NM 7评级，红白黑三色拼接球队Logo patch（含签名，32/50编）🚫 同一编号出现完全不同的patch样式，从普通球衣换成球队Logo patch，确认为换patch"
      }
    ]
  },
  {
    id: 204,
    player: "Tracy McGrady",
    playerCN: "特雷西·麦格雷迪",
    brand: "Upper Deck",
    year: "2005-06",
    series: "Exquisite Collection Limited Logos",
    number: "13/50编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/mcgrady-ud-13.jpg",
        note: "换patch对比 - 左：纯红色球衣patch（含签名，13/50编）；右：PSA Authentic评级，红白球队Logo patch（含签名，13/50编）🚫 同一编号出现完全不同的patch样式，从普通球衣换成球队Logo patch，确认为换patch"
      }
    ]
  },
  {
    id: 205,
    player: "Chet Holmgren",
    playerCN: "切特·霍姆格伦",
    brand: "Panini",
    year: "2022-23",
    series: "Impeccable Elegance Rookie Patch Autograph",
    number: "83/99编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/holmgren-imp-83-2.jpg",
        note: "换patch后 - 蓝白红三色拼接patch（含签名#7，雷霆队配色，83/99编）🚫 同一编号出现完全不同的patch样式，确认为换patch"
      },
      {
        url: "images/sample/holmgren-imp-83-1.jpg",
        note: "原始卡片 - 橙蓝白三色拼接patch（含签名#7，雷霆队新秀卡，83/99编，成交价仅¥1.00）"
      }
    ]
  },
  {
    id: 206,
    player: "Paul Pierce",
    playerCN: "保罗·皮尔斯",
    brand: "Upper Deck",
    year: "2007",
    series: "Exquisite Collection Quad Jersey Extra",
    number: "04/10编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/pierce-ud-4-comment.jpg",
        note: "评论截图 - 藏家指出：该版本3编才应该是patch，10编都是单色球衣。评论者表示拥有两张同款毕比卡片作为对比证据"
      },
      {
        url: "images/sample/pierce-ud-4.jpg",
        note: "四窗球衣卡 - 四块绿白拼接球衣patch（含签名，凯尔特人队配色，04/10编）🚫 违反系列规则：该系列10编应为四窗球衣，3编才是两球衣两patch。此卡04/10编本应是四窗球衣，但据评论显示有收藏者持有毕比同款卡片对比，确认存在换patch问题"
      }
    ]
  },
  {
    id: 207,
    player: "Cade Cunningham",
    playerCN: "凯德·坎宁安",
    brand: "Panini",
    year: "2022-23",
    series: "Impeccable Elegance Rookie Patch Autograph",
    number: "06/25编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/cunningham-imp-6-2.jpg",
        note: "换patch后 - 蓝白拼接patch（含签名，活塞队配色，06/25编）🚫 同一编号出现完全不同的patch样式，确认为换patch"
      },
      {
        url: "images/sample/cunningham-imp-6-1.jpg",
        note: "原始卡片 - 蓝色单块patch（含签名，活塞队新秀卡，06/25编）"
      }
    ]
  },
  {
    id: 208,
    player: "Kobe Bryant",
    playerCN: "科比·布莱恩特",
    brand: "Upper Deck",
    year: "1998-99",
    series: "Game Jerseys",
    number: "GJ19",
    status: "confirmed",
    images: [
      {
        url: "images/sample/kobe-ud-gj19.jpg",
        note: "换patch对比 - 左：纯黄色单块球衣（原始卡片，标注ALTERED）；右：BGS 9.5评级，黄紫白三色拼接大尺寸patch（换patch后）🚫 明确标注\"Fake Patch\"和\"Previously listed and sold as ALTERED\"，原本是纯黄色球衣卡被换成多色patch。图片说明：左侧卡片才是原版未改动的球衣样式"
      }
    ]
  },
  {
    id: 209,
    player: "Kobe Bryant",
    playerCN: "科比·布莱恩特",
    brand: "Panini",
    year: "2012-13",
    series: "Immaculate Collection",
    number: "19/75编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/kobe-imm-19.jpg",
        note: "换patch对比 - 上：白紫黄三色拼接patch（含签名，19/75编）；下：紫橙白三色拼接大尺寸patch（含签名，19/75编）🚫 同一编号出现完全不同的patch样式，确认为换patch。Immaculate元年产品"
      }
    ]
  },
  {
    id: 210,
    player: "Kobe Bryant",
    playerCN: "科比·布莱恩特",
    brand: "Panini",
    year: "2012-13",
    series: "Immaculate Collection",
    number: "27/75编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/kobe-imm-27.jpg",
        note: "换patch对比 - 上：黄橙紫白四色拼接大尺寸patch（PSA评级，27/75编）；下：白色为主带黄边和紫色小块的小尺寸patch（21/75编）🚫 同系列不同编号，patch样式差异巨大，进一步证明Immaculate元年产品的换patch现象。注意：27/75编卡片与之前记录的14/25、19/75编呈现相似的多色拼接风格，而21/75编却是普通白色球衣"
      }
    ]
  },
  {
    id: 211,
    player: "LeBron James",
    playerCN: "勒布朗·詹姆斯",
    brand: "Panini",
    year: "2022",
    series: "Flawless Dual Player Patch",
    number: "DPH-LBJ 13/15编",
    status: "confirmed",
    images: [
      {
        url: "images/sample/lebron-flawless-13.jpg",
        note: "换patch对比 - 左：白黑紫三色拼接的简单patch（原始卡片）；右：黄白紫三色拼接的复杂patch（换patch后，假原封）🚫 图片明确标注\"Patch Swap\"，从简单三色patch被换成更华丽的黄色湖人配色patch。来源：球星卡TV (www.tiffanycards.com)"
      }
    ]
  }
];

// 导出数据
if (typeof module !== 'undefined' && module.exports) {
  module.exports = cardsData;
}
w
