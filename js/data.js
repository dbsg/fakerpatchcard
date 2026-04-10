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
    category: "fake-patch",
    source: "https://www.youtube.com/post/Ugkxzi0YKvO02Cjeln5B58EhX5z8Qjob8N9J",
    images: [
      {
        url: "images/sample/kyrie-1.jpg",
        note: "拍卖照片",
        type: "before"
      },
      {
        url: "images/sample/kyrie-2.jpg",
        note: "PSA/DNA 认证照片",
        type: "after"
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
    category: "fake-patch",
    images: [
      {
        url: "images/sample/kyrie-2016-1.jpg",
        note: "对比图 - 左右两版本patch差异明显",
        type: "compare"
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
    category: "fake-patch",
    source: "https://www.youtube.com/post/Ugkx8H14NHgWSzJ1yK3Qv3k0B6lPQvcWEp3A",
    images: [
      {
        url: "images/sample/kyrie-2016-2.jpg",
        note: "对比图 - 左右两版本patch差异明显",
        type: "compare"
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
    category: "fake-patch",
    images: [
      {
        url: "images/sample/vince-carter-1.jpg",
        note: "版本1照片",
        type: "before"
      },
      {
        url: "images/sample/vince-carter-2.jpg",
        note: "版本2 - Kings Logo patch",
        type: "after"
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
    category: "fake-patch",
    source: "https://m.weibo.cn/detail/4980284810595372",
    images: [
      {
        url: "images/sample/kobe-1.jpg",
        note: "BGS评级版本 - 三色patch（灰/黄/蓝）",
        type: "before"
      },
      {
        url: "images/sample/kobe-2.jpg",
        note: "完整24号球衣patch（紫/黄/白）",
        type: "before"
      },
      {
        url: "images/sample/kobe-3.jpg",
        note: "另一版本",
        type: "after"
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
    category: "fake-patch",
    images: [
      {
        url: "images/sample/tmac-1.jpg",
        note: "对比图 - 上图BGS评级版黑色B字母patch vs 中图卡片红色patch",
        type: "compare"
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
    category: "fake-patch",
    source: "https://www.youtube.com/post/UgkxCeOR5dJUZy9UbZB3zmnVU9o-p4ZhbNiE",
    images: [
      {
        url: "images/sample/gerald-wallace-2.jpg",
        note: "多色条纹patch（灰/白/蓝）",
        type: "before"
      },
      {
        url: "images/sample/gerald-wallace-1.jpg",
        note: "版本2 - Adidas logo黑白patch",
        type: "after"
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
    category: "fake-patch",
    images: [
      {
        url: "images/sample/alec-burks-1.jpg",
        note: "对比图 - 左侧Thunder队logo patch vs 右侧橙蓝双色patch",
        type: "compare"
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
    category: "fake-patch",
    source: "https://www.youtube.com/post/Ugkx2hFHJym-ApLRvxLEmrcOUYHIhUk2RhFG",
    images: [
      {
        url: "images/sample/pj-washington-old.jpg",
        note: "版本1 - 纯色蓝绿patch",
        type: "before"
      },
      {
        url: "images/sample/pj-washington-new.jpg",
        note: "版本2 - NBA logo多色patch",
        type: "after"
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
    category: "fake-patch",
    images: [
      {
        url: "images/sample/enrique-freeman-old.jpg",
        note: "版本1 - 大号字母patch（深蓝黄边）",
        type: "before"
      },
      {
        url: "images/sample/enrique-freeman-new.jpg",
        note: "版本2 - NBA logo patch",
        type: "after"
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
    category: "fake-patch",
    images: [
      {
        url: "images/sample/black-howard-old.jpg",
        note: "版本1 - 双白色patch",
        type: "before"
      },
      {
        url: "images/sample/black-howard-new.jpg",
        note: "版本2 - 左侧Nike logo + 右侧文字patch",
        type: "after"
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
    category: "fake-patch",
    source: "https://www.youtube.com/post/UgkxwOIh-vBifwJ7G9lnnuRMdvGwGyhYEzk6",
    images: [
      {
        url: "images/sample/kobe-2015-old.jpg",
        note: "版本1 - 纯黄色patch",
        type: "before"
      },
      {
        url: "images/sample/kobe-2015-new.jpg",
        note: "版本2 - BGS评级版 黄蓝双色patch",
        type: "after"
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
    category: "fake-patch",
    source: "https://www.youtube.com/post/UgkxwL2OkdDBPn2ftS0tUVwqd1VgaPHZ4kQO",
    images: [
      {
        url: "images/sample/franz-wagner-old.jpg",
        note: "版本1 - 编号patch（N3691）",
        type: "before"
      },
      {
        url: "images/sample/franz-wagner-new.jpg",
        note: "版本2 - BGS评级版 Nike logo patch",
        type: "after"
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
    category: "fake-patch",
    images: [
      {
        url: "images/sample/josh-giddey-old.jpg",
        note: "版本1 - 纯白色patch",
        type: "before"
      },
      {
        url: "images/sample/josh-giddey-new.jpg",
        note: "版本2 - Thunder队多色条纹patch（橙/黄/黑）",
        type: "after"
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
    category: "fake-patch",
    images: [
      {
        url: "images/sample/harrison-ingram-old.jpg",
        note: "版本1 - 白色条纹patch（带黑色边框）",
        type: "before"
      },
      {
        url: "images/sample/harrison-ingram-new.jpg",
        note: "版本2 - 大号S字母patch（黑底白S）",
        type: "after"
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
    category: "fake-patch",
    source: "https://www.youtube.com/watch?v=ZcxAHivA2y4",
    images: [
      {
        url: "images/sample/chris-paul-old.jpg",
        note: "版本1 - 纯白色patch",
        type: "before"
      },
      {
        url: "images/sample/chris-paul-new.jpg",
        note: "版本2 - BGS评级版 黑橙白三色patch",
        type: "after"
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
    category: "fake-patch",
    images: [
      {
        url: "images/sample/tyrese-haliburton-old.jpg",
        note: "版本1 - 浅粉白色patch",
        type: "before"
      },
      {
        url: "images/sample/tyrese-haliburton-new.jpg",
        note: "版本2 - 深蓝白双色patch",
        type: "after"
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
    category: "fake-patch",
    images: [
      {
        url: "images/sample/stephen-curry-07-old.jpg",
        note: "版本1 - 纯蓝色patch",
        type: "before"
      },
      {
        url: "images/sample/stephen-curry-07-new.jpg",
        note: "版本2 - 蓝黄双色斜纹patch",
        type: "after"
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
    category: "fake-patch",
    source: "https://www.youtube.com/post/Ugkxvs8qIDMeYaXuoQSTC4eQEkv0ppFXPnnL",
    images: [
      {
        url: "images/sample/stephen-curry-08-old.jpg",
        note: "版本1 - 蓝色主体+黄色角落双色patch",
        type: "before"
      },
      {
        url: "images/sample/stephen-curry-08-new.jpg",
        note: "版本2 - BGS评级版 蓝黄多条纹patch",
        type: "after"
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
    category: "fake-patch",
    images: [
      {
        url: "images/sample/porzingis-old.jpg",
        note: "版本1 - 蓝橙竖条纹patch",
        type: "before"
      },
      {
        url: "images/sample/porzingis-new.jpg",
        note: "版本2 - 蓝橙不规则色块patch",
        type: "after"
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
    category: "fake-patch",
    images: [
      {
        url: "images/sample/jalen-williams-old.jpg",
        note: "版本1 - 纯蓝色patch",
        type: "before"
      },
      {
        url: "images/sample/jalen-williams-new.jpg",
        note: "版本2 - 蓝白红三色patch",
        type: "after"
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
    category: "fake-patch",
    source: "https://www.youtube.com/post/UgkxU0eu7H5EzzFAUXFLPuJFnJHNO5hHpJH1",
    images: [
      {
        url: "images/sample/rockets-triple-old.jpg",
        note: "版本1 - 三人patch（姚明白蓝、麦迪浅蓝白、斯科拉白红）",
        type: "before"
      },
      {
        url: "images/sample/rockets-triple-new.jpg",
        note: "版本2 - PSA评级版 麦迪patch颜色明显不同",
        type: "after"
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
    category: "fake-patch",
    source: "https://www.youtube.com/post/UgkxT1fYfB-EzJZkgcvxOHI5LsGACmcsAcyW",
    images: [
      {
        url: "images/sample/curry-flawless-old.jpg",
        note: "版本1 - 纯黄色点状球衣patch",
        type: "before"
      },
      {
        url: "images/sample/curry-flawless-new.jpg",
        note: "版本2 - BGS9评级版 蓝金双色带WARRIORS字母patch",
        type: "after"
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
    category: "fake-patch",
    source: "https://m.weibo.cn/detail/5066278490343864",
    images: [
      {
        url: "images/sample/magic-johnson-comparison.jpg",
        note: "对比图 - 上方PSA版(黄白蓝patch) vs 下方BGS版(紫金A字母patch)",
        type: "compare"
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
    category: "fake-patch",
    source: "https://m.weibo.cn/detail/4795528413447382",
    images: [
      {
        url: "images/sample/edit_25_after_1775809378153_0.png",
        note: "",
        type: "after"
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
    category: "fake-patch",
    source: "https://m.weibo.cn/detail/4795528413447382",
    images: [
      {
        url: "images/sample/edit_26_after_1775809308846_0.png",
        note: "",
        type: "after"
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
    category: "fake-patch",
    images: [
      {
        url: "images/sample/shaq-comparison.jpg",
        note: "对比图 - 左侧现状(签字+patch) vs 右侧eBay早期记录(签字形态不同)",
        type: "compare"
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
    category: "fake-patch",
    images: [
      {
        url: "images/sample/malone-flawless-comparison.jpg",
        note: "对比图 - 左侧蓝红白patch vs 右侧紫金patch 签字落点位置也不同",
        type: "compare"
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
    category: "fake-patch",
    source: "https://m.weibo.cn/detail/4795528413447382",
    images: [
      {
        url: "images/sample/edit_29_after_1775809346572_0.png",
        note: "",
        type: "after"
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
    category: "fake-patch",
    source: "https://m.weibo.cn/detail/4795528413447382#&gid=1&pid=6",
    images: [
      {
        url: "images/sample/edit_30_after_1775809268797_0.png",
        note: "",
        type: "after"
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
    category: "fake-patch",
    highRiskReason: "未找到相同编号的换patch记录，此卡通过与同系列其他卡片patch对比判断疑似被换",
    images: [
      {
        url: "images/sample/malone-imm-series-comparison.jpg",
        note: "同系列对比 - 左侧三张实物patch质感颜色一致(透气孔染色劣等球衣) vs 右侧eBay同系列真品patch质感对比",
        type: "compare"
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
    category: "fake-patch",
    source: "https://www.youtube.com/post/UgkxqHKxhj_ZQpOu_qDiUyoeEZ5PIbMSAAZ7",
    images: [
      {
        url: "images/sample/kevin-garnett-old.jpg",
        note: "版本1 - 球衣标签patch（EVERY PLAYER EVERY GAME + 编号MT102464）",
        type: "before"
      },
      {
        url: "images/sample/kevin-garnett-new.jpg",
        note: "版本2 - PSA评级版 NBA Logoman patch（红白蓝NBA标志）",
        type: "after"
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
    category: "fake-patch",
    source: "微信好友15大佬反馈",
    images: [
      {
        url: "images/sample/derrick-rose-old.jpg",
        note: "版本1 - NBA Logoman patch（红白蓝NBA标志）",
        type: "before"
      },
      {
        url: "images/sample/derrick-rose-new.jpg",
        note: "版本2 - PSA评级版 公牛队logo patch（红色公牛头像）",
        type: "after"
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
    category: "fake-patch",
    source: "微信好友15大佬反馈",
    images: [
      {
        url: "images/sample/rose-extra-old.jpg",
        note: "版本1 - 红黑白竖条纹小patch",
        type: "before"
      },
      {
        url: "images/sample/rose-extra-new.jpg",
        note: "版本2 - 大号51号码patch（红白黑三色）",
        type: "after"
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
    category: "fake-patch",
    source: "微信好友15大佬反馈",
    images: [
      {
        url: "images/sample/garnett-silhouettes-old.jpg",
        note: "版本1 - 纯深蓝色球衣patch",
        type: "before"
      },
      {
        url: "images/sample/garnett-silhouettes-new.jpg",
        note: "版本2 - eBay标注ALTERED PATCH 森林狼狼头logo patch",
        type: "after"
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
    category: "fake-patch",
    source: "https://m.weibo.cn/detail/5036771676522400",
    images: [
      {
        url: "images/sample/durant-imm-old.jpg",
        note: "版本1 - 纯黄色点状球衣patch",
        type: "before"
      },
      {
        url: "images/sample/durant-imm-new.jpg",
        note: "版本2 - 闲鱼在售 黄色L字母patch",
        type: "after"
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
    category: "fake-patch",
    source: "https://m.weibo.cn/detail/5028804332357723",
    images: [
      {
        url: "images/sample/eddie-jones-old.jpg",
        note: "版本1 - 紫白双色球衣patch",
        type: "before"
      },
      {
        url: "images/sample/eddie-jones-new.jpg",
        note: "版本2 - 紫金LA字母patch",
        type: "after"
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
    category: "fake-patch",
    source: "https://m.weibo.cn/detail/5027348292310113",
    images: [
      {
        url: "images/sample/vince-carter-premium.jpg",
        note: "对比图 - 上图蓝白条纹patch vs 下图黑白蓝D字母patch",
        type: "compare"
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
    category: "fake-patch",
    source: "https://m.weibo.cn/detail/5026314056107241",
    images: [
      {
        url: "images/sample/gary-payton-old.jpg",
        note: "版本1 - 左右两块黄绿双色竖条纹patch",
        type: "before"
      },
      {
        url: "images/sample/gary-payton-new.jpg",
        note: "版本2 - 左右两块鲜艳黄绿斜条纹patch",
        type: "after"
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
    category: "fake-patch",
    source: "https://m.weibo.cn/detail/5026314056107241",
    images: [
      {
        url: "images/sample/malone-flawless-greats-old.jpg",
        note: "版本1 - 左紫色+右白紫横条纹patch",
        type: "before"
      },
      {
        url: "images/sample/malone-flawless-greats-new.jpg",
        note: "版本2 - 左紫白横条纹+右紫色patch",
        type: "after"
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
    category: "fake-patch",
    source: "https://m.weibo.cn/detail/5022777772081640",
    images: [
      {
        url: "images/sample/kawhi-leonard-comparison.jpg",
        note: "对比图 - 上图BGS8.5版黑白灰马刺logo patch vs 下图其他版本白灰patch",
        type: "compare"
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
    category: "fake-patch",
    source: "https://m.weibo.cn/detail/5006089910748177",
    images: [
      {
        url: "images/sample/drexler-flawless.jpg",
        note: "左图实物+右图放大 - 红白蓝条纹patch",
        type: "after"
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
    category: "fake-patch",
    source: "https://m.weibo.cn/detail/5006089910748177",
    images: [
      {
        url: "images/sample/stockton-flawless.jpg",
        note: "对比图 - 左图紫红多色patch vs 右图纯黄色patch",
        type: "compare"
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
    category: "fake-patch",
    source: "https://m.weibo.cn/detail/5006089910748177",
    images: [
      {
        url: "images/sample/david-robinson-flawless.jpg",
        note: "对比图 - 左图白L字母patch vs 右图纯黑色patch",
        type: "compare"
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
    category: "fake-patch",
    highRiskReason: "仅有正面照片无法100%确认，patch质感与同系列有差异但由于编号在卡片背面无法实锤",
    source: "https://m.weibo.cn/detail/5006089910748177",
    images: [
      {
        url: "images/sample/magic-spectra.jpg",
        note: "⚠️疑似换patch - 仅有正面照片无法100%确认，patch质感与同系列有差异但由于编号在卡片背面无法实锤",
        type: "after"
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
    category: "fake-patch",
    source: "https://m.weibo.cn/detail/4980307023367771",
    images: [
      {
        url: "images/sample/curry-2012-comparison.jpg",
        note: "对比图 - 左侧PSA评级版黄蓝斜条纹patch vs 右下角其他版本纯蓝色patch",
        type: "after"
      },
      {
        url: "images/sample/edit_46_before_1775808345147_1.png",
        note: "",
        type: "before"
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
    category: "fake-patch",
    source: "https://m.weibo.cn/detail/4980307023367771#&gid=1&pid=4",
    images: [
      {
        url: "images/sample/curry-2012-23.jpg",
        note: "对比图 - 左侧大号N字母多色patch vs 右下角其他版本黄蓝patch",
        type: "after"
      },
      {
        url: "images/sample/edit_47_before_1775808458726_2.png",
        note: "",
        type: "before"
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
    category: "fake-patch",
    source: "https://m.weibo.cn/detail/4980304860941726",
    images: [
      {
        url: "images/sample/haliburton-flawless-2.jpg",
        note: "版本1 - 白紫黑三色竖条纹patch",
        type: "before"
      },
      {
        url: "images/sample/haliburton-flawless-3.jpg",
        note: "版本2",
        type: "after"
      },
      {
        url: "images/sample/haliburton-flawless-1.jpg",
        note: "版本3 - 白紫双色横条纹patch",
        type: "after"
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
    category: "fake-patch",
    source: "https://m.weibo.cn/detail/4980284697349957",
    images: [
      {
        url: "images/sample/doncic-1.jpg",
        note: "版本1 - 灰白色patch",
        type: "before"
      },
      {
        url: "images/sample/doncic-2.jpg",
        note: "版本2 - BGS 7.5评级 蓝白灰色patch",
        type: "after"
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
    category: "fake-patch",
    source: "https://m.weibo.cn/detail/4924809279177512",
    images: [
      {
        url: "images/sample/haliburton-flawless-05-1.jpg",
        note: "版本1 - 中国红 白色带点点patch",
        type: "before"
      },
      {
        url: "images/sample/haliburton-flawless-05-2.jpg",
        note: "版本2 - 红板SPM 三色球衣切割patch",
        type: "after"
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
    category: "fake-patch",
    source: "https://m.weibo.cn/detail/4924809279177512",
    images: [
      {
        url: "images/sample/maxey-1.jpg",
        note: "版本1 - 纯蓝色patch",
        type: "before"
      },
      {
        url: "images/sample/maxey-2.jpg",
        note: "版本2 - 多色patch（白红蓝组合）",
        type: "after"
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
    category: "fake-patch",
    source: "https://m.weibo.cn/detail/4924809279177512",
    images: [
      {
        url: "images/sample/bridges-1.jpg",
        note: "版本1 - 纯橙色patch",
        type: "before"
      },
      {
        url: "images/sample/bridges-2.jpg",
        note: "版本2 - 蓝紫橙三色patch",
        type: "after"
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
    category: "fake-patch",
    source: "https://m.weibo.cn/detail/4906801453079306",
    images: [
      {
        url: "images/sample/kobe-flawless-03.jpg",
        note: "对比图 - Before: 黄黑双色patch vs After: 橙白灰三色patch",
        type: "compare"
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
    category: "fake-auto",
    images: [
      {
        url: "images/sample/wiggins-2.jpg",
        note: "粗体是假签字，是偷出来的板子，然后在上面签字的，卡是真的，所以也能过评级",
        type: "after"
      },
      {
        url: "images/sample/wiggins-1.jpg",
        note: "真签字的墨迹是细笔的",
        type: "before"
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
    category: "fake-patch",
    source: "https://m.weibo.cn/detail/4872408383884808",
    images: [
      {
        url: "images/sample/kawhi-1.jpg",
        note: "版本1 - 黑白横条纹patch",
        type: "before"
      },
      {
        url: "images/sample/kawhi-2.jpg",
        note: "版本2 - BGS 8.5评级 灰白横条纹patch",
        type: "after"
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
    category: "fake-patch",
    source: "https://m.weibo.cn/detail/4871586727068736",
    images: [
      {
        url: "images/sample/doncic-elegance-1.jpg",
        note: "版本1 - 纯蓝色patch",
        type: "before"
      },
      {
        url: "images/sample/doncic-elegance-2.jpg",
        note: "版本2 - 蓝白多色拼接patch",
        type: "after"
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
    category: "fake-patch",
    source: "https://m.weibo.cn/detail/4871255708141192",
    images: [
      {
        url: "images/sample/doncic-colossal-1.jpg",
        note: "版本1 - 白灰双色patch",
        type: "before"
      },
      {
        url: "images/sample/doncic-colossal-2.jpg",
        note: "版本2 - 蓝白双色拼接patch",
        type: "after"
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
    category: "fake-patch",
    source: "https://m.weibo.cn/detail/4835979083386910",
    images: [
      {
        url: "images/sample/cunningham-1.jpg",
        note: "版本1 - 纯红色patch",
        type: "before"
      },
      {
        url: "images/sample/cunningham-2.jpg",
        note: "版本2 - 红蓝双色拼接patch",
        type: "after"
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
    category: "fake-patch",
    source: "https://m.weibo.cn/detail/4834598167513336",
    images: [
      {
        url: "images/sample/kobe-ud-chronology.jpg",
        note: "对比图 - ORIGINAL RAW: 白黄双色36号patch vs SWAPPED BGS: 黄白多色拼接patch vs SWAPPED PSA: 黄白多色拼接patch",
        type: "after"
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
    category: "fake-patch",
    source: "https://m.weibo.cn/detail/4827834465916887",
    images: [
      {
        url: "images/sample/zion-legacy.jpg",
        note: "对比图 - 左侧：蓝绿多色拼接patch（正面） vs 右侧：卡背展示（同一张卡前后对比）",
        type: "after"
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
    category: "fake-patch",
    source: "https://m.weibo.cn/detail/4826297798494173",
    images: [
      {
        url: "images/sample/bird-2.jpg",
        note: "版本2 - 黄白绿三色拼接patch",
        type: "before"
      },
      {
        url: "images/sample/bird-1.jpg",
        note: "版本1 - 白绿双色patch",
        type: "after"
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
    category: "fake-patch",
    source: "https://m.weibo.cn/detail/4795983085706277",
    images: [
      {
        url: "images/sample/kobe-imm-04.jpg",
        note: "对比图 - 版本1: 黄白紫三色拼接patch vs 版本2: 蓝紫黄白多色拼接patch",
        type: "before"
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
    category: "fake-patch",
    source: "https://m.weibo.cn/detail/4795975288226656",
    images: [
      {
        url: "images/sample/kobe-imm-61.jpg",
        note: "对比图 - 版本1: 黄白紫三色拼接patch vs 版本2: 黄紫双色patch",
        type: "before"
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
    category: "fake-patch",
    source: "https://m.weibo.cn/detail/4795528413447382",
    images: [
      {
        url: "images/sample/lebron-exquisite-04.jpg",
        note: "对比图 - 版本1: 深色纯色patch vs 版本2: 红白骑士logo大patch",
        type: "before"
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
    category: "fake-patch",
    source: "https://m.weibo.cn/detail/4795528413447382",
    images: [
      {
        url: "images/sample/kobe-imm-30.jpg",
        note: "对比图 - 版本1: 纯紫色patch vs 版本2: 黄白蓝三色拼接patch",
        type: "before"
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
    category: "fake-patch",
    source: "https://m.weibo.cn/detail/4795528413447382",
    images: [
      {
        url: "images/sample/kobe-exquisite-14.jpg",
        note: "对比图 - 版本1: 黄紫双色拼接patch vs 版本2: 白黑双色拼接patch（含表情包）",
        type: "before"
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
    category: "fake-patch",
    source: "https://m.weibo.cn/detail/4795528413447382",
    images: [
      {
        url: "images/sample/nowitzki-flawless.jpg",
        note: "对比图 - 版本1: 纯黑色patch（标注fake card） vs 版本2: 白黑双色拼接patch",
        type: "before"
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
    category: "fake-patch",
    source: "https://m.weibo.cn/detail/4795528413447382",
    images: [
      {
        url: "images/sample/durant-imm-13.jpg",
        note: "对比图 - 版本1: 白红蓝三色拼接patch vs 版本2: 白蓝双色35号patch（含表情包）",
        type: "before"
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
    category: "fake-patch",
    source: "https://m.weibo.cn/detail/4795451745767012",
    images: [
      {
        url: "images/sample/durant-rookie-41.jpg",
        note: "对比图 - Before: 纯绿色patch vs After: BGS 9评级 黄绿黑三色拼接patch",
        type: "after"
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
    category: "fake-patch",
    source: "https://m.weibo.cn/detail/4795267972599285",
    images: [
      {
        url: "images/sample/jabbar-imm-17.jpg",
        note: "对比图 - 版本1: 纯黄色patch vs 版本2: 黄白紫三色拼接patch",
        type: "before"
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
    category: "fake-patch",
    source: "https://m.weibo.cn/detail/4795267972599285",
    images: [
      {
        url: "images/sample/mcgrady-exquisite-13.jpg",
        note: "对比图 - 版本1: 纯红色patch vs 版本2: PSA/DNA认证 红白火箭logo patch",
        type: "before"
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
    category: "fake-patch",
    source: "https://m.weibo.cn/detail/4795267972599285",
    images: [
      {
        url: "images/sample/wade-flawless-08.jpg",
        note: "对比图 - 版本1: 红黄黑三色横条纹patch vs 版本2: 白黑红三色拼接patch",
        type: "before"
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
    category: "fake-patch",
    source: "https://m.weibo.cn/detail/4795267972599285",
    images: [
      {
        url: "images/sample/curry-imm-14.jpg",
        note: "对比图 - 版本1: 纯蓝色patch vs 版本2: 黄蓝双色拼接patch",
        type: "before"
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
    number: "/100编",
    status: "confirmed",
    category: "fake-patch",
    source: "https://m.weibo.cn/detail/4795267972599285",
    images: [
      {
        url: "images/sample/kobe-exquisite-45.jpg",
        note: "对比图 - 版本1: 纯紫色patch vs 版本2: BGS 9.5评级 黄白紫三色拼接patch",
        type: "before"
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
    category: "fake-patch",
    source: "https://m.weibo.cn/detail/4795267972599285",
    images: [
      {
        url: "images/sample/mitchell-nt-06.jpg",
        note: "对比图 - 版本1: 黄蓝黑三色拼接patch vs 版本2: 白绿黄蓝多色拼接patch",
        type: "before"
      },
      {
        url: "images/sample/mitchell-nt-06-versions.jpg",
        note: "三版本时间线对比 - ORIGINAL(黄蓝黑) vs MAY 2019(白绿黄蓝) vs AUGUST 2020(黄黑) 同一张06/99编号卡在不同时期的patch变化",
        type: "after"
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
    category: "fake-patch",
    source: "https://m.weibo.cn/detail/4795267972599285",
    images: [
      {
        url: "images/sample/olajuwon-imm-04.jpg",
        note: "对比图 - 版本1: 白红蓝三色拼接patch（标注FAKE） vs 版本2: 红色带白点patch",
        type: "before"
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
    category: "fake-patch",
    source: "https://m.weibo.cn/detail/5027348292310113",
    images: [
      {
        url: "images/sample/carter-imm-10.jpg",
        note: "对比图 - 版本1: 蓝白双色横条纹patch vs 版本2: 蓝黑白三色拼接patch（含D字母）",
        type: "before"
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
    category: "fake-patch",
    source: "https://m.weibo.cn/detail/4795243305636003",
    images: [
      {
        url: "images/sample/durant-imm-25.jpg",
        note: "对比图 - 版本1: 蓝黄橙三色横条纹patch vs 版本2: 蓝白带点点patch",
        type: "before"
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
    category: "fake-patch",
    source: "https://m.weibo.cn/detail/4795243305636003",
    images: [
      {
        url: "images/sample/nowitzki-flawless-12.jpg",
        note: "对比图 - 版本1: 白蓝双色拼接patch vs 版本2: 纯灰色patch",
        type: "before"
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
    category: "fake-patch",
    source: "https://m.weibo.cn/detail/4795243305636003",
    images: [
      {
        url: "images/sample/davis-nt-013.jpg",
        note: "对比图 - 版本1: 蓝黄双色大块拼接patch vs 版本2: 黄蓝多色横条纹patch",
        type: "before"
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
    category: "fake-patch",
    source: "https://m.weibo.cn/detail/4795243305636003",
    images: [
      {
        url: "images/sample/davis-nt-019.jpg",
        note: "对比图 - 左侧版本1: 蓝黄双色patch vs 右侧版本2: 黄蓝多色横条纹patch（含patch特写对比）",
        type: "before"
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
    category: "fake-patch",
    images: [
      {
        url: "images/sample/davis-nt-071.jpg",
        note: "对比图 - 蓝黄双色patch vs 黄蓝橙多色横条纹patch（含patch特写对比）",
        type: "compare"
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
    category: "fake-patch",
    source: "https://m.weibo.cn/detail/4795243305636003",
    images: [
      {
        url: "images/sample/davis-nt-076.jpg",
        note: "对比图 - 蓝黄双色patch vs 黄蓝橙多色横条纹patch（含patch特写对比）",
        type: "after"
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
    category: "fake-patch",
    source: "https://m.weibo.cn/detail/4795243305636003",
    images: [
      {
        url: "images/sample/davis-nt-170.jpg",
        note: "对比图 - 蓝黄双色patch vs 黄蓝多色横条纹patch（含patch特写对比）",
        type: "after"
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
    category: "fake-patch",
    source: "https://m.weibo.cn/detail/4795243305636003",
    images: [
      {
        url: "images/sample/davis-nt-009.jpg",
        note: "对比图 - 蓝黄双色patch vs 纯蓝色patch（红圈标注新秀徽章位置差异）",
        type: "after"
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
    category: "fake-patch",
    source: "https://m.weibo.cn/detail/4795243305636003",
    images: [
      {
        url: "images/sample/wade-flawless-07.jpg",
        note: "对比图 - 版本1: 白黑蓝三色拼接patch vs 版本2: 白黑红三色拼接patch（含patch特写对比）",
        type: "before"
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
    category: "fake-patch",
    source: "https://m.weibo.cn/detail/4795243305636003",
    images: [
      {
        url: "images/sample/durant-imm-14-09.jpg",
        note: "对比图 - 版本1: 浅色patch vs 版本2: 深色多彩patch（同一张09/10编号卡前后对比）",
        type: "before"
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
    category: "fake-patch",
    source: "https://m.weibo.cn/detail/4795235769260829",
    images: [
      {
        url: "images/sample/mcgrady-exquisite-32.jpg",
        note: "对比图 - 版本1: 浅色patch vs 版本2: 红白黑三色拼接patch（含PSA封装对比）",
        type: "before"
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
    category: "fake-patch",
    source: "https://m.weibo.cn/detail/4795205843157402",
    images: [
      {
        url: "images/sample/olajuwon-flawless-02.jpg",
        note: "对比图 - 版本1: 三色拼接patch（黄白红蓝） vs 版本2: 三色拼接patch（红白蓝黄配色不同）",
        type: "before"
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
    category: "fake-patch",
    source: "https://m.weibo.cn/detail/4795203876290698",
    images: [
      {
        url: "images/sample/malone-immense-05.jpg",
        note: "对比图 - 版本1: 彩虹色多彩横条纹patch vs 版本2: 蓝绿色拼接patch（含淘宝拍卖截图）",
        type: "before"
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
    category: "fake-patch",
    source: "https://m.weibo.cn/detail/4795203876290698",
    images: [
      {
        url: "images/sample/allen-flawless-24.jpg",
        note: "对比图 - 版本1: 红白色拼接patch vs 版本2: 深红色纯色patch（含淘宝拍卖截图）",
        type: "before"
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
    category: "fake-patch",
    source: "https://m.weibo.cn/detail/4795203876290698",
    images: [
      {
        url: "images/sample/olajuwon-flawless-05.jpg",
        note: "对比图 - 版本1: 红白蓝三色拼接patch vs 版本2: 红白蓝灰多色拼接patch（含淘宝拍卖截图）",
        type: "before"
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
    category: "fake-patch",
    source: "https://m.weibo.cn/detail/4795203876290698",
    images: [
      {
        url: "images/sample/allen-nt-15.jpg",
        note: "对比图 - 版本1: 黄绿色拼接patch vs 版本2: 深绿白色拼接patch",
        type: "before"
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
    category: "fake-patch",
    source: "https://www.ozcardtrader.com.au/threads/official-real-fake-card-thread.174483/",
    images: [
      {
        url: "images/sample/gordon-ultimate-60-2.jpg",
        note: "版本2 - 黑红拼接公牛logo patch",
        type: "before"
      },
      {
        url: "images/sample/gordon-ultimate-60-1.jpg",
        note: "版本1 - 纯红色公牛logo patch",
        type: "after"
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
    category: "fake-patch",
    source: "https://www.ozcardtrader.com.au/threads/official-real-fake-card-thread.174483/",
    images: [
      {
        url: "images/sample/jordan-sp-041-2.jpg",
        note: "版本2 - 黑红拼接公牛logo patch",
        type: "before"
      },
      {
        url: "images/sample/jordan-sp-041-1.jpg",
        note: "版本1 - 纯红色公牛logo patch",
        type: "after"
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
    category: "fake-patch",
    source: "https://www.ozcardtrader.com.au/threads/official-real-fake-card-thread.174483/",
    images: [
      {
        url: "images/sample/simien-trilogy-05-2.jpg",
        note: "版本2 - 纯白色patch",
        type: "before"
      },
      {
        url: "images/sample/simien-trilogy-05-1.jpg",
        note: "版本1 - 黑红白三色拼接patch",
        type: "after"
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
    category: "fake-patch",
    source: "https://www.ozcardtrader.com.au/threads/official-real-fake-card-thread.174483/",
    images: [
      {
        url: "images/sample/iguodala-ultimate-09-2.jpg",
        note: "版本2 - 纯黑色patch",
        type: "before"
      },
      {
        url: "images/sample/iguodala-ultimate-09-1.jpg",
        note: "版本1 - 白红蓝三色拼接patch",
        type: "after"
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
    category: "fake-patch",
    source: "https://www.ozcardtrader.com.au/threads/official-real-fake-card-thread.174483/",
    images: [
      {
        url: "images/sample/paul-exquisite-42-2.jpg",
        note: "版本2 - 黄蓝横条纹拼接patch",
        type: "before"
      },
      {
        url: "images/sample/paul-exquisite-42-1.jpg",
        note: "版本1 - 蓝紫黄多色拼接patch",
        type: "after"
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
    category: "fake-patch",
    source: "https://www.ozcardtrader.com.au/threads/official-real-fake-card-thread.174483/",
    images: [
      {
        url: "images/sample/lebron-nt-gear-10-2.jpg",
        note: "版本2 - 左:纯白色patch + 右:黑白拼接patch",
        type: "before"
      },
      {
        url: "images/sample/lebron-nt-gear-10-1.jpg",
        note: "版本1 - 左:黑橙红三色拼接patch + 右:白色带48号码patch",
        type: "after"
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
    category: "fake-patch",
    source: "https://www.ozcardtrader.com.au/threads/official-real-fake-card-thread.174483/",
    images: [
      {
        url: "images/sample/lebron-nt-gear-13-2.jpg",
        note: "版本2 - 左:纯白色patch + 右:纯黑色patch（含成交记录截图）",
        type: "before"
      },
      {
        url: "images/sample/lebron-nt-gear-13-1.jpg",
        note: "版本1 - 左:蓝NBA logo patch + 右:黑橙红三色拼接patch（含eBay拍卖截图）",
        type: "after"
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
    category: "fake-patch",
    source: "https://www.ozcardtrader.com.au/threads/official-real-fake-card-thread.174483/",
    images: [
      {
        url: "images/sample/lebron-exquisite-rpa-2.jpg",
        note: "版本2 - 纯白色patch（不同图案纹理）",
        type: "before"
      },
      {
        url: "images/sample/lebron-exquisite-rpa-1.jpg",
        note: "版本1 - 纯白色patch",
        type: "after"
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
    category: "fake-patch",
    source: "https://www.ozcardtrader.com.au/threads/official-real-fake-card-thread.174483/",
    images: [
      {
        url: "images/sample/mourning-exquisite-22-2.jpg",
        note: "版本2 - 橙白红横条纹拼接patch",
        type: "before"
      },
      {
        url: "images/sample/mourning-exquisite-22-1.jpg",
        note: "版本1 - 红黑拼接patch",
        type: "after"
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
    category: "fake-patch",
    source: "https://www.ozcardtrader.com.au/threads/official-real-fake-card-thread.174483/",
    images: [
      {
        url: "images/sample/durant-exquisite-97.jpg",
        note: "对比图 - 左:绿白黄三色拼接patch vs 右:黄绿色拼接patch（含eBay拍卖截图）",
        type: "after"
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
    category: "fake-patch",
    source: "https://www.ozcardtrader.com.au/threads/official-real-fake-card-thread.174483/",
    images: [
      {
        url: "images/sample/durant-imm-04.jpg",
        note: "对比图 - 左:蓝橙色拼接patch vs 右:橙蓝色拼接patch（含eBay拍卖截图）",
        type: "after"
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
    category: "fake-patch",
    source: "https://www.ozcardtrader.com.au/threads/official-real-fake-card-thread.174483/",
    images: [
      {
        url: "images/sample/hill-imm-12.jpg",
        note: "对比图 - 左:纯红色patch vs 右:红白橙三色横条纹patch（含eBay拍卖截图）",
        type: "after"
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
    category: "fake-patch",
    source: "https://www.ozcardtrader.com.au/threads/official-real-fake-card-thread.174483/",
    images: [
      {
        url: "images/sample/lebron-iverson-exquisite-04.jpg",
        note: "对比图 - 左:三人六色patch（含logo） vs 右:三人纯色patch（含eBay拍卖截图）",
        type: "after"
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
    category: "fake-patch",
    source: "https://www.ozcardtrader.com.au/threads/official-real-fake-card-thread.174483/",
    images: [
      {
        url: "images/sample/kobe-flawless-07.jpg",
        note: "对比图 - 左:纯白色patch vs 右:紫黄拼接patch（含eBay拍卖截图及PSA封装对比）",
        type: "after"
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
    category: "fake-patch",
    source: "https://www.ozcardtrader.com.au/threads/official-real-fake-card-thread.174483/",
    images: [
      {
        url: "images/sample/kobe-magic-sp-08.jpg",
        note: "对比图 - 左:双人四色patch（紫黄色湖人配色） vs 右:双人纯色patch（含eBay拍卖截图）",
        type: "after"
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
    category: "fake-patch",
    source: "https://m.weibo.cn/detail/4811905343163162",
    images: [
      {
        url: "images/sample/lebron-exquisite-88.jpg",
        note: "对比图 - 左:红白双色logo patch vs 右:纯白色patch（含PSA封装及eBay拍卖截图）",
        type: "after"
      },
      {
        url: "images/sample/edit_110_after_1775809064290_1.png",
        note: "",
        type: "after"
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
    category: "fake-patch",
    source: "https://www.ozcardtrader.com.au/threads/official-real-fake-card-thread.174483/",
    images: [
      {
        url: "images/sample/lebron-flawless-16.jpg",
        note: "对比图 - 左:红黑白三色拼接jumbo patch vs 右:纯白色patch（含PSA 10封装及eBay拍卖截图）",
        type: "after"
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
    category: "fake-patch",
    source: "https://www.ozcardtrader.com.au/threads/official-real-fake-card-thread.174483/",
    images: [
      {
        url: "images/sample/malone-flawless-11.jpg",
        note: "对比图 - 左:蓝紫红三色拼接patch vs 右:蓝紫色拼接patch（含eBay拍卖截图）",
        type: "after"
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
    category: "fake-patch",
    source: "https://www.ozcardtrader.com.au/threads/official-real-fake-card-thread.174483/",
    images: [
      {
        url: "images/sample/parker-flawless-21.jpg",
        note: "对比图 - 左:灰黑蓝三色拼接patch vs 右:纯黑色patch（含亚马逊及eBay拍卖截图）",
        type: "after"
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
    category: "fake-patch",
    source: "https://www.ozcardtrader.com.au/threads/official-real-fake-card-thread.174483/",
    images: [
      {
        url: "images/sample/payton-imm-10.jpg",
        note: "对比图 - 左:白黄绿三色拼接patch vs 右:黄绿橙三色拼接patch（含eBay拍卖截图）",
        type: "after"
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
    category: "fake-patch",
    source: "https://www.youtube.com/watch?v=Qf-KtnZHiqI",
    images: [
      {
        url: "images/sample/nowitzki-crown-12-2.jpg",
        note: "版本2 - 蓝白拼接小logo patch",
        type: "before"
      },
      {
        url: "images/sample/nowitzki-crown-12-1.jpg",
        note: "版本1 - 白黑蓝灰四色拼接大logo patch（含PSA 10封装）",
        type: "after"
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
    category: "fake-patch",
    images: [
      {
        url: "images/sample/wiggins-middleton-imm-09.jpg",
        note: "对比图 - 左:真球衣patch vs 右:假patch覆盖真球衣（标注\"Fake Patch over Real Jersey\"）双人四patch卡",
        type: "compare"
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
    category: "fake-patch",
    source: "https://www.youtube.com/post/UgkxnwQgjhqPkj7Yf5TqoUNceta1TZ-nnu6z",
    images: [
      {
        url: "images/sample/cunningham-imm-14-2.jpg",
        note: "版本2 - 纯红色patch",
        type: "before"
      },
      {
        url: "images/sample/cunningham-imm-14-1.jpg",
        note: "版本1 - 蓝红拼接patch（活塞队配色）",
        type: "after"
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
    category: "fake-patch",
    source: "https://www.youtube.com/watch?v=Xw2yKciVBI0&t=2s",
    images: [
      {
        url: "images/sample/russell-nt-03.jpg",
        note: "对比图 - 左:纯紫色大尺寸patch vs 右:紫黄白多色拼接大尺寸patch（含BGS封装）",
        type: "compare"
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
    category: "fake-patch",
    source: "https://www.youtube.com/watch?v=ZcxAHivA2y4",
    images: [
      {
        url: "images/sample/fox-noir-96.jpg",
        note: "对比图 - 左:紫色大尺寸patch vs 右:白色网格点状patch（标注\"15/49\"）",
        type: "compare"
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
    category: "fake-patch",
    source: "https://www.youtube.com/watch?v=Xw2yKciVBI0&t=2s",
    images: [
      {
        url: "images/sample/kobe-anthology-02.jpg",
        note: "对比图 - 左:纯紫色patch vs 右:紫黄白三色拼接patch（含BGS 8.5封装，标注\"是换的patch\"）",
        type: "compare"
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
    category: "fake-patch",
    source: "https://www.youtube.com/watch?v=Xw2yKciVBI0&t=2s",
    images: [
      {
        url: "images/sample/irving-nt-01.jpg",
        note: "对比图 - 左:纯白色patch vs 右:黄红蓝多色拼接patch（含中文标注\"这张欧文1杠25的卡呢 卖掉了\"）",
        type: "compare"
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
    category: "fake-patch",
    source: "https://www.youtube.com/watch?v=Xw2yKciVBI0&t=2s",
    images: [
      {
        url: "images/sample/kobe-limited-01.jpg",
        note: "对比图 - 左:紫色大尺寸patch（标注01/10） vs 右:白紫拼接大尺寸patch（含GBTC BGS封装，中文标注\"那科比这张1杠十的卡呢\"）",
        type: "compare"
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
    category: "fake-patch",
    images: [
      {
        url: "images/sample/curry-noir-01.jpg",
        note: "对比图 - 左:白蓝拼接大尺寸patch vs 右:白蓝黄三色拼接大尺寸patch（含GBTC BGS封装，中文标注\"那库里这张1杠三的卡呢\"）",
        type: "compare"
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
    category: "fake-patch",
    source: "https://www.youtube.com/watch?v=Xw2yKciVBI0&t=2s",
    images: [
      {
        url: "images/sample/kobe-ultimate-47.jpg",
        note: "对比图 - 左:纯白色patch vs 右:黄紫拼接patch（含GBTC BGS封装，中文标注\"还有这张科比的47杠100的卡呢\"）",
        type: "compare"
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
    category: "fake-patch",
    source: "https://www.youtube.com/watch?v=Xw2yKciVBI0&t=2s",
    images: [
      {
        url: "images/sample/curry-noir-15.jpg",
        note: "对比图 - 左:纯白色大尺寸patch vs 右:黄蓝拼接大尺寸patch（含GBTC BGS封装，中文标注\"那还有这张库里的15跟25的卡呢\"）",
        type: "compare"
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
    category: "fake-patch",
    source: "https://www.youtube.com/watch?v=Xw2yKciVBI0&t=2s",
    images: [
      {
        url: "images/sample/kobe-nt-prime-09.jpg",
        note: "对比图 - 左:纯白色大尺寸patch vs 右:紫黄白三色拼接大尺寸patch（含GBTC BGS封装，中文标注\"9杠25那也被换了patch\"）",
        type: "compare"
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
    category: "fake-patch",
    source: "https://www.youtube.com/watch?v=Xw2yKciVBI0&t=2s",
    images: [
      {
        url: "images/sample/kobe-threads-07.jpg",
        note: "对比图 - 左:白黄拼接大尺寸patch vs 右:黄紫白三色拼接大尺寸patch（含GBTC BGS封装，中文标注\"还有这张科比的七杠七的卡呢\"）",
        type: "compare"
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
    category: "fake-patch",
    images: [
      {
        url: "images/sample/curry-imm-16.jpg",
        note: "对比图 - 左:蓝黄拼接大尺寸patch（含BGS 9评级） vs 右:纯黑色大尺寸patch（含GBTC BGS封装，中文标注\"我们刚介绍过是这张，这是这张卡\"）",
        type: "compare"
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
    category: "fake-patch",
    source: "https://www.youtube.com/watch?v=c3kmHKed254",
    images: [
      {
        url: "images/sample/cunningham-nt-06-2.jpg",
        note: "版本2 - 纯白色大尺寸patch（中文标注\"那你要如何防止这个换PATCH的\"）",
        type: "before"
      },
      {
        url: "images/sample/cunningham-nt-06-1.jpg",
        note: "版本1 - 红蓝白多色拼接大尺寸patch（中文标注\"所以它价值就大打折扣了\"）",
        type: "after"
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
    category: "fake-patch",
    source: "https://www.youtube.com/watch?v=do8V9FOIctY",
    images: [
      {
        url: "images/sample/williams-flawless-01-1.jpg",
        note: "版本1 - 白紫白竖条纹字母patch（中文标注\"这在卡淘截标的扎伊尔\"）",
        type: "before"
      },
      {
        url: "images/sample/williams-flawless-01-2.jpg",
        note: "版本对比 - 左:白灰黑横条纹patch vs 右:白紫白竖条纹字母patch（中文标注\"那我个人觉得这两个签字是一模一样的\"）",
        type: "compare"
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
    category: "fake-patch",
    source: "https://www.youtube.com/watch?v=Qf-KtnZHiqI",
    images: [
      {
        url: "images/sample/laravia-flawless-02-1.jpg",
        note: "版本1 - 白蓝黑条纹patch（含PSA评级标签，中文标注\"那这张PSA评过级的flawless的新秀卡呢\"）",
        type: "before"
      },
      {
        url: "images/sample/laravia-flawless-02-2.jpg",
        note: "版本对比 - 左:深蓝白字母拼接patch（无铭文） vs 右:白蓝黑条纹patch（签名带假铭文\"#3Nicky\"）⚠️ 注意：此卡同时存在换patch和假铭文两个问题",
        type: "compare"
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
    category: "fake-patch",
    source: "https://www.youtube.com/watch?v=ZcxAHivA2y4",
    images: [
      {
        url: "images/sample/carter-imm-13.jpg",
        note: "对比图 - 左:白色网格状球衣patch（签名带铭文\"15\"） vs 右:橙色大尺寸patch（签名带铭文\"15\"）",
        type: "compare"
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
    category: "fake-patch",
    source: "https://www.youtube.com/watch?v=ZcxAHivA2y4",
    images: [
      {
        url: "images/sample/reed-imm-29.jpg",
        note: "对比图 - 左:白红蓝三色拼接patch vs 右:纯蓝色大尺寸patch",
        type: "compare"
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
    category: "fake-patch",
    source: "https://www.youtube.com/watch?v=ZcxAHivA2y4",
    images: [
      {
        url: "images/sample/maxey-impeccable-15.jpg",
        note: "对比图 - 左:纯蓝色大尺寸patch vs 右:白红蓝三色拼接patch",
        type: "compare"
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
    category: "fake-patch",
    source: "https://www.youtube.com/watch?v=ZcxAHivA2y4",
    images: [
      {
        url: "images/sample/barnes-noir-66.jpg",
        note: "对比图 - 左:纯红色大尺寸patch vs 右:红黑白三色拼接patch",
        type: "compare"
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
    category: "fake-patch",
    source: "https://www.youtube.com/watch?v=ZcxAHivA2y4",
    images: [
      {
        url: "images/sample/maxey-imm-46.jpg",
        note: "对比图 - 左:纯蓝色大尺寸patch vs 右:白红蓝三色拼接patch（含黑色边框）",
        type: "compare"
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
    category: "fake-patch",
    source: "https://www.youtube.com/watch?v=ZcxAHivA2y4",
    images: [
      {
        url: "images/sample/jokic-flawless-22.jpg",
        note: "对比图 - 左:红黑白三色拼接patch vs 右:白色网格点状patch",
        type: "compare"
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
    category: "fake-patch",
    source: "https://www.youtube.com/watch?v=ZcxAHivA2y4",
    images: [
      {
        url: "images/sample/haliburton-impeccable-73.jpg",
        note: "对比图 - 左:纯紫色大尺寸patch（Elegance 17/35） vs 右:紫白拼接patch（Impeccable 73/99）",
        type: "compare"
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
    category: "fake-patch",
    source: "https://www.youtube.com/watch?v=ZcxAHivA2y4",
    images: [
      {
        url: "images/sample/haliburton-imm-60.jpg",
        note: "对比图 - 左:浅紫白拼接patch（标注60/99） vs 右:深紫色大尺寸patch（Immaculate 99编）",
        type: "compare"
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
    category: "fake-patch",
    source: "https://www.youtube.com/watch?v=ZcxAHivA2y4",
    images: [
      {
        url: "images/sample/haliburton-flawless-02.jpg",
        note: "对比图 - 左:白色网格点状patch（步行者队配色，02/15） vs 右:白紫拼接patch（32/35）",
        type: "compare"
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
    category: "fake-patch",
    source: "https://www.youtube.com/watch?v=ZcxAHivA2y4",
    images: [
      {
        url: "images/sample/sga-noir-16.jpg",
        note: "对比图 - 左:白色网格点状patch（16/99） vs 右:白蓝拼接patch（16/99）",
        type: "compare"
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
    category: "fake-patch",
    source: "https://www.youtube.com/watch?v=ZcxAHivA2y4",
    images: [
      {
        url: "images/sample/markkanen-flawless-12.jpg",
        note: "对比图 - 左:纯红色大尺寸patch（12/25） vs 右:红白黑三色拼接patch（12/25）",
        type: "compare"
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
    category: "fake-patch",
    images: [
      {
        url: "images/sample/durant-nt-11-1.jpg",
        note: "版本1 - 红橙黑三色拼接patch（中文标注\"三色球衣切割 暴力切割 雷霆\"）",
        type: "before"
      },
      {
        url: "images/sample/durant-nt-11-2.jpg",
        note: "版本对比 - 左:红橙黑三色拼接patch vs 右:浅灰白色球衣patch（11/25）",
        type: "compare"
      },
      {
        url: "images/sample/durant-nt-11-3.jpg",
        note: "多版本交易记录 - 显示同一编号11/25卡片的多个交易记录，价格从¥1,950到¥3,688.88不等，证实该卡被曝光换patch后又换回，但无法保证是原装球衣，且封装可能是假的",
        type: "after"
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
    category: "fake-patch",
    images: [
      {
        url: "images/sample/durant-nt-26.jpg",
        note: "对比图 - 上:深蓝黄橙三色拼接patch（26/35） vs 下:纯蓝色大尺寸patch（26/35，中文标注\"衣物料 特\"）",
        type: "compare"
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
    category: "fake-patch",
    images: [
      {
        url: "images/sample/durant-nt-13.jpg",
        note: "对比图 - 左:红橙深蓝三色拼接patch（13/25） vs 右:纯蓝色大尺寸patch（13/25，中文标注\"一比什么\"）",
        type: "compare"
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
    category: "fake-patch",
    images: [
      {
        url: "images/sample/haliburton-flawless-06.jpg",
        note: "对比图 - 上:白黑紫三色拼接patch（06/25） vs 下:纯紫色大尺寸patch（中文标注\"球衣切割 低编 原封砖 步行者核心 新秀年 投资必备\"）",
        type: "compare"
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
    category: "fake-patch",
    images: [
      {
        url: "images/sample/haliburton-flawless-08.jpg",
        note: "对比图 - 上:蓝黑白三色拼接patch（08/15） vs 下:纯白色大尺寸patch（中文标注\"单色patch BGS8.5墨迹10 不累计 老夫子\"）",
        type: "compare"
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
    category: "fake-patch",
    images: [
      {
        url: "images/sample/haliburton-noir-28.jpg",
        note: "对比图 - 上:白紫拼接patch（28/99） vs 下:纯紫色大尺寸patch（中文标注\"超暴力球衣物料切割 卡签签字\"）",
        type: "compare"
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
    category: "fake-patch",
    images: [
      {
        url: "images/sample/howard-nt-01-2.jpg",
        note: "版本2 - 浅灰黑条纹拼接patch（1/1编，中文标注\"1of1 biography PATCH 四色切割\"）",
        type: "after"
      },
      {
        url: "images/sample/howard-nt-01-1.jpg",
        note: "版本1 - 黄白红三色拼接patch（1/1编，中文标注\"魔术巅峰时期 德怀特霍华德 tag logoman切割 原封顶级好卡 One of One 仅一张\"）",
        type: "before"
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
    category: "fake-patch",
    source: "https://www.youtube.com/watch?v=MQT22B2HhH8",
    images: [
      {
        url: "images/sample/curry-nt-07.jpg",
        note: "对比图 - 左:蓝黄红白多色拼接双patch（7/49，含GBTC封装正反面） vs 右:深蓝白黑三色拼接双patch（正反面展示Warriors Guard字样）",
        type: "compare"
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
    category: "fake-patch",
    source: "https://www.youtube.com/watch?v=MQT22B2HhH8",
    images: [
      {
        url: "images/sample/kobe-premier-34.jpg",
        note: "对比图 - 左:蓝黄白三色拼接三格patch（34/50） vs 右:紫黄白三色拼接三格patch（34/50，Rare Remnants版）",
        type: "compare"
      },
      {
        url: "images/sample/kobe-premier-50.jpg",
        note: "拍卖图 - 湖人队紫黄白三色拼接三窗口Game Patch球衣切割卡（标注为50编，实际为34/50）",
        type: "after"
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
    category: "fake-patch",
    source: "https://www.youtube.com/watch?v=XrMkbhe4r6Y",
    images: [
      {
        url: "images/sample/lebron-imm-01.jpg",
        note: "对比图 - 左:黑色adidas logo patch（含GBTC封装，中文标注\"2281想卖39000\"） vs 右:红黑黄三色patch（右侧交易详情显示2281元成交）",
        type: "compare"
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
    category: "fake-patch",
    highRiskReason: "与同系列10编出现不同patch的版本",
    images: [
      {
        url: "images/sample/curry-nt-10-2.jpg",
        note: "版本1 - 黄蓝拼接大尺寸patch（同款对比）",
        type: "before"
      },
      {
        url: "images/sample/curry-nt-10-1.jpg",
        note: "版本2 - 蓝白S字母拼接patch⚠️ 注意：同系列同编号10编出现不同patch版本，标注为高危",
        type: "after"
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
    category: "fake-patch",
    highRiskReason: "来自球星卡TV的视频，为同一换patch团伙送评的卡片",
    source: "https://www.youtube.com/watch?v=XrMkbhe4r6Y",
    images: [
      {
        url: "images/sample/lebron-imm-15-2.jpg",
        note: "对比证据 - 同系列其他编号对比：左为25编（纯黑色patch），右为25编（紫色patch），同系列不同编号patch差异明显异常",
        type: "before"
      },
      {
        url: "images/sample/lebron-imm-15-1.jpg",
        note: "疑似卡片 - 紫黄白三色拼接大尺寸patch（含GBTC封装正反面，15/25编）⚠️ 高危警示：根据同系列对比，此卡patch与其他编号差异过大，换patch概率很高，请谨慎购买",
        type: "compare"
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
    category: "fake-patch",
    highRiskReason: "来自球星卡TV的视频，为同一换patch团伙送评的卡片",
    source: "https://www.youtube.com/watch?v=XrMkbhe4r6Y",
    images: [
      {
        url: "images/sample/lebron-flawless-14-2.jpg",
        note: "对比证据 - 同系列其他编号对比：左为05/20编（黄白紫三色拼接双格patch），右为另一版本（纯紫色单格patch含PSA封装），同系列patch样式存在明显异常",
        type: "before"
      },
      {
        url: "images/sample/lebron-flawless-14-1.jpg",
        note: "疑似卡片 - 紫黄白三色拼接双格patch（含GBTC封装正反面，14/20编）⚠️ 高危警示：根据同系列对比，此卡patch样式与其他编号差异明显，换patch概率很高，请谨慎购买",
        type: "compare"
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
    category: "fake-patch",
    source: "https://www.youtube.com/watch?v=hry80D1N2C0",
    images: [
      {
        url: "images/sample/curry-opulence-3-2.jpg",
        note: "原始卡片 - 蓝白两色拼接单块patch（含签名，3/10编）",
        type: "before"
      },
      {
        url: "images/sample/curry-opulence-3-1.jpg",
        note: "换patch后 - 蓝黄三色拼接大尺寸三杠patch（含签名，3/10编）🚫 同一编号出现完全不同的patch样式，确认为换patch",
        type: "after"
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
    category: "fake-patch",
    source: "https://www.youtube.com/watch?v=hry80D1N2C0",
    images: [
      {
        url: "images/sample/curry-opulence-8.jpg",
        note: "版本1 - 蓝黄白三色拼接大尺寸三杠patch带勇士队Logo（含签名，08/10编）",
        type: "before"
      },
      {
        url: "images/sample/curry-opulence-8-new1.jpg",
        note: "版本2 - 黄蓝三色拼接大尺寸patch带勇士队Logo（含签名，08/10编）",
        type: "after"
      },
      {
        url: "images/sample/curry-opulence-8-new2.jpg",
        note: "多编号对比 - 该系列至少5个不同编号(1/10、2/10、7/10、8/10，以及之前的3/10)出现不同patch样式🚫 系统性换patch证据确凿，确认为换patch",
        type: "compare"
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
    category: "fake-patch",
    source: "https://www.youtube.com/watch?v=KC3qq0q6yGc",
    images: [
      {
        url: "images/sample/ivey-noir-2.jpg",
        note: "同编号对比 - 左：纯红色单块patch（含签名），右：红白两色拼接patch（含签名）🚫 同一编号（02/99）出现完全不同的patch样式，确认为换patch",
        type: "compare"
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
    category: "fake-patch",
    source: "https://www.youtube.com/watch?v=KC3qq0q6yGc",
    images: [
      {
        url: "images/sample/cunningham-noir-94.jpg",
        note: "同编号对比 - 左：纯红色单块patch（含签名），右：红白蓝三色拼接patch（含签名）🚫 同一编号（94/99）出现完全不同的patch样式，确认为换patch",
        type: "compare"
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
    category: "fake-patch",
    source: "https://www.youtube.com/watch?v=KC3qq0q6yGc",
    images: [
      {
        url: "images/sample/barnes-noir-81.jpg",
        note: "同编号对比 - 左：纯红色单块patch（含签名），右：红白两色拼接patch（含签名）🚫 同一编号（81/99）出现完全不同的patch样式，确认为换patch",
        type: "compare"
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
    category: "fake-patch",
    source: "https://www.youtube.com/watch?v=KC3qq0q6yGc",
    images: [
      {
        url: "images/sample/johnson-noir-72.jpg",
        note: "同编号对比 - 上：纯红色单块patch（含签名），下：白红黄三色拼接patch（含签名）🚫 同一编号（72/99）出现完全不同的patch样式，确认为换patch",
        type: "compare"
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
    category: "fake-patch",
    source: "https://www.youtube.com/watch?v=KC3qq0q6yGc",
    images: [
      {
        url: "images/sample/mathurin-elegance-99.jpg",
        note: "同编号对比 - 左：深蓝色单块patch（含签名），右：深蓝色和米色拼接patch（含签名）🚫 同一编号（99/99）出现完全不同的patch样式，确认为换patch",
        type: "compare"
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
    category: "fake-patch",
    source: "https://www.youtube.com/watch?v=KC3qq0q6yGc",
    images: [
      {
        url: "images/sample/mathurin-one-21.jpg",
        note: "同系列对比 - 上：黄黑两色拼接patch（含签名，21/99编），下：白蓝两色拼接patch（含签名）🚫 同系列不同编号patch样式差异巨大，确认存在换patch",
        type: "compare"
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
    category: "fake-patch",
    source: "https://www.youtube.com/watch?v=KC3qq0q6yGc",
    images: [
      {
        url: "images/sample/williams-noir-70.jpg",
        note: "同编号对比 - 上：蓝黄红三色拼接patch（含签名），下：纯蓝色单块patch（含签名）🚫 同一编号（70/99）出现完全不同的patch样式，确认为换patch",
        type: "compare"
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
    category: "fake-patch",
    source: "https://www.youtube.com/watch?v=KC3qq0q6yGc",
    images: [
      {
        url: "images/sample/castle-noir-10.jpg",
        note: "同编号对比 - 左：白黑两色拼接patch，右：纯白色单块patch 🚫 同一编号（10/25）出现完全不同的patch样式，确认为换patch",
        type: "compare"
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
    category: "fake-patch",
    source: "https://www.youtube.com/watch?v=KC3qq0q6yGc",
    images: [
      {
        url: "images/sample/podziemski-elegance-2.jpg",
        note: "同编号对比 - 左：白蓝两色拼接patch（含签名），右：纯蓝色单块patch（含签名）🚫 同一编号（02/25）出现完全不同的patch样式，确认为换patch",
        type: "compare"
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
    category: "fake-patch",
    source: "https://www.youtube.com/watch?v=KC3qq0q6yGc",
    images: [
      {
        url: "images/sample/george-noir-75.jpg",
        note: "同编号对比 - 左：白红蓝三色拼接patch（含签名），右：纯蓝色单块patch（含签名）🚫 同一编号（75/99）出现完全不同的patch样式，确认为换patch",
        type: "compare"
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
    category: "fake-patch",
    source: "https://www.youtube.com/watch?v=KC3qq0q6yGc",
    images: [
      {
        url: "images/sample/missi-nt-8.jpg",
        note: "同编号对比 - 左：深蓝白金三色拼接patch（含签名），右：纯深蓝色单块patch（含签名）🚫 同一编号（08/49）出现完全不同的patch样式，确认为换patch",
        type: "compare"
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
    category: "fake-patch",
    source: "https://www.youtube.com/watch?v=KC3qq0q6yGc",
    images: [
      {
        url: "images/sample/turner-grand-2.jpg",
        note: "同编号对比 - 左：四块patch（深蓝、黑、黄色拼接，含签名），右：四块patch（全为白色和深蓝色，含签名）🚫 同一编号（02/49）出现完全不同的patch样式，确认为换patch",
        type: "compare"
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
    category: "fake-patch",
    source: "https://www.youtube.com/watch?v=KC3qq0q6yGc",
    images: [
      {
        url: "images/sample/pickett-nt-31.jpg",
        note: "同编号对比 - 左：深蓝白黄三色拼接大尺寸patch（含签名），右：纯深蓝色单块patch（含签名）🚫 同一编号（31/49）出现完全不同的patch样式，确认为换patch",
        type: "compare"
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
    category: "fake-patch",
    source: "https://www.youtube.com/watch?v=KC3qq0q6yGc",
    images: [
      {
        url: "images/sample/pickett-imm-41.jpg",
        note: "同编号对比 - 左：蓝黄白三色拼接patch（含签名），右：纯深蓝色单块patch（含签名）🚫 同一编号（41/99）出现完全不同的patch样式，确认为换patch",
        type: "compare"
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
    category: "fake-patch",
    source: "https://www.youtube.com/watch?v=KC3qq0q6yGc",
    images: [
      {
        url: "images/sample/mccollum-one-25.jpg",
        note: "同编号对比 - 左：白色和金色拼接patch（含签名），右：纯红色单块patch（含签名）🚫 同一编号（25/49）出现完全不同的patch样式，确认为换patch",
        type: "compare"
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
    category: "fake-patch",
    source: "https://www.youtube.com/watch?v=KC3qq0q6yGc",
    images: [
      {
        url: "images/sample/brown-imm-10.jpg",
        note: "同编号对比 - 左：白蓝两色拼接patch（含签名），右：纯红色单块patch（含签名）🚫 同一编号（10/99）出现完全不同的patch样式，确认为换patch",
        type: "compare"
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
    category: "fake-patch",
    source: "https://www.youtube.com/watch?v=KC3qq0q6yGc",
    images: [
      {
        url: "images/sample/kolek-noir-21.jpg",
        note: "同编号对比 - 左：橙灰白三色拼接patch（含签名），右：纯橙色单块patch（含签名）🚫 同一编号（21/49）出现完全不同的patch样式，确认为换patch",
        type: "compare"
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
    category: "fake-patch",
    images: [
      {
        url: "images/sample/curry-imm-standout-47.jpg",
        note: "同编号对比 - 左：ALTERED（改动的）蓝白拼接大尺寸patch，右：REAL（真实的）纯蓝色单块patch 🚫 同一编号（47/49）出现完全不同的patch样式，左侧明确标注为ALTERED，确认为换patch",
        type: "after"
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
    category: "fake-patch",
    images: [
      {
        url: "images/sample/harden-abs-2.jpg",
        note: "原始卡片 - NBA logo patch（红白蓝拼接）+ 橙色jersey + 黑色雷霆队logo patch，右下角无\"Prime\"标识",
        type: "before"
      },
      {
        url: "images/sample/harden-abs-1.jpg",
        note: "换patch后 - NBA logo patch（红白蓝拼接）+ 橙色patch + 黑色雷霆队logo patch（含PSA 10 AUTO评级）🚫 右下角无\"Prime\"字样证明此卡应为jersey材质，却出现了大尺寸patch，确认为换patch",
        type: "after"
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
    number: "1/5",
    status: "confirmed",
    category: "fake-patch",
    source: "https://www.youtube.com/post/UgkxhxkQJeKnZKHPOa8W5yw0j2YxxzO53jP8",
    images: [
      {
        url: "images/sample/durant-nt-gear-5-2.jpg",
        note: "原始卡片 - 左：白蓝拼接patch + 右：纯蓝色jersey（含签名）",
        type: "before"
      },
      {
        url: "images/sample/durant-nt-gear-5-1.jpg",
        note: "换patch后 - 左：黑白灰三色拼接adidas logo patch + 右：黑灰拼接adidas logo patch（含签名，BGS 8.5 AUTO 10评级）🚫 同一编号出现完全不同的双patch样式，确认为换patch",
        type: "after"
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
    category: "fake-patch",
    source: "https://www.youtube.com/post/Ugkx60N6d9hId9FcdJJW0RRaNDN5rzmIzdnC",
    images: [
      {
        url: "images/sample/watson-obsidian-55-2.jpg",
        note: "原始卡片 - 白蓝白三色拼接大尺寸patch（含签名）",
        type: "before"
      },
      {
        url: "images/sample/watson-obsidian-55-1.jpg",
        note: "换patch后 - 白黑拼接耐克logo patch（含签名）🚫 同一编号（55/75）出现完全不同的patch样式，确认为换patch",
        type: "after"
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
    category: "fake-patch",
    images: [
      {
        url: "images/sample/watson-mosaic-2.jpg",
        note: "原始卡片 - 纯绿色单块patch（含签名）",
        type: "before"
      },
      {
        url: "images/sample/watson-mosaic-1.jpg",
        note: "换patch后 - 白绿拼接大尺寸patch（含签名）🚫 同系列出现完全不同的patch样式，确认为换patch",
        type: "after"
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
    category: "fake-patch",
    source: "https://www.youtube.com/post/UgkxNeb_NxqkPhhMsoQb3sqpqn5gilBeyGzf",
    images: [
      {
        url: "images/sample/irving-nt-colossal-8-2.jpg",
        note: "原始卡片 - 黄紫拼接大尺寸patch（含签名，08/10编）",
        type: "before"
      },
      {
        url: "images/sample/irving-nt-colossal-8-1.jpg",
        note: "换patch后 - 白红拼接大尺寸patch（含签名，08/10编，PSA NM-MT 8评级）🚫 同一编号出现完全不同的patch样式，确认为换patch",
        type: "after"
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
    category: "fake-patch",
    source: "https://www.youtube.com/post/UgkxUZ8sw4JV-RTETaNosR5NkRCn1rIpzkKa",
    images: [
      {
        url: "images/sample/durant-imm-18-2.jpg",
        note: "原始卡片 - 纯蓝色单块patch（含签名，18/25编）",
        type: "before"
      },
      {
        url: "images/sample/durant-imm-18-1.jpg",
        note: "换patch后 - 白蓝拼接大尺寸patch（含签名，18/25编）🚫 同一编号出现完全不同的patch样式，确认为换patch",
        type: "after"
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
    category: "fake-patch",
    source: "https://www.youtube.com/post/Ugkx2g5hljIL7hQeAvIAxIUyDPsL82C6dRfj",
    images: [
      {
        url: "images/sample/lillard-flawless-6-3.jpg",
        note: "版本3 - 灰红黑三色拼接patch（含签名，06/25编）",
        type: "after"
      },
      {
        url: "images/sample/lillard-flawless-6-2.jpg",
        note: "版本2 - 黑红拼接patch（含签名，06/25编，BGS 7评级）",
        type: "after"
      },
      {
        url: "images/sample/lillard-flawless-6-1.jpg",
        note: "版本1 - 灰红拼接patch（含签名，06/25编）🚫 同一编号（06/25）出现至少三种完全不同的patch样式，确认为换patch",
        type: "before"
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
    category: "fake-patch",
    source: "https://www.youtube.com/post/UgkxroyxnOCcnTHCeEKDlZT3hrBbCbznk1SZ",
    images: [
      {
        url: "images/sample/durant-nt-4-2.jpg",
        note: "原始卡片 - 纯黄色单块patch（含签名，04/25编）",
        type: "before"
      },
      {
        url: "images/sample/durant-nt-4-1.jpg",
        note: "换patch后 - 蓝黄拼接大尺寸patch（含签名，04/25编，PSA签字评分10）🚫 同一编号出现完全不同的patch样式，确认为换patch",
        type: "after"
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
    category: "fake-patch",
    images: [
      {
        url: "images/sample/barnes-imm-6-2.jpg",
        note: "原始卡片 - 红白黑三色拼接patch（含签名，06/49编）",
        type: "before"
      },
      {
        url: "images/sample/barnes-imm-6-1.jpg",
        note: "换patch后 - 红白拼接patch（含签名，06/49编）🚫 同一编号出现完全不同的patch样式，确认为换patch",
        type: "after"
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
    category: "fake-patch",
    source: "https://www.youtube.com/post/Ugkx6cJRJeQNYyFRE71Cwq10rC61H9LGLvyI",
    images: [
      {
        url: "images/sample/maxey-noir-29-2.jpg",
        note: "原始卡片 - 纯白色单块patch（含签名，29/99编）",
        type: "before"
      },
      {
        url: "images/sample/maxey-noir-29-1.jpg",
        note: "换patch后 - 红蓝拼接patch（含签名，29/99编）🚫 同一编号出现完全不同的patch样式，确认为换patch",
        type: "after"
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
    category: "fake-patch",
    source: "https://www.youtube.com/post/UgkxrslpADB1_0L6hriIC1OAzEsz3Q9vTZTl",
    images: [
      {
        url: "images/sample/haliburton-noir-9-2.jpg",
        note: "原始卡片 - 纯紫色单块patch（含签名，09/99编）",
        type: "before"
      },
      {
        url: "images/sample/haliburton-noir-9-1.jpg",
        note: "换patch后 - 白紫拼接patch（含签名，09/99编）🚫 同一编号出现完全不同的patch样式，确认为换patch",
        type: "after"
      }
    ]
  },
  {
    id: 188,
    player: "Shai Gilgeous-Alexander",
    playerCN: "谢伊·吉尔杰斯-亚历山大",
    brand: "Panini",
    year: "2022-23",
    series: "Flawless Signatures Prime Material Emerald",
    number: "5/5编",
    status: "confirmed",
    category: "fake-patch",
    source: "https://www.youtube.com/post/UgkxwiEzc1sJ4dz8J7Gw6LLL9h9p2QYsRfpF",
    images: [
      {
        url: "images/sample/sga-flawless-5-3.jpg",
        note: "换patch前 - 纯蓝色单块patch（含签名，5/5编）",
        type: "before"
      },
      {
        url: "images/sample/sga-flawless-5-4.jpg",
        note: "换patch后 - 蓝红双色拼接patch（含签名，PSA NM-MT 8 AUTO 10评级，编号104256504）🚫 同一编号5/5出现完全不同的patch样式，确认为换patch",
        type: "after"
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
    category: "fake-patch",
    source: "https://www.youtube.com/post/UgkxWtPKtB6U1FUsTQFCoWObJPY9aPaXK2r7",
    images: [
      {
        url: "images/sample/maxey-noir-88-2.jpg",
        note: "原始卡片 - 纯白色单块patch（含签名，76人新秀卡）",
        type: "before"
      },
      {
        url: "images/sample/maxey-noir-88-1.jpg",
        note: "换patch后 - 红蓝拼接patch（含签名，88/99编）🚫 同一系列同一球员出现完全不同的patch样式，确认为换patch",
        type: "after"
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
    category: "fake-patch",
    source: "https://www.youtube.com/post/Ugkx-DLbz3qoYyZQVeDeHZRM7qfFTYQnHqLc",
    images: [
      {
        url: "images/sample/haliburton-impeccable-10-2.jpg",
        note: "原始卡片 - 纯紫色单块patch（含签名，金版RPA，国王队新秀卡）",
        type: "before"
      },
      {
        url: "images/sample/haliburton-impeccable-10-1.jpg",
        note: "换patch后 - 蓝白拼接patch（含签名，4/10编，金版RPA）🚫 同一系列同一球员出现完全不同的patch样式，确认为换patch",
        type: "after"
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
    category: "fake-patch",
    source: "https://www.youtube.com/post/Ugkxn4W1bOPBky_ESNl87r8lX1jxLycmQrbA",
    images: [
      {
        url: "images/sample/christie-noir-2-2.jpg",
        note: "原始卡片 - 纯紫色单块patch（含签名，湖人队新秀卡，02/99编）",
        type: "before"
      },
      {
        url: "images/sample/christie-noir-2-1.jpg",
        note: "换patch后 - 黄白拼接patch（含签名，02/99编）🚫 同一编号出现完全不同的patch样式，确认为换patch",
        type: "after"
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
    category: "fake-patch",
    source: "https://www.youtube.com/post/UgkxCbbxaLp4b38nRhlIXV8PXtRn90CdFxZq",
    images: [
      {
        url: "images/sample/johnson-oneandone-16-2.jpg",
        note: "原始卡片 - 纯红色单块patch（含签名，老鹰队新秀卡，16/35编）",
        type: "before"
      },
      {
        url: "images/sample/johnson-oneandone-16-1.jpg",
        note: "换patch后 - 黄红拼接patch（含签名，16/35编）🚫 同一编号出现完全不同的patch样式，确认为换patch",
        type: "after"
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
    category: "fake-patch",
    images: [
      {
        url: "images/sample/curry-flawless-15.jpg",
        note: "换patch对比 - 左侧标注\"ALTERED\"的PSA评级卡显示黄色patch，右侧原卡显示纯黄色patch（含签名，15/15编）🚫 明确标注ALTERED，确认为换patch卡片",
        type: "after"
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
    category: "fake-patch",
    images: [
      {
        url: "images/sample/durant-colossal-11-2.jpg",
        note: "原始卡片 - 纯蓝色大窗patch（含签名，雷霆队球衣，11/25编）",
        type: "before"
      },
      {
        url: "images/sample/durant-colossal-11-1.jpg",
        note: "换patch后 - 蓝白红三色拼接patch（含签名，11/25编）🚫 同一编号出现完全不同的patch样式，确认为换patch。成交价¥4,651（2024年），远高于原版¥2,888（2021年）",
        type: "after"
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
    category: "fake-patch",
    images: [
      {
        url: "images/sample/kobe-imm-14-3.jpg",
        note: "版本3 - 紫黄拼接patch（含签名，14/25编）🚫 同一编号出现至少三种完全不同的patch样式，确认为换patch。Immaculate元年产品，意义重大",
        type: "after"
      },
      {
        url: "images/sample/kobe-imm-14-2.jpg",
        note: "版本2 - 黄紫白三色大尺寸patch（含签名，14/25编）",
        type: "after"
      },
      {
        url: "images/sample/kobe-imm-14-1.jpg",
        note: "版本1 - 紫白拼接patch（含签名，湖人队球衣，14/25编）",
        type: "before"
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
    category: "fake-patch",
    images: [
      {
        url: "images/sample/iverson-imm-16.jpg",
        note: "换patch卡片 - 红白蓝三色拼接大尺寸patch（含签名，16/25编，BGS 9评级）🚫 eBay卖家明确标注\"fake patch\"，证实为换patch卡片",
        type: "after"
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
    category: "fake-patch",
    images: [
      {
        url: "images/sample/iverson-imm-8.jpg",
        note: "换patch卡片 - 红白黑三色拼接大尺寸patch（含签名，08/25编）🚫 eBay卖家明确标注\"fake patch\"，证实为换patch卡片",
        type: "after"
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
    category: "fake-patch",
    images: [
      {
        url: "images/sample/iverson-imm-24.jpg",
        note: "换patch卡片 - 红黑蓝白条纹拼接大尺寸patch（含签名，24/25编）🚫 eBay卖家明确标注\"fake patch\"，售价仅US $0.99，证实为换patch卡片",
        type: "after"
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
    category: "fake-patch",
    images: [
      {
        url: "images/sample/tatum-nt-16-2.jpg",
        note: "换patch卡片 - 纯绿色大窗patch（含签名，凯尔特人队配色，16/49编）🚫 违反系列规则：2018-19 NT系列中49编全部应为jersey，只有25编及以下才是patch。此卡本应是jersey却被换成patch",
        type: "before"
      },
      {
        url: "images/sample/tatum-nt-16-1.jpg",
        note: "换patch卡片 - 黑色大窗patch（含签名，16/49编）",
        type: "after"
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
    category: "fake-patch",
    images: [
      {
        url: "images/sample/haliburton-imm-67-2.jpg",
        note: "换patch后 - 紫色球衣patch（含签名，国王队配色，67/99编）🚫 同一编号出现完全不同的材质样式，确认为换patch",
        type: "before"
      },
      {
        url: "images/sample/haliburton-imm-67-1.jpg",
        note: "原始卡片 - 镜面球衣签字卡（含签名，国王队新秀卡，67/99编，未开封状态）",
        type: "after"
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
    category: "fake-patch",
    images: [
      {
        url: "images/sample/holmgren-imp-3-2.jpg",
        note: "换patch后 - 纯蓝色单块patch（含签名#7，雷霆队配色，03/99编）🚫 同一编号出现完全不同的patch样式，确认为换patch",
        type: "before"
      },
      {
        url: "images/sample/holmgren-imp-3-1.jpg",
        note: "原始卡片 - 蓝白红三色拼接patch（含签名#7，雷霆队新秀卡，03/99编）",
        type: "after"
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
    category: "fake-patch",
    images: [
      {
        url: "images/sample/cunningham-imp-24-2.jpg",
        note: "换patch后 - 纯红色单块patch（含签名，活塞队配色，24/99编）🚫 同一编号出现完全不同的patch样式，确认为换patch",
        type: "before"
      },
      {
        url: "images/sample/cunningham-imp-24-1.jpg",
        note: "原始卡片 - 红蓝拼接patch（含签名，活塞队新秀卡，24/99编）",
        type: "after"
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
    category: "fake-patch",
    images: [
      {
        url: "images/sample/holmgren-imp-83-2.jpg",
        note: "换patch后 - 蓝白红三色拼接patch（含签名#7，雷霆队配色，83/99编）🚫 同一编号出现完全不同的patch样式，确认为换patch",
        type: "after"
      },
      {
        url: "images/sample/holmgren-imp-83-1.jpg",
        note: "原始卡片 - 橙蓝白三色拼接patch（含签名#7，雷霆队新秀卡，83/99编，成交价仅¥1.00）",
        type: "before"
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
    category: "fake-patch",
    images: [
      {
        url: "images/sample/pierce-ud-4-comment.jpg",
        note: "评论截图 - 藏家指出：该版本3编才应该是patch，10编都是单色球衣。评论者表示拥有两张同款毕比卡片作为对比证据",
        type: "after"
      },
      {
        url: "images/sample/pierce-ud-4.jpg",
        note: "四窗球衣卡 - 四块绿白拼接球衣patch（含签名，凯尔特人队配色，04/10编）🚫 违反系列规则：该系列10编应为四窗球衣，3编才是两球衣两patch。此卡04/10编本应是四窗球衣，但据评论显示有收藏者持有毕比同款卡片对比，确认存在换patch问题",
        type: "after"
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
    category: "fake-patch",
    images: [
      {
        url: "images/sample/cunningham-imp-6-2.jpg",
        note: "换patch后 - 蓝白拼接patch（含签名，活塞队配色，06/25编）🚫 同一编号出现完全不同的patch样式，确认为换patch",
        type: "after"
      },
      {
        url: "images/sample/cunningham-imp-6-1.jpg",
        note: "原始卡片 - 蓝色单块patch（含签名，活塞队新秀卡，06/25编）",
        type: "before"
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
    category: "fake-patch",
    images: [
      {
        url: "images/sample/kobe-ud-gj19.jpg",
        note: "换patch对比 - 左：纯黄色单块球衣（原始卡片，标注ALTERED）；右：BGS 9.5评级，黄紫白三色拼接大尺寸patch（换patch后）🚫 明确标注\"Fake Patch\"和\"Previously listed and sold as ALTERED\"，原本是纯黄色球衣卡被换成多色patch。图片说明：左侧卡片才是原版未改动的球衣样式",
        type: "after"
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
    category: "fake-patch",
    images: [
      {
        url: "images/sample/kobe-imm-19.jpg",
        note: "换patch对比 - 上：白紫黄三色拼接patch（含签名，19/75编）；下：紫橙白三色拼接大尺寸patch（含签名，19/75编）🚫 同一编号出现完全不同的patch样式，确认为换patch。Immaculate元年产品",
        type: "compare"
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
    category: "fake-patch",
    images: [
      {
        url: "images/sample/kobe-imm-27.jpg",
        note: "换patch对比 - 上：黄橙紫白四色拼接大尺寸patch（PSA评级，27/75编）；下：白色为主带黄边和紫色小块的小尺寸patch（21/75编）🚫 同系列不同编号，patch样式差异巨大，进一步证明Immaculate元年产品的换patch现象。注意：27/75编卡片与之前记录的14/25、19/75编呈现相似的多色拼接风格，而21/75编却是普通白色球衣",
        type: "compare"
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
    number: "13/15编",
    status: "confirmed",
    category: "fake-patch",
    images: [
      {
        url: "images/sample/lebron-flawless-13.jpg",
        note: "换patch对比 - 左：白黑紫三色拼接的简单patch（原始卡片）；右：黄白紫三色拼接的复杂patch（换patch后，假原封）🚫 图片明确标注\"Patch Swap\"，从简单三色patch被换成更华丽的黄色湖人配色patch。来源：球星卡TV (www.tiffanycards.com)",
        type: "after"
      }
    ]
  },
  {
    id: 212,
    player: "Kobe Bryant",
    playerCN: "科比·布莱恩特",
    brand: "Upper Deck",
    year: "2004",
    series: "Ultimate Collection Game Patches",
    number: "90/100编",
    status: "confirmed",
    category: "fake-patch",
    source: "https://www.youtube.com/watch?v=Xw2yKciVBI0&t=2s",
    images: [
      {
        url: "images/sample/kobe-ud-90.jpg",
        note: "换patch卡片 - 紫黄白三色拼接大尺寸patch（GBTC 9 MINT评级，90/100编）🚫 图片展示卡片正反面，patch为紫黄白三色拼接样式。Upper Deck Ultimate Collection系列早期产品，换patch现象严重",
        type: "after"
      }
    ]
  },
  {
    id: 213,
    player: "Kobe Bryant",
    playerCN: "科比·布莱恩特",
    brand: "Panini",
    year: "2012",
    series: "Kobe Anthology Memorabilia",
    number: "4/8编",
    status: "confirmed",
    category: "fake-patch",
    source: "https://www.youtube.com/watch?v=Xw2yKciVBI0&t=2s",
    images: [
      {
        url: "images/sample/kobe-anthology-4.jpg",
        note: "换patch卡片 - 黄紫拼接大尺寸patch（GBTC 9 MINT评级，4/8编）🚫 图片展示卡片正反面，左侧正面显示#8号球衣的Kobe，patch为黄紫色拼接大尺寸样式。Panini Kobe Anthology系列特别纪念产品",
        type: "after"
      }
    ]
  },
  {
    id: 214,
    player: "Kobe Bryant",
    playerCN: "科比·布莱恩特",
    brand: "Panini",
    year: "2015",
    series: "Noir Jumbo Material Prime",
    number: "16/25编",
    status: "confirmed",
    category: "fake-patch",
    source: "https://www.youtube.com/watch?v=Xw2yKciVBI0&t=2s",
    images: [
      {
        url: "images/sample/kobe-noir-16.jpg",
        note: "换patch卡片 - 黄白紫三色拼接大尺寸jumbo patch（GBTC 9 MINT评级，16/25编）🚫 图片展示卡片正反面，patch为黄白紫三色垂直拼接的大尺寸样式。Panini Noir Jumbo Material Prime系列，高端产品线",
        type: "after"
      }
    ]
  },
  {
    id: 215,
    player: "Stephen Curry",
    playerCN: "斯蒂芬·库里",
    brand: "Panini",
    year: "2017",
    series: "National Treasures Century Materials Gold",
    number: "3/5编",
    status: "confirmed",
    category: "fake-patch",
    source: "https://www.youtube.com/watch?v=Xw2yKciVBI0&t=2s",
    images: [
      {
        url: "images/sample/curry-nt-century-3.jpg",
        note: "换patch卡片 - 蓝黄色勇士队logo patch（GBTC 9 MINT评级，3/5编）🚫 图片展示卡片正反面，patch为蓝黄色拼接的勇士队logo样式。National Treasures Century Materials Gold系列超稀有金版，仅5张。注：尾号9551",
        type: "after"
      }
    ]
  },
  {
    id: 216,
    player: "Klay Thompson",
    playerCN: "克莱·汤普森",
    brand: "Panini",
    year: "2018",
    series: "Spectra Spectacular Swatches Neon Orange",
    number: "3/5编",
    status: "confirmed",
    category: "fake-patch",
    source: "https://www.youtube.com/watch?v=Xw2yKciVBI0&t=2s",
    images: [
      {
        url: "images/sample/klay-spectra-3.jpg",
        note: "换patch卡片 - 蓝黄色拼接patch（GBTC 8.5 NM-MT+评级，3/5编）🚫 图片展示卡片正反面，左侧正面显示#11球衣的Klay Thompson，patch为蓝黄色拼接样式。Panini Spectra Spectacular Swatches Neon Orange系列超稀有橙版，仅5张",
        type: "after"
      }
    ]
  },
  {
    id: 217,
    player: "LeBron James",
    playerCN: "勒布朗·詹姆斯",
    brand: "Panini",
    year: "2021",
    series: "Immaculate The Standard",
    number: "15/25编",
    status: "confirmed",
    category: "fake-patch",
    source: "https://www.youtube.com/watch?v=Xw2yKciVBI0&t=2s",
    images: [
      {
        url: "images/sample/lebron-imm-standard-15.jpg",
        note: "换patch卡片 - 黄白紫三色拼接大尺寸patch（GBTC 9 MINT评级，15/25编）🚫 图片展示卡片正反面，patch为黄白紫三色拼接样式。Panini Immaculate The Standard系列，与ID 154同系列，证明该系列换patch问题严重",
        type: "after"
      }
    ]
  },
  {
    id: 218,
    player: "Stephen Curry",
    playerCN: "斯蒂芬·库里",
    brand: "Panini",
    year: "2021",
    series: "Immaculate The Standard",
    number: "16/25编",
    status: "confirmed",
    category: "fake-patch",
    source: "https://www.youtube.com/watch?v=Xw2yKciVBI0&t=2s",
    images: [
      {
        url: "images/sample/curry-imm-standard-16.jpg",
        note: "",
        type: "after"
      },
      {
        url: "images/sample/edit_218_before_1775805426790_1.png",
        note: "",
        type: "before"
      }
    ]
  },
  {
    id: 219,
    player: "Evan Mobley",
    playerCN: "埃文·莫布利",
    brand: "Panini",
    year: "2021",
    series: "Noir Rookie Jumbo Material Brand Logo",
    number: "5/5编",
    status: "confirmed",
    category: "fake-patch",
    source: "https://www.youtube.com/watch?v=Xw2yKciVBI0&t=2s",
    images: [
      {
        url: "images/sample/mobley-noir-5.jpg",
        note: "换patch卡片 - 红酒色和黄色拼接骑士队logo patch（GBTC 9 MINT评级，5/5编最后一张）🚫 图片展示卡片正反面，patch为红酒色和黄色拼接的骑士队brand logo样式。Panini Noir Rookie Jumbo Material Brand Logo系列，新秀超大尺寸logo patch卡",
        type: "after"
      }
    ]
  },
  {
    id: 220,
    player: "Stephen Curry",
    playerCN: "斯蒂芬·库里",
    brand: "Panini",
    year: "2021",
    series: "Prizm Sensational Swatches Prize Green Ice",
    number: "10/21编",
    status: "confirmed",
    category: "fake-patch",
    source: "https://www.youtube.com/watch?v=Xw2yKciVBI0&t=2s",
    images: [
      {
        url: "images/sample/curry-prizm-10.jpg",
        note: "换patch卡片 - 蓝色patch（GBTC 9.5 GEM MINT评级，10/21编）🚫 图片展示卡片正反面，左侧正面显示#30号球衣的Curry，patch为蓝色样式。Panini Prizm Sensational Swatches Prize Green Ice系列超稀有绿冰版，仅21张",
        type: "after"
      }
    ]
  },
  {
    id: 221,
    player: "LeBron James",
    playerCN: "勒布朗·詹姆斯",
    brand: "Panini",
    year: "2020",
    series: "Noir Box Office Memorabilia Prime",
    number: "11/25编",
    status: "confirmed",
    category: "fake-patch",
    source: "https://www.youtube.com/watch?v=Xw2yKciVBI0&t=2s",
    images: [
      {
        url: "images/sample/lebron-noir-boxoffice-11.jpg",
        note: "换patch卡片 - 黄白紫三色拼接patch（GBTC 9 MINT评级，11/25编）🚫 图片展示卡片正反面，patch为黄白紫三色拼接样式。Panini Noir Box Office Memorabilia Prime系列，高端湖人队配色patch",
        type: "after"
      }
    ]
  },
  {
    id: 222,
    player: "LeBron James",
    playerCN: "勒布朗·詹姆斯",
    brand: "Panini",
    year: "2021",
    series: "Immaculate Materials Gold",
    number: "5/10编",
    status: "confirmed",
    category: "fake-patch",
    source: "https://www.youtube.com/watch?v=Xw2yKciVBI0&t=2s",
    images: [
      {
        url: "images/sample/lebron-imm-materials-5.jpg",
        note: "换patch卡片 - 黄白紫三色拼接patch（GBTC 9 MINT评级，5/10编）🚫 图片展示卡片正反面，#6号球衣的LeBron，patch为黄白紫三色拼接样式。Panini Immaculate Materials Gold系列超稀有金版，仅10张",
        type: "after"
      }
    ]
  },
  {
    id: 223,
    player: "LeBron James",
    playerCN: "勒布朗·詹姆斯",
    brand: "Panini",
    year: "2021",
    series: "Immaculate Materials Red",
    number: "10/25编",
    status: "confirmed",
    category: "fake-patch",
    images: [
      {
        url: "images/sample/lebron-imm-materials-red-10.jpg",
        note: "换patch卡片 - 纯黄色patch（GBTC 8.5 NM-MT+评级，10/25编）🚫 图片展示卡片正反面，#6号球衣的LeBron，patch为纯黄色样式。Panini Immaculate Materials Red系列稀有红版，仅25张。注：尾号1467",
        type: "after"
      }
    ]
  },
  {
    id: 224,
    player: "Stephen Curry",
    playerCN: "斯蒂芬·库里",
    brand: "Panini",
    year: "2021",
    series: "Immaculate The Standard",
    number: "11/25编",
    status: "confirmed",
    category: "fake-patch",
    source: "https://www.youtube.com/watch?v=Xw2yKciVBI0&t=2s",
    images: [
      {
        url: "images/sample/curry-imm-standard-11.jpg",
        note: "换patch卡片 - 蓝白色勇士队logo拼接patch（GBTC 9 MINT评级，11/25编）🚫 图片展示卡片正反面，patch为蓝白色勇士队logo拼接样式。Panini Immaculate The Standard系列，该系列已有ID 156（16/25编，高危）、ID 218（16/25编，confirmed）、ID 217（LeBron 15/25编），证明系列性问题极其严重",
        type: "after"
      }
    ]
  },
  {
    id: 225,
    player: "Stephen Curry",
    playerCN: "斯蒂芬·库里",
    brand: "Panini",
    year: "2021",
    series: "Immaculate Standout Memorabilia Gold",
    number: "1/10编",
    status: "confirmed",
    category: "fake-patch",
    source: "https://www.youtube.com/watch?v=Xw2yKciVBI0&t=2s",
    images: [
      {
        url: "images/sample/curry-imm-standout-1.jpg",
        note: "换patch卡片 - 蓝黄色拼接patch（GBTC 8.5 NM-MT+评级，1/10编第一张）🚫 图片展示卡片正反面，patch为蓝黄色拼接样式。Panini Immaculate Standout Memorabilia Gold系列超稀有金版，仅10张，这是1/10编第一张，极其珍贵",
        type: "after"
      }
    ]
  },
  {
    id: 226,
    player: "LeBron James",
    playerCN: "勒布朗·詹姆斯",
    brand: "Panini",
    year: "2021",
    series: "Immaculate Remarkable Jerseys Red",
    number: "19/25编",
    status: "confirmed",
    category: "fake-patch",
    source: "https://www.youtube.com/watch?v=Xw2yKciVBI0&t=2s",
    images: [
      {
        url: "images/sample/lebron-imm-jerseys-red-19.jpg",
        note: "换patch卡片 - 黄白紫三色拼接patch（GBTC 9 MINT评级，19/25编）🚫 图片展示卡片正反面，#6号球衣的LeBron，patch为黄白紫三色拼接样式。Panini Immaculate Remarkable Jerseys Red系列稀有红版，仅25张",
        type: "after"
      }
    ]
  },
  {
    id: 227,
    player: "LeBron James",
    playerCN: "勒布朗·詹姆斯",
    brand: "Panini",
    year: "2022",
    series: "Origins Origins Memorabilia Turquoise",
    number: "8/25编",
    status: "confirmed",
    category: "fake-patch",
    source: "https://www.youtube.com/watch?v=Xw2yKciVBI0&t=2s",
    images: [
      {
        url: "images/sample/lebron-origins-turquoise-8.jpg",
        note: "换patch卡片 - 黄紫色拼接patch（GBTC 8.5 NM-MT+评级，8/25编）🚫 图片展示卡片正反面，#6号球衣的LeBron，patch为黄紫色拼接样式。Panini Origins Origins Memorabilia Turquoise系列稀有绿松石版，仅25张",
        type: "after"
      }
    ]
  },
  {
    id: 228,
    player: "Kobe Bryant",
    playerCN: "科比·布莱恩特",
    brand: "Panini",
    year: "2012",
    series: "Prestige Inside the No. Prime Materials",
    number: "20/25编",
    status: "confirmed",
    category: "fake-patch",
    source: "https://www.youtube.com/watch?v=Xw2yKciVBI0&t=2s",
    images: [
      {
        url: "images/sample/kobe-prestige-20.jpg",
        note: "换patch卡片 - 黄紫色拼接patch（有AUTH认证标签，20/25编）🚫 图片展示卡片正反面，#24号球衣的Kobe，patch为黄紫色拼接样式。Panini Prestige Inside the No. Prime Materials系列，Prime级别高端材质卡",
        type: "after"
      }
    ]
  },
  {
    id: 229,
    player: "Kevin Durant",
    playerCN: "凯文·杜兰特",
    brand: "Panini",
    year: "2016",
    series: "National Treasures Lasting Legacies",
    number: "9/20编",
    status: "confirmed",
    category: "fake-patch",
    source: "https://www.youtube.com/watch?v=Xw2yKciVBI0&t=2s",
    images: [
      {
        url: "images/sample/durant-nt-legacies-9.jpg",
        note: "换patch卡片 - 蓝白黄三色拼接patch带签名（有AUTH认证标签，9/20编）🚫 图片展示卡片正反面，#35号球衣的Durant，patch为蓝白黄三色拼接样式，含Durant签名。Panini National Treasures Lasting Legacies系列，仅20张超稀有签字patch卡",
        type: "after"
      }
    ]
  },
  {
    id: 230,
    player: "Stephen Curry",
    playerCN: "斯蒂芬·库里",
    brand: "Panini",
    year: "2016",
    series: "Spectra Spectacular Swatches Gold",
    number: "3/10编",
    status: "confirmed",
    category: "fake-patch",
    source: "https://www.youtube.com/watch?v=Xw2yKciVBI0&t=2s",
    images: [
      {
        url: "images/sample/curry-spectra-gold-3.jpg",
        note: "换patch卡片 - 白蓝色拼接patch（有AUTH认证标签，3/10编）🚫 图片展示卡片正反面，#30号球衣的Curry，patch为白蓝色拼接样式。Panini Spectra Spectacular Swatches Gold系列超稀有金版，仅10张",
        type: "after"
      }
    ]
  },
  {
    id: 231,
    player: "LeBron James",
    playerCN: "勒布朗·詹姆斯",
    brand: "Panini",
    year: "2021",
    series: "Immaculate Remarkable Jerseys Red",
    number: "3/25编",
    status: "confirmed",
    category: "fake-patch",
    source: "https://www.youtube.com/watch?v=Xw2yKciVBI0&t=2s",
    images: [
      {
        url: "images/sample/lebron-imm-jerseys-red-3.jpg",
        note: "换patch卡片 - 黄白黑三色拼接patch（有AUTH认证标签，3/25编）🚫 图片展示卡片正反面，#6号球衣的LeBron，patch为黄白黑三色拼接样式。Panini Immaculate Remarkable Jerseys Red系列稀有红版，仅25张。与ID 226同系列不同编号，证明该系列换patch问题严重",
        type: "after"
      }
    ]
  },
  {
    id: 232,
    player: "Evan Mobley",
    playerCN: "埃文·莫布利",
    brand: "Panini",
    year: "2021",
    series: "Impeccable Elegance Rookie Jersey Auto",
    number: "25/99编",
    status: "confirmed",
    category: "fake-patch",
    source: "https://www.youtube.com/watch?v=Xw2yKciVBI0&t=2s",
    images: [
      {
        url: "images/sample/mobley-impeccable-25.jpg",
        note: "换patch卡片 - 黄白红三色拼接patch带签名（有AUTH认证标签，25/99编）🚫 图片展示卡片正反面，新秀年份的Mobley，patch为黄白红三色拼接样式，含Mobley签名。Panini Impeccable Elegance Rookie系列，新秀签字patch卡",
        type: "after"
      }
    ]
  },
  {
    id: 233,
    player: "LeBron James",
    playerCN: "勒布朗·詹姆斯",
    brand: "Panini",
    year: "2021",
    series: "National Treasures NBA Materials Prime",
    number: "5/25编",
    status: "confirmed",
    category: "fake-patch",
    source: "https://www.youtube.com/watch?v=Xw2yKciVBI0&t=2s",
    images: [
      {
        url: "images/sample/lebron-nt-materials-5.jpg",
        note: "换patch卡片 - 黄白紫三色拼接patch（有AUTH认证标签，5/25编）🚫 图片展示卡片正反面，#6号球衣的LeBron，patch为黄白紫三色拼接样式。Panini National Treasures NBA Materials Prime系列，Prime级别高端材质卡",
        type: "after"
      }
    ]
  },
  {
    id: 234,
    player: "Ja Morant",
    playerCN: "贾·莫兰特",
    brand: "Panini",
    year: "2021",
    series: "Noir Box Office Memorabilia Prime",
    number: "10/25编",
    status: "confirmed",
    category: "fake-patch",
    source: "https://www.youtube.com/watch?v=Xw2yKciVBI0&t=2s",
    images: [
      {
        url: "images/sample/morant-noir-boxoffice-10.jpg",
        note: "换patch卡片 - 蓝白色拼接patch（有AUTH认证标签，10/25编）🚫 图片展示卡片正反面，#12号球衣的Ja Morant，patch为蓝白色拼接样式。Panini Noir Box Office Memorabilia Prime系列，与ID 221 LeBron同系列",
        type: "after"
      }
    ]
  },
  {
    id: 235,
    player: "LeBron James",
    playerCN: "勒布朗·詹姆斯",
    brand: "Panini",
    year: "2021",
    series: "Noir Box Office Memorabilia Prime",
    number: "16/25编",
    status: "confirmed",
    category: "fake-patch",
    source: "https://www.youtube.com/watch?v=Xw2yKciVBI0&t=2s",
    images: [
      {
        url: "images/sample/lebron-noir-boxoffice-16.jpg",
        note: "换patch卡片 - 紫黄白三色拼接patch（有AUTH认证标签，16/25编）🚫 图片展示卡片正反面，#6号球衣的LeBron，patch为紫黄白三色拼接样式。Panini Noir Box Office Memorabilia Prime系列，该系列已有ID 221（11/25编，2020年）和ID 234（Ja Morant 10/25编），证明系列性问题严重",
        type: "after"
      }
    ]
  },
  {
    id: 236,
    player: "Shai Gilgeous-Alexander",
    playerCN: "谢伊·吉尔杰斯-亚历山大",
    brand: "Panini",
    year: "2021",
    series: "Immaculate Standout Memorabilia",
    number: "11/99编",
    status: "confirmed",
    category: "fake-patch",
    images: [
      {
        url: "images/sample/sga-imm-standout-11-2.jpg",
        note: "换patch对比 - 纯橙色patch（11/99编，另一版本）",
        type: "compare"
      },
      {
        url: "images/sample/sga-imm-standout-11-1.jpg",
        note: "换patch对比 - 雷霆队logo patch（11/99编，未封装原卡）🚫 同一编号11/99出现完全不同的patch样式，一个是雷霆队logo patch，另一个是纯橙色patch，确认为换patch",
        type: "compare"
      }
    ]
  },
  {
    id: 237,
    player: "Shai Gilgeous-Alexander",
    playerCN: "谢伊·吉尔杰斯-亚历山大",
    brand: "Panini",
    year: "2022-23",
    series: "Immaculate The Standard",
    number: "84/99编",
    status: "confirmed",
    category: "fake-patch",
    images: [
      {
        url: "images/sample/sga-imm-standard-84-2.jpg",
        note: "换patch卡片 - eBay拍卖列表截图，同系列99编成交截图",
        type: "before"
      },
      {
        url: "images/sample/sga-imm-standard-84.jpg",
        note: "换patch卡片 - 蓝白红黄多色拼接雷霆队logo patch（84/99编）图片展示卡片正面，patch为蓝白红黄多色拼接的雷霆队logo样式。与同系列99编 patch 完全不一致，确认为换patch",
        type: "after"
      }
    ]
  },
  {
    id: 238,
    player: "Nick Young",
    playerCN: "尼克·杨",
    brand: "Panini",
    year: "2015-16",
    series: "Immaculate",
    number: "09/10编",
    status: "confirmed",
    category: "fake-patch",
    images: [
      {
        url: "images/sample/young-imm-9-2.jpg",
        note: "同款卡片 ptach，这卡切的是 76人球衣",
        type: "before"
      },
      {
        url: "images/sample/young-imm-9-1.jpg",
        note: "换patch对比 - 原卡切的是76人球衣patch，换patch后的卡片切的是湖人队球衣",
        type: "after"
      }
    ]
  },
  {
    id: 239,
    player: "Yao Ming",
    playerCN: "姚明",
    brand: "Panini",
    year: "2011-12",
    series: "Limited Glass Cleaners",
    number: "1/1编",
    status: "confirmed",
    category: "fake-patch",
    images: [
      {
        url: "images/sample/yao-limited-1-2.jpg",
        note: "换patch卡片 - 交易详情截图，2019年11月成交价¥540，卡片名称：2011-12 Panini Limited 一编 patch 火箭 姚明 展会包 1/1",
        type: "before"
      },
      {
        url: "images/sample/yao-limited-1.jpg",
        note: "换patch卡片 - NBA logo与白色布料拼接patch（1/1编）卡片展示姚明火箭队球衣，patch包含NBA logo和白色布料，Limited Glass Cleaners系列独版卡",
        type: "after"
      }
    ]
  },
  {
    id: 240,
    player: "Damian Lillard / Stephen Curry / Trae Young",
    playerCN: "达米安·利拉德 / 斯蒂芬·库里 / 特雷·杨",
    brand: "Panini",
    year: "2024-25",
    series: "Flawless Triple Materials",
    number: "23/25编",
    status: "confirmed",
    category: "fake-patch",
    images: [
      {
        url: "images/sample/triple-flawless-23-2.jpg",
        note: "换patch卡片 - 交易详情截图，成交价¥1,650.00，卡片名称：2024-25 Panini Flawless 1 手提 利拉德 斯蒂芬库里 特雷杨 三人 三窗 物料 25编",
        type: "before"
      },
      {
        url: "images/sample/triple-flawless-23-1.jpg",
        note: "换patch卡片 - 三人三窗物料卡（23/25编）左侧利拉德Trail Blazers红白拼接patch，中间库里Warriors蓝色MCM标志patch，右侧特雷杨Hawks红白拼接patch。Flawless系列三人三窗物料卡",
        type: "after"
      }
    ]
  },
  {
    id: 241,
    player: "Bobby Portis",
    playerCN: "鲍比·波蒂斯",
    brand: "Panini",
    year: "2024",
    series: "Silhouette Jumbo Memorabilia",
    number: "09/15编",
    status: "confirmed",
    category: "fake-patch",
    source: "微信好友15大佬反馈",
    images: [
      {
        url: "images/sample/portis-silhouette-9-2.jpg",
        note: "换patch对比 - 黑白红三色条纹patch（09/15编，另一版本）",
        type: "compare"
      },
      {
        url: "images/sample/portis-silhouette-9-1.jpg",
        note: "换patch对比 - 红底白色Nike swoosh logo patch（09/15编）🚫 同一编号09/15出现完全不同的patch样式，一个是Nike swoosh logo patch，另一个是黑白红三色条纹patch，确认为换patch",
        type: "compare"
      }
    ]
  },
  {
    id: 279,
    player: "Shai Gilgeous-Alexander",
    playerCN: "谢伊·吉尔杰斯-亚历山大",
    brand: "Panini",
    year: "2022-23",
    series: "Flawless Signature Prime Material Gold Auto",
    number: "08/10编",
    status: "confirmed",
    category: "fake-patch",
    source: "https://v.douyin.com/kuSr_nx5IpE/",
    images: [
      {
        url: "images/sample/sga-flawless-8-1.jpg",
        note: "换patch前 - 纯蓝色单块patch",
        type: "before"
      },
      {
        url: "images/sample/sga-flawless-8-2.jpg",
        note: "换patch后 - 蓝黄双色拼接patch（PSA评级 Mint 9/Auto 10）",
        type: "after"
      }
    ]
  },
  {
    id: 280,
    player: "Karl Malone",
    playerCN: "卡尔·马龙",
    brand: "Panini",
    year: "2014-15",
    series: "Spectra Hall of Fame Signatures",
    number: "1/1编",
    status: "confirmed",
    category: "fake-patch",
    source: "微信好友15大佬反馈",
    images: [
      {
        url: "images/sample/malone-spectra-1-1.jpg",
        note: "换patch前 - 紫色网格纹理patch（含签名）",
        type: "before"
      },
      {
        url: "images/sample/malone-spectra-1-2.jpg",
        note: "换patch后 - 彩色UT Jazz logo patch（含签名）🚫 同一1/1编号出现完全不同的patch样式，确认为换patch",
        type: "after"
      }
    ]
  },
  {
    id: 281,
    player: "Jayson Tatum",
    playerCN: "杰森 塔图姆",
    brand: "Panini",
    year: "2022-23",
    series: "Noir",
    number: "16/49",
    status: "confirmed",
    category: "fake-auto",
    source: "https://www.xiaohongshu.com/explore/69d27dee000000001a036d4f?app_platform=ios&app_version=9.23&share_from_user_hidden=true&xsec_source=app_s",
    images: [
      {
        url: "images/sample/card_1775731012979_after_0.png",
        note: "存在明显涂改",
        type: "after"
      },
      {
        url: "images/sample/card_1775731012979_before_0.jpg",
        note: "墨迹淡化严重",
        type: "before"
      }
    ]
  },
  {
    id: 282,
    player: "Derrick Rose",
    playerCN: "德里克·罗斯",
    brand: "Panini",
    year: "2013-14",
    series: "National Treasures",
    number: "27/65",
    status: "confirmed",
    category: "fake-patch",
    source: "微信好友15大佬反馈",
    images: [
      {
        url: "images/sample/card_1775732250101_after_0.jpg",
        note: "after_0",
        type: "after"
      },
      {
        url: "images/sample/card_1775732250101_before_0.jpg",
        note: "before_0",
        type: "before"
      }
    ]
  },
  {
    id: 283,
    player: "Kevin Durant",
    playerCN: "凯文·杜兰特",
    brand: "Panini",
    year: "2011-12",
    series: "Gold Standard",
    number: "无编",
    status: "confirmed",
    category: "fake-auto",
    source: "小程序用户反馈",
    images: [
      {
        url: "images/sample/fb_1775731412903_after_0.png",
        note: "疑似出现 kd 的假铭文，可以通过签字的瑕疵位置对比",
        type: "after"
      },
      {
        url: "images/sample/fb_1775731412903_before_0.png",
        note: "原始图片",
        type: "before"
      }
    ]
  },
  {
    id: 286,
    player: "Manu Ginobili",
    playerCN: "马努 吉诺比利",
    brand: "Panini",
    year: "2016-17",
    series: "Immaculate",
    number: "3/3",
    status: "confirmed",
    category: "fake-patch",
    source: "https://www.xiaohongshu.com/explore/69cfb4d8000000001b0210cb?app_platform=ios&app_version=9.23&share_from_user_hidden=true&xsec_source=app_s",
    images: [
      {
        url: "images/sample/card_1775738935817_after_0.png",
        note: "patch 球衣为白色布料，实际应该为灰色",
        type: "after"
      },
      {
        url: "images/sample/card_1775738935817_before_0.jpg",
        note: "原始全明星所穿球衣",
        type: "before"
      }
    ]
  },
  {
    id: 287,
    player: "Scottie Barnes",
    playerCN: "斯科蒂·巴恩斯",
    brand: "Panini",
    year: "2021-22",
    series: "Immaculate Collection",
    number: "6/49",
    status: "confirmed",
    category: "fake-auto",
    source: "https://www.youtube.com/post/UgkxwTviX8T0ykIMWTttWmQuwvVObGslul0W",
    images: [
      {
        url: "images/sample/card_1775802679928_after_0.png",
        note: "重新进行涂改",
        type: "after"
      },
      {
        url: "images/sample/card_1775802679928_before_0.png",
        note: "墨迹存在明显瑕疵",
        type: "before"
      }
    ]
  },
  {
    id: 288,
    player: "Anthony Edwards",
    playerCN: "安东尼 爱德华兹",
    brand: "Panini",
    year: "2021-22",
    series: "Immaculate Collection",
    number: "25/25",
    status: "confirmed",
    category: "fake-patch",
    source: "https://www.youtube.com/watch?v=0IiEAk8Nqt8&t=2s",
    images: [
      {
        url: "images/sample/card_1775804193269_after_0.png",
        note: "after_0",
        type: "after"
      }
    ]
  },
  {
    id: 289,
    player: "Grant Hill",
    playerCN: "格兰特·希尔",
    brand: "Panini",
    year: "2013-14",
    series: "Spectra",
    number: "3/15",
    status: "confirmed",
    category: "fake-patch",
    source: "https://www.youtube.com/watch?v=0IiEAk8Nqt8&t=2s",
    images: [
      {
        url: "images/sample/card_1775804457709_after_0.png",
        note: "after_0",
        type: "after"
      }
    ]
  },
  {
    id: 290,
    player: "LeBron James",
    playerCN: "勒布朗·詹姆斯",
    brand: "Upper Deck",
    year: "2004-05",
    series: "SP",
    number: "14/100",
    status: "confirmed",
    category: "fake-auto",
    source: "https://www.youtube.com/watch?v=MQT22B2HhH8",
    images: [
      {
        url: "images/sample/card_1775806571875_after_0.png",
        note: "after_0",
        type: "after"
      },
      {
        url: "images/sample/card_1775806571875_before_0.png",
        note: "before_0",
        type: "before"
      }
    ]
  },
  {
    id: 291,
    player: "Stephen Curry",
    playerCN: "斯蒂芬·库里",
    brand: "Panini",
    year: "2014",
    series: "Court kings",
    number: "无编",
    status: "confirmed",
    category: "fake-auto",
    source: "https://www.youtube.com/watch?v=MQT22B2HhH8",
    images: [
      {
        url: "images/sample/card_1775806672159_after_0.png",
        note: "after_0",
        type: "after"
      }
    ]
  },
  {
    id: 292,
    player: "Zion Williamson",
    playerCN: "锡安·威廉姆森",
    brand: "Panini",
    year: "2021",
    series: "Prizm",
    number: "-",
    status: "confirmed",
    category: "fake-auto",
    source: "https://www.youtube.com/watch?v=MQT22B2HhH8",
    images: [
      {
        url: "images/sample/card_1775806748071_after_0.png",
        note: "after_0",
        type: "after"
      }
    ]
  },
  {
    id: 293,
    player: "Dwyane Wade",
    playerCN: "德韦恩·韦德",
    brand: "Panini",
    year: "2021",
    series: "Contenders Optic",
    number: "-",
    status: "confirmed",
    category: "fake-auto",
    source: "https://www.youtube.com/watch?v=MQT22B2HhH8",
    images: [
      {
        url: "images/sample/card_1775806789042_after_0.png",
        note: "after_0",
        type: "after"
      }
    ]
  },
  {
    id: 294,
    player: "Jordan Poole",
    playerCN: "乔丹 普尔",
    brand: "Panini",
    year: "2019-20",
    series: "National Treasures",
    number: "27/99",
    status: "confirmed",
    category: "fake-patch",
    source: "https://www.youtube.com/watch?v=IaIFVyGzNzI",
    images: [
      {
        url: "images/sample/card_1775807566205_after_0.png",
        note: "after_0",
        type: "after"
      }
    ]
  },
  {
    id: 295,
    player: "Steve Nash",
    playerCN: "史蒂夫 纳什",
    brand: "Upper Deck",
    year: "2005",
    series: "Exquisite Collection",
    number: "2/50",
    status: "confirmed",
    category: "fake-patch",
    source: "https://www.youtube.com/watch?v=IaIFVyGzNzI",
    images: [
      {
        url: "images/sample/card_1775807635256_after_0.png",
        note: "after_0",
        type: "after"
      }
    ]
  },
  {
    id: 296,
    player: "Cade Cunningham",
    playerCN: "凯德·坎宁安",
    brand: "Panini",
    year: "2021-22",
    series: "Impeccable Elegance",
    number: "88/99",
    status: "confirmed",
    category: "fake-patch",
    source: "https://www.youtube.com/watch?v=IaIFVyGzNzI",
    images: [
      {
        url: "images/sample/card_1775807763302_after_0.png",
        note: "after_0",
        type: "after"
      }
    ]
  },
  {
    id: 297,
    player: "Norman Powell",
    playerCN: "诺曼 鲍威尔",
    brand: "Panini",
    year: "2022-23",
    series: "Noir",
    number: "3/5",
    status: "confirmed",
    category: "fake-patch",
    source: "https://www.youtube.com/watch?v=IaIFVyGzNzI",
    images: [
      {
        url: "images/sample/card_1775807839755_after_0.png",
        note: "after_0",
        type: "after"
      }
    ]
  },
  {
    id: 298,
    player: "Shaquille O'Neal",
    playerCN: "沙奎尔·奥尼尔",
    brand: "Panini",
    year: "2012-13",
    series: "Immaculate Collection",
    number: "30/32",
    status: "confirmed",
    category: "fake-patch",
    source: "https://www.ozcardtrader.com.au/threads/official-real-fake-card-thread.174483/",
    images: [
      {
        url: "images/sample/card_1775813878577_after_0.jpg",
        note: "after_0",
        type: "after"
      }
    ]
  }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = cardsData;
}
