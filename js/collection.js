const collection = {
  seriesData: typeof collectionData !== 'undefined' ? collectionData : [],

  /** 与小程序一致：自由模式为无 checklist 且无子系列标记 */
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
    cl.forEach(item => {
      n += (item.images && item.images.length) || 0
    })
    return n
  },

  renderInto(container) {
    if (!container) return
    if (!this.seriesData.length) {
      container.innerHTML = '<div class="col-empty">暂无图鉴数据</div>'
      return
    }

    container.innerHTML = this.seriesData.map((series, idx) => {
      const thumbs = this.seriesRecentImageUrls(series)
      const imgCount = this.seriesImageCount(series)

      const thumbsHtml = thumbs.length
        ? `<div class="col-series-thumbs">${thumbs.map(u => `<img class="col-series-thumb" src="${this.escAttr(u)}" alt="" loading="lazy" onerror="this.style.display='none'">`).join('')}</div>`
        : '<div class="col-series-empty-thumbs">暂无图片</div>'

      return `
        <a href="collection-detail.html?idx=${idx}" class="col-series-card col-series-card-block">
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
    const listEl = document.getElementById('seriesList')
    if (listEl) this.renderInto(listEl)
  }
}

document.addEventListener('DOMContentLoaded', () => {
  collection.init()
})
