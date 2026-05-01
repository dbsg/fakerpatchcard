const seriesDetail = {
  seriesData: typeof collectionData !== 'undefined' ? collectionData : [],
  series: null,
  viewMode: localStorage.getItem('imageViewMode') || 'large',

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
    const total = Number.isInteger(rawTarget) && rawTarget > 0 ? rawTarget : urls.length
    const collected = total ? Math.min(total, urls.length) : urls.length
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

  renderImage(img, item = null) {
    const parts = []
    const progress = this.progress()
    const printRun = progress && item ? progress.getPrintRun(item) : 0
    if (img.number) {
      const number = progress ? progress.normalizeImageNumber(img.number, printRun) : img.number
      parts.push(this.formatNumberLabel(number))
    }
    if (img.year) parts.push(this.escHtml(img.year))
    const ckRaw = (img.cardKind && String(img.cardKind).trim()) ? img.cardKind.trim() : ''
    const ck = ckRaw ? this.escHtml(ckRaw.charAt(0).toUpperCase() + ckRaw.slice(1)) : ''
    if (ck) {
      if (parts.length) parts.push('· ' + ck)
      else parts.push(ck)
    }
    const label = parts.length ? `<span class="col-img-number">${parts.join(' ')}</span>` : ''
    return `
      <div class="col-img-wrap" onclick="seriesDetail.previewImage('${this.escAttr(img.url)}')">
        <img class="col-img" src="${this.escAttr(img.url)}" alt="" loading="lazy">
        ${label}
      </div>
    `
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
    return s.replace(/'/g, "\\'").replace(/"/g, '&quot;')
  }
}

document.addEventListener('DOMContentLoaded', () => {
  seriesDetail.init()
})
