const collection = {
  seriesData: typeof collectionData !== 'undefined' ? collectionData : [],
  filteredData: [],
  sortBy: 'name',
  sortLabels: { name: '名称排序', count: '数量排序', recent: '最近更新' },

  progress() {
    return typeof collectionProgress !== 'undefined' ? collectionProgress : null
  },

  isFreeMode(series) {
    const cl = series.checklist || []
    return cl.length === 0 && !series.hasSubset
  },

  buildFreeStats(series) {
    const images = (series.freeImages || []).filter(img => {
      const u = typeof img === 'string' ? img : (img && img.url)
      return !!u
    })
    const rawTarget = Number(series.completionTarget)
    const total = Number.isInteger(rawTarget) && rawTarget > 0 ? rawTarget : images.length
    const collected = total ? Math.min(total, images.length) : images.length
    return {
      totalCards: total,
      withImages: collected,
      missing: Math.max(0, total - collected),
      listImageCount: images.length,
      listRecentImages: images.map(img => (typeof img === 'string' ? img : img.url)).slice(-5).reverse()
    }
  },

  seriesProgressStats(series) {
    const progress = this.progress()
    if (this.isFreeMode(series)) return this.buildFreeStats(series)
    if (progress) return progress.buildChecklistProgressStats(series.checklist || [])

    const images = []
    ;(series.checklist || []).forEach(item => {
      ;(item.images || []).forEach(img => {
        const u = typeof img === 'string' ? img : (img && img.url)
        if (u) images.push(u)
      })
    })
    return {
      totalCards: (series.checklist || []).length,
      withImages: (series.checklist || []).filter(item => (item.images || []).length > 0).length,
      missing: 0,
      listImageCount: images.length,
      listRecentImages: images.slice(-5).reverse()
    }
  },

  seriesRecentImageUrls(series) {
    const stats = this.seriesProgressStats(series)
    if (stats.listRecentImages && stats.listRecentImages.length) return stats.listRecentImages
    const cl = series.checklist || []
    const isFree = this.isFreeMode(series)
    const urls = []
    if (isFree) {
      (series.freeImages || []).forEach(img => {
        const u = typeof img === 'string' ? img : (img && img.url)
        if (u) urls.push(u)
      })
    } else {
      cl.forEach(item => {
        (item.images || []).forEach(img => {
          const u = typeof img === 'string' ? img : (img && img.url)
          if (u) urls.push(u)
        })
      })
    }
    return urls.slice(-5).reverse()
  },

  seriesImageCount(series) {
    const stats = this.seriesProgressStats(series)
    return Number(stats.listImageCount) || 0
  },

  applyFilter() {
    const searchEl = document.getElementById('seriesSearchInput')
    const keyword = (searchEl ? searchEl.value : '').trim().toLowerCase()
    const clearBtn = document.getElementById('seriesSearchClear')
    if (clearBtn) clearBtn.style.display = keyword ? '' : 'none'

    let data = [...this.seriesData]

    if (keyword) {
      data = data.filter(s => {
        const haystack = `${s.name || ''} ${s.description || ''}`.toLowerCase()
        return haystack.includes(keyword)
      })
    }

    if (this.sortBy === 'count') {
      data.sort((a, b) => this.seriesImageCount(b) - this.seriesImageCount(a))
    } else if (this.sortBy === 'recent') {
      data.sort((a, b) => {
        const ta = new Date(a.updatedAt || a.createdAt || 0).getTime()
        const tb = new Date(b.updatedAt || b.createdAt || 0).getTime()
        return tb - ta
      })
    } else {
      data.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'zh'))
    }

    this.filteredData = data
    this.renderFiltered()
  },

  renderFiltered() {
    const container = document.getElementById('seriesListIndex') || document.getElementById('seriesList')
    const emptyEl = document.getElementById('seriesEmptyState')
    if (!container) return

    if (this.filteredData.length === 0) {
      container.innerHTML = ''
      if (emptyEl) emptyEl.style.display = ''
      return
    }
    if (emptyEl) emptyEl.style.display = 'none'

    container.innerHTML = this.filteredData.map(series => {
      const idx = this.seriesData.indexOf(series)
      const thumbs = this.seriesRecentImageUrls(series)
      const imgCount = this.seriesImageCount(series)
      const stats = this.seriesProgressStats(series)
      const total = Number(stats.totalCards) || 0
      const collected = Number(stats.withImages) || 0
      const missing = Math.max(0, Number(stats.missing) || 0)
      const desc = String(series.description || '').trim()

      const thumbsHtml = thumbs.length
        ? `<div class="col-series-thumbs">${thumbs.map(u => `<img class="col-series-thumb" src="${this.escAttr(u)}" alt="" loading="lazy" onerror="this.style.display='none'">`).join('')}</div>`
        : '<div class="col-series-empty-thumbs">暂无图片</div>'
      const descHtml = desc ? `<div class="col-series-desc">${this.escHtml(desc)}</div>` : ''
      const progressHtml = series.checklistComplete && total > 0
        ? `<div class="col-series-progress">
            <span>总数 <strong>${total}</strong></span>
            <span>已收录 <strong>${collected}</strong></span>
            <span>待补图 <strong>${missing}</strong></span>
          </div>`
        : ''

      const seriesId = series._id || ''
      return `
        <a href="collection-detail?id=${this.escAttr(seriesId)}&idx=${idx}" class="col-series-card col-series-card-block">
          <div class="col-series-card-inner col-series-card-inner-minimal">
            <div class="col-series-info col-series-info-full">
              <div class="col-series-title-row">
                <div class="col-series-name">${this.escHtml(series.name)}</div>
                <span class="col-series-count-muted">${imgCount} 张</span>
              </div>
              ${descHtml}
              ${progressHtml}
            </div>
          </div>
          ${thumbsHtml}
        </a>
      `
    }).join('')
  },

  toggleSort() {
    const order = ['name', 'count', 'recent']
    const i = order.indexOf(this.sortBy)
    this.sortBy = order[(i + 1) % order.length]
    const btn = document.getElementById('seriesSortBtn')
    if (btn) btn.textContent = this.sortLabels[this.sortBy]
    this.applyFilter()
  },

  escHtml(s) {
    const d = document.createElement('div')
    d.textContent = s
    return d.innerHTML
  },

  escAttr(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
  },

  init() {
    const listEl = document.getElementById('seriesListIndex') || document.getElementById('seriesList')
    if (listEl) {
      this.filteredData = [...this.seriesData]
      this.applyFilter()
    }

    const searchInput = document.getElementById('seriesSearchInput')
    if (searchInput) {
      searchInput.addEventListener('input', () => this.applyFilter())
    }

    const clearBtn = document.getElementById('seriesSearchClear')
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        const input = document.getElementById('seriesSearchInput')
        if (input) input.value = ''
        this.applyFilter()
      })
    }

    const sortBtn = document.getElementById('seriesSortBtn')
    if (sortBtn) {
      sortBtn.addEventListener('click', () => this.toggleSort())
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  collection.init()
})
