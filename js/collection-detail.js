const seriesDetail = {
  seriesData: typeof collectionData !== 'undefined' ? collectionData : [],
  series: null,
  viewMode: localStorage.getItem('imageViewMode') || 'large',
  imageDetailSlide: 0,

  cardFeatureLabels: {
    same_back: '同背',
    double_same_back: '双同背',
    rookie_patch_auto: 'RPA',
    true_rookie_patch_auto: '正 RPA',
    rookie_card: 'RC',
    true_rookie_card: '正 RC',
    on_card_auto: '卡签',
    sticker_auto: '贴签',
    logoman: 'Logoman',
    team_logo_patch: '队标切割',
    letter_patch: '字母切割',
    jersey_number_patch: '号码切割',
    shoe_patch: '鞋切割',
    ball_patch: '球皮切割',
    game_worn: '比赛亲穿',
    finals_worn: '总决赛亲穿',
    all_star_worn: '全明星亲穿',
    christmas_worn: '圣诞大战亲穿',
    non_associated: '非关联物料',
    one_of_one: '1/1',
    first_print: '首编',
    last_print: '尾编',
    ssp: '大比例 SSP',
    color_match: 'Color Match',
    diamond: '钻石',
    np: 'NP',
    npa: 'NPA',
    lake_blue: '湖水蓝',
    signature_pose: '招牌动作',
    data: '数据',
    data_stat: '数据',
    sealed_brick: '原封砖',
    rookie_year: '元年',
    final_year: '末年'
  },

  sourceTypeLabels: {
    user_photo: '实拍图片',
    auction_platform: '拍卖平台',
    auction: '拍卖平台',
    social_share: '网络分享',
    web_ref: '网络分享',
    web_public: '网络公开资料',
    user_submission: '公开反馈',
    manual_curation: '小丁卡册人工整理',
    official_image: '官方/评级资料',
    official: '官方图',
    grading_db: '评级机构数据库',
    other: '其他'
  },

  referenceCategoryLabels: {
    'fake-patch': 'Patch 异常',
    counterfeit: '假卡',
    'fake-auto': '签字异常'
  },

  isFreeMode(s) {
    const cl = s.checklist || []
    return cl.length === 0 && !s.hasSubset
  },

  progress() {
    return typeof collectionProgress !== 'undefined' ? collectionProgress : null
  },

  init() {
    let params = new URLSearchParams(window.location.search)
    if (!params.get('id') && !params.get('idx') && window.location.hash) {
      params = new URLSearchParams(window.location.hash.slice(1))
    }
    const id = params.get('id')
    const idx = parseInt(params.get('idx'))
    if (id) {
      this.series = this.seriesData.find(s => s._id === id) || null
    }
    if (!this.series && !isNaN(idx)) {
      this.series = this.seriesData[idx] || null
    }

    if (!this.series) {
      document.getElementById('seriesTitle').textContent = '系列不存在'
      document.getElementById('mainContent').style.display = 'block'
      document.getElementById('seriesContent').innerHTML = '<div class="col-empty">未找到该系列</div>'
      return
    }

    document.getElementById('seriesTitle').textContent = this.series.name
    document.title = `${this.series.name} - 小丁卡册`
    const descEl = document.getElementById('seriesDesc')
    if (descEl) descEl.textContent = this.series.description || ''
    this.showContent()
  },

  showContent() {
    document.getElementById('mainContent').style.display = 'block'
    this.renderToolbar()
    this.renderDetail()
  },

  countAllImages() {
    const s = this.series
    if (this.isFreeMode(s)) return (s.freeImages || []).length
    return (s.checklist || []).reduce((sum, item) => sum + (item.images || []).length, 0)
  },

  buildFreeStats(series) {
    const images = this.sortImages(series.freeImages || [], '')
    const urls = images.map(img => (typeof img === 'string' ? img : img.url)).filter(Boolean)
    const rawTarget = Number(series.completionTarget)
    let total = Number.isInteger(rawTarget) && rawTarget > 0 ? rawTarget : urls.length
    if (rawTarget === 0) total = 0
    const collected = total ? Math.min(total, urls.length) : 0
    return {
      totalCards: total,
      withImages: collected,
      missing: Math.max(0, total - collected),
      listImageCount: urls.length,
      listRecentImages: urls.slice(-5).reverse()
    }
  },

  buildSeriesStats() {
    const s = this.series || {}
    const progress = this.progress()
    if (this.isFreeMode(s)) return this.buildFreeStats(s)
    if (progress) return progress.buildChecklistProgressStats(s.checklist || [])

    const total = (s.checklist || []).length
    const collected = (s.checklist || []).filter(item => (item.images || []).length > 0).length
    return { totalCards: total, withImages: collected, missing: Math.max(0, total - collected) }
  },

  renderProgressPanel() {
    if (!this.series || !this.series.checklistComplete) return ''
    const stats = this.buildSeriesStats()
    const total = Number(stats.totalCards) || 0
    if (!total) return ''
    const collected = Number(stats.withImages) || 0
    const missing = Math.max(0, Number(stats.missing) || 0)
    return `
      <div class="detail-progress-panel">
        <div class="detail-progress-item active">
          <strong>${total}</strong>
          <span>总数</span>
        </div>
        <div class="detail-progress-item">
          <strong>${collected}</strong>
          <span>已收录</span>
        </div>
        <div class="detail-progress-item">
          <strong>${missing}</strong>
          <span>待补图</span>
        </div>
      </div>
    `
  },

  renderToolbar() {
    const total = this.countAllImages()
    const toolbar = document.getElementById('detailToolbar')
    if (!toolbar) return
    toolbar.innerHTML = `
      ${total > 0 ? `<span class="detail-total-count">共 ${total} 张图片</span>` : ''}
      <button class="detail-view-toggle" onclick="seriesDetail.toggleViewMode()">${this.viewMode === 'large' ? '小图' : '大图'}</button>
    `
  },

  toggleViewMode() {
    this.viewMode = this.viewMode === 'large' ? 'small' : 'large'
    localStorage.setItem('imageViewMode', this.viewMode)
    this.renderToolbar()
    document.querySelectorAll('.col-images').forEach(el => {
      el.classList.toggle('col-images-small', this.viewMode === 'small')
    })
  },

  renderDetail() {
    const s = this.series
    const cl = s.checklist || []
    const content = document.getElementById('seriesContent')
    this._imageDetailMap = {}
    this._imageDetailCounter = 0

    const smallCls = this.viewMode === 'small' ? ' col-images-small' : ''
    const progressPanel = this.renderProgressPanel()
    if (this.isFreeMode(s)) {
      const images = this.sortImages(s.freeImages || [], '')
      content.innerHTML = images.length
        ? `${progressPanel}<div class="col-images${smallCls}">${images.map(img => this.renderImage(img)).join('')}</div>`
        : `${progressPanel}<div class="col-empty-detail">暂无图片</div>`
    } else {
      const groups = this.buildGroups(cl)
      content.innerHTML = progressPanel + groups.map((g, gi) => {
        return `
          ${g.subset ? `<div class="col-subset-header" data-gi="${gi}" onclick="seriesDetail.toggleCollapse(${gi})">
            <span class="col-subset-collapse-icon" id="collapseIcon${gi}">▼</span>
            <span class="col-subset-header-name">${this.escHtml(g._displayTitle || g.subset)}</span>
          </div>` : ''}
          <div class="col-checklist" id="collapseBody${gi}">
            ${g.items.map(item => {
              const sorted = this.sortImages(item.images, item.text)
              const hasImages = sorted.length > 0
              return `
                <div class="col-card-block ${hasImages ? 'col-card-has-images' : ''}">
                  ${item._displayText ? `<div class="col-card-text">${this.escHtml(item._displayText)}${item._isComplete ? ' ✅' : this.escHtml(item._progressLabel || '')}</div>` : ''}
                  ${hasImages ? `<div class="col-images${smallCls}">${sorted.map(img => this.renderImage(img, item)).join('')}</div>` : ''}
                </div>
              `
            }).join('')}
          </div>
        `
      }).join('')
    }
  },

  formatNumberLabel(raw) {
    const s = String(raw || '').trim()
    if (!s) return ''
    if (s.includes('/')) return this.escHtml(s)
    return '#' + this.escHtml(s)
  },

  getSeriesKnownYears() {
    const s = this.series || {}
    const text = [
      s.name,
      s.description,
      s.year,
      s.defaultYear,
      s.defaultCardYear
    ].filter(Boolean).join(' ')
    const matches = text.match(/\b(?:19|20)\d{2}(?:[-–—]\d{2})?\b/g) || []
    return new Set(matches.map(year => String(year).replace(/[–—]/g, '-')))
  },

  shouldShowImageYear(img) {
    const year = String((img && img.year) || '').trim().replace(/[–—]/g, '-')
    if (!year) return false
    return !this.getSeriesKnownYears().has(year)
  },

  shouldShowImageCardKind(img) {
    const cardKind = String((img && img.cardKind) || '').trim()
    if (!cardKind) return false
    const s = this.series || {}
    if (s.defaultInfoEnabled === false) return true
    const defaultCardKind = String(s.defaultCardKind || '').trim()
    if (!defaultCardKind) return true
    return this.normalizeCompareText(cardKind) !== this.normalizeCompareText(defaultCardKind)
  },

  registerImageDetail(img, item) {
    if (!this._imageDetailMap) this._imageDetailMap = {}
    const key = `img_${this._imageDetailCounter || 0}`
    this._imageDetailCounter = (this._imageDetailCounter || 0) + 1
    this._imageDetailMap[key] = { image: img, item }
    return key
  },

  renderImage(rawImg, item = null) {
    const img = typeof rawImg === 'string' ? { url: rawImg } : (rawImg || {})
    const detailKey = this.registerImageDetail(img, item)
    const parts = []
    const progress = this.progress()
    const printRun = progress && item ? progress.getPrintRun(item) : 0
    if (img.number) {
      const number = progress ? progress.normalizeImageNumber(img.number, printRun) : img.number
      parts.push(this.formatNumberLabel(number))
    }
    if (this.shouldShowImageYear(img)) parts.push(this.escHtml(img.year))
    const ckRaw = this.shouldShowImageCardKind(img) ? String(img.cardKind || '').trim() : ''
    const ck = ckRaw ? this.escHtml(ckRaw.charAt(0).toUpperCase() + ckRaw.slice(1)) : ''
    if (ck) {
      if (parts.length) parts.push('· ' + ck)
      else parts.push(ck)
    }
    const label = parts.length ? `<span class="col-img-number">${parts.join(' ')}</span>` : ''
    return `
      <div class="col-img-wrap" onclick="seriesDetail.openImageDetail('${detailKey}', event)">
        <img class="col-img" src="${this.escAttr(img.url)}" alt="" loading="lazy">
        ${label}
      </div>
    `
  },

  normalizeCardFeatureValue(value) {
    const text = String(value || '').trim().toLowerCase().replace(/[\s-]+/g, '_')
    if (!text) return ''
    if (text === 'rc' || text === 'rookie') return 'rookie_card'
    if (text === 'true_rc' || text === '正_rc') return 'true_rookie_card'
    if (text === 'rpa') return 'rookie_patch_auto'
    if (text === 'true_rpa' || text === '正_rpa') return 'true_rookie_patch_auto'
    if (text === '1/1' || text === 'one_of_1') return 'one_of_one'
    if (text === 'signature_pose' || text === 'signaturepose' || text === '招牌动作' || text === '标志动作') return 'signature_pose'
    if (text === 'data_stat' || text === 'datastat' || text === '数据') return 'data_stat'
    if (text === 'sealed_brick' || text === 'sealedbrick' || text === 'factory_sealed_brick' || text === 'factorysealedbrick' || text === '原封砖' || text === '原封磚') return 'sealed_brick'
    return text
  },

  buildCardFeatureLabels(image = {}) {
    const raw = Array.isArray(image.cardFeatures) ? image.cardFeatures : []
    const values = [...new Set(raw.map(value => this.normalizeCardFeatureValue(value)).filter(Boolean))]
    return values.map(value => this.cardFeatureLabels[value] || value)
  },

  getPrintRun(item = {}) {
    const raw = Number(item.printRun || item.completionTarget || 0)
    if (Number.isInteger(raw) && raw > 0) return raw
    const text = String(item.text || '')
    const match = text.match(/\/\s*(\d+)\s*$/)
    return match ? parseInt(match[1], 10) : 0
  },

  extractYearFromSeries() {
    const years = Array.from(this.getSeriesKnownYears())
    return years[0] || ''
  },

  extractBrandFromSeries() {
    const text = `${this.series && this.series.name || ''} ${this.series && this.series.description || ''}`
    const brands = ['Panini', 'Upper Deck', 'Topps', 'Fleer', 'SkyBox', 'Bowman']
    return brands.find(brand => new RegExp(`\\b${brand}\\b`, 'i').test(text)) || ''
  },

  extractPlayerFromItemText(text = '') {
    const cleaned = String(text || '')
      .replace(/^\s*\d+[A-Z-]*\s+/, '')
      .replace(/\s+#\/?\d+\s*$/i, '')
      .replace(/\s+\/\d+\s*$/, '')
      .trim()
    if (!cleaned) return ''
    const dashParts = cleaned.split(/\s+[–—-]\s+/)
    const main = dashParts.length > 1 ? dashParts[0] : cleaned
    return main.split(',')[0].trim()
  },

  buildSourceDisplay(image = {}) {
    const typeLabel = this.sourceTypeLabels[image.sourceType] || ''
    const note = this.sanitizePublicSourceText(image.source || image.sourceNote || image.sourceUrl || '')
    return [typeLabel, note].filter(Boolean).join(' · ')
  },

  sanitizePublicSourceText(value) {
    return String(value || '')
      .replace(/小程序用[户戶]反馈/g, '小程序反馈')
      .replace(/用[户戶]投稿/g, '公开反馈')
      .replace(/用[户戶]实拍/g, '实拍图片')
      .replace(/上传用[户戶]\s*[:：]?\s*[A-Za-z0-9_-]*/g, '')
      .trim()
  },

  buildImageDetailMeta(image = {}, item = {}) {
    const progress = this.progress()
    const printRun = this.getPrintRun(item)
    const number = image.number
      ? (progress ? progress.normalizeImageNumber(image.number, printRun) : image.number)
      : ''
    const cardKind = String(image.cardKind || '').trim()
    const player = String(image.player || this.extractPlayerFromItemText(item.text) || '').trim()
    const year = String(image.year || this.extractYearFromSeries()).trim()
    const brand = String(image.brand || this.extractBrandFromSeries()).trim()
    const seriesName = String(image.cardSeries || (this.series && this.series.name) || '').trim()
    const subset = String((item && item.subset) || '').trim()
    const title = [subset, item && item.text].filter(Boolean).join(' / ') || player || '图鉴卡片'
    return {
      title,
      player,
      playerCN: String(image.playerCN || '').trim(),
      year,
      brand,
      seriesName,
      cardKind,
      cardVariant: String(image.cardVariant || '').trim(),
      number,
      printRun,
      features: this.buildCardFeatureLabels(image),
      sourceDisplay: this.buildSourceDisplay(image)
    }
  },

  normalizeCompareText(value) {
    return String(value || '').trim().toLowerCase().replace(/[\s·.\-_'’`/，,、:：()（）[\]【】]+/g, '')
  },

  buildRelatedReferences(meta = {}) {
    const refs = Array.isArray(typeof cardsData !== 'undefined' ? cardsData : []) ? cardsData : []
    const searchText = this.normalizeCompareText([
      meta.player,
      meta.playerCN,
      meta.year,
      meta.brand,
      meta.seriesName,
      meta.number,
      meta.cardKind
    ].filter(Boolean).join(' '))
    if (!searchText) return []
    return refs.map(card => {
      let score = 0
      const player = this.normalizeCompareText(card.player)
      const playerCN = this.normalizeCompareText(card.playerCN)
      const year = this.normalizeCompareText(card.year)
      const series = this.normalizeCompareText(card.series)
      const brand = this.normalizeCompareText(card.brand)
      const number = this.normalizeCompareText(card.number)
      if (player && searchText.includes(player)) score += 3
      else if (playerCN && searchText.includes(playerCN)) score += 3
      if (year && searchText.includes(year)) score += 2
      if (series && searchText.includes(series)) score += 2
      if (brand && searchText.includes(brand)) score += 1
      if (number && searchText.includes(number)) score += 1
      return { ...card, _score: score }
    }).filter(card => card._score >= 5)
      .sort((a, b) => b._score - a._score || b.id - a.id)
      .slice(0, 4)
  },

  renderMetaItem(label, value) {
    if (!value) return ''
    return `
      <div class="image-detail-meta-item">
        <span>${this.escHtml(label)}</span>
        <strong>${this.escHtml(value)}</strong>
      </div>
    `
  },

  renderImageDetailPanel(image = {}, item = {}) {
    const meta = this.buildImageDetailMeta(image, item)
    const references = this.buildRelatedReferences(meta)
    const slides = [
      { label: '正面', url: image.url },
      { label: '背面', url: image.backImageUrl }
    ].filter(slide => slide.url)
    this.imageDetailSlide = Math.min(this.imageDetailSlide || 0, Math.max(0, slides.length - 1))
    const active = slides[this.imageDetailSlide] || slides[0]
    return `
      <div id="imageDetailOverlay" class="image-detail-overlay" onclick="seriesDetail.closeImageDetail()">
        <div class="image-detail-panel" onclick="event.stopPropagation()">
          <button type="button" class="image-detail-close" onclick="seriesDetail.closeImageDetail()">×</button>
          <div class="image-detail-carousel">
            ${active ? `<img src="${this.escAttr(active.url)}" alt="" onclick="seriesDetail.previewImage('${this.escAttr(active.url)}')">` : ''}
            ${slides.length > 1 ? `<div class="image-detail-slide-tabs">
              ${slides.map((slide, index) => `<button type="button" class="${index === this.imageDetailSlide ? 'active' : ''}" onclick="seriesDetail.switchImageDetailSlide(${index})">${this.escHtml(slide.label)}</button>`).join('')}
            </div>` : ''}
          </div>
          <div class="image-detail-content">
            <div class="image-detail-title">${this.escHtml(meta.title)}</div>
            <div class="image-detail-meta-grid">
              ${this.renderMetaItem('球员', meta.player)}
              ${this.renderMetaItem('中文名', meta.playerCN)}
              ${this.renderMetaItem('年份', meta.year)}
              ${this.renderMetaItem('厂商', meta.brand)}
              ${this.renderMetaItem('系列', meta.seriesName)}
              ${this.renderMetaItem('卡种', meta.cardKind)}
              ${this.renderMetaItem('卡片种类', meta.cardVariant)}
              ${this.renderMetaItem('编号', meta.number)}
            </div>
            ${meta.features.length ? `<div class="image-detail-section">
              <div class="image-detail-section-title">特色</div>
              <div class="image-detail-features">${meta.features.map(feature => `<span class="image-detail-feature">${this.escHtml(feature)}</span>`).join('')}</div>
            </div>` : ''}
            ${meta.sourceDisplay ? `<div class="image-detail-section">
              <div class="image-detail-section-title">来源</div>
              <div class="image-detail-source">${this.escHtml(meta.sourceDisplay)}</div>
            </div>` : ''}
            <div class="image-detail-section">
              <div class="image-detail-section-title">关联鉴别参考</div>
              ${references.length ? references.map(card => `<a class="image-detail-reference" href="detail.html?id=${card.id}">
                <span class="image-detail-ref-main">
                  <span class="image-detail-ref-type">${this.escHtml(this.referenceCategoryLabels[card.category || 'fake-patch'] || '鉴别资料')}</span>
                  <span class="image-detail-ref-status ${card.status === 'suspected' ? 'suspected' : 'confirmed'}">${card.status === 'suspected' ? '高度存疑' : '明确异常'}</span>
                </span>
                <span class="image-detail-ref-name">${this.escHtml([card.player, card.year, card.series].filter(Boolean).join(' · '))}</span>
                <span class="image-detail-ref-number">${this.escHtml(card.number || '')}</span>
              </a>`).join('') : '<div class="image-detail-empty">暂无自动关联资料</div>'}
            </div>
          </div>
        </div>
      </div>
    `
  },

  openImageDetail(key, event) {
    if (event && event.stopPropagation) event.stopPropagation()
    const record = this._imageDetailMap && this._imageDetailMap[key]
    if (!record || !record.image) return
    this._activeImageDetail = record
    this.imageDetailSlide = 0
    this.ensureImageDetailRoot()
    this.updateImageDetailPanel()
  },

  ensureImageDetailRoot() {
    if (document.getElementById('imageDetailRoot')) return
    const root = document.createElement('div')
    root.id = 'imageDetailRoot'
    document.body.appendChild(root)
  },

  updateImageDetailPanel() {
    const root = document.getElementById('imageDetailRoot')
    if (!root || !this._activeImageDetail) return
    root.innerHTML = this.renderImageDetailPanel(this._activeImageDetail.image, this._activeImageDetail.item)
  },

  switchImageDetailSlide(index) {
    this.imageDetailSlide = index
    this.updateImageDetailPanel()
  },

  closeImageDetail() {
    const root = document.getElementById('imageDetailRoot')
    if (root) root.innerHTML = ''
    this._activeImageDetail = null
  },

  buildGroups(checklist) {
    const progress = this.progress()
    const groups = []
    let current = null
    checklist.forEach(item => {
      const raw = item.subset || ''
      const subset = raw.startsWith('_batch_') ? '' : raw
      if (!current || subset !== current.subset) {
        current = { subset, items: [] }
        groups.push(current)
      }
      const normalized = { ...item }
      if (progress) {
        normalized._printRun = progress.getPrintRun(normalized)
        normalized._completionTarget = progress.getCompletionTarget(normalized)
        normalized._collectedCount = progress.getItemCollectedCount(normalized)
        normalized._isComplete = normalized._completionTarget > 0 && normalized._collectedCount >= normalized._completionTarget
        normalized._progressLabel = normalized._completionTarget > 0 && !normalized._isComplete
          ? `（${normalized._collectedCount}/${normalized._completionTarget}）`
          : ''
      } else {
        normalized._completionTarget = 1
        normalized._collectedCount = (normalized.images || []).length > 0 ? 1 : 0
        normalized._isComplete = normalized._collectedCount >= normalized._completionTarget
        normalized._progressLabel = normalized._isComplete ? '' : `（${normalized._collectedCount}/1）`
      }
      normalized._displayText = this.buildCardDisplayText(normalized)
      current.items.push(normalized)
    })
    groups.forEach(group => {
      if (!progress || !group.subset) return
      const stats = progress.buildChecklistProgressStats(group.items)
      const total = Number(stats.totalCards) || 0
      const collected = Number(stats.withImages) || 0
      const isComplete = total > 0 && collected >= total
      group._displayTitle = `${group.subset}${isComplete ? ' ✅' : (total > 0 ? `（${collected}/${total}）` : '')}`
    })
    return groups
  },

  buildCardDisplayText(item) {
    const text = String((item && item.text) || '').trim()
    if (!text) return ''
    const progress = this.progress()
    const printRun = progress ? progress.getPrintRun(item) : 0
    if (!printRun) return text
    if (/\/\s*[1-9]\d{0,5}\s*$/.test(text)) return text
    return `${text} /${printRun}`
  },

  sortImages(images, text) {
    if (!images || !images.length) return []
    const isNumbered = /\/\d+\s*$/.test(text || '')
    const hasAny = isNumbered || images.some(i =>
      (i.number && i.number.trim()) || (i.year && i.year.trim()) || (i.cardKind && String(i.cardKind).trim()))
    if (!hasAny) return [...images]
    const parseYear = y => { const m = (y || '').match(/^(\d{4})/); return m ? parseInt(m[1]) : 9999 }
    const parseNum = n => {
      if (!n) return { num: 9999, den: -1 }
      const s = String(n).trim(), si = s.indexOf('/')
      if (si >= 0) return { num: parseInt(s.slice(0, si)) || 9999, den: parseInt(s.slice(si + 1)) || 9999 }
      return { num: parseInt(s) || 9999, den: -1 }
    }
    return [...images].sort((a, b) => {
      const ya = parseYear(a.year), yb = parseYear(b.year)
      if (ya !== yb) return ya - yb
      const ckCmp = String(a.cardKind || '').localeCompare(String(b.cardKind || ''))
      if (ckCmp !== 0) return ckCmp
      const pa = parseNum(a.number), pb = parseNum(b.number)
      if (pa.num !== pb.num) return pa.num - pb.num
      if (pa.den === -1 && pb.den !== -1) return -1
      if (pa.den !== -1 && pb.den === -1) return 1
      return pa.den - pb.den
    })
  },

  toggleCollapse(gi) {
    const body = document.getElementById('collapseBody' + gi)
    const icon = document.getElementById('collapseIcon' + gi)
    if (!body) return
    body.classList.toggle('collapsed')
    if (icon) icon.classList.toggle('collapsed', body.classList.contains('collapsed'))
  },

  previewImage(url) {
    document.getElementById('previewImg').src = url
    document.getElementById('imagePreview').style.display = 'flex'
  },

  closePreview() {
    document.getElementById('imagePreview').style.display = 'none'
    document.getElementById('previewImg').src = ''
  },

  escHtml(s) {
    const d = document.createElement('div')
    d.textContent = s
    return d.innerHTML
  },

  escAttr(s) {
    return String(s || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '&quot;')
  }
}

document.addEventListener('DOMContentLoaded', () => {
  seriesDetail.init()
})
