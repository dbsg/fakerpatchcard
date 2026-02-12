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
        url: "images/sample/bird-1.jpg",
        note: "版本1 - 白绿双色patch"
      },
      {
        url: "images/sample/bird-2.jpg",
        note: "版本2 - 黄白绿三色拼接patch"
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
        url: "images/sample/gordon-ultimate-60-1.jpg",
        note: "版本1 - 纯红色公牛logo patch"
      },
      {
        url: "images/sample/gordon-ultimate-60-2.jpg",
        note: "版本2 - 黑红拼接公牛logo patch"
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
        url: "images/sample/jordan-sp-041-1.jpg",
        note: "版本1 - 纯红色公牛logo patch"
      },
      {
        url: "images/sample/jordan-sp-041-2.jpg",
        note: "版本2 - 黑红拼接公牛logo patch"
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
        url: "images/sample/simien-trilogy-05-1.jpg",
        note: "版本1 - 黑红白三色拼接patch"
      },
      {
        url: "images/sample/simien-trilogy-05-2.jpg",
        note: "版本2 - 纯白色patch"
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
        url: "images/sample/iguodala-ultimate-09-1.jpg",
        note: "版本1 - 白红蓝三色拼接patch"
      },
      {
        url: "images/sample/iguodala-ultimate-09-2.jpg",
        note: "版本2 - 纯黑色patch"
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
        url: "images/sample/paul-exquisite-42-1.jpg",
        note: "版本1 - 蓝紫黄多色拼接patch"
      },
      {
        url: "images/sample/paul-exquisite-42-2.jpg",
        note: "版本2 - 黄蓝横条纹拼接patch"
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
        url: "images/sample/lebron-nt-gear-10-1.jpg",
        note: "版本1 - 左:黑橙红三色拼接patch + 右:白色带48号码patch"
      },
      {
        url: "images/sample/lebron-nt-gear-10-2.jpg",
        note: "版本2 - 左:纯白色patch + 右:黑白拼接patch"
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
        url: "images/sample/lebron-nt-gear-13-1.jpg",
        note: "版本1 - 左:蓝NBA logo patch + 右:黑橙红三色拼接patch（含eBay拍卖截图）"
      },
      {
        url: "images/sample/lebron-nt-gear-13-2.jpg",
        note: "版本2 - 左:纯白色patch + 右:纯黑色patch（含成交记录截图）"
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
        url: "images/sample/lebron-exquisite-rpa-1.jpg",
        note: "版本1 - 纯白色patch"
      },
      {
        url: "images/sample/lebron-exquisite-rpa-2.jpg",
        note: "版本2 - 纯白色patch（不同图案纹理）"
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
        url: "images/sample/mourning-exquisite-22-1.jpg",
        note: "版本1 - 红黑拼接patch"
      },
      {
        url: "images/sample/mourning-exquisite-22-2.jpg",
        note: "版本2 - 橙白红横条纹拼接patch"
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
  }
];

// 导出数据
if (typeof module !== 'undefined' && module.exports) {
  module.exports = cardsData;
}
w
