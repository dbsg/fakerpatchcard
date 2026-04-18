const seriesDetail = {
  seriesData: typeof collectionData !== 'undefined' ? collectionData : [],
  series: null,

  isFreeMode(s) {
    const cl = s.checklist || []
    return cl.length === 0 && !s.hasSubset
  },

  init() {
    const params = new URLSearchParams(window.location.search)
    const idx = parseInt(params.get('idx'))
    this.series = this.seriesData[idx] || null

    if (!this.series) {
      document.getElementById('seriesTitle').textContent = '系列不存在'
      document.getElementById('mainContent').style.display = 'block'
      document.getElementById('seriesContent').innerHTML = '<div class="col-empty">未找到该系列</div>'
      return
    }

    document.getElementById('seriesTitle').textContent = this.series.name
    document.title = `${this.series.name} - 小丁卡册`
    this.showContent()
  },

  showContent() {
    document.getElementById('mainContent').style.display = 'block'
    this.renderDetail()
  },

  renderDetail() {
    const s = this.series
    const cl = s.checklist || []
    const content = document.getElementById('seriesContent')

    if (this.isFreeMode(s)) {
      const images = s.freeImages || []
      content.innerHTML = images.length
        ? `<div class="col-images">${images.map(img => this.renderImage(img)).join('')}</div>`
        : '<div class="col-empty-detail">暂无图片</div>'
    } else {
      const groups = this.buildGroups(cl)
      content.innerHTML = groups.map(g => `
        ${g.subset ? `<div class="col-subset-title">${this.escHtml(g.subset)}</div>` : ''}
        <div class="col-checklist">
          ${g.items.map(item => {
            const sorted = this.sortImages(item.images, item.text)
            const hasImages = sorted.length > 0
            return `
              <div class="col-card-block ${hasImages ? 'col-card-has-images' : ''}">
                <div class="col-card-text">${this.escHtml(item.text)}</div>
                ${hasImages ? `<div class="col-images">${sorted.map(img => this.renderImage(img)).join('')}</div>` : ''}
              </div>
            `
          }).join('')}
        </div>
      `).join('')
    }
  },

  renderImage(img) {
    const numberLabel = img.number ? `<span class="col-img-number">#${this.escHtml(img.number)}</span>` : ''
    return `
      <div class="col-img-wrap" onclick="seriesDetail.previewImage('${this.escAttr(img.url)}')">
        <img class="col-img" src="${this.escAttr(img.url)}" alt="" loading="lazy">
        ${numberLabel}
      </div>
    `
  },

  buildGroups(checklist) {
    const groups = []
    let current = null
    checklist.forEach(item => {
      if (!current || item.subset !== current.subset) {
        current = { subset: item.subset || '', items: [] }
        groups.push(current)
      }
      current.items.push(item)
    })
    return groups
  },

  sortImages(images, text) {
    if (!images || !images.length) return []
    const isNumbered = /\/\d+\s*$/.test(text || '')
    if (!isNumbered) return [...images]
    return [...images].sort((a, b) => {
      const na = parseInt(a.number) || 9999
      const nb = parseInt(b.number) || 9999
      return na - nb
    })
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
