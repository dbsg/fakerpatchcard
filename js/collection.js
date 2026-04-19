const collection = {
  seriesData: typeof collectionData !== 'undefined' ? collectionData : [],
  filteredData: [],
  sortBy: 'name',
  sortLabels: { name: '名称排序', count: '数量排序', recent: '最近更新' },

  seriesRecentImageUrls(series) {
    const cl = series.checklist || []
    const hasSubset = !!series.hasSubset
    const isFree = cl.length === 0 && !hasSubset
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
    const cl = series.checklist || []
    const hasSubset = !!series.hasSubset
    const isFree = cl.length === 0 && !hasSubset
    if (isFree) return (series.freeImages || []).length
    let n = 0
    cl.forEach(item => { n += (item.images && item.images.length) || 0 })
    return n
  },

  applyFilter() {
    const searchEl = document.getElementById('seriesSearchInput')
    const keyword = (searchEl ? searchEl.value : '').trim().toLowerCase()
    const clearBtn = document.getElementById('seriesSearchClear')
    if (clearBtn) clearBtn.style.display = keyword ? '' : 'none'

    let data = [...this.seriesData]

    if (keyword) {
      data = data.filter(s => (s.name || '').toLowerCase().includes(keyword))
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
    const container = document.getElementById('seriesListIndex')
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

      const thumbsHtml = thumbs.length
        ? `<div class="col-series-thumbs">${thumbs.map(u => `<img class="col-series-thumb" src="${this.escAttr(u)}" alt="" loading="lazy" onerror="this.style.display='none'">`).join('')}</div>`
        : '<div class="col-series-empty-thumbs">暂无图片</div>'

      const seriesId = series._id || ''
      return `
        <a href="collection-detail?id=${this.escAttr(seriesId)}&idx=${idx}" class="col-series-card col-series-card-block">
          <div class="col-series-card-inner col-series-card-inner-minimal">
            <div class="col-series-info col-series-info-full">
              <div class="col-series-title-row">
                <div class="col-series-name">${this.escHtml(series.name)}</div>
                <span class="col-series-count-muted">${imgCount} 张</span>
              </div>
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
    const listEl = document.getElementById('seriesListIndex')
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
