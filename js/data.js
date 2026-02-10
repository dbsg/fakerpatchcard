// 球星卡数据
// 格式说明：
// - id: 唯一标识符
// - player: 球员名称
// - brand: 品牌
// - year: 年份
// - series: 系列
// - number: 编号
// - images: 照片数组
//   - url: 图片路径（相对于项目根目录）
//   - date: 拍摄/上传日期
//   - note: 备注说明

const cardsData = [
  {
    id: 1,
    player: "LeBron James",
    brand: "Panini",
    year: "2023",
    series: "Prizm",
    number: "#123",
    images: [
      {
        url: "images/sample/lebron-1.jpg",
        date: "2024-01-15",
        note: "首次记录 - eBay拍卖照片，patch为单色橙色"
      },
      {
        url: "images/sample/lebron-2.jpg",
        date: "2024-06-20",
        note: "发现变化 - 二次出售时patch变为三色带Logo，疑似被换"
      }
    ]
  },
  {
    id: 2,
    player: "Stephen Curry",
    brand: "Panini",
    year: "2022",
    series: "Optic",
    number: "#45",
    images: [
      {
        url: "images/sample/curry-1.jpg",
        date: "2023-03-10",
        note: "Instagram晒卡照片 - 原始patch为蓝色单色"
      },
      {
        url: "images/sample/curry-2.jpg",
        date: "2024-01-05",
        note: "PWCC拍卖 - patch变为Warriors Logo多色patch"
      },
      {
        url: "images/sample/curry-3.jpg",
        date: "2024-08-15",
        note: "再次出现 - 第三次交易时patch又有不同"
      }
    ]
  },
  {
    id: 3,
    player: "Giannis Antetokounmpo",
    brand: "Panini",
    year: "2023",
    series: "National Treasures",
    number: "#78",
    images: [
      {
        url: "images/sample/giannis-1.jpg",
        date: "2024-02-20",
        note: "Break视频截图 - 原装patch"
      },
      {
        url: "images/sample/giannis-2.jpg",
        date: "2024-07-10",
        note: "eBay出售 - patch明显不同，疑似被换"
      }
    ]
  },
  {
    id: 4,
    player: "Luka Dončić",
    brand: "Panini",
    year: "2022",
    series: "Flawless",
    number: "#12",
    images: [
      {
        url: "images/sample/luka-1.jpg",
        date: "2023-11-05",
        note: "首次记录 - 小红书晒卡"
      }
    ]
  },
  {
    id: 5,
    player: "Kevin Durant",
    brand: "Upper Deck",
    year: "2023",
    series: "Premier",
    number: "#88",
    images: [
      {
        url: "images/sample/kd-1.jpg",
        date: "2024-04-12",
        note: "Goldin拍卖 - 原装patch"
      },
      {
        url: "images/sample/kd-2.jpg",
        date: "2024-09-01",
        note: "再次拍卖 - patch完全不同"
      }
    ]
  }
];

// 导出数据
if (typeof module !== 'undefined' && module.exports) {
  module.exports = cardsData;
}
