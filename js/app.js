// 主应用逻辑
const app = {
  currentCards: [],

  allCards: cardsData.map(c => ({ ...c, category: c.category || 'fake-patch' })),

  activeTab: 'cards',
  activeCategory: '',
  categoryOptions: [
    { value: '', label: '全部类型' },
    { value: 'fake-patch', label: '换 Patch' },
    { value: 'fake-auto', label: '签字异常' },
    { value: 'counterfeit', label: '假卡' }
  ],

  currentPage: 1,
  pageSize: 6,

  categoryLabel(category) {
    if (category === 'fake-auto') return '签字异常'
    if (category === 'counterfeit') return '假卡'
    return '换 Patch'
  },

  categoryClass(category) {
    if (category === 'fake-auto' || category === 'counterfeit' || category === 'fake-patch') return category
    return 'fake-patch'
  },

  escAttr(s) {
    if (s == null) return ''
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/</g, '&lt;')
  },

  escHtml(s) {
    if (s == null) return ''
    const d = document.createElement('div')
    d.textContent = String(s)
    return d.innerHTML
  },

  normalizeSearch(value) {
    return String(value == null ? '' : value)
      .trim()
      .toLowerCase()
      .replace(/[\s·.\-_'’`/，,、:：()（）[\]【】]+/g, '')
  },

  buildKeywordTerms(keyword = '') {
    const raw = String(keyword || '').trim()
    if (!raw) return []
    const parts = raw.split(/[\s,，、]+/).map(value => this.normalizeSearch(value)).filter(Boolean)
    if (parts.length > 1) return [...new Set(parts)]
    const compact = this.normalizeSearch(raw)
    if (!compact) return []
    const mixedParts = compact.match(/[a-z\u3400-\u9fff]+|\d+/g)
    if (mixedParts && mixedParts.length > 1 && mixedParts.join('') === compact) {
      return [...new Set(mixedParts)]
    }
    return [compact]
  },

  buildCardSearchText(card = {}) {
    return [
      card.id,
      card.player,
      card.playerCN,
      card.brand,
      card.year,
      card.series,
      card.number,
      card.highRiskReason,
      card.source,
      Array.isArray(card.qualityTags) ? card.qualityTags.join(' ') : ''
    ].filter(Boolean).join(' ')
  },

  init() {
    this.currentCards = [...this.allCards]
    this.renderCategoryFilters()
    this.renderCards()
    this.updateStats()
    this.renderPagination()
    this.hideLoading()
    this.setupSearchEnter()
    this.setupMainTabs()
    if (window.location.hash === '#collection') {
      this.switchTab('collection')
    }
  },

  setupMainTabs() {
    const root = document.getElementById('mainTabs')
    if (!root) return
    root.addEventListener('click', e => {
      const tab = e.target.closest('.main-tab')
      if (!tab || !tab.dataset.tab) return
      e.preventDefault()
      this.switchTab(tab.dataset.tab)
    })
  },

  switchTab(tab) {
    this.activeTab = tab
    document.querySelectorAll('.main-tab').forEach(t => {
      const on = t.dataset.tab === tab
      t.classList.toggle('active', on)
      t.setAttribute('aria-selected', on ? 'true' : 'false')
    })
    const panelCards = document.getElementById('panelCards')
    const panelCollection = document.getElementById('panelCollection')
    if (panelCards) panelCards.style.display = tab === 'cards' ? '' : 'none'
    if (panelCollection) panelCollection.style.display = tab === 'collection' ? '' : 'none'
    if (tab === 'collection' && typeof collection !== 'undefined') {
      collection.applyFilter()
    }
    if (tab === 'collection') {
      window.location.hash = 'collection'
    } else {
      if (window.location.hash === '#collection') {
        history.replaceState(null, '', window.location.pathname + window.location.search)
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  },

  renderCategoryFilters() {
    const root = document.getElementById('categoryFilterTags')
    if (!root) return
    root.innerHTML = this.categoryOptions.map(item => `
      <button
        type="button"
        class="category-filter-tag ${this.activeCategory === item.value ? 'active' : ''}"
        data-category="${this.escAttr(item.value)}"
      >${this.escHtml(item.label)}</button>
    `).join('')
    root.addEventListener('click', e => {
      const btn = e.target.closest('.category-filter-tag')
      if (!btn) return
      this.setCategoryFilter(btn.dataset.category || '')
    })
  },

  setCategoryFilter(category) {
    this.activeCategory = category || ''
    document.querySelectorAll('.category-filter-tag').forEach(tag => {
      tag.classList.toggle('active', (tag.dataset.category || '') === this.activeCategory)
    })
    this.applyFilters()
  },

  renderCards() {
    const cardList = document.getElementById('cardList')
    const emptyState = document.getElementById('emptyState')

    if (this.currentCards.length === 0) {
      cardList.style.display = 'none'
      emptyState.style.display = 'block'
      document.getElementById('pagination').style.display = 'none'
      return
    }

    cardList.style.display = 'grid'
    emptyState.style.display = 'none'
    document.getElementById('pagination').style.display = 'flex'

    const sortedCards = [...this.currentCards].sort((a, b) => b.id - a.id)
    const totalPages = Math.ceil(sortedCards.length / this.pageSize)
    const startIndex = (this.currentPage - 1) * this.pageSize
    const endIndex = startIndex + this.pageSize
    const paginatedCards = sortedCards.slice(startIndex, endIndex)

    cardList.innerHTML = paginatedCards.map(card => {
      const afterImg = card.images.find(img => img.type === 'after')
      const latestImage = afterImg || (card.images && card.images[card.images.length - 1])
      const imgUrl = latestImage && latestImage.url ? this.escAttr(latestImage.url) : 'images/placeholder.jpg'
      const badgeClass = card.status === 'suspected' ? 'suspected' : 'fake'
      const badgeText = card.status === 'suspected' ? '高度存疑' : '明确异常'
      const cat = card.category || 'fake-patch'
      const catClass = this.categoryClass(cat)
      const catText = this.categoryLabel(cat)
      const playerEsc = this.escAttr(card.player)

      return `
        <div class="card-item" onclick="window.app.goToDetail(${card.id})">
          <div class="card-image-wrapper">
            <img class="card-image" src="${imgUrl}" alt="${playerEsc}" onerror="this.src='images/placeholder.jpg'">
            <span class="card-category-label ${catClass}">${catText}</span>
            <span class="card-badge ${badgeClass}">${badgeText}</span>
            <span class="card-id">ID: ${card.id}</span>
          </div>
          <div class="card-info">
            <div class="card-player">${this.escHtml(card.player)}</div>
            <div class="card-type-line"><span class="card-type-pill ${catClass}">${catText}</span></div>
            <div class="card-details">${this.escHtml(card.brand)} · ${this.escHtml(card.year)} · ${this.escHtml(card.series)}</div>
            <div class="card-meta">
              <span class="card-images-count">📸 ${card.images.length} 张照片</span>
              <span class="card-number">${this.escHtml(card.number)}</span>
            </div>
          </div>
        </div>
      `
    }).join('')

    this.renderPagination()
  },

  search() {
    this.applyFilters()
  },

  applyFilters() {
    const searchInput = document.getElementById('searchInput')
    const keyword = searchInput ? searchInput.value.trim() : ''
    const terms = this.buildKeywordTerms(keyword)
    const activeCategory = this.activeCategory

    this.currentCards = this.allCards.filter(card => {
      const matchCategory = !activeCategory || (card.category || 'fake-patch') === activeCategory
      const matchKeyword = terms.length === 0 ||
        terms.every(term => this.normalizeSearch(this.buildCardSearchText(card)).includes(term))

      return matchCategory && matchKeyword
    })

    this.currentPage = 1
    this.renderCards()
    this.updateStats()
  },

  resetFilters() {
    const searchInput = document.getElementById('searchInput')
    if (searchInput) searchInput.value = ''
    this.activeCategory = ''
    document.querySelectorAll('.category-filter-tag').forEach(tag => {
      tag.classList.toggle('active', (tag.dataset.category || '') === '')
    })
    this.currentCards = [...this.allCards]
    this.currentPage = 1
    this.renderCards()
    this.updateStats()
  },

  renderPagination() {
    const pagination = document.getElementById('pagination')
    const totalPages = Math.ceil(this.currentCards.length / this.pageSize)

    if (totalPages <= 1) {
      pagination.style.display = 'none'
      return
    }

    pagination.style.display = 'flex'

    let paginationHTML = ''

    paginationHTML += `
      <button type="button" class="page-btn ${this.currentPage === 1 ? 'disabled' : ''}"
              onclick="window.app.goToPage(${this.currentPage - 1})"
              ${this.currentPage === 1 ? 'disabled' : ''}>
        上一页
      </button>
    `

    const maxVisiblePages = 5
    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2))
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    if (startPage > 1) {
      paginationHTML += `<button type="button" class="page-btn" onclick="window.app.goToPage(1)">1</button>`
      if (startPage > 2) {
        paginationHTML += `<span class="page-ellipsis">...</span>`
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      paginationHTML += `
        <button type="button" class="page-btn ${i === this.currentPage ? 'active' : ''}"
                onclick="window.app.goToPage(${i})">
          ${i}
        </button>
      `
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        paginationHTML += `<span class="page-ellipsis">...</span>`
      }
      paginationHTML += `<button type="button" class="page-btn" onclick="window.app.goToPage(${totalPages})">${totalPages}</button>`
    }

    paginationHTML += `
      <button type="button" class="page-btn ${this.currentPage === totalPages ? 'disabled' : ''}"
              onclick="window.app.goToPage(${this.currentPage + 1})"
              ${this.currentPage === totalPages ? 'disabled' : ''}>
        下一页
      </button>
    `

    pagination.innerHTML = paginationHTML
  },

  goToPage(page) {
    const totalPages = Math.ceil(this.currentCards.length / this.pageSize)
    if (page < 1 || page > totalPages) return

    this.currentPage = page
    this.renderCards()

    window.scrollTo({ top: 0, behavior: 'smooth' })
  },

  updateStats() {
    const total = this.currentCards.length
    document.getElementById('totalCount').textContent = total
  },

  goToDetail(id) {
    window.location.href = `detail.html?id=${id}`
  },

  hideLoading() {
    const loading = document.getElementById('loading')
    if (loading) {
      loading.style.display = 'none'
    }
  },

  setupSearchEnter() {
    const searchInput = document.getElementById('searchInput')
    if (!searchInput) return
    searchInput.addEventListener('input', () => {
      this.applyFilters()
    })
    searchInput.addEventListener('keypress', e => {
      if (e.key === 'Enter') {
        this.applyFilters()
      }
    })
  },

  showAbout() {
    alert(`球星卡换 Patch 记录系统

这是一个用于记录被换 Patch 的球星卡的公益项目，帮助收藏者识别和避免购买到被篡改的卡片。

注意事项：
- 本站信息仅供参考，不构成法律依据
- 交易前请务必仔细核对
- 建议通过正规渠道购买
- 发现可疑卡片请及时举报`)
  }
}

window.app = app

document.addEventListener('DOMContentLoaded', () => {
  app.init()
})
