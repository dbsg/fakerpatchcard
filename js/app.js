// 异常资料首页
const app = {
  pageSize: 12,
  displayCount: 12,
  activeCategory: '',
  viewMode: 'problems',
  searchTimer: null,
  filteredCards: [],
  categoryOptions: [
    { value: '', label: '全部类型' },
    { value: 'fake-patch', label: '换 Patch' },
    { value: 'fake-auto', label: '签字异常' },
    { value: 'counterfeit', label: '假卡' }
  ],

  allCards: cardsData.map(card => ({
    ...card,
    category: card.category || 'fake-patch',
    images: Array.isArray(card.images) ? card.images.filter(image => image && image.url) : []
  })),

  escAttr(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/</g, '&lt;')
  },

  escHtml(value) {
    const div = document.createElement('div')
    div.textContent = String(value == null ? '' : value)
    return div.innerHTML
  },

  cleanText(value) {
    return String(value || '').trim()
  },

  normalizeSearch(value) {
    return this.cleanText(value)
      .toLowerCase()
      .replace(/[\s·.\-_'’`/，,、:：()（）[\]【】#]+/g, '')
  },

  buildKeywordTerms(keyword = '') {
    const raw = this.cleanText(keyword)
    if (!raw) return []
    const parts = raw.split(/[\s,，、]+/).map(value => this.normalizeSearch(value)).filter(Boolean)
    if (parts.length > 1) return [...new Set(parts)]
    const compact = this.normalizeSearch(raw)
    const mixedParts = compact.match(/[a-z\u3400-\u9fff]+|\d+/g)
    if (mixedParts && mixedParts.length > 1 && mixedParts.join('') === compact) return [...new Set(mixedParts)]
    return compact ? [compact] : []
  },

  buildCardSearchText(card = {}) {
    return [
      card.id,
      card.player,
      card.playerCN,
      card.brand,
      card.year,
      card.series,
      card.cardKind,
      card.cardName,
      card.productNumber,
      card.serialNumber,
      card.highRiskReason,
      card.source,
      Array.isArray(card.qualityTags) ? card.qualityTags.join(' ') : ''
    ].filter(Boolean).join(' ')
  },

  categoryLabel(category) {
    if (category === 'fake-auto') return '签字异常'
    if (category === 'counterfeit') return '假卡'
    if (category === 'backup') return '备份资料'
    return '换 Patch'
  },

  playerDisplay(card = {}) {
    const player = this.cleanText(card.player)
    const playerCN = this.cleanText(card.playerCN)
    if (!playerCN || player.includes(playerCN)) return player || playerCN
    return player ? `${player} / ${playerCN}` : playerCN
  },

  numberText(card = {}) {
    return [card.productNumber, card.serialNumber].map(value => this.cleanText(value)).filter(Boolean).join(' · ')
  },

  metaText(card = {}) {
    return [card.year, card.brand, card.series, card.cardKind || card.cardName]
      .map(value => this.cleanText(value))
      .filter(Boolean)
      .join(' · ')
  },

  init() {
    this.renderCategoryFilters()
    this.bindInteractions()
    this.applyFilters()
    document.getElementById('loading').hidden = true
  },

  renderCategoryFilters() {
    const root = document.getElementById('categoryFilterTags')
    root.innerHTML = this.categoryOptions.map(item => `
      <button type="button" class="category-filter-tag ${this.activeCategory === item.value ? 'active' : ''}" data-category="${this.escAttr(item.value)}">
        ${this.escHtml(item.label)}
      </button>
    `).join('')
  },

  bindInteractions() {
    const searchInput = document.getElementById('searchInput')
    const searchClear = document.getElementById('searchClear')

    searchInput.addEventListener('input', () => {
      searchClear.hidden = !searchInput.value
      clearTimeout(this.searchTimer)
      this.searchTimer = setTimeout(() => this.applyFilters(), 80)
    })
    searchClear.addEventListener('click', () => {
      clearTimeout(this.searchTimer)
      searchInput.value = ''
      searchClear.hidden = true
      searchInput.focus()
      this.applyFilters()
    })

    document.getElementById('categoryFilterTags').addEventListener('click', event => {
      const target = event.target.closest('[data-category]')
      if (!target) return
      this.setCategoryFilter(target.dataset.category || '')
    })

    document.getElementById('backupButton').addEventListener('click', () => this.switchMode('backups'))
    document.getElementById('backToProblems').addEventListener('click', () => this.switchMode('problems'))
    document.getElementById('loadMore').addEventListener('click', () => this.loadMore())

    const guideDialog = document.getElementById('guideDialog')
    document.getElementById('guideButton').addEventListener('click', () => guideDialog.showModal())
    document.getElementById('guideClose').addEventListener('click', () => guideDialog.close())
    guideDialog.addEventListener('click', event => {
      if (event.target === guideDialog) guideDialog.close()
    })

    const backTop = document.getElementById('backTop')
    backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }))
    window.addEventListener('scroll', () => {
      backTop.classList.toggle('show', window.scrollY > 800)
    }, { passive: true })

    if ('IntersectionObserver' in window) {
      this.loadObserver = new IntersectionObserver(entries => {
        if (entries.some(entry => entry.isIntersecting) && !document.getElementById('loadMore').hidden) this.loadMore()
      }, { rootMargin: '240px' })
      this.loadObserver.observe(document.getElementById('loadMore'))
    }
  },

  switchMode(mode) {
    this.viewMode = mode === 'backups' ? 'backups' : 'problems'
    this.activeCategory = ''
    document.getElementById('searchInput').value = ''
    document.getElementById('searchClear').hidden = true
    document.getElementById('backupHero').hidden = this.viewMode !== 'backups'
    document.getElementById('problemFilters').hidden = this.viewMode === 'backups'
    document.getElementById('guideButton').hidden = this.viewMode === 'backups'
    document.getElementById('backupButton').hidden = this.viewMode === 'backups'
    document.getElementById('countUnit').textContent = this.viewMode === 'backups' ? '条备份' : '条资料'
    document.getElementById('feedbackButton').textContent = this.viewMode === 'backups' ? '反馈备份资料' : '反馈异常卡片'
    this.applyFilters()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  },

  setCategoryFilter(category) {
    this.activeCategory = category || ''
    this.renderCategoryFilters()
    this.applyFilters()
  },

  applyFilters() {
    const keyword = document.getElementById('searchInput').value
    const terms = this.buildKeywordTerms(keyword)
    const source = this.allCards.filter(card => this.viewMode === 'backups'
      ? card.category === 'backup'
      : card.category !== 'backup')

    this.filteredCards = source
      .filter(card => {
        if (this.activeCategory && card.category !== this.activeCategory) return false
        if (!terms.length) return true
        const searchText = this.normalizeSearch(this.buildCardSearchText(card))
        return terms.every(term => searchText.includes(term))
      })
      .sort((a, b) => Number(b.id || 0) - Number(a.id || 0))

    this.displayCount = this.pageSize
    this.renderCards()
  },

  renderCards() {
    const cardList = document.getElementById('cardList')
    const emptyState = document.getElementById('emptyState')
    const visibleCards = this.filteredCards.slice(0, this.displayCount)

    cardList.className = this.viewMode === 'backups' ? 'backup-list' : 'card-grid'
    cardList.innerHTML = visibleCards.map(card => this.viewMode === 'backups'
      ? this.renderBackupCard(card)
      : this.renderProblemCard(card)).join('')

    emptyState.style.display = visibleCards.length ? 'none' : 'block'
    emptyState.querySelector('.empty-text').textContent = this.viewMode === 'backups' ? '暂无备份资料' : '未找到相关资料'
    document.getElementById('totalCount').textContent = this.filteredCards.length

    const hasMore = visibleCards.length < this.filteredCards.length
    document.getElementById('loadMore').hidden = !hasMore
    const loadDone = document.getElementById('loadDone')
    loadDone.hidden = hasMore || !visibleCards.length
    loadDone.textContent = this.viewMode === 'backups'
      ? `已显示全部 ${this.filteredCards.length} 条备份`
      : `— 已显示全部 ${this.filteredCards.length} 条资料 —`
  },

  renderProblemCard(card) {
    const images = card.images.length ? card.images : [{ url: 'images/placeholder.jpg', note: '' }]
    const category = card.category || 'fake-patch'
    const statusClass = card.status === 'suspected' ? 'suspected' : 'fake'
    const statusText = card.status === 'suspected' ? '高度存疑' : '明确异常'
    const numberText = this.numberText(card)
    const metaText = this.metaText(card)

    return `
      <article class="card-item" data-id="${card.id}" onclick="app.goToDetail(${card.id})">
        <div class="card-image-wrapper">
          <div class="card-image-slider" data-slider-id="${card.id}" onscroll="app.onSliderScroll(event, ${card.id})">
            ${images.map(image => `<img class="card-image" src="${this.escAttr(image.url)}" alt="${this.escAttr(this.playerDisplay(card))}" loading="lazy" onerror="this.src='images/placeholder.jpg'">`).join('')}
          </div>
          ${images.length > 1 ? `
            <button type="button" class="image-nav image-nav-prev" aria-label="上一张" onclick="app.moveSlider(event, ${card.id}, -1)">‹</button>
            <button type="button" class="image-nav image-nav-next" aria-label="下一张" onclick="app.moveSlider(event, ${card.id}, 1)">›</button>
            <div class="image-dots" data-dots-id="${card.id}">${images.map((_, index) => `<span class="image-dot ${index === 0 ? 'active' : ''}"></span>`).join('')}</div>
          ` : ''}
          <span class="card-category-label ${category}">${this.categoryLabel(category)}</span>
          <span class="card-badge ${statusClass}">${statusText}</span>
          <span class="card-id">#${card.id}</span>
        </div>
        <div class="card-info">
          <h2 class="card-player">${this.escHtml(this.playerDisplay(card))}</h2>
          ${metaText ? `<p class="card-details">${this.escHtml(metaText)}</p>` : ''}
          <div class="card-meta">
            <span class="card-images-count">📷 ${card.images.length}张</span>
            ${numberText ? `<span class="card-number">${this.escHtml(numberText)}</span>` : ''}
          </div>
        </div>
      </article>
    `
  },

  renderBackupCard(card) {
    const cover = card.images.find(image => image.type === 'after' || image.type === 'compare') || card.images[0] || { url: 'images/placeholder.jpg' }
    const metaText = this.metaText(card)
    const numberText = this.numberText(card)
    return `
      <article class="backup-card" onclick="app.goToDetail(${card.id})">
        <img class="backup-cover" src="${this.escAttr(cover.url)}" alt="${this.escAttr(this.playerDisplay(card))}" loading="lazy" onerror="this.src='images/placeholder.jpg'">
        <div class="backup-info">
          <h2 class="backup-title">${this.escHtml(this.playerDisplay(card))}</h2>
          ${metaText ? `<p class="backup-meta">${this.escHtml(metaText)}</p>` : ''}
          ${numberText ? `<p class="backup-number">${this.escHtml(numberText)}</p>` : ''}
          ${card.highRiskReason ? `<p class="backup-note">${this.escHtml(card.highRiskReason)}</p>` : ''}
        </div>
      </article>
    `
  },

  loadMore() {
    if (this.displayCount >= this.filteredCards.length) return
    this.displayCount += this.pageSize
    this.renderCards()
  },

  moveSlider(event, id, direction) {
    event.stopPropagation()
    const slider = document.querySelector(`[data-slider-id="${id}"]`)
    if (!slider) return
    slider.scrollBy({ left: slider.clientWidth * direction, behavior: 'smooth' })
  },

  onSliderScroll(event, id) {
    const slider = event.currentTarget
    const index = Math.round(slider.scrollLeft / Math.max(1, slider.clientWidth))
    document.querySelectorAll(`[data-dots-id="${id}"] .image-dot`).forEach((dot, dotIndex) => {
      dot.classList.toggle('active', dotIndex === index)
    })
  },

  goToDetail(id) {
    window.location.href = `detail.html?id=${id}`
  }
}

window.app = app
document.addEventListener('DOMContentLoaded', () => app.init())
