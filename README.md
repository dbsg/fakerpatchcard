# 🏀 球星卡换Patch记录系统

一个用于记录和追踪被换Patch的球星卡的静态网站项目。通过照片对比帮助收藏者识别可疑卡片。

## ✨ 功能特点

- 📋 **卡片信息展示**：球员、品牌、年份、系列、编号等完整信息
- 📸 **照片历史追踪**：记录同一张卡片在不同时间点的照片，对比Patch变化
- 🔍 **搜索和筛选**：支持按球员名、系列、编号搜索，按品牌和年份筛选
- 📱 **响应式设计**：完美适配PC和移动设备
- 🖼️ **图片查看器**：点击放大查看照片细节，支持键盘导航
- ⚠️ **风险提示**：自动标识有变化记录的卡片

## 🚀 快速开始

### 在线访问

项目部署在 GitHub Pages：

```
https://yourusername.github.io/card/
```

### 本地预览

1. 克隆项目：
```bash
git clone https://github.com/yourusername/card.git
cd card
```

2. 直接用浏览器打开 `index.html` 文件即可

### 部署到 GitHub Pages

1. 在 GitHub 创建仓库 `card`

2. 推送代码：
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/card.git
git push -u origin main
```

3. 在 GitHub 仓库设置中：
   - 进入 **Settings** → **Pages**
   - Source 选择 **main** 分支
   - 保存后等待几分钟即可访问

## 📁 项目结构

```
card/
├── index.html              # 首页（卡片列表）
├── detail.html             # 详情页（照片历史）
├── css/
│   └── style.css          # 样式文件
├── js/
│   ├── app.js             # 首页逻辑
│   ├── detail.js          # 详情页逻辑
│   └── data.js            # 数据文件
├── images/
│   ├── placeholder.jpg    # 占位图
│   └── sample/            # 示例图片目录
└── README.md
```

## 📝 添加新卡片数据

编辑 `js/data.js` 文件，在 `cardsData` 数组中添加新卡片：

```javascript
{
  id: 6,                                    // 唯一ID
  player: "球员名称",
  brand: "Panini",                          // 品牌
  year: "2024",                             // 年份
  series: "Prizm",                          // 系列
  number: "#123",                           // 编号
  images: [
    {
      url: "images/sample/card-1.jpg",     // 图片路径
      date: "2024-01-01",                   // 日期
      note: "首次记录 - 来源说明"          // 备注
    },
    {
      url: "images/sample/card-2.jpg",
      date: "2024-06-01",
      note: "发现变化 - patch明显不同"
    }
  ]
}
```

## 🖼️ 添加图片

1. 将图片文件放入 `images/sample/` 目录（或自定义子目录）
2. 建议图片命名规范：`球员名-序号.jpg`
3. 推荐图片尺寸：宽度 800-1200px
4. 建议压缩图片以加快加载速度

## 🎨 技术栈

- **HTML5**：语义化结构
- **CSS3**：响应式布局、Flexbox、Grid
- **JavaScript (ES6+)**：原生JS，无依赖
- **GitHub Pages**：免费静态网站托管

## 📱 响应式设计

- **PC端**：网格布局，3-4列卡片展示
- **平板**：2列布局
- **手机**：单列布局，触摸优化

## 🔍 SEO 优化建议

在 `index.html` 的 `<head>` 中添加：

```html
<meta name="description" content="球星卡换Patch记录系统，帮助收藏者识别可疑卡片">
<meta name="keywords" content="球星卡,Patch,换Patch,收藏,鉴别">
<meta property="og:title" content="球星卡换Patch记录系统">
<meta property="og:description" content="记录被换Patch的球星卡，帮助收藏者避坑">
```

## 🛡️ 免责声明

- 本站信息仅供参考，不构成法律依据
- 数据来源于公开渠道，可能存在误差
- 交易前请务必自行核实
- 建议通过正规渠道购买

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

如果你发现可疑卡片，可以通过以下方式贡献：

1. Fork 本项目
2. 添加卡片数据和照片
3. 提交 Pull Request
4. 等待审核合并

## 📮 联系方式

- GitHub Issues: [提交问题](https://github.com/yourusername/card/issues)
- Email: your.email@example.com

---

**⚠️ 重要提醒**：购买高价卡片前，请务必通过多个渠道核实卡片真伪，避免经济损失。
