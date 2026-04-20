const seriesDetail = {
  seriesData: typeof collectionData !== 'undefined' ? collectionData : [],
  series: null,

  isFreeMode(s) {
    const cl = s.checklist || []
    return cl.length === 0 && !s.hasSubset
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
      content.innerHTML = groups.map((g, gi) => `
        ${g.subset ? `<div class="col-subset-header" data-gi="${gi}" onclick="seriesDetail.toggleCollapse(${gi})">
          <span class="col-subset-collapse-icon" id="collapseIcon${gi}">▼</span>
          <span class="col-subset-header-name">${this.escHtml(g.subset)}</span>
          <span class="col-subset-count-badge">${g.items.length} 卡种</span>
        </div>` : ''}
        <div class="col-checklist" id="collapseBody${gi}">
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
    const parts = []
    if (img.number) parts.push('#' + this.escHtml(img.number))
    if (img.year) parts.push(this.escHtml(img.year))
    const label = parts.length ? `<span class="col-img-number">${parts.join(' ')}</span>` : ''
    return `
      <div class="col-img-wrap" onclick="seriesDetail.previewImage('${this.escAttr(img.url)}')">
        <img class="col-img" src="${this.escAttr(img.url)}" alt="" loading="lazy">
        ${label}
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
    const hasAny = isNumbered || images.some(i => (i.number && i.number.trim()) || (i.year && i.year.trim()))
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
