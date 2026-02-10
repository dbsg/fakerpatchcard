# 🚀 部署指南

## 方法一：GitHub Pages（推荐）

### 步骤 1：创建 GitHub 仓库

1. 登录 [GitHub](https://github.com)
2. 点击右上角 `+` → `New repository`
3. 填写信息：
   - Repository name: `card`
   - Description: `球星卡换Patch记录系统`
   - Public（公开）
4. 点击 `Create repository`

### 步骤 2：上传代码

在项目目录执行：

```bash
# 初始化 Git（如果还没有）
git init

# 添加所有文件
git add .

# 提交
git commit -m "feat: init card patch tracker"

# 添加远程仓库（替换 yourusername）
git remote add origin https://github.com/yourusername/card.git

# 推送到 GitHub
git branch -M main
git push -u origin main
```

### 步骤 3：启用 GitHub Pages

1. 进入仓库页面
2. 点击 **Settings**（设置）
3. 左侧菜单点击 **Pages**
4. **Source** 选择：
   - Branch: `main`
   - Folder: `/ (root)`
5. 点击 **Save**
6. 等待 1-2 分钟，页面会显示访问链接

### 步骤 4：访问网站

访问地址格式：
```
https://yourusername.github.io/card/
```

例如：
```
https://johndoe.github.io/card/
```

### 步骤 5：更新内容

每次修改后：

```bash
git add .
git commit -m "update: add new card data"
git push
```

等待 1-2 分钟自动部署完成。

---

## 方法二：Netlify（免费且快速）

### 优点
- ✅ 部署更快（< 30秒）
- ✅ 自动 HTTPS
- ✅ 自定义域名
- ✅ 表单功能

### 步骤

1. 访问 [Netlify](https://www.netlify.com/)
2. 注册/登录账号
3. 点击 **Add new site** → **Import an existing project**
4. 连接 GitHub 仓库
5. 部署设置：
   - Build command: （留空）
   - Publish directory: （留空或 `/`）
6. 点击 **Deploy**

完成后获得网址：
```
https://random-name-123.netlify.app
```

可在设置中自定义域名。

---

## 方法三：Vercel（开发者友好）

### 优点
- ✅ 极快的全球CDN
- ✅ 自动部署预览
- ✅ 支持 Serverless Functions

### 步骤

1. 访问 [Vercel](https://vercel.com/)
2. 使用 GitHub 登录
3. 点击 **Add New** → **Project**
4. 选择 `card` 仓库
5. 保持默认设置，点击 **Deploy**

完成后获得网址：
```
https://card.vercel.app
```

---

## 方法四：Cloudflare Pages

### 优点
- ✅ 无限带宽
- ✅ 全球CDN
- ✅ 快速构建

### 步骤

1. 访问 [Cloudflare Pages](https://pages.cloudflare.com/)
2. 登录/注册
3. 连接 GitHub
4. 选择 `card` 仓库
5. 构建设置：
   - Build command: （留空）
   - Build output directory: `/`
6. 保存并部署

---

## 自定义域名

### GitHub Pages

1. 购买域名（如 `cardtracker.com`）
2. 在域名 DNS 设置中添加：
   ```
   类型: CNAME
   名称: www
   值: yourusername.github.io
   ```
3. 在仓库 Settings → Pages → Custom domain 填入域名
4. 等待 DNS 生效（几分钟到几小时）

### Netlify/Vercel

在控制台中直接添加自定义域名，按提示配置 DNS 即可。

---

## 本地测试

### 方法 1：直接打开

双击 `index.html` 在浏览器中打开

### 方法 2：本地服务器（推荐）

**Python 3:**
```bash
python3 -m http.server 8000
```

**Node.js (http-server):**
```bash
npx http-server -p 8000
```

**VS Code:**
安装 `Live Server` 插件，右键 `index.html` → `Open with Live Server`

访问：`http://localhost:8000`

---

## 性能优化建议

### 1. 图片优化
```bash
# 批量压缩图片
cd images/sample
for img in *.jpg; do
  convert "$img" -quality 85 -resize 1200x "optimized-$img"
done
```

### 2. 启用缓存

在根目录创建 `_headers` 文件（Netlify/Cloudflare）：
```
/images/*
  Cache-Control: public, max-age=31536000
/css/*
  Cache-Control: public, max-age=31536000
/js/*
  Cache-Control: public, max-age=31536000
```

### 3. 添加 CDN

将大图片放到图床：
- [imgur](https://imgur.com/)
- [SM.MS](https://sm.ms/)
- [阿里云 OSS](https://www.aliyun.com/product/oss)

---

## 常见问题

### Q: 404 错误？
A: 检查 GitHub Pages 是否已启用，等待 1-2 分钟部署完成。

### Q: 样式不显示？
A: 检查 CSS/JS 文件路径是否正确，确保使用相对路径。

### Q: 图片不显示？
A: 确认图片文件已上传到仓库，路径正确。

### Q: 如何更新数据？
A: 编辑 `js/data.js`，提交并推送到 GitHub。

### Q: 支持搜索引擎收录吗？
A: 支持。可在 Google Search Console 提交站点地图。

---

## 监控和分析

### Google Analytics

在 `index.html` 的 `</head>` 前添加：

```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

### 百度统计

```html
<script>
var _hmt = _hmt || [];
(function() {
  var hm = document.createElement("script");
  hm.src = "https://hm.baidu.com/hm.js?xxxxxxxx";
  var s = document.getElementsByTagName("script")[0];
  s.parentNode.insertBefore(hm, s);
})();
</script>
```

---

需要帮助？提交 [Issue](https://github.com/yourusername/card/issues)
