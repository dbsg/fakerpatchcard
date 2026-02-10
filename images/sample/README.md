# 图片目录说明

## 📂 目录结构

将球星卡照片放在此目录下，建议按以下规范命名：

```
images/sample/
├── lebron-1.jpg          # LeBron James 第一张照片
├── lebron-2.jpg          # LeBron James 第二张照片
├── curry-1.jpg           # Stephen Curry 第一张照片
├── curry-2.jpg
└── ...
```

## 📸 图片规范

### 命名规则
- 格式：`球员名-序号.jpg`
- 使用英文或拼音
- 序号从1开始递增
- 示例：`lebron-1.jpg`, `curry-2.jpg`

### 技术要求
- **格式**：JPG、PNG
- **宽度**：建议 800-1200px
- **文件大小**：建议 < 500KB（压缩后）
- **比例**：建议 2:3 或 3:4（球星卡标准比例）

### 拍摄要求
- **清晰度**：必须能清楚看到Patch细节
- **光线**：避免反光，自然光最佳
- **角度**：正面平拍，避免倾斜
- **焦点**：对焦在Patch区域

## 🔧 图片压缩工具推荐

在线工具：
- [TinyPNG](https://tinypng.com/) - 智能压缩
- [Squoosh](https://squoosh.app/) - Google开源工具
- [Compressor.io](https://compressor.io/)

命令行工具：
```bash
# ImageMagick
convert input.jpg -quality 85 -resize 1200x output.jpg

# ImageOptim (macOS)
imageoptim image.jpg
```

## 📋 图片来源说明

记录图片时，请在 `data.js` 的 `note` 字段中注明来源：

```javascript
{
  url: "images/sample/lebron-1.jpg",
  date: "2024-01-15",
  note: "eBay拍卖 #123456 - 原装patch单色橙色"
}
```

常见来源：
- eBay 拍卖
- PWCC 拍卖
- Goldin 拍卖
- Instagram 晒卡
- 小红书/微博
- Break 视频截图
- 个人收藏

## ⚠️ 注意事项

1. **版权**：仅使用公开发布的照片
2. **隐私**：不要包含个人信息
3. **质量**：模糊照片无法作为证据
4. **真实性**：确保照片未经PS修改

## 🆕 添加新图片流程

1. 准备图片文件（按上述规范）
2. 放入 `images/sample/` 目录
3. 编辑 `js/data.js` 添加数据
4. 本地预览测试
5. 提交 Git 并推送

```bash
git add images/sample/new-image.jpg
git add js/data.js
git commit -m "Add new card: Player Name"
git push
```
